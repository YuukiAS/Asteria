import { Extension } from "@tiptap/core"
import { TextSelection } from "prosemirror-state"
import type { EditorState, Transaction } from "prosemirror-state"

const listTypes = new Set(["bulletList", "orderedList", "taskList"])

function isEmptyListItem(node: EditorState["doc"]) {
  return node.type.name === "listItem" && node.textContent.trim().length === 0
}

function continueParentListItem(state: EditorState, dispatch?: (tr: Transaction) => void) {
  const { selection, schema } = state
  if (!selection.empty) return false
  const paragraphType = schema.nodes.paragraph
  if (!paragraphType) return false

  const $from = selection.$from
  let listItemDepth = -1
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type.name === "listItem") {
      listItemDepth = depth
      break
    }
  }
  if (listItemDepth < 3) return false

  const parentListDepth = listItemDepth - 1
  if (!listTypes.has($from.node(parentListDepth).type.name)) return false

  let ancestorListItemDepth = -1
  for (let depth = parentListDepth - 1; depth > 0; depth -= 1) {
    if ($from.node(depth).type.name === "listItem") {
      ancestorListItemDepth = depth
      break
    }
  }
  if (ancestorListItemDepth < 1) return false

  const currentItemStart = $from.before(listItemDepth)
  const currentItemEnd = $from.after(listItemDepth)
  const currentItem = state.doc.nodeAt(currentItemStart)
  if (!currentItem || !isEmptyListItem(currentItem)) return false

  const parentListEnd = $from.after(parentListDepth)
  if (!dispatch) return true

  let tr = state.tr.delete(currentItemStart, currentItemEnd)
  const insertPosition = tr.mapping.map(parentListEnd)
  tr = tr.insert(insertPosition, paragraphType.create())
  tr = tr.setSelection(TextSelection.create(tr.doc, insertPosition + 1))
  dispatch(tr.scrollIntoView())
  return true
}

export const ListContinuationExtension = Extension.create({
  name: "listContinuation",

  addKeyboardShortcuts() {
    return {
      Enter: () => continueParentListItem(this.editor.state, this.editor.view.dispatch),
      Tab: () => continueParentListItem(this.editor.state, this.editor.view.dispatch),
      "Shift-Tab": () => continueParentListItem(this.editor.state, this.editor.view.dispatch),
    }
  },
})
