# Result asteria_v2_g01

status: completed

## Execution Summary

G01 added the first platform-independent Asteria 2.0 semantic kernel and deterministic V1 migration. The Web UI was not redesigned and no G02/G03/G04 interaction features were implemented.

Schema version:

```text
2.0.0-alpha.1
```

## Read Files

- `AGENTS.md`
- `prompts/AGENT_RULES.md`
- `VERSIONING.md`
- `docs/notes/2026-09-08_asteria_v2_master_plan.md`
- `docs/notes/2026-09-08_asteria_v2_current_implementation_audit.md`
- `docs/notes/2026-09-08_cat_trace_reference_architecture_for_asteria_v2.md`
- `docs/notes/2026-09-09_trace_and_cat_trace_reference_for_asteria_v2.md`
- `results/asteria_v2_g00_result.md`
- `src/types/map.ts`
- `src/lib/exportImport.ts`
- `src/lib/restoreSafety.ts`
- `src/store/useMapStore.ts`

## Modified Files

- `package.json`
- `package-lock.json`
- `CHANGELOG.md`
- `README.md`
- `src/architecture/types.ts`
- `src/architecture/schema.ts`
- `src/architecture/migration.ts`
- `src/architecture/graphIndex.ts`
- `src/architecture/selectors.ts`
- `src/architecture/validationTypes.ts`
- `src/architecture/fixtures/syntheticArchitectureProject.ts`
- `scripts/validate-architecture-kernel.mjs`
- `scripts/benchmark-architecture-kernel.mjs`
- `results/asteria_v2_g01_result.md`
- `results/asteria_v2_core_autonomous_result.md`

## Migration Strategy

`migrateV1MapToArchitectureProjectV2()` normalizes `ExportedMap` v1 only for constructing V2 records, while preserving the original input payload under `legacy.payload` so unknown legacy fields are not silently lost.

Deterministic IDs:

```text
entity:legacy:<node-id>
symbol:legacy:<node-id>:<symbol-entry-id>
relation:legacy-edge:<edge-id>
relation:contains:<parent-entity-id>:<child-entity-id>
```

Legacy visual edges become unresolved typed relations with `type = legacy_visual_edge`; labels and presentation are preserved but not interpreted as statistical semantics.

Blocks/groups become legacy entities. Legacy Symbol rows become symbols. Formula text is not auto-parsed into symbols in G01.

## Kernel Coverage

- `ArchitectureProjectV2`
- project metadata
- statistical entities
- statistical symbols
- typed relations
- semantic variants
- view projections
- legacy payload preservation
- schema parse/serialize round-trip
- reusable graph index
- upstream/downstream trace helper
- view/entity/symbol selectors
- validation warning types

## Tests

```text
npm run test:architecture-kernel
Validated Asteria 2.0 alpha.1 architecture kernel and v1 migration.
exit 0
```

```text
npm run build
exit 0
```

Build output recorded:

```text
dist/assets/index-CcbfDYLb.css 123.03 kB, gzip 24.25 kB
dist/assets/index-q1a5B35o.js 1,300.44 kB, gzip 401.32 kB
Vite chunk-size warning remains as later G05 evidence.
```

```text
time -p npm run test:regression
exit 0
real 3.25
user 3.79
sys 0.76
```

Regression chain included:

```text
npm run test:legacy-roundtrip
npm run test:architecture-kernel
npm run test:restore-safety
npm run test:block-usability
npm run test:rich-text
npm run test:image-links
npm run test:shared-server
npm run test:shared-save
```

Whitespace check:

```text
git diff --check
exit 0
```

## Benchmark

Command:

```text
npm run bench:architecture-kernel
exit 0
```

Recorded values:

```json
{"entityCount":2000,"relationCount":5000,"serializedBytes":3891022}
{"serializeAverageMs":9.056,"parseAverageMs":9.592,"indexAverageMs":3.13,"traceDepth3AverageMs":0.024,"traceDepth3EntityCount":4}
```

## Gate Checks

- G00 legacy regression remains included in cumulative regression.
- V2 schema is pure TypeScript and independent of React/browser APIs.
- Migration is deterministic.
- V1 legacy payload, Story data, variants, presentation, and unknown fields are preserved.
- Graph index/query tests pass.
- 2,000 entity / 5,000 relation synthetic benchmark shows no obvious O(N^2) degradation.
- `package.json`, `package-lock.json`, `README.md`, and `CHANGELOG.md` record `2.0.0-alpha.1`.

## Commit And Push

Target commit message:

```text
v2.0.0-alpha.1
```

The exact commit SHA is the enclosing `v2.0.0-alpha.1` commit and is reported after commit/push.

## Remaining Risks

- The main JS build chunk remains larger than Vite's default warning threshold; this is intentionally left for G05.
- G01 exposes domain APIs and tests only. User-visible Architecture interaction begins in G02.

G02_READY = YES
