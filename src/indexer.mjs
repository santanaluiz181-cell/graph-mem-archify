import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const IGNORED_DIRS = new Set([
  '.git', 'node_modules', 'dist', 'build', 'out', '.next', '.nuxt',
  'target', '.venv', 'venv', '__pycache__', '.pytest_cache', '.mypy_cache',
  'coverage', '.turbo', '.cache', '.idea', '.vscode', 'chroma_db', '.archify'
]);

export const SUPPORTED_EXTS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.rs', '.go', '.cs', '.ps1', '.sql', '.md', '.html', '.css'
]);

/**
 * Extract exported/declared symbols and import edges from a single source file deterministically (0 LLM tokens).
 */
export function extractSymbolsAndImports(content, ext) {
  if (typeof content !== 'string') {
    throw new TypeError('extractSymbolsAndImports expects string content');
  }
  const lines = content.split(/\r?\n/);
  const symbols = [];
  const imports = new Set();

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const lineNum = idx + 1;

    if (['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'].includes(ext)) {
      const importMatch = line.match(/(?:import\s+.*?from\s+['"]([^'"]+)['"]|import\(['"]([^'"]+)['"]\)|require\(['"]([^'"]+)['"]\))/);
      if (importMatch) {
        const mod = importMatch[1] || importMatch[2] || importMatch[3];
        if (mod) imports.add(mod);
      }
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
    } else if (ext === '.go') {
      const goFn = line.match(/^\s*func\s+(?:\([^)]*\)\s*)?([A-Za-z0-9_]+)/);
      if (goFn) symbols.push({ kind: 'fn', name: goFn[1], line: lineNum });
    } else if (ext === '.sql') {
      const sqlTbl = line.match(/^\s*CREATE\s+(?:TABLE|VIEW|INDEX)\s+(?:IF\s+NOT\s+EXISTS\s+)?([A-Za-z0-9_."]+)/i);
      if (sqlTbl) symbols.push({ kind: 'schema', name: sqlTbl[1], line: lineNum });
    } else if (ext === '.md') {
      const hMatch = line.match(/^(#{1,2})\s+(.+)$/);
      if (hMatch) symbols.push({ kind: 'heading', name: hMatch[2].trim().slice(0, 60), line: lineNum });
    } else if (ext === '.html') {
      const idMatch = line.match(/id=["']([A-Za-z0-9_-]+)["']/);
      if (idMatch) symbols.push({ kind: 'dom-id', name: `#${idMatch[1]}`, line: lineNum });
    }
  }

  return {
    linesCount: lines.length,
    symbols: symbols.slice(0, 60),
    imports: Array.from(imports),
  };
}

export function walkDirectory(rootDir, maxFiles = 2500) {
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
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) stack.push(path.join(current, entry.name));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTS.has(ext)) {
          files.push(path.join(current, entry.name));
          if (files.length >= maxFiles) break;
        }
      }
    }
  }
  return files;
}

export function resolveLocalImport(fromRelPath, impSpecifier, knownFilesSet) {
  if (!impSpecifier.startsWith('.')) return null;
  const baseTarget = path.posix.normalize(path.posix.join(path.posix.dirname(fromRelPath), impSpecifier));
  const candidates = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py', '/index.ts', '/index.js', '/index.mjs'];
  for (const suffix of candidates) {
    const cand = baseTarget + suffix;
    if (knownFilesSet.has(cand)) return cand;
  }
  return null;
}

/**
 * Build deterministic AST + PonyTail knowledge graph from a target directory.
 */
export function buildGraph(rootDir, maxFiles = 2500) {
  const resolvedRoot = path.resolve(rootDir);
  if (!fs.existsSync(resolvedRoot)) {
    throw new Error(`Target directory does not exist: ${resolvedRoot}`);
  }

  const filePaths = walkDirectory(resolvedRoot, maxFiles);
  const relSet = new Set(filePaths.map((p) => path.relative(resolvedRoot, p).replace(/\\/g, '/')));
  const nodes = {};
  const edges = [];
  const resolvedEdges = [];
  const inDegree = {};
  const outDegree = {};

  for (const absPath of filePaths) {
    const relPath = path.relative(resolvedRoot, absPath).replace(/\\/g, '/');
    let content;
    try {
      const stat = fs.statSync(absPath);
      if (stat.size > 1024 * 1024) continue;
      content = fs.readFileSync(absPath, 'utf8');
    } catch {
      continue;
    }

    const ext = path.extname(absPath).toLowerCase();
    const { linesCount, symbols, imports } = extractSymbolsAndImports(content, ext);
    const sha8 = crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);

    nodes[relPath] = {
      ext,
      lines: linesCount,
      bytes: Buffer.byteLength(content, 'utf8'),
      sha8,
      symbols,
    };
    inDegree[relPath] = inDegree[relPath] || 0;
    outDegree[relPath] = imports.length;

    for (const imp of imports) {
      edges.push({ from: relPath, to: imp });
      const resolved = resolveLocalImport(relPath, imp, relSet);
      if (resolved) {
        inDegree[resolved] = (inDegree[resolved] || 0) + 1;
        resolvedEdges.push({ from: relPath, to: resolved, kind: 'import' });
      }
    }
  }

  const hubs = Object.keys(nodes)
    .map((relPath) => ({
      file: relPath,
      inDegree: inDegree[relPath] || 0,
      outDegree: outDegree[relPath] || 0,
      symbolCount: nodes[relPath].symbols.length,
      lines: nodes[relPath].lines,
    }))
    .sort((a, b) => (b.inDegree * 3 + b.symbolCount) - (a.inDegree * 3 + a.symbolCount))
    .slice(0, 20);

  const totalRawBytes = Object.values(nodes).reduce((acc, n) => acc + n.bytes, 0);

  return {
    schema: 'graph-mem-archify/v1',
    generatedAt: new Date().toISOString(),
    root: resolvedRoot.replace(/\\/g, '/'),
    stats: {
      totalFilesIndexed: Object.keys(nodes).length,
      totalEdges: edges.length,
      resolvedLocalEdges: resolvedEdges.length,
      totalRawBytes,
    },
    ponytailNavigation: {
      directive: 'Use read_file with StartLine/EndLine around symbol.line instead of reading full files.',
      topHubs: hubs,
    },
    nodes,
    edges,
    resolvedEdges,
  };
}
