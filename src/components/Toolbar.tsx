import { Download, Group, Moon, MousePointer2, PencilLine, Plus, Rows3, Save, Scan, Settings2, Sigma, Sparkles, Sun, Trash2, Upload } from "lucide-react"
import { useRef, useState } from "react"
import { displayModeOptions, maxModelVersions } from "../constants/versioning"
import { createExportFilename, exportMapFile, normalizeExportedMap, normalizeMapTitle, readJsonFile } from "../lib/exportImport"
import { useMapStore } from "../store/useMapStore"
import type { DisplayModeOverride } from "../types/map"
import { EquationDialog } from "./EquationDialog"

type ToolbarProps = {
  theme: "light" | "dark"
  interactionMode: "move" | "edit"
  onToggleTheme: () => void
  onInteractionModeChange: (mode: "move" | "edit") => void
  onFitView: () => void
}

export function Toolbar({ theme, interactionMode, onToggleTheme, onInteractionModeChange, onFitView }: ToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEquationDialogOpen, setIsEquationDialogOpen] = useState(false)
  const [isVersionPanelOpen, setIsVersionPanelOpen] = useState(false)
  const {
    mapTitle,
    modelVersions,
    activeVersionId,
    displayModeOverride,
    nodes,
    edges,
    viewport,
    selectedNodeId,
    selectedNodeIds,
    saveStatus,
    addBlock,
    groupSelectedBlocks,
    updateMapTitle,
    setActiveVersion,
    addModelVersion,
    updateModelVersion,
    deleteModelVersion,
    moveModelVersion,
    setDisplayModeOverride,
    appendBlockMathToSelectedBlock,
    straightenNearAxisEdges,
    saveNow,
    clearMap,
    loadMap,
  } = useMapStore()
  const selectedBlock = nodes.find((node) => node.id === selectedNodeId && node.type === "block")

  const exportJson = () => {
    exportMapFile(
      {
        version: 1,
        title: normalizeMapTitle(mapTitle),
        modelVersions,
        activeVersionId,
        displayModeOverride,
        nodes,
        edges,
        viewport,
        updatedAt: new Date().toISOString(),
      },
      createExportFilename(mapTitle),
    )
  }

  const startTitleEditing = () => {
    setIsEditingTitle(true)
    window.setTimeout(() => {
      titleInputRef.current?.focus()
      titleInputRef.current?.select()
    }, 0)
  }

  const finishTitleEditing = () => {
    updateMapTitle(normalizeMapTitle(mapTitle))
    setIsEditingTitle(false)
  }

  const insertEquation = (latex: string) => {
    setIsEquationDialogOpen(false)
    appendBlockMathToSelectedBlock(latex)
    if (selectedNodeId) {
      window.setTimeout(() => window.dispatchEvent(new CustomEvent("asteria-focus-editor", { detail: { nodeId: selectedNodeId } })), 0)
    }
  }

  const importJson = async (file?: File) => {
    if (!file) return
    if (!window.confirm("Importing JSON will replace the current canvas. Continue?")) return
    try {
      const raw = await readJsonFile(file)
      loadMap(normalizeExportedMap(raw))
    } catch (error) {
      console.error("Failed to import JSON", error)
      window.alert("Import failed. Check the JSON format.")
    } finally {
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const clear = () => {
    if (window.confirm("Clear the current canvas? This keeps the app installed but removes current local map data.")) {
      clearMap()
    }
  }

  return (
    <header className="relative z-30 flex h-[52px] shrink-0 select-none items-center gap-2 border-b border-border bg-toolbar/90 px-3 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex items-center gap-2">
          <img src="/app-icon.png" alt="Asteria icon" className="h-8 w-8 rounded-lg object-cover" />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-foreground">Asteria</div>
            {isEditingTitle || interactionMode === "edit" ? (
              <input
                ref={titleInputRef}
                className="map-title-input nodrag nopan hidden sm:block"
                value={mapTitle}
                onChange={(event) => updateMapTitle(event.target.value)}
                onBlur={finishTitleEditing}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur()
                  if (event.key === "Escape") setIsEditingTitle(false)
                }}
                aria-label="Map title"
              />
            ) : (
              <button type="button" className="map-title-display hidden sm:block" onClick={startTitleEditing} title="Edit map title">
                {normalizeMapTitle(mapTitle)}
              </button>
            )}
          </div>
        </div>
        <span
          className={`status-pill rounded-full border px-2 py-1 text-[11px] ${
            saveStatus === "Error"
              ? "border-danger/30 text-danger"
              : saveStatus === "Saved"
                ? "border-success/30 text-success"
                : "border-warning/30 text-warning"
          }`}
        >
          {saveStatus}
        </span>
      </div>
      <div className="toolbar-actions ml-auto flex min-w-0 items-center gap-1.5 overflow-hidden">
        <div className="flex shrink-0 rounded-md border border-border bg-panel p-0.5" aria-label="Canvas interaction mode">
          <button
            type="button"
            className={`segmented-button ${interactionMode === "move" ? "segmented-button-active" : ""}`}
            onClick={() => onInteractionModeChange("move")}
            title="Move mode: drag blocks around the canvas"
          >
            <MousePointer2 size={14} />
            <span className="toolbar-label">Move</span>
          </button>
          <button
            type="button"
            className={`segmented-button ${interactionMode === "edit" ? "segmented-button-active" : ""}`}
            onClick={() => onInteractionModeChange("edit")}
            title="Edit mode: click a block to edit its text in the inspector"
          >
            <PencilLine size={14} />
            <span className="toolbar-label">Edit</span>
          </button>
        </div>
        <button type="button" className="primary-button" onClick={() => addBlock()} title="New block">
          <Plus size={15} />
          <span className="toolbar-label">New block</span>
        </button>
        <div className="flex shrink-0 items-center gap-1 rounded-md border border-border bg-panel p-0.5">
          <label className="sr-only" htmlFor="active-version">
            Active version
          </label>
          <select
            id="active-version"
            className="h-7 max-w-[128px] rounded border-0 bg-panel px-1.5 text-xs font-medium text-secondary outline-none focus:text-foreground"
            value={activeVersionId}
            onChange={(event) => setActiveVersion(event.target.value)}
            title="Active version"
          >
            <option value="all">All</option>
            {modelVersions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="segmented-button justify-center !px-1.5"
            onClick={() => setIsVersionPanelOpen((open) => !open)}
            aria-label="Manage versions"
            aria-expanded={isVersionPanelOpen}
            title="Manage versions"
          >
            <Settings2 size={14} />
          </button>
        </div>
        {interactionMode === "move" && selectedNodeIds.length > 1 && (
          <button type="button" className="toolbar-button" onClick={groupSelectedBlocks} title="Group selected blocks">
            <Group size={15} />
            <span className="toolbar-label">Group</span>
          </button>
        )}
        {interactionMode === "edit" && (
          <button
            type="button"
            className="toolbar-button disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!selectedBlock}
            onClick={() => setIsEquationDialogOpen(true)}
            title={selectedBlock ? "Insert display equation into selected block" : "Select a block before inserting an equation"}
          >
            <Sigma size={15} />
            <span className="toolbar-label">Equation</span>
          </button>
        )}
        <button type="button" className="toolbar-button" onClick={onFitView} title="Fit view">
          <Scan size={15} />
          <span className="toolbar-label">Fit</span>
        </button>
        <button
          type="button"
          className="toolbar-button"
          onClick={(event) => {
            event.currentTarget.blur()
            straightenNearAxisEdges()
          }}
          title="Clean up small near-straight edge offsets"
        >
          <Sparkles size={15} />
          <span className="toolbar-label">Clean</span>
        </button>
        <button type="button" className="toolbar-button" onClick={() => void saveNow()} title="Save">
          <Save size={15} />
          <span className="toolbar-label">Save</span>
        </button>
        <button type="button" className="toolbar-button" onClick={exportJson} title="Export">
          <Download size={15} />
          <span className="toolbar-label">Export</span>
        </button>
        <button type="button" className="danger-button" onClick={clear} title="Clear">
          <Trash2 size={15} />
          <span className="toolbar-label">Clear</span>
        </button>
        <button type="button" className="toolbar-button" onClick={() => inputRef.current?.click()} title="Import">
          <Upload size={15} />
          <span className="toolbar-label">Import</span>
        </button>
        <label
          className="density-control flex shrink-0 items-center gap-1 rounded-md border border-border bg-panel px-1.5 text-xs font-medium text-secondary"
          title="Display density: Auto uses each block's saved display mode; other choices temporarily override all blocks."
        >
          <Rows3 size={14} />
          <span className="sr-only">Display density</span>
          <select
            className="h-7 max-w-[76px] border-0 bg-panel text-xs outline-none"
            value={displayModeOverride}
            onChange={(event) => setDisplayModeOverride(event.target.value as DisplayModeOverride)}
            aria-label="Display density"
          >
            {displayModeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="toolbar-button !px-2" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
      {isVersionPanelOpen && (
        <div className="version-manager-panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-foreground">Versions</div>
              <div className="text-[11px] text-secondary">{modelVersions.length}/{maxModelVersions} user versions</div>
            </div>
            <button type="button" className="primary-button" disabled={modelVersions.length >= maxModelVersions} onClick={addModelVersion}>
              <Plus size={14} />
              Add
            </button>
          </div>
          <div className="grid gap-2">
            {modelVersions.length === 0 && <div className="rounded-md border border-border bg-app p-2 text-xs text-secondary">No user versions yet. Add one when you need version-specific content.</div>}
            {modelVersions.map((version, index) => (
              <div key={version.id} className="version-row">
                <input
                  className="field-input h-8"
                  value={version.label}
                  onChange={(event) => updateModelVersion(version.id, { label: event.target.value })}
                  aria-label="Version label"
                />
                <input
                  className="field-input h-8 w-20"
                  value={version.shortLabel || ""}
                  maxLength={12}
                  placeholder="Short"
                  onChange={(event) => updateModelVersion(version.id, { shortLabel: event.target.value })}
                  aria-label="Version short label"
                />
                <button type="button" className="toolbar-button !px-2" disabled={index === 0} onClick={() => moveModelVersion(version.id, -1)} aria-label="Move version up">
                  ↑
                </button>
                <button type="button" className="toolbar-button !px-2" disabled={index === modelVersions.length - 1} onClick={() => moveModelVersion(version.id, 1)} aria-label="Move version down">
                  ↓
                </button>
                <button type="button" className="danger-button !px-2" onClick={() => deleteModelVersion(version.id)} aria-label="Delete version">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={(event) => void importJson(event.target.files?.[0])} />
      <EquationDialog
        open={isEquationDialogOpen}
        title="Insert block equation"
        onCancel={() => setIsEquationDialogOpen(false)}
        onConfirm={insertEquation}
      />
    </header>
  )
}
