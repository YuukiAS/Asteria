import { chromium, expect } from "@playwright/test"
import fs from "node:fs/promises"
import path from "node:path"

const baseUrl = process.env.ASTERIA_BASE_URL || "http://127.0.0.1:5173/"
const round = process.env.ASTERIA_SELF_QA_ROUND || process.argv[2] || "round1"
const outDir = path.resolve("results/asteria_v2_rc13_graph_presentation_foundation/screenshots")

async function ensureLightTheme(page) {
  const theme = await page.locator("html").getAttribute("data-theme")
  if (theme !== "light") await page.getByTestId("topbar-toggle-theme").click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light")
}

async function ensureDarkTheme(page) {
  const theme = await page.locator("html").getAttribute("data-theme")
  if (theme !== "dark") await page.getByTestId("topbar-toggle-theme").click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")
}

async function gotoFresh(page) {
  await page.addInitScript(() => {
    window.localStorage.removeItem("asteria-v2-rc-view-state")
    window.localStorage.setItem("asteria-theme", "dark")
  })
  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 30_000 })
  await expect(page.getByTestId("asteria-v2-root-shell")).toBeVisible()
}

async function screenshot(page, name) {
  await page.screenshot({ path: path.join(outDir, `${round}-${name}.png`), fullPage: false })
}

function fixturePage(title, body) {
  return `<!doctype html>
<html data-theme="dark">
  <head>
    <meta charset="utf-8" />
    <style>
      body { margin: 0; background: #101827; color: #e5edf7; font-family: Inter, system-ui, sans-serif; }
      .stage { position: relative; width: 1100px; height: 720px; margin: 40px auto; border: 1px solid #334155; background: #111c2e; }
      h1 { position: absolute; left: 24px; top: 12px; margin: 0; font-size: 16px; }
      svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
      .node { position: absolute; display: grid; place-items: center; transform: translate(-50%, -50%); width: 110px; min-height: 64px; border: 1px solid #64748b; border-radius: 6px; background: #1e293b; text-align: center; font-size: 12px; }
      .edge { fill: none; stroke: #60a5fa; stroke-width: 1.4; vector-effect: non-scaling-stroke; opacity: 0.82; }
      .chip { position: absolute; transform: translate(-50%, -50%); border: 1px solid #475569; border-radius: 999px; background: #162033; padding: 4px 8px; font-size: 11px; white-space: nowrap; }
    </style>
  </head>
  <body><div class="stage"><h1>${title}</h1>${body}</div></body>
</html>`
}

async function renderGenericLayoutFixture(page) {
  await page.goto(baseUrl)
  const body = await page.evaluate(async () => {
    const presentation = await import("/src/architecture/graphPresentation.ts")
    const nodes = [
      ["o1", "observation", 0, 0],
      ["o2", "observation", 0, 120],
      ["m1", "measurement", 160, 20],
      ["m2", "measurement", 170, 140],
      ["l1", "latent", 360, 0],
      ["l2", "latent", 360, 110],
      ["p1", "parameterization", 560, 20],
      ["p2", "parameterization", 560, 140],
      ["i1", "inference", 740, 80],
      ["t1", "target", 920, 80],
    ].map(([entityId, layer, x, y]) => ({ entityId, layer, projection: { position: { x, y } } }))
    const layout = presentation.layoutArchitectureLanes(nodes, (node) => node.layer, { width: 1080, minHeight: 680, nodeWidth: 110, nodeHeight: 64 })
    const byId = new Map(layout.nodes.map((node) => [node.entityId, node]))
    const rects = layout.nodes.map((node) => ({ id: node.entityId, x: node.x, y: node.y, width: node.width, height: node.height, lane: node.lane }))
    const relations = [
      ["o1", "m1"],
      ["o2", "m2"],
      ["m1", "l1"],
      ["m2", "l1"],
      ["l1", "i1"],
      ["p1", "i1"],
      ["p2", "i1"],
      ["i1", "t1"],
    ]
    const edges = relations
      .map(([sourceId, targetId], index) => {
        const source = byId.get(sourceId)
        const target = byId.get(targetId)
        const routed = presentation.routeBoundaryEdge(source, target, { targetPortIndex: index % 3, targetPortCount: targetId === "i1" ? 3 : 1, obstacles: rects })
        return `<path class="edge" d="${routed.path}" />`
      })
      .join("")
    const cards = layout.nodes.map((node) => `<div class="node" style="left:${node.x}px;top:${node.y}px">${node.entityId}<br />lane ${node.lane}</div>`).join("")
    return `<svg viewBox="0 0 ${layout.width} ${layout.height}">${edges}</svg>${cards}`
  })
  await page.setContent(fixturePage("RC13 generic multi-lane graph fixture", body))
}

