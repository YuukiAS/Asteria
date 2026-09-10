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
    { architectureSchemaVersion },
    { migrateV1MapToArchitectureProjectV2 },
    { parseArchitectureProjectV2, serializeArchitectureProjectV2 },
    { createArchitectureGraphIndex, getIncomingRelations, getOutgoingRelations, traceEntityIds },
    { selectEntitySymbols, selectEntityViews, selectProjectedEntities },
    { legacyV1FreezeMap },
  ] = await Promise.all([
    vite.ssrLoadModule("/src/architecture/types.ts"),
    vite.ssrLoadModule("/src/architecture/migration.ts"),
    vite.ssrLoadModule("/src/architecture/schema.ts"),
    vite.ssrLoadModule("/src/architecture/graphIndex.ts"),
    vite.ssrLoadModule("/src/architecture/selectors.ts"),
    vite.ssrLoadModule("/src/fixtures/legacyV1FreezeMap.ts"),
  ])

  const projectA = migrateV1MapToArchitectureProjectV2(clone(legacyV1FreezeMap))
  const projectB = migrateV1MapToArchitectureProjectV2(clone(legacyV1FreezeMap))
  assert(JSON.stringify(projectA) === JSON.stringify(projectB), "Expected v1 -> v2 migration to be deterministic.")
  assert(projectA.schemaVersion === architectureSchemaVersion, "Expected current architecture schema version.")
  assert(projectA.legacy?.payload?.version === 1, "Expected full legacy payload to be preserved.")
  assert(projectA.legacy?.storyOutline?.length === legacyV1FreezeMap.storyOutline.length, "Expected legacy Story Outline to be preserved.")

  const mainEntity = projectA.entities["entity:legacy:block-main-model"]
  const symbolEntity = projectA.entities["entity:legacy:block-symbols"]
  const symbolIds = mainEntity?.symbolIds || []
  assert(mainEntity?.legacy?.variants?.["cat-trace"], "Expected legacy variants to be preserved on migrated entity.")
  assert(mainEntity?.legacy?.style?.width === 640, "Expected legacy presentation width to be preserved.")
  assert(symbolEntity?.symbolIds?.length === 3, "Expected legacy Symbol rows to become symbols.")
  assert(projectA.symbols["symbol:legacy:block-symbols:sym-alpha"]?.latex === "\\alpha_j", "Expected stable Symbol ID and LaTeX.")
  assert(symbolIds.length === 0, "Expected only legacy Symbol rows, not formula text, to become symbols in G01.")

  const serialized = serializeArchitectureProjectV2(projectA)
  const parsed = parseArchitectureProjectV2(JSON.parse(serialized))
  assert(JSON.stringify(parsed) === JSON.stringify(projectA), "Expected architecture serialize -> deserialize round-trip.")

  const index = createArchitectureGraphIndex(projectA)
  const mainOutgoing = getOutgoingRelations(index, "entity:legacy:block-main-model")
  const mainIncoming = getIncomingRelations(index, "entity:legacy:block-main-model")
  assert(mainOutgoing.some((relation) => relation.type === "unresolved" && relation.unresolved), "Expected visual edge to remain unresolved typed relation.")
  assert(mainIncoming.some((relation) => relation.type === "contains"), "Expected group containment relation in incoming index.")
  assert(traceEntityIds(index, "entity:legacy:block-motivation", "downstream", 1).has("entity:legacy:block-main-model"), "Expected downstream trace through adjacency index.")
  assert(traceEntityIds(index, "entity:legacy:block-main-model", "upstream", 1).has("entity:legacy:block-motivation"), "Expected upstream trace through adjacency index.")

  const projected = selectProjectedEntities(projectA, "view:legacy-canvas")
  assert(projected.length === legacyV1FreezeMap.nodes.length, "Expected legacy view to project all migrated nodes.")
  assert(selectEntityViews(projectA, "entity:legacy:block-symbols").length === 1, "Expected same entity lookup across views to be selector-based.")
  assert(selectEntitySymbols(projectA, "entity:legacy:block-symbols").length === 3, "Expected selector to return entity symbols.")

  const unknownMap = clone(legacyV1FreezeMap)
  unknownMap.nodes[1].data.unrecognizedLegacyField = { kept: true }
  const migratedUnknown = migrateV1MapToArchitectureProjectV2(unknownMap)
  assert(migratedUnknown.legacy.payload.nodes[1].data.unrecognizedLegacyField.kept, "Expected unknown legacy fields to remain in preserved payload.")

  if (!process.exitCode) console.log("Validated Asteria 2.0 alpha.1 architecture kernel and v1 migration.")
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await vite.close()
  process.exit(process.exitCode ?? 0)
}
