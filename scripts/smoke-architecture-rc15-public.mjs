import { chromium, expect } from "@playwright/test"

const publicUrl = process.env.ASTERIA_PUBLIC_URL || "https://asteria.httpwwwcardiacnexus-ukb.com/"

async function waitForProjectionGeometrySettled(page) {
  await page.evaluate(async () => {
    await document.fonts?.ready
    let previous = ""
    let stableFrames = 0
    for (let index = 0; index < 30 && stableFrames < 4; index += 1) {
      await new Promise((resolve) => requestAnimationFrame(() => resolve()))
      const layer = document.querySelector(".architecture-projection-layer")
      const rect = layer?.getBoundingClientRect()
      const signature = rect ? `${rect.left.toFixed(2)}:${rect.top.toFixed(2)}:${rect.width.toFixed(2)}:${rect.height.toFixed(2)}` : ""
      if (signature === previous) stableFrames += 1
      else {
        previous = signature
        stableFrames = 0
      }
    }
  })
}

async function routeGrammarMetrics(page) {
  await waitForProjectionGeometrySettled(page)
  return page.evaluate(() => {
    const routes = [...document.querySelectorAll(".architecture-map-edge")].map((group) => {
      const path = group.querySelector("path")
      const d = path?.getAttribute("d") || ""
      return {
        grammar: group.getAttribute("data-route-grammar") || "",
        bendCount: Number(group.getAttribute("data-route-bend-count") || "0"),
        hasCubic: d.includes(" C "),
        hasRoundedCorner: d.includes(" Q "),
      }
    })
    return {
      edgeCount: routes.length,
      softCubicCount: routes.filter((route) => route.grammar === "soft-cubic" && route.hasCubic).length,
      roundedOrthogonalCount: routes.filter((route) => route.grammar === "rounded-orthogonal" && route.hasRoundedCorner).length,
      rawDominantOrthogonalCount: routes.filter((route) => route.grammar === "rounded-orthogonal" && route.bendCount > 0 && !route.hasRoundedCorner).length,
      excessiveDetourCount: routes.filter((route) => route.bendCount > 4).length,
    }
  })
}

async function inspectorMetrics(page) {
  return page.evaluate(() => {
    const inspector = document.querySelector('[data-testid="architecture-reference-panel"]')
    const search = document.querySelector(".architecture-search-row")
    const primary = document.querySelector('[data-testid="claim-inspector"], [data-testid="method-inspector"]')
    const nested = [...document.querySelectorAll("[data-testid='architecture-reference-panel'] *")].filter((element) => {
      if (element === inspector) return false
      const style = window.getComputedStyle(element)
      return /(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 2 && element.getBoundingClientRect().height > 0
    })
    const tiny = [...document.querySelectorAll("[data-testid='architecture-reference-panel'] section, [data-testid='architecture-reference-panel'] div")].filter((element) => {
      const rect = element.getBoundingClientRect()
      return rect.height >= 10 && rect.height <= 30 && element.scrollHeight > element.clientHeight + 2
    })
    const searchRect = search?.getBoundingClientRect()
    const primaryRect = primary?.closest("section")?.getBoundingClientRect() || primary?.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    return {
      tinySectionCount: tiny.length,
      nestedVerticalScrollbarCount: nested.length,
      primaryAfterSearchGapPx: searchRect && primaryRect ? Math.round(primaryRect.top - searchRect.bottom) : Infinity,
      primaryFirstScreenVisible: Boolean(primaryRect && primaryRect.top < viewportHeight && primaryRect.bottom > 0),
      duplicateMiniCanvasCount: document.querySelectorAll(".research-view-canvas").length,
    }
  })
}

async function lineageGroupMetrics(page) {
  return page.evaluate(() => {
    const groups = [...document.querySelectorAll("[data-lineage-label-group='true']")].map((group) => ({
      sourceId: group.getAttribute("data-source-id") || "",
      labelCount: Number(group.getAttribute("data-label-count") || "0"),
      text: group.textContent?.trim() || "",
    }))
    return {
      groupCount: groups.length,
      traceGroupCount: groups.filter((group) => group.sourceId === "entity:lineage:trace" && group.labelCount === 2 && group.text.includes("Extends") && group.text.includes("Preserves")).length,
      labels: groups.map((group) => group.text),
    }
  })
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } })
const consoleIssues = []

page.on("console", (message) => {
  if (message.type() === "error") consoleIssues.push(message.text())
})
page.on("pageerror", (error) => consoleIssues.push(error.message))

try {
  await page.addInitScript(() => {
    window.localStorage.removeItem("asteria-v2-rc-view-state")
    window.localStorage.setItem("asteria-theme", "light")
  })
  await page.goto(publicUrl, { waitUntil: "networkidle", timeout: 30_000 })
  await expect(page.getByTestId("asteria-v2-root-shell")).toBeVisible()
  await expect(page.getByText("2.0.0-rc.16")).toBeVisible()
  await expect(page.getByTestId("current-view")).toContainText("Architecture")
  await expect(page.getByTestId("current-model")).toContainText("CAT-TRACE Frozen V2")

  await page.getByTestId("detail-overview").click()
  let routes = await routeGrammarMetrics(page)
  expect(routes.edgeCount).toBeGreaterThan(0)
  expect(routes.softCubicCount).toBeGreaterThan(0)
  expect(routes.rawDominantOrthogonalCount).toBe(0)
  expect(routes.excessiveDetourCount).toBe(0)

  await page.getByTestId("symbol-betaU_gh").click()
  await page.getByTestId("enable-trace").click()
  routes = await routeGrammarMetrics(page)
  expect(routes.rawDominantOrthogonalCount).toBe(0)
  expect(routes.excessiveDetourCount).toBe(0)

  await page.getByTestId("view-lineage").click()
  const lineage = await lineageGroupMetrics(page)
  expect(lineage.groupCount).toBe(4)
  expect(lineage.traceGroupCount).toBe(1)

  await page.getByTestId("view-evidence").click()
  routes = await routeGrammarMetrics(page)
  expect(routes.rawDominantOrthogonalCount).toBe(0)
  expect(routes.excessiveDetourCount).toBe(0)
  const inspector = await inspectorMetrics(page)
  expect(inspector.duplicateMiniCanvasCount).toBe(0)
  expect(inspector.tinySectionCount).toBe(0)
  expect(inspector.nestedVerticalScrollbarCount).toBe(0)
  expect(inspector.primaryAfterSearchGapPx).toBeLessThanOrEqual(20)
  expect(inspector.primaryFirstScreenVisible).toBe(true)

  const filteredIssues = consoleIssues.filter((issue) => !issue.includes("Failed to load resource: the server responded with a status of 404"))
  expect(filteredIssues).toEqual([])
  console.log(JSON.stringify({ status: "public-smoke-pass", publicUrl, observedVersion: "2.0.0-rc.16", routes, lineage, inspector }, null, 2))
} finally {
  await browser.close()
}
