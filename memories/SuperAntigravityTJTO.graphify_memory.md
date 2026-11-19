# CODEBASE AST TOPOLOGY MAP: SuperAntigravityTJTO
*Generated via Graphify + Claude-Mem at 2026-11-11T13:28:19.420Z*
*Total Files Indexed: 2500 | Total Edges: 10836*

## 1. HIGH-CENTRALITY HUBS (PONYTAIL NAVIGATION TARGETS)
Use targeted `view_file` with StartLine/EndLine around these hubs instead of reading whole files:
- `tools/render-anything-engine/sdk/ui/src/wire.ts` (334 lines, inDegree: 31, symbols: 34)
- `tools/render-anything-engine/sdk/raea/src/test.tsx` (31 lines, inDegree: 40, symbols: 2)
- `tools/render-anything-engine/sdk/ui/parity/cases/p15-media/fixtures.ts` (26 lines, inDegree: 28, symbols: 19)
- `tools/render-anything-engine/sdk/render/src/bevy3d/ui-val.ts` (183 lines, inDegree: 22, symbols: 36)
- `tools/render-anything-engine/sdk/render/src/bevy3d/ui.tsx` (469 lines, inDegree: 20, symbols: 24)
- `tools/render-anything-engine/sdk/raea/src/3d.tsx` (5 lines, inDegree: 19, symbols: 0)
- `tools/render-anything-engine/sdk/ui/src/dom/all.ts` (21 lines, inDegree: 18, symbols: 0)
- `tools/render-anything-engine/sdk/render/src/3d.tsx` (33 lines, inDegree: 18, symbols: 0)
- `tools/render-anything-engine/sdk/render/src/3d/all.ts` (22 lines, inDegree: 18, symbols: 0)
- `tools/render-anything-engine/vendor/vello_encoding/src/path.rs` (879 lines, inDegree: 0, symbols: 50)
- `tools/render-anything-engine/vendor/stylo/custom_properties.rs` (2024 lines, inDegree: 0, symbols: 50)
- `tools/render-anything-engine/vendor/stylo/data.rs` (694 lines, inDegree: 0, symbols: 50)
- `tools/render-anything-engine/vendor/stylo/dom.rs` (1165 lines, inDegree: 0, symbols: 50)
- `tools/render-anything-engine/vendor/stylo/lib.rs` (337 lines, inDegree: 0, symbols: 50)
- `tools/render-anything-engine/vendor/stylo/logical_geometry.rs` (1685 lines, inDegree: 0, symbols: 50)

