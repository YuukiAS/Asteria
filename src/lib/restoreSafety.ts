import { defaultVariantKey } from "../constants/versioning"
import { contentJsonToHtml } from "../editor/editorUtils"
import { createBlockVariant } from "./exportImport"
import { resolveBlockVersionState } from "./blockVersionState"
import type { BlockData, BlockNode, BlockVariant, BlockVariantKey, MapEdge, MapNode, ModelVersion, StoryOutlineItem } from "../types/map"

export type RestoreSafetyState = {
  modelVersions: ModelVersion[]
  storyOutline: StoryOutlineItem[]
  nodes: MapNode[]
  edges: MapEdge[]
}

function cloneJson<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value)
  return JSON.parse(JSON.stringify(value)) as T
}

function timestampMs(value?: string) {
  if (!value) return 0
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function isBlockNode(node: MapNode): node is BlockNode {
  return node.type === "block"
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

function variantContentScore(variant: BlockVariant) {
  return (
    variant.title.trim().length +
    JSON.stringify(variant.contentJson || {}).length +
    (variant.contentHtml || "").length +
    JSON.stringify(variant.symbolEntries || []).length
  )
}

function hasSubstantiallyMoreContent(candidate: BlockVariant, incumbent: BlockVariant) {
  const candidateScore = variantContentScore(candidate)
  const incumbentScore = variantContentScore(incumbent)
  const gain = candidateScore - incumbentScore
  return gain > 512 || (gain > 80 && candidateScore > incumbentScore * 1.25)
}

function shouldKeepCurrentVariant(currentVariant: BlockVariant, restoredVariant?: BlockVariant) {
  if (!restoredVariant) return true
  const currentTime = timestampMs(currentVariant.updatedAt)
  const restoredTime = timestampMs(restoredVariant.updatedAt)
  if (currentTime >= restoredTime) return true
  return hasSubstantiallyMoreContent(currentVariant, restoredVariant)
}

function mergeModelVersions(restored: ModelVersion[], current: ModelVersion[]) {
  const currentById = new Map(current.map((version) => [version.id, version]))
  const seen = new Set<string>()
  const merged = restored.map((version) => {
    seen.add(version.id)
    const currentVersion = currentById.get(version.id)
    if (!currentVersion) return version
    return timestampMs(currentVersion.updatedAt) > timestampMs(version.updatedAt) ? cloneJson(currentVersion) : version
  })
  current.forEach((version) => {
    if (!seen.has(version.id)) merged.push(cloneJson(version))
  })
  return merged
}

function mergeStoryOutline(restored: StoryOutlineItem[], current: StoryOutlineItem[], validSourceIds: Set<string>) {
  const currentById = new Map(current.map((item) => [item.id, item]))
  const seen = new Set<string>()
  const merged = restored
    .filter((item) => validSourceIds.has(item.sourceId))
    .map((item) => {
      seen.add(item.id)
      const currentItem = currentById.get(item.id)
      if (!currentItem) return item
      return timestampMs(currentItem.updatedAt) > timestampMs(item.updatedAt) ? cloneJson(currentItem) : item
    })
  current.forEach((item) => {
    if (!seen.has(item.id) && validSourceIds.has(item.sourceId)) merged.push(cloneJson(item))
  })
  return merged
}

function mergeEdges(restored: MapEdge[], current: MapEdge[], validNodeIds: Set<string>) {
  const currentById = new Map(current.map((edge) => [edge.id, edge]))
  const seen = new Set<string>()
  const merged = restored
    .filter((edge) => validNodeIds.has(edge.source) && validNodeIds.has(edge.target))
    .map((edge) => {
      seen.add(edge.id)
      const currentEdge = currentById.get(edge.id)
      if (!currentEdge) return edge
      return timestampMs(currentEdge.data?.updatedAt) > timestampMs(edge.data?.updatedAt) ? cloneJson(currentEdge) : edge
    })
  current.forEach((edge) => {
    if (!seen.has(edge.id) && validNodeIds.has(edge.source) && validNodeIds.has(edge.target)) merged.push(cloneJson(edge))
  })
  return merged
}

export function preserveLocalMapInformation<T extends RestoreSafetyState>(restored: T, current: RestoreSafetyState): T {
  const modelVersions = mergeModelVersions(restored.modelVersions || [], current.modelVersions || [])
  const currentBlocks = new Map(current.nodes.filter(isBlockNode).map((node) => [node.id, node]))
  const restoredNodeIds = new Set(restored.nodes.map((node) => node.id))
  const nodes = restored.nodes.map((node) => {
    if (!isBlockNode(node)) return node
    const currentNode = currentBlocks.get(node.id)
    if (!currentNode) return node
    const variants = { ...(node.data.variants || {}) }
    Object.entries(currentNode.data.variants || {}).forEach(([key, currentVariant]) => {
      if (!currentVariant) return
      const restoredVariant = variants[key]
      if (shouldKeepCurrentVariant(currentVariant, restoredVariant)) variants[key] = cloneJson(currentVariant)
    })
    const nextData = { ...node.data, variants }
    const activeVariantKey = nextData.activeVariantKey || defaultVariantKey
    const resolvedVariant = resolveVariantForMirror(nextData, activeVariantKey, modelVersions)
    return {
      ...node,
      data: {
        ...nextData,
        title: resolvedVariant.title,
        contentJson: resolvedVariant.contentJson,
        contentHtml: resolvedVariant.contentHtml || contentJsonToHtml(resolvedVariant.contentJson),
        updatedAt:
          timestampMs(currentNode.data.updatedAt) > timestampMs(node.data.updatedAt)
            ? currentNode.data.updatedAt
            : node.data.updatedAt,
      },
    }
  })
  current.nodes.forEach((node) => {
    if (!restoredNodeIds.has(node.id)) nodes.push(cloneJson(node))
  })
  const validNodeIds = new Set(nodes.map((node) => node.id))
  return {
    ...restored,
    modelVersions,
    nodes,
    edges: mergeEdges(restored.edges || [], current.edges || [], validNodeIds),
    storyOutline: mergeStoryOutline(restored.storyOutline || [], current.storyOutline || [], validNodeIds),
  }
}
