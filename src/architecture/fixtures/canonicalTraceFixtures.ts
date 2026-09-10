import { architectureSchemaVersion, type ArchitectureProjectV2, type FormulaBinding, type RelationType, type SemanticLayer, type StatisticalEntity, type StatisticalSymbol } from "../types"

const at = "2026-09-10T00:00:00.000Z"

type SymbolSeed = {
  key: string
  latex: string
  name: string
  meaning: string
  role: string
  layer: SemanticLayer
  observedStatus: StatisticalEntity["observedStatus"]
  definitionMode: StatisticalEntity["definitionMode"]
  indices?: string[]
  dimension?: string
  domain?: string
  definition?: string
  constraints?: string[]
  whereDefined?: string[]
  whereUsed?: string[]
  variantNote?: string
}

type RelationSeed = {
  source: string
  target: string
  type: RelationType
  label: string
}

function entityId(model: string, key: string) {
  return `entity:${model}:${key}`
}

function symbolId(model: string, key: string) {
  return `symbol:${model}:${key}`
}

function relationId(model: string, index: number, source: string, target: string) {
  return `relation:${model}:${index}:${source}:${target}`
}

function formulaBinding(model: string, formulaId: string, key: string, fragment?: string): FormulaBinding {
  return { id: `binding:${model}:${formulaId}:${key}`, formulaId, fragment: fragment || key, symbolId: symbolId(model, key) }
}

function makeProject(model: "original-trace" | "cat-trace-frozen-v2", title: string, symbolsSeed: SymbolSeed[], relationsSeed: RelationSeed[]): ArchitectureProjectV2 {
  const entities: ArchitectureProjectV2["entities"] = {}
  const symbols: ArchitectureProjectV2["symbols"] = {}
  const relations: ArchitectureProjectV2["relations"] = {}
  const projections: ArchitectureProjectV2["views"][string]["projections"] = {}
  const projectedEntityIds: string[] = []

  symbolsSeed.forEach((seed, index) => {
    const entity = entityId(model, seed.key)
    const symbol = symbolId(model, seed.key)
    projectedEntityIds.push(entity)
    entities[entity] = {
      id: entity,
      kind: seed.role.includes("target") ? "result" : seed.role.includes("data") ? "dataset" : seed.role.includes("prior") ? "prior" : "model",
      label: seed.name,
      layer: seed.layer,
      description: seed.meaning,
      role: seed.role,
      observedStatus: seed.observedStatus,
      definitionMode: seed.definitionMode,
      indices: seed.indices,
      dimension: seed.dimension,
      domain: seed.domain,
      definition: seed.definition,
      definitionRef: `${title} canonical reference`,
      whereDefined: seed.whereDefined,
      whereUsed: seed.whereUsed,
      constraints: seed.constraints,
      variantNote: seed.variantNote,
      symbolIds: [symbol],
      formulaBindings: seed.definition ? [formulaBinding(model, `formula:${seed.key}`, seed.key, seed.latex)] : [],
      provenance: [{ source: "fixture", sourceId: `${model}:${seed.key}`, note: "Canonical G02 fixture from 2026-09-09 Asteria reference." }],
    }
    symbols[symbol] = {
      id: symbol,
      latex: seed.latex,
      canonicalName: seed.name,
      meaning: seed.meaning,
      objectKind: seed.role.includes("data") ? "data" : seed.role.includes("target") ? "target" : seed.role.includes("index") ? "index" : seed.role.includes("matrix") ? "matrix" : "parameter",
      modelScopeId: model,
      variantScopeId: model,
      layer: seed.layer,
      role: seed.role,
      observedStatus: seed.observedStatus,
      definitionMode: seed.definitionMode,
      indices: seed.indices,
      dimension: seed.dimension,
      domain: seed.domain,
      definitionRef: `${title} canonical reference`,
      entityId: entity,
      scopeEntityId: entity,
      provenance: [{ source: "fixture", sourceId: `${model}:${seed.key}`, note: "Project-level canonical symbol." }],
    }
    projections[`projection:${model}:${seed.key}`] = {
      id: `projection:${model}:${seed.key}`,
      entityId: entity,
      symbolIds: [symbol],
      position: { x: (index % 5) * 220, y: Math.floor(index / 5) * 150 },
      size: { width: 180, height: 78 },
    }
  })

  relationsSeed.forEach((seed, index) => {
    const id = relationId(model, index, seed.source, seed.target)
    relations[id] = {
      id,
      type: seed.type,
      sourceId: entityId(model, seed.source),
      targetId: entityId(model, seed.target),
      directed: true,
      label: seed.label,
      provenance: [{ source: "fixture", sourceId: id, note: "Canonical G02 direct trace relation." }],
    }
  })

  return {
    schemaVersion: architectureSchemaVersion,
    project: { id: `project:${model}`, title, sourceSchema: "architecture-v2", updatedAt: at },
    entities,
    symbols,
    relations,
    variants: {
      [model]: { id: model, label: title, shortLabel: model === "original-trace" ? "TRACE" : "CAT", provenance: [{ source: "fixture", sourceId: model }] },
    },
    views: {
      "view:architecture": {
        id: "view:architecture",
        kind: "architecture",
        label: "Architecture",
        projectedEntityIds,
        projections,
        viewport: { x: 0, y: 0, zoom: 1 },
        filters: { variantId: model },
      },
    },
    updatedAt: at,
  }
}