async function renderGenericProvenanceFixture(page) {
  await page.goto(baseUrl)
  const body = await page.evaluate(async () => {
    const presentation = await import("/src/architecture/graphPresentation.ts")
    const layout = presentation.layoutProvenanceFlow([
      { id: "s1", label: "First source", copy: "Longer provenance copy", chips: ["Extends"], relationIds: ["r1"], relationType: "extends" },
      { id: "s2", label: "Second source", copy: "Another source", chips: ["Preserves", "Borrows"], relationIds: ["r2", "r3"], relationType: "preserves" },
      { id: "s3", label: "Third source", copy: "Inference method", chips: ["Computes"], relationIds: ["r4"], relationType: "computes" },
      { id: "s4", label: "Fourth source", copy: "Sparse prior", chips: ["Shrinks"], relationIds: ["r5"], relationType: "shrinks" },
      { id: "s5", label: "Fifth source", copy: "Dataset evidence", chips: ["Validates"], relationIds: ["r6"], relationType: "validates" },
      { id: "s6", label: "Sixth source", copy: "Negative control", chips: ["Constrains"], relationIds: ["r7"], relationType: "constrains" },
    ])
    const paths = layout.sources.map((source) => `<path class="edge" d="${source.path}" />`).join("")
    const sources = layout.sources.map((source) => `<div class="node" style="left:${source.rect.x}px;top:${source.rect.y}px;width:${source.rect.width}px;min-height:${source.rect.height}px">${source.label}</div>`).join("")
    const chips = layout.sources.flatMap((source) => source.chipsLayout.map((chip) => `<span class="chip" style="left:${chip.x}px;top:${chip.y}px">${chip.label}</span>`)).join("")
    const target = `<div class="node" style="left:${layout.target.x}px;top:${layout.target.y}px;width:${layout.target.width}px;min-height:${layout.target.height}px">Generic target</div>`
    return `<svg viewBox="0 0 ${layout.width} ${layout.height}">${paths}</svg>${sources}${chips}${target}`
  })
  await page.setContent(fixturePage("RC13 generic provenance fixture", body))
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1536, height: 864 } })

try {
  await fs.mkdir(outDir, { recursive: true })
  await gotoFresh(page)

  await page.setViewportSize({ width: 1536, height: 864 })
  await ensureDarkTheme(page)
  await page.getByTestId("model-cat-trace-frozen-v2").click()
  await page.getByTestId("detail-overview").click()
  await page.getByTestId("symbol-betaU_gh").click()
  await screenshot(page, "cat-overview-selected-1536")

  await page.setViewportSize({ width: 1366, height: 768 })
  await ensureLightTheme(page)
  await page.getByTestId("trace-mode").selectOption("recursive")
  await page.getByTestId("trace-direction").selectOption("both")
  if ((await page.getByTestId("architecture-workspace-stage").getAttribute("data-trace-enabled")) !== "true") {
    await page.getByTestId("enable-trace").click()
  }
  await screenshot(page, "cat-overview-trace-1366")

  await page.setViewportSize({ width: 1536, height: 864 })
  await ensureDarkTheme(page)
  await page.getByTestId("detail-full-model").click()
  await screenshot(page, "cat-full-fit-1536")

  await page.getByTestId("model-original-trace").click()
  await page.getByTestId("detail-overview").click()
  await screenshot(page, "original-trace-1536")

  await page.getByTestId("model-cat-trace-frozen-v2").click()
  await page.getByTestId("view-lineage").click()
  await screenshot(page, "lineage-1536")

  await page.setViewportSize({ width: 1366, height: 768 })
  await screenshot(page, "lineage-1366")

  await page.setViewportSize({ width: 1536, height: 864 })
  await page.getByTestId("view-evidence").click()
  await screenshot(page, "evidence-1536")

  await renderGenericLayoutFixture(page)
  await screenshot(page, "generic-layout-fixture")

  await renderGenericProvenanceFixture(page)
  await screenshot(page, "generic-provenance-fixture")

  console.log(JSON.stringify({ status: "screenshots-captured", round, outDir }, null, 2))
} finally {
  await browser.close()
}
