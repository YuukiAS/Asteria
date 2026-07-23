import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import TextStyle from "@tiptap/extension-text-style"
import Underline from "@tiptap/extension-underline"
import StarterKit from "@tiptap/starter-kit"
import { DividerRule } from "./dividerExtension"
import { FontSizeExtension } from "./FontSizeExtension"
import { ListContinuationExtension } from "./listContinuationExtension"
import { BlockMath, InlineMath } from "./mathExtensions"
import { NotionQuoteExtension } from "./notionQuoteExtension"
import { TaskItem, TaskList } from "./taskListExtensions"

export function createEditorExtensions(placeholder = "Write a model note, prior, theorem, or paper observation...") {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2] },
      horizontalRule: false,
    }),
    DividerRule,
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Underline,
    Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Placeholder.configure({ placeholder }),
    FontSizeExtension,
    InlineMath,
    BlockMath,
    NotionQuoteExtension,
    ListContinuationExtension,
    TaskList,
    TaskItem,
  ]
}
