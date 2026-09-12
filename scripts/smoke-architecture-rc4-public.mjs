import { chromium, expect } from "@playwright/test"

const publicUrl = process.env.ASTERIA_PUBLIC_URL || "https://asteria.httpwwwcardiacnexus-ukb.com/"

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1536, height: 864 } })
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
  await expect(page.getByText("2.0.0-rc.4")).toBeVisible()
  await expect(page.getByTestId("current-project")).toContainText("Project: CAT-TRACE")
  await expect(page.getByTestId("current-view")).toContainText("Architecture")
  await expect(page.getByTestId("current-model")).toContainText("CAT-TRACE Frozen V2")
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-active-model", "cat-trace-frozen-v2")
  await expect(page.getByTestId("symbol-inspector")).toContainText("Open-tail slope")

  for (const forbidden of ["Choose a starting version", "Use shared version", "New from scratch"]) {
    await expect(page.getByText(forbidden, { exact: false })).toHaveCount(0)
  }
  for (const forbiddenButton of ["Move", "Edit", "Zoom", "New block", "Equation", "Fit", "Clean"]) {
    await expect(page.getByRole("button", { name: new RegExp(`^${forbiddenButton}$`, "i") })).toHaveCount(0)
  }

  await page.getByTestId("model-original-trace").click()
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-active-model", "original-trace")
  await expect(page.getByTestId("central-model-status")).toContainText("Original TRACE")
  await page.getByTestId("view-lineage").click()
  await expect(page.getByTestId("central-lineage-canvas")).toBeVisible()
  await page.getByTestId("view-evidence").click()
  await expect(page.getByTestId("central-evidence-canvas")).toBeVisible()

  const filteredIssues = consoleIssues.filter((issue) => !issue.includes("Failed to load resource: the server responded with a status of 404"))
  expect(filteredIssues).toEqual([])
  console.log(JSON.stringify({ status: "public-smoke-pass", publicUrl, observedVersion: "2.0.0-rc.4" }, null, 2))
} finally {
  await browser.close()
}
