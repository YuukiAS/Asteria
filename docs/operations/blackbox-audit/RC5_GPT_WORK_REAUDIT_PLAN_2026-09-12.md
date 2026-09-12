# Asteria 2.0 RC.5 — GPT Work Re-audit Plan

Date: 2026-09-12  
Target: `2.0.0-rc.5`  
Fixed public URL: `https://asteria.httpwwwcardiacnexus-ukb.com/`

## Gate state

RC.5 automated repair review is `GO` to independent black-box re-audit.

This is **not** final human acceptance. The user should not spend time manually reviewing Asteria until the GPT Work gate passes.

## Run six fresh independent Work reviews in parallel

Use six independent ChatGPT Work tasks. Do not reuse a browser session or previous RC.4 report context.

Ready-to-paste prompts:

```text
docs/operations/blackbox-audit/prompts/W01_VISUAL_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/W02_SEMANTICS_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/W03_STATE_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/W04_FIRST_TIME_UX_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/W05_RESPONSIVE_ACCESSIBILITY_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/W06_RELEASE_REDTEAM_WORK_PROMPT.md
```

All six currently target `2.0.0-rc.5` and inline the current canonical Browser contract in full.

## Reviewer roles

- `W01`: visual/scientific-product design, math rendering, graph readability, trace visual grammar, inspector hierarchy, light/dark, 1536/1366.
- `W02`: statistical semantics/scientific truth for Original TRACE, CAT-TRACE Frozen V2, Lineage, Evidence pending/support boundaries.
- `W03`: model/view/trace/layer/search/export/theme/session state coherence, atomic Clear, cross-view search, right-panel sync.
- `W04`: first-time researcher comprehension and learnability; any P1 must have a full reproducible finding, not only a summary count.
- `W05`: responsive/accessibility/dense scientific UI, especially 1366×768, Light contrast, keyboard model navigation and skip paths.
- `W06`: release red-team normal-user stress, repeated model/view/trace/search/export/save-restore/refresh loops.

## Browser compliance

Canonical source:

```text
docs/operations/blackbox-audit/UI_BLACKBOX_BROWSER_CONTRACT.md
```

Core rule:

```text
可以自动操作页面；
不能绕过页面。
```

In-app Browser is preferred. Real-browser UI automation fallback is allowed. Fallback alone does not contaminate the audit. Source code, GitHub implementation, private API, DevTools/Network/Console, hidden app state, storage inspection or DOM/state mutation are forbidden.

## Pass/fail gate

After all six reports return, ChatGPT performs one consolidated triage.

Human acceptance is allowed only when:

```text
all designated reviewers AUDIT_RESULT = PASS
BROWSER_BLOCKER = NONE
BLACK_BOX_CONTEXT_CONTAMINATED = NO
P0 = 0
P1 = 0
unresolved must-fix P2 = 0
```

A reviewer may return `PASS` with small P2/P3 findings. Those P2 findings still require consolidated classification:

```text
must-fix before human acceptance
accepted/deferred
false positive / unsupported
```

`ACCEPTABLE_WITH_P2` does not by itself open the human gate.

## If the re-audit fails

Do not ask the user to inspect the page.

1. Deduplicate all visible findings.
2. Preserve proven-good scientific semantics and unaffected flows.
3. Create one narrow consolidated Codex repair task.
4. Repair and refresh the same fixed public URL.
5. Re-run affected reviewer(s) plus W06; if the repair touches multiple major surfaces, re-run all W01–W06.

## If the re-audit passes

Then and only then:

```text
NEXT_ACTION = FINAL_USER_ACCEPTANCE
```

The user performs one concentrated final product review. Stable `2.0.0` is created only after explicit user approval.

## Output handling

Each Work report should follow `AUDIT_RESULT_CONTRACT.md`. The user can paste all six reports back into ChatGPT together. No Work reviewer should modify Asteria or start a repair task.