import { expect, test, type Page } from "@playwright/test"
import fs from "node:fs/promises"
import path from "node:path"

const screenshotDir = process.env.ASTERIA_BROWSER_QA_DIR || "/tmp/asteria-browser-qa"
const acceptanceDir = process.env.ASTERIA_ACCEPTANCE_SCREENSHOT_DIR || path.resolve("results/asteria_v2_rc11_reader_finish/screenshots")

function relationIdSelector(relationId: string) {
  return `[data-relation-id="${relationId}"]`
}

async function assertNoLegacyStartup(page: Page) {
  for (const forbidden of ["Choose a starting version", "Use shared version", "New from scratch"]) {
    await expect(page.getByText(forbidden, { exact: false })).toHaveCount(0)
  }
}

async function assertNoLegacyToolbar(page: Page) {
  for (const forbiddenButton of ["Move", "Edit", "Zoom", "New block", "Equation", "Fit", "Clean"]) {
    await expect(page.getByRole("button", { name: new RegExp(`^${forbiddenButton}$`, "i") })).toHaveCount(0)
  }
}

type Rect = { id: string; left: number; top: number; right: number; bottom: number; width: number; height: number; cx: number; cy: number }

function overlaps(a: Rect, b: Rect, gap = 0) {
  return a.left - gap < b.right && a.right + gap > b.left && a.top - gap < b.bottom && a.bottom + gap > b.top
}

async function visibleRects(page: Page, selector: string): Promise<Rect[]> {
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
          cx: rect.left + rect.width / 2,
          cy: rect.top + rect.height / 2,
        }
      }),
  )
}

async function assertNoNodeOverlap(page: Page, gap = 10) {
  const rects = await visibleRects(page, ".architecture-map-node")
  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      expect(overlaps(rects[i], rects[j], gap), `${rects[i].id} overlaps ${rects[j].id}`).toBe(false)
    }
  }
}

async function assertNoPrimaryTextClipping(page: Page) {
  const failures = await page.locator("[data-node-primary='true']").evaluateAll((elements) =>
    elements
      .map((element) => {
        const parent = element.closest(".architecture-map-node")
        const rect = element.getBoundingClientRect()
        const parentRect = parent?.getBoundingClientRect()
        const id = parent?.getAttribute("data-entity-id") || element.textContent || ""
        return {
          id,
          horizontalClip: element.scrollWidth > element.clientWidth + 1,
          escapesCard: parentRect ? rect.left < parentRect.left - 1 || rect.right > parentRect.right + 1 || rect.top < parentRect.top - 1 || rect.bottom > parentRect.bottom + 1 : false,
        }
      })
      .filter((item) => item.horizontalClip || item.escapesCard),
  )
  expect(failures).toEqual([])
}

async function assertNoScientificLabelClipping(page: Page) {
  const failures = await page.locator(".architecture-map-node small").evaluateAll((elements) =>
    elements
      .map((element) => {
        const parent = element.closest(".architecture-map-node")
        const style = window.getComputedStyle(element)
        const clamp = style.getPropertyValue("-webkit-line-clamp")
        return {
          id: parent?.getAttribute("data-entity-id") || element.textContent?.trim() || "",
          label: element.textContent?.trim() || "",
          verticalClip: element.scrollHeight > element.clientHeight + 2,
          clamped: Boolean(clamp && clamp !== "none" && clamp !== "unset" && clamp !== "initial"),
          ellipsis: style.textOverflow === "ellipsis",
        }
      })
      .filter((item) => item.verticalClip || item.clamped || item.ellipsis),
  )
  expect(failures).toEqual([])
}

async function assertCanonicalFormulaHealthy(page: Page, screenshotName?: string) {
  const block = page.getByTestId("selected-definition-math")
  await block.scrollIntoViewIfNeeded()
  await expect(block).toHaveAttribute("data-has-rendered-formula", "true")
  await expect(block.locator(".katex")).toBeVisible()
  const metrics = await block.evaluate((element) => {
    const katex = element.querySelector<HTMLElement>(".katex")
    const visibleKatex = element.querySelector<HTMLElement>(".katex-html") || katex
    const scroller = element.querySelector<HTMLElement>(".canonical-formula-scroll")
    const inspector = document.querySelector<HTMLElement>("[data-testid='architecture-reference-panel']")
    const blockRect = element.getBoundingClientRect()
    const katexRect = visibleKatex?.getBoundingClientRect()
    const scrollerRect = scroller?.getBoundingClientRect()
    return {
      blockWidth: blockRect.width,
      katexHeight: katexRect?.height || 0,
      katexWidth: katexRect?.width || 0,
      scrollerWidth: scrollerRect?.width || 0,
      mathWhiteSpace: visibleKatex ? window.getComputedStyle(visibleKatex).whiteSpace : "",
      blockOverflow: window.getComputedStyle(element).overflow,
      scrollerOverflowX: scroller ? window.getComputedStyle(scroller).overflowX : "",
      inspectorOverflow: inspector ? inspector.scrollWidth > inspector.clientWidth + 2 : false,
      visibleRawText: (() => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
        const chunks: string[] = []
        let node = walker.nextNode()
        while (node) {
          const parent = node.parentElement
          const text = node.textContent || ""
          if (parent && text.trim() && !parent.closest(".sr-only")) {
            const rect = parent.getBoundingClientRect()
            const style = window.getComputedStyle(parent)
            if (rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none") chunks.push(text)
          }
          node = walker.nextNode()
        }
        return chunks.join(" ")
      })(),
    }
  })
  expect(metrics.katexHeight, "formula should remain a single horizontal math box").toBeGreaterThan(10)
  expect(metrics.katexHeight, "formula should not fragment into vertical glyph stacks").toBeLessThanOrEqual(46)
  expect(metrics.mathWhiteSpace).toBe("nowrap")
  expect(metrics.blockOverflow).toBe("hidden")
  expect(metrics.scrollerOverflowX).toMatch(/auto|scroll/)
  expect(metrics.inspectorOverflow).toBe(false)
  expect(metrics.visibleRawText).not.toMatch(/beta\^U_gh|gamma_0\*pi_g|alpha\^U_gh|z_ij =|beta_j ~|D_W\^\{-?1\/2\}|mathcal /)
  if (screenshotName) await page.screenshot({ path: path.join("results/asteria_v2_rc11_reader_finish/screenshots", screenshotName), fullPage: false })
}

async function selectArchitectureSymbol(page: Page, symbolKey: string, model: "cat-trace-frozen-v2" | "original-trace" = "cat-trace-frozen-v2") {
  const symbolButton = page.getByTestId(`symbol-${symbolKey}`)
  if ((await symbolButton.count()) > 0) {
    await symbolButton.scrollIntoViewIfNeeded()
    await symbolButton.click()
    return
  }
  const node = page.getByTestId(`projection-node-entity-${model}-${symbolKey}`)
  await node.click()
}

