import { createServer } from "vite"
import { getSchema } from "@tiptap/core"

function fail(message) {
  console.error(message)
  process.exitCode = 1
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function clipboardData({ html = "", text = "" }) {
  return {
    getData(type) {
      if (type === "text/html") return html
      if (type === "text/plain") return text
      return ""
    },
  }
}

const vite = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "silent",
})

try {
  const [{ shouldUsePlainTextMathPaste, preprocessPastedMath }, { contentJsonToHtml }, { createEditorExtensions }] = await Promise.all([
    vite.ssrLoadModule("/src/editor/mathPasteHandler.ts"),
    vite.ssrLoadModule("/src/editor/editorUtils.ts"),
    vite.ssrLoadModule("/src/editor/createEditorExtensions.ts"),
  ])

  assert(shouldUsePlainTextMathPaste(clipboardData({ text: "alpha $\\alpha$" })), "Expected plain-text math paste to use math preprocessing.")
  assert(
    !shouldUsePlainTextMathPaste(
      clipboardData({
        html: '<p><span style="color: #2563eb; font-size: 18px"><mark style="background-color: #fef3c7">$\\alpha$</mark></span></p>',
        text: "$\\alpha$",
      }),
    ),
    "Expected HTML clipboard data to keep the default rich-text paste path.",
  )

  const mathNodes = preprocessPastedMath("alpha $\\alpha$")
  assert(mathNodes?.[0]?.content?.some((node) => node.type === "inlineMath" && node.attrs?.latex === "\\alpha"), "Expected text-only math paste to create inlineMath.")

  const styledHtml = contentJsonToHtml({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Styled",
            marks: [
              { type: "textStyle", attrs: { color: "#2563eb", fontSize: "18px" } },
              { type: "highlight", attrs: { color: "#fef3c7" } },
            ],
          },
        ],
      },
    ],
  })
  assert(styledHtml.includes("color: #2563eb"), "Expected text color to be preserved in rendered rich text.")
  assert(styledHtml.includes("font-size: 18px"), "Expected font size to be preserved in rendered rich text.")
  assert(styledHtml.includes("background-color: #fef3c7"), "Expected highlight color to be preserved in rendered rich text.")

  const quoteDoc = {
    type: "doc",
    content: [
      {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Quote" }, { type: "hardBreak" }, { type: "text", text: "line" }],
          },
        ],
      },
      { type: "paragraph", content: [{ type: "text", text: "After" }] },
    ],
  }
  const quoteHtml = contentJsonToHtml(quoteDoc)
  assert(quoteHtml.includes("<blockquote>"), "Expected quote content to render as blockquote.")
  assert(quoteHtml.includes("<br />"), "Expected Shift+Enter quote content to render as a hard break.")
  assert(quoteHtml.indexOf("</blockquote>") < quoteHtml.indexOf("After"), "Expected Enter-exited paragraph to render after the quote.")

  const schema = getSchema(createEditorExtensions(""))
  schema.nodeFromJSON(quoteDoc)
  schema.nodeFromJSON({
    type: "doc",
    content: [
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              { type: "paragraph", content: [{ type: "text", text: "Plan" }] },
              {
                type: "blockquote",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Nested quote" }] }],
              },
              { type: "paragraph", content: [{ type: "text", text: "Back to list item" }] },
            ],
          },
        ],
      },
    ],
  })

  if (!process.exitCode) console.log("Validated rich-text clipboard style and quote document behavior.")
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await vite.close()
  process.exit(process.exitCode ?? 0)
}
