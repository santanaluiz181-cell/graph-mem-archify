---
name: graph-mem-archify
description: Fuses deterministic AST Knowledge Graphs (Graphify), Persistent Cross-Session Memory (Claude-Mem), and Interactive HTML Architecture Diagrams (Archify) into one token-saving pipeline. Trigger when mapping codebases, generating interactive diagrams without burning tokens, or navigating symbols via PonyTail file:line slices.
---

# Graph-Mem-Archify (`/graph-mem-archify`)

A unified Agent Skill built by combining the strengths of three pioneering open-source projects:
- **[Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify)** — deterministic AST knowledge graph & dependency centrality (zero vector store, zero LLM tokens for indexing).
- **[thedotmack/claude-mem](https://github.com/thedotmack/claude-mem)** — persistent cross-session observation memory & compression (`localhost:37777` / MCP).
- **[tt-a1i/archify](https://github.com/tt-a1i/archify)** — interactive standalone HTML architecture diagrams (`Sequence`, `Data Flow`, `Path Trace`, `Lens`, clickable code links).

## Why Combine All Three?

1. **Graphify** solves structural discovery without reading 1,000+ raw files.
2. **Claude-Mem** persists the distilled hubs and symbol line pointers across sessions (`65–85%` token reduction).
3. **Archify** turns that compressed graph into an interactive visual HTML map for human engineers — without scanning raw files twice.

## Pipeline Order (Strict)

```
[Codebase] -> [src/indexer.mjs -> .graphify.json] -> [src/memory-bridge.mjs -> .graphify_memory.md + claude-mem] -> [src/archify-diagram.mjs -> .archify/architecture.html]
```

## Quick Execution

```bash
npx graph-mem-archify . --project MyProject
# Or directly from source:
node src/cli.mjs /path/to/repo --project MyProject --out .archify/architecture.html
```

## Agent Navigation Rule (PonyTail Slicing)

1. Query `mem_search` in `claude-mem` or read `.graphify_memory.md` first.
2. Open `.archify/architecture.html` in a browser when you need visual path tracing (`Path Trace: ON`).
3. Read only 30-line slices (`StartLine`/`EndLine`) around the exact `file:line` pointer reported by the graph.