async function assertNoEdgeLabelNodeCollision(page: Page) {
  const labels = await visibleRects(page, "[data-edge-label='true']")
  const nodes = await visibleRects(page, ".architecture-map-node")
  for (const label of labels) {
    for (const node of nodes) {
      expect(overlaps(label, node, 2), `${label.id} edge label overlaps ${node.id}`).toBe(false)
    }
  }
}

async function assertNoSelectorOverlap(page: Page, selector: string, gap = 0) {
  const rects = await visibleRects(page, selector)
  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      expect(overlaps(rects[i], rects[j], gap), `${rects[i].id} overlaps ${rects[j].id}`).toBe(false)
    }
  }
}

async function assertNoRelationChipCardCollision(page: Page) {
  const chips = await visibleRects(page, "[data-lineage-chip='true']")
  const cards = await visibleRects(page, ".lineage-presentation-card")
  expect(chips.length).toBe(5)
  for (const chip of chips) {
    for (const card of cards) {
      expect(overlaps(chip, card, 4), `${chip.id} relation chip collides with ${card.id}`).toBe(false)
    }
  }
}

async function assertLineagePresentationGeometry(page: Page) {
  await expect(page.getByTestId("lineage-presentation")).toBeVisible()
  await expect(page.locator("[data-lineage-connector]")).toHaveCount(4)
  await expect(page.locator("[data-edge-label='true']")).toHaveCount(0)
  await assertNoSelectorOverlap(page, ".lineage-presentation-card", 10)
  await assertNoSelectorOverlap(page, "[data-lineage-chip='true']", 6)
  await assertNoRelationChipCardCollision(page)
  const target = await page.getByTestId("lineage-target-card").boundingBox()
  const canvas = await page.getByTestId("central-lineage-canvas").boundingBox()
  expect(target).not.toBeNull()
  expect(canvas).not.toBeNull()
  expect((canvas?.x || 0) + (canvas?.width || 0) - ((target?.x || 0) + (target?.width || 0))).toBeGreaterThanOrEqual(48)
}

async function nodeCenters(page: Page) {
  const rects = await visibleRects(page, ".architecture-map-node")
  return new Map(rects.map((rect) => [rect.id, rect]))
}

async function assertStableSharedNodeCenters(before: Map<string, Rect>, after: Map<string, Rect>) {
  let compared = 0
  for (const [id, rect] of before) {
    const next = after.get(id)
    if (!next) continue
    compared += 1
    expect(Math.abs(rect.cx - next.cx), `${id} moved horizontally`).toBeLessThan(2)
    expect(Math.abs(rect.cy - next.cy), `${id} moved vertically`).toBeLessThan(2)
  }
  expect(compared).toBeGreaterThanOrEqual(10)
}

test.beforeEach(async ({ page }) => {
  const consoleIssues: string[] = []
  ;(page as unknown as { __asteriaConsoleIssues: string[] }).__asteriaConsoleIssues = consoleIssues
  page.on("console", (message) => {
    if (message.type() === "error") consoleIssues.push(message.text())
  })
  page.on("pageerror", (error) => consoleIssues.push(error.message))
  await page.addInitScript(() => {
    window.localStorage.removeItem("asteria-v2-rc-view-state")
    window.localStorage.setItem("asteria-theme", "dark")
  })
  await page.goto("/")
  await expect(page.getByTestId("asteria-v2-root-shell")).toBeVisible()
  await expect(page.getByTestId("asteria-v2-topbar")).toBeVisible()
  await expect(page.getByText("2.0.0-rc.11")).toBeVisible()
  await expect(page.getByTestId("current-project")).toContainText("Project")
  await expect(page.getByTestId("current-project")).toContainText("CAT-TRACE")
  await expect(page.getByTestId("current-view")).toContainText("Architecture")
  await expect(page.getByTestId("current-model")).toContainText("CAT-TRACE Frozen V2")
  await expect(page.getByTestId("topbar-model-selector")).toHaveValue("cat-trace-frozen-v2")
  await expect(page.getByTestId("right-panel-title")).toContainText("Architecture")
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-detail-level", "overview")
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-trace-enabled", "false")
  await expect(page.getByTestId("detail-overview")).toHaveAttribute("data-asteria-selected", "true")
  await expect(page.getByTestId("upstream-count")).toHaveCount(0)
  await expect(page.getByTestId("downstream-count")).toHaveCount(0)
  await expect(page.getByTestId("architecture-reference-panel")).toBeVisible()
  await assertNoLegacyStartup(page)
  await assertNoLegacyToolbar(page)
})

test.afterEach(async ({ page }) => {
  const consoleIssues = ((page as unknown as { __asteriaConsoleIssues?: string[] }).__asteriaConsoleIssues || []).filter((issue) => !issue.includes("Failed to load resource: the server responded with a status of 404"))
  expect(consoleIssues).toEqual([])
})

