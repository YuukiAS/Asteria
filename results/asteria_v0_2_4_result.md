---
id: asteria_v0_2_4
completed_at: 2026-07-06
---

# Asteria 0.2.4 Result

## Summary

Added version-aware edge visibility while keeping edge meaning manual and non-semantic.

## Files modified

- `src/types/map.ts`
- `src/lib/exportImport.ts`
- `src/store/useMapStore.ts`
- `src/components/Canvas.tsx`
- `src/components/EdgeInspector.tsx`
- `CHANGELOG.md`
- `package.json`
- `package-lock.json`

## Commands run

- `node node_modules\typescript\bin\tsc -b` — exit 0.
- `node node_modules\vite\bin\vite.js build` — exit 0, with existing large chunk warning.
- `rg -n "TRACE|HMSC|trace_hmsc|marked_trace|Marked TRACE" -S src TODO.md` — exit 0; matches only `TODO.md` examples, no `src` matches.

## Acceptance criteria passed

- Edge visibility supports `all` or selected user version ids.
- Existing edges default to visible in all versions.
- Canvas filters edges by active version and shows all edges in `All` mode.
- Edge inspector edits visibility without adding semantic edge categories.
- Export/import preserves edge visibility.
- Package version is now `0.2.4`.

## Known issues

- Browser automation with Playwright was not run because Playwright is not installed in this repo.

## Next

0.2.5 remains deferred until real use feedback.
