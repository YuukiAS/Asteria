import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react"
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import { blockTypeDefaults } from "../constants/blockDefaults"
import { blockStatusByValue, blockTypeByValue, blockTypeOptions } from "../constants/blockTypes"
import { blockConnectionHandleIds } from "../constants/handles"
import { blockSizeLimits } from "../constants/layout"
import { defaultVariantKey } from "../constants/versioning"
import { resolveBlockVersionRows, resolveBlockVersionState, versionShortLabel } from "../lib/blockVersionState"
import { resolveBlockContentHtml, resolveBlockContentJson, resolveBlockSymbolEntries, resolveBlockTitle } from "../lib/exportImport"
import { requestInlineBlockEdit, requestInlineEditorFocus, type InlineEditTarget } from "../lib/inlineEditEvents"
import { titleToHtml } from "../lib/titleMath"
import type { InteractionMode } from "../types/interaction"
import type { BlockNode as BlockNodeType } from "../types/map"
import { useMapStore } from "../store/useMapStore"
import { BlockHeaderSelect } from "./BlockHeaderSelect"
import { RichTextEditor } from "./RichTextEditor"
import { RichTextPreview } from "./RichTextPreview"
import { SymbolEntriesEditor, SymbolEntriesPreview } from "./SymbolEntries"
import { VersionStrip } from "./VersionStrip"