test("G05 Architecture browser QA covers canonical trace, diff, export, and 2.0 local save/restore", async ({ page }) => {
  await fs.mkdir(screenshotDir, { recursive: true })
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-active-model", "cat-trace-frozen-v2")
  await expect(page.getByTestId("selected-symbol-math").locator(".katex")).toBeVisible()
  await expect(page.getByTestId("projection-node-entity-cat-trace-frozen-v2-betaU_gh").locator(".katex")).toBeVisible()
  await expect(page.getByTestId("architecture-workspace-stage")).not.toContainText("\\beta")
  const overviewCount = Number(await page.getByTestId("architecture-projection-canvas").getAttribute("data-projected-entity-count"))
  await page.getByTestId("detail-full-model").click()
  const fullCount = Number(await page.getByTestId("architecture-projection-canvas").getAttribute("data-projected-entity-count"))
  expect(fullCount).toBeGreaterThan(overviewCount)
  await expect(page.getByTestId("projection-node-entity-cat-trace-frozen-v2-Gamma")).toBeVisible()
  await page.getByTestId("detail-overview").click()
  await expect(page.getByTestId("projection-node-entity-cat-trace-frozen-v2-Gamma")).toHaveCount(0)
  await page.getByTestId("symbol-betaU_gh").click()
  await expect(page.getByTestId("symbol-inspector")).toContainText("Open-tail slope")
  await expect(page.getByTestId("architecture-reference-panel")).toContainText("beta^U_gh = nu + a_g + v^U_gh")
  await expect(page.getByTestId("trace-lists")).toContainText("Active trace is off")

  await page.getByTestId("enable-trace").click()
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-trace-enabled", "true")
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
  await expect(page.getByTestId("semantic-diff")).toContainText("Added")
  await expect(page.getByTestId("semantic-diff")).toContainText("Preserved")
  await page.getByTestId("clear-architecture-selection").click()
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-detail-level", "overview")
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-trace-enabled", "false")
  await expect(page.getByTestId("trace-mode")).toHaveValue("direct")
  await expect(page.getByTestId("trace-direction")).toHaveValue("both")
  await expect(page.getByTestId("trace-depth")).toHaveValue("2")
  await expect(page.getByTestId("layer-focus")).toHaveValue("all")
  await expect(page.getByTestId("symbol-inspector")).toContainText("Open-tail slope")
  await expect(page.getByTestId("upstream-count")).toHaveCount(0)
  await expect(page.locator('[data-trace-active="true"]')).toHaveCount(0)

  await page.getByTestId("advanced-export-validation").click()
  await expect(page.getByTestId("advanced-export-validation")).toHaveAttribute("aria-expanded", "true")
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
  await expect(page.getByTestId("symbol-inspector")).toContainText("Open-tail slope")

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
  await expect(page.getByTestId("current-view")).toContainText("Lineage")
  await expect(page.getByTestId("right-panel-title")).toContainText("Lineage")
  await expect(page.getByTestId("active-view-help")).toContainText("Lineage answers")
  await expect(page.getByTestId("current-model")).toHaveCount(0)
  await expect(page.getByTestId("architecture-workspace-stage")).toBeVisible()
  await expect(page.getByTestId("central-lineage-canvas")).toContainText("CAT-TRACE Frozen V2")
  await expect(page.getByTestId("central-lineage-canvas")).toContainText("TRACE / Infinite JSDM")
  await expect(page.getByTestId("central-lineage-canvas")).toContainText("HMSC framework")
  await expect(page.getByTestId("central-lineage-canvas")).toContainText("bigMVP")
  await expect(page.getByTestId("central-lineage-canvas")).toContainText("Sparse Bayesian infinite factor / MGP")
  await expect(page.getByTestId("method-inspector")).toContainText("CAT-TRACE Frozen V2")
  await expect(page.getByTestId("context-relations")).toContainText("extends")
  await expect(page.getByTestId("context-relations")).toContainText("borrows interpretation from")
  await page.screenshot({ path: path.join(screenshotDir, "g06-lineage-desktop.png"), fullPage: false })

  await page.getByTestId("context-open-evidence").click()
  await expect(page.getByTestId("current-view")).toContainText("Evidence")
  await expect(page.getByTestId("right-panel-title")).toContainText("Evidence")
  await expect(page.getByTestId("active-view-help")).toContainText("Evidence answers")
  await expect(page.getByTestId("central-evidence-canvas")).toContainText("Open-tail response decomposition is explicit")
  await expect(page.getByTestId("view-evidence")).toHaveClass(/segmented-button-active/)
  await expect(page.getByTestId("workspace-view-evidence")).toHaveClass(/architecture-workspace-rail-active/)
  await expect(page.getByTestId("claim-inspector")).toContainText("Open-tail response decomposition is explicit")
  await expect(page.getByTestId("context-relations")).toContainText("validates implementation")
  await expect(page.getByTestId("closure-gaps")).toContainText("Marked discovery theorem")
  await expect(page.getByTestId("closure-gaps")).toContainText("Pending")
  await expect(page.getByTestId("closure-gaps")).toContainText("open gap")
  await page.screenshot({ path: path.join(screenshotDir, "g06-multiview-desktop.png"), fullPage: false })

  await page.getByTestId("architecture-search-scope").selectOption("all")
  await page.getByTestId("architecture-search-input").fill("Finland")
  await expect(page.getByTestId("architecture-search-results")).toContainText("Finland fungi")
  await expect(page.getByTestId("architecture-search-results")).toContainText("Evidence / dataset")
  await page.getByTestId("search-result-finland").click()
  await expect(page.getByTestId("current-view")).toContainText("Evidence")
  await expect(page.getByTestId("right-panel-title")).toContainText("Evidence")
  await expect(page.getByTestId("claim-inspector")).toContainText("Finland fungi")
  await expect(page.getByTestId("architecture-reference-panel")).toContainText("Dataset Inspector")
  await expect(page.getByTestId("researcher-status")).toContainText("Pending")

  await page.getByTestId("architecture-search-scope").selectOption("all")
  await page.getByTestId("architecture-search-input").fill("Marked discovery")
  await page.getByTestId("search-result-marked-discovery").click()
  await expect(page.getByTestId("architecture-reference-panel")).toContainText("Claim Inspector")
  await expect(page.getByTestId("researcher-status")).toContainText("Pending")

  await page.getByTestId("architecture-search-scope").selectOption("all")
  await page.getByTestId("architecture-search-input").fill("HMSC")
  await expect(page.getByTestId("architecture-search-results")).toContainText("HMSC framework")
  await expect(page.getByTestId("architecture-search-results")).toContainText("Lineage / method")
  await page.getByTestId("search-result-hmsc").click()
  await expect(page.getByTestId("current-view")).toContainText("Lineage")
  await expect(page.getByTestId("right-panel-title")).toContainText("Lineage")
  await expect(page.getByTestId("method-inspector")).toContainText("HMSC framework")

  await page.getByTestId("architecture-search-input").fill("zzzz-no-result")
  await expect(page.getByTestId("architecture-search-empty")).toContainText("No results")

  await page.getByTestId("view-lineage").click()
  await page.getByTestId("architecture-search-input").fill("HMSC")
  await page.getByTestId("save-view-state").click()
  await page.getByTestId("view-evidence").click()
  await page.getByTestId("restore-view-state").click()
  await expect(page.getByTestId("current-view")).toContainText("Lineage")
  await expect(page.getByTestId("architecture-search-input")).toHaveValue("")

  await page.getByTestId("topbar-toggle-theme").click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light")

  await page.setViewportSize({ width: 1366, height: 768 })
  await page.getByTestId("view-evidence").click()
  await expect(page.getByTestId("claim-inspector")).toBeVisible()
  await page.screenshot({ path: path.join(screenshotDir, "g06-evidence-laptop.png"), fullPage: false })
})

