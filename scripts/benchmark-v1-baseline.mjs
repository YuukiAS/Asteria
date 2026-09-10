import { readdir, stat } from "node:fs/promises"
import { performance } from "node:perf_hooks"
import { createServer } from "vite"

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function content(text) {
  return {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  }
}

function block(id, index, versionIds, at) {
  return {
    id,
    type: "block",
    position: { x: (index % 24) * 260, y: Math.floor(index / 24) * 180 },
    data: {
      title: `Baseline block ${index}`,
      contentJson: content(`Baseline content ${index}`),
      contentHtml: `<p>Baseline content ${index}</p>`,
      variants: Object.fromEntries(
        versionIds.map((versionId, offset) => [
          versionId,
          {
            title: `Baseline ${versionId} ${index}`,
            contentJson: content(`Variant ${versionId} content ${index}`),
            contentHtml: `<p>Variant ${versionId} content ${index}</p>`,
            updatedAt: at,
          },
        ]),
      ),
      activeVariantKey: versionIds[index % versionIds.length],
      backgroundColor: "#ffffff",
      textColor: "#111827",
      borderColor: "#dbeafe",
      width: 480 + (index % 3) * 80,
      height: 260 + (index % 2) * 60,
      displayMode: index % 5 === 0 ? "compact" : "full",
      nodeType: index % 7 === 0 ? "symbol" : "generic",
      showStatus: index % 4 === 0,
      status: index % 4 === 0 ? "done" : "undo",
      emojis: [],
      createdAt: at,
      updatedAt: at,
    },
  }
}

function generatedMap(nodeCount, edgeCount) {
  const at = "2026-09-10T00:00:00.000Z"
  const versionIds = ["trace", "cat-trace", "marked-trace"]
  const nodes = Array.from({ length: nodeCount }, (_, index) => block(`block-${index}`, index, versionIds, at))
  const edges = Array.from({ length: edgeCount }, (_, index) => ({
    id: `edge-${index}`,
    source: `block-${index % nodeCount}`,
    target: `block-${(index * 7 + 11) % nodeCount}`,
    sourceHandle: "right",
    targetHandle: "left",
    data: {
      label: `edge ${index}`,
      color: index % 2 ? "#4f46e5" : "#059669",
      lineStyle: index % 3 === 0 ? "dashed" : "solid",
      pathType: "smoothstep",
      arrow: "forward",
      strokeWidth: index % 4 === 0 ? 2 : 1.5,
      visibility: index % 5 === 0 ? ["cat-trace"] : "all",
      createdAt: at,
      updatedAt: at,
    },
  }))
  return {
    version: 1,
    title: `Generated ${nodeCount}/${edgeCount}`,
    modelVersions: versionIds.map((id, index) => ({ id, label: id, shortLabel: `V${index + 1}`, createdAt: at, updatedAt: at })),
    activeVersionId: "cat-trace",
    displayModeOverride: "block",
    storyOutline: [],
    nodes,
    edges,
    viewport: { x: 0, y: 0, zoom: 1 },
    updatedAt: at,
  }
}

function measure(label, fn, iterations = 5) {
  const times = []
  let last
  for (let index = 0; index < iterations; index += 1) {
    const start = performance.now()
    last = fn()
    times.push(performance.now() - start)
  }
  const averageMs = times.reduce((sum, value) => sum + value, 0) / times.length
  return { label, averageMs: Number(averageMs.toFixed(3)), last }
}

async function bundleSize() {
  try {
    const assetsDir = new URL("../dist/assets/", import.meta.url)
    const entries = await readdir(assetsDir)
    let totalBytes = 0
    for (const entry of entries) {
      const info = await stat(new URL(entry, assetsDir))
      if (info.isFile()) totalBytes += info.size
    }
    return totalBytes
  } catch {
    return null
  }
}

const vite = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "silent",
})

try {
  const [{ normalizeExportedMap, applyEdgePresentation }, { resolveBlockVersionState }] = await Promise.all([
    vite.ssrLoadModule("/src/lib/exportImport.ts"),
    vite.ssrLoadModule("/src/lib/blockVersionState.ts"),
  ])

  const scenarios = [
    { label: "small", nodes: 24, edges: 40 },
    { label: "medium", nodes: 160, edges: 360 },
    { label: "large", nodes: 720, edges: 1800 },
  ]

  console.log("Asteria 1.x baseline benchmark")
  for (const scenario of scenarios) {
    const raw = generatedMap(scenario.nodes, scenario.edges)
    const normalized = measure(`${scenario.label}: normalizeExportedMap`, () => normalizeExportedMap(clone(raw))).last
    const normalizeResult = measure(`${scenario.label}: normalizeExportedMap`, () => normalizeExportedMap(clone(raw)))
    const projectionResult = measure(`${scenario.label}: visible projection`, () => {
      const visibleNodes = normalized.nodes.filter(
        (node) => normalized.activeVersionId === "all" || node.type !== "block" || !resolveBlockVersionState(node.data, normalized.activeVersionId, normalized.modelVersions).isHidden,
      )
      const visibleNodeIds = new Set(visibleNodes.map((node) => node.id))
      const visibleEdges = normalized.edges
        .filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target))
        .filter((edge) => edge.data.visibility === "all" || edge.data.visibility.includes(normalized.activeVersionId))
        .map(applyEdgePresentation)
      return { visibleNodeCount: visibleNodes.length, visibleEdgeCount: visibleEdges.length }
    })
    const historyResult = measure(`${scenario.label}: history snapshot signature`, () => {
      const snapshot = { nodes: clone(normalized.nodes), edges: clone(normalized.edges) }
      return JSON.stringify(snapshot).length
    })
    console.log(
      JSON.stringify({
        scenario,
        normalizeAverageMs: normalizeResult.averageMs,
        projectionAverageMs: projectionResult.averageMs,
        historySignatureAverageMs: historyResult.averageMs,
        visible: projectionResult.last,
        historySignatureBytes: historyResult.last,
      }),
    )
  }
  console.log(JSON.stringify({ distAssetBytes: await bundleSize() }))
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await vite.close()
  process.exit(process.exitCode ?? 0)
}
