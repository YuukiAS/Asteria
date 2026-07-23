import type { Editor } from "@tiptap/react"
import { useRef, useState } from "react"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Eraser,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Sigma,
  Strikethrough,
  Type,
  Underline,
  Unlink,
} from "lucide-react"
import { backgroundPalette, textPalette } from "../constants/palette"
import { applyBlockMathStyle } from "../editor/blockMathStyling"
import { recordRichColor } from "../editor/richColorMemory"
import { defaultImageLinkSize, imageLinkLabelFromUrl } from "../lib/imageLinks"
import { ColorPickerRow } from "./ColorPickerRow"
import { EquationDialog } from "./EquationDialog"
import { FontSizeSelect } from "./FontSizeSelect"
import { ImageLinkDialog } from "./ImageLinkDialog"

type RichTextToolbarProps = {
  editor: Editor
}

type AsteriaLinkAttrs = {
  href: string
  asteriaImageLink?: "true" | null
  asteriaImageSize?: string | null
}

function ToolButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs transition ${
        active ? "border-accent bg-accentSoft text-accent" : "border-border bg-panel text-secondary hover:text-foreground"
      }`}
      title={label}
      aria-label={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function RichTextToolbar({ editor }: RichTextToolbarProps) {
  const [equationDialogMode, setEquationDialogMode] = useState<"inline" | "block" | null>(null)
  const [isImageLinkDialogOpen, setIsImageLinkDialogOpen] = useState(false)
  const imageLinkSelectionRef = useRef<{ from: number; to: number }>()
  const textColor = (editor.getAttributes("textStyle").color as string) || "#111827"
  const highlight = (editor.getAttributes("highlight").color as string) || "#fef3c7"
  const currentSelectionRange = () => {
    const { from, to } = editor.state.selection
    return from !== to ? { from, to } : undefined
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("Link URL", previousUrl || "https://")
    if (url === null) return
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run()
      return
    }
    const attrs: AsteriaLinkAttrs = { href: url, asteriaImageLink: null, asteriaImageSize: null }
    editor.chain().focus().extendMarkRange("link").setLink(attrs).run()
  }

  const openImageLinkDialog = () => {
    const { from, to } = editor.state.selection
    imageLinkSelectionRef.current = { from, to }
    setIsImageLinkDialogOpen(true)
  }

  const confirmImageLink = (url: string) => {
    const attrs: AsteriaLinkAttrs = { href: url, asteriaImageLink: "true", asteriaImageSize: defaultImageLinkSize }
    const range = imageLinkSelectionRef.current
    setIsImageLinkDialogOpen(false)
    imageLinkSelectionRef.current = undefined
    if (range) editor.commands.setTextSelection(range)
    const selection = editor.state.selection
    if (!selection.empty || editor.isActive("link")) {
      editor.chain().focus().extendMarkRange("link").setLink(attrs).run()
      return
    }
    editor
      .chain()
      .focus()
      .insertContent({
        type: "text",
        text: imageLinkLabelFromUrl(url),
        marks: [{ type: "link", attrs }],
      })
      .run()
  }

  const insertInlineMath = () => {
    setEquationDialogMode("inline")
  }

  const insertBlockMath = () => {
    setEquationDialogMode("block")
  }

  const confirmEquation = (latex: string) => {
    const mode = equationDialogMode
    setEquationDialogMode(null)
    if (mode === "inline") editor.chain().focus().insertInlineMath(latex).run()
    if (mode === "block") editor.chain().focus().insertBlockMath(latex).run()
  }

  return (
    <div className="grid gap-3 rounded-lg border border-border bg-app/60 p-2">
      <div className="flex flex-wrap gap-1.5">
        <ToolButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={15} />
        </ToolButton>
        <ToolButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={15} />
        </ToolButton>
        <ToolButton
          label="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline size={15} />
        </ToolButton>
        <ToolButton label="Strike" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={15} />
        </ToolButton>
        <ToolButton label="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code size={15} />
        </ToolButton>
        <ToolButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={15} />
        </ToolButton>
        <ToolButton label="Ordered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={15} />
        </ToolButton>
        <ToolButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={15} />
        </ToolButton>
        <ToolButton label="Paragraph" active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}>
          <Pilcrow size={15} />
        </ToolButton>
        <ToolButton label="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          H1
        </ToolButton>
        <ToolButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </ToolButton>
        <ToolButton label="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft size={15} />
        </ToolButton>
        <ToolButton label="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter size={15} />
        </ToolButton>
        <ToolButton label="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight size={15} />
        </ToolButton>
        <ToolButton label="Link" active={editor.isActive("link")} onClick={setLink}>
          <LinkIcon size={15} />
        </ToolButton>
        <ToolButton label="Image link" active={editor.getAttributes("link").asteriaImageLink === "true"} onClick={openImageLinkDialog}>
          <ImageIcon size={15} />
        </ToolButton>
        <ToolButton label="Remove link" onClick={() => editor.chain().focus().unsetLink().run()}>
          <Unlink size={15} />
        </ToolButton>
        <ToolButton label="Inline math" onClick={insertInlineMath}>
          <Sigma size={15} />
        </ToolButton>
        <ToolButton label="Block math" onClick={insertBlockMath}>
          <span className="font-mono text-[11px]">$$</span>
        </ToolButton>
        <ToolButton label="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          <Eraser size={15} />
        </ToolButton>
        <FontSizeSelect editor={editor} />
      </div>
      <div className="grid gap-3">
        <ColorPickerRow
          label="Text color"
          value={textColor}
          palette={textPalette}
          onChange={(color) => {
            recordRichColor("text", color)
            applyBlockMathStyle(editor, currentSelectionRange(), { textColor: color })
            editor.chain().focus().setColor(color).run()
          }}
        />
        <ColorPickerRow
          label="Highlight"
          value={highlight}
          palette={backgroundPalette}
          onChange={(color) => {
            recordRichColor("highlight", color)
            applyBlockMathStyle(editor, currentSelectionRange(), { highlightColor: color })
            editor.chain().focus().setHighlight({ color }).run()
          }}
        />
      </div>
      <EquationDialog
        open={Boolean(equationDialogMode)}
        title={equationDialogMode === "inline" ? "Inline equation" : "Block equation"}
        initialLatex={equationDialogMode === "inline" ? "" : undefined}
        displayMode={equationDialogMode !== "inline"}
        submitOnEnter={equationDialogMode === "inline"}
        onCancel={() => setEquationDialogMode(null)}
        onConfirm={confirmEquation}
      />
      <ImageLinkDialog
        open={isImageLinkDialogOpen}
        initialHref={(editor.getAttributes("link").href as string | undefined) || ""}
        onCancel={() => setIsImageLinkDialogOpen(false)}
        onConfirm={confirmImageLink}
      />
    </div>
  )
}
