import { expect, test } from "@playwright/test"
import fs from "node:fs/promises"
import path from "node:path"

const screenshotDir = process.env.ASTERIA_BROWSER_QA_DIR || "/tmp/asteria-browser-qa"

test.beforeEach(async ({ page }) => {
  const consoleIssues: string[] = []
  ;(page as unknown as { __asteriaConsoleIssues: string[] }).__asteriaConsoleIssues = consoleIssues
  page.on("console", (message) => {
    if (message.type() === "error") consoleIssues.push(message.text())
  })
  page.on("pageerror", (error) => consoleIssues.push(error.message))
  await page.addInitScript(() => {
    window.localStorage.setItem("asteria-theme", "dark")
  })
  await page.goto("/")
  await expect(page.getByText("Asteria", { exact: false }).first()).toBeVisible()
  await page.getByRole("button", { name: /Architecture/ }).click()
  await expect(page.getByTestId("architecture-reference-panel")).toBeVisible()
})

test.afterEach(async ({ page }) => {
  const consoleIssues = ((page as unknown as { __asteriaConsoleIssues?: string[] }).__asteriaConsoleIssues || []).filter((issue) => !issue.includes("Failed to load resource: the server responded with a status of 404"))
  expect(consoleIssues).toEqual([])
})

test("G05 Architecture browser QA covers canonical trace, diff, export, legacy import, Story, and local save/restore", async ({ page }) => {
  await fs.mkdir(screenshotDir, { recursive: true })
  await page.getByTestId("model-cat-trace-frozen-v2").click()
  await expect(page.getByTestId("architecture-workspace-stage")).toBeVisible()
  await page.getByTestId("symbol-betaU_gh").click()
  await expect(page.getByTestId("symbol-inspector")).toContainText("Open-tail slope")
  await expect(page.getByTestId("architecture-reference-panel")).toContainText("beta^U_gh = nu + a_g + v^U_gh")

  await page.getByTestId("trace-mode").selectOption("recursive")
  await page.getByTestId("trace-direction").selectOption("both")
  await page.getByTestId("trace-depth").fill("3")
  await expect(page.getByTestId("trace-lists")).toContainText("Shared environmental-response vector")
  await expect(page.getByTestId("trace-lists")).toContainText("Open-tail latent score")

  await page.getByTestId("symbol-p_g").click()
  await expect(page.getByTestId("architecture-reference-panel")).toContainText("not true unknown species count")
  await page.getByTestId("layer-focus").selectOption("parameterization")
  await expect(page.getByTestId("architecture-outline")).toContainText("Parameterization")
  await expect(page.getByTestId("semantic-diff")).toContainText("Finite catalogue")

  await page.getByTestId("export-json").click()
  await expect(page.getByTestId("architecture-export-preview")).toContainText("\"schemaVersion\"")
  await expect(page.getByTestId("architecture-export-preview")).toContainText("\"validationWarnings\"")
  await page.getByTestId("export-markdown").click()
  await expect(page.getByTestId("architecture-export-preview")).toContainText("# CAT-TRACE Frozen V2")

  await page.getByTestId("save-view-state").click()
  await expect(page.getByTestId("architecture-action-status")).toContainText("saved")
  await page.getByTestId("model-original-trace").click()
  await expect(page.getByTestId("symbol-inspector")).toContainText("Observed occurrence")
  await page.getByTestId("restore-view-state").click()
  await expect(page.getByTestId("architecture-action-status")).toContainText("restored")
  await expect(page.getByTestId("symbol-inspector")).toContainText("Group open-tail truncation")

  await page.getByTestId("legacy-import-check").click()
  await expect(page.getByTestId("architecture-action-status")).toContainText("Legacy V1 import + Story PASS")

  await page.getByTestId("architecture-reference-panel").evaluate((element) => {
    element.scrollTop = 0
  })
  await page.screenshot({ path: path.join(screenshotDir, "g05-architecture-desktop.png"), fullPage: false })
  await page.setViewportSize({ width: 1366, height: 768 })
  await expect(page.getByTestId("architecture-reference-panel")).toBeVisible()
  await expect(page.getByTestId("symbol-inspector")).toBeVisible()
  await page.screenshot({ path: path.join(screenshotDir, "g05-architecture-laptop.png"), fullPage: false })
})

test("G06 multi-view browser QA covers Lineage, Evidence, cross-view links, search, and theme", async ({ page }) => {
  await fs.mkdir(screenshotDir, { recursive: true })
  await page.getByTestId("view-lineage").click()
  await expect(page.getByTestId("architecture-workspace-stage")).toBeVisible()
  await expect(page.getByTestId("lineage-canvas")).toContainText("CAT-TRACE Frozen V2")
  await expect(page.getByTestId("lineage-canvas")).toContainText("TRACE / Infinite JSDM")
  await expect(page.getByTestId("lineage-canvas")).toContainText("HMSC framework")
  await expect(page.getByTestId("lineage-canvas")).toContainText("bigMVP")
  await expect(page.getByTestId("lineage-canvas")).toContainText("Sparse Bayesian infinite factor / MGP")
  await expect(page.getByTestId("method-inspector")).toContainText("CAT-TRACE Frozen V2")
  await expect(page.getByTestId("context-relations")).toContainText("extends")
  await expect(page.getByTestId("context-relations")).toContainText("borrows interpretation from")
  await page.getByTestId("architecture-reference-panel").evaluate((element) => {
    element.scrollTop = 0
  })
  await page.screenshot({ path: path.join(screenshotDir, "g06-lineage-desktop.png"), fullPage: false })

  await page.getByTestId("context-open-evidence").click()
  await expect(page.getByTestId("evidence-canvas")).toContainText("Open-tail response decomposition is explicit")
  await expect(page.getByTestId("view-evidence")).toHaveClass(/segmented-button-active/)
  await expect(page.getByTestId("workspace-view-evidence")).toHaveClass(/architecture-workspace-rail-active/)
  await expect(page.getByTestId("claim-inspector")).toContainText("Open-tail response decomposition is explicit")
  await expect(page.getByTestId("context-relations")).toContainText("validates implementation")
  await expect(page.getByTestId("closure-gaps")).toContainText("Marked discovery theorem: pending")
  await expect(page.getByTestId("closure-gaps")).toContainText("gaps")

  await page.getByTestId("architecture-reference-panel").evaluate((element) => {
    element.scrollTop = 0
  })
  await page.screenshot({ path: path.join(screenshotDir, "g06-multiview-desktop.png"), fullPage: false })

  await page.getByTestId("architecture-search-scope").selectOption("all")
  await page.getByTestId("architecture-search-input").fill("Finland")
  await expect(page.getByTestId("architecture-search-results")).toContainText("Finland fungi")
  await page.getByTestId("context-open-architecture").click()
  await expect(page.getByTestId("architecture-trace-stage")).toBeVisible()
  await expect(page.getByTestId("symbol-inspector")).toContainText("Open-tail slope")

  await page.getByRole("button", { name: /Toggle theme|Dark theme|Light theme/i }).first().click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", /dark|light/)

  await page.setViewportSize({ width: 1366, height: 768 })
  await page.getByTestId("view-evidence").click()
  await expect(page.getByTestId("claim-inspector")).toBeVisible()
  await page.screenshot({ path: path.join(screenshotDir, "g06-evidence-laptop.png"), fullPage: false })
})
