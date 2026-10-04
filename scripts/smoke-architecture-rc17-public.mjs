import { chromium, expect } from "@playwright/test"

const publicUrl = process.env.ASTERIA_PUBLIC_URL || "https://asteria.httpwwwcardiacnexus-ukb.com/"

async function waitForProjectionGeometrySettled(page) {
  await page.evaluate(async () => {
    await document.fonts?.ready
    let previous = ""
    let stableFrames = 0
    for (let index = 0; index < 30 && stableFrames < 4; index += 1) {
      await new Promise((resolve) => requestAnimationFrame(() => resolve()))
      const layer = document.querySelector(".architecture-projection-layer, .lineage-presentation")
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

async function connectorSmokeMetrics(page) {
  await waitForProjectionGeometrySettled(page)
  return page.evaluate(() => {
    const markerPaths = [...document.querySelectorAll("marker path")]
    const paths = [...document.querySelectorAll(".architecture-map-edge path, [data-lineage-connector]")]
    let floatingArrowheadCount = 0
    const pointToScreen = (path, point) => {
      const ctm = path.getScreenCTM()
      return ctm ? new DOMPoint(point.x, point.y).matrixTransform(ctm) : point
    }
    const rectForId = (id) => document.querySelector(`[data-entity-id="${CSS.escape(id)}"]`)?.getBoundingClientRect()
    for (const path of paths) {
      const owner = path.closest(".architecture-map-edge") || path
      const targetId = owner.getAttribute("data-target-id") || ""
      const targetRect = rectForId(targetId)
      if (!targetRect) continue
      const endpoint = pointToScreen(path, path.getPointAtLength(path.getTotalLength()))
      const boundaryDistance = Math.min(Math.abs(endpoint.x - targetRect.left), Math.abs(endpoint.x - targetRect.right), Math.abs(endpoint.y - targetRect.top), Math.abs(endpoint.y - targetRect.bottom))
      const inRange = endpoint.x >= targetRect.left - 3 && endpoint.x <= targetRect.right + 3 && endpoint.y >= targetRect.top - 3 && endpoint.y <= targetRect.bottom + 3
      if (!inRange || boundaryDistance > 3) floatingArrowheadCount += 1
    }
    const forbidden = [
      "Theory / implementation / datasets / limitation / pending",
      "Extends / preserves / borrows / computational inspiration",
      "Evidence relation legend",
      "Lineage relation legend",
    ]
    const body = document.body.textContent || ""
    return {
      pathCount: paths.length,
      filledTriangleMarkerCount: markerPaths.filter((path) => /z/i.test(path.getAttribute("d") || "") || getComputedStyle(path).fill !== "none").length,
      canonicalOpenChevron: markerPaths.every((path) => (path.getAttribute("d") || "") === "M0.7,0.7 L6.1,3.5 L0.7,6.3"),
      floatingArrowheadCount,
      staleFooterOrLegendCount: forbidden.filter((text) => body.includes(text)).length,
    }
  })
}

async function inspectorTopSmokeMetrics(page) {
  return page.evaluate(() => {
    const inspector = document.querySelector('[data-testid="architecture-reference-panel"]')
    const heading = inspector?.querySelector(".inspector-heading")
    const helper = document.querySelector('[data-testid="project-view-model-helper"]')
    const viewHelp = document.querySelector('[data-testid="active-view-help"]')
    const fullyVisibleInsideInspector = (element) => {
      if (!inspector || !element) return false
      const inspectorRect = inspector.getBoundingClientRect()
      const rect = element.getBoundingClientRect()
      return rect.top >= inspectorRect.top - 1 && rect.bottom <= inspectorRect.bottom + 1
    }
    return {
      scrollTop: inspector?.scrollTop || 0,
      headingFullyVisible: fullyVisibleInsideInspector(heading),
      helperFullyVisible: fullyVisibleInsideInspector(helper),
      viewHelpFullyVisible: fullyVisibleInsideInspector(viewHelp),
      viewHelpText: viewHelp?.textContent || "",
    }
  })
}

async function waitForInspectorTopSmokeReady(page) {
  await page.waitForFunction(
    () => {
      const inspector = document.querySelector('[data-testid="architecture-reference-panel"]')
      const helper = document.querySelector('[data-testid="project-view-model-helper"]')
      const viewHelp = document.querySelector('[data-testid="active-view-help"]')
      if (!inspector || !helper || !viewHelp) return false
      const inspectorRect = inspector.getBoundingClientRect()
      const helperRect = helper.getBoundingClientRect()
      const viewHelpRect = viewHelp.getBoundingClientRect()
      return (
        inspector.scrollTop <= 1 &&
        helperRect.top >= inspectorRect.top - 1 &&
        helperRect.bottom <= inspectorRect.bottom + 1 &&
        viewHelpRect.top >= inspectorRect.top - 1 &&
        viewHelpRect.bottom <= inspectorRect.bottom + 1 &&
        (viewHelp.textContent || "").includes("Architecture answers how each statistical symbol depends")
      )
    },
    undefined,
    { timeout: 5_000 },
  )
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
  await expect(page.getByText("2.0.0-rc.18")).toBeVisible()
  await page.getByTestId("symbol-betaU_gh").click()
  await waitForInspectorTopSmokeReady(page)
  const inspector = await inspectorTopSmokeMetrics(page)
  expect(inspector.scrollTop).toBeLessThanOrEqual(1)
  expect(inspector.headingFullyVisible).toBe(true)
  expect(inspector.helperFullyVisible).toBe(true)
  expect(inspector.viewHelpFullyVisible).toBe(true)
  expect(inspector.viewHelpText).toContain("Architecture answers how each statistical symbol depends")
  await page.getByTestId("enable-trace").click()
  let metrics = await connectorSmokeMetrics(page)
  expect(metrics.pathCount).toBeGreaterThan(0)
  expect(metrics.filledTriangleMarkerCount).toBe(0)
  expect(metrics.canonicalOpenChevron).toBe(true)
  expect(metrics.floatingArrowheadCount).toBe(0)
  expect(metrics.staleFooterOrLegendCount).toBe(0)

  await page.getByTestId("view-lineage").click()
  metrics = await connectorSmokeMetrics(page)
  expect(metrics.filledTriangleMarkerCount).toBe(0)
  expect(metrics.canonicalOpenChevron).toBe(true)
  expect(metrics.floatingArrowheadCount).toBe(0)
  expect(metrics.staleFooterOrLegendCount).toBe(0)

  await page.getByTestId("view-evidence").click()
  metrics = await connectorSmokeMetrics(page)
  expect(metrics.filledTriangleMarkerCount).toBe(0)
  expect(metrics.canonicalOpenChevron).toBe(true)
  expect(metrics.floatingArrowheadCount).toBe(0)
  expect(metrics.staleFooterOrLegendCount).toBe(0)

  const filteredIssues = consoleIssues.filter(
    (issue) =>
      !issue.includes("Failed to load resource: the server responded with a status of 404") &&
      !issue.includes("WebSocket connection to") &&
      !issue.includes("[vite] failed to connect to websocket") &&
      !issue.includes("WebSocket closed without opened."),
  )
  expect(filteredIssues).toEqual([])
  console.log(JSON.stringify({ status: "public-smoke-pass", publicUrl, observedVersion: "2.0.0-rc.18", inspector, metrics }, null, 2))
} finally {
  await browser.close()
}
