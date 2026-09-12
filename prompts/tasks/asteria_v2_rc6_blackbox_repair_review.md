---
id: asteria_v2_rc6_blackbox_repair_review
review_of: prompts/tasks/asteria_v2_rc6_blackbox_repair_task.md
reviewed_at: 2026-09-12
status: GO
---

# Review — Asteria 2.0 RC.6 Black-box Repair

## Decision

`GO`

RC.6 has reached the next planned gate: **fresh GPT Work black-box re-audit**. It is **not** yet ready for user final acceptance and must not be released as `2.0.0` stable.

## Evidence checked

- `main` points to `dae0add12ca5c20fe6888167e9ca495ba17cd9f3` (`v2.0.0-rc.6`).
- Implementation commit `d8412b5a6ba509540b505ddf2e205c8704711d00` contains the RC.6 product changes.
- `results/asteria_v2_rc6_blackbox_repair/result.md` records all required automated gates as PASS and fixed-public-URL refresh as PASS.
- The supplied live screenshot visibly shows the RC.6 shell, `Overview` detail state, `TRACE OFF`, researcher-facing Project/View/Model help, and the fixed public RC.6 product surface.
- Source review confirms the implementation direction is consistent with the RC.6 task: Overview/Full-model progressive disclosure, explicit trace activation, root-relative trace changes, open-tail relation/indices repairs, and researcher-facing inspector/debug separation are present in the RC.6 change set.

## What this review does not certify

This review does not certify visual readability, interaction truth, accessibility, scientific presentation, or release readiness. Those are deliberately delegated to fresh independent GPT Work reviewers operating only through the public UI.

The supplied screenshot is useful sanity evidence but is **not** a substitute for the black-box gate.

## Next gate

Run a fresh full W01–W06 campaign against:

```text
https://asteria.httpwwwcardiacnexus-ukb.com/
```

Expected visible version:

```text
2.0.0-rc.6
```

All reviewers must start fresh and must not read RC.4/RC.5 reports, source code, test results, or prior reviewer conclusions.

After all six reports return, ChatGPT must consolidate and apply the standing gate:

```text
all designated reviewers PASS
P0 = 0
P1 = 0
unresolved must-fix P2 = 0
```

Only after that may the user be asked to perform final human acceptance.

## Next action

`OPEN_NEXT_TASK = GPT_WORK_BLACKBOX_REAUDIT`
