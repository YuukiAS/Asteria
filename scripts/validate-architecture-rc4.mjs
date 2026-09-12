import fs from "node:fs/promises"
import path from "node:path"
import { createServer } from "vite"

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

async function exists(file) {
  try {
    await fs.access(file)
    return true
  } catch {
    return false
  }
}

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const resolved = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await listFiles(resolved)))
    else files.push(resolved)
  }
  return files
}

async function readActiveUiSource() {
  const dirs = ["src/app", "src/components", "src/architecture"]
  const files = []
  for (const dir of dirs) files.push(...(await listFiles(dir)))
  const source = []
  for (const file of files.filter((item) => /\.(tsx?|css)$/.test(item))) {
    source.push(`\n/* ${file} */\n${await read(file)}`)
  }
  return source.join("\n")
}

const legacyComponentFiles = [
  "BlockHeaderSelect.tsx",
  "BlockNode.tsx",
  "Canvas.tsx",
  "ColorPickerRow.tsx",
  "EdgeInspector.tsx",
  "EquationDialog.tsx",
  "FieldSelect.tsx",
  "FontSizeSelect.tsx",
  "GroupNode.tsx",
  "ImageLinkDialog.tsx",
  "InspectorPanel.tsx",
  "InspectorSectionStack.tsx",
  "RichTextBubbleMenu.tsx",
  "RichTextEditor.tsx",
  "RichTextPreview.tsx",
  "RichTextToolbar.tsx",
  "StoryOutlinePanel.tsx",
  "SymbolEntries.tsx",
  "Toolbar.tsx",
  "VersionStrip.tsx",
]

const archivedScripts = [
  "validate-edge-handles.mjs",
  "validate-rich-text-behavior.mjs",
  "validate-image-link-story-export.mjs",
  "validate-shared-save-feedback.mjs",
  "validate-list-shift-tab-browser.mjs",
  "validate-image-link-browser.mjs",
  "validate-search-clicks.mjs",
]

function relationByEndpoints(project, sourceId, targetId) {
  return Object.values(project.relations).find((relation) => relation.sourceId === sourceId && relation.targetId === targetId)
}

const vite = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "silent",
})

