# TODO1 — Sequential Variant Inheritance Workflow

This TODO is for the next Asteria implementation pass. Use it as a planning task first. Do not implement immediately without a concise plan.

## Context sync

Current repo conventions:

- The current project version in `package.json` is `0.5.10`.
- Codex task entry files live under `prompts/tasks/*_task.md`.
- Codex result files live under `results/*_result.md`.
- `AGENTS.md` requires Codex to read `prompts/AGENT_RULES.md` and the task file before execution.
- Completed verified version tasks should create a local git commit, but must not push automatically.
- Version commits should update `package.json` version and `CHANGELOG.md`.

This TODO should be translated into a proper `prompts/tasks/<id>_task.md` if the user wants a handoff task. For now it records the product logic and implementation requirements.

## Problem

The current variant UI treats `Default` as a base content row, and later versions show `(inherit default)` when they do not have separate content. This is not the desired workflow for model development.

The intended workflow is sequential:

```text
Version 1 -> Version 2 -> Version 3 -> ...
```

When the user creates or edits a block while the global version is Version 2, that content should belong to Version 2. If Version 3 has no separate content, Version 3 should inherit from Version 2. Version 1 should not show that block/content unless it has its own earlier content.

Equivalently:

- Later versions inherit from the nearest earlier version with content.
- Earlier versions do not inherit backward from later versions.
- `Default` should no longer be presented as the normal conceptual base for every block.

## Product principle

Asteria variants should behave like ordered model evolution, not like one static default plus optional overrides.

A block is a conceptual slot. Each model version may have its own content. If a version lacks content, it inherits from the nearest previous version with content. If there is no previous content, the block is hidden or empty in that version.

This matches the real workflow:

```text
TRACE -> TRACE+HMSC -> Marked TRACE
```

For example:

1. A block created in `TRACE` should appear in `TRACE`, `TRACE+HMSC`, and `Marked TRACE`, unless overridden later.
2. A block created in `TRACE+HMSC` should be hidden in `TRACE`, appear as own content in `TRACE+HMSC`, and be inherited by `Marked TRACE` unless overridden.
3. A block created in `Marked TRACE` should be hidden in earlier versions.

## Required semantics

Let model versions be ordered:

```ts
modelVersions = [v1, v2, v3, ...]
```

For a requested version `vk`, resolve a block's displayed content using this order:

1. If the block has an own variant for `vk`, display it.
2. Otherwise, find the nearest earlier version `vj`, where `j < k`, with an own variant. Display that content as inherited from `vj`.
3. Otherwise, if the block has legacy/base/common content, display it only if the block is marked as globally visible/base content.
4. Otherwise, hide the block in this version view or show an empty placeholder only in editing contexts.

Do not inherit from later versions to earlier versions.

## Editing semantics

Editing an inherited row should create an own variant for the requested version.

Examples:

- A block has own content in `TRACE+HMSC` and `Marked TRACE` inherits from it.
- The global version is `Marked TRACE`.
- The user edits the title or rich text.
- The app should create a `Marked TRACE` variant initialized from the inherited `TRACE+HMSC` content, then apply the edit to the new `Marked TRACE` variant.
- The original `TRACE+HMSC` variant should remain unchanged.

This should apply both to global AUTO mode and to a pinned version.

## Creation semantics

When creating a new block:

1. If the global version is a concrete version, create the initial content as an own variant for that version.
2. The block should be hidden in earlier versions.
3. The block should be inherited by later versions until they get their own variants.
4. If the global version is `All`, create base/common content visible in all versions, or ask the user later through UI. For the first implementation, base/common visible in all versions is acceptable.

Do not always create new blocks as `Default` content when the user is working inside a concrete model version.

## Pinning semantics

A block can be AUTO or PINNED.

- AUTO means the block follows the global version selector.
- PINNED means the block requests a specific version regardless of the global selector.

Pinned blocks should still use the same inheritance rule. If pinned to Version 3 and Version 3 has no own content, it should inherit from the nearest previous version with content.

## Data model guidance

Current code has:

