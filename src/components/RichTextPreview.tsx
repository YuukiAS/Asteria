import { stripScriptTags } from "../lib/sanitize"

type RichTextPreviewProps = {
  html?: string
  color?: string
}

export function RichTextPreview({ html, color }: RichTextPreviewProps) {
  return (
    <div
      className="rich-preview"
      style={{ color }}
      dangerouslySetInnerHTML={{ __html: stripScriptTags(html || "<p>Empty block</p>") }}
    />
  )
}
