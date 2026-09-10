import { expect, test } from "@playwright/test"
import fs from "node:fs/promises"
import path from "node:path"

const screenshotDir = process.env.ASTERIA_BROWSER_QA_DIR || "/tmp/asteria-browser-qa"
const acceptanceDir = process.env.ASTERIA_ACCEPTANCE_SCREENSHOT_DIR || path.resolve("results/asteria_v2_rc3_acceptance/screenshots")

function relationIdSelector(relationId: string) {
  return `[data-relation-id="${relationId}"]`
}

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
  await expect(page.getByTestId("central-lineage-canvas")).toContainText("CAT-TRACE Frozen V2")
  await expect(page.getByTestId("central-lineage-canvas")).toContainText("TRACE / Infinite JSDM")
  await expect(page.getByTestId("central-lineage-canvas")).toContainText("HMSC framework")
  await expect(page.getByTestId("central-lineage-canvas")).toContainText("bigMVP")
  await expect(page.getByTestId("central-lineage-canvas")).toContainText("Sparse Bayesian infinite factor / MGP")
  await expect(page.getByTestId("method-inspector")).toContainText("CAT-TRACE Frozen V2")
  await expect(page.getByTestId("context-relations")).toContainText("extends")
  await expect(page.getByTestId("context-relations")).toContainText("borrows interpretation from")
  await page.getByTestId("architecture-reference-panel").evaluate((element) => {
    element.scrollTop = 0
  })
  await page.screenshot({ path: path.join(screenshotDir, "g06-lineage-desktop.png"), fullPage: false })

  await page.getByTestId("context-open-evidence").click()
  await expect(page.getByTestId("central-evidence-canvas")).toContainText("Open-tail response decomposition is explicit")
  await expect(page.getByTestId("view-evidence")).toHaveClass(/segmented-button-active/)
  await expect(page.getByTestId("view-lineage")).not.toHaveClass(/segmented-button-active/)
  await expect(page.getByTestId("workspace-view-evidence")).toHaveClass(/architecture-workspace-rail-active/)
  await expect(page.getByTestId("workspace-view-lineage")).not.toHaveClass(/architecture-workspace-rail-active/)
  await expect(page.getByTestId("workspace-view-architecture")).not.toHaveClass(/architecture-workspace-rail-active/)
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