const originalTraceSymbols: SymbolSeed[] = [
  { key: "y_ij", latex: "y_{ij}", name: "Observed occurrence", meaning: "Binary species occurrence indicator.", role: "observed data", layer: "observation", observedStatus: "observed", definitionMode: "stochastic", indices: ["i", "j"], domain: "{0,1}", definition: "y_ij = 1{z_ij > 0}", whereDefined: ["Original TRACE observation equation"], whereUsed: ["Marginal occurrence probability"] },
  { key: "z_ij", latex: "z_{ij}", name: "Latent probit score", meaning: "Latent Gaussian response behind the binary observation.", role: "latent variable", layer: "latent", observedStatus: "latent", definitionMode: "stochastic", indices: ["i", "j"], definition: "z_ij = alpha_j + x_i^T beta_j + epsilon_ij", whereUsed: ["y_ij threshold equation"] },
  { key: "alpha_j", latex: "\\alpha_j", name: "TRACE intercept", meaning: "TRACE-calibrated species intercept.", role: "parameter", layer: "parameterization", observedStatus: "estimated", definitionMode: "stochastic", indices: ["j"], definition: "alpha_j | gamma,p ~ N(mu_p(gamma), tau_p^2)", whereUsed: ["z_ij", "marginal probit mean"] },
  { key: "beta_j", latex: "\\beta_j", name: "Species environmental response", meaning: "Species-level environmental response parameter.", role: "parameter", layer: "parameterization", observedStatus: "estimated", definitionMode: "stochastic", indices: ["j"], dimension: "R^q", definition: "beta_j ~ N_q(nu, Psi)", whereUsed: ["x_i^T beta_j", "marginal probit mean"] },
  { key: "x_i", latex: "x_i", name: "Sample covariates", meaning: "Observed covariate vector for sample i.", role: "observed data", layer: "observation", observedStatus: "observed", definitionMode: "formula", indices: ["i"], dimension: "R^q", whereUsed: ["x_i^T beta_j"] },
  { key: "p", latex: "p", name: "TRACE truncation", meaning: "Finite truncation that grows toward the open-ended species dimension.", role: "fixed computational truncation", layer: "parameterization", observedStatus: "fixed", definitionMode: "formula", definition: "p -> infinity", variantNote: "Not a finite catalogue." },
  { key: "gamma", latex: "\\gamma", name: "TRACE richness intensity", meaning: "Intensity parameter used in TRACE intercept calibration.", role: "parameter", layer: "parameterization", observedStatus: "estimated", definitionMode: "stochastic", definition: "mu_p(gamma) uses gamma/(gamma+p)", whereUsed: ["mu_p(gamma)"] },
  { key: "mu_p_gamma", latex: "\\mu_p(\\gamma)", name: "TRACE intercept location", meaning: "Extreme-value calibrated intercept location.", role: "deterministic transform", layer: "parameterization", observedStatus: "derived", definitionMode: "deterministic", definition: "sqrt(1+tau_p^2) Phi^{-1}(gamma/(gamma+p))" },
  { key: "tau_p", latex: "\\tau_p", name: "TRACE intercept scale", meaning: "Extreme-value calibrated intercept scale.", role: "deterministic transform", layer: "parameterization", observedStatus: "derived", definitionMode: "deterministic", definition: "tau_p = sqrt(2 log p)" },
  { key: "nu", latex: "\\nu", name: "Mean environmental response", meaning: "Mean of the species-response superpopulation.", role: "parameter", layer: "parameterization", observedStatus: "estimated", definitionMode: "stochastic", dimension: "R^q", whereUsed: ["beta_j prior"] },
  { key: "Psi", latex: "\\Psi", name: "Response covariance", meaning: "Covariance of species environmental responses.", role: "matrix parameter", layer: "parameterization", observedStatus: "estimated", definitionMode: "stochastic", whereUsed: ["beta_j prior"] },
  { key: "posterior_inference", latex: "\\mathcal I_{TRACE}", name: "TRACE posterior inference", meaning: "Inference layer for estimating TRACE model quantities.", role: "algorithm", layer: "inference", observedStatus: "not_applicable", definitionMode: "algorithmic" },
  { key: "marginal_probability", latex: "P(y_{ij}=1\\mid x_i,\\alpha_j,\\beta_j)", name: "Marginal occurrence probability", meaning: "Unit-variance probit marginal mean.", role: "target", layer: "target", observedStatus: "derived", definitionMode: "deterministic", definition: "Phi(alpha_j + x_i^T beta_j)" },
  { key: "richness_target", latex: "R_i", name: "Richness/discovery target", meaning: "Finite expected richness/discovery target under TRACE calibration.", role: "target", layer: "prediction", observedStatus: "derived", definitionMode: "formula" },
]

