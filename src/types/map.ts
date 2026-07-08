import type { Edge, Node, Viewport } from "@xyflow/react"
import type { JSONContent } from "@tiptap/react"

export type BlockNodeType =
  | "generic"
  | "definition"
  | "notation"
  | "model"
  | "prior"
  | "assumption"
  | "theorem"
  | "algorithm"
  | "dataset"
  | "result"
  | "reference"
  | "remark"
  | "example"
  | "warning"
  | "todo"

export type BlockStatus = "undo" | "doing" | "done"
export type ActiveVersionId = "all" | string
export type BlockVariantKey = "default" | string
export type BlockDisplayMode = "full" | "compact" | "title_only"
export type DisplayModeOverride = "block" | BlockDisplayMode
export type EdgeVisibility = "all" | string[]

export type ModelVersion = {
  id: string
  label: string
  shortLabel?: string
  createdAt: string
  updatedAt: string
}

export type BlockVariant = {
  title: string
  contentJson: JSONContent
  contentHtml?: string
  updatedAt: string
}

export type VariantSourceKind = "own" | "inherited" | "base" | "hidden"

export type ResolvedVariantState = {
  availableVersionIds: string[]
  hasRequestedVariant: boolean
  inheritedFromVersion?: ModelVersion
  inheritedFromVersionId?: string
  inheritedFromVersionLabel?: string
  inheritedFromVersionShortLabel?: string
  isAuto: boolean
  isFallbackToBase: boolean
  isFallbackToDefault: boolean
  isHidden: boolean
  isFixed: boolean
  modeLabel: "AUTO" | "FIXED"
  renderedLabel: string
  renderedVariantKey?: BlockVariantKey
  renderedVersion?: ModelVersion
  requestedLabel: string
  requestedShortLabel?: string
  requestedVariantKey: BlockVariantKey
  requestedVersion?: ModelVersion
  sourceKind: VariantSourceKind
  tooltip: string
}

export type VersionVariantRow = {
  version: ModelVersion
  versionLabel: string
  versionShortLabel: string
  sourceKind: VariantSourceKind
  statusLabel: string
  renderedVariantKey?: BlockVariantKey
  inheritedFromVersion?: ModelVersion
  tooltip: string
}

export type EdgeLineStyle = "solid" | "dashed" | "dotted"
export type EdgePathType = "smoothstep" | "bezier" | "straight" | "step"
export type EdgeArrow = "none" | "forward" | "backward" | "both"

export type BlockData = {
  title: string
  contentJson: JSONContent
  contentHtml?: string
  variants?: Partial<Record<BlockVariantKey, BlockVariant>>
  activeVariantKey?: BlockVariantKey
  backgroundColor: string
  textColor: string
  borderColor: string
  width: number
  height: number
  displayMode?: BlockDisplayMode
  nodeType: BlockNodeType
  showStatus?: boolean
  status?: BlockStatus
  emojis?: string[]
  createdAt: string
  updatedAt: string
}

export type GroupData = {
  title: string
  backgroundColor: string
  borderColor: string
  opacity?: number
  locked?: boolean
  createdAt: string
  updatedAt: string
}

export type MapEdgeData = {
  label?: string
  color?: string
  lineStyle?: EdgeLineStyle
  pathType?: EdgePathType
  arrow?: EdgeArrow
  strokeWidth?: number
  visibility?: EdgeVisibility
  createdAt: string
  updatedAt: string
}

export type MapViewport = Pick<Viewport, "x" | "y" | "zoom">

export type BlockNode = Node<BlockData, "block">
export type GroupNode = Node<GroupData, "group">
export type MapNode = BlockNode | GroupNode
export type MapEdge = Edge<MapEdgeData>

export type StoryOutlineSourceType = "block" | "group"
export type StoryExportDensity = "title_only" | "summary" | "full"
export type StoryVersionMode = "current" | "all" | "selected"

export type StoryOutlineItem = {
  id: string
  sourceId: string
  sourceType: StoryOutlineSourceType
  slideTitle: string
  density: StoryExportDensity
  speakerNotes?: string
  createdAt: string
  updatedAt: string
}

export type StoryDeckSettings = {
  title: string
  versionMode: StoryVersionMode
  selectedVersionId?: string
  defaultDensity: StoryExportDensity
  includeSpeakerNotes: boolean
  includeSourceMetadata: boolean
  includePrompt: boolean
}

export type ExportedMap = {
  version: 1
  title?: string
  modelVersions?: ModelVersion[]
  activeVersionId?: ActiveVersionId
  displayModeOverride?: DisplayModeOverride
  storyOutline?: StoryOutlineItem[]
  storyDeckSettings?: StoryDeckSettings
  nodes: MapNode[]
  edges: MapEdge[]
  viewport?: MapViewport
  updatedAt: string
}

export type SaveStatus = "Saved" | "Unsaved" | "Saving" | "Error"
