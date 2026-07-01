import { Clipboard, Copy, Layers, Plus } from "lucide-react"
import { blockStatusOptions, blockTypeByValue, blockTypeOptions } from "../constants/blockTypes"
import { backgroundPalette, textPalette } from "../constants/palette"
import { ColorPickerRow } from "./ColorPickerRow"
import { EdgeInspector } from "./EdgeInspector"
import { RichTextEditor } from "./RichTextEditor"
import { formatLocalDateTime } from "../lib/time"
import { useMapStore } from "../store/useMapStore"

const emojiPresets = ["⚠️", "⭐", "📌", "✅", "❌", "💡", "📎", "🧪", "📊", "🔗", "❓", "🔥"]

export function InspectorPanel() {
  const {
    nodes,
    edges,
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
    const updateEmoji = (index: number, value: string) => {
      const next = [emojis[0] || "", emojis[1] || ""]
      next[index] = value
      updateBlock(node.id, { emojis: next.map((item) => item.trim()).filter(Boolean).slice(0, 2) })
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
                value={node.data.title}
                onChange={(event) => updateBlock(node.id, { title: event.target.value })}
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
            <div className="grid grid-cols-2 gap-3">
              <label className="field-label">
                Emoji 1
                <input className="field-input" value={emojis[0] || ""} maxLength={16} onChange={(event) => updateEmoji(0, event.target.value)} />
                <div className="emoji-preset-grid" aria-label="Emoji 1 presets">
                  {emojiPresets.map((emoji) => (
                    <button key={`emoji-1-${emoji}`} type="button" className="emoji-preset-button" onClick={() => updateEmoji(0, emoji)}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </label>
              <label className="field-label">
                Emoji 2
                <input className="field-input" value={emojis[1] || ""} maxLength={16} onChange={(event) => updateEmoji(1, event.target.value)} />
                <div className="emoji-preset-grid" aria-label="Emoji 2 presets">
                  {emojiPresets.map((emoji) => (
                    <button key={`emoji-2-${emoji}`} type="button" className="emoji-preset-button" onClick={() => updateEmoji(1, emoji)}>
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
              content={node.data.contentJson}
              onChange={(contentJson, contentHtml) => updateBlock(node.id, { contentJson, contentHtml })}
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
