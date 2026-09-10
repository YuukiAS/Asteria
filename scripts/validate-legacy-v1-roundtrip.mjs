import { createServer } from "vite"

function fail(message) {
  console.error(message)
  process.exitCode = 1
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) fail(`${message} Expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}.`)
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function byId(items) {
  return new Map(items.map((item) => [item.id, item]))
}

const vite = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "silent",
})

try {
  const [{ normalizeExportedMap }, { legacyV1FreezeMap }] = await Promise.all([
    vite.ssrLoadModule("/src/lib/exportImport.ts"),
    vite.ssrLoadModule("/src/fixtures/legacyV1FreezeMap.ts"),
  ])

  const first = normalizeExportedMap(clone(legacyV1FreezeMap))
  const second = normalizeExportedMap(JSON.parse(JSON.stringify(first)))
  const nodes = byId(second.nodes)
  const edges = byId(second.edges)
  const main = nodes.get("block-main-model")
  const symbols = nodes.get("block-symbols")
  const frame = nodes.get("group-core")
  const relation = edges.get("edge-model-symbols")

  assertEqual(second.version, 1, "Expected legacy schema version to stay v1.")
  assertEqual(second.title, "Asteria 1.x Freeze Fixture", "Expected map title to round-trip.")
  assertEqual(second.modelVersions.length, 3, "Expected all model versions to round-trip.")
  assertEqual(second.activeVersionId, "cat-trace", "Expected active version to round-trip.")
  assertEqual(second.displayModeOverride, "block", "Expected display mode override to round-trip.")
  assertEqual(second.viewport?.zoom, 0.74, "Expected viewport zoom to round-trip.")
  assertEqual(second.storyOutline.length, 2, "Expected Story Outline rows to round-trip.")
  assertEqual(second.storyDeckSettings?.selectedVersionId, "cat-trace", "Expected Story selected version to round-trip.")

  assert(frame?.type === "group", "Expected group/frame node to survive.")
  assertEqual(frame?.style?.width, 980, "Expected group width to round-trip.")
  assertEqual(frame?.data?.opacity, 0.22, "Expected group opacity to round-trip.")

  assert(main?.type === "block", "Expected main model block to survive.")
  assertEqual(main?.parentId, "group-core", "Expected block parent/frame relation to round-trip.")
  assertEqual(main?.data?.title, "Main Model", "Expected main model title to round-trip.")
  assertEqual(main?.data?.nodeType, "model", "Expected block type to round-trip.")
  assertEqual(main?.data?.width, 640, "Expected block width to round-trip.")
  assertEqual(main?.data?.displayMode, "full", "Expected block display mode to round-trip.")
  assertEqual(main?.data?.activeVariantKey, "cat-trace", "Expected active variant key to round-trip.")
  assert(Boolean(main?.data?.variants?.trace), "Expected TRACE variant to survive.")
  assert(Boolean(main?.data?.variants?.["cat-trace"]), "Expected CAT-TRACE variant to survive.")
  assert(JSON.stringify(main?.data?.contentJson).includes("blockMath"), "Expected display math JSON to survive.")
  assert(JSON.stringify(main?.data?.variants?.trace?.contentJson).includes("inlineMath"), "Expected inline math variant JSON to survive.")

  assertEqual(symbols?.data?.nodeType, "symbol", "Expected Symbol block type to round-trip.")
  assertEqual(symbols?.data?.variants?.default?.symbolEntries?.length, 3, "Expected Symbol entries to round-trip.")
  assertEqual(symbols?.data?.variants?.default?.symbolEntries?.[0]?.latex, "\\alpha_j", "Expected Symbol LaTeX to round-trip.")

  assert(relation, "Expected visual edge to survive.")
  assertEqual(relation?.data?.label, "defines notation", "Expected edge label to round-trip.")
  assertEqual(relation?.data?.lineStyle, "dashed", "Expected edge line style to round-trip.")
  assertEqual(relation?.data?.pathType, "smoothstep", "Expected edge path type to round-trip.")
  assertEqual(relation?.data?.arrow, "forward", "Expected edge arrow to round-trip.")
  assertEqual(relation?.data?.strokeWidth, 2, "Expected edge stroke width to round-trip.")
  assert(Array.isArray(relation?.data?.visibility) && relation.data.visibility.includes("cat-trace"), "Expected edge version visibility to round-trip.")

  if (!process.exitCode) console.log("Validated Asteria 1.x legacy fixture round-trip.")
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await vite.close()
  process.exit(process.exitCode ?? 0)
}
