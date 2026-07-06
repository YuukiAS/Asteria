import { EditorContent, type JSONContent, useEditor } from "@tiptap/react"
import { useEffect, useRef, useState } from "react"
import { createEditorExtensions } from "../editor/createEditorExtensions"
import { normalizeInlineDollarMath, preprocessPastedMath } from "../editor/mathPasteHandler"
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
}

export function RichTextEditor({
  content,
  onChange,
  showToolbar = true,
  chrome = true,
  editorClassName = "min-h-[220px]",
  focusTargetId,
  editorTextColor,
}: RichTextEditorProps) {
  const lastLocalContentRef = useRef<string | undefined>(undefined)
  const [editingEquation, setEditingEquation] = useState<{ pos: number; latex: string; displayMode: boolean } | null>(null)
  const editorAttributes = {
    class: `ProseMirror prose-editor outline-none ${editorClassName}`,
    ...(editorTextColor ? { style: `color: ${editorTextColor}` } : {}),
  }
  const editor = useEditor({
    extensions: createEditorExtensions(),
    content,
    editorProps: {
      attributes: editorAttributes,
      handlePaste(view, event) {
        const text = event.clipboardData?.getData("text/plain")
        if (!text) return false
        const nodes = preprocessPastedMath(text)
        if (!nodes) return false
        event.preventDefault()
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
      handleDoubleClickOn(_view, _pos, node, nodePos) {
        if (node.type.name !== "inlineMath" && node.type.name !== "blockMath") return false
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
  })

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
  }, [editor, editorTextColor])

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

  if (!editor) return <div className="rounded-lg border border-border p-4 text-sm text-secondary">Loading editor...</div>

  const updateEquation = (latex: string) => {
    if (!editingEquation) return
    const target = editingEquation
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
      <RichTextBubbleMenu editor={editor} />
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
        open={Boolean(editingEquation)}
        title="Edit equation"
        initialLatex={editingEquation?.latex}
        displayMode={editingEquation?.displayMode ?? true}
        onCancel={() => setEditingEquation(null)}
        onConfirm={updateEquation}
      />
    </div>
  )
}