```ts
export type ModelVersion = {
  id: string
  label: string
  shortLabel?: string
  createdAt: string
  updatedAt: string
}

export type BlockVariant = {
  title: string
  contentJson: JSONContent
  contentHtml?: string
  updatedAt: string
}

export type BlockData = {
  title: string
  contentJson: JSONContent
  contentHtml?: string
  variants?: Partial<Record<BlockVariantKey, BlockVariant>>
  activeVariantKey?: BlockVariantKey
  // shared style/layout fields
}
```

Keep backward compatibility with this structure, but add explicit resolution metadata and helper functions.

Suggested additions:

```ts
type VariantSourceKind = "own" | "inherited" | "base" | "hidden"

type ResolvedVariantState = {
  requestedVersionId?: string
  requestedVersionLabel?: string
  renderedVariantKey?: string
  renderedVersionId?: string
  renderedVersionLabel?: string
  sourceKind: VariantSourceKind
  inheritedFromVersionId?: string
  inheritedFromVersionLabel?: string
  isAuto: boolean
  isPinned: boolean
  isFallbackToBase: boolean
  isHidden: boolean
  tooltip: string
}
```

Implement a central resolver, for example:

```ts
resolveSequentialBlockVariantState(data, activeVersionId, modelVersions)
```

or update the existing `resolveBlockVersionState` to support sequential inheritance.

Avoid duplicating inheritance logic across components.

## UI: right panel variant section

Replace the current `Default is the base content...` design.

Current language such as `(inherit default)` is misleading. Instead, show a version table that reflects sequential inheritance.

Recommended wording:

```text
Versions inherit from the nearest earlier version with content. Editing an inherited row creates an own copy for that version.
```

Each row should correspond to a model version, not to `Default`.

Each row should show:

1. Version label, e.g. `TRACE`, `TRACE+HMSC`, `Marked TRACE`.
2. Source state:
   - `Own content`
   - `Inherits from TRACE`
   - `Inherits from TRACE+HMSC`
   - `Hidden in this version`
3. Actions:
   - `Edit` or `Override` for inherited/hidden rows.
   - `Use current content` or `Copy current here`.
   - `Delete own` only if the row has own content.

If every version has own content, avoid noisy labels like `(default)` or `(inherit default)`. It is enough for each row to show the version name and a subtle `Own` state.

Do not put a large `Default` row at the top unless legacy/base content exists and needs to be managed. If legacy/base content exists, show it in a collapsed advanced section called `Base / legacy content`, not as the main variant model.

## UI: terminology

Use these terms consistently:

- `AUTO`: follows global version selector.
- `PINNED`: fixed to a selected version.
- `Own`: this version has its own content.
- `Inherits from <version>`: this version has no own content and displays earlier content.
- `Hidden`: no content exists at or before this version.
- `Base / legacy`: only for old default/common content or content created in All mode.

Avoid using `Default` as the primary user-facing concept for normal version inheritance.

## UI: inspector selector

The current content-version selector should be revised.

Instead of:

```text
Default / Version 1 / Version 2 / Version 3
```

Use something like:

```text
AUTO: follow global version
PIN TRACE
PIN TRACE+HMSC
PIN Marked TRACE
```

When the selected mode is AUTO, the editing target should normally be the currently requested global version. If that version currently inherits from an earlier version, editing should create an own variant for the requested global version.

When pinned, editing should target the pinned version. If it inherits from an earlier version, editing should create an own variant for the pinned version.

## UI: global version view

When the global version is a concrete version:

- Blocks with own or inherited content for that version should be shown.
- Blocks with no content at or before that version should be hidden from the canvas by default.
- Edges connected to hidden blocks should be hidden.
- In `All` mode, show all blocks so users can recover/edit blocks hidden in specific versions.

This is important: a block created in Version 2 should not clutter the Version 1 view.

## UI: block header indicator

The block header should continue using a compact version strip, but it must reflect sequential inheritance.

Suggested behavior:

- Filled marker: version has own content.
- Empty marker: version has no own content.
- Active ring: requested/current version.
- If current content is inherited, tooltip should say `Showing Marked TRACE by inheriting TRACE+HMSC` or equivalent.
- If hidden in a version, it simply should not show in that version view.

Tooltip examples:

