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
  breadcrumbs: Array<{ entityId: string; depth: number; viaRelationId?: string }>
}

function connectedRelations(index: ReturnType<typeof createArchitectureGraphIndex>, entityId: string, direction: TraceDirection) {
  if (direction === "upstream") return getIncomingRelations(index, entityId).map((relation) => ({ relation, nextId: relation.sourceId, side: "upstream" as const }))
  if (direction === "downstream") return getOutgoingRelations(index, entityId).map((relation) => ({ relation, nextId: relation.targetId, side: "downstream" as const }))
  return [
    ...getIncomingRelations(index, entityId).map((relation) => ({ relation, nextId: relation.sourceId, side: "upstream" as const })),
    ...getOutgoingRelations(index, entityId).map((relation) => ({ relation, nextId: relation.targetId, side: "downstream" as const })),
  ]
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
  const breadcrumbs: ArchitectureTraceResult["breadcrumbs"] = [{ entityId, depth: 0 }]
  const queue = [{ entityId, depth: 0 }]
  const visited = new Set<string>([entityId])

  while (queue.length) {
    const current = queue.shift()
    if (!current || current.depth >= maxDepth) continue
    for (const item of connectedRelations(index, current.entityId, direction)) {
      const relation: TypedRelation = item.relation
      relationIds.add(relation.id)
      entityIds.add(item.nextId)
      if (item.side === "upstream") upstreamEntityIds.add(item.nextId)
      else downstreamEntityIds.add(item.nextId)
      const depth = current.depth + 1
      breadcrumbs.push({ entityId: item.nextId, depth, viaRelationId: relation.id })
      if (mode === "recursive" && !visited.has(item.nextId)) {
        visited.add(item.nextId)
        queue.push({ entityId: item.nextId, depth })
      }
    }
  }

  return { entityId, entityIds, upstreamEntityIds, downstreamEntityIds, relationIds, breadcrumbs }
}

export function directTraceForSymbol(project: ArchitectureProjectV2, symbolId: string) {
  const symbol = project.symbols[symbolId]
  if (!symbol?.entityId) return { symbol, upstreamEntityIds: new Set<string>(), downstreamEntityIds: new Set<string>(), relationIds: new Set<string>() }
  return { symbol, ...traceForEntity(project, symbol.entityId, { mode: "direct", direction: "both", maxDepth: 1 }) }
}

export function traceForSymbol(project: ArchitectureProjectV2, symbolId: string, options: { mode?: TraceMode; direction?: TraceDirection; maxDepth?: number } = {}) {
  const symbol = project.symbols[symbolId]
  if (!symbol?.entityId) return { symbol, entityIds: new Set<string>(), upstreamEntityIds: new Set<string>(), downstreamEntityIds: new Set<string>(), relationIds: new Set<string>(), breadcrumbs: [] }
  return { symbol, ...traceForEntity(project, symbol.entityId, options) }
}
