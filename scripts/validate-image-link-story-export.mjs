import { createServer } from "vite"
import { getSchema } from "@tiptap/core"

function fail(message) {
  console.error(message)
  process.exitCode = 1
}

function assert(condition, message) {
  if (!condition) fail(message)
}

const imageUrl = "https://example.com/figures/model.png"
const normalUrl = "https://example.com/paper"

const imageLinkDoc = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "See " },
        {
          type: "text",
          text: "model figure",
          marks: [{ type: "link", attrs: { href: imageUrl, asteriaImageLink: "true", asteriaImageSize: "medium" } }],
        },
        { type: "text", text: " and " },
        {
          type: "text",
          text: "paper link",
          marks: [{ type: "link", attrs: { href: normalUrl } }],
        },
        { type: "text", text: "." },
      ],
    },
  ],
}

const secondImageDoc = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "poster",
          marks: [{ type: "link", attrs: { href: "https://cdn.example.org/poster.webp", asteriaImageLink: "true", asteriaImageSize: "medium" } }],
        },
      ],
    },
  ],
}

function block(id, title, contentJson) {
  return {
    id,
    type: "block",
    position: { x: 0, y: 0 },
    data: {
      title,
      contentJson,
      variants: { default: { title, contentJson, updatedAt: "2026-07-23T00:00:00.000Z" } },
      backgroundColor: "#ffffff",
      textColor: "#111827",
      borderColor: "#e5e7eb",
      width: 340,
      height: 220,
      nodeType: "reference",
      createdAt: "2026-07-23T00:00:00.000Z",
      updatedAt: "2026-07-23T00:00:00.000Z",
    },
  }
}

const nodes = [
  block("block-1", "Model Evidence", imageLinkDoc),
  { ...block("block-2", "Poster Evidence", secondImageDoc), parentId: "group-1" },
  {
    id: "group-1",
    type: "group",
    position: { x: 0, y: 0 },
    data: {
      title: "Evidence Group",
      backgroundColor: "#ffffff",
      borderColor: "#e5e7eb",
      createdAt: "2026-07-23T00:00:00.000Z",
      updatedAt: "2026-07-23T00:00:00.000Z",
    },
  },
]

function input(storyOutline) {
  return {
    mapTitle: "Image Link Story",
    modelVersions: [{ id: "v1", label: "V1", shortLabel: "V1", createdAt: "2026-07-23T00:00:00.000Z", updatedAt: "2026-07-23T00:00:00.000Z" }],
    activeVersionId: "v1",
    nodes,
    storyOutline,
    storyDeckSettings: {
      title: "Image Link Deck",
      versionMode: "all",
      defaultDensity: "full",
      includeSpeakerNotes: false,
      includeSourceMetadata: false,
      includePrompt: true,
    },
  }
}

const vite = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "silent",
})

try {
  const [{ buildStoryMarkdown }, { contentJsonToHtml }, { contentJsonToMarkdown }, { imageLinkInsertionTextFromUrl }, { createEditorExtensions }] = await Promise.all([
    vite.ssrLoadModule("/src/lib/storyMarkdownExport.ts"),
    vite.ssrLoadModule("/src/editor/editorUtils.ts"),
    vite.ssrLoadModule("/src/lib/tiptapToMarkdown.ts"),
    vite.ssrLoadModule("/src/lib/imageLinks.ts"),
    vite.ssrLoadModule("/src/editor/createEditorExtensions.ts"),
  ])

  const schema = getSchema(createEditorExtensions(""))
  schema.nodeFromJSON(imageLinkDoc)

  const imageHtml = contentJsonToHtml(imageLinkDoc)
  assert(imageHtml.includes('data-asteria-image-link="true"'), "Expected rendered HTML to preserve image-link metadata.")
  assert(imageHtml.includes('data-asteria-image-size="medium"'), "Expected rendered HTML to preserve image-link size metadata.")
  assert(imageLinkInsertionTextFromUrl(imageUrl) === "Image: model.png", "Expected empty-selection Image Link insertion to use visible image-link text.")

  const markdownBody = contentJsonToMarkdown(imageLinkDoc)
  assert(markdownBody.includes(`[model figure](${imageUrl})`), "Expected body Markdown to keep image link as a normal Markdown link.")
  assert(markdownBody.includes(`[paper link](${normalUrl})`), "Expected normal links to remain ordinary Markdown links.")
  assert(!markdownBody.includes("![model figure]"), "Expected body Markdown not to inline image links inside sentences.")

  const blockMarkdown = buildStoryMarkdown(
    input([{ id: "story-1", sourceId: "block-1", sourceType: "block", slideTitle: "", density: "full", createdAt: "", updatedAt: "" }]),
  )
  assert(blockMarkdown.includes("### Images"), "Expected full-density block slide to include an Images section.")
  assert(blockMarkdown.includes(`[![model figure](${imageUrl})](${imageUrl})`), "Expected image link to export as linked Markdown image.")
  assert(!blockMarkdown.includes(`![paper link](${normalUrl})`), "Expected normal links to stay out of the Images section.")
  assert(blockMarkdown.includes("keep Markdown image references"), "Expected PPT prompt to mention Markdown image references.")

  const titleOnlyMarkdown = buildStoryMarkdown(
    input([{ id: "story-title", sourceId: "block-1", sourceType: "block", slideTitle: "", density: "title_only", createdAt: "", updatedAt: "" }]),
  )
  assert(!titleOnlyMarkdown.includes("### Images"), "Expected title-only slides not to export images.")

  const summaryMarkdown = buildStoryMarkdown(
    input([{ id: "story-summary", sourceId: "block-1", sourceType: "block", slideTitle: "", density: "summary", createdAt: "", updatedAt: "" }]),
  )
  assert(summaryMarkdown.includes("### Images"), "Expected summary slides to export images.")

  const groupMarkdown = buildStoryMarkdown(
    input([{ id: "story-group", sourceId: "group-1", sourceType: "group", slideTitle: "", density: "full", createdAt: "", updatedAt: "" }]),
  )
  assert(groupMarkdown.includes("### Images"), "Expected group slides to include child image links.")
  assert(
    groupMarkdown.includes(`[![Poster Evidence: poster](https://cdn.example.org/poster.webp)](https://cdn.example.org/poster.webp)`),
    "Expected group image labels to include the source block title.",
  )

  if (!process.exitCode) console.log("Validated image-link Story Markdown export behavior.")
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await vite.close()
  process.exit(process.exitCode ?? 0)
}
