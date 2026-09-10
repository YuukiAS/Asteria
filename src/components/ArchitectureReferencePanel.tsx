import { GitBranch, RotateCcw } from "lucide-react"
import { useMemo, useState } from "react"
import { canonicalTraceProjects, type CanonicalTraceProjectId } from "../architecture/fixtures/canonicalTraceFixtures"
import { directTraceForSymbol } from "../architecture/trace"
import type { StatisticalSymbol } from "../architecture/types"

const modelOptions: Array<{ id: CanonicalTraceProjectId; label: string }> = [
  { id: "original-trace", label: "Original TRACE" },
  { id: "cat-trace-frozen-v2", label: "CAT-TRACE Frozen V2" },
]

function latexText(symbol?: StatisticalSymbol) {
  return symbol?.latex || ""
}

export function ArchitectureReferencePanel() {
  const [modelId, setModelId] = useState<CanonicalTraceProjectId>("cat-trace-frozen-v2")
  const project = canonicalTraceProjects[modelId]
  const symbolList = useMemo(() => Object.values(project.symbols), [project])
  const [selectedSymbolId, setSelectedSymbolId] = useState(() => symbolList[0]?.id || "")
  const selectedSymbol = project.symbols[selectedSymbolId] || symbolList[0]
  const trace = useMemo(() => directTraceForSymbol(project, selectedSymbol?.id || ""), [project, selectedSymbol?.id])
  const selectedEntity = selectedSymbol?.entityId ? project.entities[selectedSymbol.entityId] : undefined
  const upstream = [...trace.upstreamEntityIds].map((id) => project.entities[id]).filter(Boolean)
  const downstream = [...trace.downstreamEntityIds].map((id) => project.entities[id]).filter(Boolean)

  const switchModel = (next: CanonicalTraceProjectId) => {
    setModelId(next)
    const nextProject = canonicalTraceProjects[next]
    setSelectedSymbolId(Object.values(nextProject.symbols)[0]?.id || "")
  }

  return (
    <aside className="inspector architecture-reference-panel">
      <div className="inspector-heading">
        <div>
          <h2>Architecture</h2>
          <p>Canonical symbols and direct trace.</p>
        </div>
        <span className="type-badge border-accent/30 bg-accentSoft text-accent">2.0</span>
      </div>

      <div className="architecture-model-switch" role="tablist" aria-label="Canonical model">
        {modelOptions.map((option) => (
          <button key={option.id} type="button" className={`segmented-button justify-center ${modelId === option.id ? "segmented-button-active" : ""}`} onClick={() => switchModel(option.id)}>
            {option.label}
          </button>
        ))}
      </div>

      <div className="architecture-trace-stage" aria-label="Direct symbol trace map">
        {symbolList.slice(0, 18).map((symbol) => {
          const entityId = symbol.entityId || ""
          const isSelected = symbol.id === selectedSymbol?.id
          const isUpstream = trace.upstreamEntityIds.has(entityId)
          const isDownstream = trace.downstreamEntityIds.has(entityId)
          return (
            <button
              key={symbol.id}
              type="button"
              className={`architecture-symbol-node ${isSelected ? "architecture-symbol-node-selected" : ""} ${isUpstream ? "architecture-symbol-node-upstream" : ""} ${isDownstream ? "architecture-symbol-node-downstream" : ""} ${
                selectedSymbol && !isSelected && !isUpstream && !isDownstream ? "architecture-symbol-node-dimmed" : ""
              }`}
              onClick={() => setSelectedSymbolId(symbol.id)}
              title={symbol.meaning}
            >
              <span>{symbol.latex}</span>
              <small>{symbol.canonicalName}</small>
            </button>
          )
        })}
      </div>

      <div className="architecture-trace-controls">
        <span className="badge">Direct</span>
        <span className="badge">Upstream {upstream.length}</span>
        <span className="badge">Downstream {downstream.length}</span>
        <button type="button" className="toolbar-button" onClick={() => setSelectedSymbolId(Object.values(project.symbols)[0]?.id || "")}>
          <RotateCcw size={14} />
          Clear
        </button>
      </div>

      <section className="panel-section">
        <div className="section-title">Symbol Inspector</div>
        <div className="architecture-symbol-title">
          <span>{latexText(selectedSymbol)}</span>
          <strong>{selectedSymbol?.canonicalName}</strong>
        </div>
        <dl className="architecture-inspector-grid">
          <dt>Meaning</dt>
          <dd>{selectedSymbol?.meaning}</dd>
          <dt>Role</dt>
          <dd>{selectedSymbol?.role}</dd>
          <dt>Model</dt>
          <dd>{project.project.title}</dd>
          <dt>Layer</dt>
          <dd>{selectedSymbol?.layer}</dd>
          <dt>Status</dt>
          <dd>{selectedSymbol?.observedStatus}</dd>
          <dt>Definition</dt>
          <dd>{selectedEntity?.definition || selectedEntity?.description}</dd>
          <dt>Indices</dt>
          <dd>{selectedSymbol?.indices?.join(", ") || "none"}</dd>
          <dt>Dimension</dt>
          <dd>{selectedSymbol?.dimension || selectedSymbol?.domain || "not specified"}</dd>
          <dt>Constraints</dt>
          <dd>{selectedEntity?.constraints?.join("; ") || "none"}</dd>
          <dt>Variant note</dt>
          <dd>{selectedEntity?.variantNote || "canonical in this model scope"}</dd>
        </dl>
      </section>

      <section className="panel-section">
        <div className="section-title">Direct Trace</div>
        <div className="architecture-trace-list">
          <div>
            <h3>Upstream</h3>
            {upstream.length ? upstream.map((entity) => <span key={entity.id}>{entity.label}</span>) : <span>None</span>}
          </div>
          <div>
            <h3>Downstream</h3>
            {downstream.length ? downstream.map((entity) => <span key={entity.id}>{entity.label}</span>) : <span>None</span>}
          </div>
        </div>
        <div className="architecture-binding-note">
          <GitBranch size={14} />
          Formula bindings use stable symbol IDs; display LaTeX can change without changing identity.
        </div>
      </section>
    </aside>
  )
}
