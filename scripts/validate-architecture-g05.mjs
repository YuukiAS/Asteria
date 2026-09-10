import { createServer } from "vite"

function fail(message) {
  console.error(message)
  process.exitCode = 1
}

function assert(condition, message) {
  if (!condition) fail(message)
}

const vite = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "silent",
})

try {
  const [
    { canonicalTraceProjects },
    { traceForSymbol },
    { projectLayerFocus },
    { exportArchitectureMarkdown, exportArchitectureJsonV2 },
    { diffOriginalTraceToCatTrace },
    { createSyntheticArchitectureProject },
    { createArchitectureGraphIndex },
    { migrateV1MapToArchitectureProjectV2 },
    { buildStoryMarkdown },
    { legacyV1FreezeMap },
  ] = await Promise.all([
    vite.ssrLoadModule("/src/architecture/fixtures/canonicalTraceFixtures.ts"),
    vite.ssrLoadModule("/src/architecture/trace.ts"),
    vite.ssrLoadModule("/src/architecture/projection.ts"),
    vite.ssrLoadModule("/src/architecture/export.ts"),
    vite.ssrLoadModule("/src/architecture/semanticDiff.ts"),
    vite.ssrLoadModule("/src/architecture/fixtures/syntheticArchitectureProject.ts"),
    vite.ssrLoadModule("/src/architecture/graphIndex.ts"),
    vite.ssrLoadModule("/src/architecture/migration.ts"),
    vite.ssrLoadModule("/src/lib/storyMarkdownExport.ts"),
    vite.ssrLoadModule("/src/fixtures/legacyV1FreezeMap.ts"),
  ])

  const original = canonicalTraceProjects["original-trace"]
  const cat = canonicalTraceProjects["cat-trace-frozen-v2"]
  const betaTrace = traceForSymbol(cat, "symbol:cat-trace-frozen-v2:betaU_gh", { mode: "recursive", direction: "both", maxDepth: 3 })
  const gammaTrace = traceForSymbol(cat, "symbol:cat-trace-frozen-v2:gamma_g", { mode: "recursive", direction: "downstream", maxDepth: 3 })
  const pTrace = traceForSymbol(cat, "symbol:cat-trace-frozen-v2:p_g", { mode: "recursive", direction: "both", maxDepth: 3 })
  const layerFocus = projectLayerFocus(cat, "view:architecture", "parameterization")
  const diff = diffOriginalTraceToCatTrace(original, cat)
  const catMarkdown = exportArchitectureMarkdown(cat, { variantId: "cat-trace-frozen-v2" })
  const catJson = JSON.parse(exportArchitectureJsonV2(cat))
  const migrated = migrateV1MapToArchitectureProjectV2(legacyV1FreezeMap)
  const storyMarkdown = buildStoryMarkdown({
    mapTitle: legacyV1FreezeMap.title,
    nodes: legacyV1FreezeMap.nodes,
    modelVersions: legacyV1FreezeMap.modelVersions,
    activeVersionId: legacyV1FreezeMap.activeVersionId,
    storyOutline: legacyV1FreezeMap.storyOutline,
    storyDeckSettings: legacyV1FreezeMap.storyDeckSettings,
  })

  assert(betaTrace.upstreamEntityIds.has("entity:cat-trace-frozen-v2:nu"), "beta^U_gh trace should include upstream nu.")
  assert(betaTrace.upstreamEntityIds.has("entity:cat-trace-frozen-v2:a_g"), "beta^U_gh trace should include upstream a_g.")
  assert(betaTrace.downstreamEntityIds.has("entity:cat-trace-frozen-v2:zU_igh"), "beta^U_gh trace should include downstream z^U_igh.")
  assert(gammaTrace.downstreamEntityIds.has("entity:cat-trace-frozen-v2:alphaU_gh"), "gamma_g trace should reach open-tail intercept calibration.")
  assert(pTrace.entityIds.has("entity:cat-trace-frozen-v2:zero_slots"), "p_g recursive trace should include zero-slot multiplicity.")
  assert(layerFocus.entityIds.size < Object.keys(cat.entities).length, "Layer focus should project a bounded subset.")
  assert(diff.items.some((item) => item.status === "added" && item.label.includes("Finite catalogue")), "Semantic diff should include CAT catalogue addition.")
  assert(catMarkdown.includes("beta^U_gh = nu + a_g + v^U_gh"), "Markdown export should preserve beta^U_gh definition.")
  assert(catJson.validationWarnings && Array.isArray(catJson.validationWarnings), "Schema V2 JSON export should include validationWarnings.")
  assert(migrated.legacy.storyOutline.length === legacyV1FreezeMap.storyOutline.length, "Legacy V1 import should preserve Story outline.")
  assert(storyMarkdown.includes("# Asteria 1.x Freeze Deck"), "Story Markdown regression should remain available.")

  const stress = createSyntheticArchitectureProject(2200, 6200)
  const indexStart = performance.now()
  createArchitectureGraphIndex(stress)
  const indexMs = performance.now() - indexStart
  const traceStart = performance.now()
  traceForSymbol(stress, "symbol:synthetic:150", { mode: "recursive", direction: "both", maxDepth: 4 })
  const traceMs = performance.now() - traceStart
  assert(Object.keys(stress.entities).length >= 2000, "Stress fixture should include at least 2,000 semantic entities.")
  assert(Object.keys(stress.relations).length >= 5000, "Stress fixture should include at least 5,000 relations.")
  assert(stress.views["view:architecture"].projectedEntityIds.length >= 200 && stress.views["view:architecture"].projectedEntityIds.length <= 300, "Stress Architecture projection should render roughly 200-300 visible nodes.")
  assert(indexMs < 150, `Stress graph indexing is unexpectedly slow: ${indexMs.toFixed(2)}ms.`)
  assert(traceMs < 60, `Stress recursive trace is unexpectedly slow: ${traceMs.toFixed(2)}ms.`)

  if (!process.exitCode) {
    console.log(
      JSON.stringify(
        {
          status: "validated",
          betaTraceEntities: betaTrace.entityIds.size,
          layerFocusedEntities: layerFocus.entityIds.size,
          stressEntities: Object.keys(stress.entities).length,
          stressRelations: Object.keys(stress.relations).length,
          indexMs: Number(indexMs.toFixed(3)),
          traceMs: Number(traceMs.toFixed(3)),
        },
        null,
        2,
      ),
    )
  }
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await vite.close()
  process.exit(process.exitCode ?? 0)
}
