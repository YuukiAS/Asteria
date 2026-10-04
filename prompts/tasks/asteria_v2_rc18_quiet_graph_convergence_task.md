---
task_key: "asteria--rc18-quiet-graph-convergence"
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
promotion_gate: "toolchain aligned; producer screenshots visually clean; focused regressions pass; fixed public RC refreshed"
failure_escalation_policy: "If scientific truth, trace semantics, or session contract would need redesign, stop with NEEDS_GPT_PLANNER. If toolchain update requires a fresh Codex session, record RESTART_REQUIRED and stop before product edits."
forbidden_substitutes:
  - "Do not rely on DOM/bbox/endpoint metrics instead of actually looking at screenshots."
  - "Do not hand obvious arrow/label clutter to GPT Work."
  - "Do not patch individual CAT-TRACE entity IDs to make only the current screenshots pass."
  - "Do not use AI Skills main/source-candidate as production when the formal release is older."
  - "Do not vendor-copy Frontend Design or Bridge Kit source into Asteria."
required_evidence:
  - "formal AI Skills/Frontend Design/Bridge release identities"
  - "Bridge project validate PASS"
  - "fresh final screenshot pack"
  - "selection-only stability evidence"
  - "Full-model readable reset evidence"
  - "Architecture/Lineage/Evidence quiet-connector evidence"
allowed_next_states:
  - "GPT_WORK_SINGLE_PARENT_ACCEPTANCE"
  - "NEEDS_GPT_PLANNER"
  - "RESTART_REQUIRED"
auto_git_commit: true
auto_git_push: true
---

# Goal

Converge Asteria RC.17 into a visually finished next RC by fixing both fresh GPT Work findings and the broader connector/edge-label system exposed by the user's direct screenshots.

This is not another micro-patch to a few CAT-TRACE nodes. Repair the generic presentation policy.

Do **not** release stable.
Do **not** start GPT Work.
Do **not** ask the user to inspect the UI during implementation.
The producer must deliver a fresh clickable screenshot pack first.

## 0. Read authorities first

After syncing Asteria `origin/main`, read:

- `AGENTS.md`
- `prompts/AGENT_RULES.md`
- `prompts/CHATGPT_RULES.md`
- `docs/design/SCIENTIFIC_GRAPH_VISUAL_SYSTEM.md`
- `docs/operations/development/DEVELOPER_VISUAL_SELF_QA_CONTRACT.md`
- `docs/operations/blackbox-audit/UI_BLACKBOX_BROWSER_CONTRACT.md`
- `docs/operations/blackbox-audit/VISUAL_ACCEPTANCE_CONTRACT.md`
- `prompts/tasks/asteria_v2_frontend_convergence_cat_trace_bridge_readiness_review.md`
- `prompts/tasks/asteria_v2_rc17_parent_acceptance_review.md`

Inspect current production source and actual RC.17 public UI. Do not infer state from old chats.

## 1. Mandatory toolchain alignment before product edits

The user explicitly requires this old repo to be aligned through the normal AI Skills maintenance path before the repair.

### 1.1 Use AI Skills Maintainer normal entry

Use the installed **AI Skills Maintainer** plugin normal workflow, not source-tree imitation, to perform the equivalent of:

`sync this machine`

and specifically verify/update:

- AI Skills Collection formal release;
- `ai-skills-core` / AI Skills Maintainer;
- `web-development` / Frontend Design;
- Bridge Kit formal distribution.

Planning-time public release facts are only a sanity baseline:

- AI Skills Collection repository release: `5.4.4`;
- Frontend Design / `web-development`: `0.4`;
- AI Skills Maintainer / `ai-skills-core`: `0.5`;
- Bridge Kit repository `main` contains source `0.10.0` candidate, but its README states the current formal distribution is `0.9.3` from `release`.

At execution time, **discover the current formal releases again**. If a newer formal release exists, use it. Do not treat arbitrary newer `main` as production.

Record:

```text
AI_SKILLS_FORMAL_RELEASE =
AI_SKILLS_MAINTAINER_VERSION =
FRONTEND_DESIGN_VERSION =
FRONTEND_DESIGN_NORMAL_ENTRY =
BRIDGE_FORMAL_RELEASE =
BRIDGE_RUNTIME_VERSION =
BRIDGE_SOURCE_REF =
```

### 1.2 Refresh Asteria project Bridge scaffold

After the formal Bridge runtime is aligned, run the canonical project-level Bridge path on the existing Asteria repo so managed Bridge content is current while Asteria-owned prose remains preserved.

Use the formal runtime's supported normal entry, expected to be equivalent to:

```bash
ai-bridge init --target /home/yuukias/code/Asteria
ai-bridge validate --target /home/yuukias/code/Asteria
```

