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
  await expect(page.getByText("2.0.0-rc.7")).toBeVisible()
  await expect(page.getByTestId("current-project")).toContainText("CAT-TRACE")
  await expect(page.getByTestId("current-view")).toContainText("Architecture")
  await expect(page.getByTestId("current-model")).toContainText("CAT-TRACE Frozen V2")
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-detail-level", "overview")
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-trace-enabled", "false")
  await expect(page.getByTestId("selected-symbol-math").locator(".katex")).toBeVisible()

  await page.keyboard.press("Tab")
  await expect(page.getByText("Skip to canvas")).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(page.getByTestId("architecture-workspace-stage")).toBeFocused()

  await page.getByTestId("enable-trace").click()
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-trace-enabled", "true")
  await expect(page.locator('[data-trace-active="true"]').first()).toBeVisible()

  await page.getByTestId("advanced-export-validation").click()
  await expect(page.getByTestId("advanced-export-validation")).toHaveAttribute("aria-expanded", "true")
  await expect(page.getByTestId("architecture-export-preview")).toContainText("# CAT-TRACE Frozen V2")

  await page.getByTestId("advanced-export-validation").click()
  await page.getByTestId("topbar-export").click()
  await expect(page.getByTestId("advanced-export-validation")).toHaveAttribute("aria-expanded", "true")
  await expect(page.getByTestId("architecture-action-status")).toContainText("Export tools opened")

  await page.getByTestId("detail-full-model").click()
  await expect(page.getByTestId("full-model-reading-controls")).toBeVisible()
  await page.getByRole("button", { name: "Zoom in full model" }).click()
  await expect(page.getByTestId("architecture-projection-canvas")).toHaveAttribute("data-reading-zoom", "1.18")
  await page.getByRole("button", { name: "Fit full model" }).click()
  await expect(page.getByTestId("architecture-projection-canvas")).toHaveAttribute("data-reading-zoom", "1.00")

  for (const forbidden of ["Choose a starting version", "Use shared version", "New from scratch"]) {
    await expect(page.getByText(forbidden, { exact: false })).toHaveCount(0)
  }

  const filteredIssues = consoleIssues.filter((issue) => !issue.includes("Failed to load resource: the server responded with a status of 404"))
  expect(filteredIssues).toEqual([])
  console.log(JSON.stringify({ status: "public-smoke-pass", publicUrl, observedVersion: "2.0.0-rc.7", viewport: "1366x768" }, null, 2))
} finally {
  await browser.close()
}
