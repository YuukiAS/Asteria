# Asteria

Asteria is a local-first visual canvas for building and reviewing statistical model notes. It combines React Flow blocks, rich text, LaTeX equations, typed research blocks, and model-version variants in one editable map.

Current app version: `0.6.0`.

## Run

```bash
npm install
npm run dev
```

The dev server is configured for `http://127.0.0.1:5173/`.

## Build

```bash
npm run build
```

## Data

Maps are stored locally in IndexedDB under the `asteria-map` database. The top toolbar provides JSON import and export. Exported maps include nodes, edges, block styling, rich-text JSON, model versions, variant content, viewport state, Story outline items, and Story deck settings.

Asteria also keeps up to three changed local backup snapshots. Backups are checked every five minutes and unchanged canvases are skipped, so old restore points are not replaced by identical saves. Use the top-left Restore menu beside the Saved/Unsaved status to restore a recent backup.

## Core Workflow

- Use the canvas to place model, prior, theorem, result, dataset, notation, and related research blocks.
- Use Move mode for dragging and layout. Use Edit mode for direct block editing.
- Double-click the canvas to create a new block at that position.
- Double-click a block to enter inline editing.
- Click an empty canvas background while editing to return to Move mode.
- Drag undo is supported with `Ctrl+Z` / `Cmd+Z` when focus is not inside a text editor.

## Story Outline

Asteria includes a Story panel in the right sidebar for building a low-density research story deck from existing canvas material. This is an outline and Markdown export workflow, not a slideshow editor or PPT editor.

- Select one or more blocks/groups, then use `Add selected` in the Story panel to append them to the outline.
- Multiple selected sources are appended in visual reading order: top-to-bottom, then left-to-right.
- Reorder outline rows with visible Move Up / Move Down controls.
- Clicking an outline row selects its source block/group on the canvas.
- Each outline item can store a slide title, density, and speaker notes.
- If a source block/group is deleted, the outline row remains marked as missing and Markdown export skips it without crashing.

The toolbar action order is `Import`, `Export`, `Export Markdown`, `Delete`. `Export` remains the existing JSON map export. `Export Markdown` writes a story deck named like `<deck-title>-asteria-story-<timestamp>.md`.

Story Markdown export resolves block content through the same version inheritance rules used by the canvas. The export includes one `## Slide N - <title>` section per outline item, optional source metadata, main message content, key formulas, optional speaker notes, and an optional final PPT-generation prompt. Inline and block equations are preserved as Markdown/LaTeX.

## Model Versions

Asteria supports ordered model versions such as `TRACE`, `TRACE+HMSC`, and `Marked TRACE`. The version names are user-defined; examples are not hard-coded.

Block content uses sequential inheritance:

- A block with own content in `V1` is visible in `V1` and inherited by later versions until a later own variant exists.
- A block first created in `V2` is hidden in `V1`, own in `V2`, and inherited in `V3`.
- A block first created in `V3` is hidden in `V1` and `V2`, and own in `V3`.
- Editing inherited content creates an own variant for the requested version without changing the source version.
- `All` mode shows every block, including hidden/recoverable blocks.
- Concrete version views hide blocks with no content at or before that version, and also hide connected edges.

Block headers show compact version markers. Filled markers mean the block has own content for that version; empty markers mean inherited, base, or hidden state. Fixed-version blocks show the concrete short label such as `V1`, not a `PIN` label.

## Block Types And Colors

Block types control background and border presets, not body text color. Body text remains readable by default, while rich text can still have manual text colors and highlights.

Current block types:

- Generic
- Definition
- Notation
- Model
- Prior
- Assumption
- Theorem
- Algorithm
- Dataset
- Result
- Reference
- Remark
- Example
- Warning
- TODO

Changing a block type updates the block background and border only when the block still uses the previous type defaults. If the user manually changed the background or border, the manual color wins. The inspector also includes `Apply type style` to restore the selected type's background and border preset.

New block bodies start empty so type-specific placeholders can appear during editing. Result and TODO templates are placeholders, not inserted content.

## Rich Text

Blocks use TipTap rich text with:

- Text color and highlight color
- Bold, italic, underline, strike, code, quote, headings, lists, links, and alignment
- Inline math and display equations rendered with KaTeX
- Notion-style divider insertion by typing `---` on an empty line
- A floating selection menu for common inline formatting

Equation editing uses a canvas-side dialog with live preview. Invalid or incomplete LaTeX displays an invalid-equation state until the expression parses. Inline equation dialogs submit with Enter and do not allow newline entry; block equation dialogs allow multiline LaTeX and submit with `Ctrl+Enter` / `Cmd+Enter`.

## Inspector

The right inspector is split into collapsible, reorderable sections. Block editing is organized around object settings, variants, markers, appearance, content, and metadata. The Variants section shows compact rows such as:

- `TRACE (V1)` - `Own`
- `TRACE+HMSC (V2)` - `Inherits V1`
- `Marked TRACE (V3)` - `Hidden`
- `TRACE (V1)` - `Base`

Each variant row has actions for copying the currently resolved content into that version and deleting own content when available.

## Canvas And Layout

- Blocks can be resized in Edit mode.
- Large block content avoids heavy visible scrollbars and shows a subtle overflow fade.
- Fit controls can resize the selected block to the current content or the largest variant content.
- Groups/frames can contain blocks.
- Edges support line style, path type, arrows, stroke width, labels, and version visibility.
- The celestial canvas background stays behind all nodes and does not affect block text/background rendering.

## Clipboard And Import

Asteria supports internal block copy/paste, style copy/paste, block duplication, edge style editing, and JSON import/export. Imported legacy maps are normalized so older default/common content remains recoverable as base content.

## Project Files

- `src/` contains the React application.
- `src/store/useMapStore.ts` contains the map state and edit actions.
- `src/lib/blockVersionState.ts` centralizes block version resolution.
- `src/lib/exportImport.ts` contains map normalization, import/export helpers, and node creation.
- `images/` is for local screenshots and visual debugging artifacts that should not live in the repo root.
- `logging/` is for local dev-server logs and other transient log files that should not live in the repo root.
- `results/` stores Codex result notes for completed local version tasks.
- `TODO.md` tracks the current implementation plan and design notes.
