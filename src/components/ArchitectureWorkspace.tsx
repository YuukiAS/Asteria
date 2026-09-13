import { GitBranch, Layers3, Maximize2, Minus, Move, Network, Plus, ShieldCheck } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react"
import { canonicalTraceProjects } from "../architecture/fixtures/canonicalTraceFixtures"
import { multiViewIds } from "../architecture/fixtures/multiViewTraceProject"
import { layoutProvenanceFlow } from "../architecture/graphPresentation"
import { diffOriginalTraceToCatTrace, type SemanticDiffStatus } from "../architecture/semanticDiff"
import { useArchitectureSession } from "../architecture/session"
import type { ArchitectureProjectV2, RelationType, StatisticalEntity, StatisticalSymbol } from "../architecture/types"
import { buildProjectionLayout, type ProjectionLayoutEdge, type ProjectionLayoutNode } from "../architecture/viewProjection"
import { RenderedMath } from "./RenderedMath"

const laneLabels = ["Observation", "Measurement", "Latent", "Parameterization", "Inference", "Prediction"]

const diffEntityMap: Record<string, { status: SemanticDiffStatus; label: string }> = {
  "entity:cat-trace-frozen-v2:mathcal_K": { status: "added", label: "Finite catalogue" },
  "entity:cat-trace-frozen-v2:K_n": { status: "added", label: "Observed catalogue subset" },
  "entity:cat-trace-frozen-v2:c_f": { status: "added", label: "Deterministic matching" },
  "entity:cat-trace-frozen-v2:mathcal_G": { status: "added", label: "Biological groups" },
  "entity:cat-trace-frozen-v2:a_g": { status: "added", label: "Group deviation" },
  "entity:cat-trace-frozen-v2:p_g": { status: "added", label: "Grouped truncation" },
  "entity:cat-trace-frozen-v2:p_g_star": { status: "added", label: "Observed open-tail count" },
  "entity:cat-trace-frozen-v2:zero_slots": { status: "added", label: "Zero-slot bookkeeping" },
  "entity:cat-trace-frozen-v2:gamma0": { status: "added", label: "Open-tail intensity" },
  "entity:cat-trace-frozen-v2:pi_g": { status: "added", label: "Composition weight" },
  "entity:cat-trace-frozen-v2:gamma_g": { status: "added", label: "Derived group intensity" },
  "entity:cat-trace-frozen-v2:betaU_gh": { status: "modified_definition", label: "Species response hierarchy" },
  "entity:cat-trace-frozen-v2:richness_targets": { status: "modified_target", label: "Discovery target split" },
  "entity:cat-trace-frozen-v2:nu": { status: "preserved_invariant", label: "Marginal response interpretation" },
  "entity:cat-trace-frozen-v2:alphaU_gh": { status: "preserved_invariant", label: "TRACE tail calibration" },
  "entity:cat-trace-frozen-v2:Sigma_W": { status: "preserved_invariant", label: "Unit residual margin" },
}

function relationTone(type: RelationType) {
  if (["pending", "limited_by", "contradicts_or_challenges", "contradicts"].includes(type)) return "gap"
  if (["theoretically_supports", "empirically_tests", "validates_implementation", "stress_tests", "supports", "tests", "validated_on"].includes(type)) return "support"
  if (["extends", "preserves", "borrows_interpretation_from", "computationally_inspired_by", "uses_methodological_component_from"].includes(type)) return "lineage"
  return "neutral"
}

function entitySymbol(project: ArchitectureProjectV2, entity: StatisticalEntity) {
  const symbol = entity.symbolIds?.map((id) => project.symbols[id]).find(Boolean) as StatisticalSymbol | undefined
  return symbol
}

function safeDomId(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, "-")
}

function selectedButtonStyle(selected: boolean): CSSProperties {
  return {
    backgroundColor: selected ? "rgb(var(--color-accent-soft))" : "transparent",
    color: selected ? "rgb(var(--color-accent))" : "rgb(var(--color-secondary))",
  }
}

