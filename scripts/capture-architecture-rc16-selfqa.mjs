import { chromium, expect } from "@playwright/test"
import fs from "node:fs/promises"
import path from "node:path"

const baseUrl = process.env.ASTERIA_SELF_QA_URL || "http://127.0.0.1:5173/"
const outputDir = process.env.ASTERIA_SELF_QA_DIR || "results/asteria_v2_rc16_connector_finish/screenshots/round"

async function capture(page, name, locator) {
  if (locator) {
    await locator.screenshot({ path: path.join(outputDir, `${name}.png`) })
  } else {
    await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: false })
  }
}

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts?.ready
    for (let index = 0; index < 8; index += 1) await new Promise((resolve) => requestAnimationFrame(resolve))
  })
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
  await expect(page.getByText("2.0.0-rc.16")).toBeVisible()
  await page.getByTestId("symbol-betaU_gh").click()
  await settle(page)
  await capture(page, "cat-overview-selected-1536-dark")
  await capture(page, "architecture-selected-card-contact-closeup", page.locator(".architecture-workspace-canvas"))

  await page.setViewportSize({ width: 1366, height: 768 })
  await page.getByTestId("topbar-toggle-theme").click()
  await page.getByTestId("enable-trace").click()
  await page.getByTestId("trace-mode").selectOption("recursive")
  await page.getByTestId("trace-direction").selectOption("both")
  await settle(page)
  await capture(page, "cat-overview-trace-1366-light")

  await page.setViewportSize({ width: 1536, height: 864 })
  await page.getByTestId("topbar-toggle-theme").click()
  await page.getByTestId("detail-full-model").click()
  await settle(page)
  await capture(page, "cat-full-fit-1536-dark")

  await page.getByTestId("detail-overview").click()
  await page.getByTestId("model-original-trace").click()
  await settle(page)
  await capture(page, "original-trace-1536-dark")

  await page.getByTestId("model-cat-trace-frozen-v2").click()
  await page.getByTestId("view-lineage").click()
  await settle(page)
  await capture(page, "lineage-1536-dark")
  await capture(page, "lineage-trace-multi-relation-group-closeup", page.locator("[data-lineage-label-group='true'][data-source-id='entity:lineage:trace']"))
  await page.setViewportSize({ width: 1366, height: 768 })
  await settle(page)
  await capture(page, "lineage-1366-dark")

  await page.setViewportSize({ width: 1536, height: 864 })
  await page.getByTestId("view-evidence").click()
  await settle(page)
  await capture(page, "evidence-1536-dark")
  await capture(page, "evidence-card-contact-closeup-top", page.locator(".architecture-workspace-canvas"))
  await capture(page, "evidence-card-contact-closeup-bottom", page.locator(".architecture-workspace-canvas"))
  await capture(page, "evidence-right-column-vertical-contact-closeup", page.locator(".architecture-workspace-canvas"))

  console.log(JSON.stringify({ status: "captured", baseUrl, outputDir }, null, 2))
} finally {
  await browser.close()
}
