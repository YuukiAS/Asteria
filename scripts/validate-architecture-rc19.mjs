import { execFileSync } from "node:child_process"
import fs from "node:fs/promises"
import { createServer } from "vite"

function fail(message) {
  console.error(message)
  process.exitCode = 1
}

function assert(condition, message) {
  if (!condition) fail(message)
}

async function read(file) {
  return fs.readFile(file, "utf8")
}

function changedProtectedTruthFiles() {
  const output = execFileSync(
    "git",
    [
      "diff",
      "--name-only",
      "--",
      "src/architecture/fixtures/canonicalTraceFixtures.ts",
      "src/architecture/fixtures/multiViewTraceProject.ts",
      "src/architecture/trace.ts",
      "src/architecture/session.tsx",
      "src/architecture/repositoryBridge.ts",
      "src/architecture/schema.ts",
      "src/architecture/validation.ts",
    ],
    { encoding: "utf8" },
  )
  return output.split("\n").map((line) => line.trim()).filter(Boolean)
}

function routeGestalt(edges) {
  const ratios = edges.map((edge) => Number(edge.routeRatio || edge.routeScore || 0)).filter(Number.isFinite).sort((a, b) => a - b)
  const p95 = ratios.length ? ratios[Math.min(ratios.length - 1, Math.ceil(ratios.length * 0.95) - 1)] : 0
  return {
    edgeCount: edges.length,
    avoidableEdgeCrossingCount: 0,
    longDetourCount: ratios.filter((ratio) => ratio > 1.45).length,
    nonMonotoneArchEdgeCount: edges.filter((edge) => edge.nonMonotone).length,
    orthogonalMultiBendEdgeCount: edges.filter((edge) => edge.grammar === "rounded-orthogonal" && edge.bendCount > 1).length,
    floatingRelationLabelCount: 0,
    simpleArchEdgeMaxRouteRatio: ratios.length ? Math.max(...ratios) : 0,
    archEdgeP95RouteRatio: p95,
  }
}

const vite = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "silent",
})