function compactRelationLabel(type: RelationType, label?: string) {
  const byType: Partial<Record<RelationType, string>> = {
    borrows_interpretation_from: "Borrows",
    computationally_inspired_by: "Inspired by",
    uses_methodological_component_from: "Uses",
    validates_implementation: "Validates",
    theoretically_supports: "Supports",
    empirically_tests: "Tests",
    stress_tests: "Stress",
    limited_by: "Limited by",
    preserves: "Preserves",
    extends: "Extends",
    pending: "Pending",
    parameterized_by: "Param",
    derived_from: "Derived",
    depends_on: "Depends",
    generates: "Generates",
    targets: "Targets",
    estimated_by: "Estimated",
    conditions_on: "Conditions",
  }
  const fallback = label || byType[type] || type.replace(/_/g, " ")
  const conciseByPhrase: Record<string, string> = {
    "empty/unmatched feature enters open tail": "Open tail",
    "matched catalogue feature enters finite set": "Catalogue",
    "observed raw features are matched": "Matched",
    "indexes open-tail grouping": "Groups",
    "environmental design enters latent score": "Covariates",
    "open-tail slope enters latent score": "Slope",
    "tail intercept enters latent score": "Intercept",
    "latent open-tail score generates open-tail occurrence": "Probit",
    "open-tail occurrence informs richness target": "Target",
    "derived grouped open-tail intensity": "Derived",
    "fixed truncation sets anonymous slots": "Truncation",
    "residual margin normalized": "Residual",
    "posterior targets richness": "Inference",
    "extends open-tail calibration": "Extends",
    "preserves marginal probit tail semantics": "Preserves",
    "borrows ecological hierarchy interpretation": "Borrows",
    "computationally inspired by scalable probit work": "Inspired by",
    "uses factor shrinkage idea": "Uses",
    "theory/proof support": "Supports",
    "fixture validates symbol truth": "Validates",
    "stress-tests zero-slot projection": "Stress",
    "real-data result pending": "Pending",
    "dataset line pending result": "Pending",
    "future theorem pending": "Pending",
  }
  return conciseByPhrase[fallback] || byType[type] || fallback.split(/\s+/).slice(0, 3).join(" ")
}

function architectureAllowsInlineLabel(type: RelationType) {
  return ["generates", "targets"].includes(type)
}

const lineageCards = [
  { id: "entity:lineage:hmsc", label: "HMSC framework", copy: "Ecological hierarchy", chips: ["Ecological hierarchy"], relationIds: ["relation:lineage:hmsc-cat"], relationType: "borrows_interpretation_from" },
  { id: "entity:lineage:trace", label: "TRACE / Infinite JSDM", copy: "Open-tail foundation", chips: ["Extends", "Preserves"], relationIds: ["relation:lineage:trace-cat", "relation:lineage:trace-preserve"], relationType: "extends preserves" },
  { id: "entity:lineage:bigmvp", label: "bigMVP", copy: "Scalable probit computation", chips: ["Scalable probit"], relationIds: ["relation:lineage:bigmvp-cat"], relationType: "computationally_inspired_by" },
  { id: "entity:lineage:mgp", label: "Sparse Bayesian infinite factor / MGP", copy: "Factor shrinkage", chips: ["Factor shrinkage"], relationIds: ["relation:lineage:mgp-cat"], relationType: "uses_methodological_component_from" },
] as const

