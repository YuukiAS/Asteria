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
  | "dataset"
  | "result"
  | "citation"
  | "warning"
  | "todo"

export type BlockStatus = "undo" | "doing" | "done"

export type EdgeLineStyle = "solid" | "dashed" | "dotted"
export type EdgePathType = "smoothstep" | "bezier" | "straight" | "step"
export type EdgeArrow = "none" | "forward" | "backward" | "both"

export type BlockData = {
  title: string
  contentJson: JSONContent
  contentHtml?: string
  backgroundColor: string
  textColor: string
  borderColor: string
  width: number
  height: number
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
  createdAt: string
  updatedAt: string
}

export type MapViewport = Pick<Viewport, "x" | "y" | "zoom">

export type BlockNode = Node<BlockData, "block">
export type GroupNode = Node<GroupData, "group">
export type MapNode = BlockNode | GroupNode
export type MapEdge = Edge<MapEdgeData>

export type ExportedMap = {
  version: 1
  title?: string
  nodes: MapNode[]
  edges: MapEdge[]
  viewport?: MapViewport
  updatedAt: string
}

export type SaveStatus = "Saved" | "Unsaved" | "Saving" | "Error"
