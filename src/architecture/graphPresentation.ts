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

export type RoutePoint = { x: number; y: number }

export type ScientificRouteGrammar = "soft-cubic" | "rounded-orthogonal"

export type RoutedPath = {
  path: string
  sourcePort: BoundaryPort
  targetPort: BoundaryPort
  labelX: number
  labelY: number
  points: RoutePoint[]
  grammar: ScientificRouteGrammar
  bendCount: number
  routeScore: number
}

type RouteCandidate = {
  points: RoutePoint[]
  preferredGrammar?: ScientificRouteGrammar
  sourcePortPenalty?: number
  targetPortPenalty?: number
  fallbackPenalty?: number
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
  labelGroup: ProvenanceLabelGroup
}

export type ProvenanceLayout = {
  width: number
  height: number
  sources: ProvenanceLayoutItem[]
  target: GraphRect
}

export type ProvenanceLabelGroup = {
  labels: readonly string[]
  x: number
  y: number
  normalX: number
  normalY: number
  tangentX: number
  tangentY: number
}

export const architectureLaneOrder: SemanticLayer[] = ["observation", "measurement", "latent", "parameterization", "inference", "target"]

const routeCornerRadius = 12
const relationLabelOffset = 72
const bendPenalty = 72
const backwardPenalty = 9
const detourPenalty = 0.85
const proximityPenalty = 7.5
const portPenalty = 8
const terminalStubLength = 30
const cardClearance = 14
const terminalGapClearance = 6
const edgeEdgeCrossingPenalty = 1200
const cardBorderHugPenalty = 58
const terminalAnglePenalty = 120
const regionChangePenalty = 1.6

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

function portOutwardNormal(port: BoundaryPort) {
  if (port.side === "left") return { x: -1, y: 0 }
  if (port.side === "right") return { x: 1, y: 0 }
  if (port.side === "top") return { x: 0, y: -1 }
  return { x: 0, y: 1 }
}

function portStubPoint(port: BoundaryPort, length = terminalStubLength): RoutePoint {
  const normal = portOutwardNormal(port)
  return { x: port.x + normal.x * length, y: port.y + normal.y * length }
}

function terminalStubLengths(sourcePort: BoundaryPort, targetPort: BoundaryPort) {
  const sourceNormal = portOutwardNormal(sourcePort)
  const targetNormal = portOutwardNormal(targetPort)
  const sourceProjection = (targetPort.x - sourcePort.x) * sourceNormal.x + (targetPort.y - sourcePort.y) * sourceNormal.y
  const targetProjection = (sourcePort.x - targetPort.x) * targetNormal.x + (sourcePort.y - targetPort.y) * targetNormal.y
  const facing = sourceProjection > 0 && targetProjection > 0
  const oppositeNormals = Math.abs(sourceNormal.x + targetNormal.x) < 0.01 && Math.abs(sourceNormal.y + targetNormal.y) < 0.01
  if (!facing || !oppositeNormals) return { source: terminalStubLength, target: terminalStubLength }
  const available = Math.min(sourceProjection, targetProjection)
  const compactLength = clamp((available - terminalGapClearance) / 2, 10, terminalStubLength)
  return { source: compactLength, target: compactLength }
}

