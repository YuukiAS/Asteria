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

const requiredRelationTypes = [
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
  "limited_by",
  "contradicts",
  "causes",
]

const vite = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "silent",
})

try {
  const [
    { canonicalTraceProjects },
    { relationTypeOptions },
    { parseArchitectureProjectV2, serializeArchitectureProjectV2 },
    { migrateV1MapToArchitectureProjectV2 },
    { legacyV1FreezeMap },
    { traceForSymbol },
    { generateArchitectureOutline },
    { projectLayerFocus },
    { searchRenderedRelations },
    { normalizeEdgeData },
  ] = await Promise.all([
    vite.ssrLoadModule("/src/architecture/fixtures/canonicalTraceFixtures.ts"),
    vite.ssrLoadModule("/src/architecture/relationTypes.ts"),
    vite.ssrLoadModule("/src/architecture/schema.ts"),
    vite.ssrLoadModule("/src/architecture/migration.ts"),
    vite.ssrLoadModule("/src/fixtures/legacyV1FreezeMap.ts"),
    vite.ssrLoadModule("/src/architecture/trace.ts"),
    vite.ssrLoadModule("/src/architecture/outline.ts"),
    vite.ssrLoadModule("/src/architecture/projection.ts"),
    vite.ssrLoadModule("/src/lib/mapSearch.ts"),
    vite.ssrLoadModule("/src/lib/exportImport.ts"),
  ])

  requiredRelationTypes.forEach((type) => assert(relationTypeOptions.includes(type), `Missing relation type ${type}.`))

  const original = canonicalTraceProjects["original-trace"]
  const cat = canonicalTraceProjects["cat-trace-frozen-v2"]
  assert(original && cat, "Expected canonical TRACE projects.")
  parseArchitectureProjectV2(JSON.parse(serializeArchitectureProjectV2(cat)))

  const legacyProject = migrateV1MapToArchitectureProjectV2(legacyV1FreezeMap)
  const legacyVisualRelation = Object.values(legacyProject.relations).find((relation) => relation.provenance.some((record) => record.sourceId === "edge-model-symbols"))
  assert(legacyVisualRelation?.type === "unresolved" && legacyVisualRelation.unresolved, "Legacy visual edge must remain unresolved semantic relation.")
  assert(legacyVisualRelation?.presentation?.lineStyle === "dashed", "Legacy edge presentation must remain separate from semantic type.")

  const normalized = normalizeEdgeData({ label: "estimates", semanticType: "estimated_by", createdAt: "a", updatedAt: "b" })
  assert(normalized.semanticType === "estimated_by", "Edge semantic type should normalize and serialize separately from presentation.")
  assert(searchRenderedRelations([{ id: "e1", source: "a", target: "b", data: normalized }], "all", "estimated_by").length === 1, "Relation search should find semantic type.")

  const noImplicitCauses = Object.values(cat.relations).every((relation) => relation.type !== "causes")
  assert(noImplicitCauses, "Canonical model dependencies must not become causal unless explicit.")
  const causalProject = clone(cat)
  causalProject.relations["relation:test:causes"] = { id: "relation:test:causes", type: "causes", sourceId: "entity:cat-trace-frozen-v2:x_i", targetId: "entity:cat-trace-frozen-v2:zU_igh", directed: true, provenance: [{ source: "manual" }] }
  assert(causalProject.relations["relation:test:causes"].type === "causes", "Causal relation must be explicit-only.")

  const cyclicProject = clone(cat)
  cyclicProject.relations["relation:test:cycle"] = { id: "relation:test:cycle", type: "depends_on", sourceId: "entity:cat-trace-frozen-v2:Sigma_W", targetId: "entity:cat-trace-frozen-v2:Lambda_W", directed: true, provenance: [{ source: "manual" }] }
  const cyclicTrace = traceForSymbol(cyclicProject, "symbol:cat-trace-frozen-v2:Lambda_W", { mode: "recursive", direction: "both", maxDepth: 8 })
  assert(cyclicTrace.entityIds.has("entity:cat-trace-frozen-v2:Sigma_W"), "Recursive trace should traverse cycle-adjacent nodes.")
  assert(cyclicTrace.breadcrumbs.length < 60, "Recursive trace should be cycle-safe.")

  const beforeLayerFocus = serializeArchitectureProjectV2(cat)
  const latentFocus = projectLayerFocus(cat, "view:architecture", "latent")
  assert(latentFocus.entityIds.has("entity:cat-trace-frozen-v2:zU_igh"), "Layer focus should include focused-layer entity.")
  assert(latentFocus.entityIds.has("entity:cat-trace-frozen-v2:betaU_gh"), "Layer focus should keep directly connected boundary entity.")
  assert(serializeArchitectureProjectV2(cat) === beforeLayerFocus, "Layer focus must not mutate project data.")

  const catOutline = generateArchitectureOutline(cat)
  const catLayers = catOutline.sections.map((section) => section.layer)
  for (const layer of ["target", "observation", "measurement", "latent", "parameterization", "inference"]) {
    assert(catLayers.includes(layer), `CAT-TRACE outline missing layer ${layer}.`)
  }
  assert(catOutline.sections.every((section) => section.entityIds.every((id) => typeof id === "string")), "Outline should reference entity IDs only.")
  assert(catOutline.entityIdToSectionId.has("entity:cat-trace-frozen-v2:betaU_gh"), "Outline should support click selection lookup.")

  const originalOutlineText = JSON.stringify(generateArchitectureOutline(original))
  for (const forbidden of ["mathcal_K", "a_g", "pi_g", "p_g_star"]) {
    assert(!originalOutlineText.includes(forbidden), `Original TRACE outline must not include CAT-TRACE-only object ${forbidden}.`)
  }

  assert(legacyProject.legacy.storyOutline.length === legacyV1FreezeMap.storyOutline.length, "Story Outline must survive G03 schema changes.")
  const hiddenEdge = normalizeEdgeData({ semanticType: "targets", visibility: ["cat-trace"], createdAt: "a", updatedAt: "b" })
  assert(searchRenderedRelations([{ id: "e2", source: "a", target: "b", data: hiddenEdge }], "original-trace", "targets").length === 0, "Relation search must respect active-version edge visibility.")
  assert(searchRenderedRelations([{ id: "e2", source: "a", target: "b", data: hiddenEdge }], "cat-trace", "targets").length === 1, "Relation search should find visible active-model relation.")

  if (!process.exitCode) console.log("Validated G03 typed relations, recursive trace, layer focus, outline, and relation search.")
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await vite.close()
  process.exit(process.exitCode ?? 0)
}
