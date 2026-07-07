---
task_id: "asteria_v0_5_4"
version: "0.5.4"
status: "completed"
executor: "Codex"
risk_level: "medium"
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
---

# Asteria v0.5.4 Result

## Summary

- Added drag undo for canvas block/group movement.
- `Ctrl/Cmd+Z` now restores the nodes and edges snapshot from before the most recent drag when focus is not inside a text editor or form control.
- Drag history is transient UI state and is cleared when loading or clearing a map.

## Files Read

- `src/store/useMapStore.ts`
- `src/components/Canvas.tsx`
- `src/app/App.tsx`
- `package.json`
- `CHANGELOG.md`

## Files Changed

- `src/store/useMapStore.ts`
- `src/components/Canvas.tsx`
- `src/app/App.tsx`
- `package.json`
- `package-lock.json`
- `CHANGELOG.md`
- `results/asteria_v0_5_4_result.md`

## Implementation Notes

- Added a bounded canvas history stack with a maximum of 50 drag snapshots.
- `beginNodeDragHistory` captures a full nodes/edges snapshot when a node drag starts.
- `commitNodeDragHistory` pushes the snapshot only if the graph changed by drag stop.
- `undoLastCanvasChange` restores the previous nodes and edges together, reapplies edge presentation, marks the map unsaved, and schedules autosave.
- React Flow `onNodeDragStart` and `onNodeDragStop` now bracket the drag transaction.
- App-level `Ctrl/Cmd+Z` is ignored for inputs, selects, buttons, contenteditable, and ProseMirror so rich-text undo remains local to the editor.

## Verification

- `npm run build` - exit 0. TypeScript and Vite production build passed.
- `git diff --check` - exit 0. Only Windows line-ending conversion warnings were reported.
- `rg` checks confirmed the new history actions are wired in `useMapStore`, `Canvas`, and `App`.

## Known Issues

- Browser-level drag interaction was not replayed in Playwright because this machine still lacks the Playwright Chromium binary.
