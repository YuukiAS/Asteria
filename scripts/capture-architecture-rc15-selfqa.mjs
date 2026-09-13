import { chromium, expect } from "@playwright/test"
import fs from "node:fs/promises"
import path from "node:path"

const baseUrl = process.env.ASTERIA_BASE_URL || "http://127.0.0.1:5173/"
const round = process.env.ASTERIA_SELF_QA_ROUND || process.argv[2] || "round1"
const outDir = path.resolve("results/asteria_v2_rc15_visual_system/screenshots")

async function ensureTheme(page, theme) {
  const current = await page.locator("html").getAttribute("data-theme")
  if (current !== theme) await page.getByTestId("topbar-toggle-theme").click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme)
}

async function gotoFresh(page) {
  await page.addInitScript(() => {
    window.localStorage.removeItem("asteria-v2-rc-view-state")
    window.localStorage.setItem("asteria-theme", "dark")
  })
  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 30_000 })
  await expect(page.getByTestId("asteria-v2-root-shell")).toBeVisible()
  await expect(page.getByText("2.0.0-rc.15")).toBeVisible()
}

async function screenshot(page, name) {
  await page.screenshot({ path: path.join(outDir, `${round}-${name}.png`), fullPage: false })
}

async function renderGenericRouteFixture(page) {
  await page.goto(baseUrl, { waitUntil: "networkidle" })
  const body = await page.evaluate(async () => {
    const presentation = await import("/src/architecture/graphPresentation.ts")
    const nodes = [
      { id: "source", x: 96, y: 80, width: 120, height: 72 },
      { id: "mid", x: 360, y: 220, width: 138, height: 76 },
      { id: "target", x: 690, y: 80, width: 134, height: 72 },
      { id: "obstacle", x: 360, y: 300, width: 170, height: 86 },
      { id: "target-lower", x: 690, y: 300, width: 142, height: 72 },
    ]
    const rect = (id) => nodes.find((node) => node.id === id)
    const simple = presentation.routeBoundaryEdge(rect("source"), rect("target"), { obstacles: nodes })
    const obstacle = presentation.routeBoundaryEdge(rect("source"), rect("target-lower"), { obstacles: nodes })
    const cards = nodes
      .map((node) => `<div class="fixture-card" style="left:${node.x}px;top:${node.y}px;width:${node.width}px;min-height:${node.height}px"><strong>${node.id}</strong><span>${node.id === "obstacle" ? "Obstacle card" : "Scientific node"}</span></div>`)
      .join("")
    const paths = [simple, obstacle]
      .map((route, index) => `<path class="fixture-route fixture-route-${route.grammar}" d="${route.path}" data-route-grammar="${route.grammar}" data-route-bend-count="${route.bendCount}" data-route-score="${route.routeScore}" marker-end="url(#fixture-arrow)" />`)
      .join("")
    return `<svg viewBox="0 0 820 460"><defs><marker id="fixture-arrow" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" refX="7.25" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" /></marker></defs>${paths}</svg>${cards}`
  })
  await page.setContent(`<!doctype html><html><head><style>
    body { margin: 0; background: #f8fafc; font-family: Inter, system-ui, sans-serif; }
    .fixture-stage { position: relative; width: 820px; height: 460px; margin: 44px auto; border: 1px solid #cbd5e1; border-radius: 8px; background: #eef2f7; overflow: hidden; }
    svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
    .fixture-route { fill: none; stroke: #2563eb; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.35px; vector-effect: non-scaling-stroke; opacity: .78; }
    .fixture-route-rounded-orthogonal { stroke: #0f766e; }
    marker path { fill: context-stroke; }
    .fixture-card { position: absolute; display: grid; align-content: center; gap: 4px; transform: translate(-50%, -50%); border: 1px solid #94a3b8; border-radius: 8px; background: rgba(255,255,255,.96); color: #0f172a; padding: 10px 14px; box-shadow: 0 1px 4px rgba(15,23,42,.08); box-sizing: border-box; }
    .fixture-card strong { font-size: 13px; }
    .fixture-card span { font-size: 11px; color: #475569; }
  </style></head><body><div class="fixture-stage">${body}</div></body></html>`)
}

