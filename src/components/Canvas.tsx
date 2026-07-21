import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type Edge,
  type NodeMouseHandler,
  type NodeProps,
  type OnSelectionChangeParams,
} from "@xyflow/react"
import { createContext, useContext, useEffect, useMemo, useState, type CSSProperties } from "react"
import { BlockNode } from "./BlockNode"
import { GroupNode } from "./GroupNode"
import { allVersionsId, defaultVariantKey } from "../constants/versioning"
import { resolveBlockVersionState } from "../lib/blockVersionState"
import { applyEdgePresentation, resolveBlockContentHtml, resolveBlockTitle } from "../lib/exportImport"
import { requestInlineBlockEdit, type InlineEditTarget } from "../lib/inlineEditEvents"
import { titleToHtml } from "../lib/titleMath"
import { useMapStore } from "../store/useMapStore"
import type { InteractionMode } from "../types/interaction"
import type { BlockNode as BlockNodeType, GroupNode as GroupNodeType, MapEdge, MapNode, ModelVersion } from "../types/map"

type CanvasProps = {
  onFitViewReady: (fitView: () => void) => void
  interactionMode: InteractionMode
  onInteractionModeChange: (mode: InteractionMode) => void
  inlineEditTarget?: InlineEditTarget
  onInlineEditTargetChange: (target?: InlineEditTarget) => void
}

const InteractionModeContext = createContext<{
  interactionMode: InteractionMode
  inlineEditTarget?: InlineEditTarget
  selectedNodeIds: string[]
  onInlineEditTargetChange: (target?: InlineEditTarget) => void
}>({
  interactionMode: "move",
  selectedNodeIds: [],
  onInlineEditTargetChange: () => undefined,
})

function BlockNodeRenderer(props: NodeProps<BlockNodeType>) {
  const { interactionMode, inlineEditTarget, selectedNodeIds, onInlineEditTargetChange } = useContext(InteractionModeContext)
  return (
    <BlockNode
      {...props}
      selected={selectedNodeIds.includes(props.id)}
      interactionMode={interactionMode}
      inlineEditTarget={inlineEditTarget}
      onInlineEditTargetChange={onInlineEditTargetChange}
    />
  )
}

function GroupNodeRenderer(props: NodeProps<GroupNodeType>) {
  const { interactionMode, selectedNodeIds } = useContext(InteractionModeContext)
  return <GroupNode {...props} selected={selectedNodeIds.includes(props.id)} interactionMode={interactionMode} />
}

const nodeTypes = {
  block: BlockNodeRenderer,
  group: GroupNodeRenderer,
}

function ZoomBlockOverlay({
  node,
  activeVersionId,
  modelVersions,
  onBackgroundClick,
  onBlockClick,
}: {
  node: BlockNodeType
  activeVersionId: string
  modelVersions: ModelVersion[]
  onBackgroundClick: () => void
  onBlockClick: () => void
}) {
  const versionState = resolveBlockVersionState(node.data, activeVersionId, modelVersions)
  const effectiveVariantKey = versionState.renderedVariantKey || defaultVariantKey
  const title = resolveBlockTitle(node.data, effectiveVariantKey)
  const contentHtml = resolveBlockContentHtml(node.data, effectiveVariantKey) || ""
  const titleHtml = useMemo(() => titleToHtml(title), [title])
  const borderColor = node.data.borderColor || "rgb(var(--color-strong-border))"

  return (
    <div className="zoom-block-backdrop" onClick={onBackgroundClick} role="presentation">
      <article
        className="zoom-block-card"
        style={
          {
            "--asteria-block-background": node.data.backgroundColor,
            "--asteria-block-border-color": borderColor,
            "--asteria-rich-accent-color": node.data.textColor,
            color: node.data.textColor,
          } as CSSProperties
        }
        onClick={(event) => {
          event.stopPropagation()
          onBlockClick()
        }}
      >
        <header className="zoom-block-header">
          <div className="zoom-block-title" dangerouslySetInnerHTML={{ __html: titleHtml }} />
          <span className="zoom-block-version" title={versionState.tooltip}>
            {versionState.isFixed ? versionState.requestedShortLabel || versionState.requestedLabel : versionState.modeLabel}
          </span>
        </header>
        <div className="zoom-block-body rich-preview" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </article>
    </div>
  )
}