test("RC3 acceptance hardening covers model-stage sync, relation truth, projection truth, and trace-edge truth", async ({ page }) => {
  await fs.mkdir(acceptanceDir, { recursive: true })

  await page.getByTestId("model-cat-trace-frozen-v2").click()
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-active-model", "cat-trace-frozen-v2")
  await expect(page.getByTestId("central-model-status")).toContainText("CAT-TRACE Frozen V2")
  await expect(page.getByTestId("projection-node-entity-cat-trace-frozen-v2-betaU_gh")).toBeVisible()
  await expect(page.getByTestId("projection-node-entity-cat-trace-frozen-v2-c_f")).toBeVisible()
  await expect(page.getByTestId("projection-node-entity-cat-trace-frozen-v2-betaU_gh")).toHaveAttribute("data-projection-x", "985")
  await expect(page.getByTestId("projection-node-entity-cat-trace-frozen-v2-betaU_gh")).toHaveAttribute("data-diff-status", "modified_definition")
  await page.screenshot({ path: path.join(acceptanceDir, "architecture-cat-trace-dark.png"), fullPage: false })

  await page.getByTestId("model-original-trace").click()
  await expect(page.getByTestId("model-original-trace")).toHaveClass(/segmented-button-active/)
  await expect(page.getByTestId("model-cat-trace-frozen-v2")).not.toHaveClass(/segmented-button-active/)
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-active-model", "original-trace")
  await expect(page.getByTestId("central-model-status")).toContainText("Original TRACE")
  await expect(page.getByTestId("projection-node-entity-original-trace-y_ij")).toBeVisible()
  await expect(page.getByTestId("projection-node-entity-original-trace-z_ij")).toBeVisible()
  await expect(page.getByTestId("projection-node-entity-original-trace-beta_j")).toBeVisible()
  await expect(page.locator('[data-entity-id="entity:cat-trace-frozen-v2:betaU_gh"]')).toHaveCount(0)
  await expect(page.locator('[data-entity-id="entity:cat-trace-frozen-v2:c_f"]')).toHaveCount(0)
  await expect(page.locator(relationIdSelector("relation:original-trace:0:z_ij:y_ij"))).toHaveAttribute("data-relation-type", "generates")
  await page.screenshot({ path: path.join(acceptanceDir, "architecture-original-trace-dark.png"), fullPage: false })

  await page.getByTestId("model-cat-trace-frozen-v2").click()
  await expect(page.getByTestId("model-cat-trace-frozen-v2")).toHaveClass(/segmented-button-active/)
  await expect(page.getByTestId("model-original-trace")).not.toHaveClass(/segmented-button-active/)
  await page.getByTestId("symbol-betaU_gh").click()
  await page.getByTestId("trace-mode").selectOption("direct")
  await page.getByTestId("trace-direction").selectOption("upstream")
  await expect(page.locator(relationIdSelector("relation:cat-trace-frozen-v2:11:nu:betaU_gh"))).toHaveAttribute("data-trace-active", "true")
  await expect(page.locator(relationIdSelector("relation:cat-trace-frozen-v2:12:a_g:betaU_gh"))).toHaveAttribute("data-trace-active", "true")
  await expect(page.locator(relationIdSelector("relation:cat-trace-frozen-v2:13:vU_gh:betaU_gh"))).toHaveAttribute("data-trace-active", "true")
  await expect(page.locator(relationIdSelector("relation:cat-trace-frozen-v2:9:betaU_gh:zU_igh"))).toHaveAttribute("data-trace-active", "false")

  await page.getByTestId("trace-direction").selectOption("downstream")
  await page.getByTestId("trace-mode").selectOption("recursive")
  await page.getByTestId("trace-depth").fill("3")
  await expect(page.locator(relationIdSelector("relation:cat-trace-frozen-v2:9:betaU_gh:zU_igh"))).toHaveAttribute("data-trace-active", "true")
  await expect(page.locator(relationIdSelector("relation:cat-trace-frozen-v2:4:zU_igh:yU_igh"))).toHaveAttribute("data-trace-active", "true")
  await expect(page.locator(relationIdSelector("relation:cat-trace-frozen-v2:31:yU_igh:richness_targets"))).toHaveAttribute("data-trace-active", "true")
  await page.screenshot({ path: path.join(acceptanceDir, "architecture-trace-focus.png"), fullPage: false })

  await page.getByTestId("symbol-p_g").click()
  await page.getByTestId("trace-direction").selectOption("both")
  await expect(page.locator(relationIdSelector("relation:cat-trace-frozen-v2:23:p_g:alphaU_gh"))).toHaveAttribute("data-trace-active", "true")
  await expect(page.locator(relationIdSelector("relation:cat-trace-frozen-v2:25:p_g:zero_slots"))).toHaveAttribute("data-trace-active", "true")

  await page.getByTestId("view-lineage").click()
  await expect(page.getByTestId("central-lineage-canvas")).toHaveAttribute("data-projected-relation-count", "5")
  await expect(page.getByTestId("view-lineage")).toHaveAttribute("data-asteria-selected", "true")
  await expect(page.getByTestId("workspace-view-lineage")).toHaveAttribute("data-asteria-selected", "true")
  await expect(page.locator(relationIdSelector("relation:lineage:trace-cat"))).toHaveAttribute("data-relation-type", "extends")
  await expect(page.locator(relationIdSelector("relation:lineage:trace-preserve"))).toHaveAttribute("data-relation-type", "preserves")
  await expect(page.locator(relationIdSelector("relation:lineage:hmsc-cat"))).toHaveAttribute("data-relation-type", "borrows_interpretation_from")
  await expect(page.locator(".architecture-map-edge")).toHaveCount(5)
  await expect(page.locator(".architecture-map-edge:not([data-relation-id])")).toHaveCount(0)
  await page.screenshot({ path: path.join(acceptanceDir, "lineage-dark.png"), fullPage: false })

  await page.getByTestId("view-evidence").click()
  await expect(page.getByTestId("view-evidence")).toHaveAttribute("data-asteria-selected", "true")
  await expect(page.getByTestId("workspace-view-evidence")).toHaveAttribute("data-asteria-selected", "true")
  await expect(page.getByTestId("view-lineage")).toHaveAttribute("data-asteria-selected", "false")
  await expect(page.getByTestId("workspace-view-lineage")).toHaveAttribute("data-asteria-selected", "false")
  await expect(page.getByTestId("central-evidence-canvas")).toHaveAttribute("data-projected-relation-count", "8")
  await expect(page.locator(relationIdSelector("relation:evidence:proof-tail"))).toHaveAttribute("data-relation-type", "theoretically_supports")
  await expect(page.locator(relationIdSelector("relation:evidence:fixture-response"))).toHaveAttribute("data-relation-type", "validates_implementation")
  await expect(page.locator(relationIdSelector("relation:evidence:finland-pending"))).toHaveAttribute("data-relation-type", "pending")
  await expect(page.locator(relationIdSelector("relation:evidence:realdata-gap-tail"))).toHaveAttribute("data-relation-type", "limited_by")
  await expect(page.locator(".architecture-map-edge[data-relation-id='']")).toHaveCount(0)
  await page.screenshot({ path: path.join(acceptanceDir, "evidence-dark.png"), fullPage: false })

  await page.getByTestId("view-architecture").click()
  await page.getByRole("button", { name: /Toggle theme|Dark theme|Light theme/i }).first().click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", /light|dark/)
  await page.mouse.move(600, 170)
  await page.screenshot({ path: path.join(acceptanceDir, "architecture-light.png"), fullPage: false })
})
