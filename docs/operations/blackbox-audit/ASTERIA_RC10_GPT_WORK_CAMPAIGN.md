# Asteria RC.10 GPT Work campaign

Target: `https://asteria.httpwwwcardiacnexus-ukb.com/`  
Expected version: `2.0.0-rc.10`

RC.10 is reviewed with a staged campaign rather than six parallel reviewers.

## Wave A — run first

```text
docs/operations/blackbox-audit/prompts/rc10/W01_VISUAL_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc10/W04_FIRST_TIME_UX_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc10/W05_RESPONSIVE_ACCESSIBILITY_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc10/W06_RELEASE_REDTEAM_WORK_PROMPT.md
```

Run these four in independent fresh GPT Work tasks.

If any returns FAIL/BLOCKED, or any core visual P2 remains must-fix, stop and consolidate findings. Do not run W02 yet.

## Wave B — only after Wave A passes

```text
docs/operations/blackbox-audit/prompts/rc10/W02_SEMANTICS_WORK_PROMPT.md
```

W02 is the final scientific-semantics guard after the visual/math/copy changes.

## Carry-forward

```text
W03 interaction/state = PASS from RC.9
```

This carry-forward is valid because RC.10 reports:

```text
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
REVIEWER_SCOPE_EXPANDED = NO
```

## Final gate

All five fresh reviewers must PASS, W03 carry-forward must remain valid, and all visual acceptance fields must be PASS before the user is invited back for final human acceptance.