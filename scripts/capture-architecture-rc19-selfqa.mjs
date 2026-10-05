import { chromium, expect } from "@playwright/test"
import fs from "node:fs/promises"
import path from "node:path"

const baseUrl = process.env.ASTERIA_SELF_QA_URL || "http://127.0.0.1:5173/"
const outputDir = process.env.ASTERIA_SELF_QA_DIR || "results/asteria--rc19-layout-first-graph-convergence/screenshots/final"

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts?.ready
    for (let index = 0; index < 10; index += 1) await new Promise((resolve) => requestAnimationFrame(resolve))
  })
}

async function setTheme(page, theme) {
  const current = await page.locator("html").getAttribute("data-theme")
  if (current !== theme) {
    await page.getByTestId("topbar-toggle-theme").click()
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme)
  }
}

async function setTrace(page, enabled) {
  const stage = page.getByTestId("architecture-workspace-stage")
  const current = (await stage.getAttribute("data-trace-enabled")) === "true"
  if (current !== enabled) {
    if (enabled) await page.getByTestId("enable-trace").click()
    else await page.getByTestId("clear-architecture-selection").click()
    await expect(stage).toHaveAttribute("data-trace-enabled", enabled ? "true" : "false")
  }
}

async function screenshot(page, name) {
  await settle(page)
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: false })
}

async function captureSyntheticLayeredGraph(page) {
  await page.goto(baseUrl, { waitUntil: "networkidle" })
  const data = await page.evaluate(async () => {
    const presentation = await import("/src/architecture/graphPresentation.ts")
    const nodes = [
      ["s1", "observation", 0, 30],
      ["s2", "observation", 0, 170],
      ["m1", "measurement", 140, 40],
      ["m2", "measurement", 140, 180],
      ["l1", "latent", 320, 60],
      ["l2", "latent", 320, 200],
      ["p1", "parameterization", 520, 80],
      ["i1", "inference", 720, 130],
      ["t1", "target", 920, 130],
    ].map(([entityId, layer, x, y]) => ({ entityId, layer, projection: { position: { x, y } } }))
    const relations = [
      { sourceId: "s1", targetId: "m1" },
      { sourceId: "s2", targetId: "m2" },
      { sourceId: "m1", targetId: "l1" },
      { sourceId: "m2", targetId: "l2" },
      { sourceId: "l1", targetId: "i1" },
      { sourceId: "l2", targetId: "i1" },
      { sourceId: "p1", targetId: "i1" },
      { sourceId: "i1", targetId: "t1" },
    ]
    const layout = presentation.layoutArchitectureLanes(nodes, (node) => node.layer, { width: 1080, minHeight: 650, nodeWidth: 112, nodeHeight: 70, relationPairs: relations })
    const byId = new Map(layout.nodes.map((node) => [node.entityId, node]))
    const edges = relations.map((relation) => {
      const source = byId.get(relation.sourceId)
      const target = byId.get(relation.targetId)
      return { relation, ...presentation.routeLayeredEdge(source, target) }
    })
    return { layout, edges }
  })
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#0f172a;color:#e5edf7;font:14px Inter,system-ui,sans-serif"><main style="padding:42px"><h1 style="font-size:18px;margin:0 0 20px">Synthetic layout-first layered graph fixture</h1><svg width="1080" height="${data.layout.height}" viewBox="0 0 1080 ${data.layout.height}" style="background:#111827;border:1px solid #334155;border-radius:8px">${data.edges.map((edge) => `<path d="${edge.path}" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>`).join("")}${data.layout.nodes.map((node) => `<g><rect x="${node.x - node.width / 2}" y="${node.y - node.height / 2}" width="${node.width}" height="${node.height}" rx="6" fill="#1f2937" stroke="#94a3b8"/><text x="${node.x}" y="${node.y + 4}" text-anchor="middle" fill="#e5edf7" font-size="13" font-weight="700">${node.entityId}</text></g>`).join("")}</svg></main></body></html>`)
  await screenshot(page, "synthetic-layered-graph-fixture-1366-dark")
}

