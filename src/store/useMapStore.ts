import {
  addEdge as addReactFlowEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react"
import { create } from "zustand"
import { blockTypeDefaults } from "../constants/blockDefaults"
import { allVersionsId, defaultVariantKey, maxModelVersions, microStraightenTolerance, snapGridSize } from "../constants/versioning"
import { createDemoMap } from "../lib/demo"
import {
  applyEdgePresentation,
  createBlockNode,
  createBlockVariant,
  createEdge,
  createGroupNode,
  defaultEdgeData,
  defaultMapTitle,
  getVariantKey,
  normalizeMapTitle,
  normalizeExportedMap,
  resolveBlockVariant,
} from "../lib/exportImport"
import { loadPersistedMap, savePersistedMap } from "../lib/db"
import { contentJsonToHtml } from "../editor/editorUtils"
import { resolveBlockVersionState } from "../lib/blockVersionState"
import { createId } from "../lib/ids"
import { nowIso } from "../lib/time"
import type {
  BlockData,
  BlockDisplayMode,
  BlockNode,
  BlockVariant,
  BlockVariantKey,
  DisplayModeOverride,
  EdgeArrow,
  EdgeVisibility,
  EdgeLineStyle,
  EdgePathType,
  ExportedMap,
  GroupNode,
  MapEdge,
  MapEdgeData,
  MapNode,
  MapViewport,
  ModelVersion,
  SaveStatus,
} from "../types/map"

type XYPosition = { x: number; y: number }

type EdgeStyleClipboard = {
  color: string
  lineStyle: EdgeLineStyle
  pathType: EdgePathType
  arrow: EdgeArrow
  strokeWidth: number
}

type BlockStyleClipboard = Pick<
  BlockData,
  "backgroundColor" | "textColor" | "borderColor" | "width" | "height" | "displayMode" | "nodeType" | "showStatus" | "status" | "emojis"
>

type BlockClipboard = {
  data: BlockData
  position: { x: number; y: number }
  pasteCount: number
}

type CanvasHistorySnapshot = {
  nodes: MapNode[]
  edges: MapEdge[]
  signature: string
}

type AlignCommand = "left" | "right" | "top" | "bottom" | "horizontal_center" | "vertical_center"
type DistributeCommand = "horizontal" | "vertical"

const edgeStyleClipboardKey = "asteria-edge-style-clipboard"
const blockStyleClipboardKey = "asteria-block-style-clipboard"
const blockClipboardKey = "asteria-block-clipboard"
const maxCanvasHistoryEntries = 50

function readClipboard<T>(key: string): T | undefined {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : undefined
  } catch (error) {
    console.warn(`Failed to read ${key}`, error)
    return undefined
  }
}

function writeClipboard<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`Failed to persist ${key}`, error)
  }
}

function cloneJson<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value)
  return JSON.parse(JSON.stringify(value)) as T
}

function createCanvasHistorySnapshot(nodes: MapNode[], edges: MapEdge[]): CanvasHistorySnapshot {
  const snapshot = {
    nodes: cloneJson(nodes),
    edges: cloneJson(edges),
  }
  return {
    ...snapshot,
    signature: JSON.stringify(snapshot),
  }
}

type MapState = {
  mapTitle: string
  modelVersions: ModelVersion[]
  activeVersionId: "all" | string
  displayModeOverride: DisplayModeOverride
  nodes: MapNode[]
  edges: MapEdge[]
  selectedNodeId?: string
  selectedNodeIds: string[]
  selectedEdgeId?: string
  viewport: MapViewport
  saveStatus: SaveStatus
  lastSavedAt?: string
  seededDemo: boolean
  isHydrated: boolean
  autosaveTimer?: number
  edgeStyleClipboard?: EdgeStyleClipboard
  blockStyleClipboard?: BlockStyleClipboard
  blockClipboard?: BlockClipboard
  canvasHistory: CanvasHistorySnapshot[]
  pendingDragSnapshot?: CanvasHistorySnapshot
  addBlock: (position?: { x: number; y: number }) => void
  addBlockAndSelect: (position?: { x: number; y: number }) => string
  addBlockNextToSelected: () => string
  addLinkedBlockFromSelected: () => string
  groupSelectedBlocks: () => void
  attachSelectedBlocksToFrame: () => void
  detachSelectedBlocksFromFrame: () => void
  updateMapTitle: (title: string) => void
  setActiveVersion: (versionId: "all" | string) => void
  addModelVersion: () => void
  updateModelVersion: (id: string, patch: Partial<Pick<ModelVersion, "label" | "shortLabel">>) => void
  deleteModelVersion: (id: string) => void
  moveModelVersion: (id: string, direction: -1 | 1) => void
  setDisplayModeOverride: (mode: DisplayModeOverride) => void
  appendBlockMathToSelectedBlock: (latex: string) => void
  updateBlock: (id: string, patch: Partial<BlockData>) => void
  applyBlockTypeStyle: (id: string) => void
  setBlockActiveVariant: (id: string, variantKey: string) => void
  updateBlockVariant: (id: string, variantKey: string, patch: Partial<Pick<BlockData, "title" | "contentJson" | "contentHtml">>) => void
  copyBlockVariantToVersion: (id: string, versionId: string) => void
  deleteBlockVariant: (id: string, variantKey: string) => void
  updateGroup: (id: string, patch: Partial<GroupNode["data"]>) => void
  duplicateBlock: (id: string) => void
  duplicateSelectedBlock: () => void
  copyBlock: (id: string) => void
  copySelectedBlock: () => void
  pasteBlock: () => void
  copyBlockStyle: (id: string) => void
  pasteBlockStyle: (id: string) => void
  deleteSelected: () => void
  deleteBlock: (id: string) => void
  addEdge: (connection: Connection) => void
  updateEdge: (id: string, patch: Partial<MapEdgeData>) => void
  copyEdgeStyle: (id: string) => void
  pasteEdgeStyle: (id: string) => void
  deleteEdge: (id: string) => void
  setSelectedNode: (id?: string) => void
  setSelectedNodes: (ids: string[]) => void
  setSelectedEdge: (id?: string) => void
  setViewport: (viewport: MapViewport) => void
  alignSelectedBlocks: (command: AlignCommand) => void
  distributeSelectedBlocks: (command: DistributeCommand) => void
  snapSelectedBlocksToGrid: () => void
  snapAllBlocksToGrid: () => void
  straightenNearAxisEdges: () => void
  clearMap: () => void
  loadMap: (map: ExportedMap, markUnsaved?: boolean) => void
  beginNodeDragHistory: () => void
  commitNodeDragHistory: () => void
  undoLastCanvasChange: () => void
  onNodesChange: (changes: NodeChange<MapNode>[]) => void
  onEdgesChange: (changes: EdgeChange<MapEdge>[]) => void
  saveNow: () => Promise<void>
  hydrate: () => Promise<void>
  markUnsaved: () => void
}

