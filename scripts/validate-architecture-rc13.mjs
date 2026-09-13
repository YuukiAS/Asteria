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
  const projectionSource = await read("src/architecture/viewProjection.ts")
  const graphSource = await read("src/architecture/graphPresentation.ts")
  const workspaceSource = await read("src/components/ArchitectureWorkspace.tsx")
  const styleSource = await read("src/styles/index.css")
  const browserSource = await read("tests/browser/asteria-v2-rc.spec.ts")

  assert(packageJson.version === "2.0.0-rc.15", "package.json must declare 2.0.0-rc.15.")
  assert(appSource.includes('const appVersion = "2.0.0-rc.15"'), "App shell must display 2.0.0-rc.15.")
  assert(packageJson.scripts["test:architecture-rc13"] === 'node scripts/validate-architecture-rc13.mjs && playwright test --grep "RC13"', "package.json must expose RC.13 focused validation.")
  assert(packageJson.scripts["test:regression"].includes("test:architecture-rc13"), "Cumulative regression must include RC.13.")

  assert(graphSource.includes("export function layoutArchitectureLanes"), "RC.13 must centralize lane-aware architecture layout.")
  assert(graphSource.includes("export function boundaryPort"), "RC.13 must expose reusable node-boundary ports.")
  assert(graphSource.includes("export function routeBoundaryEdge"), "RC.13 must route edges from card boundaries.")
  assert(graphSource.includes("export function layoutProvenanceFlow"), "RC.13 must route provenance/Lineage connectors from measured rectangles.")
  assert(!graphSource.includes("cat-trace") && !graphSource.includes("betaU_gh") && !graphSource.includes("gamma_g"), "Graph presentation helper must stay generic and not hardcode CAT-TRACE examples.")
  assert(!projectionSource.includes("const columns = [") && !projectionSource.includes("const rows = ["), "Full model must not use the previous global row-major grid.")
  assert(projectionSource.includes("layoutArchitectureLanes"), "Full model must use the generic lane layout.")
  assert(projectionSource.includes("routeBoundaryEdge"), "Architecture/Evidence routing must use boundary ports.")
  assert(workspaceSource.includes("data-source-port-x") && workspaceSource.includes("data-target-port-x"), "Rendered edges must expose boundary-port geometry for browser regression.")
  assert(workspaceSource.includes("data-node-width") && workspaceSource.includes("data-node-height"), "Rendered nodes must expose card dimensions for browser regression.")
  assert(workspaceSource.includes("layoutProvenanceFlow(lineageCards"), "Lineage presentation must derive connectors from the provenance layout helper.")
  assert(!workspaceSource.includes("port: ") && !workspaceSource.includes("chipLeft"), "Lineage must not use fixed y/port/chip percentages.")
  assert(styleSource.includes("--projection-width") && styleSource.includes("--projection-height"), "Projection layer must size to the virtual canvas.")
  assert(browserSource.includes("RC13 graph presentation foundation"), "Browser suite must include RC.13 real-page graph routing regression.")
  assert(browserSource.includes("RC13 generic graph fixture"), "Browser suite must include a generic non-CAT fixture regression.")

  const protectedChanges = changedProtectedTruthFiles()
  assert(protectedChanges.length === 0, `RC.13 must not modify scientific fixtures, trace algorithm, session contract, or Lineage/Evidence truth: ${protectedChanges.join(", ")}`)

  if (!process.exitCode) {
    console.log(
      JSON.stringify(
        {
          status: "validated",
          version: "2.0.0-rc.15",
          genericGraphPresentation: true,
          exampleSpecificHardcodeAdded: false,
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
