---
task_key: "asteria--rc19-layout-first-graph-convergence"
task_id: asteria_v2_rc19_layout_first_graph_convergence
project: "Asteria"
status: "READY"
task_type: "execution"
controller_mode: false
planner: "ChatGPT/GPT thread"
strategic_controller: "user-supervised GPT thread"
executor: "Codex executor session"
auditor: "single parent GPT Work after producer self-QA"
risk_level: "medium"
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
review_required: true
mechanism_class: "frontend-visual-system"
promotion_gate: "formal toolchain aligned; final screenshots visually clean; focused regressions pass; fixed public RC refreshed"
failure_escalation_policy: "Stop with NEEDS_GPT_PLANNER only if scientific semantics, trace semantics, or session persistence must change. If plugin/runtime alignment requires session restart, stop with RESTART_REQUIRED before product edits."
forbidden_substitutes:
  - "Do not solve the screenshots by only hiding arrows/labels."
  - "Do not keep the generic global obstacle router as the primary stable Architecture/Evidence renderer."
  - "Do not hardcode CAT-TRACE entity IDs/coordinates to make the current examples pass."
  - "Do not claim visual PASS from bbox/collision/route metrics without inspecting screenshots."
  - "Do not hand obvious connector ugliness to GPT Work."
required_evidence:
  - "formal AI Skills/Frontend Design/Bridge identities"
  - "Bridge project validate PASS"
  - "fresh final VISUAL_REVIEW_PACK.md"
  - "layout-first route metrics"
  - "selection invariance evidence"
  - "Full-model readable-reset evidence"
allowed_next_states:
  - "GPT_WORK_SINGLE_PARENT_ACCEPTANCE"
  - "NEEDS_GPT_PLANNER"
  - "RESTART_REQUIRED"
auto_git_commit: true
auto_git_push: true
---

# Goal

Replace RC.18's route-first graph presentation with a **layout-first scientific diagram system** and close the remaining RC.18 W01 findings.

The user's complaint is not “arrowheads are wrong.” The complaint is that the lines themselves still look mechanically routed and visually bad.

This task must make Architecture / Lineage / Evidence look intentionally designed before any GPT Work sees them.

Do not release stable.
Do not start GPT Work.
Do not ask the user to do first-pass visual QA.

## 0. Sync + mandatory toolchain alignment

1. `git pull --ff-only origin main`.
2. Read:
   - `AGENTS.md`
   - `prompts/AGENT_RULES.md`
   - `prompts/CHATGPT_RULES.md`
   - `docs/design/SCIENTIFIC_GRAPH_VISUAL_SYSTEM.md`
   - `docs/operations/development/DEVELOPER_VISUAL_SELF_QA_CONTRACT.md`
   - `docs/operations/blackbox-audit/VISUAL_ACCEPTANCE_CONTRACT.md`
   - `prompts/tasks/asteria_v2_rc18_parent_acceptance_review.md`
3. Inspect current RC.18 production source and public UI.

Before product edits, use the installed **AI Skills Maintainer** normal entry to discover/sync formal releases for:

- AI Skills Collection;
- AI Skills Maintainer;
- Frontend Design / `web-development`;
- Bridge Kit.

Then validate the existing Asteria Bridge scaffold through the current formal `ai-bridge` project path.

Do not assume public planning-time versions are still current.
Do not treat Bridge `main` source candidate as formal distribution unless the maintainer says it is formal.

Return:

```text
AI_SKILLS_FORMAL_RELEASE =
AI_SKILLS_MAINTAINER_VERSION =
FRONTEND_DESIGN_VERSION =
BRIDGE_FORMAL_RELEASE =
BRIDGE_RUNTIME_VERSION =
BRIDGE_PROJECT_VALIDATE = PASS | FAIL
```

If plugin/runtime is actually upgraded and the current session cannot consume the new loaded plugin/runtime identity, stop before product edits:

`NEXT_ACTION = RESTART_REQUIRED`.

## 1. Frontend Design owns convergence

