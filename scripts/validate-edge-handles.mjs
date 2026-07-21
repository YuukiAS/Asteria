import { readFile } from "node:fs/promises"
import { createServer } from "vite"

const sharedMapPath = new URL("../.runtime/asteria-server/shared-map.json", import.meta.url)
const blockNodePath = new URL("../src/components/BlockNode.tsx", import.meta.url)
const stylesPath = new URL("../src/styles/index.css", import.meta.url)
const motivationTitles = ["motivation/main idea", "main idea"]
const mainModelTitle = "main model"

function fail(message) {
  console.error(message)
  process.exitCode = 1
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value)
}

function titleMatches(node, terms) {
  const titles = [node.data?.title, ...Object.values(node.data?.variants || {}).map((variant) => variant?.title)]
    .filter(Boolean)
    .map((title) => String(title).toLowerCase())
  return terms.some((term) => titles.includes(term))
}

function nodeSize(node) {
  if (node.type === "block") return { width: node.data?.width, height: node.data?.height }
  return { width: node.style?.width, height: node.style?.height }
}

function nodePosition(node, nodesById, stack = new Set()) {
  if (stack.has(node.id)) return undefined
  const ownX = node.position?.x
  const ownY = node.position?.y
  if (!isFiniteNumber(ownX) || !isFiniteNumber(ownY)) return undefined
  const parentId = node.parentNode || node.parentId
  if (!parentId) return { x: ownX, y: ownY }
  const parent = nodesById.get(parentId)
  if (!parent) return { x: ownX, y: ownY }
  const parentPosition = nodePosition(parent, nodesById, new Set([...stack, node.id]))
  if (!parentPosition) return undefined
  return { x: parentPosition.x + ownX, y: parentPosition.y + ownY }
}

function edgeEndpoint(node, handle, nodesById) {
  const position = nodePosition(node, nodesById)
  const size = nodeSize(node)
  if (!position || !isFiniteNumber(size.width) || !isFiniteNumber(size.height) || size.width <= 0 || size.height <= 0) return undefined
  if (handle === "top") return { x: position.x + size.width / 2, y: position.y }
  if (handle === "right") return { x: position.x + size.width, y: position.y + size.height / 2 }
  if (handle === "bottom") return { x: position.x + size.width / 2, y: position.y + size.height }
  if (handle === "left") return { x: position.x, y: position.y + size.height / 2 }
  return undefined
}

function assertBoundaryEndpoint(label, endpoint, node, handle, nodesById) {
  const position = nodePosition(node, nodesById)
  const size = nodeSize(node)
  if (!endpoint || !position || !size) {
    fail(`${label} cannot resolve ${handle} endpoint for ${node.id}.`)
    return
  }
  const tolerance = 0.001
  const expected =
    handle === "top"
      ? position.y
      : handle === "bottom"
        ? position.y + size.height
        : handle === "left"
          ? position.x
          : position.x + size.width
  const actual = handle === "top" || handle === "bottom" ? endpoint.y : endpoint.x
  if (Math.abs(expected - actual) > tolerance) fail(`${label} ${handle} endpoint is not on the block boundary.`)
}

const vite = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "silent",
})

try {
  const [{ applyEdgePresentation }, { resolveBlockVersionState }, { allVersionsId }, { isBlockConnectionHandleId }] = await Promise.all([
    vite.ssrLoadModule("/src/lib/exportImport.ts"),
    vite.ssrLoadModule("/src/lib/blockVersionState.ts"),
    vite.ssrLoadModule("/src/constants/versioning.ts"),
    vite.ssrLoadModule("/src/constants/handles.ts"),
  ])
  const [blockNodeSource, stylesSource] = await Promise.all([readFile(blockNodePath, "utf8"), readFile(stylesPath, "utf8")])
  if (!blockNodeSource.includes('type="target"')) fail("Block nodes must render target handles for persisted targetHandle anchors.")
  if (blockNodeSource.includes("asteria-connection-handle-target") || stylesSource.includes("asteria-connection-handle-target")) {
    fail("Target handles must remain visible; hidden target handles make edges miss the visible orange connection points.")
  }

  const record = JSON.parse(await readFile(sharedMapPath, "utf8"))
  const map = record.map || record
  const nodes = Array.isArray(map.nodes) ? map.nodes : []
  const edges = Array.isArray(map.edges) ? map.edges : []
  const modelVersions = Array.isArray(map.modelVersions) ? map.modelVersions : []
  const activeVersionId = typeof map.activeVersionId === "string" ? map.activeVersionId : allVersionsId
  const visibleNodes = nodes.filter(
    (node) => activeVersionId === allVersionsId || node.type !== "block" || !resolveBlockVersionState(node.data, activeVersionId, modelVersions).isHidden,
  )
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id))
  const nodesById = new Map(nodes.map((node) => [node.id, node]))
  let checkedEdges = 0

  for (const rawEdge of edges) {
    if (!visibleNodeIds.has(rawEdge.source) || !visibleNodeIds.has(rawEdge.target)) continue
    if (activeVersionId !== allVersionsId && rawEdge.data?.visibility && rawEdge.data.visibility !== "all" && !rawEdge.data.visibility.includes(activeVersionId)) continue

    const edge = applyEdgePresentation(rawEdge)
    const source = nodesById.get(edge.source)
    const target = nodesById.get(edge.target)
    checkedEdges += 1

    if (!source) fail(`Visible edge ${edge.id} is missing source node ${edge.source}.`)
    if (!target) fail(`Visible edge ${edge.id} is missing target node ${edge.target}.`)
    if (!isBlockConnectionHandleId(edge.sourceHandle)) fail(`Visible edge ${edge.id} has invalid source handle ${edge.sourceHandle}.`)
    if (!isBlockConnectionHandleId(edge.targetHandle)) fail(`Visible edge ${edge.id} has invalid target handle ${edge.targetHandle}.`)
    if (source && !edgeEndpoint(source, edge.sourceHandle, nodesById)) fail(`Visible edge ${edge.id} cannot resolve its source endpoint.`)
    if (target && !edgeEndpoint(target, edge.targetHandle, nodesById)) fail(`Visible edge ${edge.id} cannot resolve its target endpoint.`)
  }

  const motivation = visibleNodes.find((node) => node.type === "block" && titleMatches(node, motivationTitles))
  const mainModel = visibleNodes.find((node) => node.type === "block" && titleMatches(node, [mainModelTitle]))
  if (!motivation) fail("Expected visible Motivation/Main Idea block in the shared map.")
  if (!mainModel) fail("Expected visible Main Model block in the shared map.")
  const motivationMainEdge = edges
    .map((edge) => applyEdgePresentation(edge))
    .find((edge) => edge.source === motivation?.id && edge.target === mainModel?.id)

  if (!motivationMainEdge) {
    fail("Expected visible Motivation/Main Idea -> Main Model edge in the shared map.")
  } else {
    if (motivationMainEdge.sourceHandle !== "bottom") fail("Motivation/Main Idea edge should leave from the bottom handle.")
    if (motivationMainEdge.targetHandle !== "top") fail("Motivation/Main Idea edge should enter Main Model through the top handle.")
    assertBoundaryEndpoint("Motivation/Main Idea source", edgeEndpoint(motivation, motivationMainEdge.sourceHandle, nodesById), motivation, "bottom", nodesById)
    assertBoundaryEndpoint("Main Model target", edgeEndpoint(mainModel, motivationMainEdge.targetHandle, nodesById), mainModel, "top", nodesById)
  }

  if (!process.exitCode) console.log(`Validated ${checkedEdges} shared-map visible edge endpoints.`)
} finally {
  await vite.close()
}
