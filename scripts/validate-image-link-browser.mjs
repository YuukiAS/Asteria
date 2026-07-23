const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/7/70/Example.png"

export async function validateImageLinkBrowser(tab, { url = "http://127.0.0.1:5173/" } = {}) {
  const pw = tab.playwright

  await tab.goto(url)
  await pw.waitForLoadState("domcontentloaded")
  await pw.waitForTimeout(700)

  const logsBefore = await tab.dev.logs({ levels: ["error", "warn"], limit: 50 })
  await pw.getByRole("button", { name: "Edit mode", exact: true }).click()
  await pw.getByRole("button", { name: "New medium block", exact: true }).click()
  await pw.waitForTimeout(700)

  const editor = pw.locator(".inspector .ProseMirror").first()
  await editor.click()
  await editor.type("alpha omega")
  await editor.press("Control+A")
  await openImageLinkDialogAndSubmit(pw)
  const selectedTextState = await readEditorImageLinkState(editor)
  assertEqual(selectedTextState.links.length, 1, "Expected selected text to become one image link.")
  assertEqual(selectedTextState.links[0].text, "alpha omega", "Expected Image Link to preserve selected text instead of appending a label.")
  assert(selectedTextState.html.startsWith("<p><a"), "Expected selected text Image Link to stay at the original text position.")

  await editor.click()
  await editor.press("Control+A")
  await editor.press("Backspace")
  await editor.type("plain")
  await openImageLinkDialogAndSubmit(pw)
  const emptyCursorState = await readEditorImageLinkState(editor)
  assertEqual(emptyCursorState.links.length, 1, "Expected empty cursor insertion to create one visible image link.")
  assertEqual(emptyCursorState.links[0].text, "Image: Example.png", "Expected empty cursor insertion to create visible image-link text.")
  assert(emptyCursorState.html.includes('data-asteria-image-link="true"'), "Expected editor HTML to include Image Link metadata.")

  const beforeRefresh = await readPageImageLinks(pw)
  await tab.reload()
  await pw.waitForLoadState("domcontentloaded")
  await pw.waitForTimeout(1200)
  const afterRefresh = await readPageImageLinks(pw)
  assert(afterRefresh.some((link) => link.parent === "block" && link.text === "Image: Example.png"), "Expected refreshed block preview to keep Image Link metadata.")

  await pw.getByRole("button", { name: "Edit mode", exact: true }).click()
  const imageBlockIndex = await pw.evaluate(() =>
    Array.from(document.querySelectorAll(".react-flow__node-block")).findIndex((node) =>
      Boolean(node.querySelector('a[data-asteria-image-link="true"]')),
    ),
  )
  if (imageBlockIndex < 0) throw new Error("Expected at least one block with a persisted Image Link after refresh.")
  await pw.locator(".react-flow__node-block").nth(imageBlockIndex).click()
  await pw.waitForTimeout(350)
  const editModePreview = await pw.evaluate(() => {
    const selected = document.querySelector(".asteria-block-selected")
    return Array.from(selected?.querySelectorAll('a[data-asteria-image-link="true"]') || []).map((anchor) => ({
      text: anchor.textContent || "",
      href: anchor.href,
      parent: anchor.closest(".rich-preview") ? "preview" : anchor.closest(".ProseMirror") ? "editor" : "other",
    }))
  })
  assert(editModePreview.some((link) => link.parent === "preview"), "Expected Image Link to be visible in edit-mode block preview.")

  const logsAfter = await tab.dev.logs({ levels: ["error", "warn"], limit: 50 })
  return {
    url: await tab.url(),
    title: await tab.title(),
    logsBefore,
    logsAfter,
    selectedTextState,
    emptyCursorState,
    beforeRefresh,
    afterRefresh,
    editModePreview,
  }
}

async function openImageLinkDialogAndSubmit(pw) {
  await pw.getByRole("button", { name: "Image link", exact: true }).click()
  await pw.waitForTimeout(200)
  await pw.locator(".image-link-dialog-input").fill(imageUrl)
  await pw.locator(".image-link-dialog-input").press("Enter")
  await pw.waitForTimeout(700)
  const dialogOpen = await pw.evaluate(() => Boolean(document.querySelector(".image-link-dialog")))
  if (dialogOpen) throw new Error("Expected Enter in the Image Link dialog to submit and close the dialog.")
}

async function readEditorImageLinkState(editor) {
  return editor.evaluate((el) => ({
    html: el.innerHTML,
    text: el.innerText,
    links: Array.from(el.querySelectorAll('a[data-asteria-image-link="true"]')).map((anchor) => ({
      text: anchor.textContent || "",
      href: anchor.href,
      image: anchor.dataset.asteriaImageLink,
      size: anchor.dataset.asteriaImageSize,
    })),
  }))
}

async function readPageImageLinks(pw) {
  return pw.evaluate(() =>
    Array.from(document.querySelectorAll('a[data-asteria-image-link="true"]')).map((anchor) => ({
      text: anchor.textContent || "",
      href: anchor.href,
      parent: anchor.closest(".inspector") ? "inspector" : anchor.closest(".asteria-block") ? "block" : "other",
    })),
  )
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message} Expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}.`)
}