test("RC7 acceptance covers direct 2.0 entry, selectors, views, trace-edge truth, and committed screenshots", async ({ page }) => {
  await fs.mkdir(acceptanceDir, { recursive: true })
  await assertNoLegacyStartup(page)
  await assertNoLegacyToolbar(page)

  await expect(page.getByTestId("model-cat-trace-frozen-v2")).toHaveAttribute("data-asteria-selected", "true")
  await expect(page.getByTestId("view-architecture")).toHaveAttribute("data-asteria-selected", "true")
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-active-model", "cat-trace-frozen-v2")
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-detail-level", "overview")
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-trace-enabled", "false")
  await expect(page.getByTestId("central-model-status")).toContainText("CAT-TRACE Frozen V2")
  await expect(page.getByTestId("projection-node-entity-cat-trace-frozen-v2-betaU_gh")).toBeVisible()
  await expect(page.getByTestId("projection-node-entity-cat-trace-frozen-v2-c_f")).toBeVisible()
  await expect(page.getByTestId("projection-node-entity-cat-trace-frozen-v2-mathcal_U")).toBeVisible()
  await expect(page.getByTestId("projection-node-entity-cat-trace-frozen-v2-betaU_gh")).toHaveAttribute("data-projection-x", "985")
  await expect(page.getByTestId("projection-node-entity-cat-trace-frozen-v2-betaU_gh")).toHaveAttribute("data-diff-status", "modified_definition")
  await page.screenshot({ path: path.join(acceptanceDir, "architecture-cat-trace-dark.png"), fullPage: false })
  await page.setViewportSize({ width: 1536, height: 864 })
  await page.getByTestId("topbar-toggle-theme").click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light")
  await page.screenshot({ path: path.join(acceptanceDir, "architecture-cat-trace-light-1536.png"), fullPage: false })
  await page.getByTestId("topbar-toggle-theme").click()
  await page.setViewportSize({ width: 1366, height: 768 })
  await expect(page.getByTestId("architecture-projection-canvas")).toBeVisible()
  await expect(page.getByTestId("right-panel-title")).toContainText("Architecture")
  await page.screenshot({ path: path.join(acceptanceDir, "architecture-cat-trace-dark-1366.png"), fullPage: false })

  await page.getByTestId("model-original-trace").click()
  await expect(page.getByTestId("current-model")).toContainText("Original TRACE")
  await expect(page.getByTestId("model-original-trace")).toHaveAttribute("data-asteria-selected", "true")
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-active-model", "original-trace")
  await expect(page.getByTestId("central-model-status")).toContainText("Original TRACE")
  await expect(page.getByTestId("projection-node-entity-original-trace-y_ij")).toBeVisible()
  await expect(page.getByTestId("projection-node-entity-original-trace-z_ij")).toBeVisible()
  await expect(page.getByTestId("projection-node-entity-original-trace-beta_j")).toBeVisible()
  await expect(page.locator('[data-entity-id="entity:cat-trace-frozen-v2:betaU_gh"]')).toHaveCount(0)
  await expect(page.locator(relationIdSelector("relation:original-trace:0:z_ij:y_ij"))).toHaveAttribute("data-relation-type", "generates")
  await page.screenshot({ path: path.join(acceptanceDir, "architecture-original-trace-dark.png"), fullPage: false })

  await page.getByTestId("model-cat-trace-frozen-v2").click()
  await page.getByTestId("symbol-betaU_gh").click()
  await page.getByTestId("enable-trace").click()
  await page.getByTestId("trace-mode").selectOption("direct")
  await page.getByTestId("trace-direction").selectOption("upstream")
  await expect(page.locator(relationIdSelector("relation:cat-trace-frozen-v2:11:nu:betaU_gh"))).toHaveAttribute("data-trace-active", "true")
  await expect(page.locator(relationIdSelector("relation:cat-trace-frozen-v2:11:nu:betaU_gh"))).toHaveAttribute("data-trace-role", "upstream")
  await expect(page.locator(relationIdSelector("relation:cat-trace-frozen-v2:12:a_g:betaU_gh"))).toHaveAttribute("data-trace-active", "true")
  await expect(page.locator(relationIdSelector("relation:cat-trace-frozen-v2:13:vU_gh:betaU_gh"))).toHaveAttribute("data-trace-active", "true")
  await page.getByTestId("trace-direction").selectOption("downstream")
  await page.getByTestId("trace-mode").selectOption("recursive")
  await page.getByTestId("trace-depth").fill("3")
  await expect(page.locator(relationIdSelector("relation:cat-trace-frozen-v2:9:betaU_gh:zU_igh"))).toHaveAttribute("data-trace-active", "true")
  await expect(page.locator(relationIdSelector("relation:cat-trace-frozen-v2:9:betaU_gh:zU_igh"))).toHaveAttribute("data-trace-role", "downstream")
  await expect(page.locator(relationIdSelector("relation:cat-trace-frozen-v2:4:zU_igh:yU_igh"))).toHaveAttribute("data-trace-active", "true")
  await expect(page.locator(relationIdSelector("relation:cat-trace-frozen-v2:31:yU_igh:richness_targets"))).toHaveAttribute("data-trace-active", "true")
  await page.screenshot({ path: path.join(acceptanceDir, "architecture-trace-focus.png"), fullPage: false })

  await page.getByTestId("symbol-p_g").click()
  await page.getByTestId("trace-mode").selectOption("recursive")
  await page.getByTestId("trace-direction").selectOption("both")
  await page.getByTestId("trace-depth").fill("3")
  await expect(page.getByTestId("upstream-count")).toContainText("Upstream 0")
  const bothDownstream = await page.getByTestId("downstream-count").textContent()
  await page.getByTestId("trace-direction").selectOption("upstream")
  await expect(page.getByTestId("upstream-count")).toContainText("Upstream 0")
  await expect(page.getByTestId("downstream-count")).toContainText("Downstream 0")
  await page.getByTestId("trace-direction").selectOption("downstream")
  await expect(page.getByTestId("downstream-count")).toContainText(bothDownstream || "")

  await page.getByTestId("projection-node-entity-cat-trace-frozen-v2-mathcal_U").click()
  await expect(page.getByTestId("selected-relation-context")).toContainText("empty/unmatched feature enters open tail")

  await page.getByTestId("view-lineage").click()
  await expect(page.getByTestId("current-view")).toContainText("Lineage")
  await expect(page.getByTestId("right-panel-title")).toContainText("Lineage")
  await expect(page.getByTestId("central-lineage-canvas")).toHaveAttribute("data-projected-relation-count", "5")
  await expect(page.getByTestId("view-lineage")).toHaveAttribute("data-asteria-selected", "true")
  await expect(page.locator(relationIdSelector("relation:lineage:trace-cat"))).toHaveAttribute("data-relation-type", "extends")
  await expect(page.locator(relationIdSelector("relation:lineage:trace-preserve"))).toHaveAttribute("data-relation-type", "preserves")
  await expect(page.locator("[data-lineage-connector]")).toHaveCount(4)
  await expect(page.locator("[data-lineage-chip='true']")).toHaveCount(5)
  await page.screenshot({ path: path.join(acceptanceDir, "lineage-dark.png"), fullPage: false })

  await page.getByTestId("view-evidence").click()
  await expect(page.getByTestId("current-view")).toContainText("Evidence")
  await expect(page.getByTestId("right-panel-title")).toContainText("Evidence")
  await expect(page.getByTestId("central-evidence-canvas")).toHaveAttribute("data-projected-relation-count", "8")
  await expect(page.getByTestId("view-evidence")).toHaveAttribute("data-asteria-selected", "true")
  await expect(page.locator(relationIdSelector("relation:evidence:proof-tail"))).toHaveAttribute("data-relation-type", "theoretically_supports")
  await expect(page.locator(relationIdSelector("relation:evidence:fixture-response"))).toHaveAttribute("data-relation-type", "validates_implementation")
  await expect(page.locator(relationIdSelector("relation:evidence:finland-pending"))).toHaveAttribute("data-relation-type", "pending")
  await page.screenshot({ path: path.join(acceptanceDir, "evidence-dark.png"), fullPage: false })

  await page.getByTestId("view-architecture").click()
  await page.getByTestId("topbar-toggle-theme").click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light")
  await page.mouse.move(600, 170)
  await page.screenshot({ path: path.join(acceptanceDir, "architecture-light.png"), fullPage: false })
})

