# CODEBASE AST TOPOLOGY: AntigravityDashboard
*Generated via Graph-Mem-Archify at 2026-11-19T17:37:33.540Z*
*Files: 39 | Edges: 110 | Local Links: 10*

## 1. HIGH-CENTRALITY HUBS (PONYTAIL TARGETS)
- `engines/gaussian-splat-25d/train.py` (1095 lines, inDegree: 0, symbols: 27)
- `src/data/staticShowcaseData.ts` (1185 lines, inDegree: 2, symbols: 13)
- `engines/gaussian-splat-25d/viewer_25d.html` (293 lines, inDegree: 0, symbols: 18)
- `server/paths.ts` (82 lines, inDegree: 0, symbols: 15)
- `server/services/mediaKnowledgeVault.ts` (671 lines, inDegree: 0, symbols: 15)
- `server/services/tokenScanner.ts` (333 lines, inDegree: 0, symbols: 13)
- `server/services/profileManager.ts` (325 lines, inDegree: 0, symbols: 12)
- `server/services/sqliteInspector.ts` (320 lines, inDegree: 0, symbols: 12)
- `src/App.tsx` (884 lines, inDegree: 1, symbols: 8)
- `README.md` (142 lines, inDegree: 0, symbols: 10)
- `engines/gaussian-splat-25d/test_gaussian_splat_dual_backend.py` (175 lines, inDegree: 0, symbols: 10)
- `server/services/meetingPipeline.ts` (214 lines, inDegree: 0, symbols: 8)
- `server/services/splatEngineService.ts` (210 lines, inDegree: 0, symbols: 8)
- `docs/README.pt-BR.md` (86 lines, inDegree: 0, symbols: 8)
- `docs/README.zh-CN.md` (86 lines, inDegree: 0, symbols: 8)

## 2. KEY SYMBOLS & LINE POINTERS
- [fn] `computeReportFromItems` -> `src/data/staticShowcaseData.ts:350`
- [fn] `simulatePresetClientSide` -> `src/data/staticShowcaseData.ts:443`
- [fn] `buildColumnsFromRows` -> `src/data/staticShowcaseData.ts:598`
- [fn] `runClientSideSqlSimulation` -> `src/data/staticShowcaseData.ts:629`
- [fn] `ingestClientSideFile` -> `src/data/staticShowcaseData.ts:702`
- [fn] `extractMeetingClientSide` -> `src/data/staticShowcaseData.ts:816`
- [fn] `ingestVideoClientSide` -> `src/data/staticShowcaseData.ts:1087`
- [export] `antigravityExplainerConfig` -> `src/components/AntigravityMotionPlayer.tsx:224`
- [export] `app` -> `server/index.ts:46`
- [export] `USER_HOME` -> `server/paths.ts:4`
- [export] `GEMINI_ROOT` -> `server/paths.ts:5`
- [export] `ANTIGRAVITY_DIR` -> `server/paths.ts:6`
- [export] `CONFIG_DIR` -> `server/paths.ts:7`
- [export] `WORKSPACE_ROOT` -> `server/paths.ts:8`
- [export] `BACKUPS_DIR` -> `server/paths.ts:9`
- [export] `SAME_DRIVE_QUARANTINE_DIR` -> `server/paths.ts:10`
- [export] `SUPER_TJTO_TOOLS_DIR` -> `server/paths.ts:11`
- [export] `GAUSSIAN_SPLAT_ENGINE_DIR` -> `server/paths.ts:12`
- [export] `ROCM_PYTHON` -> `server/paths.ts:13`
- [export] `WGPU_PYTHON` -> `server/paths.ts:14`
- [export] `DATA_PATHS` -> `server/paths.ts:17`
- [fn] `normalizeWinPath` -> `server/paths.ts:49`
- [fn] `assertNeverTouchesOfficialBinaries` -> `server/paths.ts:57`
- [fn] `isAllowedReadPath` -> `server/paths.ts:70`
- [fn] `getVaultDb` -> `server/services/mediaKnowledgeVault.ts:54`
- [fn] `extractTopicsAndEntities` -> `server/services/mediaKnowledgeVault.ts:102`
- [fn] `insertNodeAndEdges` -> `server/services/mediaKnowledgeVault.ts:149`
- [fn] `ensureMissingBaselineNodes` -> `server/services/mediaKnowledgeVault.ts:363`
- [fn] `seedInitialVaultIfEmpty` -> `server/services/mediaKnowledgeVault.ts:373`
- [fn] `ensureCapriReelIndexed` -> `server/services/mediaKnowledgeVault.ts:379`
- [fn] `readWatchVideoArtifacts` -> `server/services/mediaKnowledgeVault.ts:383`
- [fn] `getKnowledgeVaultSnapshot` -> `server/services/mediaKnowledgeVault.ts:462`
- [fn] `ingestVideoToVault` -> `server/services/mediaKnowledgeVault.ts:516`
- [fn] `approveOrRejectVaultAction` -> `server/services/mediaKnowledgeVault.ts:618`
- [fn] `getMeetingsStoragePath` -> `server/services/meetingPipeline.ts:36`
- [fn] `persistMeetingsStore` -> `server/services/meetingPipeline.ts:41`
- [fn] `loadMeetingsStore` -> `server/services/meetingPipeline.ts:46`
- [fn] `extractStructuredMeetingIntelligence` -> `server/services/meetingPipeline.ts:62`
- [fn] `transcribeAudioViaGpuAsr` -> `server/services/meetingPipeline.ts:135`
- [fn] `approveOrRejectStagedAction` -> `server/services/meetingPipeline.ts:172`
- [fn] `withProfileLock` -> `server/services/profileManager.ts:98`
- [fn] `ensureBackupDirs` -> `server/services/profileManager.ts:110`
- [fn] `getLedgerPath` -> `server/services/profileManager.ts:119`
- [fn] `getActiveStatePath` -> `server/services/profileManager.ts:124`
- [fn] `readQuarantineLedger` -> `server/services/profileManager.ts:129`
- [fn] `writeQuarantineLedger` -> `server/services/profileManager.ts:139`
- [fn] `getActiveProfileState` -> `server/services/profileManager.ts:145`
- [fn] `moveDirectoryAtomic` -> `server/services/profileManager.ts:157`
- [fn] `applyProfilePreset` -> `server/services/profileManager.ts:184`
- [fn] `assertValidSplatBackend` -> `server/services/splatEngineService.ts:41`
- [fn] `resolveSplatPythonInterpreter` -> `server/services/splatEngineService.ts:54`
- [fn] `runGaussianSplatEncode` -> `server/services/splatEngineService.ts:66`
- [fn] `listSplatRuns` -> `server/services/splatEngineService.ts:147`
- [fn] `resolveSplatArtifactFile` -> `server/services/splatEngineService.ts:184`
- [fn] `assertReadOnlySelectSql` -> `server/services/sqliteInspector.ts:40`
- [fn] `sanitizeIdentifier` -> `server/services/sqliteInspector.ts:63`
- [fn] `parseCsvLine` -> `server/services/sqliteInspector.ts:73`
- [fn] `inferSqlType` -> `server/services/sqliteInspector.ts:97`
- [fn] `ingestStructuredRecords` -> `server/services/sqliteInspector.ts:119`
- [fn] `ingestCsvContent` -> `server/services/sqliteInspector.ts:193`

## 3. NAVIGATION DIRECTIVE
> Query this digest from claude-mem or Archify HTML first; open only 30-line slices around symbol.line.