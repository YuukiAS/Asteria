import { useReactFlow } from "@xyflow/react"
import { Download, FileText, Group, History, Moon, MousePointer2, MoveDown, MoveUp, PencilLine, Plus, Rows3, Save, Scan, Search, Settings2, Sigma, Sparkles, Sun, Trash2, Upload, X, ZoomIn } from "lucide-react"
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import { blockSizePresets, type BlockSizePreset } from "../constants/layout"
import { displayModeOptions, maxModelVersions } from "../constants/versioning"
import { createExportFilename, exportMapFile, normalizeExportedMap, normalizeMapTitle, readJsonFile } from "../lib/exportImport"
import { requestBlockEquationInsert, requestInlineBlockEdit, requestInlineEditorFocus } from "../lib/inlineEditEvents"
import { searchRenderedBlocks, type SearchResult } from "../lib/mapSearch"
import { buildStoryMarkdown, createStoryMarkdownFilename, exportMarkdownFile } from "../lib/storyMarkdownExport"
import { useMapStore } from "../store/useMapStore"
import type { InteractionMode } from "../types/interaction"
import type { DisplayModeOverride } from "../types/map"
import { BlockHeaderSelect } from "./BlockHeaderSelect"
import { EquationDialog } from "./EquationDialog"
import packageJson from "../../package.json"

type ToolbarProps = {
  theme: "light" | "dark"
  interactionMode: InteractionMode
  isSearchPanelOpen: boolean
  onToggleTheme: () => void
  onInteractionModeChange: (mode: InteractionMode) => void
  onFitView: () => void
  onOpenSaveDialog: () => void
  onSearchPanelOpenChange: (open: boolean) => void
}

type ToolbarTooltipState = {
  text: string
  left: number
  desiredLeft: number
  arrowLeft: number
  top: number
  nowrap: boolean
}

