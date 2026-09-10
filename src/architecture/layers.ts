import type { SemanticLayer } from "./types"

export type ArchitectureLayerDefinition = {
  id: SemanticLayer
  label: string
  family: SemanticLayer
  order: number
}

export const architectureLayerDefinitions: ArchitectureLayerDefinition[] = [
  { id: "target", label: "Scientific target / estimand", family: "target", order: 0 },
  { id: "observation", label: "Observed input", family: "observation", order: 10 },
  { id: "measurement", label: "Measurement / preprocessing", family: "measurement", order: 20 },
  { id: "latent", label: "Structure / latent representation", family: "latent", order: 30 },
  { id: "parameterization", label: "Parameterization", family: "parameterization", order: 40 },
  { id: "assumption", label: "Assumption / identification", family: "assumption", order: 50 },
  { id: "inference", label: "Inference / estimation", family: "inference", order: 60 },
  { id: "prediction", label: "Prediction / decision", family: "prediction", order: 70 },
  { id: "validation", label: "Diagnostic / validation", family: "validation", order: 80 },
  { id: "legacy", label: "Legacy canvas", family: "legacy", order: 90 },
]

export const architectureLayerOrder = new Map(architectureLayerDefinitions.map((layer) => [layer.id, layer.order]))

export function layerLabel(layer: SemanticLayer) {
  return architectureLayerDefinitions.find((definition) => definition.id === layer)?.label || layer
}