Do not overwrite Asteria's project-owned AGENTS rules.

Return:

`BRIDGE_PROJECT_VALIDATE = PASS | FAIL`

### 1.3 Session freshness boundary

If the maintainer actually upgrades an installed Frontend Design / AI Skills plugin or Bridge runtime in a way that the **current Codex session cannot consume**, do not continue visual design using stale loaded instructions.

Write the result/progress state, commit only safe project-scaffold changes if appropriate, and return:

`NEXT_ACTION = RESTART_REQUIRED`

The user should only need to open a fresh Codex session and point it at this same task file.

If the current session is already on the latest formal plugin/runtime identities, continue.

## 2. Invoke Frontend Design for the repair

Use the installed Frontend Design normal entry:

`frontend-visual-systems`

Coordinator-first.

Treat this as a research-product frontend convergence task. Use only delegates selected by the coordinator. No Figma requirement should be invented; Asteria's current visual authority is the repository design system and rendered product.

The following product direction is frozen and must not be weakened by generic graph-library conventions.

## 3. Repair AST-RC17-W01-001: selection must not mutate Overview

Current code calls direct-context reveal from ordinary `selectedEntityId`, which is why visible node count changes under trace OFF.

Fix the generic state/presentation boundary:

### Trace OFF

Ordinary selection may change:

- selected card emphasis;
- selected object in Inspector.

Ordinary selection must **not** change:

- projected/visible entity set;
- node positions;
- edge routes;
- edge emphasis;
- visible node count.

CAT-TRACE Overview therefore has one deterministic baseline visible set for the active model/detail state.

Direct/recursive reveal is owned by explicit Trace/Focus behavior, not by selection.

Hard regression sequence at 1366×768 Light:

`Open-tail occurrence -> Group open-tail intensity -> Open-tail slope -> Catalogue match`

while trace remains OFF.

Required:

```text
TRACE_OFF_VISIBLE_NODE_COUNT_SEQUENCE = constant
TRACE_OFF_SHARED_NODE_MAX_DELTA_PX <= 1
TRACE_OFF_EDGE_PATH_CHANGE_COUNT = 0
TRACE_OFF_SELECTION_EDGE_EMPHASIS_COUNT = 0
```

The UI copy “Selection only controls the inspector.” must become literally true.

Do not hardcode those four entity IDs in the implementation mechanism; use them only as regression fixtures.

## 4. Replace the noisy connector presentation with the Quiet Connector system

The user's RC.17 screenshots show the current terminal/label policy is still visually unacceptable even though collision metrics pass.

### 4.1 Architecture

Default Architecture / trace OFF:

- ordinary edges: **no arrowhead**;
- no inline relation text;
- selection does not thicken or otherwise emphasize incident edges;
- cards remain the visual layer; edges are secondary structure.

Explicit trace ON:

- only active trace edges may display direction terminals;
- terminal must be a single tiny restrained marker, approximately 4.5–5.5 CSS px;
- context/muted edges have no marker;
- do not display relation prose on the canvas;
- upstream/downstream remain distinguishable through restrained dash/solid grammar plus Inspector/control wording.

Do not render `markerEnd` unconditionally in `ProjectedEdge`.

Do not use current `isConnectedToSelection` to emphasize Architecture edges when trace is OFF.

### 4.2 Lineage

Lineage default should read as a clean provenance figure, not an auto-generated graph.

Remove stable-facing:

- all arrowheads;
- all floating `RelationLabelGroup` / edge chips;
- all relation words floating in the connector field.

The source cards already contain the useful concise interpretation:

- HMSC framework — Ecological hierarchy
- TRACE / Infinite JSDM — Open-tail foundation
- bigMVP — Scalable probit computation
- Sparse Bayesian infinite factor / MGP — Factor shrinkage

Keep complete typed relation truth in Method Inspector / hidden semantic metadata.

Connectors should be clean, thin, visually subordinate curves from source cards to the target card. When a source is selected, the connector may receive restrained stroke emphasis, but do not reintroduce labels or default arrows.

This must remain generic for 3/4/6 provenance sources.

### 4.3 Evidence

Default Evidence:

- no ordinary arrowheads;
- no floating relation text;
- relation semantics come from card kind/status, restrained stroke grammar, and Claim Inspector;
- selected object may emphasize incident connectors, but default/selection must not become an arrow field.

Favor smooth scientific curves. Use rounded obstacle routing only when a direct curve would hit another card.

### 4.4 Endpoint quality still applies

Removing arrow clutter is not permission to regress routing.

Keep:

- source/target card boundary contact;
- no card-border hugging;
- no edge through card/text;
- no floating terminal when active trace uses one;
- no avoidable crossing;
- deterministic resize alignment.

## 5. Repair AST-RC17-W01-002: Full model must be readable

