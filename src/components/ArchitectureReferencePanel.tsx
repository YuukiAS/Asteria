import { GitBranch, LocateFixed, RotateCcw } from "lucide-react"
import { useMemo, useState } from "react"
import { canonicalTraceProjects, type CanonicalTraceProjectId } from "../architecture/fixtures/canonicalTraceFixtures"
import { architectureLayerDefinitions, layerLabel } from "../architecture/layers"
import { generateArchitectureOutline } from "../architecture/outline"
import { projectLayerFocus } from "../architecture/projection"
import { traceForSymbol, type TraceDirection, type TraceMode } from "../architecture/trace"
import type { SemanticLayer, StatisticalSymbol } from "../architecture/types"

const modelOptions: Array<{ id: CanonicalTraceProjectId; label: string }> = [
  { id: "original-trace", label: "Original TRACE" },
  { id: "cat-trace-frozen-v2", label: "CAT-TRACE Frozen V2" },
]

function latexText(symbol?: StatisticalSymbol) {
  return symbol?.latex || ""
}

export function ArchitectureReferencePanel() {
  const [modelId, setModelId] = useState<CanonicalTraceProjectId>("cat-trace-frozen-v2")
  const [traceMode, setTraceMode] = useState<TraceMode>("direct")
  const [traceDirection, setTraceDirection] = useState<TraceDirection>("both")
  const [traceDepth, setTraceDepth] = useState(2)
  const [focusedLayer, setFocusedLayer] = useState<SemanticLayer | "all">("all")
  const [collapsedOutlineLayers, setCollapsedOutlineLayers] = useState<string[]>([])
  const project = canonicalTraceProjects[modelId]
  const symbolList = useMemo(() => Object.values(project.symbols), [project])
  const [selectedSymbolId, setSelectedSymbolId] = useState(() => symbolList[0]?.id || "")
  const selectedSymbol = project.symbols[selectedSymbolId] || symbolList[0]
  const trace = useMemo(() => traceForSymbol(project, selectedSymbol?.id || "", { mode: traceMode, direction: traceDirection, maxDepth: traceDepth }), [project, selectedSymbol?.id, traceDepth, traceDirection, traceMode])
  const layerProjection = useMemo(() => projectLayerFocus(project, "view:architecture", focusedLayer === "all" ? undefined : focusedLayer), [focusedLayer, project])
  const outline = useMemo(() => generateArchitectureOutline(project), [project])
  const selectedEntity = selectedSymbol?.entityId ? project.entities[selectedSymbol.entityId] : undefined
  const upstream = [...trace.upstreamEntityIds].map((id) => project.entities[id]).filter(Boolean)
  const downstream = [...trace.downstreamEntityIds].map((id) => project.entities[id]).filter(Boolean)
  const visibleSymbols = symbolList.filter((symbol) => !symbol.entityId || layerProjection.entityIds.has(symbol.entityId))

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

      <div className="architecture-focus-grid">
        <label className="field-label">
          Layer focus
          <select className="field-input" value={focusedLayer} onChange={(event) => setFocusedLayer(event.target.value as SemanticLayer | "all")}>
            <option value="all">All layers</option>
            {architectureLayerDefinitions.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label">
          Trace mode
          <select className="field-input" value={traceMode} onChange={(event) => setTraceMode(event.target.value as TraceMode)}>
            <option value="direct">Direct</option>
            <option value="recursive">Recursive</option>
          </select>
        </label>
        <label className="field-label">
          Direction
          <select className="field-input" value={traceDirection} onChange={(event) => setTraceDirection(event.target.value as TraceDirection)}>
            <option value="both">Both</option>
            <option value="upstream">Upstream</option>
            <option value="downstream">Downstream</option>
          </select>
        </label>
        <label className="field-label">
          Depth
          <input className="field-input" type="number" min={1} max={6} value={traceDepth} onChange={(event) => setTraceDepth(Number(event.target.value) || 1)} />
        </label>
      </div>

      <div className="architecture-trace-stage" aria-label="Direct symbol trace map">
        {visibleSymbols.slice(0, 24).map((symbol) => {
          const entityId = symbol.entityId || ""
          const isSelected = symbol.id === selectedSymbol?.id
          const isUpstream = trace.upstreamEntityIds.has(entityId)
          const isDownstream = trace.downstreamEntityIds.has(entityId)
          const isInTrace = trace.entityIds.has(entityId)
          return (
            <button
              key={symbol.id}
              type="button"
              className={`architecture-symbol-node ${isSelected ? "architecture-symbol-node-selected" : ""} ${isUpstream ? "architecture-symbol-node-upstream" : ""} ${isDownstream ? "architecture-symbol-node-downstream" : ""} ${
                selectedSymbol && !isSelected && !isInTrace ? "architecture-symbol-node-dimmed" : ""
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
        <span className="badge">{traceMode}</span>
        <span className="badge">Upstream {upstream.length}</span>
        <span className="badge">Downstream {downstream.length}</span>
        <span className="badge">{focusedLayer === "all" ? "All layers" : layerLabel(focusedLayer)}</span>
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
        <div className="section-title">Architecture Outline</div>
        <div className="architecture-outline">
          {outline.sections.map((section) => {
            const isCollapsed = collapsedOutlineLayers.includes(section.id)
            return (
              <div key={section.id} className="architecture-outline-section">
                <button
                  type="button"
                  className="architecture-outline-heading"
                  onClick={() => setCollapsedOutlineLayers((current) => (current.includes(section.id) ? current.filter((id) => id !== section.id) : [...current, section.id]))}
                >
                  <span>{section.label}</span>
                  <small>{section.entityIds.length}</small>
                </button>
                {!isCollapsed && (
                  <div className="architecture-outline-rows">
                    {section.entityIds.map((entityId) => {
                      const entity = project.entities[entityId]
                      const symbolId = entity?.symbolIds?.find((id) => project.symbols[id])
                      return (
                        <button key={entityId} type="button" className={`architecture-outline-row ${entityId === selectedEntity?.id ? "architecture-outline-row-active" : ""}`} onClick={() => symbolId && setSelectedSymbolId(symbolId)}>
                          <LocateFixed size={12} />
                          {entity?.label || entityId}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
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
        <div className="architecture-breadcrumbs" aria-label="Trace breadcrumbs">
          {trace.breadcrumbs.slice(0, 10).map((item, index) => (
            <span key={`${item.entityId}:${index}`}>{project.entities[item.entityId]?.label || item.entityId}</span>
          ))}
        </div>
        <div className="architecture-binding-note">
          <GitBranch size={14} />
          Formula bindings use stable symbol IDs; display LaTeX can change without changing identity.
        </div>
      </section>
    </aside>
  )
}
