import { mergeAttributes, Node } from "@tiptap/core"
import { splitListItem } from "prosemirror-schema-list"

export const TaskList = Node.create({
  name: "taskList",
  group: "block list",
  content: "taskItem+",

  parseHTML() {
    return [{ tag: 'ul[data-type="taskList"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["ul", mergeAttributes(HTMLAttributes, { "data-type": "taskList", class: "task-list" }), 0]
  },
})

export const TaskItem = Node.create({
  name: "taskItem",
  content: "paragraph block*",
  defining: true,

  addAttributes() {
    return {
      checked: {
        default: false,
        parseHTML: (element) => element.getAttribute("data-checked") === "true",
        renderHTML: (attributes) => ({ "data-checked": attributes.checked ? "true" : "false" }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'li[data-type="taskItem"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["li", mergeAttributes(HTMLAttributes, { "data-type": "taskItem", class: "task-item" }), 0]
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => splitListItem(this.type)(this.editor.state, this.editor.view.dispatch),
    }
  },

  addNodeView() {
    return ({ editor, getPos, node }) => {
      const listItem = document.createElement("li")
      listItem.dataset.type = "taskItem"
      listItem.dataset.checked = node.attrs.checked ? "true" : "false"
      listItem.className = "task-item"

      const checkbox = document.createElement("input")
      checkbox.type = "checkbox"
      checkbox.checked = Boolean(node.attrs.checked)
      checkbox.className = "task-item-checkbox"
      checkbox.addEventListener("change", () => {
        if (typeof getPos !== "function") return
        editor.view.dispatch(editor.view.state.tr.setNodeMarkup(getPos(), undefined, { ...node.attrs, checked: checkbox.checked }))
      })

      const content = document.createElement("div")
      content.className = "task-item-content"

      listItem.append(checkbox, content)

      return {
        dom: listItem,
        contentDOM: content,
        update(updatedNode) {
          if (updatedNode.type.name !== "taskItem") return false
          checkbox.checked = Boolean(updatedNode.attrs.checked)
          listItem.dataset.checked = updatedNode.attrs.checked ? "true" : "false"
          return true
        },
      }
    }
  },
})
