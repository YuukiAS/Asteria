---
id: asteria_v2_rc12_edge_visual_selfqa
title: Normalize graph edge/arrow presentation and require developer visual self-QA before any GPT Work
created_at: 2026-09-13
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Asteria 2.0 RC.12 — Edge / Arrow Visual Self-QA Finish

## 0. Why this task exists

RC.11 automated checks passed, but the post-development screenshots still show obvious presentation problems that should have been caught by the developer before asking the user to launch GPT Work.

This task exists to fix both:

1. the visible graph edge/arrow quality;
2. the developer workflow defect: no more declaring a visual version complete without actually reviewing screenshots.

Target version:

```text
2.0.0-rc.12
```

Do **not** create GPT Work prompts and do **not** ask the user to run GPT Work after this task. The next step is only:

```text
NEXT_ACTION = CHATGPT_REVIEW_DEVELOPER_SCREENSHOTS
```

## 1. Read first

Must read:

1. `AGENTS.md`
2. `prompts/AGENT_RULES.md`
3. `docs/operations/development/DEVELOPER_VISUAL_SELF_QA_CONTRACT.md`
4. `docs/operations/acceptance/RC11_PRE_WORK_VISUAL_REVIEW_FAILURE_2026-09-13.md`
5. `docs/operations/blackbox-audit/VISUAL_ACCEPTANCE_CONTRACT.md`
6. current `ArchitectureWorkspace.tsx`
7. current `src/styles/index.css`
8. current browser tests / RC11 regression

## 2. Scope freeze

Do not change:

- Original TRACE / CAT-TRACE scientific truth;
- canonical entity/relation truth;
- Evidence pending/support truth;
- trace algorithm/direction semantics;
- Save/Restore/session contract;
- Lineage/Evidence scientific content;
- fixed URL / DNS / tunnel identity.

Allowed:

- SVG edge/marker rendering;
- CSS stroke/opacity/marker presentation;
- `vector-effect` / marker units / ports needed for stable visual weight;
- tiny presentation-only geometry adjustments;
- if H4 is real, minimal top model selector binding fix;
- visual regression / screenshot automation.

## 3. Fix edge thickness at the root

The current presentation uses small SVG viewBox-unit values such as approximately:

```text
Architecture muted: 0.28
Architecture selected/trace: 0.56
Lineage normal: 0.18
Lineage active: 0.24
```

These values are visually transformed by SVG sizing and are not a reliable CSS-pixel design system.

RC.12 must make edge weight viewport-stable.

Preferred approach:

- use `vector-effect: non-scaling-stroke` on graph connectors where appropriate;
- use CSS-pixel-equivalent stroke widths, or an equivalent implementation that stays visually stable at 1366/1536 and zoom/Fit states;
- use markers whose visual size is not accidentally multiplied by stroke width / non-uniform viewBox scaling.

Target visual baseline, adjust only if screenshot review supports it:

```text
Architecture ordinary: 1.2–1.5 px
Architecture muted: 1.0–1.3 px with lower opacity
Architecture selected/trace: 1.8–2.1 px
Lineage ordinary: 1.4–1.7 px
Lineage selected: <= 2.0 px
Evidence ordinary: 1.2–1.5 px
Evidence selected/support emphasis: 1.7–2.0 px
```

Selected/trace must be clearer than context, but it must not look like a highlighter/Sankey band.

## 4. Fix arrowheads

Current active Architecture arrowheads are too visually heavy relative to cards and edges.

Requirements:

- small, restrained arrowhead;
- fixed visual scale across 1366/1536 and Overview/Full model;
- marker does not become huge merely because edge becomes selected;
- multiple incoming arrows remain individually legible at node boundary;
- no blue visual knot in front of selected node;
- Lineage retains its new clean presentation and must not regress.

If necessary use `markerUnits="userSpaceOnUse"` or another stable implementation; choose based on rendered screenshot, not theory alone.

## 5. Check model-selector coherence from the provided RC.11 screenshot

Fresh-load and model-toggle check:

```text
Top context model
Top model select value
Right inspector model buttons
Central Architecture title/project
```

All four must agree after:

```text
fresh CAT-TRACE
-> Original TRACE
-> CAT-TRACE
```

If the apparent RC.11 mismatch is reproducible, fix it. If not reproducible, record visible evidence in screenshots/result.

## 6. Developer self-QA is mandatory, not optional

Follow `DEVELOPER_VISUAL_SELF_QA_CONTRACT.md`.

