import { defaultVariantKey } from "../constants/versioning"
import { resolveBlockVersionState } from "./blockVersionState"
import { resolveBlockContentJson, resolveBlockTitle, slugifyTitle } from "./exportImport"
import { formatJsonTimestamp } from "./time"
import { contentJsonToMarkdown, extractBlockMath, plainTextFromContent } from "./tiptapToMarkdown"
import type { BlockNode, GroupNode, MapNode, ModelVersion, StoryDeckSettings, StoryExportDensity, StoryOutlineItem } from "../types/map"

type StoryMarkdownInput = {
  mapTitle: string
  modelVersions: ModelVersion[]
  activeVersionId: string
  nodes: MapNode[]
  storyOutline: StoryOutlineItem[]
  storyDeckSettings: StoryDeckSettings
}

const densityLabels: Record<StoryExportDensity, string> = {
  title_only: "Title only",
  summary: "Summary",
  full: "Full",
}

const versionModeLabels: Record<StoryDeckSettings["versionMode"], string> = {
  current: "Toolbar version",
  all: "Default content",
  selected: "Selected version",
}

function findNode(nodes: MapNode[], id: string) {
  return nodes.find((node) => node.id === id)
}

function isBlockNode(node: MapNode | undefined): node is BlockNode {
  return node?.type === "block"
}

function isGroupNode(node: MapNode | undefined): node is GroupNode {
  return node?.type === "group"
}

function effectiveVersionId(settings: StoryDeckSettings, activeVersionId: string, modelVersions: ModelVersion[]) {
  if (settings.versionMode === "all") return defaultVariantKey
  if (settings.versionMode === "selected" && settings.selectedVersionId && modelVersions.some((version) => version.id === settings.selectedVersionId)) return settings.selectedVersionId
  return modelVersions.some((version) => version.id === activeVersionId) ? activeVersionId : defaultVariantKey
}

function versionLabel(versionId: string, settings: StoryDeckSettings, modelVersions: ModelVersion[]) {
  if (settings.versionMode === "all" || versionId === defaultVariantKey) return "Default content"
  return modelVersions.find((version) => version.id === versionId)?.label || versionId
}

function truncateMarkdown(markdown: string, density: StoryExportDensity) {
  if (density === "full") return markdown
  if (density === "title_only") return ""
  const trimmed = markdown.trim()
  if (trimmed.length <= 900) return trimmed
  return `${trimmed.slice(0, 900).replace(/\s+\S*$/, "")}\n\n<!-- Content truncated for summary density. Switch this item to Full for complete source text. -->`
}

function sourceMetadataLines(source: MapNode, renderedVersion: string, sourceStatus?: string) {
  const title = source.type === "block" ? source.data.title : source.data.title
  return [`- Source: ${source.type} \`${source.id}\``, `- Source title: ${title}`, `- Version: ${renderedVersion}${sourceStatus ? ` (${sourceStatus})` : ""}`]
}

function renderBlockContent(block: BlockNode, versionId: string, modelVersions: ModelVersion[], density: StoryExportDensity) {
  const versionState = resolveBlockVersionState(block.data, versionId, modelVersions)
  const renderedVariantKey = versionState.renderedVariantKey || defaultVariantKey
  const contentJson = resolveBlockContentJson(block.data, renderedVariantKey)
  const title = resolveBlockTitle(block.data, renderedVariantKey)
  return {
    title,
    versionStatus:
      versionState.sourceKind === "own"
        ? "Own"
        : versionState.sourceKind === "inherited"
          ? `Inherits ${versionState.inheritedFromVersionShortLabel || versionState.inheritedFromVersionLabel || "earlier"}`
          : versionState.sourceKind === "base"
            ? "Base"
            : "Hidden",
    markdown: truncateMarkdown(contentJsonToMarkdown(contentJson), density),
    formulas: extractBlockMath(contentJson),
    plain: plainTextFromContent(contentJson),
  }
}

