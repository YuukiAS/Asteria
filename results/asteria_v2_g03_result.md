# Result asteria_v2_g03

status: completed

## Execution Summary

G03 upgraded the G02 direct Symbol Trace into a typed architecture reading surface: stable semantic relation values, configurable layer definitions, cycle-safe recursive trace, layer focus projection, Architecture Outline generation, relation-type search, and edge semantic metadata.

Version:

```text
2.0.0-beta.1
```

## Read Files

- `AGENTS.md`
- `prompts/AGENT_RULES.md`
- `ROADMAP.md`
- `VERSIONING.md`
- `docs/notes/2026-09-09_asteria_v2_web_delivery_plan.md`
- `docs/notes/2026-09-09_trace_and_cat_trace_reference_for_asteria_v2.md`
- `prompts/tasks/asteria_v2_g03_task.md`
- `docs/notes/goal_specs/asteria_v2_g03_goal_spec.md`
- `results/asteria_v2_g02_result.md`
- current architecture domain, Canvas, EdgeInspector, Inspector, and search implementation

## Modified Files

- `package.json`
- `package-lock.json`
- `CHANGELOG.md`
- `README.md`
- `src/types/map.ts`
- `src/lib/exportImport.ts`
- `src/lib/mapSearch.ts`
- `src/architecture/types.ts`
- `src/architecture/relationTypes.ts`
- `src/architecture/layers.ts`
- `src/architecture/trace.ts`
- `src/architecture/projection.ts`
- `src/architecture/outline.ts`
- `src/architecture/migration.ts`
- `src/architecture/validationTypes.ts`
- `src/architecture/fixtures/canonicalTraceFixtures.ts`
- `src/components/ArchitectureReferencePanel.tsx`
- `src/components/EdgeInspector.tsx`
- `src/styles/index.css`
- `scripts/validate-architecture-kernel.mjs`
- `scripts/validate-architecture-g03.mjs`
- `scripts/benchmark-architecture-g03.mjs`
- `results/asteria_v2_g03_result.md`
- `results/asteria_v2_core_autonomous_result.md`

## Relation Schema

Stable relation values now include:

```text
measured_as, preprocessed_into, aggregated_into, matched_to, derived_from,
indexed_by, generates, depends_on, parameterized_by, transforms_to,
constrained_by, conditions_on, marginalizes_to, factorizes_as, estimated_by,
optimizes, solves, approximated_by, regularized_by, identified_by,
uncertainty_quantified_by, targets, predicts, supports, tests, validated_on,
limited_by, contradicts, causes
```

Legacy visual edges migrate as `type = unresolved` with `unresolved = true`; their presentation is preserved separately under `presentation`. Existing React Flow edges now expose optional `semanticType` metadata in the Edge Inspector, while line style/color/path remain appearance controls.

## Architecture Outline Example

CAT-TRACE Frozen V2 outline is generated from entity IDs grouped by canonical layer. The test asserts the presence of:

```text
target
observation
measurement
latent
parameterization
inference
```

Outline rows reference entity IDs and use the symbol registry for selection; definitions are not copied into the outline.

## Tests

```text
npm run test:architecture-g03
Validated G03 typed relations, recursive trace, layer focus, outline, and relation search.
exit 0
```

```text
npm run test:architecture-kernel
Validated Asteria 2.0 alpha.1 architecture kernel and v1 migration.
exit 0
```

```text
npm run test:canonical-trace
Validated Original TRACE and CAT-TRACE Frozen V2 canonical fixtures and direct trace.
exit 0
```

```text
npm run build
exit 0
```

Build output recorded:

```text
dist/assets/index-BB1kWuNH.css 130.78 kB, gzip 24.92 kB
dist/assets/index-vAY1VIbS.js 1,333.82 kB, gzip 409.75 kB
Vite chunk-size warning remains as later G05 evidence.
```

```text
time -p npm run test:regression
exit 0
real 4.57
user 5.30
sys 1.02
```

Whitespace check:

```text
git diff --check
exit 0
```

## Stress Evidence

Command:

```text
npm run bench:architecture-g03
exit 0
```

Recorded values:

```json
{"entityCount":2200,"relationCount":6200}
{"indexAverageMs":3.633,"traceAverageMs":3.433,"layerFocusAverageMs":6.448}
```

## Gate Checks

- Semantic relation type is separated from visual edge presentation.
- Legacy visual edges remain unresolved and preserve presentation.
- Relation-type search respects active-version edge visibility.
- Causal relation is explicit-only; ordinary dependencies are not promoted to `causes`.
- Recursive trace is cycle-safe and depth-limited.
- Layer focus includes directly connected boundary nodes and does not mutate project data.
- Architecture Outline is generated from layers/entity IDs and supports selection lookup.
- Original TRACE outline excludes CAT-TRACE catalogue/grouped-tail objects.
- CAT-TRACE outline covers target, observed, measurement, latent, parameterization, and inference layers.
- Story Outline round-trip remains covered.
- `package.json`, `package-lock.json`, `README.md`, and `CHANGELOG.md` record `2.0.0-beta.1`.

## Commit And Push

Target commit message:

```text
v2.0.0-beta.1
```

The exact commit SHA is the enclosing `v2.0.0-beta.1` commit and is reported after commit/push.

## Remaining Risks

- Architecture Outline is currently in the Architecture sidebar; deeper canvas-native camera selection can be expanded during G05 polish.
- Full browser screenshot evidence remains assigned to G05/G06 because no browser/Playwright MCP tool was available when checked in G02.
- The main JS build chunk remains larger than Vite's default warning threshold.

G04_READY = YES
