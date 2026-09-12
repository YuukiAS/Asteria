import { Download, FileJson2, GitBranch, Link2, LocateFixed, Network, RotateCcw, Search, ShieldCheck } from "lucide-react"
import { useMemo, useState, type CSSProperties } from "react"
import { canonicalTraceProjects, type CanonicalTraceProjectId } from "../architecture/fixtures/canonicalTraceFixtures"
import { catTraceMultiViewProject, evidenceClosureWarnings, multiViewIds, projectedEntities, searchCanonicalEntities, type MultiViewId } from "../architecture/fixtures/multiViewTraceProject"
import { exportArchitectureJsonV2, exportArchitectureMarkdown } from "../architecture/export"
import { architectureLayerDefinitions, layerLabel } from "../architecture/layers"
import { generateArchitectureOutline } from "../architecture/outline"
import { projectLayerFocus } from "../architecture/projection"
import { diffOriginalTraceToCatTrace } from "../architecture/semanticDiff"
import { traceForSymbol, type TraceDirection, type TraceMode } from "../architecture/trace"
import { useArchitectureSession } from "../architecture/session"
import type { ArchitectureProjectV2, RelationType, SemanticLayer, StatisticalEntity, StatisticalSymbol, TypedRelation } from "../architecture/types"
import { validateArchitectureProject } from "../architecture/validation"

const modelOptions: Array<{ id: CanonicalTraceProjectId; label: string }> = [
  { id: "original-trace", label: "Original TRACE" },
  { id: "cat-trace-frozen-v2", label: "CAT-TRACE Frozen V2" },
]

const researchViewOptions: Array<{ id: MultiViewId; label: string; icon: typeof Network }> = [
  { id: multiViewIds.architecture, label: "Architecture", icon: Network },
  { id: multiViewIds.lineage, label: "Lineage", icon: GitBranch },
  { id: multiViewIds.evidence, label: "Evidence", icon: ShieldCheck },
]

const defaultViewSelection: Record<MultiViewId, string> = {
  [multiViewIds.architecture]: "entity:cat-trace-frozen-v2:betaU_gh",
  [multiViewIds.lineage]: "entity:lineage:cat-trace",
  [multiViewIds.evidence]: "entity:evidence:claim:open-tail-response",
}

function latexText(symbol?: StatisticalSymbol) {
  return symbol?.latex || ""
}

function relationTone(type: RelationType) {
  if (["pending", "limited_by", "contradicts_or_challenges", "contradicts"].includes(type)) return "gap"
  if (["theoretically_supports", "empirically_tests", "validates_implementation", "stress_tests", "supports", "tests", "validated_on"].includes(type)) return "support"
  if (["extends", "preserves", "borrows_interpretation_from", "computationally_inspired_by", "uses_methodological_component_from"].includes(type)) return "lineage"
  return "neutral"
}

function relatedRelations(project: ArchitectureProjectV2, entityId: string) {
  return Object.values(project.relations).filter((relation) => relation.sourceId === entityId || relation.targetId === entityId)
}

function relationPeer(project: ArchitectureProjectV2, relation: TypedRelation, entityId: string) {
  const peerId = relation.sourceId === entityId ? relation.targetId : relation.sourceId
  return project.entities[peerId]
}

function selectedButtonStyle(selected: boolean): CSSProperties {
  return {
    backgroundColor: selected ? "rgb(var(--color-accent-soft))" : "transparent",
    color: selected ? "rgb(var(--color-accent))" : "rgb(var(--color-secondary))",
  }
}

