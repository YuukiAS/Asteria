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

function relationByEndpoints(project, sourceId, targetId) {
  return Object.values(project.relations).find((relation) => relation.sourceId === sourceId && relation.targetId === targetId)
}

function sameSet(left, right) {
  if (left.size !== right.size) return false
  for (const value of left) if (!right.has(value)) return false
  return true
}

const vite = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "silent",
})

try {
  const packageJson = JSON.parse(await read("package.json"))
  const appSource = await read("src/app/App.tsx")
  const sessionSource = await read("src/architecture/session.tsx")
  const workspaceSource = await read("src/components/ArchitectureWorkspace.tsx")
  const panelSource = await read("src/components/ArchitectureReferencePanel.tsx")
  const multiViewSource = await read("src/architecture/fixtures/multiViewTraceProject.ts")

  assert(packageJson.version === "2.0.0-rc.7", "package.json must declare 2.0.0-rc.7.")
  assert(appSource.includes('const appVersion = "2.0.0-rc.7"'), "App shell must display 2.0.0-rc.7.")
  assert(sessionSource.includes("traceEnabled") && sessionSource.includes("activeTraceSymbolId"), "Selection and active trace state must be decoupled.")
  assert(sessionSource.includes('setDetailLevelState("overview")'), "Clear/model/view changes must restore Overview detail.")
  assert(panelSource.includes("Show trace") && panelSource.includes("Trace off"), "Trace controls must expose explicit off/on affordance.")
  assert(panelSource.includes("Active trace is off. Selection only controls the inspector."), "Trace-off state must be researcher-visible.")
  assert(panelSource.indexOf("Semantic Diff") < panelSource.indexOf("Advanced / Export & validation"), "Semantic Diff must appear before advanced export/debug.")
  assert(panelSource.includes("Dataset Inspector") && panelSource.includes("researcherStatus"), "Inspector must derive object type and researcher-facing status.")
  assert(panelSource.includes("What is missing") && panelSource.includes("What would close this"), "Evidence gaps must use researcher-facing closure language.")
  assert(panelSource.includes("<RenderedFormulaText"), "Canonical definitions must use rendered formula presentation.")
  assert(workspaceSource.includes("data-detail-level") && workspaceSource.includes("data-trace-enabled"), "Workspace must expose detail and trace state for browser QA.")
  assert(workspaceSource.includes("trace.upstreamRelationIds") && workspaceSource.includes("trace.downstreamRelationIds"), "Trace edge roles must use root-relative relation sets.")
  assert(!multiViewSource.includes("Asteria schema-v2 fixtures"), "Researcher-facing Evidence fixture label must not expose schema-v2 internals.")

  for (const forbidden of ["Choose a starting version", "Use shared version", "New from scratch"]) {
    assert(!appSource.includes(forbidden) && !workspaceSource.includes(forbidden) && !panelSource.includes(forbidden), `Active 2.0 UI must not expose legacy startup string: ${forbidden}.`)
  }

  const [{ canonicalTraceProjects }, { catTraceMultiViewProject, multiViewIds, evidenceClosureWarnings }, { traceForSymbol }, { buildProjectionLayout }, { validateArchitectureProject }] = await Promise.all([
    vite.ssrLoadModule("/src/architecture/fixtures/canonicalTraceFixtures.ts"),
    vite.ssrLoadModule("/src/architecture/fixtures/multiViewTraceProject.ts"),
    vite.ssrLoadModule("/src/architecture/trace.ts"),
    vite.ssrLoadModule("/src/architecture/viewProjection.ts"),
    vite.ssrLoadModule("/src/architecture/validation.ts"),
  ])

  const cat = canonicalTraceProjects["cat-trace-frozen-v2"]
  const original = canonicalTraceProjects["original-trace"]
  const selectedBeta = "entity:cat-trace-frozen-v2:betaU_gh"
  const overview = buildProjectionLayout(cat, multiViewIds.architecture, { detailLevel: "overview", selectedEntityId: selectedBeta })
  const full = buildProjectionLayout(cat, multiViewIds.architecture, { detailLevel: "full", selectedEntityId: selectedBeta })
  const originalOverview = buildProjectionLayout(original, multiViewIds.architecture, { detailLevel: "overview" })
  const originalFull = buildProjectionLayout(original, multiViewIds.architecture, { detailLevel: "full" })

  assert(overview.nodes.length < full.nodes.length, "CAT-TRACE Overview must be a readable subset of the full canonical projection.")
  assert(overview.nodes.length <= 20, `CAT-TRACE Overview should stay readable; observed ${overview.nodes.length} nodes.`)
  assert(full.nodes.length === Object.keys(cat.entities).length, "Full model must preserve the full projected CAT-TRACE entity set.")
  assert(originalOverview.nodes.length === originalFull.nodes.length, "Original TRACE may use the same sparse Overview and Full projection.")
  for (const id of [selectedBeta, "entity:cat-trace-frozen-v2:mathcal_K", "entity:cat-trace-frozen-v2:mathcal_U", "entity:cat-trace-frozen-v2:gamma_g", "entity:cat-trace-frozen-v2:p_g", "entity:cat-trace-frozen-v2:Sigma_W"]) {
    assert(overview.projectedEntityIds.has(id), `Overview must expose core entity ${id}.`)
  }

  assert(relationByEndpoints(cat, "entity:cat-trace-frozen-v2:c_f", "entity:cat-trace-frozen-v2:mathcal_K"), "c(f) must retain catalogue match relation.")
  assert(relationByEndpoints(cat, "entity:cat-trace-frozen-v2:c_f", "entity:cat-trace-frozen-v2:mathcal_U")?.type === "matched_to", "c(f)=empty must map to mathcal U through canonical matched_to relation.")
  assert(!validateArchitectureProject(cat).some((warning) => warning.id.includes("mathcal_U") && warning.message.includes("orphan")), "mathcal_U must not be orphaned.")

  const expectedIndices = {
    alphaU_gh: ["g", "h"],
    betaU_gh: ["g", "h"],
    vU_gh: ["g", "h"],
    gamma_g: ["g"],
    pi_g: ["g"],
    p_g: ["g"],
    p_g_star: ["g"],
    alphaK_j: ["j"],
    betaK_j: ["j"],
    t_j: ["j"],
    bphy_j: ["j"],
    vK_j: ["j"],
  }
  for (const [key, indices] of Object.entries(expectedIndices)) {
    const symbol = cat.symbols[`symbol:cat-trace-frozen-v2:${key}`]
    assert(sameSet(new Set(symbol?.indices || []), new Set(indices)), `${key} must declare canonical indices ${indices.join(",")}.`)
  }

  const pUp = traceForSymbol(cat, "symbol:cat-trace-frozen-v2:p_g", { mode: "recursive", direction: "upstream", maxDepth: 3 })
  const pDown = traceForSymbol(cat, "symbol:cat-trace-frozen-v2:p_g", { mode: "recursive", direction: "downstream", maxDepth: 3 })
  const pBoth = traceForSymbol(cat, "symbol:cat-trace-frozen-v2:p_g", { mode: "recursive", direction: "both", maxDepth: 3 })
  assert(pUp.upstreamEntityIds.size === 0 && pUp.downstreamEntityIds.size === 0, "p_g has no canonical incoming dependency in the current graph.")
  assert(sameSet(pBoth.upstreamEntityIds, pUp.upstreamEntityIds), "Both upstream set must equal upstream-only set for the same root/depth.")
  assert(sameSet(pBoth.downstreamEntityIds, pDown.downstreamEntityIds), "Both downstream set must equal downstream-only set for the same root/depth.")
  assert(sameSet(pBoth.upstreamRelationIds, pUp.upstreamRelationIds), "Both upstream relation set must equal upstream-only relation set.")
  assert(sameSet(pBoth.downstreamRelationIds, pDown.downstreamRelationIds), "Both downstream relation set must equal downstream-only relation set.")
  assert(!pBoth.upstreamEntityIds.has("entity:cat-trace-frozen-v2:p_g") && !pBoth.downstreamEntityIds.has("entity:cat-trace-frozen-v2:p_g"), "Trace root must not be counted as upstream/downstream.")

  const closure = evidenceClosureWarnings(catTraceMultiViewProject).find((warning) => warning.claimId === "entity:evidence:claim:marked-discovery")
  assert(closure?.status === "pending", "Marked discovery theorem must remain researcher-facing Pending.")

  if (!process.exitCode) {
    console.log(
      JSON.stringify(
        {
          status: "validated",
          version: "2.0.0-rc.7",
          overviewNodes: overview.nodes.length,
          fullNodes: full.nodes.length,
          traceDirectionTruth: "root-relative",
          openTailRelation: "c_f->mathcal_U",
          evidencePending: closure?.status,
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
