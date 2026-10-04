---
id: asteria_v2_frontend_convergence_cat_trace_bridge_readiness
task_id: asteria_v2_frontend_convergence_cat_trace_bridge_readiness
project: Asteria
status: READY
executor: Codex executor session
risk_level: medium
title: Frontend Design convergence and CAT-TRACE bridge readiness
created_at: 2026-10-04
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Goal

Bring the current Asteria 2.0 RC.16 product to a release-candidate state that is worth independent acceptance, using the now-released Frontend Design plugin as the normal design coordinator, and in the same goal produce a frozen, implementation-ready design for the first real read-only CAT-TRACE repository bridge.

Do not release `2.0.0` stable in this goal.
Do not mutate the CAT-TRACE repository in this goal.
Do not start GPT Work in this goal.
Do not ask the user to manually inspect the UI during implementation.

Final next action must be one of:

`GPT_WORK_TARGETED_ACCEPTANCE`
`NEEDS_GPT_PLANNER`
`BLOCKED_PLUGIN_OR_RUNTIME`

## 0. First sync and read authorities

Before planning any implementation:

1. `git pull --ff-only origin main`
2. confirm current Asteria version and HEAD;
3. read:
   - `AGENTS.md`
   - `prompts/AGENT_RULES.md`
   - `prompts/CHATGPT_RULES.md`
   - `docs/design/SCIENTIFIC_GRAPH_VISUAL_SYSTEM.md`
   - `docs/notes/2026-10-04_asteria_current_state_and_cat_trace_bridge_plan.md`
   - `docs/notes/2026-09-15_asteria_github_code_trace_todo.md`
   - current RC.16 result and current public-url contract;
4. inspect current RC.16 production source and browser tests; do not rely on old chat summaries.

## 1. Use the released Frontend Design plugin

Use the installed `web-development` plugin Frontend Design normal entry:

`frontend-visual-systems`

Expected production release:

- repository release `5.3.1`
- plugin `web-development 0.3`
- routing mode `coordinator-first`

Verify the installed/available plugin identity before using it.

Do not copy plugin source files into Asteria.

The coordinator must classify:

- task scale;
- current design authority;
- target surface;
- evidence requirements;
- required delegates.

For this goal, the durable Asteria design authority is:

1. current product semantics and project instructions;
2. `docs/design/SCIENTIFIC_GRAPH_VISUAL_SYSTEM.md`;
3. accepted A/B/C/D/E1/E2 concepts;
4. current production grammar where not superseded.

There is no requirement to introduce Figma. If no canonical Asteria Figma exists, do not create one merely to satisfy a workflow.

Likely delegates may include:

- product-ux-planning;
- visual-direction;
- design-system-tokens;
- research-product-frontend;
- responsive-accessibility-review;
- motion-interaction;
- webapp-testing.

Use only delegates selected by the coordinator.

## 2. Stage A — whole-product actual-surface convergence

Treat current RC.16 as the candidate to converge, not as automatically accepted.

Review the actual rendered surface at the fixed public URL and local candidate.

Mandatory surfaces/states:

- CAT-TRACE Architecture Overview;
- CAT-TRACE Full model;
- Original TRACE;
- selection sequence across at least 4 scientific objects;
- trace OFF / Direct / Recursive / clear/reopen;
- Lineage;
- Evidence;
- Inspector;
- Semantic Diff;
- Search;
- Advanced / Export;
- Save / Restore;
- 1536×864 and 1366×768;
- Light and Dark.

The coordinator must distinguish:

- design defect;
- implementation drift;
- product-semantic defect;
- runtime-only defect.

### Stage A hard rule

Do not stop at an audit if a defect is within this task's authorized frontend scope.
Repair all user-visible P1/P2 frontend defects and re-run actual-surface convergence.

Protect:

- scientific definitions and CAT-TRACE/TRACE truth;
- typed relation truth;
- trace algorithm;
- session persistence contract;
- Evidence status truth.

