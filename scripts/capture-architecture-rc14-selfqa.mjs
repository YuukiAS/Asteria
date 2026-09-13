import { chromium, expect } from "@playwright/test"
import fs from "node:fs/promises"
import path from "node:path"

const baseUrl = process.env.ASTERIA_BASE_URL || "http://127.0.0.1:5173/"
const round = process.env.ASTERIA_SELF_QA_ROUND || process.argv[2] || "round1"
const outDir = path.resolve("results/asteria_v2_rc14_responsive_coordinate_space/screenshots")

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

async function renderGenericProvenanceFixture(page, sourceCount) {
  await page.goto(baseUrl)
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
    const sources = layout.sources.map((source) => `<div class="lineage-presentation-card lineage-presentation-source-card" style="left:${source.rect.x}px;top:${source.rect.y}px;width:${source.rect.width}px;min-height:${source.rect.height}px"><strong>${source.label}</strong><span>${source.copy}</span></div>`).join("")
    const chips = layout.sources.flatMap((source) => source.chipsLayout.map((chip) => `<span class="lineage-relation-chip" style="left:${chip.x}px;top:${chip.y}px">${chip.label}</span>`)).join("")
    const target = `<div class="lineage-presentation-card lineage-presentation-target-card" style="left:${layout.target.x}px;top:${layout.target.y}px;width:${layout.target.width}px;min-height:${layout.target.height}px"><strong>Generic target</strong><span>${sourceCount} sources</span></div>`
    return `<svg class="lineage-presentation-connectors" viewBox="0 0 ${layout.width} ${layout.height}" aria-hidden="true">${paths}</svg><div class="lineage-presentation-sources">${sources}</div><div class="lineage-presentation-chip-layer">${chips}</div>${target}`
  }, sourceCount)
  await page.setContent(`<!doctype html><html><head><style>
    body { margin: 0; background: #111827; font-family: Inter, system-ui, sans-serif; }
    .fixture-stage { position: relative; width: 920px; height: 620px; margin: 64px auto; border: 1px solid #334155; background: #0f172a; overflow: hidden; }
    .lineage-presentation { position: absolute; inset: 0; overflow: visible; width: 100%; height: 100%; }
    .lineage-presentation-connectors { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; z-index: 10; pointer-events: none; }
    .lineage-presentation-connector { fill: none; stroke: #38bdf8; stroke-linecap: round; stroke-width: 1.5px; vector-effect: non-scaling-stroke; opacity: .84; }
    .lineage-presentation-sources, .lineage-presentation-chip-layer { position: absolute; inset: 0; }
    .lineage-presentation-card { position: absolute; display: grid; align-content: center; gap: 4px; transform: translate(-50%, -50%); border: 1px solid #64748b; border-radius: 6px; background: #1e293b; color: #e5edf7; padding: 10px 14px; text-align: left; box-sizing: border-box; }
    .lineage-presentation-card strong { font-size: 13px; line-height: 18px; }
    .lineage-presentation-card span { font-size: 11px; color: #cbd5e1; }
    .lineage-relation-chip { position: absolute; transform: translate(-50%, -50%); border: 1px solid #475569; border-radius: 999px; background: #162033; color: #cbd5e1; padding: 4px 8px; font-size: 10px; font-weight: 700; white-space: nowrap; }
  </style></head><body><div class="fixture-stage"><div class="lineage-presentation">${body}</div></div></body></html>`)
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1536, height: 864 } })

try {
  await fs.mkdir(outDir, { recursive: true })
  await gotoFresh(page)

  await page.setViewportSize({ width: 1536, height: 864 })
  await ensureDarkTheme(page)
  await page.getByTestId("model-cat-trace-frozen-v2").click()
  await page.getByTestId("view-lineage").click()
  await screenshot(page, "lineage-1536")

  await page.setViewportSize({ width: 1366, height: 768 })
  await screenshot(page, "lineage-1366")

  await page.setViewportSize({ width: 1536, height: 864 })
  await screenshot(page, "lineage-resize-return-1536")

  await page.getByTestId("view-architecture").click()
  await page.getByTestId("detail-overview").click()
  await page.setViewportSize({ width: 1366, height: 768 })
  await ensureLightTheme(page)
  await screenshot(page, "arch-overview-1366-light")

  await page.getByTestId("symbol-betaU_gh").click()
  if ((await page.getByTestId("architecture-workspace-stage").getAttribute("data-trace-enabled")) !== "true") await page.getByTestId("enable-trace").click()
  await page.getByTestId("trace-mode").selectOption("recursive")
  await page.getByTestId("trace-direction").selectOption("both")
  await screenshot(page, "arch-trace-1366-light")

  await page.setViewportSize({ width: 1536, height: 864 })
  await screenshot(page, "arch-resize-return-1536")

  await page.setViewportSize({ width: 1120, height: 760 })
  await renderGenericProvenanceFixture(page, 3)
  await screenshot(page, "generic-provenance-3-source-fixture")

  await renderGenericProvenanceFixture(page, 6)
  await screenshot(page, "generic-provenance-6-source-fixture")

  console.log(JSON.stringify({ status: "screenshots-captured", round, outDir }, null, 2))
} finally {
  await browser.close()
}
