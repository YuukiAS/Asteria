import { BubbleMenu, type Editor } from "@tiptap/react"
import { Bold, Code, Highlighter, Italic, Link as LinkIcon, Sigma, Strikethrough, Type, Underline } from "lucide-react"
import { useEffect } from "react"
import { backgroundPalette, textPalette } from "../constants/palette"
import { applyBlockMathStyle } from "../editor/blockMathStyling"
import { recordRichColor } from "../editor/richColorMemory"

type RichTextBubbleMenuProps = {
  editor: Editor
  onInlineMathRequest: () => void
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
  if (attrs?.color && markName === "textStyle") applyBlockMathStyle(editor, range, { textColor: attrs.color })
  if (attrs?.color && markName === "highlight") applyBlockMathStyle(editor, range, { highlightColor: attrs.color })
  const chain = editor.chain().focus().setTextSelection(range)
  const hasMark = editor.state.doc.rangeHasMark(range.from, range.to, markType)
  if (toggle && hasMark) {
    chain.unsetMark(markName).run()
  } else if (toggle) {
    chain.toggleMark(markName, attrs).run()
  } else {
    chain.setMark(markName, attrs).run()
  }
  editor.commands.setTextSelection(range)
  editor.storage.asteriaSelection = range
}

function applySelectionCommand(editor: Editor, command: (chain: ReturnType<Editor["chain"]>) => ReturnType<Editor["chain"]>) {
  const range = getSavedRange(editor)
  if (!range) return
  const chain = editor.chain().focus().setTextSelection(range)
  command(chain).run()
  editor.commands.setTextSelection(range)
  editor.storage.asteriaSelection = range
}

function applyTextColor(editor: Editor, color: string) {
  recordRichColor("text", color)
  const range = getSavedRange(editor)
  if (!range) return
  applyBlockMathStyle(editor, range, { textColor: color })
  applySelectionCommand(editor, (chain) => chain.setColor(color))
}

function applyHighlight(editor: Editor, color: string) {
  recordRichColor("highlight", color)
  const range = getSavedRange(editor)
  if (!range) return
  applyBlockMathStyle(editor, range, { highlightColor: color })
  applySelectionCommand(editor, (chain) => chain.setHighlight({ color }))
}

function BubbleButton({
  label,
  active,
  onClick,
  command,
  value,
  children,
}: {
  label: string
  active?: boolean
  onClick: () => void
  command?: string
  value?: string
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
      data-asteria-bubble-command={command}
      data-asteria-bubble-value={value}
      onPointerDown={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
      onMouseDown={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onClick()
      }}
      onClick={(event) => {
        event.preventDefault()
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
      data-asteria-bubble-command={label.startsWith("Set text ") ? "text-color" : "highlight"}
      data-asteria-bubble-value={color}
      onPointerDown={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
      onMouseDown={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onApply()
      }}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
    />
  )
}

export function RichTextBubbleMenu({ editor, onInlineMathRequest }: RichTextBubbleMenuProps) {
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (!(event.target instanceof HTMLElement)) return
      const button = event.target.closest<HTMLElement>("[data-asteria-bubble-command]")
      if (!button || !button.closest("[data-asteria-bubble-menu]")) return
      const command = button.dataset.asteriaBubbleCommand
      const value = button.dataset.asteriaBubbleValue
      if (!command) return

      event.preventDefault()
      event.stopPropagation()

      switch (command) {
        case "text-color":
          if (value) applyTextColor(editor, value)
          return
        case "bold":
          applyMark(editor, "bold")
          return
        case "italic":
          selectionChain(editor).toggleItalic().run()
          return
        case "underline":
          selectionChain(editor).toggleUnderline().run()
          return
        case "highlight":
          applyHighlight(editor, value || "#fef3c7")
          return
        case "link":
          selectionChain(editor).toggleLink({ href: "https://" }).run()
          return
        case "strike":
          applyMark(editor, "strike")
          return
        case "code":
          selectionChain(editor).toggleCode().run()
          return
        case "inline-math":
          onInlineMathRequest()
          return
        case "clear-marks":
          selectionChain(editor).unsetAllMarks().run()
          return
      }
    }

    document.addEventListener("mousedown", handleMouseDown, true)
    return () => document.removeEventListener("mousedown", handleMouseDown, true)
  }, [editor, onInlineMathRequest])

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
      shouldShow={({ editor: activeEditor, from, to }) => {
        if (!activeEditor.isFocused || from === to) return false
        editor.storage.asteriaSelection = { from, to }
        return true
      }}
    >
      <div
        data-asteria-bubble-menu="true"
        className="nodrag nopan nowheel grid w-[382px] max-w-[calc(100vw-24px)] gap-2 rounded-2xl border border-border bg-panel p-3 shadow-float"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid grid-cols-5 gap-1">
          <BubbleButton label="Text color" command="text-color" value="#2563eb" onClick={() => applyTextColor(editor, "#2563eb")}>
            <span className="grid h-[18px] w-[18px] place-items-center rounded-md border border-border text-[13px] font-semibold">A</span>
          </BubbleButton>
          <BubbleButton label="Bold" command="bold" active={editor.isActive("bold")} onClick={() => applyMark(editor, "bold")}>
          <Bold size={14} />
          </BubbleButton>
          <BubbleButton label="Italic" command="italic" active={editor.isActive("italic")} onClick={() => selectionChain(editor).toggleItalic().run()}>
            <Italic size={14} />
          </BubbleButton>
          <BubbleButton
            label="Underline"
            command="underline"
            active={editor.isActive("underline")}
            onClick={() => selectionChain(editor).toggleUnderline().run()}
          >
            <Underline size={14} />
          </BubbleButton>
          <BubbleButton label="Highlight" command="highlight" value="#fef3c7" onClick={() => applyHighlight(editor, "#fef3c7")}>
            <Highlighter size={14} />
          </BubbleButton>
        </div>
        <div className="grid grid-cols-5 gap-1 border-b border-border pb-2">
          <BubbleButton label="Link" command="link" active={editor.isActive("link")} onClick={() => selectionChain(editor).toggleLink({ href: "https://" }).run()}>
            <LinkIcon size={14} />
          </BubbleButton>
          <BubbleButton label="Strike" command="strike" active={editor.isActive("strike")} onClick={() => applyMark(editor, "strike")}>
            <Strikethrough size={14} />
          </BubbleButton>
          <BubbleButton label="Code" command="code" active={editor.isActive("code")} onClick={() => selectionChain(editor).toggleCode().run()}>
            <Code size={14} />
          </BubbleButton>
          <BubbleButton label="Inline math" command="inline-math" onClick={onInlineMathRequest}>
            <Sigma size={14} />
          </BubbleButton>
          <BubbleButton label="Clear marks" command="clear-marks" onClick={() => selectionChain(editor).unsetAllMarks().run()}>
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
              onApply={() => applyTextColor(editor, color)}
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
              onApply={() => applyHighlight(editor, color)}
            />
          ))}
        </div>
      </div>
    </BubbleMenu>
  )
}