test("RC7 keyboard model selector and skip paths are reachable before dense graph nodes", async ({ page }) => {
  await page.goto("/")
  await page.keyboard.press("Tab")
  await expect(page.getByText("Skip to canvas")).toBeFocused()
  await expect(page.getByText("Skip to canvas")).toBeVisible()
  await page.keyboard.press("Enter")
  await expect(page.getByTestId("architecture-workspace-stage")).toBeFocused()

  await page.goto("/")
  await page.keyboard.press("Tab")
  await page.keyboard.press("Tab")
  await expect(page.getByText("Skip to inspector")).toBeFocused()
  await expect(page.getByText("Skip to inspector")).toBeVisible()
  await page.keyboard.press("Enter")
  await expect(page.locator("#asteria-inspector")).toBeFocused()

  await page.getByTestId("topbar-model-selector").focus()
  await expect(page.getByTestId("topbar-model-selector")).toBeFocused()
  await page.keyboard.press("ArrowUp")
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-active-model", "original-trace")
  await expect(page.getByTestId("central-model-status")).toContainText("Original TRACE")
  await page.keyboard.press("ArrowDown")
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-active-model", "cat-trace-frozen-v2")
  await expect(page.getByTestId("central-model-status")).toContainText("CAT-TRACE Frozen V2")

  await page.keyboard.press("Tab")
  await expect(page.getByTestId("topbar-search")).toBeFocused()
})

test("RC7 polish covers compact actions, controlled export disclosure, light trace readability, and full-model reading controls", async ({ page }) => {
  await fs.mkdir(screenshotDir, { recursive: true })
  await page.setViewportSize({ width: 1366, height: 768 })

  for (const [testId, name] of [
    ["topbar-search", "Search architecture"],
    ["topbar-export", "Open export tools"],
    ["topbar-save-view", "Save view state"],
    ["topbar-restore-view", "Restore view state"],
  ] as const) {
    const button = page.getByTestId(testId)
    await expect(button).toHaveAttribute("aria-label", name)
    const box = await button.boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(39)
    expect(box?.height).toBeGreaterThanOrEqual(39)
  }

  await page.getByTestId("topbar-toggle-theme").click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light")
  await page.screenshot({ path: path.join(screenshotDir, "rc7-light-trace-off-1366.png"), fullPage: false })
  await page.getByTestId("enable-trace").click()
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-trace-enabled", "true")
  await expect(page.locator('[data-trace-active="true"]').first()).toBeVisible()
  const rc7ActivePathWidth = await page.locator('[data-trace-active="true"] path').first().evaluate((element) => Number.parseFloat(getComputedStyle(element).strokeWidth))
  expect(rc7ActivePathWidth).toBeGreaterThan(0.4)
  await page.screenshot({ path: path.join(screenshotDir, "rc7-light-trace-on-1366.png"), fullPage: false })
  await page.getByTestId("topbar-toggle-theme").click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")
  await page.screenshot({ path: path.join(screenshotDir, "rc7-dark-trace-on-1366.png"), fullPage: false })
  await page.getByTestId("topbar-toggle-theme").click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light")

  const exportToggle = page.getByTestId("advanced-export-validation")
  await expect(exportToggle).toHaveAttribute("aria-expanded", "false")
  await exportToggle.click()
  await expect(exportToggle).toHaveAttribute("aria-expanded", "true")
  await expect(page.getByTestId("advanced-export-validation-region")).toBeVisible()
  await expect(page.getByTestId("architecture-export-preview")).toContainText("# CAT-TRACE Frozen V2")
  await exportToggle.click()
  await expect(exportToggle).toHaveAttribute("aria-expanded", "false")

  await exportToggle.focus()
  await page.keyboard.press("Enter")
  await expect(exportToggle).toHaveAttribute("aria-expanded", "true")
  await page.keyboard.press("Space")
  await expect(exportToggle).toHaveAttribute("aria-expanded", "false")

  await page.getByTestId("topbar-export").click()
  await expect(exportToggle).toHaveAttribute("aria-expanded", "true")
  await expect(exportToggle).toBeFocused()
  await expect(page.getByTestId("architecture-action-status")).toContainText("Export tools opened")

  await page.getByTestId("detail-full-model").click()
  await expect(page.getByTestId("full-model-reading-controls")).toBeVisible()
  const canvas = page.getByTestId("architecture-projection-canvas")
  await expect(canvas).toHaveAttribute("data-reading-zoom", "1.00")
  await page.getByRole("button", { name: "Zoom in full model" }).click()
  await expect(canvas).toHaveAttribute("data-reading-zoom", "1.18")
  await page.getByTestId("full-model-pan-mode").click()
  await expect(page.getByTestId("full-model-pan-mode")).toHaveAttribute("aria-pressed", "true")
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()
  await page.mouse.move((box?.x || 0) + (box?.width || 0) / 2, (box?.y || 0) + (box?.height || 0) / 2)
  await page.mouse.down()
  await page.mouse.move((box?.x || 0) + (box?.width || 0) / 2 + 72, (box?.y || 0) + (box?.height || 0) / 2 + 38)
  await page.mouse.up()
  await expect(canvas).not.toHaveAttribute("data-reading-pan-x", "0")
  await page.screenshot({ path: path.join(screenshotDir, "rc7-full-model-zoom-pan.png"), fullPage: false })
  await page.getByRole("button", { name: "Fit full model" }).click()
  await expect(canvas).toHaveAttribute("data-reading-zoom", "1.00")
  await expect(canvas).toHaveAttribute("data-reading-pan-x", "0")
  await expect(canvas).toHaveAttribute("data-reading-pan-y", "0")

  await expect(page.getByTestId("project-view-model-helper")).toContainText("Project")
  await expect(page.getByTestId("project-view-model-helper")).toContainText("CAT-TRACE")
  await page.screenshot({ path: path.join(screenshotDir, "rc7-context-helper-spacing.png"), fullPage: false })
})

