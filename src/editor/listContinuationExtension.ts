import { Extension } from "@tiptap/core"
import { Fragment, type Node as ProseMirrorNode, type NodeType } from "prosemirror-model"
import { TextSelection } from "prosemirror-state"
import type { EditorState, Transaction } from "prosemirror-state"

const listTypes = new Set(["bulletList", "orderedList", "taskList"])
const listItemTypes = new Set(["listItem", "taskItem"])

function isEmptyListItem(node: EditorState["doc"]) {
  return listItemTypes.has(node.type.name) && node.textContent.trim().length === 0
}

function paragraphFromListItem(listItem: ProseMirrorNode, paragraphType: NodeType) {
  const firstChild = listItem.firstChild
  if (!firstChild || firstChild.type.name !== "paragraph") return paragraphType.create()
  if (listItem.childCount > 1 && listItem.textContent.trim().length > 0) return undefined
  return paragraphType.create(firstChild.attrs, firstChild.content)
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

export function exitEmptyListItemToParagraph(state: EditorState, dispatch?: (tr: Transaction) => void) {
  const { selection, schema } = state
  if (!selection.empty) return false
  const paragraphType = schema.nodes.paragraph
  if (!paragraphType) return false

  const $from = selection.$from
  let listItemDepth = -1
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if (listItemTypes.has($from.node(depth).type.name)) {
      listItemDepth = depth
      break
    }
  }
  if (listItemDepth < 2) return false

  const parentListDepth = listItemDepth - 1
  const parentList = $from.node(parentListDepth)
  if (!listTypes.has(parentList.type.name)) return false

  const currentItemStart = $from.before(listItemDepth)
  const currentItemEnd = $from.after(listItemDepth)
  const currentItem = state.doc.nodeAt(currentItemStart)
  if (!currentItem) return false

  const itemIsEmpty = isEmptyListItem(currentItem)
  if (!itemIsEmpty) return false

  const paragraph = paragraphType.create()
  if (!paragraph) return false

  if (!dispatch) return true

  let tr = state.tr
  if (parentList.childCount <= 1) {
    const listStart = $from.before(parentListDepth)
    const listEnd = $from.after(parentListDepth)
    tr = tr.delete(listStart, listEnd)
    const insertPosition = tr.mapping.map(listStart)
    tr = tr.insert(insertPosition, paragraph)
    tr = tr.setSelection(TextSelection.create(tr.doc, insertPosition + 1))
  } else {
    const listEnd = $from.after(parentListDepth)
    tr = tr.delete(currentItemStart, currentItemEnd)
    const insertPosition = tr.mapping.map(listEnd)
    tr = tr.insert(insertPosition, paragraph)
    tr = tr.setSelection(TextSelection.create(tr.doc, insertPosition + 1))
  }
  dispatch(tr.scrollIntoView())
  return true
}

export function selectionIsInsideListItem(state: EditorState) {
  const { selection } = state
  const $from = selection.$from
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if (listItemTypes.has($from.node(depth).type.name)) return true
  }
  return false
}

export function exitNestedListItemToParentParagraph(state: EditorState, dispatch?: (tr: Transaction) => void) {
  const { selection, schema } = state
  if (!selection.empty) return false
  const paragraphType = schema.nodes.paragraph
  if (!paragraphType) return false

  const $from = selection.$from
  let listItemDepth = -1
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if (listItemTypes.has($from.node(depth).type.name)) {
      listItemDepth = depth
      break
    }
  }
  if (listItemDepth < 3) return false

  const parentListDepth = listItemDepth - 1
  const parentList = $from.node(parentListDepth)
  if (!listTypes.has(parentList.type.name)) return false

  let ancestorListItemDepth = -1
  for (let depth = parentListDepth - 1; depth > 0; depth -= 1) {
    if (listItemTypes.has($from.node(depth).type.name)) {
      ancestorListItemDepth = depth
      break
    }
  }
  if (ancestorListItemDepth < 1) return false

  const itemIndex = $from.index(parentListDepth)
  const currentItemStart = $from.before(listItemDepth)
  const currentItem = state.doc.nodeAt(currentItemStart)
  if (!currentItem || isEmptyListItem(currentItem)) return false

  const paragraph = paragraphFromListItem(currentItem, paragraphType)
  if (!paragraph) return false
  if (!dispatch) return true

  const replacement: ProseMirrorNode[] = []
  const beforeItems: ProseMirrorNode[] = []
  const afterItems: ProseMirrorNode[] = []
  parentList.forEach((child, _offset, index) => {
    if (index < itemIndex) beforeItems.push(child)
    if (index > itemIndex) afterItems.push(child)
  })
  if (beforeItems.length) replacement.push(parentList.type.create(parentList.attrs, Fragment.fromArray(beforeItems)))
  replacement.push(paragraph)
  if (afterItems.length) replacement.push(parentList.type.create(parentList.attrs, Fragment.fromArray(afterItems)))

  const parentListStart = $from.before(parentListDepth)
  const parentListEnd = $from.after(parentListDepth)
  const paragraphStart = parentListStart + (beforeItems.length ? replacement[0].nodeSize : 0)
  let tr = state.tr.replaceWith(parentListStart, parentListEnd, Fragment.fromArray(replacement))
  tr = tr.setSelection(TextSelection.create(tr.doc, paragraphStart + 1))
  dispatch(tr.scrollIntoView())
  return true
}

export const ListContinuationExtension = Extension.create({
  name: "listContinuation",
  priority: 1000,

  addKeyboardShortcuts() {
    return {
      Enter: () => continueParentListItem(this.editor.state, this.editor.view.dispatch),
      "Shift-Tab": () =>
        exitNestedListItemToParentParagraph(this.editor.state, this.editor.view.dispatch) ||
        exitEmptyListItemToParagraph(this.editor.state, this.editor.view.dispatch) ||
        selectionIsInsideListItem(this.editor.state),
    }
  },
})
