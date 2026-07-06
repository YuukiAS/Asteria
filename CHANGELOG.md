# Changelog

## 0.1.12 - 0.1.x Final Planning and App Icon

- Added the Asteria compass artwork as a repo asset for the app icon.
- Replaced the top-left text `A` brand mark with the new app icon.
- Translated the 0.2.x TODO into Chinese.
- Updated the 0.2.x plan so model versions are user-defined, capped at five versions, and not hard-coded to project-specific labels.
- Marked micro-straighten as a top-toolbar action placed between Fit and Save in the future 0.2.3 milestone.

## 0.1.11 - Single Emoji Header Markers

- Migrated loaded/imported blocks onto the current block type color defaults while preserving existing blue, purple, and pink block text emphasis colors.
- Reduced block emoji markers to one emoji per block.
- Moved the emoji marker into the block title header position, replacing the blue title dot.
- Added Edit-mode inline emoji editing from the selected block header.

## 0.1.10 - Block Type Color Defaults

- Split text and background color palettes so dark text colors are no longer offered as block backgrounds.
- Added white as the first background swatch and fixed block/group borders to black instead of exposing a border color picker.
- Renamed the Statement block type to Theorem, with old `statement` data normalized on load/import.
- Added block type default colors, warning emoji defaults, Result ordered-list initialization, and TODO checkbox-list initialization.
- Added built-in emoji preset buttons for the two block marker fields while keeping free-form emoji input.

## 0.1.9 - Canvas Editing Improvements

- Fixed inline title editing so the display and editing states keep consistent typography and only show an input frame while actively editing.
- Added inline math rendering for block titles using `$...$` syntax.
- Replaced browser math prompts with a reusable equation dialog that renders KaTeX previews live.
- Added double-click editing for existing inline and block equations.
- Fixed editor click focus behavior so clicking inside multi-line content no longer jumps the caret to the end.
- Restored visible ordered and unordered list markers in editors and previews.
- Added Shift-drag multi-selection in Move mode and a group frame action for selected blocks.
- Updated app metadata to version `0.1.9`.

## 0.1.8 - Asteria 1.2 Editing Enhancements

- Added inline block title editing in Edit mode.
- Added inline block type selection from the block header in Edit mode.
- Reordered the block inspector to Object, Markers, Appearance, Content, and Metadata.
- Added an Edit-mode toolbar equation button for inserting display equations into the selected block.
- Added a persisted editable map title and title-based JSON export filenames.

## 0.1.7 - Block Clipboard Paste

- Added internal whole-block copy/paste support.
- Added `Ctrl/Cmd+C` to copy the selected block when focus is not inside an editor or input.
- Added `Ctrl/Cmd+V` to paste the copied block with preserved content, styling, type, status, emoji markers, and size.
- Added `Copy block` and `Paste block` buttons to the block inspector.
- Kept normal text copy/paste untouched inside Tiptap and form fields.

## 0.1.6 - Collapsible and Resizable Inspector

- Added an animated right inspector collapse/expand control that leaves a compact restore button on the right edge.
- Added drag resizing for the inspector with persisted width and a subtle width readout.
- Reduced the default inspector width from 400px to 360px and constrained it between 320px and 520px.
- Removed inspector horizontal overflow by making the panel width controlled by the shell and tightening narrow action button layouts.
- Added reduced-motion fallbacks for the inspector transition.

## 0.1.5 - Lightweight Types, Status, Emoji Markers, and Edge Styling

- Added lightweight block types: Generic, Definition, Notation, Model, Prior, Assumption, Statement, Dataset, Result, Citation, Warning, and TODO.
- Added compact type badges to block headers without changing user-selected block background, border, or text colors.
- Added optional block status markers with hidden-by-default undo / doing / done states.
- Added two compact emoji marker inputs per block and header display.
- Added edge line style, path type, arrow direction, and stroke width controls.
- Added edge style copy/paste with localStorage-backed app clipboard.
- Added edge label copy using the browser clipboard API when available.
- Added block duplication, block style copy/paste, and Ctrl/Cmd+D duplication with editor/input focus guards.
- Updated import/export normalization so old V1 maps still load, new V1.1 fields persist, and unknown block/edge style fields fallback with console warnings.

