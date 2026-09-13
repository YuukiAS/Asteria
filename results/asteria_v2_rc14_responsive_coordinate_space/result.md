# Result asteria_v2_rc14_responsive_coordinate_space

STATUS = COMPLETE
CURRENT_VERSION = 2.0.0-rc.14
COORDINATE_SPACE_STRATEGY = CONTAINER_DRIVEN

## Summary

- Ran `git pull --ff-only origin main`: already up to date.
- Repaired the responsive coordinate-space mismatch generically: Lineage now measures the real canvas with `ResizeObserver`, then uses the same CSS-pixel width/height for provenance layout, SVG connectors, source/target cards, and relation chips.
- Added actual-canvas safe bounds for non-Full projection layouts so Architecture Overview cards clamp by card dimensions plus safe inset instead of relying on percentage centers alone.
- Kept Full model on its RC.13 intrinsic lane canvas/fit behavior to preserve existing lane locality and overlap guarantees.

## Required Fields

LINEAGE_CONNECTOR_TOUCH_TARGET = PASS
LINEAGE_FLOATING_ARROWHEAD_COUNT = 0
LINEAGE_PORT_SEPARATION = PASS
LINEAGE_CHIP_PATH_ASSOCIATION = PASS
LINEAGE_TARGET_SAFE_MARGIN = PASS
LINEAGE_RESIZE_ALIGNMENT = PASS

ARCH_1366_VISIBLE_CARD_CLIPPED_COUNT = 0
ARCH_1366_RIGHT_SAFE_MARGIN = PASS
ARCH_RESIZE_SAFE_BOUNDS = PASS
SELECTION_GEOMETRY_STABLE = PASS

GENERIC_PROVENANCE_RENDERED_ENDPOINT_ERROR_MAX_PX = 0.009
GENERIC_PROVENANCE_PORT_COLLAPSE_COUNT = 0
GENERIC_PROVENANCE_RESIZE_ALIGNMENT = PASS
GENERIC_ARCH_SAFE_BOUNDS = PASS

SELF_VISUAL_QA_ROUNDS = 2
SELF_VISUAL_QA_LINEAGE_ENDPOINTS = PASS
SELF_VISUAL_QA_LINEAGE_PORTS = PASS
SELF_VISUAL_QA_1366_SAFE_SPACE = PASS
SELF_VISUAL_QA_RESIZE = PASS
SELF_VISUAL_QA_GESTALT = PASS
SELF_VISUAL_QA_ARROW_WEIGHT = PASS
SELF_VISUAL_QA_PRIMARY_TEXT = PASS
SELF_VISUAL_QA_MATH = N/A
SELF_VISUAL_QA_COPY = N/A
SELF_VISUAL_QA_MOTION = PASS
SELF_VISUAL_QA = PASS

SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
EVIDENCE_TRUTH_CHANGED = NO
REVIEWER_SCOPE_EXPANDED = NO

## Numeric Browser Evidence

- Lineage 1536: `endpointErrorMax = 0.002`, `floatingArrowheadCount = 0`, `portCollapseCount = 0`, `targetSafeMargin = 57.422`.
- Lineage 1366: `endpointErrorMax = 0.006`, `floatingArrowheadCount = 0`, `portCollapseCount = 0`, `targetSafeMargin = 48.906`.
- Lineage 1536 resize return: `endpointErrorMax = 0.002`, `floatingArrowheadCount = 0`, `portCollapseCount = 0`.
- Architecture 1366 Overview: `visibleCardClippedCount = 0`, `minRightMargin = 15.8`.
- Architecture 1366 trace: `visibleCardClippedCount = 0`, `minRightMargin = 15.8`.
- Generic provenance rendered fixtures, 3/4/6 sources at 760px and 1040px: `endpointErrorMax = 0.009`, `portCollapseCount = 0`, `floatingArrowheadCount = 0`.

## Self-QA Screenshots

- `results/asteria_v2_rc14_responsive_coordinate_space/screenshots/round1-lineage-1536.png`
- `results/asteria_v2_rc14_responsive_coordinate_space/screenshots/round1-lineage-1366.png`
- `results/asteria_v2_rc14_responsive_coordinate_space/screenshots/round1-lineage-resize-return-1536.png`
- `results/asteria_v2_rc14_responsive_coordinate_space/screenshots/round1-arch-overview-1366-light.png`
- `results/asteria_v2_rc14_responsive_coordinate_space/screenshots/round1-arch-trace-1366-light.png`
- `results/asteria_v2_rc14_responsive_coordinate_space/screenshots/round1-arch-resize-return-1536.png`
- `results/asteria_v2_rc14_responsive_coordinate_space/screenshots/round1-generic-provenance-3-source-fixture.png`
- `results/asteria_v2_rc14_responsive_coordinate_space/screenshots/round1-generic-provenance-6-source-fixture.png`
- `results/asteria_v2_rc14_responsive_coordinate_space/screenshots/round2-lineage-1536.png`
- `results/asteria_v2_rc14_responsive_coordinate_space/screenshots/round2-lineage-1366.png`
- `results/asteria_v2_rc14_responsive_coordinate_space/screenshots/round2-lineage-resize-return-1536.png`
- `results/asteria_v2_rc14_responsive_coordinate_space/screenshots/round2-arch-overview-1366-light.png`
- `results/asteria_v2_rc14_responsive_coordinate_space/screenshots/round2-arch-trace-1366-light.png`
- `results/asteria_v2_rc14_responsive_coordinate_space/screenshots/round2-arch-resize-return-1536.png`
- `results/asteria_v2_rc14_responsive_coordinate_space/screenshots/round2-generic-provenance-3-source-fixture.png`
- `results/asteria_v2_rc14_responsive_coordinate_space/screenshots/round2-generic-provenance-6-source-fixture.png`

