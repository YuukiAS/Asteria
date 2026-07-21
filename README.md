# Asteria

Asteria is a local-first visual canvas for building and reviewing statistical model notes. It combines React Flow blocks, rich text, LaTeX equations, typed research blocks, and model-version variants in one editable map.

Current app version: `0.8.8`.

## Run

```bash
npm install
npm run dev
```

The dev server is configured for `http://127.0.0.1:5173/`.

For the shared server used by the Slurm/Cloudflare deployment:

```bash
npm run serve:shared
```

This starts Asteria with same-origin `/api/asteria/*` persistence on `http://127.0.0.1:5174/` by default.

## Build

```bash
npm run build
npm run test:search
npm run test:edges
```

## Data

When Asteria is opened through the shared Slurm/Cloudflare server, the server stores only one shared version in `.runtime/asteria-server/shared-map.json`. If a shared version already exists, Asteria requires a startup choice before editing: load the shared version or start a new local draft. The app shows `Shared` in the top toolbar when this mode is active.

When the shared API is unavailable, including ordinary `npm run dev` sessions, maps are stored locally in IndexedDB under the `asteria-map` database. The app shows `Local` in the top toolbar in this fallback mode.

The top toolbar provides Save, JSON import, and export. Save opens a confirmation dialog: `Save shared version` publishes the current canvas as the single shared version, while `Save fixed version` creates a local fixed checkpoint. Exported maps include nodes, edges, block styling, rich-text JSON, Symbol entries, model versions, variant content, viewport state, Story outline items, and Story deck settings.

The full toolbar with text labels is intended for browser viewports at least `1600px` wide. Below that width, including a typical 15.6-inch 1920x1080 laptop at 125% OS scaling where the browser viewport is about `1536px`, toolbar actions stay icon-only to prevent label overlap.

Asteria keeps restore points locally in IndexedDB. Restore shows the current shared version when available, up to three recent local versions checked every five minutes, and up to three fixed local versions created with Save. Loading a restore point first creates a local safety backup, then restores the saved layout while keeping newer block variant content from the current workspace. Publish it with Save if the restored workspace should become the shared version.

Shared saves use a revision check only when Save publishes to the shared version. If another computer saved first, Asteria shows a confirmation dialog instead of repeatedly interrupting normal editing.

## Core Workflow

- Use the canvas to place model, prior, theorem, result, dataset, notation, symbol, and related research blocks.
- Use Move mode for dragging and layout, Edit mode for direct block editing, and Zoom mode for near-fullscreen block reading.
- Switch modes with `Alt+1`, `Alt+2`, and `Alt+3`, or use the top toolbar mode control.
- Click Add block to create a Medium `340 x 220 (default)` block, or hover/focus the Add block control to choose Small, Medium, or Large.
- Double-click the canvas to create a new block at that position.
- Double-click a block to enter inline editing.
- Click an empty canvas background while editing to return to Move mode.
- Inside nested lists, use `Enter` on an empty nested item to continue writing in the parent list item. Use `Shift+Tab` on an empty list item, or on the final top-level list item after typing text, to exit into an unindented paragraph without moving or renumbering the previous list content; nested non-empty list items keep the editor's normal indent and outdent behavior.
- Drag undo is supported with `Ctrl+Z` / `Cmd+Z` when focus is not inside a text editor.
- Open global search from the toolbar or with `Ctrl+F` / `Cmd+F` when focus is not inside a text editor. Search covers the current rendered model version, including block titles, rich text, inline equations, block equations, and Symbol entries.

## Story Outline

Asteria includes a Story panel in the right sidebar for building a low-density research story deck from existing canvas material. This is an outline and Markdown export workflow, not a slideshow editor or PPT editor.

- Select one or more blocks/groups, then use `Add selected` in the Story panel to append them to the outline.
- Multiple selected sources are appended in visual reading order: top-to-bottom, then left-to-right.
- Reorder outline rows with visible Move Up / Move Down controls.
- Clicking an outline row selects its source block/group on the canvas.
- Each outline item can store a slide title, density, and speaker notes.
- If a source block/group is deleted, the outline row remains marked as missing and Markdown export skips it without crashing.

The toolbar action order is `Save`, `Import`, `Export`, `Export Markdown`, `Delete`. `Export` remains the existing JSON map export. `Export Markdown` writes a story deck named like `<deck-title>-asteria-story-<timestamp>.md`.

`Add selected` records the selected source block/group, not a frozen copy of the currently visible version text. Story Markdown export resolves block content at export time through the same version inheritance rules used by the canvas.

Story version modes:

- `Toolbar version`: use the version currently selected in the top toolbar.
- `Default content`: use each block's default/base content.
- `Selected version`: use the fixed version selected inside the Story panel.

The export includes one `## Slide N - <title>` section per outline item, optional source metadata, main message content, key formulas, optional speaker notes, and an optional final PPT-generation prompt. Inline and block equations are preserved as Markdown/LaTeX.

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
- Symbol
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

Symbol blocks store a compact `Symbol` + `Meaning` list for short mathematical notation indexes. The left Symbol column renders KaTeX previews in both viewing and editing flows; click the preview cell for raw LaTeX editing, or use `Ctrl+Shift+E` / `Cmd+Shift+E` to open the equation dialog for the current Symbol row. Symbols are automatically sorted by mathematical reading order in both preview and editing mode, and exported in Story Markdown as a small table. Notation blocks remain the place for longer explanations, examples, data semantics, and usage boundaries.

New block bodies start empty so type-specific placeholders can appear during editing. Result and TODO templates are placeholders, not inserted content.

## Rich Text

Blocks use TipTap rich text with:

- Text color and highlight color
- Bold, italic, underline, strike, code, quote, headings, lists, links, and alignment
- Inline math and display equations rendered with KaTeX
- Lightweight LaTeX search for inline and display equations, including raw `inlineMath.attrs.latex` and `blockMath.attrs.latex`
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