export function ArchitectureReferencePanel() {
  const {
    activeViewId,
    modelId,
    project,
    selectedSymbolId,
    selectedEntityId,
    traceMode,
    traceDirection,
    traceDepth,
    focusedLayer,
    exportMode,
    actionStatus,
    trace,
    setActiveViewId,
    setModelId,
    setSelectedSymbolId,
    setSelectedEntityId,
    setTraceMode,
    setTraceDirection,
    setTraceDepth,
    setFocusedLayer,
    setExportMode,
    setActionStatus,
    openLinkedView,
    saveViewState,
    restoreViewState,
  } = useArchitectureSession()
  const [collapsedOutlineLayers, setCollapsedOutlineLayers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchScope, setSearchScope] = useState<"current" | "all">("current")
  const symbolList = useMemo(() => Object.values(project.symbols), [project])
  const selectedSymbol = project.symbols[selectedSymbolId] || symbolList[0]
  const selectedArchitectureEntityId = selectedSymbol?.entityId || defaultViewSelection[multiViewIds.architecture]
  const layerProjection = useMemo(() => projectLayerFocus(project, "view:architecture", focusedLayer === "all" ? undefined : focusedLayer), [focusedLayer, project])
  const outline = useMemo(() => generateArchitectureOutline(project), [project])
  const warnings = useMemo(() => validateArchitectureProject(project), [project])
  const diffReport = useMemo(() => diffOriginalTraceToCatTrace(canonicalTraceProjects["original-trace"], canonicalTraceProjects["cat-trace-frozen-v2"]), [])
  const exportText = useMemo(
    () => {
      if (exportMode === "markdown") return exportArchitectureMarkdown(project, { variantId: modelId }).split("\n").slice(0, 12).join("\n")
      const exported = JSON.parse(exportArchitectureJsonV2(project)) as { schemaVersion: string; project: unknown; validationWarnings: unknown[] }
      return JSON.stringify({ schemaVersion: exported.schemaVersion, validationWarnings: exported.validationWarnings, project: exported.project }, null, 2)
    },
    [exportMode, modelId, project],
  )
  const selectedEntity = selectedSymbol?.entityId ? project.entities[selectedSymbol.entityId] : undefined
  const upstream = [...trace.upstreamEntityIds].map((id) => project.entities[id]).filter(Boolean)
  const downstream = [...trace.downstreamEntityIds].map((id) => project.entities[id]).filter(Boolean)
  const visibleSymbols = symbolList.filter((symbol) => !symbol.entityId || layerProjection.entityIds.has(symbol.entityId))
  const viewEntities = useMemo(() => projectedEntities(project, activeViewId), [activeViewId, project])
  const currentViewSelection = project.entities[selectedEntityId] || viewEntities[0]
  const currentRelations = currentViewSelection ? relatedRelations(project, currentViewSelection.id) : []
  const closureWarnings = useMemo(() => evidenceClosureWarnings(catTraceMultiViewProject), [])
  const searchResults = useMemo(
    () => searchCanonicalEntities(project, searchQuery, searchScope === "current" ? activeViewId : undefined).slice(0, 8),
    [activeViewId, project, searchQuery, searchScope],
  )

  const switchModel = (next: CanonicalTraceProjectId) => {
    setModelId(next)
  }

  const switchResearchView = (viewId: MultiViewId, entityId?: string) => {
    setActiveViewId(viewId, entityId || defaultViewSelection[viewId])
  }

  return (
    <aside className="inspector architecture-reference-panel" data-testid="architecture-reference-panel">
      <div className="inspector-heading">
        <div>
          <h2>Asteria 2.0</h2>
          <p>Canonical graph with Architecture, Lineage, and Evidence projections.</p>
        </div>
        <span className="type-badge border-accent/30 bg-accentSoft text-accent">RC</span>
      </div>

      <div className="architecture-view-switch" role="tablist" aria-label="Research view">
        {researchViewOptions.map((option) => {
          const Icon = option.icon
          return (
            <button key={option.id} type="button" className={`segmented-button justify-center ${activeViewId === option.id ? "segmented-button-active" : ""}`} style={selectedButtonStyle(activeViewId === option.id)} aria-selected={activeViewId === option.id} data-asteria-selected={activeViewId === option.id ? "true" : "false"} onClick={() => switchResearchView(option.id)} data-testid={`view-${option.id.replace("view:", "")}`}>
              <Icon size={14} />
              {option.label}
            </button>
          )
        })}
      </div>

      <div className="architecture-search-row">
        <Search size={14} />
        <input className="field-input" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search current view or graph" data-testid="architecture-search-input" />
        <select className="field-input" value={searchScope} onChange={(event) => setSearchScope(event.target.value as "current" | "all")} aria-label="Search scope" data-testid="architecture-search-scope">
          <option value="current">Current view</option>
          <option value="all">All graph</option>
        </select>
      </div>
      {searchResults.length ? (
        <div className="architecture-search-results" data-testid="architecture-search-results">
          {searchResults.map((entity) => (
            <button key={entity.id} type="button" onClick={() => setSelectedEntityId(entity.id)}>
              {entity.label}
            </button>
          ))}
        </div>
      ) : null}

      {activeViewId === multiViewIds.architecture ? (
        <>
          <div className="architecture-model-switch" role="tablist" aria-label="Canonical model">
            {modelOptions.map((option) => (
              <button key={option.id} type="button" className={`segmented-button justify-center ${modelId === option.id ? "segmented-button-active" : ""}`} style={selectedButtonStyle(modelId === option.id)} aria-selected={modelId === option.id} data-asteria-selected={modelId === option.id ? "true" : "false"} onClick={() => switchModel(option.id)} data-testid={`model-${option.id}`}>
                {option.label}
              </button>
            ))}
          </div>

          <div className="architecture-focus-grid">
            <label className="field-label">
              Layer focus
              <select className="field-input" value={focusedLayer} onChange={(event) => setFocusedLayer(event.target.value as SemanticLayer | "all")} data-testid="layer-focus">
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
              <select className="field-input" value={traceMode} onChange={(event) => setTraceMode(event.target.value as TraceMode)} data-testid="trace-mode">
                <option value="direct">Direct</option>
                <option value="recursive">Recursive</option>
              </select>
            </label>
            <label className="field-label">
              Direction
              <select className="field-input" value={traceDirection} onChange={(event) => setTraceDirection(event.target.value as TraceDirection)} data-testid="trace-direction">
                <option value="both">Both</option>
                <option value="upstream">Upstream</option>
                <option value="downstream">Downstream</option>
              </select>
            </label>
            <label className="field-label">
              Depth
              <input className="field-input" type="number" min={1} max={6} value={traceDepth} onChange={(event) => setTraceDepth(Number(event.target.value) || 1)} data-testid="trace-depth" />
            </label>
          </div>

          <div className="architecture-trace-stage" aria-label="Direct symbol trace map" data-testid="architecture-trace-stage">
            {visibleSymbols.slice(0, 30).map((symbol) => {
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
                  data-testid={`symbol-${symbol.id.split(":").pop() || symbol.id}`}
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
            <button type="button" className="toolbar-button" onClick={() => setSelectedSymbolId(Object.values(project.symbols)[0]?.id || "")} data-testid="clear-architecture-selection">
              <RotateCcw size={14} />
              Clear
            </button>
          </div>

          <section className="panel-section">
            <div className="section-title">Symbol Inspector</div>
            <div className="architecture-symbol-title" data-testid="symbol-inspector">
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
            {modelId === "cat-trace-frozen-v2" ? (
              <div className="architecture-link-row">
                <button type="button" className="toolbar-button" onClick={() => openLinkedView("lineage", selectedArchitectureEntityId)} data-testid="open-lineage">
                  <GitBranch size={14} />
                  Open Lineage
                </button>
                <button type="button" className="toolbar-button" onClick={() => openLinkedView("evidence", selectedArchitectureEntityId)} data-testid="open-evidence">
                  <ShieldCheck size={14} />
                  Open Evidence
                </button>
              </div>
            ) : null}
          </section>

          <section className="panel-section">
            <div className="section-title">Architecture Outline</div>
            <div className="architecture-outline" data-testid="architecture-outline">
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
            <div className="section-title">Export & Validation</div>
            <div className="architecture-export-grid">
              <span className="badge">Warnings {warnings.length}</span>
              <button type="button" className={`toolbar-button ${exportMode === "markdown" ? "toolbar-button-active" : ""}`} onClick={() => setExportMode("markdown")} data-testid="export-markdown">
                <Download size={14} />
                Markdown
              </button>
              <button type="button" className={`toolbar-button ${exportMode === "json" ? "toolbar-button-active" : ""}`} onClick={() => setExportMode("json")} data-testid="export-json">
                <FileJson2 size={14} />
                Schema V2
              </button>
            </div>
            <pre className="architecture-export-preview" data-testid="architecture-export-preview">{exportText}</pre>
            <div className="architecture-warning-list">
              {warnings.length ? warnings.slice(0, 4).map((warning, index) => <span key={`${warning.id}:${index}`}>{warning.message}</span>) : <span>No structural warnings.</span>}
            </div>
          </section>

          <section className="panel-section">
            <div className="section-title">Semantic Diff</div>
            <div className="architecture-diff-list" data-testid="semantic-diff">
              {diffReport.items.slice(0, 8).map((item) => (
                <button key={item.id} type="button" className={`architecture-diff-row architecture-diff-${item.status}`}>
                  <span>{item.status.replace(/_/g, " ")}</span>
                  <strong>{item.label}</strong>
                </button>
              ))}
            </div>
          </section>

          <section className="panel-section">
            <div className="section-title">Trace Path</div>
            <div className="architecture-trace-list" data-testid="trace-lists">
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
        </>
      ) : (
        <MultiViewPanel
          viewId={activeViewId}
          entities={viewEntities}
          selectedEntity={currentViewSelection}
          relations={currentRelations}
          closureWarnings={closureWarnings}
          onSelectEntity={setSelectedEntityId}
          onOpenArchitecture={(entityId) => openLinkedView("architecture", entityId)}
          onOpenLineage={(entityId) => openLinkedView("lineage", entityId)}
          onOpenEvidence={(entityId) => openLinkedView("evidence", entityId)}
        />
      )}

      <section className="panel-section">
        <div className="section-title">Session</div>
        <div className="architecture-action-grid">
          <button type="button" className="toolbar-button" onClick={saveViewState} data-testid="save-view-state">
            <Download size={14} />
            Save view
          </button>
          <button type="button" className="toolbar-button" onClick={restoreViewState} data-testid="restore-view-state">
            <RotateCcw size={14} />
            Restore
          </button>
        </div>
        <div className="architecture-binding-note" role="status" data-testid="architecture-action-status">
          <Link2 size={14} />
          {actionStatus}
        </div>
      </section>
    </aside>
  )
}

function MultiViewPanel({
  viewId,
  entities,
  selectedEntity,
  relations,
  closureWarnings,
  onSelectEntity,
  onOpenArchitecture,
  onOpenLineage,
  onOpenEvidence,
}: {
  viewId: MultiViewId
  entities: StatisticalEntity[]
  selectedEntity?: StatisticalEntity
  relations: TypedRelation[]
  closureWarnings: ReturnType<typeof evidenceClosureWarnings>
  onSelectEntity: (id: string) => void
  onOpenArchitecture: (id: string) => void
  onOpenLineage: (id: string) => void
  onOpenEvidence: (id: string) => void
}) {
  const isEvidence = viewId === multiViewIds.evidence
  return (
    <>
      <div className={`research-view-canvas research-view-canvas-${isEvidence ? "evidence" : "lineage"}`} data-testid={`${isEvidence ? "evidence" : "lineage"}-canvas`}>
        {entities.map((entity) => {
          const selected = selectedEntity?.id === entity.id
          return (
            <button key={entity.id} type="button" className={`research-view-node research-view-node-${entity.kind} ${selected ? "research-view-node-selected" : ""}`} onClick={() => onSelectEntity(entity.id)} data-testid={`entity-${entity.id.split(":").pop() || entity.id}`}>
              <span>{entity.kind.replace(/_/g, " ")}</span>
              <strong>{entity.label}</strong>
              <small>{entity.role}</small>
            </button>
          )
        })}
      </div>

      <section className="panel-section">
        <div className="section-title">{isEvidence ? "Claim Inspector" : "Method Inspector"}</div>
        {selectedEntity ? (
          <>
            <div className="architecture-symbol-title" data-testid={isEvidence ? "claim-inspector" : "method-inspector"}>
              <span>{selectedEntity.label}</span>
              <strong>{selectedEntity.role}</strong>
            </div>
            <dl className="architecture-inspector-grid">
              <dt>Summary</dt>
              <dd>{selectedEntity.description}</dd>
              <dt>Status</dt>
              <dd>{selectedEntity.observedStatus}</dd>
              <dt>Definition</dt>
              <dd>{selectedEntity.definition || "contextual graph entity"}</dd>
              <dt>Variant</dt>
              <dd>{selectedEntity.variantNote || "CAT-TRACE Frozen V2 applicability"}</dd>
              <dt>Limits</dt>
              <dd>{selectedEntity.constraints?.join("; ") || "none recorded"}</dd>
            </dl>
            <div className="architecture-relation-list" data-testid="context-relations">
              {relations.map((relation) => {
                const peer = relationPeer(catTraceMultiViewProject, relation, selectedEntity.id)
                return (
                  <button key={relation.id} type="button" className={`architecture-relation-row architecture-relation-${relationTone(relation.type)}`} onClick={() => peer && onSelectEntity(peer.id)}>
                    <span>{relation.type.replace(/_/g, " ")}</span>
                    <strong>{relation.label || relation.type}</strong>
                    <small>{peer?.label || "missing peer"}</small>
                  </button>
                )
              })}
            </div>
            <div className="architecture-link-row">
              <button type="button" className="toolbar-button" onClick={() => onOpenArchitecture(selectedEntity.id)} data-testid="context-open-architecture">
                <Network size={14} />
                Open Architecture
              </button>
              {!isEvidence ? (
                <button type="button" className="toolbar-button" onClick={() => onOpenEvidence(selectedEntity.id)} data-testid="context-open-evidence">
                  <ShieldCheck size={14} />
                  Open Evidence
                </button>
              ) : (
                <button type="button" className="toolbar-button" onClick={() => onOpenLineage(selectedEntity.id)} data-testid="context-open-lineage">
                  <GitBranch size={14} />
                  Open Lineage
                </button>
              )}
            </div>
          </>
        ) : null}
      </section>

      {isEvidence ? (
        <section className="panel-section">
          <div className="section-title">Closure Gaps</div>
          <div className="architecture-warning-list" data-testid="closure-gaps">
            {closureWarnings.map((warning) => (
              <span key={warning.claimId}>
                {warning.label}: {warning.status}, support {warning.supportCount}, gaps {warning.gapCount}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}
