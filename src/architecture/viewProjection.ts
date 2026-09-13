import type { ArchitectureProjectV2, TypedRelation, ViewProjectionNode } from "./types"
import type { ArchitectureDetailLevel } from "./session"
import { architectureLane, layoutArchitectureLanes, routeBoundaryEdge, type GraphRect } from "./graphPresentation"

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

const catTraceOverviewSlots: Record<string, { left: number; top: number; width?: number; height?: number }> = {
  Y_raw: { left: 8, top: 28, width: 104, height: 78 },
  x_i: { left: 8, top: 66, width: 104, height: 78 },
  c_f: { left: 22, top: 28, width: 104, height: 78 },
  g_f: { left: 22, top: 66, width: 104, height: 78 },
  mathcal_K: { left: 36, top: 20, width: 104, height: 78 },
  mathcal_U: { left: 36, top: 44, width: 104, height: 84 },
  mathcal_G: { left: 36, top: 70, width: 104, height: 78 },
  nu: { left: 50, top: 17, width: 104, height: 84 },
  zU_igh: { left: 50, top: 39, width: 104, height: 78 },
  yU_igh: { left: 50, top: 62, width: 104, height: 78 },
  a_g: { left: 50, top: 84, width: 104, height: 78 },
  gamma0: { left: 64, top: 17, width: 104, height: 78 },
  alphaU_gh: { left: 64, top: 39, width: 104, height: 78 },
  betaU_gh: { left: 64, top: 62, width: 104, height: 78 },
  vU_gh: { left: 64, top: 84, width: 104, height: 78 },
  pi_g: { left: 78, top: 17, width: 104, height: 78 },
  betaK_j: { left: 78, top: 17, width: 104, height: 78 },
  p_g: { left: 78, top: 39, width: 104, height: 78 },
  Sigma_W: { left: 78, top: 62, width: 104, height: 84 },
  p_g_star: { left: 78, top: 84, width: 104, height: 78 },
  alphaK_j: { left: 78, top: 84, width: 104, height: 78 },
  gamma_g: { left: 94, top: 28, width: 104, height: 78 },
  posterior_inference: { left: 94, top: 55, width: 104, height: 84 },
  richness_targets: { left: 94, top: 78, width: 104, height: 84 },
  zero_slots: { left: 94, top: 92, width: 104, height: 78 },
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

function isCatTraceArchitectureOverview(project: ArchitectureProjectV2, view: ArchitectureProjectV2["views"][string], options: LayoutOptions) {
  return view.kind === "architecture" && options.detailLevel === "overview" && project.project.id.includes("cat-trace-frozen-v2")
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

function evidenceSlots(entityId: string) {
  const slots: Record<string, { left: number; top: number; width?: number; height?: number }> = {
    "entity:evidence:proof:trace-reference": { left: 14, top: 14, width: 150, height: 66 },
    "entity:evidence:claim:tail-calibration": { left: 38, top: 14, width: 154, height: 68 },
    "entity:evidence:data:finland": { left: 62, top: 14, width: 150, height: 66 },
    "entity:evidence:limitation:real-data": { left: 86, top: 32, width: 150, height: 66 },
    "entity:evidence:data:malagasy": { left: 14, top: 50, width: 150, height: 66 },
    "entity:evidence:claim:open-tail-response": { left: 38, top: 50, width: 154, height: 68 },
    "entity:evidence:claim:marked-discovery": { left: 86, top: 56, width: 150, height: 66 },
    "entity:evidence:implementation:fixtures": { left: 14, top: 84, width: 150, height: 66 },
    "entity:evidence:claim:zero-slots": { left: 38, top: 84, width: 154, height: 68 },
    "entity:evidence:stress:g05": { left: 62, top: 84, width: 150, height: 66 },
    "entity:evidence:data:swa-plants": { left: 86, top: 84, width: 150, height: 66 },
  }
  return slots[entityId]
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

function packFullArchitectureNodes(project: ArchitectureProjectV2, nodes: ProjectionLayoutNode[]) {
  const layout = layoutArchitectureLanes(nodes, (node) => project.entities[node.entityId]?.layer, { width: presentationCanvas.width, minHeight: presentationCanvas.height })
  return {
    nodes: layout.nodes.map((node) => ({
      ...node,
      leftPercent: (node.x / layout.width) * 100,
      topPercent: (node.y / layout.height) * 100,
    })),
    canvas: { width: layout.width, height: layout.height },
  }
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

  revealDirectContext(options.selectedEntityId)
  options.traceEntityIds?.forEach((entityId) => revealDirectContext(entityId))
  return base.filter((entityId) => visible.has(entityId))
}

export function buildProjectionLayout(project: ArchitectureProjectV2, viewId: string, options: LayoutOptions = {}): ProjectionLayout {
  const view = project.views[viewId]
  const actualCanvas = measuredCanvas(options)
  if (!view) {
    return { nodes: [], edges: [], projectedEntityIds: new Set(), viewport: { x: 0, y: 0, zoom: 1 }, canvas: actualCanvas }
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

  let canvas = actualCanvas
  let nodes = rawNodes.map((node) => {
    const slot = isStableCatOverview ? catTraceOverviewSlots[entityKey(node.entityId)] : undefined
    const leftPercent = slot?.left ?? normalize(node.projection.position.x, minX, maxX, 10, 88)
    const topPercent = slot?.top ?? normalize(node.projection.position.y, minY, maxY, 14, 86)
    return {
      ...node,
      x: (leftPercent / 100) * canvas.width,
      y: (topPercent / 100) * canvas.height,
      leftPercent,
      topPercent,
      width: slot?.width ?? (isStableCatOverview ? 104 : node.projection.size?.width || 176),
      height: slot?.height ?? (isStableCatOverview ? 78 : node.projection.size?.height || 78),
    }
  })

  if (view.kind === "architecture" && options.detailLevel === "full") {
    const fullLayout = packFullArchitectureNodes(project, nodes)
    nodes = fullLayout.nodes
    canvas = fullLayout.canvas
  } else if (view.kind === "architecture" && project.project.id.includes("original-trace")) {
    nodes = packOriginalTraceNodes(nodes, canvas)
  } else if (view.kind === "evidence") {
    nodes = nodes.map((node) => {
      const slot = evidenceSlots(node.entityId)
      return slot ? { ...node, x: (slot.left / 100) * canvas.width, y: (slot.top / 100) * canvas.height, leftPercent: slot.left, topPercent: slot.top, width: slot.width || node.width, height: slot.height || node.height } : node
    })
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

  const edges = Object.values(project.relations).filter((relation) => projectedEntityIds.has(relation.sourceId) && projectedEntityIds.has(relation.targetId)).flatMap((relation) => {
    const source = nodeByEntityId.get(relation.sourceId)
    const target = nodeByEntityId.get(relation.targetId)
    if (!source || !target) return []
    const pairKey = `${relation.sourceId}->${relation.targetId}`
    const pairIndex = pairCounts.get(pairKey) || 0
    pairCounts.set(pairKey, pairIndex + 1)
    const targetRelations = incomingRelations.get(relation.targetId) || [relation]
    const sourceRelations = outgoingRelations.get(relation.sourceId) || [relation]
    const routed = routeBoundaryEdge(rectByEntityId.get(source.entityId) || nodeRect(source), rectByEntityId.get(target.entityId) || nodeRect(target), {
      targetPortIndex: Math.max(0, targetRelations.findIndex((candidate) => candidate.id === relation.id)),
      targetPortCount: targetRelations.length,
      sourcePortIndex: Math.max(0, sourceRelations.findIndex((candidate) => candidate.id === relation.id)),
      sourcePortCount: sourceRelations.length,
      obstacles: nodeRects,
    })
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
      },
    ]
  })

  return {
    nodes,
    edges,
    projectedEntityIds,
    viewport: {
      x: view.kind === "architecture" && options.detailLevel === "full" ? 0 : view.viewport?.x || 0,
      y: view.viewport?.y || 0,
      zoom: view.kind === "architecture" && options.detailLevel === "full" ? Math.min(0.82, presentationCanvas.height / canvas.height) : options.canvasWidth || options.canvasHeight ? 1 : view.viewport?.zoom || 1,
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
