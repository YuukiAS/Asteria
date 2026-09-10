import type { RelationType, SemanticLayer } from "./types"

export type ArchitectureValidationSeverity = "info" | "warning" | "error"

export type ArchitectureValidationWarning = {
  id: string
  severity: ArchitectureValidationSeverity
  message: string
  entityIds?: string[]
  relationIds?: string[]
  layer?: SemanticLayer
  rule: string
}

export const unresolvedLegacyRelationType: RelationType = "legacy_visual_edge"
