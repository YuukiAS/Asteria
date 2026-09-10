import { normalizeExportedMap } from "../lib/exportImport"
import { defaultVariantKey } from "../constants/versioning"
import type { BlockNode, ExportedMap, GroupNode, MapEdge, MapNode } from "../types/map"
import { architectureSchemaVersion, type ArchitectureProjectV2, type StatisticalEntityKind, type SemanticLayer } from "./types"

const legacyViewId = "view:legacy-canvas"

function stablePart(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9:_-]+/g, "-").replace(/^-+|-+$/g, "") || "unnamed"
}

function entityIdForNode(nodeId: string) {
  return `entity:legacy:${stablePart(nodeId)}`
}

function symbolIdForEntry(nodeId: string, symbolId: string) {
  return `symbol:legacy:${stablePart(nodeId)}:${stablePart(symbolId)}`
}

function relationIdForEdge(edgeId: string) {
  return `relation:legacy-edge:${stablePart(edgeId)}`
}

function relationIdForContainment(parentId: string, childId: string) {
  return `relation:contains:${stablePart(parentId)}:${stablePart(childId)}`
}

function layerForNodeType(nodeType: string): SemanticLayer {
  if (nodeType === "dataset") return "observation"
  if (nodeType === "theorem" || nodeType === "assumption") return "assumption"
  if (nodeType === "algorithm") return "inference"
  if (nodeType === "result") return "validation"
  return "legacy"
}

function kindForBlock(node: BlockNode): StatisticalEntityKind {
  if (node.data.nodeType === "symbol") return "symbol_index"
  if (node.data.nodeType === "definition") return "generic"
  return node.data.nodeType
}

function nodeSize(node: MapNode) {
  if (node.type === "block") return { width: node.data.width, height: node.data.height }
  const style = node.style as { width?: number; height?: number } | undefined
  return { width: Number(style?.width) || 420, height: Number(style?.height) || 300 }
}

function clone<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value)
  return JSON.parse(JSON.stringify(value)) as T
}