function withTerminalStubs(sourcePort: BoundaryPort, targetPort: BoundaryPort, interior: RoutePoint[] = []) {
  const stubLengths = terminalStubLengths(sourcePort, targetPort)
  return simplifyRoutePoints([sourcePort, portStubPoint(sourcePort, stubLengths.source), ...interior, portStubPoint(targetPort, stubLengths.target), targetPort])
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

function orientation(a: RoutePoint, b: RoutePoint, c: RoutePoint) {
  return (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y)
}

function segmentsIntersect(a: RoutePoint, b: RoutePoint, c: RoutePoint, d: RoutePoint) {
  const o1 = orientation(a, b, c)
  const o2 = orientation(a, b, d)
  const o3 = orientation(c, d, a)
  const o4 = orientation(c, d, b)
  return o1 * o2 < -0.01 && o3 * o4 < -0.01
}

function normalizedVector(a: RoutePoint, b: RoutePoint) {
  const length = Math.hypot(b.x - a.x, b.y - a.y) || 1
  return { x: (b.x - a.x) / length, y: (b.y - a.y) / length }
}

function renderedCandidatePoints(candidate: RouteCandidate) {
  const points = simplifyRoutePoints(candidate.points)
  if (candidate.preferredGrammar !== "soft-cubic" || points.length < 4) return points
  const sourcePort = points[0]
  const sourceStub = points[1]
  const targetStub = points[points.length - 2]
  const targetPort = points[points.length - 1]
  const { controlA, controlB } = softCubicControls(sourceStub, targetStub)
  return [sourcePort, sourceStub, ...cubicSamples(sourceStub, controlA, controlB, targetStub, 34).slice(1, -1), targetStub, targetPort]
}

function candidateHitsObstacle(candidate: RouteCandidate, obstacles: GraphRect[]) {
  const points = renderedCandidatePoints(candidate)
  for (let index = 0; index < points.length - 1; index += 1) {
    if (obstacles.some((obstacle) => segmentHitsRect(points[index], points[index + 1], obstacle))) return true
  }
  return false
}

function formatNumber(value: number) {
  return Number(value.toFixed(2))
}

function formatPoint(point: RoutePoint) {
  return `${point.x.toFixed(2)} ${point.y.toFixed(2)}`
}

function simplifyPolyline(points: RoutePoint[]) {
  const deduped = points.filter((point, index) => {
    const previous = points[index - 1]
    return !previous || Math.hypot(point.x - previous.x, point.y - previous.y) > 0.01
  })
  return deduped.filter((point, index) => {
    const previous = deduped[index - 1]
    const next = deduped[index + 1]
    if (!previous || !next) return true
    const sameX = Math.abs(previous.x - point.x) < 0.01 && Math.abs(point.x - next.x) < 0.01
    const sameY = Math.abs(previous.y - point.y) < 0.01 && Math.abs(point.y - next.y) < 0.01
    return !sameX && !sameY
  })
}

function simplifyRoutePoints(points: RoutePoint[]) {
  const deduped = points.filter((point, index) => {
    const previous = points[index - 1]
    return !previous || Math.hypot(point.x - previous.x, point.y - previous.y) > 0.01
  })
  const preserveFromStart = Math.min(2, Math.max(1, deduped.length - 1))
  const preserveFromEnd = Math.max(0, deduped.length - 2)
  return deduped.filter((point, index) => {
    const previous = deduped[index - 1]
    const next = deduped[index + 1]
    if (!previous || !next) return true
    if (index < preserveFromStart || index >= preserveFromEnd) return true
    const sameX = Math.abs(previous.x - point.x) < 0.01 && Math.abs(point.x - next.x) < 0.01
    const sameY = Math.abs(previous.y - point.y) < 0.01 && Math.abs(point.y - next.y) < 0.01
    return !sameX && !sameY
  })
}

function routeBendCount(points: RoutePoint[]) {
  return bendCount(simplifyPolyline(points.slice(1, -1)))
}

function polylineLength(points: RoutePoint[]) {
  let length = 0
  for (let index = 0; index < points.length - 1; index += 1) length += Math.hypot(points[index + 1].x - points[index].x, points[index + 1].y - points[index].y)
  return length
}

function bendCount(points: RoutePoint[]) {
  let bends = 0
  for (let index = 1; index < points.length - 1; index += 1) {
    const a = points[index - 1]
    const b = points[index]
    const c = points[index + 1]
    const dx1 = Math.sign(formatNumber(b.x - a.x))
    const dy1 = Math.sign(formatNumber(b.y - a.y))
    const dx2 = Math.sign(formatNumber(c.x - b.x))
    const dy2 = Math.sign(formatNumber(c.y - b.y))
    if (dx1 !== dx2 || dy1 !== dy2) bends += 1
  }
  return bends
}

function cubicPoint(start: RoutePoint, controlA: RoutePoint, controlB: RoutePoint, end: RoutePoint, t: number): RoutePoint {
  const u = 1 - t
  return {
    x: u ** 3 * start.x + 3 * u ** 2 * t * controlA.x + 3 * u * t ** 2 * controlB.x + t ** 3 * end.x,
    y: u ** 3 * start.y + 3 * u ** 2 * t * controlA.y + 3 * u * t ** 2 * controlB.y + t ** 3 * end.y,
  }
}

function cubicSamples(start: RoutePoint, controlA: RoutePoint, controlB: RoutePoint, end: RoutePoint, steps = 32) {
  return Array.from({ length: steps + 1 }, (_, index) => cubicPoint(start, controlA, controlB, end, index / steps))
}

function softCubicControls(sourcePort: RoutePoint, targetPort: RoutePoint) {
  const dx = targetPort.x - sourcePort.x
  const dy = targetPort.y - sourcePort.y
  const horizontal = Math.abs(dx) >= Math.abs(dy) * 0.72
  if (horizontal) {
    const direction = dx >= 0 ? 1 : -1
    const controlOffset = clamp(Math.abs(dx) * 0.44, 38, 148)
    const verticalBend = Math.abs(dy) < 10 ? clamp(Math.abs(dx) * 0.035, 6, 16) : 0
    return {
      controlA: { x: sourcePort.x + direction * controlOffset, y: sourcePort.y + verticalBend },
      controlB: { x: targetPort.x - direction * controlOffset, y: targetPort.y - verticalBend },
    }
  }
  const direction = dy >= 0 ? 1 : -1
  const controlOffset = clamp(Math.abs(dy) * 0.42, 34, 118)
  return {
    controlA: { x: sourcePort.x, y: sourcePort.y + direction * controlOffset },
    controlB: { x: targetPort.x, y: targetPort.y - direction * controlOffset },
  }
}

function softCubicHitsObstacle(sourcePort: RoutePoint, targetPort: RoutePoint, obstacles: GraphRect[]) {
  return softCubicObstacleHitCount(sourcePort, targetPort, obstacles) > 0
}

function softCubicObstacleHitCount(sourcePort: RoutePoint, targetPort: RoutePoint, obstacles: GraphRect[]) {
  const { controlA, controlB } = softCubicControls(sourcePort, targetPort)
  const samples = cubicSamples(sourcePort, controlA, controlB, targetPort, 34)
  return obstacles.filter((obstacle) => candidateHitsObstacle({ points: samples }, [obstacle])).length
}

function renderSoftCubicRoute(sourcePort: RoutePoint, targetPort: RoutePoint) {
  const { controlA, controlB } = softCubicControls(sourcePort, targetPort)
  return `M ${formatPoint(sourcePort)} C ${formatPoint(controlA)}, ${formatPoint(controlB)}, ${formatPoint(targetPort)}`
}

function renderSoftCubicRouteWithTerminals(points: RoutePoint[], sourcePort: BoundaryPort, targetPort: BoundaryPort) {
  const sourceStub = points[1] || portStubPoint(sourcePort)
  const targetStub = points[points.length - 2] || portStubPoint(targetPort)
  const { controlA, controlB } = softCubicControls(sourceStub, targetStub)
  return [`M ${formatPoint(sourcePort)}`, `L ${formatPoint(sourceStub)}`, `C ${formatPoint(controlA)}, ${formatPoint(controlB)}, ${formatPoint(targetStub)}`, `L ${formatPoint(targetPort)}`].join(" ")
}

function smoothPolylinePath(points: RoutePoint[]) {
  const simplified = simplifyPolyline(points)
  const [first] = simplified
  if (!first) return ""
  if (simplified.length <= 2) return renderSoftCubicRoute(simplified[0] as BoundaryPort, simplified[simplified.length - 1] as BoundaryPort)
  const commands = [`M ${formatPoint(first)}`]
  for (let index = 0; index < simplified.length - 1; index += 1) {
    const previous = simplified[index - 1] || simplified[index]
    const current = simplified[index]
    const next = simplified[index + 1]
    const after = simplified[index + 2] || next
    const controlA = { x: current.x + (next.x - previous.x) / 6, y: current.y + (next.y - previous.y) / 6 }
    const controlB = { x: next.x - (after.x - current.x) / 6, y: next.y - (after.y - current.y) / 6 }
    commands.push(`C ${formatPoint(controlA)}, ${formatPoint(controlB)}, ${formatPoint(next)}`)
  }
  return commands.join(" ")
}

export function roundedPolylinePath(points: RoutePoint[], radius = routeCornerRadius) {
  const simplified = simplifyRoutePoints(points)
  const [first, ...rest] = simplified
  if (!first) return ""
  if (simplified.length <= 2) return [`M ${formatPoint(first)}`, ...rest.map((point) => `L ${formatPoint(point)}`)].join(" ")
  const commands = [`M ${formatPoint(first)}`]
  for (let index = 1; index < simplified.length - 1; index += 1) {
    const previous = simplified[index - 1]
    const current = simplified[index]
    const next = simplified[index + 1]
    if (index === 1 || index === simplified.length - 2) {
      commands.push(`L ${formatPoint(current)}`)
      continue
    }
    const incomingLength = Math.hypot(current.x - previous.x, current.y - previous.y)
    const outgoingLength = Math.hypot(next.x - current.x, next.y - current.y)
    const corner = Math.min(radius, incomingLength / 2, outgoingLength / 2)
    if (corner <= 0.5) {
      commands.push(`L ${formatPoint(current)}`)
      continue
    }
    const before = {
      x: current.x - ((current.x - previous.x) / incomingLength) * corner,
      y: current.y - ((current.y - previous.y) / incomingLength) * corner,
    }
    const after = {
      x: current.x + ((next.x - current.x) / outgoingLength) * corner,
      y: current.y + ((next.y - current.y) / outgoingLength) * corner,
    }
    commands.push(`L ${formatPoint(before)}`, `Q ${formatPoint(current)} ${formatPoint(after)}`)
  }
  commands.push(`L ${formatPoint(simplified[simplified.length - 1])}`)
  return commands.join(" ")
}

function renderScientificRoute(points: RoutePoint[], grammar: ScientificRouteGrammar, sourcePort: BoundaryPort, targetPort: BoundaryPort) {
  if (grammar === "soft-cubic") return renderSoftCubicRouteWithTerminals(points, sourcePort, targetPort)
  return roundedPolylinePath(points, routeCornerRadius)
}

function pointToSegmentDistance(point: RoutePoint, a: RoutePoint, b: RoutePoint) {
  const lengthSquared = (b.x - a.x) ** 2 + (b.y - a.y) ** 2
  if (lengthSquared === 0) return Math.hypot(point.x - a.x, point.y - a.y)
  const t = clamp(((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) / lengthSquared, 0, 1)
  const projection = { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) }
  return Math.hypot(point.x - projection.x, point.y - projection.y)
}

function pointRectDistance(point: RoutePoint, rect: GraphRect) {
  const dx = Math.max(rectLeft(rect) - point.x, 0, point.x - rectRight(rect))
  const dy = Math.max(rectTop(rect) - point.y, 0, point.y - rectBottom(rect))
  return Math.hypot(dx, dy)
}

function segmentRectDistance(a: RoutePoint, b: RoutePoint, rect: GraphRect) {
  const samples = Math.max(4, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 34))
  let best = Infinity
  for (let index = 0; index <= samples; index += 1) {
    const t = index / samples
    best = Math.min(best, pointRectDistance({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }, rect))
  }
  for (const corner of [
    { x: rectLeft(rect), y: rectTop(rect) },
    { x: rectRight(rect), y: rectTop(rect) },
    { x: rectRight(rect), y: rectBottom(rect) },
    { x: rectLeft(rect), y: rectBottom(rect) },
  ]) {
    best = Math.min(best, pointToSegmentDistance(corner, a, b))
  }
  return best
}

