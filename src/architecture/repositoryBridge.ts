const bridgeSchemaId = "asteria.cat_trace.repository_bridge"
const bridgeSchemaVersion = "0.1.0"

export type BridgeImplementationState = "PLANNED" | "IMPLEMENTED" | "TESTED" | "AUDITED" | "BLOCKED"
export type BridgeBindingSource = "manual" | "manifest" | "static_analysis" | "agent_inferred" | "human_confirmed"
export type BridgeCodeKind = "file" | "function" | "method" | "class" | "variable" | "field" | "config" | "test"
export type BridgeBindingRole = "definition" | "storage" | "initialization" | "update" | "sampling" | "transformation" | "consumption" | "diagnostic" | "test"
export type BridgeStalenessStatus = "CURRENT" | "STALE" | "BROKEN" | "UNKNOWN"

export type RepositoryBridgeBinding = {
  id: string
  entityId: string
  role: BridgeBindingRole
  path: string
  codeKind: BridgeCodeKind
  qualifiedName?: string
  testRefs?: string[]
  source: BridgeBindingSource
  confidence?: number
  implementationState: BridgeImplementationState
  commit: string
  ref?: string
  structuralAnchor?: string
  codeFingerprint?: string
  bindingStatus: BridgeStalenessStatus
  notes?: string[]
}

export type RepositoryBridgeStatusObject = {
  id: string
  label: string
  implementationState: BridgeImplementationState
  reason: string
  evidenceRefs?: string[]
}

export type RepositoryBridgeManifest = {
  schemaId: typeof bridgeSchemaId
  schemaVersion: typeof bridgeSchemaVersion
  sourceRepository: {
    owner: string
    name: string
    url: string
    defaultBranch: string
    commit: string
  }
  scientificProjectId: string
  modelVariantId: string
  generatedAt?: string
  evidenceBoundary: {
    implementationBindingIsScientificProof: false
    codeDoesNotUpdateScientificTruth: true
    reliabilityLimitations: string[]
  }
  bindings: RepositoryBridgeBinding[]
  statusObjects: RepositoryBridgeStatusObject[]
}

export type RepositoryBridgeValidationIssue = {
  path: string
  message: string
}

export type RepositoryBridgeValidationResult = {
  ok: boolean
  issues: RepositoryBridgeValidationIssue[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString)
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && allowed.includes(value as T)
}

function isRelativeRepositoryPath(value: string) {
  return !value.startsWith("/") && !/^[a-zA-Z]:[\\/]/.test(value) && !value.split(/[\\/]/).includes("..")
}

function validateCommit(value: unknown) {
  return typeof value === "string" && /^[0-9a-f]{40}$/i.test(value)
}

