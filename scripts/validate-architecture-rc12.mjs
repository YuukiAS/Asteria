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
  const workspaceSource = await read("src/components/ArchitectureWorkspace.tsx")
  const styleSource = await read("src/styles/index.css")

  assert(packageJson.version === "2.0.0-rc.13", "package.json must declare 2.0.0-rc.13.")
  assert(appSource.includes('const appVersion = "2.0.0-rc.13"'), "App shell must display 2.0.0-rc.13.")
  assert(packageJson.scripts["test:architecture-rc12"] === 'node scripts/validate-architecture-rc12.mjs && playwright test --grep "RC12"', "package.json must expose RC.12 focused validation.")
  assert(packageJson.scripts["test:regression"].includes("test:architecture-rc12"), "Cumulative regression must include RC.12.")

  assert(styleSource.includes("vector-effect: non-scaling-stroke"), "Graph connectors must use viewport-stable non-scaling strokes.")
  assert(styleSource.includes("stroke-width: 1.35px"), "Architecture base edge stroke must use CSS-pixel width.")
  assert(styleSource.includes("stroke-width: 1.9px"), "Architecture active edge stroke must use a restrained CSS-pixel width.")
  assert(styleSource.includes("stroke-width: 1.5px"), "Lineage base connector stroke must use CSS-pixel width.")
  assert(styleSource.includes("stroke-width: 1.85px"), "Lineage active connector stroke must remain below the RC.12 cap.")
  assert(workspaceSource.includes('markerUnits="userSpaceOnUse"'), "SVG markers must be decoupled from selected stroke width.")
  assert(workspaceSource.includes('markerWidth="0.95"') && workspaceSource.includes('markerWidth="9"'), "Architecture and Lineage arrows must use fixed user-space marker dimensions.")
  assert(styleSource.includes("fill: context-stroke"), "Arrowheads must inherit the relation stroke color instead of forming one-color knots.")

  const protectedChanges = changedProtectedTruthFiles()
  assert(protectedChanges.length === 0, `RC.12 must not modify scientific truth, trace algorithm, session contract, or Lineage/Evidence fixtures: ${protectedChanges.join(", ")}`)

  if (!process.exitCode) {
    console.log(
      JSON.stringify(
        {
          status: "validated",
          version: "2.0.0-rc.13",
          edgeStrokeSystem: "css-px-non-scaling-stroke",
          architectureBaseEdgeCssPx: 1.35,
          architectureActiveEdgeCssPx: 1.9,
          lineageBaseEdgeCssPx: 1.5,
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
