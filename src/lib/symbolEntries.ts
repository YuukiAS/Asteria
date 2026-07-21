import katex from "katex"
import type { SymbolEntry } from "../types/map"

const greekOrder = [
  "alpha",
  "beta",
  "gamma",
  "delta",
  "epsilon",
  "zeta",
  "eta",
  "theta",
  "iota",
  "kappa",
  "lambda",
  "mu",
  "nu",
  "xi",
  "omicron",
  "pi",
  "rho",
  "sigma",
  "tau",
  "upsilon",
  "phi",
  "chi",
  "psi",
  "omega",
]

const greekIndex = new Map(greekOrder.map((name, index) => [name, index]))

export function normalizeLatexText(value: string) {
  let next = value.trim()
  if (next.startsWith("$$") && next.endsWith("$$") && next.length >= 4) next = next.slice(2, -2).trim()
  else if (next.startsWith("$") && next.endsWith("$") && next.length >= 2) next = next.slice(1, -1).trim()
  next = next.replace(/^\\{2,}/, "\\")
  return next.replace(/\s+/g, " ")
}

function stripLeadingWrappers(value: string) {
  return value
    .replace(/^\\(?:left|right)\s*/i, "")
    .replace(/^\\(?:mathrm|mathbf|mathit|mathsf|mathcal)\s*\{([^{}]+)\}/i, "$1")
}

function leadingSymbol(value: string) {
  const normalized = stripLeadingWrappers(normalizeLatexText(value))
  const command = normalized.match(/^\\([A-Za-z]+)(?=[^A-Za-z]|$)/)
  if (command) return { base: command[1], normalized }
  const latin = normalized.match(/^[A-Za-z]/)
  if (latin) return { base: latin[0], normalized }
  const fallback = normalized.match(/^[^\s_^{]+/)
  return { base: fallback?.[0] || normalized, normalized }
}

export function symbolSortKey(latex: string): [number, number, string, string] {
  const { base, normalized } = leadingSymbol(latex)
  const baseLower = base.toLowerCase()
  const greek = greekIndex.get(baseLower)
  if (greek !== undefined) return [0, greek, baseLower, normalized]
  if (/^[a-z]$/i.test(base)) return [1, baseLower.charCodeAt(0), baseLower, normalized]
  return [2, 0, baseLower, normalized]
}

export function compareSymbolEntries(a: Pick<SymbolEntry, "latex">, b: Pick<SymbolEntry, "latex">) {
  const left = symbolSortKey(a.latex)
  const right = symbolSortKey(b.latex)
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] < right[index]) return -1
    if (left[index] > right[index]) return 1
  }
  return normalizeLatexText(a.latex).localeCompare(normalizeLatexText(b.latex))
}

export function sortedSymbolEntries(entries: readonly SymbolEntry[] = []) {
  return entries.filter((entry) => entry.latex.trim()).slice().sort(compareSymbolEntries)
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function renderInlineLatexHtml(latex: string) {
  const normalized = normalizeLatexText(latex)
  if (!normalized) return ""
  try {
    return katex.renderToString(normalized, { displayMode: false, throwOnError: false, strict: false })
  } catch {
    return `<code>${escapeHtml(normalized)}</code>`
  }
}

export function renderSymbolLatexHtml(latex: string) {
  return renderInlineLatexHtml(latex)
}

export function renderSymbolMeaningHtml(meaning: string) {
  const inlineMathPattern = /\$(?!\$)([^$]+?)\$/g
  let html = ""
  let lastIndex = 0
  for (const match of meaning.matchAll(inlineMathPattern)) {
    html += escapeHtml(meaning.slice(lastIndex, match.index))
    html += renderInlineLatexHtml(match[1])
    lastIndex = match.index + match[0].length
  }
  html += escapeHtml(meaning.slice(lastIndex))
  return html
}
