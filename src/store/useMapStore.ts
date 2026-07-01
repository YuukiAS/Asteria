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
import { createDemoMap } from "../lib/demo"
import {
  applyEdgePresentation,
  createBlockNode,
  createEdge,
  createGroupNode,
  defaultEdgeData,
  defaultMapTitle,
  normalizeMapTitle,
  normalizeExportedMap,
} from "../lib/exportImport"
import { loadPersistedMap, savePersistedMap } from "../lib/db"
import { contentJsonToHtml } from "../editor/editorUtils"
import { createId } from "../lib/ids"
import { nowIso } from "../lib/time"
import type {
  BlockData,
  BlockNode,
  EdgeArrow,
  EdgeLineStyle,
  EdgePathType,
  ExportedMap,
  GroupNode,
  MapEdge,
  MapEdgeData,
  MapNode,
  MapViewport,
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
  "backgroundColor" | "textColor" | "borderColor" | "width" | "height" | "nodeType" | "showStatus" | "status" | "emojis"
>

type BlockClipboard = {
  data: BlockData
  position: { x: number; y: number }
  pasteCount: number
}

const edgeStyleClipboardKey = "asteria-edge-style-clipboard"
const blockStyleClipboardKey = "asteria-block-style-clipboard"
const blockClipboardKey = "asteria-block-clipboard"

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

type MapState = {
  mapTitle: string
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
  addBlock: (position?: { x: number; y: number }) => void
  groupSelectedBlocks: () => void
  updateMapTitle: (title: string) => void
  appendBlockMathToSelectedBlock: (latex: string) => void
  updateBlock: (id: string, patch: Partial<BlockData>) => void
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
  clearMap: () => void
  loadMap: (map: ExportedMap, markUnsaved?: boolean) => void
  onNodesChange: (changes: NodeChange<MapNode>[]) => void
  onEdgesChange: (changes: EdgeChange<MapEdge>[]) => void
  saveNow: () => Promise<void>
  hydrate: () => Promise<void>
  markUnsaved: () => void
}

function mapFromState(state: Pick<MapState, "mapTitle" | "nodes" | "edges" | "viewport">): ExportedMap {
  return { version: 1, title: normalizeMapTitle(state.mapTitle), nodes: state.nodes, edges: state.edges, viewport: state.viewport, updatedAt: nowIso() }
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
    return {
      ...node,
      data: {
        ...node.data,
        contentHtml: node.data.contentHtml || contentJsonToHtml(node.data.contentJson),
      },
    }
  })
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

function blockStyleFromData(data: BlockData): BlockStyleClipboard {
  return {
    backgroundColor: data.backgroundColor,
    textColor: data.textColor,
    borderColor: data.borderColor,
    width: data.width,
    height: data.height,
    nodeType: data.nodeType,
    showStatus: data.showStatus,
    status: data.status,
    emojis: data.emojis,
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
  const defaults = blockTypeDefaults[patch.nodeType]
  return {
    ...defaults,
    ...patch,
    emojis: patch.emojis ?? (defaults.emojis ? [...defaults.emojis] : patch.emojis),
    contentJson: patch.contentJson ?? (defaults.contentJson ? cloneJson(defaults.contentJson) : patch.contentJson),
  }
}

export const useMapStore = create<MapState>((set, get) => ({
  mapTitle: defaultMapTitle,
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
    const node = createBlockNode(position)
    set((state) => ({ nodes: [...state.nodes, node], selectedNodeId: node.id, selectedNodeIds: [node.id], selectedEdgeId: undefined }))
    get().markUnsaved()
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

  appendBlockMathToSelectedBlock: (latex) => {
    const selectedNodeId = get().selectedNodeId
    const node = findBlockNode(get().nodes, selectedNodeId)
    if (!selectedNodeId || !node) return
    const contentJson = cloneJson(node.data.contentJson)
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
        emojis: [...(source.data.emojis || [])],
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
        emojis: [...(source.data.emojis || [])],
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
        emojis: [...(clipboard.data.emojis || [])],
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
    get().updateBlock(id, { ...clipboard, emojis: [...(clipboard.emojis || [])] })
  },

  updateBlock: (id, patch) => {
    const resolvedPatch = blockTypePatch(patch)
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id && isBlockNode(node)
          ? {
              ...node,
              data: {
                ...node.data,
                ...resolvedPatch,
                updatedAt: nowIso(),
                contentHtml: resolvedPatch.contentJson
                  ? contentJsonToHtml(resolvedPatch.contentJson)
                  : resolvedPatch.contentHtml ?? node.data.contentHtml,
              },
            }
          : node,
      ),
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
    set({ selectedNodeId: id, selectedNodeIds: id ? [id] : [], selectedEdgeId: undefined })
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

  clearMap: () => {
    set({ nodes: [], edges: [], selectedNodeId: undefined, selectedNodeIds: [], selectedEdgeId: undefined, seededDemo: true })
    get().markUnsaved()
  },

  loadMap: (map, markUnsaved = true) => {
    set({
      mapTitle: normalizeMapTitle(map.title),
      nodes: applyContentHtml(map.nodes),
      edges: map.edges.map(applyEdgePresentation),
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

  onEdgesChange: (changes) => {
    set((state) => ({ edges: (applyEdgeChanges(changes, state.edges) as MapEdge[]).map(applyEdgePresentation) }))
    get().markUnsaved()
  },
}))
