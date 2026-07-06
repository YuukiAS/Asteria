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
import { useMapStore } from "../store/useMapStore"
import type { BlockNode as BlockNodeType, GroupNode as GroupNodeType, MapEdge, MapNode } from "../types/map"

type CanvasProps = {
  onFitViewReady: (fitView: () => void) => void
  interactionMode: "move" | "edit"
}

const InteractionModeContext = createContext<"move" | "edit">("move")

function BlockNodeRenderer(props: NodeProps<BlockNodeType>) {
  const interactionMode = useContext(InteractionModeContext)
  return <BlockNode {...props} interactionMode={interactionMode} />
}

function GroupNodeRenderer(props: NodeProps<GroupNodeType>) {
  const interactionMode = useContext(InteractionModeContext)
  return <GroupNode {...props} interactionMode={interactionMode} />
}

const nodeTypes = {
  block: BlockNodeRenderer,
  group: GroupNodeRenderer,
}

export function Canvas({ onFitViewReady, interactionMode }: CanvasProps) {
  const reactFlow = useReactFlow<MapNode, MapEdge>()
  const {
    nodes,
    edges,
    activeVersionId,
    viewport,
    onNodesChange,
    onEdgesChange,
    addEdge,
    addBlock,
    setSelectedNode,
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
    window.setTimeout(
      () => window.dispatchEvent(new CustomEvent("asteria-focus-editor", { detail: { nodeId: node.id } })),
      0,
    )
  }

  const onSelectionChange = ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
    const selectedNodeIds = selectedNodes.map((node) => node.id)
    const selectedEdge = selectedEdges[0] as Edge | undefined
    if (selectedNodeIds.length) setSelectedNodes(selectedNodeIds)
    else if (selectedEdge) setSelectedEdge(selectedEdge.id)
    else {
      setSelectedNodes([])
      setSelectedEdge(undefined)
    }
  }

  const onCanvasDoubleClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement
    if (!target.closest(".react-flow__pane")) return
    addBlock(reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY }))
  }

  return (
    <main className="min-h-0 min-w-0 flex-1 bg-canvas" onDoubleClick={onCanvasDoubleClick}>
      <InteractionModeContext.Provider value={interactionMode}>
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
            setSelectedNode(node.id)
            const target = event.target as HTMLElement
            if (interactionMode === "edit" && target.closest(".asteria-block-preview") && !target.closest(".ProseMirror")) {
              window.setTimeout(
                () => window.dispatchEvent(new CustomEvent("asteria-focus-editor", { detail: { nodeId: node.id } })),
                0,
              )
            }
          }}
          onEdgeClick={(_, edge) => setSelectedEdge(edge.id)}
          onNodeDoubleClick={onNodeDoubleClick}
          onSelectionChange={onSelectionChange}
          onMoveEnd={(_, nextViewport) => setViewport(nextViewport)}
          nodesDraggable={interactionMode === "move"}
          panOnDrag={interactionMode === "move"}
          selectionOnDrag={interactionMode === "move"}
          selectionKeyCode="Shift"
          multiSelectionKeyCode="Shift"
          nodesConnectable
          elementsSelectable
          className={interactionMode === "edit" ? "asteria-flow-edit" : "asteria-flow-move"}
          deleteKeyCode={null}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="var(--canvas-grid)" />
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
