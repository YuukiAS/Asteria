import type { Editor } from "@tiptap/react"
import { applyBlockMathStyle } from "./blockMathStyling"

type RichColorKind = "text" | "highlight"
type SelectionRange = { from: number; to: number }

type RecentRichColor = {
  kind: RichColorKind
  color: string
}

const defaultRecentRichColor: RecentRichColor = { kind: "highlight", color: "#fef3c7" }

let recentRichColor: RecentRichColor = defaultRecentRichColor

function currentRange(editor: Editor) {
  const savedSelection = editor.storage.asteriaSelection as SelectionRange | undefined
  const selection = savedSelection && savedSelection.from !== savedSelection.to ? savedSelection : editor.state.selection
  const { from, to } = selection
  return from !== to ? { from, to } : undefined
}

function isMathNode(typeName: string) {
  return typeName === "blockMath" || typeName === "inlineMath"
}

function selectionText(nodeText: string | undefined, pos: number, range: SelectionRange) {
  if (!nodeText) return ""
  const start = Math.max(range.from - pos, 0)
  const end = Math.min(range.to - pos, nodeText.length)
  return start < end ? nodeText.slice(start, end) : ""
}

function selectionFullyUsesColor(editor: Editor, range: SelectionRange, kind: RichColorKind, color: string) {
  const markName = kind === "text" ? "textStyle" : "highlight"
  const attrName = kind === "text" ? "textColor" : "highlightColor"
  let checked = 0
  let allMatch = true

  editor.state.doc.nodesBetween(range.from, range.to, (node, pos) => {
    if (node.isText) {
      const text = selectionText(node.text, pos, range)
      if (!text.trim()) return
      checked += 1
      const hasColor = node.marks.some((mark) => mark.type.name === markName && mark.attrs.color === color)
      if (!hasColor) allMatch = false
      return
    }
    if (!isMathNode(node.type.name)) return
    checked += 1
    if (node.attrs[attrName] !== color) allMatch = false
  })

  return checked > 0 && allMatch
}

function setMathColor(editor: Editor, range: SelectionRange, kind: RichColorKind, color: string | null) {
  const attrName = kind === "text" ? "textColor" : "highlightColor"
  let changed = false
  const transaction = editor.state.tr

  editor.state.doc.nodesBetween(range.from, range.to, (node, pos) => {
    if (!isMathNode(node.type.name) || node.attrs[attrName] === color) return
    transaction.setNodeMarkup(pos, undefined, { ...node.attrs, [attrName]: color })
    changed = true
  })

  if (changed) editor.view.dispatch(transaction.scrollIntoView())
  return changed
}

export function recordRichColor(kind: RichColorKind, color: string) {
  recentRichColor = { kind, color }
}

export function getRecentRichColor() {
  return recentRichColor
}

export function applyRecentRichColor(editor: Editor) {
  const { kind, color } = getRecentRichColor()
  const range = currentRange(editor)
  const shouldClear = range ? selectionFullyUsesColor(editor, range, kind, color) : false

  if (kind === "text") {
    if (range && shouldClear) {
      setMathColor(editor, range, kind, null)
      editor.chain().focus().setTextSelection(range).unsetColor().run()
    } else {
      applyBlockMathStyle(editor, range, { textColor: color })
      const chain = editor.chain().focus()
      if (range) chain.setTextSelection(range)
      chain.setColor(color).run()
    }
  } else if (range && shouldClear) {
    setMathColor(editor, range, kind, null)
    editor.chain().focus().setTextSelection(range).unsetHighlight().run()
  } else {
    applyBlockMathStyle(editor, range, { highlightColor: color })
    const chain = editor.chain().focus()
    if (range) chain.setTextSelection(range)
    chain.setHighlight({ color }).run()
  }

  if (range) {
    editor.commands.setTextSelection(range)
    editor.storage.asteriaSelection = range
  }
}
