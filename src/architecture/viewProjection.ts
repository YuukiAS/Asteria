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
  "x_i",
  "c_f",
  "mathcal_K",
  "mathcal_U",
  "g_f",
  "mathcal_G",
  "yU_igh",
  "zU_igh",
  "alphaU_gh",
  "betaU_gh",
  "gamma_g",
  "p_g",
  "Sigma_W",
  "posterior_inference",
  "richness_targets",
])

const catTraceOverviewSlots: Record<string, { left: number; top: number; width?: number; height?: number }> = {
  Y_raw: { left: 8, top: 28 },
  x_i: { left: 8, top: 66 },
  c_f: { left: 22, top: 28 },
  g_f: { left: 22, top: 66 },
  mathcal_K: { left: 36, top: 20 },
  mathcal_U: { left: 36, top: 44 },
  mathcal_G: { left: 36, top: 70 },
  nu: { left: 50, top: 17 },
  zU_igh: { left: 50, top: 39 },
  yU_igh: { left: 50, top: 62 },
  a_g: { left: 50, top: 84 },
  gamma0: { left: 64, top: 17 },
  alphaU_gh: { left: 64, top: 39 },
  betaU_gh: { left: 64, top: 62 },
  vU_gh: { left: 64, top: 84 },
  pi_g: { left: 78, top: 17 },
  betaK_j: { left: 78, top: 17 },
  p_g: { left: 78, top: 39 },
  Sigma_W: { left: 78, top: 62 },
  p_g_star: { left: 78, top: 84 },
  alphaK_j: { left: 78, top: 84 },
  gamma_g: { left: 94, top: 28, width: 96 },
  posterior_inference: { left: 94, top: 55, width: 96 },
  richness_targets: { left: 94, top: 78, width: 96 },
  zero_slots: { left: 94, top: 92, width: 96 },
}

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

function isCatTraceArchitectureOverview(project: ArchitectureProjectV2, view: ArchitectureProjectV2["views"][string], options: { detailLevel?: ArchitectureDetailLevel }) {
  return view.kind === "architecture" && options.detailLevel === "overview" && project.project.id.includes("cat-trace-frozen-v2")
}

function stableBoundsNodes(view: ArchitectureProjectV2["views"][string], rawNodes: Array<{ entityId: string; projection: ViewProjectionNode }>) {
  const allProjected = view.projectedEntityIds
    .map((entityId, index) => {
      const projection = Object.values(view.projections).find((candidate) => !candidate.hidden && candidate.entityId === entityId)
      if (projection) return { entityId, projection }
      return {
        entityId,
        projection: {
          id: `projection:${view.id}:bounds-fallback:${index}`,
          entityId,
          position: { x: (index % 5) * 220, y: Math.floor(index / 5) * 150 },
          size: { width: 180, height: 78 },
        },
      }
    })
    .filter(Boolean) as Array<{ entityId: string; projection: ViewProjectionNode }>
  return allProjected.length ? allProjected : rawNodes
}

function sidePort(source: ProjectionLayoutNode, target: ProjectionLayoutNode) {
  const dx = target.leftPercent - source.leftPercent
  const dy = target.topPercent - source.topPercent
  const horizontal = Math.abs(dx) >= Math.abs(dy)
  const xOffset = horizontal ? Math.sign(dx || 1) * Math.min(5.8, Math.max(3.8, source.width / 32)) : Math.sign(dx || 1) * 1.2
  const yOffset = horizontal ? Math.sign(dy || 1) * 0.8 : Math.sign(dy || 1) * Math.min(5.4, Math.max(3.2, source.height / 18))
  return {
    x: clampPercent(source.leftPercent + xOffset),
    y: clampPercent(source.topPercent + yOffset),
  }
}

function edgeLabelPoint(source: ProjectionLayoutNode, target: ProjectionLayoutNode, pairIndex: number) {
  const sourcePort = sidePort(source, target)
  const targetPort = sidePort(target, source)
  const midX = (sourcePort.x + targetPort.x) / 2
  const midY = (sourcePort.y + targetPort.y) / 2
  const dx = targetPort.x - sourcePort.x
  const dy = targetPort.y - sourcePort.y
  const length = Math.hypot(dx, dy) || 1
  const normalX = (-dy / length) * (2.4 + pairIndex * 1.1)
  const normalY = (dx / length) * (2.4 + pairIndex * 1.1)
  return {
    x: clampPercent(midX + normalX),
    y: clampPercent(midY + normalY),
  }
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

  const isStableCatOverview = isCatTraceArchitectureOverview(project, view, options)
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

  const boundsNodes = stableBoundsNodes(view, rawNodes)
  const minX = Math.min(...boundsNodes.map((node) => node.projection.position.x), 0)
  const maxX = Math.max(...boundsNodes.map((node) => node.projection.position.x), 1)
  const minY = Math.min(...boundsNodes.map((node) => node.projection.position.y), 0)
  const maxY = Math.max(...boundsNodes.map((node) => node.projection.position.y), 1)

  const nodes = rawNodes.map((node) => {
    const slot = isStableCatOverview ? catTraceOverviewSlots[entityKey(node.entityId)] : undefined
    return {
      ...node,
      leftPercent: slot?.left ?? clampPercent(normalize(node.projection.position.x, minX, maxX, 10, 88)),
      topPercent: slot?.top ?? clampPercent(normalize(node.projection.position.y, minY, maxY, 14, 86)),
      width: slot?.width ?? (isStableCatOverview ? 104 : node.projection.size?.width || 176),
      height: slot?.height ?? (isStableCatOverview ? 66 : node.projection.size?.height || 78),
    }
  })
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
    const sourcePort = sidePort(source, target)
    const targetPort = sidePort(target, source)
    const label = edgeLabelPoint(source, target, pairIndex)
    const controlX1 = sourcePort.x + (targetPort.x - sourcePort.x) * 0.42
    const controlX2 = sourcePort.x + (targetPort.x - sourcePort.x) * 0.58
    const path = `M ${sourcePort.x.toFixed(2)} ${sourcePort.y.toFixed(2)} C ${controlX1.toFixed(2)} ${(sourcePort.y + offset).toFixed(2)}, ${controlX2.toFixed(2)} ${(targetPort.y + offset).toFixed(2)}, ${targetPort.x.toFixed(2)} ${targetPort.y.toFixed(2)}`
    return [{ relation, path, labelX: label.x, labelY: label.y }]
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
