# Asteria v0.9.4 Result

## Summary

Fixed two usability issues as `0.9.4`:

- Shared saves now show explicit dialog progress, prevent duplicate clicks while running, and close after the remote publish succeeds. The local IndexedDB mirror is written in the background instead of blocking the dialog after a successful shared publish.
- Zoom mode now treats extensionless Google encrypted thumbnail links and query-format image URLs as inline previewable image links, in addition to explicit Asteria Image Links and ordinary image-extension URLs.

Also strengthened `AGENTS.md` so every bug fix must include a script that directly tests the reported failure mode, and future version commits must run the cumulative regression script.

## Files Read

- `AGENTS.md`
- `README.md`
- `CHANGELOG.md`
- `package.json`
- `package-lock.json`
- `src/app/App.tsx`
- `src/components/Canvas.tsx`
- `src/components/RichTextPreview.tsx`
- `src/lib/imageLinks.ts`
- `src/lib/persistence.ts`
- `src/store/useMapStore.ts`
- `src/styles/index.css`
- `scripts/asteria-server.mjs`
- `scripts/validate-block-usability.mjs`
- `scripts/validate-image-link-browser.mjs`
- `scripts/validate-image-link-story-export.mjs`
- `scripts/validate-list-shift-tab-browser.mjs`

## Files Changed

- `AGENTS.md`: clarified that bug-fix coverage must directly test the reported failure mode and that future version commits must run the cumulative regression suite.
- `CHANGELOG.md`: added the `0.9.4` release entry.
- `README.md`: bumped the current version and documented shared-save progress plus expanded Zoom image URL behavior.
- `package.json`: bumped to `0.9.4`, added `npm run test:shared-save`, and added cumulative `npm run test:regression`.
- `package-lock.json`: bumped the root package version to `0.9.4`.
- `scripts/validate-block-usability.mjs`: added regression assertions for query-format image URLs and Google encrypted thumbnail anchors in the Zoom inline extraction path.
- `scripts/validate-shared-save-feedback.mjs`: added a focused regression check for save-dialog loading state and non-blocking shared publish local mirroring.
- `src/app/App.tsx`: added Save dialog busy state, spinner feedback, disabled duplicate actions, and async handling for shared/fixed/conflict actions.
- `src/lib/imageLinks.ts`: expanded previewable image URL detection beyond path extensions to include image query formats and `encrypted-tbn*.gstatic.com/images?...`.
- `src/store/useMapStore.ts`: changed successful shared publishes to queue a background local mirror instead of awaiting local `saveNow()`.
- `src/styles/index.css`: added Save dialog disabled/loading/spinner styles.

## Commands Run

- `npm run test:block-usability` - passed.
- `npm run test:shared-save` - passed.
- `npm run test:image-links` - passed.
- `npm run test:rich-text` - passed.
- `npm run test:shared-server` - passed.
- `npm run test:regression` - passed.
- `npm run build` - passed; Vite reported the existing large chunk warning.
- `curl -sS --max-time 20 -o /tmp/asteria-v094-page.html -w '%{http_code} %{url_effective}\n' https://asteria.httpwwwcardiacnexus-ukb.com/` - returned `200`.
- `curl -sS --max-time 20 https://asteria.httpwwwcardiacnexus-ukb.com/src/lib/imageLinks.ts | rg "encrypted-tbn|previewableImageQueryNames|format"` - confirmed the fixed public entry point is serving the new Zoom image URL code.
- `curl -sS --max-time 20 https://asteria.httpwwwcardiacnexus-ukb.com/api/asteria/status` - returned shared status with `ok: true`.

## Diff Summary

- Shared save no longer appears frozen: users see progress feedback while the remote publish is running, and a successful publish returns immediately after the shared server confirms the save.
- Zoom mode now recognizes the screenshot-style Google thumbnail links as image previews.
- Regression coverage is now cumulative through `npm run test:regression`.

## Notes

- Browser plugin was not available in this session, and Playwright is not installed in this repo. Rendered validation was therefore covered by the existing script harnesses, TypeScript/Vite build, and fixed public-link curl checks.