If a required repair would alter those protected semantics, stop only that repair and return `NEEDS_GPT_PLANNER`.

## 3. Producer self-QA

Follow the Frontend Design F-C / F-D gates and Asteria developer visual self-QA.

Before declaring Stage A complete:

- exact candidate must have producer P1=0 and P2=0 for the affected product surface;
- actual rendered surface must be reviewed, not only DOM assertions;
- no obvious hierarchy/spacing/overflow/math/copy/motion defect may be deferred to GPT Work;
- verify responsive states and ordinary interaction;
- retain screenshots/evidence for the final candidate.

If a substantive redesign is required, use the coordinator P0–P4 loop instead of accumulating micro-patches.

## 4. Versioning for Stage A

If code changes are needed, create exactly one next RC version after convergence.
Do not create a chain of micro-RCs inside this goal.

Update:

- package version;
- CHANGELOG;
- README product state;
- focused regression;
- cumulative regression;
- public smoke.

Push ordinary commits under standing authorization.

Refresh only:

`https://asteria.httpwwwcardiacnexus-ukb.com/`

## 5. Stage B — choose the minimum independent acceptance set

Do not launch GPT Work.

Based on the actual touched surfaces, write a short acceptance plan that chooses the smallest sufficient reviewer set.

Default expectation if only frontend presentation changes:

- W01 visual/product design;
- W06 release red-team.

Add:

- W04 only if first-use IA/copy was materially changed;
- W05 only if responsive/accessibility behavior was materially changed;
- W02 only if visible scientific semantics/math meaning changed;
- W03 only if trace/state/session/search behavior changed.

Return exact reviewer set as:

`DESIGNATED_GPT_WORK_REVIEWERS = ...`

Prepare but do not run ready-to-paste prompts following the existing Browser Contract rules.

## 6. Stage C — read-only CAT-TRACE bridge readiness audit

Now inspect current `YuukiAS/CAT-TRACE` main read-only.

Do not mutate CAT-TRACE.

Read enough current sources/results to establish facts, including:

- current implementation README/status;
- canonical model source;
- current implementation identity/versioning decision;
- current Alpha/Beta/C04 result lineage;
- existing `asteria_handoff_draft.json` artifacts;
- current GAP ledger;
- stable implemented package functions/tests relevant to C01/C02/C04.

Do not infer implementation success from plans.

Produce:

`docs/design/CAT_TRACE_REPOSITORY_BRIDGE_V0_1.md`

The spec must freeze a small first bridge with:

### B0 interchange identity

- bridge schema id/version;
- source repository;
- exact commit;
- scientific project id;
- model variant id;
- generated timestamp optional;
- no secret/private absolute paths.

### B0 implementation binding

Each binding must support at least:

- stable scientific entityId;
- role;
- relative code path;
- code kind;
- qualified symbol/function/field name when available;
- test refs optional;
- source: manual/manifest/static_analysis/agent_inferred/human_confirmed;
- confidence optional;
- implementation state:
  `PLANNED | IMPLEMENTED | TESTED | AUDITED | BLOCKED`;
- commit/ref;
- structural anchor/fingerprint fields optional;
- stale/broken status.

Do not freeze line number as the persistent identity.

### B0 evidence boundary

Explicitly state:

- implementation binding is not scientific proof;
- C04 can be represented as implemented/tested with reliability limitations, not as a fully reliable reference;
- C03 and later blocked modules must display BLOCKED/PLANNED honestly;
- Asteria must not update scientific truth from code.

### B1 CAT-TRACE manifest plan

Specify the first actual CAT-TRACE manifest scope:

- C01 high-value functions;
- C02 synthetic contract functions;
- selected C04 reference functions/tests;
- blocker/status objects for C03/GAP-01/GAP-04.

Do not require full call graph.

### B2 Asteria ingestion plan

Specify exact Asteria-side modules to add later:

