````text id="asteria-overflow-task"
---
id: asteria_0_2_overflow
title: Improve block overflow, density modes, and fit-to-content behavior
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
---

# Task: Improve block overflow, density modes, and fit-to-content behavior

## 1. Goal

Improve how Asteria handles long block content. The current visible scrollbar inside blocks is functional but visually distracting, especially for presentation diagrams. Asteria should treat canvas blocks as structured summary cards, not full document pages.

The goal is to keep layout stable while making long content readable when needed. Do not make blocks automatically grow whenever content changes. Default block size should remain stable so that global version switching, arrows, frames, and manual layout do not jump unexpectedly.

## 2. Product principle

Canvas block = summary/diagram object.

Inspector/focus view = full reading/editing surface.

Long content should not force the canvas layout to change automatically. Instead, provide clean overflow treatment, display density modes, and manual fit commands.

## 3. Required behavior

Implement the following behavior:

1. Blocks should not auto-resize as content grows.
2. Long content should not show a large always-visible scrollbar by default.
3. Overflow should be visually indicated by a subtle bottom fade.
4. Scrollbar should appear only on hover or when the block is selected.
5. Scrollbar should be thin and visually subdued.
6. The user should be able to manually fit a block to its content.
7. The user should be able to switch block display density: full, compact, title-only.
8. Layout dimensions should remain shared across model versions, not per-version, unless the app already has a carefully implemented variant layout system.

## 4. Display modes

Add or refine per-block display mode:

```ts
export type BlockDisplayMode = "full" | "compact" | "title_only"
````

### full

The block displays its rich text preview. If content exceeds the visible area, use fade overflow and scroll-on-hover/selected.

### compact

The block displays title, badges, status/emoji/version indicators, and a short content preview. Limit content to a small number of lines or a fixed compact preview height. Use fade overflow if needed. Math should not break the layout; if math is too wide, allow horizontal overflow inside the preview area.

### title_only

The block displays only title and lightweight indicators: type badge, version badge, status, emojis. It should be useful for high-level presentation diagrams.

## 5. Global display density override

Add a toolbar-level display density control:

```ts
export type GlobalDisplayDensity = "block_settings" | "full" | "compact" | "title_only"
```

Labels:

* `Block settings`
* `Full`
* `Compact`
* `Title only`

Behavior:

1. `Block settings` uses each block's own display mode.
2. `Full`, `Compact`, and `Title only` override all blocks visually.
3. The override should not permanently overwrite per-block display modes.
4. Per-block display mode should remain editable in the inspector.
5. The global override should persist in local state if appropriate, but it must not alter block data unless explicitly saved as block settings.

## 6. Overflow styling

For block content preview:

1. Hide the large native scrollbar by default.
2. On hover or selected block, show a thin scrollbar.
3. Use a subtle bottom fade when content overflows.
4. The fade should disappear or become less prominent when scrolled to the bottom if this is easy; otherwise a constant fade is acceptable.
5. Avoid dark, thick scrollbars.
6. Preserve usability: users must still be able to scroll block content with mouse wheel or trackpad when hovering over the block.
7. Do not block React Flow drag interactions unnecessarily.

Suggested CSS direction:

```css
.block-preview-scroll {
  overflow: auto;
  scrollbar-width: thin;
}

.block-preview-scroll:not(:hover):not(.selected) {
  scrollbar-width: none;
}