function proximityScore(points: RoutePoint[], obstacles: GraphRect[]) {
  let score = 0
  for (let pointIndex = 0; pointIndex < points.length - 1; pointIndex += 1) {
    for (const obstacle of obstacles) {
      const distance = segmentRectDistance(points[pointIndex], points[pointIndex + 1], obstacle)
      if (distance < 34) score += (34 - distance) * proximityPenalty
    }
  }
  return score
}

function edgeCrossingScore(points: RoutePoint[], routedEdges: RoutePoint[][] = []) {
  let crossings = 0
  const segments = points.slice(0, -1).map((point, index) => [point, points[index + 1]] as const)
  for (const routed of routedEdges) {
    const routedSegments = routed.slice(0, -1).map((point, index) => [point, routed[index + 1]] as const)
    for (const [a, b] of segments.slice(1, -1)) {
      for (const [c, d] of routedSegments.slice(1, -1)) {
        if (Math.min(Math.hypot(a.x - c.x, a.y - c.y), Math.hypot(a.x - d.x, a.y - d.y), Math.hypot(b.x - c.x, b.y - c.y), Math.hypot(b.x - d.x, b.y - d.y)) < terminalStubLength) continue
        if (segmentsIntersect(a, b, c, d)) crossings += 1
      }
    }
  }
  return crossings * edgeEdgeCrossingPenalty
}

