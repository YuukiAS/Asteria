---
id: asteria_v1_1
title: Lightweight block types, optional status, emoji markers, and edge styling
created_at: 2026-06-30
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
---

# Asteria V1.1 Task: Lightweight block types, optional status, emoji markers, and edge styling

## 1. Goal

Implement a focused V1.1 upgrade for Asteria. The goal is not to turn the app into a rigid workflow manager. The goal is to make the current visual block map more useful for TRACE/HMSC self-organization and group-meeting diagrams while keeping the interaction lightweight.

The current V1 already supports a local-first visual block map with React Flow, Zustand, Dexie/IndexedDB, Tiptap rich text, KaTeX math, JSON import/export, and basic block/edge editing. V1.1 should keep that foundation and add only lightweight semantic and styling affordances.

Do not over-structure the app. Avoid predefined semantic edge taxonomies, complex priority systems, project-management dashboards, or forced canvas templates.

## 2. Required background reading

Before changing code, read:

1. `prompts/AGENT_RULES.md`
2. `TODO.md`
3. `README.md`
4. Current source files that define map types, store actions, edge rendering, block rendering, inspector UI, constants, import/export, and demo data.
5. Relevant frontend skills listed in `AGENTS.md`, especially React/Tailwind implementation and responsive/accessibility review.

Write the files you read in `prompts/tasks/asteria_v1_1_result.md`.

## 3. Product direction

This task should make Asteria better for manually building model diagrams. The user will decide how many canvases to create and how to organize the TRACE/HMSC material. Do not hard-code any TRACE-specific canvas layout.

The app should provide a small set of block types, optional status indicators, one or two emoji markers per block, and more flexible edge appearance controls. The user can manually write edge labels and semantics; the app should not force edge categories such as `depends_on`, `uses`, `proves`, etc.

## 4. Block types

Currently `BlockNodeType` is only `generic`. Extend it to a small set of lightweight types:

```ts
export type BlockNodeType =
  | "generic"
  | "definition"
  | "notation"
  | "model"
  | "prior"
  | "assumption"
  | "statement"
  | "dataset"
  | "result"
  | "citation"
  | "warning"
  | "todo"
```

Use `statement` as the single type covering theorem, lemma, proposition, corollary, and similar mathematical claims. Do not create separate block types for theorem, lemma, proposition, corollary, proof gap, computation, simulation, slide, decision, etc. If the user wants those distinctions, they can put them in the title/content manually or use emoji.

Implementation requirements:

1. Add a `BlockNodeType` dropdown in the block inspector.
2. Show a small type badge in each block header or near the title.
3. Keep type styling subtle. The type badge can have a small background/border color, but changing type should not unexpectedly overwrite the user's custom block background, border, or text colors.
4. Put type label/color metadata in a constants file, for example `src/constants/blockTypes.ts`.
5. Make import/export compatible with existing `generic` blocks.
6. If imported data contains an unknown node type, fallback to `generic` and `console.warn`.

Suggested display labels:

- generic: Generic
- definition: Definition
- notation: Notation
- model: Model
- prior: Prior
- assumption: Assumption
- statement: Statement
- dataset: Dataset
- result: Result
- citation: Citation
- warning: Warning
- todo: TODO

Suggested subtle type colors can follow the current palette, but avoid strong saturated backgrounds.

## 5. Optional block status

Add a simple optional status indicator for blocks. This is not a priority system and should not be shown by default.

Data model extension:

```ts
export type BlockStatus = "undo" | "doing" | "done"

export type BlockData = {
  // existing fields
  showStatus?: boolean
  status?: BlockStatus
}
```

Requirements:

1. In the block inspector, add a checkbox or toggle: `Show status`.
2. If `showStatus` is enabled, show a status selector with exactly three values:
   - `undo`
   - `doing`
   - `done`
3. Display the status marker at the top-right of the block only when `showStatus` is true.
4. Marker colors:
   - undo: gray
   - doing: blue
   - done: green
5. The marker can be a small pill or dot. Keep it compact and not visually dominant.
6. Default for all new blocks should be `showStatus: false` and `status: "undo"`.
7. Do not add priority labels, deadlines, task lists, or project-management workflow.

## 6. Emoji markers

Allow each block to display one or two manually chosen emoji markers. This is meant to replace overly formal status/priority systems.

Data model extension:

```ts
export type BlockData = {
  // existing fields
  emojis?: string[]
}
```

Requirements:

1. Add two small emoji/text inputs in the block inspector, for example `Emoji 1` and `Emoji 2`.
2. Store the non-empty values as `emojis`, preserving order.
3. Display emojis compactly in the block header, preferably near the type badge or top-right area.
4. Do not add a heavy emoji picker dependency. Plain text inputs are enough for V1.1.
5. If users type more than one character or a short text marker, do not crash; display it compactly or truncate if necessary.
6. Import/export must preserve emojis.

## 7. Edge styling without semantic edge types

Do not implement predefined semantic edge types. Edge meaning should remain manual, through labels and style.

Extend edge data to support visual style:

```ts
export type EdgeLineStyle = "solid" | "dashed" | "dotted"
export type EdgePathType = "smoothstep" | "bezier" | "straight" | "step"
export type EdgeArrow = "none" | "forward" | "backward" | "both"

export type MapEdgeData = {
  label?: string
  color?: string
  lineStyle?: EdgeLineStyle
  pathType?: EdgePathType
  arrow?: EdgeArrow
  strokeWidth?: number
  createdAt: string
  updatedAt: string
}
```

