import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EMBLEM_PATH = path.resolve(__dirname, '../assets/logo-emblem-v1.svg');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function classifyLayer(filePath) {
  const low = filePath.toLowerCase();
  if (low.includes('test') || low.includes('spec')) return { name: 'Tests', color: '#8B5CF6' };
  if (low.includes('ui') || low.includes('component') || low.includes('docs') || low.endsWith('.html') || low.endsWith('.css')) {
    return { name: 'Frontend', color: '#0066FF' };
  }
  if (low.includes('mem') || low.includes('db') || low.endsWith('.sql')) {
    return { name: 'Memory/DB', color: '#D96B43' };
  }
  if (low.endsWith('.md')) return { name: 'Docs/Skill', color: '#0EA5A4' };
  return { name: 'Core/AST', color: '#1D7447' };
}

/**
 * Generate a standalone interactive Archify-style HTML diagram directly from .graphify.json + digest
 * (zero raw file re-scanning).
 */
export function generateArchifyHtml(graph, digest, projectName) {
  if (!graph || !graph.nodes) {
    throw new Error('Cannot generate Archify HTML without a valid graph');
  }

  let emblemSvg = '';
  if (fs.existsSync(EMBLEM_PATH)) {
    emblemSvg = fs.readFileSync(EMBLEM_PATH, 'utf8').replace(/<svg\b([^>]*)>/i, '<svg$1 style="width:32px;height:36px;">');
  }

  const allFiles = Object.keys(graph.nodes);
  const hubsMap = new Map((graph.ponytailNavigation?.topHubs || []).map((h) => [h.file, h]));
  const selectedFiles = allFiles
    .slice()
    .sort((a, b) => {
      const ha = hubsMap.get(a);
      const hb = hubsMap.get(b);
      const sa = (ha ? ha.inDegree * 3 + ha.symbolCount : graph.nodes[a].symbols.length);
      const sb = (hb ? hb.inDegree * 3 + hb.symbolCount : graph.nodes[b].symbols.length);
      return sb - sa;
    })
    .slice(0, 32);

  const selectedSet = new Set(selectedFiles);
  const payloadNodes = selectedFiles.map((file, idx) => {
    const info = graph.nodes[file];
    const hub = hubsMap.get(file);
    const layer = classifyLayer(file);
    return {
      id: idx,
      file,
      shortName: path.posix.basename(file),
      layer: layer.name,
      color: layer.color,
      lines: info.lines,
      sha8: info.sha8,
      inDegree: hub?.inDegree || 0,
      outDegree: hub?.outDegree || 0,
      symbols: (info.symbols || []).slice(0, 20),
    };
  });

  const fileToId = new Map(payloadNodes.map((n) => [n.file, n.id]));
  const payloadEdges = (graph.resolvedEdges || [])
    .filter((e) => selectedSet.has(e.from) && selectedSet.has(e.to))
    .map((e) => ({ from: fileToId.get(e.from), to: fileToId.get(e.to), fromFile: e.from, toFile: e.to }));

  const dataJson = JSON.stringify({
    projectName,
    stats: graph.stats,
    metrics: digest?.metrics || { rawTokensEst: 0, digestTokensEst: 0, savingsPct: 0 },
    nodes: payloadNodes,
    edges: payloadEdges,
  }).replace(/<\/script/gi, '<\\/script');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(projectName)} — Graph-Mem-Archify Interactive Map</title>