function cardBorderHugScore(points: RoutePoint[], source?: GraphRect, target?: GraphRect) {
  let score = 0
  const terminalSegmentCount = 1
  for (let index = terminalSegmentCount; index < points.length - 1 - terminalSegmentCount; index += 1) {
    const a = points[index]
    const b = points[index + 1]
    for (const rect of [source, target].filter(Boolean) as GraphRect[]) {
      const distance = segmentRectDistance(a, b, rect)
      if (distance < cardClearance) score += (cardClearance - distance) * cardBorderHugPenalty * Math.max(1, Math.hypot(b.x - a.x, b.y - a.y) / 24)
    }
  }
  return score
}

function endpointBodyViolation(points: RoutePoint[], source: GraphRect, target: GraphRect) {
  for (let index = 1; index < points.length - 2; index += 1) {
    const a = points[index]
    const b = points[index + 1]
    if (segmentHitsRect(a, b, source, -1) || segmentHitsRect(a, b, target, -1)) return true
  }
  return false
}

function angleBetweenDegrees(a: RoutePoint, b: RoutePoint) {
  const dot = clamp(a.x * b.x + a.y * b.y, -1, 1)
  return (Math.acos(dot) * 180) / Math.PI
}

function terminalAngleScore(points: RoutePoint[], sourcePort: BoundaryPort, targetPort: BoundaryPort) {
  if (points.length < 4) return terminalAnglePenalty * 90
  const sourceVector = normalizedVector(points[0], points[1])
  const sourceNormal = portOutwardNormal(sourcePort)
  const targetVector = normalizedVector(points[points.length - 2], points[points.length - 1])
  const targetOutward = portOutwardNormal(targetPort)
  const targetNormal = { x: -targetOutward.x, y: -targetOutward.y }
  return Math.max(0, angleBetweenDegrees(sourceVector, sourceNormal) - 15) * terminalAnglePenalty + Math.max(0, angleBetweenDegrees(targetVector, targetNormal) - 15) * terminalAnglePenalty
}

function regionChangeScore(points: RoutePoint[], sourcePort: BoundaryPort, targetPort: BoundaryPort, regionBoundaryY?: number) {
  if (!Number.isFinite(regionBoundaryY)) return 0
  const boundary = regionBoundaryY as number
  const sourceRegion = sourcePort.y < boundary ? "top" : "bottom"
  const targetRegion = targetPort.y < boundary ? "top" : "bottom"
  if (sourceRegion !== targetRegion) return 0
  return points.reduce((total, point) => {
    if (sourceRegion === "top") return total + Math.max(0, point.y - boundary)
    return total + Math.max(0, boundary - point.y)
  }, 0) * regionChangePenalty
}

export function scoreRouteCandidate(
  candidate: RouteCandidate,
  sourcePort: BoundaryPort,
  targetPort: BoundaryPort,
  obstacles: GraphRect[],
  options: { routedEdges?: RoutePoint[][]; sourceRect?: GraphRect; targetRect?: GraphRect; regionBoundaryY?: number } = {},
) {
  const points = simplifyRoutePoints(candidate.points)
  const length = polylineLength(points)
  const directLength = Math.hypot(targetPort.x - sourcePort.x, targetPort.y - sourcePort.y)
  const direction = targetPort.x >= sourcePort.x ? 1 : -1
  const backwardXDistance = points.slice(0, -1).reduce((total, point, index) => {
    const next = points[index + 1]
    const dx = next.x - point.x
    return total + Math.max(0, -dx * direction)
  }, 0)
  const minCorridorY = Math.min(sourcePort.y, targetPort.y) - 46
  const maxCorridorY = Math.max(sourcePort.y, targetPort.y) + 46
  const outsideCorridor = points.reduce((total, point) => total + Math.max(0, minCorridorY - point.y, point.y - maxCorridorY), 0)
  return (
    length +
    routeBendCount(points) * bendPenalty +
    backwardXDistance * backwardPenalty +
    Math.max(0, length - directLength) * detourPenalty +
    outsideCorridor * detourPenalty +
    proximityScore(points, obstacles) +
    edgeCrossingScore(points, options.routedEdges) +
    cardBorderHugScore(points, options.sourceRect, options.targetRect) +
    terminalAngleScore(points, sourcePort, targetPort) +
    regionChangeScore(points, sourcePort, targetPort, options.regionBoundaryY) +
    (candidate.sourcePortPenalty || 0) * portPenalty +
    (candidate.targetPortPenalty || 0) * portPenalty +
    (candidate.fallbackPenalty || 0)
  )
}

