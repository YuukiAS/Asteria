import { architectureSchemaVersion, type ArchitectureProjectV2 } from "../types"

export function createSyntheticArchitectureProject(entityCount = 2000, relationCount = 5000): ArchitectureProjectV2 {
  const at = "2026-09-10T00:00:00.000Z"
  const entities: ArchitectureProjectV2["entities"] = {}
  const symbols: ArchitectureProjectV2["symbols"] = {}
  const relations: ArchitectureProjectV2["relations"] = {}
  const projections: ArchitectureProjectV2["views"][string]["projections"] = {}
  const projectedEntityIds: string[] = []
  for (let index = 0; index < entityCount; index += 1) {
    const entityId = `entity:synthetic:${index}`
    const symbolId = `symbol:synthetic:${index}`
    projectedEntityIds.push(entityId)
    entities[entityId] = {
      id: entityId,
      kind: index % 5 === 0 ? "model" : "generic",
      label: `Synthetic entity ${index}`,
      layer: index % 3 === 0 ? "parameterization" : index % 3 === 1 ? "latent" : "observation",
      symbolIds: [symbolId],
      provenance: [{ source: "fixture", sourceId: entityId }],
    }
    symbols[symbolId] = {
      id: symbolId,
      latex: `s_{${index}}`,
      meaning: `Synthetic symbol ${index}`,
      objectKind: "unknown",
      entityId,
      scopeEntityId: entityId,
      provenance: [{ source: "fixture", sourceId: symbolId }],
    }
    projections[`projection:synthetic:${index}`] = {
      id: `projection:synthetic:${index}`,
      entityId,
      position: { x: (index % 80) * 160, y: Math.floor(index / 80) * 110 },
      size: { width: 140, height: 72 },
    }
  }
  for (let index = 0; index < relationCount; index += 1) {
    const id = `relation:synthetic:${index}`
    relations[id] = {
      id,
      type: index % 2 === 0 ? "depends_on" : "derived_from",
      sourceId: `entity:synthetic:${index % entityCount}`,
      targetId: `entity:synthetic:${(index * 7 + 13) % entityCount}`,
      directed: true,
      provenance: [{ source: "fixture", sourceId: id }],
    }
  }
  return {
    schemaVersion: architectureSchemaVersion,
    project: { id: "project:synthetic", title: "Synthetic Architecture Project", sourceSchema: "architecture-v2", updatedAt: at },
    entities,
    symbols,
    relations,
    variants: {
      "variant:synthetic": { id: "variant:synthetic", label: "Synthetic", provenance: [{ source: "fixture", sourceId: "variant:synthetic" }] },
    },
    views: {
      "view:architecture": {
        id: "view:architecture",
        kind: "architecture",
        label: "Architecture",
        projectedEntityIds,
        projections,
        viewport: { x: 0, y: 0, zoom: 1 },
      },
    },
    updatedAt: at,
  }
}