async function captureSyntheticLineage(page, sourceCount) {
  await page.goto(baseUrl, { waitUntil: "networkidle" })
  const data = await page.evaluate(async (count) => {
    const presentation = await import("/src/architecture/graphPresentation.ts")
    return presentation.layoutProvenanceFlow(
      Array.from({ length: count }, (_, index) => ({ id: `source-${index + 1}`, label: `Source ${index + 1}`, copy: "Synthetic source", chips: [`Relation ${index + 1}`], relationIds: [`relation-${index + 1}`], relationType: "extends" })),
      { width: 1000, height: 620 },
    )
  }, sourceCount)
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#f8fafc;color:#111827;font:14px Inter,system-ui,sans-serif"><main style="padding:42px"><h1 style="font-size:18px;margin:0 0 20px">Synthetic Lineage ${sourceCount}-source fixture</h1><svg width="1000" height="620" viewBox="0 0 1000 620" style="position:absolute">${data.sources.flatMap((source) => [`<path d="${source.sourcePath}" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>`, `<path d="${source.targetPath}" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>`]).join("")}</svg>${data.sources.map((source) => `<div style="position:absolute;left:${42 + source.rect.x - source.rect.width / 2}px;top:${82 + source.rect.y - source.rect.height / 2}px;width:${source.rect.width}px;min-height:${source.rect.height}px;border:1px solid #94a3b8;border-radius:6px;background:white;padding:10px;box-sizing:border-box"><strong>${source.label}</strong><br><span>${source.copy}</span></div><div style="position:absolute;left:${42 + source.relationRect.x - source.relationRect.width / 2}px;top:${82 + source.relationRect.y - source.relationRect.height / 2}px;width:${source.relationRect.width}px;min-height:${source.relationRect.height}px;border:1px solid #38bdf8;border-radius:6px;background:white;padding:10px;box-sizing:border-box;text-align:center"><strong>${source.chips.join(" / ")}</strong><br><span>${source.relationType}</span></div>`).join("")}<div style="position:absolute;left:${42 + data.target.x - data.target.width / 2}px;top:${82 + data.target.y - data.target.height / 2}px;width:${data.target.width}px;min-height:${data.target.height}px;border:1px solid #94a3b8;border-radius:6px;background:white;padding:10px;box-sizing:border-box"><strong>Target</strong><br><span>Provenance target</span></div></main></body></html>`)
  await screenshot(page, `synthetic-lineage-${sourceCount}-source-fixture-1366-light`)
}

await fs.mkdir(outputDir, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1536, height: 864 } })

try {
  await page.addInitScript(() => {
    window.localStorage.removeItem("asteria-v2-rc-view-state")
    window.localStorage.setItem("asteria-theme", "dark")
  })
  await page.goto(baseUrl, { waitUntil: "networkidle" })
  await expect(page.getByText("2.0.0-rc.19")).toBeVisible()
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-active-model", "cat-trace-frozen-v2")
  await setTrace(page, false)
  await screenshot(page, "architecture-cat-overview-1536-dark-trace-off")

  await page.setViewportSize({ width: 1366, height: 768 })
  await setTheme(page, "light")
  await setTrace(page, false)
  await screenshot(page, "architecture-cat-overview-1366-light-trace-off")

  for (const entityId of ["yU_igh", "gamma_g", "betaU_gh", "c_f"]) {
    await page.getByTestId(`projection-node-entity-cat-trace-frozen-v2-${entityId}`).click()
    await settle(page)
  }
  await screenshot(page, "architecture-selection-sequence-final-1366-light-trace-off")

  await setTrace(page, true)
  await page.getByTestId("trace-mode").selectOption("recursive")
  await page.getByTestId("trace-direction").selectOption("both")
  await screenshot(page, "architecture-cat-overview-1366-light-trace-on")

  await setTrace(page, false)
  await page.setViewportSize({ width: 1536, height: 864 })
  await setTheme(page, "dark")
  await page.getByTestId("detail-full-model").click()
  await page.getByRole("button", { name: "Reset full model" }).click()
  await screenshot(page, "architecture-cat-full-reset-1536-dark")

  await page.setViewportSize({ width: 1366, height: 768 })
  await setTheme(page, "light")
  await page.getByRole("button", { name: "Reset full model" }).click()
  await screenshot(page, "architecture-cat-full-reset-1366-light")

  await page.getByTestId("detail-overview").click()
  await page.setViewportSize({ width: 1536, height: 864 })
  await setTheme(page, "dark")
  await page.getByTestId("model-original-trace").click()
  await screenshot(page, "architecture-original-trace-overview-1536-dark")

  await page.getByTestId("model-cat-trace-frozen-v2").click()
  await page.getByTestId("view-lineage").click()
  await screenshot(page, "lineage-1536-dark")
  await page.setViewportSize({ width: 1366, height: 768 })
  await setTheme(page, "light")
  await screenshot(page, "lineage-1366-light")

  await page.setViewportSize({ width: 1536, height: 864 })
  await setTheme(page, "dark")
  await page.getByTestId("view-evidence").click()
  await screenshot(page, "evidence-1536-dark")
  await page.getByTestId("projection-node-entity-evidence-claim-tail-calibration").click()
  await screenshot(page, "evidence-selected-claim-1536-dark")
  await page.getByTestId("projection-node-entity-evidence-data-finland").click()
  await screenshot(page, "evidence-selected-dataset-1536-dark")
  await page.getByTestId("projection-node-entity-evidence-limitation-real-data").click()
  await screenshot(page, "evidence-selected-limitation-1536-dark")

  await captureSyntheticLayeredGraph(page)
  await captureSyntheticLineage(page, 3)
  await captureSyntheticLineage(page, 6)

  console.log(JSON.stringify({ status: "captured", baseUrl, outputDir }, null, 2))
} finally {
  await browser.close()
}
