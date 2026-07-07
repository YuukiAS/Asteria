---
id: asteria_v0_2_7
completed_at: 2026-07-06
---

# Asteria 0.2.7 Result

## Summary

Clarified block variant editing by adding a selected-block content version selector in the inspector. Users can now either follow the toolbar version or pin one block to Common/a specific user version, and direct canvas editing writes to the currently visible content version.

## Files modified

- `src/store/useMapStore.ts`
- `src/components/InspectorPanel.tsx`
- `src/components/BlockNode.tsx`
- `CHANGELOG.md`
- `package.json`
- `package-lock.json`
- `prompts/tasks/asteria_v0_2_7_result.md`

## Commands run

- `git diff --check` - exit 0, with existing CRLF normalization warnings.
- `node node_modules\typescript\bin\tsc -b` - exit 0.
- `node node_modules\vite\bin\vite.js build` - exit 0, with existing large chunk warning.
- `rg -n "TRACE|HMSC|trace_hmsc|marked_trace|Marked TRACE" -S src TODO.md` - exit 0; matches only `TODO.md` examples, no `src` matches.
- Node Playwright using local Microsoft Edge - exit 0; selected a block and verified the inspector shows `Content version`, includes `Follow toolbar`, and has no horizontal overflow.

## Acceptance criteria passed

- The block inspector includes a `Content version` selector for Common plus user-defined versions.
- The selector includes `Follow toolbar` so block-specific overrides are optional.
- Block title and rich-text content edits on both the canvas and inspector write to the currently visible content version.
- Variant copy actions are labeled `Use current` and copy the current visible content into the target version.
- Global canvas version switching remains available for blocks that follow the toolbar.
- Canvas variant dots now explain that they indicate saved content versions and should be edited from the inspector.

## Known issues

- The Vite build still reports the existing large chunk warning.
