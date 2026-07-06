# Asteria 0.2.x TODO

This file replaces the already-implemented V1 prompt. It is a roadmap for the 0.2.x series. The goal of 0.2.x is to make Asteria better for manually organizing TRACE, TRACE+HMSC, and catalogue-aware marked TRACE diagrams without turning the app into a rigid workflow manager.

Codex should use this file in plan mode first. Before making code changes, read `AGENTS.md`, `prompts/AGENT_RULES.md`, `prompts/CHATGPT_RULES.md`, the current V1/V1.1 result files if present, and the relevant frontend skills under `.agents/skills/`. Then propose a concise implementation plan for the current milestone. Do not implement unrelated future milestones unless the user explicitly asks.

## Product principle

Asteria should remain a flexible visual thinking tool. The user decides how many canvases, groups, and diagrams to create. Do not hard-code a TRACE/HMSC canvas layout. Add structure only where it reduces visual clutter or makes repeated diagram editing faster.

The current pain point is not lack of block categories. The main pain point is that the same conceptual block can have different contents across model versions. For example, a `Prior for beta` block may have one form in original TRACE, another in TRACE+HMSC, and another in catalogue-aware marked TRACE. The 0.2.x series should therefore prioritize version-aware content, global version switching, groups/frames, display density modes, alignment, and edge cleanup.

## Default model versions

Use these default version keys and labels unless a better existing project convention is found:

```ts
export type ModelVersionKey = "trace" | "trace_hmsc" | "marked_trace"
```

Display labels:

- `trace`: `TRACE`
- `trace_hmsc`: `TRACE+HMSC`
- `marked_trace`: `Marked TRACE`

The app should also support a `common` fallback internally for content shared across versions. Future customization of version names can be postponed unless it is easy to implement safely.

---

## 0.2.0 — Block variants and global version switch

### Goal

Implement version-aware block content. Each block should behave like a conceptual slot that can show different title/content variants depending on the globally selected model version. This is more important than adding more block types.

### Required behavior

1. Add a global version switcher in the top toolbar with at least:
   - `All`
   - `TRACE`
   - `TRACE+HMSC`
   - `Marked TRACE`
2. `All` mode should be useful for overview. It may show each block's currently preferred/default variant plus small indicators of which variants exist. It does not need to display all variant contents simultaneously.
3. Selecting a version should update all version-aware blocks globally. The user should not have to switch each block one by one.
4. Existing V1/V1.1 blocks must migrate safely into a `common` or default variant. Do not lose existing title, rich text content, colors, status, emoji, edge style, or position.
5. Each block should keep shared layout/style fields at the block level: position, size, background color, border color, text color, node type, status, emojis.
6. Each block should store version-specific title/content in a `variants` object. Suggested structure:

```ts
type BlockVariantKey = "common" | ModelVersionKey

type BlockVariant = {
  title: string
  contentJson: JSONContent
  contentHtml?: string
  updatedAt: string
}

type BlockData = {
  // existing shared fields
  nodeType: BlockNodeType
  backgroundColor: string
  textColor: string
  borderColor: string
  width: number
  height: number
  showStatus?: boolean
  status?: BlockStatus
  emojis?: string[]

  // new fields
  variants?: Partial<Record<BlockVariantKey, BlockVariant>>
  activeVariantKey?: BlockVariantKey

  // legacy fields can remain during migration but should not be the long-term canonical content
  title?: string
  contentJson?: JSONContent
  contentHtml?: string
}
```

A different equivalent structure is acceptable if it preserves the same behavior and import/export compatibility.

### Inspector behavior

1. The block inspector should show which version is currently being edited.
2. Provide controls to add/copy/remove a variant:
   - `Copy current content to TRACE`
   - `Copy current content to TRACE+HMSC`
   - `Copy current content to Marked TRACE`
   - or an equivalent compact UI.
3. If the currently selected global version has no block-specific variant, the block should fall back to `common` and clearly indicate this in the inspector.
4. Editing while in a version view should update that version's variant. Editing while in `All` can update `common` unless the user explicitly selects a variant in the inspector.
5. Do not overwrite one version's content when editing another version.

### Canvas behavior

