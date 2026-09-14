# Asteria 2.0 RC.16 Connector Finish Result

STATUS = COMPLETE
CURRENT_VERSION = 2.0.0-rc.16
TASK = prompts/tasks/asteria_v2_rc16_connector_finish_task.md

## Scope

SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
EVIDENCE_TRUTH_CHANGED = NO
ARCH_LAYOUT_CHANGED = MINIMAL_ROUTE_CLEARANCE_ONLY
REVIEWER_SCOPE_EXPANDED = NO

## Implementation Result

- Replaced Architecture and Lineage/Evidence arrowheads with the canonical open chevron marker.
- Added terminal stub geometry so source departure and target arrival are normal to the selected card side.
- Added route scoring and filtering for edge-edge crossings, card-border hugging, terminal angle, and region/corridor changes.
- Treated previously routed visible edges as soft obstacles during deterministic routing.
- Preserved only direct soft-cubic routes that pass rendered curve obstacle sampling; obstacle/fallback routes keep rounded-orthogonal interior points.
- Added obstacle-aware Architecture relation-label normal offsets.
- Changed Lineage multi-relation labels from literal separators to adjacent capsule parts.
- Removed stable-facing static footer/placeholder legend text from Lineage and Evidence.
- Applied minimal CAT overview clearance slot tuning for right-column context nodes.

## Hard Gates

FILLED_TRIANGLE_MARKER_COUNT = 0
CANONICAL_OPEN_CHEVRON = PASS
ARROW_SHAPE_CONSISTENT_ACROSS_VIEWS = PASS
ACTIVE_ARROW_SIZE_EQUALS_BASE = PASS

EDGE_CARD_BORDER_HUG_COUNT = 0
NONTERMINAL_CARD_CLEARANCE_FAIL_COUNT = 0
TERMINAL_NORMAL_ANGLE_FAIL_COUNT = 0
SOURCE_DEPARTURE_ANGLE_FAIL_COUNT = 0
ARROW_CARD_PENETRATION_COUNT = 0
FLOATING_ARROWHEAD_COUNT = 0
PORT_COLLAPSE_COUNT = 0

ARCH_AVOIDABLE_EDGE_EDGE_CROSSING_COUNT = 0
EVIDENCE_AVOIDABLE_EDGE_EDGE_CROSSING_COUNT = 0
GENERIC_AVOIDABLE_EDGE_EDGE_CROSSING_COUNT = 0
ARCH_REGION_CHANGE_FAIL_COUNT = 0
EVIDENCE_REGION_CHANGE_FAIL_COUNT = 0

STATIC_CATEGORY_FOOTER_COUNT = 0
PLACEHOLDER_LEGEND_LABEL_COUNT = 0

## Developer Screenshot Self-QA

SELF_VISUAL_QA = PASS
SELF_QA_ROUNDS = 2

Round 1:

- results/asteria_v2_rc16_connector_finish/screenshots/round1/cat-overview-selected-1536-dark.png
- results/asteria_v2_rc16_connector_finish/screenshots/round1/cat-overview-trace-1366-light.png
- results/asteria_v2_rc16_connector_finish/screenshots/round1/cat-full-fit-1536-dark.png
- results/asteria_v2_rc16_connector_finish/screenshots/round1/original-trace-1536-dark.png
- results/asteria_v2_rc16_connector_finish/screenshots/round1/lineage-1536-dark.png
- results/asteria_v2_rc16_connector_finish/screenshots/round1/lineage-1366-dark.png
- results/asteria_v2_rc16_connector_finish/screenshots/round1/evidence-1536-dark.png
- results/asteria_v2_rc16_connector_finish/screenshots/round1/architecture-selected-card-contact-closeup.png
- results/asteria_v2_rc16_connector_finish/screenshots/round1/evidence-card-contact-closeup-top.png
- results/asteria_v2_rc16_connector_finish/screenshots/round1/evidence-card-contact-closeup-bottom.png
- results/asteria_v2_rc16_connector_finish/screenshots/round1/evidence-right-column-vertical-contact-closeup.png
- results/asteria_v2_rc16_connector_finish/screenshots/round1/lineage-trace-multi-relation-group-closeup.png

Round 2:

- results/asteria_v2_rc16_connector_finish/screenshots/round2/cat-overview-selected-1536-dark.png
- results/asteria_v2_rc16_connector_finish/screenshots/round2/cat-overview-trace-1366-light.png
- results/asteria_v2_rc16_connector_finish/screenshots/round2/cat-full-fit-1536-dark.png
- results/asteria_v2_rc16_connector_finish/screenshots/round2/original-trace-1536-dark.png
- results/asteria_v2_rc16_connector_finish/screenshots/round2/lineage-1536-dark.png
- results/asteria_v2_rc16_connector_finish/screenshots/round2/lineage-1366-dark.png
- results/asteria_v2_rc16_connector_finish/screenshots/round2/evidence-1536-dark.png
- results/asteria_v2_rc16_connector_finish/screenshots/round2/architecture-selected-card-contact-closeup.png
- results/asteria_v2_rc16_connector_finish/screenshots/round2/evidence-card-contact-closeup-top.png
- results/asteria_v2_rc16_connector_finish/screenshots/round2/evidence-card-contact-closeup-bottom.png
- results/asteria_v2_rc16_connector_finish/screenshots/round2/evidence-right-column-vertical-contact-closeup.png
- results/asteria_v2_rc16_connector_finish/screenshots/round2/lineage-trace-multi-relation-group-closeup.png

Self-QA answers for the final screenshots:

- 有没有线沿 card 边贴着走？NO
- 箭头是不是只有 tip 接触 card？YES
- terminal 是否近似垂直？YES
- 有没有明显可避免 crossing？NO
- 有没有无意义跨上下区域绕行？NO

## Verification

- git pull --ff-only origin main = PASS, already up to date before work
- npm run build = PASS
- npm run test:regression = PASS
- npm run test:architecture-rc16 = PASS
- npm run bench:architecture-g05 = PASS
- npm run test:browser = PASS, 15 passed
- git diff --check = PASS

Performance:

- bench:architecture-g05 entityCount = 2200
- bench:architecture-g05 relationCount = 6200
- bench:architecture-g05 visibleProjectionCount = 260
- bench:architecture-g05 indexAverageMs = 2.366
- bench:architecture-g05 traceAverageMs = 2.536
- bench:architecture-g05 layerFocusAverageMs = 3.542

Note:

- The final browser/regression runs updated historical RC11 screenshot files as test artifacts. They are included as generated regression evidence because restoring them was blocked by local safety policy.

NEXT_ACTION = CHATGPT_REVIEW_DEVELOPER_SCREENSHOTS