Use installed Frontend Design normal entry:

`frontend-visual-systems`

Coordinator-first.

This is a research-product graph-presentation redesign inside already frozen scientific semantics.

No Figma requirement should be invented.

Producer must iterate until screenshot-level P1=0 and P2=0 for this task.

## 2. Replace route-first Architecture with layout-first layered DAG

Current failure mode: fixed/packed nodes are followed by a generic obstacle router that creates long orthogonal detours and snake paths.

Do not merely retune penalties.

Implement a generic Architecture presentation pipeline:

```text
semantic layers
-> lane buckets
-> crossing-minimized node ordering
-> vertical placement / separation
-> stable ports
-> simple monotone connectors
-> local avoidance only if unavoidable
```

### 2.1 Node ordering

For each semantic lane:

- derive initial order from canonical projection position;
- run bounded barycentric/median sweeps using adjacent-lane neighbors to reduce crossings;
- preserve deterministic tie-breaking;
- maintain minimum vertical card gap;
- do not use entity-id-specific visual branches.

Use at least one synthetic different-structure fixture to prove genericity.

### 2.2 Connector grammar

For ordinary left->right Architecture relations:

- use smooth monotone cubic / spline;
- x should not backtrack;
- no hard 90° path by default;
- no global top/bottom detour;
- target/source port should be selected from layout flow, not nearest-point opportunism.

For non-adjacent lanes:

- pass through lane-gutter waypoints;
- render the result as a smooth spline;
- do not expose waypoint geometry as electrical wiring.

Only when a direct/gutter curve actually intersects a third-party card may the renderer use **short local avoidance**.

A local avoidance route may not cross half the canvas.

### 2.3 Relation meaning must not disappear

Do not solve clutter by deleting relationship information.

Architecture default:

- structural connectors remain visible;
- normal left->right flow gives the basic direction;
- Inspector always exposes full typed incoming/outgoing relations.

Architecture explicit Trace:

- active relations may show a tiny direction terminal;
- active relations may show concise labels;
- labels must occupy a dedicated lane-gutter label layer, not float directly on the curve;
- context edges remain label-free.

Reverse/same-lane relations may use a tiny direction cue even outside Trace only when direction would otherwise be ambiguous.

## 3. Make selection invariant literally true

Trace OFF ordinary selection must not affect layout inputs.

Remove `selectedEntityId` from Overview visible-set/layout derivation.

Required sequence at 1366 Light:

Open-tail occurrence
-> Group open-tail intensity
-> Open-tail slope
-> Catalogue match

while trace stays OFF.

Required:

```text
TRACE_OFF_VISIBLE_NODE_COUNT_SEQUENCE = constant
TRACE_OFF_SHARED_NODE_MAX_DELTA_PX <= 1
TRACE_OFF_EDGE_PATH_CHANGE_COUNT = 0
```

If explicit Trace reveal requires extra context, only `traceEntityIds` / explicit focus state may change the visible set.

## 4. Rebuild Lineage as a three-column provenance figure

Do not use floating labels attached to arbitrary path normals.

Use a generic layout:

```text
SOURCE CARD | RELATION COLUMN | TARGET CARD
```

For each source row:

- source card left;
- stable relation summary group in the middle column;
- target card right;
- short smooth connector source -> relation group -> target.

Examples are fixtures only:

- HMSC -> [Ecological hierarchy] -> CAT-TRACE
- TRACE -> [Extends] [Preserves] -> CAT-TRACE
- bigMVP -> [Scalable probit] -> CAT-TRACE
- MGP -> [Factor shrinkage] -> CAT-TRACE

The mechanism must work for 3/4/6 sources.

No relation text may float at arbitrary positions along a curve.

One restrained target direction cue is allowed per row if Frontend Design judges it useful; do not create arrow fields.

Full typed relation remains in Method Inspector.

## 5. Rebuild Evidence as claim-centered components

Do not send Evidence relations through the generic global obstacle router.

Generic algorithm:

1. find weak relation components;
2. identify claim anchors;
3. place support/proof/dataset/implementation neighbors around the claim on the support side;
4. place limitation/pending/downstream claim objects on the downstream side;
5. order nodes to minimize crossings;
6. use direct smooth curves;
7. use only short local avoidance when a curve would hit a card.

Hard rules:

- no relation may go to the top/bottom of the entire canvas and return merely to avoid a nearby card;
- no long orthogonal staircase;
- no unnecessary region crossing;
- selected object may emphasize incident connectors;
- typed relation text remains available in Claim Inspector.

## 6. Full model is readable exploration, not fit-all miniature

Pass the **actual rendered canvas width** into the Full-model lane layout.

Do not use the fixed 1000px presentation width as the packing authority.

Use lane ordering from Section 2.

Default/reset:

- readable scale >= 0.9;
- center useful content;
- use >= 78% of available horizontal canvas where structurally possible;
- keep symbol/title readable;
- pan/zoom for exploration.

If true fit-all would require unreadable scale, remove/rename the current `Fit` primary behavior to `Reset` / `Center`. A secondary fit-all may exist only if explicitly labeled as navigation overview.

Required:

```text
FULL_MODEL_PRIMARY_TEXT_MIN_CSS_PX >= 9.5
FULL_MODEL_HORIZONTAL_UTILIZATION >= 0.78
FULL_MODEL_NODE_OVERLAP_COUNT = 0
FULL_MODEL_PRIMARY_TEXT_CLIPPED_COUNT = 0
```

## 7. Close RC.18 Inspector math finding

Normal reader-facing Inspector prose must render common mathematical tokens consistently.

Do not expose raw `a_g`, `v^U_gh`, `R^q`, `nu_g`, etc. in normal Meaning / Why it matters / Constraints / relation prose when they are mathematical identifiers.

Implement a small reusable inline math-token renderer for reader-facing prose.

Machine-readable Advanced metadata/export may stay raw when explicitly disclosed.

## 8. Route quality gates

Add focused regression for the **shape** of routes, not only collision counts.

Return at least:

```text
ROUTE_GESTALT = PASS
AVOIDABLE_EDGE_CROSSING_COUNT = 0
LONG_DETOUR_COUNT = 0
NON_MONOTONE_ARCH_EDGE_COUNT = 0
ORTHOGONAL_MULTI_BEND_EDGE_COUNT = 0
FLOATING_RELATION_LABEL_COUNT = 0
SIMPLE_ARCH_EDGE_MAX_ROUTE_RATIO <= 1.30
ARCH_EDGE_P95_ROUTE_RATIO <= 1.45
```

Retain endpoint/card-contact regressions.

The numbers are gates, not substitutes for screenshot judgement.

## 9. Mandatory producer screenshots — this is a completion gate

Do not report COMPLETE until you actually view the exact final screenshots.

Create:

`results/asteria--rc19-layout-first-graph-convergence/VISUAL_REVIEW_PACK.md`

It must directly embed fresh screenshots.

Minimum states:

1. Architecture Overview 1536 Dark trace OFF.
2. Architecture Overview 1366 Light trace OFF.
3. selection-only sequence final state.
4. explicit Trace ON with relation labels/direction cues.
5. Architecture Full model default/reset 1536.
6. Architecture Full model default/reset 1366.
7. Original TRACE.
8. Lineage 1536.
9. Lineage 1366.
10. Evidence default 1536.
11. Evidence selected claim/dataset/limitation.
12. one synthetic generic layered-graph fixture.
13. one synthetic 3/6-source Lineage fixture.

For every screenshot record:

- actual state;
- what you visually inspected;
- one honest visual observation.

You must explicitly answer:

- Are any routes obviously crooked/needlessly long?
- Does any edge look like electrical wiring?
- Is any relation text floating arbitrarily on a curve?
- Does Lineage look like a clean Source/Relation/Target figure?
- Does Evidence look claim-centered rather than auto-routed?
- Does Full model remain readable?
- Does selection-only preserve the map?

If any answer is bad, continue repair and recapture. GPT Work must not be the first place these are found.

