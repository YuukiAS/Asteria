import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react"
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import { blockTypeDefaults } from "../constants/blockDefaults"
import { blockStatusByValue, blockTypeByValue, blockTypeOptions } from "../constants/blockTypes"
import { defaultBlockColors } from "../constants/palette"
import { allVersionsId, commonVariantKey } from "../constants/versioning"
import { getVariantKey, resolveBlockContentHtml, resolveBlockContentJson, resolveBlockTitle } from "../lib/exportImport"
import { requestInlineBlockEdit, requestInlineEditorFocus, type InlineEditTarget } from "../lib/inlineEditEvents"
import { titleToHtml } from "../lib/titleMath"
import type { BlockNode as BlockNodeType } from "../types/map"
import { useMapStore } from "../store/useMapStore"
import { RichTextEditor } from "./RichTextEditor"
import { RichTextPreview } from "./RichTextPreview"

type BlockNodeProps = NodeProps<BlockNodeType> & {
  interactionMode: "move" | "edit"
  inlineEditTarget?: InlineEditTarget
  onInlineEditTargetChange: (target?: InlineEditTarget) => void
}

const legacyDefaultBorderColors = new Set(["#111827", "rgb(17, 24, 39)"])

function getVisualBorderColor(borderColor: string) {
  const normalized = borderColor.trim().toLowerCase()
  if (!normalized || legacyDefaultBorderColors.has(normalized)) return "rgb(var(--color-strong-border))"
  return borderColor
}

function getVisualDividerColor(borderColor: string) {
  const normalized = borderColor.trim().toLowerCase()
  if (!normalized || legacyDefaultBorderColors.has(normalized)) return "rgb(var(--color-border))"
  return borderColor
}

