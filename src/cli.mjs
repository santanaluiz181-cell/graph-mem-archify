#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { buildGraph } from './indexer.mjs';
import { distillGraphForMemory, persistToClaudeMem } from './memory-bridge.mjs';
import { generateArchifyHtml } from './archify-diagram.mjs';

export function parseCliArgs(argv) {
  const args = argv.slice(2);
  let targetDir = process.cwd();
  let projectName = null;
  let diagramOut = null;
  let pushRemote = true;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--project' && args[i + 1]) {
      projectName = args[++i];
    } else if (arg === '--out' && args[i + 1]) {
      diagramOut = args[++i];
    } else if (arg === '--no-remote') {
      pushRemote = false;
    } else if (!arg.startsWith('--')) {
      targetDir = arg;
    }
  }

  const resolvedRoot = path.resolve(targetDir);
  return {
    resolvedRoot,
    projectName: projectName || path.basename(resolvedRoot),
    diagramOut: diagramOut ? path.resolve(diagramOut) : path.join(resolvedRoot, '.archify', 'architecture.html'),
    pushRemote,
  };
}

export async function runPipeline(options) {
  const graph = buildGraph(options.resolvedRoot);
  const graphPath = path.join(options.resolvedRoot, '.graphify.json');
  fs.writeFileSync(graphPath, JSON.stringify(graph, null, 2), 'utf8');

  const digest = distillGraphForMemory(graph, options.projectName);
  const { mdPath, daemonStatus } = await persistToClaudeMem(options.resolvedRoot, digest, {
    pushRemote: options.pushRemote,
  });

  const html = generateArchifyHtml(graph, digest, options.projectName);
  fs.mkdirSync(path.dirname(options.diagramOut), { recursive: true });
  fs.writeFileSync(options.diagramOut, html, 'utf8');

  return {
    graph,
    digest,
    graphPath,
    mdPath,
    daemonStatus,
    diagramPath: options.diagramOut,
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
if (isMain) {
  const opts = parseCliArgs(process.argv);
  runPipeline(opts)
    .then((res) => {
      console.log(`[Graph-Mem-Archify] Indexed ${res.graph.stats.totalFilesIndexed} files (${res.graph.stats.resolvedLocalEdges} local links)`);
      console.log(`[Graph-Mem-Archify] Token Savings: ${res.digest.metrics.savingsPct}% (${res.digest.metrics.digestTokensEst} vs ${res.digest.metrics.rawTokensEst} est. tokens)`);
      console.log(`[Graph-Mem-Archify] Memory Digest: ${res.mdPath} (claude-mem daemon: ${res.daemonStatus})`);
      console.log(`[Graph-Mem-Archify] Interactive Diagram: ${res.diagramPath}`);
    })
    .catch((err) => {
      console.error(`[Graph-Mem-Archify ERROR] ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    });
}
