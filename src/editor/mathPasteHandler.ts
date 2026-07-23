import type { JSONContent } from "@tiptap/react"
import type { Node as ProseMirrorNode, Slice } from "prosemirror-model"

type TextNode = { type: "text"; text: string }
type InlineMathNode = { type: "inlineMath"; attrs: { latex: string } }
type ParagraphNode = { type: "paragraph"; content?: Array<TextNode | InlineMathNode> }
type BlockMathNode = { type: "blockMath"; attrs: { latex: string } }

function paragraphFromLine(line: string): ParagraphNode {
  const content: Array<TextNode | InlineMathNode> = []
  const pattern = /\$\$([^$\n]+?)\$\$|\$([^$\n]+?)\$/g
  let cursor = 0
  for (const match of line.matchAll(pattern)) {
    if (match.index > cursor) content.push({ type: "text", text: line.slice(cursor, match.index) })
    content.push({ type: "inlineMath", attrs: { latex: (match[1] || match[2]).trim() } })
    cursor = match.index + match[0].length
  }
  if (cursor < line.length) content.push({ type: "text", text: line.slice(cursor) })
  return content.length ? { type: "paragraph", content } : { type: "paragraph" }
}

export function preprocessPastedMath(text: string): JSONContent[] | null {
  if (!text.includes("$")) return null
  const lines = text.replace(/\r\n/g, "\n").split("\n")
  const nodes: Array<ParagraphNode | BlockMathNode> = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const trimmed = line.trim()

    // Test examples:
    // Inline: "same line $x^2$ with text" becomes paragraph text + inlineMath.
    // Inline: "same line $$\\beta_j$$ with text" also becomes paragraph text + inlineMath.
    // Block: "$$\n\\alpha^U_{hg}\\mid \\gamma_g\n$$" becomes blockMath.
    // Tiptap-style block: "$$$\\Omega_W=I$$$" becomes blockMath.
    if (trimmed.startsWith("$$$") && trimmed.endsWith("$$$") && trimmed.length > 6) {
      nodes.push({ type: "blockMath", attrs: { latex: trimmed.slice(3, -3).trim() } })
      continue
    }

    if (trimmed === "$$") {
      const mathLines: string[] = []
      index += 1
      while (index < lines.length && lines[index].trim() !== "$$") {
        mathLines.push(lines[index])
        index += 1
      }
      nodes.push({ type: "blockMath", attrs: { latex: mathLines.join("\n").trim() } })
      continue
    }

    if (/^\$\$[\s\S]+\$\$$/.test(trimmed) && !trimmed.slice(2, -2).includes("$$")) {
      const inner = trimmed.slice(2, -2).trim()
      const hasOtherText = line.replace(/\$\$[^$]+?\$\$/g, "").trim().length > 0
      nodes.push(hasOtherText ? paragraphFromLine(line) : { type: "blockMath", attrs: { latex: inner } })
      continue
    }

    nodes.push(paragraphFromLine(line))
  }

  return nodes.length ? nodes : null
}

export function shouldUsePlainTextMathPaste(clipboardData?: DataTransfer | null) {
  const html = clipboardData?.getData("text/html")?.trim()
  if (html) return false
  const text = clipboardData?.getData("text/plain")
  return Boolean(text?.includes("$"))
}

export function normalizeInlineDollarMath(content: JSONContent): { content: JSONContent; changed: boolean } {
  let changed = false

  const normalizeNode = (node: JSONContent): JSONContent => {
    if (node.type === "paragraph" && node.content) {
      const nextContent: JSONContent[] = []
      for (const child of node.content) {
        if (child.type !== "text" || !child.text?.includes("$")) {
          nextContent.push(child)
          continue
        }
        const pattern = /\$([^$\n]+?)\$/g
        let cursor = 0
        let matched = false
        for (const match of child.text.matchAll(pattern)) {
          matched = true
          if (match.index > cursor) {
            nextContent.push({ ...child, text: child.text.slice(cursor, match.index) })
          }
          nextContent.push({ type: "inlineMath", attrs: { latex: match[1].trim() } })
          cursor = match.index + match[0].length
        }
        if (cursor < child.text.length) {
          nextContent.push({ ...child, text: child.text.slice(cursor) })
        }
        if (!matched) nextContent.push(child)
        changed = changed || matched
      }
      return { ...node, content: nextContent }
    }

    if (node.content) {
      return { ...node, content: node.content.map(normalizeNode) }
    }
    return node
  }

  return { content: normalizeNode(content), changed }
}

function mathText(latex: unknown, displayMode: boolean) {
  const value = String(latex || "").trim()
  return displayMode ? `$$\n${value}\n$$` : `$${value}$`
}

function serializeNodeText(node: ProseMirrorNode): string {
  if (node.type.name === "text") return node.text || ""
  if (node.type.name === "inlineMath") return mathText(node.attrs.latex, false)
  if (node.type.name === "blockMath") return mathText(node.attrs.latex, true)
  if (node.type.name === "hardBreak") return "\n"

  const children: string[] = []
  node.forEach((child) => children.push(serializeNodeText(child)))
  return children.join("")
}

export function serializeMathClipboardText(slice: Slice) {
  const lines: string[] = []
  slice.content.forEach((node) => {
    if (node.type.name === "bulletList" || node.type.name === "orderedList") {
      node.forEach((item) => lines.push(serializeNodeText(item)))
      return
    }
    lines.push(serializeNodeText(node))
  })
  return lines.join("\n")
}
