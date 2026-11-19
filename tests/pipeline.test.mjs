import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildGraph, extractSymbolsAndImports } from '../src/indexer.mjs';
import { distillGraphForMemory } from '../src/memory-bridge.mjs';
import { generateArchifyHtml } from '../src/archify-diagram.mjs';
import { runPipeline } from '../src/cli.mjs';

test('extractSymbolsAndImports extracts JS functions and imports accurately', () => {
  const sample = [
    "import { helper } from './helper.mjs';",
    'export function processOrder(id) {',
    '  return helper(id);',
    '}',
  ].join('\n');
  const res = extractSymbolsAndImports(sample, '.mjs');
  assert.equal(res.linesCount, 4);
  assert.deepEqual(res.imports, ['./helper.mjs']);
  assert.equal(res.symbols[0].name, 'processOrder');
  assert.equal(res.symbols[0].line, 2);
});

test('negative assertion: buildGraph throws loudly on non-existent directory', () => {
  assert.throws(
    () => buildGraph(path.join(os.tmpdir(), 'nonexistent-graph-mem-archify-xyz-999')),
    /does not exist/
  );
});

test('negative assertion: generateArchifyHtml rejects null/invalid graph', () => {
  assert.throws(() => generateArchifyHtml(null, null, 'bad'), /valid graph/);
});

test('end-to-end pipeline indexes temp repo, compresses tokens, and builds interactive Archify HTML', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gma-test-'));
  try {
    fs.writeFileSync(path.join(tmp, 'utils.mjs'), 'export function add(a, b) { return a + b; }\n// ' + 'x'.repeat(2000), 'utf8');
    fs.writeFileSync(path.join(tmp, 'app.mjs'), "import { add } from './utils.mjs';\nexport function run() { return add(1, 2); }\n", 'utf8');

    const res = await runPipeline({
      resolvedRoot: tmp,
      projectName: 'test-repo',
      diagramOut: path.join(tmp, '.archify', 'architecture.html'),
      pushRemote: false,
    });

    assert.equal(res.graph.stats.totalFilesIndexed, 2);
    assert.equal(res.graph.stats.resolvedLocalEdges, 1);
    assert.ok(res.digest.metrics.savingsPct > 0, 'Digest must reduce estimated tokens vs raw files');
    assert.ok(fs.existsSync(res.graphPath));
    assert.ok(fs.existsSync(res.mdPath));
    assert.ok(fs.existsSync(res.diagramPath));

    const html = fs.readFileSync(res.diagramPath, 'utf8');
    assert.ok(html.includes('utils.mjs'));
    assert.ok(html.includes('processOrder') === false);
    assert.ok(html.includes('Path Trace'));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
