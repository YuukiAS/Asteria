import type { JSONContent } from "@tiptap/react"
import type { BlockNodeType, MapEdgeData, MapViewport, StoryDeckSettings, StoryOutlineItem } from "../types/map"

export const architectureSchemaVersion = "2.0.0-alpha.1"

export type SemanticLayer =
  | "legacy"
  | "observation"
  | "measurement"
  | "latent"
  | "parameterization"
  | "assumption"
  | "inference"
  | "prediction"
  | "validation"

export type StatisticalEntityKind =
  | "legacy_block"
  | "legacy_group"
  | "generic"
  | "definition"
  | "notation"
  | "symbol_index"
  | "model"
  | "prior"
  | "assumption"
  | "theorem"
  | "algorithm"
  | "dataset"
  | "result"
  | "reference"
  | "remark"
  | "example"
  | "warning"
  | "todo"

export type StatisticalEntity = {
  id: string
  kind: StatisticalEntityKind
  label: string
  layer: SemanticLayer
  description?: string
  legacy?: {
    nodeId: string
    nodeType: BlockNodeType | "group"
    title: string
    contentJson?: JSONContent
    contentHtml?: string
    variants?: unknown
    style?: unknown
    parentId?: string
  }
  symbolIds?: string[]
  provenance: ProvenanceRecord[]
}

export type SymbolObjectKind = "legacy_symbol" | "unknown" | "data" | "latent" | "parameter" | "target" | "index" | "matrix"

export type StatisticalSymbol = {
  id: string
  latex: string
  meaning: string
  objectKind: SymbolObjectKind
  entityId?: string
  scopeEntityId?: string
  provenance: ProvenanceRecord[]
}

export type RelationType = "legacy_visual_edge" | "contains" | "annotates" | "depends_on" | "derived_from" | "parameterized_by" | "unresolved"

export type TypedRelation = {
  id: string
  type: RelationType
  sourceId: string
  targetId: string
  directed: boolean
  label?: string
  unresolved?: boolean
  presentation?: Partial<MapEdgeData>
  provenance: ProvenanceRecord[]
}

export type SemanticVariant = {
  id: string
  label: string
  shortLabel?: string
  legacyVersionId?: string
  description?: string
  provenance: ProvenanceRecord[]
}

export type ArchitectureViewKind = "legacy_canvas" | "architecture" | "lineage" | "evidence"

export type ViewProjectionNode = {
  id: string
  entityId: string
  symbolIds?: string[]
  position: { x: number; y: number }
  size?: { width: number; height: number }
  collapsed?: boolean
  hidden?: boolean
  presentation?: unknown
}

export type ArchitectureView = {
  id: string
  kind: ArchitectureViewKind
  label: string
  projectedEntityIds: string[]
  projections: Record<string, ViewProjectionNode>
  viewport?: MapViewport
  filters?: {
    layers?: SemanticLayer[]
    variantId?: string
  }
}

export type ProjectMetadata = {
  id: string
  title: string
  sourceSchema: "asteria-map-v1" | "architecture-v2"
  createdAt?: string
  updatedAt: string
}

export type ProvenanceRecord = {
  source: "migration" | "fixture" | "manual"
  sourceId?: string
  note?: string
  migratedAt?: string
}

export type ArchitectureProjectV2 = {
  schemaVersion: typeof architectureSchemaVersion
  project: ProjectMetadata
  entities: Record<string, StatisticalEntity>
  symbols: Record<string, StatisticalSymbol>
  relations: Record<string, TypedRelation>
  variants: Record<string, SemanticVariant>
  views: Record<string, ArchitectureView>
  legacy?: {
    exportedMapVersion?: number
    payload: unknown
    storyOutline?: StoryOutlineItem[]
    storyDeckSettings?: StoryDeckSettings
    activeVersionId?: string
  }
  updatedAt: string
}
