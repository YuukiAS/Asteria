import { createServer } from "vite"

function fail(message) {
  console.error(message)
  process.exitCode = 1
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function content(text) {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text }],
      },
    ],
  }
}

function variant(title, text, updatedAt) {
  return {
    title,
    contentJson: content(text),
    contentHtml: `<p>${text}</p>`,
    updatedAt,
  }
}

function block(id, title, text, updatedAt, variants = {}) {
  const base = variant(title, text, updatedAt)
  return {
    id,
    type: "block",
    position: { x: 0, y: 0 },
    data: {
      ...base,
      variants: { default: base, ...variants },
      activeVariantKey: "version-cat",
      backgroundColor: "#ffffff",
      textColor: "#111111",
      borderColor: "#111111",
      width: 320,
      height: 180,
      nodeType: "result",
      createdAt: updatedAt,
      updatedAt,
    },
  }
}

function edge(id, source, target, updatedAt) {
  return {
    id,
    source,
    target,
    sourceHandle: "right",
    targetHandle: "left",
    data: {
      createdAt: updatedAt,
      updatedAt,
    },
  }
}

const vite = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "silent",
})

try {
  const { preserveLocalMapInformation } = await vite.ssrLoadModule("/src/lib/restoreSafety.ts")
  const restoredResults = variant("Results", "short old results", "2026-07-26T12:25:16.000Z")
  const currentResults = variant("Results", "new detailed results ".repeat(120), "2026-07-26T02:12:17.000Z")
  const restored = {
    modelVersions: [{ id: "version-cat", label: "CAT-TRACE", createdAt: "2026-07-20T00:00:00.000Z", updatedAt: "2026-07-20T00:00:00.000Z" }],
    storyOutline: [
      {
        id: "story-restored",
        sourceId: "results",
        sourceType: "block",
        slideTitle: "Results",
        density: "full",
        createdAt: "2026-07-20T00:00:00.000Z",
        updatedAt: "2026-07-20T00:00:00.000Z",
      },
    ],
    nodes: [block("results", "Results", "fallback", "2026-07-26T12:25:16.000Z", { "version-cat": restoredResults })],
    edges: [edge("edge-restored", "results", "results", "2026-07-26T12:25:16.000Z")],
  }
  const currentOnlyNode = block("jsdm", "JSDMs and Related Community-Modeling Frameworks", "new local block", "2026-07-26T12:25:15.000Z")
  const current = {
    modelVersions: [
      ...restored.modelVersions,
      { id: "version-extra", label: "Extra", createdAt: "2026-07-26T00:00:00.000Z", updatedAt: "2026-07-26T00:00:00.000Z" },
    ],
    storyOutline: [
      {
        id: "story-jsdm",
        sourceId: "jsdm",
        sourceType: "block",
        slideTitle: "JSDMs",
        density: "full",
        createdAt: "2026-07-26T12:25:15.000Z",
        updatedAt: "2026-07-26T12:25:15.000Z",
      },
    ],
    nodes: [block("results", "Results", "fallback", "2026-07-26T02:12:17.000Z", { "version-cat": currentResults }), currentOnlyNode],
    edges: [edge("edge-current", "results", "jsdm", "2026-07-26T12:25:15.000Z"), edge("edge-orphan", "missing", "jsdm", "2026-07-26T12:25:15.000Z")],
  }

  const merged = preserveLocalMapInformation(restored, current)
  const mergedResults = merged.nodes.find((node) => node.id === "results")?.data?.variants?.["version-cat"]
  assert(merged.nodes.some((node) => node.id === "jsdm"), "Current-only local node was not preserved.")
  assert(merged.edges.some((item) => item.id === "edge-current"), "Current-only edge with valid endpoints was not preserved.")
  assert(!merged.edges.some((item) => item.id === "edge-orphan"), "Orphan current edge should not be preserved.")
  assert(merged.storyOutline.some((item) => item.id === "story-jsdm"), "Current-only story item was not preserved.")
  assert(merged.modelVersions.some((version) => version.id === "version-extra"), "Current-only model version was not preserved.")
  assert(mergedResults?.contentHtml === currentResults.contentHtml, "Substantially fuller local variant was not preserved over shorter restored content.")

  if (!process.exitCode) console.log("Validated restore safety merge preserves local-only map information.")
} finally {
  await vite.close()
}
