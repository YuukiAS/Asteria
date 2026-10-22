export const RC19_ROUTE_THRESHOLDS = Object.freeze({
  simpleArchEdgeMaxRouteRatio: 1.3,
  archEdgeP95RouteRatio: 1.45,
  longDetourRouteRatio: 1.45,
})

const finitePoint = (point) => point && Number.isFinite(point.x) && Number.isFinite(point.y)

function polylineLength(points) {
  return points.slice(1).reduce((length, point, index) => length + Math.hypot(point.x - points[index].x, point.y - points[index].y), 0)
}

function percentile95(values) {
  return values.length ? values[Math.min(values.length - 1, Math.ceil(values.length * 0.95) - 1)] : null
}

function orientation(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
}

function properSegmentIntersection(a, b, c, d) {
  const abC = orientation(a, b, c)
  const abD = orientation(a, b, d)
  const cdA = orientation(c, d, a)
  const cdB = orientation(c, d, b)
  if (abC * abD < -0.01 && cdA * cdB < -0.01) return true
  const onSegment = (point, start, end) =>
    point.x >= Math.min(start.x, end.x) - 0.01 && point.x <= Math.max(start.x, end.x) + 0.01 &&
    point.y >= Math.min(start.y, end.y) - 0.01 && point.y <= Math.max(start.y, end.y) + 0.01
  return (
    (Math.abs(abC) <= 0.01 && onSegment(c, a, b)) ||
    (Math.abs(abD) <= 0.01 && onSegment(d, a, b)) ||
    (Math.abs(cdA) <= 0.01 && onSegment(a, c, d)) ||
    (Math.abs(cdB) <= 0.01 && onSegment(b, c, d))
  )
}

function sharesScientificEndpoint(first, second) {
  const firstEndpoints = [first.sourceId, first.targetId].filter(Boolean)
  const secondEndpoints = new Set([second.sourceId, second.targetId].filter(Boolean))
  return firstEndpoints.some((endpoint) => secondEndpoints.has(endpoint))
}

function edgesCross(first, second) {
  for (let firstIndex = 0; firstIndex < first.points.length - 1; firstIndex += 1) {
    for (let secondIndex = 0; secondIndex < second.points.length - 1; secondIndex += 1) {
      if (properSegmentIntersection(first.points[firstIndex], first.points[firstIndex + 1], second.points[secondIndex], second.points[secondIndex + 1])) return true
    }
  }
  return false
}

function classifyGeometry(edge) {
  if (!Array.isArray(edge?.points) || edge.points.length < 2) return { status: "missing" }
  const coordinates = edge.points.flatMap((point) => [point?.x, point?.y])
  if (coordinates.some(Number.isNaN)) return { status: "invalid_nan" }
  if (coordinates.some((value) => typeof value === "number" && !Number.isFinite(value))) return { status: "invalid_infinite" }
  if (!edge.points.every(finitePoint)) return { status: "missing" }
  const routeLength = polylineLength(edge.points)
  const first = edge.points[0]
  const last = edge.points[edge.points.length - 1]
  const directLength = Math.hypot(last.x - first.x, last.y - first.y)
  if (!Number.isFinite(routeLength) || !Number.isFinite(directLength)) return { status: "invalid_infinite" }
  if (directLength <= 0.01) return { status: "missing" }
  return { status: "observed", routeLength, routeRatio: routeLength / directLength }
}

function measurementStatus(edgeSetStatus, classifications) {
  if (edgeSetStatus !== "observed") return edgeSetStatus === "no_data" ? "not_applicable" : edgeSetStatus
  if (classifications.some((item) => item.status === "invalid_nan")) return "invalid_nan"
  if (classifications.some((item) => item.status === "invalid_infinite")) return "invalid_infinite"
  if (classifications.some((item) => item.status === "missing")) return "missing"
  return "observed"
}

function independentlyNonMonotone(edge) {
  if (Number.isFinite(edge.sourceLane) && edge.sourceLane === edge.targetLane) return false
  const points = edge.points
  const first = points[0]
  const last = points[points.length - 1]
  const dx = last.x - first.x
  const dy = last.y - first.y
  if (Math.abs(dx) < Math.abs(dy) * 0.35 + 8) return false
  const direction = dx >= 0 ? 1 : -1
  return points.slice(1).some((point, index) => (point.x - points[index].x) * direction < -1)
}

