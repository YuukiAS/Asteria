import { Clipboard, Copy, Trash2 } from "lucide-react"
import { edgeArrowOptions, edgeLineStyleOptions, edgePathTypeOptions, edgeStrokeWidthOptions } from "../constants/blockTypes"
import { defaultBlockColors, textPalette } from "../constants/palette"
import { useMapStore } from "../store/useMapStore"
import type { MapEdge } from "../types/map"
import { ColorPickerRow } from "./ColorPickerRow"
import { FieldSelect } from "./FieldSelect"
import { InspectorSectionStack } from "./InspectorSectionStack"

type EdgeInspectorProps = {
  edge: MapEdge
  onChange: (patch: Partial<NonNullable<MapEdge["data"]>>) => void
  onDelete: () => void
}

export function EdgeInspector({ edge, onChange, onDelete }: EdgeInspectorProps) {
  const { copyEdgeStyle, pasteEdgeStyle, edgeStyleClipboard, modelVersions } = useMapStore()
  const visibility = edge.data?.visibility || "all"
  const visibleIds = Array.isArray(visibility) ? visibility : []
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
    <InspectorSectionStack
      storageKey="asteria-inspector-edge-layout"
      sections={[
        {
          id: "object",
          title: "Object",
          children: (
            <>
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
            </>
          ),
        },
        {
          id: "appearance",
          title: "Appearance",
          children: (
            <>
              <ColorPickerRow
                label="Line color"
                value={edge.data?.color || defaultBlockColors.edge}
                palette={textPalette}
                onChange={(color) => onChange({ ...edge.data, color })}
              />
              <div className="grid grid-cols-2 gap-3">
                <label className="field-label">
                  Line style
                  <FieldSelect
                    value={edge.data?.lineStyle || "solid"}
                    options={edgeLineStyleOptions.map((option) => ({ value: option, label: option }))}
                    onChange={(value) => onChange({ ...edge.data, lineStyle: value as NonNullable<MapEdge["data"]>["lineStyle"] })}
                    ariaLabel="Line style"
                  />
                </label>
                <label className="field-label">
                  Path
                  <FieldSelect
                    value={edge.data?.pathType || "smoothstep"}
                    options={edgePathTypeOptions.map((option) => ({ value: option, label: option }))}
                    onChange={(value) => onChange({ ...edge.data, pathType: value as NonNullable<MapEdge["data"]>["pathType"] })}
                    ariaLabel="Edge path"
                  />
                </label>
                <label className="field-label">
                  Arrow
                  <FieldSelect
                    value={edge.data?.arrow || "forward"}
                    options={edgeArrowOptions.map((option) => ({ value: option, label: option }))}
                    onChange={(value) => onChange({ ...edge.data, arrow: value as NonNullable<MapEdge["data"]>["arrow"] })}
                    ariaLabel="Edge arrow"
                  />
                </label>
                <label className="field-label">
                  Width
                  <FieldSelect
                    value={String(edge.data?.strokeWidth || 1.5)}
                    options={edgeStrokeWidthOptions.map((option) => ({ value: String(option), label: `${option}px` }))}
                    onChange={(value) => onChange({ ...edge.data, strokeWidth: Number(value) })}
                    ariaLabel="Edge width"
                  />
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
            </>
          ),
        },
        {
          id: "connection",
          title: "Connection",
          children: (
            <>
              <label className="field-label">
                Version visibility
                <FieldSelect
                  value={visibility === "all" ? "all" : "custom"}
                  options={[
                    { value: "all", label: "Visible in all versions" },
                    { value: "custom", label: "Only selected versions" },
                  ]}
                  onChange={(value) => onChange({ ...edge.data, visibility: value === "all" ? "all" : [] })}
                  ariaLabel="Version visibility"
                />
              </label>
              {visibility !== "all" && (
                <div className="grid gap-2 rounded-lg border border-border bg-app/60 p-2">
                  {modelVersions.length === 0 && <div className="text-xs text-secondary">Add versions from the toolbar to scope this edge.</div>}
                  {modelVersions.map((version) => (
                    <label key={version.id} className="inline-flex items-center gap-2 text-xs font-medium text-secondary">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border text-accent"
                        checked={visibleIds.includes(version.id)}
                        onChange={(event) => {
                          const next = event.target.checked ? [...visibleIds, version.id] : visibleIds.filter((id) => id !== version.id)
                          onChange({ ...edge.data, visibility: next })
                        }}
                      />
                      {version.label}
                    </label>
                  ))}
                </div>
              )}
              <div className="grid gap-1 text-xs text-secondary">
                <div>Source: {edge.source}</div>
                <div>Target: {edge.target}</div>
              </div>
              <button type="button" className="danger-button mt-3" onClick={onDelete}>
                <Trash2 size={14} />
                Delete edge
              </button>
            </>
          ),
        },
      ]}
    />
  )
}
