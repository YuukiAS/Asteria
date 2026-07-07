import type { JSONContent } from "@tiptap/react"
import type { BlockNodeType } from "../types/map"
import { blockTypeColors, defaultBlockColors } from "./palette"

export const orderedResultContentJson: JSONContent = {
  type: "doc",
  content: [
    {
      type: "orderedList",
      content: [{ type: "listItem", content: [{ type: "paragraph" }] }],
    },
  ],
}

export const todoContentJson: JSONContent = {
  type: "doc",
  content: [
    {
      type: "taskList",
      content: [{ type: "taskItem", attrs: { checked: false }, content: [{ type: "paragraph" }] }],
    },
  ],
}

export type BlockTypeDefaults = {
  backgroundColor: string
  textColor: string
  borderColor: string
  emojis?: string[]
  contentJson?: JSONContent
}

export const blockTypeDefaults: Record<BlockNodeType, BlockTypeDefaults> = {
  generic: {
    backgroundColor: blockTypeColors.generic.background,
    textColor: defaultBlockColors.text,
    borderColor: blockTypeColors.generic.border,
  },
  definition: {
    backgroundColor: blockTypeColors.definition.background,
    textColor: defaultBlockColors.text,
    borderColor: blockTypeColors.definition.border,
  },
  notation: {
    backgroundColor: blockTypeColors.notation.background,
    textColor: defaultBlockColors.text,
    borderColor: blockTypeColors.notation.border,
  },
  model: {
    backgroundColor: blockTypeColors.model.background,
    textColor: defaultBlockColors.text,
    borderColor: blockTypeColors.model.border,
  },
  prior: {
    backgroundColor: blockTypeColors.prior.background,
    textColor: defaultBlockColors.text,
    borderColor: blockTypeColors.prior.border,
  },
  assumption: {
    backgroundColor: blockTypeColors.assumption.background,
    textColor: defaultBlockColors.text,
    borderColor: blockTypeColors.assumption.border,
  },
  theorem: {
    backgroundColor: blockTypeColors.theorem.background,
    textColor: defaultBlockColors.text,
    borderColor: blockTypeColors.theorem.border,
  },
  algorithm: {
    backgroundColor: blockTypeColors.algorithm.background,
    textColor: defaultBlockColors.text,
    borderColor: blockTypeColors.algorithm.border,
  },
  dataset: {
    backgroundColor: blockTypeColors.dataset.background,
    textColor: defaultBlockColors.text,
    borderColor: blockTypeColors.dataset.border,
  },
  result: {
    backgroundColor: blockTypeColors.result.background,
    textColor: defaultBlockColors.text,
    borderColor: blockTypeColors.result.border,
    contentJson: orderedResultContentJson,
  },
  reference: {
    backgroundColor: blockTypeColors.reference.background,
    textColor: defaultBlockColors.text,
    borderColor: blockTypeColors.reference.border,
  },
  remark: {
    backgroundColor: blockTypeColors.remark.background,
    textColor: defaultBlockColors.text,
    borderColor: blockTypeColors.remark.border,
  },
  example: {
    backgroundColor: blockTypeColors.example.background,
    textColor: defaultBlockColors.text,
    borderColor: blockTypeColors.example.border,
  },
  warning: {
    backgroundColor: blockTypeColors.warning.background,
    textColor: defaultBlockColors.text,
    borderColor: blockTypeColors.warning.border,
    emojis: ["!"],
  },
  todo: {
    backgroundColor: blockTypeColors.todo.background,
    textColor: defaultBlockColors.text,
    borderColor: blockTypeColors.todo.border,
    contentJson: todoContentJson,
  },
}