test("RC8 light trace contrast keeps muted context readable without flattening active hierarchy", async ({ page }) => {
  await fs.mkdir(screenshotDir, { recursive: true })
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.getByTestId("topbar-toggle-theme").click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light")
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-active-view", "view:architecture")
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-active-model", "cat-trace-frozen-v2")
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-detail-level", "overview")

  await page.getByTestId("symbol-c_f").click()
  await expect(page.getByTestId("symbol-inspector")).toContainText("Catalogue match")
  await page.getByTestId("trace-direction").selectOption("upstream")
  await page.getByTestId("enable-trace").click()
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-trace-enabled", "true")

  const mutedContextEdge = page.locator(".architecture-map-edge-muted:not(.architecture-map-edge-selected):not(.architecture-map-edge-trace)").first()
  await expect(mutedContextEdge).toBeVisible()
  const mutedContextOpacity = await mutedContextEdge.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))
  const mutedPathOpacity = await mutedContextEdge.locator("path").evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))
  const mutedPathWidth = await mutedContextEdge.locator("path").evaluate((element) => Number.parseFloat(getComputedStyle(element).strokeWidth))
  expect(mutedContextOpacity).toBeGreaterThanOrEqual(0.86)
  expect(mutedPathOpacity).toBeGreaterThanOrEqual(0.8)
  expect(mutedPathWidth).toBeGreaterThanOrEqual(0.3)

  const selectedMutedEdge = page.locator(".architecture-map-edge-muted.architecture-map-edge-selected").first()
  await expect(selectedMutedEdge).toBeVisible()
  const selectedMutedGroupOpacity = await selectedMutedEdge.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))
  const selectedMutedPathWidth = await selectedMutedEdge.locator("path").evaluate((element) => Number.parseFloat(getComputedStyle(element).strokeWidth))
  expect(selectedMutedGroupOpacity).toBe(1)

  const activeTraceEdge = page.locator('[data-trace-active="true"]').first()
  const activeTracePathWidth = await activeTraceEdge.locator("path").evaluate((element) => Number.parseFloat(getComputedStyle(element).strokeWidth))
  expect(activeTracePathWidth).toBeGreaterThan(mutedPathWidth)
  expect(selectedMutedPathWidth).toBeGreaterThan(mutedPathWidth)
  const activeTraceLabel = activeTraceEdge.locator("text")
  if ((await activeTraceLabel.count()) > 0) {
    const activeTraceLabelOpacity = await activeTraceLabel.first().evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))
    expect(activeTraceLabelOpacity).toBeGreaterThanOrEqual(0.9)
  }
  await page.screenshot({ path: path.join(screenshotDir, "rc8-light-trace-on-1366.png"), fullPage: false })

  await page.getByTestId("topbar-toggle-theme").click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")
  const darkMutedEdge = page.locator(".architecture-map-edge-muted:not(.architecture-map-edge-selected):not(.architecture-map-edge-trace)").first()
  const darkMutedGroupOpacity = await darkMutedEdge.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))
  expect(darkMutedGroupOpacity).toBeLessThan(0.8)
  await page.screenshot({ path: path.join(screenshotDir, "rc8-dark-trace-on-1366.png"), fullPage: false })

  await page.getByTestId("topbar-toggle-theme").click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light")
  await page.getByTestId("model-original-trace").click()
  await expect(page.getByTestId("current-model")).toContainText("Original TRACE")
  await page.getByTestId("model-cat-trace-frozen-v2").click()
  await expect(page.getByTestId("current-model")).toContainText("CAT-TRACE Frozen V2")
  await page.getByTestId("advanced-export-validation").click()
  await expect(page.getByTestId("architecture-export-preview")).toContainText("# CAT-TRACE Frozen V2")
  await page.getByTestId("save-view-state").click()
  await expect(page.getByTestId("architecture-action-status")).toContainText("saved")
  await page.getByTestId("model-original-trace").click()
  await page.getByTestId("restore-view-state").click()
  await expect(page.getByTestId("current-model")).toContainText("CAT-TRACE Frozen V2")
  await page.reload()
  await expect(page.getByTestId("asteria-v2-root-shell")).toBeVisible()
  await assertNoLegacyStartup(page)
})

test("RC9 human visual acceptance repairs Architecture geometry, labels, math copy, Lineage, and Evidence", async ({ page }) => {
  await fs.mkdir(screenshotDir, { recursive: true })
  await page.setViewportSize({ width: 1366, height: 768 })
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-active-view", "view:architecture")
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-active-model", "cat-trace-frozen-v2")
  await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-detail-level", "overview")

  await expect(page.getByTestId("projection-node-entity-cat-trace-frozen-v2-x_i")).toBeVisible()
  await assertNoNodeOverlap(page, 8)
  await assertNoPrimaryTextClipping(page)
  await assertNoEdgeLabelNodeCollision(page)

  const initialCenters = await nodeCenters(page)
  await page.getByTestId("projection-node-entity-cat-trace-frozen-v2-yU_igh").click()
  await assertStableSharedNodeCenters(initialCenters, await nodeCenters(page))
  await assertNoNodeOverlap(page, 8)
  await assertNoPrimaryTextClipping(page)

  const yCenters = await nodeCenters(page)
  await page.getByTestId("projection-node-entity-cat-trace-frozen-v2-gamma_g").click()
  await assertStableSharedNodeCenters(yCenters, await nodeCenters(page))
  await assertNoNodeOverlap(page, 8)
  await assertNoPrimaryTextClipping(page)

  const gammaCenters = await nodeCenters(page)
  await page.getByTestId("projection-node-entity-cat-trace-frozen-v2-betaU_gh").click()
  await assertStableSharedNodeCenters(gammaCenters, await nodeCenters(page))
  await page.getByTestId("enable-trace").click()
  await page.getByTestId("trace-mode").selectOption("recursive")
  await page.getByTestId("trace-direction").selectOption("both")
  await assertNoNodeOverlap(page, 8)
  await assertNoPrimaryTextClipping(page)
  await assertNoEdgeLabelNodeCollision(page)

  const nodeTransitionProps = await page.locator(".architecture-map-node").first().evaluate((element) => getComputedStyle(element).transitionProperty)
  expect(nodeTransitionProps).not.toMatch(/all|left|top|transform|width|height/)
  await expect(page.locator("[data-edge-label-visible='false'] text")).toHaveCount(0)
  await expect(page.locator("[data-edge-label='true']").first()).toBeVisible()
  const visibleEdgeLabels = await page.locator("[data-edge-label='true']").evaluateAll((elements) => elements.map((element) => element.textContent?.trim() || ""))
  expect(visibleEdgeLabels.every((label) => !label.includes("_") && label.length <= 18)).toBe(true)
  await page.screenshot({ path: path.join(screenshotDir, "rc10-architecture-visual-1366.png"), fullPage: false })

  const diffText = await page.getByTestId("semantic-diff").evaluate((element) => element.innerText)
  for (const forbidden of ["beta^U_gh", "gamma_0*pi_g", "mathcal K", "Sigma_W", "New CAT-TRACE structure that Original TRACE does not expose"]) {
    expect(diffText).not.toContain(forbidden)
  }
  await expect(page.getByTestId("semantic-diff").locator(".katex").first()).toBeVisible()
  await expect(page.getByTestId("semantic-diff")).toContainText("known identities from open-tail discovery")

  await page.setViewportSize({ width: 1536, height: 864 })
  await assertNoNodeOverlap(page, 10)
  await assertNoPrimaryTextClipping(page)
  await assertNoEdgeLabelNodeCollision(page)
  await page.screenshot({ path: path.join(screenshotDir, "rc10-architecture-visual-1536.png"), fullPage: false })

  await page.getByTestId("view-lineage").click()
  await assertLineagePresentationGeometry(page)
  const lineageChips = await page.locator("[data-lineage-chip='true']").evaluateAll((elements) => elements.map((element) => element.textContent?.trim() || ""))
  expect(lineageChips).toEqual(expect.arrayContaining(["Ecological hierarchy", "Extends", "Preserves", "Scalable probit", "Factor shrinkage"]))
  await page.screenshot({ path: path.join(screenshotDir, "rc10-lineage-visual.png"), fullPage: false })

  await page.getByTestId("view-evidence").click()
  await assertNoNodeOverlap(page, 8)
  await assertNoEdgeLabelNodeCollision(page)
  await expect(page.getByTestId("central-evidence-canvas")).toContainText("Architecture regression evidence")
  await expect(page.getByTestId("central-evidence-canvas")).toContainText("Large-graph performance check")
  await expect(page.getByTestId("central-evidence-canvas")).not.toContainText("Web RC")
  await expect(page.getByTestId("central-evidence-canvas")).not.toContainText("first-paper dataset")
  await page.screenshot({ path: path.join(screenshotDir, "rc10-evidence-visual.png"), fullPage: false })
})

