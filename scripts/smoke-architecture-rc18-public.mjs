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
      quietMarkerShape: markerPaths.every((path) => (path.getAttribute("d") || "") === "M0.8,0.8 L4.8,2.6 L0.8,4.4"),
      activeArrowheadCount: document.querySelectorAll('[data-edge-arrow-visible="true"]').length,
      activeTraceEdgeCount: document.querySelectorAll('.architecture-map-edge[data-trace-active="true"]').length,
      contextArrowheadCount: document.querySelectorAll('.architecture-map-edge[data-trace-active="false"][data-edge-arrow-visible="true"], [data-lineage-arrow-visible="true"]').length,
      inlineEdgeLabelCount: document.querySelectorAll("[data-edge-label='true'], [data-lineage-label-group='true'], .lineage-relation-chip-part").length,
      staleFooterOrLegendCount: forbidden.filter((text) => body.includes(text)).length,
    }
  })
}

async function fullModelSmokeMetrics(page) {
  await waitForProjectionGeometrySettled(page)
  return page.locator(".architecture-projection-layer").evaluate((layer) => {
    const nodes = [...document.querySelectorAll(".architecture-map-node")]
    const primary = [...document.querySelectorAll(".architecture-map-node-primary, .architecture-map-node .rendered-math")]
    const projectionWidth = layer.getBoundingClientRect().width
    const modelXs = nodes.map((node) => {
      const x = Number(node.dataset.nodeX || "0")
      const width = Number(node.dataset.nodeWidth || node.getBoundingClientRect().width)
      return { left: x - width / 2, right: x + width / 2 }
    })
    const minX = Math.min(...modelXs.map((node) => node.left))
    const maxX = Math.max(...modelXs.map((node) => node.right))
    return {
      primaryTextMinCssPx: Math.min(...primary.map((element) => Number.parseFloat(getComputedStyle(element).fontSize || "0")).filter(Boolean)),
      horizontalUtilization: (maxX - minX) / projectionWidth,
      nodeCount: nodes.length,
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
  await expect(page.getByText("2.0.0-rc.19")).toBeVisible()
  await page.getByTestId("symbol-betaU_gh").click()
  let metrics = await connectorSmokeMetrics(page)
  expect(metrics.pathCount).toBeGreaterThan(0)
  expect(metrics.activeArrowheadCount).toBe(0)
  expect(metrics.contextArrowheadCount).toBe(0)
  expect(metrics.inlineEdgeLabelCount).toBe(0)

  await waitForInspectorTopSmokeReady(page)
  const inspector = await inspectorTopSmokeMetrics(page)
  expect(inspector.scrollTop).toBeLessThanOrEqual(1)
  expect(inspector.headingFullyVisible).toBe(true)
  expect(inspector.helperFullyVisible).toBe(true)
  expect(inspector.viewHelpFullyVisible).toBe(true)
  expect(inspector.viewHelpText).toContain("Architecture answers how each statistical symbol depends")
  await page.getByTestId("enable-trace").click()
  metrics = await connectorSmokeMetrics(page)
  expect(metrics.pathCount).toBeGreaterThan(0)
  expect(metrics.filledTriangleMarkerCount).toBe(0)
  expect(metrics.quietMarkerShape).toBe(true)
  expect(metrics.activeArrowheadCount).toBe(metrics.activeTraceEdgeCount)
  expect(metrics.contextArrowheadCount).toBe(0)
  expect(metrics.inlineEdgeLabelCount).toBe(0)
  expect(metrics.staleFooterOrLegendCount).toBe(0)

  await page.getByTestId("enable-trace").click()
  await page.getByTestId("detail-full-model").click()
  await page.getByRole("button", { name: "Reset full model" }).click()
  const fullModel = await fullModelSmokeMetrics(page)
  expect(fullModel.nodeCount).toBeGreaterThan(30)
  expect(fullModel.primaryTextMinCssPx).toBeGreaterThanOrEqual(9.5)
  expect(fullModel.horizontalUtilization).toBeGreaterThanOrEqual(0.78)

  await page.getByTestId("view-lineage").click()
  metrics = await connectorSmokeMetrics(page)
  expect(metrics.filledTriangleMarkerCount).toBe(0)
  expect(metrics.contextArrowheadCount).toBe(0)
  expect(metrics.inlineEdgeLabelCount).toBe(0)
  expect(metrics.staleFooterOrLegendCount).toBe(0)

  await page.getByTestId("view-evidence").click()
  metrics = await connectorSmokeMetrics(page)
  expect(metrics.filledTriangleMarkerCount).toBe(0)
  expect(metrics.activeArrowheadCount).toBe(0)
  expect(metrics.contextArrowheadCount).toBe(0)
  expect(metrics.inlineEdgeLabelCount).toBe(0)
  expect(metrics.staleFooterOrLegendCount).toBe(0)

  const filteredIssues = consoleIssues.filter(
    (issue) =>
      !issue.includes("Failed to load resource: the server responded with a status of 404") &&
      !issue.includes("WebSocket connection to") &&
      !issue.includes("[vite] failed to connect to websocket") &&
      !issue.includes("WebSocket closed without opened."),
  )
  expect(filteredIssues).toEqual([])
  console.log(JSON.stringify({ status: "public-smoke-pass", publicUrl, observedVersion: "2.0.0-rc.19", inspector, metrics, fullModel }, null, 2))
} finally {
  await browser.close()
}
