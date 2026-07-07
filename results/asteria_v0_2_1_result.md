---
id: asteria_v0_2_1
completed_at: 2026-07-06
---

# Asteria 0.2.1 Result

## Summary

Expanded existing group nodes into lightweight frames with opacity, lock state, and attach/detach actions.

## Files modified

- `src/types/map.ts`
- `src/lib/exportImport.ts`
- `src/store/useMapStore.ts`
- `src/components/GroupNode.tsx`
- `src/components/InspectorPanel.tsx`

## Commands run

- `node node_modules\typescript\bin\tsc -b` — exit 0.
- `node node_modules\vite\bin\vite.js build` — exit 0, with existing large chunk warning.

## Acceptance criteria passed

- Frames preserve title, background, border, opacity, lock state, resize, and move metadata.
- Frame data persists through export/import normalization.
- Selected blocks can be attached to a selected frame and detached from frames.
- Locked frames cannot be resized or dragged through the frame renderer/projection.

## Known issues

- Frame containment remains based on explicit parent-child attachment rather than automatic spatial containment.

## Next

0.2.2 display density was implemented in the same work batch and recorded separately.
