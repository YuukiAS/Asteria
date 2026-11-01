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

const packageJson = JSON.parse(read("package.json"))
const appSource = read("src/app/App.tsx")
const readme = read("README.md")
const roadmap = read("docs/product/ROADMAP.md")
const todo = read("docs/product/TODO.md")
const boundary = read("docs/design/ASTERIA_PRODUCT_FAMILY_BOUNDARY.md")

assert(packageJson.version === "2.0.0-rc.19", "Product-family maintenance must not change the current release candidate version.")
assert(appSource.includes('const appVersion = "2.0.0-rc.19"'), "The active Asteria 2.0 shell version must remain unchanged.")
assert(packageJson.scripts["test:product-family-boundary"] === "node scripts/validate-product-family-boundary.mjs", "package.json must expose the focused product-family boundary validation.")
assert(packageJson.scripts["test:regression"].startsWith("npm run test:product-family-boundary &&"), "Cumulative regression must include the product-family boundary contract.")

assert(fs.existsSync("src/architecture/types.ts"), "The protected current Asteria 2.0 architecture path must remain available.")
for (const speculativePath of ["src/core", "src/atlas", "src/blueprint"]) {
  assert(!fs.existsSync(speculativePath), `${speculativePath} must not be created before a real product implementation or proven shared consumer exists.`)
}

for (const [file, content] of [
  ["README.md", readme],
  ["docs/product/ROADMAP.md", roadmap],
  ["docs/product/TODO.md", todo],
  ["docs/design/ASTERIA_PRODUCT_FAMILY_BOUNDARY.md", boundary],
]) {
  assert(content.includes("Asteria Atlas"), `${file} must name the Atlas boundary.`)
  assert(content.includes("Asteria Blueprint"), `${file} must name the Blueprint boundary.`)
}

assert(readme.includes("The current implementation is **Asteria 2.0**"), "README must identify the current active product without implying Atlas or Blueprint support.")
assert(readme.includes("but neither is implemented"), "README must expose planned/not-implemented product status.")
assert(readme.includes("https://asteria.httpwwwcardiacnexus-ukb.com/"), "README must preserve the fixed public entry point.")
assert(!readme.includes("Asteria now supports Atlas and Blueprint"), "README must not claim that planned products are supported.")

for (const requiredText of [
  "### ACCEPTED_SHARED_CORE",
  "None at this stage",
  "### REJECTED_PREMATURE_ABSTRACTIONS",
  "canonical authoring format: Markdown/YAML",
  "primary human reading and navigation surface: Obsidian",
  "future frozen Design Assurance outputs",
  "The current Asteria Architecture view is a statistical/scientific model",
  "A capability may enter shared Asteria Core only when all five questions",
]) {
  assert(boundary.includes(requiredText), `Product-family boundary is missing required contract text: ${requiredText}`)
}

assert(roadmap.includes("当前候选版本为 `2.0.0-rc.19`"), "ROADMAP must match the current formal candidate.")
assert(roadmap.includes("没有第二个真实消费者前，不抽取共享业务 Core"), "ROADMAP must record why shared business Core is not extracted.")
assert(todo.includes("下一项唯一建议动作"), "TODO must identify one bounded next product-family action.")
assert(todo.includes("创建独立的 Asteria Atlas 知识仓库"), "TODO must make the independent real-content Atlas repository the next action.")

if (!process.exitCode) {
  console.log(
    JSON.stringify(
      {
        status: "validated",
        version: packageJson.version,
        activeProduct: "Asteria 2.0 scientific architecture product",
        atlas: "boundary-only",
        blueprint: "boundary-only",
        acceptedSharedCore: 0,
        movedExistingSourceModules: 0,
        speculativeSourceNamespaces: 0,
      },
      null,
      2,
    ),
  )
}

process.exit(process.exitCode ?? 0)
