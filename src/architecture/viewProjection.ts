import type { ArchitectureProjectV2, TypedRelation, ViewProjectionNode } from "./types"
import type { ArchitectureDetailLevel } from "./session"
import { layoutArchitectureLanes, routeLayeredEdge, type GraphRect, type RoutePoint } from "./graphPresentation"

export type ProjectionLayoutNode = {
  entityId: string
  projection: ViewProjectionNode
  x: number
  y: number
  leftPercent: number
  topPercent: number
  width: number
  height: number
  lane?: number
}

export type ProjectionLayoutEdge = {
  relation: TypedRelation
  path: string
  labelX: number
  labelY: number
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  grammar: string
  bendCount: number
  routeScore: number
  routeRatio: number
  nonMonotone: boolean
  points: RoutePoint[]
}

export type ProjectionLayout = {
  nodes: ProjectionLayoutNode[]
  edges: ProjectionLayoutEdge[]
  projectedEntityIds: Set<string>
  viewport: { x: number; y: number; zoom: number }
  canvas: { width: number; height: number }
}

const presentationCanvas = { width: 1000, height: 620 }
const defaultSafeInset = 14

type LayoutOptions = {
  detailLevel?: ArchitectureDetailLevel
  selectedEntityId?: string
  traceEntityIds?: Set<string>
  canvasWidth?: number
  canvasHeight?: number
  safeInset?: number
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

function originalTraceSlots(key: string) {
  const slots: Record<string, { left: number; top: number; width?: number; height?: number }> = {
    y_ij: { left: 9, top: 30, width: 132 },
    z_ij: { left: 28, top: 30, width: 132 },
    x_i: { left: 9, top: 68, width: 132 },
    alpha_j: { left: 47, top: 18, width: 132 },
    beta_j: { left: 47, top: 40, width: 132 },
    gamma: { left: 65, top: 14, width: 116 },
    p: { left: 65, top: 34, width: 116 },
    mu_p_gamma: { left: 86, top: 14, width: 130 },
    tau_p: { left: 86, top: 34, width: 130 },
    nu: { left: 65, top: 58, width: 116 },
    Psi: { left: 65, top: 78, width: 116 },
    posterior_inference: { left: 86, top: 58, width: 130 },
    marginal_probability: { left: 86, top: 78, width: 160 },
    richness_target: { left: 47, top: 76, width: 140 },
  }
  return slots[key]
}

function clamp(value: number, low: number, high: number) {
  return Math.max(low, Math.min(high, value))
}

function measuredCanvas(options: LayoutOptions) {
  const width = Number.isFinite(options.canvasWidth) && options.canvasWidth ? Math.max(320, options.canvasWidth) : presentationCanvas.width
  const height = Number.isFinite(options.canvasHeight) && options.canvasHeight ? Math.max(320, options.canvasHeight) : presentationCanvas.height
  return { width, height }
}

function clampNodeToCanvas<T extends ProjectionLayoutNode>(node: T, canvas: { width: number; height: number }, safeInset = defaultSafeInset): T {
  const minX = safeInset + node.width / 2
  const maxX = canvas.width - safeInset - node.width / 2
  const minY = safeInset + node.height / 2
  const maxY = canvas.height - safeInset - node.height / 2
  const x = maxX >= minX ? clamp(node.x, minX, maxX) : canvas.width / 2
  const y = maxY >= minY ? clamp(node.y, minY, maxY) : canvas.height / 2
  return {
    ...node,
    x,
    y,
    leftPercent: (x / canvas.width) * 100,
    topPercent: (y / canvas.height) * 100,
  }
}

function architectureRelationPairs(project: ArchitectureProjectV2, entityIds: Set<string>) {
  return Object.values(project.relations)
    .filter((relation) => entityIds.has(relation.sourceId) && entityIds.has(relation.targetId))
    .map((relation) => ({ sourceId: relation.sourceId, targetId: relation.targetId }))
}

function packLayeredArchitectureNodes(project: ArchitectureProjectV2, rawNodes: Array<{ entityId: string; projection: ViewProjectionNode }>, actualCanvas: { width: number; height: number }, options: { overview?: boolean; relationPairs?: Array<{ sourceId: string; targetId: string }> } = {}) {
  const layout = layoutArchitectureLanes(rawNodes, (node) => project.entities[node.entityId]?.layer, {
    width: options.overview ? actualCanvas.width : Math.max(actualCanvas.width, Math.min(1600, actualCanvas.width * 1.55)),
    minHeight: actualCanvas.height,
    nodeWidth: options.overview ? 72 : 112,
    nodeHeight: options.overview ? 66 : 76,
    rowGap: options.overview ? 98 : undefined,
    verticalPadding: options.overview ? 86 : undefined,
    maxRowsPerColumn: options.overview ? 4 : undefined,
    relationPairs: options.relationPairs,
  })
  return {
    nodes: layout.nodes.map((node) => ({
      ...node,
      leftPercent: (node.x / layout.width) * 100,
      topPercent: (node.y / layout.height) * 100,
    })),
    canvas: { width: layout.width, height: layout.height },
  }
}

function packFullArchitectureNodes(project: ArchitectureProjectV2, nodes: ProjectionLayoutNode[], actualCanvas: { width: number; height: number }, relationPairs: Array<{ sourceId: string; targetId: string }> = []) {
  const readableWidth = Math.max(actualCanvas.width, Math.min(1600, actualCanvas.width * 1.55))
  const layout = layoutArchitectureLanes(nodes, (node) => project.entities[node.entityId]?.layer, { width: readableWidth, minHeight: actualCanvas.height, nodeWidth: 112, nodeHeight: 76, relationPairs })
  return {
    nodes: layout.nodes.map((node) => ({
      ...node,
      leftPercent: (node.x / layout.width) * 100,
      topPercent: (node.y / layout.height) * 100,
    })),
    canvas: { width: layout.width, height: layout.height },
  }
}

function spreadRows<T>(items: T[], top: number, bottom: number, preferred: (item: T, index: number) => number) {
  if (!items.length) return []
  const gap = items.length <= 1 ? 0 : (bottom - top) / (items.length - 1)
  const sorted = items.map((item, index) => ({ item, preferred: preferred(item, index), index })).sort((a, b) => a.preferred - b.preferred || a.index - b.index)
  return sorted.map((entry, index) => ({ item: entry.item, y: items.length <= 1 ? (top + bottom) / 2 : top + index * gap }))
}

function packEvidenceClaimNodes(project: ArchitectureProjectV2, nodes: ProjectionLayoutNode[], relations: TypedRelation[], canvas: { width: number; height: number }) {
  const top = 86
  const bottom = Math.max(top + 1, canvas.height - 86)
  const claimNodes = nodes
    .filter((node) => {
      const entity = project.entities[node.entityId]
      return entity?.kind === "claim" || entity?.kind === "theorem"
    })
    .sort((a, b) => {
      const labelA = project.entities[a.entityId]?.label || a.entityId
      const labelB = project.entities[b.entityId]?.label || b.entityId
      return a.projection.position.y - b.projection.position.y || labelA.localeCompare(labelB) || a.entityId.localeCompare(b.entityId)
    })
  const claimRows = spreadRows(claimNodes, top, bottom, (node) => node.projection.position.y)
  const claimY = new Map(claimRows.map((row) => [row.item.entityId, row.y]))
  const incomingClaimY = (node: ProjectionLayoutNode) => {
    const linked = relations
      .filter((relation) => relation.sourceId === node.entityId || relation.targetId === node.entityId)
      .map((relation) => claimY.get(relation.sourceId) ?? claimY.get(relation.targetId))
      .filter((value): value is number => Number.isFinite(value))
    if (!linked.length) return node.projection.position.y
    return linked.reduce((sum, value) => sum + value, 0) / linked.length
  }
  const supportNodes = nodes.filter((node) => {
    const kind = project.entities[node.entityId]?.kind
    return kind === "proof" || kind === "implementation" || kind === "result"
  })
  const datasetNodes = nodes.filter((node) => project.entities[node.entityId]?.kind === "dataset")
  const gapNodes = nodes.filter((node) => {
    const kind = project.entities[node.entityId]?.kind
    return kind === "limitation" || kind === "open_question"
  })
  const otherNodes = nodes.filter((node) => !claimNodes.includes(node) && !supportNodes.includes(node) && !datasetNodes.includes(node) && !gapNodes.includes(node))
  const supportRows = spreadRows([...supportNodes, ...otherNodes], top, bottom, incomingClaimY)
  const datasetRows = spreadRows([...datasetNodes, ...gapNodes], top, bottom, incomingClaimY)
  const applyRows = (rows: Array<{ item: ProjectionLayoutNode; y: number }>, x: number, width: number, height = 72) =>
    rows.map(({ item, y }) => ({ ...item, x, y, leftPercent: (x / canvas.width) * 100, topPercent: (y / canvas.height) * 100, width, height }))
  return [
    ...applyRows(supportRows, canvas.width * 0.21, 164, 74),
    ...claimRows.map(({ item, y }) => ({ ...item, x: canvas.width * 0.5, y, leftPercent: 50, topPercent: (y / canvas.height) * 100, width: 184, height: 82 })),
    ...applyRows(datasetRows, canvas.width * 0.79, 164, 74),
  ]
}

function packOriginalTraceNodes(nodes: ProjectionLayoutNode[], canvas: { width: number; height: number }) {
  return nodes.map((node) => {
    const slot = originalTraceSlots(entityKey(node.entityId))
    if (!slot) return node
    return {
      ...node,
      x: (slot.left / 100) * canvas.width,
      y: (slot.top / 100) * canvas.height,
      leftPercent: slot.left,
      topPercent: slot.top,
      width: slot.width || 132,
      height: slot.height || 58,
    }
  })
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

export function selectProjectedRelations(project: ArchitectureProjectV2, viewId: string) {
  const view = project.views[viewId]
  if (!view) return []
  const entityIds = new Set(view.projectedEntityIds)
  return Object.values(project.relations).filter((relation) => entityIds.has(relation.sourceId) && entityIds.has(relation.targetId))
}

function entityKey(entityId: string) {
  return entityId.split(":").pop() || entityId
}

function selectDisplayEntityIds(project: ArchitectureProjectV2, viewId: string, options: LayoutOptions = {}) {
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

  options.traceEntityIds?.forEach((entityId) => revealDirectContext(entityId))
  return base.filter((entityId) => visible.has(entityId))
}

export function buildProjectionLayout(project: ArchitectureProjectV2, viewId: string, options: LayoutOptions = {}): ProjectionLayout {
  const view = project.views[viewId]
  const actualCanvas = measuredCanvas(options)
  if (!view) {
    return { nodes: [], edges: [], projectedEntityIds: new Set(), viewport: { x: 0, y: 0, zoom: 1 }, canvas: actualCanvas }
  }

  const displayEntityIds = selectDisplayEntityIds(project, viewId, options)
  const projectedEntityIds = new Set(displayEntityIds)
  const relationPairs = architectureRelationPairs(project, projectedEntityIds)
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

  let canvas = actualCanvas
  let nodes = rawNodes.map((node) => {
    const leftPercent = normalize(node.projection.position.x, minX, maxX, 10, 88)
    const topPercent = normalize(node.projection.position.y, minY, maxY, 14, 86)
    return {
      ...node,
      x: (leftPercent / 100) * canvas.width,
      y: (topPercent / 100) * canvas.height,
      leftPercent,
      topPercent,
      width: node.projection.size?.width || 176,
      height: node.projection.size?.height || 78,
    }
  })

  if (view.kind === "architecture" && options.detailLevel === "full") {
    const fullLayout = packFullArchitectureNodes(project, nodes, actualCanvas, relationPairs)
    nodes = fullLayout.nodes
    canvas = fullLayout.canvas
  } else if (view.kind === "architecture" && !project.project.id.includes("original-trace")) {
    const overviewLayout = packLayeredArchitectureNodes(project, rawNodes, actualCanvas, { overview: true, relationPairs })
    nodes = overviewLayout.nodes
    canvas = overviewLayout.canvas
  } else if (view.kind === "architecture" && project.project.id.includes("original-trace")) {
    nodes = packOriginalTraceNodes(nodes, canvas)
  } else if (view.kind === "evidence") {
    nodes = packEvidenceClaimNodes(project, nodes, Object.values(project.relations).filter((relation) => projectedEntityIds.has(relation.sourceId) && projectedEntityIds.has(relation.targetId)), canvas)
  }
  if (!(view.kind === "architecture" && options.detailLevel === "full")) {
    nodes = nodes.map((node) => clampNodeToCanvas(node, canvas, options.safeInset ?? defaultSafeInset))
  }
  const nodeByEntityId = new Map(nodes.map((node) => [node.entityId, node]))
  const nodeRects = nodes.map((node) => nodeRect(node))
  const rectByEntityId = new Map(nodeRects.map((rect) => [rect.id, rect]))
  const pairCounts = new Map<string, number>()
  const incomingRelations = new Map<string, TypedRelation[]>()
  const outgoingRelations = new Map<string, TypedRelation[]>()
  Object.values(project.relations)
    .filter((relation) => projectedEntityIds.has(relation.sourceId) && projectedEntityIds.has(relation.targetId))
    .forEach((relation) => {
      incomingRelations.set(relation.targetId, [...(incomingRelations.get(relation.targetId) || []), relation])
      outgoingRelations.set(relation.sourceId, [...(outgoingRelations.get(relation.sourceId) || []), relation])
    })

  const routedEdgePoints: Array<Array<{ x: number; y: number }>> = []
  const regionBoundaryY = canvas.height / 2
  const visibleRelations = Object.values(project.relations)
    .filter((relation) => projectedEntityIds.has(relation.sourceId) && projectedEntityIds.has(relation.targetId))
    .sort((a, b) => {
      const targetCompare = a.targetId.localeCompare(b.targetId)
      if (targetCompare) return targetCompare
      const sourceCompare = a.sourceId.localeCompare(b.sourceId)
      if (sourceCompare) return sourceCompare
      return a.id.localeCompare(b.id)
    })

  const edges = visibleRelations.flatMap((relation) => {
    const source = nodeByEntityId.get(relation.sourceId)
    const target = nodeByEntityId.get(relation.targetId)
    if (!source || !target) return []
    const pairKey = `${relation.sourceId}->${relation.targetId}`
    const pairIndex = pairCounts.get(pairKey) || 0
    pairCounts.set(pairKey, pairIndex + 1)
    const targetRelations = incomingRelations.get(relation.targetId) || [relation]
    const sourceRelations = outgoingRelations.get(relation.sourceId) || [relation]
    const sourceRect = rectByEntityId.get(source.entityId) || nodeRect(source)
    const targetRect = rectByEntityId.get(target.entityId) || nodeRect(target)
    const routeOptions = {
      targetPortIndex: Math.max(0, targetRelations.findIndex((candidate) => candidate.id === relation.id)),
      targetPortCount: targetRelations.length,
      sourcePortIndex: Math.max(0, sourceRelations.findIndex((candidate) => candidate.id === relation.id)),
      sourcePortCount: sourceRelations.length,
    }
    const routed = routeLayeredEdge(sourceRect, targetRect, routeOptions)
    routedEdgePoints.push(routed.points)
    const labelOffset = pairIndex * 10
    return [
      {
        relation,
        path: routed.path,
        labelX: routed.labelX,
        labelY: routed.labelY + labelOffset,
        sourceX: routed.sourcePort.x,
        sourceY: routed.sourcePort.y,
        targetX: routed.targetPort.x,
        targetY: routed.targetPort.y,
        grammar: routed.grammar,
        bendCount: routed.bendCount,
        routeScore: routed.routeScore,
        routeRatio: routed.routeRatio ?? routed.routeScore,
        nonMonotone: routed.nonMonotone ?? false,
        points: routed.points,
      },
    ]
  })

  return {
    nodes,
    edges,
    projectedEntityIds,
    viewport: {
      x: view.kind === "architecture" && (options.detailLevel === "full" || !project.project.id.includes("original-trace")) ? 0 : view.viewport?.x || 0,
      y: view.kind === "architecture" && (options.detailLevel === "full" || !project.project.id.includes("original-trace")) ? 0 : view.viewport?.y || 0,
      zoom: view.kind === "architecture" && (options.detailLevel === "full" || !project.project.id.includes("original-trace")) ? 1 : options.canvasWidth || options.canvasHeight ? 1 : view.viewport?.zoom || 1,
    },
    canvas,
  }
}

function nodeRect(node: ProjectionLayoutNode): GraphRect {
  return {
    id: node.entityId,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    lane: node.lane,
  }
}
