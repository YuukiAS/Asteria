# Asteria v0.9.3 Result

## Execution Summary

- Implemented Asteria `0.9.3` usability fixes for block size presets, Zoom image previews, block title editing cursor stability, and rich-text list Tab behavior.
- Added the requested AGENTS rule that code fixes must include or update relevant validation/regression coverage.
- Updated version records and user-facing documentation.

## Files Read

- `AGENTS.md`
- `prompts/AGENT_RULES.md`
- `package.json`
- `package-lock.json`
- `README.md`
- `CHANGELOG.md`
- `src/constants/layout.ts`
- `src/lib/exportImport.ts`
- `src/lib/imageLinks.ts`
- `src/lib/blockVersionState.ts`
- `src/components/BlockNode.tsx`
- `src/components/RichTextEditor.tsx`
- `src/components/RichTextPreview.tsx`
- `src/editor/listContinuationExtension.ts`
- `scripts/validate-rich-text-behavior.mjs`
- `scripts/validate-image-link-story-export.mjs`
- `scripts/validate-image-link-browser.mjs`
- `scripts/validate-list-shift-tab-browser.mjs`
- Local shared map reference: `/home/yuukias/.local/state/asteria/runtime/shared-map.json`

## Files Modified

- `AGENTS.md`
- `CHANGELOG.md`
- `README.md`
- `package.json`
- `package-lock.json`
- `scripts/validate-block-usability.mjs`
- `scripts/validate-image-link-browser.mjs`
- `scripts/validate-list-shift-tab-browser.mjs`
- `scripts/validate-rich-text-behavior.mjs`
- `src/components/BlockNode.tsx`
- `src/components/RichTextEditor.tsx`
- `src/components/RichTextPreview.tsx`
- `src/constants/layout.ts`
- `src/editor/listContinuationExtension.ts`
- `src/lib/exportImport.ts`
- `src/lib/imageLinks.ts`

## Verification

- `npm run test:block-usability` passed.
- `npm run test:rich-text` passed.
- `npm run test:image-links` passed.
- `npm run build` passed. Vite still reports the existing large chunk warning, but the command exits successfully.

## Regression Coverage

- Added `npm run test:block-usability` to validate shared-baseline block presets, default/fallback sizing, Zoom image URL extraction, and title edit variant resolution.
- Expanded `npm run test:rich-text` to validate `Tab` list indentation in addition to the existing `Shift+Tab` protections.
- Expanded browser harness scripts for Zoom image cards, title middle-character deletion, and canvas list `Tab`/`Shift+Tab` behavior. These harness modules are not direct npm scripts in the current project; the executable coverage is provided by the Node/Vite validation scripts above.

## Diff Summary

- Block size presets changed to Small `480 x 280`, Medium/default `640 x 360`, Large `820 x 500`.
- Import normalization now falls back to the Medium preset instead of hardcoded `340 x 220`.
- Zoom inline previews now include ordinary HTTP(S) image-extension links while hover previews remain explicit Image Link only.
- Block title edit input now reads from the requested edit variant when present and falls back to the rendered inherited/base title before the own variant exists.
- Rich-text lists now handle `Tab` indentation inside list items while preserving existing `Shift+Tab` behavior.
- Version bumped to `0.9.3`; README and CHANGELOG updated.

## Human Approval Needed

- None.
