---
id: asteria_v2_rc13_graph_presentation_foundation_review
review_of: prompts/tasks/asteria_v2_rc13_graph_presentation_foundation_task.md
reviewed_at: 2026-09-13
status: GO
---

# RC.13 Graph Presentation Foundation Review

## Verdict

```text
REVIEW_STATUS = GO
NEXT_ACTION = GPT_WORK_RC13_W01_VISUAL_ONLY
```

RC.13 is ready for a single fresh visual black-box reviewer before any broader campaign or human acceptance. Do not start a multi-reviewer campaign yet.

## Evidence reviewed

- `results/asteria_v2_rc13_graph_presentation_foundation/result.md`
- product commit `cd05a0b2896026ebdc518715bb7ca3a8d1b3bd0b`
- `src/architecture/graphPresentation.ts`
- `src/architecture/viewProjection.ts`
- current `ArchitectureWorkspace.tsx` / `src/styles/index.css`
- RC.13 generic browser regression and self-QA outputs

RC.13 introduces a reusable graph-presentation layer rather than another CAT-TRACE-specific coordinate patch:

- lane-aware Architecture packing;
- reusable card-boundary ports;
- obstacle-aware routing and separated fan-in ports;
- generic provenance layout / target ports / chip anchors;
- synthetic generic graph and provenance fixtures.

The reported frozen contracts remain:

```text
SCIENTIFIC_FIXTURES_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
MODEL_VIEW_CONTRACT_CHANGED = NO
LINEAGE_EVIDENCE_TRUTH_CHANGED = NO
```

## Why only W01 now

The remaining highest-risk uncertainty is whole-screen visual quality of the new generic geometry. Scientific truth and state semantics were not changed; developer browser regression is already broad. To minimize user time, use a staged gate:

```text
Stage 1: W01 Visual only

if W01 FAIL/BLOCKED or finds must-fix visual P2:
  stop and repair; do not run more Work

if W01 PASS with no must-fix P2:
  Stage 2: one final W06 release red-team

if W06 PASS:
  user final human acceptance
```

Do not run W02/W03/W04/W05 unless a later change actually expands into those scopes.

## W01 hard focus

W01 must judge the new mechanism, not only the current example:

- CAT Overview 1536 and 1366, selection and trace;
- CAT Full model + Fit: semantic lane locality, edge crossings/hairball, card/label clarity;
- Original TRACE smoke for generic layout;
- Lineage 1536 and 1366: connectors must actually touch target border, target ports must be separated, chips must visually belong to their path;
- Evidence regression;
- full-screen gestalt, not only bbox assertions;
- no floating arrowheads;
- no edge through third-party cards;
- selected card remains primary focus;
- generic routing should look like a scientific diagram rather than an automatic graph engine.

## Human-acceptance protection

Do not invite the user to inspect RC.13 yet. W01 is the cheapest independent check of the mechanism that has repeatedly produced obvious visual regressions.

If W01 passes, do not automatically launch a broad campaign; prepare only W06.
