import { EditorContent, type JSONContent, useEditor } from "@tiptap/react"
import { Fragment, Slice } from "prosemirror-model"
import { useEffect, useRef, useState } from "react"
import { createEditorExtensions } from "../editor/createEditorExtensions"
import {
  normalizeAsteriaMathClipboardHtml,
  normalizeInlineDollarMath,
  preprocessPastedMath,
  serializeMathClipboardText,
  shouldUsePlainTextMathPaste,
} from "../editor/mathPasteHandler"
import { applyRecentRichColor } from "../editor/richColorMemory"
import { insertBlockEquationEvent } from "../lib/inlineEditEvents"
import { EquationDialog } from "./EquationDialog"
import { RichTextBubbleMenu } from "./RichTextBubbleMenu"
import { RichTextToolbar } from "./RichTextToolbar"

type RichTextEditorProps = {
  content: JSONContent
  onChange: (content: JSONContent, html: string) => void
  showToolbar?: boolean
  chrome?: boolean
  editorClassName?: string
  focusTargetId?: string
  editorTextColor?: string
  editorAccentColor?: string
  placeholder?: string
}

export function RichTextEditor({
  content,
  onChange,
  showToolbar = true,
  chrome = true,
  editorClassName = "min-h-[220px]",
  focusTargetId,
  editorTextColor,
  editorAccentColor,
  placeholder = "Write a model note, prior, theorem, or paper observation...",
}: RichTextEditorProps) {
  const lastLocalContentRef = useRef<string | undefined>(undefined)
  const isEditingEquationDialogOpenRef = useRef(false)
  const [editingEquation, setEditingEquation] = useState<{ pos: number; latex: string; displayMode: boolean } | null>(null)
  const [isInlineEquationDialogOpen, setIsInlineEquationDialogOpen] = useState(false)
  const editorStyle = [
    "white-space: normal",
    editorTextColor ? `color: ${editorTextColor}` : "",
    editorAccentColor ? `--asteria-rich-accent-color: ${editorAccentColor}` : "",
  ]
    .filter(Boolean)
    .join("; ")
  const editorAttributes = {
    class: `ProseMirror prose-editor outline-none ${editorClassName}`,
    ...(editorStyle ? { style: editorStyle } : {}),
  }
  const editor = useEditor({
    extensions: createEditorExtensions(placeholder),
    content,
    editorProps: {
      attributes: editorAttributes,
      clipboardTextSerializer: serializeMathClipboardText,
      transformPastedHTML: normalizeAsteriaMathClipboardHtml,
      handlePaste(view, event) {
        if (!shouldUsePlainTextMathPaste(event.clipboardData)) return false
        const text = event.clipboardData?.getData("text/plain")
        if (!text) return false
        const nodes = preprocessPastedMath(text)
        if (!nodes) return false
        event.preventDefault()
        if (nodes.length === 1 && nodes[0].type === "paragraph" && view.state.selection.$from.parent.inlineContent) {
          const inlineNodes = (nodes[0].content || []).map((node) => view.state.schema.nodeFromJSON(node))
          view.dispatch(view.state.tr.replaceSelection(new Slice(Fragment.fromArray(inlineNodes), 0, 0)))
          return true
        }
        const parsedNodes = nodes.map((node) => view.state.schema.nodeFromJSON(node))
        const [firstNode, ...restNodes] = parsedNodes
        if (!firstNode) return false
        let transaction = view.state.tr.replaceSelectionWith(firstNode, false)
        let insertPosition = transaction.selection.to
        for (const node of restNodes) {
          transaction = transaction.insert(insertPosition, node)
          insertPosition += node.nodeSize
        }
        view.dispatch(transaction)
        return true
      },
      handleKeyDown(_view, event) {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "h") {
          if (!editor) return false
          event.preventDefault()
          applyRecentRichColor(editor)
          return true
        }
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "e") {
          if (!editor) return false
          event.preventDefault()
          const { from, to } = editor.state.selection
          editor.storage.asteriaSelection = { from, to }
          setIsInlineEquationDialogOpen(true)
          return true
        }
        return false
      },
      handleClickOn(_view, _pos, node, nodePos) {
        if (node.type.name !== "inlineMath" && node.type.name !== "blockMath") return false
        isEditingEquationDialogOpenRef.current = true
        setEditingEquation({
          pos: nodePos,
          latex: String(node.attrs.latex || ""),
          displayMode: node.type.name === "blockMath",
        })
        return true
      },
      handleDoubleClickOn(_view, _pos, node, nodePos) {
        if (node.type.name !== "inlineMath" && node.type.name !== "blockMath") return false
        isEditingEquationDialogOpenRef.current = true
        setEditingEquation({
          pos: nodePos,
          latex: String(node.attrs.latex || ""),
          displayMode: node.type.name === "blockMath",
        })
        return true
      },
    },
    onUpdate: ({ editor: activeEditor }) => {
      const json = activeEditor.getJSON()
      const normalized = normalizeInlineDollarMath(json)
      if (normalized.changed) {
        activeEditor.commands.setContent(normalized.content, false)
        lastLocalContentRef.current = JSON.stringify(normalized.content)
        onChange(normalized.content, activeEditor.getHTML())
        return
      }
      lastLocalContentRef.current = JSON.stringify(json)
      onChange(json, activeEditor.getHTML())
    },
    onSelectionUpdate: ({ editor: activeEditor }) => {
      const { from, to } = activeEditor.state.selection
      if (from !== to) {
        activeEditor.storage.asteriaSelection = { from, to }
      }
    },
  }, [placeholder])

  useEffect(() => {
    if (!editor) return
    const current = JSON.stringify(editor.getJSON())
    const next = JSON.stringify(content)
    if (lastLocalContentRef.current && current === lastLocalContentRef.current && next !== lastLocalContentRef.current) {
      return
    }
    if (current !== next) {
      editor.commands.setContent(content, false)
    }
  }, [content, editor])

  useEffect(() => {
    if (!editor) return
    editor.view.dom.style.color = editorTextColor || ""
    if (editorAccentColor) {
      editor.view.dom.style.setProperty("--asteria-rich-accent-color", editorAccentColor)
    } else {
      editor.view.dom.style.removeProperty("--asteria-rich-accent-color")
    }
  }, [editor, editorAccentColor, editorTextColor])

  useEffect(() => {
    const focusEditor = (event: Event) => {
      const requestedTarget = (event as CustomEvent<{ nodeId?: string }>).detail?.nodeId
      if (requestedTarget && !focusTargetId) return
      if (focusTargetId && requestedTarget !== focusTargetId) return
      editor?.commands.focus("end")
    }
    window.addEventListener("asteria-focus-editor", focusEditor)
    return () => window.removeEventListener("asteria-focus-editor", focusEditor)
  }, [editor, focusTargetId])

  useEffect(() => {
    const openInlineEquation = (event: Event) => {
      const requestedTarget = (event as CustomEvent<{ nodeId?: string }>).detail?.nodeId
      if (requestedTarget && !focusTargetId) return
      if (focusTargetId && requestedTarget !== focusTargetId) return
      editor?.commands.focus()
      if (editor) {
        const { from, to } = editor.state.selection
        editor.storage.asteriaSelection = { from, to }
      }
      setIsInlineEquationDialogOpen(true)
    }
    window.addEventListener("asteria-open-inline-equation", openInlineEquation)
    return () => window.removeEventListener("asteria-open-inline-equation", openInlineEquation)
  }, [editor, focusTargetId])

  useEffect(() => {
    const insertBlockEquation = (event: Event) => {
      const detail = (event as CustomEvent<{ nodeId?: string; latex?: string }>).detail
      if (!detail?.latex) return
      if (detail.nodeId && !focusTargetId) return
      if (focusTargetId && detail.nodeId !== focusTargetId) return
      editor?.chain().focus("end").insertBlockMath(detail.latex).run()
    }
    window.addEventListener(insertBlockEquationEvent, insertBlockEquation)
    return () => window.removeEventListener(insertBlockEquationEvent, insertBlockEquation)
  }, [editor, focusTargetId])

  if (!editor) return <div className="rounded-lg border border-border p-4 text-sm text-secondary">Loading editor...</div>

  const selectionChain = () => {
    const savedSelection = editor.storage.asteriaSelection as { from: number; to: number } | undefined
    const chain = editor.chain().focus()
    return savedSelection ? chain.setTextSelection(savedSelection) : chain
  }

  const insertInlineEquation = (latex: string) => {
    setIsInlineEquationDialogOpen(false)
    selectionChain().insertInlineMath(latex).run()
  }

  const updateEquation = (latex: string) => {
    if (!editingEquation) return
    const target = editingEquation
    isEditingEquationDialogOpenRef.current = false
    setEditingEquation(null)
    editor
      .chain()
      .focus()
      .command(({ tr }) => {
        const node = tr.doc.nodeAt(target.pos)
        if (!node || (node.type.name !== "inlineMath" && node.type.name !== "blockMath")) return false
        tr.setNodeMarkup(target.pos, undefined, { ...node.attrs, latex })
        return true
      })
      .run()
  }

  const contentElement = (
    <>
      <RichTextBubbleMenu editor={editor} onInlineMathRequest={() => setIsInlineEquationDialogOpen(true)} />
      <EditorContent editor={editor} />
    </>
  )

  return (
    <div className="grid gap-3">
      {showToolbar ? <RichTextToolbar editor={editor} /> : null}
      {chrome ? (
        <div className="rounded-xl border border-border bg-panel p-3 transition focus-within:border-accent">{contentElement}</div>
      ) : (
        contentElement
      )}
      <EquationDialog
        open={isInlineEquationDialogOpen}
        title="Inline equation"
        initialLatex=""
        displayMode={false}
        submitOnEnter
        onCancel={() => setIsInlineEquationDialogOpen(false)}
        onConfirm={insertInlineEquation}
      />
      <EquationDialog
        open={Boolean(editingEquation)}
        title="Edit equation"
        initialLatex={editingEquation?.latex}
        displayMode={editingEquation?.displayMode ?? true}
        confirmLabel="Update"
        submitOnEnter={editingEquation?.displayMode === false}
        onCancel={() => {
          isEditingEquationDialogOpenRef.current = false
          setEditingEquation(null)
        }}
        onConfirm={updateEquation}
      />
    </div>
  )
}
