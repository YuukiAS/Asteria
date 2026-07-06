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

export const InlineMath = Node.create({
  name: "inlineMath",
  group: "inline",
  inline: true,
  atom: true,
  marks: "_",

  addAttributes() {
    return { latex: { default: "" } }
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
      }),
      HTMLAttributes.latex || "",
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("span")
      dom.dataset.mathInline = ""
      dom.className = "math-inline"
      dom.style.color = "inherit"
      dom.innerHTML = renderMath(node.attrs.latex, false)
      return { dom }
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
    return { latex: { default: "" } }
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
      }),
      HTMLAttributes.latex || "",
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("div")
      dom.dataset.mathBlock = ""
      dom.className = "math-block"
      dom.style.color = "inherit"
      dom.innerHTML = renderMath(node.attrs.latex, true)
      return { dom }
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
