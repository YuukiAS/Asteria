# Result asteria_v2_g00

status: completed

## Execution Summary

G00 froze the existing Asteria 1.x local-first research canvas as version `1.0.0` without adding Asteria 2.0 semantic graph features.

Implemented a deterministic legacy V1 fixture, a round-trip regression, a repeatable baseline benchmark, and a narrowly scoped restore-safety compatibility fix for loading the shared workspace.

## Read Files

- `AGENTS.md`
- `prompts/AGENT_RULES.md`
- `prompts/CHATGPT_RULES.md`
- `VERSIONING.md`
- `docs/notes/2026-09-08_asteria_v2_master_plan.md`
- `docs/notes/2026-09-08_asteria_v2_current_implementation_audit.md`
- `README.md`
- `package.json`
- `src/types/map.ts`
- `src/lib/exportImport.ts`
- `src/lib/restoreSafety.ts`
- `src/store/useMapStore.ts`
- Existing `npm run test:*` scripts under `scripts/`

## Modified Files

- `package.json`
- `package-lock.json`
- `CHANGELOG.md`
- `README.md`
- `src/fixtures/legacyV1FreezeMap.ts`
- `scripts/validate-legacy-v1-roundtrip.mjs`
- `scripts/benchmark-v1-baseline.mjs`
- `scripts/validate-search-clicks.mjs`
- `scripts/validate-edge-handles.mjs`
- `scripts/validate-restore-safety.mjs`
- `src/lib/restoreSafety.ts`
- `src/store/useMapStore.ts`
- `src/app/App.tsx`
- `src/components/Toolbar.tsx`

## Compatibility Fixture

Fixture path:

```text
src/fixtures/legacyV1FreezeMap.ts
```

Coverage:

- rich text with inline and display math;
- Symbol entries;
- visual edge style and version visibility;
- model versions and inherited/fixed variants;
- Story Outline and Story deck settings;
- viewport;
- group/frame presentation and parented blocks;
- deterministic fallback content for search and edge regression scripts when `.runtime/asteria-server/shared-map.json` is absent.

## Restore-Safety Fix

Local restore points still preserve local-only nodes, valid local-only edges, Story items, model versions, and newer/fuller matching block content.

Loading the current shared version now preserves newer matching block content from the current computer but does not merge local-only nodes, edges, Story items, or local-only model versions into the shared workspace.

Regression:

```text
npm run test:restore-safety
Validated restore safety merge modes.
exit 0
```

## Tests

```text
npm run build
exit 0
```

Build output recorded:

```text
dist/assets/index-CcbfDYLb.css 123.03 kB, gzip 24.25 kB
dist/assets/index-C-OmqgCl.js 1,300.43 kB, gzip 401.32 kB
Vite chunk-size warning remains as baseline evidence for G05, not a G00 failure.
```

Single-command regressions:

```text
npm run test:legacy-roundtrip
Validated Asteria 1.x legacy fixture round-trip.
exit 0

npm run test:search
Validated 22 shared-map search click targets.
exit 0

npm run test:edges
Validated 3 shared-map visible edge endpoints.
exit 0

npm run test:block-usability
Validated block size, Zoom image URL, and title-edit usability behavior.
exit 0

npm run test:rich-text
Validated rich-text clipboard style and quote document behavior.
exit 0

npm run test:image-links
Validated image-link Story Markdown export behavior.
exit 0

npm run test:shared-server
Shared server config validation passed.
exit 0

npm run test:shared-save
Validated shared-save feedback and non-blocking local mirror behavior.
exit 0
```

Cumulative regression:

```text
time -p npm run test:regression
exit 0
real 2.31
user 2.74
sys 0.46
```

Whitespace check:

```text
git diff --check
exit 0
```

## Baseline Benchmark

Command:

```text
npm run bench:v1-baseline
exit 0
```

Recorded values:

```json
{"scenario":{"label":"small","nodes":24,"edges":40},"normalizeAverageMs":0.313,"projectionAverageMs":0.122,"historySignatureAverageMs":0.24,"visible":{"visibleNodeCount":24,"visibleEdgeCount":40},"historySignatureBytes":50864}
{"scenario":{"label":"medium","nodes":160,"edges":360},"normalizeAverageMs":2.588,"projectionAverageMs":0.426,"historySignatureAverageMs":2.059,"visible":{"visibleNodeCount":160,"visibleEdgeCount":360},"historySignatureBytes":384011}
{"scenario":{"label":"large","nodes":720,"edges":1800},"normalizeAverageMs":9.878,"projectionAverageMs":1.544,"historySignatureAverageMs":10.003,"visible":{"visibleNodeCount":720,"visibleEdgeCount":1800},"historySignatureBytes":1820018}
{"distAssetBytes":2496409}
```

## Git Diff Summary

G00 diff contains version records, README/CHANGELOG freeze notes, the legacy fixture, regression/benchmark scripts, deterministic regression fallback for missing local shared-map runtime data, and the restore-safety compatibility fix.

No Asteria 2.0 semantic kernel, typed relation, canonical symbol registry, multi-view, desktop, deployment, Cloudflare, or fixed public URL changes were introduced in G00.

## Commit And Push

Target commit message:

```text
v1.0.0
```

The exact commit SHA is the enclosing `v1.0.0` commit and is reported after the commit/push operation.

## Remaining Risks

- Existing Vite build still emits the large JS chunk warning. This is preserved as baseline evidence for G05 performance work.
- Browser-level profiling was not added in G00; the task allowed repeatable Node/TS baseline evidence at this stage.

## Next

Proceed to `prompts/tasks/asteria_v2_g01_task.md`.

G01_READY = YES
