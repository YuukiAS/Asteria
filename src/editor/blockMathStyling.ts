import type { Editor } from "@tiptap/react"

export type BlockMathStyleAttrs = {
  textColor?: string
  highlightColor?: string
}

export function applyBlockMathStyle(editor: Editor, range: { from: number; to: number } | undefined, attrs: BlockMathStyleAttrs) {
  if (!range) return false
  let changed = false
  const transaction = editor.state.tr
  editor.state.doc.nodesBetween(range.from, range.to, (node, pos) => {
    if (node.type.name !== "blockMath") return
    transaction.setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs })
    changed = true
  })
  if (!changed) return false
  editor.view.dispatch(transaction.scrollIntoView())
  editor.commands.focus()
  editor.commands.setTextSelection(range)
  return true
}
