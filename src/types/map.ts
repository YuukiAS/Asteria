import type { Edge, Node, Viewport } from "@xyflow/react"
import type { JSONContent } from "@tiptap/react"

export type BlockNodeType = "generic"

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
  createdAt: string
  updatedAt: string
}

export type MapEdgeData = {
  label?: string
  color?: string
  createdAt: string
  updatedAt: string
}

export type MapViewport = Pick<Viewport, "x" | "y" | "zoom">

export type BlockNode = Node<BlockData, "block">
export type MapEdge = Edge<MapEdgeData>

export type ExportedMap = {
  version: 1
  nodes: BlockNode[]
  edges: MapEdge[]
  viewport?: MapViewport
  updatedAt: string
}

export type SaveStatus = "Saved" | "Unsaved" | "Saving" | "Error"
