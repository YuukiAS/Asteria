# Result asteria_v2_rc15_visual_system

STATUS = COMPLETE
CURRENT_VERSION = 2.0.0-rc.15
FINAL_COMMIT = v2.0.0-rc.15

## Summary

Implemented the canonical scientific graph visual system across Architecture, Lineage, Evidence, and the right inspector.

- Architecture routing is now split into logical route geometry, scored route candidates, and final visual route rendering.
- Simple relations render as soft cubic curves; obstacle routes render as simplified rounded orthogonal paths.
- Route selection scores length, bend count, backward movement, detour, third-party proximity, and port penalties.
- Lineage uses one path-derived `RelationLabelGroup` per source-target connector, with multi-relation labels grouped together.
- Evidence keeps scientific truth and IA while using lighter route grammar and selected-claim visual priority.
- Non-Architecture inspector no longer repeats the mini research-view canvas between Search and Primary Inspector.
- Graph visual scale is centralized through CSS variables.

## Required Fields

VISUAL_SYSTEM_CONFORMANCE = PASS

ARCH_ELECTRICAL_WIRING_GESTALT = PASS
ARCH_RAW_90_DEGREE_DOMINANT_ROUTE_COUNT = 0
ARCH_EXCESSIVE_DETOUR_COUNT = 0
ARCH_EDGE_CARD_INTERSECTION_COUNT = 0
ARCH_FLOATING_ARROWHEAD_COUNT = 0
ARCH_NODE_OVERLAP_COUNT = 0
ARCH_SELECTION_GEOMETRY_STABLE = PASS

LINEAGE_CONNECTOR_TOUCH_TARGET = PASS
LINEAGE_FLOATING_ARROWHEAD_COUNT = 0
LINEAGE_PORT_SEPARATION = PASS
LINEAGE_RELATION_GROUP_COUNT = 4
LINEAGE_VISUAL_CONNECTOR_COUNT = 4
LINEAGE_MULTI_RELATION_GROUPING = PASS
LINEAGE_LABEL_PATH_ASSOCIATION = PASS
LINEAGE_LABEL_CARD_COLLISION_COUNT = 0
LINEAGE_RESIZE_ALIGNMENT = PASS
LINEAGE_GESTALT = PASS

EVIDENCE_ELECTRICAL_WIRING_GESTALT = PASS
EVIDENCE_EDGE_CARD_INTERSECTION_COUNT = 0
EVIDENCE_FLOATING_ARROWHEAD_COUNT = 0
EVIDENCE_SELECTED_CARD_PRIMARY = PASS

INSPECTOR_TINY_SECTION_COUNT = 0
INSPECTOR_NESTED_VERTICAL_SCROLLBAR_COUNT = 0
PRIMARY_INSPECTOR_AFTER_SEARCH_GAP_PX = 12
PRIMARY_INSPECTOR_FIRST_SCREEN_VISIBLE = PASS

GENERIC_FIX = PASS
EXAMPLE_SPECIFIC_HARDCODE_ADDED = NO
GENERIC_REGRESSION_FIXTURE = tests/browser/asteria-v2-rc.spec.ts RC13 generic graph fixture; tests/browser/asteria-v2-rc.spec.ts RC15 generic route and provenance fixture

SELF_VISUAL_QA_ROUNDS = 3
SELF_VISUAL_QA_ARCH_ROUTE_AESTHETICS = PASS
SELF_VISUAL_QA_LINEAGE_LABEL_GRAMMAR = PASS
SELF_VISUAL_QA_EVIDENCE_ROUTE_AESTHETICS = PASS
SELF_VISUAL_QA_INSPECTOR_VERTICAL_IA = PASS
SELF_VISUAL_QA_SELECTED_FOCUS = PASS
SELF_VISUAL_QA_GESTALT = PASS
SELF_VISUAL_QA_ARROW_WEIGHT = PASS
SELF_VISUAL_QA_PRIMARY_TEXT = PASS
SELF_VISUAL_QA_MATH = PASS
SELF_VISUAL_QA_COPY = PASS
SELF_VISUAL_QA_MOTION = PASS
SELF_VISUAL_QA = PASS

SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
EVIDENCE_TRUTH_CHANGED = NO
REVIEWER_SCOPE_EXPANDED = NO

PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_ROOT_CHECK = PASS
PUBLIC_STATUS_CHECK = PASS
PUBLIC_BROWSER_SMOKE = PASS
PUBLIC_VERSION = 2.0.0-rc.15
NEXT_ACTION = CHATGPT_REVIEW_DEVELOPER_SCREENSHOTS

## Files Read

- AGENTS.md
- prompts/AGENT_RULES.md
- prompts/tasks/asteria_v2_rc15_visual_system_task.md
- docs/design/SCIENTIFIC_GRAPH_VISUAL_SYSTEM.md
- docs/operations/acceptance/RC14_HUMAN_VISUAL_REVIEW_FAILURE_2026-09-14.md
- docs/operations/development/DEVELOPER_VISUAL_SELF_QA_CONTRACT.md
- docs/operations/blackbox-audit/VISUAL_ACCEPTANCE_CONTRACT.md
- src/architecture/graphPresentation.ts
- src/architecture/viewProjection.ts
- src/components/ArchitectureWorkspace.tsx
- src/components/ArchitectureReferencePanel.tsx
- src/styles/index.css
- tests/browser/asteria-v2-rc.spec.ts

## Files Changed

