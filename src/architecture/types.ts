import type { JSONContent } from "@tiptap/react"
import type { BlockNodeType, MapEdgeData, MapViewport, StoryDeckSettings, StoryOutlineItem } from "../types/map"

export const architectureSchemaVersion = "2.0.0-alpha.1"

export type SemanticLayer =
  | "legacy"
  | "target"
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
  | "method"
  | "model"
  | "paper"
  | "prior"
  | "assumption"
  | "claim"
  | "proof"
  | "simulation"
  | "theorem"
  | "algorithm"
  | "dataset"
  | "result"
  | "implementation"
  | "limitation"
  | "open_question"
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
  role?: string
  observedStatus?: "observed" | "latent" | "fixed" | "estimated" | "derived" | "not_applicable"
  definitionMode?: "stochastic" | "deterministic" | "formula" | "optimization" | "estimating_equation" | "causal" | "algorithmic" | "legacy"
  indices?: string[]
  dimension?: string
  domain?: string
  definition?: string
  definitionRef?: string
  whereDefined?: string[]
  whereUsed?: string[]
  constraints?: string[]
  variantNote?: string
  formulaBindings?: FormulaBinding[]
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
  canonicalName?: string
  meaning: string
  objectKind: SymbolObjectKind
  modelScopeId?: string
  variantScopeId?: string
  layer?: SemanticLayer
  role?: string
  observedStatus?: StatisticalEntity["observedStatus"]
  definitionMode?: StatisticalEntity["definitionMode"]
  indices?: string[]
  dimension?: string
  domain?: string
  definitionRef?: string
  entityId?: string
  scopeEntityId?: string
  provenance: ProvenanceRecord[]
}

export type FormulaBinding = {
  id: string
  formulaId: string
  fragment: string
  symbolId: string
  unresolved?: boolean
}

export type RelationType =
  | "unresolved"
  | "contains"
  | "annotates"
  | "measured_as"
  | "preprocessed_into"
  | "aggregated_into"
  | "matched_to"
  | "derived_from"
  | "indexed_by"
  | "generates"
  | "depends_on"
  | "parameterized_by"
  | "transforms_to"
  | "constrained_by"
  | "conditions_on"
  | "marginalizes_to"
  | "factorizes_as"
  | "estimated_by"
  | "optimizes"
  | "solves"
  | "approximated_by"
  | "regularized_by"
  | "identified_by"
  | "uncertainty_quantified_by"
  | "targets"
  | "predicts"
  | "supports"
  | "tests"
  | "validated_on"
  | "extends"
  | "preserves"
  | "borrows_interpretation_from"
  | "computationally_inspired_by"
  | "uses_methodological_component_from"
  | "related_to"
  | "theoretically_supports"
  | "empirically_tests"
  | "validates_implementation"
  | "stress_tests"
  | "pending"
  | "limited_by"
  | "contradicts_or_challenges"
  | "contradicts"
  | "causes"

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
