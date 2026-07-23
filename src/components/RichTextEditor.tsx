import { EditorContent, type JSONContent, useEditor } from "@tiptap/react"
import type { Editor } from "@tiptap/core"
import { Fragment, Slice, type ResolvedPos } from "prosemirror-model"
import { useEffect, useRef, useState, type FocusEvent, type PointerEvent } from "react"
import { createEditorExtensions } from "../editor/createEditorExtensions"
import { exitEmptyListItemToParagraph, exitNestedListItemToParentParagraph, selectionIsInsideListItem } from "../editor/listContinuationExtension"
import {
  normalizeAsteriaMathClipboardHtml,
  normalizeInlineDollarMath,
  preprocessPastedAsteriaMathHtml,
  preprocessPastedMath,
  serializeMathClipboardText,
  shouldUsePlainTextMathPaste,
  writeStyledMathClipboardFromSelection,
} from "../editor/mathPasteHandler"
import { applyRecentRichColor } from "../editor/richColorMemory"
import { imageLinkLabelFromUrl, normalizeImageLinkSize, normalizeImageLinkUrl, type ImageLinkReference } from "../lib/imageLinks"
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

function listItemDepthInsideListType($from: ResolvedPos, listType: string) {
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type.name === "listItem" && $from.node(depth - 1).type.name === listType) return depth
  }
  return null
}

function isEmptyListItem($from: ResolvedPos, depth: number) {
  const listItem = $from.node(depth)
  if (listItem.childCount !== 1) return false
  const paragraph = listItem.child(0)
  return paragraph.type.name === "paragraph" && paragraph.content.size === 0
}

type SavedSelection = { from: number; to: number }

type HoverPreviewState = ImageLinkReference & {
  left: number
  top: number
}

function usableSavedSelection(editor: Editor): SavedSelection | undefined {
  const savedSelection = editor.storage.asteriaSelection as SavedSelection | undefined
  if (!savedSelection) return undefined
  if (savedSelection.from < 0 || savedSelection.to < savedSelection.from || savedSelection.to > editor.state.doc.content.size) return undefined
  try {
    const $from = editor.state.doc.resolve(savedSelection.from)
    const $to = editor.state.doc.resolve(savedSelection.to)
    if (!$from.parent.inlineContent || !$to.parent.inlineContent) return undefined
    return savedSelection
  } catch {
    return undefined
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max))
}

function imageLinkFromAnchor(anchor: HTMLAnchorElement): ImageLinkReference | undefined {
  if (anchor.dataset.asteriaImageLink !== "true") return undefined
  const href = normalizeImageLinkUrl(anchor.href || anchor.getAttribute("href") || "")
  if (!href) return undefined
  return {
    href,
    label: anchor.textContent?.trim() || imageLinkLabelFromUrl(href),
    size: normalizeImageLinkSize(anchor.dataset.asteriaImageSize),
  }
}

function hoverStateForAnchor(anchor: HTMLAnchorElement, link: ImageLinkReference): HoverPreviewState {
  const rect = anchor.getBoundingClientRect()
  const previewWidth = Math.min(320, window.innerWidth - 24)
  const previewHeight = 250
  const belowTop = rect.bottom + 8
  const aboveTop = rect.top - previewHeight - 8
  return {
    ...link,
    left: clamp(rect.left, 12, window.innerWidth - previewWidth - 12),
    top: belowTop + previewHeight <= window.innerHeight - 12 ? belowTop : clamp(aboveTop, 12, window.innerHeight - previewHeight - 12),
  }
}

