import { chromium, expect } from "@playwright/test"

const publicUrl = process.env.ASTERIA_PUBLIC_URL || "https://asteria.httpwwwcardiacnexus-ukb.com/"

function overlaps(a, b, gap = 0) {
  return a.left - gap < b.right && a.right + gap > b.left && a.top - gap < b.bottom && a.bottom + gap > b.top
}

async function visibleRects(page, selector) {
  return page.locator(selector).evaluateAll((elements) =>
    elements
      .filter((element) => {
        const style = window.getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        return style.visibility !== "hidden" && style.display !== "none" && Number.parseFloat(style.opacity || "1") > 0.05 && rect.width > 1 && rect.height > 1
      })
      .map((element) => {
        const rect = element.getBoundingClientRect()
        return {
          id: element.getAttribute("data-entity-id") || element.getAttribute("data-relation-id") || element.textContent?.trim() || "",
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        }
      }),
  )
}

async function assertNoOverlap(page, selector, gap = 0) {
  const rects = await visibleRects(page, selector)
  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      expect(overlaps(rects[i], rects[j], gap), `${rects[i].id} overlaps ${rects[j].id}`).toBe(false)
    }
  }
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
  await expect(page.getByText("2.0.0-rc.11")).toBeVisible()
  await expect(page.getByTestId("current-project")).toContainText("CAT-TRACE")
  await expect(page.getByTestId("current-view")).toContainText("Architecture")
  await expect(page.getByTestId("current-model")).toContainText("CAT-TRACE Frozen V2")
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light")

  await page.getByTestId("detail-full-model").click()
  await assertNoOverlap(page, ".architecture-map-node", 6)
  await page.getByTestId("model-original-trace").click()
  await assertNoOverlap(page, ".architecture-map-node", 6)

  await page.getByTestId("model-cat-trace-frozen-v2").click()
  await page.getByTestId("detail-overview").click()
  await page.getByTestId("symbol-betaU_gh").click()
  await page.getByTestId("enable-trace").click()
  await page.getByTestId("trace-mode").selectOption("recursive")
  await page.getByTestId("trace-direction").selectOption("both")
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-trace-enabled", "true")
  await assertNoOverlap(page, ".architecture-map-node", 6)

  await page.getByTestId("view-lineage").click()
  await expect(page.getByTestId("lineage-presentation")).toBeVisible()
  await expect(page.locator("[data-lineage-connector]")).toHaveCount(4)
  await expect(page.locator("[data-lineage-chip='true']")).toHaveCount(5)
  await expect(page.locator("[data-edge-label='true']")).toHaveCount(0)
  await assertNoOverlap(page, ".lineage-presentation-card", 8)
  await assertNoOverlap(page, "[data-lineage-chip='true']", 4)

  await page.getByTestId("view-evidence").click()
  await expect(page.getByTestId("central-evidence-canvas")).toContainText("Architecture regression evidence")
  await expect(page.getByTestId("central-evidence-canvas")).toContainText("Large-graph performance check")
  await expect(page.getByTestId("closure-gaps")).not.toContainText("pending theorem or real-data closure evidence where listed")

  for (const forbidden of ["Choose a starting version", "Use shared version", "New from scratch", "CAT-TRACE Frozen V2 Web RC"]) {
    await expect(page.getByText(forbidden, { exact: false })).toHaveCount(0)
  }

  const filteredIssues = consoleIssues.filter((issue) => !issue.includes("Failed to load resource: the server responded with a status of 404"))
  expect(filteredIssues).toEqual([])
  console.log(JSON.stringify({ status: "public-smoke-pass", publicUrl, observedVersion: "2.0.0-rc.11", viewport: "1366x768" }, null, 2))
} finally {
  await browser.close()
}
