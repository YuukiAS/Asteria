import { chromium, expect } from "@playwright/test"
import fs from "node:fs/promises"
import path from "node:path"

const baseUrl = process.env.ASTERIA_BASE_URL || "http://127.0.0.1:5173/"
const round = process.env.ASTERIA_SELF_QA_ROUND || process.argv[2] || "round1"
const outDir = path.resolve("results/asteria_v2_rc12_edge_visual_selfqa/screenshots")

async function ensureLightTheme(page) {
  const theme = await page.locator("html").getAttribute("data-theme")
  if (theme !== "light") await page.getByTestId("topbar-toggle-theme").click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light")
}

async function ensureDarkTheme(page) {
  const theme = await page.locator("html").getAttribute("data-theme")
  if (theme !== "dark") await page.getByTestId("topbar-toggle-theme").click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")
}

async function gotoFresh(page) {
  await page.addInitScript(() => {
    window.localStorage.removeItem("asteria-v2-rc-view-state")
    window.localStorage.setItem("asteria-theme", "dark")
  })
  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 30_000 })
  await expect(page.getByTestId("asteria-v2-root-shell")).toBeVisible()
}

async function screenshot(page, name) {
  await page.screenshot({ path: path.join(outDir, `${round}-${name}.png`), fullPage: false })
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1536, height: 864 } })

try {
  await fs.mkdir(outDir, { recursive: true })
  await gotoFresh(page)

  await page.setViewportSize({ width: 1536, height: 864 })
  await ensureDarkTheme(page)
  await page.getByTestId("model-cat-trace-frozen-v2").click()
  await page.getByTestId("detail-overview").click()
  await page.getByTestId("symbol-betaU_gh").click()
  await screenshot(page, "cat-overview-selected-1536")
  await page.getByTestId("detail-full-model").click()
  await screenshot(page, "cat-full-fit-1536")
  await page.getByTestId("detail-overview").click()

  await page.setViewportSize({ width: 1366, height: 768 })
  await ensureLightTheme(page)
  await page.getByTestId("symbol-betaU_gh").click()
  await page.getByTestId("trace-mode").selectOption("recursive")
  await page.getByTestId("trace-direction").selectOption("both")
  if ((await page.getByTestId("architecture-workspace-stage").getAttribute("data-trace-enabled")) !== "true") {
    await page.getByTestId("enable-trace").click()
  }
  await screenshot(page, "cat-overview-trace-1366")

  await page.setViewportSize({ width: 1536, height: 864 })
  await page.getByTestId("view-lineage").click()
  await expect(page.getByTestId("lineage-presentation")).toBeVisible()
  await screenshot(page, "lineage-1536")

  await page.getByTestId("view-evidence").click()
  await expect(page.getByTestId("central-evidence-canvas")).toBeVisible()
  await screenshot(page, "evidence-1536")

  await page.getByTestId("view-architecture").click()
  await page.getByTestId("model-cat-trace-frozen-v2").click()
  await expect(page.getByTestId("topbar-model-selector")).toHaveValue("cat-trace-frozen-v2")
  await screenshot(page, "model-selector-cat")

  await page.getByTestId("model-original-trace").click()
  await expect(page.getByTestId("topbar-model-selector")).toHaveValue("original-trace")
  await screenshot(page, "model-selector-original")

  console.log(JSON.stringify({ status: "screenshots-captured", round, outDir }, null, 2))
} finally {
  await browser.close()
}