Current Full model is packed using a fixed 1000×620 presentation canvas and then scaled, while the current “Fit” action is not a real readable-fit computation.

Repair the generic Full model reading contract.

### 5.1 Use actual rendered canvas width

Full-model lane packing must receive actual measured canvas dimensions. It must no longer anchor horizontal packing to the fixed `presentationCanvas.width = 1000` when the real canvas is wider/narrower.

Use the available inspector-open content box and safe padding.

### 5.2 Do not define success as “all 37 nodes squeezed into one screen”

Overview already serves the one-screen reading use case.

Full model is a complete exploration surface:

- preserve readable card/symbol/title scale;
- permit a taller/larger intrinsic canvas;
- pan/zoom is allowed;
- default/reset state should be centered and readable.

Prefer renaming/redefining the current misleading `Fit` action to a truthful `Reset` / `Readable reset` if a true fit-all would require unreadable scale.

If a fit-all affordance is retained, it must be explicitly secondary and may not be the default readable state.

Minimum visible reading gate at 1366 and 1536:

```text
FULL_MODEL_PRIMARY_TEXT_MIN_CSS_PX >= 9.5
FULL_MODEL_HORIZONTAL_UTILIZATION >= 0.78
FULL_MODEL_NODE_OVERLAP_COUNT = 0
FULL_MODEL_PRIMARY_TEXT_CLIPPED_COUNT = 0
```

No large empty right side with the whole graph compressed into a left strip.

## 6. Frontend Design producer visual convergence

Do not stop after implementation + automated tests.

The producer must open the **exact final candidate** and visually inspect real screenshots.

Required final screenshot states:

1. Architecture CAT-TRACE Overview 1536×864 Dark, trace OFF.
2. Same at 1366×768 Light, trace OFF.
3. Selection-only sequence final state with trace OFF.
4. Architecture explicit trace ON at 1366 Light.
5. Full model default/reset at 1536 Dark.
6. Full model default/reset at 1366 Light.
7. Original TRACE Overview.
8. Lineage 1536.
9. Lineage 1366.
10. Evidence 1536.
11. Evidence selected claim/dataset/limitation smoke.

The producer must actually look at each screenshot.

Hard visual questions:

- Are there any default arrowhead rows / chevron combs?
- Is any relation text floating on connector lines?
- Does Lineage still look like a generic graph engine?
- Does Evidence contain unnecessary arrows?
- Does selection-only change the map?
- Does Full model remain readable?
- Are cards visually primary over connectors?
- Are there any obvious strange bends, border hugging, crossings, clipping, raw math, or awkward labels?

If any answer is bad, continue repair. Do not create GPT Work yet.

## 7. Mandatory clickable screenshot review pack

This is a hard handoff requirement.

Create and commit exactly one user-facing visual pack:

```text
results/asteria--rc18-quiet-graph-convergence/VISUAL_REVIEW_PACK.md
```

The Markdown file must directly embed the fresh final screenshots with repo-relative image links and state captions.

It must begin with:

```text
CANDIDATE_VERSION =
CANDIDATE_COMMIT =
PRODUCER_SELF_VISUAL_QA = PASS
FRONTEND_DESIGN_VERSION =
```

For every screenshot include:

- viewport;
- theme;
- view/model/detail;
- trace state;
- what the producer checked;
- one short actual visual observation.

Do not merely link a screenshot directory.

Codex final response/result must return only this single screenshot-pack path for visual evidence.

## 8. Regression gates

Add a focused RC.18 regression that would fail the current RC.17 classes.

At minimum assert:

```text
TRACE_OFF_VISIBLE_NODE_COUNT_STABLE = PASS
TRACE_OFF_SHARED_NODE_MAX_DELTA_PX <= 1
TRACE_OFF_EDGE_PATH_CHANGE_COUNT = 0
TRACE_OFF_ORDINARY_ARROWHEAD_COUNT = 0
TRACE_OFF_INLINE_EDGE_LABEL_COUNT = 0

TRACE_ON_CONTEXT_ARROWHEAD_COUNT = 0
TRACE_ON_ACTIVE_ARROWHEAD_COUNT = active_trace_edge_count

LINEAGE_DEFAULT_ARROWHEAD_COUNT = 0
LINEAGE_FLOATING_EDGE_LABEL_COUNT = 0
EVIDENCE_DEFAULT_ORDINARY_ARROWHEAD_COUNT = 0
EVIDENCE_FLOATING_EDGE_LABEL_COUNT = 0

FULL_MODEL_PRIMARY_TEXT_MIN_CSS_PX >= 9.5
FULL_MODEL_HORIZONTAL_UTILIZATION >= 0.78
FULL_MODEL_NODE_OVERLAP_COUNT = 0
FULL_MODEL_PRIMARY_TEXT_CLIPPED_COUNT = 0
```

