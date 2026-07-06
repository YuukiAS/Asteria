import type { CSSProperties } from "react"
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
      dangerouslySetInnerHTML={{ __html: stripScriptTags(html || "<p>Empty block</p>") }}
    />
  )
}