export function migrateV1MapToArchitectureProjectV2(input: ExportedMap | unknown, migratedAt = "1970-01-01T00:00:00.000Z"): ArchitectureProjectV2 {
  const rawPayload = clone(input)
  const map = normalizeExportedMap(input)
  const entities: ArchitectureProjectV2["entities"] = {}
  const symbols: ArchitectureProjectV2["symbols"] = {}
  const relations: ArchitectureProjectV2["relations"] = {}
  const projections: ArchitectureProjectV2["views"][string]["projections"] = {}
  const projectedEntityIds: string[] = []

  map.nodes.forEach((node) => {
    const entityId = entityIdForNode(node.id)
    projectedEntityIds.push(entityId)
    const size = nodeSize(node)
    projections[`projection:${stablePart(node.id)}`] = {
      id: `projection:${stablePart(node.id)}`,
      entityId,
      position: { x: node.position?.x || 0, y: node.position?.y || 0 },
      size,
      presentation: node.type === "block" ? { nodeType: node.data.nodeType, displayMode: node.data.displayMode } : { nodeType: "group", style: node.style },
    }

    if (node.type === "group") {
      const group = node as GroupNode
      entities[entityId] = {
        id: entityId,
        kind: "legacy_group",
        label: group.data.title,
        layer: "legacy",
        legacy: { nodeId: group.id, nodeType: "group", title: group.data.title, style: clone({ data: group.data, style: group.style }) },
        provenance: [{ source: "migration", sourceId: group.id, migratedAt, note: "Migrated from Asteria map v1 group without semantic inference." }],
      }
      return
    }

    const block = node as BlockNode
    const symbolIds: string[] = []
    Object.values(block.data.variants || {}).forEach((variant) => {
      variant?.symbolEntries?.forEach((entry) => {
        const symbolId = symbolIdForEntry(block.id, entry.id)
        if (symbols[symbolId]) return
        symbols[symbolId] = {
          id: symbolId,
          latex: entry.latex,
          meaning: entry.meaning,
          objectKind: "legacy_symbol",
          entityId,
          scopeEntityId: entityId,
          provenance: [{ source: "migration", sourceId: entry.id, migratedAt, note: "Migrated from legacy Symbol row." }],
        }
        symbolIds.push(symbolId)
      })
    })

    entities[entityId] = {
      id: entityId,
      kind: kindForBlock(block),
      label: block.data.variants?.[block.data.activeVariantKey || defaultVariantKey]?.title || block.data.title,
      layer: layerForNodeType(block.data.nodeType),
      legacy: {
        nodeId: block.id,
        nodeType: block.data.nodeType,
        title: block.data.title,
        contentJson: clone(block.data.contentJson),
        contentHtml: block.data.contentHtml,
        variants: clone(block.data.variants),
        style: clone({
          backgroundColor: block.data.backgroundColor,
          textColor: block.data.textColor,
          borderColor: block.data.borderColor,
          width: block.data.width,
          height: block.data.height,
          displayMode: block.data.displayMode,
          showStatus: block.data.showStatus,
          status: block.data.status,
          emojis: block.data.emojis,
        }),
        parentId: block.parentId,
      },
      symbolIds,
      provenance: [{ source: "migration", sourceId: block.id, migratedAt, note: "Migrated from Asteria map v1 block without guessing statistical semantics." }],
    }
  })

  map.nodes.forEach((node) => {
    if (!node.parentId) return
    const parentEntityId = entityIdForNode(node.parentId)
    const childEntityId = entityIdForNode(node.id)
    if (!entities[parentEntityId] || !entities[childEntityId]) return
    const id = relationIdForContainment(parentEntityId, childEntityId)
    relations[id] = {
      id,
      type: "contains",
      sourceId: parentEntityId,
      targetId: childEntityId,
      directed: true,
      provenance: [{ source: "migration", sourceId: `${node.parentId}->${node.id}`, migratedAt, note: "Preserved legacy parent/frame containment." }],
    }
  })

  map.edges.forEach((edge: MapEdge) => {
    const sourceId = entityIdForNode(edge.source)
    const targetId = entityIdForNode(edge.target)
    if (!entities[sourceId] || !entities[targetId]) return
    const id = relationIdForEdge(edge.id)
    relations[id] = {
      id,
      type: "unresolved",
      sourceId,
      targetId,
      directed: true,
      label: edge.data?.label,
      unresolved: true,
      presentation: clone(edge.data || {}),
      provenance: [{ source: "migration", sourceId: edge.id, migratedAt, note: "Preserved visual edge as unresolved relation; label was not interpreted as semantics." }],
    }
  })

  return {
    schemaVersion: architectureSchemaVersion,
    project: {
      id: `project:legacy:${stablePart(map.title || "local-map")}`,
      title: map.title || "Local map",
      sourceSchema: "asteria-map-v1",
      updatedAt: map.updatedAt,
    },
    entities,
    symbols,
    relations,
    variants: Object.fromEntries(
      (map.modelVersions || []).map((version) => [
        `variant:legacy:${stablePart(version.id)}`,
        {
          id: `variant:legacy:${stablePart(version.id)}`,
          label: version.label,
          shortLabel: version.shortLabel,
          legacyVersionId: version.id,
          provenance: [{ source: "migration", sourceId: version.id, migratedAt, note: "Migrated from legacy model version." }],
        },
      ]),
    ),
    views: {
      [legacyViewId]: {
        id: legacyViewId,
        kind: "legacy_canvas",
        label: "Legacy Canvas",
        projectedEntityIds,
        projections,
        viewport: map.viewport,
        filters: { variantId: map.activeVersionId },
      },
    },
    legacy: {
      exportedMapVersion: map.version,
      payload: rawPayload,
      storyOutline: clone(map.storyOutline || []),
      storyDeckSettings: clone(map.storyDeckSettings),
      activeVersionId: map.activeVersionId,
    },
    updatedAt: map.updatedAt,
  }
}
