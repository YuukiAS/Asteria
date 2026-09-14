import { execFileSync } from "node:child_process"
import fs from "node:fs/promises"

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
    ],
    { encoding: "utf8" },
  )
  return output.split("\n").map((line) => line.trim()).filter(Boolean)
}

try {
  const packageJson = JSON.parse(await read("package.json"))
  const appSource = await read("src/app/App.tsx")
  const graphSource = await read("src/architecture/graphPresentation.ts")
  const workspaceSource = await read("src/components/ArchitectureWorkspace.tsx")
  const inspectorSource = await read("src/components/ArchitectureReferencePanel.tsx")
  const styleSource = await read("src/styles/index.css")
  const browserSource = await read("tests/browser/asteria-v2-rc.spec.ts")

  assert(packageJson.version === "2.0.0-rc.16", "package.json must declare 2.0.0-rc.16.")
  assert(appSource.includes('const appVersion = "2.0.0-rc.16"'), "App shell must display 2.0.0-rc.16.")
  assert(packageJson.scripts["test:architecture-rc15"] === 'node scripts/validate-architecture-rc15.mjs && playwright test --grep "RC15"', "package.json must expose RC.15 focused validation.")
  assert(packageJson.scripts["test:regression"].includes("test:architecture-rc15"), "Cumulative regression must include RC.15.")

  for (const token of [
    "--graph-edge-architecture-base",
    "--graph-edge-architecture-active",
    "--graph-edge-lineage-base",
    "--graph-edge-lineage-active",
    "--graph-edge-evidence-base",
    "--graph-edge-evidence-active",
    "--graph-arrow-size",
    "--graph-route-corner-radius",
    "--graph-relation-label-offset",
  ]) {
    assert(styleSource.includes(token), `Missing canonical graph visual token ${token}.`)
  }

  assert(graphSource.includes('export type ScientificRouteGrammar = "soft-cubic" | "rounded-orthogonal"'), "Graph presentation must separate route grammar from route geometry.")
  assert(graphSource.includes("function renderScientificRoute") && graphSource.includes("renderSoftCubicRoute") && graphSource.includes("roundedPolylinePath"), "Graph routes must go through scientific route renderers.")
  assert(graphSource.includes("export function scoreRouteCandidate") && graphSource.includes("backwardXDistance") && graphSource.includes("proximityScore"), "Route candidates must be scored by generic geometry costs.")
  assert(!graphSource.includes("polylinePath("), "RC.15 must not directly render obstacle polylines as the final SVG path.")
  assert(graphSource.includes("softCubicHitsObstacle") && graphSource.includes('"soft-cubic"') && graphSource.includes('"rounded-orthogonal"'), "Simple and obstacle route grammars must both be present.")
  assert(graphSource.includes("labelGroup: ProvenanceLabelGroup") && graphSource.includes("pathPointAndNormalAt") && graphSource.includes("relationLabelOffset"), "Provenance labels must be path-derived groups.")
  assert(!graphSource.includes("chipsLayout"), "Provenance layout must not keep scattered per-chip anchors.")
  assert(!graphSource.includes("cat-trace") && !graphSource.includes("betaU_gh") && !graphSource.includes("gamma_g"), "Graph presentation helper must not hardcode CAT-TRACE examples.")

  assert(workspaceSource.includes("function RelationLabelGroup"), "Lineage must render a reusable relation label group component.")
  assert(workspaceSource.includes("data-lineage-label-group=\"true\"") && workspaceSource.includes("data-label-count={labels.length}"), "Lineage must expose relation label group metadata for regression.")
  assert(!workspaceSource.includes("card.chipsLayout"), "Lineage UI must not render separate chip anchors from the old layout.")
  assert(workspaceSource.includes("data-route-grammar") && workspaceSource.includes("data-route-bend-count") && workspaceSource.includes("data-route-score"), "Projected edges must expose route grammar metadata for RC.15 browser regression.")

  assert(!inspectorSource.includes("research-view-canvas research-view-canvas-"), "Non-Architecture inspector must not render the duplicate mini research-view canvas.")
  assert(inspectorSource.indexOf("architecture-search-row") < inspectorSource.indexOf("<MultiViewPanel"), "Search must precede the non-Architecture primary inspector.")

  assert(browserSource.includes('test("RC15 canonical scientific graph visual system'), "Browser regression must include RC.15 visual-system coverage.")
  assert(browserSource.includes("data-lineage-label-group") && browserSource.includes("inspectNonArchitectureInspectorIa"), "Browser regression must validate Lineage label groups and inspector IA.")
  assert(browserSource.includes("renderGenericRouteFixture") && browserSource.includes("renderGenericProvenanceFixture"), "Browser regression must include generic route and provenance fixtures.")

  const protectedChanges = changedProtectedTruthFiles()
  assert(protectedChanges.length === 0, `RC.15 must not modify scientific truth, trace algorithm, session contract, or Lineage/Evidence fixtures: ${protectedChanges.join(", ")}`)

  if (!process.exitCode) {
    console.log(
      JSON.stringify(
        {
          status: "validated",
          version: "2.0.0-rc.16",
          routeGrammar: "SOFT_CUBIC_AND_ROUNDED_ORTHOGONAL",
          candidateScoring: true,
          lineageRelationLabelGroups: true,
          inspectorTinyStripRemoved: true,
          protectedTruthFileChanges: protectedChanges.length,
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
  process.exit(process.exitCode ?? 0)
}
