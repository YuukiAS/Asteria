import { Clipboard, Copy, Layers, Plus } from "lucide-react"
import { blockStatusOptions, blockTypeByValue, blockTypeOptions } from "../constants/blockTypes"
import { allVersionsId, blockDisplayModeOptions, commonVariantKey } from "../constants/versioning"
import { backgroundPalette, textPalette } from "../constants/palette"
import { ColorPickerRow } from "./ColorPickerRow"
import { EdgeInspector } from "./EdgeInspector"
import { RichTextEditor } from "./RichTextEditor"
import { formatLocalDateTime } from "../lib/time"
import { resolveBlockContentJson, resolveBlockTitle } from "../lib/exportImport"
import { useMapStore } from "../store/useMapStore"

const emojiPresets = ["⚠️", "⭐", "📌", "✅", "❌", "💡", "📎", "🧪", "📊", "🔗", "❓", "🔥"]

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
    addBlock,
    updateBlock,
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

  if (selectedNodeIds.length > 1) {
    return (
      <aside className="inspector">
        <div className="inspector-heading">
          <div>
            <h2>Selection</h2>
            <p>{selectedNodeIds.length} objects selected.</p>
          </div>
        </div>
        <section className="panel-section">
          <div className="section-title">Actions</div>
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
        </section>
        <section className="panel-section">
          <div className="section-title">Layout</div>
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
        </section>
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
        <div className="grid gap-5">
          <section className="panel-section">
            <div className="section-title">Object</div>
            <label className="field-label">
              Title
              <input className="field-input" value={node.data.title} onChange={(event) => updateGroup(node.id, { title: event.target.value })} />
            </label>
          </section>
          <section className="panel-section">
            <div className="section-title">Appearance</div>
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
          </section>
          <section className="panel-section">
            <div className="section-title">Metadata</div>
            <div className="grid gap-1 text-xs text-secondary">
              <div>Created: {formatLocalDateTime(node.data.createdAt)}</div>
              <div>Updated: {formatLocalDateTime(node.data.updatedAt)}</div>
            </div>
          </section>
        </div>
      </aside>
    )
  }

  if (node?.type === "block") {
    const blockType = blockTypeByValue[node.data.nodeType] || blockTypeByValue.generic
    const emojis = node.data.emojis || []
    const activeVariantKey = node.data.activeVariantKey || (activeVersionId === allVersionsId ? commonVariantKey : activeVersionId)
    const activeVersion = modelVersions.find((version) => version.id === activeVariantKey)
    const activeTitle = resolveBlockTitle(node.data, activeVariantKey)
    const activeContentJson = resolveBlockContentJson(node.data, activeVariantKey)
    const hasVersionVariant = Boolean(node.data.variants?.[activeVariantKey])
    const variantLabel = activeVariantKey === commonVariantKey ? "Default" : activeVersion?.label || "Version"
    const setEditingVariant = (variantKey: string) => {
      setBlockActiveVariant(node.id, variantKey)
    }
    const updateEmoji = (value: string) => {
      const emoji = value.trim()
      updateBlock(node.id, { emojis: emoji ? [emoji] : [] })
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
        <div className="grid gap-5">
          <section className="panel-section">
            <div className="section-title">Object</div>
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
                onChange={(event) => updateBlock(node.id, { nodeType: event.target.value as typeof node.data.nodeType })}
              >
                {blockTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Content version
              <select
                className="field-input"
                value={activeVariantKey}
                onChange={(event) => setEditingVariant(event.target.value)}
                title="Choose which content version this selected block displays and edits."
              >
                <option value={commonVariantKey}>Default</option>
                {modelVersions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.label}
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
            <div className="rounded-lg border border-border bg-app/60 p-2 text-xs text-secondary">
              Editing content: <span className="font-semibold text-foreground">{variantLabel}</span>
              {!hasVersionVariant && activeVariantKey !== commonVariantKey ? " (currently showing Default fallback; typing here creates this version)" : ""}
              <br />
              The top toolbar switches every block; this selector switches only the selected block.
              {displayModeOverride !== "block" ? ` Toolbar density override: ${displayModeOverride}.` : ""}
            </div>
          </section>
          <section className="panel-section">
            <div className="section-title">Variants</div>
            <div className="grid gap-2">
              {modelVersions.length === 0 && <div className="text-xs text-secondary">Add versions from the top toolbar to create version-specific block content.</div>}
              {modelVersions.map((version) => {
                const hasVariant = Boolean(node.data.variants?.[version.id])
                return (
                  <div key={version.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
                    <span className="truncate text-xs text-secondary">
                      {version.label} {hasVariant ? "" : "(fallback)"}
                    </span>
                    <button type="button" className="toolbar-button justify-center" onClick={() => copyBlockVariantToVersion(node.id, version.id)}>
                      Use current content
                    </button>
                    <button
                      type="button"
                      className="danger-button justify-center disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!hasVariant}
                      onClick={() => deleteBlockVariant(node.id, version.id)}
                    >
                      Delete
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
          <section className="panel-section">
            <div className="section-title">Markers</div>
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
          </section>
          <section className="panel-section">
            <div className="section-title">Appearance</div>
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
          </section>
          <section className="panel-section">
            <div className="section-title">Content</div>
            <RichTextEditor
              content={activeContentJson}
              onChange={(contentJson, contentHtml) => updateBlockVariant(node.id, activeVariantKey, { contentJson, contentHtml })}
            />
          </section>
          <section className="panel-section">
            <div className="section-title">Metadata</div>
            <div className="grid gap-1 text-xs text-secondary">
              <div>Created: {formatLocalDateTime(node.data.createdAt)}</div>
              <div>Updated: {formatLocalDateTime(node.data.updatedAt)}</div>
            </div>
          </section>
        </div>
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
      <section className="panel-section">
        <div className="section-title">Current state</div>
        <div className="rounded-lg border border-border bg-app/60 p-3 text-sm">
          <div className="font-medium text-foreground">{saveStatus}</div>
          <div className="mt-1 text-xs text-secondary">Last saved: {formatLocalDateTime(lastSavedAt)}</div>
        </div>
        <button type="button" className="primary-button mt-3" onClick={() => addBlock()}>
          <Plus size={15} />
          Create block
        </button>
      </section>
      <section className="panel-section">
        <div className="section-title">Shortcuts</div>
        <dl className="grid grid-cols-[96px_1fr] gap-2 text-xs text-secondary">
          <dt className="shortcut">Del</dt>
          <dd>Delete selected object</dd>
          <dt className="shortcut">Ctrl/Cmd+S</dt>
          <dd>Save</dd>
          <dt className="shortcut">Ctrl/Cmd+E</dt>
          <dd>Export JSON</dd>
          <dt className="shortcut">Esc</dt>
          <dd>Clear selection</dd>
          <dt className="shortcut">Double click</dt>
          <dd>Create block or focus editor</dd>
        </dl>
      </section>
    </aside>
  )
}