export function validateRepositoryBridgeManifest(input: unknown): RepositoryBridgeValidationResult {
  const issues: RepositoryBridgeValidationIssue[] = []
  const add = (path: string, message: string) => issues.push({ path, message })
  if (!isRecord(input)) return { ok: false, issues: [{ path: "$", message: "Manifest must be an object." }] }

  if (input.schemaId !== bridgeSchemaId) add("$.schemaId", `Expected ${bridgeSchemaId}.`)
  if (input.schemaVersion !== bridgeSchemaVersion) add("$.schemaVersion", `Expected ${bridgeSchemaVersion}.`)

  if (!isRecord(input.sourceRepository)) {
    add("$.sourceRepository", "sourceRepository must be an object.")
  } else {
    for (const key of ["owner", "name", "url", "defaultBranch"] as const) {
      if (!isString(input.sourceRepository[key])) add(`$.sourceRepository.${key}`, "Expected a non-empty string.")
    }
    if (!validateCommit(input.sourceRepository.commit)) add("$.sourceRepository.commit", "Expected a 40-character commit SHA.")
  }

  if (!isString(input.scientificProjectId)) add("$.scientificProjectId", "Expected a non-empty scientific project id.")
  if (!isString(input.modelVariantId)) add("$.modelVariantId", "Expected a non-empty model variant id.")
  if (input.generatedAt !== undefined && !isString(input.generatedAt)) add("$.generatedAt", "generatedAt must be a string when present.")

  if (!isRecord(input.evidenceBoundary)) {
    add("$.evidenceBoundary", "evidenceBoundary must be present.")
  } else {
    if (input.evidenceBoundary.implementationBindingIsScientificProof !== false) add("$.evidenceBoundary.implementationBindingIsScientificProof", "Implementation binding must not be marked as scientific proof.")
    if (input.evidenceBoundary.codeDoesNotUpdateScientificTruth !== true) add("$.evidenceBoundary.codeDoesNotUpdateScientificTruth", "Code must not update scientific truth.")
    if (!isStringArray(input.evidenceBoundary.reliabilityLimitations)) add("$.evidenceBoundary.reliabilityLimitations", "Expected string limitations.")
  }

  if (!Array.isArray(input.bindings) || input.bindings.length === 0) {
    add("$.bindings", "Expected at least one binding.")
  } else {
    input.bindings.forEach((binding, index) => {
      const path = `$.bindings[${index}]`
      if (!isRecord(binding)) {
        add(path, "Binding must be an object.")
        return
      }
      for (const key of ["id", "entityId", "path", "commit"] as const) {
        if (!isString(binding[key])) add(`${path}.${key}`, "Expected a non-empty string.")
      }
      if (isString(binding.path) && !isRelativeRepositoryPath(binding.path)) add(`${path}.path`, "Path must be repository-relative and must not traverse upward.")
      if (!oneOf(binding.role, ["definition", "storage", "initialization", "update", "sampling", "transformation", "consumption", "diagnostic", "test"])) add(`${path}.role`, "Unsupported binding role.")
      if (!oneOf(binding.codeKind, ["file", "function", "method", "class", "variable", "field", "config", "test"])) add(`${path}.codeKind`, "Unsupported code kind.")
      if (!oneOf(binding.source, ["manual", "manifest", "static_analysis", "agent_inferred", "human_confirmed"])) add(`${path}.source`, "Unsupported source.")
      if (!oneOf(binding.implementationState, ["PLANNED", "IMPLEMENTED", "TESTED", "AUDITED", "BLOCKED"])) add(`${path}.implementationState`, "Unsupported implementation state.")
      if (!oneOf(binding.bindingStatus, ["CURRENT", "STALE", "BROKEN", "UNKNOWN"])) add(`${path}.bindingStatus`, "Unsupported binding status.")
      if (!validateCommit(binding.commit)) add(`${path}.commit`, "Expected a 40-character commit SHA.")
      if (binding.confidence !== undefined && (typeof binding.confidence !== "number" || binding.confidence < 0 || binding.confidence > 1)) add(`${path}.confidence`, "confidence must be in [0, 1].")
      if (binding.testRefs !== undefined && (!isStringArray(binding.testRefs) || binding.testRefs.some((item) => !isRelativeRepositoryPath(item)))) add(`${path}.testRefs`, "testRefs must be repository-relative strings.")
    })
  }

  if (!Array.isArray(input.statusObjects)) {
    add("$.statusObjects", "Expected statusObjects array.")
  } else {
    input.statusObjects.forEach((status, index) => {
      const path = `$.statusObjects[${index}]`
      if (!isRecord(status)) {
        add(path, "Status object must be an object.")
        return
      }
      for (const key of ["id", "label", "reason"] as const) {
        if (!isString(status[key])) add(`${path}.${key}`, "Expected a non-empty string.")
      }
      if (!oneOf(status.implementationState, ["PLANNED", "IMPLEMENTED", "TESTED", "AUDITED", "BLOCKED"])) add(`${path}.implementationState`, "Unsupported implementation state.")
      if (status.evidenceRefs !== undefined && (!isStringArray(status.evidenceRefs) || status.evidenceRefs.some((item) => !isRelativeRepositoryPath(item)))) add(`${path}.evidenceRefs`, "evidenceRefs must be repository-relative strings.")
    })
  }

  return { ok: issues.length === 0, issues }
}

export function parseRepositoryBridgeManifest(input: unknown): RepositoryBridgeManifest {
  const result = validateRepositoryBridgeManifest(input)
  if (!result.ok) throw new Error(`Invalid repository bridge manifest: ${result.issues.map((issue) => `${issue.path} ${issue.message}`).join("; ")}`)
  return input as RepositoryBridgeManifest
}

const catTraceMainCommit = "628ed400670140c8557234e5c49bf3526d241214"

