import type { SemanticLayer } from "./types"

export type GraphRect = {
  id: string
  x: number
  y: number
  width: number
  height: number
  lane?: number
}

export type BoundaryPort = {
  x: number
  y: number
  side: "left" | "right" | "top" | "bottom"
}

export type RoutedPath = {
  path: string
  sourcePort: BoundaryPort
  targetPort: BoundaryPort
  labelX: number
  labelY: number
}

type RouteCandidate = {
  points: Array<{ x: number; y: number }>
  labelX: number
  labelY: number
}

export type ProvenanceSource = {
  id: string
  label: string
  copy: string
  chips: readonly string[]
  relationIds: readonly string[]
  relationType: string
}

export type ProvenanceLayoutItem = ProvenanceSource & {
  rect: GraphRect
  path: string
  sourcePort: BoundaryPort
  targetPort: BoundaryPort
  chipsLayout: Array<{ label: string; x: number; y: number }>
}

export type ProvenanceLayout = {
  width: number
  height: number
  sources: ProvenanceLayoutItem[]
  target: GraphRect
}

export const architectureLaneOrder: SemanticLayer[] = ["observation", "measurement", "latent", "parameterization", "inference", "target"]

export function architectureLane(layer?: SemanticLayer) {
  const lanes: Record<SemanticLayer, number> = {
    observation: 0,
    measurement: 1,
    latent: 2,
    parameterization: 3,
    assumption: 3,
    inference: 4,
    prediction: 5,
    target: 5,
    validation: 5,
    legacy: 5,
  }
  return layer ? lanes[layer] : 3
}

function rectLeft(rect: GraphRect) {
  return rect.x - rect.width / 2
}

function rectRight(rect: GraphRect) {
  return rect.x + rect.width / 2
}

function rectTop(rect: GraphRect) {
  return rect.y - rect.height / 2
}

function rectBottom(rect: GraphRect) {
  return rect.y + rect.height / 2
}

function distributedOffset(index: number, total: number, span: number) {
  if (total <= 1) return 0
  return ((index + 1) / (total + 1) - 0.5) * span
}

function clamp(value: number, low: number, high: number) {
  return Math.max(low, Math.min(high, value))
}

function rectContainsPoint(rect: GraphRect, point: { x: number; y: number }, pad = 0) {
  return point.x > rectLeft(rect) - pad && point.x < rectRight(rect) + pad && point.y > rectTop(rect) - pad && point.y < rectBottom(rect) + pad
}

function segmentHitsRect(a: { x: number; y: number }, b: { x: number; y: number }, rect: GraphRect, pad = 6) {
  const steps = Math.max(6, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 18))
  for (let index = 1; index < steps; index += 1) {
    const t = index / steps
    const point = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
    if (rectContainsPoint(rect, point, pad)) return true
  }
  return false
}

function candidateHitsObstacle(candidate: RouteCandidate, obstacles: GraphRect[]) {
  for (let index = 0; index < candidate.points.length - 1; index += 1) {
    if (obstacles.some((obstacle) => segmentHitsRect(candidate.points[index], candidate.points[index + 1], obstacle))) return true
  }
  return false
}

