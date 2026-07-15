# Changelog

## 0.6.9 - Shared Server Persistence

- Added a same-origin shared persistence API for the Slurm/Cloudflare Asteria deployment so computers using the same public URL read and write the same map.
- Kept IndexedDB as the fallback storage mode when the shared API is unavailable, including ordinary local `npm run dev` sessions.
- Added revision checks so a stale browser cannot silently overwrite a map saved from another computer.
- Routed shared backups through repo-local `.runtime/asteria-server/backups/` and kept Restore working in shared mode.
- Updated JSON import confirmation text so shared imports clearly replace the server map for every computer using that URL.

## 0.6.8 - Block Header Menus And Preview Parity

- Replaced canvas/topbar native dropdowns for active version, display density, block version, and block type with styled fixed-position menus.
- Kept each dropdown panel aligned to the closed trigger width and position so menus no longer drift or resize independently of their controls.
- Matched block-header version/type closed-state sizes between selected and unselected blocks, prevented dropdown horizontal scrollbars, and animated chevrons on open/close.
- Removed the manual Save toolbar button, since canvas changes already autosave.
- Removed the global density `Auto` option; the toolbar now exposes only explicit `Full`, `Compact`, and `Title` modes.
- Unified toolbar tooltip styling with the dropdown menu surface, kept short tooltips on one line, and aligned tooltip arrows to the triggering button.
- Replaced right-panel native dropdowns with the same styled fixed-position menu system used by block headers and the top toolbar.
- Moved the right-panel collapse control into a fixed tab-bar slot so it no longer overlays the Inspector/Story tabs or panel content.
- Replaced the block marker presets with actual emoji choices instead of ASCII symbols.
- Unified rich-text whitespace handling between Edit and Move views so leading spaces before equations in list items no longer create mode-specific rendering differences.

## 0.6.7 - Equation Editing And Scroll Clearance

- Changed equation editing so math nodes open the edit dialog only on explicit click or double-click, not hover.
- Removed the overflow fade overlay from block previews and kept extra bottom scroll clearance for overflowing content.
- Matched block equation horizontal placement between edit and move views by sizing display-math blocks to their rendered content.
- Kept the Equation toolbar slot visible but disabled outside Edit mode so top-toolbar controls stay aligned across Move, Edit, and Zoom.

## 0.6.6 - Block Size Presets

- Added Small, Medium, and Large size presets to the top-toolbar Add block control.
- Kept direct Add block clicks on the Medium `340 x 220 (default)` size while exposing all presets from the hover/focus menu.
- Added a divider between the active version selector and version settings button.

## 0.6.5 - Toolbar Tooltip And List Continuation

- Increased top-toolbar tooltip contrast and stacking so icon-only controls remain readable on narrow screens.
- Added nested-list continuation handling so an empty nested bullet can return to the parent list item with Enter, Tab, or Shift+Tab instead of creating a new parent numbered item.

## 0.6.4 - Block Zoom Mode

- Added a Zoom interaction mode next to Move and Edit, with toolbar access and `Alt+3` keyboard switching.
- Let Zoom mode open a selected block in a near-fullscreen reading overlay while keeping canvas background visible around it.
- Added Zoom overlay click behavior: clicking the zoomed block returns to the canvas while staying in Zoom mode, and clicking the background exits to Move mode.

## 0.6.3 - Block Creation And Equation Editing

- Changed toolbar and empty-inspector block creation to place new blocks at the current canvas view center.
- Let inline equation edit dialogs submit updates with Enter while block equation edit dialogs keep Ctrl/Cmd+Enter submission.
- Ensured block equations leave a trailing editable paragraph so users can continue writing after a display equation at the end of a block.
- Matched block equation sizing between canvas preview and inline edit mode.

## 0.6.2 - Toolbar Tooltips

- Added a reusable top-toolbar tooltip helper so icon-only controls still explain their action on narrow screens.
- Added consistent tooltip, title, and accessible label coverage for toolbar actions including theme, export, import, delete, density, and version controls.