export function Toolbar({
  theme,
  interactionMode,
  isSearchPanelOpen,
  onToggleTheme,
  onInteractionModeChange,
  onFitView,
  onOpenSaveDialog,
  onSearchPanelOpenChange,
}: ToolbarProps) {
  const reactFlow = useReactFlow()
  const inputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const versionSettingsRef = useRef<HTMLButtonElement>(null)
  const toolbarTooltipRef = useRef<HTMLDivElement>(null)
  const addMenuCloseTimerRef = useRef<number>()
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEquationDialogOpen, setIsEquationDialogOpen] = useState(false)
  const [isVersionPanelOpen, setIsVersionPanelOpen] = useState(false)
  const [isBackupPanelOpen, setIsBackupPanelOpen] = useState(false)
  const [versionPanelPosition, setVersionPanelPosition] = useState({ left: 12, top: 56 })
  const [addMenuPosition, setAddMenuPosition] = useState({ left: 12, top: 56 })
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [toolbarTooltip, setToolbarTooltip] = useState<ToolbarTooltipState>()
  const {
    mapTitle,
    modelVersions,
    activeVersionId,
    displayModeOverride,
    storyOutline,
    storyDeckSettings,
    nodes,
    edges,
    viewport,
    selectedNodeId,
    selectedNodeIds,
    saveStatus,
    backups,
    persistenceMode,
    sharedRecord,
    addBlockAndSelect,
    groupSelectedBlocks,
    updateMapTitle,
    setActiveVersion,
    addModelVersion,
    updateModelVersion,
    deleteModelVersion,
    moveModelVersion,
    setDisplayModeOverride,
    straightenNearAxisEdges,
    restoreBackup,
    chooseSharedWorkspace,
    clearMap,
    loadMap,
    setSelectedNode,
  } = useMapStore()
  const selectedBlock = nodes.find((node) => node.id === selectedNodeId && node.type === "block")
  const appVersion = packageJson.version
  const activeToolbarVersionId = modelVersions.some((version) => version.id === activeVersionId) ? activeVersionId : modelVersions[0]?.id || "all"
  const toolbarVersionOptions =
    modelVersions.length > 0
      ? modelVersions.map((version) => ({ value: version.id, label: version.label, description: version.shortLabel || version.label }))
      : [{ value: "all", label: "No versions", description: "Add a model version to enable version switching" }]
  const recentBackups = backups.filter((backup) => (backup.kind || "recent") === "recent").slice(0, 3)
  const fixedBackups = backups.filter((backup) => backup.kind === "fixed").slice(0, 3)
  const searchResults = useMemo(() => {
    if (!isSearchPanelOpen || !searchQuery.trim()) return []
    try {
      return searchRenderedBlocks(nodes, activeVersionId, modelVersions, searchQuery).slice(0, 80)
    } catch (error) {
      console.error("Asteria search failed", error)
      return []
    }
  }, [activeVersionId, isSearchPanelOpen, modelVersions, nodes, searchQuery])

  const showToolbarTooltip = (text: string, target: HTMLElement) => {
    const rect = target.getBoundingClientRect()
    const desiredLeft = rect.left + rect.width / 2
    setToolbarTooltip({ text, left: desiredLeft, desiredLeft, arrowLeft: 0, top: rect.bottom + 9, nowrap: text.length <= 28 })
  }

  useLayoutEffect(() => {
    if (!toolbarTooltip || !toolbarTooltipRef.current) return
    const rect = toolbarTooltipRef.current.getBoundingClientRect()
    const halfWidth = rect.width / 2
    const left = Math.max(12 + halfWidth, Math.min(toolbarTooltip.desiredLeft, window.innerWidth - 12 - halfWidth))
    const arrowLeft = Math.max(12, Math.min(toolbarTooltip.desiredLeft - (left - halfWidth), rect.width - 12))
    if (Math.abs(left - toolbarTooltip.left) > 0.5 || Math.abs(arrowLeft - toolbarTooltip.arrowLeft) > 0.5) {
      setToolbarTooltip((current) => (current ? { ...current, left, arrowLeft } : current))
    }
  }, [toolbarTooltip])

  const toolbarTip = (text: string) => ({
    "aria-label": text,
    "data-tooltip": text,
    onFocus: (event: { currentTarget: HTMLElement }) => showToolbarTooltip(text, event.currentTarget),
    onBlur: () => setToolbarTooltip(undefined),
    onPointerEnter: (event: { currentTarget: HTMLElement }) => showToolbarTooltip(text, event.currentTarget),
    onPointerLeave: () => setToolbarTooltip(undefined),
  })

  const formatRelativeBackupTime = (value: string) => {
    const elapsedMs = Date.now() - new Date(value).getTime()
    if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return "just now"
    const minutes = Math.floor(elapsedMs / 60000)
    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
    const days = Math.floor(hours / 24)
    return `${days} day${days === 1 ? "" : "s"} ago`
  }

  useEffect(() => {
    if (modelVersions.length > 0 && activeVersionId === "all") setActiveVersion(modelVersions[0].id)
  }, [activeVersionId, modelVersions, setActiveVersion])

  useEffect(() => {
    if (!isSearchPanelOpen) return
    window.setTimeout(() => searchInputRef.current?.focus(), 0)
  }, [isSearchPanelOpen])

  const absoluteNodePosition = (nodeId: string) => {
    const node = nodes.find((item) => item.id === nodeId)
    if (!node) return undefined
    let x = node.position.x
    let y = node.position.y
    let parentId = node.parentId
    while (parentId) {
      const parent = nodes.find((item) => item.id === parentId)
      if (!parent) break
      x += parent.position.x
      y += parent.position.y
      parentId = parent.parentId
    }
    return { x, y }
  }

  const openSearchResult = (result?: SearchResult) => {
    if (!result) return
    const node = nodes.find((item) => item.id === result.blockId && item.type === "block")
    const position = absoluteNodePosition(result.blockId)
    if (!node || !position || node.type !== "block") return
    setSelectedNode(result.blockId)
    onSearchPanelOpenChange(false)
    const viewport = reactFlow.getViewport()
    const zoom = Math.max(0.75, Math.min(viewport.zoom || 1, 1.25))
    const width = Number.isFinite(node.data.width) ? node.data.width : 340
    const height = Number.isFinite(node.data.height) ? node.data.height : 220
    void reactFlow.setCenter(position.x + width / 2, position.y + height / 2, { zoom, duration: 420 })
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("asteria-highlight-block", { detail: { nodeId: result.blockId } }))
    }, 120)
  }

  const exportJson = () => {
    exportMapFile(
      {
        version: 1,
        title: normalizeMapTitle(mapTitle),
        modelVersions,
        activeVersionId,
        displayModeOverride,
        storyOutline,
        storyDeckSettings,
        nodes,
        edges,
        viewport,
        updatedAt: new Date().toISOString(),
      },
      createExportFilename(mapTitle),
    )
  }

  const exportMarkdown = () => {
    const markdown = buildStoryMarkdown({
      mapTitle: normalizeMapTitle(mapTitle),
      modelVersions,
      activeVersionId,
      nodes,
      storyOutline,
      storyDeckSettings,
    })
    exportMarkdownFile(markdown, createStoryMarkdownFilename(storyDeckSettings.title || mapTitle))
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
    if (selectedNodeId) {
      requestInlineBlockEdit(selectedNodeId, "content")
      requestInlineEditorFocus(selectedNodeId)
      requestBlockEquationInsert(selectedNodeId, latex)
    }
  }

  const openAddMenu = (target: HTMLElement) => {
    if (addMenuCloseTimerRef.current) window.clearTimeout(addMenuCloseTimerRef.current)
    const rect = target.getBoundingClientRect()
    const panelWidth = Math.min(286, window.innerWidth - 24)
    setToolbarTooltip(undefined)
    setAddMenuPosition({
      left: Math.max(12, Math.min(rect.left, window.innerWidth - panelWidth - 12)),
      top: rect.bottom + 8,
    })
    setIsAddMenuOpen(true)
  }

  const scheduleCloseAddMenu = () => {
    if (addMenuCloseTimerRef.current) window.clearTimeout(addMenuCloseTimerRef.current)
    addMenuCloseTimerRef.current = window.setTimeout(() => setIsAddMenuOpen(false), 180)
  }

  const keepAddMenuOpen = () => {
    if (addMenuCloseTimerRef.current) window.clearTimeout(addMenuCloseTimerRef.current)
    setIsAddMenuOpen(true)
  }

  const createBlock = (preset: BlockSizePreset = "medium") => {
    const size = blockSizePresets[preset]
    const canvasBounds = document.querySelector(".asteria-flow-canvas")?.getBoundingClientRect()
    const flowCenter = canvasBounds
      ? reactFlow.screenToFlowPosition({
          x: canvasBounds.left + canvasBounds.width / 2,
          y: canvasBounds.top + canvasBounds.height / 2,
        })
      : undefined
    const nodeId = addBlockAndSelect(flowCenter ? { x: flowCenter.x - size.width / 2, y: flowCenter.y - size.height / 2 } : undefined, size)
    setIsAddMenuOpen(false)
    requestInlineBlockEdit(nodeId, "title")
  }

  const toggleVersionPanel = () => {
    const rect = versionSettingsRef.current?.getBoundingClientRect()
    if (rect) {
      const panelWidth = Math.min(520, window.innerWidth - 24)
      setVersionPanelPosition({
        left: Math.max(12, Math.min(rect.left, window.innerWidth - panelWidth - 12)),
        top: rect.bottom + 8,
      })
    }
    setIsVersionPanelOpen((open) => !open)
  }

  const importJson = async (file?: File) => {
    if (!file) return
    const confirmMessage =
      persistenceMode === "remote"
        ? "Importing JSON will replace this local workspace. Save to Shared afterward if it should become the shared version. Continue?"
        : "Importing JSON will replace the current local canvas. Continue?"
    if (!window.confirm(confirmMessage)) return
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
    if (window.confirm("Delete the current canvas? This keeps the app installed but removes current local map data.")) {
      clearMap()
    }
  }

  return (
    <header className="relative z-30 flex h-[52px] shrink-0 select-none items-center gap-2 border-b border-border bg-toolbar/90 px-3 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex items-center gap-2">
          <img src="/app-icon.png" alt="Asteria icon" className="h-8 w-8 rounded-lg object-cover" />
          <div className="leading-tight">
            <div className="flex items-baseline gap-1.5 text-sm font-semibold text-foreground">
              <span>Asteria</span>
              <span className="text-[11px] font-semibold text-secondary">{appVersion}</span>
            </div>
            {isEditingTitle ? (
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
              <button type="button" className="map-title-display hidden sm:block" onDoubleClick={startTitleEditing} aria-label="Double-click to edit map title">
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
        <span className="status-pill rounded-full border border-border px-2 py-1 text-[11px] text-secondary">
          {persistenceMode === "remote" ? "Shared" : "Local"}
        </span>
        <button
          type="button"
          className="toolbar-button relative !px-2"
          onClick={() => setIsBackupPanelOpen((open) => !open)}
          aria-expanded={isBackupPanelOpen}
          {...toolbarTip("Restore backup")}
        >
          <History size={14} />
          <span className="toolbar-label">Restore</span>
        </button>
        {isBackupPanelOpen && (
          <div className="absolute left-36 top-12 z-40 w-[260px] rounded-lg border border-border bg-panel p-3 shadow-xl">
            <div className="mb-2 text-xs font-semibold text-foreground">Restore backup</div>
            <div className="grid gap-2">
              {persistenceMode === "remote" && sharedRecord && (
                <>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">Shared version</div>
                  <button
                    type="button"
                    className="toolbar-button justify-between"
                    onClick={() => {
                      if (window.confirm("Restore the current shared version into this local workspace? A local safety backup will be created first, and newer block content on this computer will be kept.")) {
                        void chooseSharedWorkspace()
                        setIsBackupPanelOpen(false)
                      }
                    }}
                    title={new Date(sharedRecord.updatedAt).toLocaleString()}
                  >
                    <span>{formatRelativeBackupTime(sharedRecord.updatedAt)}</span>
                    <span className="text-[11px] text-secondary">Restore</span>
                  </button>
                </>
              )}
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">Recent versions</div>
              {recentBackups.length === 0 && <div className="text-xs text-secondary">No recent versions yet.</div>}
              {recentBackups.map((backup) => (
                <button
                  key={backup.id}
                  type="button"
                  className="toolbar-button justify-between"
                  onClick={() => {
                    if (window.confirm(`Restore backup from ${formatRelativeBackupTime(backup.createdAt)}? A local safety backup will be created first, and newer block content on this computer will be kept.`)) {
                      void restoreBackup(backup.id)
                      setIsBackupPanelOpen(false)
                    }
                  }}
                  title={new Date(backup.createdAt).toLocaleString()}
                >
                  <span>{formatRelativeBackupTime(backup.createdAt)}</span>
                  <span className="text-[11px] text-secondary">Restore</span>
                </button>
              ))}
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Fixed versions</div>
              {fixedBackups.length === 0 && <div className="text-xs text-secondary">No fixed versions yet.</div>}
              {fixedBackups.map((backup) => (
                <button
                  key={backup.id}
                  type="button"
                  className="toolbar-button justify-between"
                  onClick={() => {
                    if (window.confirm(`Restore fixed version from ${formatRelativeBackupTime(backup.createdAt)}? A local safety backup will be created first, and newer block content on this computer will be kept.`)) {
                      void restoreBackup(backup.id)
                      setIsBackupPanelOpen(false)
                    }
                  }}
                  title={new Date(backup.createdAt).toLocaleString()}
                >
                  <span>{formatRelativeBackupTime(backup.createdAt)}</span>
                  <span className="text-[11px] text-secondary">Restore</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="toolbar-actions ml-auto flex min-w-0 items-center gap-1.5 overflow-hidden">
        <div className="flex shrink-0 rounded-md border border-border bg-panel p-0.5" aria-label="Canvas interaction mode">
          <button
            type="button"
            className={`segmented-button ${interactionMode === "move" ? "segmented-button-active" : ""}`}
            onClick={() => onInteractionModeChange("move")}
            {...toolbarTip("Move mode")}
          >
            <MousePointer2 size={14} />
            <span className="toolbar-label">Move</span>
          </button>
          <button
            type="button"
            className={`segmented-button ${interactionMode === "edit" ? "segmented-button-active" : ""}`}
            onClick={() => onInteractionModeChange("edit")}
            {...toolbarTip("Edit mode")}
          >
            <PencilLine size={14} />
            <span className="toolbar-label">Edit</span>
          </button>
          <button
            type="button"
            className={`segmented-button ${interactionMode === "zoom" ? "segmented-button-active" : ""}`}
            onClick={() => onInteractionModeChange("zoom")}
            {...toolbarTip("Zoom mode")}
          >
            <ZoomIn size={14} />
            <span className="toolbar-label">Zoom</span>
          </button>
        </div>
        <div className="relative shrink-0" onPointerEnter={(event) => openAddMenu(event.currentTarget)} onPointerLeave={scheduleCloseAddMenu}>
          <button
            type="button"
            className="primary-button"
            onClick={() => createBlock("medium")}
            onFocus={(event) => openAddMenu(event.currentTarget)}
            onBlur={scheduleCloseAddMenu}
            aria-haspopup="menu"
            aria-expanded={isAddMenuOpen}
            aria-label="New medium block"
          >
            <Plus size={15} />
            <span className="toolbar-label">New block</span>
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-md border border-border bg-panel p-0.5">
          <div {...toolbarTip(modelVersions.length > 0 ? "Active model version" : "Add a model version to enable version switching")}>
            <BlockHeaderSelect
              value={activeToolbarVersionId}
              options={toolbarVersionOptions}
              ariaLabel="Active version"
              title="Active version"
              className="toolbar-version-select-trigger"
              minMenuWidth={128}
              disabled={modelVersions.length === 0}
              onOpenChange={() => setToolbarTooltip(undefined)}
              onChange={(value) => setActiveVersion(value)}
            />
          </div>
          <span className="toolbar-control-divider" aria-hidden="true" />
          <button
            ref={versionSettingsRef}
            type="button"
            className="segmented-button justify-center !px-1.5"
            onClick={toggleVersionPanel}
            aria-expanded={isVersionPanelOpen}
            {...toolbarTip("Manage versions")}
          >
            <Settings2 size={14} />
          </button>
        </div>
        {interactionMode === "move" && selectedNodeIds.length > 1 && (
          <button type="button" className="toolbar-button" onClick={groupSelectedBlocks} {...toolbarTip("Group selected blocks")}>
            <Group size={15} />
            <span className="toolbar-label">Group</span>
          </button>
        )}
        <button
          type="button"
          className="toolbar-button disabled:cursor-not-allowed disabled:opacity-50"
          disabled={interactionMode !== "edit" || !selectedBlock}
          onClick={() => setIsEquationDialogOpen(true)}
          {...toolbarTip(
            interactionMode !== "edit"
              ? "Switch to Edit mode to insert an equation"
              : selectedBlock
                ? "Insert display equation"
                : "Select a block before inserting an equation",
          )}
        >
          <Sigma size={15} />
          <span className="toolbar-label">Equation</span>
        </button>
        <button
          type="button"
          className={`toolbar-button ${isSearchPanelOpen ? "border-accent/40 text-accent" : ""}`}
          onClick={() => onSearchPanelOpenChange(!isSearchPanelOpen)}
          {...toolbarTip("Search current version")}
        >
          <Search size={15} />
          <span className="toolbar-label">Search</span>
        </button>
        <button type="button" className="toolbar-button" onClick={onFitView} {...toolbarTip("Fit view")}>
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
          {...toolbarTip("Clean up edges")}
        >
          <Sparkles size={15} />
          <span className="toolbar-label">Clean</span>
        </button>
        <button type="button" className="toolbar-button" onClick={onOpenSaveDialog} {...toolbarTip("Save version")}>
          <Save size={15} />
          <span className="toolbar-label">Save</span>
        </button>
        <button type="button" className="toolbar-button" onClick={() => inputRef.current?.click()} {...toolbarTip("Import JSON")}>
          <Upload size={15} />
          <span className="toolbar-label">Import</span>
        </button>
        <button type="button" className="toolbar-button" onClick={exportJson} {...toolbarTip("Export JSON")}>
          <Download size={15} />
          <span className="toolbar-label">Export</span>
        </button>
        <button type="button" className="toolbar-button" onClick={exportMarkdown} {...toolbarTip("Export Markdown story deck")}>
          <FileText size={15} />
          <span className="toolbar-label">Export Markdown</span>
        </button>
        <button type="button" className="danger-button" onClick={clear} {...toolbarTip("Delete canvas")}>
          <Trash2 size={15} />
          <span className="toolbar-label">Delete</span>
        </button>
        <label
          className="density-control flex shrink-0 items-center gap-1 rounded-md border border-border bg-panel px-1.5 text-xs font-medium text-secondary"
          {...toolbarTip("Display density")}
        >
          <Rows3 size={14} />
          <span className="sr-only">Display density</span>
          <BlockHeaderSelect
            value={displayModeOverride}
            options={displayModeOptions}
            ariaLabel="Display density"
            title="Display density"
            menuTitle="Display density"
            className="toolbar-density-select-trigger"
            minMenuWidth={128}
            onOpenChange={() => setToolbarTooltip(undefined)}
            onChange={(value) => setDisplayModeOverride(value as DisplayModeOverride)}
          />
        </label>
        <button type="button" className="toolbar-button !px-2" onClick={onToggleTheme} {...toolbarTip("Toggle theme")}>
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
      {toolbarTooltip ? (
        <div
          ref={toolbarTooltipRef}
          className={`toolbar-tooltip ${toolbarTooltip.nowrap ? "toolbar-tooltip-nowrap" : ""}`}
          style={
            {
              left: toolbarTooltip.left,
              top: toolbarTooltip.top,
              "--toolbar-tooltip-arrow-left": `${toolbarTooltip.arrowLeft}px`,
            } as CSSProperties
          }
          role="tooltip"
        >
          {toolbarTooltip.text}
        </div>
      ) : null}
      {isSearchPanelOpen && (
        <section className="search-panel" role="dialog" aria-label="Search current version">
          <form
            className="search-panel-form"
            onSubmit={(event) => {
              event.preventDefault()
              openSearchResult(searchResults[0])
            }}
          >
            <Search size={15} />
            <input
              ref={searchInputRef}
              className="search-panel-input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.stopPropagation()
                  onSearchPanelOpenChange(false)
                }
              }}
              placeholder="Search title, text, or LaTeX"
              spellCheck={false}
            />
            <button type="button" className="search-panel-close" aria-label="Close search" onClick={() => onSearchPanelOpenChange(false)}>
              <X size={15} />
            </button>
          </form>
          <div className="search-panel-results">
            {searchQuery.trim() && searchResults.length === 0 ? <div className="search-panel-empty">No matches.</div> : null}
            {!searchQuery.trim() ? <div className="search-panel-empty">Search the current model version.</div> : null}
            {searchResults.map((result, index) => (
              <button key={`${result.blockId}-${result.source}-${index}`} type="button" className="search-result-row" onClick={() => openSearchResult(result)}>
                <span className="search-result-header">
                  <span className="search-result-title">{result.blockTitle || "Untitled block"}</span>
                  <span className="type-badge search-result-type">{result.blockType}</span>
                </span>
                <span className="search-result-meta">{result.source}</span>
                <span className="search-result-snippet">{result.snippet}</span>
              </button>
            ))}
          </div>
        </section>
      )}
      {isAddMenuOpen && (
        <div
          className="add-block-menu"
          style={{ left: addMenuPosition.left, top: addMenuPosition.top }}
          role="menu"
          aria-label="Choose block size"
          onPointerEnter={keepAddMenuOpen}
          onPointerLeave={scheduleCloseAddMenu}
        >
          {(Object.keys(blockSizePresets) as BlockSizePreset[]).map((preset) => {
            const option = blockSizePresets[preset]
            const isDefault = preset === "medium"
            return (
              <button
                key={preset}
                type="button"
                className={`add-block-menu-item ${isDefault ? "add-block-menu-item-default" : ""}`}
                onClick={() => createBlock(preset)}
                role="menuitem"
              >
                <span className="add-block-menu-preview" style={{ width: `${option.width / 8}px`, height: `${option.height / 8}px` }} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-foreground">{option.label}</span>
                  <span className="block text-[11px] text-secondary">
                    {option.width} x {option.height}
                    {isDefault ? " (default)" : ""}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
      {isVersionPanelOpen && (
        <div className="version-manager-panel" style={{ left: versionPanelPosition.left, top: versionPanelPosition.top }}>
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
                  <MoveUp size={13} />
                </button>
                <button type="button" className="toolbar-button !px-2" disabled={index === modelVersions.length - 1} onClick={() => moveModelVersion(version.id, 1)} aria-label="Move version down">
                  <MoveDown size={13} />
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
