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

function cssPxToken(styleSource, tokenName) {
  const match = styleSource.match(new RegExp(`${tokenName}:\\s*([0-9.]+)px;`))
  return match ? Number.parseFloat(match[1]) : 0
}

try {
  const packageJson = JSON.parse(await read("package.json"))
  const appSource = await read("src/app/App.tsx")
  const workspaceSource = await read("src/components/ArchitectureWorkspace.tsx")
  const styleSource = await read("src/styles/index.css")
  const architectureBaseEdgeCssPx = cssPxToken(styleSource, "--graph-edge-architecture-base")
  const architectureActiveEdgeCssPx = cssPxToken(styleSource, "--graph-edge-architecture-active")
  const lineageBaseEdgeCssPx = cssPxToken(styleSource, "--graph-edge-lineage-base")
  const lineageActiveEdgeCssPx = cssPxToken(styleSource, "--graph-edge-lineage-active")

  assert(packageJson.version === "2.0.0-rc.16", "package.json must declare 2.0.0-rc.16.")
  assert(appSource.includes('const appVersion = "2.0.0-rc.16"'), "App shell must display 2.0.0-rc.16.")
  assert(packageJson.scripts["test:architecture-rc12"] === 'node scripts/validate-architecture-rc12.mjs && playwright test --grep "RC12"', "package.json must expose RC.12 focused validation.")
  assert(packageJson.scripts["test:regression"].includes("test:architecture-rc12"), "Cumulative regression must include RC.12.")

  assert(styleSource.includes("vector-effect: non-scaling-stroke"), "Graph connectors must use viewport-stable non-scaling strokes.")
  assert(
    styleSource.includes("stroke-width: var(--graph-edge-architecture-base)") &&
      architectureBaseEdgeCssPx >= 1.15 &&
      architectureBaseEdgeCssPx <= 1.4,
    "Architecture base edge stroke must use a restrained CSS-pixel token.",
  )
  assert(
    styleSource.includes("stroke-width: var(--graph-edge-architecture-active)") &&
      architectureActiveEdgeCssPx >= 1.7 &&
      architectureActiveEdgeCssPx <= 1.95,
    "Architecture active edge stroke must use a restrained CSS-pixel token.",
  )
  assert(
    styleSource.includes("stroke-width: var(--graph-edge-lineage-base)") &&
      lineageBaseEdgeCssPx >= 1.25 &&
      lineageBaseEdgeCssPx <= 1.5,
    "Lineage base connector stroke must use a CSS-pixel token.",
  )
  assert(
    styleSource.includes("stroke-width: var(--graph-edge-lineage-active)") &&
      lineageActiveEdgeCssPx >= 1.65 &&
      lineageActiveEdgeCssPx <= 1.85,
    "Lineage active connector stroke must remain below the RC.12 cap.",
  )
  assert(workspaceSource.includes('markerUnits="userSpaceOnUse"'), "SVG markers must be decoupled from selected stroke width.")
  assert(workspaceSource.includes('markerWidth="7"') && workspaceSource.includes('markerHeight="7"'), "Architecture and Lineage arrows must use fixed compact user-space marker dimensions.")
  assert(workspaceSource.includes('d="M0.7,0.7 L6.1,3.5 L0.7,6.3"'), "Arrowheads must use the canonical open chevron path.")
  assert(styleSource.includes("fill: none") && styleSource.includes("stroke: context-stroke"), "Arrowheads must render as open chevrons that inherit the relation stroke color.")

  const protectedChanges = changedProtectedTruthFiles()
  assert(protectedChanges.length === 0, `RC.12 must not modify scientific truth, trace algorithm, session contract, or Lineage/Evidence fixtures: ${protectedChanges.join(", ")}`)

  if (!process.exitCode) {
    console.log(
      JSON.stringify(
        {
          status: "validated",
          version: "2.0.0-rc.16",
          edgeStrokeSystem: "css-px-non-scaling-stroke",
          architectureBaseEdgeCssPx,
          architectureActiveEdgeCssPx,
          lineageBaseEdgeCssPx,
          lineageActiveEdgeCssPx,
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
