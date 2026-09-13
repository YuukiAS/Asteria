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

try {
  const packageJson = JSON.parse(await read("package.json"))
  const appSource = await read("src/app/App.tsx")
  const styleSource = await read("src/styles/index.css")

  assert(packageJson.version === "2.0.0-rc.14", "package.json must declare 2.0.0-rc.14.")
  assert(appSource.includes('const appVersion = "2.0.0-rc.14"'), "App shell must display 2.0.0-rc.14.")

  assert(
    styleSource.includes('[data-theme="light"] .architecture-map-edge-muted {') &&
      styleSource.includes("opacity: 0.88") &&
      styleSource.includes("stroke-width: 1.2px"),
    "Light trace muted relation context must have a dedicated readable minimum style.",
  )
  assert(
    styleSource.includes("[data-theme=\"light\"] .architecture-map-edge-muted.architecture-map-edge-selected") &&
      styleSource.includes("[data-theme=\"light\"] .architecture-map-edge-muted.architecture-map-edge-trace") &&
      styleSource.includes("opacity: 1"),
    "Light muted + selected/trace class overlap must opt out of group-level dimming.",
  )
  assert(
    styleSource.includes("[data-theme=\"light\"] .architecture-map-edge-muted.architecture-map-edge-selected text") &&
      styleSource.includes("stroke-width: 0.52px") &&
      styleSource.includes("opacity: 0.92"),
    "Active/selected relation labels must keep a light-theme halo above muted context.",
  )
  assert(
    styleSource.includes("[data-theme=\"light\"] .architecture-map-node-muted") &&
      styleSource.includes("[data-theme=\"light\"] .architecture-map-node-muted small"),
    "Light muted surrounding node labels must remain readable.",
  )
  assert(
    !styleSource.includes('[data-theme="dark"] .architecture-map-edge-muted path'),
    "RC.8 must not globally brighten dark-theme muted edge paths.",
  )

  if (!process.exitCode) {
    console.log(
      JSON.stringify(
        {
          status: "validated",
          version: "2.0.0-rc.14",
          lightTraceContextReadability: "dedicated-css",
          activeTraceHierarchy: "overlap-protected",
          darkThemeUnchanged: true,
          lightThemeOverlapProtected: true,
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