- schema/types;
- parser/validator;
- importer;
- status/staleness validator;
- Inspector Implementation section;
- GitHub jump link;
- tests/fixtures.

Define what “first real CAT-TRACE connection” means:

Asteria can load a CAT-TRACE manifest pinned to a commit and show verified code bindings/status/tests for selected scientific entities, with blocked/unimplemented entities honestly marked.

## 7. Bridge proof fixture in Asteria only

Within Asteria, implement only the bridge **schema/validator + synthetic fixture** if the design is fully specified by this task.

Allowed:

- TypeScript bridge types;
- parser/validator;
- synthetic manifest fixture;
- unit/regression tests;
- no CAT-TRACE mutation;
- no live GitHub API ingestion yet;
- no call-graph/static-analysis engine yet.

If implementation would require inventing a new protocol decision not frozen above, do not guess; stop that substage and record the design gap.

Return:

`BRIDGE_SCHEMA_PROTOTYPE = PASS | DESIGN_ONLY | BLOCKED`

## 8. Required outputs

Write/update:

- `results/asteria_v2_frontend_convergence_cat_trace_bridge_readiness_result.md`
- `docs/design/CAT_TRACE_REPOSITORY_BRIDGE_V0_1.md`
- targeted acceptance prompts for the designated reviewer set;
- tests and screenshots for the converged candidate;
- README/CHANGELOG/version if Stage A changed code.

Update `ROADMAP.md` so it no longer stops at old RC.9/RC.6 language. Record:

- current actual candidate;
- remaining acceptance gate;
- CAT-TRACE bridge B0/B1/B2;
- GitHub/code-trace B3 as later 2.x.

## 9. Verification

At minimum:

`npm run build`
`npm run test:regression`
`npm run test:browser`
`npm run bench:architecture-g05`
`git diff --check`

Plus any focused test added for the new RC / bridge schema.

If code changes:

- commit;
- push;
- HEAD == origin/main;
- worktree clean;
- refresh fixed public URL;
- public root/status/browser smoke PASS.

## 10. Final result fields

Return at least:

`STATUS = COMPLETE | PARTIAL | BLOCKED`
`CURRENT_VERSION = ...`
`FINAL_COMMIT = ...`
`FRONTEND_DESIGN_PLUGIN = AVAILABLE_AND_USED | UNAVAILABLE | VERSION_MISMATCH`
`FRONTEND_DESIGN_SCALE = S1 | S2 | S3`
`FRONTEND_DESIGN_AUTHORITY = ...`
`FRONTEND_DESIGN_DELEGATES = ...`
`PRODUCER_P1_COUNT = ...`
`PRODUCER_P2_COUNT = ...`
`DESIGNATED_GPT_WORK_REVIEWERS = ...`
`BRIDGE_SPEC = PASS | BLOCKED`
`BRIDGE_SCHEMA_PROTOTYPE = PASS | DESIGN_ONLY | BLOCKED`
`CAT_TRACE_SOURCE_COMMIT = ...`
`CAT_TRACE_C00_STATUS = ...`
`CAT_TRACE_C01_STATUS = ...`
`CAT_TRACE_C02_SYNTHETIC_STATUS = ...`
`CAT_TRACE_C04_STATUS = ...`
`CAT_TRACE_C03_STATUS = ...`
`CAT_TRACE_ZERO_SLOT_STATUS = ...`
`CAT_TRACE_FIRST_REAL_MANIFEST_SCOPE = ...`
`PUBLIC_ACCEPTANCE_URL_REFRESHED = YES | NO | NOT_REQUIRED`
`PUBLIC_BROWSER_SMOKE = PASS | FAIL | NOT_REQUIRED`
`NEXT_ACTION = GPT_WORK_TARGETED_ACCEPTANCE | NEEDS_GPT_PLANNER | BLOCKED_PLUGIN_OR_RUNTIME`

Stop after reporting. Do not release stable. Do not mutate CAT-TRACE.
