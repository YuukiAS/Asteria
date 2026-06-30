import katex from "katex"
import type { JSONContent } from "@tiptap/react"
import { stripScriptTags } from "../lib/sanitize"

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function renderMath(latex = "", displayMode: boolean) {
  return katex.renderToString(latex, { displayMode, throwOnError: false, strict: false })
}

function renderAttrs(attrs?: Record<string, unknown>) {
  if (!attrs) return ""
  const entries = Object.entries(attrs).filter(([, value]) => value !== undefined && value !== null && value !== "")
  if (!entries.length) return ""
  return ` ${entries.map(([key, value]) => `${key}="${escapeHtml(String(value))}"`).join(" ")}`
}

function renderMarks(html: string, marks: JSONContent["marks"] = []) {
  return marks.reduce((current, mark) => {
    switch (mark.type) {
      case "bold":
        return `<strong>${current}</strong>`
      case "italic":
        return `<em>${current}</em>`
      case "underline":
        return `<u>${current}</u>`
      case "strike":
        return `<s>${current}</s>`
      case "code":
        return `<code>${current}</code>`
      case "link":
        return `<a href="${escapeHtml(String(mark.attrs?.href || "#"))}" target="_blank" rel="noreferrer">${current}</a>`
      case "highlight": {
        const color = String(mark.attrs?.color || "#fef3c7")
        return `<mark style="background-color: ${escapeHtml(color)}">${current}</mark>`
      }
      case "textStyle": {
        const styles = [
          mark.attrs?.color ? `color: ${mark.attrs.color}` : "",
          mark.attrs?.fontSize ? `font-size: ${mark.attrs.fontSize}` : "",
        ].filter(Boolean)
        return styles.length ? `<span style="${escapeHtml(styles.join("; "))}">${current}</span>` : current
      }
      default:
        return current
    }
  }, html)
}

function renderChildren(node: JSONContent) {
  return (node.content || []).map(renderNode).join("")
}

function textAlignStyle(node: JSONContent) {
  return node.attrs?.textAlign ? ` style="text-align: ${escapeHtml(String(node.attrs.textAlign))}"` : ""
}

function renderNode(node: JSONContent): string {
  switch (node.type) {
    case "doc":
      return renderChildren(node)
    case "text":
      return renderMarks(escapeHtml(node.text || ""), node.marks)
    case "paragraph":
      return `<p${textAlignStyle(node)}>${renderChildren(node)}</p>`
    case "heading": {
      const level = node.attrs?.level === 1 ? 1 : 2
      return `<h${level}${textAlignStyle(node)}>${renderChildren(node)}</h${level}>`
    }
    case "bulletList":
      return `<ul>${renderChildren(node)}</ul>`
    case "orderedList":
      return `<ol>${renderChildren(node)}</ol>`
    case "listItem":
      return `<li>${renderChildren(node)}</li>`
    case "blockquote":
      return `<blockquote>${renderChildren(node)}</blockquote>`
    case "codeBlock":
      return `<pre><code>${escapeHtml(node.content?.map((item) => item.text || "").join("\n") || "")}</code></pre>`
    case "hardBreak":
      return "<br />"
    case "horizontalRule":
      return "<hr />"
    case "inlineMath":
      return `<span${renderAttrs({ "data-math-inline": "", class: "math-inline" })}>${renderMath(String(node.attrs?.latex || ""), false)}</span>`
    case "blockMath":
      return `<div${renderAttrs({ "data-math-block": "", class: "math-block" })}>${renderMath(String(node.attrs?.latex || ""), true)}</div>`
    default:
      return renderChildren(node)
  }
}

export function contentJsonToHtml(contentJson: JSONContent) {
  return stripScriptTags(renderNode(contentJson))
}
