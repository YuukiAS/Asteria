---
id: asteria_v0_2_2
completed_at: 2026-07-06
---

# Asteria 0.2.2 Result

## Summary

Added per-block display density and toolbar-level display override.

## Files modified

- `src/types/map.ts`
- `src/constants/versioning.ts`
- `src/lib/exportImport.ts`
- `src/store/useMapStore.ts`
- `src/components/Toolbar.tsx`
- `src/components/BlockNode.tsx`
- `src/components/InspectorPanel.tsx`
- `src/styles/index.css`

## Commands run

- `node node_modules\typescript\bin\tsc -b` — exit 0.
- `node node_modules\vite\bin\vite.js build` — exit 0, with existing large chunk warning.

## Acceptance criteria passed

- Blocks support `full`, `compact`, and `title_only` display modes.
- Toolbar supports `Use block settings`, `Full`, `Compact`, and `Title only` override.
- Display mode changes affect rendering only and do not modify rich-text content.
- Display mode persists through export/import normalization.

## Known issues

- Inline canvas rich-text editing is available only in `full` mode; compact/title-only content remains editable from the inspector.

## Next

0.2.3 layout cleanup was implemented in the same work batch and recorded separately.