1. Block preview should show the content for the currently active global version, falling back to `common`.
2. A small version indicator on the block is useful, for example `TRACE`, `HMSC`, `MARKED`, or `COMMON`, but keep it subtle.
3. If a block has multiple variants, show small dots or badges to indicate variant availability.
4. Global switching should be fast and should not trigger unnecessary layout shifts.

### Persistence and import/export

1. IndexedDB persistence must preserve all variants.
2. JSON export/import must preserve all variants.
3. Legacy JSON without `variants` must still import.
4. If a variant is malformed, fallback to `common` or an empty document and `console.warn`.

### Acceptance criteria

- Global version switcher exists and updates all blocks.
- A block can have at least two different version contents.
- Editing a `TRACE` variant does not modify the `Marked TRACE` variant.
- Legacy saved maps still load.
- Export/import preserves variants.
- Build passes.

---

## 0.2.1 — Groups / frames

### Goal

Add lightweight frame/group regions so related blocks can be visually grouped. This helps organize notation, model components, priors, results, caveats, and other regions without forcing a predefined canvas structure.

### Required behavior

1. Add a frame/group object that appears as a large background rectangle with a title.
2. It should support:
   - title
   - background color
   - border color
   - opacity
   - lock/unlock
   - resize
   - move
3. Frames should stay behind regular blocks visually.
4. A frame may contain blocks by spatial containment or explicit parent-child relationship. Choose the approach that is most stable with React Flow.
5. Moving a frame should be able to move the contained blocks. If this is difficult, implement manual `Attach selected blocks to frame` first.
6. Locked frames should not be accidentally selected while editing blocks.
7. Frame data must persist and export/import correctly.

### Optional behavior

1. Collapse/expand frame.
2. Hide/show all blocks inside a frame.
3. Send frame to back / bring frame forward within the frame layer.

### Out of scope

Do not implement forced canvas templates or auto-generated TRACE/HMSC sections.

### Acceptance criteria

- User can create a frame.
- User can place blocks visually inside a frame.
- Frame can be moved/resized without corrupting block positions.
- Frame can be locked to avoid accidental movement.
- Export/import and refresh preserve frames.

---

## 0.2.2 — Display density modes

### Goal

Make diagrams easier to read in both self-study and group-meeting contexts. A block should not always need to show its full rich text content.

### Required behavior

1. Add per-block display mode:

```ts
type BlockDisplayMode = "full" | "compact" | "title_only"
```

2. `full`: current behavior, show rich text preview with scroll if needed.
3. `compact`: show title, type badge, status/emoji/version indicators, and a short preview. Limit height or line count. Math should not break layout.
4. `title_only`: show only title, type badge, status/emoji/version indicators.
5. Add a toolbar-level global display density override:
   - `Use block settings`
   - `Full`
   - `Compact`
   - `Title only`
6. The global override should not permanently overwrite per-block settings unless the user explicitly chooses a persistent action.
7. Display mode must persist per block.

### Acceptance criteria

- User can make a dense overview using compact/title-only mode.
- Switching global display mode is immediate.
- Rich text content is not deleted or modified by display mode changes.
- Export/import and refresh preserve per-block display mode.

---

## 0.2.3 — Alignment, distribution, snap grid, and micro-straighten

### Background

The canvas is visually infinite, but React Flow nodes still have finite world coordinates. Alignment works by modifying selected nodes' `position.x` and `position.y` in this coordinate system. It does not require a finite canvas boundary.

### Goal

Improve diagram cleanliness. The app should help align blocks and fix small edge distortions caused by nearly-but-not-exactly aligned nodes.

### Required alignment tools

Add multi-select layout tools. If multi-select is not already reliable, implement or improve it first.

Required commands:

1. Align left
2. Align right
3. Align top
4. Align bottom
5. Align horizontal center
6. Align vertical center
7. Distribute horizontally
8. Distribute vertically
9. Snap selected to grid
10. Snap all blocks to grid

Suggested grid size: 8px or 10px, configurable in constants.

### Micro-straighten tool

Add a command such as `Straighten near-axis edges` or `Clean up micro-misalignment`.

The purpose is to fix tiny distortions in edges that should visually be straight. It should only make small coordinate changes, not reorganize the diagram.

Suggested algorithm:

1. For each visible edge, compute source and target anchor coordinates in world space.
2. If the edge is intended to be mostly vertical and `abs(sourceX - targetX) <= tolerance`, adjust one endpoint node's `x` by the small delta needed to align anchors.
3. If the edge is intended to be mostly horizontal and `abs(sourceY - targetY) <= tolerance`, adjust one endpoint node's `y` by the small delta needed to align anchors.
4. Use a small tolerance, for example 6–12px.
5. Do not alter edges that are clearly diagonal or intentionally curved.
6. Do not move locked frames or blocks inside locked frames unless explicitly allowed.
7. Prefer applying to selected nodes/edges if selection exists; otherwise apply globally.
8. If several edges give conflicting tiny adjustments to the same node, use the median/smallest adjustment or skip that node and report a warning in console.

This does not need to be mathematically perfect. The priority is to remove small visible kinks without disrupting the whole map.

### Acceptance criteria

- Multi-selected blocks can be aligned.
- Multi-selected blocks can be distributed horizontally/vertically.
- Blocks can snap to grid.
- A near-straight edge with a tiny offset can be straightened by one command.
- The command does not move blocks by large distances.
- Build passes.

---

## 0.2.4 — Version-aware edge visibility

### Goal

Edges should not need semantic types, but they should be able to appear only in relevant model-version views. This prevents TRACE edges from cluttering Marked TRACE views, and vice versa.

### Required behavior

1. Add optional edge visibility by version:

```ts
type EdgeVisibility = "all" | ModelVersionKey[]
```

or an equivalent data structure.

2. Edge inspector should let the user choose:
   - visible in all versions
   - visible in TRACE
   - visible in TRACE+HMSC
   - visible in Marked TRACE
   - any combination of the version-specific options
3. Global version switching should filter visible edges.
4. `All` mode should show all edges unless a better overview behavior is already implemented.
5. This is not semantic edge typing. Do not add predefined meanings such as `depends_on`, `uses`, or `proves`.
6. Existing edges should default to visible in all versions.
7. Import/export and persistence must preserve edge visibility.

### Optional behavior

1. Version-specific edge labels. This can be postponed unless easy.
2. Version-specific edge style. This can be postponed unless easy.

### Acceptance criteria

- Edge can be hidden in one version and visible in another.
- Existing maps still show all old edges.
- Global version switch correctly filters edges.
- Export/import preserves edge visibility.

---

## 0.2.5 — Usability polish after real use

This milestone should only be planned after the user has used 0.2.0–0.2.4 on real TRACE/HMSC diagrams.

Candidate tasks:

1. Search and filter by block title, type, status, emoji, and version availability.
2. Export selected blocks or current viewport to SVG/PNG/PDF.
3. Export selected blocks to Markdown/HTML for group-meeting notes.
4. Minimap improvements.
5. Better keyboard shortcuts.
6. Quick style palette for selected blocks.
7. Better mobile read-only mode.
8. PWA offline install.

Do not implement these before 0.2.0–0.2.4 unless the user explicitly reprioritizes.

---

## Current priority order

1. `0.2.0`: Block variants and global version switch.
2. `0.2.1`: Groups/frames.
3. `0.2.2`: Display density modes.
4. `0.2.3`: Alignment, distribution, snap grid, and micro-straighten.
5. `0.2.4`: Version-aware edge visibility.
6. `0.2.5`: Deferred usability polish after real use.

## Non-goals for 0.2.x

Do not implement the following unless the user explicitly asks:

1. Rigid workflow/project-management system.
2. Large block-type taxonomy.
3. Semantic edge taxonomy.
4. Forced TRACE/HMSC template canvases.
5. Cloud sync.
6. Multi-user collaboration.
7. AI generation or summarization.
8. Full mobile editing redesign.
9. A separate backend.

## Result protocol

For each implemented milestone, create a result file under:

```text
prompts/tasks/<milestone_id>_result.md
```

The result file should include:

1. Summary.
2. Files read.
3. Files modified.
4. Commands run and exit status.
5. Tests performed.
6. Acceptance criteria passed.
7. Known issues.
8. Recommended next milestone.

If a milestone is too large, stop after the smallest coherent subset and explicitly report what remains.