## 0.6.1 - Story Version Label Clarity

- Renamed Story export version modes to `Toolbar version`, `Default content`, and `Selected version`.
- Added tooltips that clarify whether Story export follows the toolbar, uses default/base content, or uses a fixed selected version.
- Updated Story Markdown output and README terminology to match the clearer labels.

## 0.6.0 - Story Outline Markdown Export

- Added a global Story panel for building an ordered story outline from selected blocks and groups.
- Added deterministic visual-order append for multiple selected sources, plus per-row Move Up / Move Down controls.
- Added Story deck settings for deck title, version mode, default density, speaker notes, source metadata, and PPT prompt inclusion.
- Added Markdown story deck export with one linear slide section per outline item, source metadata, key formulas, speaker notes, and a final PPT-generation prompt.
- Preserved story outline and deck settings through local save, backups, JSON export, and JSON import.
- Added conservative TipTap JSON to Markdown conversion for rich text, links, lists, code, dividers, inline math, and block math.
- Updated the toolbar action order to Import, Export, Export Markdown, Delete.

## 0.5.24 - Equation Insertion Reliability

- Added an AGENTS rule to check whether README updates are needed before version or feature commits.
- Routed top-toolbar block equation insertion through the selected block's live TipTap editor instead of patching stored JSON directly.
- Made active content editing render the live rich-text editor regardless of block display density so inserted equations are visible while editing.
- Fixed block math node view updates so edited display equations reliably rerender.
- Made inline equation dialogs submit on Enter without allowing newline entry, while block equation dialogs continue using Ctrl/Cmd+Enter for submit.
- Cleaned up root-level local screenshots and logs into `images/` and `logging/`, with ignore rules and README notes.
- Updated README version and notes for local backups, restore, and equation entry behavior.

## 0.5.23 - Restore Backups

- Removed the global `Backspace` selected-object deletion shortcut so only `Delete` removes selected blocks or edges.
- Added IndexedDB map backups that run every five minutes, keep the latest three changed copies, and skip unchanged canvases.
- Added a top-left Restore menu beside the Saved/Unsaved status with relative backup ages.
- Moved Import between Export and Clear in the toolbar.
- Anchored the version manager popover below its settings button instead of the far right of the toolbar.

## 0.5.22 - Repeat Last Rich Color Shortcut

- Added editor-level `Ctrl/Cmd+Shift+H` handling that reapplies the most recently used text color or highlight color.
- Remembered colors from both the bubble menu and toolbar color controls, including math styling updates.
- Pressing the shortcut again on a selection that already has the repeated color now clears that text color or highlight.
- Kept the default shortcut fallback as yellow highlight until a text or highlight color is chosen.

## 0.5.21 - Hover Equation Editing

- Open the existing equation edit dialog when the pointer moves over inline or block math in edit mode.
- Gate hover editing so a formula only auto-opens once until the pointer leaves that formula.
- Kept the hover gate active while the edit dialog is open so cancelling does not immediately reopen under a stationary cursor.
- Added pointer cursor styling to math nodes so editable formulas are easier to discover.
- Changed the edit-equation confirmation button to `Update` while keeping new equation insertion labeled `Insert`.

## 0.5.20 - Title Editing Double Click

- Removed canvas double-click block creation so new blocks are created from the toolbar button only.
- Kept edit-mode title clicks and double-clicks focused on title editing instead of creating blocks or switching to content editing.

## 0.5.19 - Remove Export Shortcut

- Removed the global `Ctrl/Cmd+E` export shortcut so `Ctrl/Cmd+Shift+E` only opens inline equation entry.
- Kept JSON export available through the toolbar Export button.

## 0.5.18 - Math Clipboard Round Trip

