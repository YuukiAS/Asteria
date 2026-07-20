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

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim()
}

function normalizeMathForSearch(value: string) {
  return normalizeLatexText(value).replace(/\s+/g, "").toLowerCase()
}

export function normalizeSearchQuery(query: string) {
  const text = normalizeText(query)
  return {
    raw: query,
    text,
    math: normalizeMathForSearch(query),
  }
}

function pushText(items: SearchableContent[], block: BlockNode, title: string, source: SearchSource, text: string) {
  const normalized = normalizeText(text)
  if (!normalized) return
  const type = blockTypeByValue[block.data.nodeType] || blockTypeByValue.generic
  items.push({
    blockId: block.id,
    blockTitle: title,
    blockType: type.label,
    source,
    text,
    normalizedText: normalized,
    mathText: source === "Inline equation" || source === "Block equation" || source === "Symbol" ? normalizeMathForSearch(text) : undefined,
  })
}

function visitContentJson(items: SearchableContent[], block: BlockNode, title: string, node?: JSONContent) {
  if (!node) return
  if (node.type === "text" && node.text) pushText(items, block, title, "Text", node.text)
  if ((node.type === "inlineMath" || node.type === "blockMath") && node.attrs?.latex) {
    pushText(items, block, title, node.type === "inlineMath" ? "Inline equation" : "Block equation", String(node.attrs.latex))
  }
  node.content?.forEach((child) => visitContentJson(items, block, title, child))
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

