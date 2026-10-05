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
  const panelSource = await read("src/components/ArchitectureReferencePanel.tsx")
  const browserSource = await read("tests/browser/asteria-v2-rc.spec.ts")

  assert(packageJson.version === "2.0.0-rc.19", "package.json must declare 2.0.0-rc.19.")
  assert(appSource.includes('const appVersion = "2.0.0-rc.19"'), "App shell must display 2.0.0-rc.19.")
  assert(packageJson.scripts["test:architecture-rc17"] === 'node scripts/validate-architecture-rc17.mjs && playwright test --grep "RC17"', "package.json must expose RC.17 focused validation.")
  assert(packageJson.scripts["test:regression"].includes("test:architecture-rc17"), "Cumulative regression must include RC.17.")
  assert(packageJson.scripts["smoke:public-rc17"] === "node scripts/smoke-architecture-rc17-public.mjs", "package.json must expose RC.17 public smoke.")

  assert(panelSource.includes("const panelScrollRef = useRef<HTMLElement>(null)"), "Inspector must keep a scroll-container ref.")
  assert(panelSource.includes('ref={panelScrollRef}'), "Inspector aside must own the scroll-container ref.")
  assert(panelSource.includes("panelScrollRef.current?.scrollTo({ top: 0, left: 0 })"), "Inspector reset must scroll the inspector itself to the top.")
  assert(!panelSource.includes("panelTopRef.current?.scrollIntoView"), "Inspector must not use document-level scrollIntoView for top reset.")

  for (const expected of [
    "RC17 inspector top context stays visible after selection and view changes",
    "inspectorTopStackMetrics",
    "headingFullyVisible",
    "helperFullyVisible",
    "viewHelpFullyVisible",
    "Architecture answers how each statistical symbol depends on data, latent variables, parameters, and targets.",
  ]) {
    assert(browserSource.includes(expected), `RC.17 browser regression must assert ${expected}.`)
  }

  const protectedChanges = changedProtectedTruthFiles()
  assert(protectedChanges.length === 0, `RC.17 must not modify scientific truth, trace algorithm, session contract, or Lineage/Evidence fixtures: ${protectedChanges.join(", ")}`)

  if (!process.exitCode) {
    console.log(
      JSON.stringify(
        {
          status: "validated",
          version: "2.0.0-rc.19",
          inspectorTopReset: true,
          browserRegression: "RC17 inspector top context",
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