export function BlockNode({ id, data, selected, interactionMode, inlineEditTarget, onInlineEditTargetChange }: BlockNodeProps) {
  const updateBlock = useMapStore((state) => state.updateBlock)
  const updateBlockVariant = useMapStore((state) => state.updateBlockVariant)
  const setBlockActiveVariant = useMapStore((state) => state.setBlockActiveVariant)
  const activeVersionId = useMapStore((state) => state.activeVersionId)
  const modelVersions = useMapStore((state) => state.modelVersions)
  const displayModeOverride = useMapStore((state) => state.displayModeOverride)
  const isEditableSelection = selected && interactionMode === "edit"
  const isEditingTitle = isEditableSelection && inlineEditTarget?.nodeId === id && inlineEditTarget.field === "title"
  const isEditingContent = isEditableSelection && inlineEditTarget?.nodeId === id && inlineEditTarget.field === "content"
  const [isEditingEmoji, setIsEditingEmoji] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const emojiInputRef = useRef<HTMLInputElement>(null)
  const [resizePreview, setResizePreview] = useState<{ width: number; height: number } | null>(null)
  const visualWidth = resizePreview?.width ?? data.width
  const visualHeight = resizePreview?.height ?? data.height
  const previewInteractionClass = interactionMode === "edit" ? "nodrag nopan nowheel" : ""
  const blockType = blockTypeByValue[data.nodeType] || blockTypeByValue.generic
  const blockStatus = data.status ? blockStatusByValue[data.status] : blockStatusByValue.undo
  const emoji = (data.emojis || []).filter(Boolean)[0] || ""
  const effectiveVariantKey = data.activeVariantKey || getVariantKey(activeVersionId)
  const title = resolveBlockTitle(data, effectiveVariantKey)
  const contentJson = resolveBlockContentJson(data, effectiveVariantKey)
  const contentHtml = resolveBlockContentHtml(data, effectiveVariantKey)
  const displayMode = displayModeOverride === "block" ? data.displayMode || "full" : displayModeOverride
  const activeVersion = modelVersions.find((version) => version.id === effectiveVariantKey)
  const variantKeys = Object.keys(data.variants || {}).filter((key) => key !== commonVariantKey)
  const variantBadge =
    effectiveVariantKey === commonVariantKey
      ? "DEFAULT"
      : activeVersion?.shortLabel || activeVersion?.label || "VERSION"
  const titleHtml = useMemo(() => titleToHtml(title), [title])
  const defaultTypeTextColor = blockTypeDefaults[data.nodeType]?.textColor
  const richTextAccentColor = defaultTypeTextColor && defaultTypeTextColor !== defaultBlockColors.text ? defaultTypeTextColor : data.textColor
  const visualBorderColor = getVisualBorderColor(data.borderColor)
  const visualDividerColor = getVisualDividerColor(data.borderColor)

  useEffect(() => {
    if (!isEditableSelection) {
      setIsEditingEmoji(false)
    }
  }, [isEditableSelection])

  useEffect(() => {
    if (!isEditingTitle) return
    titleInputRef.current?.focus()
    titleInputRef.current?.select()
  }, [isEditingTitle])

  useEffect(() => {
    if (isEditingContent) requestInlineEditorFocus(id)
  }, [id, isEditingContent])

  useEffect(() => {
    if (!isEditingEmoji) return
    emojiInputRef.current?.focus()
    emojiInputRef.current?.select()
  }, [isEditingEmoji])

  const updateEmoji = (value: string) => {
    const next = value.trim()
    updateBlock(id, { emojis: next ? [next] : [] })
  }

  return (
    <div
      className={`asteria-block group relative rounded-xl border bg-white transition ${
        selected ? "asteria-block-selected" : ""
      } ${resizePreview ? "asteria-block-resizing" : ""}`}
      onDoubleClick={(event) => {
        const target = event.target as HTMLElement
        if (target.closest("input, select, button, .ProseMirror")) return
        event.stopPropagation()
        requestInlineBlockEdit(id, "content")
      }}
        style={{
        width: visualWidth,
        height: visualHeight,
        "--asteria-block-background": data.backgroundColor,
        "--asteria-block-border-color": visualBorderColor,
        "--asteria-block-divider-color": visualDividerColor,
        "--asteria-node-height": `${visualHeight}px`,
        "--asteria-rich-accent-color": richTextAccentColor,
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
      <div className="asteria-block-header flex h-9 items-center gap-2 border-b px-3">
        {isEditableSelection && isEditingEmoji ? (
          <input
            ref={emojiInputRef}
            className="block-emoji-input nodrag nopan"
            value={emoji}
            maxLength={16}
            onChange={(event) => updateEmoji(event.target.value)}
            onBlur={() => setIsEditingEmoji(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur()
              if (event.key === "Escape") {
                event.stopPropagation()
                setIsEditingEmoji(false)
              }
            }}
            aria-label="Block emoji"
          />
        ) : isEditableSelection ? (
          <button
            type="button"
            className={`block-emoji-button nodrag nopan ${emoji ? "" : "block-emoji-button-empty"}`}
            title={emoji ? "Edit emoji" : "Add emoji"}
            onClick={() => setIsEditingEmoji(true)}
          >
            {emoji || "+"}
          </button>
        ) : emoji ? (
          <span className="block-title-emoji" title={emoji}>
            {emoji}
          </span>
        ) : null}
        {isEditableSelection && isEditingTitle ? (
          <input
            ref={titleInputRef}
            className="block-title-input nodrag nopan"
            value={title}
            onChange={(event) => updateBlockVariant(id, effectiveVariantKey, { title: event.target.value })}
            onBlur={() => onInlineEditTargetChange(undefined)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur()
              if (event.key === "Escape") {
                event.stopPropagation()
                onInlineEditTargetChange(undefined)
              }
            }}
            aria-label="Block title"
          />
        ) : isEditableSelection ? (
          <button
            type="button"
            className="block-title-display nodrag nopan"
            title={title}
            onClick={() => onInlineEditTargetChange({ nodeId: id, field: "title" })}
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
        ) : (
          <div className="block-title-display" title={title} dangerouslySetInnerHTML={{ __html: titleHtml }} />
        )}
        {variantKeys.length > 0 && (
          <span className="variant-dot-row mr-auto" title={`${variantKeys.length} saved content versions. Select the block and use Content version in the inspector to edit them.`}>
            {variantKeys.map((key) => <span key={key} />)}
          </span>
        )}
        <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1">
          {isEditableSelection ? (
            <select
              className="version-select nodrag nopan"
              value={effectiveVariantKey}
              onChange={(event) => setBlockActiveVariant(id, event.target.value)}
              onPointerDown={(event) => event.stopPropagation()}
              aria-label="Block content version"
              title="Block content version"
            >
              <option value={commonVariantKey}>Default</option>
              {modelVersions.map((version) => (
                <option key={version.id} value={version.id}>
                  {version.shortLabel || version.label}
                </option>
              ))}
            </select>
          ) : (
            <span className="version-badge" title={data.activeVariantKey ? "Block-specific content version" : "Version used by the current canvas preview"}>
              {variantBadge}
            </span>
          )}
          {data.showStatus && <span className={`status-marker ${blockStatus.className}`}>{blockStatus.label}</span>}
          {isEditableSelection ? (
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
        className={`asteria-block-preview asteria-block-preview-${displayMode} h-[calc(100%-36px)] overflow-auto px-3 py-2 text-[13px] leading-[1.45] ${previewInteractionClass}`}
      >
        {isEditingContent && displayMode === "full" ? (
          <RichTextEditor
            content={contentJson}
            onChange={(contentJson, contentHtml) => updateBlockVariant(id, effectiveVariantKey, { contentJson, contentHtml })}
            showToolbar={false}
            chrome={false}
            editorClassName="min-h-[calc(var(--asteria-node-height,220px)-60px)] cursor-text"
            editorTextColor={data.textColor}
            editorAccentColor={richTextAccentColor}
            focusTargetId={id}
          />
        ) : displayMode === "title_only" ? null : (
          <RichTextPreview html={contentHtml} color={data.textColor} accentColor={richTextAccentColor} />
        )}
      </div>
    </div>
  )
}
