---
task_id: "asteria_v0_5_5"
version: "0.5.5"
status: "completed"
executor: "Codex"
risk_level: "low"
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
---

# Asteria v0.5.5 Result

## Summary

- Added a Notion-style divider input rule for rich-text block content.
- Typing `---` in the current editor line now inserts a horizontal divider node.
- Styled dividers consistently in editing mode and rendered block previews.

## Files Read

- `src/editor/createEditorExtensions.ts`
- `src/editor/editorUtils.ts`
- `src/styles/index.css`
- `package.json`
- `package-lock.json`

## Files Changed

- `src/editor/dividerExtension.ts`
- `src/editor/createEditorExtensions.ts`
- `src/styles/index.css`
- `package.json`
- `package-lock.json`
- `CHANGELOG.md`
- `results/asteria_v0_5_5_result.md`

## Implementation Notes

- Added `DividerRule`, extending TipTap's `HorizontalRule` with a reliable `^---$` node input rule.
- Disabled `StarterKit`'s built-in horizontal rule registration to avoid duplicate schema nodes.
- Declared `@tiptap/extension-horizontal-rule` as a direct dependency because the app now imports it directly.
- Added shared `hr` styling for `.ProseMirror` and `.rich-preview`, using the block divider color variable.

## Verification

- `npm run build` - exit 0. TypeScript and Vite production build passed.
- `git diff --check` - exit 0. Only Windows line-ending conversion warnings were reported.
- `rg` checks confirmed the new divider extension, dependency, version, and CSS rules are present.

## Known Issues

- Browser-level input replay was not run because Playwright Chromium is still not installed locally.
