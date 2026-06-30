# Changelog

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
