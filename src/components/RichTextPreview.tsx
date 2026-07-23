import type { CSSProperties } from "react"
import { writeStyledMathClipboardFromSelection } from "../editor/mathPasteHandler"
import { stripScriptTags } from "../lib/sanitize"

type RichTextPreviewProps = {
  html?: string
  color?: string
  accentColor?: string
}

export function RichTextPreview({ html, color, accentColor }: RichTextPreviewProps) {
  return (
    <div
      className="rich-preview"
      style={{ color, "--asteria-rich-accent-color": accentColor } as CSSProperties}
      onCopy={(event) => writeStyledMathClipboardFromSelection(event.nativeEvent)}
      onCut={(event) => writeStyledMathClipboardFromSelection(event.nativeEvent)}
      dangerouslySetInnerHTML={{ __html: stripScriptTags(html || "<p>Empty block</p>") }}
    />
  )
}
