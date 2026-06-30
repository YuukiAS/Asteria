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
import { applyEdgePresentation } from "../lib/exportImport"
import { useMapStore } from "../store/useMapStore"
import type { BlockNode as BlockNodeType, MapEdge } from "../types/map"

type CanvasProps = {
  onFitViewReady: (fitView: () => void) => void
  interactionMode: "move" | "edit"
}

const InteractionModeContext = createContext<"move" | "edit">("move")

function BlockNodeRenderer(props: NodeProps<BlockNodeType>) {
  const interactionMode = useContext(InteractionModeContext)
  return <BlockNode {...props} interactionMode={interactionMode} />
}

const nodeTypes = {
  block: BlockNodeRenderer,
}

export function Canvas({ onFitViewReady, interactionMode }: CanvasProps) {
  const reactFlow = useReactFlow<BlockNodeType, MapEdge>()
  const {
    nodes,
    edges,
    viewport,
    onNodesChange,
    onEdgesChange,
    addEdge,
    addBlock,
    setSelectedNode,
    setSelectedEdge,
    setViewport,
  } = useMapStore()

  useEffect(() => {
    onFitViewReady(() => reactFlow.fitView({ padding: 0.18, duration: 240 }))
  }, [onFitViewReady, reactFlow])

  const styledEdges = useMemo(
    () =>
      edges.map((edge) => {
        const presented = applyEdgePresentation(edge)
        return {
          ...presented,
          label: presented.data?.label || undefined,
          labelBgStyle: { fill: "var(--edge-label-bg)", fillOpacity: 0.95 },
          labelStyle: { fill: "var(--edge-label-text)", fontSize: 11 },
        }
      }),
    [edges],
  )

  const onNodeDoubleClick: NodeMouseHandler<BlockNodeType> = (_event, node) => {
    setSelectedNode(node.id)
    window.setTimeout(
      () => window.dispatchEvent(new CustomEvent("asteria-focus-editor", { detail: { nodeId: node.id } })),
      0,
    )
  }

  const onSelectionChange = ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
    const selectedNode = selectedNodes[0] as BlockNodeType | undefined
    const selectedEdge = selectedEdges[0] as Edge | undefined
    if (selectedNode) setSelectedNode(selectedNode.id)
    else if (selectedEdge) setSelectedEdge(selectedEdge.id)
    else {
      setSelectedNode(undefined)
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
          nodes={nodes}
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
            if (interactionMode === "edit" && target.closest(".asteria-block-preview")) {
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
