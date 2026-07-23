import { createServer } from "vite"
import { getSchema } from "@tiptap/core"
import { Slice } from "@tiptap/pm/model"

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

function domSpecAttrs(spec) {
  return spec?.[1] && typeof spec[1] === "object" && !Array.isArray(spec[1]) ? spec[1] : {}
}

const vite = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "silent",
})

try {
  const [{ shouldUsePlainTextMathPaste, preprocessPastedMath, serializeMathClipboardText }, { contentJsonToHtml }, { createEditorExtensions }] = await Promise.all([
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

  const mixedDocJson = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "plain " },
          {
            type: "text",
            text: "blue",
            marks: [{ type: "textStyle", attrs: { color: "#2563eb", fontSize: "18px" } }],
          },
          { type: "text", text: " + " },
          {
            type: "inlineMath",
            attrs: { latex: "\\alpha", textColor: "#dc2626", highlightColor: "#fef3c7" },
            marks: [{ type: "highlight", attrs: { color: "#fde68a" } }],
          },
          { type: "hardBreak" },
          { type: "text", text: "next" },
        ],
      },
      { type: "blockMath", attrs: { latex: "\\beta^2", textColor: "#059669", highlightColor: "#ecfdf5" } },
    ],
  }
  const mixedHtml = contentJsonToHtml(mixedDocJson)
  assert(mixedHtml.includes("color: #2563eb"), "Expected styled text color to survive mixed rich HTML serialization.")
  assert(mixedHtml.includes("font-size: 18px"), "Expected styled text font size to survive mixed rich HTML serialization.")
  assert(mixedHtml.includes('data-math-inline=""'), "Expected mixed rich HTML to keep inline math identity.")
  assert(mixedHtml.includes('data-latex="\\alpha"'), "Expected mixed rich HTML to keep inline math LaTeX.")
  assert(mixedHtml.includes('data-text-color="#dc2626"'), "Expected inline math text color to survive mixed rich HTML serialization.")
  assert(mixedHtml.includes('data-highlight-color="#fef3c7"'), "Expected inline math highlight color to survive mixed rich HTML serialization.")
  assert(mixedHtml.includes('data-math-block=""'), "Expected mixed rich HTML to keep block math identity.")
  assert(mixedHtml.includes('data-latex="\\beta^2"'), "Expected mixed rich HTML to keep block math LaTeX.")

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
  const mixedDoc = schema.nodeFromJSON(mixedDocJson)
  const mixedText = serializeMathClipboardText(new Slice(mixedDoc.content, 0, 0))
  assert(mixedText.includes("plain blue + $\\alpha$"), "Expected copied plain text to keep mixed text and inline formula.")
  assert(mixedText.includes("next"), "Expected copied plain text to keep hard-break text.")
  assert(mixedText.includes("$$\n\\beta^2\n$$"), "Expected copied plain text to keep block formula text.")

  const inlineSpec = schema.nodes.inlineMath.spec.toDOM?.(
    schema.nodes.inlineMath.create({ latex: "\\alpha", textColor: "#dc2626", highlightColor: "#fef3c7" }),
  )
  const inlineAttrs = domSpecAttrs(inlineSpec)
  assert(inlineAttrs["data-math-inline"] === "", "Expected clipboard HTML spec to mark inline math nodes.")
  assert(inlineAttrs["data-latex"] === "\\alpha", "Expected clipboard HTML spec to preserve inline math LaTeX.")
  assert(inlineAttrs["data-text-color"] === "#dc2626", "Expected clipboard HTML spec to preserve inline math text color.")
  assert(inlineAttrs["data-highlight-color"] === "#fef3c7", "Expected clipboard HTML spec to preserve inline math highlight color.")
  assert(inlineAttrs.style.includes("color: #dc2626"), "Expected clipboard HTML spec to render inline math text color style.")
  assert(inlineSpec?.[2] === "\\alpha", "Expected clipboard HTML spec to include inline formula text fallback.")

  const blockSpec = schema.nodes.blockMath.spec.toDOM?.(schema.nodes.blockMath.create({ latex: "\\beta^2", textColor: "#059669", highlightColor: "#ecfdf5" }))
  const blockAttrs = domSpecAttrs(blockSpec)
  assert(blockAttrs["data-math-block"] === "", "Expected clipboard HTML spec to mark block math nodes.")
  assert(blockAttrs["data-latex"] === "\\beta^2", "Expected clipboard HTML spec to preserve block math LaTeX.")
  assert(blockAttrs["data-text-color"] === "#059669", "Expected clipboard HTML spec to preserve block math text color.")
  assert(blockAttrs["data-highlight-color"] === "#ecfdf5", "Expected clipboard HTML spec to preserve block math highlight color.")
  assert(blockSpec?.[2] === "\\beta^2", "Expected clipboard HTML spec to include block formula text fallback.")

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
