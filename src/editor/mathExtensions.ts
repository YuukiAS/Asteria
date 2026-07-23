import { mergeAttributes, Node } from "@tiptap/core"
import type { DOMOutputSpec } from "@tiptap/pm/model"
import katex from "katex"
import { Plugin } from "prosemirror-state"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    math: {
      insertInlineMath: (latex: string) => ReturnType
      insertBlockMath: (latex: string) => ReturnType
    }
  }
}

function renderMath(latex: string, displayMode: boolean) {
  try {
    return katex.renderToString(latex, { displayMode, throwOnError: false, strict: false })
  } catch {
    return `<code>${latex}</code>`
  }
}

function applyBlockMathStyle(dom: HTMLElement, attrs: Record<string, string | null | undefined>) {
  dom.style.color = attrs.textColor || ""
  dom.style.backgroundColor = attrs.highlightColor || ""
}

function mathStyleAttributes(attrs: Record<string, string | null | undefined>) {
  const textColor = attrs.textColor || undefined
  const highlightColor = attrs.highlightColor || undefined
  return {
    ...(textColor ? { "data-text-color": textColor } : {}),
    ...(highlightColor ? { "data-highlight-color": highlightColor } : {}),
    style: [
      textColor ? `color: ${textColor}` : "",
      highlightColor ? `background-color: ${highlightColor}` : "",
    ]
      .filter(Boolean)
      .join("; "),
  }
}

function applyAttributes(dom: HTMLElement, attrs: Record<string, string | undefined>) {
  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined) dom.setAttribute(key, value)
  })
}

function parsedStyleValue(value: string | null | undefined) {
  const normalized = value?.trim()
  if (!normalized || normalized === "inherit" || normalized === "initial" || normalized === "unset" || normalized === "transparent") return undefined
  if (/^rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)$/i.test(normalized)) return undefined
  return normalized
}

function nearestParsedStyle(element: Element, dataAttribute: string, styleName: "color" | "backgroundColor") {
  let current: Element | null = element
  while (current) {
    const dataValue = parsedStyleValue(current.getAttribute(dataAttribute))
    if (dataValue) return dataValue
    if (current instanceof HTMLElement) {
      const styleValue = parsedStyleValue(current.style[styleName])
      if (styleValue) return styleValue
    }
    current = current.parentElement
  }
  return null
}

function parseMathElementAttrs(element: Element, displayMode: boolean) {
  return {
    latex: element.getAttribute("data-latex") || element.textContent?.replace(displayMode ? /^\${2,3}|\${2,3}$/g : /^\${1,2}|\${1,2}$/g, "") || "",
    textColor: nearestParsedStyle(element, "data-text-color", "color"),
    highlightColor: nearestParsedStyle(element, "data-highlight-color", "backgroundColor"),
  }
}

function mathClipboardDom(tagName: "span" | "div", attrs: Record<string, string | undefined>, latex: string, displayMode: boolean): DOMOutputSpec {
  if (typeof document === "undefined") return [tagName, attrs, latex]
  const dom = document.createElement(tagName)
  applyAttributes(dom, attrs)
  dom.innerHTML = renderMath(latex, displayMode)
  return dom
}

export const InlineMath = Node.create({
  name: "inlineMath",
  group: "inline",
  inline: true,
  atom: true,
  marks: "_",

  addAttributes() {
    return {
      latex: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-latex") || element.textContent?.replace(/^\${1,2}|\${1,2}$/g, "") || "",
        renderHTML: (attributes) => ({ "data-latex": attributes.latex }),
      },
      textColor: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-text-color") || element.style.color || null,
        renderHTML: (attributes) => (attributes.textColor ? { "data-text-color": attributes.textColor } : {}),
      },
      highlightColor: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-highlight-color") || element.style.backgroundColor || null,
        renderHTML: (attributes) => (attributes.highlightColor ? { "data-highlight-color": attributes.highlightColor } : {}),
      },
    }
  },

  parseHTML() {
    return [{ tag: "span[data-math-inline]", getAttrs: (element) => parseMathElementAttrs(element as Element, false) }]
  },

  renderHTML({ HTMLAttributes }) {
    const latex = String(HTMLAttributes["data-latex"] || "")
    const attrs = mergeAttributes(HTMLAttributes, {
        "data-math-inline": "",
        class: "math-inline",
        ...mathStyleAttributes({
          textColor: HTMLAttributes["data-text-color"],
          highlightColor: HTMLAttributes["data-highlight-color"],
        }),
      })
    return mathClipboardDom("span", attrs, latex, false)
  },

  addNodeView() {
    return ({ node }) => {
      let currentNode = node
      const dom = document.createElement("span")
      dom.dataset.mathInline = ""
      dom.dataset.latex = node.attrs.latex || ""
      dom.className = "math-inline"
      if (node.attrs.textColor) dom.dataset.textColor = node.attrs.textColor
      if (node.attrs.highlightColor) dom.dataset.highlightColor = node.attrs.highlightColor
      applyBlockMathStyle(dom, node.attrs)
      dom.innerHTML = renderMath(node.attrs.latex, false)
      return {
        dom,
        update(nextNode) {
          if (nextNode.type.name !== "inlineMath") return false
          if (nextNode.attrs.textColor) {
            dom.dataset.textColor = nextNode.attrs.textColor
          } else {
            delete dom.dataset.textColor
          }
          if (nextNode.attrs.highlightColor) {
            dom.dataset.highlightColor = nextNode.attrs.highlightColor
          } else {
            delete dom.dataset.highlightColor
          }
          applyBlockMathStyle(dom, nextNode.attrs)
          if (nextNode.attrs.latex !== currentNode.attrs.latex) {
            dom.dataset.latex = nextNode.attrs.latex || ""
            dom.innerHTML = renderMath(nextNode.attrs.latex, false)
          }
          currentNode = nextNode
          return true
        },
      }
    }
  },

  addCommands() {
    return {
      insertInlineMath:
        (latex) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { latex } }),
    }
  },

})

