import type { Connection, Edge } from "@xyflow/react"
import { defaultBlockColors } from "../constants/palette"
import type { BlockData, BlockNode, ExportedMap, MapEdgeData, MapViewport } from "../types/map"
import { createId } from "./ids"
import { nowIso } from "./time"

export const defaultContentJson = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "New block" }] }],
}

export function paragraphJson(text: string) {
  return {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  }
}

export function createBlockNode(position = { x: 120, y: 120 }, title = "New block"): BlockNode {
  const at = nowIso()
  return {
    id: createId("block"),
    type: "block",
    position,
    data: {
      title,
      contentJson: defaultContentJson,
      contentHtml: "<p>New block</p>",
      backgroundColor: defaultBlockColors.background,
      textColor: defaultBlockColors.text,
      borderColor: defaultBlockColors.border,
      width: 340,
      height: 220,
      nodeType: "generic",
      createdAt: at,
      updatedAt: at,
    },
  }
}

export function createEdge(connection: Connection): Edge<MapEdgeData> {
  const at = nowIso()
  return {
    id: createId("edge"),
    ...connection,
    type: "smoothstep",
    data: { color: defaultBlockColors.edge, createdAt: at, updatedAt: at },
    style: { stroke: defaultBlockColors.edge, strokeWidth: 1.5 },
  }
}

function normalizeBlockData(input: Partial<BlockData> & { content?: string }): BlockData {
  const at = nowIso()
  const contentJson = input.contentJson ?? paragraphJson(input.content ?? "Recovered block")
  const width = Number(input.width)
  const height = Number(input.height)
  if (!input.contentJson && input.content) {
    console.warn("Migrated legacy content string into Tiptap JSON.")
  }
  return {
    title: input.title || "Untitled block",
    contentJson,
    contentHtml: input.contentHtml,
    backgroundColor: input.backgroundColor || defaultBlockColors.background,
    textColor: input.textColor || defaultBlockColors.text,
    borderColor: input.borderColor || defaultBlockColors.border,
    width: Number.isFinite(width) ? Math.min(Math.max(width, 220), 860) : 340,
    height: Number.isFinite(height) ? Math.min(Math.max(height, 160), 720) : 220,
    nodeType: input.nodeType === "generic" ? input.nodeType : "generic",
    createdAt: input.createdAt || at,
    updatedAt: input.updatedAt || at,
  }
}

export function normalizeExportedMap(input: unknown): ExportedMap {
  if (!input || typeof input !== "object") throw new Error("Imported JSON must be an object.")
  const raw = input as Partial<ExportedMap>
  if (raw.version !== 1) throw new Error("Only Asteria map version 1 is supported.")
  if (!Array.isArray(raw.nodes) || !Array.isArray(raw.edges)) {
    throw new Error("Imported JSON must include nodes and edges arrays.")
  }
  const nodes = raw.nodes.map((node, index) => {
    try {
      return {
        ...node,
        id: node.id || createId("block"),
        type: "block" as const,
        position: node.position || { x: 120 + index * 80, y: 120 + index * 60 },
        data: normalizeBlockData(node.data as Partial<BlockData> & { content?: string }),
      }
    } catch (error) {
      console.warn("Recovered malformed block during import.", error)
      return createBlockNode({ x: 120 + index * 80, y: 120 + index * 60 }, "Recovered block")
    }
  })
  const edges = raw.edges.map((edge) => {
    const color = edge.data?.color || defaultBlockColors.edge
    return {
      ...edge,
      id: edge.id || createId("edge"),
      type: edge.type || "smoothstep",
      data: {
        label: edge.data?.label,
        color,
        createdAt: edge.data?.createdAt || nowIso(),
        updatedAt: edge.data?.updatedAt || nowIso(),
      },
      style: { ...(edge.style || {}), stroke: color, strokeWidth: 1.5 },
    }
  })
  const viewport: MapViewport | undefined = raw.viewport
    ? { x: Number(raw.viewport.x) || 0, y: Number(raw.viewport.y) || 0, zoom: Number(raw.viewport.zoom) || 1 }
    : undefined
  return { version: 1, nodes, edges, viewport, updatedAt: raw.updatedAt || nowIso() }
}

export function exportMapFile(map: ExportedMap, filename: string) {
  const blob = new Blob([JSON.stringify(map, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function readJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)))
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
