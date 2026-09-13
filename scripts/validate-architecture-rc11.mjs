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
      "src/architecture/fixtures/multiViewTraceProject.ts",
    ],
    { encoding: "utf8" },
  )
  return output.split("\n").map((line) => line.trim()).filter(Boolean)
}

try {
  const packageJson = JSON.parse(await read("package.json"))
  const appSource = await read("src/app/App.tsx")
  const panelSource = await read("src/components/ArchitectureReferencePanel.tsx")
  const mathSource = await read("src/components/RenderedMath.tsx")
  const workspaceSource = await read("src/components/ArchitectureWorkspace.tsx")
  const projectionSource = await read("src/architecture/viewProjection.ts")
  const styleSource = await read("src/styles/index.css")

  assert(packageJson.version === "2.0.0-rc.13", "package.json must declare 2.0.0-rc.13.")
  assert(appSource.includes('const appVersion = "2.0.0-rc.13"'), "App shell must display 2.0.0-rc.13.")
  assert(packageJson.scripts["test:architecture-rc11"] === 'node scripts/validate-architecture-rc11.mjs && playwright test --grep "RC11"', "package.json must expose RC.11 focused validation.")
  assert(packageJson.scripts["test:regression"].includes("test:architecture-rc11"), "Cumulative regression must include RC.11.")

  assert(mathSource.includes("CanonicalFormulaBlock"), "Canonical definitions must use a dedicated formula block component.")
  assert(mathSource.includes("canonical-formula-scroll"), "Canonical formula block must have a local horizontal scroll container.")
  assert(panelSource.includes("<CanonicalFormulaBlock"), "Architecture inspector must render canonical definitions through the dedicated block.")
  assert(panelSource.includes('data-testid="selected-why-it-matters"'), "Architecture inspector must expose the main Why-it-matters copy for regression.")

  for (const required of [
    "open-tail environmental response combines",
    "deterministic group intensity formed from total open-tail intensity",
    "fixed computational truncation, not an estimand",
    "TRACE extreme-tail calibration is preserved",
    "Unit-diagonal normalization preserves the marginal probit interpretation",
    "routes each raw feature either to a finite catalogue identity",
    "finite catalogue records known identities",
    "catalogue-external open tail holds anonymous",
    "latent probit score combines",
    "Original TRACE treats each species response vector",
    "Original TRACE calibrates the species intercept",
  ]) {
    assert(panelSource.includes(required), `Architecture Why-it-matters copy must include: ${required}`)
  }

  for (const forbidden of [
    "upstreamText",
    "downstreamText",
    "upstream relation${",
    "downstream relation${",
    "sits in the ${readableStatus",
    "contextual graph entity",
  ]) {
    assert(!panelSource.includes(forbidden), `Main Architecture Why-it-matters must not use graph-topology fallback copy: ${forbidden}`)
  }

  const mapSmallRule = styleSource.slice(styleSource.indexOf(".architecture-map-node small"), styleSource.indexOf(".architecture-map-node em"))
  assert(mapSmallRule.includes("white-space: normal"), "Architecture card labels must wrap naturally.")
  assert(mapSmallRule.includes("text-overflow: clip"), "Architecture card labels must not use ellipsis.")
  assert(!mapSmallRule.includes("line-clamp"), "Architecture card labels must not use line clamp.")
  assert(styleSource.includes(".canonical-formula-scroll") && styleSource.includes("overflow-x: auto"), "Canonical formulas must scroll inside the formula block only.")
  assert(styleSource.includes("min-width: max-content") && styleSource.includes("white-space: nowrap"), "Canonical formulas must preserve one horizontal math line.")

  assert(projectionSource.includes("height: 78") && projectionSource.includes("height: 84"), "CAT Overview presentation geometry must reserve height for multi-line labels.")
  assert(projectionSource.includes("width: 104") && projectionSource.includes("height: 84"), "CAT Overview presentation geometry must reserve height for stable labels without widening into adjacent columns.")
  assert(projectionSource.includes("layoutArchitectureLanes"), "CAT Full model packing must use the shared lane layout helper.")
  assert((await read("src/architecture/graphPresentation.ts")).includes("const gapY = Math.max(112"), "CAT Full model packing must reserve label height without widening into adjacent lanes.")
  assert(workspaceSource.includes('data-node-primary="true"'), "Architecture nodes must keep primary-text clipping hooks.")

  const protectedChanges = changedProtectedTruthFiles()
  assert(protectedChanges.length === 0, `RC.11 must not modify scientific truth, trace algorithm, session contract, or Lineage/Evidence fixtures: ${protectedChanges.join(", ")}`)

  if (!process.exitCode) {
    console.log(
      JSON.stringify(
        {
          status: "validated",
          version: "2.0.0-rc.13",
          formulaBlock: "dedicated-scroll-box",
          primaryLabelClamp: "removed",
          architectureWhyCopy: "scientific-item-specific",
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
