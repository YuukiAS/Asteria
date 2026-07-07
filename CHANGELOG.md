# Changelog

## 0.5.7 - Version Variant Strip

- Replaced the old undifferentiated blue variant dots with a compact dynamic version strip in block headers.
- Added visible `AUTO`, `PINNED`, and `DEFAULT` fallback badges for block content version state.
- Updated block version selection labels in the inspector to distinguish follow-global behavior from pinned versions.
- Changed toolbar version switching so it no longer rewrites every block's pinned variant state.

## 0.5.6 - Block Overflow Fit Controls

- Hid large block scrollbars by default while preserving hover/selected scrolling with subdued thin scrollbars.
- Added subtle bottom fade indicators for overflowing block previews.
- Added inspector fit commands for current content and largest content variant.
- Updated the global density label to `Block settings`.

## 0.5.5 - Divider Input Rule

- Added a Notion-style divider rule so typing `---` in an empty editor line inserts a horizontal divider.
- Styled dividers consistently in both editable block content and rendered previews.
- Declared the horizontal rule TipTap extension explicitly.

## 0.5.4 - Drag Undo

- Added a canvas drag history snapshot around block/group drag interactions.
- Bound `Ctrl/Cmd+Z` outside text editing controls to restore the graph state before the most recent drag.
- Restored nodes and edges together so connected edge presentation follows the reverted block positions.

## 0.5.3 - Safe Type Presets and Result Directory

- Updated block type colors to the completed TODO palette while keeping block body text at the default readable color.
- Made block type changes preserve manual colors and exposed explicit `Apply type style` behavior for restoring only type background/border presets.
- Converted Result and TODO type templates into placeholders so they do not persist as editable content.
- Moved Codex result files to the root `results/` directory and updated the handoff rules/templates accordingly.

## 0.5.2 - Top Version Picker Cleanup

- Removed `Default` from the top model-version picker so it only shows real user versions.
- Kept `Default` available in the block inspector as the per-block fallback content version.
- Migrated stale top-level `all` active-version state to the first available model version.

## 0.5.1 - Block Type Color System

- Reworked block type defaults so types control block background and border, not body text color.
- Added Algorithm, Reference, Remark, and Example block types and migrated legacy Citation blocks to Reference.
- Added English block type descriptions in the right inspector type picker.
- Added a one-time local canvas migration that resets existing block-level colors to the new type color system while preserving rich-text colors and highlights.

## 0.5.0 - Reorderable Inspector Sections

- Refactored the right inspector into VS Code-style collapsible sections.
- Added per-context section ordering controls with persisted order and collapse state.
- Applied the section stack to block, edge, group, multi-selection, and empty inspector states.

## 0.4.17 - Canvas Equation Dialog

- Moved the equation editor into a top-level canvas-side overlay so dialogs opened from the inspector are not clipped by the right panel.
- Added a live equation preview below the LaTeX input.
- Showed a red `Invalid equation` state for incomplete or invalid LaTeX and disabled insert until the equation parses.

## 0.4.16 - Pane Click Returns to Move

- Added a canvas pane click behavior that exits Edit mode and returns to Move mode.
- Kept the existing selection clearing behavior when clicking empty canvas space.
- Verified the toolbar and React Flow mode classes switch back to Move after clicking the background.

## 0.4.15 - Block Equation Styling

- Made block equations transparent by default so they visually inherit the block surface.
- Added text-color and highlight-color attributes for block equations.
- Let rich-text color and highlight controls style selected block equations as well as inline text.

## 0.4.14 - Bubble Highlight and Palette Fit

- Made the inline bubble menu preserve its visible selection range before applying color or highlight marks.
- Routed bubble highlight swatches through TipTap mark commands so selected text can receive highlight color.
- Removed the brown text swatch and tightened color rows so the inspector text palette fits on one line at the default panel width.

## 0.4.13 - Model Math Default Reset

- Restored Model block math accent colors for formulas without explicit manual text color.
- Kept manually colored inline math as the higher-priority override for only the selected formula.
- Added a block inspector action to reset the selected block back to its block-type defaults and clear manual text-color marks.

## 0.4.12 - Canvas Background Layering

- Moved the readability overlay back into the background layer so it no longer sits above React Flow nodes.
- Isolated the canvas stacking context and forced the React Flow surface above fixed background artwork.
- Verified a centered Prior block now remains visually clear over the brightest background area.

## 0.4.11 - Quiet Canvas Title and Dark Controls

- Kept the canvas title as plain toolbar text by default, including in Edit mode.
- Made the canvas title input appear only after double-clicking the title.
- Improved the React Flow control buttons in dark mode with clearer button surfaces and icon contrast.

## 0.4.10 - Bubble Highlight Palette

- Split the inline rich-text bubble menu color controls into Text color and Highlight sections.
- Added highlight color swatches directly to the selection bubble.
- Reviewed the inspector Content editor and kept it because it still provides full block editing and block-level formatting that the selection bubble does not cover.

## 0.4.9 - Manual Math Color Overrides

- Widened the inline rich-text bubble menu so the full text-color palette fits on one row.
- Let manual text colors override block-type math accent colors for marked inline math.
- Preserved inline-math color marks in the JSON-to-HTML preview renderer.

## 0.4.8 - Opaque Block Surfaces and Version Label

- Fully isolated block surfaces from the celestial canvas background by compositing block backgrounds over the panel color inside each node.
- Removed translucent content-area accents that made text and formulas look visually affected by the canvas artwork.
- Added the current app version beside the Asteria label in the top-left toolbar.

