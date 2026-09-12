import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { canonicalTraceProjects, type CanonicalTraceProjectId } from "./fixtures/canonicalTraceFixtures"
import { catTraceMultiViewProject, crossViewLinks, multiViewIds, type MultiViewId } from "./fixtures/multiViewTraceProject"
import { emptyTraceForSymbol, traceForSymbol, type TraceDirection, type TraceMode } from "./trace"
import type { ArchitectureProjectV2, SemanticLayer } from "./types"

const localViewStateKey = "asteria-v2-rc-view-state"
export type ArchitectureDetailLevel = "overview" | "full"

type StoredViewState = Partial<{
  activeViewId: MultiViewId
  modelId: CanonicalTraceProjectId
  selectedSymbolId: string
  selectedEntityId: string
  activeTraceSymbolId: string
  traceEnabled: boolean
  traceMode: TraceMode
  traceDirection: TraceDirection
  traceDepth: number
  detailLevel: ArchitectureDetailLevel
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

function isDetailLevel(value: unknown): value is ArchitectureDetailLevel {
  return value === "overview" || value === "full"
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
  activeTraceSymbolId: string
  traceEnabled: boolean
  traceMode: TraceMode
  traceDirection: TraceDirection
  traceDepth: number
  detailLevel: ArchitectureDetailLevel
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
    activeTraceSymbolId: stored.activeTraceSymbolId && project.symbols[stored.activeTraceSymbolId] ? stored.activeTraceSymbolId : selectedSymbolId,
    traceEnabled: Boolean(stored.traceEnabled && activeViewId === multiViewIds.architecture),
    traceMode: isTraceMode(stored.traceMode) ? stored.traceMode : "direct",
    traceDirection: isTraceDirection(stored.traceDirection) ? stored.traceDirection : "both",
    traceDepth: typeof stored.traceDepth === "number" ? Math.max(1, Math.min(6, Math.floor(stored.traceDepth) || 1)) : 2,
    detailLevel: isDetailLevel(stored.detailLevel) ? stored.detailLevel : "overview",
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
  activeTraceSymbolId: string
  traceEnabled: boolean
  traceMode: TraceMode
  traceDirection: TraceDirection
  traceDepth: number
  detailLevel: ArchitectureDetailLevel
  focusedLayer: SemanticLayer | "all"
  exportMode: "markdown" | "json"
  actionStatus: string
  searchQuery: string
  searchScope: "current" | "all"
  trace: ReturnType<typeof traceForSymbol>
  setActiveViewId: (viewId: MultiViewId, entityId?: string) => void
  setModelId: (modelId: CanonicalTraceProjectId) => void
  setSelectedSymbolId: (symbolId: string) => void
  setSelectedEntityId: (entityId: string) => void
  setTraceMode: (mode: TraceMode) => void
  setTraceDirection: (direction: TraceDirection) => void
  setTraceDepth: (depth: number) => void
  setDetailLevel: (level: ArchitectureDetailLevel) => void
  setFocusedLayer: (layer: SemanticLayer | "all") => void
  setExportMode: (mode: "markdown" | "json") => void
  setActionStatus: (status: string) => void
  setSearchQuery: (query: string) => void
  setSearchScope: (scope: "current" | "all") => void
  resetArchitectureView: () => void
  openEntityInView: (viewId: MultiViewId, entityId: string, nextModelId?: CanonicalTraceProjectId) => void
  openLinkedView: (view: "architecture" | "lineage" | "evidence", entityId: string) => void
  saveViewState: () => void
  restoreViewState: () => void
  startTraceForSelected: () => void
  clearTransientStatus: () => void
}

const ArchitectureSessionContext = createContext<ArchitectureSessionValue | undefined>(undefined)

export function ArchitectureSessionProvider({ children }: { children: ReactNode }) {
  const [initialState] = useState(initialSessionState)
  const [activeViewId, setActiveViewIdState] = useState<MultiViewId>(initialState.activeViewId)
  const [modelId, setModelIdState] = useState<CanonicalTraceProjectId>(initialState.modelId)
  const [selectedSymbolIdState, setSelectedSymbolIdState] = useState(initialState.selectedSymbolId)
  const [selectedEntityIdState, setSelectedEntityIdState] = useState(initialState.selectedEntityId)
  const [activeTraceSymbolIdState, setActiveTraceSymbolIdState] = useState(initialState.activeTraceSymbolId)
  const [traceEnabled, setTraceEnabled] = useState(initialState.traceEnabled)
  const [traceModeState, setTraceModeState] = useState<TraceMode>(initialState.traceMode)
  const [traceDirectionState, setTraceDirectionState] = useState<TraceDirection>(initialState.traceDirection)
  const [traceDepthState, setTraceDepthState] = useState(initialState.traceDepth)
  const [detailLevel, setDetailLevelState] = useState<ArchitectureDetailLevel>(initialState.detailLevel)
  const [focusedLayer, setFocusedLayer] = useState<SemanticLayer | "all">(initialState.focusedLayer)
  const [exportMode, setExportMode] = useState<"markdown" | "json">(initialState.exportMode)
  const [actionStatus, setActionStatus] = useState("Ready")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchScope, setSearchScope] = useState<"current" | "all">("current")

  const project = useMemo(() => projectForView(activeViewId, modelId), [activeViewId, modelId])
  const selectedSymbolId = project.symbols[selectedSymbolIdState] ? selectedSymbolIdState : defaultSymbolId(modelId)
  const selectedEntityId = project.entities[selectedEntityIdState] ? selectedEntityIdState : defaultEntityId(activeViewId, modelId)
  const activeTraceSymbolId = project.symbols[activeTraceSymbolIdState] ? activeTraceSymbolIdState : selectedSymbolId
  const traceMode = traceModeState
  const traceDirection = traceDirectionState
  const traceDepth = Math.max(1, Math.min(6, traceDepthState))
  const trace = useMemo(() => {
    if (!traceEnabled || activeViewId !== multiViewIds.architecture) return emptyTraceForSymbol(project, activeTraceSymbolId || selectedSymbolId)
    return traceForSymbol(project, activeTraceSymbolId, { mode: traceMode, direction: traceDirection, maxDepth: traceDepth })
  }, [activeTraceSymbolId, activeViewId, project, selectedSymbolId, traceDepth, traceDirection, traceEnabled, traceMode])

  useEffect(() => {
    if (actionStatus === "Ready") return
    const timeout = window.setTimeout(() => setActionStatus("Ready"), 2600)
    return () => window.clearTimeout(timeout)
  }, [actionStatus])

  const clearTrace = useCallback(() => {
    setTraceEnabled(false)
    setActiveTraceSymbolIdState("")
  }, [])

  const activateTrace = useCallback(() => {
    setActiveTraceSymbolIdState(selectedSymbolId)
    setTraceEnabled(true)
  }, [selectedSymbolId])

  const setActiveViewId = useCallback(
    (viewId: MultiViewId, entityId?: string) => {
      setActiveViewIdState(viewId)
      const nextProject = projectForView(viewId, modelId)
      const nextEntityId = entityId && nextProject.entities[entityId] ? entityId : defaultEntityId(viewId, modelId)
      setSelectedEntityIdState(nextEntityId)
      const symbolId = nextProject.entities[nextEntityId]?.symbolIds?.find((id) => nextProject.symbols[id])
      if (viewId === multiViewIds.architecture) setSelectedSymbolIdState(symbolId || defaultSymbolId(modelId))
      clearTrace()
      setDetailLevelState("overview")
      setSearchQuery("")
      setSearchScope("current")
      setActionStatus("Ready")
    },
    [clearTrace, modelId],
  )

  const setModelId = useCallback(
    (nextModelId: CanonicalTraceProjectId) => {
      setModelIdState(nextModelId)
      const nextSymbolId = defaultSymbolId(nextModelId)
      const nextEntityId = defaultEntityId(multiViewIds.architecture, nextModelId)
      setSelectedSymbolIdState(nextSymbolId)
      if (activeViewId === multiViewIds.architecture) setSelectedEntityIdState(nextEntityId)
      setTraceModeState("direct")
      setTraceDirectionState("both")
      setTraceDepthState(2)
      clearTrace()
      setDetailLevelState("overview")
      setFocusedLayer("all")
      setSearchQuery("")
      setSearchScope("current")
      setActionStatus("Ready")
    },
    [activeViewId, clearTrace],
  )

  const setSelectedSymbolId = useCallback(
    (symbolId: string) => {
      const symbol = project.symbols[symbolId]
      setSelectedSymbolIdState(symbolId)
      if (symbol?.entityId) setSelectedEntityIdState(symbol.entityId)
      setActionStatus("Ready")
    },
    [project],
  )

  const setSelectedEntityId = useCallback(
    (entityId: string) => {
      setSelectedEntityIdState(entityId)
      const symbolId = project.entities[entityId]?.symbolIds?.find((id) => project.symbols[id])
      if (symbolId) setSelectedSymbolIdState(symbolId)
      setActionStatus("Ready")
    },
    [project],
  )

  const setTraceMode = useCallback((mode: TraceMode) => {
    setTraceModeState(mode)
    activateTrace()
  }, [activateTrace])

  const setTraceDirection = useCallback((direction: TraceDirection) => {
    setTraceDirectionState(direction)
    activateTrace()
  }, [activateTrace])

  const setTraceDepth = useCallback((depth: number) => {
    setTraceDepthState(Math.max(1, Math.min(6, Math.floor(depth) || 1)))
    activateTrace()
  }, [activateTrace])

  const setDetailLevel = useCallback((level: ArchitectureDetailLevel) => {
    setDetailLevelState(level)
    setActionStatus("Ready")
  }, [])

  const resetArchitectureView = useCallback(() => {
    const nextSymbolId = defaultSymbolId(modelId)
    const nextEntityId = defaultEntityId(multiViewIds.architecture, modelId)
    setActiveViewIdState(multiViewIds.architecture)
    setSelectedSymbolIdState(nextSymbolId)
    setSelectedEntityIdState(nextEntityId)
    setTraceModeState("direct")
    setTraceDirectionState("both")
    setTraceDepthState(2)
    clearTrace()
    setDetailLevelState("overview")
    setFocusedLayer("all")
    setSearchQuery("")
    setSearchScope("current")
    setActionStatus("Architecture view reset")
  }, [clearTrace, modelId])

  const openEntityInView = useCallback(
    (viewId: MultiViewId, entityId: string, nextModelId: CanonicalTraceProjectId = modelId) => {
      const nextProject = projectForView(viewId, nextModelId)
      const nextEntityId = nextProject.entities[entityId] ? entityId : defaultEntityId(viewId, nextModelId)
      const nextSymbolId = nextProject.entities[nextEntityId]?.symbolIds?.find((id) => nextProject.symbols[id]) || defaultSymbolId(nextModelId)
      if (viewId === multiViewIds.architecture) setModelIdState(nextModelId)
      setActiveViewIdState(viewId)
      setSelectedEntityIdState(nextEntityId)
      if (viewId === multiViewIds.architecture) setSelectedSymbolIdState(nextSymbolId)
      setTraceModeState("direct")
      setTraceDirectionState("both")
      setTraceDepthState(2)
      clearTrace()
      setDetailLevelState("overview")
      setFocusedLayer("all")
      setSearchQuery("")
      setSearchScope("current")
      setActionStatus(`Opened ${nextProject.entities[nextEntityId]?.label || "selected entity"}`)
    },
    [clearTrace, modelId],
  )

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
        clearTrace()
        setDetailLevelState("overview")
        setActionStatus("Opened linked Architecture entity")
        setSearchQuery("")
        setSearchScope("current")
        return
      }
      const nextViewId = view === "lineage" ? multiViewIds.lineage : multiViewIds.evidence
      setActiveViewId(nextViewId, linkedId || defaultEntityId(nextViewId, modelId))
      setActionStatus(`Opened linked ${view}`)
    },
    [clearTrace, modelId, setActiveViewId],
  )

  const saveViewState = useCallback(() => {
    localStorage.setItem(localViewStateKey, JSON.stringify({ activeViewId, modelId, selectedSymbolId, selectedEntityId, activeTraceSymbolId, traceEnabled, traceMode, traceDirection, traceDepth, detailLevel, focusedLayer, exportMode }))
    setActionStatus("Local view state saved")
  }, [activeTraceSymbolId, activeViewId, detailLevel, exportMode, focusedLayer, modelId, selectedEntityId, selectedSymbolId, traceDepth, traceDirection, traceEnabled, traceMode])

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
    if (parsed.activeTraceSymbolId) setActiveTraceSymbolIdState(parsed.activeTraceSymbolId)
    setTraceEnabled(Boolean(parsed.traceEnabled))
    if (parsed.traceMode) setTraceModeState(parsed.traceMode)
    if (parsed.traceDirection) setTraceDirectionState(parsed.traceDirection)
    if (parsed.traceDepth) setTraceDepthState(parsed.traceDepth)
    if (parsed.detailLevel) setDetailLevelState(parsed.detailLevel)
    if (parsed.focusedLayer) setFocusedLayer(parsed.focusedLayer)
    if (parsed.exportMode) setExportMode(parsed.exportMode)
    setSearchQuery("")
    setSearchScope("current")
    setActionStatus("Local view state restored")
  }, [])

  const startTraceForSelected = useCallback(() => {
    activateTrace()
    setActionStatus(`Trace enabled for ${project.symbols[selectedSymbolId]?.canonicalName || "selected symbol"}`)
  }, [activateTrace, project.symbols, selectedSymbolId])

  const clearTransientStatus = useCallback(() => setActionStatus("Ready"), [])

  const value = useMemo(
    () => ({
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
      searchQuery,
      searchScope,
      trace,
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
      clearTransientStatus,
    }),
    [activeTraceSymbolId, activeViewId, actionStatus, clearTransientStatus, detailLevel, exportMode, focusedLayer, modelId, openEntityInView, openLinkedView, project, resetArchitectureView, restoreViewState, saveViewState, searchQuery, searchScope, selectedEntityId, selectedSymbolId, setActiveViewId, setDetailLevel, setModelId, setSelectedEntityId, setSelectedSymbolId, setTraceDepth, setTraceDirection, setTraceMode, startTraceForSelected, trace, traceDepth, traceDirection, traceEnabled, traceMode],
  )

  return <ArchitectureSessionContext.Provider value={value}>{children}</ArchitectureSessionContext.Provider>
}

export function useArchitectureSession() {
  const value = useContext(ArchitectureSessionContext)
  if (!value) throw new Error("useArchitectureSession must be used inside ArchitectureSessionProvider")
  return value
}
