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
  const projectionSource = await read("src/architecture/viewProjection.ts")
  const workspaceSource = await read("src/components/ArchitectureWorkspace.tsx")
  const styleSource = await read("src/styles/index.css")
  const browserSource = await read("tests/browser/asteria-v2-rc.spec.ts")

  assert(packageJson.version === "2.0.0-rc.16", "package.json must declare 2.0.0-rc.16.")
  assert(appSource.includes('const appVersion = "2.0.0-rc.16"'), "App shell must display 2.0.0-rc.16.")
  assert(packageJson.scripts["test:architecture-rc14"] === 'node scripts/validate-architecture-rc14.mjs && playwright test --grep "RC14"', "package.json must expose RC.14 focused validation.")
  assert(packageJson.scripts["test:regression"].includes("test:architecture-rc14"), "Cumulative regression must include RC.14.")

  assert(workspaceSource.includes("function useElementSize") && workspaceSource.includes("ResizeObserver"), "Lineage and Architecture must use a React-safe measured container size.")
  assert(workspaceSource.includes("canvasWidth: canvasSize.width") && workspaceSource.includes("canvasHeight: canvasSize.height"), "Architecture layout must receive actual rendered canvas dimensions.")
  assert(workspaceSource.includes("layoutProvenanceFlow(lineageCards, canvasSize)"), "Lineage layout must be container-driven from actual CSS-pixel dimensions.")
  assert(workspaceSource.includes("data-layout-width") && workspaceSource.includes("data-layout-height"), "Lineage rendered surface must expose measured layout dimensions for regression.")
  assert(styleSource.includes(".lineage-presentation {") && styleSource.includes("@apply absolute inset-0 overflow-visible"), "Lineage presentation must occupy the actual measured content box.")
  assert(!styleSource.includes("scale(0.8)") && !styleSource.includes("preserveAspectRatio=\"none\" aria-hidden=\"true\">"), "Lineage must not keep separate SVG-only scaling or the previous local transform.")

  assert(projectionSource.includes("type LayoutOptions") && projectionSource.includes("canvasWidth?: number") && projectionSource.includes("canvasHeight?: number"), "Projection layout must accept responsive canvas dimensions.")
  assert(projectionSource.includes("function clampNodeToCanvas") && projectionSource.includes("safeInset"), "Projection layout must clamp visible cards to actual canvas safe bounds.")
  assert(projectionSource.includes("nodes = nodes.map((node) => clampNodeToCanvas"), "Non-full projections must apply generic safe bounds after responsive placement.")
  assert(graphSource.includes("sources.length * 22") && graphSource.includes("sidePad"), "Provenance layout must keep generic port spacing and target margin across source counts.")
  assert(!graphSource.includes("cat-trace") && !graphSource.includes("betaU_gh") && !graphSource.includes("gamma_g"), "Graph presentation helper must not hardcode CAT-TRACE examples.")

  assert(browserSource.includes("getScreenCTM") && browserSource.includes("endpointErrorMax"), "Browser regression must compare rendered SVG endpoints against DOM target rects.")
  assert(browserSource.includes("renderGenericProvenanceFixture") && browserSource.includes("for (const sourceCount of [3, 4, 6] as const)"), "Browser regression must cover generic 3/4/6-source provenance fixtures.")
  assert(browserSource.includes("architectureSafeBounds") && browserSource.includes("assertStableSharedNodeCenters"), "Browser regression must cover rendered Architecture safe bounds and same-viewport geometry stability.")

  const protectedChanges = changedProtectedTruthFiles()
  assert(protectedChanges.length === 0, `RC.14 must not modify scientific truth, trace algorithm, session contract, or Lineage/Evidence fixtures: ${protectedChanges.join(", ")}`)

  if (!process.exitCode) {
    console.log(
      JSON.stringify(
        {
          status: "validated",
          version: "2.0.0-rc.16",
          coordinateSpaceStrategy: "CONTAINER_DRIVEN",
          lineageRenderedEndpointRegression: true,
          architectureSafeBoundsRegression: true,
          genericSourceCounts: [3, 4, 6],
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