Requirements:

1. Edge inspector must support editing:
   - label
   - color
   - line style: solid / dashed / dotted
   - path type: smoothstep / bezier / straight / step
   - arrow direction: none / forward / backward / both
   - stroke width, with a small reasonable range such as 1, 1.5, 2, 3, 4
2. Arrow direction semantics:
   - none: no arrowheads
   - forward: source → target
   - backward: target → source
   - both: arrows on both ends
3. Use React Flow marker support where possible. If exact marker support requires small adjustments, implement the closest stable behavior.
4. Edge style changes must render immediately on the canvas.
5. New edges should still use sensible defaults: gray, solid, smoothstep, forward, width 1.5.
6. Existing imported edges without these new fields should fallback to defaults.
7. Do not add semantic edge category dropdowns.

## 8. Copy/paste edge text and style

Make edge styling faster to reuse.

Required features:

1. In the edge inspector, add `Copy style` and `Paste style` buttons.
2. `Copy style` should copy the selected edge's visual style fields into an internal app clipboard: color, lineStyle, pathType, arrow, strokeWidth.
3. `Paste style` should apply the internal edge style clipboard to the selected edge.
4. Preserve this internal edge style clipboard at least within the current browser session. If easy, persist it to localStorage.
5. Add `Copy label` button for the selected edge label. Use `navigator.clipboard.writeText` when available; fallback gracefully if unavailable.
6. If easy and reliable, add `Paste label` from system clipboard; if not, skip it and mention in the result.

Do not overbuild a global style manager in this task.

## 9. Block duplication and block style copy/paste

This is useful for drawing diagrams quickly and is in scope if it can be done without destabilizing the current app.

Implement the following if reasonably straightforward:

1. `Duplicate block` button in block inspector.
2. Keyboard shortcut `Ctrl/Cmd+D` to duplicate the selected block, but only when focus is not inside Tiptap/editor/input controls.
3. Duplicate should copy type, rich text content, size, background color, text color, border color, emojis, and optional status, but create a new id and shift position slightly.
4. `Copy block style` and `Paste block style` buttons in block inspector. Style should include background color, text color, border color, width, height, nodeType, emojis, showStatus, and status. It should not overwrite content unless duplicating.

If this becomes too large, prioritize edge style controls and block types first, then document unfinished block duplication/style-copy work in the result.

## 10. Import/export and persistence

Update import/export, IndexedDB persistence, demo data, and migration logic for all new optional fields.

Requirements:

1. Existing V1 JSON files must continue to import.
2. Missing optional fields must get safe defaults.
3. Unknown block types fallback to `generic` with a warning.
4. Unknown edge styles fallback to defaults with a warning.
5. Exported JSON should preserve all new fields.
6. Refreshing the browser should preserve block type, emojis, optional status, edge line style, arrows, path type, and copied style defaults if persisted.

## 11. UI and visual constraints

Keep the UI restrained and research-tool-like.

1. Do not make type colors dominate block content.
2. Type badge, emojis, and status marker must fit in the header without cluttering the block.
3. Inspector controls should remain compact.
4. The new controls should not make basic rich-text editing harder to access.
5. Maintain dark mode if V1 already supports it.
6. Preserve existing responsive behavior.

## 12. Testing and validation

Run the strongest available checks in this repository. At minimum:

1. TypeScript build.
2. Vite production build.
3. If a browser smoke test is already available or easy to run, test adding block, changing type, adding emoji, toggling status, editing edge style, and exporting/importing JSON.

The result file must state exact commands and outcomes.

## 13. Acceptance criteria

V1.1 is complete when:

1. `BlockNodeType` includes the reduced type list above.
2. Block inspector can change block type.
3. Blocks display a compact type badge.
4. Blocks can optionally show status: undo / doing / done.
5. Status is hidden by default and only shown when manually enabled.
6. Blocks support one or two emoji markers.
7. Edge inspector supports color, line style, path type, arrow direction, stroke width, and label.
8. Edges can show no arrow, forward arrow, backward arrow, or both arrows.
9. Edge style can be copied and pasted through the inspector.
10. Edge label can be copied through the inspector.
11. Existing V1 saved maps/imported JSON still load.
12. New fields survive refresh and JSON export/import.
13. Build passes without TypeScript errors.
14. No obvious console errors during basic interaction.

Optional but desirable:

15. Duplicate selected block.
16. Copy/paste block style.
17. `Ctrl/Cmd+D` duplicates selected block when focus is not in an editor/input.

## 14. Out of scope

Do not implement in this task:

1. Predefined semantic edge types such as depends_on, uses, proves, supports, etc.
2. Large block-type taxonomy.
3. Separate theorem, lemma, proposition, corollary types.
4. Priority system.
5. Deadlines or project-management task views.
6. Forced TRACE/HMSC canvas templates.
7. Automatic layout.
8. Group/frame regions.
9. Search/filter.
10. Markdown/LaTeX/PDF/SVG export.
11. Cloud sync.
12. PWA installation.
13. Full mobile editing redesign.

## 15. Result file

After implementation, create:

```text
prompts/tasks/asteria_v1_1_result.md
```

The result must include:

1. Execution summary.
2. Files read.
3. Files modified.
4. Commands run and exit statuses.
5. Tests performed.
6. What acceptance criteria passed.
7. What was skipped or only partially completed.
8. Known issues.
9. Next recommended task, if any.

Be explicit about failures. Do not claim completion for features that were not verified.
