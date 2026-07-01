import { MarkerType, type Connection, type Edge } from "@xyflow/react"
import {
  edgeArrowOptions,
  edgeLineStyleOptions,
  edgePathTypeOptions,
  edgeStrokeWidthOptions,
  validBlockNodeTypes,
  validBlockStatuses,
} from "../constants/blockTypes"
import { blockTypeDefaults } from "../constants/blockDefaults"
import { defaultBlockColors } from "../constants/palette"
import type {
  BlockData,
  BlockNode,
  BlockNodeType,
  BlockStatus,
  EdgeArrow,
  EdgeLineStyle,
  EdgePathType,
  ExportedMap,
  GroupData,
  GroupNode,
  MapEdge,
  MapEdgeData,
  MapNode,
  MapViewport,
} from "../types/map"
import { createId } from "./ids"
import { formatJsonTimestamp, nowIso } from "./time"

export const defaultMapTitle = "Local trace map"

export const defaultContentJson = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "New block" }] }],
}

export function normalizeMapTitle(value: unknown) {
  const title = typeof value === "string" ? value.trim() : ""
  return title || defaultMapTitle
}

function slugifyTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function createExportFilename(title: string, date = new Date()) {
  const slug = slugifyTitle(title)
  const prefix = slug || "trace-map"
  return `${prefix}-${formatJsonTimestamp(date)}.json`
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
      backgroundColor: blockTypeDefaults.generic.backgroundColor,
      textColor: blockTypeDefaults.generic.textColor,
      borderColor: blockTypeDefaults.generic.borderColor,
      width: 340,
      height: 220,
      nodeType: "generic",
      showStatus: false,
      status: "undo",
      emojis: [],
      createdAt: at,
      updatedAt: at,
    },
  }
}

export function createGroupNode(position = { x: 80, y: 80 }, size = { width: 420, height: 300 }, title = "Group"): GroupNode {
  const at = nowIso()
  return {
    id: createId("group"),
    type: "group",
    position,
    style: { width: size.width, height: size.height },
    data: {
      title,
      backgroundColor: "rgba(219, 234, 254, 0.22)",
      borderColor: defaultBlockColors.border,
      createdAt: at,
      updatedAt: at,
    },
  }
}

export const defaultEdgeData = {
  color: defaultBlockColors.edge,
  lineStyle: "solid",
  pathType: "smoothstep",
  arrow: "forward",
  strokeWidth: 1.5,
} as const satisfies Pick<MapEdgeData, "color" | "lineStyle" | "pathType" | "arrow" | "strokeWidth">

function strokeDasharray(lineStyle: EdgeLineStyle) {
  if (lineStyle === "dashed") return "6 5"
  if (lineStyle === "dotted") return "1.5 5"
  return undefined
}

export function applyEdgePresentation(edge: MapEdge): MapEdge {
  const data = normalizeEdgeData(edge.data)
  const color = data.color || defaultEdgeData.color
  const lineStyle = data.lineStyle || defaultEdgeData.lineStyle
  const strokeWidth = data.strokeWidth || defaultEdgeData.strokeWidth
  const marker = { type: MarkerType.ArrowClosed, color }
  return {
    ...edge,
    type: data.pathType || defaultEdgeData.pathType,
    data,
    markerEnd: data.arrow === "forward" || data.arrow === "both" ? marker : undefined,
    markerStart: data.arrow === "backward" || data.arrow === "both" ? marker : undefined,
    style: {
      ...(edge.style || {}),
      stroke: color,
      strokeWidth,
      strokeDasharray: strokeDasharray(lineStyle),
    },
  }
}

export function createEdge(connection: Connection): Edge<MapEdgeData> {
  const at = nowIso()
  return applyEdgePresentation({
    id: createId("edge"),
    ...connection,
    type: defaultEdgeData.pathType,
    data: { ...defaultEdgeData, createdAt: at, updatedAt: at },
  })
}

function normalizeNodeType(value: unknown): BlockNodeType {
  if (value === "statement") return "theorem"
  if (validBlockNodeTypes.includes(value as BlockNodeType)) return value as BlockNodeType
  if (value !== undefined) console.warn(`Unknown block nodeType "${String(value)}"; falling back to generic.`)
  return "generic"
}

function normalizeBlockStatus(value: unknown): BlockStatus {
  if (validBlockStatuses.includes(value as BlockStatus)) return value as BlockStatus
  if (value !== undefined) console.warn(`Unknown block status "${String(value)}"; falling back to undo.`)
  return "undo"
}

function normalizeEmojis(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, 1)
}

function shouldPreserveExistingTextColor(value: unknown) {
  if (typeof value !== "string") return false
  return ["#3b82f6", "#1d4ed8", "#8b5cf6", "#6d28d9", "#ec4899", "#be185d"].includes(value.toLowerCase())
}

function normalizeEdgeLineStyle(value: unknown): EdgeLineStyle {
  if (edgeLineStyleOptions.includes(value as EdgeLineStyle)) return value as EdgeLineStyle
  if (value !== undefined) console.warn(`Unknown edge lineStyle "${String(value)}"; falling back to solid.`)
  return defaultEdgeData.lineStyle
}

