import { architectureSchemaVersion, type ArchitectureProjectV2 } from "../types"

const at = "2026-09-10T00:00:00.000Z"

export const frequentistRegressionFixture: ArchitectureProjectV2 = {
  schemaVersion: architectureSchemaVersion,
  project: { id: "project:frequentist-regression", title: "Frequentist Regression Fixture", sourceSchema: "architecture-v2", updatedAt: at },
  entities: {
    "entity:freq:y": { id: "entity:freq:y", kind: "dataset", label: "Response vector", layer: "observation", observedStatus: "observed", definitionMode: "formula", provenance: [{ source: "fixture" }], symbolIds: ["symbol:freq:y"] },
    "entity:freq:X": { id: "entity:freq:X", kind: "dataset", label: "Design matrix", layer: "observation", observedStatus: "observed", definitionMode: "formula", provenance: [{ source: "fixture" }], symbolIds: ["symbol:freq:X"] },
    "entity:freq:beta": { id: "entity:freq:beta", kind: "model", label: "Regression coefficient", layer: "parameterization", observedStatus: "estimated", definitionMode: "formula", definition: "beta has no prior in this frequentist fixture", provenance: [{ source: "fixture" }], symbolIds: ["symbol:freq:beta"] },
    "entity:freq:objective": { id: "entity:freq:objective", kind: "algorithm", label: "Least-squares objective", layer: "inference", observedStatus: "not_applicable", definitionMode: "optimization", definition: "argmin_b ||y-Xb||^2", provenance: [{ source: "fixture" }], symbolIds: ["symbol:freq:betahat"] },
    "entity:freq:uncertainty": { id: "entity:freq:uncertainty", kind: "result", label: "Sampling uncertainty", layer: "validation", observedStatus: "derived", definitionMode: "estimating_equation", provenance: [{ source: "fixture" }] },
  },
  symbols: {
    "symbol:freq:y": { id: "symbol:freq:y", latex: "y", meaning: "Observed response vector.", objectKind: "data", entityId: "entity:freq:y", provenance: [{ source: "fixture" }] },
    "symbol:freq:X": { id: "symbol:freq:X", latex: "X", meaning: "Observed design matrix.", objectKind: "data", entityId: "entity:freq:X", provenance: [{ source: "fixture" }] },
    "symbol:freq:beta": { id: "symbol:freq:beta", latex: "\\beta", meaning: "Regression coefficient parameter.", objectKind: "parameter", entityId: "entity:freq:beta", provenance: [{ source: "fixture" }] },
    "symbol:freq:betahat": { id: "symbol:freq:betahat", latex: "\\widehat\\beta", meaning: "Least-squares estimator.", objectKind: "target", entityId: "entity:freq:objective", provenance: [{ source: "fixture" }] },
  },
  relations: {
    "relation:freq:X-objective": { id: "relation:freq:X-objective", type: "conditions_on", sourceId: "entity:freq:X", targetId: "entity:freq:objective", directed: true, provenance: [{ source: "fixture" }] },
    "relation:freq:y-objective": { id: "relation:freq:y-objective", type: "conditions_on", sourceId: "entity:freq:y", targetId: "entity:freq:objective", directed: true, provenance: [{ source: "fixture" }] },
    "relation:freq:objective-beta": { id: "relation:freq:objective-beta", type: "estimated_by", sourceId: "entity:freq:objective", targetId: "entity:freq:beta", directed: true, provenance: [{ source: "fixture" }] },
    "relation:freq:uncertainty-beta": { id: "relation:freq:uncertainty-beta", type: "uncertainty_quantified_by", sourceId: "entity:freq:uncertainty", targetId: "entity:freq:beta", directed: true, provenance: [{ source: "fixture" }] },
  },
  variants: { frequentist: { id: "frequentist", label: "Frequentist regression", provenance: [{ source: "fixture" }] } },
  views: { "view:architecture": { id: "view:architecture", kind: "architecture", label: "Architecture", projectedEntityIds: ["entity:freq:y", "entity:freq:X", "entity:freq:beta", "entity:freq:objective", "entity:freq:uncertainty"], projections: {} } },
  updatedAt: at,
}

