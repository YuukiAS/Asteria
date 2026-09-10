import type { ArchitectureProjectV2 } from "./types"

export type SemanticDiffStatus = "added" | "removed" | "modified_definition" | "modified_constraint" | "modified_target" | "preserved_invariant" | "unchanged"

export type SemanticDiffItem = {
  id: string
  status: SemanticDiffStatus
  label: string
  before?: string
  after?: string
}

export type SemanticDiffReport = {
  baseVariantId: string
  targetVariantId: string
  items: SemanticDiffItem[]
  forbiddenFalseDiffs: string[]
}

export function diffOriginalTraceToCatTrace(_original: ArchitectureProjectV2, _cat: ArchitectureProjectV2): SemanticDiffReport {
  return {
    baseVariantId: "original-trace",
    targetVariantId: "cat-trace-frozen-v2",
    forbiddenFalseDiffs: ["original TRACE uses nu_g group-specific mean", "gamma_0 is a global intercept", "pi_g is a group effect", "p_g is unknown species count"],
    items: [
      { id: "diff:finite-catalogue", status: "added", label: "Finite catalogue mathcal K, K, and mathcal K_n", after: "CAT-TRACE separates finite catalogue identities from catalogue-external open tail." },
      { id: "diff:matching", status: "added", label: "Deterministic c(f) matching", after: "Raw features are matched to catalogue identities or open tail." },
      { id: "diff:grouping", status: "added", label: "Biological grouping with a_g", after: "Open tail and catalogue responses share biological group structure with sum-to-zero a_g." },
      { id: "diff:open-tail-slots", status: "added", label: "Grouped p_g, p_g^*, and zero slots", after: "p_g is fixed truncation; zero slots remain likelihood information." },
      { id: "diff:gamma-composition", status: "added", label: "gamma_0, pi_g, gamma_g", after: "gamma_g = gamma_0*pi_g is derived group intensity." },
      { id: "diff:catalogue-slope", status: "added", label: "Catalogue intercept/slope structure", after: "Catalogue species receive finite intercepts and optional trait/relatedness modules." },
      { id: "diff:discovery-split", status: "added", label: "Catalogue/open-tail discovery split", after: "Targets distinguish finite catalogue discovery from open-tail discovery." },
      { id: "diff:factor-copula", status: "added", label: "Finite-working-set normalized factor-copula", after: "Residual dependence is scoped to mathcal W with diag(Sigma_W)=1." },
      { id: "diff:slope", status: "modified_definition", label: "Species response hierarchy", before: "beta_j ~ N_q(nu,Psi)", after: "beta^U_gh = nu + a_g + v^U_gh" },
      { id: "diff:target", status: "modified_target", label: "Richness/discovery target", before: "TRACE calibrated finite richness target", after: "CAT-TRACE catalogue/open-tail discovery decomposition" },
      { id: "diff:marginal-probit", status: "preserved_invariant", label: "Marginal probit interpretation", before: "Phi(alpha_j + x_i^T beta_j)", after: "Retained under unit marginal residual variance." },
      { id: "diff:tail-calibration", status: "preserved_invariant", label: "TRACE open-tail extreme-value calibration", before: "alpha_j calibrated by mu_p(gamma), tau_p", after: "alpha^U_gh calibrated by mu_{p_g}(gamma_g), tau_{p_g}" },
      { id: "diff:finite-richness", status: "preserved_invariant", label: "Finite expected richness semantics", before: "Finite expected richness under calibrated tail", after: "Preserved for grouped open-tail calibration." },
      { id: "diff:residual-mean", status: "preserved_invariant", label: "Residual dependence does not alter marginal mean", before: "Unit marginal variance keeps marginal probit mean", after: "Normalized finite working set keeps unit diagonal." },
    ],
  }
}

export function semanticDiffMarkdown(report: SemanticDiffReport) {
  const lines = [`Semantic diff: ${report.baseVariantId} -> ${report.targetVariantId}`, ""]
  for (const status of ["added", "removed", "modified_definition", "modified_constraint", "modified_target", "preserved_invariant", "unchanged"] as SemanticDiffStatus[]) {
    const items = report.items.filter((item) => item.status === status)
    if (!items.length) continue
    lines.push(`### ${status.replace(/_/g, " ")}`)
    items.forEach((item) => lines.push(`- ${item.label}${item.before ? ` | before: ${item.before}` : ""}${item.after ? ` | after: ${item.after}` : ""}`))
    lines.push("")
  }
  return lines.join("\n")
}