Also retain existing generic routing/card-contact regressions.

Run:

```bash
npm run build
npm run test:regression
npm run test:browser
npm run bench:architecture-g05
npm run test:cat-trace-bridge
git diff --check
```

Add/run `npm run test:architecture-rc18` and a public smoke for the new version.

## 9. Version / public candidate

If the repair passes:

- next version: `2.0.0-rc.18`;
- update package/README/CHANGELOG/version surfaces;
- commit/push under standing authorization;
- HEAD == origin/main;
- worktree clean;
- refresh only the fixed public URL:
  `https://asteria.httpwwwcardiacnexus-ukb.com/`
- public root/status/browser smoke PASS.

## 10. Prepare exactly one GPT Work prompt, but do not run it

Only after producer self-QA PASS, prepare exactly one clickable parent prompt:

```text
prompts/reviewers/ASTERIA_GPT_WORK_PARENT_ACCEPTANCE_RC18.md
```

It must inline the current complete Browser contract and include the current Visual Acceptance contract requirements.

Because this repair touches visual grammar, selection/display separation, and responsive Full-model reading, the single parent prompt should internally cover:

- W01 visual/product;
- W05 responsive/accessibility;
- W06 release red-team.

If Work supports independent parallel subreviews, parent may parallelize them. Otherwise one Work runs them as independent sequential lanes.

The user must never be asked to launch three prompts.

The parent must explicitly fail if any default screenshot still contains:

- ordinary Architecture arrowheads in trace OFF;
- floating Lineage relation labels/chips;
- default Lineage arrowheads;
- ordinary Evidence arrowheads;
- selection-only node-count changes;
- unreadable Full-model reset/fit.

## 11. Result fields

Write:

`results/asteria--rc18-quiet-graph-convergence/result.md`

Return at least:

```text
STATUS = COMPLETE | PARTIAL | BLOCKED
CURRENT_VERSION =
FINAL_COMMIT =

AI_SKILLS_FORMAL_RELEASE =
AI_SKILLS_MAINTAINER_VERSION =
FRONTEND_DESIGN_VERSION =
FRONTEND_DESIGN_NORMAL_ENTRY =
BRIDGE_FORMAL_RELEASE =
BRIDGE_RUNTIME_VERSION =
BRIDGE_PROJECT_VALIDATE = PASS | FAIL

TRACE_OFF_VISIBLE_NODE_COUNT_SEQUENCE =
TRACE_OFF_SHARED_NODE_MAX_DELTA_PX =
TRACE_OFF_EDGE_PATH_CHANGE_COUNT =
TRACE_OFF_ORDINARY_ARROWHEAD_COUNT =
TRACE_OFF_INLINE_EDGE_LABEL_COUNT =

TRACE_ON_CONTEXT_ARROWHEAD_COUNT =
TRACE_ON_ACTIVE_ARROWHEAD_COUNT =

LINEAGE_DEFAULT_ARROWHEAD_COUNT =
LINEAGE_FLOATING_EDGE_LABEL_COUNT =
EVIDENCE_DEFAULT_ORDINARY_ARROWHEAD_COUNT =
EVIDENCE_FLOATING_EDGE_LABEL_COUNT =

FULL_MODEL_PRIMARY_TEXT_MIN_CSS_PX =
FULL_MODEL_HORIZONTAL_UTILIZATION =
FULL_MODEL_NODE_OVERLAP_COUNT =
FULL_MODEL_PRIMARY_TEXT_CLIPPED_COUNT =

VISUAL_SYSTEM_CONFORMANCE = PASS | FAIL
GENERIC_FIX = PASS | FAIL
EXAMPLE_SPECIFIC_HARDCODE_ADDED = YES | NO
SELF_VISUAL_QA_ROUNDS =
SELF_VISUAL_QA = PASS | FAIL
VISUAL_REVIEW_PACK = results/asteria--rc18-quiet-graph-convergence/VISUAL_REVIEW_PACK.md
GPT_WORK_PROMPT_PATH = prompts/reviewers/ASTERIA_GPT_WORK_PARENT_ACCEPTANCE_RC18.md

PUBLIC_ACCEPTANCE_URL_REFRESHED =
PUBLIC_BROWSER_SMOKE =
PUBLIC_VERSION =

SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
CAT_TRACE_BRIDGE_CONTRACT_CHANGED = NO

NEXT_ACTION = GPT_WORK_SINGLE_PARENT_ACCEPTANCE | NEEDS_GPT_PLANNER | RESTART_REQUIRED
```

If `SELF_VISUAL_QA != PASS`, task may not report `STATUS = COMPLETE`.

Stop after reporting. Do not run GPT Work and do not release stable.