.block-preview-scroll:not(:hover):not(.selected)::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.block-preview-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.block-preview-scroll::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.35);
  border-radius: 999px;
}
```

Adjust class names and theme colors to match current code.

## 7. Fade overflow

Add a fade overlay at the bottom of a block when content is longer than the preview area.

Requirements:

1. The fade should be subtle.
2. It should adapt to block background color where reasonably possible.
3. If exact background-aware fade is hard, use a neutral white/transparent gradient and document the limitation.
4. The fade must not cover the block header.
5. The fade should not interfere with selecting the block or connecting edges.
6. A small `More` or `…` indicator is acceptable but optional.

Implementation idea:

* Add a `hasOverflow` state or compute via `scrollHeight > clientHeight`.
* Recompute after content changes, block resize, display mode change, and global version switch.
* Use `ResizeObserver` if already available or easy.
* Otherwise, compute after render with `requestAnimationFrame`.

## 8. Manual fit commands

Add fit commands in the block inspector. If toolbar placement is cleaner, inspector is still required.

### Fit to current content

Button label:

```text
Fit current content
```

Behavior:

1. Measure the rendered preview content for the currently visible variant/content.
2. Increase block height so the current content can be seen without vertical scrolling.
3. Respect a reasonable min height and max height.
4. Suggested max height: 720px or a constant in `src/constants/layout.ts`.
5. Do not change block width unless needed.
6. If measurement fails, fall back to a safe approximate height and `console.warn`.

### Fit to largest variant

Button label:

```text
Fit largest variant
```

Behavior:

1. If block variants/global model versions exist, measure all available variants for the block at the current width.
2. Set block height to fit the largest variant content.
3. This prevents global version switching from causing content to overflow unexpectedly.
4. If variants are not implemented yet, disable this button or make it behave like `Fit current content` and document the behavior.
5. Do not create per-version width/height unless explicitly already supported.

### Optional: Equalize selected sizes

If multi-select utilities already exist or are easy to implement, add:

```text
Equalize selected sizes
```

Behavior:

1. Use the largest width and height among selected blocks.
2. Apply those dimensions to all selected blocks.
3. If multi-select is not stable yet, skip this and document it.

## 9. Version-aware requirements

If block variants and global model versions already exist:

1. Block width and height should remain shared across variants by default.
2. Version switching should not automatically resize blocks.
3. Overflow/fade should update after version switch.
4. `Fit current content` fits only the currently active version/variant.
5. `Fit largest variant` fits across all variants.
6. Display mode is block-level and shared across variants unless the current data model already supports variant-specific display settings. Do not add variant-specific layout in this task.

If variants do not exist yet:

1. Implement this task for current block content.
2. Leave clean extension points for variants.
3. Do not implement the entire variants system inside this task unless explicitly requested.

## 10. Inspector UI

Update the block inspector with a compact section, for example:

```text
Display
- Mode: Full / Compact / Title only
- Fit current content
- Fit largest variant
```

Requirements:

1. Keep this section compact.
2. Do not push rich text editing too far down.
3. Disable unavailable commands with a short tooltip or helper text.
4. Make destructive behavior explicit. Fitting height is not destructive; resetting content is not part of this task.

## 11. Canvas UI

Update block rendering:

1. Header remains always visible.
2. Badges/status/emojis remain visible in all display modes.
3. In compact/title-only mode, block should remain clean and readable.
4. Long formula blocks should not destroy card layout.
5. In presentation-like views, visible scrollbar should not dominate the diagram.
6. Keep edge handles usable.

## 12. Data model and persistence

Add or update fields as needed:

```ts
type BlockData = {
  displayMode?: BlockDisplayMode
}
```

If a global display override is stored, keep it in app/UI state, not necessarily in each block.

Requirements:

1. Existing maps should load.
2. Missing `displayMode` defaults to `full`.
3. Export/import preserves per-block displayMode.
4. Refresh preserves displayMode and any manually fitted dimensions.
5. Fit commands should mark the map unsaved and persist after autosave.

## 13. Do not implement

Do not implement in this task:

1. Automatic block growth on every content edit.
2. Per-version block positions/sizes.
3. Full document editor inside the canvas.
4. Full-screen presentation mode.
5. PDF/SVG/PNG export.
6. Semantic edge types.
7. Automatic graph layout.
8. Major visual redesign.
9. AI content generation.
10. Cloud sync.

## 14. Testing

Run the strongest available checks.

At minimum:

1. TypeScript build.
2. Production build.
3. Browser/manual smoke test if available.

Test cases:

1. Create a block with long content.
2. Confirm the block does not auto-grow.
3. Confirm large always-visible scrollbar is not shown by default.
4. Hover/select the block and confirm scrolling remains possible.
5. Confirm fade overflow appears when content is clipped.
6. Switch block to compact mode.
7. Switch block to title-only mode.
8. Use global density override: Full / Compact / Title only / Block settings.
9. Use `Fit current content`; confirm height changes and content is visible.
10. If variants exist, use `Fit largest variant`; confirm it accounts for different variant lengths.
11. Refresh and confirm block sizes and display modes persist.
12. Export/import and confirm display modes and fitted sizes persist.
13. Confirm math rendering remains stable.

## 15. Acceptance criteria

This task is complete when:

1. Blocks support full / compact / title-only display modes.
2. Toolbar has a global display density override.
3. Long block content no longer shows a large always-visible scrollbar by default.
4. Overflow is indicated by a subtle fade.
5. Scrolling still works on hover or selected block.
6. `Fit current content` is available and works.
7. `Fit largest variant` is available if variants exist, or disabled/fallback documented if not.
8. Block dimensions are not automatically changed by content edits.
9. Version switching, if present, does not change block size automatically.
10. Display modes and fitted dimensions persist across refresh and export/import.
11. Build passes without TypeScript errors.
12. No obvious console errors during basic interaction.

## 16. Result file

After implementation, create a result file:

```text
results/asteria_v0_5_6_result.md
```

The result should include:

1. Summary.
2. Files read.
3. Files modified.
4. Commands run and exit statuses.
5. Tests performed.
6. Acceptance criteria passed.
7. Known issues.
8. Skipped or partially completed items.
9. Recommended next task.
