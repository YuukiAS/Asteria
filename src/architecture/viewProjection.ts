import type { ArchitectureProjectV2, TypedRelation, ViewProjectionNode } from "./types"
import type { ArchitectureDetailLevel } from "./session"

export type ProjectionLayoutNode = {
  entityId: string
  projection: ViewProjectionNode
  leftPercent: number
  topPercent: number
  width: number
  height: number
}

export type ProjectionLayoutEdge = {
  relation: TypedRelation
  path: string
  labelX: number
  labelY: number
}

export type ProjectionLayout = {
  nodes: ProjectionLayoutNode[]
  edges: ProjectionLayoutEdge[]
  projectedEntityIds: Set<string>
  viewport: { x: number; y: number; zoom: number }
}

const catTraceOverviewKeys = new Set([
  "Y_raw",
  "c_f",
  "mathcal_K",
  "mathcal_U",
  "g_f",
  "mathcal_G",
  "yU_igh",
  "zU_igh",
  "alphaU_gh",
  "betaU_gh",
  "nu",
  "a_g",
  "gamma0",
  "pi_g",
  "gamma_g",
  "p_g",
  "Sigma_W",
  "richness_targets",
])

function clampPercent(value: number) {
  return Math.max(4, Math.min(96, value))
}

function normalize(value: number, min: number, max: number, low: number, high: number) {
  if (max <= min) return (low + high) / 2
  return low + ((value - min) / (max - min)) * (high - low)
}

function projectionByEntity(view: ArchitectureProjectV2["views"][string]) {
  const entries = new Map<string, ViewProjectionNode>()
  Object.values(view.projections).forEach((projection) => {
    if (!projection.hidden && !entries.has(projection.entityId)) entries.set(projection.entityId, projection)
  })
  return entries
}

export function selectProjectedRelations(project: ArchitectureProjectV2, viewId: string) {
  const view = project.views[viewId]
  if (!view) return []
  const entityIds = new Set(view.projectedEntityIds)
  return Object.values(project.relations).filter((relation) => entityIds.has(relation.sourceId) && entityIds.has(relation.targetId))
}

function entityKey(entityId: string) {
  return entityId.split(":").pop() || entityId
}

function selectDisplayEntityIds(project: ArchitectureProjectV2, viewId: string, options: { detailLevel?: ArchitectureDetailLevel; selectedEntityId?: string; traceEntityIds?: Set<string> } = {}) {
  const view = project.views[viewId]
  const base = view?.projectedEntityIds || []
  if (!view || view.kind !== "architecture" || options.detailLevel !== "overview" || !project.project.id.includes("cat-trace-frozen-v2")) return base

  const visible = new Set(base.filter((id) => catTraceOverviewKeys.has(entityKey(id))))
  const revealDirectContext = (entityId?: string) => {
    if (!entityId) return
    if (!base.includes(entityId)) return
    visible.add(entityId)
    Object.values(project.relations).forEach((relation) => {
      if (relation.sourceId === entityId && base.includes(relation.targetId)) visible.add(relation.targetId)
      if (relation.targetId === entityId && base.includes(relation.sourceId)) visible.add(relation.sourceId)
    })
  }

  revealDirectContext(options.selectedEntityId)
  options.traceEntityIds?.forEach((entityId) => revealDirectContext(entityId))
  return base.filter((entityId) => visible.has(entityId))
}

export function buildProjectionLayout(project: ArchitectureProjectV2, viewId: string, options: { detailLevel?: ArchitectureDetailLevel; selectedEntityId?: string; traceEntityIds?: Set<string> } = {}): ProjectionLayout {
  const view = project.views[viewId]
  if (!view) {
    return { nodes: [], edges: [], projectedEntityIds: new Set(), viewport: { x: 0, y: 0, zoom: 1 } }
  }

  const displayEntityIds = selectDisplayEntityIds(project, viewId, options)
  const projectedEntityIds = new Set(displayEntityIds)
  const projections = projectionByEntity(view)
  const rawNodes = displayEntityIds
    .map((entityId, index) => {
      const projection = projections.get(entityId)
      if (projection) return { entityId, projection }
      return {
        entityId,
        projection: {
          id: `projection:${viewId}:fallback:${index}`,
          entityId,
          position: { x: (index % 5) * 220, y: Math.floor(index / 5) * 150 },
          size: { width: 180, height: 78 },
        },
      }
    })
    .filter((item) => project.entities[item.entityId])

  const minX = Math.min(...rawNodes.map((node) => node.projection.position.x), 0)
  const maxX = Math.max(...rawNodes.map((node) => node.projection.position.x), 1)
  const minY = Math.min(...rawNodes.map((node) => node.projection.position.y), 0)
  const maxY = Math.max(...rawNodes.map((node) => node.projection.position.y), 1)

  const nodes = rawNodes.map((node) => ({
    ...node,
    leftPercent: clampPercent(normalize(node.projection.position.x, minX, maxX, 10, 88)),
    topPercent: clampPercent(normalize(node.projection.position.y, minY, maxY, 14, 86)),
    width: node.projection.size?.width || 176,
    height: node.projection.size?.height || 78,
  }))
  const nodeByEntityId = new Map(nodes.map((node) => [node.entityId, node]))
  const pairCounts = new Map<string, number>()

  const edges = Object.values(project.relations).filter((relation) => projectedEntityIds.has(relation.sourceId) && projectedEntityIds.has(relation.targetId)).flatMap((relation) => {
    const source = nodeByEntityId.get(relation.sourceId)
    const target = nodeByEntityId.get(relation.targetId)
    if (!source || !target) return []
    const pairKey = `${relation.sourceId}->${relation.targetId}`
    const pairIndex = pairCounts.get(pairKey) || 0
    pairCounts.set(pairKey, pairIndex + 1)
    const offset = (pairIndex - 0.5) * 3.2
    const sourceX = source.leftPercent
    const sourceY = source.topPercent
    const targetX = target.leftPercent
    const targetY = target.topPercent
    const midX = (sourceX + targetX) / 2
    const midY = (sourceY + targetY) / 2 + offset
    const controlX1 = sourceX + (targetX - sourceX) * 0.42
    const controlX2 = sourceX + (targetX - sourceX) * 0.58
    const path = `M ${sourceX.toFixed(2)} ${sourceY.toFixed(2)} C ${controlX1.toFixed(2)} ${(sourceY + offset).toFixed(2)}, ${controlX2.toFixed(2)} ${(targetY + offset).toFixed(2)}, ${targetX.toFixed(2)} ${targetY.toFixed(2)}`
    return [{ relation, path, labelX: midX, labelY: midY }]
  })

  return {
    nodes,
    edges,
    projectedEntityIds,
    viewport: {
      x: view.viewport?.x || 0,
      y: view.viewport?.y || 0,
      zoom: view.viewport?.zoom || 1,
    },
  }
}