function mapFromState(state: Pick<MapState, "mapTitle" | "modelVersions" | "activeVersionId" | "displayModeOverride" | "nodes" | "edges" | "viewport">): ExportedMap {
  return {
    version: 1,
    title: normalizeMapTitle(state.mapTitle),
    modelVersions: state.modelVersions,
    activeVersionId: state.activeVersionId,
    displayModeOverride: state.displayModeOverride,
    nodes: state.nodes,
    edges: state.edges,
    viewport: state.viewport,
    updatedAt: nowIso(),
  }
}

function isBlockNode(node: MapNode): node is BlockNode {
  return node.type === "block"
}

function findBlockNode(nodes: MapNode[], id?: string): BlockNode | undefined {
  return nodes.find((node): node is BlockNode => Boolean(id) && node.id === id && isBlockNode(node))
}

function applyContentHtml(nodes: MapNode[]): MapNode[] {
  return nodes.map((node) => {
    if (!isBlockNode(node)) return node
    const colorPatch = blockTypeColorPatch(node.data)
    const variants = Object.fromEntries(
      Object.entries(node.data.variants || {}).map(([key, variant]) => [
        key,
        variant
          ? {
              ...variant,
              contentHtml: variant.contentHtml || contentJsonToHtml(variant.contentJson),
            }
          : variant,
      ]),
    )
    return {
      ...node,
      data: {
        ...node.data,
        ...colorPatch,
        contentHtml: node.data.contentHtml || contentJsonToHtml(node.data.contentJson),
        variants,
      },
    }
  })
}

const legacyPriorBackgrounds = new Set(["#fef3c7", "#fef9c3", "#fff7ed", "#fffaf0"])
const legacyPriorBorders = new Set(["#fde68a", "#facc15", "#f59e0b", "#fdba74", "#fed7aa"])
const legacyResultBackgrounds = new Set(["#dcfce7", "#bbf7d0"])
const legacyResultBorders = new Set(["#86efac", "#4ade80", "#22c55e"])

function blockTypeColorPatch(data: BlockData): Partial<Pick<BlockData, "backgroundColor" | "borderColor">> {
  const defaults = blockTypeDefaults[data.nodeType]
  if (data.nodeType === "prior") {
    return {
      ...(legacyPriorBackgrounds.has(data.backgroundColor.toLowerCase()) ? { backgroundColor: defaults.backgroundColor } : {}),
      ...(legacyPriorBorders.has(data.borderColor.toLowerCase()) ? { borderColor: defaults.borderColor } : {}),
    }
  }
  if (data.nodeType === "result") {
    return {
      ...(legacyResultBackgrounds.has(data.backgroundColor.toLowerCase()) ? { backgroundColor: defaults.backgroundColor } : {}),
      ...(legacyResultBorders.has(data.borderColor.toLowerCase()) ? { borderColor: defaults.borderColor } : {}),
    }
  }
  return {}
}

function getNodeSize(node: MapNode) {
  if (isBlockNode(node)) return { width: node.data.width, height: node.data.height }
  return {
    width: Number((node.style as { width?: number } | undefined)?.width) || 420,
    height: Number((node.style as { height?: number } | undefined)?.height) || 300,
  }
}

function absolutePosition(node: MapNode, nodes: MapNode[]): XYPosition {
  if (!node.parentId) return node.position
  const parent = nodes.find((item) => item.id === node.parentId)
  if (!parent) return node.position
  const parentPosition = absolutePosition(parent, nodes)
  return { x: parentPosition.x + node.position.x, y: parentPosition.y + node.position.y }
}

function relativePositionFromAbsolute(node: MapNode, nodes: MapNode[], absolute: XYPosition): XYPosition {
  if (!node.parentId) return absolute
  const parent = nodes.find((item) => item.id === node.parentId)
  if (!parent) return absolute
  const parentPosition = absolutePosition(parent, nodes)
  return { x: absolute.x - parentPosition.x, y: absolute.y - parentPosition.y }
}

function getBlockVariantKeyForState(state: Pick<MapState, "activeVersionId" | "modelVersions">, data: BlockData) {
  return data.activeVariantKey && data.activeVariantKey !== defaultVariantKey ? data.activeVariantKey : getVariantKey(state.activeVersionId)
}

function firstExistingVariant(data: BlockData): BlockVariant | undefined {
  return Object.values(data.variants || {}).find((variant): variant is BlockVariant => Boolean(variant))
}

function resolveVariantForMirror(data: BlockData, key: BlockVariantKey, modelVersions: ModelVersion[]): BlockVariant {
  const state = resolveBlockVersionState({ ...data, activeVariantKey: key === defaultVariantKey ? defaultVariantKey : key }, key, modelVersions)
  const renderedVariant = state.renderedVariantKey ? data.variants?.[state.renderedVariantKey] : undefined
  if (renderedVariant) return renderedVariant
  return firstExistingVariant(data) || createBlockVariant(data.title, data.contentJson, data.contentHtml, data.updatedAt)
}

