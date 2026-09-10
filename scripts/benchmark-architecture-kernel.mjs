import { performance } from "node:perf_hooks"
import { createServer } from "vite"

function measure(label, fn, iterations = 8) {
  const times = []
  let last
  for (let index = 0; index < iterations; index += 1) {
    const start = performance.now()
    last = fn()
    times.push(performance.now() - start)
  }
  return {
    label,
    averageMs: Number((times.reduce((sum, value) => sum + value, 0) / times.length).toFixed(3)),
    last,
  }
}

const vite = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "silent",
})

try {
  const [{ createSyntheticArchitectureProject }, { parseArchitectureProjectV2, serializeArchitectureProjectV2 }, { createArchitectureGraphIndex, traceEntityIds }] = await Promise.all([
    vite.ssrLoadModule("/src/architecture/fixtures/syntheticArchitectureProject.ts"),
    vite.ssrLoadModule("/src/architecture/schema.ts"),
    vite.ssrLoadModule("/src/architecture/graphIndex.ts"),
  ])
  const project = createSyntheticArchitectureProject(2000, 5000)
  const serializeResult = measure("serialize 2k/5k project", () => serializeArchitectureProjectV2(project).length)
  const serialized = serializeArchitectureProjectV2(project)
  const parseResult = measure("parse 2k/5k project", () => parseArchitectureProjectV2(JSON.parse(serialized)))
  const indexResult = measure("build graph index 2k/5k", () => createArchitectureGraphIndex(project))
  const index = indexResult.last
  const traceResult = measure("trace depth 3", () => traceEntityIds(index, "entity:synthetic:17", "downstream", 3).size)
  console.log("Asteria 2.0 alpha.1 architecture kernel benchmark")
  console.log(JSON.stringify({ entityCount: 2000, relationCount: 5000, serializedBytes: serializeResult.last }))
  console.log(JSON.stringify({ serializeAverageMs: serializeResult.averageMs, parseAverageMs: parseResult.averageMs, indexAverageMs: indexResult.averageMs, traceDepth3AverageMs: traceResult.averageMs, traceDepth3EntityCount: traceResult.last }))
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await vite.close()
  process.exit(process.exitCode ?? 0)
}
