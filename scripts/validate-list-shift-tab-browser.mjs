export async function validateListShiftTabBrowser(tab, { url = "http://127.0.0.1:5173/" } = {}) {
  const pw = tab.playwright

  await tab.goto(url)
  await pw.waitForLoadState("domcontentloaded")
  await pw.waitForTimeout(700)

  const logsBefore = await tab.dev.logs({ levels: ["error", "warn"], limit: 50 })
  await pw.getByRole("button", { name: "Edit mode", exact: true }).click()
  await pw.getByRole("button", { name: "New medium block", exact: true }).click()
  await pw.waitForTimeout(500)
  await pw.locator(".asteria-block-selected .asteria-block-preview").dblclick()
  await pw.waitForTimeout(300)

  const editor = pw.locator(".asteria-block-selected .ProseMirror").first()
  await editor.click()
  await editor.press("Control+A")
  await editor.press("Backspace")

  await editor.press("9")
  await editor.press(".")
  await editor.press("Space")
  await pw.waitForTimeout(150)
  await editor.type("x")
  await editor.press("Enter")
  await editor.type("11")
  await editor.press("Enter")
  await editor.type("1")
  await editor.press("Enter")
  await pw.waitForTimeout(150)

  const before = await readListState(editor)
  await editor.press("Shift+Tab")
  await pw.waitForTimeout(250)
  const afterFirstShiftTab = await readListState(editor)
  await editor.press("Shift+Tab")
  await pw.waitForTimeout(250)
  const afterSecondShiftTab = await readListState(editor)
  const logsAfter = await tab.dev.logs({ levels: ["error", "warn"], limit: 50 })

  assertListState(before, {
    phase: "before Shift+Tab",
    expectedLiTexts: ["x", "11", "1", ""],
    expectedTrailingParagraph: false,
  })
  assertListState(afterFirstShiftTab, {
    phase: "after first Shift+Tab",
    expectedLiTexts: ["x", "11", "1"],
    expectedTrailingParagraph: true,
  })
  assertListState(afterSecondShiftTab, {
    phase: "after second Shift+Tab",
    expectedLiTexts: ["x", "11", "1"],
    expectedTrailingParagraph: true,
  })

  if (afterSecondShiftTab.topLevelParagraphTexts.includes("1")) {
    throw new Error("Shift+Tab leaked the final numbered item into a top-level paragraph.")
  }

  return {
    url: await tab.url(),
    title: await tab.title(),
    logsBefore,
    logsAfter,
    before,
    afterFirstShiftTab,
    afterSecondShiftTab,
  }
}

async function readListState(editor) {
  return editor.evaluate((el) => ({
    html: el.innerHTML,
    text: el.innerText,
    olCount: el.querySelectorAll("ol").length,
    olStart: el.querySelector("ol")?.getAttribute("start") || "",
    liTexts: Array.from(el.querySelectorAll("ol > li")).map((li) => li.innerText.trim()),
    topLevelBlocks: Array.from(el.children).map((child) => ({
      tag: child.tagName,
      text: child.innerText.trim(),
      html: child.outerHTML,
    })),
    topLevelParagraphTexts: Array.from(el.children)
      .filter((child) => child.tagName === "P")
      .map((child) => child.innerText.trim())
      .filter(Boolean),
  }))
}

function assertListState(state, { phase, expectedLiTexts, expectedTrailingParagraph }) {
  if (state.olCount !== 1) throw new Error(`${phase}: expected exactly one ordered list, found ${state.olCount}.`)
  if (state.olStart !== "9") throw new Error(`${phase}: expected ordered list start=9, found ${state.olStart || "none"}.`)
  const actual = JSON.stringify(state.liTexts)
  const expected = JSON.stringify(expectedLiTexts)
  if (actual !== expected) throw new Error(`${phase}: expected list items ${expected}, found ${actual}.`)
  const hasTrailingParagraph = state.topLevelBlocks.some((block) => block.tag === "P" && block.text === "")
  if (hasTrailingParagraph !== expectedTrailingParagraph) {
    throw new Error(`${phase}: expected trailing empty paragraph=${expectedTrailingParagraph}, found ${hasTrailingParagraph}.`)
  }
}