## 0.4.7 - Softer Block Borders

- Replaced the legacy default black block border with a softer slate border for new blocks.
- Rendered existing legacy black block borders as subdued canvas borders without changing saved map data.
- Separated selected-block glow, block border, header divider, and resize guide styling so selected blocks no longer show heavy stacked edge lines.

## 0.4.6 - Fix Default Variant Editing

- Fixed Default content-version edits being overwritten by the existing default variant.
- Restored title and content updates while a block's content version is set to Default.

## 0.4.5 - Opaque Block Backgrounds

- Made block header and content regions explicitly use the block background color.
- Isolated block painting so the celestial canvas background does not visually affect node fills.

## 0.4.4 - Preserve Blank Lines in Preview

- Preserved manually inserted blank paragraphs when leaving inline block editing.
- Rendered empty rich-text paragraphs with an explicit line break so preview mode matches edit mode.

## 0.4.3 - Compact Default Variant Label

- Shortened the missing variant state to `(default)`.
- Right-aligned the default state inside the variant label cell.

## 0.4.2 - Clearer Variant Fallback Labels

- Renamed variant fallback text to `same as Default`.
- Styled the fallback state as a muted italic label so it reads separately from the version name.

## 0.4.1 - App Icon Favicon

- Reused the Asteria toolbar icon as the browser favicon.
- Replaced the empty favicon placeholder with `/app-icon.png`.

## 0.4.0 - Fixed Celestial Canvas Background

- Added a fixed celestial atlas background layer behind the React Flow canvas.
- Kept nodes, edges, controls, minimap, and the subtle dots background above the fixed viewport artwork.
- Made the React Flow canvas transparent so the background image and readability overlay remain visible.
- Added subdued dark-mode treatment and placed the background asset under `public/backgrounds/`.

## 0.3.2 - Inline Editor Type Colors

- Preserved block text color while inline editing content on the canvas.
- Added type-aware rich-text accent color so Model and Theorem math styling stays visible in Edit mode instead of falling back to black.
- Kept the data schema unchanged; the fix is render-time styling only.

## 0.3.1 - Local Workflow Rules

- Documented local dev-server startup rules and background-process verification in `AGENTS.md`.
- Ignored `.codex/` dev-server logs so local runtime files do not pollute git status.

## 0.3.0 - Faster Block Entry Flow

- Added explicit inline edit targeting so selecting a block in Edit mode no longer automatically enters text editing.
- Made new blocks from the toolbar, inspector, and canvas double-click select their title for immediate replacement.
- Added `Enter`, `Ctrl/Cmd+Enter`, and `Ctrl/Cmd+Shift+Enter` flows for entering content, creating adjacent blocks, and creating linked blocks.
- Kept the existing Move/Edit mode toggle and `Alt+1` / `Alt+2` shortcuts intact.

## 0.2.9 - Inline Version Editing

- Renamed the top toolbar's global baseline option from `All` to `Default` for a consistent version vocabulary.
- Added a compact content-version selector directly in the selected block header during Edit mode.
- Preserved inline math text marks in the editor so colored formula content does not disappear when editing a block.

## 0.2.8 - Version Editing Simplification

- Removed the `Follow toolbar` content-version option and made `Default` the baseline content version shown to users.
- Made global version switching batch-update every block's active content version, while the block inspector changes only the selected block.
- Fixed block previews to render from canonical rich-text JSON before falling back to stored HTML, avoiding stale raw-LaTeX HTML when possible.
- Moved saved-version dots beside the block title instead of the right-side metadata group.
- Kept direct canvas editing in Edit mode writing to the currently displayed content version.

## 0.2.7 - Block Variant Editing

- Added a selected-block `Content version` control in the inspector so users can edit Default or a specific user version without switching the global canvas version.
- Added block-specific content version behavior for selected blocks.
- Changed block title and rich-text editing on both the canvas and inspector to write to the currently visible content version.
- Renamed variant copy actions to `Use current` and made them copy the block's current visible content into the target version.
- Clarified the canvas version badge and variant dots with tooltips that explain preview versus saved content versions.

## 0.2.6 - Density Control Placement

- Renamed the toolbar density default from `Use block settings` to compact `Auto` wording.
- Added a clearer display density tooltip explaining Auto and global override behavior.
- Moved the density control to the right side between Import and the theme toggle.

## 0.2.5 - Toolbar and Icon Polish

- Cropped the app icon asset so the compass artwork fills the visible icon instead of leaving large blank margins.
- Tightened the top toolbar so it avoids horizontal scrollbars by collapsing button labels on narrower widths.
- Fixed the micro-straighten `Clean` button so its label does not appear selected after use.
- Moved the version manager into a fixed top-layer panel so the settings button reliably opens the panel.
- Hid corrupted version reorder glyphs and replaced their visible UI with standard arrow indicators.

## 0.2.4 - User Versions, Frames, Density, Layout, and Edge Visibility

- Added user-defined model versions with a maximum of five versions, global version switching, and block content variants with Default fallback.
- Added version management, block variant controls, version indicators, and export/import persistence for versions and variants.
- Expanded frames with opacity, lock state, attach/detach behavior, and persisted frame metadata.
- Added per-block display density and toolbar-level display override.
- Added block alignment, distribution, grid snapping, and a toolbar micro-straighten action between Fit and Save.
- Added edge visibility controls for all versions or selected user versions.
- Removed hard-coded domain/version assumptions from default map title, export fallback, and seeded demo content.

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