- CHANGELOG.md
- README.md
- package.json
- package-lock.json
- src/app/App.tsx
- src/architecture/graphPresentation.ts
- src/architecture/viewProjection.ts
- src/components/ArchitectureWorkspace.tsx
- src/components/ArchitectureReferencePanel.tsx
- src/styles/index.css
- tests/browser/asteria-v2-rc.spec.ts
- scripts/validate-architecture-rc15.mjs
- scripts/capture-architecture-rc15-selfqa.mjs
- scripts/smoke-architecture-rc15-public.mjs
- Historical version validators and public smoke scripts updated to current version/token expectations where they are part of cumulative regression.
- results/asteria_v2_rc15_visual_system/screenshots/*.png

## Developer Visual Self-QA

Round 1 screenshots showed a visible Architecture route blocker in `round1-cat-overview-trace-1366-light.png`: one selected trace route formed an excessive U-shaped detour and read like electrical wiring.

Round 2 screenshots fixed that blocker. The Lineage screenshots showed one capsule group per connector, including `Extends | Preserves` grouped for TRACE. The Evidence inspector screenshot showed Search followed by the Primary Claim Inspector with no clipped mini canvas strip.

Round 3 was captured after tightening the route engine so a long vertical Full model relation no longer used the short dense-stack soft-curve exception. Round 3 visual review passed for Full model, 1366 light trace, Lineage, Evidence, Inspector, generic route fixture, and generic provenance fixture.

SELF_VISUAL_QA_SCREENSHOTS =

- results/asteria_v2_rc15_visual_system/screenshots/round1-cat-overview-selected-1536-dark.png
- results/asteria_v2_rc15_visual_system/screenshots/round1-cat-overview-trace-1366-light.png
- results/asteria_v2_rc15_visual_system/screenshots/round1-cat-full-fit-1536-dark.png
- results/asteria_v2_rc15_visual_system/screenshots/round1-original-trace-1536-dark.png
- results/asteria_v2_rc15_visual_system/screenshots/round1-lineage-1536-dark.png
- results/asteria_v2_rc15_visual_system/screenshots/round1-lineage-1366-dark.png
- results/asteria_v2_rc15_visual_system/screenshots/round1-evidence-1536-dark.png
- results/asteria_v2_rc15_visual_system/screenshots/round1-evidence-1366-dark.png
- results/asteria_v2_rc15_visual_system/screenshots/round1-evidence-inspector-first-screen-1366.png
- results/asteria_v2_rc15_visual_system/screenshots/round1-generic-route-fixture.png
- results/asteria_v2_rc15_visual_system/screenshots/round1-generic-provenance-fixture.png
- results/asteria_v2_rc15_visual_system/screenshots/round2-cat-overview-selected-1536-dark.png
- results/asteria_v2_rc15_visual_system/screenshots/round2-cat-overview-trace-1366-light.png
- results/asteria_v2_rc15_visual_system/screenshots/round2-cat-full-fit-1536-dark.png
- results/asteria_v2_rc15_visual_system/screenshots/round2-original-trace-1536-dark.png
- results/asteria_v2_rc15_visual_system/screenshots/round2-lineage-1536-dark.png
- results/asteria_v2_rc15_visual_system/screenshots/round2-lineage-1366-dark.png
- results/asteria_v2_rc15_visual_system/screenshots/round2-evidence-1536-dark.png
- results/asteria_v2_rc15_visual_system/screenshots/round2-evidence-1366-dark.png
- results/asteria_v2_rc15_visual_system/screenshots/round2-evidence-inspector-first-screen-1366.png
- results/asteria_v2_rc15_visual_system/screenshots/round2-generic-route-fixture.png
- results/asteria_v2_rc15_visual_system/screenshots/round2-generic-provenance-fixture.png
- results/asteria_v2_rc15_visual_system/screenshots/round3-cat-overview-selected-1536-dark.png
- results/asteria_v2_rc15_visual_system/screenshots/round3-cat-overview-trace-1366-light.png
- results/asteria_v2_rc15_visual_system/screenshots/round3-cat-full-fit-1536-dark.png
- results/asteria_v2_rc15_visual_system/screenshots/round3-original-trace-1536-dark.png
- results/asteria_v2_rc15_visual_system/screenshots/round3-lineage-1536-dark.png
- results/asteria_v2_rc15_visual_system/screenshots/round3-lineage-1366-dark.png
- results/asteria_v2_rc15_visual_system/screenshots/round3-evidence-1536-dark.png
- results/asteria_v2_rc15_visual_system/screenshots/round3-evidence-1366-dark.png
- results/asteria_v2_rc15_visual_system/screenshots/round3-evidence-inspector-first-screen-1366.png
- results/asteria_v2_rc15_visual_system/screenshots/round3-generic-route-fixture.png
- results/asteria_v2_rc15_visual_system/screenshots/round3-generic-provenance-fixture.png

## Verification Commands

- git pull --ff-only origin main: PASS, Already up to date.
- npm run build: PASS.
- npm run test:regression: PASS.
- npm run test:architecture-rc15: PASS.
- npm run bench:architecture-g05: PASS.
- npm run test:browser: PASS, 14 passed.
- git diff --check: PASS.

## Key Metrics

- Architecture trace sample: 18 edges, 15 soft cubic, 3 rounded orthogonal, 0 raw dominant orthogonal, 0 excessive detours.
- Lineage sample: 4 visual connectors, 4 relation-label groups, TRACE group has 2 labels.
- Inspector sample: tiny section count 0, nested vertical scrollbar count 0, primary after search gap 12px, duplicate mini canvas count 0.
- Performance bench: 2200 entities, 6200 relations, indexAverageMs 2.802, traceAverageMs 2.965, layerFocusAverageMs 4.4.

## Public Gate

Fixed public URL is:

```text
https://asteria.httpwwwcardiacnexus-ukb.com/
```

The fixed public gate was refreshed and verified after the version commit and push.

## Remaining Issues

None in RC15 task scope. GPT Work must not be started by this task. The next action is ChatGPT review of the developer screenshots.
