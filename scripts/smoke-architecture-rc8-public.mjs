import { chromium, expect } from "@playwright/test"

const publicUrl = process.env.ASTERIA_PUBLIC_URL || "https://asteria.httpwwwcardiacnexus-ukb.com/"

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
  await expect(page.getByText("2.0.0-rc.9")).toBeVisible()
  await expect(page.getByTestId("current-project")).toContainText("CAT-TRACE")
  await expect(page.getByTestId("current-view")).toContainText("Architecture")
  await expect(page.getByTestId("current-model")).toContainText("CAT-TRACE Frozen V2")
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-detail-level", "overview")
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light")

  await page.getByTestId("symbol-c_f").click()
  await page.getByTestId("enable-trace").click()
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-trace-enabled", "true")

  const mutedPathOpacity = await page.locator(".architecture-map-edge-muted:not(.architecture-map-edge-selected):not(.architecture-map-edge-trace) path").first().evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))
  const activePath = page.locator('[data-trace-active="true"] path').first()
  const activeText = page.locator(".architecture-map-edge-trace text, .architecture-map-edge-selected text").first()
  const activePathOpacity = await activePath.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))
  const activePathWidth = await activePath.evaluate((element) => Number.parseFloat(getComputedStyle(element).strokeWidth))
  const activeLabelOpacity = await activeText.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))
  expect(mutedPathOpacity).toBeGreaterThanOrEqual(0.8)
  expect(activePathOpacity).toBeGreaterThanOrEqual(0.95)
  expect(activePathWidth).toBeGreaterThan(0.4)
  expect(activeLabelOpacity).toBeGreaterThanOrEqual(0.9)

  await page.getByTestId("advanced-export-validation").click()
  await expect(page.getByTestId("architecture-export-preview")).toContainText("# CAT-TRACE Frozen V2")
  await page.getByTestId("save-view-state").click()
  await expect(page.getByTestId("architecture-action-status")).toContainText("saved")
  await page.getByTestId("model-original-trace").click()
  await page.getByTestId("restore-view-state").click()
  await expect(page.getByTestId("current-model")).toContainText("CAT-TRACE Frozen V2")
  await page.reload({ waitUntil: "networkidle" })
  await expect(page.getByTestId("asteria-v2-root-shell")).toBeVisible()

  for (const forbidden of ["Choose a starting version", "Use shared version", "New from scratch"]) {
    await expect(page.getByText(forbidden, { exact: false })).toHaveCount(0)
  }

  const filteredIssues = consoleIssues.filter((issue) => !issue.includes("Failed to load resource: the server responded with a status of 404"))
  expect(filteredIssues).toEqual([])
  console.log(JSON.stringify({ status: "public-smoke-pass", publicUrl, observedVersion: "2.0.0-rc.9", viewport: "1366x768" }, null, 2))
} finally {
  await browser.close()
}
