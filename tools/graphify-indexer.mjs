#!/usr/bin/env node
/**
 * Graphify + PonyTail Structural AST & Dependency Indexer
 * Generates a compact JSON knowledge graph of files, symbols (with exact line numbers),
 * dependency edges, and fan-in/fan-out centrality so `flash_lite` subagents can navigate
 * large repositories without reading entire files (>50% token reduction).
 *
 * Usage:
 *   node graphify-indexer.mjs [targetDir] [--out .graphify.json] [--max-files 2000]
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const IGNORED_DIRS = new Set([
  '.git', 'node_modules', 'dist', 'build', 'out', '.next', '.nuxt',
  'target', '.venv', 'venv', '__pycache__', '.pytest_cache', '.mypy_cache',
  'coverage', '.turbo', '.cache', '.idea', '.vscode', 'chroma_db'
]);

const SUPPORTED_EXTS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.rs', '.go', '.cs', '.ps1', '.sql', '.md'
]);

function parseArgs(argv) {
  const args = argv.slice(2);
  let targetDir = process.cwd();
  let outFile = null;
  let maxFiles = 2500;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--out' && args[i + 1]) {
      outFile = args[++i];
    } else if (arg === '--max-files' && args[i + 1]) {
      const parsed = Number.parseInt(args[++i], 10);
      if (!Number.isNaN(parsed) && parsed > 0) maxFiles = parsed;
    } else if (!arg.startsWith('--')) {
      targetDir = arg;
    }
  }

  const resolvedRoot = path.resolve(targetDir);
  const resolvedOut = outFile
    ? path.resolve(outFile)
    : path.join(resolvedRoot, '.graphify.json');

  return { resolvedRoot, resolvedOut, maxFiles };
}

function extractSymbolsAndImports(content, ext) {
  const lines = content.split(/\r?\n/);
  const symbols = [];
  const imports = new Set();

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const lineNum = idx + 1;

    if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx' || ext === '.mjs' || ext === '.cjs') {
      // Imports / Requires
      const importMatch = line.match(/(?:import\s+.*?from\s+['"]([^'"]+)['"]|import\(['"]([^'"]+)['"]\)|require\(['"]([^'"]+)['"]\))/);
      if (importMatch) {
        const mod = importMatch[1] || importMatch[2] || importMatch[3];
        if (mod) imports.add(mod);
      }
      // Exports / Declarations
      const fnMatch = line.match(/^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([A-Za-z0-9_$]+)/);
      if (fnMatch) symbols.push({ kind: 'fn', name: fnMatch[1], line: lineNum });

      const clsMatch = line.match(/^\s*(?:export\s+)?(?:default\s+)?(?:abstract\s+)?class\s+([A-Za-z0-9_$]+)/);
      if (clsMatch) symbols.push({ kind: 'class', name: clsMatch[1], line: lineNum });

      const typeMatch = line.match(/^\s*(?:export\s+)?(?:interface|type|enum)\s+([A-Za-z0-9_$]+)/);
      if (typeMatch) symbols.push({ kind: 'type', name: typeMatch[1], line: lineNum });

      const constExportMatch = line.match(/^\s*export\s+(?:const|let)\s+([A-Za-z0-9_$]+)\s*=/);
      if (constExportMatch) symbols.push({ kind: 'export', name: constExportMatch[1], line: lineNum });
    } else if (ext === '.py') {
      const pyImport = line.match(/^\s*(?:from\s+([A-Za-z0-9_.]+)\s+import|import\s+([A-Za-z0-9_.]+))/);
      if (pyImport) imports.add(pyImport[1] || pyImport[2]);

      const pyDef = line.match(/^\s*(?:async\s+)?def\s+([A-Za-z0-9_]+)\s*\(/);
      if (pyDef) symbols.push({ kind: 'def', name: pyDef[1], line: lineNum });

      const pyCls = line.match(/^\s*class\s+([A-Za-z0-9_]+)/);
      if (pyCls) symbols.push({ kind: 'class', name: pyCls[1], line: lineNum });
    } else if (ext === '.rs') {
      const rsUse = line.match(/^\s*use\s+([^;]+);/);
      if (rsUse) imports.add(rsUse[1].trim());

      const rsItem = line.match(/^\s*(?:pub(?:\([^)]*\))?\s+)?(?:async\s+)?(fn|struct|enum|trait|mod)\s+([A-Za-z0-9_]+)/);
      if (rsItem) symbols.push({ kind: rsItem[1], name: rsItem[2], line: lineNum });
    } else if (ext === '.ps1') {
      const psFn = line.match(/^\s*function\s+([A-Za-z0-9_-]+)/i);
      if (psFn) symbols.push({ kind: 'fn', name: psFn[1], line: lineNum });
    } else if (ext === '.md') {
      const hMatch = line.match(/^(#{1,2})\s+(.+)$/);
      if (hMatch) symbols.push({ kind: 'heading', name: hMatch[2].trim().slice(0, 60), line: lineNum });
    }
  }

  return {
    linesCount: lines.length,
    symbols: symbols.slice(0, 50),
    imports: Array.from(imports)
  };
}

function walkDirectory(rootDir, maxFiles) {
  const files = [];
  const stack = [rootDir];

  while (stack.length > 0 && files.length < maxFiles) {
    const current = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.gemini-plugin') {
        if (IGNORED_DIRS.has(entry.name)) continue;
      }
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) {
          stack.push(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTS.has(ext)) {
          files.push(fullPath);
          if (files.length >= maxFiles) break;
        }
      }
    }
  }
  return files;
}

function buildGraph(rootDir, maxFiles) {
  if (!fs.existsSync(rootDir)) {
    throw new Error(`Target directory does not exist: ${rootDir}`);
  }

  const filePaths = walkDirectory(rootDir, maxFiles);
  const nodes = {};
  const edges = [];
  const inDegree = {};
  const outDegree = {};

  for (const absPath of filePaths) {
    const relPath = path.relative(rootDir, absPath).replace(/\\/g, '/');
    let stat;
    let content;
    try {
      stat = fs.statSync(absPath);
      if (stat.size > 1024 * 1024) continue; // skip >1MB blobs
      content = fs.readFileSync(absPath, 'utf8');
    } catch {
      continue;
    }

    const ext = path.extname(absPath).toLowerCase();
    const { linesCount, symbols, imports } = extractSymbolsAndImports(content, ext);
    const sha8 = crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);

    nodes[relPath] = {
      lines: linesCount,
      sha8,
      symbols
    };
    inDegree[relPath] = inDegree[relPath] || 0;
    outDegree[relPath] = imports.length;

    for (const imp of imports) {
      edges.push({ from: relPath, to: imp });
      // Resolve local relative import if possible
      if (imp.startsWith('.')) {
        const baseTarget = path.posix.normalize(path.posix.join(path.posix.dirname(relPath), imp));
        for (const candidateExt of ['', '.ts', '.tsx', '.js', '.mjs', '.py', '/index.ts', '/index.js']) {
          const candidate = baseTarget + candidateExt;
          if (inDegree[candidate] !== undefined || filePaths.some(p => path.relative(rootDir, p).replace(/\\/g, '/') === candidate)) {
            inDegree[candidate] = (inDegree[candidate] || 0) + 1;
            break;
          }
        }
      }
    }
  }

  // Compute top hubs (PonyTail priority navigation targets)
  const hubs = Object.keys(nodes)
    .map(relPath => ({
      file: relPath,
      inDegree: inDegree[relPath] || 0,
      outDegree: outDegree[relPath] || 0,
      symbolCount: nodes[relPath].symbols.length,
      lines: nodes[relPath].lines
    }))
    .sort((a, b) => (b.inDegree * 3 + b.symbolCount) - (a.inDegree * 3 + a.symbolCount))
    .slice(0, 15);

  return {
    schema: 'graphify-ponytail/v1',
    generatedAt: new Date().toISOString(),
    root: rootDir.replace(/\\/g, '/'),
    stats: {
      totalFilesIndexed: Object.keys(nodes).length,
      totalEdges: edges.length
    },
    ponytailNavigation: {
      directive: 'Use view_file with StartLine/EndLine around symbol.line instead of reading full files.',
      topHubs: hubs
    },
    nodes,
    edges
  };
}

function main() {
  try {
    const { resolvedRoot, resolvedOut, maxFiles } = parseArgs(process.argv);
    const graph = buildGraph(resolvedRoot, maxFiles);
    fs.writeFileSync(resolvedOut, JSON.stringify(graph, null, 2), 'utf8');
    console.log(`[Graphify+PonyTail] Indexed ${graph.stats.totalFilesIndexed} files and ${graph.stats.totalEdges} edges -> ${resolvedOut}`);
  } catch (err) {
    console.error(`[Graphify+PonyTail ERROR] ${err instanceof Error ? err.stack : String(err)}`);
    process.exit(1);
  }
}

main();