type BlockNodeProps = NodeProps<BlockNodeType> & {
  interactionMode: InteractionMode
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
  const [isSearchHighlighted, setIsSearchHighlighted] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const emojiInputRef = useRef<HTMLInputElement>(null)
  const [resizePreview, setResizePreview] = useState<{ width: number; height: number } | null>(null)
  const [hasPreviewOverflow, setHasPreviewOverflow] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const visualWidth = resizePreview?.width ?? data.width
  const visualHeight = resizePreview?.height ?? data.height
  const previewInteractionClass = interactionMode === "edit" ? "nodrag nopan nowheel" : ""
  const blockType = blockTypeByValue[data.nodeType] || blockTypeByValue.generic
  const blockTypePlaceholder = blockTypeDefaults[data.nodeType]?.placeholder
  const blockStatus = data.status ? blockStatusByValue[data.status] : blockStatusByValue.undo
  const emoji = (data.emojis || []).filter(Boolean)[0] || ""
  const versionState = resolveBlockVersionState(data, activeVersionId, modelVersions)
  const versionRows = resolveBlockVersionRows(data, modelVersions)
  const effectiveVariantKey = versionState.renderedVariantKey || defaultVariantKey
  const editingVariantKey = versionState.requestedVariantKey
  const title = resolveBlockTitle(data, effectiveVariantKey)
  const contentJson = resolveBlockContentJson(data, effectiveVariantKey)
  const contentHtml = resolveBlockContentHtml(data, effectiveVariantKey)
  const symbolEntries = resolveBlockSymbolEntries(data, effectiveVariantKey)
  const versionBadgeLabel = versionState.isFixed ? versionState.requestedShortLabel || versionState.requestedLabel : versionState.modeLabel
  const displayMode = displayModeOverride === "block" ? data.displayMode || "full" : displayModeOverride
  const titleHtml = useMemo(() => titleToHtml(title), [title])
  const versionSelectOptions = useMemo(
    () => [
      { value: defaultVariantKey, label: "AUTO", description: "Follow toolbar version" },
      ...modelVersions.map((version, index) => ({
        value: version.id,
        label: versionShortLabel(version, index),
        description: version.label,
      })),
    ],
    [modelVersions],
  )
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
    let timer = 0
    const highlight = (event: Event) => {
      const nodeId = (event as CustomEvent<{ nodeId?: string }>).detail?.nodeId
      if (nodeId !== id) return
      setIsSearchHighlighted(false)
      window.requestAnimationFrame(() => setIsSearchHighlighted(true))
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(() => setIsSearchHighlighted(false), 1900)
    }
    window.addEventListener("asteria-highlight-block", highlight)
    return () => {
      if (timer) window.clearTimeout(timer)
      window.removeEventListener("asteria-highlight-block", highlight)
    }
  }, [id])

  useEffect(() => {
    if (!isEditingEmoji) return
    emojiInputRef.current?.focus()
    emojiInputRef.current?.select()
  }, [isEditingEmoji])

  useEffect(() => {
    const preview = previewRef.current
    if (!preview || displayMode === "title_only") {
      setHasPreviewOverflow(false)
      return
    }
    let frame = 0
    const updateOverflow = () => {
      frame = window.requestAnimationFrame(() => {
        setHasPreviewOverflow(preview.scrollHeight > preview.clientHeight + 2)
      })
    }
    updateOverflow()
    const observer = new ResizeObserver(updateOverflow)
    observer.observe(preview)
    Array.from(preview.children).forEach((child) => observer.observe(child))
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [contentHtml, displayMode, isEditingContent, visualHeight, visualWidth])

  const updateEmoji = (value: string) => {
    const next = value.trim()
    updateBlock(id, { emojis: next ? [next] : [] })
  }

  return (
    <div
      className={`asteria-block group relative rounded-xl border bg-white transition ${
        selected ? "asteria-block-selected" : ""
      } ${resizePreview ? "asteria-block-resizing" : ""} ${isSearchHighlighted ? "asteria-block-search-highlight" : ""}`}
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
        "--asteria-rich-accent-color": data.textColor,
        color: data.textColor,
      } as CSSProperties}
    >
      <NodeResizer
        isVisible={selected && interactionMode === "edit"}
        minWidth={blockSizeLimits.minWidth}
        minHeight={blockSizeLimits.minHeight}
        maxWidth={blockSizeLimits.maxWidth}
        maxHeight={blockSizeLimits.maxHeight}
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
      {blockConnectionHandleIds.map((handle) => {
        const position =
          handle === "top" ? Position.Top : handle === "right" ? Position.Right : handle === "bottom" ? Position.Bottom : Position.Left
        return (
          <div key={handle}>
            <Handle
              id={handle}
              type="target"
              position={position}
              className="asteria-connection-handle !h-2.5 !w-2.5 !border-2 !opacity-70 transition group-hover:!opacity-100"
            />
            <Handle
              id={handle}
              type="source"
              position={position}
              className="asteria-connection-handle !h-2.5 !w-2.5 !border-2 !opacity-70 transition group-hover:!opacity-100"
            />
          </div>
        )
      })}
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
            onChange={(event) => updateBlockVariant(id, editingVariantKey, { title: event.target.value })}
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
            onClick={(event) => {
              event.stopPropagation()
              onInlineEditTargetChange({ nodeId: id, field: "title" })
            }}
            onDoubleClick={(event) => {
              event.stopPropagation()
              onInlineEditTargetChange({ nodeId: id, field: "title" })
            }}
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
        ) : (
          <div className="block-title-display" title={title} dangerouslySetInnerHTML={{ __html: titleHtml }} />
        )}
        <VersionStrip
          activeVersionId={versionState.requestedVariantKey}
          availableVersionIds={versionState.availableVersionIds}
          modelVersions={modelVersions}
          title={versionState.tooltip}
          versionRows={versionRows}
        />
        <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1">
          {isEditableSelection ? (
            <BlockHeaderSelect
              value={data.activeVariantKey || defaultVariantKey}
              options={versionSelectOptions}
              onChange={(value) => setBlockActiveVariant(id, value)}
              ariaLabel="Block content version"
              title="Block content version"
              className="block-header-select-version"
              minMenuWidth={84}
            />
          ) : (
            <span className={`version-badge ${versionState.isFixed ? "version-badge-fixed" : "version-badge-auto"}`} title={versionState.tooltip}>
              {versionBadgeLabel}
            </span>
          )}
          {data.showStatus && <span className={`status-marker ${blockStatus.className}`}>{blockStatus.label}</span>}
          {isEditableSelection ? (
            <BlockHeaderSelect
              value={data.nodeType}
              options={blockTypeOptions}
              title={blockType.description}
              onChange={(value) => updateBlock(id, { nodeType: value })}
              ariaLabel="Block type"
              className="block-header-select-type"
              minMenuWidth={132}
            />
          ) : (
            <span className={`type-badge ${blockType.badgeClass}`}>{blockType.label}</span>
          )}
        </div>
      </div>
      <div
        ref={previewRef}
        className={`asteria-block-preview asteria-block-preview-${displayMode} h-[calc(100%-36px)] overflow-auto px-3 py-2 text-[13px] leading-[1.45] ${previewInteractionClass}`}
        data-has-overflow={hasPreviewOverflow ? "true" : "false"}
      >
        {isEditingContent && data.nodeType === "symbol" ? (
          <SymbolEntriesEditor
            nodeId={id}
            entries={symbolEntries}
            enableEquationShortcut
            onChange={(entries) => updateBlockVariant(id, editingVariantKey, { symbolEntries: entries })}
          />
        ) : isEditingContent ? (
          <RichTextEditor
            content={contentJson}
            onChange={(contentJson, contentHtml) => updateBlockVariant(id, editingVariantKey, { contentJson, contentHtml })}
            showToolbar={false}
            chrome={false}
            editorClassName="min-h-[calc(var(--asteria-node-height,220px)-60px)] cursor-text"
            editorTextColor={data.textColor}
            editorAccentColor={data.textColor}
            placeholder={blockTypePlaceholder}
            focusTargetId={id}
          />
        ) : displayMode === "title_only" ? null : data.nodeType === "symbol" ? (
          <SymbolEntriesPreview entries={symbolEntries} />
        ) : (
          <RichTextPreview html={contentHtml} color={data.textColor} accentColor={data.textColor} />
        )}
      </div>
    </div>
  )
}
