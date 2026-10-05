import { chromium, expect } from "@playwright/test"
import fs from "node:fs/promises"
import path from "node:path"

const baseUrl = process.env.ASTERIA_SELF_QA_URL || "http://127.0.0.1:5173/"
const outputDir = process.env.ASTERIA_SELF_QA_DIR || "results/asteria--rc18-quiet-graph-convergence/screenshots/final"

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts?.ready
    for (let index = 0; index < 10; index += 1) await new Promise((resolve) => requestAnimationFrame(resolve))
  })
}

async function setTheme(page, theme) {
  const current = await page.locator("html").getAttribute("data-theme")
  if (current !== theme) {
    await page.getByTestId("topbar-toggle-theme").click()
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme)
  }
}

async function setTrace(page, enabled) {
  const stage = page.getByTestId("architecture-workspace-stage")
  const current = (await stage.getAttribute("data-trace-enabled")) === "true"
  if (current !== enabled) {
    if (enabled) await page.getByTestId("enable-trace").click()
    else await page.getByTestId("clear-architecture-selection").click()
    await expect(stage).toHaveAttribute("data-trace-enabled", enabled ? "true" : "false")
  }
}

async function screenshot(page, name) {
  await settle(page)
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: false })
}

await fs.mkdir(outputDir, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1536, height: 864 } })

try {
  await page.addInitScript(() => {
    window.localStorage.removeItem("asteria-v2-rc-view-state")
    window.localStorage.setItem("asteria-theme", "dark")
  })
  await page.goto(baseUrl, { waitUntil: "networkidle" })
  await expect(page.getByText("2.0.0-rc.19")).toBeVisible()
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-active-model", "cat-trace-frozen-v2")
  await setTrace(page, false)
  await screenshot(page, "architecture-cat-overview-1536-dark-trace-off")

  await page.setViewportSize({ width: 1366, height: 768 })
  await setTheme(page, "light")
  await setTrace(page, false)
  await screenshot(page, "architecture-cat-overview-1366-light-trace-off")

  for (const entityId of ["yU_igh", "gamma_g", "betaU_gh", "c_f"]) {
    await page.getByTestId(`projection-node-entity-cat-trace-frozen-v2-${entityId}`).click()
    await settle(page)
  }
  await screenshot(page, "architecture-selection-sequence-final-1366-light-trace-off")

  await setTrace(page, true)
  await page.getByTestId("trace-mode").selectOption("recursive")
  await page.getByTestId("trace-direction").selectOption("both")
  await screenshot(page, "architecture-cat-overview-1366-light-trace-on")

  await setTrace(page, false)
  await page.setViewportSize({ width: 1536, height: 864 })
  await setTheme(page, "dark")
  await page.getByTestId("detail-full-model").click()
  await page.getByRole("button", { name: "Reset full model" }).click()
  await screenshot(page, "architecture-cat-full-reset-1536-dark")

  await page.setViewportSize({ width: 1366, height: 768 })
  await setTheme(page, "light")
  await page.getByRole("button", { name: "Reset full model" }).click()
  await screenshot(page, "architecture-cat-full-reset-1366-light")

  await page.getByTestId("detail-overview").click()
  await page.setViewportSize({ width: 1536, height: 864 })
  await setTheme(page, "dark")
  await page.getByTestId("model-original-trace").click()
  await screenshot(page, "architecture-original-trace-overview-1536-dark")

  await page.getByTestId("model-cat-trace-frozen-v2").click()
  await page.getByTestId("view-lineage").click()
  await screenshot(page, "lineage-1536-dark")
  await page.setViewportSize({ width: 1366, height: 768 })
  await setTheme(page, "light")
  await screenshot(page, "lineage-1366-light")

  await page.setViewportSize({ width: 1536, height: 864 })
  await setTheme(page, "dark")
  await page.getByTestId("view-evidence").click()
  await screenshot(page, "evidence-1536-dark")
  await page.getByTestId("projection-node-entity-evidence-claim-tail-calibration").click()
  await screenshot(page, "evidence-selected-claim-1536-dark")
  await page.getByTestId("projection-node-entity-evidence-data-finland").click()
  await screenshot(page, "evidence-selected-dataset-1536-dark")
  await page.getByTestId("projection-node-entity-evidence-limitation-real-data").click()
  await screenshot(page, "evidence-selected-limitation-1536-dark")

  console.log(JSON.stringify({ status: "captured", baseUrl, outputDir }, null, 2))
} finally {
  await browser.close()
}
