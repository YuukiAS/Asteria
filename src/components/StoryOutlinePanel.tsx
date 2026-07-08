import { AlertTriangle, ChevronDown, Download, MoveDown, MoveUp, Plus, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { defaultVariantKey } from "../constants/versioning"
import { resolveBlockVersionState } from "../lib/blockVersionState"
import { buildStoryMarkdown, createStoryMarkdownFilename, exportMarkdownFile } from "../lib/storyMarkdownExport"
import { useMapStore } from "../store/useMapStore"
import type { BlockNode, GroupNode, MapNode, StoryExportDensity, StoryOutlineItem } from "../types/map"

const densityOptions: Array<{ value: StoryExportDensity; label: string }> = [
  { value: "title_only", label: "Title only" },
  { value: "summary", label: "Summary" },
  { value: "full", label: "Full" },
]

const versionModeOptions = [
  {
    value: "current",
    label: "Toolbar version",
    tooltip: "Export each Story source using the version currently selected in the top toolbar.",
  },
  {
    value: "all",
    label: "Default content",
    tooltip: "Export each Story source using its default/base block content.",
  },
  {
    value: "selected",
    label: "Selected version",
    tooltip: "Export each Story source using the fixed version selected in this Story panel.",
  },
] as const

function sourceTitle(source: MapNode | undefined) {
  if (!source) return "Missing source"
  return source.data.title || (source.type === "group" ? "Untitled group" : "Untitled block")
}

function sourceState(source: MapNode | undefined, versionId: string, modelVersions: ReturnType<typeof useMapStore.getState>["modelVersions"]) {
  if (!source) return "Missing"
  if (source.type === "group") return "Group"
  const state = resolveBlockVersionState(source.data, versionId, modelVersions)
  if (state.sourceKind === "own") return `Own ${state.renderedLabel}`
  if (state.sourceKind === "inherited") return `Inherits ${state.inheritedFromVersionShortLabel || state.inheritedFromVersionLabel || "earlier"}`
  if (state.sourceKind === "base") return "Base"
  return "Hidden"
}

function effectiveVersionId(settings: ReturnType<typeof useMapStore.getState>["storyDeckSettings"], activeVersionId: string, modelVersions: ReturnType<typeof useMapStore.getState>["modelVersions"]) {
  if (settings.versionMode === "all") return defaultVariantKey
  if (settings.versionMode === "selected" && settings.selectedVersionId && modelVersions.some((version) => version.id === settings.selectedVersionId)) return settings.selectedVersionId
  return modelVersions.some((version) => version.id === activeVersionId) ? activeVersionId : defaultVariantKey
}

function StoryRow({
  item,
  index,
  source,
  isExpanded,
  canMoveUp,
  canMoveDown,
  versionId,
  modelVersions,
  onToggle,
  onSelect,
  onMove,
  onRemove,
  onUpdate,
}: {
  item: StoryOutlineItem
  index: number
  source?: BlockNode | GroupNode
  isExpanded: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  versionId: string
  modelVersions: ReturnType<typeof useMapStore.getState>["modelVersions"]
  onToggle: () => void
  onSelect: () => void
  onMove: (direction: -1 | 1) => void
  onRemove: () => void
  onUpdate: (patch: Partial<Pick<StoryOutlineItem, "slideTitle" | "density" | "speakerNotes">>) => void
}) {
  const missing = !source
  return (
    <div className={`rounded-md border ${missing ? "border-danger/35 bg-danger/5" : "border-border bg-app/60"}`}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 p-2">
        <button type="button" className="min-w-0 text-left" onClick={missing ? onToggle : onSelect} title={missing ? "Source is missing" : "Select source on canvas"}>
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded border border-border bg-panel text-[11px] font-semibold text-secondary">{index + 1}</span>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-foreground">{item.slideTitle || sourceTitle(source)}</div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-secondary">
                <span className="rounded border border-border bg-panel px-1.5 py-0.5 uppercase">{item.sourceType}</span>
                <span className="rounded border border-border bg-panel px-1.5 py-0.5">{densityOptions.find((option) => option.value === item.density)?.label}</span>
                {missing ? (
                  <span className="inline-flex items-center gap-1 text-danger">
                    <AlertTriangle size={11} />
                    Missing
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </button>
        <div className="flex items-center gap-1">
          <button type="button" className="toolbar-button !px-2" disabled={!canMoveUp} onClick={() => onMove(-1)} aria-label="Move story item up">
            <MoveUp size={13} />
          </button>
          <button type="button" className="toolbar-button !px-2" disabled={!canMoveDown} onClick={() => onMove(1)} aria-label="Move story item down">
            <MoveDown size={13} />
          </button>
          <button type="button" className="toolbar-button !px-2" onClick={onToggle} aria-label="Edit story item">
            <ChevronDown size={13} className={isExpanded ? "rotate-180 transition-transform" : "transition-transform"} />
          </button>
          <button type="button" className="danger-button !px-2" onClick={onRemove} aria-label="Remove story item">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      {isExpanded ? (
        <div className="grid gap-2 border-t border-border p-2">
          <label className="field-label">
            Slide title
            <input className="field-input" value={item.slideTitle} onChange={(event) => onUpdate({ slideTitle: event.target.value })} />
          </label>
          <label className="field-label">
            Density
            <select className="field-input" value={item.density} onChange={(event) => onUpdate({ density: event.target.value as StoryExportDensity })}>
              {densityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Speaker notes
            <textarea className="field-input min-h-20 resize-y" value={item.speakerNotes || ""} onChange={(event) => onUpdate({ speakerNotes: event.target.value })} />
          </label>
          <div className="rounded-md border border-border bg-panel p-2 text-xs text-secondary">
            <div>Source: {sourceTitle(source)}</div>
            <div>State: {sourceState(source, versionId, modelVersions)}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function StoryOutlinePanel() {
  const [expandedId, setExpandedId] = useState<string>()
  const {
    mapTitle,
    modelVersions,
    activeVersionId,
    nodes,
    storyOutline,
    storyDeckSettings,
    addSelectedToStoryOutline,
    updateStoryOutlineItem,
    removeStoryOutlineItem,
    moveStoryOutlineItem,
    updateStoryDeckSettings,
    setSelectedNode,
  } = useMapStore()
  const versionId = useMemo(() => effectiveVersionId(storyDeckSettings, activeVersionId, modelVersions), [activeVersionId, modelVersions, storyDeckSettings])

  const exportMarkdown = () => {
    const markdown = buildStoryMarkdown({
      mapTitle,
      modelVersions,
      activeVersionId,
      nodes,
      storyOutline,
      storyDeckSettings,
    })
    exportMarkdownFile(markdown, createStoryMarkdownFilename(storyDeckSettings.title || mapTitle))
  }

  const addSelected = () => {
    const count = addSelectedToStoryOutline()
    if (!count) window.alert("Select one or more blocks/groups before adding to Story.")
  }

  return (
    <aside className="inspector">
      <div className="inspector-heading">
        <div>
          <h2>Story</h2>
          <p>{storyOutline.length} outline item{storyOutline.length === 1 ? "" : "s"}.</p>
        </div>
        <button type="button" className="primary-button" onClick={addSelected} title="Append selected blocks/groups in visual order">
          <Plus size={14} />
          Add selected
        </button>
      </div>
      <div className="grid gap-3 p-3">
        <div className="grid gap-2 rounded-md border border-border bg-panel p-3">
          <label className="field-label">
            Deck title
            <input className="field-input" value={storyDeckSettings.title} onChange={(event) => updateStoryDeckSettings({ title: event.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="field-label">
              Version mode
              <select
                className="field-input"
                value={storyDeckSettings.versionMode}
                title={versionModeOptions.find((option) => option.value === storyDeckSettings.versionMode)?.tooltip}
                onChange={(event) => updateStoryDeckSettings({ versionMode: event.target.value as typeof storyDeckSettings.versionMode })}
              >
                {versionModeOptions.map((option) => (
                  <option key={option.value} value={option.value} title={option.tooltip}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Version
              <select
                className="field-input"
                value={storyDeckSettings.selectedVersionId || modelVersions[0]?.id || ""}
                disabled={storyDeckSettings.versionMode !== "selected" || modelVersions.length === 0}
                title={
                  storyDeckSettings.versionMode === "selected"
                    ? "Choose the fixed model version used by Selected version mode."
                    : "Enabled only when Version mode is Selected version."
                }
                onChange={(event) => updateStoryDeckSettings({ selectedVersionId: event.target.value })}
              >
                {modelVersions.length === 0 ? <option value="">No versions</option> : null}
                {modelVersions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="field-label">
            Default density
            <select className="field-input" value={storyDeckSettings.defaultDensity} onChange={(event) => updateStoryDeckSettings({ defaultDensity: event.target.value as StoryExportDensity })}>
              {densityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-2 text-xs font-medium text-secondary">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-border text-accent" checked={storyDeckSettings.includeSpeakerNotes} onChange={(event) => updateStoryDeckSettings({ includeSpeakerNotes: event.target.checked })} />
              Include speaker notes
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-border text-accent" checked={storyDeckSettings.includeSourceMetadata} onChange={(event) => updateStoryDeckSettings({ includeSourceMetadata: event.target.checked })} />
              Include source metadata
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-border text-accent" checked={storyDeckSettings.includePrompt} onChange={(event) => updateStoryDeckSettings({ includePrompt: event.target.checked })} />
              Include PPT prompt
            </label>
          </div>
          <button type="button" className="toolbar-button justify-center" onClick={exportMarkdown}>
            <Download size={14} />
            Export Markdown
          </button>
        </div>
        <div className="grid gap-2">
          {storyOutline.length === 0 ? <div className="rounded-md border border-border bg-app/60 p-3 text-sm text-secondary">Select blocks or groups on the canvas, then add them to build a story deck.</div> : null}
          {storyOutline.map((item, index) => {
            const source = nodes.find((node): node is BlockNode | GroupNode => node.id === item.sourceId && (node.type === "block" || node.type === "group"))
            return (
              <StoryRow
                key={item.id}
                item={item}
                index={index}
                source={source}
                isExpanded={expandedId === item.id}
                canMoveUp={index > 0}
                canMoveDown={index < storyOutline.length - 1}
                versionId={versionId}
                modelVersions={modelVersions}
                onToggle={() => setExpandedId((current) => (current === item.id ? undefined : item.id))}
                onSelect={() => {
                  if (source) setSelectedNode(source.id)
                }}
                onMove={(direction) => moveStoryOutlineItem(item.id, direction)}
                onRemove={() => removeStoryOutlineItem(item.id)}
                onUpdate={(patch) => updateStoryOutlineItem(item.id, patch)}
              />
            )
          })}
        </div>
      </div>
    </aside>
  )
}
