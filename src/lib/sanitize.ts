export function stripScriptTags(html = "") {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
}

export function preserveEmptyRichTextBlocks(html = "") {
  return html.replace(/<(p|h[12])((?:\s+[^>]*)?)>\s*<\/\1>/gi, (_match, tag: string, attrs: string) => {
    const marker = tag.toLowerCase() === "p" ? 'data-asteria-empty-paragraph="true"' : 'data-asteria-empty-heading="true"'
    return `<${tag}${attrs}><br ${marker} /></${tag}>`
  })
}

export function isHexColor(value: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())
}
