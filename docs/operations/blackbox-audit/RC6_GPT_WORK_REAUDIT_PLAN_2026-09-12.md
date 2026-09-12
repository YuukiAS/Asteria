# Asteria RC.6 GPT Work Re-audit Plan

日期：2026-09-12  
目标版本：`2.0.0-rc.6`  
固定验收入口：`https://asteria.httpwwwcardiacnexus-ukb.com/`

## Gate status

RC.6 implementation and automated/browser/public smoke are complete. The next gate is a **fresh full black-box re-audit**.

Do not ask the user for manual acceptance yet.

## Why full W01–W06 again

RC.6 changes are broad and cross-cutting: Architecture projection density, Overview/Full model disclosure, trace semantics and activation, canonical relations/metadata, Evidence status, inspector type/context, Semantic Diff/debug separation, light-mode readability, and researcher-facing language. Therefore a narrow retest would be insufficient.

Run all six reviewers independently:

- W01 — Visual / scientific-product design
- W02 — Statistical semantics / scientific truth
- W03 — Interaction / state coherence
- W04 — First-time researcher UX / learnability
- W05 — Responsive / accessibility / dense scientific UI
- W06 — Release red-team / normal-user stress

## Fresh-run rule

Each Work must:

- start from a new Work/browser context;
- target only the fixed public URL;
- observe visible version `2.0.0-rc.6`;
- not read repository source, tests, results, RC.4/RC.5 audit reports, or other reviewers' conclusions;
- use the canonical browser contract inline in its prompt;
- return the standard audit contract fields.

## RC.6-specific coverage expectations

The reviewers should independently exercise the current product, with special coverage of the new RC.6 surfaces without being told that those areas were previously broken:

- Architecture `Overview` and `Full model`;
- CAT-TRACE readability at 1536×864 and 1366×768;
- Dark and Light themes;
- default selected object while trace is OFF;
- explicit `Show trace` / trace activation;
- Direct vs Recursive and Upstream / Downstream / Both consistency;
- Clear/Reset returning to trace-OFF readable state;
- `𝒰` open-tail branch and `c(f)` split presentation;
- indexed quantities metadata (`g`, `h`, `j`);
- Dataset/Claim/Method/Symbol/etc inspector headings;
- marked-discovery `Pending` presentation;
- Semantic Diff placement and researcher-facing language;
- Advanced / Export & validation default-collapsed behavior;
- cross-view search, Save/Restore, refresh, keyboard and skip links;
- Evidence support/gap language.

## Release gate

After W01–W06 return, ChatGPT performs consolidated triage.

The user is invited to final human acceptance only if:

```text
W01 = PASS
W02 = PASS
W03 = PASS
W04 = PASS
W05 = PASS
W06 = PASS
P0 = 0
P1 = 0
unresolved must-fix P2 = 0
BLACK_BOX_CONTEXT_CONTAMINATED = NO for all reviewers
BROWSER_BLOCKER = NONE for all reviewers
```

PASS may contain minor P2/P3 findings, but every P2 must be explicitly classified during consolidated triage as either `must-fix` or `accepted/deferred`. Any unresolved must-fix P2 blocks human acceptance.

## If the gate fails

Do not ask the user to inspect the UI. Produce one consolidated repair task from deduplicated findings. If that repair is broad, run full W01–W06 again; if it is narrow, the consolidated report may authorize only affected reviewers plus W06.

## If the gate passes

Only then:

1. ask the user for final human acceptance on the fixed public URL;
2. if accepted, prepare the stable `2.0.0` release task;
3. do not mix desktop/Tauri or new model work into the stable release.