const originalTraceRelations: RelationSeed[] = [
  { source: "z_ij", target: "y_ij", type: "generates", label: "thresholds into" },
  { source: "alpha_j", target: "z_ij", type: "parameterized_by", label: "intercept" },
  { source: "x_i", target: "z_ij", type: "conditions_on", label: "covariate input" },
  { source: "beta_j", target: "z_ij", type: "parameterized_by", label: "slope" },
  { source: "nu", target: "beta_j", type: "parameterized_by", label: "superpopulation mean" },
  { source: "Psi", target: "beta_j", type: "parameterized_by", label: "superpopulation covariance" },
  { source: "gamma", target: "mu_p_gamma", type: "derived_from", label: "calibrates" },
  { source: "p", target: "tau_p", type: "derived_from", label: "scale truncation" },
  { source: "p", target: "mu_p_gamma", type: "derived_from", label: "location truncation" },
  { source: "mu_p_gamma", target: "alpha_j", type: "parameterized_by", label: "location" },
  { source: "tau_p", target: "alpha_j", type: "parameterized_by", label: "scale" },
  { source: "posterior_inference", target: "alpha_j", type: "estimated_by", label: "estimates" },
  { source: "posterior_inference", target: "beta_j", type: "estimated_by", label: "estimates" },
  { source: "alpha_j", target: "marginal_probability", type: "marginalizes_to", label: "probit mean" },
  { source: "beta_j", target: "marginal_probability", type: "marginalizes_to", label: "probit mean" },
  { source: "marginal_probability", target: "richness_target", type: "targets", label: "summed target" },
]

