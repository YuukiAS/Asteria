import type { JSONContent } from "@tiptap/react"

function escapeText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/([*_`[\]])/g, "\\$1")
}

function markText(text: string, marks: JSONContent["marks"]) {
  if (!marks?.length) return text
  return marks.reduce((current, mark) => {
    if (mark.type === "bold") return `**${current}**`
    if (mark.type === "italic") return `_${current}_`
    if (mark.type === "strike") return `~~${current}~~`
    if (mark.type === "code") return `\`${current.replace(/`/g, "\\`")}\``
    if (mark.type === "link") {
      const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : ""
      return href ? `[${current}](${href})` : current
    }
    return current
  }, text)
}

function inlineNodeToMarkdown(node: JSONContent): string {
  if (node.type === "text") return markText(escapeText(node.text || ""), node.marks)
  if (node.type === "inlineMath") {
    const latex = String(node.attrs?.latex || "").trim()
    return latex ? `$${latex}$` : ""
  }
  if (node.type === "hardBreak") return "  \n"
  return node.content?.map(inlineNodeToMarkdown).join("") || ""
}

function contentToInlineMarkdown(content?: JSONContent[]) {
  return (content || []).map(inlineNodeToMarkdown).join("")
}

function listItemToMarkdown(node: JSONContent, prefix: string, depth: number) {
  const indent = "  ".repeat(depth)
  const blocks = node.content || []
  const firstParagraph = blocks[0]?.type === "paragraph" ? contentToInlineMarkdown(blocks[0].content) : contentToInlineMarkdown(blocks[0]?.content)
  const nested = blocks
    .slice(blocks[0]?.type === "paragraph" ? 1 : 0)
    .map((child) => blockNodeToMarkdown(child, depth + 1))
    .filter(Boolean)
    .join("\n")
  return `${indent}${prefix} ${firstParagraph}${nested ? `\n${nested}` : ""}`
}

function blockNodeToMarkdown(node: JSONContent, depth = 0): string {
  const content = node.content || []
  switch (node.type) {
    case "doc":
      return content.map((child) => blockNodeToMarkdown(child, depth)).filter(Boolean).join("\n\n")
    case "paragraph":
      return contentToInlineMarkdown(content).trim()
    case "heading": {
      const level = Math.min(Math.max(Number(node.attrs?.level) || 2, 1), 6)
      return `${"#".repeat(level)} ${contentToInlineMarkdown(content).trim()}`
    }
    case "bulletList":
      return content.map((child) => listItemToMarkdown(child, "-", depth)).join("\n")
    case "orderedList":
      return content.map((child, index) => listItemToMarkdown(child, `${index + 1}.`, depth)).join("\n")
    case "taskList":
      return content.map((child) => listItemToMarkdown(child, child.attrs?.checked ? "- [x]" : "- [ ]", depth)).join("\n")
    case "listItem":
    case "taskItem":
      return listItemToMarkdown(node, "-", depth)
    case "blockquote":
      return content
        .map((child) => blockNodeToMarkdown(child, depth))
        .join("\n")
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n")
    case "codeBlock": {
      const language = typeof node.attrs?.language === "string" ? node.attrs.language : ""
      const code = content.map((child) => child.text || "").join("")
      return `\`\`\`${language}\n${code}\n\`\`\``
    }
    case "horizontalRule":
      return "---"
    case "blockMath": {
      const latex = String(node.attrs?.latex || "").trim()
      return latex ? `$$\n${latex}\n$$` : ""
    }
    default:
      return content.length ? content.map((child) => blockNodeToMarkdown(child, depth)).filter(Boolean).join("\n\n") : contentToInlineMarkdown(content).trim()
  }
}

export function contentJsonToMarkdown(contentJson?: JSONContent) {
  if (!contentJson) return ""
  return blockNodeToMarkdown(contentJson).trim()
}

export function plainTextFromContent(contentJson?: JSONContent): string {
  if (!contentJson) return ""
  const collect = (node: JSONContent): string => {
    if (node.type === "text") return node.text || ""
    if (node.type === "inlineMath" || node.type === "blockMath") return String(node.attrs?.latex || "")
    return (node.content || []).map(collect).join(" ")
  }
  return collect(contentJson).replace(/\s+/g, " ").trim()
}

export function extractBlockMath(contentJson?: JSONContent): string[] {
  if (!contentJson) return []
  const formulas: string[] = []
  const visit = (node: JSONContent) => {
    if (node.type === "blockMath") {
      const latex = String(node.attrs?.latex || "").trim()
      if (latex) formulas.push(latex)
    }
    node.content?.forEach(visit)
  }
  visit(contentJson)
  return formulas
}
