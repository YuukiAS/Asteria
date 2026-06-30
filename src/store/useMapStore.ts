import {
  addEdge as addReactFlowEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react"
import { create } from "zustand"
import { createDemoMap } from "../lib/demo"
import { applyEdgePresentation, createBlockNode, createEdge, defaultEdgeData } from "../lib/exportImport"
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
  MapEdge,
  MapEdgeData,
  MapViewport,
  SaveStatus,
} from "../types/map"

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
  nodes: BlockNode[]
  edges: MapEdge[]
  selectedNodeId?: string
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
  updateBlock: (id: string, patch: Partial<BlockData>) => void
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
  setSelectedEdge: (id?: string) => void
  setViewport: (viewport: MapViewport) => void
  clearMap: () => void
  loadMap: (map: ExportedMap, markUnsaved?: boolean) => void
  onNodesChange: (changes: NodeChange<BlockNode>[]) => void
  onEdgesChange: (changes: EdgeChange<MapEdge>[]) => void
  saveNow: () => Promise<void>
  hydrate: () => Promise<void>
  markUnsaved: () => void
}

function mapFromState(state: Pick<MapState, "nodes" | "edges" | "viewport">): ExportedMap {
  return { version: 1, nodes: state.nodes, edges: state.edges, viewport: state.viewport, updatedAt: nowIso() }
}

function applyContentHtml(nodes: BlockNode[]) {
  return nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      contentHtml: node.data.contentHtml || contentJsonToHtml(node.data.contentJson),
    },
  }))
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

export const useMapStore = create<MapState>((set, get) => ({
  nodes: [],
  edges: [],
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
        set({
          nodes: applyContentHtml(persisted.map.nodes),
          edges: persisted.map.edges.map(applyEdgePresentation),
          viewport: persisted.map.viewport ?? { x: 0, y: 0, zoom: 1 },
          lastSavedAt: persisted.updatedAt,
          seededDemo: persisted.seededDemo,
          isHydrated: true,
          saveStatus: "Saved",
        })
        return
      }
      const demo = createDemoMap()
      set({
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
    set((state) => ({ nodes: [...state.nodes, node], selectedNodeId: node.id, selectedEdgeId: undefined }))
    get().markUnsaved()
  },

  duplicateBlock: (id) => {
    const source = get().nodes.find((node) => node.id === id)
    if (!source) return
    const at = nowIso()
    const duplicate: BlockNode = {
      ...source,
      id: createId("block"),
      position: { x: source.position.x + 36, y: source.position.y + 36 },
      selected: false,
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
      selectedEdgeId: undefined,
    }))
    get().markUnsaved()
  },

  duplicateSelectedBlock: () => {
    const selectedNodeId = get().selectedNodeId
    if (selectedNodeId) get().duplicateBlock(selectedNodeId)
  },

  copyBlock: (id) => {
    const source = get().nodes.find((node) => node.id === id)
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
      selectedEdgeId: undefined,
      blockClipboard: nextClipboard,
    }))
    get().markUnsaved()
  },

  copyBlockStyle: (id) => {
    const source = get().nodes.find((node) => node.id === id)
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
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                ...patch,
                updatedAt: nowIso(),
                contentHtml: patch.contentJson ? contentJsonToHtml(patch.contentJson) : patch.contentHtml ?? node.data.contentHtml,
              },
            }
          : node,
      ),
    }))
    get().markUnsaved()
  },

  deleteSelected: () => {
    const { selectedNodeId, selectedEdgeId } = get()
    if (selectedNodeId) get().deleteBlock(selectedNodeId)
    if (selectedEdgeId) get().deleteEdge(selectedEdgeId)
  },

  deleteBlock: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
      selectedNodeId: state.selectedNodeId === id ? undefined : state.selectedNodeId,
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
    set({ selectedNodeId: id, selectedEdgeId: undefined })
  },
  setSelectedEdge: (id) => {
    const state = get()
    if (state.selectedEdgeId === id && state.selectedNodeId === undefined) return
    set({ selectedEdgeId: id, selectedNodeId: undefined })
  },

  setViewport: (viewport) => {
    const current = get().viewport
    if (current.x === viewport.x && current.y === viewport.y && current.zoom === viewport.zoom) return
    set({ viewport })
    get().markUnsaved()
  },

  clearMap: () => {
    set({ nodes: [], edges: [], selectedNodeId: undefined, selectedEdgeId: undefined, seededDemo: true })
    get().markUnsaved()
  },

  loadMap: (map, markUnsaved = true) => {
    set({
      nodes: applyContentHtml(map.nodes),
      edges: map.edges.map(applyEdgePresentation),
      viewport: map.viewport ?? { x: 0, y: 0, zoom: 1 },
      selectedNodeId: undefined,
      selectedEdgeId: undefined,
      seededDemo: true,
      saveStatus: markUnsaved ? "Unsaved" : "Saved",
    })
    if (markUnsaved) get().markUnsaved()
  },

  onNodesChange: (changes) => {
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) as BlockNode[] }))
    get().markUnsaved()
  },

  onEdgesChange: (changes) => {
    set((state) => ({ edges: (applyEdgeChanges(changes, state.edges) as MapEdge[]).map(applyEdgePresentation) }))
    get().markUnsaved()
  },
}))
