`Algorithm` 比 `Trick` 更合适。它可以覆盖 posterior computation、sampling scheme、Laplace approximation、matching algorithm、simulation algorithm、MCMC/Gibbs/variational/optimization 这类内容；紫色也很合适，因为它和橙色的 model/theorem、蓝色的 prior/example、粉色的 remark 能区分开。

下面这段可以直接交给 Codex。它是一个独立 TODO/task，用来在现有 block type 基础上实现你这套颜色系统。

````text
---
id: asteria_block_type_style_system
title: Implement block type style presets for research diagrams
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
---

# Task: Implement block type style presets for Asteria

## 1. Goal

Implement a clean block type style system for Asteria, based on the user's research note color conventions. The goal is to make block types visually useful for Bayesian model diagrams and TRACE/Marked TRACE presentations, without forcing a rigid workflow.

The app already supports block types and block colors. This task should refine the available block types and their default styles. It must not remove user freedom: users can still manually edit block background color, text color, border color, rich text colors, and math highlighting.

## 2. Background

The user's note-taking color convention is:

- Notation: yellow.
- Theorem / formal mathematical statement: orange.
- Model: also orange, but should be visually distinguishable from Theorem.
- Algorithm / computation method: purple.
- Remark: pink.
- Very important warning: red.
- Explanatory annotations: blue text.
- Main body text: black.
- Examples: blue background.
- TODO: should look like a checklist, not like a strong warning.

In Asteria, block type style should mainly control block background, border, badge color, and default type label. It should not automatically recolor every piece of rich text inside the block. Rich text color remains controlled by the user.

## 3. Required block type list

Update the block type list to the following:

```ts
export type BlockNodeType =
  | "generic"
  | "definition"
  | "notation"
  | "model"
  | "prior"
  | "assumption"
  | "theorem"
  | "algorithm"
  | "dataset"
  | "result"
  | "reference"
  | "remark"
  | "example"
  | "warning"
  | "todo"
````

Important notes:

1. Use `theorem` as the single type for theorem, lemma, proposition, corollary, and formal statement. Do not create separate lemma/proposition/corollary types.
2. Use `algorithm` for posterior computation, inference algorithms, simulation procedures, matching methods, optimization routines, MCMC, Gibbs, Laplace approximation, bigMVP-style two-stage computation, etc.
3. Use `reference`, not `citation`, because these blocks usually represent a paper or method reference, not just a formatted citation.
4. Do not add `trick`.
5. Keep `generic` as fallback.
6. If existing saved data uses `citation`, migrate it to `reference`.
7. If existing saved data uses `statement`, migrate it to `theorem`.
8. Unknown imported block types should fallback to `generic` and `console.warn`.

## 4. Style presets

Create a centralized style preset file, preferably:

```text
src/constants/blockTypeStyles.ts
```

or extend an existing block type constants file if one already exists.

Each block type should have metadata like:

```ts
type BlockTypeStyle = {
  label: string
  badgeText: string
  backgroundColor: string
  borderColor: string
  textColor: string
  badgeBackgroundColor: string
  badgeTextColor: string
  accentColor: string
  description?: string
}
```

The exact field names can be adjusted, but the logic must be centralized and reusable.

## 5. Recommended default styles

Use restrained low-saturation colors. Do not use harsh primary colors for full block backgrounds. These are suggested values; small adjustments are acceptable if they fit the current app theme.

### Generic

Purpose: fallback block.

```ts
label: "Generic"
badgeText: "GENERIC"
backgroundColor: "#ffffff"
borderColor: "#d1d5db"
textColor: "#111827"
badgeBackgroundColor: "#f3f4f6"
badgeTextColor: "#374151"
accentColor: "#6b7280"
```

### Definition

Purpose: formal concept definition, e.g. catalogue discovery, open-tail discovery, marked novelty.

```ts
label: "Definition"
badgeText: "DEFINITION"
backgroundColor: "#fff7ed"
borderColor: "#fed7aa"
textColor: "#111827"
badgeBackgroundColor: "#ffedd5"
badgeTextColor: "#9a3412"
accentColor: "#f97316"
```

### Notation

Purpose: notation and symbol explanations, e.g. $$K$$, $$U$$, $$p_{U,g}$$, $$\gamma_g$$.

```ts
label: "Notation"
badgeText: "NOTATION"
backgroundColor: "#fef9c3"
borderColor: "#fde68a"
textColor: "#111827"
badgeBackgroundColor: "#fef3c7"
badgeTextColor: "#854d0e"
accentColor: "#eab308"
```

### Model

Purpose: model component, observation layer, catalogue component, open-tail component, residual copula.

```ts
label: "Model"
badgeText: "MODEL"
backgroundColor: "#fffaf0"
borderColor: "#fdba74"
textColor: "#111827"
badgeBackgroundColor: "#ffedd5"
badgeTextColor: "#c2410c"
accentColor: "#f97316"
```

Model and Theorem are both orange-family, but Model should be slightly lighter/creamier than Theorem.

### Prior

Purpose: Bayesian prior, shrinkage prior, hierarchy, hyperprior.

```ts
label: "Prior"
badgeText: "PRIOR"
backgroundColor: "#dbeafe"
borderColor: "#93c5fd"
textColor: "#111827"
badgeBackgroundColor: "#bfdbfe"
badgeTextColor: "#1d4ed8"
accentColor: "#3b82f6"
```

### Assumption

Purpose: theorem or modeling assumptions, regularity, integrability, boundedness.

```ts
label: "Assumption"
badgeText: "ASSUMPTION"
backgroundColor: "#f5f3ff"
borderColor: "#ddd6fe"
textColor: "#111827"
badgeBackgroundColor: "#ede9fe"
badgeTextColor: "#6d28d9"
accentColor: "#8b5cf6"
```

### Theorem

Purpose: theorem, lemma, proposition, corollary, formal result.

```ts
label: "Theorem"
badgeText: "THEOREM"
backgroundColor: "#ffedd5"
borderColor: "#fb923c"
textColor: "#111827"
badgeBackgroundColor: "#fed7aa"
badgeTextColor: "#9a3412"
accentColor: "#ea580c"
```

### Algorithm

Purpose: computational method, posterior algorithm, simulation procedure, MCMC/Gibbs, bigMVP stage, matching routine.

Use purple.

```ts
label: "Algorithm"
badgeText: "ALGORITHM"
backgroundColor: "#f3e8ff"
borderColor: "#c084fc"
textColor: "#111827"
badgeBackgroundColor: "#e9d5ff"
badgeTextColor: "#7e22ce"
accentColor: "#9333ea"
```

### Dataset

Purpose: real data or simulation dataset description.

```ts
label: "Dataset"
badgeText: "DATASET"
backgroundColor: "#ecfeff"
borderColor: "#67e8f9"
textColor: "#111827"
badgeBackgroundColor: "#cffafe"
badgeTextColor: "#0e7490"
accentColor: "#06b6d4"
```

### Result

Purpose: derived result, simulation result, empirical finding, expected richness limit, figure/table takeaway.

```ts
label: "Result"
badgeText: "RESULT"
backgroundColor: "#dcfce7"
borderColor: "#86efac"
textColor: "#111827"
badgeBackgroundColor: "#bbf7d0"
badgeTextColor: "#15803d"
accentColor: "#22c55e"
```

### Reference

Purpose: paper, method, citation source, literature note.

```ts
label: "Reference"
badgeText: "REFERENCE"
backgroundColor: "#f8fafc"
borderColor: "#cbd5e1"
textColor: "#111827"
badgeBackgroundColor: "#e2e8f0"
badgeTextColor: "#334155"
accentColor: "#64748b"
```

### Remark

Purpose: explanatory remark, modeling boundary, interpretation note, non-warning caveat.

Use pink.

```ts
label: "Remark"
badgeText: "REMARK"
backgroundColor: "#fce7f3"
borderColor: "#f9a8d4"
textColor: "#111827"
badgeBackgroundColor: "#fbcfe8"
badgeTextColor: "#be185d"
accentColor: "#ec4899"
```

### Example

Purpose: toy example, explanatory example, intuitive illustration.

Use blue background, distinct from Prior.

```ts
label: "Example"
badgeText: "EXAMPLE"
backgroundColor: "#e0f2fe"
borderColor: "#7dd3fc"
textColor: "#111827"
badgeBackgroundColor: "#bae6fd"
badgeTextColor: "#0369a1"
accentColor: "#0ea5e9"
```

### Warning

Purpose: important warning, statement to avoid, invalid modeling move, theorem-breaking issue.

Use red, but still low-saturation.

```ts
label: "Warning"
badgeText: "WARNING"
backgroundColor: "#fee2e2"
borderColor: "#fca5a5"
textColor: "#111827"
badgeBackgroundColor: "#fecaca"
badgeTextColor: "#b91c1c"
accentColor: "#ef4444"
```

### TODO

Purpose: task list or unresolved action item.

Use neutral gray or very light yellow-gray. It should not visually compete with Warning.

```ts
label: "TODO"
badgeText: "TODO"
backgroundColor: "#f9fafb"
borderColor: "#d1d5db"
textColor: "#111827"
badgeBackgroundColor: "#e5e7eb"
badgeTextColor: "#374151"
accentColor: "#6b7280"
```

## 6. Type switching behavior

Do not unexpectedly destroy user-customized colors.

Required behavior:

1. When a new block is created with a chosen type, apply that type's default style.
2. When an existing block changes type, do not automatically overwrite backgroundColor, textColor, or borderColor unless the user explicitly chooses to apply the type style.
3. Add a button in the block inspector: `Apply type style`.
4. `Apply type style` should set backgroundColor, textColor, and borderColor from the selected block type preset.
5. Type badge should always reflect the current type, even if the block's manual colors are different.
6. If the user changes type and wants the new style, they should click `Apply type style`.

If current implementation already auto-applies type style on type change, change it to the safer behavior above.

## 7. Default content templates

When creating a new block of a specific type, provide lightweight default content. Do not overfill the block.

Suggested templates:

### Generic

Title: `New block`

Content:

```text
Write notes here.
```

### Definition

Title: `New definition`

Content:

```text
Define the concept here.
```

### Notation

Title: `New notation`

Content:

```text
Let $$x$$ denote ...
```

### Model

Title: `New model component`

Content:

```text
Model component:
$$
y_{ij} = \\mathbb{I}(z_{ij} > 0)
$$
```

### Prior

Title: `New prior`

Content:

```text
Prior:
$$
\\theta \\sim ...
$$
```

### Assumption

Title: `New assumption`

Content:

```text
Assume that ...
```

### Theorem

Title: `New theorem`

Content:

```text
Statement:
$$
...
$$
```

### Algorithm

Title: `New algorithm`

Content:

```text
Algorithm outline:
1. Step one.
2. Step two.
3. Step three.
```

### Dataset

Title: `New dataset`

Content:

```text
Dataset role:
- Samples:
- Features/species:
- Covariates:
- Purpose:
```

### Result

Title: `New result`

Content:

```text
Result summary:
```

### Reference

Title: `New reference`

Content:

```text
Paper / method:
Why it matters:
```

### Remark

Title: `New remark`

Content:

```text
Remark:
```

### Example

Title: `New example`

Content:

```text
Example:
```

### Warning

Title: `New warning`

Content:

```text
Warning:
```

### TODO

Title: `New TODO`

Content:

```text
TODO:
- [ ] First item
- [ ] Second item
```

If Tiptap does not support GitHub-style checkboxes yet, use a plain bullet list or add a simple task-list extension only if it is lightweight and does not destabilize the editor.

## 8. Inspector UI requirements

Update the block inspector:

1. Type dropdown should use the updated type list.
2. Show the type badge preview.
3. Add `Apply type style` button.
4. Add `Reset to type template` only if it is safe and clearly destructive. If implemented, require confirmation because it overwrites content.
5. Keep controls compact.
6. Do not make style controls harder to access.
7. If block variants/global version support exists, template/style behavior should apply to the currently edited variant content but shared block style should remain block-level.

## 9. Canvas UI requirements

Update block rendering:

1. Show compact type badge using the style metadata.
2. Badge should be visually subtle and not dominate title/content.
3. If status and emoji markers already exist, arrange them with the type badge without clutter.
4. Warning blocks should be recognizable but not excessively red.
5. TODO blocks should show checklist-like content if template is used.
6. Math rendering must remain stable.

## 10. Compatibility and migration

Required migration rules:

1. Existing `generic`, `definition`, `notation`, `model`, `prior`, `assumption`, `dataset`, `result`, `warning`, `todo` remain valid.
2. Existing `citation` becomes `reference`.
3. Existing `statement` becomes `theorem`.
4. Unknown type becomes `generic` with `console.warn`.
5. Existing manually chosen block colors must be preserved on migration.
6. Export/import should preserve the updated block types.
7. IndexedDB data from older versions should continue to load.

## 11. Do not implement

Do not implement in this task:

1. More block types beyond the required list.
2. Separate lemma/proposition/corollary types.
3. Semantic edge types.
4. Automatic TRACE/HMSC templates.
5. AI generation.
6. Cloud sync.
7. Large redesign of the layout.
8. Full group/frame or version-switching system unless it already exists and only needs compatibility updates.

This task is only about block type list, style presets, safe style application, and type-specific default templates.

## 12. Testing

Run the strongest available checks.

At minimum:

1. TypeScript build.
2. Production build.
3. Manual or browser smoke test if available:

   * Create each block type or at least several representative types.
   * Confirm type badge changes.
   * Confirm `Apply type style` works.
   * Confirm changing type alone does not overwrite manual colors.
   * Confirm TODO block gets TODO template.
   * Confirm Algorithm block uses purple styling.
   * Confirm Citation/Statement legacy migration if test data is easy to construct.

## 13. Acceptance criteria

This task is complete when:

1. Block type list matches the required list.
2. `Algorithm` exists and uses purple style.
3. `Remark` exists and uses pink style.
4. `Example` exists and uses blue background.
5. `Reference` replaces `Citation`.
6. `Theorem` replaces `Statement` as the single formal-claim type.
7. Type presets are centralized in constants.
8. New blocks can apply default style by type.
9. Existing blocks do not lose manual colors just because their type changes.
10. `Apply type style` works explicitly.
11. TODO block provides a lightweight TODO list placeholder that disappears when editing starts.
12. Existing saved maps/imported JSON still load.
13. Build passes without TypeScript errors.
14. No obvious console errors during basic interaction.

## 14. Result file

After implementation, create a result file:

```text
results/asteria_block_type_style_system_result.md
```

The result should include:

1. Summary.
2. Files read.
3. Files modified.
4. Commands run and exit statuses.
5. Tests performed.
6. Acceptance criteria passed.
7. Known issues.
8. Any skipped or partially completed items.
