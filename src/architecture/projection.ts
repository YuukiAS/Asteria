import { createArchitectureGraphIndex, getIncomingRelations, getOutgoingRelations } from "./graphIndex"
import { traceForEntity } from "./trace"
import type { ArchitectureProjectV2, SemanticLayer } from "./types"

export type LayerFocusProjection = {
  entityIds: Set<string>
  relationIds: Set<string>
  focusedLayer?: SemanticLayer
}

export function projectLayerFocus(project: ArchitectureProjectV2, viewId: string, focusedLayer?: SemanticLayer, includeBoundary = true): LayerFocusProjection {
  const view = project.views[viewId]
  const baseEntityIds = new Set(view?.projectedEntityIds || Object.keys(project.entities))
  if (!focusedLayer) {
    return {
      entityIds: baseEntityIds,
      relationIds: new Set(Object.values(project.relations).filter((relation) => baseEntityIds.has(relation.sourceId) && baseEntityIds.has(relation.targetId)).map((relation) => relation.id)),
    }
  }

  const index = createArchitectureGraphIndex(project)
  const entityIds = new Set(
    [...baseEntityIds].filter((id) => {
      return project.entities[id]?.layer === focusedLayer
    }),
  )
  if (includeBoundary) {
    ;[...entityIds].forEach((id) => {
      ;[...getIncomingRelations(index, id), ...getOutgoingRelations(index, id)].forEach((relation) => {
        if (baseEntityIds.has(relation.sourceId)) entityIds.add(relation.sourceId)
        if (baseEntityIds.has(relation.targetId)) entityIds.add(relation.targetId)
      })
    })
  }
  const relationIds = new Set(Object.values(project.relations).filter((relation) => entityIds.has(relation.sourceId) && entityIds.has(relation.targetId)).map((relation) => relation.id))
  return { entityIds, relationIds, focusedLayer }
}

export function projectTraceFocus(project: ArchitectureProjectV2, startEntityId: string, maxDepth = 2) {
  const trace = traceForEntity(project, startEntityId, { mode: "recursive", direction: "both", maxDepth })
  return {
    entityIds: trace.entityIds,
    relationIds: trace.relationIds,
  }
}