## 2. KEY EXPORTED SYMBOLS & LINE POINTERS
- [export] `PROCESS_STAGES` -> `tools/archify_process_view.mjs:19`
- [fn] `generateSvgGraph` -> `tools/archify_process_view.mjs:374`
- [fn] `generateProcessWorkflowHtml` -> `tools/archify_process_view.mjs:484`
- [fn] `updateTransform` -> `tools/archify_process_view.mjs:1061`
- [fn] `zoomIn` -> `tools/archify_process_view.mjs:1067`
- [fn] `zoomOut` -> `tools/archify_process_view.mjs:1073`
- [fn] `resetView` -> `tools/archify_process_view.mjs:1079`
- [fn] `selectStage` -> `tools/archify_process_view.mjs:1118`
- [fn] `applyWorkflowFilter` -> `tools/archify_process_view.mjs:1161`
- [fn] `printFlowReport` -> `tools/archify_process_view.mjs:1190`
- [fn] `truncateText` -> `tools/archify_process_view.mjs:1205`
- [fn] `escapeXml` -> `tools/archify_process_view.mjs:1210`
- [def] `load_wav_pcm` -> `tools/batch_processor_lote27.py:26`
- [def] `run_ocr_on_frames` -> `tools/batch_processor_lote27.py:36`
- [def] `main` -> `tools/batch_processor_lote27.py:54`
- [def] `extract_symbols_from_python` -> `tools/cartographer.py:16`
- [def] `extract_symbols_from_js_ts` -> `tools/cartographer.py:21`
- [def] `map_codebase` -> `tools/cartographer.py:29`
- [def] `generate_markdown_map` -> `tools/cartographer.py:91`
- [def] `main` -> `tools/cartographer.py:115`
- [fn] `generateOrganizerCheckpoint` -> `tools/checkpoint-organizer.mjs:9`
- [fn] `filterAnsiAndTerminal` -> `tools/context-compressor.mjs:18`
- [fn] `filterJsonPayload` -> `tools/context-compressor.mjs:62`
- [fn] `prune` -> `tools/context-compressor.mjs:77`
- [fn] `filterFileRead` -> `tools/context-compressor.mjs:128`
- [fn] `interceptToolResult` -> `tools/context-compressor.mjs:167`
- [fn] `resetFileRegistry` -> `tools/context-compressor.mjs:190`
- [def] `synthesize_sfx` -> `tools/earshot_dsp.py:20`
- [def] `save_wav` -> `tools/earshot_dsp.py:63`
- [def] `main` -> `tools/earshot_dsp.py:72`
- [class] `HarnessEngine` -> `tools/google_harness.py:25`
- [def] `__init__` -> `tools/google_harness.py:26`
- [def] `evaluate_turn` -> `tools/google_harness.py:31`
- [def] `optimize_prompt_recursively` -> `tools/google_harness.py:41`
- [def] `main` -> `tools/google_harness.py:64`
- [fn] `parseArgs` -> `tools/graphify-indexer.mjs:27`
- [fn] `extractSymbolsAndImports` -> `tools/graphify-indexer.mjs:53`
- [fn] `walkDirectory` -> `tools/graphify-indexer.mjs:112`
- [fn] `buildGraph` -> `tools/graphify-indexer.mjs:146`
- [fn] `main` -> `tools/graphify-indexer.mjs:226`
- [fn] `parseArgs` -> `tools/graphify_claude_mem.mjs:29`
- [fn] `ensureGraphifyJson` -> `tools/graphify_claude_mem.mjs:53`
- [fn] `distillGraphForMemory` -> `tools/graphify_claude_mem.mjs:73`
- [fn] `injectIntoClaudeMem` -> `tools/graphify_claude_mem.mjs:132`
- [fn] `main` -> `tools/graphify_claude_mem.mjs:158`
- [def] `compress_prompt` -> `tools/headroom_compressor.py:32`
- [def] `repl_fenced` -> `tools/headroom_compressor.py:38`
- [def] `main` -> `tools/headroom_compressor.py:75`
- [def] `detect_audio_beats` -> `tools/huashu_motion.py:14`
- [def] `generate_bpm_beat_map` -> `tools/huashu_motion.py:63`
- [def] `main` -> `tools/huashu_motion.py:86`
- [export] `JURY_MEMBERS` -> `tools/judicial_jury_deliberation.mjs:22`
- [export] `LEGAL_BENCHMARKS` -> `tools/judicial_jury_deliberation.mjs:134`
- [fn] `agent1AccusationAudit` -> `tools/judicial_jury_deliberation.mjs:157`
- [fn] `agent2DefenseAdvocacy` -> `tools/judicial_jury_deliberation.mjs:265`
- [fn] `agentsJuryDeliberation` -> `tools/judicial_jury_deliberation.mjs:322`
- [fn] `agent15JudgePresidentVerdict` -> `tools/judicial_jury_deliberation.mjs:540`
- [fn] `runJudicialJuryDeliberation` -> `tools/judicial_jury_deliberation.mjs:636`
- [fn] `formatDeliberationOutput` -> `tools/judicial_jury_deliberation.mjs:668`
- [class] `RalphLoop` -> `tools/ralph_loop.py:20`

## 3. AGENT NAVIGATION DIRECTIVE
> DO NOT scan directory trees or use blind grep. Check this AST topology in claude-mem, locate the exact file and line number, and read only a 30-line slice around the symbol.