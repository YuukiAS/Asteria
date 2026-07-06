---
id: asteria_v0_2_8
completed_at: 2026-07-06
---

# Asteria 0.2.8 Result

## Summary

Simplified block content version semantics: removed the user-facing `Follow toolbar` option, renamed the baseline content version to `Default`, made global version switching explicitly update all blocks, and kept selected-block switching scoped to one block.

## Files modified

- `src/lib/exportImport.ts`
- `src/store/useMapStore.ts`
- `src/components/BlockNode.tsx`
- `src/components/InspectorPanel.tsx`
- `src/styles/index.css`
- `CHANGELOG.md`
- `package.json`
- `package-lock.json`
- `prompts/tasks/asteria_v0_2_8_result.md`

## Commands run

- `git diff --check` - exit 0, with existing CRLF normalization warnings.
- `node node_modules\typescript\bin\tsc -b` - exit 0.
- `node node_modules\vite\bin\vite.js build` - exit 0, with existing large chunk warning.
- `rg -n "Follow toolbar|Common|COMMON|TRACE|HMSC|trace_hmsc|marked_trace|Marked TRACE" -S src TODO.md CHANGELOG.md prompts/tasks/asteria_v0_2_8_result.md` - exit 0; no user-facing `Follow toolbar` / `Common` strings remain in `src`, and TRACE/HMSC matches remain documentation-only.
- Node Playwright using local Microsoft Edge - exit 0; verified `Content version` shows `Default`, adding a version shows `Default / Version 1`, variant dots render beside the title, and there is no horizontal overflow.

## Acceptance criteria passed

- `Content version` now shows `Default` plus user-defined versions; no `Follow toolbar` option remains.
- Top toolbar version switching updates every block's active content version.
- Selected-block `Content version` switching changes only the selected block.
- Edit mode inline block title/content editing writes to the currently displayed content version.
- Variant dots render beside the title instead of in the right metadata group.
- Preview rendering prefers canonical rich-text JSON over stale stored HTML.

## Known issues

- The Vite build still reports the existing large chunk warning.
