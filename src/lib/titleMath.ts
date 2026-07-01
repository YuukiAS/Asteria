import katex from "katex"
import { stripScriptTags } from "./sanitize"

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function titleToHtml(title: string) {
  let html = ""
  let index = 0

  while (index < title.length) {
    const start = title.indexOf("$", index)
    if (start === -1) {
      html += escapeHtml(title.slice(index))
      break
    }
    const end = title.indexOf("$", start + 1)
    if (end === -1) {
      html += escapeHtml(title.slice(index))
      break
    }

    html += escapeHtml(title.slice(index, start))
    const latex = title.slice(start + 1, end).trim()
    if (latex) {
      html += katex.renderToString(latex, { displayMode: false, throwOnError: false, strict: false })
    }
    index = end + 1
  }

  return stripScriptTags(html)
}