function labelPointForRoute(points: RoutePoint[], grammar: ScientificRouteGrammar, sourcePort: BoundaryPort, targetPort: BoundaryPort, obstacles: GraphRect[] = []) {
  const label = pathPointAndNormalAt(points, grammar, sourcePort, targetPort, 0.5)
  const candidates = [relationLabelOffset, -relationLabelOffset, 96, -96, 112, -112, 48, -48].map((offset) => ({
    x: label.x + label.normalX * offset,
    y: label.y + label.normalY * offset,
    offset,
  }))
  const scoreLabel = (point: RoutePoint & { offset: number }) =>
    obstacles.reduce((score, obstacle) => {
      const distance = pointRectDistance(point, obstacle)
      return score + (distance <= 4 ? 1000 : Math.max(0, 28 - distance) * 8)
    }, Math.abs(Math.abs(point.offset || relationLabelOffset) - relationLabelOffset) * 0.5)
  const selected = candidates.sort((a, b) => scoreLabel(a) - scoreLabel(b))[0]
  return {
    x: formatNumber(selected.x),
    y: formatNumber(selected.y),
  }
}

export function pathPointAndNormalAt(points: RoutePoint[], grammar: ScientificRouteGrammar, sourcePort: BoundaryPort, targetPort: BoundaryPort, fraction = 0.5) {
  const samples =
    grammar === "soft-cubic"
      ? (() => {
          const sourceStub = points[1] || portStubPoint(sourcePort)
          const targetStub = points[points.length - 2] || portStubPoint(targetPort)
          const { controlA, controlB } = softCubicControls(sourceStub, targetStub)
          return cubicSamples(sourceStub, controlA, controlB, targetStub, 48)
        })()
      : samplePolyline(points, 48)
  const targetDistance = polylineLength(samples) * clamp(fraction, 0, 1)
  let walked = 0
  for (let index = 0; index < samples.length - 1; index += 1) {
    const current = samples[index]
    const next = samples[index + 1]
    const segmentLength = Math.hypot(next.x - current.x, next.y - current.y)
    if (walked + segmentLength >= targetDistance) {
      const t = segmentLength ? (targetDistance - walked) / segmentLength : 0
      const x = current.x + (next.x - current.x) * t
      const y = current.y + (next.y - current.y) * t
      const tangentLength = Math.hypot(next.x - current.x, next.y - current.y) || 1
      const tangentX = (next.x - current.x) / tangentLength
      const tangentY = (next.y - current.y) / tangentLength
      return { x, y, tangentX, tangentY, normalX: -tangentY, normalY: tangentX }
    }
    walked += segmentLength
  }
  const last = samples[samples.length - 1] || targetPort
  return { x: last.x, y: last.y, tangentX: 1, tangentY: 0, normalX: 0, normalY: 1 }
}

function samplePolyline(points: RoutePoint[], samples = 48) {
  const length = polylineLength(points)
  if (!length) return points
  const sampled: RoutePoint[] = []
  for (let index = 0; index <= samples; index += 1) {
    const distance = (length * index) / samples
    let walked = 0
    for (let pointIndex = 0; pointIndex < points.length - 1; pointIndex += 1) {
      const current = points[pointIndex]
      const next = points[pointIndex + 1]
      const segmentLength = Math.hypot(next.x - current.x, next.y - current.y)
      if (walked + segmentLength >= distance || pointIndex === points.length - 2) {
        const t = segmentLength ? clamp((distance - walked) / segmentLength, 0, 1) : 0
        sampled.push({ x: current.x + (next.x - current.x) * t, y: current.y + (next.y - current.y) * t })
        break
      }
      walked += segmentLength
    }
  }
  return sampled
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
  type Direction = "h+" | "h-" | "v+" | "v-" | "start"
  const directionBetween = (a: RoutePoint, b: RoutePoint): Direction => {
    if (Math.abs(b.x - a.x) >= Math.abs(b.y - a.y)) return b.x >= a.x ? "h+" : "h-"
    return b.y >= a.y ? "v+" : "v-"
  }
  const stateKey = (pointKey: string, direction: Direction) => `${pointKey}|${direction}`
  const statePointKey = (state: string) => state.split("|")[0]
  const stateDirection = (state: string) => state.split("|")[1] as Direction
  const direction = targetPort.x >= sourcePort.x ? 1 : -1
  const startState = stateKey(startKey, "start")
  const distances = new Map<string, number>([[startState, 0]])
  const previous = new Map<string, string>()
  const queue = [startState]
  const visited = new Set<string>()
  let bestEndState: string | null = null

  for (let guard = 0; queue.length && guard < 5000; guard += 1) {
    queue.sort((a, b) => {
      const pointA = parse(statePointKey(a))
      const pointB = parse(statePointKey(b))
      const heuristicA = Math.abs(pointA.x - targetPort.x) + Math.abs(pointA.y - targetPort.y)
      const heuristicB = Math.abs(pointB.x - targetPort.x) + Math.abs(pointB.y - targetPort.y)
      return (distances.get(a) || Infinity) + heuristicA * 0.55 - ((distances.get(b) || Infinity) + heuristicB * 0.55)
    })
    const currentState = queue.shift() || startState
    if (visited.has(currentState)) continue
    visited.add(currentState)
    const currentKey = statePointKey(currentState)
    if (currentKey === endKey) {
      bestEndState = currentState
      break
    }
    const current = parse(currentKey)
    const currentDirection = stateDirection(currentState)
    const xIndex = xs.indexOf(current.x)
    const yIndex = ys.indexOf(current.y)
    const neighbors = [
      xIndex > 0 ? { x: xs[xIndex - 1], y: current.y } : null,
      xIndex < xs.length - 1 ? { x: xs[xIndex + 1], y: current.y } : null,
      yIndex > 0 ? { x: current.x, y: ys[yIndex - 1] } : null,
      yIndex < ys.length - 1 ? { x: current.x, y: ys[yIndex + 1] } : null,
    ].filter(Boolean) as Array<{ x: number; y: number }>
    neighbors.forEach((neighbor) => {
      const neighborKey = key(neighbor.x, neighbor.y)
      if (blocked(neighbor.x, neighbor.y) || !isClearSegment(current, neighbor)) return
      const nextDirection = directionBetween(current, neighbor)
      const nextState = stateKey(neighborKey, nextDirection)
      const segmentLength = Math.hypot(neighbor.x - current.x, neighbor.y - current.y)
      const bendCost = currentDirection !== "start" && currentDirection !== nextDirection ? bendPenalty : 0
      const backwardCost = Math.max(0, -(neighbor.x - current.x) * direction) * backwardPenalty
      const corridorCost = Math.abs(neighbor.y - (sourcePort.y + (targetPort.y - sourcePort.y) * 0.5)) * 0.06
      const nextDistance = (distances.get(currentState) || 0) + segmentLength + bendCost + backwardCost + corridorCost
      if (nextDistance >= (distances.get(nextState) || Infinity)) return
      distances.set(nextState, nextDistance)
      previous.set(nextState, currentState)
      queue.push(nextState)
    })
  }

  if (!bestEndState) return null
  const points: RoutePoint[] = [targetPort]
  let cursor = bestEndState
  while (statePointKey(cursor) !== startKey) {
    cursor = previous.get(cursor) || startState
    points.push(parse(statePointKey(cursor)))
  }
  points.reverse()
  const simplified = simplifyPolyline(points)
  return { points: simplified, fallbackPenalty: 180 }
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
  const sameColumn = Math.abs(dx) < Math.max(source.width, target.width) * 1.35 && Math.abs(dy) > Math.max(source.height, target.height) * 0.7 && Math.abs(dy) >= Math.abs(dx) * 0.82
  const pad = Math.min(16, Math.max(8, source.height * 0.16))

  if (sameColumn) {
    const side = dy >= 0 ? "bottom" : "top"
    const x = clamp(source.x + distributedOffset(portIndex, portCount, source.width * 0.84), rectLeft(source) + pad, rectRight(source) - pad)
    return { x, y: side === "bottom" ? rectBottom(source) : rectTop(source), side }
  }

  const side = dx >= 0 ? "right" : "left"
  const y = clamp(source.y + distributedOffset(portIndex, portCount, source.height * 0.62), rectTop(source) + pad, rectBottom(source) - pad)
  return { x: side === "right" ? rectRight(source) : rectLeft(source), y, side }
}

