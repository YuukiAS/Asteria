import { mergeAttributes, Node } from "@tiptap/core"
import katex from "katex"

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

export const InlineMath = Node.create({
  name: "inlineMath",
  group: "inline",
  inline: true,
  atom: true,
  marks: "_",

  addAttributes() {
    return {
      latex: { default: "" },
      textColor: { default: null },
      highlightColor: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: "span[data-math-inline]" }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-math-inline": "",
        class: "math-inline",
        style: [
          HTMLAttributes.textColor ? `color: ${HTMLAttributes.textColor}` : "",
          HTMLAttributes.highlightColor ? `background-color: ${HTMLAttributes.highlightColor}` : "",
        ]
          .filter(Boolean)
          .join("; "),
      }),
      HTMLAttributes.latex || "",
    ]
  },

  addNodeView() {
    return ({ node }) => {
      let currentNode = node
      const dom = document.createElement("span")
      dom.dataset.mathInline = ""
      dom.className = "math-inline"
      applyBlockMathStyle(dom, node.attrs)
      dom.innerHTML = renderMath(node.attrs.latex, false)
      return {
        dom,
        update(nextNode) {
          if (nextNode.type.name !== "inlineMath") return false
          applyBlockMathStyle(dom, nextNode.attrs)
          if (nextNode.attrs.latex !== currentNode.attrs.latex) {
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
      latex: { default: "" },
      textColor: { default: null },
      highlightColor: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: "div[data-math-block]" }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-math-block": "",
        class: "math-block",
        style: [
          HTMLAttributes.textColor ? `color: ${HTMLAttributes.textColor}` : "",
          HTMLAttributes.highlightColor ? `background-color: ${HTMLAttributes.highlightColor}` : "",
        ]
          .filter(Boolean)
          .join("; "),
      }),
      HTMLAttributes.latex || "",
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("div")
      dom.dataset.mathBlock = ""
      dom.className = "math-block"
      applyBlockMathStyle(dom, node.attrs)
      dom.innerHTML = renderMath(node.attrs.latex, true)
      return {
        dom,
        update(nextNode) {
          if (nextNode.type.name !== "blockMath") return false
          applyBlockMathStyle(dom, nextNode.attrs)
          if (nextNode.attrs.latex !== node.attrs.latex) {
            dom.innerHTML = renderMath(nextNode.attrs.latex, true)
          }
          return true
        },
      }
    }
  },

  addCommands() {
    return {
      insertBlockMath:
        (latex) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { latex } }),
    }
  },

})
