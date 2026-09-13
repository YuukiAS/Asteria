import fs from "node:fs/promises"
import path from "node:path"
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

async function exists(file) {
  try {
    await fs.access(file)
    return true
  } catch {
    return false
  }
}

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const resolved = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await listFiles(resolved)))
    else files.push(resolved)
  }
  return files
}

async function readActiveUiSource() {
  const dirs = ["src/app", "src/components", "src/architecture"]
  const files = []
  for (const dir of dirs) files.push(...(await listFiles(dir)))
  const source = []
  for (const file of files.filter((item) => /\.(tsx?|css)$/.test(item))) {
    source.push(`\n/* ${file} */\n${await read(file)}`)
  }
  return source.join("\n")
}

function relationByEndpoints(project, sourceId, targetId) {
  return Object.values(project.relations).find((relation) => relation.sourceId === sourceId && relation.targetId === targetId)
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
  const panelSource = await read("src/components/ArchitectureReferencePanel.tsx")
  const sessionSource = await read("src/architecture/session.tsx")
  const stylesSource = await read("src/styles/index.css")
  const activeUiSource = await readActiveUiSource()

  assert(packageJson.version === "2.0.0-rc.7", "package.json must declare the current RC version.")
  assert(appSource.includes('const appVersion = "2.0.0-rc.7"'), "App shell must display the current RC version.")
  assert(appSource.includes("topbar-model-selector"), "A formal model selector must be in the early topbar keyboard order.")
  assert(appSource.includes("Skip to canvas") && appSource.includes("Skip to inspector"), "Keyboard skip paths must be present.")
  assert(appSource.includes('data-testid="right-panel-title"') && appSource.includes("{viewLabel(activeViewId)}"), "Right panel title must derive from active view state.")

  assert(await exists("src/components/RenderedMath.tsx"), "RenderedMath component must exist.")
  assert(workspaceSource.includes("<RenderedMath") && panelSource.includes("<RenderedMath"), "Graph and inspector/search surfaces must use rendered math.")
  assert(!workspaceSource.includes("<span>{isArchitecture ? symbolLabel(project, entity) : entity.label}</span>"), "Architecture graph nodes must not render raw latex strings.")
  assert(!panelSource.includes("<span>{symbol.latex}</span>"), "Symbol trace nodes must not render raw latex strings.")
  for (const raw of ["\\\\mathcal", "\\\\Sigma", "\\\\beta", "\\\\alpha"]) {
    assert(!workspaceSource.includes(raw + "}</span>") && !panelSource.includes(raw + "}</span>"), `Visible math surface must not expose raw command ${raw}.`)
  }

  assert(sessionSource.includes("resetArchitectureView"), "Clear must call a single resetArchitectureView path.")
  for (const required of ['setTraceModeState("direct")', 'setTraceDirectionState("both")', "setTraceDepthState(2)", 'setFocusedLayer("all")', 'setSearchQuery("")', "clearTrace()"]) {
    assert(sessionSource.includes(required), `Reset/restore semantics must include ${required}.`)
  }
  assert(!panelSource.includes("Object.values(project.symbols)[0]"), "Clear must not jump to the first arbitrary symbol.")
  assert(panelSource.includes("searchScope === \"all\" ? catTraceMultiViewProject : project"), "All-graph search must search the multi-view graph.")
  assert(panelSource.includes("architecture-search-empty"), "Search must expose a no-result empty state.")
  assert(panelSource.includes("openEntityInView(targetView, entity.id"), "Search result clicks must navigate the active view/entity together.")

  for (const forbidden of ["ArchitectureView.projections", "semantic diff facts", "Choose a starting version", "Use shared version", "New from scratch", ">RC<"]) {
    assert(!activeUiSource.includes(forbidden), `Active 2.0 UI source must not expose ${forbidden}.`)
  }

  for (const required of ["Meaning", "Why it matters", "Canonical definition", "Advanced metadata", "Advanced / Export & validation", "Added", "Changed", "Preserved"]) {
    assert(panelSource.includes(required), `Inspector/diff hierarchy must include ${required}.`)
  }
  assert(stylesSource.includes("[data-theme=\"light\"] .architecture-map-node-muted") && stylesSource.includes("[data-theme=\"light\"] .architecture-map-edge-muted") && stylesSource.includes("architecture-map-edge[data-trace-role=\"upstream\"]"), "Light theme muted and trace role styling must be explicit.")
  assert(stylesSource.includes("@media (max-width: 1400px)") && stylesSource.includes("grid-template-columns: 148px minmax(0, 1fr)"), "1366 responsive breakpoint must protect canvas space.")

  const [{ canonicalTraceProjects }, { catTraceMultiViewProject, multiViewIds, searchCanonicalEntities }, { traceForSymbol }, { buildProjectionLayout }, { migrateV1MapToArchitectureProjectV2 }, { legacyV1FreezeMap }] = await Promise.all([
    vite.ssrLoadModule("/src/architecture/fixtures/canonicalTraceFixtures.ts"),
    vite.ssrLoadModule("/src/architecture/fixtures/multiViewTraceProject.ts"),
    vite.ssrLoadModule("/src/architecture/trace.ts"),
    vite.ssrLoadModule("/src/architecture/viewProjection.ts"),
    vite.ssrLoadModule("/src/architecture/migration.ts"),
    vite.ssrLoadModule("/src/fixtures/legacyV1FreezeMap.ts"),
  ])

  const original = canonicalTraceProjects["original-trace"]
  const cat = canonicalTraceProjects["cat-trace-frozen-v2"]
  const beta = cat.entities["entity:cat-trace-frozen-v2:betaU_gh"]
  const gammaG = cat.entities["entity:cat-trace-frozen-v2:gamma_g"]
  const pG = cat.entities["entity:cat-trace-frozen-v2:p_g"]
  const sigmaW = cat.entities["entity:cat-trace-frozen-v2:Sigma_W"]
  assert(beta.definition === "beta^U_gh = nu + a_g + v^U_gh", "CAT-TRACE beta^U_gh canonical formula must be unchanged.")
  assert(gammaG.definition === "gamma_g = gamma_0*pi_g", "CAT-TRACE gamma_g canonical formula must be unchanged.")
  assert(pG.role === "fixed computational setting" && pG.constraints?.includes("not true unknown species count") && pG.description?.includes("Fixed computational truncation"), "p_g must remain a fixed computational truncation, not unknown species count.")
  assert(sigmaW.constraints?.some((item) => item.includes("finite working set")), "Sigma_W finite-working-set constraint must remain visible.")

  for (const key of ["y_ij", "z_ij", "alpha_j", "beta_j", "nu", "Psi"]) {
    assert(Object.values(original.symbols).some((symbol) => symbol.id.endsWith(`:${key}`)), `Original TRACE must retain ${key}.`)
  }
  for (const key of ["Y_raw", "mathcal_K", "K_n", "mathcal_U", "mathcal_G", "mathcal_W", "betaU_gh", "gamma_g", "gamma0", "pi_g", "p_g", "p_g_star", "Sigma_W"]) {
    assert(Object.values(cat.symbols).some((symbol) => symbol.id.endsWith(`:${key}`)), `CAT-TRACE must retain ${key}.`)
  }

  const catTrace = traceForSymbol(cat, "symbol:cat-trace-frozen-v2:betaU_gh", { mode: "recursive", direction: "both", maxDepth: 2 })
  assert(catTrace.relationIds.has("relation:cat-trace-frozen-v2:11:nu:betaU_gh"), "beta^U_gh trace must retain upstream nu relation.")
  assert(catTrace.relationIds.has("relation:cat-trace-frozen-v2:9:betaU_gh:zU_igh"), "beta^U_gh trace must retain downstream latent-score relation.")
  assert(searchCanonicalEntities(catTraceMultiViewProject, "Finland").some((entity) => entity.id === "entity:evidence:data:finland"), "All-graph search must find Finland fungi.")
  assert(searchCanonicalEntities(catTraceMultiViewProject, "HMSC").some((entity) => entity.id === "entity:lineage:hmsc"), "All-graph search must find HMSC framework.")
  assert(searchCanonicalEntities(catTraceMultiViewProject, "zzzz-no-result").length === 0, "Search no-result path must remain reachable.")

  const originalLayout = buildProjectionLayout(original, multiViewIds.architecture)
  const catLayout = buildProjectionLayout(cat, multiViewIds.architecture)
  const lineageLayout = buildProjectionLayout(catTraceMultiViewProject, multiViewIds.lineage)
  const evidenceLayout = buildProjectionLayout(catTraceMultiViewProject, multiViewIds.evidence)
  assert(originalLayout.nodes.some((node) => node.entityId === "entity:original-trace:y_ij"), "Original TRACE projection must include y_ij.")
  assert(catLayout.nodes.some((node) => node.entityId === "entity:cat-trace-frozen-v2:betaU_gh"), "CAT-TRACE projection must include beta^U_gh.")
  assert(lineageLayout.edges.length === 5, "Lineage must retain relation-backed edges.")
  assert(evidenceLayout.edges.length === 8, "Evidence must retain relation-backed edges.")
  assert(relationByEndpoints(cat, "entity:cat-trace-frozen-v2:nu", "entity:cat-trace-frozen-v2:betaU_gh"), "CAT-TRACE must retain beta^U_gh upstream relation from nu.")

  const migrated = migrateV1MapToArchitectureProjectV2(legacyV1FreezeMap)
  assert(migrated.legacy?.payload?.version === 1, "v1 -> v2 migration must retain legacy payload compatibility.")

  if (!process.exitCode) {
    console.log(
      JSON.stringify(
        {
          status: "validated",
          version: "2.0.0-rc.7",
          mathRendering: "RenderedMath",
          clearState: "atomic",
          search: "cross-view",
          responsiveViewport: "1366x768",
          legacyMigrationCompatibility: "preserved",
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