function polylinePath(points: Array<{ x: number; y: number }>) {
  const [first, ...rest] = points
  return [`M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`, ...rest.map((point) => `L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)].join(" ")
}

function simplifyPolyline(points: Array<{ x: number; y: number }>) {
  return points.filter((point, index) => {
    const previous = points[index - 1]
    const next = points[index + 1]
    if (!previous || !next) return true
    const sameX = Math.abs(previous.x - point.x) < 0.01 && Math.abs(point.x - next.x) < 0.01
    const sameY = Math.abs(previous.y - point.y) < 0.01 && Math.abs(point.y - next.y) < 0.01
    return !sameX && !sameY
  })
}

function routeOnObstacleGrid(sourcePort: BoundaryPort, targetPort: BoundaryPort, source: GraphRect, target: GraphRect, obstacles: GraphRect[]): RouteCandidate | null {
  if (!obstacles.length) return null
  const allRects = [source, target, ...obstacles]
  const margin = 22
  const xValues = new Set<number>([sourcePort.x, targetPort.x])
  const yValues = new Set<number>([sourcePort.y, targetPort.y])
  allRects.forEach((rect) => {
    ;[rectLeft(rect) - margin, rectLeft(rect), rectRight(rect), rectRight(rect) + margin].forEach((value) => xValues.add(Number(value.toFixed(2))))
    ;[rectTop(rect) - margin, rectTop(rect), rectBottom(rect), rectBottom(rect) + margin].forEach((value) => yValues.add(Number(value.toFixed(2))))
  })
  xValues.add(Number((Math.min(...allRects.map((rect) => rectLeft(rect))) - margin * 2).toFixed(2)))
  xValues.add(Number((Math.max(...allRects.map((rect) => rectRight(rect))) + margin * 2).toFixed(2)))
  yValues.add(Number((Math.min(...allRects.map((rect) => rectTop(rect))) - margin * 2).toFixed(2)))
  yValues.add(Number((Math.max(...allRects.map((rect) => rectBottom(rect))) + margin * 2).toFixed(2)))

  const xs = [...xValues].sort((a, b) => a - b)
  const ys = [...yValues].sort((a, b) => a - b)
  const key = (x: number, y: number) => `${x}:${y}`
  const parse = (value: string) => {
    const [x, y] = value.split(":").map(Number)
    return { x, y }
  }
  const startKey = key(sourcePort.x, sourcePort.y)
  const endKey = key(targetPort.x, targetPort.y)
  const blocked = (x: number, y: number) => {
    if (key(x, y) === startKey || key(x, y) === endKey) return false
    return obstacles.some((obstacle) => rectContainsPoint(obstacle, { x, y }, 6))
  }
  const isClearSegment = (a: { x: number; y: number }, b: { x: number; y: number }) => !obstacles.some((obstacle) => segmentHitsRect(a, b, obstacle, 6))
  const queue = [startKey]
  const visited = new Set([startKey])
  const previous = new Map<string, string>()

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const currentKey = queue[cursor]
    if (currentKey === endKey) break
    const current = parse(currentKey)
    const xIndex = xs.indexOf(current.x)
    const yIndex = ys.indexOf(current.y)
    const neighbors = [
      xIndex > 0 ? { x: xs[xIndex - 1], y: current.y } : null,
      xIndex < xs.length - 1 ? { x: xs[xIndex + 1], y: current.y } : null,
      yIndex > 0 ? { x: current.x, y: ys[yIndex - 1] } : null,
      yIndex < ys.length - 1 ? { x: current.x, y: ys[yIndex + 1] } : null,
    ].filter(Boolean) as Array<{ x: number; y: number }>
    neighbors
      .sort((a, b) => Math.abs(a.x - targetPort.x) + Math.abs(a.y - targetPort.y) - (Math.abs(b.x - targetPort.x) + Math.abs(b.y - targetPort.y)))
      .forEach((neighbor) => {
        const neighborKey = key(neighbor.x, neighbor.y)
        if (visited.has(neighborKey) || blocked(neighbor.x, neighbor.y) || !isClearSegment(current, neighbor)) return
        visited.add(neighborKey)
        previous.set(neighborKey, currentKey)
        queue.push(neighborKey)
      })
  }

  if (!visited.has(endKey)) return null
  const points = [targetPort]
  let cursor = endKey
  while (cursor !== startKey) {
    cursor = previous.get(cursor) || startKey
    points.push(parse(cursor))
  }
  points.reverse()
  const simplified = simplifyPolyline(points)
  const middle = simplified[Math.floor(simplified.length / 2)] || targetPort
  return { points: simplified, labelX: middle.x + 8, labelY: middle.y - 8 }
}

function horizontalCorridors(obstacles: GraphRect[], preferredY: number) {
  const padded = obstacles
    .map((rect) => ({ top: rectTop(rect) - 24, bottom: rectBottom(rect) + 24 }))
    .sort((a, b) => a.top - b.top)
  const merged: Array<{ top: number; bottom: number }> = []
  padded.forEach((span) => {
    const last = merged[merged.length - 1]
    if (last && span.top <= last.bottom) {
      last.bottom = Math.max(last.bottom, span.bottom)
    } else {
      merged.push({ ...span })
    }
  })
  const candidates = [preferredY]
  for (let index = 0; index < merged.length - 1; index += 1) {
    const gap = merged[index + 1].top - merged[index].bottom
    if (gap >= 34) candidates.push(merged[index].bottom + gap / 2)
  }
  candidates.push((merged[0]?.top ?? preferredY) - 34, (merged[merged.length - 1]?.bottom ?? preferredY) + 34)
  return [...new Set(candidates.map((value) => Number(value.toFixed(2))))].sort((a, b) => Math.abs(a - preferredY) - Math.abs(b - preferredY))
}

function verticalCorridors(obstacles: GraphRect[], preferredX: number) {
  const padded = obstacles
    .map((rect) => ({ left: rectLeft(rect) - 24, right: rectRight(rect) + 24 }))
    .sort((a, b) => a.left - b.left)
  const merged: Array<{ left: number; right: number }> = []
  padded.forEach((span) => {
    const last = merged[merged.length - 1]
    if (last && span.left <= last.right) {
      last.right = Math.max(last.right, span.right)
    } else {
      merged.push({ ...span })
    }
  })
  const candidates = [preferredX]
  for (let index = 0; index < merged.length - 1; index += 1) {
    const gap = merged[index + 1].left - merged[index].right
    if (gap >= 34) candidates.push(merged[index].right + gap / 2)
  }
  candidates.push((merged[0]?.left ?? preferredX) - 34, (merged[merged.length - 1]?.right ?? preferredX) + 34)
  return [...new Set(candidates.map((value) => Number(value.toFixed(2))))].sort((a, b) => Math.abs(a - preferredX) - Math.abs(b - preferredX))
}

export function boundaryPort(source: GraphRect, target: GraphRect, options: { role: "source" | "target"; portIndex?: number; portCount?: number } = { role: "source" }): BoundaryPort {
  const portIndex = options.portIndex || 0
  const portCount = Math.max(1, options.portCount || 1)
  const dx = target.x - source.x
  const dy = target.y - source.y
  const sameLane = Math.abs(dx) < source.width * 0.55
  const pad = Math.min(16, Math.max(8, source.height * 0.16))

  if (sameLane && Math.abs(dy) > source.height * 0.6) {
    const side = dy >= 0 ? "bottom" : "top"
    const x = clamp(source.x + distributedOffset(portIndex, portCount, source.width * 0.54), rectLeft(source) + pad, rectRight(source) - pad)
    return { x, y: side === "bottom" ? rectBottom(source) : rectTop(source), side }
  }

  const side = dx >= 0 ? "right" : "left"
  const y = clamp(source.y + distributedOffset(portIndex, portCount, source.height * 0.62), rectTop(source) + pad, rectBottom(source) - pad)
  return { x: side === "right" ? rectRight(source) : rectLeft(source), y, side }
}

export function routeBoundaryEdge(source: GraphRect, target: GraphRect, options: { targetPortIndex?: number; targetPortCount?: number; sourcePortIndex?: number; sourcePortCount?: number; obstacles?: GraphRect[] } = {}): RoutedPath {
  const sourcePort = boundaryPort(source, target, {
    role: "source",
    portIndex: options.sourcePortIndex,
    portCount: options.sourcePortCount,
  })
  const targetPort = boundaryPort(target, source, {
    role: "target",
    portIndex: options.targetPortIndex,
    portCount: options.targetPortCount,
  })

  const obstacles = (options.obstacles || []).filter((obstacle) => obstacle.id !== source.id && obstacle.id !== target.id)
  const sameLane = Math.abs(source.x - target.x) < Math.max(source.width, target.width)
  const direction = targetPort.x >= sourcePort.x ? 1 : -1
  const laneGap = Math.max(32, Math.min(68, Math.abs(targetPort.x - sourcePort.x) * 0.45))
  const preferredY = sourcePort.y + (targetPort.y - sourcePort.y) * 0.5
  const preferredX = sourcePort.x + (targetPort.x - sourcePort.x) * 0.5
  const candidates: RouteCandidate[] = []

  if (sourcePort.side === "left" || sourcePort.side === "right" || targetPort.side === "left" || targetPort.side === "right") {
    horizontalCorridors(obstacles, preferredY).forEach((corridorY) => {
      candidates.push({
        points: [sourcePort, { x: sourcePort.x, y: corridorY }, { x: targetPort.x, y: corridorY }, targetPort],
        labelX: sourcePort.x + (targetPort.x - sourcePort.x) * 0.52,
        labelY: corridorY - 7,
      })
    })
    const minLeft = Math.min(rectLeft(source), rectLeft(target), ...obstacles.map((obstacle) => rectLeft(obstacle)))
    const maxRight = Math.max(rectRight(source), rectRight(target), ...obstacles.map((obstacle) => rectRight(obstacle)))
    ;[minLeft - 44, maxRight + 44].forEach((corridorX) => {
      candidates.push({
        points: [sourcePort, { x: corridorX, y: sourcePort.y }, { x: corridorX, y: targetPort.y }, targetPort],
        labelX: corridorX,
        labelY: preferredY,
      })
    })
  }

  verticalCorridors(obstacles, preferredX).forEach((corridorX) => {
    candidates.push({
      points: [sourcePort, { x: corridorX, y: sourcePort.y }, { x: corridorX, y: targetPort.y }, targetPort],
      labelX: corridorX + 7,
      labelY: sourcePort.y + (targetPort.y - sourcePort.y) * 0.5,
    })
  })
  const minTop = Math.min(rectTop(source), rectTop(target), ...obstacles.map((obstacle) => rectTop(obstacle)))
  const maxBottom = Math.max(rectBottom(source), rectBottom(target), ...obstacles.map((obstacle) => rectBottom(obstacle)))
  ;[minTop - 44, maxBottom + 44].forEach((corridorY) => {
    candidates.push({
      points: [sourcePort, { x: sourcePort.x, y: corridorY }, { x: targetPort.x, y: corridorY }, targetPort],
      labelX: preferredX,
      labelY: corridorY,
    })
  })

  const selected = candidates.find((candidate) => !candidateHitsObstacle(candidate, obstacles))
  if (selected) {
    return {
      path: polylinePath(selected.points),
      sourcePort,
      targetPort,
      labelX: Number(selected.labelX.toFixed(2)),
      labelY: Number(selected.labelY.toFixed(2)),
    }
  }

  const gridRoute = routeOnObstacleGrid(sourcePort, targetPort, source, target, obstacles)
  if (gridRoute) {
    return {
      path: polylinePath(gridRoute.points),
      sourcePort,
      targetPort,
      labelX: Number(gridRoute.labelX.toFixed(2)),
      labelY: Number(gridRoute.labelY.toFixed(2)),
    }
  }

  const midX = sameLane ? Math.max(rectRight(source), rectRight(target)) + laneGap : sourcePort.x + (targetPort.x - sourcePort.x) * 0.5
  const roundedMidX = Number(midX.toFixed(2))
  const labelX = sameLane ? roundedMidX + 10 * direction : sourcePort.x + (targetPort.x - sourcePort.x) * 0.44
  const labelY = sourcePort.y + (targetPort.y - sourcePort.y) * 0.48
  const path = `M ${sourcePort.x.toFixed(2)} ${sourcePort.y.toFixed(2)} C ${roundedMidX.toFixed(2)} ${sourcePort.y.toFixed(2)}, ${roundedMidX.toFixed(2)} ${targetPort.y.toFixed(2)}, ${targetPort.x.toFixed(2)} ${targetPort.y.toFixed(2)}`

  return {
    path,
    sourcePort,
    targetPort,
    labelX: Number(labelX.toFixed(2)),
    labelY: Number(labelY.toFixed(2)),
  }
}

export function layoutArchitectureLanes<T extends { entityId: string; projection: { position: { x: number; y: number } } }>(
  nodes: T[],
  layerForNode: (node: T) => SemanticLayer | undefined,
  options: { width?: number; minHeight?: number; nodeWidth?: number; nodeHeight?: number } = {},
) {
  const width = options.width || 1000
  const minHeight = options.minHeight || 620
  const nodeWidth = options.nodeWidth || 92
  const nodeHeight = options.nodeHeight || 60
  const laneCount = architectureLaneOrder.length
  const marginX = 72
  const laneWidth = (width - marginX * 2) / (laneCount - 1)
  const laneBuckets = new Map<number, T[]>()

  nodes.forEach((node) => {
    const lane = architectureLane(layerForNode(node))
    const bucket = laneBuckets.get(lane) || []
    bucket.push(node)
    laneBuckets.set(lane, bucket)
  })

  let height = minHeight
  const positioned: Array<T & { x: number; y: number; width: number; height: number; lane: number }> = []
  for (let lane = 0; lane < laneCount; lane += 1) {
    const bucket = (laneBuckets.get(lane) || []).sort((a, b) => a.projection.position.y - b.projection.position.y || a.projection.position.x - b.projection.position.x || a.entityId.localeCompare(b.entityId))
    if (!bucket.length) continue

    const subcolumns = bucket.length > 9 ? 2 : 1
    const rowsPerSubcolumn = Math.ceil(bucket.length / subcolumns)
    const gapY = Math.max(112, nodeHeight + 40)
    const contentHeight = (rowsPerSubcolumn - 1) * gapY + nodeHeight
    const laneHeight = Math.max(minHeight - 130, contentHeight)
    height = Math.max(height, laneHeight + 130)
    const startY = 70 + (laneHeight - contentHeight) / 2 + nodeHeight / 2
    const laneCenter = marginX + lane * laneWidth
    const subcolumnGap = Math.min(nodeWidth + 34, laneWidth * 0.76)

    bucket.forEach((node, index) => {
      const subcolumn = Math.floor(index / rowsPerSubcolumn)
      const row = index % rowsPerSubcolumn
      const x = laneCenter + (subcolumn - (subcolumns - 1) / 2) * subcolumnGap
      const y = startY + row * gapY
      positioned.push({ ...node, x, y, width: nodeWidth, height: nodeHeight, lane })
    })
  }

  return { nodes: positioned, width, height: Math.ceil(height) }
}

export function layoutProvenanceFlow(sources: readonly ProvenanceSource[], options: { width?: number; height?: number; sourceWidth?: number; sourceHeight?: number; targetWidth?: number; targetHeight?: number } = {}): ProvenanceLayout {
  const width = options.width || 1000
  const height = options.height || 620
  const sourceWidth = options.sourceWidth || 250
  const sourceHeight = options.sourceHeight || 122
  const targetWidth = options.targetWidth || 260
  const targetHeight = options.targetHeight || 104
  const sourceX = 165
  const target: GraphRect = { id: "provenance-target", x: width - 188, y: height / 2, width: targetWidth, height: targetHeight }
  const topPad = 76
  const bottomPad = 76
  const available = height - topPad - bottomPad
  const step = sources.length <= 1 ? 0 : available / (sources.length - 1)

  const items = sources.map((source, index) => {
    const rect: GraphRect = {
      id: source.id,
      x: sourceX,
      y: topPad + index * step,
      width: sourceWidth,
      height: sourceHeight,
    }
    const sourcePort: BoundaryPort = { x: rect.x + rect.width / 2, y: rect.y, side: "right" }
    const targetY = target.y - target.height / 2 + ((index + 1) / (sources.length + 1)) * target.height
    const targetPort: BoundaryPort = { x: target.x - target.width / 2, y: targetY, side: "left" }
    const midX = sourcePort.x + (targetPort.x - sourcePort.x) * 0.56
    const path = `M ${sourcePort.x.toFixed(2)} ${sourcePort.y.toFixed(2)} C ${midX.toFixed(2)} ${sourcePort.y.toFixed(2)}, ${midX.toFixed(2)} ${targetPort.y.toFixed(2)}, ${targetPort.x.toFixed(2)} ${targetPort.y.toFixed(2)}`
    const chipAnchorX = sourcePort.x + (targetPort.x - sourcePort.x) * 0.38
    const chipAnchorY = sourcePort.y + (targetPort.y - sourcePort.y) * 0.5
    const chipGap = 31
    const chipsLayout = source.chips.map((label, chipIndex) => ({
      label,
      x: chipAnchorX + (chipIndex - (source.chips.length - 1) / 2) * 12,
      y: chipAnchorY + (chipIndex - (source.chips.length - 1) / 2) * chipGap,
    }))
    return { ...source, rect, path, sourcePort, targetPort, chipsLayout }
  })

  return { width, height, sources: items, target }
}
