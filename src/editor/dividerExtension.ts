import { nodeInputRule } from "@tiptap/core"
import { HorizontalRule } from "@tiptap/extension-horizontal-rule"

export const DividerRule = HorizontalRule.extend({
  addInputRules() {
    return [
      nodeInputRule({
        find: /^---$/,
        type: this.type,
      }),
    ]
  },
})
