import type { RelationType } from "./types"

export const relationTypeOptions = [
  "unresolved",
  "contains",
  "annotates",
  "measured_as",
  "preprocessed_into",
  "aggregated_into",
  "matched_to",
  "derived_from",
  "indexed_by",
  "generates",
  "depends_on",
  "parameterized_by",
  "transforms_to",
  "constrained_by",
  "conditions_on",
  "marginalizes_to",
  "factorizes_as",
  "estimated_by",
  "optimizes",
  "solves",
  "approximated_by",
  "regularized_by",
  "identified_by",
  "uncertainty_quantified_by",
  "targets",
  "predicts",
  "supports",
  "tests",
  "validated_on",
  "extends",
  "preserves",
  "borrows_interpretation_from",
  "computationally_inspired_by",
  "uses_methodological_component_from",
  "related_to",
  "theoretically_supports",
  "empirically_tests",
  "validates_implementation",
  "stress_tests",
  "pending",
  "limited_by",
  "contradicts_or_challenges",
  "contradicts",
  "causes",
] as const satisfies readonly RelationType[]

export const causalRelationTypes = ["causes"] as const satisfies readonly RelationType[]

export function isRelationType(value: unknown): value is RelationType {
  return typeof value === "string" && relationTypeOptions.includes(value as RelationType)
}

export function relationTypeLabel(value: RelationType) {
  return value.replace(/_/g, " ")
}
