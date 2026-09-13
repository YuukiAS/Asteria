# Asteria 2.0 RC.13 Graph Presentation Foundation Result

STATUS = PASS
CURRENT_VERSION = 2.0.0-rc.13
FINAL_COMMIT = cd05a0b2896026ebdc518715bb7ca3a8d1b3bd0b (`v2.0.0-rc.13`)
REMOTE_ALIGNMENT = PASS (`HEAD == origin/main`)
WORKTREE_CLEAN = YES

## Scope

GENERIC_FIX = PASS
EXAMPLE_SPECIFIC_HARDCODE_ADDED = NO
GENERIC_REGRESSION_FIXTURE = tests/browser/asteria-v2-rc.spec.ts / RC13 generic graph fixture validates lane layout, fan-in ports, and provenance chips

## Architecture Geometry

FULL_MODEL_NODE_OVERLAP_COUNT = 0
FULL_MODEL_LAYER_ORDER = PASS
FULL_MODEL_LANE_LOCALITY = PASS
FULL_MODEL_PRIMARY_LABELS = PASS
EDGE_CARD_INTERSECTION_COUNT = 0
FLOATING_ARROWHEAD_COUNT = 0
TARGET_PORT_COLLAPSE_COUNT = 0

## Lineage Geometry

LINEAGE_CONNECTOR_TOUCH_TARGET = PASS
LINEAGE_FLOATING_ARROWHEAD_COUNT = 0
LINEAGE_PORTS_INSIDE_TARGET = PASS
LINEAGE_CHIP_PATH_ASSOCIATION = PASS
LINEAGE_CHIP_CARD_COLLISION_COUNT = 0

## Generic Fixture Geometry

GENERIC_FIXTURE_NODE_OVERLAP = 0
GENERIC_FIXTURE_EDGE_CARD_INTERSECTION = 0
GENERIC_PROVENANCE_FLOATING_ARROWHEAD = 0
GENERIC_PROVENANCE_CHIP_COLLISION = 0

## Visual Self-QA

SELF_QA_ROUNDS = 2
SELF_QA_SCREENSHOTS = results/asteria_v2_rc13_graph_presentation_foundation/screenshots/
ROUND1 = PASS
ROUND2 = PASS

Required screenshot set captured for both rounds:

- roundN-cat-overview-selected-1536.png
- roundN-cat-overview-trace-1366.png
- roundN-cat-full-fit-1536.png
- roundN-original-trace-1536.png
- roundN-lineage-1536.png
- roundN-lineage-1366.png
- roundN-evidence-1536.png
- roundN-generic-layout-fixture.png
- roundN-generic-provenance-fixture.png

## Frozen Contracts

SCIENTIFIC_FIXTURES_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
MODEL_VIEW_CONTRACT_CHANGED = NO
LINEAGE_EVIDENCE_TRUTH_CHANGED = NO
DESKTOP_TAURI_FIGMA_STARTED = NO
STABLE_RELEASE_STARTED = NO

## Verification

npm run build = PASS
npm run test:regression = PASS
npm run test:architecture-rc13 = PASS
npm run bench:architecture-g05 = PASS
npm run test:browser = PASS

git diff --check = PASS

Performance summary:

- G05 stress entities = 2200
- G05 stress relations = 6200
- visible projection count = 260
- indexAverageMs = 2.691
- traceAverageMs = 2.632
- layerFocusAverageMs = 3.87

## Public Acceptance Gate

PUBLIC_ACCEPTANCE_URL = https://asteria.httpwwwcardiacnexus-ukb.com/
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_ROOT_CHECK = PASS
PUBLIC_STATUS_CHECK = PASS
PUBLIC_BROWSER_SMOKE = PASS
PUBLIC_VERSION = 2.0.0-rc.13

GPT_WORK_STARTED = NO
STABLE_RELEASE_STARTED = NO
NEXT_ACTION = CHATGPT_REVIEW_DEVELOPER_SCREENSHOTS
