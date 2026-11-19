---
name: graph-mem-archify
description: Fuses deterministic AST Knowledge Graphs (Graphify + PonyTail), Persistent Cross-Session Memory (@claude-mem MCP + Billion Context), and Interactive HTML Architecture Diagrams (Archify) into one token-saving pipeline (>65% to 85% reduction). Supersedes and incorporates 100% of graphify-claude-mem.
version: 2.0.0
author: NEXUS OMEGA / Luiz Antonio Santana / SuperAntigravityTJTO
tags: [ast, code-graph, memory, tokens, optimization, claude-mem, graphify, archify, ponytail, diagram]
---

# Graph-Mem-Archify (`/graph-mem-archify` & `/graphify-mem`)

A unified Agent Skill built by combining the strengths of three pioneering open-source projects and absorbing 100% of the legacy **`graphify-claude-mem`** bridge:
- **[Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify)** — deterministic AST knowledge graph & dependency centrality (zero vector store, zero LLM tokens for indexing).
- **[thedotmack/claude-mem](https://github.com/thedotmack/claude-mem)** — persistent cross-session observation memory & compression (`localhost:37777` / MCP).
- **[tt-a1i/archify](https://github.com/tt-a1i/archify)** — interactive standalone HTML architecture diagrams (`Sequence`, `Data Flow`, `Path Trace`, `Lens`, clickable code links).

---

## 1. O Problema Resolvido: Desperdício de Tokens de Boot & Descoberta

Em projetos médios e grandes, agentes de IA gastam de **5.000 a 30.000 tokens em cada sessão** apenas descobrindo onde estão as funções, classes e arquivos, fazendo dezenas de chamadas cegas a `dir`, `find`, `grep` e `read_file` em arquivos inteiros de 500+ linhas.

1. **Graphify** resolve a descoberta estrutural sem ler 1.000+ arquivos brutos.
2. **Claude-Mem** persiste os Hubs destilados e os ponteiros `arquivo:linha` entre sessões (`65–85%` de redução de tokens), formando com **Billion Context** a Tríade de Hiper-Economia de Tokens (rollup hierárquico com compressão progressiva de histórico).
3. **Archify** converte esse grafo comprimido em um mapa HTML interativo vivo para engenheiros humanos — sem escanear os arquivos brutos duas vezes.

---

## 2. A Solução: Topologia Indexada + Injeção na Memória Persistente + Diagrama Vivo

O pipeline opera em quatro etapas determinísticas:

```
[Código-Fonte]
  → [src/indexer.mjs (ou tools/graphify-indexer.mjs) → .graphify.json]
  → [src/memory-bridge.mjs (ou tools/graphify_claude_mem.mjs) → .graphify_memory.md + @claude-mem MCP]
  → [src/archify-diagram.mjs → .archify/architecture.html]
  → [Navegação Cirúrgica PonyTail]
```

1. **Graphify Indexer (`src/indexer.mjs` / `tools/graphify-indexer.mjs`):**
   Varre a codebase em milissegundos, gerando `.graphify.json` com nós, dependências, números de linha exatos de símbolos e cálculo de centralidade de nós (`InDegree`/`OutDegree`).
2. **Compressor & Bridge (`src/memory-bridge.mjs` / `tools/graphify_claude_mem.mjs`):**
   Filtra os **15 maiores Hubs** da arquitetura e as **60 funções/classes principais** com ponteiros `arquivo:linha`, salvando `.graphify_memory.md` e no cofre `memories/<Projeto>.graphify_memory.md`.
3. **Persistência no Claude-Mem (`save_memory` & `work_state_write`):**
   Injeta o mapa sob o título `graphify_ast_topology` / `graphify_ast_<Projeto>`. Nas sessões seguintes, o agente recebe ou consulta essa memória sem precisar reler nenhum arquivo bruto.
4. **Gerador Visual Archify (`src/archify-diagram.mjs`):**
   Transforma `.graphify.json` e `.graphify_memory.md` em um diagrama HTML5 standalone interativo (`.archify/architecture.html`) com **Path Trace**, **Lens Slider**, busca de símbolos e links diretos de código.
5. **Navegação PonyTail:**
   O agente abre apenas um recorte cirúrgico de 30 linhas (`StartLine`/`EndLine`) ao redor da linha indicada pelo mapa.

---

## 3. Comandos e Uso

### Executar o Pipeline Completo (AST + Claude-Mem + Archify HTML):
```bash
npx graph-mem-archify . --project <NomeDoProjeto>
# Ou diretamente via CLI local:
node src/cli.mjs /caminho/do/repo --project <NomeDoProjeto> --out .archify/architecture.html
```

### Compatibilidade 1:1 com o Comando Legado (`graphify-claude-mem`):
```bash
node tools/graphify_claude_mem.mjs . --project <NomeDoProjeto>
```

### Consultar a Memória no Agente (sem ler arquivos):
```markdown
1. O agente consulta a ferramenta MCP `mem_search` (`graphify_ast_topology` / `graphify_ast_<Projeto>`) ou lê `.graphify_memory.md` / `memories/<Projeto>.graphify_memory.md`.
2. Abre `.archify/architecture.html` quando precisar de rastreamento visual de caminhos (`Path Trace: ON`).
3. Localiza o símbolo desejado e sua linha exata.
```

### Leitura Cirúrgica PonyTail (Regra Inviolável):
```typescript
// NUNCA ler o arquivo inteiro:
read_file({ Path: "tools/render-anything-engine/sdk/ui/src/wire.ts" }) // PROIBIDO!

// SEMPRE ler a fatia de ~30 linhas indicada no grafo:
read_file({ 
  Path: "tools/render-anything-engine/sdk/ui/src/wire.ts", 
  StartLine: 18, 
  EndLine: 50 
}) // ECONOMIA DE 90% DE TOKENS!
```

---

## 4. Cofre de Memórias Migradas (`memories/`)

Todas as topologias e observações do antigo `graphify-claude-mem` estão integralmente preservadas em `memories/`:
- `memories/SuperAntigravityTJTO.graphify_memory.md` (`2500` arquivos, `10836` arestas, Hubs e ponteiros `tools/*`)
- `memories/AntigravityDashboard.graphify_memory.md` (Topologia completa do workspace Antigravity Dashboard)
- `memories/MeuAmigoJornalista.graphify_memory.md` (Topologia completa do Meu Amigo Jornalista)
- `memories/CLAUDE_MEM_VAULT.md` (Observações `#111`, `#117`, `#153`, `#157` consolidadas)

---

## 5. Benefícios Comprovados
- **Economia de Tokens:** `>65% a 85%` de redução de tokens de entrada em sessões de refatoração, arquitetura e auditoria.
- **Velocidade:** Elimina `10 a 25` tool calls mecânicas de busca no boot da conversa.
- **Conformidade Judiciária TJTO:** Roda `100%` local (SQLite/Daemon MCP na porta `37777`), sem envio de minutas, processos ou código confidencial para clouds externas.
