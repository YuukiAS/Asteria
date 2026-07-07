````text
---
id: asteria_0_2_variant_indicator
title: Improve version variant indicators and AUTO/PINNED display
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
---

# Task: Improve version variant indicators and AUTO/PINNED display

## 1. Goal

Improve how Asteria displays block version variants on the canvas. The current UI uses small blue dots near the title to indicate that a block has multiple variants, but this is not sufficiently informative. The new UI should clearly show:

1. Which model-version variants exist for the block.
2. Which variant is currently being rendered.
3. Whether the block follows the global version selector or is pinned to a specific version.
4. Whether the current display falls back to default content because the selected version has no dedicated variant.

Do not redesign the entire block UI. This is a focused visual and interaction refinement.

## 2. Product principle

Asteria is a research diagram tool. The version indicator must be visually compact, readable, and stable. It should not dominate the block title or compete with block type badges such as MODEL, PRIOR, NOTATION, etc.

Do not use a single pie-chart-like circle split into colors. Use a fixed-order version strip instead, because it is more explicit and easier to understand.

## 3. Required version strip design

Replace the current title-side blue dots with a small `VersionStrip` component.

The version strip should show markers for the current app's actual model versions, in the same order as the toolbar/version manager. The TRACE names below are examples only, not hard-coded requirements:

