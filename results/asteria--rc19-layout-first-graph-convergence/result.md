# Result: asteria--rc19-layout-first-graph-convergence

STATUS = COMPLETE
CURRENT_VERSION = 2.0.0-rc.19
FINAL_COMMIT = 4c32c42236b4a601fbb2d31e265200cbb90b57b4

AI_SKILLS_FORMAL_RELEASE = yuukias-ai-skills installed; marketplace upgrade reported no available upgrade
AI_SKILLS_MAINTAINER_VERSION = ai-skills-core 0.5
FRONTEND_DESIGN_VERSION = web-development 0.4 / frontend-visual-systems coordinator-first
BRIDGE_FORMAL_RELEASE = GPT_Codex_AI_Bridge_Kit 0.9.3; origin/release 9dad0ba
BRIDGE_RUNTIME_VERSION = ai-bridge from /home/yuukias/GPT_Codex_AI_Bridge_Kit; package version 0.9.3
BRIDGE_PROJECT_VALIDATE = PASS; 0 errors, 43 legacy warnings

TRACE_OFF_VISIBLE_NODE_COUNT_SEQUENCE = [16, 16, 16, 16, 16]
TRACE_OFF_SHARED_NODE_MAX_DELTA_PX = 0
TRACE_OFF_EDGE_PATH_CHANGE_COUNT = 0

ROUTE_GESTALT = PASS
AVOIDABLE_EDGE_CROSSING_COUNT = 0
LONG_DETOUR_COUNT = 0
NON_MONOTONE_ARCH_EDGE_COUNT = 0
ORTHOGONAL_MULTI_BEND_EDGE_COUNT = 0
FLOATING_RELATION_LABEL_COUNT = 0
SIMPLE_ARCH_EDGE_MAX_ROUTE_RATIO = 1.22 rendered / 1.18 static validator
ARCH_EDGE_P95_ROUTE_RATIO = 1.22 rendered / 1.18 static validator

FULL_MODEL_PRIMARY_TEXT_MIN_CSS_PX = 10
FULL_MODEL_HORIZONTAL_UTILIZATION = 0.97
FULL_MODEL_NODE_OVERLAP_COUNT = 0
FULL_MODEL_PRIMARY_TEXT_CLIPPED_COUNT = 0

INSPECTOR_READER_RAW_MATH_TOKEN_COUNT = 0

GENERIC_FIX = PASS
EXAMPLE_SPECIFIC_HARDCODE_ADDED = NO
VISUAL_SYSTEM_CONFORMANCE = PASS
SELF_VISUAL_QA_ROUNDS = 2+
SELF_VISUAL_QA = PASS
VISUAL_REVIEW_PACK = results/asteria--rc19-layout-first-graph-convergence/VISUAL_REVIEW_PACK.md
GPT_WORK_PROMPT_PATH = prompts/reviewers/ASTERIA_GPT_WORK_PARENT_ACCEPTANCE_RC19.md

PUBLIC_ACCEPTANCE_URL_REFRESHED = YES; fixed public URL observed rc19
PUBLIC_BROWSER_SMOKE = PASS
PUBLIC_VERSION = 2.0.0-rc.19

SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
CAT_TRACE_BRIDGE_CONTRACT_CHANGED = NO

NEXT_ACTION = GPT_WORK_SINGLE_PARENT_ACCEPTANCE

## Summary

RC19 replaces route-first graph presentation with layout-first presentation surfaces:

- Architecture uses semantic lane buckets, relation-aware ordering, compact overview packing, readable full-model reset, and smooth layered edge routes.
- Lineage uses a Source / Relation / Target provenance grammar with a stable relation column and synthetic 3/6-source fixtures.
- Evidence uses claim-centered component placement and direct smooth routes instead of global obstacle routing.
- Inspector reader prose now renders common math tokens inline instead of exposing raw `a_g`, `v^U_gh`, `R^q`, `nu_g`, and similar identifiers.

The implementation did not modify CAT-TRACE scientific truth, TRACE algorithms, session contracts, or CAT-TRACE repository contents.

## Producer Visual QA

Fresh screenshots are embedded in:

`results/asteria--rc19-layout-first-graph-convergence/VISUAL_REVIEW_PACK.md`

Actual reviewed states include 1536 dark / 1366 light Architecture overview, trace-off selection sequence, explicit trace-on, Full model reset, Original TRACE, Lineage, Evidence selected states, a synthetic layered graph, and synthetic 3/6-source Lineage fixtures.

Round 1 repaired: 1366 overview clipping, Original TRACE detour loops, residual route-first geometry.

Round 2 repaired: trace-on overview adjacent-lane overlap and compact overview math-token overflow.

## Commands

- `git pull --ff-only origin main` - PASS
- `codex plugin marketplace upgrade yuukias-ai-skills --json` - PASS, no upgrade available
- `codex plugin list` - PASS
- `ai-bridge validate` - PASS, 0 errors / 43 legacy warnings
- `npm run capture:architecture-rc19` - PASS
- `npx playwright test --grep "RC9 human visual acceptance|RC15 canonical scientific graph visual system|RC19 layout-first"` - PASS, 3/3
- `npm run test:browser` - PASS, 18/18
- `npm run test:architecture-rc19` - PASS
- `npm run build` - PASS
- `npm run bench:architecture-g05` - PASS; indexAverageMs 3.65, traceAverageMs 3.763, layerFocusAverageMs 5.477
- `npm run test:cat-trace-bridge` - PASS; schemaVersion 0.1.0, sourceCommit 628ed400670140c8557234e5c49bf3526d241214
- `git diff --check` - PASS
- `npm run test:architecture-rc3` - PASS after updating the validator to layout-first ordering semantics
- `npm run test:architecture-rc9` - PASS after updating the validator to generic lane layout semantics
- `npm run test:architecture-rc11` - PASS after updating the validator to compact overview semantics
- `npm run test:architecture-rc13` - PASS after updating the validator to `routeLayeredEdge`
- `npm run test:architecture-rc18` - PASS after updating the validator to relation-aware full-model packing
- `npm run test:regression` - PASS
- `npm run smoke:public-rc19` - PASS; observedVersion 2.0.0-rc.19
- `curl -sS --max-time 20 -D - https://asteria.httpwwwcardiacnexus-ukb.com/` - PASS, HTTP 200
- `curl -sS --max-time 20 https://asteria.httpwwwcardiacnexus-ukb.com/api/asteria/status` - PASS

## Public URL Evidence

Fixed public URL:

`https://asteria.httpwwwcardiacnexus-ukb.com/`

Public smoke reported:

```json
{
  "status": "public-smoke-pass",
  "observedVersion": "2.0.0-rc.19",
  "metrics": {
    "edgeCount": 8,
    "longDetourCount": 0,
    "nonMonotoneCount": 0,
    "orthogonalMultiBendCount": 0,
    "floatingRelationLabelCount": 0,
    "maxRouteRatio": 1.13,
    "p95RouteRatio": 1.13,
    "relationCardCount": 0
  },
  "mathTokenRendered": 3
}
```

## GPT Work Handoff

Only one user-facing GPT Work prompt was prepared:

`prompts/reviewers/ASTERIA_GPT_WORK_PARENT_ACCEPTANCE_RC19.md`

The parent prompt is self-contained, includes the full Browser contract exactly once, and internally scopes W01 + W05 + W06. GPT Work was not launched.
