import { Plus } from "lucide-react"
import { ColorPickerRow } from "./ColorPickerRow"
import { EdgeInspector } from "./EdgeInspector"
import { RichTextEditor } from "./RichTextEditor"
import { formatLocalDateTime } from "../lib/time"
import { useMapStore } from "../store/useMapStore"

export function InspectorPanel() {
  const {
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    saveStatus,
    lastSavedAt,
    addBlock,
    updateBlock,
    updateEdge,
    deleteEdge,
  } = useMapStore()
  const node = nodes.find((item) => item.id === selectedNodeId)
  const edge = edges.find((item) => item.id === selectedEdgeId)

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

  if (node) {
    return (
      <aside className="inspector">
        <div className="inspector-heading">
          <div>
            <h2>Block</h2>
            <p>Generic research block</p>
          </div>
          <span className="badge">Generic</span>
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
          </section>
          <section className="panel-section">
            <div className="section-title">Content</div>
            <RichTextEditor
              content={node.data.contentJson}
              onChange={(contentJson, contentHtml) => updateBlock(node.id, { contentJson, contentHtml })}
            />
          </section>
          <section className="panel-section">
            <div className="section-title">Appearance</div>
            <ColorPickerRow
              label="Background"
              value={node.data.backgroundColor}
              onChange={(backgroundColor) => updateBlock(node.id, { backgroundColor })}
            />
            <ColorPickerRow label="Text" value={node.data.textColor} onChange={(textColor) => updateBlock(node.id, { textColor })} />
            <ColorPickerRow
              label="Border"
              value={node.data.borderColor}
              onChange={(borderColor) => updateBlock(node.id, { borderColor })}
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