try {
  const appSource = await read("src/app/App.tsx")
  const panelSource = await read("src/components/ArchitectureReferencePanel.tsx")
  const sessionSource = await read("src/architecture/session.tsx")
  const activeUiSource = await readActiveUiSource()
  const archiveReadme = await read("archive/asteria-v1-ui/README.md")

  for (const required of ["asteria-v2-root-shell", "Asteria 2.0", "Project: CAT-TRACE", "ArchitectureWorkspace", "ArchitectureReferencePanel", "ArchitectureSessionProvider"]) {
    assert(appSource.includes(required), `App root shell must include ${required}.`)
  }
  assert(appSource.includes('const appVersion = "2.0.0-rc.5"'), "App shell must display 2.0.0-rc.5.")
  for (const forbidden of ["../components/Canvas", "../components/Toolbar", "../components/InspectorPanel", "../components/StoryOutlinePanel", "useMapStore", "ReactFlowProvider", "Choose a starting version", "Use shared version", "New from scratch"]) {
    assert(!appSource.includes(forbidden), `App root shell must not contain legacy startup/live UI reference: ${forbidden}.`)
  }

  for (const forbidden of ["Choose a starting version", "Use shared version", "New from scratch", "legacy-import-check", "Legacy V1", "runLegacyCompatibilityCheck", "buildStoryMarkdown"]) {
    assert(!activeUiSource.includes(forbidden), `Active 2.0 UI source must not expose legacy live entry: ${forbidden}.`)
  }
  assert(panelSource.includes('{ id: "original-trace", label: "Original TRACE" }'), "Original TRACE must remain a formal model selector.")
  assert(panelSource.includes('{ id: "cat-trace-frozen-v2", label: "CAT-TRACE Frozen V2" }'), "CAT-TRACE Frozen V2 must remain a formal model selector.")
  for (const view of ["view-architecture", "view-lineage", "view-evidence"]) {
    assert(panelSource.includes(`data-testid={\`view-`), "Research view selector must be data-testable.")
    assert(activeUiSource.includes(view), `${view} must be available as first-level navigation.`)
  }

  assert(sessionSource.includes('localViewStateKey = "asteria-v2-rc-view-state"'), "2.0 session persistence key must stay scoped to Asteria 2.0.")
  assert(sessionSource.includes('"cat-trace-frozen-v2"'), "Initial model must default to CAT-TRACE Frozen V2.")
  assert(sessionSource.includes("symbol:cat-trace-frozen-v2:betaU_gh"), "Initial selected symbol must default to beta^U_gh.")

  for (const file of legacyComponentFiles) {
    assert(!(await exists(path.join("src/components", file))), `${file} must not remain under active src/components.`)
    assert(await exists(path.join("archive/asteria-v1-ui/src/components", file)), `${file} must be archived.`)
  }
  assert(await exists("src/editor/editorUtils.ts"), "v1 parser compatibility helper editorUtils.ts must remain active.")
  assert(!(await exists("src/editor/createEditorExtensions.ts")), "Legacy live editor runtime must not remain under active src/editor.")
  assert(await exists("archive/asteria-v1-ui/src/editor/createEditorExtensions.ts"), "Legacy editor runtime must be archived.")
  assert(!(await exists("src/store/useMapStore.ts")), "Legacy live map store must not remain under active src/store.")
  assert(await exists("archive/asteria-v1-ui/src/store/useMapStore.ts"), "Legacy live map store must be archived.")
  for (const script of archivedScripts) {
    assert(!(await exists(path.join("scripts", script))), `${script} must not remain as active 2.0 regression.`)
    assert(await exists(path.join("archive/asteria-v1-ui/scripts", script)), `${script} must be archived.`)
  }

  for (const required of ["v1.0.0", "historical", "not imported", "not provide a hidden Legacy Canvas live mode", "v1 -> v2 migration"]) {
    assert(archiveReadme.includes(required), `Archive README must document: ${required}.`)
  }

  const [{ canonicalTraceProjects }, { catTraceMultiViewProject, multiViewIds }, { buildProjectionLayout }, { migrateV1MapToArchitectureProjectV2 }, { legacyV1FreezeMap }] = await Promise.all([
    vite.ssrLoadModule("/src/architecture/fixtures/canonicalTraceFixtures.ts"),
    vite.ssrLoadModule("/src/architecture/fixtures/multiViewTraceProject.ts"),
    vite.ssrLoadModule("/src/architecture/viewProjection.ts"),
    vite.ssrLoadModule("/src/architecture/migration.ts"),
    vite.ssrLoadModule("/src/fixtures/legacyV1FreezeMap.ts"),
  ])

  const original = canonicalTraceProjects["original-trace"]
  const cat = canonicalTraceProjects["cat-trace-frozen-v2"]
  const originalLayout = buildProjectionLayout(original, multiViewIds.architecture)
  const catLayout = buildProjectionLayout(cat, multiViewIds.architecture)
  const lineageLayout = buildProjectionLayout(catTraceMultiViewProject, multiViewIds.lineage)
  const evidenceLayout = buildProjectionLayout(catTraceMultiViewProject, multiViewIds.evidence)

  assert(originalLayout.nodes.some((node) => node.entityId === "entity:original-trace:y_ij"), "Original TRACE projection must include y_ij.")
  assert(!originalLayout.nodes.some((node) => node.entityId.includes("cat-trace-frozen-v2")), "Original TRACE projection must not include CAT-TRACE nodes.")
  assert(catLayout.nodes.some((node) => node.entityId === "entity:cat-trace-frozen-v2:betaU_gh"), "CAT-TRACE projection must include beta^U_gh.")
  assert(catLayout.nodes.some((node) => node.entityId === "entity:cat-trace-frozen-v2:p_g"), "CAT-TRACE projection must include p_g.")
  assert(!catLayout.nodes.some((node) => node.entityId.includes("original-trace")), "CAT-TRACE projection must not include Original TRACE nodes.")
  assert(lineageLayout.edges.length === 5, "Lineage must render typed relation edges.")
  assert(evidenceLayout.edges.length === 8, "Evidence must render typed relation edges.")
  assert(relationByEndpoints(cat, "entity:cat-trace-frozen-v2:nu", "entity:cat-trace-frozen-v2:betaU_gh"), "CAT-TRACE must retain beta^U_gh upstream relation from nu.")

  const migrated = migrateV1MapToArchitectureProjectV2(legacyV1FreezeMap)
  assert(migrated.legacy?.payload?.version === 1, "v1 -> v2 migration must retain legacy schema version.")
  assert(migrated.legacy?.storyOutline?.length === legacyV1FreezeMap.storyOutline.length, "v1 -> v2 migration must retain Story outline compatibility.")

  if (!process.exitCode) {
    console.log(
      JSON.stringify(
        {
          status: "validated",
          version: "2.0.0-rc.5",
          rootShell: "Asteria 2.0",
          archivedLegacyComponents: legacyComponentFiles.length,
          archivedLegacyScripts: archivedScripts.length,
          initialModel: "cat-trace-frozen-v2",
          initialSelectedSymbol: "beta^U_gh",
          originalNodes: originalLayout.nodes.length,
          catNodes: catLayout.nodes.length,
          lineageRelations: lineageLayout.edges.length,
          evidenceRelations: evidenceLayout.edges.length,
          legacyMigrationCompatibility: "preserved",
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
  await vite.close()
  process.exit(process.exitCode ?? 0)
}
