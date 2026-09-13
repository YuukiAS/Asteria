# Asteria RC.10 staged GPT Work re-audit plan

日期：2026-09-13  
Target URL：`https://asteria.httpwwwcardiacnexus-ukb.com/`  
Expected visible version：`2.0.0-rc.10`

## 1. Why staged instead of six parallel reviewers

RC.10 is a broad visual/product repair, but its result explicitly reports:

```text
SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
REVIEWER_SCOPE_EXPANDED = NO
```

Therefore RC.9 W03 interaction/state PASS can carry forward.

Fresh reviewers required for RC.10:

```text
W01 Visual / scientific-product design
W02 Statistical semantics
W04 First-time researcher UX
W05 Responsive / accessibility
W06 Release red-team
```

To reduce wasted Work if the visual finish is still not acceptable, execute in two waves:

### Wave A — visual/product gate

Run in parallel:

```text
W01 + W04 + W05 + W06
```

If any Wave A reviewer returns FAIL/BLOCKED, or reports a core Architecture/Lineage/Evidence P2 under the Visual Acceptance Contract, stop. Do not run W02 yet. Consolidate one repair task.

### Wave B — scientific semantics guard

Only after Wave A passes with no unresolved must-fix visual P2, run:

```text
W02
```

This verifies that RC.10 math/copy cleanup did not alter scientific meaning.

## 2. Freshness rule

Every Work run must:

- start from a fresh task/profile where feasible;
- target only the fixed public URL;
- verify visible version `2.0.0-rc.10`;
- not receive RC.9 screenshots, RC.10 implementation screenshots, old reviewer findings, source code, or repair-result summaries;
- judge the actual rendered product independently.

## 3. Canonical browser contract

Every ready-to-paste prompt must inline the full current:

`docs/operations/blackbox-audit/UI_BLACKBOX_BROWSER_CONTRACT.md`

Core rule:

```text
可以自动操作页面；
不能绕过页面。
```

## 4. Visual acceptance contract

W01/W04/W05/W06 must enforce:

`docs/operations/blackbox-audit/VISUAL_ACCEPTANCE_CONTRACT.md`

In particular:

```text
NO_NODE_OVERLAP
NO_EDGE_LABEL_CARD_COLLISION
NO_PRIMARY_TEXT_CLIPPING
SELECTION_GEOMETRY_STABLE
MOTION_QUALITY
MATH_RENDERING_MAIN_UI
COPY_QUALITY_MAIN_UI
LINEAGE_VISUAL_GRAMMAR
EVIDENCE_VISUAL_GRAMMAR
```

Core Architecture/Lineage/Evidence visual P2 means `FAIL / FIX_THEN_RETEST`, not `PASS + P2`.

## 5. Wave A coverage

### W01

Must inspect at minimum:

- CAT-TRACE Overview 1536 Dark;
- CAT-TRACE Overview 1366 Light;
- repeated selection `y^U_igh -> gamma_g -> beta^U_gh -> c(f)`;
- CAT Full model + Fit at 1366 and 1536;
- Original TRACE at 1366 and 1536;
- Lineage at 1366 and 1536;
- Evidence;
- inspector math;
- Semantic Diff math/copy;
- Advanced collapsed/open.

### W04

Must judge first-time researcher comprehension, especially:

- Architecture story without developer context;
- math display consistency;
- Semantic Diff item-specific explanations;
- Evidence why/gap copy;
- whether Advanced/debug remains out of the main reading path;
- whether the user would independently reopen the product.

### W05

Must verify geometry and responsive behavior at 1366 and 1536:

- CAT Full model no overlap;
- Original TRACE no overlap;
- Lineage target safe margin;
- relation chips no collision;
- no primary text clipping;
- keyboard/focus remains usable.

### W06

Must stress normal-user flows after the broad presentation changes:

- model/view loops;
- Full model Zoom/Fit/Pan and Overview return;
- trace on/off/clear;
- Lineage/Evidence switching;
- Semantic Diff;
- Advanced/Export collapsed/open/top Export;
- Search current/all;
- Save/Restore;
- refresh and final recovery.

## 6. Wave B coverage

W02 must verify the visible scientific truth after math/copy changes:

- Original TRACE invariants;
- CAT-TRACE `𝒦/𝒰`, `c(f)`, `β^U_gh`, `γ_g`, `p_g`, `α^U_gh`, `Σ_W`, `ν`, `π_g`, `p_g^*`;
- Lineage relation meaning;
- Evidence pending/support/limitation boundaries;
- Semantic Diff scientific meaning.

## 7. Gate

Final RC.10 GPT Work gate requires:

```text
W01 = PASS
W02 = PASS
W04 = PASS
W05 = PASS
W06 = PASS
W03 = carry-forward PASS from RC.9
BROWSER_BLOCKER = NONE
BLACK_BOX_CONTEXT_CONTAMINATED = NO
P0 = 0
P1 = 0
unresolved must-fix P2 = 0

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

Only after this gate may the user be invited to inspect RC.10 manually.

## 8. Stop rule

If Wave A fails, do not continue to W02. If all five fresh reviewers eventually pass, stop automated polishing and return to user final human acceptance.