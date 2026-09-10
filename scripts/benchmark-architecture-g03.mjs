import { createServer } from "vite"

const vite = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "silent",
})

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

try {
  const [{ createSyntheticArchitectureProject }, { createArchitectureGraphIndex }, { traceForEntity }, { projectLayerFocus }] = await Promise.all([
    vite.ssrLoadModule("/src/architecture/fixtures/syntheticArchitectureProject.ts"),
    vite.ssrLoadModule("/src/architecture/graphIndex.ts"),
    vite.ssrLoadModule("/src/architecture/trace.ts"),
    vite.ssrLoadModule("/src/architecture/projection.ts"),
  ])
  const project = createSyntheticArchitectureProject(2200, 6200)
  const indexRuns = []
  const traceRuns = []
  const layerRuns = []

  for (let run = 0; run < 20; run += 1) {
    let start = performance.now()
    createArchitectureGraphIndex(project)
    indexRuns.push(performance.now() - start)

    start = performance.now()
    traceForEntity(project, "entity:synthetic:150", { mode: "recursive", direction: "both", maxDepth: 4 })
    traceRuns.push(performance.now() - start)

    start = performance.now()
    projectLayerFocus(project, "view:synthetic", "parameterization")
    layerRuns.push(performance.now() - start)
  }

  console.log(JSON.stringify({ entityCount: Object.keys(project.entities).length, relationCount: Object.keys(project.relations).length }))
  console.log(JSON.stringify({ indexAverageMs: Number(average(indexRuns).toFixed(3)), traceAverageMs: Number(average(traceRuns).toFixed(3)), layerFocusAverageMs: Number(average(layerRuns).toFixed(3)) }))
} finally {
  await vite.close()
}
