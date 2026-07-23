import { Extension, wrappingInputRule } from "@tiptap/core"
import type { ResolvedPos } from "@tiptap/pm/model"
import { TextSelection } from "@tiptap/pm/state"
import type { EditorView } from "@tiptap/pm/view"

function findAncestorDepth($from: ResolvedPos, typeName: string) {
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type.name === typeName) return depth
  }
  return -1
}

function exitBlockquoteToParagraph(view: EditorView) {
  const { state, dispatch } = view
  const { selection, schema } = state
  if (!selection.empty) return false
  const paragraphType = schema.nodes.paragraph
  if (!paragraphType) return false

  const quoteDepth = findAncestorDepth(selection.$from, "blockquote")
  if (quoteDepth < 1) return false

  const insertPosition = selection.$from.after(quoteDepth)
  if (!dispatch) return true

  const paragraph = paragraphType.create()
  let tr = state.tr.insert(insertPosition, paragraph)
  tr = tr.setSelection(TextSelection.create(tr.doc, insertPosition + 1))
  dispatch(tr.scrollIntoView())
  return true
}

export const NotionQuoteExtension = Extension.create({
  name: "notionQuote",
  priority: 1200,

  addInputRules() {
    const blockquoteType = this.editor.schema.nodes.blockquote
    if (!blockquoteType) return []
    return [
      wrappingInputRule({
        find: /^["“]\s$/,
        type: blockquoteType,
      }),
    ]
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => exitBlockquoteToParagraph(this.editor.view),
      "Shift-Enter": () => (this.editor.isActive("blockquote") ? this.editor.commands.setHardBreak() : false),
    }
  },
})
