import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react"
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import { blockStatusByValue, blockTypeByValue, blockTypeOptions } from "../constants/blockTypes"
import { titleToHtml } from "../lib/titleMath"
import type { BlockNode as BlockNodeType } from "../types/map"
import { useMapStore } from "../store/useMapStore"
import { RichTextEditor } from "./RichTextEditor"
import { RichTextPreview } from "./RichTextPreview"

type BlockNodeProps = NodeProps<BlockNodeType> & {
  interactionMode: "move" | "edit"
}

export function BlockNode({ id, data, selected, interactionMode }: BlockNodeProps) {
  const updateBlock = useMapStore((state) => state.updateBlock)
  const isInlineEditing = selected && interactionMode === "edit"
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const [resizePreview, setResizePreview] = useState<{ width: number; height: number } | null>(null)
  const visualWidth = resizePreview?.width ?? data.width
  const visualHeight = resizePreview?.height ?? data.height
  const previewInteractionClass = interactionMode === "edit" ? "nodrag nopan nowheel" : ""
  const blockType = blockTypeByValue[data.nodeType] || blockTypeByValue.generic
  const blockStatus = data.status ? blockStatusByValue[data.status] : blockStatusByValue.undo
  const emojis = (data.emojis || []).filter(Boolean).slice(0, 2)
  const titleHtml = useMemo(() => titleToHtml(data.title), [data.title])

  useEffect(() => {
    if (!isInlineEditing) setIsEditingTitle(false)
  }, [isInlineEditing])

  useEffect(() => {
    if (!isEditingTitle) return
    titleInputRef.current?.focus()
    titleInputRef.current?.select()
  }, [isEditingTitle])

  return (
    <div
      className={`asteria-block group relative rounded-xl border bg-white shadow-block transition ${
        selected ? "ring-2 ring-accent ring-offset-2 ring-offset-canvas" : ""
      } ${resizePreview ? "asteria-block-resizing" : ""}`}
        style={{
        width: visualWidth,
        height: visualHeight,
        "--asteria-node-height": `${visualHeight}px`,
        backgroundColor: data.backgroundColor,
        borderColor: selected ? "#2563eb" : data.borderColor,
        color: data.textColor,
      } as CSSProperties}
    >
      <NodeResizer
        isVisible={selected && interactionMode === "edit"}
        minWidth={220}
        minHeight={160}
        maxWidth={860}
        maxHeight={720}
        handleClassName="asteria-resize-handle"
        lineClassName="asteria-resize-line"
        onResizeStart={() => setResizePreview({ width: data.width, height: data.height })}
        onResize={(_, params) => setResizePreview({ width: Math.round(params.width), height: Math.round(params.height) })}
        onResizeEnd={(_, params) => {
          updateBlock(id, {
            width: Math.round(params.width),
            height: Math.round(params.height),
          })
          window.setTimeout(() => setResizePreview(null), 650)
        }}
      />
      {(resizePreview || selected) && (
        <div className="asteria-size-readout nodrag nopan">
          {resizePreview ? resizePreview.width : Math.round(data.width)} x {resizePreview ? resizePreview.height : Math.round(data.height)}
        </div>
      )}
      {(["top", "right", "bottom", "left"] as const).map((handle) => (
        <Handle
          key={handle}
          id={handle}
          type="source"
          position={
            handle === "top"
              ? Position.Top
              : handle === "right"
                ? Position.Right
                : handle === "bottom"
                  ? Position.Bottom
                  : Position.Left
          }
          className="!h-2.5 !w-2.5 !border-2 !border-white !bg-accent !opacity-45 transition group-hover:!opacity-100"
        />
      ))}
      {(["top", "right", "bottom", "left"] as const).map((handle) => (
        <Handle
          key={`${handle}-target`}
          id={`${handle}-target`}
          type="target"
          position={
            handle === "top"
              ? Position.Top
              : handle === "right"
                ? Position.Right
                : handle === "bottom"
                  ? Position.Bottom
                  : Position.Left
          }
          className="!h-2.5 !w-2.5 !border-2 !border-white !bg-accent !opacity-0"
        />
      ))}
      <div className="flex h-9 items-center gap-2 border-b px-3" style={{ borderColor: data.borderColor }}>
        <span className="h-2 w-2 shrink-0 rounded-full bg-accent/75" />
        {isInlineEditing && isEditingTitle ? (
          <input
            ref={titleInputRef}
            className="block-title-input nodrag nopan"
            value={data.title}
            onChange={(event) => updateBlock(id, { title: event.target.value })}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur()
              if (event.key === "Escape") setIsEditingTitle(false)
            }}
            aria-label="Block title"
          />
        ) : isInlineEditing ? (
          <button
            type="button"
            className="block-title-display nodrag nopan"
            title={data.title}
            onClick={() => setIsEditingTitle(true)}
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
        ) : (
          <div className="block-title-display" title={data.title} dangerouslySetInnerHTML={{ __html: titleHtml }} />
        )}
        <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1">
          {emojis.map((emoji, index) => (
            <span key={`${emoji}-${index}`} className="emoji-marker" title={emoji}>
              {emoji}
            </span>
          ))}
          {data.showStatus && <span className={`status-marker ${blockStatus.className}`}>{blockStatus.label}</span>}
          {isInlineEditing ? (
            <select
              className={`type-select nodrag nopan ${blockType.badgeClass}`}
              value={data.nodeType}
              onChange={(event) => updateBlock(id, { nodeType: event.target.value as typeof data.nodeType })}
              onPointerDown={(event) => event.stopPropagation()}
              aria-label="Block type"
            >
              {blockTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <span className={`type-badge ${blockType.badgeClass}`}>{blockType.label}</span>
          )}
        </div>
      </div>
      <div
        className={`asteria-block-preview h-[calc(100%-36px)] overflow-auto px-3 py-2 text-[13px] leading-[1.45] ${previewInteractionClass}`}
      >
        {isInlineEditing ? (
          <RichTextEditor
            content={data.contentJson}
            onChange={(contentJson, contentHtml) => updateBlock(id, { contentJson, contentHtml })}
            showToolbar={false}
            chrome={false}
            editorClassName="min-h-[calc(var(--asteria-node-height,220px)-60px)] cursor-text"
            focusTargetId={id}
          />
        ) : (
          <RichTextPreview html={data.contentHtml} color={data.textColor} />
        )}
      </div>
    </div>
  )
}
