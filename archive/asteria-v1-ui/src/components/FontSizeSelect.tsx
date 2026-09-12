import { type Editor } from "@tiptap/react"
import { fontSizes } from "../constants/fontSizes"
import { BlockHeaderSelect } from "./BlockHeaderSelect"

type FontSizeSelectProps = {
  editor: Editor
  compact?: boolean
}

export function FontSizeSelect({ editor, compact }: FontSizeSelectProps) {
  return (
    <BlockHeaderSelect
      className={`${compact ? "rich-font-size-select-compact" : "rich-font-size-select"}`}
      value={(editor.getAttributes("textStyle").fontSize as string) || "16px"}
      options={fontSizes.map((size) => ({ value: size, label: size }))}
      onChange={(value) => editor.chain().focus().setFontSize(value).run()}
      ariaLabel="Font size"
      minMenuWidth={compact ? 64 : 80}
    />
  )
}