function EditorImageLinkPreview({ link }: { link: ImageLinkReference }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <span className="rich-image-link-error">Image unavailable</span>
  return <img src={link.href} alt={link.label} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
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
  const [hoverPreview, setHoverPreview] = useState<HoverPreviewState>()
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
      handleDOMEvents: {
        copy(view, event) {
          return writeStyledMathClipboardFromSelection(event, serializeMathClipboardText(view.state.selection.content()))
        },
        cut(view, event) {
          return writeStyledMathClipboardFromSelection(event, serializeMathClipboardText(view.state.selection.content()))
        },
      },
      handlePaste(view, event) {
        const html = event.clipboardData?.getData("text/html")
        const htmlNodes = html ? preprocessPastedAsteriaMathHtml(html) : null
        if (htmlNodes) {
          event.preventDefault()
          const parsedNodes = htmlNodes.map((node) => view.state.schema.nodeFromJSON(node))
          const [singleNode] = htmlNodes
          if (
            view.state.selection.empty &&
            htmlNodes.length === 1 &&
            (singleNode.type === "orderedList" || singleNode.type === "bulletList")
          ) {
            const listItemDepth = listItemDepthInsideListType(view.state.selection.$from, singleNode.type)
            if (listItemDepth !== null) {
              const insertFrom = isEmptyListItem(view.state.selection.$from, listItemDepth)
                ? view.state.selection.$from.before(listItemDepth)
                : view.state.selection.$from.after(listItemDepth)
              const insertTo = isEmptyListItem(view.state.selection.$from, listItemDepth)
                ? view.state.selection.$from.after(listItemDepth)
                : insertFrom
              view.dispatch(view.state.tr.replaceWith(insertFrom, insertTo, parsedNodes[0].content))
              return true
            }
          }
          const sliceDepth = 0
          view.dispatch(view.state.tr.replaceSelection(new Slice(Fragment.fromArray(parsedNodes), sliceDepth, sliceDepth)))
          return true
        }
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
        if (event.shiftKey && event.key === "Tab") {
          const handled =
            exitNestedListItemToParentParagraph(_view.state, _view.dispatch) ||
            exitEmptyListItemToParagraph(_view.state, _view.dispatch) ||
            selectionIsInsideListItem(_view.state)
          if (handled) {
            event.preventDefault()
            return true
          }
        }
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
      if (activeEditor.state.selection.$from.parent.inlineContent && activeEditor.state.selection.$to.parent.inlineContent) {
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
      const savedSelection = editor ? usableSavedSelection(editor) : undefined
      if (savedSelection) {
        editor?.chain().focus().setTextSelection(savedSelection).run()
      } else {
        editor?.commands.focus("end")
      }
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
      selectionChain().insertBlockMath(detail.latex).run()
    }
    window.addEventListener(insertBlockEquationEvent, insertBlockEquation)
    return () => window.removeEventListener(insertBlockEquationEvent, insertBlockEquation)
  }, [editor, focusTargetId])

  if (!editor) return <div className="rounded-lg border border-border p-4 text-sm text-secondary">Loading editor...</div>

  const selectionChain = () => {
    const savedSelection = usableSavedSelection(editor)
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

  const showHoverPreview = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return
    const anchor = target.closest<HTMLAnchorElement>('a[data-asteria-image-link="true"]')
    if (!anchor) return
    const link = imageLinkFromAnchor(anchor)
    if (!link) return
    setHoverPreview(hoverStateForAnchor(anchor, link))
  }

  const handlePointerOver = (event: PointerEvent<HTMLDivElement>) => showHoverPreview(event.target)
  const handlePointerLeave = () => setHoverPreview(undefined)
  const handleFocus = (event: FocusEvent<HTMLDivElement>) => showHoverPreview(event.target)
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setHoverPreview(undefined)
  }

  const contentElement = (
    <div
      onPointerOverCapture={handlePointerOver}
      onPointerLeave={handlePointerLeave}
      onFocusCapture={handleFocus}
      onBlur={handleBlur}
      onClickCapture={(event) => showHoverPreview(event.target)}
    >
      <RichTextBubbleMenu editor={editor} onInlineMathRequest={() => setIsInlineEquationDialogOpen(true)} />
      <EditorContent editor={editor} />
      {hoverPreview ? (
        <div className="rich-image-link-popover" style={{ left: hoverPreview.left, top: hoverPreview.top }} role="tooltip">
          <EditorImageLinkPreview link={hoverPreview} />
          <div className="rich-image-link-caption">{hoverPreview.label}</div>
        </div>
      ) : null}
    </div>
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
