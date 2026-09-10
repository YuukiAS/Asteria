import { createArchitectureGraphIndex, getIncomingRelations, getOutgoingRelations } from "./graphIndex"
import type { ArchitectureProjectV2 } from "./types"

export function directTraceForSymbol(project: ArchitectureProjectV2, symbolId: string) {
  const symbol = project.symbols[symbolId]
  if (!symbol?.entityId) return { symbol, upstreamEntityIds: new Set<string>(), downstreamEntityIds: new Set<string>(), relationIds: new Set<string>() }
  const index = createArchitectureGraphIndex(project)
  const incoming = getIncomingRelations(index, symbol.entityId)
  const outgoing = getOutgoingRelations(index, symbol.entityId)
  return {
    symbol,
    entityId: symbol.entityId,
    upstreamEntityIds: new Set(incoming.map((relation) => relation.sourceId)),
    downstreamEntityIds: new Set(outgoing.map((relation) => relation.targetId)),
    relationIds: new Set([...incoming, ...outgoing].map((relation) => relation.id)),
  }
}