function patchBlockVariant(data: BlockData, key: string, patch: Partial<Pick<BlockData, "title" | "contentJson" | "contentHtml">>, modelVersions: ModelVersion[]) {
  const resolvedState = resolveBlockVersionState({ ...data, activeVariantKey: key === defaultVariantKey ? defaultVariantKey : key }, key, modelVersions)
  const inheritedVariant = resolvedState.renderedVariantKey ? data.variants?.[resolvedState.renderedVariantKey] : undefined
  const current = data.variants?.[key] || inheritedVariant || createBlockVariant(data.title, data.contentJson, data.contentHtml, data.updatedAt)
  const next: BlockVariant = {
    ...current,
    title: patch.title ?? current.title,
    contentJson: patch.contentJson ?? current.contentJson,
    contentHtml: patch.contentHtml ?? (patch.contentJson ? contentJsonToHtml(patch.contentJson) : current.contentHtml),
    updatedAt: nowIso(),
  }
  return {
    ...data.variants,
    [key]: next,
  }
}

function selectedBlockNodes(state: MapState) {
  return state.nodes.filter((node): node is BlockNode => state.selectedNodeIds.includes(node.id) && isBlockNode(node))
}

function roundToGrid(value: number) {
  return Math.round(value / snapGridSize) * snapGridSize
}

function nextBlockPositionFrom(source: BlockNode, nodes: MapNode[]): XYPosition {
  const position = absolutePosition(source, nodes)
  return { x: position.x + source.data.width + 120, y: position.y }
}

function blockStyleFromData(data: BlockData): BlockStyleClipboard {
  return {
    backgroundColor: data.backgroundColor,
    textColor: data.textColor,
    borderColor: data.borderColor,
    width: data.width,
    height: data.height,
    displayMode: data.displayMode,
    nodeType: data.nodeType,
    showStatus: data.showStatus,
    status: data.status,
    emojis: (data.emojis || []).slice(0, 1),
  }
}

function edgeStyleFromData(data?: MapEdgeData): EdgeStyleClipboard {
  return {
    color: data?.color || defaultEdgeData.color,
    lineStyle: data?.lineStyle || defaultEdgeData.lineStyle,
    pathType: data?.pathType || defaultEdgeData.pathType,
    arrow: data?.arrow || defaultEdgeData.arrow,
    strokeWidth: data?.strokeWidth || defaultEdgeData.strokeWidth,
  }
}

function blockTypePatch(patch: Partial<BlockData>) {
  if (!patch.nodeType) return patch
  return patch.emojis ? { ...patch, emojis: patch.emojis.slice(0, 1) } : patch
}

function normalizeCssColor(value?: string) {
  return (value || "").trim().toLowerCase()
}

function blockTypeColorFollowPatch(data: BlockData, patch: Partial<BlockData>) {
  if (!patch.nodeType || patch.nodeType === data.nodeType) return {}
  const previousDefaults = blockTypeDefaults[data.nodeType]
  const nextDefaults = blockTypeDefaults[patch.nodeType]
  return {
    ...(patch.backgroundColor === undefined && normalizeCssColor(data.backgroundColor) === normalizeCssColor(previousDefaults.backgroundColor)
      ? { backgroundColor: nextDefaults.backgroundColor }
      : {}),
    ...(patch.borderColor === undefined && normalizeCssColor(data.borderColor) === normalizeCssColor(previousDefaults.borderColor)
      ? { borderColor: nextDefaults.borderColor }
      : {}),
  }
}

