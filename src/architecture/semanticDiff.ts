import type { ArchitectureProjectV2 } from "./types"

export type SemanticDiffStatus = "added" | "removed" | "modified_definition" | "modified_constraint" | "modified_target" | "preserved_invariant" | "unchanged"

export type SemanticDiffInlinePart = {
  text?: string
  latex?: string
  fallback?: string
}

export type SemanticDiffItem = {
  id: string
  status: SemanticDiffStatus
  label: string
  labelParts?: SemanticDiffInlinePart[]
  before?: string
  beforeParts?: SemanticDiffInlinePart[]
  after?: string
  afterParts?: SemanticDiffInlinePart[]
  why: string
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
      { id: "diff:finite-catalogue", status: "added", label: "Finite catalogue identities", labelParts: [{ text: "Finite catalogue " }, { latex: "\\mathcal K" }, { text: ", " }, { latex: "K" }, { text: ", and " }, { latex: "\\mathcal K_n" }], after: "CAT-TRACE separates finite catalogue identities from catalogue-external open tail.", why: "This separates known identities from open-tail discovery before any new-species claim is read." },
      { id: "diff:matching", status: "added", label: "Deterministic catalogue matching", labelParts: [{ text: "Deterministic " }, { latex: "c(f)" }, { text: " matching" }], after: "Raw features are matched to catalogue identities or open tail.", why: "Deterministic identity routing controls whether a raw feature enters the catalogue branch or the open-tail branch." },
      { id: "diff:grouping", status: "added", label: "Biological group deviation", labelParts: [{ text: "Biological grouping with " }, { latex: "a_g" }], after: "Open tail and catalogue responses share biological group structure with sum-to-zero group deviation.", afterParts: [{ text: "Open tail and catalogue responses share biological group structure with sum-to-zero " }, { latex: "a_g" }, { text: "." }], why: "The shared response plus group deviation makes grouped borrowing visible while preserving the marginal-response interpretation." },
      { id: "diff:open-tail-slots", status: "added", label: "Grouped truncation and zero slots", labelParts: [{ text: "Grouped " }, { latex: "p_g" }, { text: ", " }, { latex: "p_g^*" }, { text: ", and zero slots" }], after: "p_g is fixed truncation; zero slots remain likelihood information.", afterParts: [{ latex: "p_g" }, { text: " is fixed truncation; zero slots remain likelihood information." }], why: "The grouped truncation keeps anonymous zero slots as likelihood information instead of treating them as empty rows." },
      { id: "diff:gamma-composition", status: "added", label: "Group open-tail intensity", labelParts: [{ latex: "\\gamma_0" }, { text: ", " }, { latex: "\\pi_g" }, { text: ", and " }, { latex: "\\gamma_g" }], after: "gamma_g = gamma_0*pi_g is derived group intensity.", afterParts: [{ latex: "\\gamma_g=\\gamma_0\\pi_g" }, { text: " is derived group intensity." }], why: "The composition separates total open-tail intensity from group allocation, so the group term is not read as a free intercept." },
      { id: "diff:catalogue-slope", status: "added", label: "Catalogue intercept/slope structure", after: "Catalogue species receive finite intercepts and optional trait/relatedness modules.", why: "The catalogue hierarchy allows finite catalogue trait or relatedness borrowing only when aligned inputs exist." },
      { id: "diff:discovery-split", status: "added", label: "Catalogue/open-tail discovery split", after: "Targets distinguish finite catalogue discovery from open-tail discovery.", why: "The target split prevents catalogue rediscovery and anonymous open-tail discovery from being read as one quantity." },
      { id: "diff:factor-copula", status: "added", label: "Normalized finite-working-set residuals", labelParts: [{ text: "Finite-working-set normalized factor-copula" }], after: "Residual dependence is scoped to mathcal W with diag(Sigma_W)=1.", afterParts: [{ text: "Residual dependence is scoped to " }, { latex: "\\mathcal W" }, { text: " with " }, { latex: "\\operatorname{diag}(\\Sigma_{\\mathcal W})=1" }, { text: "." }], why: "The finite working-set correlation adds residual dependence while unit marginal normalization keeps probit mean semantics intact." },
      { id: "diff:slope", status: "modified_definition", label: "Species response hierarchy", before: "beta_j ~ N_q(nu,Psi)", beforeParts: [{ latex: "\\beta_j\\sim N_q(\\nu,\\Psi)" }], after: "beta^U_gh = nu + a_g + v^U_gh", afterParts: [{ latex: "\\beta^{\\mathcal U}_{gh}=\\nu+a_g+v^{\\mathcal U}_{gh}" }], why: "CAT-TRACE keeps the shared response vector and adds group plus species-level open-tail deviations." },
      { id: "diff:target", status: "modified_target", label: "Richness/discovery target", before: "TRACE calibrated finite richness target", after: "CAT-TRACE catalogue/open-tail discovery decomposition", why: "The target moves from one calibrated richness view to separate catalogue, open-tail, and future-discovery readings." },
      { id: "diff:marginal-probit", status: "preserved_invariant", label: "Marginal probit interpretation", before: "Phi(alpha_j + x_i^T beta_j)", beforeParts: [{ latex: "\\Phi(\\alpha_j+x_i^\\top\\beta_j)" }], after: "Retained under unit marginal residual variance.", why: "The key TRACE marginal mean interpretation remains visible after the CAT-TRACE extension." },
      { id: "diff:tail-calibration", status: "preserved_invariant", label: "TRACE open-tail calibration", before: "alpha_j calibrated by mu_p(gamma), tau_p", beforeParts: [{ latex: "\\alpha_j" }, { text: " calibrated by " }, { latex: "\\mu_p(\\gamma),\\tau_p" }], after: "alpha^U_gh calibrated by mu_{p_g}(gamma_g), tau_{p_g}", afterParts: [{ latex: "\\alpha^{\\mathcal U}_{gh}" }, { text: " calibrated by " }, { latex: "\\mu_{p_g}(\\gamma_g),\\tau_{p_g}" }], why: "Frozen V2 preserves TRACE tail calibration while indexing it by group truncation." },
      { id: "diff:finite-richness", status: "preserved_invariant", label: "Finite expected richness semantics", before: "Finite expected richness under calibrated tail", after: "Preserved for grouped open-tail calibration.", why: "The expected-richness meaning is retained under the grouped open-tail construction." },
      { id: "diff:residual-mean", status: "preserved_invariant", label: "Residual dependence does not alter marginal mean", before: "Unit marginal variance keeps marginal probit mean", after: "Normalized finite working set keeps unit diagonal.", why: "The residual model can add dependence without changing the one-dimensional probit mean." },
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
