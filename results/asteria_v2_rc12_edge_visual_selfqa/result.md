# Result asteria_v2_rc12_edge_visual_selfqa

STATUS = COMPLETE
CURRENT_VERSION = 2.0.0-rc.12
FINAL_COMMIT = v2.0.0-rc.12

## Summary

Implemented the RC.12 narrow visual repair for Architecture / Lineage / Evidence relation edges and arrowheads. Edge strokes now use stable CSS-pixel widths with `vector-effect: non-scaling-stroke`; Architecture selected/trace paths are restrained at 1.9px instead of viewBox-scaled bands; Architecture markers use small fixed `userSpaceOnUse` dimensions and inherit relation stroke color through `context-stroke`.

No scientific fixtures, canonical relation truth, trace algorithm, or session contract files were changed.

## Required Fields

ARCH_BASE_EDGE_CSS_PX = 1.35
ARCH_ACTIVE_EDGE_CSS_PX = 1.9
ARCH_ACTIVE_TO_BASE_RATIO = 1.41
LINEAGE_EDGE_CSS_PX = 1.5
EVIDENCE_ACTIVE_EDGE_CSS_PX = 1.9
ARROWHEAD_VISUAL_SCALE = PASS
MODEL_CONTEXT_SELECT_RIGHT_PANEL_COHERENT = PASS
SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO

SELF_VISUAL_QA_ROUNDS = 2
SELF_VISUAL_QA_SCREENSHOTS =
- results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round1-cat-overview-selected-1536.png
- results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round1-cat-overview-trace-1366.png
- results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round1-lineage-1536.png
- results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round1-evidence-1536.png
- results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round1-model-selector-cat.png
- results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round1-model-selector-original.png
- results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round2-cat-overview-selected-1536.png
- results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round2-cat-overview-trace-1366.png
- results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round2-cat-full-fit-1536.png
- results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round2-lineage-1536.png
- results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round2-evidence-1536.png
- results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round2-model-selector-cat.png
- results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round2-model-selector-original.png

SELF_VISUAL_QA_GESTALT = PASS
SELF_VISUAL_QA_ARROW_WEIGHT = PASS
SELF_VISUAL_QA_PRIMARY_TEXT = PASS
SELF_VISUAL_QA_MATH = PASS
SELF_VISUAL_QA_COPY = PASS
SELF_VISUAL_QA_MOTION = PASS
SELF_VISUAL_QA = PASS

PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_ROOT_CHECK = PASS
PUBLIC_STATUS_CHECK = PASS
PUBLIC_BROWSER_SMOKE = PASS
PUBLIC_VERSION = 2.0.0-rc.12
NEXT_ACTION = CHATGPT_REVIEW_DEVELOPER_SCREENSHOTS

## Self Visual QA

Round 1:
- Checked the six required screenshots after the first CSS-pixel stroke and fixed-marker implementation.
- Findings: Architecture no longer showed RC.11-style inflated viewBox strokes, but the 1366 light trace state and Evidence selected connector still felt slightly too strong near the selected card. Architecture marker opacity and size could be smaller to avoid endpoint emphasis.

Round 2:
- Reduced Architecture active stroke to 1.9px, reduced Architecture marker to 0.95 viewBox units with `markerUnits="userSpaceOnUse"`, and lowered marker opacity.
- Re-captured and inspected the six required screenshots plus Full model/Fit. Active paths now read moderately stronger than ordinary context, selected nodes remain the focal objects, incoming edges remain separable, and CAT / Original TRACE selector state is coherent across top context, top select, right buttons, and central title/status.

## Files Read

- AGENTS.md
- prompts/AGENT_RULES.md
- prompts/tasks/asteria_v2_rc12_edge_visual_selfqa_task.md
- docs/operations/development/DEVELOPER_VISUAL_SELF_QA_CONTRACT.md
- docs/operations/acceptance/RC11_PRE_WORK_VISUAL_REVIEW_FAILURE_2026-09-13.md
- docs/operations/blackbox-audit/VISUAL_ACCEPTANCE_CONTRACT.md
- src/components/ArchitectureWorkspace.tsx
- src/styles/index.css
- tests/browser/asteria-v2-rc.spec.ts
- scripts/validate-architecture-rc11.mjs

## Files Changed

- CHANGELOG.md
- README.md
- package.json
- package-lock.json
- src/app/App.tsx
- src/components/ArchitectureWorkspace.tsx
- src/styles/index.css
- scripts/validate-architecture-rc4.mjs
- scripts/validate-architecture-rc5.mjs
- scripts/validate-architecture-rc6.mjs
- scripts/validate-architecture-rc7.mjs
- scripts/validate-architecture-rc8.mjs
- scripts/validate-architecture-rc9.mjs
- scripts/validate-architecture-rc11.mjs
- scripts/validate-architecture-rc12.mjs
- scripts/capture-architecture-rc12-selfqa.mjs
- scripts/smoke-architecture-rc12-public.mjs
- tests/browser/asteria-v2-rc.spec.ts
- results/asteria_v2_rc12_edge_visual_selfqa/screenshots/*.png
- results/asteria_v2_rc12_edge_visual_selfqa/result.md

## Verification

- git pull --ff-only origin main: PASS
- npm run build: PASS
- npm run test:regression: PASS
- npm run test:architecture-rc12: PASS
- npm run bench:architecture-g05: PASS
  - entityCount = 2200
  - relationCount = 6200
  - visibleProjectionCount = 260
  - indexAverageMs = 3.161
  - traceAverageMs = 3.224
  - layerFocusAverageMs = 4.464
- npm run test:browser: PASS, 10 passed
- git diff --check: PASS
- curl -sS --max-time 10 http://127.0.0.1:5174/api/asteria/status: PASS
- curl -sS --max-time 20 https://asteria.httpwwwcardiacnexus-ukb.com/api/asteria/status: PASS
- curl -sS --max-time 20 -D - https://asteria.httpwwwcardiacnexus-ukb.com/: PASS, HTTP 200
- npm run smoke:public-rc12: PASS

## Scope

SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
REVIEWER_SCOPE_EXPANDED = NO
GPT_WORK_CREATED = NO
STABLE_RELEASED = NO