## 0.1.4 - Resize Feedback, Math Color, and Drag Recovery

- Made selected blocks visually resize in real time while dragging corner handles, with a subtle resizing highlight.
- Kept the resize dimension readout and synchronized it with the live block size preview.
- Made KaTeX inline and block equations inherit the block text color in both preview and editor modes.
- Changed the rich text toolbar so Text color and Highlight controls stack vertically in the inspector instead of sharing one row.
- Fixed Move mode drag recovery after resizing by showing resize handles only in Edit mode and removing unnecessary `nodrag` / `nopan` blockers from preview content.

## 0.1.3 - Inline Block Editing and Selection Formatting

- Added true inline rich-text editing inside selected blocks in Edit mode, so the caret and text selection appear directly on the canvas.
- Added a Notion-style selection bubble for block text with text color, bold, italic, underline, highlight, link, strike, code, inline math, clear marks, and color swatches.
- Made the key bubble actions for text color, bold, and strike apply directly to the saved ProseMirror selection for reliable canvas editing.
- Added resize dimension feedback while dragging block corners.
- Removed the Content-panel help paragraph to reduce inspector clutter.
- Reordered the block inspector so Content appears before Appearance.

## 0.1.2 - Edit Mode Selection, Delete, and Resize

- Changed Edit mode behavior so canvas panning/hand dragging is disabled.
- In Edit mode, clicking a block title or border selects the block without focusing the text editor, so `Delete` / `Backspace` can remove the selected block.
- In Edit mode, clicking the block content preview focuses the right-side rich text editor for typing.
- Added four-corner resize handles for selected blocks using React Flow `NodeResizer`.
- Resize updates block `width` and `height` in the store and persists through autosave.
- Tightened import normalization so imported block dimensions are clamped to the same resize bounds and valid block types are preserved.

## 0.1.1 - Canvas Edit Mode and Math Preview Fix

- Added a `Move / Edit` toggle in the top toolbar.
- In `Move` mode, blocks remain draggable on the canvas.
- In `Edit` mode, clicking a block selects it and focuses the right-side rich text editor, while block dragging is disabled.
- Added inline math input rules so typing `$x^2$` in the rich text editor automatically converts to rendered inline math.
- Extended paste preprocessing to support both `$...$` inline math and `$$...$$` math forms.
- Fixed canvas block previews for equations by rendering KaTeX directly from the saved Tiptap JSON instead of relying on editor-only NodeView HTML.
- Added a short Content-panel hint explaining how to type inline math and insert display equations.

## 0.1.0 - Asteria V1

- Initialized a Vite + React + TypeScript + Tailwind CSS application.
- Added React Flow infinite canvas with blocks, edges, handles, zooming, panning, selection, and fit-view controls.
- Added Zustand map state for nodes, edges, selection, viewport, save status, and map actions.
- Added Dexie/IndexedDB local persistence with autosave, manual save, and refresh restore.
- Added seeded Bayesian-model demo content with 3 blocks and 2 edges on first empty launch.
- Added block inspector for title, background color, border color, text color, width, height, and metadata.
- Added edge inspector for label and color.
- Added Tiptap rich text editing with toolbar and bubble menu.
- Added text color, highlight color, custom font size, bold, italic, underline, strike, code, lists, headings, quote, links, and alignment.
- Added custom inline and block math nodes rendered with KaTeX.
- Added JSON export/import, import validation, simple legacy content migration, and clear/import confirmations.
- Added keyboard shortcuts for save, export, delete selected object, and clear selection.
- Added calm academic UI styling, semantic CSS tokens, responsive inspector behavior, and a light/dark theme toggle.
- Added README with run/build/data notes and V2 TODOs.
