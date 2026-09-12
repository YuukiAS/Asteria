import { GitBranch, Layers3, Network, ShieldCheck } from "lucide-react"
import { useMemo, type CSSProperties } from "react"
import { canonicalTraceProjects } from "../architecture/fixtures/canonicalTraceFixtures"
import { multiViewIds } from "../architecture/fixtures/multiViewTraceProject"
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

export function ArchitectureWorkspace() {
  const session = useArchitectureSession()
  const { activeViewId, modelId, project, selectedEntityId, selectedSymbolId, trace, traceEnabled, traceMode, traceDirection, focusedLayer, detailLevel, setActiveViewId, setSelectedEntityId, setSelectedSymbolId } = session
  const layout = useMemo(() => buildProjectionLayout(project, activeViewId, { detailLevel, selectedEntityId, traceEntityIds: traceEnabled ? trace.entityIds : undefined }), [activeViewId, detailLevel, project, selectedEntityId, trace.entityIds, traceEnabled])
  const diff = useMemo(() => diffOriginalTraceToCatTrace(canonicalTraceProjects["original-trace"], canonicalTraceProjects["cat-trace-frozen-v2"]), [])
  const isArchitecture = activeViewId === multiViewIds.architecture
  const isLineage = activeViewId === multiViewIds.lineage
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

        <div className={`architecture-workspace-canvas ${!isArchitecture ? "architecture-workspace-research-canvas" : ""}`} data-testid={isArchitecture ? "architecture-projection-canvas" : isLineage ? "central-lineage-canvas" : "central-evidence-canvas"} data-projected-entity-count={layout.nodes.length} data-projected-relation-count={layout.edges.length}>
          <div
            className="architecture-projection-layer"
            style={{
              "--projection-pan-x": `${layout.viewport.x * 0.04}px`,
              "--projection-pan-y": `${layout.viewport.y * 0.04}px`,
              "--projection-zoom": layout.viewport.zoom,
            } as CSSProperties}
            data-viewport-x={layout.viewport.x}
            data-viewport-y={layout.viewport.y}
            data-viewport-zoom={layout.viewport.zoom}
          >
            <svg className="architecture-map-edges" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Projected semantic relations">
              <defs>
                <marker id="architecture-edge-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                  <path d="M0,0 L7,3.5 L0,7 z" />
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
                  className={`architecture-map-node architecture-map-node-${entity.kind} ${isSelected ? "architecture-map-node-selected" : ""} ${isUpstream ? "architecture-map-node-upstream" : ""} ${isDownstream ? "architecture-map-node-downstream" : ""} ${traceEnabled && selectedSymbolId && isArchitecture && !isSelected && !isTrace ? "architecture-map-node-muted" : ""} ${diffStatus ? `architecture-map-node-diff-${diffStatus}` : ""}`}
                  style={{ left: `${node.leftPercent}%`, top: `${node.topPercent}%`, width: node.width, minHeight: node.height }}
                  onClick={() => selectNode(node)}
                  data-testid={`projection-node-${safeDomId(node.entityId)}`}
                  data-entity-id={node.entityId}
                  data-symbol-id={entity.symbolIds?.[0] || ""}
                  data-projection-id={node.projection.id}
                  data-projection-x={node.projection.position.x}
                  data-projection-y={node.projection.position.y}
                  data-left-percent={node.leftPercent.toFixed(2)}
                  data-top-percent={node.topPercent.toFixed(2)}
                  data-diff-status={diffStatus || "none"}
                  title={isArchitecture ? `${symbol?.latex || entity.label} - ${entity.label}` : entity.label}
                >
                  {isArchitecture && symbol ? <RenderedMath latex={symbol.latex} fallback={entity.label} className="architecture-node-math" /> : <span>{entity.label}</span>}
                  <small>{isArchitecture ? entity.label : entity.role}</small>
                  {diffStatus ? <em>{diffStatus.replace(/_/g, " ")}</em> : null}
                </button>
              )
            })}
          </div>
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
  return (
    <g
      className={`architecture-map-edge architecture-map-edge-${relationTone(edge.relation.type)} ${isTraceEdge ? "architecture-map-edge-trace" : ""} ${isConnectedToSelection ? "architecture-map-edge-selected" : ""} ${isDimmed ? "architecture-map-edge-muted" : ""}`}
      data-testid={`semantic-edge-${safeDomId(edge.relation.id)}`}
      data-relation-id={edge.relation.id}
      data-relation-type={edge.relation.type}
      data-source-id={edge.relation.sourceId}
      data-target-id={edge.relation.targetId}
      data-trace-active={isTraceEdge ? "true" : "false"}
      data-trace-role={traceRole}
    >
      <path d={edge.path} markerEnd="url(#architecture-edge-arrow)" />
      <text x={edge.labelX} y={edge.labelY}>{edge.relation.type.replace(/_/g, " ")}</text>
    </g>
  )
}