- Copied inline math now uses `$latex$` in plain text so copy, cut, and external paste preserve math intent.
- Added math HTML `data-latex` attributes so same-app rich clipboard paste can restore inline and block math nodes.
- Fixed pasting `$...$` inside an existing paragraph so it inserts inline math at the cursor instead of a block paragraph.

## 0.5.17 - Restore Four-Side Canvas Handles

- Restored edit-mode resize and edge connection hit targets on all four block sides.
- Switched block connection handles to loose-mode four-side handles so visible handles can both start and receive edges.
- Recolored connection handles in amber so edge connectors are visually distinct from blue resize handles.
- Normalized legacy `*-target` edge handles to the matching side to keep imported and existing maps attached.

## 0.5.16 - Empty Inline Equation Dialog

- Open inline equation dialogs with a blank LaTeX field instead of prefilled sample math.
- Kept inline equation insertion at the current editor cursor when `Ctrl/Cmd+Shift+E` is pressed inside block text.
- Kept the block equation dialog's display-math starter content unchanged.

## 0.5.15 - Fix Bubble Menu Mouse Actions

- Moved bubble menu formatting actions from pointer-down-only handling to mouse-down handling so normal clicks apply marks reliably.
- Kept selection-preserving event prevention while restoring text color, highlight, and inline formatting actions inside block editing.

## 0.5.14 - Inline Equation Dialog

- Added an inline equation dialog with live KaTeX preview for block content editing.
- Changed the inline math bubble-menu action from inserting placeholder math to opening the dialog.
- Added `Ctrl/Cmd+Shift+E` to open inline equation entry for the selected block without conflicting with `Ctrl/Cmd+E` export.
- Let Enter confirm inline equations while Shift+Enter still allows line breaks.

## 0.5.13 - Fix Inline Block Text Color

- Fixed text color swatches in the inline block bubble menu so selected content receives TipTap color marks reliably.
- Applied selected text and highlight colors to inline and block math nodes inside block content.
- Preserved math colors when rich block content leaves edit mode and renders as preview HTML.

## 0.5.12 - Type Color Follow-up

- Removed visible `PIN` wording from block version selectors and fixed-version badges; concrete versions now show compact labels such as `V1` or `TRACE (V1)`.
- Made block type changes auto-follow the new type background and border when the block still uses the previous type defaults, while preserving manual colors.
- Made new block content start empty so type-specific editor placeholders can appear during editing.

## 0.5.11 - Sequential Variant Inheritance

- Replaced default-based block variants with ordered version inheritance: later versions inherit from the nearest earlier own variant, while earlier versions do not inherit backward.
- Hid blocks and connected edges in concrete version views when no content exists at or before that version; All mode still shows every block for recovery.
- Made editing inherited content create an own variant for the requested version while preserving the source version.
- Reworked the Variants inspector into a compact version table with Own, Inherits Vn, Hidden, and Base states.
- Kept AUTO and pinned block version selectors on the same sequential inheritance resolver and restored compact PIN Vn labels.
- Preserved default/base content for imported maps and All-mode creation without presenting it as the primary workflow.

## 0.5.10 - Clearer Variant Labels

- Replaced confusing `(default)` variant labels with `inherits default` and explanatory helper text.
- Removed the `PIN` prefix from block version dropdown choices.
- Used version short labels in block version dropdowns when available.

## 0.5.9 - Content Palette and Type Colors

- Let inspector color swatches wrap so Content text and highlight palettes are fully visible.
- Changed Prior block defaults and badges to a matching blue-purple palette instead of yellow.
- Changed Result block defaults and badges to a matching neutral gray palette instead of green.
- Aligned all block type badge backgrounds with their corresponding block background colors.

## 0.5.8 - Clearer Version Header State

- Removed the separate canvas `DEFAULT` fallback badge so it no longer competes with `AUTO` and `PINNED`.
- Kept fallback information in the version strip marker state and tooltip.
- Changed version strip marker labels to fixed numeric positions instead of truncating version short labels.

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