function boundaryPortForSide(rect: GraphRect, side: BoundaryPort["side"], portIndex = 0, portCount = 1): BoundaryPort {
  const pad = Math.min(16, Math.max(8, rect.height * 0.16))
  if (side === "top" || side === "bottom") {
    const x = clamp(rect.x + distributedOffset(portIndex, portCount, rect.width * 0.84), rectLeft(rect) + pad, rectRight(rect) - pad)
    return { x, y: side === "bottom" ? rectBottom(rect) : rectTop(rect), side }
  }
  const y = clamp(rect.y + distributedOffset(portIndex, portCount, rect.height * 0.62), rectTop(rect) + pad, rectBottom(rect) - pad)
  return { x: side === "right" ? rectRight(rect) : rectLeft(rect), y, side }
}

function terminalStubHitsObstacle(port: BoundaryPort, obstacles: GraphRect[]) {
  const stub = portStubPoint(port)
  return obstacles.some((obstacle) => segmentHitsRect(port, stub, obstacle, 2))
}

function clearBoundaryPort(rect: GraphRect, counterpart: GraphRect, preferred: BoundaryPort, obstacles: GraphRect[], portIndex = 0, portCount = 1) {
  if (!terminalStubHitsObstacle(preferred, obstacles)) return preferred
  const towardCounterpart = normalizedVector(rect, counterpart)
  const sides: BoundaryPort["side"][] = ["right", "left", "bottom", "top"]
  return sides
    .map((side) => {
      const port = boundaryPortForSide(rect, side, portIndex, portCount)
      const normal = portOutwardNormal(port)
      const directionPenalty = Math.max(0, 1 - (normal.x * towardCounterpart.x + normal.y * towardCounterpart.y)) * 26
      const displacementPenalty = Math.hypot(port.x - preferred.x, port.y - preferred.y) / 10
      return {
        port,
        score: (side === preferred.side ? 0 : 34) + directionPenalty + displacementPenalty + (terminalStubHitsObstacle(port, obstacles) ? 10000 : 0),
      }
    })
    .sort((a, b) => a.score - b.score)[0].port
}