```ts
TRACE
TRACE+HMSC
Marked TRACE
````

Example internal order if those versions exist:

```ts
["trace", "trace_hmsc", "marked_trace"]
```

Each marker should correspond to one version position. The user should be able to infer not just "there are two versions", but which versions exist.

## 4. Visual semantics

Each marker should encode three states:

### Variant exists

If the block has content for that version, show a filled marker.

### Variant missing

If the block does not have content for that version, show an empty or low-opacity marker.

### Currently rendered variant

If the block is currently rendering that version, show an active ring, outline, slight size increase, or similar subtle highlight.

The active state should not rely only on color, because the marker may already have version color. Use a ring or border.

## 5. Suggested colors

Keep version colors separate from block type colors. The version colors are only for small indicators and tooltips; they should not recolor the block background.

Suggested version colors:

```ts
trace: "#2563eb"          // blue
trace_hmsc: "#7c3aed"     // purple
marked_trace: "#059669"   // green
default: "#6b7280"         // gray
```

Small adjustments are acceptable if they fit the current visual style.

If `trace_hmsc` purple feels too close to Algorithm purple, that is acceptable because it only appears as a tiny marker. Do not recolor Algorithm blocks because of this.

## 6. AUTO / PINNED badge

The current UI appears to use `DEFAULT` to mean that the block follows the global version selector. Rename this concept in the canvas UI to `AUTO`.

If the block is explicitly fixed to a version, show `PINNED` instead of `AUTO`.

Required behavior:

1. If block follows global version selector, show `AUTO`.
2. If block is fixed to a specific version, show `PINNED`.
3. Keep the block type badge, e.g. `MODEL`, `PRIOR`, `NOTATION`.
4. Arrange badges so they do not clutter the title.
5. It is acceptable to show `AUTO` / `PINNED` as small pill badges in the header.

Do not change the underlying data model names unless necessary. If existing code uses `default`, it can remain internally, but the visible label should be `AUTO`.

## 7. Default fallback display

If the global selected version is, for example, `Marked TRACE`, but the block has no `marked_trace` variant and therefore renders `default` content, this fallback state should be clear.

Required behavior:

1. The version strip should show that the target version does not exist or is empty.
2. The block can show a small `DEFAULT` badge or subtle fallback indicator.
3. Tooltip should explain the fallback, for example:

```text
Showing default content because Marked TRACE variant is not available.
```

4. Do not make fallback look like an error. It is a normal state.

## 8. Tooltip requirements

Add hover tooltip or accessible title text for the version strip.

Tooltip should include:

1. Which variants exist.
2. Which content is currently shown.
3. Whether the block is AUTO or PINNED.
4. Whether it is falling back to default.

Examples:

```text
Variants: TRACE, Marked TRACE. Showing: TRACE via AUTO.
```

```text
Variants: TRACE+HMSC. Showing: TRACE+HMSC via PINNED.
```

```text
Variants: TRACE. Showing: Default fallback because Marked TRACE is not available.
```

A native `title` attribute is acceptable for first implementation. If the app already has a tooltip component, use it.

## 9. Inspector behavior

Update the block inspector labels to match the new language.

Current behavior may have a selector like:

```text
default / TRACE / TRACE+HMSC / Marked TRACE
```

Change visible labels to:

```text
AUTO: follow global version
PIN TRACE
PIN TRACE+HMSC
PIN Marked TRACE
```

or an equivalent compact UI.

Requirements:

1. Make clear that `AUTO` means the block follows the global version selector.
2. Make clear that pinned versions ignore global switching.
3. If the selected pinned version has no variant, either:

   * offer to create/copy a variant, or
   * show a clear fallback message.
4. Do not automatically overwrite variant content.

## 10. Component structure

Prefer adding a dedicated component, for example:

```text
src/components/VersionStrip.tsx
```

or a suitable path consistent with current code.

Suggested props:

```ts
type VersionStripProps = {
  availableVersions: ModelVersionKey[]
  activeVersion?: ModelVersionKey
  requestedVersion?: ModelVersionKey
  isAuto: boolean
  isPinned: boolean
  isFallbackToDefault: boolean
  size?: "sm" | "md"
}
```

Adjust names to match current implementation.

Put version metadata in a centralized constants file if not already present:

```text
src/constants/modelVersions.ts
```

Suggested structure:

```ts
export const MODEL_VERSIONS = [
  { key: "trace", label: "TRACE", shortLabel: "T", color: "#2563eb" },
  { key: "trace_hmsc", label: "TRACE+HMSC", shortLabel: "H", color: "#7c3aed" },
  { key: "marked_trace", label: "Marked TRACE", shortLabel: "M", color: "#059669" },
]
```

## 11. Canvas layout

Update block header layout carefully.

Target layout:

1. Left side: title + version strip.
2. Right side: AUTO/PINNED badge + block type badge.
3. If title is long, it should truncate gracefully.
4. Version strip should remain visible if possible.
5. Badges should not overlap with title.
6. On very narrow blocks, hide or compress less important badges first rather than breaking layout.

The version strip should be close to the title, replacing the old blue dots.

## 12. Accessibility

1. Version markers should have `aria-label` or the parent strip should have a descriptive label.
2. Tooltip/title text should be useful.
3. Do not rely only on color. Active marker needs a ring/outline/size difference.
4. Empty markers should remain visible enough in both light and dark mode if dark mode exists.

## 13. Compatibility

1. Existing saved maps should load.
2. Existing block variants should display correctly.
3. Existing manual block styles should not be changed.
4. Existing block type badges should remain.
5. Export/import should not need a data migration unless current data model requires it.
6. If old data uses `DEFAULT`, preserve data but display `AUTO`.

## 14. Do not implement

Do not implement in this task:

1. Pie-chart version indicator.
2. Full redesign of block cards.
3. Hard-coded model versions beyond the current app's existing model version system.
4. User-customizable version colors.
5. Per-version block layout.
6. Semantic edge types.
7. Group/frame changes.
8. Export changes unless required for compatibility.
9. AI generation or automatic model summarization.

## 15. Testing

Run the strongest available checks.

At minimum:

1. TypeScript build.
2. Production build.
3. Browser/manual smoke test if available.

Manual test cases:

1. Create or use a block with only default content.
2. Confirm it shows default/fallback state clearly.
3. Create or use a block with TRACE and Marked TRACE variants.
4. Confirm version strip shows exactly those available versions.
5. Switch global version to TRACE and confirm active marker changes.
6. Switch global version to Marked TRACE and confirm active marker changes.
7. Pin block to TRACE and confirm badge shows PINNED.
8. Change global version while block is pinned and confirm pinned content remains.
9. Confirm AUTO block follows global version.
10. Confirm fallback to default is visually indicated when requested version is missing.
11. Confirm old blue dots no longer appear or are replaced by the new strip.
12. Confirm block type badge still appears.
13. Confirm long titles do not break header layout.

## 16. Acceptance criteria

This task is complete when:

1. The old undifferentiated blue-dot indicator is replaced by a fixed-order version strip.
2. The version strip shows which of TRACE, TRACE+HMSC, and Marked TRACE variants exist.
3. The active rendered version is visually distinguishable.
4. AUTO/PINNED state is clearly shown.
5. `DEFAULT` is no longer the visible label for follow-global behavior; visible label should be `AUTO`.
6. Fallback to default content is understandable.
7. Tooltips or title text explain variant availability and current display state.
8. Block header remains visually clean.
9. Existing block type badges and manual styles remain intact.
10. Existing saved maps still load.
11. Build passes without TypeScript errors.
12. No obvious console errors during basic interaction.

## 17. Result file

After implementation, create a result file:

```text
results/asteria_v0_5_7_result.md
```

The result should include:

1. Summary.
2. Files read.
3. Files modified.
4. Commands run and exit statuses.
5. Tests performed.
6. Acceptance criteria passed.
7. Known issues.
8. Skipped or partially completed items.
9. Recommended next task.

```
```
