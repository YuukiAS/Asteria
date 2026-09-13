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
      "src/architecture/trace.ts",
      "src/architecture/session.tsx",
      "src/architecture/types.ts",
    ],
    { encoding: "utf8" },
  )
  return output.split("\n").map((line) => line.trim()).filter(Boolean)
}

try {
  const packageJson = JSON.parse(await read("package.json"))
  const appSource = await read("src/app/App.tsx")
  const viewProjectionSource = await read("src/architecture/viewProjection.ts")
  const workspaceSource = await read("src/components/ArchitectureWorkspace.tsx")
  const panelSource = await read("src/components/ArchitectureReferencePanel.tsx")
  const diffSource = await read("src/architecture/semanticDiff.ts")
  const multiViewSource = await read("src/architecture/fixtures/multiViewTraceProject.ts")
  const styleSource = await read("src/styles/index.css")

  assert(packageJson.version === "2.0.0-rc.15", "package.json must declare 2.0.0-rc.15.")
  assert(appSource.includes('const appVersion = "2.0.0-rc.15"'), "App shell must display 2.0.0-rc.15.")
  assert(packageJson.scripts["test:architecture-rc9"] === "node scripts/validate-architecture-rc9.mjs", "package.json must expose test:architecture-rc9.")
  assert(packageJson.scripts["test:regression"].includes("test:architecture-rc9"), "Cumulative regression must include RC.9.")

  assert(viewProjectionSource.includes('"x_i"'), "CAT-TRACE Overview baseline must include x_i.")
  assert(viewProjectionSource.includes("catTraceOverviewSlots"), "CAT-TRACE Overview must use deterministic slots.")
  assert(viewProjectionSource.includes("stableBoundsNodes"), "Projection layout must use stable view bounds instead of visible subset bounds.")
  assert(!viewProjectionSource.includes("const minX = Math.min(...rawNodes.map"), "Projection bounds must not be calculated from the current display subset.")
  for (const hiddenLeaf of ['"nu"', '"a_g"', '"gamma0"', '"pi_g"']) {
    const baselineStart = viewProjectionSource.indexOf("const catTraceOverviewKeys")
    const baselineEnd = viewProjectionSource.indexOf("const catTraceOverviewSlots")
    assert(!viewProjectionSource.slice(baselineStart, baselineEnd).includes(hiddenLeaf), `Overview baseline should not expose ${hiddenLeaf} until selection reveal.`)
  }

  assert(workspaceSource.includes("compactRelationLabel"), "Workspace must render concise relation labels.")
  assert(!workspaceSource.includes("edge.relation.type.replace(/_/g"), "Canvas must not render raw relation type strings as edge labels.")
  assert(workspaceSource.includes("data-edge-label-visible"), "Canvas must expose edge label visibility for browser regression.")
  assert(workspaceSource.includes("data-node-primary"), "Canvas must expose node primary text for clipping regression.")

  assert(styleSource.includes(".architecture-map-node {") && styleSource.includes("transition:\n      opacity 140ms ease"), "Graph node transitions must be limited to non-geometry properties.")
  assert(!styleSource.includes("architecture-map-node {\n    @apply") || !styleSource.includes("shadow-sm transition;"), "Graph nodes must not use Tailwind generic transition.")
  assert(styleSource.includes(".architecture-map-edge-labeled text"), "Edge labels must be explicitly gated by label visibility.")
  assert(styleSource.includes("font-size: 1.08px"), "Edge labels must use compact map-scale typography.")

  assert(diffSource.includes("labelParts") && diffSource.includes("afterParts") && diffSource.includes("why:"), "Semantic diff must carry rendered math parts and item-specific why copy.")
  for (const rawUiText of ["Finite catalogue mathcal K", "gamma_g = gamma_0*pi_g is derived", "beta^U_gh = nu + a_g + v^U_gh"]) {
    assert(!diffSource.includes(`label: "${rawUiText}`), `Semantic diff labels must not expose raw source-like math: ${rawUiText}`)
  }
  assert(!panelSource.includes("canonical source string"), "Inspector copy must not expose internal source-string language.")
  assert(!panelSource.includes("New CAT-TRACE structure that Original TRACE does not expose"), "Semantic diff why copy must be item-specific, not generic.")

  for (const internalCopy of ["CAT-TRACE Frozen V2 Web RC", "Asteria implementation fixtures", "G05 stress fixture", "first-paper dataset", "current Web RC"]) {
    assert(!multiViewSource.includes(internalCopy), `Stable-facing Lineage/Evidence copy must not expose internal release wording: ${internalCopy}`)
  }
  assert(multiViewSource.includes("Architecture regression evidence"), "Evidence graph must use stable implementation evidence copy.")
  assert(multiViewSource.includes("Large-graph performance check"), "Evidence graph must use stable performance evidence copy.")

  const protectedChanges = changedProtectedTruthFiles()
  assert(protectedChanges.length === 0, `RC.9 must not modify canonical truth, trace algorithm, session contract, or schema types: ${protectedChanges.join(", ")}`)

  if (!process.exitCode) {
    console.log(
      JSON.stringify(
        {
          status: "validated",
          version: "2.0.0-rc.15",
          stableOverviewGeometry: true,
          compactRelationLabels: true,
          renderedSemanticDiffMath: true,
          stableFacingCopy: true,
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
