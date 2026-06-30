import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import TextStyle from "@tiptap/extension-text-style"
import Underline from "@tiptap/extension-underline"
import StarterKit from "@tiptap/starter-kit"
import { FontSizeExtension } from "./FontSizeExtension"
import { BlockMath, InlineMath } from "./mathExtensions"

export function createEditorExtensions(placeholder = "Write a model note, prior, theorem, or paper observation...") {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2] },
    }),
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
  ]
}
