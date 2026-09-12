import type { JSONContent } from "@tiptap/react"
import type { Node as ProseMirrorNode, Slice } from "prosemirror-model"

type TextNode = { type: "text"; text: string }
type InlineMathNode = { type: "inlineMath"; attrs: { latex: string } }
type ParagraphNode = { type: "paragraph"; content?: Array<TextNode | InlineMathNode> }
type BlockMathNode = { type: "blockMath"; attrs: { latex: string } }
type RichInlineNode = JSONContent
type RichMark = NonNullable<JSONContent["marks"]>[number]

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

function decodeHtmlAttribute(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
}

function escapeHtmlText(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function latexFallbackFromTag(openTag: string) {
  const latexMatch = openTag.match(/\sdata-latex=(["'])(.*?)\1/i)
  const latex = latexMatch ? decodeHtmlAttribute(latexMatch[2]).trim() : ""
  if (!latex) return ""
  return escapeHtmlText(mathText(latex, openTag.includes("data-math-block")))
}

function usefulStyleValue(value: string | null | undefined) {
  const normalized = value?.trim()
  if (!normalized || normalized === "inherit" || normalized === "initial" || normalized === "unset" || normalized === "transparent") return undefined
  if (/^rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)$/i.test(normalized)) return undefined
  return normalized
}

function nearestElementStyle(element: Element, dataAttribute: string, styleName: "color" | "backgroundColor") {
  let current: Element | null = element
  while (current) {
    const dataValue = usefulStyleValue(current.getAttribute(dataAttribute))
    if (dataValue) return dataValue
    if (current instanceof HTMLElement) {
      const styleValue = usefulStyleValue(current.style[styleName])
      if (styleValue) return styleValue
    }
    current = current.parentElement
  }
  return undefined
}

function promoteInheritedMathStyles(element: Element) {
  const textColor = nearestElementStyle(element, "data-text-color", "color")
  const highlightColor = nearestElementStyle(element, "data-highlight-color", "backgroundColor")
  if (textColor && !element.getAttribute("data-text-color")) {
    element.setAttribute("data-text-color", textColor)
  }
  if (highlightColor && !element.getAttribute("data-highlight-color")) {
    element.setAttribute("data-highlight-color", highlightColor)
  }
}

export function normalizeAsteriaMathClipboardHtml(html: string) {
  if (!html.includes("data-math-inline") && !html.includes("data-math-block")) return html
  if (typeof window === "undefined" || typeof window.DOMParser === "undefined") {
    return html.replace(
      /(<(?:span|div)\b[^>]*(?:data-math-inline|data-math-block)[^>]*>)[\s\S]*?(<\/(?:span|div)>)/gi,
      (_match, openTag: string, closeTag: string) => `${openTag}${latexFallbackFromTag(openTag)}${closeTag}`,
    )
  }

  const document = new window.DOMParser().parseFromString(html, "text/html")
  document.querySelectorAll("[data-math-inline], [data-math-block]").forEach((element) => {
    promoteInheritedMathStyles(element)
    const latex = element.getAttribute("data-latex")?.trim() || ""
    const isBlock = element.hasAttribute("data-math-block")
    element.textContent = latex ? mathText(latex, isBlock) : ""
  })
  return document.body.innerHTML
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

function mathElementText(element: Element) {
  return mathText(element.getAttribute("data-latex") || "", element.hasAttribute("data-math-block"))
}

function allMathElements(root: ParentNode) {
  return Array.from(root.querySelectorAll("[data-math-inline], [data-math-block]"))
}

function copyableStyleValue(value: string) {
  return usefulStyleValue(value)
}

function promoteComputedMathStyles(source: Element | undefined, target: Element) {
  if (!source || !(target instanceof HTMLElement)) return
  const computed = window.getComputedStyle(source)
  const textColor = copyableStyleValue(computed.color)
  const highlightColor = copyableStyleValue(computed.backgroundColor)
  if (textColor) {
    target.setAttribute("data-text-color", textColor)
    target.style.color = textColor
  }
  if (highlightColor) {
    target.setAttribute("data-highlight-color", highlightColor)
    target.style.backgroundColor = highlightColor
  }
}

function serializeSelectionPlainText(container: HTMLElement) {
  const clone = container.cloneNode(true) as HTMLElement
  allMathElements(clone).forEach((element) => {
    element.textContent = mathElementText(element)
  })
  return clone.textContent || ""
}

export function writeStyledMathClipboardFromSelection(event: ClipboardEvent, plainText?: string) {
  const clipboardData = event.clipboardData
  const selection = typeof window !== "undefined" ? window.getSelection() : null
  if (!clipboardData || !selection?.rangeCount) return false

  const range = selection.getRangeAt(0)
  const ancestor =
    range.commonAncestorContainer instanceof Element ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement
  if (!ancestor) return false

  const selectedMathElements = allMathElements(ancestor).filter((element) => {
    try {
      return range.intersectsNode(element)
    } catch {
      return false
    }
  })
  if (!selectedMathElements.length) return false

  const fragment = range.cloneContents()
  const container = document.createElement("div")
  container.appendChild(fragment)
  const copiedMathElements = allMathElements(container)
  copiedMathElements.forEach((element, index) => {
    promoteComputedMathStyles(selectedMathElements[index], element)
  })

  clipboardData.setData("text/html", container.innerHTML)
  clipboardData.setData("text/plain", plainText || serializeSelectionPlainText(container))
  event.preventDefault()
  return true
}

function mathAttrsFromElement(element: Element, displayMode: boolean) {
  const attrs: Record<string, string> = {
    latex: element.getAttribute("data-latex") || element.textContent?.replace(displayMode ? /^\${2,3}|\${2,3}$/g : /^\${1,2}|\${1,2}$/g, "") || "",
  }
  const textColor = nearestElementStyle(element, "data-text-color", "color")
  const highlightColor = nearestElementStyle(element, "data-highlight-color", "backgroundColor")
  if (textColor) attrs.textColor = textColor
  if (highlightColor) attrs.highlightColor = highlightColor
  return attrs
}

function markStyleValue(value: string | null | undefined) {
  return usefulStyleValue(value)
}

function replaceMark(marks: RichMark[], mark: RichMark) {
  return [...marks.filter((candidate) => candidate.type !== mark.type), mark]
}

function marksFromElement(element: Element, inheritedMarks: RichMark[]) {
  let marks = [...inheritedMarks]

  if (element.tagName === "STRONG" || element.tagName === "B") marks = replaceMark(marks, { type: "bold" })
  if (element.tagName === "EM" || element.tagName === "I") marks = replaceMark(marks, { type: "italic" })
  if (element.tagName === "U") marks = replaceMark(marks, { type: "underline" })
  if (element.tagName === "S" || element.tagName === "DEL" || element.tagName === "STRIKE") marks = replaceMark(marks, { type: "strike" })
  if (element.tagName === "CODE") marks = replaceMark(marks, { type: "code" })
  if (element.tagName === "A") {
    const href = element.getAttribute("href")
    if (href) marks = replaceMark(marks, { type: "link", attrs: { href } })
  }

  if (element instanceof HTMLElement) {
    const textColor = markStyleValue(element.style.color)
    const fontSize = markStyleValue(element.style.fontSize)
    if (textColor || fontSize) {
      const existingTextStyle = marks.find((mark) => mark.type === "textStyle")?.attrs || {}
      marks = replaceMark(marks, {
        type: "textStyle",
        attrs: {
          ...existingTextStyle,
          ...(textColor ? { color: textColor } : {}),
          ...(fontSize ? { fontSize } : {}),
        },
      })
    }

    const highlightColor = markStyleValue(element.style.backgroundColor)
    if (highlightColor) {
      marks = replaceMark(marks, { type: "highlight", attrs: { color: highlightColor } })
    }
  }

  return marks
}

function textNodeFromDom(text: string, marks: RichMark[]): RichInlineNode {
  return marks.length ? { type: "text", text, marks } : { type: "text", text }
}

function inlineNodesFromDom(parent: Node, inheritedMarks: RichMark[] = []): RichInlineNode[] {
  const nodes: RichInlineNode[] = []
  parent.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent || ""
      if (text) nodes.push(textNodeFromDom(text, inheritedMarks))
      return
    }
    if (!(child instanceof Element)) return
    const childMarks = marksFromElement(child, inheritedMarks)
    if (child.matches("[data-math-inline]")) {
      nodes.push({ type: "inlineMath", attrs: mathAttrsFromElement(child, false), ...(childMarks.length ? { marks: childMarks } : {}) })
      return
    }
    if (child.tagName === "BR") {
      nodes.push({ type: "hardBreak" })
      return
    }
    nodes.push(...inlineNodesFromDom(child, childMarks))
  })
  return nodes
}

function paragraphFromDom(element: Node): JSONContent {
  const content = inlineNodesFromDom(element)
  return content.length ? { type: "paragraph", content } : { type: "paragraph" }
}

function listItemFromDom(element: Element): JSONContent {
  const content: JSONContent[] = []
  const blockChildren = Array.from(element.children).filter((child) =>
    ["P", "OL", "UL", "BLOCKQUOTE"].includes(child.tagName) || child.matches("[data-math-block]"),
  )
  if (!blockChildren.length) return { type: "listItem", content: [paragraphFromDom(element)] }
  blockChildren.forEach((child) => {
    const block = blockNodeFromDom(child)
    if (block) content.push(block)
  })
  return { type: "listItem", content: content.length ? content : [{ type: "paragraph" }] }
}

function blockNodeFromDom(element: Element): JSONContent | undefined {
  if (element.matches("[data-math-block]")) {
    return { type: "blockMath", attrs: mathAttrsFromElement(element, true) }
  }
  switch (element.tagName) {
    case "P":
      return paragraphFromDom(element)
    case "LI":
      return listItemFromDom(element)
    case "OL":
      return { type: "orderedList", content: Array.from(element.children).filter((child) => child.tagName === "LI").map(listItemFromDom) }
    case "UL":
      return { type: "bulletList", content: Array.from(element.children).filter((child) => child.tagName === "LI").map(listItemFromDom) }
    case "BLOCKQUOTE": {
      const content = Array.from(element.children).map(blockNodeFromDom).filter(Boolean) as JSONContent[]
      return { type: "blockquote", content: content.length ? content : [paragraphFromDom(element)] }
    }
    case "H1":
      return { type: "heading", attrs: { level: 1 }, content: inlineNodesFromDom(element) }
    case "H2":
      return { type: "heading", attrs: { level: 2 }, content: inlineNodesFromDom(element) }
    case "DIV":
      return paragraphFromDom(element)
    default:
      return paragraphFromDom(element)
  }
}

export function preprocessPastedAsteriaMathHtml(html: string): JSONContent[] | null {
  if (!html.includes("data-math-inline") && !html.includes("data-math-block")) return null
  if (typeof window === "undefined" || typeof window.DOMParser === "undefined") return null
  const document = new window.DOMParser().parseFromString(normalizeAsteriaMathClipboardHtml(html), "text/html")
  const children = Array.from(document.body.children)
  if (!children.length) return null
  if (children.every((child) => child.tagName === "LI")) {
    return [{ type: "orderedList", content: children.map(listItemFromDom) }]
  }
  const nodes = children.map(blockNodeFromDom).filter(Boolean) as JSONContent[]
  return nodes.length ? nodes : null
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