test("RC10 final visual finish validates Full model, Original TRACE, Lineage chips, Evidence copy, math, and disclosure", async ({ page }) => {
  await fs.mkdir(screenshotDir, { recursive: true })

  for (const viewport of [
    { width: 1366, height: 768, file: "rc10-cat-full-1366.png" },
    { width: 1536, height: 864, file: "rc10-cat-full-1536.png" },
  ]) {
    await page.setViewportSize(viewport)
    await page.getByTestId("model-cat-trace-frozen-v2").click()
    await page.getByTestId("detail-full-model").click()
    await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-detail-level", "full")
    await assertNoNodeOverlap(page, 8)
    await assertNoPrimaryTextClipping(page)
    await assertNoEdgeLabelNodeCollision(page)
    await page.screenshot({ path: path.join(screenshotDir, viewport.file), fullPage: false })
  }

  for (const viewport of [
    { width: 1366, height: 768, file: "rc10-original-1366.png" },
    { width: 1536, height: 864, file: "rc10-original-1536.png" },
  ]) {
    await page.setViewportSize(viewport)
    await page.getByTestId("model-original-trace").click()
    await expect(page.getByTestId("architecture-workspace-stage")).toHaveAttribute("data-active-model", "original-trace")
    await assertNoNodeOverlap(page, 8)
    await assertNoPrimaryTextClipping(page)
    await assertNoEdgeLabelNodeCollision(page)
    await expect(page.getByTestId("selected-definition-math").locator(".katex")).toBeVisible()
    await page.screenshot({ path: path.join(screenshotDir, viewport.file), fullPage: false })
  }

  await page.getByTestId("model-cat-trace-frozen-v2").click()
  await page.getByTestId("detail-overview").click()
  await page.getByTestId("symbol-betaU_gh").click()
  await expect(page.getByTestId("selected-definition-math").locator(".katex")).toBeVisible()
  await page.getByTestId("symbol-gamma_g").click()
  await expect(page.getByTestId("selected-definition-math").locator(".katex")).toBeVisible()
  await page.screenshot({ path: path.join(screenshotDir, "rc10-inspector-math.png"), fullPage: false })

  const diffText = await page.getByTestId("semantic-diff").evaluate((element) => element.innerText)
  for (const forbidden of ["mathcal K", "a_g", "p_g^*", "gamma_0", "pi_g", "gamma_g", "beta^U_gh", "Sigma_W", "New CAT-TRACE structure that Original TRACE does not expose"]) {
    expect(diffText).not.toContain(forbidden)
  }
  await expect(page.getByTestId("semantic-diff").locator(".katex").first()).toBeVisible()
  await expect(page.getByTestId("semantic-diff")).toContainText("known identities from open-tail discovery")
  await page.screenshot({ path: path.join(screenshotDir, "rc10-semantic-diff.png"), fullPage: false })

  const exportToggle = page.getByTestId("advanced-export-validation")
  await expect(exportToggle).toHaveAttribute("aria-expanded", "false")
  await expect(page.getByTestId("advanced-export-validation-region")).toHaveCount(0)
  await expect(page.getByTestId("architecture-export-preview")).toHaveCount(0)
  await page.screenshot({ path: path.join(screenshotDir, "rc10-advanced-collapsed.png"), fullPage: false })
  await exportToggle.click()
  await expect(exportToggle).toHaveAttribute("aria-expanded", "true")
  await expect(page.getByTestId("advanced-export-validation-region")).toBeVisible()
  await page.getByTestId("export-json").click()
  await expect(page.getByTestId("architecture-export-preview")).toContainText("\"schemaVersion\"")
  await exportToggle.click()
  await expect(exportToggle).toHaveAttribute("aria-expanded", "false")
  await expect(page.getByTestId("advanced-export-validation-region")).toHaveCount(0)
  await exportToggle.focus()
  await page.keyboard.press("Enter")
  await expect(exportToggle).toHaveAttribute("aria-expanded", "true")
  await page.keyboard.press("Space")
  await expect(exportToggle).toHaveAttribute("aria-expanded", "false")
  await page.getByTestId("topbar-export").click()
  await expect(exportToggle).toHaveAttribute("aria-expanded", "true")
  await expect(exportToggle).toBeFocused()

  for (const viewport of [
    { width: 1366, height: 768, file: "rc10-lineage-1366.png" },
    { width: 1536, height: 864, file: "rc10-lineage-1536.png" },
  ]) {
    await page.setViewportSize(viewport)
    await page.getByTestId("view-lineage").click()
    await expect(page.getByTestId("central-lineage-canvas")).toHaveAttribute("data-projected-relation-count", "5")
    await assertLineagePresentationGeometry(page)
    await expect(page.getByTestId("lineage-card-entity-lineage-hmsc")).toContainText("Ecological hierarchy")
    await expect(page.getByTestId("lineage-card-entity-lineage-trace")).toContainText("Open-tail foundation")
    await expect(page.getByTestId("lineage-card-entity-lineage-bigmvp")).toContainText("Scalable probit computation")
    await expect(page.getByTestId("lineage-card-entity-lineage-mgp")).toContainText("Factor shrinkage")
    await expect(page.getByTestId("lineage-target-card")).toContainText("Catalogue-aware extension")
    await page.screenshot({ path: path.join(screenshotDir, viewport.file), fullPage: false })
  }

  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 1536, height: 864 },
  ]) {
    await page.setViewportSize(viewport)
    await page.getByTestId("view-evidence").click()
    await assertNoNodeOverlap(page, 8)
    await assertNoEdgeLabelNodeCollision(page)
    await expect(page.getByTestId("closure-gaps")).not.toContainText("pending theorem or real-data closure evidence where listed")
    await expect(page.getByTestId("closure-gaps")).toContainText("group-indexed open-tail calibration")
    await expect(page.getByTestId("architecture-reference-panel")).not.toContainText("sits in the validation layer")
  }
  await page.screenshot({ path: path.join(screenshotDir, "rc10-evidence-1536.png"), fullPage: false })

  await page.getByTestId("architecture-search-scope").selectOption("all")
  await page.getByTestId("architecture-search-input").fill("beta")
  await expect(page.getByTestId("architecture-search-results")).toBeVisible()
  await page.getByTestId("save-view-state").click()
  await expect(page.getByTestId("architecture-action-status")).toContainText("saved")
  await page.getByTestId("view-lineage").click()
  await page.getByTestId("restore-view-state").click()
  await expect(page.getByTestId("current-view")).toContainText("Evidence")
})

