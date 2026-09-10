import { GitBranch, Layers3, Network, ShieldCheck } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { catTraceFrozenV2Project, originalTraceProject } from "../architecture/fixtures/canonicalTraceFixtures"
import { catTraceMultiViewProject, multiViewIds, projectedEntities, type MultiViewId } from "../architecture/fixtures/multiViewTraceProject"
import { diffOriginalTraceToCatTrace } from "../architecture/semanticDiff"
import { traceForSymbol } from "../architecture/trace"
import type { StatisticalEntity } from "../architecture/types"

const stageSymbols = [
  { id: "symbol:cat-trace-frozen-v2:Y_raw", display: "Y_raw", x: 8, y: 18 },
  { id: "symbol:cat-trace-frozen-v2:c_f", display: "c(f)", x: 22, y: 30 },
  { id: "symbol:cat-trace-frozen-v2:yU_igh", display: "y^U_igh", x: 34, y: 45 },
  { id: "symbol:cat-trace-frozen-v2:zU_igh", display: "z^U_igh", x: 47, y: 38 },
  { id: "symbol:cat-trace-frozen-v2:nu", display: "nu", x: 56, y: 21 },
  { id: "symbol:cat-trace-frozen-v2:a_g", display: "a_g", x: 67, y: 21 },
  { id: "symbol:cat-trace-frozen-v2:gamma_g", display: "gamma_g", x: 62, y: 37 },
  { id: "symbol:cat-trace-frozen-v2:betaU_gh", display: "beta^U_gh", x: 62, y: 54 },
  { id: "symbol:cat-trace-frozen-v2:p_g", display: "p_g", x: 75, y: 38 },
  { id: "symbol:cat-trace-frozen-v2:Sigma_W", display: "Sigma_W", x: 61, y: 72 },
  { id: "symbol:cat-trace-frozen-v2:posterior_inference", display: "I_CAT", x: 82, y: 55 },
  { id: "symbol:cat-trace-frozen-v2:richness_targets", display: "R_g, R_0", x: 89, y: 72 },
]

const laneLabels = ["Observation", "Measurement", "Latent", "Parameterization", "Inference", "Prediction"]

const methodPositions: Record<string, { x: number; y: number }> = {
  "entity:lineage:hmsc": { x: 22, y: 24 },
  "entity:lineage:trace": { x: 22, y: 43 },
  "entity:lineage:bigmvp": { x: 22, y: 64 },
  "entity:lineage:mgp": { x: 24, y: 82 },
  "entity:lineage:cat-trace": { x: 61, y: 48 },
}

const evidencePositions: Record<string, { x: number; y: number }> = {
  "entity:evidence:proof:trace-reference": { x: 43, y: 24 },
  "entity:evidence:claim:tail-calibration": { x: 52, y: 39 },
  "entity:evidence:claim:open-tail-response": { x: 52, y: 55 },
  "entity:evidence:claim:zero-slots": { x: 44, y: 76 },
  "entity:evidence:implementation:fixtures": { x: 25, y: 77 },
  "entity:evidence:stress:g05": { x: 63, y: 77 },
  "entity:evidence:data:finland": { x: 80, y: 36 },
  "entity:evidence:data:malagasy": { x: 25, y: 55 },
  "entity:evidence:data:swa-plants": { x: 80, y: 87 },
  "entity:evidence:limitation:real-data": { x: 80, y: 50 },
  "entity:evidence:claim:marked-discovery": { x: 80, y: 68 },
}