async function renderGenericProvenanceFixture(page, sourceCount) {
  await page.goto(baseUrl, { waitUntil: "networkidle" })
  const body = await page.evaluate(async (sourceCount) => {
    const presentation = await import("/src/architecture/graphPresentation.ts")
    const allSources = [
      { id: "s1", label: "First source", copy: "Source evidence", chips: ["Extends"], relationIds: ["r1"], relationType: "extends" },
      { id: "s2", label: "Second source", copy: "Method prior", chips: ["Preserves", "Borrows"], relationIds: ["r2", "r3"], relationType: "preserves" },
      { id: "s3", label: "Third source", copy: "Inference method", chips: ["Computes"], relationIds: ["r4"], relationType: "computes" },
      { id: "s4", label: "Fourth source", copy: "Sparse prior", chips: ["Shrinks"], relationIds: ["r5"], relationType: "shrinks" },
      { id: "s5", label: "Fifth source", copy: "Dataset evidence", chips: ["Validates"], relationIds: ["r6"], relationType: "validates" },
      { id: "s6", label: "Sixth source", copy: "Negative control", chips: ["Constrains"], relationIds: ["r7"], relationType: "constrains" },
    ].slice(0, sourceCount)
    const layout = presentation.layoutProvenanceFlow(allSources, { width: 920, height: 620, sourceWidth: 218, targetWidth: 228 })
    const paths = layout.sources.map((source) => `<path class="lineage-presentation-connector" d="${source.path}" data-lineage-connector="${source.id}" data-source-id="${source.id}" />`).join("")
    const sources = layout.sources.map((source) => `<div class="lineage-presentation-card" style="left:${source.rect.x}px;top:${source.rect.y}px;width:${source.rect.width}px;min-height:${source.rect.height}px"><strong>${source.label}</strong><span>${source.copy}</span></div>`).join("")
    const groups = layout.sources
      .map((source) => `<span class="lineage-relation-label-group" data-lineage-label-group="true" data-source-id="${source.id}" data-label-count="${source.labelGroup.labels.length}" style="left:${source.labelGroup.x}px;top:${source.labelGroup.y}px">${source.labelGroup.labels.map((label) => `<span>${label}</span>`).join("")}</span>`)
      .join("")
    const target = `<div class="lineage-presentation-card lineage-presentation-target-card" style="left:${layout.target.x}px;top:${layout.target.y}px;width:${layout.target.width}px;min-height:${layout.target.height}px"><strong>Generic target</strong><span>${sourceCount} sources</span></div>`
    return `<svg class="lineage-presentation-connectors" viewBox="0 0 ${layout.width} ${layout.height}" aria-hidden="true">${paths}</svg><div class="lineage-presentation-sources">${sources}</div><div class="lineage-presentation-chip-layer">${groups}</div>${target}`
  }, sourceCount)
  await page.setContent(`<!doctype html><html><head><style>
    body { margin: 0; background: #111827; font-family: Inter, system-ui, sans-serif; }
    .fixture-stage { position: relative; width: 920px; height: 620px; margin: 64px auto; border: 1px solid #334155; background: #0f172a; overflow: hidden; }
    .lineage-presentation-connectors { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; z-index: 10; pointer-events: none; }
    .lineage-presentation-connector { fill: none; stroke: #38bdf8; stroke-linecap: round; stroke-width: 1.4px; vector-effect: non-scaling-stroke; opacity: .84; }
    .lineage-presentation-sources, .lineage-presentation-chip-layer { position: absolute; inset: 0; }
    .lineage-presentation-card { position: absolute; display: grid; align-content: center; gap: 4px; transform: translate(-50%, -50%); border: 1px solid #64748b; border-radius: 7px; background: #1e293b; color: #e5edf7; padding: 10px 14px; text-align: left; box-sizing: border-box; }
    .lineage-presentation-card strong { font-size: 13px; line-height: 18px; }
    .lineage-presentation-card span { font-size: 11px; color: #cbd5e1; }
    .lineage-relation-label-group { position: absolute; display: inline-flex; gap: 4px; transform: translate(-50%, -50%); border: 1px solid #475569; border-radius: 7px; background: rgba(30,41,59,.96); color: #cbd5e1; padding: 4px 6px; font-size: 10px; font-weight: 700; white-space: nowrap; box-shadow: 0 1px 8px rgba(2,6,23,.26); }
    .lineage-relation-label-group span { border: 1px solid #475569; border-radius: 4px; background: rgba(15,23,42,.7); padding: 2px 6px; }
  </style></head><body><div class="fixture-stage"><div class="lineage-presentation" data-testid="lineage-presentation">${body}</div></div></body></html>`)
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1536, height: 864 } })

try {
  await fs.mkdir(outDir, { recursive: true })
  await gotoFresh(page)

  await page.setViewportSize({ width: 1536, height: 864 })
  await ensureTheme(page, "dark")
  await page.getByTestId("model-cat-trace-frozen-v2").click()
  await page.getByTestId("detail-overview").click()
  await screenshot(page, "cat-overview-selected-1536-dark")

  await page.setViewportSize({ width: 1366, height: 768 })
  await ensureTheme(page, "light")
  await page.getByTestId("symbol-betaU_gh").click()
  if ((await page.getByTestId("architecture-workspace-stage").getAttribute("data-trace-enabled")) !== "true") await page.getByTestId("enable-trace").click()
  await page.getByTestId("trace-mode").selectOption("recursive")
  await page.getByTestId("trace-direction").selectOption("both")
  await screenshot(page, "cat-overview-trace-1366-light")

  await page.setViewportSize({ width: 1536, height: 864 })
  await ensureTheme(page, "dark")
  await page.getByTestId("detail-full-model").click()
  await screenshot(page, "cat-full-fit-1536-dark")

  await page.getByTestId("detail-overview").click()
  await page.getByTestId("model-original-trace").click()
  await screenshot(page, "original-trace-1536-dark")

  await page.getByTestId("model-cat-trace-frozen-v2").click()
  await page.getByTestId("view-lineage").click()
  await screenshot(page, "lineage-1536-dark")
  await page.setViewportSize({ width: 1366, height: 768 })
  await screenshot(page, "lineage-1366-dark")

  await page.getByTestId("view-evidence").click()
  await page.setViewportSize({ width: 1536, height: 864 })
  await screenshot(page, "evidence-1536-dark")
  await page.setViewportSize({ width: 1366, height: 768 })
  await screenshot(page, "evidence-1366-dark")
  await page.getByTestId("architecture-reference-panel").evaluate((element) => {
    element.scrollTop = 0
  })
  await screenshot(page, "evidence-inspector-first-screen-1366")

  await page.setViewportSize({ width: 1120, height: 760 })
  await renderGenericRouteFixture(page)
  await screenshot(page, "generic-route-fixture")
  await renderGenericProvenanceFixture(page, 6)
  await screenshot(page, "generic-provenance-fixture")

  console.log(JSON.stringify({ status: "screenshots-captured", round, outDir }, null, 2))
} finally {
  await browser.close()
}
