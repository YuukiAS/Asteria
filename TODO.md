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
```

## 4. Implemented color system for v0.5.1

Block types now control block-level background and border only. The default block-level text color is `#111827` for every type, so type presets no longer recolor body text or math content. Rich text text color and highlight remain manually editable by users.

Current block type colors:

| Type | Background | Border |
| --- | --- | --- |
| Generic | `#ffffff` | `#cbd5e1` |
| Definition | `#f9fafb` | `#cbd5e1` |
| Notation | `#fef3c7` | `#eab308` |
| Model | `#fff7ed` | `#fb923c` |
| Prior | `#fef3c7` | `#facc15` |
| Assumption | `#f9fafb` | `#9ca3af` |
| Theorem | `#ffedd5` | `#f97316` |
| Algorithm | `#ede9fe` | `#8b5cf6` |
| Dataset | `#dcfce7` | `#22c55e` |
| Result | `#dbeafe` | `#3b82f6` |
| Reference | `#f9fafb` | `#6b7280` |
| Remark | `#fce7f3` | `#ec4899` |
| Example | `#dbeafe` | `#60a5fa` |
| Warning | `#fee2e2` | `#ef4444` |
| TODO | `#ffffff` | `#94a3b8` |

Additional background/highlight palette colors added:

- Orange: `#ffedd5`
- Purple: `#ede9fe`

## 5. Migration behavior

The v0.5.1 app performs a one-time local migration for the current canvas:

- Existing block-level `backgroundColor`, `textColor`, and `borderColor` are reset to the selected block type's preset.
- Existing rich-text marks, including manual text color and highlight, are preserved.
- Legacy `citation` block type values are normalized to `reference`.
- Future manual edits to block background, text, and border colors are preserved on load.