### Round 1 screenshots

At minimum save:

```text
results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round1-cat-overview-selected-1536.png
results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round1-cat-overview-trace-1366.png
results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round1-lineage-1536.png
results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round1-evidence-1536.png
results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round1-model-selector-cat.png
results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round1-model-selector-original.png
```

Actually inspect them visually. Record what looked wrong, even if automated tests passed.

### Round 2

After fixing Round 1 findings, capture equivalent `round2-*` screenshots and inspect again.

Do not finish if Round 2 still shows obvious edge/arrow/card/math/copy problems. Continue Round 3 if needed.

## 7. Visual review checklist

For Architecture selected/trace state explicitly judge:

- Is the active edge only moderately stronger than ordinary edges?
- Are arrowheads smaller than node symbol/title visual weight?
- Do 3–5 incoming edges still read as separate relationships?
- Does the selected node remain the strongest focal object, rather than the arrows?
- Does line thickness remain similar between 1366 and 1536?
- Does Full model/Fit preserve the same edge grammar?

For Lineage/Evidence:

- no regression from RC.11 screenshots;
- connector weight remains restrained;
- relation chips/status remain readable;
- no thick convergence knot.

## 8. Automated checks

Add/update:

```text
npm run test:architecture-rc12
```

At least assert computed visual stroke widths from rendered UI, not just source strings.

Suggested hard ranges after rendering:

```text
ARCH_BASE_EDGE_CSS_PX <= 1.6
ARCH_ACTIVE_EDGE_CSS_PX <= 2.2
ARCH_ACTIVE_TO_BASE_RATIO <= 1.7
LINEAGE_EDGE_CSS_PX <= 1.9
EVIDENCE_ACTIVE_EDGE_CSS_PX <= 2.1
```

Also test marker bounding size or equivalent screenshot/geometry proxy where feasible.

Model selector invariant:

```text
MODEL_CONTEXT_SELECT_RIGHT_PANEL_COHERENT = PASS
```

## 9. Standard verification

Run:

```text
npm run build
npm run test:regression
npm run test:architecture-rc12
npm run bench:architecture-g05
npm run test:browser
git diff --check
```

## 10. Version / push / public refresh

Update to:

```text
2.0.0-rc.12
```

Write:

```text
results/asteria_v2_rc12_edge_visual_selfqa/result.md
```

Commit/push:

```text
commit = v2.0.0-rc.12
push origin/main
HEAD == origin/main
worktree clean
```

Refresh fixed public URL only:

`https://asteria.httpwwwcardiacnexus-ukb.com/`

Verify:

```text
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_ROOT_CHECK = PASS
PUBLIC_STATUS_CHECK = PASS
PUBLIC_BROWSER_SMOKE = PASS
PUBLIC_VERSION = 2.0.0-rc.12
```

## 11. Result fields

Must return:

```text
STATUS = COMPLETE | BLOCKED
CURRENT_VERSION = 2.0.0-rc.12
FINAL_COMMIT = ...
ARCH_BASE_EDGE_CSS_PX = ...
ARCH_ACTIVE_EDGE_CSS_PX = ...
ARCH_ACTIVE_TO_BASE_RATIO = ...
LINEAGE_EDGE_CSS_PX = ...
EVIDENCE_ACTIVE_EDGE_CSS_PX = ...
ARROWHEAD_VISUAL_SCALE = PASS | FAIL
MODEL_CONTEXT_SELECT_RIGHT_PANEL_COHERENT = PASS | FAIL
SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
SELF_VISUAL_QA_ROUNDS = ...
SELF_VISUAL_QA_SCREENSHOTS = ...
SELF_VISUAL_QA_GESTALT = PASS | FAIL
SELF_VISUAL_QA_ARROW_WEIGHT = PASS | FAIL
SELF_VISUAL_QA_PRIMARY_TEXT = PASS | FAIL
SELF_VISUAL_QA_MATH = PASS | FAIL
SELF_VISUAL_QA_COPY = PASS | FAIL
SELF_VISUAL_QA_MOTION = PASS | FAIL
SELF_VISUAL_QA = PASS | FAIL
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES | NO
PUBLIC_BROWSER_SMOKE = PASS | FAIL
NEXT_ACTION = CHATGPT_REVIEW_DEVELOPER_SCREENSHOTS
```

If `SELF_VISUAL_QA != PASS`, do not call the task complete and do not push a version claiming completion unless recording a blocked state is necessary.
