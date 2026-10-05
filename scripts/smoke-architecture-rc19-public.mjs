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

async function routeGestalt(page) {
  await waitForProjectionGeometrySettled(page)
  return page.evaluate(() => {
    const edges = [...document.querySelectorAll(".architecture-map-edge")].map((edge) => ({
      relationId: edge.getAttribute("data-relation-id") || "",
      grammar: edge.getAttribute("data-route-grammar") || "",
      bendCount: Number(edge.getAttribute("data-route-bend-count") || "0"),
      ratio: Number(edge.getAttribute("data-route-ratio") || "0"),
      nonMonotone: edge.getAttribute("data-route-non-monotone") === "true",
      labelVisible: edge.getAttribute("data-edge-label-visible") === "true",
    }))
    const ratios = edges.map((edge) => edge.ratio).filter(Number.isFinite).sort((a, b) => a - b)
    return {
      edgeCount: edges.length,
      longDetourCount: ratios.filter((ratio) => ratio > 1.45).length,
      nonMonotoneCount: edges.filter((edge) => edge.nonMonotone).length,
      orthogonalMultiBendCount: edges.filter((edge) => edge.grammar === "rounded-orthogonal" && edge.bendCount > 1).length,
      floatingRelationLabelCount: edges.filter((edge) => edge.labelVisible).length + document.querySelectorAll("[data-lineage-label-group='true']").length,
      maxRouteRatio: ratios.length ? Math.max(...ratios) : 0,
      p95RouteRatio: ratios.length ? ratios[Math.min(ratios.length - 1, Math.ceil(ratios.length * 0.95) - 1)] : 0,
      relationCardCount: document.querySelectorAll("[data-lineage-card='relation']").length,
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
  await expect(page.getByText("2.0.0-rc.19")).toBeVisible()

  let metrics = await routeGestalt(page)
  expect(metrics.edgeCount).toBeGreaterThan(0)
  expect(metrics.longDetourCount).toBe(0)
  expect(metrics.nonMonotoneCount).toBe(0)
  expect(metrics.orthogonalMultiBendCount).toBe(0)
  expect(metrics.floatingRelationLabelCount).toBe(0)
  expect(metrics.maxRouteRatio).toBeLessThanOrEqual(1.45)
  const mathTokenRendered = await page.locator(".architecture-prose-math .katex").count()
  expect(mathTokenRendered).toBeGreaterThan(0)

  await page.getByTestId("view-lineage").click()
  metrics = await routeGestalt(page)
  expect(metrics.relationCardCount).toBeGreaterThanOrEqual(4)
  expect(metrics.floatingRelationLabelCount).toBe(0)

  await page.getByTestId("view-evidence").click()
  metrics = await routeGestalt(page)
  expect(metrics.edgeCount).toBeGreaterThan(0)
  expect(metrics.longDetourCount).toBe(0)
  expect(metrics.nonMonotoneCount).toBe(0)
  expect(metrics.orthogonalMultiBendCount).toBe(0)
  expect(metrics.floatingRelationLabelCount).toBe(0)

  const filteredIssues = consoleIssues.filter(
    (issue) =>
      !issue.includes("Failed to load resource: the server responded with a status of 404") &&
      !issue.includes("WebSocket connection to") &&
      !issue.includes("[vite] failed to connect to websocket") &&
      !issue.includes("WebSocket closed without opened."),
  )
  expect(filteredIssues).toEqual([])
  console.log(JSON.stringify({ status: "public-smoke-pass", publicUrl, observedVersion: "2.0.0-rc.19", metrics, mathTokenRendered }, null, 2))
} finally {
  await browser.close()
}
