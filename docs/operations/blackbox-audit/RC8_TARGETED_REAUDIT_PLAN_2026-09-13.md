# Asteria RC.8 Targeted GPT Work Re-audit Plan

Date: 2026-09-13  
Target: `https://asteria.httpwwwcardiacnexus-ukb.com/`  
Expected visible version: `2.0.0-rc.8`

## Why only two reviewers

RC.8 is a single presentation-level Light-theme contrast patch. The implementation result explicitly reports `REVIEWER_SCOPE_EXPANDED = NO`, with no changes to scientific fixtures, trace algorithm, session contract, projection logic, Lineage, Evidence, search, or inspector IA.

Therefore the acceptance set is intentionally reduced to:

```text
W05 Responsive / Accessibility
W06 Release Red-team
```

Carry forward without rerun:

```text
W01 PASS from RC.7
W02 PASS from RC.6
W03 PASS from RC.6
W04 PASS from RC.6
```

## W05 ownership

W05 owns the exact unresolved finding:

```text
viewport = 1366×768
View = Architecture
Model = CAT-TRACE Frozen V2
Detail = Overview
Theme = Light
Select = Catalogue match or another core node
Trace = ON
```

The reviewer must determine whether muted nodes, relation lines, relation labels, and nearby context are now comfortably readable while remaining visually secondary to the active selected/upstream/downstream path.

A Dark state with the same selection/trace should be used as a comparison so the patch does not flatten theme hierarchy.

This is the release gate finding. If W05 returns FAIL for this same issue, RC.8 does not advance to human acceptance.

## W06 ownership

W06 performs only a minimal post-patch release regression:

- fresh RC.8 load;
- Light trace ON hard state remains operable;
- toggle Dark/Light once;
- trace off/on and Clear/Reset remain coherent;
- Architecture / Lineage / Evidence round trip;
- Original TRACE / CAT-TRACE round trip;
- Advanced / Export disclosure and top Export still work;
- Save/Restore main session path remains recoverable;
- refresh does not return to legacy 1.x or a startup modal.

Do not reopen previously accepted P3 decisions such as Save/Restore not restoring theme unless a new release-blocking regression appears.

## Final gate

If both fresh reviewers return:

```text
AUDIT_RESULT = PASS
BROWSER_BLOCKER = NONE
BLACK_BOX_CONTEXT_CONTAMINATED = NO
```

and ChatGPT triage finds:

```text
P0 = 0
P1 = 0
unresolved must-fix P2 = 0
```

then all reviewer coverage is satisfied via fresh + carry-forward evidence and the next step becomes:

```text
USER_FINAL_HUMAN_ACCEPTANCE
```

At that point stop automated polish. Do not create RC.9 unless the user finds a concrete issue during final acceptance.