const catTraceSymbols: SymbolSeed[] = [
  { key: "Y_raw", latex: "Y^{\\mathrm{raw}}", name: "Raw response matrix", meaning: "Raw feature detection matrix.", role: "observed data", layer: "observation", observedStatus: "observed", definitionMode: "formula", whereUsed: ["OR aggregation"] },
  { key: "x_i", latex: "x_i", name: "Sample covariates", meaning: "Observed covariate vector.", role: "observed data", layer: "observation", observedStatus: "observed", definitionMode: "formula", indices: ["i"], dimension: "R^q" },
  { key: "c_f", latex: "c(f)", name: "Catalogue match", meaning: "Deterministic raw feature to catalogue identity mapping.", role: "deterministic mapping", layer: "measurement", observedStatus: "fixed", definitionMode: "deterministic", definition: "c(f) in mathcal K union {empty}" },
  { key: "g_f", latex: "g(f)", name: "Biological group", meaning: "Deterministic raw feature to biological group mapping.", role: "deterministic mapping", layer: "measurement", observedStatus: "fixed", definitionMode: "deterministic" },
  { key: "mathcal_K", latex: "\\mathcal K", name: "Finite catalogue", meaning: "Finite analysis catalogue.", role: "observed data structure", layer: "observation", observedStatus: "fixed", definitionMode: "formula", definition: "K=|mathcal K|" },
  { key: "K_n", latex: "\\mathcal K_n", name: "Observed catalogue subset", meaning: "Catalogue identities detected in the first n samples.", role: "observed data subset", layer: "observation", observedStatus: "observed", definitionMode: "formula" },
  { key: "mathcal_U", latex: "\\mathcal U", name: "Catalogue-external open tail", meaning: "Anonymous open-tail space outside the finite catalogue.", role: "latent/open tail space", layer: "measurement", observedStatus: "latent", definitionMode: "formula" },
  { key: "mathcal_G", latex: "\\mathcal G", name: "Biological group space", meaning: "Shared group index space.", role: "index set", layer: "measurement", observedStatus: "fixed", definitionMode: "formula" },
  { key: "mathcal_W", latex: "\\mathcal W", name: "Finite working set", meaning: "Finite set where residual dependence is defined.", role: "fixed working set", layer: "latent", observedStatus: "fixed", definitionMode: "formula", constraints: ["Sigma_W only applies on mathcal W"] },
  { key: "yK_ij", latex: "y^{\\mathcal K}_{ij}", name: "Catalogue occurrence", meaning: "Catalogue binary occurrence.", role: "observed/latent response", layer: "latent", observedStatus: "derived", definitionMode: "stochastic", indices: ["i", "j"], definition: "1{z^K_ij>0}" },
  { key: "yU_igh", latex: "y^{\\mathcal U}_{igh}", name: "Open-tail occurrence", meaning: "Open-tail binary occurrence with canonical index order i,g,h.", role: "latent response", layer: "latent", observedStatus: "latent", definitionMode: "stochastic", indices: ["i", "g", "h"], definition: "1{z^U_igh>0}", constraints: ["Canonical index order is i,g,h"] },
  { key: "zK_ij", latex: "z^{\\mathcal K}_{ij}", name: "Catalogue latent score", meaning: "Catalogue latent Gaussian score.", role: "latent variable", layer: "latent", observedStatus: "latent", definitionMode: "stochastic", indices: ["i", "j"], definition: "alpha^K_j + x_i^T beta^K_j + epsilon^K_ij" },
  { key: "zU_igh", latex: "z^{\\mathcal U}_{igh}", name: "Open-tail latent score", meaning: "Open-tail latent Gaussian score.", role: "latent variable", layer: "latent", observedStatus: "latent", definitionMode: "stochastic", indices: ["i", "g", "h"], definition: "alpha^U_gh + x_i^T beta^U_gh + epsilon^U_igh" },
  { key: "alphaK_j", latex: "\\alpha^{\\mathcal K}_j", name: "Catalogue intercept", meaning: "Finite catalogue intercept.", role: "parameter", layer: "parameterization", observedStatus: "estimated", definitionMode: "stochastic" },
  { key: "alphaU_gh", latex: "\\alpha^{\\mathcal U}_{gh}", name: "Open-tail intercept", meaning: "TRACE-calibrated group open-tail intercept.", role: "parameter", layer: "parameterization", observedStatus: "estimated", definitionMode: "stochastic", definition: "alpha^U_gh | gamma_g,p_g ~ N(mu_{p_g}(gamma_g),tau_{p_g}^2)" },
  { key: "betaK_j", latex: "\\beta^{\\mathcal K}_j", name: "Catalogue slope", meaning: "Catalogue environmental response.", role: "parameter", layer: "parameterization", observedStatus: "estimated", definitionMode: "stochastic", definition: "nu+a_{g_j}+Gamma^T t_j+b^phy_j+v^K_j" },
  { key: "betaU_gh", latex: "\\beta^{\\mathcal U}_{gh}", name: "Open-tail slope", meaning: "Open-tail environmental response.", role: "parameter", layer: "parameterization", observedStatus: "estimated", definitionMode: "deterministic", indices: ["g", "h"], dimension: "R^q", definition: "beta^U_gh = nu + a_g + v^U_gh", whereUsed: ["x_i^T beta^U_gh", "z^U_igh"], constraints: ["Uses shared nu and sum-to-zero group deviation"], variantNote: "Not nu_g." },
  { key: "nu", latex: "\\nu", name: "Shared environmental-response vector", meaning: "Overall environment-response vector, not an intercept.", role: "parameter", layer: "parameterization", observedStatus: "estimated", definitionMode: "stochastic", dimension: "R^q", constraints: ["Not a global intercept"] },
  { key: "a_g", latex: "a_g", name: "Group response deviation", meaning: "Group-specific environmental response deviation.", role: "parameter", layer: "parameterization", observedStatus: "estimated", definitionMode: "stochastic", indices: ["g"], dimension: "R^q", constraints: ["sum_g a_g = 0"] },
  { key: "Gamma", latex: "\\Gamma", name: "Trait loading", meaning: "Optional trait module loading.", role: "parameter", layer: "parameterization", observedStatus: "estimated", definitionMode: "stochastic" },
  { key: "t_j", latex: "t_j", name: "Catalogue traits", meaning: "Catalogue trait vector when aligned.", role: "observed data", layer: "observation", observedStatus: "observed", definitionMode: "formula" },
  { key: "bphy_j", latex: "b^{\\mathrm{phy}}_j", name: "Phylogenetic random effect", meaning: "Branch-length phylogeny module effect only when real C_phy exists.", role: "parameter", layer: "parameterization", observedStatus: "estimated", definitionMode: "stochastic", constraints: ["C_tax and C_phy are distinct"] },
  { key: "vK_j", latex: "v^{\\mathcal K}_j", name: "Catalogue heterogeneity", meaning: "Catalogue species-specific response residual.", role: "parameter", layer: "parameterization", observedStatus: "estimated", definitionMode: "stochastic" },
  { key: "vU_gh", latex: "v^{\\mathcal U}_{gh}", name: "Open-tail heterogeneity", meaning: "Open-tail species-specific response residual.", role: "parameter", layer: "parameterization", observedStatus: "estimated", definitionMode: "stochastic" },
  { key: "Psi", latex: "\\Psi", name: "Response heterogeneity covariance", meaning: "Diagonal response heterogeneity covariance.", role: "matrix parameter", layer: "parameterization", observedStatus: "estimated", definitionMode: "stochastic" },
  { key: "gamma0", latex: "\\gamma_0", name: "Total open-tail intensity", meaning: "Total open-tail intensity.", role: "parameter", layer: "parameterization", observedStatus: "estimated", definitionMode: "stochastic" },
  { key: "pi_g", latex: "\\pi_g", name: "Group composition weight", meaning: "Open-tail composition weight.", role: "parameter", layer: "parameterization", observedStatus: "estimated", definitionMode: "stochastic", constraints: ["sum_g pi_g = 1"] },
  { key: "gamma_g", latex: "\\gamma_g", name: "Group open-tail intensity", meaning: "Derived group intensity.", role: "derived parameter", layer: "parameterization", observedStatus: "derived", definitionMode: "deterministic", definition: "gamma_g = gamma_0*pi_g", constraints: ["No independent prior"] },
  { key: "p_g", latex: "p_g", name: "Group open-tail truncation", meaning: "Fixed computational truncation, not an estimand or true unknown species count.", role: "fixed computational setting", layer: "parameterization", observedStatus: "fixed", definitionMode: "formula", constraints: ["not estimand", "not true unknown species count"] },
  { key: "p_g_star", latex: "p_g^*", name: "Non-empty open-tail count", meaning: "Non-empty open-tail columns in the first n samples.", role: "observed count", layer: "measurement", observedStatus: "observed", definitionMode: "formula" },
  { key: "zero_slots", latex: "p_g-p_g^*", name: "Anonymous zero slots", meaning: "Zero open-tail slots retained by the likelihood.", role: "fixed zero-slot multiplicity", layer: "measurement", observedStatus: "fixed", definitionMode: "formula" },
  { key: "Lambda_W", latex: "\\Lambda_{\\mathcal W}", name: "Residual factor loadings", meaning: "Finite working set factor loadings.", role: "matrix parameter", layer: "latent", observedStatus: "estimated", definitionMode: "stochastic" },
  { key: "Omega_W", latex: "\\Omega_{\\mathcal W}", name: "Residual covariance", meaning: "Finite working set covariance before normalization.", role: "matrix derived", layer: "latent", observedStatus: "derived", definitionMode: "deterministic", definition: "Lambda_W Lambda_W^T + I" },
  { key: "Sigma_W", latex: "\\Sigma_{\\mathcal W}", name: "Residual correlation", meaning: "Normalized residual correlation on the finite working set.", role: "matrix derived", layer: "latent", observedStatus: "derived", definitionMode: "deterministic", definition: "D_W^{-1/2} Omega_W D_W^{-1/2}", constraints: ["diag(Sigma_W)=1", "only finite working set W"] },
  { key: "factor_index", latex: "d=1,\\ldots,H", name: "Residual factor index", meaning: "Factor index for residual dependence; distinct from h.", role: "index", layer: "latent", observedStatus: "fixed", definitionMode: "formula" },
  { key: "posterior_inference", latex: "\\mathcal I_{CAT}", name: "CAT-TRACE inference", meaning: "Inference layer for estimating CAT-TRACE latent states, parameters, and discovery targets.", role: "algorithm", layer: "inference", observedStatus: "not_applicable", definitionMode: "algorithmic" },
  { key: "richness_targets", latex: "R_g,R_0", name: "Richness and discovery targets", meaning: "Group/total open-tail richness plus catalogue/open-tail discovery targets.", role: "target", layer: "target", observedStatus: "derived", definitionMode: "formula" },
]