export function ArchitectureWorkspace() {
  const [activeViewId, setActiveViewId] = useState<MultiViewId>(multiViewIds.architecture)
  const [selectedSymbolId, setSelectedSymbolId] = useState("symbol:cat-trace-frozen-v2:betaU_gh")
  const [selectedEntityId, setSelectedEntityId] = useState("entity:lineage:cat-trace")
  const project = catTraceFrozenV2Project
  const trace = useMemo(() => traceForSymbol(project, selectedSymbolId, { mode: "recursive", direction: "both", maxDepth: 3 }), [project, selectedSymbolId])
  const diff = useMemo(() => diffOriginalTraceToCatTrace(originalTraceProject, catTraceFrozenV2Project), [])
  const isArchitecture = activeViewId === multiViewIds.architecture
  const isLineage = activeViewId === multiViewIds.lineage
  const graphEntities = useMemo(() => projectedEntities(catTraceMultiViewProject, activeViewId), [activeViewId])

  useEffect(() => {
    const onViewChange = (event: Event) => {
      const viewId = (event as CustomEvent<{ viewId?: MultiViewId }>).detail?.viewId
      if (!viewId) return
      setActiveViewId(viewId)
      if (viewId === multiViewIds.lineage) setSelectedEntityId("entity:lineage:cat-trace")
      if (viewId === multiViewIds.evidence) setSelectedEntityId("entity:evidence:claim:open-tail-response")
    }
    window.addEventListener("asteria-v2-view-change", onViewChange)
    return () => window.removeEventListener("asteria-v2-view-change", onViewChange)
  }, [])

  const switchWorkspaceView = (viewId: MultiViewId) => {
    setActiveViewId(viewId)
    if (viewId === multiViewIds.lineage) setSelectedEntityId("entity:lineage:cat-trace")
    if (viewId === multiViewIds.evidence) setSelectedEntityId("entity:evidence:claim:open-tail-response")
    window.dispatchEvent(new CustomEvent("asteria-v2-view-change", { detail: { viewId } }))
  }

  return (
    <main className="architecture-workspace" data-testid="architecture-workspace">
      <nav className="architecture-workspace-rail" aria-label="Asteria 2.0 views">
        <span className="architecture-workspace-rail-title">Views</span>
        <button type="button" className={isArchitecture ? "architecture-workspace-rail-active" : ""} onClick={() => switchWorkspaceView(multiViewIds.architecture)} data-testid="workspace-view-architecture">
          <Network size={15} />
          Architecture
        </button>
        <button type="button" className={isLineage ? "architecture-workspace-rail-active" : ""} onClick={() => switchWorkspaceView(multiViewIds.lineage)} data-testid="workspace-view-lineage">
          <GitBranch size={15} />
          Lineage
        </button>
        <button type="button" className={activeViewId === multiViewIds.evidence ? "architecture-workspace-rail-active" : ""} onClick={() => switchWorkspaceView(multiViewIds.evidence)} data-testid="workspace-view-evidence">
          <ShieldCheck size={15} />
          Evidence
        </button>
      </nav>

      <section className="architecture-workspace-stage" aria-label="CAT-TRACE Model Architecture" data-testid="architecture-workspace-stage">
        <header className="architecture-workspace-header">
          <div>
            <h1>{isArchitecture ? "CAT-TRACE -- Model Architecture" : isLineage ? "CAT-TRACE -- Method Lineage" : "CAT-TRACE -- Evidence Graph"}</h1>
            <p>
              {isArchitecture
                ? "Catalogue-aware open-tail model with canonical TRACE-preserving calibration."
                : isLineage
                  ? "Method-level lineage map showing key intellectual and methodological influences."
                  : "Claim-centered map of theory, implementation evidence, pending data, and open gaps."}
            </p>
          </div>
          <div className="architecture-workspace-status">
            <span>CAT-TRACE Frozen V2</span>
            <span>{isArchitecture ? "Schema V2" : isLineage ? "Lineage" : "Evidence"}</span>
          </div>
        </header>

        {isArchitecture ? (
          <>
            <div className="architecture-lane-headings" aria-hidden="true">
              {laneLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <ArchitectureMap selectedSymbolId={selectedSymbolId} trace={trace} onSelect={setSelectedSymbolId} />
          </>
        ) : (
          <ResearchMap entities={graphEntities} selectedEntityId={selectedEntityId} positions={isLineage ? methodPositions : evidencePositions} onSelect={setSelectedEntityId} />
        )}

        <footer className="architecture-workspace-footer">
          <div>
            <Layers3 size={14} />
            {isArchitecture ? "Observation / Measurement / Latent / Parameterization / Inference / Prediction" : isLineage ? "Extends / preserves / borrows / computational inspiration" : "Theory / implementation / datasets / limitation / pending"}
          </div>
          <div>{diff.items.length} semantic diff facts</div>
        </footer>
      </section>

    </main>
  )
}

function ArchitectureMap({ selectedSymbolId, trace, onSelect }: { selectedSymbolId: string; trace: ReturnType<typeof traceForSymbol>; onSelect: (id: string) => void }) {
  const project = catTraceFrozenV2Project
  return (
    <div className="architecture-workspace-canvas">
      {stageSymbols.map((item) => {
        const symbol = project.symbols[item.id]
        const entityId = symbol.entityId || ""
        const isSelected = item.id === selectedSymbolId
        const isTrace = trace.entityIds.has(entityId)
        const isUpstream = trace.upstreamEntityIds.has(entityId)
        const isDownstream = trace.downstreamEntityIds.has(entityId)
        return (
          <button
            key={item.id}
            type="button"
            className={`architecture-map-node ${isSelected ? "architecture-map-node-selected" : ""} ${isUpstream ? "architecture-map-node-upstream" : ""} ${isDownstream ? "architecture-map-node-downstream" : ""} ${!isSelected && !isTrace ? "architecture-map-node-muted" : ""}`}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            onClick={() => onSelect(item.id)}
          >
            <span>{item.display}</span>
            <small>{symbol.canonicalName}</small>
          </button>
        )
      })}
      <svg className="architecture-map-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M12 27 C20 31, 23 37, 31 45" />
        <path d="M26 39 C33 42, 38 42, 44 41" />
        <path d="M55 28 C57 33, 59 35, 61 40" />
        <path d="M66 28 C65 34, 63 36, 61 40" />
        <path d="M61 44 L61 52" />
        <path d="M74 43 C70 49, 66 51, 61 55" />
        <path d="M61 60 C62 64, 62 68, 60 72" />
        <path d="M68 57 C73 56, 77 56, 81 57" />
        <path d="M81 60 C83 65, 85 69, 87 72" />
      </svg>
    </div>
  )
}

function ResearchMap({ entities, selectedEntityId, positions, onSelect }: { entities: StatisticalEntity[]; selectedEntityId: string; positions: Record<string, { x: number; y: number }>; onSelect: (id: string) => void }) {
  return (
    <div className="architecture-workspace-canvas architecture-workspace-research-canvas">
      {entities.map((entity, index) => {
        const position = positions[entity.id] || { x: 18 + (index % 4) * 20, y: 26 + Math.floor(index / 4) * 18 }
        return (
          <button key={entity.id} type="button" className={`architecture-map-node architecture-map-node-${entity.kind} ${entity.id === selectedEntityId ? "architecture-map-node-selected" : ""}`} style={{ left: `${position.x}%`, top: `${position.y}%` }} onClick={() => onSelect(entity.id)}>
            <span>{entity.label}</span>
            <small>{entity.role}</small>
          </button>
        )
      })}
      <svg className="architecture-map-edges architecture-map-edges-research" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M22 24 C34 27, 45 36, 61 48" />
        <path d="M22 43 C36 43, 47 44, 61 48" />
        <path d="M22 64 C38 61, 47 53, 61 48" />
        <path d="M24 82 C39 76, 52 62, 61 48" />
        <path d="M43 24 C50 28, 52 33, 52 39" />
        <path d="M52 39 C52 45, 52 49, 52 55" />
        <path d="M34 73 C41 67, 47 61, 52 55" />
        <path d="M65 73 C61 66, 57 60, 52 55" />
        <path d="M78 60 C70 58, 62 56, 52 55" />
      </svg>
    </div>
  )
}
