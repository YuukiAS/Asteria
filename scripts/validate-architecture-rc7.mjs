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

function changedProtectedArchitectureFiles() {
  const output = execFileSync("git", ["diff", "--name-only", "--", "src/architecture/fixtures", "src/architecture/trace.ts"], { encoding: "utf8" })
  return output.split("\n").map((line) => line.trim()).filter(Boolean)
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
  const workspaceSource = await read("src/components/ArchitectureWorkspace.tsx")
  const panelSource = await read("src/components/ArchitectureReferencePanel.tsx")
  const styleSource = await read("src/styles/index.css")

  assert(packageJson.version === "2.0.0-rc.7", "package.json must declare 2.0.0-rc.7.")
  assert(appSource.includes('const appVersion = "2.0.0-rc.7"'), "App shell must display 2.0.0-rc.7.")

  assert(appSource.indexOf('<nav className="asteria-skip-links"') < appSource.indexOf("<AsteriaV2TopBar"), "Skip links must be the first page-level tab stops before the topbar.")
  assert(appSource.includes('href="#asteria-canvas"') && appSource.includes('href="#asteria-inspector"'), "Skip links must target canvas and inspector anchors.")
  assert(styleSource.includes(".asteria-skip-links:focus-within a") && styleSource.includes(".asteria-skip-links a:focus"), "Skip links must become visibly focused through robust focus selectors.")

  for (const label of ["Search architecture", "Open export tools", "Save view state", "Restore view state"]) {
    assert(appSource.includes(`aria-label="${label}"`), `Top action must expose explicit aria-label: ${label}.`)
  }
  assert(styleSource.includes("min-height: 40px") && styleSource.includes("width: 40px"), "Compact top actions must keep approximately 40px hit targets.")

  assert(panelSource.includes("exportExpanded") && panelSource.includes("aria-expanded={exportExpanded}") && panelSource.includes('aria-controls="architecture-export-validation-region"'), "Advanced export must use a controlled button disclosure.")
  assert(panelSource.includes("Export tools opened") && appSource.includes("asteria:open-export-tools"), "Top Export must open the export surface and set visible feedback.")
  assert(panelSource.includes('hidden={!exportExpanded}') && panelSource.includes('data-testid="advanced-export-validation-region"'), "Export/schema details must stay out of the main path while closed.")

  assert(workspaceSource.includes("full-model-reading-controls"), "Full model must expose reading controls.")
  assert(workspaceSource.includes("Zoom out") && workspaceSource.includes("Fit") && workspaceSource.includes("Zoom in"), "Full model controls must include Zoom out, Fit, and Zoom in.")
  assert(workspaceSource.includes("setReadingPan") && workspaceSource.includes("onPointerMove={moveCanvasPan}"), "Full model must provide pointer-drag pan behavior.")
  assert(workspaceSource.includes("data-reading-zoom") && workspaceSource.includes("--projection-zoom"), "Reading controls must apply presentation-only transform state.")

  assert(styleSource.includes("grid-cols-[72px_minmax(0,1fr)]"), "Context helper must use explicit label/value spacing.")
  assert(styleSource.includes("[data-theme=\"light\"] .architecture-map-node-muted") && styleSource.includes("[data-theme=\"light\"] .architecture-map-edge-muted"), "Light trace muted context must have dedicated readable styling.")
  assert(styleSource.includes("[data-theme=\"light\"] .architecture-map-edge-trace text") && styleSource.includes("stroke-width: 0.48px"), "Selected/trace relation labels must have light-theme halo/readability styling.")

  for (const forbidden of ["Choose a starting version", "Use shared version", "New from scratch"]) {
    assert(!appSource.includes(forbidden) && !workspaceSource.includes(forbidden) && !panelSource.includes(forbidden), `Active 2.0 UI must not expose legacy startup string: ${forbidden}.`)
  }

  const protectedChanges = changedProtectedArchitectureFiles()
  assert(protectedChanges.length === 0, `RC.7 must not modify scientific fixtures or trace algorithm files: ${protectedChanges.join(", ")}`)

  const [{ canonicalTraceProjects }, { catTraceMultiViewProject, multiViewIds, evidenceClosureWarnings }, { traceForSymbol }, { buildProjectionLayout }] = await Promise.all([
    vite.ssrLoadModule("/src/architecture/fixtures/canonicalTraceFixtures.ts"),
    vite.ssrLoadModule("/src/architecture/fixtures/multiViewTraceProject.ts"),
    vite.ssrLoadModule("/src/architecture/trace.ts"),
    vite.ssrLoadModule("/src/architecture/viewProjection.ts"),
  ])

  const cat = canonicalTraceProjects["cat-trace-frozen-v2"]
  const selectedBeta = "entity:cat-trace-frozen-v2:betaU_gh"
  const overview = buildProjectionLayout(cat, multiViewIds.architecture, { detailLevel: "overview", selectedEntityId: selectedBeta })
  const full = buildProjectionLayout(cat, multiViewIds.architecture, { detailLevel: "full", selectedEntityId: selectedBeta })
  assert(overview.nodes.length < full.nodes.length, "Overview must remain the readable subset.")
  assert(full.nodes.length === Object.keys(cat.entities).length, "Full model must remain the complete canonical graph.")

  const pUp = traceForSymbol(cat, "symbol:cat-trace-frozen-v2:p_g", { mode: "recursive", direction: "upstream", maxDepth: 3 })
  const pDown = traceForSymbol(cat, "symbol:cat-trace-frozen-v2:p_g", { mode: "recursive", direction: "downstream", maxDepth: 3 })
  const pBoth = traceForSymbol(cat, "symbol:cat-trace-frozen-v2:p_g", { mode: "recursive", direction: "both", maxDepth: 3 })
  assert(sameSet(pBoth.upstreamEntityIds, pUp.upstreamEntityIds), "RC.7 must preserve root-relative upstream trace truth.")
  assert(sameSet(pBoth.downstreamEntityIds, pDown.downstreamEntityIds), "RC.7 must preserve root-relative downstream trace truth.")

  const closure = evidenceClosureWarnings(catTraceMultiViewProject).find((warning) => warning.claimId === "entity:evidence:claim:marked-discovery")
  assert(closure?.status === "pending", "Evidence pending truth must remain unchanged.")

  if (!process.exitCode) {
    console.log(
      JSON.stringify(
        {
          status: "validated",
          version: "2.0.0-rc.7",
          skipLinks: "first-tab-ready",
          exportDisclosure: "controlled",
          fullModelControls: "zoom-fit-pan",
          protectedScientificFilesChanged: protectedChanges.length,
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
