import { Download, FileJson2, GitBranch, Link2, LocateFixed, Network, Play, RotateCcw, Search, ShieldCheck } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
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
import { RenderedFormulaText, RenderedMath } from "./RenderedMath"

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

function viewLabel(viewId: MultiViewId) {
  if (viewId === multiViewIds.lineage) return "Lineage"
  if (viewId === multiViewIds.evidence) return "Evidence"
  return "Architecture"
}

function viewHelp(viewId: MultiViewId) {
  if (viewId === multiViewIds.lineage) return "Lineage answers where CAT-TRACE inherits, preserves, or adapts method ideas."
  if (viewId === multiViewIds.evidence) return "Evidence answers which claims are supported, pending, or limited before real-data closure."
  return "Architecture answers how each statistical symbol depends on data, latent variables, parameters, and targets."
}

function readableStatus(status?: string) {
  return (status || "not specified").replace(/_/g, " ")
}

function titleCaseStatus(status?: string) {
  return readableStatus(status)
    .split(" ")
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
    .join(" ")
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

function symbolForEntity(project: ArchitectureProjectV2, entity?: StatisticalEntity) {
  return entity?.symbolIds?.map((id) => project.symbols[id]).find(Boolean) as StatisticalSymbol | undefined
}

function viewForEntity(project: ArchitectureProjectV2, entityId: string, activeViewId: MultiViewId): MultiViewId {
  const activeScope = new Set(project.views[activeViewId]?.projectedEntityIds || [])
  if (activeScope.has(entityId)) return activeViewId
  for (const viewId of [multiViewIds.architecture, multiViewIds.lineage, multiViewIds.evidence]) {
    const view = catTraceMultiViewProject.views[viewId]
    if (view?.projectedEntityIds.includes(entityId)) return viewId
  }
  return multiViewIds.architecture
}

function modelForEntity(entityId: string): CanonicalTraceProjectId {
  return entityId.includes(":original-trace:") ? "original-trace" : "cat-trace-frozen-v2"
}

function whyEntityMatters(project: ArchitectureProjectV2, entity?: StatisticalEntity, relations: TypedRelation[] = []) {
  if (!entity) return "Select an item to see how it participates in the model graph."
  const incoming = relations.filter((relation) => relation.targetId === entity.id)
  const outgoing = relations.filter((relation) => relation.sourceId === entity.id)
  const upstreamText = incoming.length ? `${incoming.length} upstream relation${incoming.length === 1 ? "" : "s"}` : "no upstream relation in this view"
  const downstreamText = outgoing.length ? `${outgoing.length} downstream relation${outgoing.length === 1 ? "" : "s"}` : "no downstream relation in this view"
  const symbol = symbolForEntity(project, entity)
  const symbolText = symbol ? ` The rendered symbol is the user-facing form of the canonical source string.` : ""
  return `${entity.label} sits in the ${readableStatus(entity.layer)} layer with ${upstreamText} and ${downstreamText}.${symbolText}`
}

function inspectorTitle(entity?: StatisticalEntity, fallback = "Symbol") {
  if (!entity) return `${fallback} Inspector`
  if (entity.kind === "dataset") return "Dataset Inspector"
  if (entity.kind === "claim" || entity.kind === "theorem") return "Claim Inspector"
  if (entity.kind === "method" || entity.kind === "paper" || entity.kind === "prior") return "Method Inspector"
  if (entity.kind === "proof") return "Proof Inspector"
  if (entity.kind === "implementation") return "Implementation Inspector"
  if (entity.kind === "limitation" || entity.kind === "open_question") return "Limitation / Open-gap Inspector"
  return `${fallback} Inspector`
}

function researcherStatus(entity: StatisticalEntity | undefined, relations: TypedRelation[]) {
  if (!entity) return "Not specified"
  const hasPending = relations.some((relation) => relation.type === "pending") || entity.constraints?.some((constraint) => constraint.toLowerCase().includes("pending"))
  const hasLimit = relations.some((relation) => relation.type === "limited_by" || relation.type === "contradicts_or_challenges" || relation.type === "contradicts")
  const hasSupport = relations.some((relation) => ["theoretically_supports", "empirically_tests", "validates_implementation", "stress_tests", "supports", "tests", "validated_on"].includes(relation.type))
  if (hasPending) return "Pending"
  if (hasLimit && hasSupport) return "Supported with limits"
  if (hasLimit) return "Open gap"
  if (hasSupport) return "Supported"
  return titleCaseStatus(entity.observedStatus)
}

function diffGroup(status: string) {
  if (status === "added") return "Added"
  if (status.startsWith("modified")) return "Changed"
  if (status === "preserved_invariant" || status === "unchanged") return "Preserved"
  return readableStatus(status)
}

function diffWhy(status: string) {
  if (status === "added") return "New CAT-TRACE structure that Original TRACE does not expose."
  if (status.startsWith("modified")) return "A TRACE concept is retained but its CAT-TRACE role is more specific."
  if (status === "preserved_invariant" || status === "unchanged") return "A core TRACE invariant remains visible in Frozen V2."
  return "Model comparison item."
}

export function ArchitectureReferencePanel() {
  const {
    activeViewId,
    modelId,
    project,
    selectedSymbolId,
    selectedEntityId,
    activeTraceSymbolId,
    traceEnabled,
    traceMode,
    traceDirection,
    traceDepth,
    detailLevel,
    focusedLayer,
    exportMode,
    actionStatus,
    trace,
    searchQuery,
    searchScope,
    setActiveViewId,
    setModelId,
    setSelectedSymbolId,
    setSelectedEntityId,
    setTraceMode,
    setTraceDirection,
    setTraceDepth,
    setDetailLevel,
    setFocusedLayer,
    setExportMode,
    setActionStatus,
    setSearchQuery,
    setSearchScope,
    resetArchitectureView,
    openEntityInView,
    openLinkedView,
    saveViewState,
    restoreViewState,
    startTraceForSelected,
  } = useArchitectureSession()
  const [collapsedOutlineLayers, setCollapsedOutlineLayers] = useState<string[]>([])
  const [exportExpanded, setExportExpanded] = useState(false)
  const panelTopRef = useRef<HTMLDivElement>(null)
  const didMountRef = useRef(false)
  const exportToggleRef = useRef<HTMLButtonElement>(null)
  const exportPreviewRef = useRef<HTMLPreElement>(null)
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
  const activeTraceSymbol = project.symbols[activeTraceSymbolId]
  const upstream = [...trace.upstreamEntityIds].map((id) => project.entities[id]).filter(Boolean)
  const downstream = [...trace.downstreamEntityIds].map((id) => project.entities[id]).filter(Boolean)
  const visibleSymbols = symbolList.filter((symbol) => !symbol.entityId || layerProjection.entityIds.has(symbol.entityId))
  const viewEntities = useMemo(() => projectedEntities(project, activeViewId), [activeViewId, project])
  const currentViewSelection = project.entities[selectedEntityId] || viewEntities[0]
  const currentRelations = currentViewSelection ? relatedRelations(project, currentViewSelection.id) : []
  const closureWarnings = useMemo(() => evidenceClosureWarnings(catTraceMultiViewProject), [])
  const searchProject = searchScope === "all" ? catTraceMultiViewProject : project
  const searchResults = useMemo(
    () => searchCanonicalEntities(searchProject, searchQuery, searchScope === "current" ? activeViewId : undefined).slice(0, 8),
    [activeViewId, searchProject, searchQuery, searchScope],
  )
  const hasSearchQuery = Boolean(searchQuery.trim())

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    if (document.activeElement === document.body) return
    panelTopRef.current?.scrollIntoView({ block: "start" })
  }, [activeViewId, selectedEntityId, selectedSymbolId])

  const openExportTools = useCallback(() => {
    setExportExpanded(true)
    setActionStatus("Export tools opened")
    window.requestAnimationFrame(() => {
      exportToggleRef.current?.scrollIntoView({ block: "center" })
      exportToggleRef.current?.focus()
    })
  }, [setActionStatus])

  useEffect(() => {
    window.addEventListener("asteria:open-export-tools", openExportTools)
    return () => window.removeEventListener("asteria:open-export-tools", openExportTools)
  }, [openExportTools])

  const switchModel = (next: CanonicalTraceProjectId) => {
    setModelId(next)
  }

  const switchResearchView = (viewId: MultiViewId, entityId?: string) => {
    setActiveViewId(viewId, entityId || defaultViewSelection[viewId])
  }

  const openSearchResult = (entity: StatisticalEntity) => {
    const targetView = viewForEntity(searchProject, entity.id, activeViewId)
    openEntityInView(targetView, entity.id, modelForEntity(entity.id))
  }

  return (
    <aside className="inspector architecture-reference-panel" data-testid="architecture-reference-panel">
      <div className="inspector-heading" ref={panelTopRef}>
        <div>
          <h2>Asteria 2.0</h2>
          <p>Explore TRACE and CAT-TRACE as readable model structure, method lineage, and evidence state.</p>
        </div>
      </div>

      <section className="panel-section architecture-context-helper" data-testid="project-view-model-helper">
        <div><strong>Project</strong><span>Current research workspace: CAT-TRACE.</span></div>
        <div><strong>View</strong><span>{viewLabel(activeViewId)} answers {activeViewId === multiViewIds.architecture ? "model structure" : activeViewId === multiViewIds.lineage ? "method provenance" : "evidence state"} questions.</span></div>
        <div><strong>Model</strong><span>{activeViewId === multiViewIds.architecture ? `Architecture variant: ${modelId === "original-trace" ? "Original TRACE" : "CAT-TRACE Frozen V2"}.` : "Model selection applies in Architecture."}</span></div>
      </section>

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
      <p className="architecture-view-help" data-testid="active-view-help">{viewHelp(activeViewId)}</p>

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
          {searchResults.map((entity) => {
            const targetView = viewForEntity(searchProject, entity.id, activeViewId)
            const symbol = symbolForEntity(searchProject, entity)
            return (
            <button key={entity.id} type="button" onClick={() => openSearchResult(entity)} data-testid={`search-result-${entity.id.split(":").pop() || entity.id}`}>
              <span>
                {symbol ? <RenderedMath latex={symbol.latex} fallback={entity.label} className="architecture-search-result-math" /> : null}
                <strong>{entity.label}</strong>
              </span>
              <small>{viewLabel(targetView)} / {entity.kind.replace(/_/g, " ")}</small>
            </button>
            )
          })}
        </div>
      ) : hasSearchQuery ? (
        <div className="architecture-search-empty" data-testid="architecture-search-empty">No results in {searchScope === "current" ? viewLabel(activeViewId) : "All graph"}.</div>
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

          <div className="architecture-detail-switch" role="tablist" aria-label="Architecture detail level" data-testid="architecture-detail-control">
            <button type="button" className={`segmented-button justify-center ${detailLevel === "overview" ? "segmented-button-active" : ""}`} style={selectedButtonStyle(detailLevel === "overview")} aria-selected={detailLevel === "overview"} data-asteria-selected={detailLevel === "overview" ? "true" : "false"} onClick={() => setDetailLevel("overview")} data-testid="detail-overview">
              Overview
            </button>
            <button type="button" className={`segmented-button justify-center ${detailLevel === "full" ? "segmented-button-active" : ""}`} style={selectedButtonStyle(detailLevel === "full")} aria-selected={detailLevel === "full"} data-asteria-selected={detailLevel === "full" ? "true" : "false"} onClick={() => setDetailLevel("full")} data-testid="detail-full-model">
              Full model
            </button>
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
                    traceEnabled && selectedSymbol && !isSelected && !isInTrace ? "architecture-symbol-node-dimmed" : ""
                  }`}
                  onClick={() => setSelectedSymbolId(symbol.id)}
                  title={symbol.meaning}
                  data-testid={`symbol-${symbol.id.split(":").pop() || symbol.id}`}
                >
                  <RenderedMath latex={symbol.latex} fallback={symbol.canonicalName} className="architecture-symbol-math" />
                  <small>{symbol.canonicalName}</small>
                </button>
              )
            })}
          </div>

          <div className="architecture-trace-controls">
            <button type="button" className={`toolbar-button ${traceEnabled ? "toolbar-button-active" : ""}`} onClick={startTraceForSelected} data-testid="enable-trace">
              <Play size={14} />
              {traceEnabled ? "Trace on" : "Show trace"}
            </button>
            <span className="badge">{traceEnabled ? `${traceMode} trace` : "Trace off"}</span>
            {traceEnabled ? <span className="badge" data-testid="upstream-count">Upstream {upstream.length}</span> : null}
            {traceEnabled ? <span className="badge" data-testid="downstream-count">Downstream {downstream.length}</span> : null}
            <span className="badge">{focusedLayer === "all" ? "All layers" : layerLabel(focusedLayer)}</span>
            {traceEnabled ? <span className="badge architecture-trace-legend">Upstream dashed / downstream solid</span> : null}
            <button type="button" className="toolbar-button" onClick={resetArchitectureView} data-testid="clear-architecture-selection">
              <RotateCcw size={14} />
              Clear
            </button>
          </div>

          <section className="panel-section">
            <div className="section-title">{inspectorTitle(selectedEntity, "Symbol")}</div>
            <div className="architecture-symbol-title" data-testid="symbol-inspector">
              <RenderedMath latex={latexText(selectedSymbol)} fallback={selectedSymbol?.canonicalName} testId="selected-symbol-math" />
              <strong>{selectedSymbol?.canonicalName}</strong>
            </div>
            <div className="architecture-inspector-priority">
              <div>
                <span>Meaning</span>
                <p>{selectedSymbol?.meaning}</p>
              </div>
              <div>
                <span>Why it matters</span>
                <p>{whyEntityMatters(project, selectedEntity, relatedRelations(project, selectedEntity?.id || ""))}</p>
              </div>
              <div>
                <span>Canonical definition</span>
                <p><RenderedFormulaText source={selectedEntity?.definition || selectedEntity?.description} fallback={selectedEntity?.label || "canonical definition"} testId="selected-definition-math" /></p>
              </div>
            </div>
            <div className="architecture-relation-list" data-testid="selected-relation-context" aria-label="Direct relations">
              <div className="section-title">Direct relations</div>
              {relatedRelations(project, selectedEntity?.id || "")
                .slice(0, 5)
                .map((relation) => {
                  const peer = relationPeer(project, relation, selectedEntity?.id || "")
                  return (
                    <button key={relation.id} type="button" className={`architecture-relation-row architecture-relation-${relationTone(relation.type)}`} onClick={() => peer?.symbolIds?.[0] && setSelectedSymbolId(peer.symbolIds[0])}>
                      <span>{relation.type.replace(/_/g, " ")}</span>
                      <strong>{relation.label || relation.type}</strong>
                      <small>{peer?.label || "missing peer"}</small>
                    </button>
                  )
                })}
            </div>
            {traceEnabled ? (
              <div className="architecture-trace-list" data-testid="trace-lists">
                <div>
                  <h3>Active trace upstream</h3>
                  {upstream.length ? upstream.map((entity) => <span key={entity.id}>{entity.label}</span>) : <span>None</span>}
                </div>
                <div>
                  <h3>Active trace downstream</h3>
                  {downstream.length ? downstream.map((entity) => <span key={entity.id}>{entity.label}</span>) : <span>None</span>}
                </div>
              </div>
            ) : (
              <div className="architecture-binding-note" data-testid="trace-lists">
                <GitBranch size={14} />
                Active trace is off. Selection only controls the inspector.
              </div>
            )}
            <details className="architecture-advanced-metadata">
              <summary>Advanced metadata</summary>
            <dl className="architecture-inspector-grid">
              <dt>Role</dt>
              <dd>{selectedSymbol?.role}</dd>
              <dt>Model</dt>
              <dd>{project.project.title}</dd>
              <dt>Layer</dt>
              <dd>{selectedSymbol?.layer}</dd>
              <dt>Status</dt>
              <dd>{readableStatus(selectedSymbol?.observedStatus)}</dd>
              <dt>Indices</dt>
              <dd>{selectedSymbol?.indices?.join(", ") || "none"}</dd>
              <dt>Dimension</dt>
              <dd>{selectedSymbol?.dimension || selectedSymbol?.domain || "not specified"}</dd>
              <dt>Constraints</dt>
              <dd>{selectedEntity?.constraints?.join("; ") || "none"}</dd>
              <dt>Variant note</dt>
              <dd>{selectedEntity?.variantNote || "canonical in this model scope"}</dd>
            </dl>
            </details>
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
            <div className="section-title">Semantic Diff</div>
            <div className="architecture-diff-list" data-testid="semantic-diff">
              {diffReport.items.map((item) => (
                <button key={item.id} type="button" className={`architecture-diff-row architecture-diff-${item.status}`}>
                  <span>{diffGroup(item.status)}</span>
                  <strong>{item.label}</strong>
                  <small><b>What changed:</b> {item.after || item.before || item.label}</small>
                  <small><b>Why it matters:</b> {diffWhy(item.status)}</small>
                </button>
              ))}
            </div>
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
            <div className="architecture-advanced-metadata architecture-export-disclosure">
              <button
                ref={exportToggleRef}
                type="button"
                className="architecture-disclosure-button"
                aria-expanded={exportExpanded}
                aria-controls="architecture-export-validation-region"
                onClick={() => setExportExpanded((current) => !current)}
                data-testid="advanced-export-validation"
              >
                <span>Advanced / Export & validation</span>
                <small>{exportExpanded ? "Hide export tools" : "Show export tools"}</small>
              </button>
              <div id="architecture-export-validation-region" className="architecture-export-region" role="region" aria-label="Advanced export and validation" hidden={!exportExpanded} data-testid="advanced-export-validation-region">
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
                <pre ref={exportPreviewRef} tabIndex={-1} className="architecture-export-preview" data-testid="architecture-export-preview">{exportText}</pre>
                <div className="architecture-warning-list">
                  {warnings.length ? warnings.slice(0, 4).map((warning, index) => <span key={`${warning.id}:${index}`}>{warning.message}</span>) : <span>No structural warnings.</span>}
                </div>
              </div>
            </div>
          </section>

          {traceEnabled ? (
          <section className="panel-section">
            <div className="section-title">Active Trace</div>
            <div className="architecture-breadcrumbs" aria-label="Trace breadcrumbs">
              <span>{activeTraceSymbol?.canonicalName || "selected symbol"}</span>
              {trace.breadcrumbs.slice(0, 10).map((item, index) => (
                <span key={`${item.entityId}:${index}`}>{project.entities[item.entityId]?.label || item.entityId}</span>
              ))}
            </div>
            <div className="architecture-binding-note">
              <GitBranch size={14} />
              Formula bindings use stable symbol IDs; display LaTeX can change without changing identity.
            </div>
          </section>
          ) : null}
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
        <div className="section-title">{inspectorTitle(selectedEntity, isEvidence ? "Claim" : "Method")}</div>
        {selectedEntity ? (
          <>
            <div className="architecture-symbol-title" data-testid={isEvidence ? "claim-inspector" : "method-inspector"}>
              <span>{selectedEntity.label}</span>
              <strong>{selectedEntity.role}</strong>
            </div>
            <div className="architecture-inspector-priority">
              <div>
                <span>Meaning</span>
                <p>{selectedEntity.description}</p>
              </div>
              <div>
                <span>Why it matters</span>
                <p>{whyEntityMatters(catTraceMultiViewProject, selectedEntity, relations)}</p>
              </div>
            </div>
            <dl className="architecture-inspector-grid">
              <dt>Status</dt>
              <dd data-testid="researcher-status">{researcherStatus(selectedEntity, relations)}</dd>
              <dt>Definition</dt>
              <dd><RenderedFormulaText source={selectedEntity.definition || "contextual graph entity"} fallback={selectedEntity.label} /></dd>
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
                <strong>{warning.label}</strong>: {titleCaseStatus(warning.status)} · {warning.supportCount} supporting item{warning.supportCount === 1 ? "" : "s"} · {warning.gapCount} open gap{warning.gapCount === 1 ? "" : "s"}. What is missing: pending theorem or real-data closure evidence where listed. What would close this: a linked proof, dataset result, or implementation result in the evidence graph.
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}