export const syntheticCatTraceRepositoryBridgeFixture: RepositoryBridgeManifest = {
  schemaId: bridgeSchemaId,
  schemaVersion: bridgeSchemaVersion,
  sourceRepository: {
    owner: "YuukiAS",
    name: "CAT-TRACE",
    url: "https://github.com/YuukiAS/CAT-TRACE",
    defaultBranch: "main",
    commit: catTraceMainCommit,
  },
  scientificProjectId: "CAT-TRACE",
  modelVariantId: "cat-trace-frozen-v2",
  generatedAt: "2026-10-04T00:00:00.000Z",
  evidenceBoundary: {
    implementationBindingIsScientificProof: false,
    codeDoesNotUpdateScientificTruth: true,
    reliabilityLimitations: [
      "C04-REF v0.1.2 is implemented and tested but the formal combined reliability gate still fails on two bulk-ESS coordinates.",
      "C03 production grouped open-tail inference remains blocked by GAP-01 and GAP-04.",
      "Real-data C02 contracts are not closed.",
    ],
  },
  bindings: [
    {
      id: "cat-trace-b0-c01-tail-terms",
      entityId: "entity:cat-trace-frozen-v2:zU_igh",
      role: "transformation",
      path: "package/TRACE/src/ct_math.cpp",
      codeKind: "function",
      qualifiedName: "ct_probit_tail_terms",
      testRefs: ["package/TRACE/tests/testthat/test-math-stability.R"],
      source: "manual",
      confidence: 0.9,
      implementationState: "TESTED",
      commit: catTraceMainCommit,
      structuralAnchor: "Rcpp export _TRACE_ct_probit_tail_terms",
      bindingStatus: "CURRENT",
    },
    {
      id: "cat-trace-b0-c01-laplace",
      entityId: "entity:cat-trace-frozen-v2:zU_igh",
      role: "diagnostic",
      path: "package/TRACE/src/ct_probit.cpp",
      codeKind: "function",
      qualifiedName: "ct_probit_laplace",
      testRefs: ["package/TRACE/tests/testthat/test-probit-gradient.R"],
      source: "manual",
      confidence: 0.86,
      implementationState: "TESTED",
      commit: catTraceMainCommit,
      structuralAnchor: "Rcpp export _TRACE_ct_probit_laplace",
      bindingStatus: "CURRENT",
    },
    {
      id: "cat-trace-b0-c02-synthetic-contract",
      entityId: "entity:cat-trace-frozen-v2:mathcal_K",
      role: "definition",
      path: "package/TRACE/R/cat-trace-data.R",
      codeKind: "function",
      qualifiedName: "validate_cat_trace_data",
      testRefs: ["package/TRACE/tests/testthat/test-data-contract.R"],
      source: "manual",
      confidence: 0.88,
      implementationState: "TESTED",
      commit: catTraceMainCommit,
      structuralAnchor: "schema_version cat_trace_synthetic_v1",
      bindingStatus: "CURRENT",
    },
    {
      id: "cat-trace-b0-c02-feature-alignment",
      entityId: "entity:cat-trace-frozen-v2:zero_slots",
      role: "initialization",
      path: "package/TRACE/R/cat-trace-data.R",
      codeKind: "function",
      qualifiedName: "ct_r_align_features",
      testRefs: ["package/TRACE/tests/testthat/test-data-contract.R"],
      source: "manual",
      confidence: 0.84,
      implementationState: "TESTED",
      commit: catTraceMainCommit,
      structuralAnchor: "source_type ANONYMOUS_ZERO",
      bindingStatus: "CURRENT",
    },
    {
      id: "cat-trace-b0-c04-reference-fit",
      entityId: "entity:cat-trace-frozen-v2:posterior_inference",
      role: "sampling",
      path: "package/TRACE/R/cat-trace-reference.R",
      codeKind: "function",
      qualifiedName: "ref_ct_fit",
      testRefs: ["package/TRACE/tests/testthat/test-reference-engine.R", "package/TRACE/tests/testthat/test-reference-c04-ref-v0-1-2.R"],
      source: "manual",
      confidence: 0.82,
      implementationState: "TESTED",
      commit: catTraceMainCommit,
      structuralAnchor: "schema_version ref_ct_fit_v1",
      bindingStatus: "CURRENT",
      notes: ["Formal combined reliability is not closed."],
    },
    {
      id: "cat-trace-b0-c04-gamma-group-intensity",
      entityId: "entity:cat-trace-frozen-v2:gamma_g",
      role: "sampling",
      path: "package/TRACE/R/cat-trace-reference.R",
      codeKind: "function",
      qualifiedName: "ref_ct_interweave_eta_collapsed_contrast",
      testRefs: ["package/TRACE/tests/testthat/test-reference-c04-ref-v0-1-2.R"],
      source: "manual",
      confidence: 0.78,
      implementationState: "TESTED",
      commit: catTraceMainCommit,
      structuralAnchor: "nc_eta_collapsed_contrast",
      bindingStatus: "CURRENT",
      notes: ["Same-F1 formal reliability still fails bulk ESS for group_share[g3] and share_logit[g2]."],
    },
  ],
  statusObjects: [
    {
      id: "cat-trace-c03-production",
      label: "C03 production grouped open-tail inference",
      implementationState: "BLOCKED",
      reason: "Blocked by GAP-01 anonymous zero-slot production integrator and GAP-04 preregistration.",
      evidenceRefs: ["docs/implementation/07_DECISION_AND_GAP_LEDGER.md"],
    },
    {
      id: "cat-trace-zero-slot-production-integrator",
      label: "Anonymous zero-slot production integrator",
      implementationState: "BLOCKED",
      reason: "ZERO_SLOT_BLOCKER_CLOSED = NO in current implementation status.",
      evidenceRefs: ["docs/implementation/README.md"],
    },
    {
      id: "cat-trace-c02-real-data",
      label: "C02 real-data contracts",
      implementationState: "PLANNED",
      reason: "Real dataset contracts remain evidence pending; synthetic C02 is implemented and tested.",
      evidenceRefs: ["docs/implementation/07_DECISION_AND_GAP_LEDGER.md"],
    },
  ],
}