export const useMapStore = create<MapState>((set, get) => ({
  mapTitle: defaultMapTitle,
  modelVersions: [],
  activeVersionId: allVersionsId,
  displayModeOverride: "block",
  nodes: [],
  edges: [],
  selectedNodeIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  saveStatus: "Saved",
  seededDemo: false,
  isHydrated: false,
  edgeStyleClipboard: readClipboard<EdgeStyleClipboard>(edgeStyleClipboardKey),
  blockStyleClipboard: readClipboard<BlockStyleClipboard>(blockStyleClipboardKey),
  blockClipboard: readClipboard<BlockClipboard>(blockClipboardKey),
  canvasHistory: [],

  markUnsaved: () => {
    const timer = get().autosaveTimer
    if (timer) window.clearTimeout(timer)
    const autosaveTimer = window.setTimeout(() => {
      void get().saveNow()
    }, 500)
    set({ saveStatus: "Unsaved", autosaveTimer })
  },

  hydrate: async () => {
    try {
      const persisted = await loadPersistedMap()
      if (persisted) {
        const map = normalizeExportedMap(persisted.map)
        set({
          mapTitle: normalizeMapTitle(map.title),
          modelVersions: map.modelVersions || [],
          activeVersionId: map.activeVersionId || allVersionsId,
          displayModeOverride: map.displayModeOverride || "block",
          nodes: applyContentHtml(map.nodes),
          edges: map.edges.map(applyEdgePresentation),
          viewport: map.viewport ?? { x: 0, y: 0, zoom: 1 },
          lastSavedAt: persisted.updatedAt,
          seededDemo: persisted.seededDemo,
          isHydrated: true,
          saveStatus: "Saved",
        })
        return
      }
      const demo = createDemoMap()
      set({
        mapTitle: normalizeMapTitle(demo.title),
        modelVersions: demo.modelVersions || [],
        activeVersionId: demo.activeVersionId || allVersionsId,
        displayModeOverride: demo.displayModeOverride || "block",
        nodes: applyContentHtml(demo.nodes),
        edges: demo.edges.map(applyEdgePresentation),
        viewport: demo.viewport ?? { x: 0, y: 0, zoom: 1 },
        seededDemo: true,
        isHydrated: true,
        saveStatus: "Unsaved",
      })
      await get().saveNow()
    } catch (error) {
      console.error("Failed to hydrate map", error)
      set({ isHydrated: true, saveStatus: "Error" })
    }
  },

  saveNow: async () => {
    const timer = get().autosaveTimer
    if (timer) window.clearTimeout(timer)
    set({ saveStatus: "Saving", autosaveTimer: undefined })
    try {
      const map = mapFromState(get())
      await savePersistedMap(map, get().seededDemo)
      set({ saveStatus: "Saved", lastSavedAt: map.updatedAt })
    } catch (error) {
      console.error("Failed to save map", error)
      set({ saveStatus: "Error" })
    }
  },

  addBlock: (position) => {
    get().addBlockAndSelect(position)
  },

  addBlockAndSelect: (position) => {
    const state = get()
    const variantKey = state.activeVersionId !== allVersionsId && state.modelVersions.some((version) => version.id === state.activeVersionId) ? state.activeVersionId : defaultVariantKey
    const node = createBlockNode(position, "New block", variantKey)
    set((state) => ({
      nodes: [...state.nodes, node],
      selectedNodeId: node.id,
      selectedNodeIds: [node.id],
      selectedEdgeId: undefined,
    }))
    get().markUnsaved()
    return node.id
  },

  addBlockNextToSelected: () => {
    const state = get()
    const source = findBlockNode(state.nodes, state.selectedNodeId)
    return get().addBlockAndSelect(source ? nextBlockPositionFrom(source, state.nodes) : undefined)
  },

  addLinkedBlockFromSelected: () => {
    const state = get()
    const source = findBlockNode(state.nodes, state.selectedNodeId)
    if (!source) return get().addBlockAndSelect()
    const variantKey = state.activeVersionId !== allVersionsId && state.modelVersions.some((version) => version.id === state.activeVersionId) ? state.activeVersionId : defaultVariantKey
    const node = createBlockNode(nextBlockPositionFrom(source, state.nodes), "New block", variantKey)
    const edge = createEdge({ source: source.id, target: node.id, sourceHandle: "right", targetHandle: "left-target" })
    set((nextState) => ({
      nodes: [...nextState.nodes, node],
      edges: addReactFlowEdge(edge, nextState.edges) as MapEdge[],
      selectedNodeId: node.id,
      selectedNodeIds: [node.id],
      selectedEdgeId: undefined,
    }))
    get().markUnsaved()
    return node.id
  },

  groupSelectedBlocks: () => {
    const state = get()
    const selectedBlocks = state.nodes.filter((node) => state.selectedNodeIds.includes(node.id) && isBlockNode(node) && !node.parentId)
    if (selectedBlocks.length < 2) return
    const padding = 36
    const bounds = selectedBlocks.reduce(
      (current, node) => {
        const position = absolutePosition(node, state.nodes)
        const size = getNodeSize(node)
        return {
          minX: Math.min(current.minX, position.x),
          minY: Math.min(current.minY, position.y),
          maxX: Math.max(current.maxX, position.x + size.width),
          maxY: Math.max(current.maxY, position.y + size.height),
        }
      },
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
    )
    const group = createGroupNode(
      { x: bounds.minX - padding, y: bounds.minY - padding },
      { width: bounds.maxX - bounds.minX + padding * 2, height: bounds.maxY - bounds.minY + padding * 2 },
    )
    const selectedIds = new Set(selectedBlocks.map((node) => node.id))
    const groupedNodes = state.nodes.map((node) => {
      if (!selectedIds.has(node.id) || !isBlockNode(node)) return node
      const position = absolutePosition(node, state.nodes)
      return {
        ...node,
        parentId: group.id,
        extent: "parent" as const,
        position: { x: position.x - group.position.x, y: position.y - group.position.y },
        selected: false,
      }
    })
    set({
      nodes: [group, ...groupedNodes],
      selectedNodeId: group.id,
      selectedNodeIds: [group.id],
      selectedEdgeId: undefined,
    })
    get().markUnsaved()
  },

  updateMapTitle: (title) => {
    set({ mapTitle: title })
    get().markUnsaved()
  },

  attachSelectedBlocksToFrame: () => {
    const state = get()
    const selectedFrame = state.nodes.find((node): node is GroupNode => state.selectedNodeIds.includes(node.id) && node.type === "group")
    if (!selectedFrame || selectedFrame.data.locked) return
    const blocks = state.nodes.filter((node): node is BlockNode => state.selectedNodeIds.includes(node.id) && isBlockNode(node) && node.parentId !== selectedFrame.id)
    if (!blocks.length) return
    set({
      nodes: state.nodes.map((node) => {
        if (!blocks.some((block) => block.id === node.id) || !isBlockNode(node)) return node
        const position = absolutePosition(node, state.nodes)
        return {
          ...node,
          parentId: selectedFrame.id,
          extent: "parent" as const,
          position: { x: position.x - selectedFrame.position.x, y: position.y - selectedFrame.position.y },
          selected: false,
        }
      }),
      selectedNodeId: selectedFrame.id,
      selectedNodeIds: [selectedFrame.id],
    })
    get().markUnsaved()
  },

  detachSelectedBlocksFromFrame: () => {
    const state = get()
    const blocks = selectedBlockNodes(state).filter((node) => node.parentId)
    if (!blocks.length) return
    set({
      nodes: state.nodes.map((node) => {
        if (!blocks.some((block) => block.id === node.id) || !isBlockNode(node)) return node
        const position = absolutePosition(node, state.nodes)
        return {
          ...node,
          parentId: undefined,
          extent: undefined,
          position,
        }
      }),
    })
    get().markUnsaved()
  },

  setActiveVersion: (versionId) => {
    const state = get()
    const activeVersionId = state.modelVersions.some((version) => version.id === versionId)
      ? versionId
      : state.modelVersions[0]?.id || allVersionsId
    set({
      activeVersionId,
      selectedEdgeId: undefined,
    })
    get().markUnsaved()
  },

  addModelVersion: () => {
    const state = get()
    if (state.modelVersions.length >= maxModelVersions) return
    const at = nowIso()
    const version: ModelVersion = {
      id: createId("version"),
      label: `Version ${state.modelVersions.length + 1}`,
      shortLabel: `V${state.modelVersions.length + 1}`,
      createdAt: at,
      updatedAt: at,
    }
    set({ modelVersions: [...state.modelVersions, version], activeVersionId: version.id })
    get().markUnsaved()
  },

  updateModelVersion: (id, patch) => {
    set((state) => ({
      modelVersions: state.modelVersions.map((version) =>
        version.id === id
          ? {
              ...version,
              label: patch.label !== undefined ? patch.label : version.label,
              shortLabel: patch.shortLabel !== undefined ? patch.shortLabel : version.shortLabel,
              updatedAt: nowIso(),
            }
          : version,
      ),
    }))
    get().markUnsaved()
  },

  deleteModelVersion: (id) => {
    set((state) => ({
      modelVersions: state.modelVersions.filter((version) => version.id !== id),
      activeVersionId:
        state.activeVersionId === id
          ? state.modelVersions.filter((version) => version.id !== id)[0]?.id || allVersionsId
          : state.activeVersionId,
      nodes: state.nodes.map((node) => {
        if (!isBlockNode(node)) return node
        const variants = { ...(node.data.variants || {}) }
        delete variants[id]
        const activeVariantKey = node.data.activeVariantKey === id ? defaultVariantKey : node.data.activeVariantKey
        const nextData = { ...node.data, variants, activeVariantKey }
        const renderedVariant = resolveVariantForMirror(nextData, activeVariantKey || defaultVariantKey, state.modelVersions.filter((version) => version.id !== id))
        return {
          ...node,
          data: {
            ...nextData,
            title: renderedVariant.title,
            contentJson: renderedVariant.contentJson,
            contentHtml: renderedVariant.contentHtml || contentJsonToHtml(renderedVariant.contentJson),
          },
        }
      }),
      edges: state.edges.map((edge) => {
        const visibility = edge.data?.visibility
        if (!Array.isArray(visibility)) return edge
        return applyEdgePresentation({
          ...edge,
          data: {
            ...defaultEdgeData,
            ...edge.data,
            createdAt: edge.data?.createdAt || nowIso(),
            visibility: visibility.filter((versionId) => versionId !== id),
            updatedAt: nowIso(),
          },
        })
      }),
    }))
    get().markUnsaved()
  },

  moveModelVersion: (id, direction) => {
    if (!window.confirm("Reorder model versions? Version inheritance is sequential, so changing order can change which content later versions inherit.")) return
    set((state) => {
      const index = state.modelVersions.findIndex((version) => version.id === id)
      const nextIndex = index + direction
      if (index < 0 || nextIndex < 0 || nextIndex >= state.modelVersions.length) return {}
      const modelVersions = [...state.modelVersions]
      const [version] = modelVersions.splice(index, 1)
      if (!version) return {}
      modelVersions.splice(nextIndex, 0, version)
      return { modelVersions }
    })
    get().markUnsaved()
  },

  setDisplayModeOverride: (mode) => {
    set({ displayModeOverride: mode })
    get().markUnsaved()
  },

  appendBlockMathToSelectedBlock: (latex) => {
    const selectedNodeId = get().selectedNodeId
    const node = findBlockNode(get().nodes, selectedNodeId)
    if (!selectedNodeId || !node) return
    const state = get()
    const variantKey = getBlockVariantKeyForState(state, node.data)
    const contentJson = cloneJson(resolveVariantForMirror(node.data, variantKey, state.modelVersions).contentJson)
    const content = Array.isArray(contentJson.content) ? contentJson.content : []
    get().updateBlock(selectedNodeId, {
      contentJson: {
        ...contentJson,
        type: contentJson.type || "doc",
        content: [...content, { type: "blockMath", attrs: { latex } }, { type: "paragraph" }],
      },
    })
  },

  duplicateBlock: (id) => {
    const source = findBlockNode(get().nodes, id)
    if (!source) return
    const at = nowIso()
    const duplicate: BlockNode = {
      ...source,
      id: createId("block"),
      position: { x: source.position.x + 36, y: source.position.y + 36 },
      selected: false,
      parentId: source.parentId,
      extent: source.extent,
      data: {
        ...cloneJson(source.data),
        title: `${source.data.title} copy`,
        contentJson: cloneJson(source.data.contentJson),
        emojis: [...(source.data.emojis || []).slice(0, 1)],
        createdAt: at,
        updatedAt: at,
      },
    }
    set((state) => ({
      nodes: [...state.nodes, duplicate],
      selectedNodeId: duplicate.id,
      selectedNodeIds: [duplicate.id],
      selectedEdgeId: undefined,
    }))
    get().markUnsaved()
  },

  duplicateSelectedBlock: () => {
    const selectedNodeId = get().selectedNodeId
    if (selectedNodeId) get().duplicateBlock(selectedNodeId)
  },

  copyBlock: (id) => {
    const source = findBlockNode(get().nodes, id)
    if (!source) return
    const clipboard: BlockClipboard = {
      data: {
        ...cloneJson(source.data),
        contentJson: cloneJson(source.data.contentJson),
        emojis: [...(source.data.emojis || []).slice(0, 1)],
      },
      position: { x: source.position.x, y: source.position.y },
      pasteCount: 0,
    }
    writeClipboard(blockClipboardKey, clipboard)
    set({ blockClipboard: clipboard })
  },

  copySelectedBlock: () => {
    const selectedNodeId = get().selectedNodeId
    if (selectedNodeId) get().copyBlock(selectedNodeId)
  },

  pasteBlock: () => {
    const clipboard = get().blockClipboard
    if (!clipboard) return
    const at = nowIso()
    const pasteCount = clipboard.pasteCount + 1
    const nextClipboard = { ...clipboard, pasteCount }
    const node: BlockNode = {
      id: createId("block"),
      type: "block",
      position: {
        x: clipboard.position.x + 36 * pasteCount,
        y: clipboard.position.y + 36 * pasteCount,
      },
      data: {
        ...cloneJson(clipboard.data),
        contentJson: cloneJson(clipboard.data.contentJson),
        emojis: [...(clipboard.data.emojis || []).slice(0, 1)],
        createdAt: at,
        updatedAt: at,
      },
    }
    writeClipboard(blockClipboardKey, nextClipboard)
    set((state) => ({
      nodes: [...state.nodes, node],
      selectedNodeId: node.id,
      selectedNodeIds: [node.id],
      selectedEdgeId: undefined,
      blockClipboard: nextClipboard,
    }))
    get().markUnsaved()
  },

  copyBlockStyle: (id) => {
    const source = findBlockNode(get().nodes, id)
    if (!source) return
    const clipboard = blockStyleFromData(source.data)
    writeClipboard(blockStyleClipboardKey, clipboard)
    set({ blockStyleClipboard: clipboard })
  },

  pasteBlockStyle: (id) => {
    const clipboard = get().blockStyleClipboard
    if (!clipboard) return
    get().updateBlock(id, { ...clipboard, emojis: [...(clipboard.emojis || []).slice(0, 1)] })
  },

  updateBlock: (id, patch) => {
    const sharedPatch = { ...patch }
    const variantPatch: Partial<Pick<BlockData, "title" | "contentJson" | "contentHtml">> = {}
    if ("title" in sharedPatch) {
      variantPatch.title = sharedPatch.title
      delete sharedPatch.title
    }
    if ("contentJson" in sharedPatch) {
      variantPatch.contentJson = sharedPatch.contentJson
      delete sharedPatch.contentJson
    }
    if ("contentHtml" in sharedPatch) {
      variantPatch.contentHtml = sharedPatch.contentHtml
      delete sharedPatch.contentHtml
    }
    const resolvedPatch = blockTypePatch(sharedPatch)
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id !== id || !isBlockNode(node)) return node
        const variantKey = getBlockVariantKeyForState(state, node.data)
        const variants = Object.keys(variantPatch).length ? patchBlockVariant(node.data, variantKey, variantPatch, state.modelVersions) : node.data.variants
        const nextData = { ...node.data, variants }
        const resolvedVariant = resolveVariantForMirror(nextData, variantKey, state.modelVersions)
        const typeColorPatch = blockTypeColorFollowPatch(node.data, resolvedPatch)
        return {
          ...node,
          data: {
            ...node.data,
            ...resolvedPatch,
            ...typeColorPatch,
            variants,
            activeVariantKey: state.activeVersionId === allVersionsId ? variantKey : node.data.activeVariantKey,
            title: resolvedVariant.title,
            contentJson: resolvedVariant.contentJson,
            contentHtml: resolvedVariant.contentHtml || contentJsonToHtml(resolvedVariant.contentJson),
            updatedAt: nowIso(),
          },
        }
      }),
    }))
    get().markUnsaved()
  },

  applyBlockTypeStyle: (id) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id !== id || !isBlockNode(node)) return node
        const defaults = blockTypeDefaults[node.data.nodeType]
        return {
          ...node,
          data: {
            ...node.data,
            backgroundColor: defaults.backgroundColor,
            borderColor: defaults.borderColor,
            updatedAt: nowIso(),
          },
        }
      }),
    }))
    get().markUnsaved()
  },

  setBlockActiveVariant: (id, variantKey) => {
    const state = get()
    const key = getVariantKey(allVersionsId, variantKey)
    if (key !== defaultVariantKey && !state.modelVersions.some((version) => version.id === key)) return
    set((nextState) => ({
      nodes: nextState.nodes.map((node) => {
        if (node.id !== id || !isBlockNode(node)) return node
        const variant = resolveVariantForMirror(node.data, key, nextState.modelVersions)
        return {
          ...node,
          data: {
            ...node.data,
            activeVariantKey: key,
            title: variant.title,
            contentJson: variant.contentJson,
            contentHtml: variant.contentHtml || contentJsonToHtml(variant.contentJson),
            updatedAt: nowIso(),
          },
        }
      }),
    }))
    get().markUnsaved()
  },

  updateBlockVariant: (id, variantKey, patch) => {
    const state = get()
    const key = getVariantKey(allVersionsId, variantKey)
    if (key !== defaultVariantKey && !state.modelVersions.some((version) => version.id === key)) return
    set((nextState) => ({
      nodes: nextState.nodes.map((node) => {
        if (node.id !== id || !isBlockNode(node)) return node
        const variants = patchBlockVariant(node.data, key, patch, nextState.modelVersions)
        const nextData = { ...node.data, variants }
        const resolvedVariant = resolveVariantForMirror(nextData, key, nextState.modelVersions)
        return {
          ...node,
          data: {
            ...node.data,
            variants,
            activeVariantKey: key,
            title: resolvedVariant.title,
            contentJson: resolvedVariant.contentJson,
            contentHtml: resolvedVariant.contentHtml || contentJsonToHtml(resolvedVariant.contentJson),
            updatedAt: nowIso(),
          },
        }
      }),
    }))
    get().markUnsaved()
  },

  copyBlockVariantToVersion: (id, versionId) => {
    const state = get()
    if (!state.modelVersions.some((version) => version.id === versionId)) return
    const source = findBlockNode(state.nodes, id)
    if (!source) return
    const requestedKey = getBlockVariantKeyForState(state, source.data)
    const current = resolveVariantForMirror(source.data, requestedKey, state.modelVersions)
    set((nextState) => ({
      nodes: nextState.nodes.map((node) =>
        node.id === id && isBlockNode(node)
          ? {
              ...node,
              data: {
                ...node.data,
                variants: {
                  ...node.data.variants,
                  [versionId]: { ...current, updatedAt: nowIso() },
                },
                activeVariantKey: versionId,
                updatedAt: nowIso(),
              },
            }
          : node,
      ),
    }))
    get().markUnsaved()
  },

  deleteBlockVariant: (id, variantKey) => {
    if (variantKey === defaultVariantKey) return
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id !== id || !isBlockNode(node)) return node
        const variants = { ...(node.data.variants || {}) }
        delete variants[variantKey]
        const nextActiveVariantKey = node.data.activeVariantKey === variantKey ? defaultVariantKey : node.data.activeVariantKey
        const nextData = { ...node.data, variants, activeVariantKey: nextActiveVariantKey }
        const resolvedVariant = resolveVariantForMirror(nextData, nextActiveVariantKey || defaultVariantKey, state.modelVersions)
        return {
          ...node,
          data: {
            ...node.data,
            variants,
            activeVariantKey: nextActiveVariantKey,
            title: resolvedVariant.title,
            contentJson: resolvedVariant.contentJson,
            contentHtml: resolvedVariant.contentHtml || contentJsonToHtml(resolvedVariant.contentJson),
            updatedAt: nowIso(),
          },
        }
      }),
    }))
    get().markUnsaved()
  },

  updateGroup: (id, patch) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id && node.type === "group"
          ? {
              ...node,
              data: { ...node.data, ...patch, updatedAt: nowIso() },
            }
          : node,
      ),
    }))
    get().markUnsaved()
  },

  deleteSelected: () => {
    const { selectedNodeIds, selectedNodeId, selectedEdgeId } = get()
    if (selectedNodeIds.length) {
      selectedNodeIds.forEach((id) => get().deleteBlock(id))
      return
    }
    if (selectedNodeId) get().deleteBlock(selectedNodeId)
    if (selectedEdgeId) get().deleteEdge(selectedEdgeId)
  },

  deleteBlock: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id && node.parentId !== id),
      edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
      selectedNodeId: state.selectedNodeId === id ? undefined : state.selectedNodeId,
      selectedNodeIds: state.selectedNodeIds.filter((nodeId) => nodeId !== id),
    }))
    get().markUnsaved()
  },

  addEdge: (connection) => {
    const edge = createEdge(connection)
    set((state) => ({ edges: addReactFlowEdge(edge, state.edges) as MapEdge[] }))
    get().markUnsaved()
  },

  updateEdge: (id, patch) => {
    set((state) => ({
      edges: state.edges.map((edge) => {
        if (edge.id !== id) return edge
        const color = patch.color ?? edge.data?.color ?? defaultEdgeData.color
        const createdAt = edge.data?.createdAt || nowIso()
        return applyEdgePresentation({
          ...edge,
          data: { ...edge.data, ...patch, color, createdAt, updatedAt: nowIso() },
        })
      }),
    }))
    get().markUnsaved()
  },

  copyEdgeStyle: (id) => {
    const source = get().edges.find((edge) => edge.id === id)
    if (!source) return
    const clipboard = edgeStyleFromData(source.data)
    writeClipboard(edgeStyleClipboardKey, clipboard)
    set({ edgeStyleClipboard: clipboard })
  },

  pasteEdgeStyle: (id) => {
    const clipboard = get().edgeStyleClipboard
    if (!clipboard) return
    get().updateEdge(id, clipboard)
  },

  deleteEdge: (id) => {
    set((state) => ({ edges: state.edges.filter((edge) => edge.id !== id), selectedEdgeId: undefined }))
    get().markUnsaved()
  },

  setSelectedNode: (id) => {
    const state = get()
    if (state.selectedNodeId === id && state.selectedEdgeId === undefined) return
    const selectedNodeIds = id ? [id] : []
    set({ selectedNodeId: id, selectedNodeIds, selectedEdgeId: undefined })
  },
  setSelectedNodes: (ids) => {
    const state = get()
    if (
      state.selectedEdgeId === undefined &&
      state.selectedNodeIds.length === ids.length &&
      state.selectedNodeIds.every((id, index) => id === ids[index])
    ) {
      return
    }
    const selectedNodeId = ids[0]
    set({ selectedNodeId, selectedNodeIds: ids, selectedEdgeId: undefined })
  },
  setSelectedEdge: (id) => {
    const state = get()
    if (state.selectedEdgeId === id && state.selectedNodeId === undefined) return
    set({ selectedEdgeId: id, selectedNodeId: undefined, selectedNodeIds: [] })
  },

  setViewport: (viewport) => {
    const current = get().viewport
    if (current.x === viewport.x && current.y === viewport.y && current.zoom === viewport.zoom) return
    set({ viewport })
    get().markUnsaved()
  },

  alignSelectedBlocks: (command) => {
    const state = get()
    const blocks = selectedBlockNodes(state)
    if (blocks.length < 2) return
    const measurements = blocks.map((node) => ({ node, position: absolutePosition(node, state.nodes), size: getNodeSize(node) }))
    const minX = Math.min(...measurements.map((item) => item.position.x))
    const maxX = Math.max(...measurements.map((item) => item.position.x + item.size.width))
    const minY = Math.min(...measurements.map((item) => item.position.y))
    const maxY = Math.max(...measurements.map((item) => item.position.y + item.size.height))
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2
    set({
      nodes: state.nodes.map((node) => {
        const item = measurements.find((entry) => entry.node.id === node.id)
        if (!item) return node
        const next = { ...item.position }
        if (command === "left") next.x = minX
        if (command === "right") next.x = maxX - item.size.width
        if (command === "top") next.y = minY
        if (command === "bottom") next.y = maxY - item.size.height
        if (command === "horizontal_center") next.x = centerX - item.size.width / 2
        if (command === "vertical_center") next.y = centerY - item.size.height / 2
        return { ...node, position: relativePositionFromAbsolute(node, state.nodes, next) }
      }),
    })
    get().markUnsaved()
  },

  distributeSelectedBlocks: (command) => {
    const state = get()
    const blocks = selectedBlockNodes(state)
    if (blocks.length < 3) return
    const measurements = blocks
      .map((node) => ({ node, position: absolutePosition(node, state.nodes), size: getNodeSize(node) }))
      .sort((a, b) => (command === "horizontal" ? a.position.x - b.position.x : a.position.y - b.position.y))
    const first = measurements[0]
    const last = measurements[measurements.length - 1]
    const start = command === "horizontal" ? first.position.x : first.position.y
    const end = command === "horizontal" ? last.position.x : last.position.y
    const step = (end - start) / (measurements.length - 1)
    set({
      nodes: state.nodes.map((node) => {
        const index = measurements.findIndex((entry) => entry.node.id === node.id)
        if (index < 0) return node
        const item = measurements[index]
        const next = { ...item.position }
        if (command === "horizontal") next.x = start + step * index
        else next.y = start + step * index
        return { ...node, position: relativePositionFromAbsolute(node, state.nodes, next) }
      }),
    })
    get().markUnsaved()
  },

  snapSelectedBlocksToGrid: () => {
    const state = get()
    const ids = new Set(selectedBlockNodes(state).map((node) => node.id))
    if (!ids.size) return
    set({
      nodes: state.nodes.map((node) => {
        if (!ids.has(node.id)) return node
        const position = absolutePosition(node, state.nodes)
        return { ...node, position: relativePositionFromAbsolute(node, state.nodes, { x: roundToGrid(position.x), y: roundToGrid(position.y) }) }
      }),
    })
    get().markUnsaved()
  },

  snapAllBlocksToGrid: () => {
    const state = get()
    set({
      nodes: state.nodes.map((node) => {
        if (!isBlockNode(node)) return node
        const position = absolutePosition(node, state.nodes)
        return { ...node, position: relativePositionFromAbsolute(node, state.nodes, { x: roundToGrid(position.x), y: roundToGrid(position.y) }) }
      }),
    })
    get().markUnsaved()
  },

  straightenNearAxisEdges: () => {
    const state = get()
    const selectedNodeIds = new Set(state.selectedNodeIds)
    const selectedEdgeId = state.selectedEdgeId
    const adjustments = new Map<string, XYPosition[]>()
    const blocksById = new Map(state.nodes.filter(isBlockNode).map((node) => [node.id, node]))
    const scopedEdges = state.edges.filter((edge) => {
      if (selectedEdgeId) return edge.id === selectedEdgeId
      if (selectedNodeIds.size) return selectedNodeIds.has(edge.source) || selectedNodeIds.has(edge.target)
      return true
    })
    scopedEdges.forEach((edge) => {
      const source = blocksById.get(edge.source)
      const target = blocksById.get(edge.target)
      if (!source || !target) return
      const sourcePos = absolutePosition(source, state.nodes)
      const targetPos = absolutePosition(target, state.nodes)
      const sourceSize = getNodeSize(source)
      const targetSize = getNodeSize(target)
      const sourceCenter = { x: sourcePos.x + sourceSize.width / 2, y: sourcePos.y + sourceSize.height / 2 }
      const targetCenter = { x: targetPos.x + targetSize.width / 2, y: targetPos.y + targetSize.height / 2 }
      const dx = sourceCenter.x - targetCenter.x
      const dy = sourceCenter.y - targetCenter.y
      const moveTarget = selectedNodeIds.size ? selectedNodeIds.has(target.id) : true
      const candidate = moveTarget ? target : source
      const candidatePos = moveTarget ? targetPos : sourcePos
      const list = adjustments.get(candidate.id) || []
      if (Math.abs(dx) <= microStraightenTolerance && Math.abs(dy) > microStraightenTolerance) {
        list.push({ x: candidatePos.x + (moveTarget ? dx : -dx), y: candidatePos.y })
      } else if (Math.abs(dy) <= microStraightenTolerance && Math.abs(dx) > microStraightenTolerance) {
        list.push({ x: candidatePos.x, y: candidatePos.y + (moveTarget ? dy : -dy) })
      }
      if (list.length) adjustments.set(candidate.id, list)
    })
    if (!adjustments.size) return
    set({
      nodes: state.nodes.map((node) => {
        const nodeAdjustments = adjustments.get(node.id)
        if (!nodeAdjustments?.length) return node
        const base = absolutePosition(node, state.nodes)
        const small = nodeAdjustments.filter(
          (next) => Math.abs(next.x - base.x) <= microStraightenTolerance && Math.abs(next.y - base.y) <= microStraightenTolerance,
        )
        if (!small.length) {
          console.warn(`Skipped conflicting micro-straighten adjustment for ${node.id}.`)
          return node
        }
        small.sort((a, b) => Math.abs(a.x - base.x) + Math.abs(a.y - base.y) - (Math.abs(b.x - base.x) + Math.abs(b.y - base.y)))
        return { ...node, position: relativePositionFromAbsolute(node, state.nodes, small[0]) }
      }),
    })
    get().markUnsaved()
  },

  clearMap: () => {
    set({
      modelVersions: [],
      activeVersionId: allVersionsId,
      displayModeOverride: "block",
      nodes: [],
      edges: [],
      canvasHistory: [],
      pendingDragSnapshot: undefined,
      selectedNodeId: undefined,
      selectedNodeIds: [],
      selectedEdgeId: undefined,
      seededDemo: true,
    })
    get().markUnsaved()
  },

  loadMap: (map, markUnsaved = true) => {
    set({
      mapTitle: normalizeMapTitle(map.title),
      modelVersions: map.modelVersions || [],
      activeVersionId: map.activeVersionId || allVersionsId,
      displayModeOverride: map.displayModeOverride || "block",
      nodes: applyContentHtml(map.nodes),
      edges: map.edges.map(applyEdgePresentation),
      canvasHistory: [],
      pendingDragSnapshot: undefined,
      viewport: map.viewport ?? { x: 0, y: 0, zoom: 1 },
      selectedNodeId: undefined,
      selectedNodeIds: [],
      selectedEdgeId: undefined,
      seededDemo: true,
      saveStatus: markUnsaved ? "Unsaved" : "Saved",
    })
    if (markUnsaved) get().markUnsaved()
  },

  onNodesChange: (changes) => {
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) as MapNode[] }))
    get().markUnsaved()
  },

  beginNodeDragHistory: () => {
    const state = get()
    if (state.pendingDragSnapshot) return
    set({ pendingDragSnapshot: createCanvasHistorySnapshot(state.nodes, state.edges) })
  },

  commitNodeDragHistory: () => {
    const state = get()
    const pending = state.pendingDragSnapshot
    if (!pending) return
    const currentSignature = createCanvasHistorySnapshot(state.nodes, state.edges).signature
    if (currentSignature === pending.signature) {
      set({ pendingDragSnapshot: undefined })
      return
    }
    set({
      canvasHistory: [...state.canvasHistory, pending].slice(-maxCanvasHistoryEntries),
      pendingDragSnapshot: undefined,
    })
  },

  undoLastCanvasChange: () => {
    const state = get()
    const snapshot = state.canvasHistory[state.canvasHistory.length - 1]
    if (!snapshot) return
    set({
      nodes: cloneJson(snapshot.nodes),
      edges: cloneJson(snapshot.edges).map(applyEdgePresentation),
      canvasHistory: state.canvasHistory.slice(0, -1),
      pendingDragSnapshot: undefined,
      saveStatus: "Unsaved",
    })
    get().markUnsaved()
  },

  onEdgesChange: (changes) => {
    set((state) => ({ edges: (applyEdgeChanges(changes, state.edges) as MapEdge[]).map(applyEdgePresentation) }))
    get().markUnsaved()
  },
}))