test("RC11 reader-facing Architecture finish keeps formulas, labels, and why copy readable", async ({ page }) => {
  test.setTimeout(120_000)
  const rc11Dir = path.resolve("results/asteria_v2_rc11_reader_finish/screenshots")
  await fs.mkdir(rc11Dir, { recursive: true })

  for (const viewport of [
    { width: 1366, height: 768, theme: "light", detail: "overview" },
    { width: 1536, height: 864, theme: "dark", detail: "overview" },
  ] as const) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    const htmlTheme = await page.locator("html").getAttribute("data-theme")
    if (htmlTheme !== viewport.theme) await page.getByTestId("topbar-toggle-theme").click()
    await expect(page.locator("html")).toHaveAttribute("data-theme", viewport.theme)
    await page.getByTestId("model-cat-trace-frozen-v2").click()
    await page.getByTestId("detail-overview").click()
    await assertNoNodeOverlap(page, 8)
    await assertNoPrimaryTextClipping(page)
    await assertNoScientificLabelClipping(page)
    await assertNoEdgeLabelNodeCollision(page)
    for (const label of ["Catalogue-external open tail", "Richness and discovery targets"]) {
      await expect(page.locator(".architecture-map-node small", { hasText: label })).toBeVisible()
    }
    await page.screenshot({ path: path.join(rc11Dir, `rc11-cat-overview-${viewport.theme}-${viewport.width}.png`), fullPage: false })
  }

  await page.setViewportSize({ width: 1366, height: 768 })
  await page.getByTestId("model-cat-trace-frozen-v2").click()
  await page.getByTestId("detail-overview").click()
  for (const [symbol, expected, file] of [
    ["betaU_gh", "open-tail environmental response combines", "rc11-beta-definition.png"],
    ["gamma_g", "deterministic group intensity", "rc11-gamma-definition.png"],
    ["alphaU_gh", "TRACE extreme-tail calibration", "rc11-alphaU-definition.png"],
    ["Sigma_W", "finite working set", "rc11-sigmaW-definition.png"],
    ["c_f", "routes each raw feature", undefined],
    ["mathcal_K", "finite catalogue records known identities", undefined],
    ["zU_igh", "latent probit score combines", undefined],
    ["yU_igh", "thresholded reading of the open-tail latent score", undefined],
  ] as const) {
    await selectArchitectureSymbol(page, symbol)
    await expect(page.getByTestId("selected-why-it-matters")).toContainText(expected)
    await assertCanonicalFormulaHealthy(page, file)
  }
  for (const [symbol, expected] of [
    ["p_g", "fixed computational truncation"],
    ["mathcal_U", "catalogue-external open tail holds anonymous"],
    ["x_i", "covariates enter the probit latent score"],
  ] as const) {
    await selectArchitectureSymbol(page, symbol)
    await expect(page.getByTestId("selected-why-it-matters")).toContainText(expected)
  }

  await page.getByTestId("detail-full-model").click()
  await assertNoNodeOverlap(page, 8)
  await assertNoPrimaryTextClipping(page)
  await assertNoScientificLabelClipping(page)
  await assertNoEdgeLabelNodeCollision(page)
  for (const label of [
    "Shared environmental-response vector",
    "Catalogue-external open tail",
    "Group composition weight",
    "Response heterogeneity covariance",
    "Richness and discovery targets",
  ]) {
    await expect(page.locator(".architecture-map-node small", { hasText: label })).toBeVisible()
  }
  await page.screenshot({ path: path.join(rc11Dir, "rc11-cat-full-1366.png"), fullPage: false })

  await page.setViewportSize({ width: 1536, height: 864 })
  await assertNoNodeOverlap(page, 8)
  await assertNoPrimaryTextClipping(page)
  await assertNoScientificLabelClipping(page)
  await assertNoEdgeLabelNodeCollision(page)
  await page.screenshot({ path: path.join(rc11Dir, "rc11-cat-full-1536.png"), fullPage: false })

  await page.getByTestId("model-original-trace").click()
  await page.getByTestId("detail-overview").click()
  for (const [symbol, expected, file] of [
    ["z_ij", "latent probit score", "rc11-original-trace-definition.png"],
    ["beta_j", "shared response superpopulation", undefined],
    ["alpha_j", "calibrates the species intercept", undefined],
  ] as const) {
    await selectArchitectureSymbol(page, symbol, "original-trace")
    await expect(page.getByTestId("selected-why-it-matters")).toContainText(expected)
    await assertCanonicalFormulaHealthy(page, file)
  }
  await assertNoNodeOverlap(page, 8)
  await assertNoPrimaryTextClipping(page)
  await assertNoScientificLabelClipping(page)
  await assertNoEdgeLabelNodeCollision(page)

  const whyTexts = await page.getByTestId("selected-why-it-matters").evaluateAll((elements) => elements.map((element) => (element as HTMLElement).innerText))
  expect(whyTexts.join("\n")).not.toMatch(/\d+\s+upstream relations?|\d+\s+downstream relations?|sits in the .* layer|contextual graph entity/i)

  await page.getByTestId("view-lineage").click()
  await assertLineagePresentationGeometry(page)
  await page.getByTestId("view-evidence").click()
  await expect(page.getByTestId("central-evidence-canvas")).toContainText("Open-tail response decomposition is explicit")
  await page.getByTestId("view-architecture").click()
  await expect(page.getByTestId("advanced-export-validation")).toHaveAttribute("aria-expanded", "false")
  await page.getByTestId("save-view-state").click()
  await expect(page.getByTestId("architecture-action-status")).toContainText("saved")
})
