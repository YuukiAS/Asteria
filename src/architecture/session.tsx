import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { canonicalTraceProjects, type CanonicalTraceProjectId } from "./fixtures/canonicalTraceFixtures"
import { catTraceMultiViewProject, crossViewLinks, multiViewIds, type MultiViewId } from "./fixtures/multiViewTraceProject"
import { traceForSymbol, type TraceDirection, type TraceMode } from "./trace"
import type { ArchitectureProjectV2, SemanticLayer } from "./types"

const localViewStateKey = "asteria-v2-rc-view-state"

type StoredViewState = Partial<{
  activeViewId: MultiViewId
  modelId: CanonicalTraceProjectId
  selectedSymbolId: string
  selectedEntityId: string
  traceMode: TraceMode
  traceDirection: TraceDirection
  traceDepth: number
  focusedLayer: SemanticLayer | "all"
  exportMode: "markdown" | "json"
}>

function defaultSymbolId(modelId: CanonicalTraceProjectId) {
  if (modelId === "cat-trace-frozen-v2") return "symbol:cat-trace-frozen-v2:betaU_gh"
  return "symbol:original-trace:y_ij"
}

function defaultEntityId(viewId: MultiViewId, modelId: CanonicalTraceProjectId) {
  if (viewId === multiViewIds.architecture) return canonicalTraceProjects[modelId].symbols[defaultSymbolId(modelId)]?.entityId || ""
  if (viewId === multiViewIds.lineage) return "entity:lineage:cat-trace"
  return "entity:evidence:claim:open-tail-response"
}

function projectForView(viewId: MultiViewId, modelId: CanonicalTraceProjectId): ArchitectureProjectV2 {
  return viewId === multiViewIds.architecture ? canonicalTraceProjects[modelId] : catTraceMultiViewProject
}

function isCanonicalModelId(value: unknown): value is CanonicalTraceProjectId {
  return value === "original-trace" || value === "cat-trace-frozen-v2"
}

function isMultiViewId(value: unknown): value is MultiViewId {
  return value === multiViewIds.architecture || value === multiViewIds.lineage || value === multiViewIds.evidence
}

function isTraceMode(value: unknown): value is TraceMode {
  return value === "direct" || value === "recursive"
}

function isTraceDirection(value: unknown): value is TraceDirection {
  return value === "upstream" || value === "downstream" || value === "both"
}

function readStoredViewState(): StoredViewState {
  if (typeof localStorage === "undefined") return {}
  try {
    const parsed = JSON.parse(localStorage.getItem(localViewStateKey) || "null") as StoredViewState | null
    if (!parsed || typeof parsed !== "object") return {}
    return parsed
  } catch {
    return {}
  }
}

function initialSessionState(): {
  activeViewId: MultiViewId
  modelId: CanonicalTraceProjectId
  selectedSymbolId: string
  selectedEntityId: string
  traceMode: TraceMode
  traceDirection: TraceDirection
  traceDepth: number
  focusedLayer: SemanticLayer | "all"
  exportMode: "markdown" | "json"
} {
  const stored = readStoredViewState()
  const modelId = isCanonicalModelId(stored.modelId) ? stored.modelId : "cat-trace-frozen-v2"
  const activeViewId = isMultiViewId(stored.activeViewId) ? stored.activeViewId : multiViewIds.architecture
  const project = projectForView(activeViewId, modelId)
  const selectedSymbolId = stored.selectedSymbolId && project.symbols[stored.selectedSymbolId] ? stored.selectedSymbolId : defaultSymbolId(modelId)
  const selectedEntityId = stored.selectedEntityId && project.entities[stored.selectedEntityId] ? stored.selectedEntityId : defaultEntityId(activeViewId, modelId)
  return {
    activeViewId,
    modelId,
    selectedSymbolId,
    selectedEntityId,
    traceMode: isTraceMode(stored.traceMode) ? stored.traceMode : "direct",
    traceDirection: isTraceDirection(stored.traceDirection) ? stored.traceDirection : "both",
    traceDepth: typeof stored.traceDepth === "number" ? Math.max(1, Math.min(6, Math.floor(stored.traceDepth) || 1)) : 2,
    focusedLayer: stored.focusedLayer || "all",
    exportMode: stored.exportMode === "json" ? "json" : "markdown",
  }
}

