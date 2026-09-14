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
  const styleSource = await read("src/styles/index.css")
  const browserSource = await read("tests/browser/asteria-v2-rc.spec.ts")

  assert(packageJson.version === "2.0.0-rc.16", "package.json must declare 2.0.0-rc.16.")
  assert(appSource.includes('const appVersion = "2.0.0-rc.16"'), "App shell must display 2.0.0-rc.16.")
  assert(packageJson.scripts["test:architecture-rc16"] === 'node scripts/validate-architecture-rc16.mjs && playwright test --grep "RC16"', "package.json must expose RC.16 focused validation.")
  assert(packageJson.scripts["test:regression"].includes("test:architecture-rc16"), "Cumulative regression must include RC.16.")

  for (const token of [
    "edgeEdgeCrossingPenalty",
    "cardBorderHugPenalty",
    "terminalAnglePenalty",
    "regionChangePenalty",
    "withTerminalStubs",
    "portStubPoint",
    "portOutwardNormal",
    "simplifyRoutePoints",
    "terminalAngleScore",
    "cardBorderHugScore",
    "edgeCrossingScore",
    "regionChangeScore",
    "routedEdges",
  ]) {
    assert(graphSource.includes(token), `Missing connector-finish route geometry token ${token}.`)
  }
  assert(!graphSource.includes("!routeScoreOptions.routedEdges.length"), "Soft-cubic must not keep a special early-return path outside candidate scoring.")
  assert(graphSource.includes("routeBendCount(points) * bendPenalty"), "Route bend scoring must ignore terminal stub bookkeeping bends.")
  assert(!graphSource.includes("sourceStub as BoundaryPort"), "Stub routing must not rely on a fake BoundaryPort cast.")
  assert(!graphSource.includes("targetStub as BoundaryPort"), "Stub routing must not rely on a fake BoundaryPort cast.")
  assert(!graphSource.includes("cat-trace") && !graphSource.includes("betaU_gh") && !graphSource.includes("South-West Australia"), "Generic route helper must not hardcode CAT-TRACE or diagnostic fixture names.")

  assert(workspaceSource.includes('markerWidth="7"') && workspaceSource.includes('markerHeight="7"'), "Architecture and Lineage markers must share compact fixed marker dimensions.")
  assert(workspaceSource.includes('d="M0.7,0.7 L6.1,3.5 L0.7,6.3"'), "Markers must use the canonical open chevron path.")
  assert(styleSource.includes(".architecture-map-edges marker path") && styleSource.includes("fill: none") && styleSource.includes("stroke: context-stroke"), "Architecture marker CSS must render an open stroked chevron.")
  assert(styleSource.includes(".lineage-presentation-connectors marker path") && styleSource.includes("fill: none") && styleSource.includes("stroke: context-stroke"), "Lineage marker CSS must render an open stroked chevron.")
  assert(!styleSource.includes(".lineage-relation-divider"), "Lineage relation labels must not use literal visual separators.")
  assert(!workspaceSource.includes("lineage-relation-divider"), "Lineage relation labels must not render literal separator spans.")

  for (const forbidden of [
    "Theory / implementation / datasets / limitation / pending",
    "Extends / preserves / borrows / computational inspiration",
    "Evidence relation legend",
    "Lineage relation legend",
  ]) {
    assert(!workspaceSource.includes(forbidden), `Stable-facing placeholder footer or legend must be removed: ${forbidden}`)
  }

  for (const expected of [
    "FILLED_TRIANGLE_MARKER_COUNT",
    "EDGE_CARD_BORDER_HUG_COUNT",
    "TERMINAL_NORMAL_ANGLE_FAIL_COUNT",
    "SOURCE_DEPARTURE_ANGLE_FAIL_COUNT",
    "ARCH_AVOIDABLE_EDGE_EDGE_CROSSING_COUNT",
    "EVIDENCE_AVOIDABLE_EDGE_EDGE_CROSSING_COUNT",
    "GENERIC_AVOIDABLE_EDGE_EDGE_CROSSING_COUNT",
    "LINEAGE_LITERAL_SEPARATOR_COUNT",
    "STATIC_CATEGORY_FOOTER_COUNT",
    "PLACEHOLDER_LEGEND_LABEL_COUNT",
  ]) {
    assert(browserSource.includes(expected), `RC.16 browser regression must assert ${expected}.`)
  }

  const protectedChanges = changedProtectedTruthFiles()
  assert(protectedChanges.length === 0, `RC.16 must not modify scientific truth, trace algorithm, session contract, or Lineage/Evidence fixtures: ${protectedChanges.join(", ")}`)

  if (!process.exitCode) {
    console.log(
      JSON.stringify(
        {
          status: "validated",
          version: "2.0.0-rc.16",
          connectorFinishRouteScoring: true,
          canonicalOpenChevron: true,
          staleFooterLegendRemoved: true,
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
