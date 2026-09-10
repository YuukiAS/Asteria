import { architectureLayerDefinitions, architectureLayerOrder, layerLabel } from "./layers"
import type { ArchitectureProjectV2, SemanticLayer } from "./types"

export type ArchitectureOutlineSection = {
  id: string
  layer: SemanticLayer
  label: string
  entityIds: string[]
}

export type ArchitectureOutline = {
  sections: ArchitectureOutlineSection[]
  entityIdToSectionId: Map<string, string>
}

export function generateArchitectureOutline(project: ArchitectureProjectV2, viewId = "view:architecture"): ArchitectureOutline {
  const view = project.views[viewId]
  const projectedEntityIds = view?.projectedEntityIds || Object.keys(project.entities)
  const byLayer = new Map<SemanticLayer, string[]>()
  projectedEntityIds.forEach((entityId) => {
    const entity = project.entities[entityId]
    if (!entity) return
    const layer = entity.layer
    const list = byLayer.get(layer) || []
    list.push(entityId)
    byLayer.set(layer, list)
  })

  const sections = [...byLayer.entries()]
    .sort((a, b) => (architectureLayerOrder.get(a[0]) ?? 999) - (architectureLayerOrder.get(b[0]) ?? 999))
    .map(([layer, entityIds]) => ({
      id: `outline:${project.project.id}:${layer}`,
      layer,
      label: layerLabel(layer),
      entityIds: [...entityIds].sort((a, b) => project.entities[a].label.localeCompare(project.entities[b].label)),
    }))

  const entityIdToSectionId = new Map<string, string>()
  sections.forEach((section) => section.entityIds.forEach((entityId) => entityIdToSectionId.set(entityId, section.id)))

  architectureLayerDefinitions.forEach(() => undefined)
  return { sections, entityIdToSectionId }
}
