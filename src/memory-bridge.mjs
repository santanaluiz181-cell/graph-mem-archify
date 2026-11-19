import fs from 'node:fs';
import path from 'node:path';

/**
 * Compress a .graphify.json topology into a compact Markdown digest (.graphify_memory.md)
 * suitable for persistent injection into claude-mem (HTTP daemon :37777 or MCP save_memory).
 */
export function distillGraphForMemory(graph, projectName) {
  if (!graph || !graph.nodes || !graph.stats) {
    throw new Error('Invalid graph object passed to distillGraphForMemory');
  }

  const hubs = graph.ponytailNavigation?.topHubs || [];
  const hubLines = hubs.slice(0, 15).map(
    (h) => `- \`${h.file}\` (${h.lines} lines, inDegree: ${h.inDegree}, symbols: ${h.symbolCount})`
  );

  const topSymbols = [];
  for (const [file, info] of Object.entries(graph.nodes)) {
    for (const sym of info.symbols || []) {
      if (['fn', 'class', 'def', 'export', 'struct', 'schema'].includes(sym.kind)) {
        topSymbols.push({ file, kind: sym.kind, name: sym.name, line: sym.line });
      }
    }
  }

  const symbolLines = topSymbols.slice(0, 60).map(
    (s) => `- [${s.kind}] \`${s.name}\` -> \`${s.file}:${s.line}\``
  );

  const markdown = [
    `# CODEBASE AST TOPOLOGY: ${projectName}`,
    `*Generated via Graph-Mem-Archify at ${graph.generatedAt}*`,
    `*Files: ${graph.stats.totalFilesIndexed} | Edges: ${graph.stats.totalEdges} | Local Links: ${graph.stats.resolvedLocalEdges}*`,
    '',
    '## 1. HIGH-CENTRALITY HUBS (PONYTAIL TARGETS)',
    ...hubLines,
    '',
    '## 2. KEY SYMBOLS & LINE POINTERS',
    ...symbolLines,
    '',
    '## 3. NAVIGATION DIRECTIVE',
    '> Query this digest from claude-mem or Archify HTML first; open only 30-line slices around symbol.line.',
  ].join('\n');

  const rawTokensEst = Math.max(1, Math.round((graph.stats.totalRawBytes || 0) / 4));
  const digestTokensEst = Math.max(1, Math.round(Buffer.byteLength(markdown, 'utf8') / 4));
  const savingsPct = rawTokensEst > digestTokensEst
    ? Number((((rawTokensEst - digestTokensEst) / rawTokensEst) * 100).toFixed(1))
    : 0;

  return {
    title: `graphify_ast_${projectName}`,
    markdown,
    metrics: {
      rawTokensEst,
      digestTokensEst,
      savingsPct,
    },
  };
}

/**
 * Save .graphify_memory.md locally and optionally push to a running claude-mem daemon.
 */
export async function persistToClaudeMem(targetDir, digest, { port = 37777, pushRemote = true } = {}) {
  const mdPath = path.join(path.resolve(targetDir), '.graphify_memory.md');
  fs.writeFileSync(mdPath, digest.markdown, 'utf8');

  let daemonStatus = 'skipped';
  if (pushRemote) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`http://127.0.0.1:${port}/api/observations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: digest.title,
          text: digest.markdown,
          type: 'discovery',
          project: path.basename(path.resolve(targetDir)),
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      daemonStatus = res.ok ? 'synced' : `http_${res.status}`;
    } catch {
      daemonStatus = 'offline';
    }
  }

  return { mdPath, daemonStatus };
}
