import { NodeResizer, type NodeProps } from "@xyflow/react"
import type { CSSProperties } from "react"
import type { GroupNode as GroupNodeType } from "../types/map"
import { useMapStore } from "../store/useMapStore"

type GroupNodeProps = NodeProps<GroupNodeType> & {
  interactionMode: "move" | "edit"
}

export function GroupNode({ id, data, selected, interactionMode }: GroupNodeProps) {
  const updateGroup = useMapStore((state) => state.updateGroup)
  const style = {
    backgroundColor: data.backgroundColor,
    borderColor: selected ? "#2563eb" : data.borderColor,
  } as CSSProperties

  return (
    <div className={`asteria-group-node ${selected ? "asteria-group-node-selected" : ""}`} style={style}>
      <NodeResizer
        isVisible={selected && interactionMode === "edit"}
        minWidth={260}
        minHeight={180}
        handleClassName="asteria-resize-handle"
        lineClassName="asteria-resize-line"
      />
      <input
        className="group-title-input nodrag nopan"
        value={data.title}
        onChange={(event) => updateGroup(id, { title: event.target.value })}
        aria-label="Group title"
      />
    </div>
  )
}
