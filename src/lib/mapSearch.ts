import type { JSONContent } from "@tiptap/react"
import { blockTypeByValue } from "../constants/blockTypes"
import { allVersionsId, defaultVariantKey } from "../constants/versioning"
import { resolveBlockVersionState } from "./blockVersionState"
import { resolveBlockContentJson, resolveBlockContentHtml, resolveBlockSymbolEntries, resolveBlockTitle } from "./exportImport"
import { normalizeLatexText } from "./symbolEntries"
import type { BlockNode, MapNode, ModelVersion } from "../types/map"

export type SearchSource = "Title" | "Text" | "Inline equation" | "Block equation" | "Symbol" | "Symbol meaning"

export type SearchableContent = {
  blockId: string
  blockTitle: string
  blockType: string
  source: SearchSource
  text: string
  normalizedText: string
  mathText?: string
}

export type SearchResult = SearchableContent & {
  rank: number
  snippet: string
}

export type SearchNavigationTarget = {
  blockId: string
  center: { x: number; y: number }
  width: number
  height: number
}

function stripHtml(value: unknown) {
  return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function normalizeText(value: unknown) {
  return String(value ?? "").toLowerCase().replace(/\s+/g, " ").trim()
}

function normalizeMathForSearch(value: unknown) {
  return normalizeLatexText(String(value ?? "")).replace(/\s+/g, "").toLowerCase()
}

export function normalizeSearchQuery(query: string) {
  const text = normalizeText(query)
  return {
    raw: query,
    text,
    math: normalizeMathForSearch(query),
  }
}

function pushText(items: SearchableContent[], block: BlockNode, title: string, source: SearchSource, text: unknown) {
  const rawText = String(text ?? "")
  const normalized = normalizeText(text)
  if (!normalized) return
  const type = blockTypeByValue[block.data.nodeType] || blockTypeByValue.generic
  items.push({
    blockId: block.id,
    blockTitle: title,
    blockType: type.label,
    source,
    text: rawText,
    normalizedText: normalized,
    mathText: source === "Inline equation" || source === "Block equation" || source === "Symbol" ? normalizeMathForSearch(rawText) : undefined,
  })
}

function visitContentJson(items: SearchableContent[], block: BlockNode, title: string, node?: JSONContent) {
  const stack = node ? [node] : []
  const seen = new Set<JSONContent>()
  let visited = 0
  while (stack.length && visited < 5000) {
    const current = stack.pop()
    if (!current || seen.has(current)) continue
    seen.add(current)
    visited += 1
    if (current.type === "text" && current.text) pushText(items, block, title, "Text", current.text)
    if ((current.type === "inlineMath" || current.type === "blockMath") && current.attrs?.latex) {
      pushText(items, block, title, current.type === "inlineMath" ? "Inline equation" : "Block equation", current.attrs.latex)
    }
    current.content?.forEach((child) => stack.push(child))
  }
}

function renderedVariantKey(block: BlockNode, activeVersionId: string, modelVersions: ModelVersion[]) {
  if (activeVersionId !== allVersionsId) {
    const state = resolveBlockVersionState(block.data, activeVersionId, modelVersions)
    if (state.isHidden) return undefined
    return state.renderedVariantKey || defaultVariantKey
  }
  const state = resolveBlockVersionState(block.data, activeVersionId, modelVersions)
  return state.renderedVariantKey || defaultVariantKey
}

export function extractSearchableContent(nodes: MapNode[], activeVersionId: string, modelVersions: ModelVersion[]): SearchableContent[] {
  const items: SearchableContent[] = []
  nodes.forEach((node) => {
    if (node.type !== "block") return
    try {
      const variantKey = renderedVariantKey(node, activeVersionId, modelVersions)
      if (!variantKey) return
      const title = resolveBlockTitle(node.data, variantKey)
      pushText(items, node, title, "Title", title)
      const contentJson = resolveBlockContentJson(node.data, variantKey)
      if (contentJson) visitContentJson(items, node, title, contentJson)
      else pushText(items, node, title, "Text", stripHtml(resolveBlockContentHtml(node.data, variantKey) || ""))
      resolveBlockSymbolEntries(node.data, variantKey).forEach((entry) => {
        pushText(items, node, title, "Symbol", entry.latex)
        pushText(items, node, title, "Symbol meaning", entry.meaning)
      })
    } catch {
      // Skip only the malformed block so one bad record cannot blank the app.
    }
  })
  return items
}

function resultRank(item: SearchableContent, query: ReturnType<typeof normalizeSearchQuery>) {
  const title = item.source === "Title"
  if (title && item.normalizedText === query.text) return 0
  if (title && item.normalizedText.startsWith(query.text)) return 1
  if (item.source === "Symbol" || item.source === "Symbol meaning" || item.source === "Inline equation" || item.source === "Block equation") return 2
  if (item.source === "Text") return 3
  return 4
}

function makeSnippet(text: string, queryText: string) {
  const compact = text.replace(/\s+/g, " ").trim()
  if (compact.length <= 120) return compact
  const index = normalizeText(compact).indexOf(queryText)
  const start = Math.max(0, index - 44)
  const end = Math.min(compact.length, start + 120)
  return `${start > 0 ? "..." : ""}${compact.slice(start, end)}${end < compact.length ? "..." : ""}`
}

function itemMatches(item: SearchableContent, query: ReturnType<typeof normalizeSearchQuery>) {
  if (!query.text) return false
  if (item.normalizedText.includes(query.text)) return true
  return Boolean(item.mathText && query.math && item.mathText.includes(query.math))
}

export function searchRenderedBlocks(nodes: MapNode[], activeVersionId: string, modelVersions: ModelVersion[], rawQuery: string): SearchResult[] {
  const query = normalizeSearchQuery(rawQuery)
  if (!query.text) return []
  return extractSearchableContent(nodes, activeVersionId, modelVersions)
    .filter((item) => itemMatches(item, query))
    .map((item) => ({
      ...item,
      rank: resultRank(item, query),
      snippet: makeSnippet(item.text, query.text),
    }))
    .sort((a, b) => a.rank - b.rank || a.blockTitle.localeCompare(b.blockTitle) || a.source.localeCompare(b.source))
}

function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function finiteDimension(value: unknown, fallback: number): number {
  return finiteNumber(value) && value > 0 ? value : fallback
}

function absoluteNodePosition(node: MapNode, nodes: MapNode[]) {
  let x = finiteNumber(node.position?.x) ? node.position.x : 0
  let y = finiteNumber(node.position?.y) ? node.position.y : 0
  let parentId = node.parentId
  const visited = new Set([node.id])

  while (parentId) {
    if (visited.has(parentId)) return undefined
    visited.add(parentId)
    const parent = nodes.find((item) => item.id === parentId)
    if (!parent) return undefined
    x += finiteNumber(parent.position?.x) ? parent.position.x : 0
    y += finiteNumber(parent.position?.y) ? parent.position.y : 0
    parentId = parent.parentId
  }

  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : undefined
}

export function getSearchResultNavigationTarget(
  result: Pick<SearchResult, "blockId"> | undefined,
  nodes: MapNode[],
  activeVersionId: string,
  modelVersions: ModelVersion[],
): SearchNavigationTarget | undefined {
  if (!result?.blockId) return undefined
  const node = nodes.find((item): item is BlockNode => item.id === result.blockId && item.type === "block")
  if (!node) return undefined
  if (activeVersionId !== allVersionsId && resolveBlockVersionState(node.data, activeVersionId, modelVersions).isHidden) return undefined
  const position = absoluteNodePosition(node, nodes)
  if (!position) return undefined
  const width = finiteDimension(node.data.width, 340)
  const height = finiteDimension(node.data.height, 220)
  return {
    blockId: node.id,
    center: { x: position.x + width / 2, y: position.y + height / 2 },
    width,
    height,
  }
}