const catTraceRelations: RelationSeed[] = [
  { source: "Y_raw", target: "c_f", type: "measured_as", label: "raw feature identities" },
  { source: "c_f", target: "mathcal_K", type: "matched_to", label: "matches into" },
  { source: "g_f", target: "mathcal_G", type: "indexed_by", label: "groups by" },
  { source: "zK_ij", target: "yK_ij", type: "generates", label: "thresholds into" },
  { source: "zU_igh", target: "yU_igh", type: "generates", label: "thresholds into" },
  { source: "alphaK_j", target: "zK_ij", type: "parameterized_by", label: "catalogue intercept" },
  { source: "betaK_j", target: "zK_ij", type: "parameterized_by", label: "catalogue slope" },
  { source: "x_i", target: "zK_ij", type: "conditions_on", label: "covariate input" },
  { source: "alphaU_gh", target: "zU_igh", type: "parameterized_by", label: "open-tail intercept" },
  { source: "betaU_gh", target: "zU_igh", type: "parameterized_by", label: "open-tail slope" },
  { source: "x_i", target: "zU_igh", type: "conditions_on", label: "covariate input" },
  { source: "nu", target: "betaU_gh", type: "derived_from", label: "shared vector" },
  { source: "a_g", target: "betaU_gh", type: "derived_from", label: "group deviation" },
  { source: "vU_gh", target: "betaU_gh", type: "derived_from", label: "species residual" },
  { source: "nu", target: "betaK_j", type: "derived_from", label: "shared vector" },
  { source: "a_g", target: "betaK_j", type: "derived_from", label: "group deviation" },
  { source: "Gamma", target: "betaK_j", type: "derived_from", label: "trait loading" },
  { source: "t_j", target: "betaK_j", type: "conditions_on", label: "trait input" },
  { source: "bphy_j", target: "betaK_j", type: "derived_from", label: "phylogeny module" },
  { source: "vK_j", target: "betaK_j", type: "derived_from", label: "species residual" },
  { source: "gamma0", target: "gamma_g", type: "derived_from", label: "total intensity" },
  { source: "pi_g", target: "gamma_g", type: "derived_from", label: "composition" },
  { source: "gamma_g", target: "alphaU_gh", type: "parameterized_by", label: "tail intensity" },
  { source: "p_g", target: "alphaU_gh", type: "parameterized_by", label: "truncation" },
  { source: "p_g_star", target: "zero_slots", type: "derived_from", label: "non-empty count" },
  { source: "p_g", target: "zero_slots", type: "derived_from", label: "finite slots" },
  { source: "Lambda_W", target: "Omega_W", type: "derived_from", label: "factor covariance" },
  { source: "Omega_W", target: "Sigma_W", type: "derived_from", label: "normalization" },
  { source: "mathcal_W", target: "Sigma_W", type: "constrained_by", label: "finite scope" },
  { source: "posterior_inference", target: "alphaU_gh", type: "estimated_by", label: "estimates" },
  { source: "posterior_inference", target: "betaU_gh", type: "estimated_by", label: "estimates" },
  { source: "yU_igh", target: "richness_targets", type: "targets", label: "open-tail discovery" },
  { source: "K_n", target: "richness_targets", type: "targets", label: "catalogue discovery" },
]

export const originalTraceProject = makeProject("original-trace", "Original TRACE", originalTraceSymbols, originalTraceRelations)
export const catTraceFrozenV2Project = makeProject("cat-trace-frozen-v2", "CAT-TRACE Frozen V2", catTraceSymbols, catTraceRelations)

export const canonicalTraceProjects = {
  "original-trace": originalTraceProject,
  "cat-trace-frozen-v2": catTraceFrozenV2Project,
}

export type CanonicalTraceProjectId = keyof typeof canonicalTraceProjects
