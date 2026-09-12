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
    window.localStorage.setItem("asteria-theme", "dark")
  })
  await page.goto(publicUrl, { waitUntil: "networkidle", timeout: 30_000 })
  await expect(page.getByTestId("asteria-v2-root-shell")).toBeVisible()
  await expect(page.getByText("2.0.0-rc.6")).toBeVisible()
  await expect(page.getByTestId("current-project")).toContainText("Project: CAT-TRACE")
  await expect(page.getByTestId("current-view")).toContainText("Architecture")
  await expect(page.getByTestId("current-model")).toContainText("CAT-TRACE Frozen V2")
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-detail-level", "overview")
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-trace-enabled", "false")
  await expect(page.getByTestId("selected-symbol-math").locator(".katex")).toBeVisible()

  await page.getByTestId("enable-trace").click()
  await page.getByTestId("trace-mode").selectOption("recursive")
  await page.getByTestId("trace-direction").selectOption("both")
  await page.getByTestId("symbol-p_g").click()
  await page.getByTestId("trace-depth").fill("3")
  await expect(page.getByTestId("upstream-count")).toContainText("Upstream 0")

  await page.getByTestId("clear-architecture-selection").click()
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-trace-enabled", "false")
  await expect(page.getByTestId("upstream-count")).toHaveCount(0)

  await page.getByTestId("architecture-search-scope").selectOption("all")
  await page.getByTestId("architecture-search-input").fill("Finland")
  await expect(page.getByTestId("architecture-search-results")).toContainText("Evidence / dataset")
  await page.getByTestId("search-result-finland").click()
  await expect(page.getByTestId("architecture-reference-panel")).toContainText("Dataset Inspector")
  await expect(page.getByTestId("researcher-status")).toContainText("Pending")

  for (const forbidden of ["Choose a starting version", "Use shared version", "New from scratch"]) {
    await expect(page.getByText(forbidden, { exact: false })).toHaveCount(0)
  }

  const filteredIssues = consoleIssues.filter((issue) => !issue.includes("Failed to load resource: the server responded with a status of 404"))
  expect(filteredIssues).toEqual([])
  console.log(JSON.stringify({ status: "public-smoke-pass", publicUrl, observedVersion: "2.0.0-rc.6", viewport: "1366x768" }, null, 2))
} finally {
  await browser.close()
}
