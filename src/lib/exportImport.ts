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
import { allVersionsId, commonVariantKey, maxModelVersions } from "../constants/versioning"
import type {
  ActiveVersionId,
  BlockData,
  BlockDisplayMode,
  BlockNode,
  BlockNodeType,
  BlockStatus,
  BlockVariant,
  BlockVariantKey,
  DisplayModeOverride,
  EdgeArrow,
  EdgeLineStyle,
  EdgePathType,
  EdgeVisibility,
  ExportedMap,
  GroupData,
  GroupNode,
  MapEdge,
  MapEdgeData,
  MapNode,
  MapViewport,
  ModelVersion,
} from "../types/map"
import { createId } from "./ids"
import { formatJsonTimestamp, nowIso } from "./time"
import { contentJsonToHtml } from "../editor/editorUtils"
import type { JSONContent } from "@tiptap/react"

export const defaultMapTitle = "Local map"

export const defaultContentJson: JSONContent = {
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
  const prefix = slug || "asteria-map"
  return `${prefix}-${formatJsonTimestamp(date)}.json`
}

export function paragraphJson(text: string) {
  return {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  }
}

export function createBlockVariant(title: string, contentJson = defaultContentJson, contentHtml?: string, updatedAt = nowIso()): BlockVariant {
  return { title, contentJson, contentHtml, updatedAt }
}

export function getVariantKey(activeVersionId?: ActiveVersionId, explicitVariantKey?: BlockVariantKey) {
  if (explicitVariantKey) return explicitVariantKey
  return activeVersionId && activeVersionId !== allVersionsId ? activeVersionId : commonVariantKey
}

export function resolveBlockVariant(data: BlockData, activeVersionId?: ActiveVersionId): BlockVariant {
  const key = getVariantKey(activeVersionId)
  const fallback = data.variants?.[commonVariantKey] || createBlockVariant(data.title, data.contentJson, data.contentHtml, data.updatedAt)
  return data.variants?.[key] || fallback
}

export function resolveBlockTitle(data: BlockData, activeVersionId?: ActiveVersionId) {
  return resolveBlockVariant(data, activeVersionId).title
}

export function resolveBlockContentJson(data: BlockData, activeVersionId?: ActiveVersionId) {
  return resolveBlockVariant(data, activeVersionId).contentJson
}

export function resolveBlockContentHtml(data: BlockData, activeVersionId?: ActiveVersionId) {
  const variant = resolveBlockVariant(data, activeVersionId)
  return contentJsonToSafeHtml(variant.contentJson) || variant.contentHtml
}

function contentJsonToSafeHtml(contentJson: BlockVariant["contentJson"]) {
  try {
    return contentJsonToHtml(contentJson)
  } catch (error) {
    console.warn("Failed to render block variant contentHtml.", error)
    return ""
  }
}

export function createBlockNode(position = { x: 120, y: 120 }, title = "New block"): BlockNode {
  const at = nowIso()
  const variant = createBlockVariant(title, defaultContentJson, "<p>New block</p>", at)
  return {
    id: createId("block"),
    type: "block",
    position,
    data: {
      title,
      contentJson: defaultContentJson,
      contentHtml: "<p>New block</p>",
      variants: { [commonVariantKey]: variant },
      activeVariantKey: commonVariantKey,
      backgroundColor: blockTypeDefaults.generic.backgroundColor,
      textColor: blockTypeDefaults.generic.textColor,
      borderColor: blockTypeDefaults.generic.borderColor,
      width: 340,
      height: 220,
      displayMode: "full",
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
      opacity: 0.22,
      locked: false,
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
  visibility: "all",
} as const satisfies Pick<MapEdgeData, "color" | "lineStyle" | "pathType" | "arrow" | "strokeWidth" | "visibility">

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
  if (value === "citation") return "reference"
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

function normalizeDisplayMode(value: unknown): BlockDisplayMode {
  if (value === "compact" || value === "title_only" || value === "full") return value
  if (value !== undefined) console.warn(`Unknown block displayMode "${String(value)}"; falling back to full.`)
  return "full"
}

function normalizeDisplayModeOverride(value: unknown): DisplayModeOverride {
  if (value === "block" || value === "compact" || value === "title_only" || value === "full") return value
  if (value !== undefined) console.warn(`Unknown displayModeOverride "${String(value)}"; falling back to block.`)
  return "block"
}

function normalizeActiveVersionId(value: unknown, modelVersions: ModelVersion[]): ActiveVersionId {
  if (value === allVersionsId) return allVersionsId
  if (typeof value === "string" && modelVersions.some((version) => version.id === value)) return value
  if (value !== undefined) console.warn(`Unknown activeVersionId "${String(value)}"; falling back to all.`)
  return allVersionsId
}

function normalizeModelVersion(input: Partial<ModelVersion>, index: number): ModelVersion {
  const at = nowIso()
  const label = typeof input.label === "string" && input.label.trim() ? input.label.trim() : `Version ${index + 1}`
  return {
    id: typeof input.id === "string" && input.id.trim() ? input.id.trim() : createId("version"),
    label,
    shortLabel: typeof input.shortLabel === "string" && input.shortLabel.trim() ? input.shortLabel.trim().slice(0, 12) : undefined,
    createdAt: input.createdAt || at,
    updatedAt: input.updatedAt || at,
  }
}

function normalizeModelVersions(value: unknown): ModelVersion[] {
  if (!Array.isArray(value)) return []
  if (value.length > maxModelVersions) console.warn(`Imported map has ${value.length} versions; keeping the first ${maxModelVersions}.`)
  const seen = new Set<string>()
  return value.slice(0, maxModelVersions).map((item, index) => {
    const version = normalizeModelVersion((item || {}) as Partial<ModelVersion>, index)
    if (seen.has(version.id)) version.id = createId("version")
    seen.add(version.id)
    return version
  })
}

function normalizeBlockVariant(input: unknown, fallbackTitle: string, fallbackContentJson: BlockVariant["contentJson"], fallbackContentHtml?: string): BlockVariant {
  const raw = input && typeof input === "object" ? (input as Partial<BlockVariant>) : {}
  return {
    title: typeof raw.title === "string" ? raw.title : fallbackTitle,
    contentJson: raw.contentJson || fallbackContentJson,
    contentHtml: raw.contentHtml || fallbackContentHtml,
    updatedAt: raw.updatedAt || nowIso(),
  }
}

function normalizeBlockVariants(input: unknown, commonVariant: BlockVariant): Partial<Record<BlockVariantKey, BlockVariant>> {
  const variants: Partial<Record<BlockVariantKey, BlockVariant>> = { [commonVariantKey]: commonVariant }
  if (!input || typeof input !== "object") return variants
  Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
    if (!key) return
    try {
      variants[key] = normalizeBlockVariant(value, commonVariant.title, commonVariant.contentJson, commonVariant.contentHtml)
    } catch (error) {
      console.warn(`Recovered malformed block variant "${key}".`, error)
    }
  })
  if (!variants[commonVariantKey]) variants[commonVariantKey] = commonVariant
  return variants
}

