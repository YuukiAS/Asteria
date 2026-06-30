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
import { createBlockNode, createEdge } from "../lib/exportImport"
import { loadPersistedMap, savePersistedMap } from "../lib/db"
import { contentJsonToHtml } from "../editor/editorUtils"
import { nowIso } from "../lib/time"
import type { BlockData, BlockNode, ExportedMap, MapEdge, MapEdgeData, MapViewport, SaveStatus } from "../types/map"

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
  addBlock: (position?: { x: number; y: number }) => void
  updateBlock: (id: string, patch: Partial<BlockData>) => void
  deleteSelected: () => void
  deleteBlock: (id: string) => void
  addEdge: (connection: Connection) => void
  updateEdge: (id: string, patch: Partial<MapEdgeData>) => void
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

export const useMapStore = create<MapState>((set, get) => ({
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  saveStatus: "Saved",
  seededDemo: false,
  isHydrated: false,

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
          edges: persisted.map.edges,
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
        edges: demo.edges,
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
        const color = patch.color ?? edge.data?.color ?? "#94a3b8"
        const createdAt = edge.data?.createdAt || nowIso()
        return {
          ...edge,
          data: { ...edge.data, ...patch, color, createdAt, updatedAt: nowIso() },
          style: { ...(edge.style || {}), stroke: color, strokeWidth: 1.5 },
        }
      }),
    }))
    get().markUnsaved()
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
      edges: map.edges,
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
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) as MapEdge[] }))
    get().markUnsaved()
  },
}))