function renderGroupContent(group: GroupNode, nodes: MapNode[], versionId: string, modelVersions: ModelVersion[], density: StoryExportDensity) {
  const children = nodes.filter((node): node is BlockNode => node.type === "block" && node.parentId === group.id)
  const renderedChildren = children.map((child) => ({ block: child, content: renderBlockContent(child, versionId, modelVersions, density) }))
  const markdown = renderedChildren
    .map(({ content }) => {
      const body = content.markdown || content.plain || "_No body content._"
      return `### ${content.title}\n\n${body}`
    })
    .join("\n\n")
  return {
    markdown: truncateMarkdown(markdown, density),
    formulas: renderedChildren.flatMap(({ content }) => content.formulas),
    childCount: children.length,
  }
}

function titleForItem(item: StoryOutlineItem, source: MapNode, versionId: string, modelVersions: ModelVersion[]) {
  if (item.slideTitle.trim()) return item.slideTitle.trim()
  if (source.type === "group") return source.data.title
  return renderBlockContent(source, versionId, modelVersions, "title_only").title
}

function renderPrompt(deckTitle: string) {
  return [
    "## PPT Generation Prompt",
    "",
    "Turn this Markdown story deck into a low-density research presentation.",
    "Use one slide per `## Slide N` section, preserve equations as LaTeX, keep speaker notes separate from slide body, and avoid adding claims not present in the source outline.",
    `Deck title: ${deckTitle}`,
  ].join("\n")
}

export function createStoryMarkdownFilename(title: string, date = new Date()) {
  const slug = slugifyTitle(title) || "asteria-story"
  return `${slug}-asteria-story-${formatJsonTimestamp(date)}.md`
}

export function buildStoryMarkdown(input: StoryMarkdownInput) {
  const deckTitle = input.storyDeckSettings.title || input.mapTitle || "Asteria Story"
  const versionId = effectiveVersionId(input.storyDeckSettings, input.activeVersionId, input.modelVersions)
  const renderedVersionLabel = versionLabel(versionId, input.storyDeckSettings, input.modelVersions)
  const lines = [
    `# ${deckTitle}`,
    "",
    `Generated from Asteria story outline.`,
    `Version mode: ${versionModeLabels[input.storyDeckSettings.versionMode]}`,
    `Rendered version: ${renderedVersionLabel}`,
    "",
  ]

  let exportedSlide = 0
  input.storyOutline.forEach((item) => {
    const source = findNode(input.nodes, item.sourceId)
    if (!source) return
    exportedSlide += 1
    const density = item.density || input.storyDeckSettings.defaultDensity
    const slideTitle = titleForItem(item, source, versionId, input.modelVersions)
    lines.push(`## Slide ${exportedSlide} - ${slideTitle}`, "")
    lines.push(`Density: ${densityLabels[density]}`, "")

    if (isBlockNode(source)) {
      const content = renderBlockContent(source, versionId, input.modelVersions, density)
      if (input.storyDeckSettings.includeSourceMetadata) {
        lines.push("### Source Metadata", ...sourceMetadataLines(source, renderedVersionLabel, content.versionStatus), "")
      }
      lines.push("### Main Message")
      lines.push(content.markdown || content.plain || "_Title-only outline item. Expand from the source block title._", "")
      if (content.formulas.length) {
        lines.push("### Key Formulas", ...content.formulas.map((latex) => `$$\n${latex}\n$$`), "")
      }
    } else if (isGroupNode(source)) {
      const content = renderGroupContent(source, input.nodes, versionId, input.modelVersions, density)
      if (input.storyDeckSettings.includeSourceMetadata) {
        lines.push("### Source Metadata", ...sourceMetadataLines(source, renderedVersionLabel), `- Child blocks: ${content.childCount}`, "")
      }
      lines.push("### Main Message")
      lines.push(content.markdown || "_Group has no child block content._", "")
      if (content.formulas.length) {
        lines.push("### Key Formulas", ...content.formulas.map((latex) => `$$\n${latex}\n$$`), "")
      }
    }

    if (input.storyDeckSettings.includeSpeakerNotes && item.speakerNotes?.trim()) {
      lines.push("### Speaker Notes", item.speakerNotes.trim(), "")
    }
  })

  if (exportedSlide === 0) {
    lines.push("## No Exportable Slides", "", "Every story outline item is missing its source block/group or the outline is empty.", "")
  }
  if (input.storyDeckSettings.includePrompt) lines.push(renderPrompt(deckTitle), "")
  return lines.join("\n").replace(/\n{4,}/g, "\n\n\n").trimEnd() + "\n"
}

export function exportMarkdownFile(markdown: string, filename: string) {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