## 10. Tests

Add `npm run test:architecture-rc19`.

Run at minimum:

```bash
npm run test:architecture-rc19
npm run test:regression
npm run test:browser
npm run build
npm run bench:architecture-g05
npm run test:cat-trace-bridge
git diff --check
```

## 11. Version/public candidate

If producer self-QA passes:

- version `2.0.0-rc.19`;
- update package/README/CHANGELOG;
- commit + push under standing authorization;
- HEAD == origin/main;
- worktree clean;
- refresh only fixed public URL;
- public status/root/browser smoke PASS.

## 12. Exactly one GPT Work prompt

Prepare but do not run:

`prompts/reviewers/ASTERIA_GPT_WORK_PARENT_ACCEPTANCE_RC19.md`

This is the only user-facing Work prompt.

Parent must internally cover W01 + W05 + W06 and inline the full current Browser contract.

W01 must explicitly judge:

- route gestalt;
- long detours;
- non-monotone Architecture routes;
- electrical-wiring appearance;
- relation-column alignment in Lineage;
- claim-centered Evidence;
- selection invariance;
- Full-model readability;
- reader-facing math.

Do not let W01 PASS merely because arrows/labels/collisions counts are zero.

## 13. Result

Write:

`results/asteria--rc19-layout-first-graph-convergence/result.md`

Return:

```text
STATUS =
CURRENT_VERSION =
FINAL_COMMIT =

AI_SKILLS_FORMAL_RELEASE =
AI_SKILLS_MAINTAINER_VERSION =
FRONTEND_DESIGN_VERSION =
BRIDGE_FORMAL_RELEASE =
BRIDGE_RUNTIME_VERSION =
BRIDGE_PROJECT_VALIDATE =

TRACE_OFF_VISIBLE_NODE_COUNT_SEQUENCE =
TRACE_OFF_SHARED_NODE_MAX_DELTA_PX =
TRACE_OFF_EDGE_PATH_CHANGE_COUNT =

ROUTE_GESTALT =
AVOIDABLE_EDGE_CROSSING_COUNT =
LONG_DETOUR_COUNT =
NON_MONOTONE_ARCH_EDGE_COUNT =
ORTHOGONAL_MULTI_BEND_EDGE_COUNT =
FLOATING_RELATION_LABEL_COUNT =
SIMPLE_ARCH_EDGE_MAX_ROUTE_RATIO =
ARCH_EDGE_P95_ROUTE_RATIO =

FULL_MODEL_PRIMARY_TEXT_MIN_CSS_PX =
FULL_MODEL_HORIZONTAL_UTILIZATION =
FULL_MODEL_NODE_OVERLAP_COUNT =
FULL_MODEL_PRIMARY_TEXT_CLIPPED_COUNT =

INSPECTOR_READER_RAW_MATH_TOKEN_COUNT = 0

GENERIC_FIX = PASS
EXAMPLE_SPECIFIC_HARDCODE_ADDED = NO
VISUAL_SYSTEM_CONFORMANCE = PASS
SELF_VISUAL_QA_ROUNDS =
SELF_VISUAL_QA = PASS
VISUAL_REVIEW_PACK = results/asteria--rc19-layout-first-graph-convergence/VISUAL_REVIEW_PACK.md
GPT_WORK_PROMPT_PATH = prompts/reviewers/ASTERIA_GPT_WORK_PARENT_ACCEPTANCE_RC19.md

PUBLIC_ACCEPTANCE_URL_REFRESHED =
PUBLIC_BROWSER_SMOKE =
PUBLIC_VERSION =

SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
CAT_TRACE_BRIDGE_CONTRACT_CHANGED = NO

NEXT_ACTION = GPT_WORK_SINGLE_PARENT_ACCEPTANCE | NEEDS_GPT_PLANNER | RESTART_REQUIRED
```

If `SELF_VISUAL_QA != PASS`, do not report COMPLETE.

Stop after reporting. Do not launch GPT Work and do not release stable.
