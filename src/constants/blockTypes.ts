import type { BlockNodeType, BlockStatus, EdgeArrow, EdgeLineStyle, EdgePathType } from "../types/map"

export const blockTypeOptions = [
  { value: "generic", label: "Generic", badgeClass: "type-badge-generic", description: "General-purpose note or connector block without a specific semantic role." },
  { value: "definition", label: "Definition", badgeClass: "type-badge-definition", description: "Introduces a term, object, parameter, or formal concept used elsewhere." },
  { value: "notation", label: "Notation", badgeClass: "type-badge-notation", description: "Defines symbols, indexing conventions, dimensions, or shorthand notation." },
  { value: "model", label: "Model", badgeClass: "type-badge-model", description: "Specifies the statistical model, likelihood, latent variables, or structural equations." },
  { value: "prior", label: "Prior", badgeClass: "type-badge-prior", description: "Records prior distributions, hyperparameters, and prior assumptions." },
  { value: "assumption", label: "Assumption", badgeClass: "type-badge-assumption", description: "States modeling, data, identifiability, or workflow assumptions." },
  { value: "theorem", label: "Theorem", badgeClass: "type-badge-theorem", description: "Formal mathematical statement such as a theorem, lemma, proposition, or corollary." },
  { value: "algorithm", label: "Algorithm", badgeClass: "type-badge-algorithm", description: "Computational method, sampler, optimization routine, or procedural step." },
  { value: "dataset", label: "Dataset", badgeClass: "type-badge-dataset", description: "Data source, observed variables, preprocessing step, or dataset description." },
  { value: "result", label: "Result", badgeClass: "type-badge-result", description: "Conclusion, output, estimate, diagnostic, or finding derived from the model or data." },
  { value: "reference", label: "Reference", badgeClass: "type-badge-reference", description: "Citation, external source, paper note, or supporting reference." },
  { value: "remark", label: "Remark", badgeClass: "type-badge-remark", description: "Side comment, interpretation, caveat, or informal explanation." },
  { value: "example", label: "Example", badgeClass: "type-badge-example", description: "Concrete example, special case, simulation setup, or illustrative instance." },
  { value: "warning", label: "Warning", badgeClass: "type-badge-warning", description: "Important risk, failure mode, constraint, or point that should not be missed." },
  { value: "todo", label: "TODO", badgeClass: "type-badge-todo", description: "Action item or checklist-style task that should not read as a strong warning." },
] as const satisfies ReadonlyArray<{ value: BlockNodeType; label: string; badgeClass: string; description: string }>

export const validBlockNodeTypes = blockTypeOptions.map((option) => option.value) as BlockNodeType[]

export const blockTypeByValue = Object.fromEntries(blockTypeOptions.map((option) => [option.value, option])) as Record<
  BlockNodeType,
  (typeof blockTypeOptions)[number]
>

export const blockStatusOptions = [
  { value: "undo", label: "Undo", className: "status-marker-undo" },
  { value: "doing", label: "Doing", className: "status-marker-doing" },
  { value: "done", label: "Done", className: "status-marker-done" },
] as const satisfies ReadonlyArray<{ value: BlockStatus; label: string; className: string }>

export const validBlockStatuses = blockStatusOptions.map((option) => option.value) as BlockStatus[]

export const blockStatusByValue = Object.fromEntries(blockStatusOptions.map((option) => [option.value, option])) as Record<
  BlockStatus,
  (typeof blockStatusOptions)[number]
>

export const edgeLineStyleOptions = ["solid", "dashed", "dotted"] as const satisfies ReadonlyArray<EdgeLineStyle>
export const edgePathTypeOptions = ["smoothstep", "bezier", "straight", "step"] as const satisfies ReadonlyArray<EdgePathType>
export const edgeArrowOptions = ["none", "forward", "backward", "both"] as const satisfies ReadonlyArray<EdgeArrow>
export const edgeStrokeWidthOptions = [1, 1.5, 2, 3, 4] as const