export type ArchitectureSessionValue = {
  activeViewId: MultiViewId
  modelId: CanonicalTraceProjectId
  project: ArchitectureProjectV2
  selectedSymbolId: string
  selectedEntityId: string
  traceMode: TraceMode
  traceDirection: TraceDirection
  traceDepth: number
  focusedLayer: SemanticLayer | "all"
  exportMode: "markdown" | "json"
  actionStatus: string
  trace: ReturnType<typeof traceForSymbol>
  setActiveViewId: (viewId: MultiViewId, entityId?: string) => void
  setModelId: (modelId: CanonicalTraceProjectId) => void
  setSelectedSymbolId: (symbolId: string) => void
  setSelectedEntityId: (entityId: string) => void
  setTraceMode: (mode: TraceMode) => void
  setTraceDirection: (direction: TraceDirection) => void
  setTraceDepth: (depth: number) => void
  setFocusedLayer: (layer: SemanticLayer | "all") => void
  setExportMode: (mode: "markdown" | "json") => void
  setActionStatus: (status: string) => void
  openLinkedView: (view: "architecture" | "lineage" | "evidence", entityId: string) => void
  saveViewState: () => void
  restoreViewState: () => void
}

const ArchitectureSessionContext = createContext<ArchitectureSessionValue | undefined>(undefined)

