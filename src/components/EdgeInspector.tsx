import { Trash2 } from "lucide-react"
import { defaultBlockColors } from "../constants/palette"
import type { MapEdge } from "../types/map"
import { ColorPickerRow } from "./ColorPickerRow"

type EdgeInspectorProps = {
  edge: MapEdge
  onChange: (patch: Partial<NonNullable<MapEdge["data"]>>) => void
  onDelete: () => void
}

export function EdgeInspector({ edge, onChange, onDelete }: EdgeInspectorProps) {
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
      </section>
      <section className="panel-section">
        <div className="section-title">Appearance</div>
        <ColorPickerRow
          label="Line color"
          value={edge.data?.color || defaultBlockColors.edge}
          onChange={(color) => onChange({ ...edge.data, color })}
        />
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
