import fs from "node:fs"
import path from "node:path"

function fail(message) {
  console.error(message)
  process.exitCode = 1
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function read(relativePath) {
  return fs.readFileSync(path.resolve(relativePath), "utf8")
}

const productPaths = [
  "docs/product/ROADMAP.md",
  "docs/product/TODO.md",
  "docs/product/VERSIONING.md",
]

const activeMarkdown = [
  "README.md",
  ...productPaths,
  "docs/design/ASTERIA_PRODUCT_FAMILY_BOUNDARY.md",
  "docs/design/accepted-concepts/README.md",
]

const packageJson = JSON.parse(read("package.json"))
const readme = read("README.md")
const roadmap = read(productPaths[0])
const todo = read(productPaths[1])
const versioning = read(productPaths[2])
const appSource = read("src/app/App.tsx")

for (const oldRootPath of ["ROADMAP.md", "TODO.md", "VERSIONING.md"]) {
  assert(!fs.existsSync(oldRootPath), `${oldRootPath} must move out of the repository root.`)
}
for (const productPath of productPaths) {
  assert(fs.existsSync(productPath), `${productPath} must exist.`)
}

assert(packageJson.version === "2.0.0-rc.19", "Repository cleanup must not change the application version.")
assert(appSource.includes('const appVersion = "2.0.0-rc.19"'), "Repository cleanup must not change the active shell version.")
assert(packageJson.scripts["test:repository-entry"] === "node scripts/validate-repository-entry.mjs", "package.json must expose repository-entry validation.")
assert(packageJson.scripts["test:regression"].startsWith("npm run test:product-family-boundary && npm run test:repository-entry &&"), "Cumulative regression must include both repository boundary validators.")

for (const requiredText of [
  "Asteria is a family of tools",
  "The current implementation is **Asteria 2.0**",
  "Asteria Atlas",
  "Asteria Blueprint",
  "Active release candidate",
  "Planned; the first phase uses an independent Markdown/YAML knowledge repository with Obsidian",
  "Planned; awaits authoritative Design Assurance contracts",
  "https://asteria.httpwwwcardiacnexus-ukb.com/",
  "docs/product/ROADMAP.md",
  "docs/product/TODO.md",
  "docs/product/VERSIONING.md",
]) {
  assert(readme.includes(requiredText), `README is missing repository-entry fact: ${requiredText}`)
}
assert(!readme.includes("Asteria now supports Atlas and Blueprint"), "README must not claim planned products are implemented.")
assert(!readme.includes("npm run test:architecture-rc"), "README must not duplicate the full RC command history.")

assert(roadmap.includes("## 近期方向") && roadmap.includes("## 中期方向") && roadmap.includes("## 长期方向"), "ROADMAP must organize product direction by horizon.")
assert(!roadmap.includes("type StatisticalObjectKind"), "ROADMAP must not duplicate detailed schema drafts.")
assert(todo.includes("## 下一项唯一建议动作"), "TODO must expose one immediate next action.")
assert(todo.includes("创建独立的 Asteria Atlas 知识仓库"), "TODO next action must start from a real Atlas repository and content set.")
assert(!todo.includes("type StatisticalSymbol ="), "TODO must not retain completed historical schema drafts.")
assert(versioning.includes("## 发布规则") && versioning.includes("## 兼容承诺"), "VERSIONING must own release and compatibility rules.")
assert(!versioning.includes("## 近期方向") && !versioning.includes("## 下一项唯一建议动作"), "VERSIONING must not contain roadmap or TODO responsibilities.")

const markdownLinkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g
const checkedLinks = []
for (const markdownPath of activeMarkdown) {
  const content = read(markdownPath)
  for (const match of content.matchAll(markdownLinkPattern)) {
    const rawTarget = match[1].trim().replace(/^<|>$/g, "")
    if (!rawTarget || rawTarget.startsWith("#") || /^(?:https?:|mailto:)/.test(rawTarget)) continue
    const targetWithoutAnchor = rawTarget.split("#", 1)[0]
    if (!targetWithoutAnchor) continue
    const resolved = path.resolve(path.dirname(markdownPath), decodeURIComponent(targetWithoutAnchor))
    assert(fs.existsSync(resolved), `${markdownPath} has a missing local link target: ${rawTarget}`)
    checkedLinks.push(`${markdownPath} -> ${rawTarget}`)
  }
}

for (const speculativePath of ["src/core", "src/atlas", "src/blueprint"]) {
  assert(!fs.existsSync(speculativePath), `${speculativePath} must not appear during repository cleanup.`)
}

if (!process.exitCode) {
  console.log(
    JSON.stringify(
      {
        status: "validated",
        version: packageJson.version,
        productDocuments: productPaths,
        activeMarkdownFilesChecked: activeMarkdown.length,
        localLinksChecked: checkedLinks.length,
        rootProductMaintenanceDocuments: 0,
        sourceNamespacesAdded: 0,
      },
      null,
      2,
    ),
  )
}

process.exit(process.exitCode ?? 0)
