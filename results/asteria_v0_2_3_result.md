---
id: asteria_v0_2_3
completed_at: 2026-07-06
---

# Asteria 0.2.3 Result

## Summary

Added alignment, distribution, grid snapping, and micro-straighten layout actions.

## Files modified

- `src/constants/versioning.ts`
- `src/store/useMapStore.ts`
- `src/components/Toolbar.tsx`
- `src/components/InspectorPanel.tsx`

## Commands run

- `node node_modules\typescript\bin\tsc -b` — exit 0.
- `node node_modules\vite\bin\vite.js build` — exit 0, with existing large chunk warning.

## Acceptance criteria passed

- Multi-selected blocks can align left/right/top/bottom and center on X/Y.
- Multi-selected blocks can distribute horizontally or vertically.
- Selected blocks and all blocks can snap to an 8px grid.
- Micro-straighten is in the top toolbar between Fit and Save as `Clean`.
- Micro-straighten only applies small near-axis corrections and warns/skips conflicting moves.

## Known issues

- Micro-straighten uses node centers as a stable approximation for anchor alignment.

## Next

0.2.4 edge visibility was implemented in the same work batch and recorded separately.
