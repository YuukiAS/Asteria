import type { ArchitectureProjectV2, TypedRelation } from "./types"

export type ArchitectureGraphIndex = {
  entityIds: Set<string>
  symbolIdsByEntityId: Map<string, string[]>
  outgoingRelationIdsByEntityId: Map<string, string[]>
  incomingRelationIdsByEntityId: Map<string, string[]>
  relationById: Map<string, TypedRelation>
}

function push(map: Map<string, string[]>, key: string, value: string) {
  const existing = map.get(key)
  if (existing) existing.push(value)
  else map.set(key, [value])
}

export function createArchitectureGraphIndex(project: ArchitectureProjectV2): ArchitectureGraphIndex {
  const entityIds = new Set(Object.keys(project.entities))
  const symbolIdsByEntityId = new Map<string, string[]>()
  Object.values(project.symbols).forEach((symbol) => {
    if (symbol.entityId) push(symbolIdsByEntityId, symbol.entityId, symbol.id)
  })
  const outgoingRelationIdsByEntityId = new Map<string, string[]>()
  const incomingRelationIdsByEntityId = new Map<string, string[]>()
  const relationById = new Map<string, TypedRelation>()
  Object.values(project.relations).forEach((relation) => {
    relationById.set(relation.id, relation)
    push(outgoingRelationIdsByEntityId, relation.sourceId, relation.id)
    push(incomingRelationIdsByEntityId, relation.targetId, relation.id)
    if (!relation.directed) {
      push(outgoingRelationIdsByEntityId, relation.targetId, relation.id)
      push(incomingRelationIdsByEntityId, relation.sourceId, relation.id)
    }
  })
  return { entityIds, symbolIdsByEntityId, outgoingRelationIdsByEntityId, incomingRelationIdsByEntityId, relationById }
}

export function getOutgoingRelations(index: ArchitectureGraphIndex, entityId: string) {
  return (index.outgoingRelationIdsByEntityId.get(entityId) || []).map((id) => index.relationById.get(id)).filter((relation): relation is TypedRelation => Boolean(relation))
}

export function getIncomingRelations(index: ArchitectureGraphIndex, entityId: string) {
  return (index.incomingRelationIdsByEntityId.get(entityId) || []).map((id) => index.relationById.get(id)).filter((relation): relation is TypedRelation => Boolean(relation))
}

export function traceEntityIds(index: ArchitectureGraphIndex, startEntityId: string, direction: "upstream" | "downstream", maxDepth = 1) {
  const visited = new Set<string>([startEntityId])
  const frontier = [{ id: startEntityId, depth: 0 }]
  while (frontier.length) {
    const current = frontier.shift()
    if (!current || current.depth >= maxDepth) continue
    const relations = direction === "downstream" ? getOutgoingRelations(index, current.id) : getIncomingRelations(index, current.id)
    relations.forEach((relation) => {
      const nextId = direction === "downstream" ? relation.targetId : relation.sourceId
      if (visited.has(nextId)) return
      visited.add(nextId)
      frontier.push({ id: nextId, depth: current.depth + 1 })
    })
  }
  return visited
}
