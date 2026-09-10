import { createServer } from "vite"

function fail(message) {
  console.error(message)
  process.exitCode = 1
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

const vite = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "silent",
})

try {
  const [
    { canonicalTraceProjects },
    { frequentistRegressionFixture, causalAteFixture },
    { exportArchitectureMarkdown, exportArchitectureJsonV2 },
    { validateArchitectureProject },
    { parseArchitectureProjectV2 },
    { diffOriginalTraceToCatTrace, semanticDiffMarkdown },
    { buildStoryMarkdown },
    { legacyV1FreezeMap },
    { migrateV1MapToArchitectureProjectV2 },
  ] = await Promise.all([
    vite.ssrLoadModule("/src/architecture/fixtures/canonicalTraceFixtures.ts"),
    vite.ssrLoadModule("/src/architecture/fixtures/crossParadigmFixtures.ts"),
    vite.ssrLoadModule("/src/architecture/export.ts"),
    vite.ssrLoadModule("/src/architecture/validation.ts"),
    vite.ssrLoadModule("/src/architecture/schema.ts"),
    vite.ssrLoadModule("/src/architecture/semanticDiff.ts"),
    vite.ssrLoadModule("/src/lib/storyMarkdownExport.ts"),
    vite.ssrLoadModule("/src/fixtures/legacyV1FreezeMap.ts"),
    vite.ssrLoadModule("/src/architecture/migration.ts"),
  ])

  const original = canonicalTraceProjects["original-trace"]
  const cat = canonicalTraceProjects["cat-trace-frozen-v2"]
  const diff = diffOriginalTraceToCatTrace(original, cat)
  const diffMarkdown = semanticDiffMarkdown(diff)

  const originalMarkdown = exportArchitectureMarkdown(original, { variantId: "original-trace" })
  assert(originalMarkdown.includes("# Original TRACE"), "Original TRACE Markdown should be readable.")
  assert(originalMarkdown.includes("$y_{ij}$"), "Original TRACE Markdown should include canonical LaTeX.")
  assert(originalMarkdown.includes("Marginal occurrence probability"), "Original TRACE Markdown should include marginal probit target.")
  assert(!originalMarkdown.includes("symbol:original-trace"), "Readable Markdown body should avoid internal symbol IDs.")
  assert(!originalMarkdown.includes("mathcal K"), "Original TRACE export must not contain CAT-TRACE catalogue.")

  const catMarkdown = exportArchitectureMarkdown(cat, { variantId: "cat-trace-frozen-v2", diffSummary: diffMarkdown })
  assert(catMarkdown.includes("# CAT-TRACE Frozen V2"), "CAT-TRACE Markdown should be readable.")
  assert(catMarkdown.includes("$p_g^*$"), "CAT-TRACE Markdown should include p_g^*.")
  assert(catMarkdown.includes("gamma_g = gamma_0*pi_g"), "CAT-TRACE Markdown should include gamma composition.")
  assert(catMarkdown.split("\n").filter((line) => line.startsWith("| $\\nu$ |")).length === 1, "Canonical symbol table should deduplicate symbol definitions.")

  const json = JSON.parse(exportArchitectureJsonV2(cat))
  assert(Array.isArray(json.validationWarnings), "Schema-v2 JSON export should include validation warnings.")
  parseArchitectureProjectV2(json)

  const bad = clone(cat)
  bad.relations["relation:bad:missing"] = { id: "relation:bad:missing", type: "depends_on", sourceId: "missing-source", targetId: "entity:cat-trace-frozen-v2:zU_igh", directed: true, provenance: [{ source: "manual" }] }
  bad.symbols["symbol:bad:conflict"] = { ...bad.symbols["symbol:cat-trace-frozen-v2:nu"], id: "symbol:bad:conflict", meaning: "Conflicting meaning" }
  bad.entities["entity:bad:dim"] = { id: "entity:bad:dim", kind: "model", label: "Bad dimension", layer: "parameterization", dimension: "R^q", indices: ["g"], provenance: [{ source: "manual" }] }
  bad.entities["entity:bad:derived"] = { id: "entity:bad:derived", kind: "model", label: "Bad derived", layer: "parameterization", observedStatus: "derived", definitionMode: "stochastic", constraints: ["ignore isolated"], provenance: [{ source: "manual" }] }
  bad.entities["entity:bad:isolated"] = { id: "entity:bad:isolated", kind: "model", label: "Bad isolated", layer: "parameterization", provenance: [{ source: "manual" }] }
  bad.entities["entity:bad:estimator"] = { id: "entity:bad:estimator", kind: "algorithm", label: "Bad estimator", layer: "inference", role: "estimator", constraints: ["ignore isolated"], provenance: [{ source: "manual" }] }
  bad.entities["entity:bad:likelihood"] = { id: "entity:bad:likelihood", kind: "model", label: "Bad likelihood", layer: "latent", role: "stochastic mechanism", definitionMode: "stochastic", constraints: ["ignore isolated"], provenance: [{ source: "manual" }] }
  bad.entities["entity:bad:causal"] = { id: "entity:bad:causal", kind: "result", label: "Bad causal", layer: "target", role: "causal estimand", definitionMode: "causal", constraints: ["ignore isolated"], provenance: [{ source: "manual" }] }
  bad.entities["entity:bad:claim"] = { id: "entity:bad:claim", kind: "theorem", label: "Bad claim", layer: "validation", role: "claim", constraints: ["ignore isolated"], provenance: [{ source: "manual" }] }
  bad.entities["entity:bad:diff"] = { id: "entity:bad:diff", kind: "model", label: "Bad diff status", layer: "parameterization", diffStatus: "modified", constraints: ["unchanged", "ignore isolated"], provenance: [{ source: "manual" }] }
  bad.entities["entity:bad:binding"] = { id: "entity:bad:binding", kind: "model", label: "Bad binding", layer: "parameterization", constraints: ["ignore isolated"], formulaBindings: [{ id: "binding:bad", formulaId: "formula:bad", fragment: "bad", symbolId: "missing-symbol" }], provenance: [{ source: "manual" }] }
  bad.entities["entity:bad:code"] = { id: "entity:bad:code", kind: "algorithm", label: "Bad code binding", layer: "inference", constraints: ["ignore isolated"], codeBindings: [{ path: "/missing/local/path.py" }], provenance: [{ source: "manual" }] }
  const badWarnings = validateArchitectureProject(bad, { pathExists: () => false }).map((warning) => warning.rule)
  for (const rule of ["missing-ref", "symbol-conflict", "dimension-index-mismatch", "derived-independent-prior", "isolated-object", "estimator-without-target", "likelihood-without-observed-input", "causal-identification-missing", "claim-without-evidence", "variant-diff-inconsistent", "stale-formula-binding", "missing-code-binding"]) {
    assert(badWarnings.includes(rule), `Expected validation warning rule ${rule}.`)
  }

  const catWarnings = validateArchitectureProject(cat).map((warning) => warning.message).join("\n")
  assert(!catWarnings.includes("gamma_g is marked derived but also has an independent stochastic law"), "gamma_g should remain deterministic derived quantity.")
  assert(!catWarnings.includes("p_g must be not estimand"), "p_g should not be falsely warned as estimand.")
  assert(!catWarnings.includes("C_tax"), "CAT fixture should not mix C_tax/C_phy source semantics.")

  const originalWarnings = validateArchitectureProject(original).map((warning) => warning.message).join("\n")
  assert(!originalWarnings.includes("mathcal K"), "Original TRACE validation must not mention CAT catalogue.")
  assert(originalMarkdown.includes("TRACE truncation"), "Original TRACE export should describe p as truncation.")
  assert(originalMarkdown.includes("TRACE intercept location"), "Original TRACE export should include tail calibration relation.")
  assert(originalMarkdown.includes("Marginal occurrence probability"), "Original TRACE export should include marginal probit interpretation.")

  const frequentistWarnings = validateArchitectureProject(frequentistRegressionFixture).map((warning) => warning.message).join("\n")
  assert(!frequentistWarnings.includes("prior"), "Frequentist fixture must not receive false Bayesian-prior warning.")
  assert(exportArchitectureMarkdown(frequentistRegressionFixture).includes("argmin_b ||y-Xb||^2"), "Frequentist export should include optimization objective.")

  const causalWarnings = validateArchitectureProject(causalAteFixture)
  assert(!causalWarnings.some((warning) => warning.rule === "causal-identification-missing"), "Causal fixture with identification should not warn.")
  const missingIdentification = clone(causalAteFixture)
  delete missingIdentification.relations["relation:ate:id-target"]
  assert(validateArchitectureProject(missingIdentification).some((warning) => warning.rule === "causal-identification-missing"), "Causal fixture without identification should warn.")

  assert(diff.items.some((item) => item.label.includes("Finite catalogue") && item.status === "added"), "Diff missing CAT finite catalogue addition.")
  assert(diff.items.some((item) => item.label.includes("Species response hierarchy") && item.status === "modified_definition"), "Diff missing slope hierarchy modification.")
  assert(diff.items.some((item) => item.label.includes("Marginal probit") && item.status === "preserved_invariant"), "Diff missing marginal probit preserved invariant.")
  for (const forbidden of ["nu_g", "global intercept", "group effect", "unknown species count"]) {
    assert(!diffMarkdown.includes(forbidden), `Diff should not include forbidden false claim: ${forbidden}.`)
  }

  const storyMarkdown = buildStoryMarkdown({
    mapTitle: legacyV1FreezeMap.title,
    nodes: legacyV1FreezeMap.nodes,
    storyOutline: legacyV1FreezeMap.storyOutline,
    storyDeckSettings: legacyV1FreezeMap.storyDeckSettings,
    activeVersionId: legacyV1FreezeMap.activeVersionId,
    modelVersions: legacyV1FreezeMap.modelVersions,
  })
  assert(storyMarkdown.includes("# Asteria 1.x Freeze Deck") && storyMarkdown.includes("## Slide 1 - Main model"), "Legacy Story Markdown export should still work.")
  const migrated = migrateV1MapToArchitectureProjectV2(legacyV1FreezeMap)
  assert(migrated.legacy.storyOutline.length === legacyV1FreezeMap.storyOutline.length, "V1 migration regression should preserve Story Outline.")

  if (!process.exitCode) console.log("Validated G04 architecture export, structural validation, cross-paradigm fixtures, semantic diff, Story export, and v1 migration.")
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await vite.close()
  process.exit(process.exitCode ?? 0)
}
