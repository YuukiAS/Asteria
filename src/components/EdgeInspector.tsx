import { Clipboard, Copy, Trash2 } from "lucide-react"
import { edgeArrowOptions, edgeLineStyleOptions, edgePathTypeOptions, edgeStrokeWidthOptions } from "../constants/blockTypes"
import { defaultBlockColors, textPalette } from "../constants/palette"
import { useMapStore } from "../store/useMapStore"
import type { MapEdge } from "../types/map"
import { ColorPickerRow } from "./ColorPickerRow"

type EdgeInspectorProps = {
  edge: MapEdge
  onChange: (patch: Partial<NonNullable<MapEdge["data"]>>) => void
  onDelete: () => void
}

export function EdgeInspector({ edge, onChange, onDelete }: EdgeInspectorProps) {
  const { copyEdgeStyle, pasteEdgeStyle, edgeStyleClipboard } = useMapStore()
  const copyLabel = async () => {
    const label = edge.data?.label || ""
    if (!label) return
    try {
      await navigator.clipboard?.writeText(label)
    } catch (error) {
      console.warn("Failed to copy edge label", error)
    }
  }

  return (
    <div className="grid gap-5">
      <section className="panel-section">
        <div className="section-title">Object</div>
        <label className="field-label">
          Edge label
          <input
            className="field-input"
            value={edge.data?.label || ""}
            placeholder="Optional relationship label"
            onChange={(event) => onChange({ ...edge.data, label: event.target.value })}
          />
        </label>
        <button type="button" className="toolbar-button w-fit" onClick={() => void copyLabel()} disabled={!edge.data?.label}>
          <Copy size={14} />
          Copy label
        </button>
      </section>
      <section className="panel-section">
        <div className="section-title">Appearance</div>
        <ColorPickerRow
          label="Line color"
          value={edge.data?.color || defaultBlockColors.edge}
          palette={textPalette}
          onChange={(color) => onChange({ ...edge.data, color })}
        />
        <div className="grid grid-cols-2 gap-3">
          <label className="field-label">
            Line style
            <select
              className="field-input"
              value={edge.data?.lineStyle || "solid"}
              onChange={(event) => onChange({ ...edge.data, lineStyle: event.target.value as NonNullable<MapEdge["data"]>["lineStyle"] })}
            >
              {edgeLineStyleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Path
            <select
              className="field-input"
              value={edge.data?.pathType || "smoothstep"}
              onChange={(event) => onChange({ ...edge.data, pathType: event.target.value as NonNullable<MapEdge["data"]>["pathType"] })}
            >
              {edgePathTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Arrow
            <select
              className="field-input"
              value={edge.data?.arrow || "forward"}
              onChange={(event) => onChange({ ...edge.data, arrow: event.target.value as NonNullable<MapEdge["data"]>["arrow"] })}
            >
              {edgeArrowOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Width
            <select
              className="field-input"
              value={edge.data?.strokeWidth || 1.5}
              onChange={(event) => onChange({ ...edge.data, strokeWidth: Number(event.target.value) })}
            >
              {edgeStrokeWidthOptions.map((option) => (
                <option key={option} value={option}>
                  {option}px
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="toolbar-button justify-center" onClick={() => copyEdgeStyle(edge.id)}>
            <Copy size={14} />
            Copy style
          </button>
          <button
            type="button"
            className="toolbar-button justify-center disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!edgeStyleClipboard}
            onClick={() => pasteEdgeStyle(edge.id)}
          >
            <Clipboard size={14} />
            Paste style
          </button>
        </div>
      </section>
      <section className="panel-section">
        <div className="section-title">Connection</div>
        <div className="grid gap-1 text-xs text-secondary">
          <div>Source: {edge.source}</div>
          <div>Target: {edge.target}</div>
        </div>
        <button type="button" className="danger-button mt-3" onClick={onDelete}>
          <Trash2 size={14} />
          Delete edge
        </button>
      </section>
    </div>
  )
}