<style>
  :root {
    --bg: #F8FAFC;
    --dot: #CBD5E1;
    --surface: #FFFFFF;
    --surface-alt: #F1F5F9;
    --ink: #0F172A;
    --muted: #475569;
    --border: #E2E8F0;
    --green: #1D7447;
    --coral: #D96B43;
    --blue: #0066FF;
    --teal: #0EA5A4;
  }
  [data-theme="dark"] {
    --bg: #0B0F17;
    --dot: #1E293B;
    --surface: #111827;
    --surface-alt: #1E293B;
    --ink: #F8FAFC;
    --muted: #94A3B8;
    --border: #1F2937;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background-color: var(--bg);
    background-image: radial-gradient(var(--dot) 1.5px, transparent 1.5px);
    background-size: 24px 24px;
    color: var(--ink);
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: var(--surface);
    border-bottom: 1.5px solid var(--border);
    gap: 16px;
  }
  .brand { display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 16px; }
  .pill {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--surface-alt);
    color: var(--muted);
  }
  .pill.green { color: #10B981; border-color: rgba(16,185,129,0.4); }
  .controls { display: flex; align-items: center; gap: 8px; }
  input[type="search"] {
    padding: 7px 12px;
    border-radius: 8px;
    border: 1.5px solid var(--border);
    background: var(--bg);
    color: var(--ink);
    font-size: 13px;
    width: 220px;
  }
  button {
    padding: 7px 12px;
    border-radius: 8px;
    border: 1.5px solid var(--border);
    background: var(--surface);
    color: var(--ink);
    font-weight: 600;
    font-size: 12px;
    cursor: pointer;
  }
  button.active { background: var(--blue); color: #FFF; border-color: var(--blue); }
  main { flex: 1; display: grid; grid-template-columns: 1fr 340px; min-height: 0; }
  #canvasWrap { position: relative; overflow: auto; padding: 24px; }
  svg#graphSvg { display: block; min-width: 980px; min-height: 640px; }
  aside {
    background: var(--surface);
    border-left: 1.5px solid var(--border);
    padding: 18px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .card {
    background: var(--surface-alt);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px;
  }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
  .sym {
    display: flex;
    justify-content: space-between;
    padding: 5px 8px;
    border-radius: 6px;
    margin-top: 4px;
    background: var(--surface);
    border: 1px solid var(--border);
    font-size: 12px;
  }
  .node-box { cursor: pointer; transition: opacity 0.15s; }
  .node-box:hover rect { stroke-width: 3px; }
</style>
</head>
<body>
<header>
  <div class="brand">
    ${emblemSvg}
    <span>${escapeHtml(projectName)}</span>
    <span class="pill">AST + Mem + Archify</span>
    <span class="pill green" id="savingsPill"></span>
  </div>
  <div class="controls">
    <input id="lensInput" type="search" placeholder="Lens: filter file or symbol..." />
    <button id="pathBtn" title="Click two nodes to trace path">Path Trace: OFF</button>
    <button id="themeBtn">Toggle Dark</button>
  </div>
</header>
<main>
  <div id="canvasWrap">
    <svg id="graphSvg" width="1120" height="780"></svg>
  </div>
  <aside>
    <div class="card">
      <div class="mono" style="font-weight:700;color:var(--green);">PONYTAIL NODE INSPECTOR</div>
      <div id="inspectorTitle" style="font-weight:800;font-size:15px;margin-top:6px;">Click any module box</div>
      <div id="inspectorMeta" class="mono" style="color:var(--muted);margin-top:4px;"></div>
    </div>
    <div class="card" id="pathCard" style="display:none;">
      <div class="mono" style="font-weight:700;color:var(--blue);">PATH TRACE</div>
      <div id="pathResult" class="mono" style="margin-top:6px;line-height:1.45;"></div>
    </div>
    <div>
      <div class="mono" style="font-weight:700;color:var(--muted);margin-bottom:6px;">SYMBOLS &amp; LINE POINTERS</div>
      <div id="symbolList"></div>
    </div>
  </aside>
</main>
<script>
const GRAPH = ${dataJson};
document.getElementById('savingsPill').textContent =
  GRAPH.metrics.savingsPct + '% token reduction (' + GRAPH.metrics.digestTokensEst + ' vs ' + GRAPH.metrics.rawTokensEst + ')';

const svg = document.getElementById('graphSvg');
const layers = ['Frontend', 'Core/AST', 'Memory/DB', 'Docs/Skill', 'Tests'];
const byLayer = new Map(layers.map(l => [l, []]));
GRAPH.nodes.forEach(n => (byLayer.get(n.layer) || byLayer.get('Core/AST')).push(n));

const positions = new Map();
let colX = 40;
layers.forEach(layer => {
  const list = byLayer.get(layer) || [];
  if (!list.length) return;
  list.forEach((n, rowIdx) => {
    positions.set(n.id, { x: colX, y: 40 + rowIdx * 110, w: 175, h: 80 });
  });
  colX += 210;
});

const maxX = Math.max(1120, ...Array.from(positions.values()).map(p => p.x + p.w + 40));
const maxY = Math.max(720, ...Array.from(positions.values()).map(p => p.y + p.h + 40));
svg.setAttribute('width', maxX);
svg.setAttribute('height', maxY);

let pathMode = false;
let pathSelection = [];
let highlightedEdges = new Set();

function renderGraph(filter = '') {
  const q = filter.trim().toLowerCase();
  svg.innerHTML = '';

  const edgeLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  GRAPH.edges.forEach((e, idx) => {
    const a = positions.get(e.from);
    const b = positions.get(e.to);
    if (!a || !b) return;
    const x1 = a.x + a.w / 2, y1 = a.y + a.h / 2;
    const x2 = b.x + b.w / 2, y2 = b.y + b.h / 2;
    const cx = (x1 + x2) / 2;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', \`M \${x1} \${y1} C \${cx} \${y1}, \${cx} \${y2}, \${x2} \${y2}\`);
    path.setAttribute('fill', 'none');
    const hot = highlightedEdges.has(idx);
    path.setAttribute('stroke', hot ? '#0066FF' : '#94A3B8');
    path.setAttribute('stroke-width', hot ? '3.5' : '1.6');
    path.setAttribute('opacity', hot ? '1' : '0.45');
    edgeLayer.appendChild(path);
  });
  svg.appendChild(edgeLayer);

  GRAPH.nodes.forEach(n => {
    const pos = positions.get(n.id);
    if (!pos) return;
    const matches = !q || n.file.toLowerCase().includes(q) || n.symbols.some(s => s.name.toLowerCase().includes(q));
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'node-box');
    g.setAttribute('transform', \`translate(\${pos.x}, \${pos.y})\`);
    g.setAttribute('opacity', matches ? '1' : '0.2');

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', pos.w);
    rect.setAttribute('height', pos.h);
    rect.setAttribute('rx', '12');
    rect.setAttribute('fill', 'var(--surface)');
    rect.setAttribute('stroke', pathSelection.includes(n.id) ? '#0066FF' : n.color);
    rect.setAttribute('stroke-width', pathSelection.includes(n.id) ? '3.5' : '2');
    g.appendChild(rect);

    const tag = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tag.setAttribute('x', '12'); tag.setAttribute('y', '22');
    tag.setAttribute('fill', n.color); tag.setAttribute('font-size', '10');
    tag.setAttribute('font-weight', '800'); tag.setAttribute('font-family', 'monospace');
    tag.textContent = n.layer.toUpperCase();
    g.appendChild(tag);

    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', '12'); title.setAttribute('y', '45');
    title.setAttribute('fill', 'var(--ink)'); title.setAttribute('font-size', '13');
    title.setAttribute('font-weight', '700');
    title.textContent = n.shortName.slice(0, 19);
    g.appendChild(title);

    const meta = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    meta.setAttribute('x', '12'); meta.setAttribute('y', '65');
    meta.setAttribute('fill', 'var(--muted)'); meta.setAttribute('font-size', '11');
    meta.setAttribute('font-family', 'monospace');
    meta.textContent = \`L:\${n.lines} • sym:\${n.symbols.length}\`;
    g.appendChild(meta);

    g.addEventListener('click', () => onNodeClick(n));
    svg.appendChild(g);
  });
}

function onNodeClick(n) {
  document.getElementById('inspectorTitle').textContent = n.file;
  document.getElementById('inspectorMeta').textContent = \`lines: \${n.lines} | in: \${n.inDegree} | out: \${n.outDegree} | sha8: \${n.sha8}\`;
  const symEl = document.getElementById('symbolList');
  symEl.innerHTML = n.symbols.length
    ? n.symbols.map(s => \`<div class="sym"><span><b>[\${s.kind}]</b> \${s.name}</span><span class="mono">:\${s.line}</span></div>\`).join('')
    : '<div class="mono" style="color:var(--muted);">No exported symbols</div>';

  if (pathMode) {
    pathSelection.push(n.id);
    if (pathSelection.length > 2) pathSelection = [n.id];
    highlightedEdges.clear();
    if (pathSelection.length === 2) {
      const [src, dst] = pathSelection;
      const queue = [[src, [src], []]];
      const seen = new Set([src]);
      let found = null;
      while (queue.length && !found) {
        const [cur, nodesPath, edgePath] = queue.shift();
        if (cur === dst) { found = { nodesPath, edgePath }; break; }
        GRAPH.edges.forEach((e, idx) => {
          const next = e.from === cur ? e.to : (e.to === cur ? e.from : null);
          if (next !== null && !seen.has(next)) {
            seen.add(next);
            queue.push([next, [...nodesPath, next], [...edgePath, idx]]);
          }
        });
      }
      const pCard = document.getElementById('pathCard');
      const pRes = document.getElementById('pathResult');
      pCard.style.display = 'block';
      if (found) {
        found.edgePath.forEach(idx => highlightedEdges.add(idx));
        pRes.textContent = found.nodesPath.map(id => GRAPH.nodes[id].shortName).join(' → ');
      } else {
        pRes.textContent = 'No direct local import path between selected boxes.';
      }
    }
    renderGraph(document.getElementById('lensInput').value);
  }
}

document.getElementById('lensInput').addEventListener('input', (e) => renderGraph(e.target.value));
document.getElementById('pathBtn').addEventListener('click', (e) => {
  pathMode = !pathMode;
  pathSelection = [];
  highlightedEdges.clear();
  e.target.textContent = pathMode ? 'Path Trace: ON' : 'Path Trace: OFF';
  e.target.classList.toggle('active', pathMode);
  if (!pathMode) document.getElementById('pathCard').style.display = 'none';
  renderGraph(document.getElementById('lensInput').value);
});
document.getElementById('themeBtn').addEventListener('click', () => {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark');
});

renderGraph();
</script>
</body>
</html>`;
}
