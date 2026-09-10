import type { ArchitectureProjectV2, ArchitectureView } from "./types"

export function selectView(project: ArchitectureProjectV2, viewId: string): ArchitectureView | undefined {
  return project.views[viewId]
}

export function selectProjectedEntities(project: ArchitectureProjectV2, viewId: string) {
  const view = selectView(project, viewId)
  if (!view) return []
  return view.projectedEntityIds.map((id) => project.entities[id]).filter(Boolean)
}

export function selectEntitySymbols(project: ArchitectureProjectV2, entityId: string) {
  const entity = project.entities[entityId]
  const symbolIds = entity?.symbolIds || Object.values(project.symbols).filter((symbol) => symbol.entityId === entityId).map((symbol) => symbol.id)
  return symbolIds.map((id) => project.symbols[id]).filter(Boolean)
}

export function selectEntityViews(project: ArchitectureProjectV2, entityId: string) {
  return Object.values(project.views).filter((view) => view.projectedEntityIds.includes(entityId))
}
