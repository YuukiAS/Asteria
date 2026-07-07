import { Clipboard, Copy, Layers, Plus, RotateCcw } from "lucide-react"
import { blockTypeDefaults } from "../constants/blockDefaults"
import { blockStatusOptions, blockTypeByValue, blockTypeOptions } from "../constants/blockTypes"
import { blockFitExtraPadding, blockHeaderHeight, blockPreviewHorizontalPadding, blockPreviewVerticalPadding, blockSizeLimits } from "../constants/layout"
import { blockDisplayModeOptions, defaultVariantKey } from "../constants/versioning"
import { backgroundPalette, textPalette } from "../constants/palette"
import { ColorPickerRow } from "./ColorPickerRow"
import { EdgeInspector } from "./EdgeInspector"
import { InspectorSectionStack } from "./InspectorSectionStack"
import { RichTextEditor } from "./RichTextEditor"
import { formatLocalDateTime } from "../lib/time"
import { requestInlineBlockEdit } from "../lib/inlineEditEvents"
import { resolveBlockVersionRows, resolveBlockVersionState, versionShortLabel } from "../lib/blockVersionState"
import { resolveBlockContentHtml, resolveBlockContentJson, resolveBlockTitle } from "../lib/exportImport"
import { stripScriptTags } from "../lib/sanitize"
import { useMapStore } from "../store/useMapStore"
import type { BlockData } from "../types/map"

const emojiPresets = ["*", "!", "?", "+", "#", "%", "&", "@", "~", "^", "=", "/"]

function clampBlockHeight(value: number) {
  return Math.min(Math.max(Math.ceil(value), blockSizeLimits.minHeight), blockSizeLimits.maxHeight)
}

function measureBlockContentHeight(html: string | undefined, width: number) {
  if (typeof document === "undefined") return undefined
  const measure = document.createElement("div")
  measure.className = "rich-preview"
  measure.style.position = "fixed"
  measure.style.left = "-10000px"
  measure.style.top = "0"
  measure.style.visibility = "hidden"
  measure.style.pointerEvents = "none"
  measure.style.width = `${Math.max(blockSizeLimits.minWidth - blockPreviewHorizontalPadding, width - blockPreviewHorizontalPadding)}px`
  measure.style.fontSize = "13px"
  measure.style.lineHeight = "1.45"
  measure.innerHTML = stripScriptTags(html || "<p>Empty block</p>")
  document.body.appendChild(measure)
  const measured = measure.scrollHeight
  measure.remove()
  if (!Number.isFinite(measured) || measured <= 0) return undefined
  return clampBlockHeight(blockHeaderHeight + blockPreviewVerticalPadding + measured + blockFitExtraPadding)
}

function variantKeysForFit(data: BlockData, modelVersionIds: string[], activeVariantKey: string) {
  return Array.from(new Set([defaultVariantKey, activeVariantKey, ...modelVersionIds, ...Object.keys(data.variants || {})]))
}