export function Canvas({ onFitViewReady, interactionMode, onInteractionModeChange, inlineEditTarget, onInlineEditTargetChange }: CanvasProps) {
  const reactFlow = useReactFlow<MapNode, MapEdge>()
  const [zoomedNodeId, setZoomedNodeId] = useState<string>()
  const {
    nodes,
    edges,
    activeVersionId,
    modelVersions,
    viewport,
    onNodesChange,
    onEdgesChange,
    beginNodeDragHistory,
    commitNodeDragHistory,
    addEdge,
    setSelectedNode,
    selectedNodeIds,
    setSelectedNodes,
    setSelectedEdge,
    setViewport,
  } = useMapStore()

  useEffect(() => {
    onFitViewReady(() => reactFlow.fitView({ padding: 0.18, duration: 240 }))
  }, [onFitViewReady, reactFlow])

  useEffect(() => {
    if (interactionMode !== "zoom") setZoomedNodeId(undefined)
  }, [interactionMode])

  const presentedNodes = useMemo(() => {
    const visibleNodes =
      activeVersionId === allVersionsId
        ? nodes
        : nodes.filter((node) => node.type !== "block" || !resolveBlockVersionState(node.data, activeVersionId, modelVersions).isHidden)
    return visibleNodes.map((node) => {
      const baseNode = node.selected === undefined ? node : { ...node, selected: undefined }
      if (baseNode.type === "group" && baseNode.data.locked) return { ...baseNode, draggable: false }
      return baseNode
    })
  }, [activeVersionId, modelVersions, nodes])

  const visibleNodeIds = useMemo(() => new Set(presentedNodes.map((node) => node.id)), [presentedNodes])
  const zoomedNode = useMemo(() => presentedNodes.find((node): node is BlockNodeType => node.id === zoomedNodeId && node.type === "block"), [presentedNodes, zoomedNodeId])

  const styledEdges = useMemo(
    () =>
      edges.filter((edge) => {
        if (!visibleNodeIds.has(edge.source) || !visibleNodeIds.has(edge.target)) return false
        return activeVersionId === allVersionsId || edge.data?.visibility === "all" || !edge.data?.visibility || edge.data.visibility.includes(activeVersionId)
      }).map((edge) => {
        const presented = applyEdgePresentation(edge)
        return {
          ...presented,
          label: presented.data?.label || undefined,
          labelBgStyle: { fill: "var(--edge-label-bg)", fillOpacity: 0.95 },
          labelStyle: { fill: "var(--edge-label-text)", fontSize: 11 },
        }
      }),
    [activeVersionId, edges, visibleNodeIds],
  )

  const onNodeDoubleClick: NodeMouseHandler<MapNode> = (event, node) => {
    setSelectedNode(node.id)
    if (interactionMode === "zoom") {
      if (node.type === "block") setZoomedNodeId(node.id)
      return
    }
    if (node.type !== "block") return
    const target = event.target as HTMLElement
    if (target.closest(".block-title-display, .block-title-input")) {
      requestInlineBlockEdit(node.id, "title")
      return
    }
    requestInlineBlockEdit(node.id, "content")
  }

  const onSelectionChange = ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
    const selectedNodeIds = selectedNodes.map((node) => node.id)
    const selectedEdge = selectedEdges[0] as Edge | undefined
    if (selectedNodeIds.length) setSelectedNodes(selectedNodeIds)
    else if (selectedEdge) setSelectedEdge(selectedEdge.id)
  }

  return (
    <main className="asteria-canvas-shell min-h-0 min-w-0 flex-1">
      <div className="asteria-celestial-background" aria-hidden="true" />
      <div className="asteria-canvas-readability-overlay" aria-hidden="true" />
      <InteractionModeContext.Provider value={{ interactionMode, inlineEditTarget, selectedNodeIds, onInlineEditTargetChange }}>
        <ReactFlow
          nodes={presentedNodes}
          edges={styledEdges}
          nodeTypes={nodeTypes}
          fitView
          defaultViewport={viewport}
          minZoom={0.15}
          maxZoom={2.2}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStart={beginNodeDragHistory}
          onNodeDragStop={commitNodeDragHistory}
          onConnect={addEdge}
          connectionMode={ConnectionMode.Loose}
          onNodeClick={(event, node) => {
            const target = event.target as HTMLElement
            const wasEditingThisNode = inlineEditTarget?.nodeId === node.id
            const wasSelected = selectedNodeIds.includes(node.id) || Boolean(node.selected)
            setSelectedNode(node.id)
            if (interactionMode === "zoom") {
              onInlineEditTargetChange(undefined)
              if (node.type === "block") setZoomedNodeId(node.id)
              return
            }
            if (interactionMode !== "edit") {
              onInlineEditTargetChange(undefined)
              return
            }
            if (target.closest(".ProseMirror")) return
            if (target.closest(".asteria-block-preview") && (wasEditingThisNode || wasSelected)) {
              onInlineEditTargetChange({ nodeId: node.id, field: "content" })
              return
            }
            if (!wasEditingThisNode) onInlineEditTargetChange(undefined)
          }}
          onEdgeClick={(_, edge) => {
            onInlineEditTargetChange(undefined)
            setSelectedEdge(edge.id)
          }}
          onNodeDoubleClick={onNodeDoubleClick}
          onPaneClick={() => {
            onInlineEditTargetChange(undefined)
            setZoomedNodeId(undefined)
            setSelectedNodes([])
            setSelectedEdge(undefined)
            if (interactionMode === "edit" || interactionMode === "zoom") onInteractionModeChange("move")
          }}
          onSelectionChange={onSelectionChange}
          onMoveEnd={(_, nextViewport) => setViewport(nextViewport)}
          nodesDraggable={interactionMode === "move"}
          panOnDrag={interactionMode === "move"}
          selectionOnDrag={interactionMode === "move"}
          selectionKeyCode="Shift"
          multiSelectionKeyCode="Shift"
          nodesConnectable={interactionMode !== "zoom"}
          elementsSelectable
          className={`asteria-flow-${interactionMode} asteria-flow-canvas`}
          deleteKeyCode={null}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="var(--canvas-grid)" />
          <Controls position="bottom-left" />
          <MiniMap
            position="bottom-right"
            pannable
            zoomable
            nodeStrokeColor="#2563eb"
            nodeColor="var(--minimap-node)"
            maskColor="var(--minimap-mask)"
          />
        </ReactFlow>
        {zoomedNode ? (
          <ZoomBlockOverlay
            node={zoomedNode}
            activeVersionId={activeVersionId}
            modelVersions={modelVersions}
            onBackgroundClick={() => {
              setZoomedNodeId(undefined)
              onInteractionModeChange("move")
            }}
            onBlockClick={() => setZoomedNodeId(undefined)}
          />
        ) : null}
      </InteractionModeContext.Provider>
    </main>
  )
}
