# Asteria 2.0 RC.9 Human Visual Repair Result

## Status

PASS.

Target version: `2.0.0-rc.9`.

## Repairs

- Replaced CAT-TRACE Overview visible-subset normalization with stable view/full projection bounds and deterministic Overview slots.
- Added `x_i` to the CAT-TRACE Overview baseline while keeping `nu`, `a_g`, `v^U_gh`, `gamma_0`, and `pi_g` as reveal-context detail.
- Repacked CAT-TRACE Overview and Evidence positions to avoid node overlap at 1366x768 and 1536x864.
- Routed Architecture edges through side ports and reduced Architecture inline relation labels to a small active-trace subset.
- Replaced raw canvas relation-type labels with concise presentation labels.
- Removed graph-node geometry transitions; graph nodes now transition only opacity, color, border, background, and shadow.
- Rendered Semantic Diff math through KaTeX-backed inline parts and replaced generic diff explanations with item-specific copy.
- Cleaned stable-facing Lineage/Evidence wording without changing evidence truth, pending status, lineage relation types, or canonical scientific fixtures.
- Added RC.9 browser assertions for no node overlap, no edge-label/card collision, no primary text clipping, stable selection geometry, motion quality, rendered Semantic Diff math, copy quality, and Lineage/Evidence visual grammar.

## Verification

- `git pull --ff-only origin main`: PASS before implementation; local branch was aligned to `origin/main`.
- `npm run build`: PASS.
- `npm run test:regression`: PASS.
- `npm run test:architecture-rc9`: PASS.
- `npm run bench:architecture-g05`: PASS.
  - entityCount: 2200
  - relationCount: 6200
  - visibleProjectionCount: 260
  - indexAverageMs: 2.623
  - traceAverageMs: 2.66
  - layerFocusAverageMs: 3.72
- `npm run test:browser`: PASS, 7/7 tests.
- `git diff --check`: PASS.

## Browser Evidence

RC.9 focused browser screenshots archived under:

```text
results/asteria_v2_rc9_human_visual_repair/screenshots/
```

Files:

- `rc9-architecture-visual-1366.png`
- `rc9-architecture-visual-1536.png`
- `rc9-lineage-visual.png`
- `rc9-evidence-visual.png`

## Scope

- Scientific truth changed: NO.
- Canonical TRACE/CAT-TRACE fixture truth changed: NO.
- Trace algorithm changed: NO.
- Session contract changed: NO.
- Fixed public URL / DNS / tunnel identity changed: NO.
- Reviewer scope expanded: NO.

## Acceptance Fields

- `NO_NODE_OVERLAP = PASS`
- `NO_EDGE_LABEL_CARD_COLLISION = PASS`
- `NO_PRIMARY_TEXT_CLIPPING = PASS`
- `SELECTION_GEOMETRY_STABLE = PASS`
- `MOTION_QUALITY = PASS`
- `MATH_RENDERING_MAIN_UI = PASS`
- `COPY_QUALITY_MAIN_UI = PASS`
- `LINEAGE_VISUAL_GRAMMAR = PASS`
- `EVIDENCE_VISUAL_GRAMMAR = PASS`

## Next Action

`GPT_WORK_FULL_REAUDIT_W01_W06`