export function measureRouteGestalt(input = {}) {
  const inputEdges = input.edges
  const edgeSetStatus = !Array.isArray(inputEdges) ? "missing" : inputEdges.length === 0 ? "no_data" : "observed"
  const edges = Array.isArray(inputEdges) ? inputEdges : []
  const classifications = edges.map(classifyGeometry)
  const geometryStatus = measurementStatus(edgeSetStatus, classifications)
  const measuredEdges = edges
    .map((edge, index) => ({ ...edge, ...classifications[index] }))
    .filter((edge) => edge.status === "observed")
  const ratios = measuredEdges.map((edge) => edge.routeRatio).sort((a, b) => a - b)

  let eligibleEdgePairCount = 0
  let avoidableEdgeCrossingCount = 0
  const avoidableEdgeCrossingPairs = []
  for (let firstIndex = 0; firstIndex < measuredEdges.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < measuredEdges.length; secondIndex += 1) {
      const first = measuredEdges[firstIndex]
      const second = measuredEdges[secondIndex]
      if (sharesScientificEndpoint(first, second)) continue
      eligibleEdgePairCount += 1
      if (edgesCross(first, second)) {
        avoidableEdgeCrossingCount += 1
        avoidableEdgeCrossingPairs.push([first.id || `${first.sourceId}->${first.targetId}`, second.id || `${second.sourceId}->${second.targetId}`])
      }
    }
  }

  const floatingLabelStatus = Array.isArray(input.floatingLabels) ? "observed" : "missing"
  const floatingRelationLabelCount = floatingLabelStatus === "observed"
    ? input.floatingLabels.filter((label) => label?.visible !== false && label?.placement !== "stable_relation_column").length
    : null
  const routeRatioStatus = geometryStatus
  const crossingStatus = geometryStatus !== "observed" ? geometryStatus : eligibleEdgePairCount > 0 ? "observed" : "not_applicable"

  const nonMonotoneArchEdges = geometryStatus === "observed" ? measuredEdges.filter(independentlyNonMonotone) : []
  return {
    edgeCount: edges.length,
    measuredEdgeCount: measuredEdges.length,
    missingEdgeGeometryCount: classifications.filter((item) => item.status === "missing").length,
    nanEdgeGeometryCount: classifications.filter((item) => item.status === "invalid_nan").length,
    infiniteEdgeGeometryCount: classifications.filter((item) => item.status === "invalid_infinite").length,
    eligibleEdgePairCount,
    avoidableEdgeCrossingCount: crossingStatus === "observed" ? avoidableEdgeCrossingCount : null,
    avoidableEdgeCrossingPairs,
    longDetourCount: routeRatioStatus === "observed" ? ratios.filter((ratio) => ratio > RC19_ROUTE_THRESHOLDS.longDetourRouteRatio).length : null,
    nonMonotoneArchEdgeCount: geometryStatus === "observed" ? nonMonotoneArchEdges.length : null,
    nonMonotoneArchEdgeIds: nonMonotoneArchEdges.map((edge) => edge.id || `${edge.sourceId}->${edge.targetId}`),
    orthogonalMultiBendEdgeCount: geometryStatus === "observed" ? measuredEdges.filter((edge) => Number(edge.hardBendCount || 0) > 1).length : null,
    floatingRelationLabelCount,
    simpleArchEdgeMaxRouteRatio: routeRatioStatus === "observed" ? Math.max(...ratios) : null,
    archEdgeP95RouteRatio: routeRatioStatus === "observed" ? percentile95(ratios) : null,
    measurement: {
      edgeSet: edgeSetStatus,
      routeRatio: routeRatioStatus,
      avoidableEdgeCrossing: crossingStatus,
      floatingRelationLabel: floatingLabelStatus,
    },
  }
}

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value))
}

function cubicPoint(start, controlA, controlB, end, t) {
  const u = 1 - t
  return {
    x: u ** 3 * start.x + 3 * u ** 2 * t * controlA.x + 3 * u * t ** 2 * controlB.x + t ** 3 * end.x,
    y: u ** 3 * start.y + 3 * u ** 2 * t * controlA.y + 3 * u * t ** 2 * controlB.y + t ** 3 * end.y,
  }
}

function softCubicControls(source, target) {
  const dx = target.x - source.x
  const dy = target.y - source.y
  if (Math.abs(dx) >= Math.abs(dy) * 0.72) {
    const direction = dx >= 0 ? 1 : -1
    const controlOffset = clamp(Math.abs(dx) * 0.44, 38, 148)
    const verticalBend = Math.abs(dy) < 10 ? clamp(Math.abs(dx) * 0.035, 6, 16) : 0
    return {
      controlA: { x: source.x + direction * controlOffset, y: source.y + verticalBend },
      controlB: { x: target.x - direction * controlOffset, y: target.y - verticalBend },
    }
  }
  const direction = dy >= 0 ? 1 : -1
  const controlOffset = clamp(Math.abs(dy) * 0.42, 34, 118)
  return {
    controlA: { x: source.x, y: source.y + direction * controlOffset },
    controlB: { x: target.x, y: target.y - direction * controlOffset },
  }
}

export function sampleStaticRoute(edge, steps = 48) {
  const points = edge?.points
  if (!Array.isArray(points) || points.length < 2 || !points.every(finitePoint)) return points
  if (edge.grammar !== "soft-cubic" || points.length < 4) return points
  const sourcePort = points[0]
  const sourceStub = points[1]
  const targetStub = points[points.length - 2]
  const targetPort = points[points.length - 1]
  const { controlA, controlB } = softCubicControls(sourceStub, targetStub)
  return [
    sourcePort,
    ...Array.from({ length: steps + 1 }, (_, index) => cubicPoint(sourceStub, controlA, controlB, targetStub, index / steps)),
    targetPort,
  ]
}