export function ArchitectureSessionProvider({ children }: { children: ReactNode }) {
  const [initialState] = useState(initialSessionState)
  const [activeViewId, setActiveViewIdState] = useState<MultiViewId>(initialState.activeViewId)
  const [modelId, setModelIdState] = useState<CanonicalTraceProjectId>(initialState.modelId)
  const [selectedSymbolIdState, setSelectedSymbolIdState] = useState(initialState.selectedSymbolId)
  const [selectedEntityIdState, setSelectedEntityIdState] = useState(initialState.selectedEntityId)
  const [traceMode, setTraceMode] = useState<TraceMode>(initialState.traceMode)
  const [traceDirection, setTraceDirection] = useState<TraceDirection>(initialState.traceDirection)
  const [traceDepthState, setTraceDepthState] = useState(initialState.traceDepth)
  const [focusedLayer, setFocusedLayer] = useState<SemanticLayer | "all">(initialState.focusedLayer)
  const [exportMode, setExportMode] = useState<"markdown" | "json">(initialState.exportMode)
  const [actionStatus, setActionStatus] = useState("Ready")

  const project = useMemo(() => projectForView(activeViewId, modelId), [activeViewId, modelId])
  const selectedSymbolId = project.symbols[selectedSymbolIdState] ? selectedSymbolIdState : defaultSymbolId(modelId)
  const selectedEntityId = project.entities[selectedEntityIdState] ? selectedEntityIdState : defaultEntityId(activeViewId, modelId)
  const traceDepth = Math.max(1, Math.min(6, traceDepthState))
  const trace = useMemo(() => traceForSymbol(project, selectedSymbolId, { mode: traceMode, direction: traceDirection, maxDepth: traceDepth }), [project, selectedSymbolId, traceDepth, traceDirection, traceMode])

  const setActiveViewId = useCallback(
    (viewId: MultiViewId, entityId?: string) => {
      setActiveViewIdState(viewId)
      const nextProject = projectForView(viewId, modelId)
      const nextEntityId = entityId && nextProject.entities[entityId] ? entityId : defaultEntityId(viewId, modelId)
      setSelectedEntityIdState(nextEntityId)
      const symbolId = nextProject.entities[nextEntityId]?.symbolIds?.find((id) => nextProject.symbols[id])
      if (viewId === multiViewIds.architecture) setSelectedSymbolIdState(symbolId || defaultSymbolId(modelId))
    },
    [modelId],
  )

  const setModelId = useCallback(
    (nextModelId: CanonicalTraceProjectId) => {
      setModelIdState(nextModelId)
      const nextSymbolId = defaultSymbolId(nextModelId)
      const nextEntityId = defaultEntityId(multiViewIds.architecture, nextModelId)
      setSelectedSymbolIdState(nextSymbolId)
      if (activeViewId === multiViewIds.architecture) setSelectedEntityIdState(nextEntityId)
    },
    [activeViewId],
  )

  const setSelectedSymbolId = useCallback(
    (symbolId: string) => {
      const symbol = project.symbols[symbolId]
      setSelectedSymbolIdState(symbolId)
      if (symbol?.entityId) setSelectedEntityIdState(symbol.entityId)
    },
    [project],
  )

  const setSelectedEntityId = useCallback(
    (entityId: string) => {
      setSelectedEntityIdState(entityId)
      const symbolId = project.entities[entityId]?.symbolIds?.find((id) => project.symbols[id])
      if (symbolId) setSelectedSymbolIdState(symbolId)
    },
    [project],
  )

  const setTraceDepth = useCallback((depth: number) => {
    setTraceDepthState(Math.max(1, Math.min(6, Math.floor(depth) || 1)))
  }, [])

  const openLinkedView = useCallback(
    (view: "architecture" | "lineage" | "evidence", entityId: string) => {
      const linkedId = crossViewLinks[entityId]?.[view] || (view === "architecture" ? defaultEntityId(multiViewIds.architecture, "cat-trace-frozen-v2") : undefined)
      if (view === "architecture") {
        setModelIdState("cat-trace-frozen-v2")
        setActiveViewIdState(multiViewIds.architecture)
        const nextEntityId = linkedId || defaultEntityId(multiViewIds.architecture, "cat-trace-frozen-v2")
        setSelectedEntityIdState(nextEntityId)
        const symbolId = catTraceMultiViewProject.entities[nextEntityId]?.symbolIds?.[0] || canonicalTraceProjects["cat-trace-frozen-v2"].entities[nextEntityId]?.symbolIds?.[0]
        setSelectedSymbolIdState(symbolId || defaultSymbolId("cat-trace-frozen-v2"))
        setActionStatus("Opened linked Architecture entity")
        return
      }
      const nextViewId = view === "lineage" ? multiViewIds.lineage : multiViewIds.evidence
      setActiveViewId(nextViewId, linkedId || defaultEntityId(nextViewId, modelId))
      setActionStatus(`Opened linked ${view}`)
    },
    [modelId, setActiveViewId],
  )

  const saveViewState = useCallback(() => {
    localStorage.setItem(localViewStateKey, JSON.stringify({ activeViewId, modelId, selectedSymbolId, selectedEntityId, traceMode, traceDirection, traceDepth, focusedLayer, exportMode }))
    setActionStatus("Local view state saved")
  }, [activeViewId, exportMode, focusedLayer, modelId, selectedEntityId, selectedSymbolId, traceDepth, traceDirection, traceMode])

  const restoreViewState = useCallback(() => {
    const stored = localStorage.getItem(localViewStateKey)
    if (!stored) {
      setActionStatus("No saved local view state")
      return
    }
    const parsed = JSON.parse(stored) as StoredViewState
    if (parsed.modelId) setModelIdState(parsed.modelId)
    if (parsed.activeViewId) setActiveViewIdState(parsed.activeViewId)
    if (parsed.selectedSymbolId) setSelectedSymbolIdState(parsed.selectedSymbolId)
    if (parsed.selectedEntityId) setSelectedEntityIdState(parsed.selectedEntityId)
    if (parsed.traceMode) setTraceMode(parsed.traceMode)
    if (parsed.traceDirection) setTraceDirection(parsed.traceDirection)
    if (parsed.traceDepth) setTraceDepthState(parsed.traceDepth)
    if (parsed.focusedLayer) setFocusedLayer(parsed.focusedLayer)
    if (parsed.exportMode) setExportMode(parsed.exportMode)
    setActionStatus("Local view state restored")
  }, [])

  const value = useMemo(
    () => ({
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
    }),
    [activeViewId, actionStatus, exportMode, focusedLayer, modelId, openLinkedView, project, restoreViewState, saveViewState, selectedEntityId, selectedSymbolId, setActiveViewId, setModelId, setSelectedEntityId, setSelectedSymbolId, setTraceDepth, trace, traceDepth, traceDirection, traceMode],
  )

  return <ArchitectureSessionContext.Provider value={value}>{children}</ArchitectureSessionContext.Provider>
}

export function useArchitectureSession() {
  const value = useContext(ArchitectureSessionContext)
  if (!value) throw new Error("useArchitectureSession must be used inside ArchitectureSessionProvider")
  return value
}
