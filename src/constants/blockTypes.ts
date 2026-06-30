import type { BlockNodeType, BlockStatus, EdgeArrow, EdgeLineStyle, EdgePathType } from "../types/map"

export const blockTypeOptions = [
  { value: "generic", label: "Generic", badgeClass: "type-badge-generic" },
  { value: "definition", label: "Definition", badgeClass: "type-badge-definition" },
  { value: "notation", label: "Notation", badgeClass: "type-badge-notation" },
  { value: "model", label: "Model", badgeClass: "type-badge-model" },
  { value: "prior", label: "Prior", badgeClass: "type-badge-prior" },
  { value: "assumption", label: "Assumption", badgeClass: "type-badge-assumption" },
  { value: "statement", label: "Statement", badgeClass: "type-badge-statement" },
  { value: "dataset", label: "Dataset", badgeClass: "type-badge-dataset" },
  { value: "result", label: "Result", badgeClass: "type-badge-result" },
  { value: "citation", label: "Citation", badgeClass: "type-badge-citation" },
  { value: "warning", label: "Warning", badgeClass: "type-badge-warning" },
  { value: "todo", label: "TODO", badgeClass: "type-badge-todo" },
] as const satisfies ReadonlyArray<{ value: BlockNodeType; label: string; badgeClass: string }>

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
