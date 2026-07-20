# Asteria Symbols And Search Result

## Sync

- Branch: `main`
- Starting SHA after `git pull --ff-only origin main`: `d214ad32079c74875271481691f7163bb279ec12`
- Final local commit SHA: recorded in the final Codex response after the `v0.8.0` commit is created. A commit cannot contain its own final SHA without changing that SHA.
- Version used for this user-visible release: `0.8.0`

## Modified Files

- `CHANGELOG.md`
- `README.md`
- `package.json`
- `package-lock.json`
- `src/app/App.tsx`
- `src/components/BlockNode.tsx`
- `src/components/InspectorPanel.tsx`
- `src/components/SymbolEntries.tsx`
- `src/components/Toolbar.tsx`
- `src/constants/blockDefaults.ts`
- `src/constants/blockTypes.ts`
- `src/constants/palette.ts`
- `src/lib/exportImport.ts`
- `src/lib/mapSearch.ts`
- `src/lib/storyMarkdownExport.ts`
- `src/lib/symbolEntries.ts`
- `src/store/useMapStore.ts`
- `src/styles/index.css`
- `src/types/map.ts`
- `results/asteria_symbols_search_result.md`

## Symbols Data Structure

`BlockNodeType` now includes `symbols`. Symbols entries are stored as optional per-variant data on `BlockVariant`:

```ts
type SymbolEntry = {
  id: string
  latex: string
  meaning: string
  createdAt: string
  updatedAt: string
}
```

No global symbols store was added. `symbolEntries?: SymbolEntry[]` belongs to the concrete rendered block variant, so V1/V2/V3 can carry independent entries and inherited variants resolve through the existing version system.

## Sorting Rules

`src/lib/symbolEntries.ts` adds `symbolSortKey(latex)`.

- Trim input.
- Strip outer `$...$` / `$$...$$`.
- Collapse ordinary whitespace and defensively collapse repeated leading command slashes for imported/pasted data.
- Extract a leading LaTeX command or Latin base symbol without requiring a full LaTeX parser.
- Sort Greek commands by Greek alphabet order, case-insensitively for base order.
- Sort Latin symbols alphabetically.
- Use normalized LaTeX as fallback and tie-breaker.

Manual smoke data verified that `\alpha_j^{\mathcal K}`, both beta variants, `\Gamma`, and `\Psi` render in mathematical order, with beta entries adjacent.

## Search Coverage

`src/lib/mapSearch.ts` implements structured current-version search over:

- block title
- text nodes in `contentJson`
- `inlineMath.attrs.latex`
- `blockMath.attrs.latex`
- Symbols `entry.latex`
- Symbols `entry.meaning`

Search uses the same rendered variant resolution as the canvas and skips blocks hidden in the active model version. It does not search all versions.

## Math Search Implementation

Search recursively traverses Tiptap JSON and identifies equations only from:

```ts
node.type === "inlineMath"
node.type === "blockMath"
node.attrs?.latex
```

LaTeX search normalizes by stripping outer dollar wrappers, collapsing whitespace, and ignoring ordinary spaces in math strings. It does not implement semantic equivalence matching.

Verified query examples:

- `v_j` matched inline equation and Symbols entry.
- `\Omega` matched the block equation `\Omega=\Lambda\Lambda^\top+I` as `Block equation`.
- `\beta_j^{\mathcal K}` matched Symbols entry LaTeX.

## UI And Navigation

- Toolbar now includes a Search button using the Lucide `Search` icon.
- `Ctrl+F` / `Cmd+F` opens app search only when focus is not in input, textarea, select, contenteditable, or ProseMirror.
- `Escape` closes the search panel.
- Enter opens the first result.
- Clicking a result closes the panel, selects the target block, centers it with React Flow `setCenter`, and applies a temporary block highlight animation.
- Store selection now synchronizes node `selected` flags so programmatic search navigation produces the same selected block styling as pointer selection.

## Colors

- Symbols default style: background `#fffbeb`, border `#fbbf24`, normal text color.
- `#fffbeb` was added to shared `backgroundPalette`.
- Inspector Appearance now exposes background, text, and border color controls for blocks.
- Manual color changes persist through store autosave and are not overwritten by default block styles.
- The existing "Apply type style" action can restore Symbols defaults.

Browser checks confirmed `Use #fffbeb` appears in the Inspector color swatches, and a manual background change to `#dbeafe` persisted in IndexedDB.

## JSON, Variants, Copy Compatibility

- Import normalization validates `symbolEntries`, trims strings, drops invalid/empty-LaTeX entries, and fills missing ids/timestamps.
- Old JSON without `symbolEntries` loads as an empty list.
- JSON export/import shape remains `version: 1`.
- Variant inheritance, copy-to-version, duplicate block, and copy/paste block preserve entries because entries live inside `BlockVariant` and full block data cloning already carries variants.
- Shared/local persistence and backups use normalized/exported map data, so the new optional field is carried with the existing map structure.

## Markdown Export

Story Markdown export renders Symbols entries as a compact Markdown table instead of empty content:

```md
| Symbol | Meaning |
|---|---|
| `\alpha_j^{\mathcal K}` | Catalogue-species baseline commonness. |
```

## Verification

Commands run:

- `git fetch origin`
- `git status --short`
- `git branch --show-current`
- `git log --oneline --decorate -8`
- `git pull --ff-only origin main`
- `npm run build`

Build result:

- `tsc -b && vite build` passed.
- Vite reported only the existing large chunk warning.
- No `lint` or `test` scripts exist in `package.json`.

Browser smoke test:

- Local Vite served `http://127.0.0.1:5173/` with HTTP 200.
- Isolated headless Chrome used a temporary empty profile on CDP port `9223`.
- Verified Symbols render, default colors, sorted preview, color palette, manual color persistence, add/delete editing path, JSON round-trip preservation, current-version search, result navigation selection/highlight, and independent V2 Symbols entries.
- Search coverage summary returned true for title, text, inline equation, block equation, Symbol, and Symbol meaning.
- Search navigation debug returned selected/highlighted `text-math-main` for a `\Omega` block-equation result.
- Screenshot artifact was written outside the repo at `%TEMP%\asteria-symbols-search-final-smoke.png`.

## Known Limits

- Search is intentionally limited to the active/rendered model version.
- Search does not implement semantic-equivalent math matching.
- Search highlights the whole block only, not a precise equation or character range.
- Symbols does not implement registry, ids visible to users, hover definitions, prior linking, block anchors, or automatic extraction from formulas.

## Unfinished Items

None.