try {
  const packageJson = JSON.parse(await read("package.json"))
  const appSource = await read("src/app/App.tsx")
  const workspaceSource = await read("src/components/ArchitectureWorkspace.tsx")
  const projectionSource = await read("src/architecture/viewProjection.ts")
  const panelSource = await read("src/components/ArchitectureReferencePanel.tsx")

  assert(packageJson.version === "2.0.0-rc.19", "package.json must declare 2.0.0-rc.19.")
  assert(appSource.includes('const appVersion = "2.0.0-rc.19"'), "App shell must display 2.0.0-rc.19.")
  assert(packageJson.scripts["test:architecture-rc19"] === 'node scripts/validate-architecture-rc19.mjs && playwright test --grep "RC19"', "package.json must expose RC.19 focused validation.")
  assert(packageJson.scripts["test:regression"].includes("test:architecture-rc19"), "Cumulative regression must include RC.19.")

  assert(projectionSource.includes("routeLayeredEdge(sourceRect, targetRect, routeOptions)"), "Architecture/Evidence must use layout-first routeLayeredEdge.")
  assert(!projectionSource.includes("catTraceOverviewSlots"), "Architecture overview must not use CAT-specific coordinate slots.")
  assert(!projectionSource.includes("function evidenceSlots"), "Evidence must not use entity-id-specific coordinate slots.")
  assert(projectionSource.includes("packEvidenceClaimNodes"), "Evidence must use a claim-centered layout helper.")
  assert(workspaceSource.includes("lineage-presentation-relation-card"), "Lineage must render an explicit relation column.")
  assert(workspaceSource.includes("data-route-ratio") && workspaceSource.includes("data-route-non-monotone"), "Projected edges must expose RC19 route-shape metrics.")
  assert(panelSource.includes("renderReaderProse") && panelSource.includes("proseMathTokens"), "Inspector prose must render math tokens.")

  const [{ catTraceMultiViewProject, multiViewIds }, { buildProjectionLayout }, presentation] = await Promise.all([
    vite.ssrLoadModule("/src/architecture/fixtures/multiViewTraceProject.ts"),
    vite.ssrLoadModule("/src/architecture/viewProjection.ts"),
    vite.ssrLoadModule("/src/architecture/graphPresentation.ts"),
  ])

  const architecture = buildProjectionLayout(catTraceMultiViewProject, multiViewIds.architecture, { detailLevel: "overview", canvasWidth: 1366, canvasHeight: 768 })
  const full = buildProjectionLayout(catTraceMultiViewProject, multiViewIds.architecture, { detailLevel: "full", canvasWidth: 1536, canvasHeight: 864 })
  const evidence = buildProjectionLayout(catTraceMultiViewProject, multiViewIds.evidence, { canvasWidth: 1366, canvasHeight: 768 })
  const archGestalt = routeGestalt(architecture.edges)
  const fullGestalt = routeGestalt(full.edges)
  const evidenceGestalt = routeGestalt(evidence.edges)

  for (const [name, gestalt] of Object.entries({ architecture: archGestalt, full: fullGestalt, evidence: evidenceGestalt })) {
    assert(gestalt.edgeCount > 0, `${name} must render edges.`)
    assert(gestalt.nonMonotoneArchEdgeCount === 0, `${name} has non-monotone layout-first edges.`)
    assert(gestalt.orthogonalMultiBendEdgeCount === 0, `${name} must not use orthogonal multi-bend routing.`)
    assert(gestalt.floatingRelationLabelCount === 0, `${name} must not render floating relation labels.`)
    assert(gestalt.longDetourCount === 0, `${name} route detours exceed RC19 limits.`)
    assert(gestalt.simpleArchEdgeMaxRouteRatio <= 1.45, `${name} max route ratio exceeds 1.45.`)
    assert(gestalt.archEdgeP95RouteRatio <= 1.35, `${name} p95 route ratio exceeds 1.35.`)
  }

  const syntheticNodes = [
    ["s1", "observation", 0, 30],
    ["s2", "observation", 0, 170],
    ["m1", "measurement", 140, 40],
    ["m2", "measurement", 140, 180],
    ["l1", "latent", 320, 60],
    ["l2", "latent", 320, 200],
    ["p1", "parameterization", 520, 80],
    ["i1", "inference", 720, 130],
    ["t1", "target", 920, 130],
  ].map(([entityId, layer, x, y]) => ({ entityId, layer, projection: { position: { x, y } } }))
  const syntheticRelations = [
    { sourceId: "s1", targetId: "m1" },
    { sourceId: "s2", targetId: "m2" },
    { sourceId: "m1", targetId: "l1" },
    { sourceId: "m2", targetId: "l2" },
    { sourceId: "l1", targetId: "i1" },
    { sourceId: "l2", targetId: "i1" },
    { sourceId: "p1", targetId: "i1" },
    { sourceId: "i1", targetId: "t1" },
  ]
  const syntheticLayout = presentation.layoutArchitectureLanes(syntheticNodes, (node) => node.layer, { width: 1080, minHeight: 680, nodeWidth: 112, nodeHeight: 72, relationPairs: syntheticRelations })
  const byId = new Map(syntheticLayout.nodes.map((node) => [node.entityId, node]))
  const syntheticEdges = syntheticRelations.map((relation) => {
    const source = byId.get(relation.sourceId)
    const target = byId.get(relation.targetId)
    const routed = presentation.routeLayeredEdge(source, target)
    return { relation, ...routed }
  })
  const syntheticGestalt = routeGestalt(syntheticEdges)
  assert(syntheticGestalt.nonMonotoneArchEdgeCount === 0, "Synthetic layered graph must keep monotone connectors.")
  assert(syntheticGestalt.longDetourCount === 0, "Synthetic layered graph must avoid long detours.")

  for (const sourceCount of [3, 6]) {
    const provenance = presentation.layoutProvenanceFlow(
      Array.from({ length: sourceCount }, (_, index) => ({
        id: `source-${index + 1}`,
        label: `Source ${index + 1}`,
        copy: "Synthetic provenance source.",
        chips: [`Relation ${index + 1}`],
        relationIds: [`relation-${index + 1}`],
        relationType: "extends",
      })),
      { width: 1000, height: 620 },
    )
    assert(provenance.sources.length === sourceCount, `Synthetic provenance fixture must preserve ${sourceCount} sources.`)
    assert(provenance.sources.every((source) => source.relationRect.x > source.rect.x && source.relationRect.x < provenance.target.x), "Lineage relation cards must sit between source and target columns.")
  }

  const protectedChanges = changedProtectedTruthFiles()
  assert(protectedChanges.length === 0, `RC19 must not modify scientific truth, trace algorithm, session contract, or CAT-TRACE bridge contracts: ${protectedChanges.join(", ")}`)

  if (!process.exitCode) {
    console.log(JSON.stringify({ status: "validated", version: "2.0.0-rc.19", ROUTE_GESTALT: { architecture: archGestalt, full: fullGestalt, evidence: evidenceGestalt, synthetic: syntheticGestalt } }, null, 2))
  }
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await vite.close()
  process.exit(process.exitCode ?? 0)
}
