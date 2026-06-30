import { type Editor } from "@tiptap/react"
import { fontSizes } from "../constants/fontSizes"

type FontSizeSelectProps = {
  editor: Editor
  compact?: boolean
}

export function FontSizeSelect({ editor, compact }: FontSizeSelectProps) {
  return (
    <select
      className={`${compact ? "h-7 w-16" : "h-8 w-20"} rounded-md border border-border bg-panel px-1 text-xs text-foreground`}
      value={(editor.getAttributes("textStyle").fontSize as string) || "16px"}
      onChange={(event) => editor.chain().focus().setFontSize(event.target.value).run()}
      aria-label="Font size"
    >
      {fontSizes.map((size) => (
        <option key={size} value={size}>
          {size}
        </option>
      ))}
    </select>
  )
}