Round 1 finding: Lineage endpoints, port separation, chip association, and Architecture 1366 safe space were visually acceptable after implementation; no additional product blocker found.

Round 2 finding: resize return remained aligned, 1366 trace cards stayed inside the canvas, and generic 3/6-source provenance fixtures kept separated ports and attached chips. No Round 3 required.

## Files Read

- `AGENTS.md`
- `prompts/AGENT_RULES.md`
- `prompts/tasks/asteria_v2_rc14_responsive_coordinate_space_task.md`
- `docs/operations/development/DEVELOPER_VISUAL_SELF_QA_CONTRACT.md`
- `docs/operations/blackbox-audit/VISUAL_ACCEPTANCE_CONTRACT.md`
- `docs/operations/blackbox-audit/reports/RC13_W01_VISUAL_REAUDIT_REPORT_2026-09-13.md`
- `src/architecture/graphPresentation.ts`
- `src/architecture/viewProjection.ts`
- `src/components/ArchitectureWorkspace.tsx`
- `src/styles/index.css`
- `tests/browser/asteria-v2-rc.spec.ts`
- current RC validation, public-smoke, and self-QA scripts.

## Files Modified

- `CHANGELOG.md`
- `README.md`
- `package.json`
- `package-lock.json`
- `src/app/App.tsx`
- `src/architecture/graphPresentation.ts`
- `src/architecture/viewProjection.ts`
- `src/components/ArchitectureWorkspace.tsx`
- `src/styles/index.css`
- `tests/browser/asteria-v2-rc.spec.ts`
- `scripts/validate-architecture-rc*.mjs` version-current checks
- `scripts/smoke-architecture-rc*.mjs` version-current checks
- `scripts/validate-architecture-rc14.mjs`
- `scripts/smoke-architecture-rc14-public.mjs`
- `scripts/capture-architecture-rc14-selfqa.mjs`
- `results/asteria_v2_rc14_responsive_coordinate_space/screenshots/*.png`

## Commands

- `git pull --ff-only origin main` = PASS, already up to date.
- `npm run build` = PASS.
- `npm run test:regression` = PASS.
- `npm run test:architecture-rc14` = PASS.
- `npm run bench:architecture-g05` = PASS: `indexAverageMs = 4.303`, `traceAverageMs = 3.914`, `layerFocusAverageMs = 5.627`.
- `npm run test:browser` = PASS, 13 passed.
- `git diff --check` = PASS.
- `ASTERIA_SELF_QA_ROUND=round1 node scripts/capture-architecture-rc14-selfqa.mjs` = PASS.
- `ASTERIA_SELF_QA_ROUND=round2 node scripts/capture-architecture-rc14-selfqa.mjs` = PASS.

## Failure / Repair Notes

- `npm run build` initially failed because a route fallback array inferred `BoundaryPort[]`; fixed by explicitly typing it as plain `{ x, y }[]`.
- Early RC.14 browser regression showed Lineage chips too close to their own path / each other; fixed by deriving chip anchors from the same cubic connector geometry and spacing multiple chips along/near that connector.
- `npm run test:regression` exposed a Full model spacing regression from applying responsive fit to the Full model; fixed by restoring Full model to the RC.13 intrinsic lane canvas and fit zoom.
- RC8/RC9 browser failures were transition-timing false negatives after state or viewport changes; fixed the browser test helpers to wait for geometry/style settling before sampling.

## Public Gate

PUBLIC_ACCEPTANCE_URL_REFRESHED = PENDING_UNTIL_COMMIT_PUSH
PUBLIC_ROOT_CHECK = PENDING_UNTIL_COMMIT_PUSH
PUBLIC_STATUS_CHECK = PENDING_UNTIL_COMMIT_PUSH
PUBLIC_BROWSER_SMOKE = PENDING_UNTIL_COMMIT_PUSH
PUBLIC_VERSION = PENDING_UNTIL_COMMIT_PUSH

## Next

NEXT_ACTION = CHATGPT_REVIEW_DEVELOPER_SCREENSHOTS
