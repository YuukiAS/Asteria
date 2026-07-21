import { readFile } from "node:fs/promises"
import { createServer } from "vite"
import { getSchema } from "@tiptap/core"

const sharedMapPath = new URL("../.runtime/asteria-server/shared-map.json", import.meta.url)
const queries = ["alpha", "beta", "gamma", "prior", "trace", "hmsc", "model", "result"]

function fail(message) {
  console.error(message)
  process.exitCode = 1
}

const vite = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "silent",
})

try {
  const [{ searchRenderedBlocks, getSearchResultNavigationTarget }, { createEditorExtensions }, { titleToHtml }, { renderSymbolMeaningHtml }] = await Promise.all([
    vite.ssrLoadModule("/src/lib/mapSearch.ts"),
    vite.ssrLoadModule("/src/editor/createEditorExtensions.ts"),
    vite.ssrLoadModule("/src/lib/titleMath.ts"),
    vite.ssrLoadModule("/src/lib/symbolEntries.ts"),
  ])
  const schema = getSchema(createEditorExtensions(""))
  const record = JSON.parse(await readFile(sharedMapPath, "utf8"))
  const map = record.map || record
  const nodes = Array.isArray(map.nodes) ? map.nodes : []
  const modelVersions = Array.isArray(map.modelVersions) ? map.modelVersions : []
  const activeVersionId = typeof map.activeVersionId === "string" ? map.activeVersionId : "all"
  let checkedResults = 0

  for (const node of nodes) {
    if (node.type !== "block") continue
    for (const [variantKey, variant] of Object.entries(node.data?.variants || {})) {
      if (variant?.contentJson) schema.nodeFromJSON(variant.contentJson)
      titleToHtml(String(variant?.title || node.data?.title || ""))
      checkedResults += variantKey ? 0 : 0
    }
  }

  for (const query of queries) {
    const results = searchRenderedBlocks(nodes, activeVersionId, modelVersions, query)
    if (!results.length) fail(`Expected search query "${query}" to return at least one result.`)
    for (const result of results) {
      checkedResults += 1
      const target = getSearchResultNavigationTarget(result, nodes, activeVersionId, modelVersions)
      if (!target) fail(`Search result "${query}" -> "${result.blockTitle}" has no safe navigation target.`)
    }
  }

  const selectedSamples = nodes
    .filter((node) => node.type === "block")
    .slice(0, 12)
    .map((node, index) => ({ ...node, selected: index % 2 === 0 }))
  const selectedNoiseResults = searchRenderedBlocks(selectedSamples, activeVersionId, modelVersions, "alpha")
  for (const result of selectedNoiseResults) {
    const target = getSearchResultNavigationTarget(result, selectedSamples, activeVersionId, modelVersions)
    if (!target) fail(`Selected-noise search result "${result.blockTitle}" has no safe navigation target.`)
  }

  const alphaResults = searchRenderedBlocks(nodes, activeVersionId, modelVersions, "alpha")
  const priorForAlpha = alphaResults.find((result) => result.blockTitle.toLowerCase().includes("prior for"))
  if (!priorForAlpha) fail('Expected "alpha" search to include "Prior for alpha".')
  else if (!getSearchResultNavigationTarget(priorForAlpha, nodes, activeVersionId, modelVersions)) {
    fail('"Prior for alpha" does not have a safe navigation target.')
  }

  const renderedMeaning = renderSymbolMeaningHtml("depends on $\\alpha$ <script>")
  if (!renderedMeaning.includes("katex")) fail("Expected Symbol meaning inline math to render with KaTeX.")
  if (renderedMeaning.includes("<script>")) fail("Expected Symbol meaning text to be HTML-escaped.")

  if (!process.exitCode) console.log(`Validated ${checkedResults} shared-map search click targets.`)
} finally {
  await vite.close()
}
