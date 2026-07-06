---
id: asteria_v0_2_9
status: done
version: 0.2.9
---

# Asteria 0.2.9 Result

## Summary

Fixed the remaining inline version-editing issues after the 0.2.8 simplification.

## Changes

- Changed the top toolbar baseline version option from `All` to `Default`.
- Added a `Block content version` selector to the selected block header in Edit mode, next to the block type selector.
- Kept saved-version dots beside the title while leaving metadata controls on the right.
- Allowed inline math nodes to carry text marks so colored formulas remain visible while directly editing a block.

## Verification

- `git diff --check`
- `node node_modules\typescript\bin\tsc -b`
- `node node_modules\vite\bin\vite.js build`
- Browser smoke test with local Microsoft Edge against `http://127.0.0.1:5173/`: verified the toolbar baseline label is `Default`, Edit mode shows the block header content-version selector, the block type selector remains available, and the toolbar does not horizontally overflow.

## Notes

- No TRACE/HMSC-specific versions, labels, templates, or business rules were added.
- Push remains manual; this result is intended to be committed locally as `v0.2.9`.
