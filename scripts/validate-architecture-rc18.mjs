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
      "src/architecture/repositoryBridge.ts",
      "src/architecture/schema.ts",
      "src/architecture/validation.ts",
    ],
    { encoding: "utf8" },
  )
  return output.split("\n").map((line) => line.trim()).filter(Boolean)
}

try {
  const packageJson = JSON.parse(await read("package.json"))
  const appSource = await read("src/app/App.tsx")
  const workspaceSource = await read("src/components/ArchitectureWorkspace.tsx")
  const projectionSource = await read("src/architecture/viewProjection.ts")
  const browserSource = await read("tests/browser/asteria-v2-rc.spec.ts")

  assert(packageJson.version === "2.0.0-rc.19", "package.json must declare 2.0.0-rc.19.")
  assert(appSource.includes('const appVersion = "2.0.0-rc.19"'), "App shell must display 2.0.0-rc.19.")
  assert(packageJson.scripts["test:architecture-rc18"] === 'node scripts/validate-architecture-rc18.mjs && playwright test --grep "RC18"', "package.json must expose RC.18 focused validation.")
  assert(packageJson.scripts["test:regression"].includes("test:architecture-rc18"), "Cumulative regression must include RC.18.")
  assert(packageJson.scripts["smoke:public-rc18"] === "node scripts/smoke-architecture-rc18-public.mjs", "package.json must expose RC.18 public smoke.")

  assert(!projectionSource.includes("revealDirectContext(options.selectedEntityId)"), "Trace-off ordinary selection must not reveal direct context.")
  assert(projectionSource.includes("options.traceEntityIds?.forEach((entityId) => revealDirectContext(entityId))"), "Explicit trace remains the reveal owner.")
  assert(projectionSource.includes("packFullArchitectureNodes(project, nodes, actualCanvas, relationPairs)"), "Full model must use the actual measured canvas and relation-aware lane ordering.")
  assert(!projectionSource.includes("width: presentationCanvas.width, minHeight: presentationCanvas.height, nodeWidth: 80"), "Full model must not use the old fixed 1000x620 miniature packing.")
  assert(projectionSource.includes("options.detailLevel === \"full\" || !project.project.id.includes(\"original-trace\")") && projectionSource.includes("zoom: view.kind === \"architecture\""), "Full model reset must preserve readable scale.")

  assert(workspaceSource.includes("const showLabel = false"), "Stable canvas must not render inline edge labels.")
  assert(workspaceSource.includes("const showDirectionTerminal = isArchitectureView && hasTraceSelection && isTraceEdge"), "Only active Architecture trace edges may show direction terminals.")
  assert(workspaceSource.includes("markerEnd={showDirectionTerminal ? \"url(#architecture-edge-arrow)\" : undefined}"), "Ordinary Architecture/Evidence edges must not get markerEnd.")
  assert(workspaceSource.includes('data-edge-arrow-visible={showDirectionTerminal ? "true" : "false"}'), "Projected edges must expose arrow visibility for regression.")
  assert(workspaceSource.includes('markerWidth="5.2"') && workspaceSource.includes('d="M0.8,0.8 L4.8,2.6 L0.8,4.4"'), "Active trace terminal must be tiny and restrained.")
  assert(!workspaceSource.includes("function RelationLabelGroup"), "Lineage must not render floating relation label groups.")
  assert(!workspaceSource.includes("markerEnd=\"url(#lineage-presentation-arrow)\""), "Lineage default connectors must not render arrowheads.")
  assert(workspaceSource.includes('data-lineage-arrow-visible="false"'), "Lineage connector metadata must expose quiet default arrows.")
  assert(workspaceSource.includes('aria-label="Reset full model"') && workspaceSource.includes("<span>Reset</span>"), "Full model control must be a truthful readable reset.")

  for (const expected of [
    "RC18 quiet graph convergence keeps selection stable, connectors quiet, and Full model readable",
    "TRACE_OFF_VISIBLE_NODE_COUNT_STABLE",
    "TRACE_OFF_ORDINARY_ARROWHEAD_COUNT",
    "LINEAGE_FLOATING_EDGE_LABEL_COUNT",
    "FULL_MODEL_PRIMARY_TEXT_MIN_CSS_PX",
  ]) {
    assert(browserSource.includes(expected), `RC.18 browser regression must assert ${expected}.`)
  }

  const protectedChanges = changedProtectedTruthFiles()
  assert(protectedChanges.length === 0, `RC.18 must not modify scientific truth, trace algorithm, session contract, or CAT-TRACE bridge contracts: ${protectedChanges.join(", ")}`)

  if (!process.exitCode) {
    console.log(
      JSON.stringify(
        {
          status: "validated",
          version: "2.0.0-rc.19",
          quietConnector: true,
          fullModelReadableReset: true,
          traceOffSelectionRevealRemoved: true,
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