function normalizeEdgeVisibility(value: unknown, modelVersions: ModelVersion[]): EdgeVisibility {
  if (value === undefined || value === "all") return "all"
  if (!Array.isArray(value)) {
    console.warn(`Unknown edge visibility "${String(value)}"; falling back to all.`)
    return "all"
  }
  if (modelVersions.length === 0) return value.map((item) => String(item)).filter(Boolean).slice(0, maxModelVersions)
  const validIds = new Set(modelVersions.map((version) => version.id))
  return value.map((item) => String(item)).filter((id) => validIds.has(id)).slice(0, maxModelVersions)
}

function normalizeColor(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback
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

export function normalizeEdgeData(input?: Partial<MapEdgeData>, modelVersions: ModelVersion[] = []): MapEdgeData {
  const at = nowIso()
  return {
    label: input?.label,
    color: input?.color || defaultEdgeData.color,
    lineStyle: normalizeEdgeLineStyle(input?.lineStyle),
    pathType: normalizeEdgePathType(input?.pathType),
    arrow: normalizeEdgeArrow(input?.arrow),
    strokeWidth: normalizeStrokeWidth(input?.strokeWidth),
    visibility: normalizeEdgeVisibility(input?.visibility, modelVersions),
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
  const commonVariant = normalizeBlockVariant(
    input.variants?.[commonVariantKey],
    input.title || "Untitled block",
    contentJson,
    input.contentHtml,
  )
  const variants = normalizeBlockVariants(input.variants, commonVariant)
  return {
    title: commonVariant.title,
    contentJson: commonVariant.contentJson,
    contentHtml: commonVariant.contentHtml,
    variants,
    activeVariantKey: input.activeVariantKey || commonVariantKey,
    backgroundColor: normalizeColor(input.backgroundColor, defaults.backgroundColor),
    textColor: normalizeColor(input.textColor, defaults.textColor),
    borderColor: normalizeColor(input.borderColor, defaults.borderColor),
    width: Number.isFinite(width) ? Math.min(Math.max(width, 220), 860) : 340,
    height: Number.isFinite(height) ? Math.min(Math.max(height, 160), 720) : 220,
    displayMode: normalizeDisplayMode(input.displayMode),
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
  const opacity = Number(input?.opacity)
  return {
    title: input?.title || "Group",
    backgroundColor: input?.backgroundColor || "rgba(219, 234, 254, 0.22)",
    borderColor: defaultBlockColors.border,
    opacity: Number.isFinite(opacity) ? Math.min(Math.max(opacity, 0.04), 0.8) : 0.22,
    locked: Boolean(input?.locked),
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
  const modelVersions = normalizeModelVersions(raw.modelVersions)
  const activeVersionId = normalizeActiveVersionId(raw.activeVersionId, modelVersions)
  const displayModeOverride = normalizeDisplayModeOverride(raw.displayModeOverride)
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
      data: normalizeEdgeData(edge.data, modelVersions),
    } as MapEdge),
  )
  const viewport: MapViewport | undefined = raw.viewport
    ? { x: Number(raw.viewport.x) || 0, y: Number(raw.viewport.y) || 0, zoom: Number(raw.viewport.zoom) || 1 }
    : undefined
  return {
    version: 1,
    title: normalizeMapTitle(raw.title),
    modelVersions,
    activeVersionId,
    displayModeOverride,
    nodes,
    edges,
    viewport,
    updatedAt: raw.updatedAt || nowIso(),
  }
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
