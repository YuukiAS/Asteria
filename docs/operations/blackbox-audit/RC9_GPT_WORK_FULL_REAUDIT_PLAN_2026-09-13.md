# Asteria RC.9 GPT Work full re-audit plan

日期：2026-09-13  
Target URL: `https://asteria.httpwwwcardiacnexus-ukb.com/`  
Expected visible version: `2.0.0-rc.9`

## Why full W01–W06 again

RC.9 is a broad human-visual repair after RC.8 final human acceptance failed. It changes Architecture presentation geometry, selection/reveal stability, edge routing and labels, Semantic Diff math/copy, and Lineage/Evidence graph grammar. Therefore prior PASS baselines for those scopes are not sufficient release evidence.

Run six independent fresh GPT Work reviewers:

- W01 — visual / scientific-product design, with mandatory full-screen gestalt and collision review;
- W02 — statistical semantics and scientific-truth regression;
- W03 — interaction/state coherence, especially stable geometry across selection/trace;
- W04 — first-time researcher UX + stable-facing copy quality;
- W05 — responsive/accessibility plus visual geometry at 1536×864 and 1366×768;
- W06 — release red-team stress across Architecture/Lineage/Evidence, motion, export/session/refresh.

## New hard visual gate

The following contract is now mandatory:

`docs/operations/blackbox-audit/VISUAL_ACCEPTANCE_CONTRACT.md`

For core Architecture / Lineage / Evidence visual defects, a P2 is not acceptable as `PASS + P2`; W01/W04/W05 must FAIL/FIX_THEN_RETEST.

Mandatory cross-review checks before human acceptance:

```text
NO_NODE_OVERLAP = PASS
NO_EDGE_LABEL_CARD_COLLISION = PASS
NO_PRIMARY_TEXT_CLIPPING = PASS
SELECTION_GEOMETRY_STABLE = PASS
MOTION_QUALITY = PASS
MATH_RENDERING_MAIN_UI = PASS
COPY_QUALITY_MAIN_UI = PASS
LINEAGE_VISUAL_GRAMMAR = PASS
EVIDENCE_VISUAL_GRAMMAR = PASS
```

## Fresh-state rule

Each reviewer starts in a fresh browser/profile and must not read RC.8/RC.9 implementation reports, repo source, old screenshots, or another reviewer report. Product truth must come from visible UI only, except W02 expected scientific invariants which are inlined in its prompt.

## Mandatory W01 screenshots

W01 must review, not merely capture:

1. CAT-TRACE Architecture Overview 1536×864 Dark trace OFF;
2. CAT-TRACE Architecture Overview 1366×768 Light trace OFF;
3. select Open-tail occurrence `y^U_igh`;
4. select Group open-tail intensity `gamma_g`;
5. select/trace Open-tail slope `beta^U_gh`;
6. Full model + Fit;
7. Original TRACE Architecture;
8. Lineage;
9. Evidence;
10. Semantic Diff / inspector with mathematical content.

It must also click at least three different nodes continuously and judge motion quality, not just static screenshots.

## Gate

```text
W01-W06 = PASS
BROWSER_BLOCKER = NONE
BLACK_BOX_CONTEXT_CONTAMINATED = NO
P0 = 0
P1 = 0
unresolved must-fix P2 = 0
```

Only then may ChatGPT declare `FINAL_HUMAN_ACCEPTANCE = READY` again.

If the gate fails, deduplicate findings and open one consolidated repair task. Do not ask the user to inspect the page before the gate passes.