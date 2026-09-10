import fs from "node:fs/promises"
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

function relationByEndpoints(project, sourceId, targetId) {
  return Object.values(project.relations).find((relation) => relation.sourceId === sourceId && relation.targetId === targetId)
}

function assertLayoutMatchesRelations(project, viewId, buildProjectionLayout, selectProjectedRelations) {
  const layout = buildProjectionLayout(project, viewId)
  const expected = selectProjectedRelations(project, viewId).map((relation) => relation.id).sort()
  const actual = layout.edges.map((edge) => edge.relation.id).sort()
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${viewId} rendered edge IDs must match projected typed relations.`)
  assert(layout.nodes.every((node) => !node.projection.id.includes(":fallback:")), `${viewId} rendered nodes must come from ArchitectureView.projections.`)
}

const vite = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "silent",
})

try {
  const [{ canonicalTraceProjects }, { catTraceMultiViewProject, multiViewIds }, { buildProjectionLayout, selectProjectedRelations }, { traceForSymbol }] = await Promise.all([
    vite.ssrLoadModule("/src/architecture/fixtures/canonicalTraceFixtures.ts"),
    vite.ssrLoadModule("/src/architecture/fixtures/multiViewTraceProject.ts"),
    vite.ssrLoadModule("/src/architecture/viewProjection.ts"),
    vite.ssrLoadModule("/src/architecture/trace.ts"),
  ])

  const workspaceSource = await fs.readFile("src/components/ArchitectureWorkspace.tsx", "utf8")
  assert(!workspaceSource.includes("stageSymbols"), "ArchitectureWorkspace must not keep component-local stageSymbols.")
  assert(!workspaceSource.includes("methodPositions"), "ArchitectureWorkspace must not keep component-local methodPositions.")
  assert(!workspaceSource.includes("evidencePositions"), "ArchitectureWorkspace must not keep component-local evidencePositions.")
  assert(!workspaceSource.includes("catTraceFrozenV2Project"), "ArchitectureWorkspace must not fix the central stage to CAT-TRACE.")

  const original = canonicalTraceProjects["original-trace"]
  const cat = canonicalTraceProjects["cat-trace-frozen-v2"]
  const originalLayout = buildProjectionLayout(original, "view:architecture")
  const catLayout = buildProjectionLayout(cat, "view:architecture")
  const lineageLayout = buildProjectionLayout(catTraceMultiViewProject, multiViewIds.lineage)
  const evidenceLayout = buildProjectionLayout(catTraceMultiViewProject, multiViewIds.evidence)

  assert(originalLayout.nodes.some((node) => node.entityId === "entity:original-trace:y_ij"), "Original TRACE central projection must include y_ij.")
  assert(originalLayout.nodes.some((node) => node.entityId === "entity:original-trace:beta_j"), "Original TRACE central projection must include beta_j.")
  assert(!originalLayout.nodes.some((node) => node.entityId.includes("cat-trace-frozen-v2")), "Original TRACE central projection must not include CAT-TRACE entities.")
  assert(catLayout.nodes.some((node) => node.entityId === "entity:cat-trace-frozen-v2:betaU_gh"), "CAT-TRACE central projection must include beta^U_gh.")
  assert(catLayout.nodes.some((node) => node.entityId === "entity:cat-trace-frozen-v2:p_g"), "CAT-TRACE central projection must include p_g.")
  assert(!catLayout.nodes.some((node) => node.entityId.includes("original-trace")), "CAT-TRACE central projection must not include Original TRACE entities.")

  assertLayoutMatchesRelations(original, "view:architecture", buildProjectionLayout, selectProjectedRelations)
  assertLayoutMatchesRelations(cat, "view:architecture", buildProjectionLayout, selectProjectedRelations)
  assertLayoutMatchesRelations(catTraceMultiViewProject, multiViewIds.lineage, buildProjectionLayout, selectProjectedRelations)
  assertLayoutMatchesRelations(catTraceMultiViewProject, multiViewIds.evidence, buildProjectionLayout, selectProjectedRelations)

  const betaTrace = traceForSymbol(cat, "symbol:cat-trace-frozen-v2:betaU_gh", { mode: "direct", direction: "upstream", maxDepth: 1 })
  for (const [sourceId, targetId] of [
    ["entity:cat-trace-frozen-v2:nu", "entity:cat-trace-frozen-v2:betaU_gh"],
    ["entity:cat-trace-frozen-v2:a_g", "entity:cat-trace-frozen-v2:betaU_gh"],
    ["entity:cat-trace-frozen-v2:vU_gh", "entity:cat-trace-frozen-v2:betaU_gh"],
  ]) {
    const relation = relationByEndpoints(cat, sourceId, targetId)
    assert(relation && betaTrace.relationIds.has(relation.id), `beta^U_gh direct upstream trace must include ${sourceId} -> ${targetId}.`)
  }

  const betaDownstream = traceForSymbol(cat, "symbol:cat-trace-frozen-v2:betaU_gh", { mode: "recursive", direction: "downstream", maxDepth: 3 })
  assert(betaDownstream.entityIds.has("entity:cat-trace-frozen-v2:zU_igh"), "beta^U_gh downstream trace must reach z^U_igh.")
  assert(betaDownstream.entityIds.has("entity:cat-trace-frozen-v2:yU_igh"), "beta^U_gh recursive downstream trace must reach open-tail occurrence.")
  assert(betaDownstream.entityIds.has("entity:cat-trace-frozen-v2:richness_targets"), "beta^U_gh recursive downstream trace must reach richness/discovery targets.")

  const pTrace = traceForSymbol(cat, "symbol:cat-trace-frozen-v2:p_g", { mode: "recursive", direction: "both", maxDepth: 3 })
  assert(pTrace.entityIds.has("entity:cat-trace-frozen-v2:zero_slots"), "p_g trace must include zero-slot bookkeeping.")
  assert(pTrace.entityIds.has("entity:cat-trace-frozen-v2:alphaU_gh"), "p_g trace must include open-tail intercept calibration.")

  for (const relationId of ["relation:lineage:trace-cat", "relation:lineage:trace-preserve", "relation:lineage:hmsc-cat", "relation:lineage:bigmvp-cat", "relation:lineage:mgp-cat"]) {
    assert(lineageLayout.edges.some((edge) => edge.relation.id === relationId), `Lineage central graph must render ${relationId}.`)
  }
  for (const relationId of ["relation:evidence:proof-tail", "relation:evidence:fixture-response", "relation:evidence:stress-zero", "relation:evidence:finland-pending", "relation:evidence:realdata-gap-tail"]) {
    assert(evidenceLayout.edges.some((edge) => edge.relation.id === relationId), `Evidence central graph must render ${relationId}.`)
  }

  const mutated = clone(cat)
  const betaProjection = Object.values(mutated.views["view:architecture"].projections).find((projection) => projection.entityId === "entity:cat-trace-frozen-v2:betaU_gh")
  assert(Boolean(betaProjection), "beta^U_gh projection must exist before mutation.")
  const beforeLeft = catLayout.nodes.find((node) => node.entityId === "entity:cat-trace-frozen-v2:betaU_gh")?.leftPercent
  betaProjection.position.x += 420
  const afterLeft = buildProjectionLayout(mutated, "view:architecture").nodes.find((node) => node.entityId === "entity:cat-trace-frozen-v2:betaU_gh")?.leftPercent
  assert(beforeLeft !== afterLeft, "Changing ArchitectureView.projections position must change rendered layout coordinates.")

  if (!process.exitCode) {
    console.log(
      JSON.stringify(
        {
          status: "validated",
          originalNodes: originalLayout.nodes.length,
          originalRelations: originalLayout.edges.length,
          catNodes: catLayout.nodes.length,
          catRelations: catLayout.edges.length,
          lineageRelations: lineageLayout.edges.length,
          evidenceRelations: evidenceLayout.edges.length,
          projectionMutationChangedLayout: beforeLeft !== afterLeft,
          betaDirectRelationIds: [...betaTrace.relationIds].sort(),
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