export const BlockMath = Node.create({
  name: "blockMath",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-latex") || element.textContent?.replace(/^\${2,3}|\${2,3}$/g, "") || "",
        renderHTML: (attributes) => ({ "data-latex": attributes.latex }),
      },
      textColor: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-text-color") || element.style.color || null,
        renderHTML: (attributes) => (attributes.textColor ? { "data-text-color": attributes.textColor } : {}),
      },
      highlightColor: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-highlight-color") || element.style.backgroundColor || null,
        renderHTML: (attributes) => (attributes.highlightColor ? { "data-highlight-color": attributes.highlightColor } : {}),
      },
    }
  },

  parseHTML() {
    return [{ tag: "div[data-math-block]", getAttrs: (element) => parseMathElementAttrs(element as Element, true) }]
  },

  renderHTML({ HTMLAttributes }) {
    const latex = String(HTMLAttributes["data-latex"] || "")
    const attrs = mergeAttributes(HTMLAttributes, {
        "data-math-block": "",
        class: "math-block",
        ...mathStyleAttributes({
          textColor: HTMLAttributes["data-text-color"],
          highlightColor: HTMLAttributes["data-highlight-color"],
        }),
      })
    return mathClipboardDom("div", attrs, latex, true)
  },

  addNodeView() {
    return ({ node }) => {
      let currentNode = node
      const dom = document.createElement("div")
      dom.dataset.mathBlock = ""
      dom.dataset.latex = node.attrs.latex || ""
      dom.className = "math-block"
      if (node.attrs.textColor) dom.dataset.textColor = node.attrs.textColor
      if (node.attrs.highlightColor) dom.dataset.highlightColor = node.attrs.highlightColor
      applyBlockMathStyle(dom, node.attrs)
      dom.innerHTML = renderMath(node.attrs.latex, true)
      return {
        dom,
        update(nextNode) {
          if (nextNode.type.name !== "blockMath") return false
          if (nextNode.attrs.textColor) {
            dom.dataset.textColor = nextNode.attrs.textColor
          } else {
            delete dom.dataset.textColor
          }
          if (nextNode.attrs.highlightColor) {
            dom.dataset.highlightColor = nextNode.attrs.highlightColor
          } else {
            delete dom.dataset.highlightColor
          }
          applyBlockMathStyle(dom, nextNode.attrs)
          if (nextNode.attrs.latex !== currentNode.attrs.latex) {
            dom.dataset.latex = nextNode.attrs.latex || ""
            dom.innerHTML = renderMath(nextNode.attrs.latex, true)
          }
          currentNode = nextNode
          return true
        },
      }
    }
  },

  addProseMirrorPlugins() {
    const blockMathName = this.name
    return [
      new Plugin({
        appendTransaction(_transactions, _oldState, newState) {
          const lastChild = newState.doc.lastChild
          if (!lastChild || lastChild.type.name !== blockMathName) return null
          return newState.tr.insert(newState.doc.content.size, newState.schema.nodes.paragraph.create())
        },
      }),
    ]
  },

  addCommands() {
    return {
      insertBlockMath:
        (latex) =>
        ({ commands }) =>
          commands.insertContent([{ type: this.name, attrs: { latex } }, { type: "paragraph" }]),
    }
  },

})