export function routeBoundaryEdge(
  source: GraphRect,
  target: GraphRect,
  options: { targetPortIndex?: number; targetPortCount?: number; sourcePortIndex?: number; sourcePortCount?: number; obstacles?: GraphRect[]; routedEdges?: RoutePoint[][]; regionBoundaryY?: number } = {},
): RoutedPath {
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
  const sourceStub = portStubPoint(sourcePort)
  const targetStub = portStubPoint(targetPort)
  const direction = targetStub.x >= sourceStub.x ? 1 : -1
  const preferredY = sourceStub.y + (targetStub.y - sourceStub.y) * 0.5
  const preferredX = sourceStub.x + (targetStub.x - sourceStub.x) * 0.5
  const candidates: RouteCandidate[] = []
  const routeScoreOptions = { routedEdges: options.routedEdges || [], sourceRect: source, targetRect: target, regionBoundaryY: options.regionBoundaryY }
  const makeCandidate = (interior: RoutePoint[], extra: Omit<RouteCandidate, "points"> = {}): RouteCandidate => ({ ...extra, points: withTerminalStubs(sourcePort, targetPort, interior) })

  const softHitCount = softCubicObstacleHitCount(sourceStub, targetStub, obstacles)
  const directDistance = Math.hypot(targetStub.x - sourceStub.x, targetStub.y - sourceStub.y)
  const denseStackLocalFlow =
    softHitCount <= 2 &&
    directDistance < 340 &&
    Math.abs(targetStub.x - sourceStub.x) < Math.max(source.width, target.width) * 1.35 &&
    Math.abs(targetStub.y - sourceStub.y) < Math.max(source.height, target.height) * 3.2

  if (softHitCount === 0 || denseStackLocalFlow) {
    candidates.push({ points: withTerminalStubs(sourcePort, targetPort), preferredGrammar: "soft-cubic", fallbackPenalty: -28 })
  }

  if (sourcePort.side === "left" || sourcePort.side === "right" || targetPort.side === "left" || targetPort.side === "right") {
    horizontalCorridors(obstacles, preferredY).forEach((corridorY) => {
      candidates.push(makeCandidate([{ x: sourceStub.x, y: corridorY }, { x: targetStub.x, y: corridorY }], {
        sourcePortPenalty: Math.abs(corridorY - sourcePort.y) / 48,
        targetPortPenalty: Math.abs(corridorY - targetPort.y) / 48,
      }))
    })
    const minLeft = Math.min(rectLeft(source), rectLeft(target), ...obstacles.map((obstacle) => rectLeft(obstacle)))
    const maxRight = Math.max(rectRight(source), rectRight(target), ...obstacles.map((obstacle) => rectRight(obstacle)))
    ;[minLeft - 44, maxRight + 44].forEach((corridorX) => {
      candidates.push(makeCandidate([{ x: corridorX, y: sourceStub.y }, { x: corridorX, y: targetStub.y }], {
        sourcePortPenalty: Math.abs(corridorX - sourcePort.x) / 62,
        targetPortPenalty: Math.abs(corridorX - targetPort.x) / 62,
        fallbackPenalty: 45,
      }))
    })
  }

  verticalCorridors(obstacles, preferredX).forEach((corridorX) => {
    candidates.push(makeCandidate([{ x: corridorX, y: sourceStub.y }, { x: corridorX, y: targetStub.y }], {
      sourcePortPenalty: Math.abs(corridorX - sourcePort.x) / 48,
      targetPortPenalty: Math.abs(corridorX - targetPort.x) / 48,
    }))
  })
  const minTop = Math.min(rectTop(source), rectTop(target), ...obstacles.map((obstacle) => rectTop(obstacle)))
  const maxBottom = Math.max(rectBottom(source), rectBottom(target), ...obstacles.map((obstacle) => rectBottom(obstacle)))
  ;[minTop - 44, maxBottom + 44].forEach((corridorY) => {
    const localExitX = sourceStub.x + direction * clamp(Math.abs(targetStub.x - sourceStub.x) * 0.24, 44, 58)
    const localEntryX = targetStub.x - direction * clamp(Math.abs(targetStub.x - sourceStub.x) * 0.24, 44, 58)
    candidates.push(makeCandidate([{ x: sourceStub.x, y: corridorY }, { x: targetStub.x, y: corridorY }], {
      sourcePortPenalty: Math.abs(corridorY - sourcePort.y) / 62,
      targetPortPenalty: Math.abs(corridorY - targetPort.y) / 62,
      fallbackPenalty: 45,
    }))
    candidates.push(makeCandidate([{ x: localExitX, y: sourceStub.y }, { x: localExitX, y: corridorY }, { x: targetStub.x, y: corridorY }], {
      sourcePortPenalty: Math.abs(localExitX - sourceStub.x) / 54 + Math.abs(corridorY - sourcePort.y) / 70,
      targetPortPenalty: Math.abs(corridorY - targetPort.y) / 70,
      fallbackPenalty: 24,
    }))
    candidates.push(makeCandidate([{ x: sourceStub.x, y: corridorY }, { x: localEntryX, y: corridorY }, { x: localEntryX, y: targetStub.y }], {
      sourcePortPenalty: Math.abs(corridorY - sourcePort.y) / 70,
      targetPortPenalty: Math.abs(localEntryX - targetStub.x) / 54 + Math.abs(corridorY - targetPort.y) / 70,
      fallbackPenalty: 24,
    }))
    candidates.push(makeCandidate([{ x: localExitX, y: sourceStub.y }, { x: localExitX, y: corridorY }, { x: localEntryX, y: corridorY }, { x: localEntryX, y: targetStub.y }], {
      sourcePortPenalty: Math.abs(localExitX - sourceStub.x) / 54 + Math.abs(corridorY - sourcePort.y) / 78,
      targetPortPenalty: Math.abs(localEntryX - targetStub.x) / 54 + Math.abs(corridorY - targetPort.y) / 78,
      fallbackPenalty: 18,
    }))
  })

  const gridRoute = routeOnObstacleGrid({ ...sourceStub, side: sourcePort.side }, { ...targetStub, side: targetPort.side }, source, target, obstacles)
  if (gridRoute) candidates.push({ ...gridRoute, points: withTerminalStubs(sourcePort, targetPort, gridRoute.points.slice(1, -1)) })

  const selected = candidates
    .map((candidate) => ({ ...candidate, points: simplifyRoutePoints(candidate.points), score: scoreRouteCandidate(candidate, sourcePort, targetPort, obstacles, routeScoreOptions) }))
    .filter((candidate) => candidate.points.length >= 2 && !candidateHitsObstacle(candidate, obstacles) && !endpointBodyViolation(candidate.points, source, target))
    .sort((a, b) => a.score - b.score)[0]

  if (selected) {
    const selectedBendCount = routeBendCount(selected.points)
    const grammar: ScientificRouteGrammar = selected.preferredGrammar || "rounded-orthogonal"
    const label = labelPointForRoute(selected.points, grammar, sourcePort, targetPort, obstacles)
    return {
      path: grammar === "soft-cubic" ? renderScientificRoute(selected.points, "soft-cubic", sourcePort, targetPort) : renderScientificRoute(selected.points, "rounded-orthogonal", sourcePort, targetPort),
      sourcePort,
      targetPort,
      labelX: label.x,
      labelY: label.y,
      points: selected.points,
      grammar,
      bendCount: grammar === "soft-cubic" ? 0 : selectedBendCount,
      routeScore: formatNumber(selected.score),
    }
  }

  const fallbackMinLeft = Math.min(rectLeft(source), rectLeft(target), ...obstacles.map((obstacle) => rectLeft(obstacle)))
  const fallbackMaxRight = Math.max(rectRight(source), rectRight(target), ...obstacles.map((obstacle) => rectRight(obstacle)))
  const preferLowerCorridor = options.regionBoundaryY !== undefined && source.y >= options.regionBoundaryY && target.y >= options.regionBoundaryY
  const preferUpperCorridor = options.regionBoundaryY !== undefined && source.y < options.regionBoundaryY && target.y < options.regionBoundaryY
  const topCorridor = minTop - 58
  const bottomCorridor = maxBottom + 58
  const leftCorridor = fallbackMinLeft - 58
  const rightCorridor = fallbackMaxRight + 58
  const fallbackInterior =
    sourcePort.side === "top" || sourcePort.side === "bottom" || targetPort.side === "top" || targetPort.side === "bottom"
      ? (() => {
          const corridorX = Math.abs(sourceStub.x - leftCorridor) + Math.abs(targetStub.x - leftCorridor) <= Math.abs(sourceStub.x - rightCorridor) + Math.abs(targetStub.x - rightCorridor) ? leftCorridor : rightCorridor
          return [{ x: corridorX, y: sourceStub.y }, { x: corridorX, y: targetStub.y }]
        })()
      : (() => {
          const corridorY = preferLowerCorridor
            ? bottomCorridor
            : preferUpperCorridor
              ? topCorridor
              : Math.abs(sourceStub.y - topCorridor) + Math.abs(targetStub.y - topCorridor) <= Math.abs(sourceStub.y - bottomCorridor) + Math.abs(targetStub.y - bottomCorridor)
                ? topCorridor
                : bottomCorridor
          return [{ x: sourceStub.x, y: corridorY }, { x: targetStub.x, y: corridorY }]
        })()
  const fallbackPoints = withTerminalStubs(sourcePort, targetPort, fallbackInterior)
  const fallbackGrammar: ScientificRouteGrammar = "rounded-orthogonal"
  const label = labelPointForRoute(fallbackPoints, fallbackGrammar, sourcePort, targetPort, obstacles)

  return {
    path: renderScientificRoute(fallbackPoints, fallbackGrammar, sourcePort, targetPort),
    sourcePort,
    targetPort,
    labelX: label.x,
    labelY: label.y,
    points: fallbackPoints,
    grammar: fallbackGrammar,
    bendCount: routeBendCount(fallbackPoints),
    routeScore: scoreRouteCandidate({ points: fallbackPoints, fallbackPenalty: 320 }, sourcePort, targetPort, obstacles, routeScoreOptions),
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
  const targetWidth = options.targetWidth || 260
  const topPad = 76
  const bottomPad = 76
  const available = height - topPad - bottomPad
  const step = sources.length <= 1 ? 0 : available / (sources.length - 1)
  const sourceHeight = Math.min(options.sourceHeight || 122, sources.length <= 1 ? options.sourceHeight || 122 : Math.max(76, step - 14))
  const targetHeight = Math.min(Math.max(options.targetHeight || 104, sources.length * 22), Math.max(104, height - topPad - bottomPad))
  const sidePad = Math.min(76, Math.max(42, width * 0.06))
  const sourceX = sidePad + sourceWidth / 2
  const target: GraphRect = { id: "provenance-target", x: width - sidePad - targetWidth / 2, y: height / 2, width: targetWidth, height: targetHeight }

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
    const points = withTerminalStubs(sourcePort, targetPort)
    const anchor = pathPointAndNormalAt(points, "soft-cubic", sourcePort, targetPort, 0.5)
    const normalDirection = anchor.y < target.y ? -1 : 1
    const labelGroup: ProvenanceLabelGroup = {
      labels: source.chips,
      x: formatNumber(anchor.x + anchor.normalX * relationLabelOffset * normalDirection),
      y: formatNumber(anchor.y + anchor.normalY * relationLabelOffset * normalDirection),
      normalX: formatNumber(anchor.normalX * normalDirection),
      normalY: formatNumber(anchor.normalY * normalDirection),
      tangentX: formatNumber(anchor.tangentX),
      tangentY: formatNumber(anchor.tangentY),
    }
    return { ...source, rect, path: renderScientificRoute(points, "soft-cubic", sourcePort, targetPort), sourcePort, targetPort, labelGroup }
  })

  return { width, height, sources: items, target }
}
