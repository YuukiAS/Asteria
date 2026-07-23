import { createServer } from "vite"
import { getSchema } from "@tiptap/core"
import { Slice } from "@tiptap/pm/model"
import { EditorState, TextSelection } from "@tiptap/pm/state"

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

function collectNodesByType(nodes, type) {
  return (nodes || []).flatMap((node) => [
    ...(node.type === type ? [node] : []),
    ...collectNodesByType(node.content, type),
  ])
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
  const [
    { shouldUsePlainTextMathPaste, preprocessPastedMath, preprocessPastedAsteriaMathHtml, serializeMathClipboardText, normalizeAsteriaMathClipboardHtml },
    { contentJsonToHtml },
    { preserveEmptyRichTextBlocks },
    { createEditorExtensions },
    { exitEmptyListItemToParagraph, exitNestedListItemToParentParagraph, selectionIsInsideListItem },
  ] =
    await Promise.all([
    vite.ssrLoadModule("/src/editor/mathPasteHandler.ts"),
    vite.ssrLoadModule("/src/editor/editorUtils.ts"),
    vite.ssrLoadModule("/src/lib/sanitize.ts"),
    vite.ssrLoadModule("/src/editor/createEditorExtensions.ts"),
    vite.ssrLoadModule("/src/editor/listContinuationExtension.ts"),
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

  const emptyHeadingHtml = contentJsonToHtml({
    type: "doc",
    content: [
      { type: "heading", attrs: { level: 2 } },
      { type: "paragraph", content: [{ type: "text", text: "Body" }] },
    ],
  })
  assert(emptyHeadingHtml.includes('<h2><br data-asteria-empty-heading="true" /></h2>'), "Expected empty headings to keep a visible preview line.")
  assert(
    preserveEmptyRichTextBlocks("<h2></h2><p></p>").includes('data-asteria-empty-heading="true"') &&
      preserveEmptyRichTextBlocks("<h2></h2><p></p>").includes('data-asteria-empty-paragraph="true"'),
    "Expected legacy empty rich-text HTML blocks to receive visible placeholders.",
  )

  const schema = getSchema(createEditorExtensions(""))
  const nestedBulletDoc = schema.nodeFromJSON({
    type: "doc",
    content: [
      {
        type: "orderedList",
        content: [
          {
            type: "listItem",
            content: [
              { type: "paragraph", content: [{ type: "text", text: "Parent" }] },
              {
                type: "bulletList",
                content: [
                  { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Here" }] }] },
                  { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "The matrix" }] }] },
                ],
              },
            ],
          },
        ],
      },
    ],
  })
  let nestedBulletCursor = 0
  nestedBulletDoc.descendants((node, pos) => {
    if (node.type.name === "paragraph" && node.textContent === "The matrix") nestedBulletCursor = pos + 1 + node.textContent.length
  })
  const nestedBulletState = EditorState.create({
    doc: nestedBulletDoc,
    selection: TextSelection.create(nestedBulletDoc, nestedBulletCursor),
  })
  let nestedBulletTransaction
  assert(
    exitNestedListItemToParentParagraph(nestedBulletState, (tr) => {
      nestedBulletTransaction = tr
    }),
    "Expected Shift+Tab on a non-empty nested bullet to be handled before default list lifting.",
  )
  const shiftedNestedBulletJson = nestedBulletTransaction.doc.toJSON()
  const shiftedParentItem = shiftedNestedBulletJson.content[0].content[0]
  assert(shiftedNestedBulletJson.content[0].content.length === 1, "Expected nested Shift+Tab not to create a second top-level numbered item.")
  assert(shiftedParentItem.content[1].type === "bulletList", "Expected the earlier nested bullet to remain a bullet list.")
  assert(shiftedParentItem.content[1].content.length === 1, "Expected only the current nested bullet item to move out.")
  assert(
    shiftedParentItem.content[2].type === "paragraph" && shiftedParentItem.content[2].content[0].text === "The matrix",
    "Expected the current nested bullet text to become a parent-list paragraph.",
  )

  const trailingOrderedDoc = schema.nodeFromJSON({
    type: "doc",
    content: [
      {
        type: "orderedList",
        attrs: { start: 9 },
        content: [
          { type: "listItem", content: [{ type: "paragraph" }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "11" }] }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "1" }] }] },
        ],
      },
    ],
  })
  let nonEmptyFinalCursor = 0
  trailingOrderedDoc.descendants((node, pos) => {
    if (node.type.name === "paragraph" && node.textContent === "1") nonEmptyFinalCursor = pos + 1 + node.textContent.length
  })
  const nonEmptyFinalState = EditorState.create({
    doc: trailingOrderedDoc,
    selection: TextSelection.create(trailingOrderedDoc, nonEmptyFinalCursor),
  })
  assert(
    !exitEmptyListItemToParagraph(nonEmptyFinalState, () => {}),
    "Expected Shift+Tab on a non-empty final numbered item not to remove its list marker.",
  )
  assert(
    selectionIsInsideListItem(nonEmptyFinalState),
    "Expected Shift+Tab on a non-empty numbered item to be swallowed before default list lifting.",
  )

  const emptyTrailingOrderedDoc = schema.nodeFromJSON({
    type: "doc",
    content: [
      {
        type: "orderedList",
        attrs: { start: 9 },
        content: [
          { type: "listItem", content: [{ type: "paragraph" }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "11" }] }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "1" }] }] },
          { type: "listItem", content: [{ type: "paragraph" }] },
        ],
      },
    ],
  })
  let emptyTrailingCursor = 0
  let seenEmptyItems = 0
  emptyTrailingOrderedDoc.descendants((node, pos) => {
    if (node.type.name === "paragraph" && node.textContent === "") {
      seenEmptyItems += 1
      if (seenEmptyItems === 2) emptyTrailingCursor = pos + 1
    }
  })
  const emptyTrailingState = EditorState.create({
    doc: emptyTrailingOrderedDoc,
    selection: TextSelection.create(emptyTrailingOrderedDoc, emptyTrailingCursor),
  })
  let emptyTrailingTransaction
  assert(
    exitEmptyListItemToParagraph(emptyTrailingState, (tr) => {
      emptyTrailingTransaction = tr
    }),
    "Expected Shift+Tab on a truly empty trailing numbered item to exit the list.",
  )
  const emptyTrailingJson = emptyTrailingTransaction.doc.toJSON()
  assert(emptyTrailingJson.content[0].content.length === 3, "Expected trailing empty-list exit to keep the existing numbered items.")
  assert(emptyTrailingJson.content[0].content[2].content[0].content[0].text === "1", "Expected the previous numbered item text to remain inside the list.")
  assert(emptyTrailingJson.content[1].type === "paragraph", "Expected an empty paragraph after the list.")
  const afterExitState = EditorState.create({
    doc: emptyTrailingTransaction.doc,
    selection: TextSelection.create(emptyTrailingTransaction.doc, emptyTrailingTransaction.selection.from),
  })
  assert(!selectionIsInsideListItem(afterExitState), "Expected the exited empty paragraph to be outside the list.")

  const mixedDoc = schema.nodeFromJSON(mixedDocJson)
  const mixedSlice = new Slice(mixedDoc.content, 0, 0)
  const mixedText = serializeMathClipboardText(mixedSlice)
  assert(mixedText.includes("plain blue + $\\alpha$"), "Expected copied plain text to keep mixed text and inline formula.")
  assert(mixedText.includes("next"), "Expected copied plain text to keep hard-break text.")
  assert(mixedText.includes("$$\n\\beta^2\n$$"), "Expected copied plain text to keep block formula text.")
  const normalizedPasteHtml = normalizeAsteriaMathClipboardHtml('<p>x <span data-math-inline="" data-latex="\\alpha"><span class="katex">visible</span></span></p>')
  assert(normalizedPasteHtml.includes('data-math-inline=""'), "Expected paste normalization to keep inline math identity.")
  assert(normalizedPasteHtml.includes('data-latex="\\alpha"'), "Expected paste normalization to keep inline math LaTeX.")
  assert(!normalizedPasteHtml.includes("visible"), "Expected paste normalization to remove rendered KaTeX children before ProseMirror parses HTML.")
  assert(normalizedPasteHtml.includes("$\\alpha$"), "Expected paste normalization to keep an inline LaTeX fallback so browser parsing preserves the math node.")

  if (typeof window !== "undefined" && typeof window.DOMParser !== "undefined") {
    const parsedStyledMathHtml = preprocessPastedAsteriaMathHtml(
      '<li>The observation model is <span data-math-inline="" data-latex="y_{ij}=1(z_{ij}&gt;0)" data-text-color="rgb(249, 115, 22)" style="color: rgb(249, 115, 22);"><span class="katex">visible</span></span>.</li><li>The latent probit model is <span data-math-inline="" data-latex="z_{ij}=\\\\alpha_j+x_i^T\\\\beta_j+\\\\epsilon_{ij}" data-text-color="rgb(249, 115, 22)" style="color: rgb(249, 115, 22);"><span class="katex">visible</span></span>.</li>',
    )
    const parsedStyledMath = collectNodesByType(parsedStyledMathHtml, "inlineMath")
    assert(parsedStyledMath.length === 2, "Expected Asteria math HTML paste preprocessing to keep copied list formulas.")
    assert(
      parsedStyledMath.every((node) => node.attrs?.textColor === "rgb(249, 115, 22)"),
      "Expected Asteria math HTML paste preprocessing to keep copied formula text color.",
    )
  }

  const inlineSpec = schema.nodes.inlineMath.spec.toDOM?.(
    schema.nodes.inlineMath.create({ latex: "\\alpha", textColor: "#dc2626", highlightColor: "#fef3c7" }),
  )
  const inlineAttrs = domSpecAttrs(inlineSpec)
  assert(inlineAttrs["data-math-inline"] === "", "Expected clipboard HTML spec to mark inline math nodes.")
  assert(inlineAttrs["data-latex"] === "\\alpha", "Expected clipboard HTML spec to preserve inline math LaTeX.")
  assert(inlineAttrs["data-text-color"] === "#dc2626", "Expected clipboard HTML spec to preserve inline math text color.")
  assert(inlineAttrs["data-highlight-color"] === "#fef3c7", "Expected clipboard HTML spec to preserve inline math highlight color.")
  assert(inlineAttrs.style.includes("color: #dc2626"), "Expected clipboard HTML spec to render inline math text color style.")
  assert(inlineSpec?.[2] === "\\alpha", "Expected non-browser clipboard HTML spec fallback to keep inline math visible instead of an empty wrapper.")

  const blockSpec = schema.nodes.blockMath.spec.toDOM?.(schema.nodes.blockMath.create({ latex: "\\beta^2", textColor: "#059669", highlightColor: "#ecfdf5" }))
  const blockAttrs = domSpecAttrs(blockSpec)
  assert(blockAttrs["data-math-block"] === "", "Expected clipboard HTML spec to mark block math nodes.")
  assert(blockAttrs["data-latex"] === "\\beta^2", "Expected clipboard HTML spec to preserve block math LaTeX.")
  assert(blockAttrs["data-text-color"] === "#059669", "Expected clipboard HTML spec to preserve block math text color.")
  assert(blockAttrs["data-highlight-color"] === "#ecfdf5", "Expected clipboard HTML spec to preserve block math highlight color.")
  assert(blockSpec?.[2] === "\\beta^2", "Expected non-browser clipboard HTML spec fallback to keep block math visible instead of an empty wrapper.")

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
