import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type Edge,
  type NodeMouseHandler,
  type NodeProps,
  type OnSelectionChangeParams,
} from "@xyflow/react"
import { createContext, useContext, useEffect, useMemo, type MouseEvent } from "react"
import { BlockNode } from "./BlockNode"
import { GroupNode } from "./GroupNode"
import { applyEdgePresentation } from "../lib/exportImport"
import { requestInlineBlockEdit, type InlineEditTarget } from "../lib/inlineEditEvents"
import { useMapStore } from "../store/useMapStore"
import type { BlockNode as BlockNodeType, GroupNode as GroupNodeType, MapEdge, MapNode } from "../types/map"

type CanvasProps = {
  onFitViewReady: (fitView: () => void) => void
  interactionMode: "move" | "edit"
  onInteractionModeChange: (mode: "move" | "edit") => void
  inlineEditTarget?: InlineEditTarget
  onInlineEditTargetChange: (target?: InlineEditTarget) => void
}

const InteractionModeContext = createContext<{
  interactionMode: "move" | "edit"
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

export function Canvas({ onFitViewReady, interactionMode, onInteractionModeChange, inlineEditTarget, onInlineEditTargetChange }: CanvasProps) {
  const reactFlow = useReactFlow<MapNode, MapEdge>()
  const {
    nodes,
    edges,
    activeVersionId,
    viewport,
    onNodesChange,
    onEdgesChange,
    addEdge,
    addBlockAndSelect,
    setSelectedNode,
    selectedNodeIds,
    setSelectedNodes,
    setSelectedEdge,
    setViewport,
  } = useMapStore()

  useEffect(() => {
    onFitViewReady(() => reactFlow.fitView({ padding: 0.18, duration: 240 }))
  }, [onFitViewReady, reactFlow])

  const styledEdges = useMemo(
    () =>
      edges.filter((edge) => activeVersionId === "all" || edge.data?.visibility === "all" || !edge.data?.visibility || edge.data.visibility.includes(activeVersionId)).map((edge) => {
        const presented = applyEdgePresentation(edge)
        return {
          ...presented,
          label: presented.data?.label || undefined,
          labelBgStyle: { fill: "var(--edge-label-bg)", fillOpacity: 0.95 },
          labelStyle: { fill: "var(--edge-label-text)", fontSize: 11 },
        }
      }),
    [activeVersionId, edges],
  )

  const presentedNodes = useMemo(
    () =>
      nodes.map((node) =>
        node.type === "group" && node.data.locked ? { ...node, draggable: false } : node,
      ),
    [interactionMode, nodes],
  )

  const onNodeDoubleClick: NodeMouseHandler<MapNode> = (_event, node) => {
    setSelectedNode(node.id)
    if (node.type !== "block") return
    requestInlineBlockEdit(node.id, "content")
  }

  const onSelectionChange = ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
    const selectedNodeIds = selectedNodes.map((node) => node.id)
    const selectedEdge = selectedEdges[0] as Edge | undefined
    if (selectedNodeIds.length) setSelectedNodes(selectedNodeIds)
    else if (selectedEdge) setSelectedEdge(selectedEdge.id)
  }

  const onCanvasDoubleClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement
    if (!target.closest(".react-flow__pane")) return
    const nodeId = addBlockAndSelect(reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY }))
    requestInlineBlockEdit(nodeId, "title")
  }

  return (
    <main className="asteria-canvas-shell min-h-0 min-w-0 flex-1" onDoubleClick={onCanvasDoubleClick}>
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
          onConnect={addEdge}
          onNodeClick={(event, node) => {
            const target = event.target as HTMLElement
            const wasEditingThisNode = inlineEditTarget?.nodeId === node.id
            const wasSelected = selectedNodeIds.includes(node.id) || Boolean(node.selected)
            setSelectedNode(node.id)
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
            setSelectedNodes([])
            setSelectedEdge(undefined)
            if (interactionMode === "edit") onInteractionModeChange("move")
          }}
          onSelectionChange={onSelectionChange}
          onMoveEnd={(_, nextViewport) => setViewport(nextViewport)}
          nodesDraggable={interactionMode === "move"}
          panOnDrag={interactionMode === "move"}
          selectionOnDrag={interactionMode === "move"}
          selectionKeyCode="Shift"
          multiSelectionKeyCode="Shift"
          nodesConnectable
          elementsSelectable
          className={`${interactionMode === "edit" ? "asteria-flow-edit" : "asteria-flow-move"} asteria-flow-canvas`}
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
      </InteractionModeContext.Provider>
    </main>
  )
}
