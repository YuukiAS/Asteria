---
task_id: "asteria_v0_5_11"
version: "0.5.11"
status: "completed"
executor: "Codex"
risk_level: "medium"
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
---

# Asteria v0.5.11 Result

## Summary

- Implemented sequential block variant inheritance with `resolveBlockVersionState` as the central resolver.
- Later versions now inherit from the nearest earlier version with own content; earlier versions do not inherit backward.
- Blocks with no own, inherited, or base content at the active concrete version are hidden, and connected edges are hidden with them.
- New blocks created in a concrete version now create own content for that version only; new blocks created in All mode create base content.
- Editing inherited content now copies the resolved inherited content into the requested version before applying edits.
- Pinned block versions use the same sequential inheritance logic as AUTO.
- Reworked the Variants inspector into compact version rows such as `V1 Own`, `V2 Inherits V1`, and `V3 Hidden`.
- Split each Variants row into a state line and an action line so the right panel fits at its default width.
- Displayed the full version label with its compact short label in Variants rows, for example `TRACE (V1)`.
- Removed the separate Base inspector section; base content is represented only as a compact `Base` state in the version table.
- Restored `PIN Vn` labels for block version selectors and kept the current version-control typography cleanup in this same release.

## Files Changed

- `CHANGELOG.md`
- `TODO.md`
- `TODO1.md`
- `package.json`
- `package-lock.json`
- `results/asteria_v0_5_11_result.md`
- `src/components/BlockNode.tsx`
- `src/components/Canvas.tsx`
- `src/components/InspectorPanel.tsx`
- `src/components/VersionStrip.tsx`
- `src/lib/blockVersionState.ts`
- `src/lib/exportImport.ts`
- `src/store/useMapStore.ts`
- `src/styles/index.css`
- `src/types/map.ts`

## Verification

- `npm run build` - exit 0. TypeScript and Vite production build passed.
- `git diff --check` - exit 0. Only Windows line-ending conversion warnings were reported.
- Manual code-path review confirmed create/edit/delete/reorder flows route through sequential inheritance helpers.
- Manual text scan confirmed the current main Variants panel no longer uses `Default`, `(default)`, or `(inherit default)` as its primary workflow.