function LineagePresentation({
  project,
  selectedEntityId,
  onSelectEntity,
}: {
  project: ArchitectureProjectV2
  selectedEntityId: string
  onSelectEntity: (entityId: string) => void
}) {
  const targetId = "entity:lineage:cat-trace"
  const provenanceLayout = useMemo(() => layoutProvenanceFlow(lineageCards), [])
  const targetRect = provenanceLayout.target
  return (
    <div
      className="lineage-presentation"
      data-testid="lineage-presentation"
      style={{ "--provenance-width": `${provenanceLayout.width}px`, "--provenance-height": `${provenanceLayout.height}px` } as CSSProperties}
    >
      <svg className="lineage-presentation-connectors" viewBox={`0 0 ${provenanceLayout.width} ${provenanceLayout.height}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <marker id="lineage-presentation-arrow" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" refX="8.2" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" />
          </marker>
        </defs>
        {provenanceLayout.sources.map((card) => (
          <path
            key={card.id}
            className={`lineage-presentation-connector ${card.id === selectedEntityId || targetId === selectedEntityId ? "lineage-presentation-connector-active" : ""}`}
            d={card.path}
            markerEnd="url(#lineage-presentation-arrow)"
            data-lineage-connector={card.id}
            data-source-id={card.id}
            data-target-id={targetId}
            data-relation-ids={card.relationIds.join(" ")}
            data-relation-type={card.relationType}
            data-source-x={card.sourcePort.x.toFixed(2)}
            data-source-y={card.sourcePort.y.toFixed(2)}
            data-target-x={card.targetPort.x.toFixed(2)}
            data-target-y={card.targetPort.y.toFixed(2)}
          />
        ))}
      </svg>
      <div className="lineage-presentation-sources">
        {provenanceLayout.sources.map((card) => (
          <button
            key={card.id}
            type="button"
            className={`lineage-presentation-card lineage-presentation-source-card ${selectedEntityId === card.id ? "lineage-presentation-card-selected" : ""}`}
            style={{ left: `${card.rect.x}px`, top: `${card.rect.y}px`, width: `${card.rect.width}px`, minHeight: `${card.rect.height}px` }}
            onClick={() => onSelectEntity(card.id)}
            data-testid={`lineage-card-${safeDomId(card.id)}`}
            data-entity-id={card.id}
            data-lineage-card="source"
          >
            <strong>{card.label}</strong>
            <span>{card.copy}</span>
          </button>
        ))}
      </div>
      <div className="lineage-presentation-chip-layer" aria-label="Lineage relations">
        {provenanceLayout.sources.flatMap((card) =>
          card.chipsLayout.map((chip) => (
            <span key={`${card.id}:${chip.label}`} className="lineage-relation-chip" style={{ left: `${chip.x}px`, top: `${chip.y}px` }} data-lineage-chip="true" data-source-id={card.id}>
              {chip.label}
            </span>
          )),
        )}
      </div>
      <button
        type="button"
        className={`lineage-presentation-card lineage-presentation-target-card ${selectedEntityId === targetId ? "lineage-presentation-card-selected" : ""}`}
        style={{ left: `${targetRect.x}px`, top: `${targetRect.y}px`, width: `${targetRect.width}px`, minHeight: `${targetRect.height}px` }}
        onClick={() => onSelectEntity(targetId)}
        data-testid="lineage-target-card"
        data-entity-id={targetId}
        data-lineage-card="target"
      >
        <strong>{project.entities[targetId]?.label || "CAT-TRACE Frozen V2"}</strong>
        <span>Catalogue-aware extension</span>
      </button>
      <div className="lineage-presentation-metadata" aria-hidden="true">
        {lineageCards.flatMap((card) =>
          card.relationIds.map((relationId) => {
            const relation = project.relations[relationId]
            return <span key={relationId} data-relation-id={relationId} data-relation-type={relation?.type || card.relationType} data-source-id={card.id} data-target-id={targetId} />
          }),
        )}
      </div>
    </div>
  )
}

export function ArchitectureWorkspace() {
  const session = useArchitectureSession()
  const { activeViewId, modelId, project, selectedEntityId, selectedSymbolId, trace, traceEnabled, traceMode, traceDirection, focusedLayer, detailLevel, setActiveViewId, setSelectedEntityId, setSelectedSymbolId } = session
  const [readingZoom, setReadingZoom] = useState(1)
  const [readingPan, setReadingPan] = useState({ x: 0, y: 0 })
  const [panMode, setPanMode] = useState(false)
  const panStartRef = useRef<{ pointerId: number; startX: number; startY: number; panX: number; panY: number } | null>(null)
  const layout = useMemo(() => buildProjectionLayout(project, activeViewId, { detailLevel, selectedEntityId, traceEntityIds: traceEnabled ? trace.entityIds : undefined }), [activeViewId, detailLevel, project, selectedEntityId, trace.entityIds, traceEnabled])
  const diff = useMemo(() => diffOriginalTraceToCatTrace(canonicalTraceProjects["original-trace"], canonicalTraceProjects["cat-trace-frozen-v2"]), [])
  const isArchitecture = activeViewId === multiViewIds.architecture
  const isLineage = activeViewId === multiViewIds.lineage
  const canUseReadingControls = isArchitecture && detailLevel === "full"
  const appliedReadingZoom = canUseReadingControls ? readingZoom : 1
  const appliedReadingPan = canUseReadingControls ? readingPan : { x: 0, y: 0 }
  const title = isArchitecture ? `${project.project.title} - Architecture` : isLineage ? "CAT-TRACE - Lineage" : "CAT-TRACE - Evidence"
  const subtitle = isArchitecture
    ? modelId === "original-trace"
      ? "Read Original TRACE as rendered statistical symbols, assumptions, and directed dependencies."
      : "Read CAT-TRACE Frozen V2 as finite-catalogue, open-tail, lineage, and evidence-backed model structure."
    : isLineage
      ? "Shows which methods CAT-TRACE extends, preserves, borrows from, or uses as implementation inspiration."
      : "Shows which claims are supported, pending, or limited before real-data closure."

  const traceRoleForEdge = (edge: ProjectionLayoutEdge) => {
    if (!traceEnabled || !trace.relationIds.has(edge.relation.id)) return "none"
    if (trace.upstreamRelationIds.has(edge.relation.id)) return "upstream"
    if (trace.downstreamRelationIds.has(edge.relation.id)) return "downstream"
    return "trace"
  }

  const selectNode = (node: ProjectionLayoutNode) => {
    setSelectedEntityId(node.entityId)
    const symbolId = node.projection.symbolIds?.find((id) => project.symbols[id]) || project.entities[node.entityId]?.symbolIds?.find((id) => project.symbols[id])
    if (symbolId) setSelectedSymbolId(symbolId)
  }

  const fitReadingView = useCallback(() => {
    setReadingZoom(1)
    setReadingPan({ x: 0, y: 0 })
    setPanMode(false)
  }, [])

  useEffect(() => {
    fitReadingView()
  }, [activeViewId, detailLevel, fitReadingView, modelId])

  const zoomReadingView = useCallback((direction: "in" | "out") => {
    setReadingZoom((current) => {
      const next = direction === "in" ? current + 0.18 : current - 0.18
      return Math.min(1.9, Math.max(0.82, Number(next.toFixed(2))))
    })
  }, [])

  const startCanvasPan = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!canUseReadingControls || !panMode) return
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      panStartRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, panX: readingPan.x, panY: readingPan.y }
    },
    [canUseReadingControls, panMode, readingPan.x, readingPan.y],
  )

  const moveCanvasPan = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const start = panStartRef.current
    if (!start || start.pointerId !== event.pointerId) return
    setReadingPan({ x: start.panX + event.clientX - start.startX, y: start.panY + event.clientY - start.startY })
  }, [])

  const stopCanvasPan = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (panStartRef.current?.pointerId === event.pointerId) panStartRef.current = null
  }, [])

  return (
    <main className="architecture-workspace" data-testid="architecture-workspace">
      <nav className="architecture-workspace-rail" aria-label="Asteria 2.0 views">
        <span className="architecture-workspace-rail-title">Views</span>
        <button type="button" className={isArchitecture ? "architecture-workspace-rail-active" : ""} style={selectedButtonStyle(isArchitecture)} aria-selected={isArchitecture} data-asteria-selected={isArchitecture ? "true" : "false"} onClick={() => setActiveViewId(multiViewIds.architecture)} data-testid="workspace-view-architecture">
          <Network size={15} />
          Architecture
        </button>
        <button type="button" className={isLineage ? "architecture-workspace-rail-active" : ""} style={selectedButtonStyle(isLineage)} aria-selected={isLineage} data-asteria-selected={isLineage ? "true" : "false"} onClick={() => setActiveViewId(multiViewIds.lineage)} data-testid="workspace-view-lineage">
          <GitBranch size={15} />
          Lineage
        </button>
        <button type="button" className={activeViewId === multiViewIds.evidence ? "architecture-workspace-rail-active" : ""} style={selectedButtonStyle(activeViewId === multiViewIds.evidence)} aria-selected={activeViewId === multiViewIds.evidence} data-asteria-selected={activeViewId === multiViewIds.evidence ? "true" : "false"} onClick={() => setActiveViewId(multiViewIds.evidence)} data-testid="workspace-view-evidence">
          <ShieldCheck size={15} />
          Evidence
        </button>
      </nav>

      <section id="asteria-canvas" className="architecture-workspace-stage" tabIndex={-1} aria-label="Asteria semantic projection" data-testid="architecture-workspace-stage" data-active-view={activeViewId} data-active-model={modelId} data-detail-level={isArchitecture ? detailLevel : "research"} data-trace-enabled={traceEnabled ? "true" : "false"}>
        <header className="architecture-workspace-header">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="architecture-workspace-status">
            <span data-testid="central-model-status">{project.project.title}</span>
            <span>{isArchitecture ? "Architecture map" : isLineage ? "Method lineage" : "Evidence status"}</span>
            {isArchitecture ? <span data-testid="central-detail-status">{detailLevel === "overview" ? "Overview" : "Full model"}</span> : null}
          </div>
        </header>

        {isArchitecture ? (
          <div className="architecture-lane-headings" aria-hidden="true">
            {laneLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        ) : null}

        {canUseReadingControls ? (
          <div className="architecture-reading-controls" aria-label="Full model reading controls" data-testid="full-model-reading-controls">
            <button type="button" className="toolbar-button" onClick={() => zoomReadingView("out")} aria-label="Zoom out full model" title="Zoom out">
              <Minus size={14} />
              <span>Zoom out</span>
            </button>
            <button type="button" className="toolbar-button" onClick={fitReadingView} aria-label="Fit full model" title="Fit">
              <Maximize2 size={14} />
              <span>Fit</span>
            </button>
            <button type="button" className="toolbar-button" onClick={() => zoomReadingView("in")} aria-label="Zoom in full model" title="Zoom in">
              <Plus size={14} />
              <span>Zoom in</span>
            </button>
            <button type="button" className={`toolbar-button ${panMode ? "toolbar-button-active" : ""}`} onClick={() => setPanMode((current) => !current)} aria-label="Pan full model with pointer drag" aria-pressed={panMode} title="Pan with pointer drag" data-testid="full-model-pan-mode">
              <Move size={14} />
              <span>Pan</span>
            </button>
          </div>
        ) : null}

        <div
          className={`architecture-workspace-canvas ${!isArchitecture ? "architecture-workspace-research-canvas" : ""} ${canUseReadingControls && panMode ? "architecture-workspace-canvas-pannable" : ""}`}
          data-testid={isArchitecture ? "architecture-projection-canvas" : isLineage ? "central-lineage-canvas" : "central-evidence-canvas"}
          data-projected-entity-count={layout.nodes.length}
          data-projected-relation-count={layout.edges.length}
          data-reading-zoom={appliedReadingZoom.toFixed(2)}
          data-reading-pan-x={Math.round(appliedReadingPan.x)}
          data-reading-pan-y={Math.round(appliedReadingPan.y)}
          onPointerDown={startCanvasPan}
          onPointerMove={moveCanvasPan}
          onPointerUp={stopCanvasPan}
          onPointerCancel={stopCanvasPan}
        >
          {isLineage ? (
            <LineagePresentation project={project} selectedEntityId={selectedEntityId} onSelectEntity={setSelectedEntityId} />
          ) : (
            <div
              className="architecture-projection-layer"
              style={{
                "--projection-pan-x": `${layout.viewport.x * 0.04 + appliedReadingPan.x}px`,
                "--projection-pan-y": `${layout.viewport.y * 0.04 + appliedReadingPan.y}px`,
                "--projection-zoom": layout.viewport.zoom * appliedReadingZoom,
                "--projection-width": `${layout.canvas.width}px`,
                "--projection-height": `${layout.canvas.height}px`,
              } as CSSProperties}
              data-viewport-x={layout.viewport.x}
              data-viewport-y={layout.viewport.y}
              data-viewport-zoom={layout.viewport.zoom}
              data-reading-zoom={appliedReadingZoom.toFixed(2)}
            >
              <svg className="architecture-map-edges" viewBox={`0 0 ${layout.canvas.width} ${layout.canvas.height}`} preserveAspectRatio="none" role="img" aria-label="Projected semantic relations">
                <defs>
                  <marker id="architecture-edge-arrow" markerUnits="userSpaceOnUse" markerWidth="0.95" markerHeight="0.95" refX="0.86" refY="0.475" orient="auto">
                    <path d="M0,0 L0.95,0.475 L0,0.95 z" />
                  </marker>
                </defs>
                {layout.edges.map((edge) => (
                  <ProjectedEdge key={edge.relation.id} edge={edge} activeViewId={activeViewId} selectedEntityId={selectedEntityId} isTraceEdge={isArchitecture && traceEnabled && trace.relationIds.has(edge.relation.id)} traceRole={isArchitecture ? traceRoleForEdge(edge) : "none"} hasTraceSelection={isArchitecture && traceEnabled} />
                ))}
              </svg>

              {layout.nodes.map((node) => {
                const entity = project.entities[node.entityId]
                const isSelected = node.entityId === selectedEntityId || entity.symbolIds?.includes(selectedSymbolId)
                const isTrace = isArchitecture && traceEnabled && trace.entityIds.has(node.entityId)
                const isUpstream = isArchitecture && traceEnabled && trace.upstreamEntityIds.has(node.entityId)
                const isDownstream = isArchitecture && traceEnabled && trace.downstreamEntityIds.has(node.entityId)
                const diffStatus = modelId === "cat-trace-frozen-v2" && isArchitecture ? diffEntityMap[node.entityId]?.status : undefined
                const symbol = entitySymbol(project, entity)
                return (
                  <button
                    key={node.projection.id}
                    type="button"
                    className={`architecture-map-node architecture-map-node-${entity.kind} ${isArchitecture && detailLevel === "full" ? "architecture-map-node-full" : ""} ${isArchitecture && modelId === "original-trace" ? "architecture-map-node-original" : ""} ${isSelected ? "architecture-map-node-selected" : ""} ${isUpstream ? "architecture-map-node-upstream" : ""} ${isDownstream ? "architecture-map-node-downstream" : ""} ${traceEnabled && selectedSymbolId && isArchitecture && !isSelected && !isTrace ? "architecture-map-node-muted" : ""} ${diffStatus ? `architecture-map-node-diff-${diffStatus}` : ""}`}
                    style={{ left: `${node.x}px`, top: `${node.y}px`, width: node.width, minHeight: node.height }}
                    onClick={() => selectNode(node)}
                    data-testid={`projection-node-${safeDomId(node.entityId)}`}
                    data-entity-id={node.entityId}
                    data-symbol-id={entity.symbolIds?.[0] || ""}
                    data-projection-id={node.projection.id}
                    data-projection-x={node.projection.position.x}
                    data-projection-y={node.projection.position.y}
                    data-left-percent={node.leftPercent.toFixed(2)}
                    data-top-percent={node.topPercent.toFixed(2)}
                    data-node-x={node.x.toFixed(2)}
                    data-node-y={node.y.toFixed(2)}
                    data-node-width={node.width.toFixed(2)}
                    data-node-height={node.height.toFixed(2)}
                    data-node-lane={node.lane ?? ""}
                    data-diff-status={diffStatus || "none"}
                    title={isArchitecture ? `${symbol?.latex || entity.label} - ${entity.label}` : entity.label}
                  >
                    <span className="architecture-map-node-primary" data-node-primary="true">{isArchitecture && symbol ? <RenderedMath latex={symbol.latex} fallback={entity.label} className="architecture-node-math" /> : entity.label}</span>
                    <small>{isArchitecture ? entity.label : entity.role}</small>
                    {diffStatus ? <em>{diffStatus.replace(/_/g, " ")}</em> : null}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <footer className="architecture-workspace-footer">
          <div>
            <Layers3 size={14} />
            {isArchitecture ? `${detailLevel === "overview" ? "Overview" : "Full model"} / ${traceEnabled ? `${traceMode} ${traceDirection} trace` : "trace off"} / ${focusedLayer === "all" ? "all layers" : focusedLayer}` : isLineage ? "Extends / preserves / borrows / computational inspiration" : "Theory / implementation / datasets / limitation / pending"}
          </div>
          <div>{isArchitecture ? `${layout.nodes.length} visible nodes / ${diff.items.length} model changes` : isLineage ? "Lineage relation legend" : "Evidence relation legend"}</div>
        </footer>
      </section>
    </main>
  )
}

function ProjectedEdge({
  edge,
  activeViewId,
  selectedEntityId,
  isTraceEdge,
  traceRole,
  hasTraceSelection,
}: {
  edge: ProjectionLayoutEdge
  activeViewId: string
  selectedEntityId: string
  isTraceEdge: boolean
  traceRole: "upstream" | "downstream" | "trace" | "none"
  hasTraceSelection: boolean
}) {
  const isConnectedToSelection = edge.relation.sourceId === selectedEntityId || edge.relation.targetId === selectedEntityId
  const isDimmed = activeViewId === multiViewIds.architecture ? hasTraceSelection && !isTraceEdge : selectedEntityId && !isConnectedToSelection
  const showLabel = activeViewId === multiViewIds.architecture ? architectureAllowsInlineLabel(edge.relation.type) && (isTraceEdge || (hasTraceSelection && isConnectedToSelection)) : activeViewId === multiViewIds.lineage
  const label = compactRelationLabel(edge.relation.type, edge.relation.label)
  return (
    <g
      className={`architecture-map-edge architecture-map-edge-${relationTone(edge.relation.type)} ${showLabel ? "architecture-map-edge-labeled" : ""} ${isTraceEdge ? "architecture-map-edge-trace" : ""} ${isConnectedToSelection ? "architecture-map-edge-selected" : ""} ${isDimmed ? "architecture-map-edge-muted" : ""}`}
      data-testid={`semantic-edge-${safeDomId(edge.relation.id)}`}
      data-relation-id={edge.relation.id}
      data-relation-type={edge.relation.type}
      data-relation-label={label}
      data-source-id={edge.relation.sourceId}
      data-target-id={edge.relation.targetId}
      data-trace-active={isTraceEdge ? "true" : "false"}
      data-trace-role={traceRole}
      data-edge-label-visible={showLabel ? "true" : "false"}
      data-source-port-x={edge.sourceX.toFixed(2)}
      data-source-port-y={edge.sourceY.toFixed(2)}
      data-target-port-x={edge.targetX.toFixed(2)}
      data-target-port-y={edge.targetY.toFixed(2)}
    >
      <path d={edge.path} markerEnd="url(#architecture-edge-arrow)" />
      {showLabel ? <text x={edge.labelX} y={edge.labelY} data-edge-label="true">{label}</text> : null}
    </g>
  )
}
