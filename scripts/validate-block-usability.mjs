import { createServer } from "vite"

function fail(message) {
  console.error(message)
  process.exitCode = 1
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) fail(`${message} Expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}.`)
}

const at = "2026-07-30T00:00:00.000Z"
const googleThumbnailUrl =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwyM3z4t4RA5WIhCq-Ytlb1NTSV_yMcnSLTrbJu0bnUYxGIgNvfT_gf8L4Igg5RaI-FRGIhPBkIsB9p_lIjZwMiNTig8CMJgcDnGqSAF_rLg&s=10"

const vite = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "silent",
})

try {
  const [{ blockSizePresets }, { createBlockNode, normalizeExportedMap, resolveBlockEditingTitle, createBlockVariant }, { resolveBlockVersionState }, { imageLinkReferenceFromAnchorParts, isPreviewableImageUrl }] =
    await Promise.all([
      vite.ssrLoadModule("/src/constants/layout.ts"),
      vite.ssrLoadModule("/src/lib/exportImport.ts"),
      vite.ssrLoadModule("/src/lib/blockVersionState.ts"),
      vite.ssrLoadModule("/src/lib/imageLinks.ts"),
    ])

  assertEqual(blockSizePresets.small.width, 480, "Expected Small preset width to match shared-map baseline.")
  assertEqual(blockSizePresets.small.height, 280, "Expected Small preset height to match shared-map baseline.")
  assertEqual(blockSizePresets.medium.width, 640, "Expected Medium preset width to match shared-map median.")
  assertEqual(blockSizePresets.medium.height, 360, "Expected Medium preset height to match shared-map median.")
  assertEqual(blockSizePresets.large.width, 820, "Expected Large preset width to match shared-map upper range.")
  assertEqual(blockSizePresets.large.height, 500, "Expected Large preset height to match shared-map upper range.")

  const defaultBlock = createBlockNode()
  assertEqual(defaultBlock.data.width, blockSizePresets.medium.width, "Expected new blocks to use the Medium preset width by default.")
  assertEqual(defaultBlock.data.height, blockSizePresets.medium.height, "Expected new blocks to use the Medium preset height by default.")

  const normalized = normalizeExportedMap({
    version: 1,
    nodes: [
      {
        id: "block-missing-size",
        type: "block",
        position: { x: 0, y: 0 },
        data: {
          title: "Missing size",
          contentJson: { type: "doc", content: [{ type: "paragraph" }] },
          backgroundColor: "#ffffff",
          textColor: "#111827",
          borderColor: "#e5e7eb",
          nodeType: "generic",
          createdAt: at,
          updatedAt: at,
        },
      },
    ],
    edges: [],
    updatedAt: at,
  })
  const normalizedBlock = normalized.nodes[0]
  assertEqual(normalizedBlock.data.width, blockSizePresets.medium.width, "Expected import fallback width to use the Medium preset.")
  assertEqual(normalizedBlock.data.height, blockSizePresets.medium.height, "Expected import fallback height to use the Medium preset.")

  assert(isPreviewableImageUrl("https://example.com/figure.PNG?download=1#view"), "Expected image path URLs with query/hash to be previewable in Zoom.")
  assert(isPreviewableImageUrl("https://assets.example.com/render?format=webp&id=12"), "Expected image format query URLs to be previewable in Zoom.")
  assert(isPreviewableImageUrl(googleThumbnailUrl), "Expected Google encrypted thumbnail image endpoints to be previewable in Zoom.")
  assert(!isPreviewableImageUrl("https://example.com/paper"), "Expected ordinary non-image links not to be previewable by URL alone.")
  assert(!isPreviewableImageUrl("https://example.com/images?q=paper"), "Expected ordinary image-named web routes without image signals not to be previewable by URL alone.")
  assert(
    imageLinkReferenceFromAnchorParts({
      href: "https://example.com/paper",
      label: "paper",
      asteriaImageLink: "true",
      asteriaImageSize: "medium",
    })?.href === "https://example.com/paper",
    "Expected explicit Asteria Image Links to remain previewable even without an image extension.",
  )
  assert(
    imageLinkReferenceFromAnchorParts({
      href: "https://example.com/chart.webp?cache=1",
      label: "chart",
      includePreviewableImageUrls: true,
    })?.label === "chart",
    "Expected Zoom inline mode to extract ordinary image URL anchors.",
  )
  assert(
    imageLinkReferenceFromAnchorParts({
      href: googleThumbnailUrl,
      label: "Ascomycota",
      includePreviewableImageUrls: true,
    })?.href === googleThumbnailUrl,
    "Expected Zoom inline mode to extract Google encrypted thumbnail anchors pasted as ordinary links.",
  )
  assert(
    !imageLinkReferenceFromAnchorParts({
      href: "https://example.com/chart.webp",
      label: "chart",
      includePreviewableImageUrls: false,
    }),
    "Expected non-Zoom hover mode not to treat ordinary image URL anchors as Asteria Image Links.",
  )

  const modelVersions = [
    { id: "v1", label: "Version 1", shortLabel: "V1", createdAt: at, updatedAt: at },
    { id: "v2", label: "Version 2", shortLabel: "V2", createdAt: at, updatedAt: at },
  ]
  const inheritedData = {
    ...defaultBlock.data,
    title: "Base title",
    variants: {
      v1: createBlockVariant("Inherited title", defaultBlock.data.contentJson, defaultBlock.data.contentHtml, at),
    },
    activeVariantKey: "default",
  }
  const inheritedState = resolveBlockVersionState(inheritedData, "v2", modelVersions)
  assertEqual(inheritedState.requestedVariantKey, "v2", "Expected active V2 to be the edit target.")
  assertEqual(inheritedState.renderedVariantKey, "v1", "Expected V2 title editing to start from inherited V1 content.")
  assertEqual(
    resolveBlockEditingTitle(inheritedData, inheritedState.requestedVariantKey, inheritedState.renderedVariantKey),
    "Inherited title",
    "Expected title input to show the rendered inherited title before the own variant exists.",
  )
  const ownData = {
    ...inheritedData,
    variants: {
      ...inheritedData.variants,
      v2: createBlockVariant("Edited V2 title", defaultBlock.data.contentJson, defaultBlock.data.contentHtml, at),
    },
  }
  assertEqual(
    resolveBlockEditingTitle(ownData, "v2", "v1"),
    "Edited V2 title",
    "Expected title input to switch to the requested own variant after the first edit.",
  )

  if (!process.exitCode) console.log("Validated block size, Zoom image URL, and title-edit usability behavior.")
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await vite.close()
  process.exit(process.exitCode ?? 0)
}