export const causalAteFixture: ArchitectureProjectV2 = {
  schemaVersion: architectureSchemaVersion,
  project: { id: "project:causal-ate", title: "Causal ATE Fixture", sourceSchema: "architecture-v2", updatedAt: at },
  entities: {
    "entity:ate:X": { id: "entity:ate:X", kind: "dataset", label: "Covariates", layer: "observation", observedStatus: "observed", definitionMode: "formula", provenance: [{ source: "fixture" }], symbolIds: ["symbol:ate:X"] },
    "entity:ate:A": { id: "entity:ate:A", kind: "dataset", label: "Treatment", layer: "observation", observedStatus: "observed", definitionMode: "formula", provenance: [{ source: "fixture" }], symbolIds: ["symbol:ate:A"] },
    "entity:ate:Y": { id: "entity:ate:Y", kind: "dataset", label: "Observed outcome", layer: "observation", observedStatus: "observed", definitionMode: "formula", provenance: [{ source: "fixture" }], symbolIds: ["symbol:ate:Y"] },
    "entity:ate:potentials": { id: "entity:ate:potentials", kind: "model", label: "Potential outcomes", layer: "latent", observedStatus: "latent", definitionMode: "causal", provenance: [{ source: "fixture" }], symbolIds: ["symbol:ate:Y1", "symbol:ate:Y0"] },
    "entity:ate:ATE": { id: "entity:ate:ATE", kind: "result", label: "Average treatment effect", layer: "target", role: "causal estimand", observedStatus: "derived", definitionMode: "causal", definition: "E[Y(1)-Y(0)]", provenance: [{ source: "fixture" }], symbolIds: ["symbol:ate:ATE"] },
    "entity:ate:identification": { id: "entity:ate:identification", kind: "assumption", label: "Identification conditions", layer: "assumption", observedStatus: "not_applicable", definitionMode: "causal", constraints: ["consistency", "exchangeability", "positivity"], provenance: [{ source: "fixture" }] },
    "entity:ate:estimator": { id: "entity:ate:estimator", kind: "algorithm", label: "ATE estimator", layer: "inference", role: "estimator", observedStatus: "not_applicable", definitionMode: "estimating_equation", provenance: [{ source: "fixture" }] },
  },
  symbols: {
    "symbol:ate:X": { id: "symbol:ate:X", latex: "X", meaning: "Observed covariates.", objectKind: "data", entityId: "entity:ate:X", provenance: [{ source: "fixture" }] },
    "symbol:ate:A": { id: "symbol:ate:A", latex: "A", meaning: "Treatment.", objectKind: "data", entityId: "entity:ate:A", provenance: [{ source: "fixture" }] },
    "symbol:ate:Y": { id: "symbol:ate:Y", latex: "Y", meaning: "Observed outcome.", objectKind: "data", entityId: "entity:ate:Y", provenance: [{ source: "fixture" }] },
    "symbol:ate:Y1": { id: "symbol:ate:Y1", latex: "Y(1)", meaning: "Potential outcome under treatment.", objectKind: "latent", entityId: "entity:ate:potentials", provenance: [{ source: "fixture" }] },
    "symbol:ate:Y0": { id: "symbol:ate:Y0", latex: "Y(0)", meaning: "Potential outcome under control.", objectKind: "latent", entityId: "entity:ate:potentials", provenance: [{ source: "fixture" }] },
    "symbol:ate:ATE": { id: "symbol:ate:ATE", latex: "ATE", meaning: "Average treatment effect.", objectKind: "target", entityId: "entity:ate:ATE", provenance: [{ source: "fixture" }] },
  },
  relations: {
    "relation:ate:potentials-target": { id: "relation:ate:potentials-target", type: "targets", sourceId: "entity:ate:potentials", targetId: "entity:ate:ATE", directed: true, provenance: [{ source: "fixture" }] },
    "relation:ate:id-target": { id: "relation:ate:id-target", type: "identified_by", sourceId: "entity:ate:identification", targetId: "entity:ate:ATE", directed: true, provenance: [{ source: "fixture" }] },
    "relation:ate:est-target": { id: "relation:ate:est-target", type: "estimated_by", sourceId: "entity:ate:estimator", targetId: "entity:ate:ATE", directed: true, provenance: [{ source: "fixture" }] },
    "relation:ate:X-est": { id: "relation:ate:X-est", type: "conditions_on", sourceId: "entity:ate:X", targetId: "entity:ate:estimator", directed: true, provenance: [{ source: "fixture" }] },
    "relation:ate:A-est": { id: "relation:ate:A-est", type: "conditions_on", sourceId: "entity:ate:A", targetId: "entity:ate:estimator", directed: true, provenance: [{ source: "fixture" }] },
    "relation:ate:Y-est": { id: "relation:ate:Y-est", type: "conditions_on", sourceId: "entity:ate:Y", targetId: "entity:ate:estimator", directed: true, provenance: [{ source: "fixture" }] },
  },
  variants: { ate: { id: "ate", label: "Causal ATE", provenance: [{ source: "fixture" }] } },
  views: { "view:architecture": { id: "view:architecture", kind: "architecture", label: "Architecture", projectedEntityIds: ["entity:ate:X", "entity:ate:A", "entity:ate:Y", "entity:ate:potentials", "entity:ate:ATE", "entity:ate:identification", "entity:ate:estimator"], projections: {} } },
  updatedAt: at,
}
