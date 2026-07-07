import type { Editor } from "@tiptap/react"
import { useState } from "react"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Eraser,
  Highlighter,
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
import { ColorPickerRow } from "./ColorPickerRow"
import { EquationDialog } from "./EquationDialog"
import { FontSizeSelect } from "./FontSizeSelect"

type RichTextToolbarProps = {
  editor: Editor
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
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
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
            applyBlockMathStyle(editor, currentSelectionRange(), { textColor: color })
            editor.chain().focus().setColor(color).run()
          }}
        />
        <ColorPickerRow
          label="Highlight"
          value={highlight}
          palette={backgroundPalette}
          onChange={(color) => {
            applyBlockMathStyle(editor, currentSelectionRange(), { highlightColor: color })
            editor.chain().focus().setHighlight({ color }).run()
          }}
        />
      </div>
      <EquationDialog
        open={Boolean(equationDialogMode)}
        title={equationDialogMode === "inline" ? "Inline equation" : "Block equation"}
        initialLatex={equationDialogMode === "inline" ? "\\beta_j \\sim N_q(\\nu,\\Psi)" : undefined}
        displayMode={equationDialogMode !== "inline"}
        submitOnEnter={equationDialogMode === "inline"}
        onCancel={() => setEquationDialogMode(null)}
        onConfirm={confirmEquation}
      />
    </div>
  )
}
