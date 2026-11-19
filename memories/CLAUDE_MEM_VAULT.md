# CLAUDE_MEM_VAULT — Memórias Migradas Integralmente de `graphify-claude-mem`

Consolidado das observações e regras persistentes migradas para o **`graph-mem-archify`**:

## Observação #111 — `graphify_ast_topology` (SuperAntigravityTJTO)
- **Total Files Indexed:** `2500` | **Total Edges:** `10836`
- **Top High-Centrality Hubs (PonyTail Navigation Targets):**
  - `tools/render-anything-engine/sdk/ui/src/wire.ts` (334 lines, inDegree: 31, symbols: 34)
  - `tools/render-anything-engine/sdk/raea/src/test.tsx` (31 lines, inDegree: 40, symbols: 2)
  - `tools/render-anything-engine/sdk/ui/parity/cases/p15-media/fixtures.ts` (26 lines, inDegree: 28, symbols: 19)
  - `tools/render-anything-engine/sdk/render/src/bevy3d/ui-val.ts` (183 lines, inDegree: 22, symbols: 36)
  - `tools/render-anything-engine/sdk/render/src/bevy3d/ui.tsx` (469 lines, inDegree: 20, symbols: 24)
- **Key Exported Symbols & Line Pointers:**
  - `[export] PROCESS_STAGES -> tools/archify_process_view.mjs:19`
  - `[fn] generateSvgGraph -> tools/archify_process_view.mjs:374`
  - `[fn] generateProcessWorkflowHtml -> tools/archify_process_view.mjs:484`
  - `[def] extract_symbols_from_python -> tools/cartographer.py:16`
  - `[def] map_codebase -> tools/cartographer.py:29`
  - `[fn] generateOrganizerCheckpoint -> tools/checkpoint-organizer.mjs:9`
  - `[fn] filterAnsiAndTerminal -> tools/context-compressor.mjs:18`
  - `[def] synthesize_sfx -> tools/earshot_dsp.py:20`
  - `[class] HarnessEngine -> tools/google_harness.py:25`
  - `[fn] parseArgs -> tools/graphify-indexer.mjs:27`
  - `[def] compress_prompt -> tools/headroom_compressor.py:15`
  - `[def] beat_matching -> tools/huashu_motion.py:25`
  - `[fn] deliberateJudicialCase -> tools/judicial_jury_deliberation.mjs:45`
  - `[def] execute_loop -> tools/ralph_loop.py:30`
  - `[def] inspect_saas -> tools/res_saas_inspector.py:18`
  - `[def] semantic_search -> tools/semantic_lookup.py:35`
  - `[def] prune_skills -> tools/skills_pruner.py:28`
  - `[def] sanitize_text -> tools/turnitout_sanitizer.py:20`

## Observação #117 — Tríade de Hiper-Economia de Tokens
- **Fusão:** `Graphify` (PonyTail AST para navegação estrutural sem leituras cegas) + `Claude-Mem` (memória persistente local SQLite/DuckDB na porta `37777`) + `Billion Context` (rollup hierárquico com compressão progressiva de histórico).
- **Diretiva Inviolável:** Nunca varrer árvores de diretórios com `find` ou `grep` cego nem ler arquivos inteiros; consultar o mapa AST e abrir fatias de ~30 linhas (`StartLine`/`EndLine`), reduzindo o consumo de tokens em `>65% a 85%`.

## Observação #153 & #157 — Ponte Archify + Publicação GitHub
- `graph-mem-archify` publicado em `https://github.com/santanaluiz181-cell/graph-mem-archify` e GitHub Pages `https://santanaluiz181-cell.github.io/graph-mem-archify/`, integrando `Graphify-Labs/graphify`, `thedotmack/claude-mem` e `tt-a1i/archify` com compatibilidade 100% retroativa aos scripts legados em `tools/`.
