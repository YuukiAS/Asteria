import { chromium, expect } from "@playwright/test"

const publicUrl = process.env.ASTERIA_PUBLIC_URL || "https://asteria.httpwwwcardiacnexus-ukb.com/"

async function waitForProjectionGeometrySettled(page) {
  await page.evaluate(async () => {
    await document.fonts?.ready
    let previous = ""
    let stableFrames = 0
    for (let index = 0; index < 24 && stableFrames < 3; index += 1) {
      await new Promise((resolve) => requestAnimationFrame(() => resolve()))
      const layer = document.querySelector(".architecture-projection-layer")
      const rect = layer?.getBoundingClientRect()
      const signature = rect ? `${rect.left.toFixed(2)}:${rect.top.toFixed(2)}:${rect.width.toFixed(2)}:${rect.height.toFixed(2)}` : ""
      if (signature === previous) {
        stableFrames += 1
      } else {
        previous = signature
        stableFrames = 0
      }
    }
  })
}

async function architectureSafeBounds(page, safeInset = 8) {
  await waitForProjectionGeometrySettled(page)
  return page.evaluate((safeInset) => {
    const canvas = document.querySelector('[data-testid="architecture-projection-canvas"]')?.getBoundingClientRect()
    const nodes = [...document.querySelectorAll(".architecture-map-node")].map((element) => {
      const rect = element.getBoundingClientRect()
      return {
        id: element.getAttribute("data-entity-id") || "",
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
      }
    })
    const clipped = nodes.filter((node) => !canvas || node.left < canvas.left + safeInset || node.right > canvas.right - safeInset || node.top < canvas.top + safeInset || node.bottom > canvas.bottom - safeInset)
    const rightMargins = nodes.map((node) => (canvas ? canvas.right - node.right : -Infinity))
    return { clippedCount: clipped.length, minRightMargin: rightMargins.length ? Math.min(...rightMargins) : Infinity, nodeCount: nodes.length }
  }, safeInset)
}

async function lineageMetrics(page) {
  await page.evaluate(async () => {
    await document.fonts?.ready
    let previous = ""
    let stableFrames = 0
    for (let index = 0; index < 30 && stableFrames < 4; index += 1) {
      await new Promise((resolve) => requestAnimationFrame(() => resolve()))
      const presentation = document.querySelector('[data-testid="lineage-presentation"]')
      const rect = presentation?.getBoundingClientRect()
      const target = document.querySelector('[data-testid="lineage-target-card"]')?.getBoundingClientRect()
      const signature = rect && target ? `${rect.left.toFixed(2)}:${rect.width.toFixed(2)}:${target.left.toFixed(2)}:${target.width.toFixed(2)}` : ""
      if (signature === previous) {
        stableFrames += 1
      } else {
        previous = signature
        stableFrames = 0
      }
    }
  })
  return page.evaluate(() => {
    const target = document.querySelector('[data-testid="lineage-target-card"]')
    const presentation = document.querySelector('[data-testid="lineage-presentation"]')
    const targetRect = target?.getBoundingClientRect()
    const presentationRect = presentation?.getBoundingClientRect()
    const endpoints = [...document.querySelectorAll("[data-lineage-connector]")].map((path) => {
      const ctm = path.getScreenCTM()
      const endpoint = path.getPointAtLength(path.getTotalLength())
      const screen = ctm ? new DOMPoint(endpoint.x, endpoint.y).matrixTransform(ctm) : new DOMPoint(endpoint.x, endpoint.y)
      return { x: screen.x, y: screen.y }
    })
    const endpointErrorMax = endpoints.length ? Math.max(...endpoints.map((endpoint) => Math.abs(endpoint.x - (targetRect?.left || 0)))) : Infinity
    const floatingArrowheadCount = endpoints.filter((endpoint) => !targetRect || Math.abs(endpoint.x - targetRect.left) > 3 || endpoint.y < targetRect.top + 6 || endpoint.y > targetRect.bottom - 6).length
    const sortedY = endpoints.map((endpoint) => endpoint.y).sort((a, b) => a - b)
    let portCollapseCount = 0
    for (let index = 0; index < sortedY.length - 1; index += 1) {
      if (sortedY[index + 1] - sortedY[index] < 12) portCollapseCount += 1
    }
    return {
      connectorCount: endpoints.length,
      endpointErrorMax,
      floatingArrowheadCount,
      portCollapseCount,
      targetSafeMargin: presentationRect && targetRect ? presentationRect.right - targetRect.right : -Infinity,
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

  let safe = await architectureSafeBounds(page)
  expect(safe.clippedCount).toBe(0)
  expect(safe.minRightMargin).toBeGreaterThanOrEqual(8)

  await page.getByTestId("symbol-betaU_gh").click()
  await page.getByTestId("enable-trace").click()
  safe = await architectureSafeBounds(page)
  expect(safe.clippedCount).toBe(0)
  expect(safe.minRightMargin).toBeGreaterThanOrEqual(8)

  await page.getByTestId("view-lineage").click()
  let lineage = await lineageMetrics(page)
  expect(lineage.connectorCount).toBe(4)
  expect(lineage.endpointErrorMax).toBeLessThanOrEqual(3)
  expect(lineage.floatingArrowheadCount).toBe(0)
  expect(lineage.portCollapseCount).toBe(0)
  expect(lineage.targetSafeMargin).toBeGreaterThanOrEqual(48)

  await page.setViewportSize({ width: 1536, height: 864 })
  lineage = await lineageMetrics(page)
  expect(lineage.endpointErrorMax).toBeLessThanOrEqual(3)
  expect(lineage.floatingArrowheadCount).toBe(0)

  const filteredIssues = consoleIssues.filter((issue) => !issue.includes("Failed to load resource: the server responded with a status of 404"))
  expect(filteredIssues).toEqual([])
  console.log(JSON.stringify({ status: "public-smoke-pass", publicUrl, observedVersion: "2.0.0-rc.16", architectureSafeBounds: "PASS", lineageEndpointErrorMax: lineage.endpointErrorMax }, null, 2))
} finally {
  await browser.close()
}
