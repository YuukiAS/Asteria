import { BubbleMenu, type Editor } from "@tiptap/react"
import { Bold, Code, Highlighter, Italic, Link as LinkIcon, Sigma, Strikethrough, Type, Underline } from "lucide-react"
import { backgroundPalette, textPalette } from "../constants/palette"

type RichTextBubbleMenuProps = {
  editor: Editor
}

function selectionChain(editor: Editor) {
  const savedSelection = editor.storage.asteriaSelection as { from: number; to: number } | undefined
  const chain = editor.chain().focus()
  return savedSelection && savedSelection.from !== savedSelection.to ? chain.setTextSelection(savedSelection) : chain
}

function getSavedRange(editor: Editor) {
  const savedSelection = editor.storage.asteriaSelection as { from: number; to: number } | undefined
  const { from, to } = savedSelection && savedSelection.from !== savedSelection.to ? savedSelection : editor.state.selection
  return from !== to ? { from, to } : undefined
}

function applyMark(editor: Editor, markName: string, attrs?: Record<string, string>, toggle = true) {
  const range = getSavedRange(editor)
  const markType = editor.state.schema.marks[markName]
  if (!range || !markType) return
  const hasMark = editor.state.doc.rangeHasMark(range.from, range.to, markType)
  const transaction =
    toggle && hasMark
      ? editor.state.tr.removeMark(range.from, range.to, markType)
      : editor.state.tr.addMark(range.from, range.to, markType.create(attrs))
  editor.view.dispatch(transaction.scrollIntoView())
  editor.commands.focus()
  editor.commands.setTextSelection(range)
  editor.storage.asteriaSelection = range
}

function BubbleButton({
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
      className={`flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 ${
        active ? "bg-accentSoft text-accent" : "text-secondary hover:bg-app hover:text-foreground"
      }`}
      aria-label={label}
      title={label}
      onMouseDown={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onClick()
      }}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      {children}
    </button>
  )
}

function ColorSwatch({
  color,
  label,
  onApply,
}: {
  color: string
  label: string
  onApply: () => void
}) {
  return (
    <button
      type="button"
      className="h-5 w-5 rounded-full border border-border shadow-sm transition hover:scale-110"
      style={{ backgroundColor: color }}
      aria-label={label}
      title={label}
      onMouseDown={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onApply()
      }}
      onClick={(event) => {
        event.stopPropagation()
      }}
    />
  )
}

export function RichTextBubbleMenu({ editor }: RichTextBubbleMenuProps) {
  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 120,
        placement: "auto",
        interactive: true,
        zIndex: 80,
        appendTo: () => document.body,
        popperOptions: {
          modifiers: [
            { name: "flip", options: { padding: 12 } },
            { name: "preventOverflow", options: { padding: 12 } },
          ],
        },
      }}
      shouldShow={({ editor: activeEditor, from, to }) => activeEditor.isFocused && from !== to}
    >
      <div
        className="nodrag nopan nowheel grid w-[382px] max-w-[calc(100vw-24px)] gap-2 rounded-2xl border border-border bg-panel p-3 shadow-float"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid grid-cols-5 gap-1">
          <BubbleButton label="Text color" onClick={() => applyMark(editor, "textStyle", { color: "#2563eb" }, false)}>
            <span className="grid h-[18px] w-[18px] place-items-center rounded-md border border-border text-[13px] font-semibold">A</span>
          </BubbleButton>
          <BubbleButton label="Bold" active={editor.isActive("bold")} onClick={() => applyMark(editor, "bold")}>
          <Bold size={14} />
          </BubbleButton>
          <BubbleButton label="Italic" active={editor.isActive("italic")} onClick={() => selectionChain(editor).toggleItalic().run()}>
            <Italic size={14} />
          </BubbleButton>
          <BubbleButton
            label="Underline"
            active={editor.isActive("underline")}
            onClick={() => selectionChain(editor).toggleUnderline().run()}
          >
            <Underline size={14} />
          </BubbleButton>
          <BubbleButton label="Highlight" onClick={() => selectionChain(editor).toggleHighlight({ color: "#fef3c7" }).run()}>
            <Highlighter size={14} />
          </BubbleButton>
        </div>
        <div className="grid grid-cols-5 gap-1 border-b border-border pb-2">
          <BubbleButton label="Link" active={editor.isActive("link")} onClick={() => selectionChain(editor).toggleLink({ href: "https://" }).run()}>
            <LinkIcon size={14} />
          </BubbleButton>
          <BubbleButton label="Strike" active={editor.isActive("strike")} onClick={() => applyMark(editor, "strike")}>
            <Strikethrough size={14} />
          </BubbleButton>
          <BubbleButton label="Code" active={editor.isActive("code")} onClick={() => selectionChain(editor).toggleCode().run()}>
            <Code size={14} />
          </BubbleButton>
          <BubbleButton label="Inline math" onClick={() => selectionChain(editor).insertInlineMath("x^2").run()}>
            <Sigma size={14} />
          </BubbleButton>
          <BubbleButton label="Clear marks" onClick={() => selectionChain(editor).unsetAllMarks().run()}>
            <Type size={14} />
          </BubbleButton>
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Text color</div>
        <div className="grid grid-cols-12 gap-1.5">
          {textPalette.map((color) => (
            <ColorSwatch
              key={color}
              color={color}
              label={`Set text ${color}`}
              onApply={() => applyMark(editor, "textStyle", { color }, false)}
            />
          ))}
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Highlight</div>
        <div className="grid grid-cols-12 gap-1.5">
          {backgroundPalette.map((color) => (
            <ColorSwatch
              key={color}
              color={color}
              label={`Set highlight ${color}`}
              onApply={() => applyMark(editor, "highlight", { color }, false)}
            />
          ))}
        </div>
      </div>
    </BubbleMenu>
  )
}