function normalizeEdgePathType(value: unknown): EdgePathType {
  if (edgePathTypeOptions.includes(value as EdgePathType)) return value as EdgePathType
  if (value !== undefined) console.warn(`Unknown edge pathType "${String(value)}"; falling back to smoothstep.`)
  return defaultEdgeData.pathType
}

function normalizeEdgeArrow(value: unknown): EdgeArrow {
  if (edgeArrowOptions.includes(value as EdgeArrow)) return value as EdgeArrow
  if (value !== undefined) console.warn(`Unknown edge arrow "${String(value)}"; falling back to forward.`)
  return defaultEdgeData.arrow
}

function normalizeStrokeWidth(value: unknown): number {
  const parsed = Number(value)
  if (edgeStrokeWidthOptions.includes(parsed as (typeof edgeStrokeWidthOptions)[number])) return parsed
  if (value !== undefined) console.warn(`Unknown edge strokeWidth "${String(value)}"; falling back to 1.5.`)
  return defaultEdgeData.strokeWidth
}

export function normalizeEdgeData(input?: Partial<MapEdgeData>): MapEdgeData {
  const at = nowIso()
  return {
    label: input?.label,
    color: input?.color || defaultEdgeData.color,
    lineStyle: normalizeEdgeLineStyle(input?.lineStyle),
    pathType: normalizeEdgePathType(input?.pathType),
    arrow: normalizeEdgeArrow(input?.arrow),
    strokeWidth: normalizeStrokeWidth(input?.strokeWidth),
    createdAt: input?.createdAt || at,
    updatedAt: input?.updatedAt || at,
  }
}

function normalizeBlockData(input: Partial<BlockData> & { content?: string }): BlockData {
  const at = nowIso()
  const contentJson = input.contentJson ?? paragraphJson(input.content ?? "Recovered block")
  const width = Number(input.width)
  const height = Number(input.height)
  const nodeType = normalizeNodeType(input.nodeType)
  const defaults = blockTypeDefaults[nodeType]
  const emojis = normalizeEmojis(input.emojis)
  if (!input.contentJson && input.content) {
    console.warn("Migrated legacy content string into Tiptap JSON.")
  }
  return {
    title: input.title || "Untitled block",
    contentJson,
    contentHtml: input.contentHtml,
    backgroundColor: defaults.backgroundColor,
    textColor: shouldPreserveExistingTextColor(input.textColor) ? String(input.textColor) : defaults.textColor,
    borderColor: defaultBlockColors.border,
    width: Number.isFinite(width) ? Math.min(Math.max(width, 220), 860) : 340,
    height: Number.isFinite(height) ? Math.min(Math.max(height, 160), 720) : 220,
    nodeType,
    showStatus: Boolean(input.showStatus),
    status: normalizeBlockStatus(input.status),
    emojis: emojis.length ? emojis : defaults.emojis ? [...defaults.emojis] : [],
    createdAt: input.createdAt || at,
    updatedAt: input.updatedAt || at,
  }
}

function normalizeGroupData(input?: Partial<GroupData>): GroupData {
  const at = nowIso()
  return {
    title: input?.title || "Group",
    backgroundColor: input?.backgroundColor || "rgba(219, 234, 254, 0.22)",
    borderColor: defaultBlockColors.border,
    createdAt: input?.createdAt || at,
    updatedAt: input?.updatedAt || at,
  }
}

function normalizeNodeSize(value: unknown, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function normalizeMapNode(node: Partial<MapNode>, index: number): MapNode {
  if (node.type === "group") {
    const style = (node.style || {}) as { width?: unknown; height?: unknown }
    return {
      ...node,
      id: node.id || createId("group"),
      type: "group",
      position: node.position || { x: 100 + index * 60, y: 100 + index * 40 },
      style: {
        ...node.style,
        width: normalizeNodeSize(style.width, 420),
        height: normalizeNodeSize(style.height, 300),
      },
      data: normalizeGroupData(node.data as Partial<GroupData> | undefined),
    } as GroupNode
  }

  return {
    ...node,
    id: node.id || createId("block"),
    type: "block",
    position: node.position || { x: 120 + index * 80, y: 120 + index * 60 },
    data: normalizeBlockData(node.data as Partial<BlockData> & { content?: string }),
  } as BlockNode
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
      return normalizeMapNode(node as Partial<MapNode>, index)
    } catch (error) {
      console.warn("Recovered malformed block during import.", error)
      return createBlockNode({ x: 120 + index * 80, y: 120 + index * 60 }, "Recovered block")
    }
  })
  const edges = raw.edges.map((edge) =>
    applyEdgePresentation({
      ...edge,
      id: edge.id || createId("edge"),
      data: normalizeEdgeData(edge.data),
    } as MapEdge),
  )
  const viewport: MapViewport | undefined = raw.viewport
    ? { x: Number(raw.viewport.x) || 0, y: Number(raw.viewport.y) || 0, zoom: Number(raw.viewport.zoom) || 1 }
    : undefined
  return { version: 1, title: normalizeMapTitle(raw.title), nodes, edges, viewport, updatedAt: raw.updatedAt || nowIso() }
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
