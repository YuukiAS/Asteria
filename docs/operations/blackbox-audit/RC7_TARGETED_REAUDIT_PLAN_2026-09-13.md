# Asteria RC.7 Targeted GPT Work Re-audit Plan

Date: 2026-09-13  
Target URL: `https://asteria.httpwwwcardiacnexus-ukb.com/`  
Expected visible version: `2.0.0-rc.7`

## Decision

RC.7 is a narrow release polish and reports `REVIEWER_SCOPE_EXPANDED = NO`. Therefore the RC.6 PASS results for W02, W03, and W04 are carried forward.

Run only:

```text
W01 — Visual / scientific product design
W05 — Responsive / accessibility
W06 — Release red-team
```

Do not rerun W02/W03/W04 unless the targeted re-audit reveals a regression in their protected scope or a subsequent repair expands scope.

## Why these three reviewers

W01 covers the visual surfaces changed by RC.7: light trace readability, context helper spacing, active relation labels, Full-model reading controls, and final visual maturity.

W05 covers the accessibility/responsive surfaces changed by RC.7: first-tab skip links, accessible names, compact hit targets, 1366 light state, Full-model zoom/fit/pan, keyboard/focus behavior, and overflow.

W06 validates the controlled Advanced/Export disclosure, top Export feedback, Full-model controls under stress, and checks that the narrow polish did not introduce stale state or an unrecoverable UI state.

## Carry-forward reviewers

```text
W02 = PASS from RC.6
W03 = PASS from RC.6
W04 = PASS from RC.6
```

These passes remain valid because RC.7 result states:

```text
REVIEWER_SCOPE_EXPANDED = NO
SCIENTIFIC_FIXTURES_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
EVIDENCE_TRUTH_CHANGED = NO
SESSION_PERSISTENCE_CONTRACT_CHANGED = NO
```

## Browser contract

Every final Work prompt must inline the exact current contents of:

`docs/operations/blackbox-audit/UI_BLACKBOX_BROWSER_CONTRACT.md`

The Work must not read the repository to obtain the contract.

## Gate

Targeted re-audit passes only when W01, W05, and W06 all return:

```text
AUDIT_RESULT = PASS
BROWSER_BLOCKER = NONE
BLACK_BOX_CONTEXT_CONTAMINATED = NO
P0_COUNT = 0
P1_COUNT = 0
```

P2 findings are not automatically blocking. ChatGPT must classify each P2 as:

```text
must-fix before stable
accepted/deferred
```

If all three reviewers PASS and unresolved must-fix P2 = 0, proceed to user final human acceptance.

If one reviewer FAILs/BLOCKED or a must-fix P2 remains, create one narrow repair task and rerun only the affected reviewer(s) plus W06, unless that repair expands into W02/W03/W04 scope.

## Ready-to-paste prompts

```text
docs/operations/blackbox-audit/prompts/rc7/W01_VISUAL_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc7/W05_RESPONSIVE_ACCESSIBILITY_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc7/W06_RELEASE_REDTEAM_WORK_PROMPT.md
```
