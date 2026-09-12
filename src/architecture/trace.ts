import { createArchitectureGraphIndex, getIncomingRelations, getOutgoingRelations } from "./graphIndex"
import type { ArchitectureProjectV2, TypedRelation } from "./types"

export type TraceDirection = "upstream" | "downstream" | "both"
export type TraceMode = "direct" | "recursive"

export type ArchitectureTraceResult = {
  symbol?: ArchitectureProjectV2["symbols"][string]
  entityId?: string
  entityIds: Set<string>
  upstreamEntityIds: Set<string>
  downstreamEntityIds: Set<string>
  relationIds: Set<string>
  upstreamRelationIds: Set<string>
  downstreamRelationIds: Set<string>
  breadcrumbs: Array<{ entityId: string; depth: number; viaRelationId?: string }>
}

function emptyTrace(symbol?: ArchitectureProjectV2["symbols"][string], entityId?: string): ArchitectureTraceResult {
  return {
    symbol,
    entityId,
    entityIds: entityId ? new Set([entityId]) : new Set(),
    upstreamEntityIds: new Set(),
    downstreamEntityIds: new Set(),
    relationIds: new Set(),
    upstreamRelationIds: new Set(),
    downstreamRelationIds: new Set(),
    breadcrumbs: entityId ? [{ entityId, depth: 0 }] : [],
  }
}

function directionalRelations(index: ReturnType<typeof createArchitectureGraphIndex>, entityId: string, side: "upstream" | "downstream") {
  if (side === "upstream") return getIncomingRelations(index, entityId).map((relation) => ({ relation, nextId: relation.sourceId }))
  return getOutgoingRelations(index, entityId).map((relation) => ({ relation, nextId: relation.targetId }))
}

export function traceForEntity(project: ArchitectureProjectV2, entityId: string, options: { mode?: TraceMode; direction?: TraceDirection; maxDepth?: number } = {}): ArchitectureTraceResult {
  const index = createArchitectureGraphIndex(project)
  const mode = options.mode || "direct"
  const direction = options.direction || "both"
  const maxDepth = Math.max(1, Math.min(12, Math.floor(options.maxDepth ?? 1)))
  const entityIds = new Set<string>([entityId])
  const upstreamEntityIds = new Set<string>()
  const downstreamEntityIds = new Set<string>()
  const relationIds = new Set<string>()
  const upstreamRelationIds = new Set<string>()
  const downstreamRelationIds = new Set<string>()
  const breadcrumbs: ArchitectureTraceResult["breadcrumbs"] = [{ entityId, depth: 0 }]

  const traverse = (side: "upstream" | "downstream") => {
    const queue = [{ entityId, depth: 0 }]
    const visited = new Set<string>([entityId])
    const sideEntityIds = side === "upstream" ? upstreamEntityIds : downstreamEntityIds
    const sideRelationIds = side === "upstream" ? upstreamRelationIds : downstreamRelationIds

    while (queue.length) {
      const current = queue.shift()
      if (!current || current.depth >= maxDepth) continue
      for (const item of directionalRelations(index, current.entityId, side)) {
        const relation: TypedRelation = item.relation
        relationIds.add(relation.id)
        sideRelationIds.add(relation.id)
        entityIds.add(item.nextId)
        if (item.nextId !== entityId) sideEntityIds.add(item.nextId)
        const depth = current.depth + 1
        breadcrumbs.push({ entityId: item.nextId, depth, viaRelationId: relation.id })
        if (mode === "recursive" && !visited.has(item.nextId)) {
          visited.add(item.nextId)
          queue.push({ entityId: item.nextId, depth })
        }
      }
    }
  }

  if (direction === "upstream" || direction === "both") traverse("upstream")
  if (direction === "downstream" || direction === "both") traverse("downstream")

  return { entityId, entityIds, upstreamEntityIds, downstreamEntityIds, relationIds, upstreamRelationIds, downstreamRelationIds, breadcrumbs }
}

export function directTraceForSymbol(project: ArchitectureProjectV2, symbolId: string) {
  const symbol = project.symbols[symbolId]
  if (!symbol?.entityId) return emptyTrace(symbol)
  return { symbol, ...traceForEntity(project, symbol.entityId, { mode: "direct", direction: "both", maxDepth: 1 }) }
}

export function emptyTraceForSymbol(project: ArchitectureProjectV2, symbolId: string) {
  const symbol = project.symbols[symbolId]
  return emptyTrace(symbol, symbol?.entityId)
}

export function traceForSymbol(project: ArchitectureProjectV2, symbolId: string, options: { mode?: TraceMode; direction?: TraceDirection; maxDepth?: number } = {}) {
  const symbol = project.symbols[symbolId]
  if (!symbol?.entityId) return emptyTrace(symbol)
  return { symbol, ...traceForEntity(project, symbol.entityId, options) }
}