```text
TRACE: own. TRACE+HMSC: own. Marked TRACE: inherits from TRACE+HMSC. Showing Marked TRACE via AUTO.
```

```text
TRACE: hidden. TRACE+HMSC: own. Marked TRACE: inherits from TRACE+HMSC. Showing TRACE+HMSC via PINNED.
```

## Version deletion and reordering

When deleting a model version:

1. Remove that version's own variants.
2. Recompute inheritance using the remaining order.
3. Do not silently copy deleted content into later versions unless the user explicitly chooses to preserve it.

When reordering model versions:

1. Inheritance should follow the new order.
2. Warn the user if reordering may change inheritance behavior.
3. It is acceptable to use a browser `confirm` for the first implementation.

## Import/export and migration

Required compatibility:

1. Existing maps with `default` variants should still load.
2. Existing `default` content should be treated as base/legacy content visible across all versions unless the user converts it.
3. Do not destroy old content.
4. Export/import must preserve version order and own variants.
5. New blocks created in a concrete version should export without requiring a `default` variant as the conceptual source, though legacy mirror fields may remain for compatibility.
6. If internal legacy `title`, `contentJson`, and `contentHtml` fields remain, keep them synchronized to the currently resolved/rendered variant only as compatibility mirrors, not as the main semantic source.

## Implementation notes

Likely files to inspect/update:

- `src/constants/versioning.ts`
- `src/types/map.ts`
- `src/lib/blockVersionState.ts`
- `src/lib/exportImport.ts`
- `src/store/useMapStore.ts`
- `src/components/InspectorPanel.tsx`
- block rendering/header/version strip components
- canvas filtering logic
- demo data
- `CHANGELOG.md`
- `package.json`

Centralize the inheritance logic. Do not implement separate ad hoc fallbacks in the inspector, block renderer, export/import, and store.

## Suggested task id/version

Use a versioned task and commit. Suggested version:

```text
v0.5.11
```

If a newer local version already exists, use the next patch version.

Create a task file if following the handoff protocol:

```text
prompts/tasks/asteria_0_5_11_sequential_variant_inheritance_task.md
```

Write the result to:

```text
results/asteria_0_5_11_sequential_variant_inheritance_result.md
```

## Acceptance criteria

This task is complete when:

1. Creating a block while global version is Version 1 makes it visible in Version 1 and inherited by later versions.
2. Creating a block while global version is Version 2 hides it in Version 1, shows own content in Version 2, and inherits it in Version 3.
3. Creating a block while global version is Version 3 hides it in earlier versions and shows it in Version 3.
4. Editing an inherited version creates an own variant for the requested version and does not modify the inherited source.
5. AUTO follows global version and uses sequential inheritance.
6. PINNED ignores global version but still uses sequential inheritance for the pinned version.
7. The variants panel shows version rows with `Own`, `Inherits from <version>`, or `Hidden`, not `(inherit default)`.
8. The `Default is the base content...` explanation is removed or replaced by sequential inheritance wording.
9. If all versions have own content, the panel is clean and does not show redundant `(default)` or `(inherit default)` labels.
10. Blocks with no content at or before the active concrete version are hidden in that version view.
11. `All` mode still shows all blocks for editing/recovery.
12. Edges connected to hidden blocks are hidden in concrete version views.
13. Existing maps with default/common content still load and remain recoverable.
14. Export/import preserves ordered variants and inheritance behavior.
15. Build passes.
16. No obvious console errors during basic variant creation, editing, pinning, global switching, and import/export.

## Out of scope

Do not implement in this task:

1. Full branching/merge version control.
2. Per-version block positions/sizes.
3. Per-version edge styles unless already implemented and easy to preserve.
4. AI-assisted migration or summarization.
5. Cloud sync.
6. Multi-user collaboration.
7. Major visual redesign unrelated to the variants panel.
8. Large new block type system.

## Plan mode request

Before implementation, produce a short plan covering:

1. Current variant data flow.
2. Proposed resolver changes.
3. Store action changes.
4. Inspector UI changes.
5. Canvas filtering changes.
6. Migration strategy.
7. Test strategy.

Only implement after the plan is clear.
