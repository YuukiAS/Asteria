import type { JSONContent } from "@tiptap/react"
import type { BlockNodeType } from "../types/map"
import { defaultBlockColors } from "./palette"

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
    backgroundColor: defaultBlockColors.background,
    textColor: defaultBlockColors.text,
    borderColor: defaultBlockColors.border,
  },
  definition: {
    backgroundColor: "#fef3c7",
    textColor: defaultBlockColors.text,
    borderColor: defaultBlockColors.border,
  },
  notation: {
    backgroundColor: "#fef3c7",
    textColor: defaultBlockColors.text,
    borderColor: defaultBlockColors.border,
  },
  model: {
    backgroundColor: defaultBlockColors.background,
    textColor: "#eab308",
    borderColor: defaultBlockColors.border,
  },
  prior: {
    backgroundColor: "#dbeafe",
    textColor: defaultBlockColors.text,
    borderColor: defaultBlockColors.border,
  },
  assumption: {
    backgroundColor: "#e5e7eb",
    textColor: defaultBlockColors.text,
    borderColor: defaultBlockColors.border,
  },
  theorem: {
    backgroundColor: defaultBlockColors.background,
    textColor: "#b45309",
    borderColor: defaultBlockColors.border,
  },
  dataset: {
    backgroundColor: "#fce7f3",
    textColor: defaultBlockColors.text,
    borderColor: defaultBlockColors.border,
  },
  result: {
    backgroundColor: defaultBlockColors.background,
    textColor: defaultBlockColors.text,
    borderColor: defaultBlockColors.border,
    contentJson: orderedResultContentJson,
  },
  citation: {
    backgroundColor: defaultBlockColors.background,
    textColor: defaultBlockColors.text,
    borderColor: defaultBlockColors.border,
  },
  warning: {
    backgroundColor: "#fee2e2",
    textColor: defaultBlockColors.text,
    borderColor: defaultBlockColors.border,
    emojis: ["⚠️"],
  },
  todo: {
    backgroundColor: defaultBlockColors.background,
    textColor: defaultBlockColors.text,
    borderColor: defaultBlockColors.border,
    contentJson: todoContentJson,
  },
}