export function InspectorPanel() {
  const {
    nodes,
    edges,
    modelVersions,
    activeVersionId,
    displayModeOverride,
    selectedNodeId,
    selectedNodeIds,
    selectedEdgeId,
    saveStatus,
    lastSavedAt,
    addBlockAndSelect,
    updateBlock,
    applyBlockTypeStyle,
    updateGroup,
    updateEdge,
    deleteEdge,
    duplicateBlock,
    copyBlock,
    pasteBlock,
    blockClipboard,
    copyBlockStyle,
    pasteBlockStyle,
    blockStyleClipboard,
    groupSelectedBlocks,
    attachSelectedBlocksToFrame,
    detachSelectedBlocksFromFrame,
    alignSelectedBlocks,
    distributeSelectedBlocks,
    snapSelectedBlocksToGrid,
    snapAllBlocksToGrid,
    copyBlockVariantToVersion,
    deleteBlockVariant,
    setBlockActiveVariant,
    updateBlockVariant,
  } = useMapStore()
  const node = nodes.find((item) => item.id === selectedNodeId)
  const edge = edges.find((item) => item.id === selectedEdgeId)

  const createBlock = () => {
    const nodeId = addBlockAndSelect()
    requestInlineBlockEdit(nodeId, "title")
  }

  if (selectedNodeIds.length > 1) {
    return (
      <aside className="inspector">
        <div className="inspector-heading">
          <div>
            <h2>Selection</h2>
            <p>{selectedNodeIds.length} objects selected.</p>
          </div>
        </div>
        <InspectorSectionStack
          storageKey="asteria-inspector-selection-layout"
          sections={[
            {
              id: "actions",
              title: "Actions",
              children: (
                <>
                  <button type="button" className="toolbar-button justify-center" onClick={groupSelectedBlocks}>
                    <Layers size={14} />
                    Group selected blocks
                  </button>
                  <button type="button" className="toolbar-button justify-center" onClick={attachSelectedBlocksToFrame}>
                    Attach to frame
                  </button>
                  <button type="button" className="toolbar-button justify-center" onClick={detachSelectedBlocksFromFrame}>
                    Detach from frame
                  </button>
                </>
              ),
            },
            {
              id: "layout",
              title: "Layout",
              children: (
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" className="toolbar-button justify-center" onClick={() => alignSelectedBlocks("left")}>Align left</button>
                  <button type="button" className="toolbar-button justify-center" onClick={() => alignSelectedBlocks("right")}>Align right</button>
                  <button type="button" className="toolbar-button justify-center" onClick={() => alignSelectedBlocks("top")}>Align top</button>
                  <button type="button" className="toolbar-button justify-center" onClick={() => alignSelectedBlocks("bottom")}>Align bottom</button>
                  <button type="button" className="toolbar-button justify-center" onClick={() => alignSelectedBlocks("horizontal_center")}>Center X</button>
                  <button type="button" className="toolbar-button justify-center" onClick={() => alignSelectedBlocks("vertical_center")}>Center Y</button>
                  <button type="button" className="toolbar-button justify-center" onClick={() => distributeSelectedBlocks("horizontal")}>Distribute H</button>
                  <button type="button" className="toolbar-button justify-center" onClick={() => distributeSelectedBlocks("vertical")}>Distribute V</button>
                  <button type="button" className="toolbar-button justify-center" onClick={snapSelectedBlocksToGrid}>Snap selected</button>
                  <button type="button" className="toolbar-button justify-center" onClick={snapAllBlocksToGrid}>Snap all</button>
                </div>
              ),
            },
          ]}
        />
      </aside>
    )
  }

  if (edge) {
    return (
      <aside className="inspector">
        <div className="inspector-heading">
          <div>
            <h2>Edge</h2>
            <p>Edit relationship metadata.</p>
          </div>
        </div>
        <EdgeInspector edge={edge} onChange={(patch) => updateEdge(edge.id, patch)} onDelete={() => deleteEdge(edge.id)} />
      </aside>
    )
  }

  if (node?.type === "group") {
    return (
      <aside className="inspector">
        <div className="inspector-heading">
          <div>
            <h2>Group</h2>
            <p>Frame for grouped blocks.</p>
          </div>
        </div>
        <InspectorSectionStack
          storageKey="asteria-inspector-group-layout"
          sections={[
            {
              id: "object",
              title: "Object",
              children: (
                <label className="field-label">
                  Title
                  <input className="field-input" value={node.data.title} onChange={(event) => updateGroup(node.id, { title: event.target.value })} />
                </label>
              ),
            },
            {
              id: "appearance",
              title: "Appearance",
              children: (
                <>
                  <ColorPickerRow
                    label="Background"
                    value={node.data.backgroundColor}
                    palette={backgroundPalette}
                    onChange={(backgroundColor) => updateGroup(node.id, { backgroundColor })}
                  />
                  <label className="field-label">
                    Opacity
                    <input
                      className="field-input"
                      type="range"
                      min={0.04}
                      max={0.8}
                      step={0.02}
                      value={node.data.opacity ?? 0.22}
                      onChange={(event) => updateGroup(node.id, { opacity: Number(event.target.value) })}
                    />
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-secondary">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border text-accent"
                      checked={Boolean(node.data.locked)}
                      onChange={(event) => updateGroup(node.id, { locked: event.target.checked })}
                    />
                    Lock frame movement
                  </label>
                </>
              ),
            },
            {
              id: "metadata",
              title: "Metadata",
              defaultCollapsed: true,
              children: (
                <div className="grid gap-1 text-xs text-secondary">
                  <div>Created: {formatLocalDateTime(node.data.createdAt)}</div>
                  <div>Updated: {formatLocalDateTime(node.data.updatedAt)}</div>
                </div>
              ),
            },
          ]}
        />
      </aside>
    )
  }

  if (node?.type === "block") {
    const blockType = blockTypeByValue[node.data.nodeType] || blockTypeByValue.generic
    const blockTypePlaceholder = blockTypeDefaults[node.data.nodeType]?.placeholder
    const emojis = node.data.emojis || []
    const versionState = resolveBlockVersionState(node.data, activeVersionId, modelVersions)
    const activeVariantKey = versionState.requestedVariantKey
    const renderedVariantKey = versionState.renderedVariantKey || defaultVariantKey
    const activeTitle = resolveBlockTitle(node.data, renderedVariantKey)
    const activeContentJson = resolveBlockContentJson(node.data, renderedVariantKey)
    const variantLabel = `${versionState.renderedLabel} via ${versionState.modeLabel}`
    const variantRows = resolveBlockVersionRows(node.data, modelVersions)
    const setEditingVariant = (variantKey: string) => {
      setBlockActiveVariant(node.id, variantKey)
    }
    const updateEmoji = (value: string) => {
      const emoji = value.trim()
      updateBlock(node.id, { emojis: emoji ? [emoji] : [] })
    }
    const fitCurrentContent = () => {
      const height = measureBlockContentHeight(resolveBlockContentHtml(node.data, renderedVariantKey), node.data.width)
      if (!height) {
        console.warn(`Failed to measure current content for block ${node.id}; using maximum fit height.`)
        updateBlock(node.id, { height: blockSizeLimits.maxHeight })
        return
      }
      updateBlock(node.id, { height })
    }
    const fitLargestVariant = () => {
      const modelVersionIds = modelVersions.map((version) => version.id)
      const heights = variantKeysForFit(node.data, modelVersionIds, activeVariantKey)
        .map((key) => measureBlockContentHeight(resolveBlockContentHtml(node.data, key), node.data.width))
        .filter((height): height is number => Number.isFinite(height))
      if (!heights.length) {
        console.warn(`Failed to measure variant content for block ${node.id}; using maximum fit height.`)
        updateBlock(node.id, { height: blockSizeLimits.maxHeight })
        return
      }
      updateBlock(node.id, { height: Math.max(...heights) })
    }

    return (
      <aside className="inspector">
        <div className="inspector-heading">
          <div>
            <h2>Block</h2>
            <p>{blockType.label} research block</p>
          </div>
          <span className={`type-badge ${blockType.badgeClass}`}>{blockType.label}</span>
        </div>
        <InspectorSectionStack
          storageKey="asteria-inspector-block-layout"
          sections={[
            {
              id: "object",
              title: "Object",
              summary: variantLabel,
              children: (
                <>
                  <label className="field-label">
              Title
              <input
                className="field-input"
                value={activeTitle}
                onChange={(event) => updateBlockVariant(node.id, activeVariantKey, { title: event.target.value })}
              />
            </label>
                  <label className="field-label">
              Type
              <select
                className="field-input"
                value={node.data.nodeType}
                title={blockType.description}
                onChange={(event) => updateBlock(node.id, { nodeType: event.target.value as typeof node.data.nodeType })}
              >
                {blockTypeOptions.map((option) => (
                  <option key={option.value} value={option.value} title={option.description}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="field-help" title={blockType.description}>{blockType.description}</span>
            </label>
                  <label className="field-label">
              Content version
              <select
                className="field-input"
                value={node.data.activeVariantKey || defaultVariantKey}
                onChange={(event) => setEditingVariant(event.target.value)}
                title="Choose AUTO to follow the toolbar version, or pin this block to a specific version."
              >
                <option value={defaultVariantKey}>AUTO: follow global version</option>
                {modelVersions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.label} ({versionShortLabel(version, modelVersions.findIndex((item) => item.id === version.id))})
                  </option>
                ))}
              </select>
            </label>
                  <label className="field-label">
              Display
              <select
                className="field-input"
                value={node.data.displayMode || "full"}
                onChange={(event) => updateBlock(node.id, { displayMode: event.target.value as typeof node.data.displayMode })}
              >
                {blockDisplayModeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" className="toolbar-button justify-center" onClick={fitCurrentContent} title="Resize this block height to fit the currently selected content version.">
                      Fit current content
                    </button>
                    <button type="button" className="toolbar-button justify-center" onClick={fitLargestVariant} title="Resize this block height to fit the tallest saved content version at the current width.">
                      Fit largest variant
                    </button>
                  </div>
                  <div className="rounded-lg border border-border bg-app/60 p-2 text-xs text-secondary">
              Editing content: <span className="font-semibold text-foreground">{variantLabel}</span>
              {versionState.sourceKind === "inherited" ? ` (typing here creates ${versionState.requestedShortLabel || versionState.requestedLabel} own content)` : ""}
              {versionState.sourceKind === "hidden" ? ` (typing here creates ${versionState.requestedShortLabel || versionState.requestedLabel} own content)` : ""}
              <br />
              AUTO follows the top toolbar. Selecting a version pins this block and ignores global switching.
              {displayModeOverride !== "block" ? ` Toolbar density override: ${displayModeOverride}.` : ""}
            </div>
                </>
              ),
            },
            {
              id: "variants",
              title: "Variants",
              defaultCollapsed: true,
              children: (
                <div className="grid gap-2">
              {modelVersions.length > 0 && (
                <div className="text-xs text-secondary">
                  Versions inherit from the nearest earlier version with own content. Editing inherited content creates an own copy for the requested version.
                </div>
              )}
              {modelVersions.length === 0 && <div className="text-xs text-secondary">Add versions from the top toolbar to create version-specific block content.</div>}
              {variantRows.map((row) => {
                const hasVariant = row.sourceKind === "own"
                return (
                  <div key={row.version.id} className="grid gap-2 rounded-lg border border-border bg-app/45 p-2" title={row.tooltip}>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                      <span className="min-w-0 truncate text-xs font-semibold text-foreground">
                        {row.versionLabel} ({row.versionShortLabel})
                      </span>
                      <span className={`min-w-0 truncate text-xs ${row.sourceKind === "hidden" ? "text-muted" : "text-secondary"}`}>
                        {row.statusLabel}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" className="toolbar-button justify-center" onClick={() => copyBlockVariantToVersion(node.id, row.version.id)}>
                        Use current
                      </button>
                      <button
                        type="button"
                        className="danger-button justify-center disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!hasVariant}
                        onClick={() => deleteBlockVariant(node.id, row.version.id)}
                      >
                        Delete own
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
              ),
            },
            {
              id: "markers",
              title: "Markers",
              defaultCollapsed: true,
              children: (
                <>
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-secondary">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-accent"
                checked={Boolean(node.data.showStatus)}
                onChange={(event) => updateBlock(node.id, { showStatus: event.target.checked, status: node.data.status || "undo" })}
              />
              Show status
            </label>
            {node.data.showStatus && (
              <label className="field-label">
                Status
                <select
                  className="field-input"
                  value={node.data.status || "undo"}
                  onChange={(event) => updateBlock(node.id, { status: event.target.value as typeof node.data.status })}
                >
                  {blockStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="grid gap-3">
              <label className="field-label">
                Emoji
                <input className="field-input" value={emojis[0] || ""} maxLength={16} onChange={(event) => updateEmoji(event.target.value)} />
                <div className="emoji-preset-grid" aria-label="Emoji presets">
                  {emojiPresets.map((emoji) => (
                    <button key={`emoji-${emoji}`} type="button" className="emoji-preset-button" onClick={() => updateEmoji(emoji)}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </label>
            </div>
                </>
              ),
            },
            {
              id: "appearance",
              title: "Appearance",
              children: (
                <>
                  <button type="button" className="toolbar-button justify-center" onClick={() => applyBlockTypeStyle(node.id)}>
              <RotateCcw size={14} />
              Apply {blockType.label} type style
            </button>
            <ColorPickerRow
              label="Background"
              value={node.data.backgroundColor}
              palette={backgroundPalette}
              onChange={(backgroundColor) => updateBlock(node.id, { backgroundColor })}
            />
            <ColorPickerRow
              label="Text"
              value={node.data.textColor}
              palette={textPalette}
              onChange={(textColor) => updateBlock(node.id, { textColor })}
            />
            <div className="grid grid-cols-2 gap-3">
              <label className="field-label">
                Width
                <input
                  className="field-input"
                  type="number"
                  min={220}
                  max={860}
                  value={node.data.width}
                  onChange={(event) => updateBlock(node.id, { width: Number(event.target.value) })}
                />
              </label>
              <label className="field-label">
                Height
                <input
                  className="field-input"
                  type="number"
                  min={160}
                  max={720}
                  value={node.data.height}
                  onChange={(event) => updateBlock(node.id, { height: Number(event.target.value) })}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className="toolbar-button justify-center" onClick={() => duplicateBlock(node.id)}>
                <Layers size={14} />
                Duplicate
              </button>
              <button type="button" className="toolbar-button justify-center" onClick={() => copyBlock(node.id)}>
                <Copy size={14} />
                Copy block
              </button>
              <button
                type="button"
                className="toolbar-button col-span-2 justify-center disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!blockClipboard}
                onClick={() => pasteBlock()}
              >
                <Clipboard size={14} />
                Paste block
              </button>
              <button type="button" className="toolbar-button justify-center" onClick={() => copyBlockStyle(node.id)}>
                <Copy size={14} />
                Copy style
              </button>
              <button
                type="button"
                className="toolbar-button justify-center disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!blockStyleClipboard}
                onClick={() => pasteBlockStyle(node.id)}
              >
                <Clipboard size={14} />
                Paste style
              </button>
            </div>
                </>
              ),
            },
            {
              id: "content",
              title: "Content",
              children: (
                <RichTextEditor
                  content={activeContentJson}
                  onChange={(contentJson, contentHtml) => updateBlockVariant(node.id, activeVariantKey, { contentJson, contentHtml })}
                  placeholder={blockTypePlaceholder}
                />
              ),
            },
            {
              id: "metadata",
              title: "Metadata",
              defaultCollapsed: true,
              children: (
                <div className="grid gap-1 text-xs text-secondary">
                  <div>Created: {formatLocalDateTime(node.data.createdAt)}</div>
                  <div>Updated: {formatLocalDateTime(node.data.updatedAt)}</div>
                </div>
              ),
            },
          ]}
        />
      </aside>
    )
  }

  return (
    <aside className="inspector">
      <div className="inspector-heading">
        <div>
          <h2>Asteria</h2>
          <p>Visual block maps for Bayesian model work and paper notes.</p>
        </div>
      </div>
      <InspectorSectionStack
        storageKey="asteria-inspector-empty-layout"
        sections={[
          {
            id: "state",
            title: "Current state",
            children: (
              <>
                <div className="rounded-lg border border-border bg-app/60 p-3 text-sm">
                  <div className="font-medium text-foreground">{saveStatus}</div>
                  <div className="mt-1 text-xs text-secondary">Last saved: {formatLocalDateTime(lastSavedAt)}</div>
                </div>
                <button type="button" className="primary-button mt-3" onClick={createBlock}>
                  <Plus size={15} />
                  Create block
                </button>
              </>
            ),
          },
          {
            id: "shortcuts",
            title: "Shortcuts",
            defaultCollapsed: true,
            children: (
              <dl className="grid grid-cols-[96px_1fr] gap-2 text-xs text-secondary">
                <dt className="shortcut">Del</dt>
                <dd>Delete selected object</dd>
                <dt className="shortcut">Ctrl/Cmd+S</dt>
                <dd>Save</dd>
                <dt className="shortcut">Ctrl/Cmd+E</dt>
                <dd>Export JSON</dd>
                <dt className="shortcut">Esc</dt>
                <dd>Exit inline editing, then clear selection</dd>
                <dt className="shortcut">Enter</dt>
                <dd>Edit selected block content</dd>
                <dt className="shortcut">Ctrl/Cmd+Enter</dt>
                <dd>Create next block</dd>
                <dt className="shortcut">Ctrl/Cmd+Shift+Enter</dt>
                <dd>Create linked block</dd>
                <dt className="shortcut">Double click</dt>
                <dd>Create block or edit selected block</dd>
              </dl>
            ),
          },
        ]}
      />
    </aside>
  )
}
