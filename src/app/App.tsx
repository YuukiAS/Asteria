import "@xyflow/react/dist/style.css"
import "katex/dist/katex.min.css"
import { ReactFlowProvider } from "@xyflow/react"
import { Archive, ChevronLeft, ChevronRight, CloudUpload, FilePlus2, FileText, PanelRightClose, PanelRightOpen, Save, SlidersHorizontal } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"
import { Canvas } from "../components/Canvas"
import { InspectorPanel } from "../components/InspectorPanel"
import { StoryOutlinePanel } from "../components/StoryOutlinePanel"
import { Toolbar } from "../components/Toolbar"
import { requestInlineBlockEdit, requestInlineEditorFocus, requestSymbolEquationInsert, startInlineEditEvent, type InlineEditTarget } from "../lib/inlineEditEvents"
import { useMapStore } from "../store/useMapStore"
import type { InteractionMode } from "../types/interaction"

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(target.closest("input, textarea, select, button, [contenteditable='true'], .ProseMirror"))
}

function isTextEditingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(target.closest("input, textarea, select, [contenteditable='true'], .ProseMirror"))
}

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("asteria-theme")
    return stored === "dark" ? "dark" : "light"
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("asteria-theme", theme)
  }, [theme])
  return [theme, setTheme] as const
}

const sidebarWidthKey = "asteria-sidebar-width"
const sidebarCollapsedKey = "asteria-sidebar-collapsed"
const minSidebarWidth = 320
const maxSidebarWidth = 520
const collapsedSidebarWidth = 44

function clampSidebarWidth(width: number) {
  return Math.min(Math.max(width, minSidebarWidth), maxSidebarWidth)
}

export function App() {
  const fitViewRef = useRef<() => void>(() => undefined)
  const [theme, setTheme] = useTheme()
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("move")
  const [sidebarTab, setSidebarTab] = useState<"inspector" | "story">("inspector")
  const [inlineEditTarget, setInlineEditTarget] = useState<InlineEditTarget | undefined>()
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false)
  const [showSaveConflict, setShowSaveConflict] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const stored = Number(localStorage.getItem(sidebarWidthKey))
    return Number.isFinite(stored) && stored > 0 ? clampSidebarWidth(stored) : 360
  })
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem(sidebarCollapsedKey) === "true")
  const {
    hydrate,
    isHydrated,
    workspaceReady,
    persistenceMode,
    sharedRecord,
    chooseSharedWorkspace,
    chooseNewWorkspace,
    publishSharedVersion,
    saveFixedVersion,
    deleteSelected,
    duplicateSelectedBlock,
    copySelectedBlock,
    pasteBlock,
    addBlockNextToSelected,
    addLinkedBlockFromSelected,
    setSelectedNode,
    setSelectedEdge,
    createBackupNow,
    undoLastCanvasChange,
    nodes,
    selectedNodeId,
    selectedNodeIds,
  } = useMapStore()
  const selectedBlock = useMemo(() => {
    const node = nodes.find((item) => item.id === selectedNodeId)
    return node?.type === "block" ? node : undefined
  }, [nodes, selectedNodeId])

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!isHydrated || !workspaceReady) return
    const backupTimer = window.setInterval(() => {
      void createBackupNow()
    }, 5 * 60 * 1000)
    return () => window.clearInterval(backupTimer)
  }, [createBackupNow, isHydrated, workspaceReady])

  const setFitView = useCallback((fitView: () => void) => {
    fitViewRef.current = fitView
  }, [])

  const setAppInteractionMode = useCallback((mode: InteractionMode) => {
    setInteractionMode(mode)
    if (mode !== "edit") setInlineEditTarget(undefined)
  }, [])

  useEffect(() => {
    const startInlineEdit = (event: Event) => {
      const target = (event as CustomEvent<InlineEditTarget>).detail
      if (!target?.nodeId) return
      setInteractionMode("edit")
      setInlineEditTarget(target)
    }
    window.addEventListener(startInlineEditEvent, startInlineEdit)
    return () => window.removeEventListener(startInlineEditEvent, startInlineEdit)
  }, [])

  useEffect(() => {
    if (!inlineEditTarget) return
    if (interactionMode !== "edit" || !selectedNodeIds.includes(inlineEditTarget.nodeId)) {
      setInlineEditTarget(undefined)
    }
  }, [inlineEditTarget, interactionMode, selectedNodeIds])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!workspaceReady) return
      const isMod = event.ctrlKey || event.metaKey
      if (isMod && event.key.toLowerCase() === "f" && !isTextEditingTarget(event.target)) {
        event.preventDefault()
        setIsSearchPanelOpen(true)
        return
      }
      if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && !isTextEditingTarget(event.target)) {
        if (event.key === "1") {
          event.preventDefault()
          setAppInteractionMode("move")
          return
        }
        if (event.key === "2") {
          event.preventDefault()
          setAppInteractionMode("edit")
          return
        }
        if (event.key === "3") {
          event.preventDefault()
          setAppInteractionMode("zoom")
          return
        }
      }
      if (isMod && event.key === "Enter" && !isEditableTarget(event.target)) {
        event.preventDefault()
        const nodeId = event.shiftKey ? addLinkedBlockFromSelected() : addBlockNextToSelected()
        requestInlineBlockEdit(nodeId, "title")
        return
      }
      if (isMod && event.key.toLowerCase() === "z" && !event.shiftKey && !isEditableTarget(event.target)) {
        event.preventDefault()
        undoLastCanvasChange()
        return
      }
      if (isMod && event.key.toLowerCase() === "s") {
        event.preventDefault()
        setShowSaveConflict(false)
        setIsSaveDialogOpen(true)
        return
      }
      if (isMod && event.shiftKey && event.key.toLowerCase() === "e" && selectedNodeId) {
        const isSymbolBlock = selectedBlock?.data.nodeType === "symbol"
        const isSymbolEditorTarget = event.target instanceof HTMLElement && Boolean(event.target.closest(".symbols-editor"))
        if (isEditableTarget(event.target) && !(isSymbolBlock && isSymbolEditorTarget)) return
        event.preventDefault()
        requestInlineBlockEdit(selectedNodeId, "content")
        if (isSymbolBlock) {
          requestSymbolEquationInsert(selectedNodeId)
          return
        }
        window.setTimeout(() => {
          requestInlineEditorFocus(selectedNodeId)
          window.dispatchEvent(new CustomEvent("asteria-open-inline-equation", { detail: { nodeId: selectedNodeId } }))
        }, 0)
        return
      }
      if (isMod && event.key.toLowerCase() === "d" && !isEditableTarget(event.target)) {
        event.preventDefault()
        duplicateSelectedBlock()
        return
      }
      if (isMod && event.key.toLowerCase() === "c" && !isEditableTarget(event.target)) {
        event.preventDefault()
        copySelectedBlock()
        return
      }
      if (isMod && event.key.toLowerCase() === "v" && !isEditableTarget(event.target)) {
        event.preventDefault()
        pasteBlock()
        return
      }
      if (event.key === "Enter" && selectedNodeId && !isEditableTarget(event.target)) {
        event.preventDefault()
        requestInlineBlockEdit(selectedNodeId, "content")
        return
      }
      if (event.key === "Escape") {
        if (isSearchPanelOpen) {
          event.preventDefault()
          setIsSearchPanelOpen(false)
          return
        }
        if (inlineEditTarget) {
          event.preventDefault()
          setInlineEditTarget(undefined)
          if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
          return
        }
        setSelectedNode(undefined)
        setSelectedEdge(undefined)
        return
      }
      if (event.key === "Delete" && !isEditableTarget(event.target)) {
        event.preventDefault()
        deleteSelected()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [
    addBlockNextToSelected,
    addLinkedBlockFromSelected,
    copySelectedBlock,
    deleteSelected,
    duplicateSelectedBlock,
    inlineEditTarget,
    isSearchPanelOpen,
    pasteBlock,
    selectedBlock,
    selectedNodeId,
    setAppInteractionMode,
    setSelectedEdge,
    setSelectedNode,
    undoLastCanvasChange,
    workspaceReady,
  ])

  const toggleTheme = useCallback(() => setTheme((current) => (current === "dark" ? "light" : "dark")), [setTheme])
  const fitView = useMemo(() => () => fitViewRef.current(), [])

  const saveToShared = useCallback(
    async (force = false) => {
      const ok = await publishSharedVersion(force)
      if (ok) {
        setShowSaveConflict(false)
        setIsSaveDialogOpen(false)
      } else {
        setShowSaveConflict(true)
      }
    },
    [publishSharedVersion],
  )

  const saveToFixed = useCallback(async () => {
    await saveFixedVersion()
    setIsSaveDialogOpen(false)
  }, [saveFixedVersion])

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed)
    localStorage.setItem(sidebarCollapsedKey, String(collapsed))
  }, [])

  const startSidebarResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault()
      const startX = event.clientX
      const startWidth = sidebarWidth
      const onPointerMove = (moveEvent: PointerEvent) => {
        const nextWidth = clampSidebarWidth(startWidth - (moveEvent.clientX - startX))
        setSidebarWidth(nextWidth)
      }
      const onPointerUp = () => {
        localStorage.setItem(sidebarWidthKey, String(sidebarWidth))
        window.removeEventListener("pointermove", onPointerMove)
        window.removeEventListener("pointerup", onPointerUp)
        document.body.classList.remove("is-resizing-sidebar")
      }
      document.body.classList.add("is-resizing-sidebar")
      window.addEventListener("pointermove", onPointerMove)
      window.addEventListener("pointerup", onPointerUp)
    },
    [sidebarWidth],
  )

  useEffect(() => {
    localStorage.setItem(sidebarWidthKey, String(sidebarWidth))
  }, [sidebarWidth])

  useEffect(() => {
    const inspectorWidth = isSidebarCollapsed ? collapsedSidebarWidth : sidebarWidth
    document.documentElement.style.setProperty("--asteria-inspector-width", `${inspectorWidth}px`)
    return () => {
      document.documentElement.style.removeProperty("--asteria-inspector-width")
    }
  }, [isSidebarCollapsed, sidebarWidth])

  if (!isHydrated) {
    return <div className="grid h-screen place-items-center bg-app text-sm text-secondary">Loading Asteria...</div>
  }

  return (
    <ReactFlowProvider>
      <div className="flex h-screen min-h-0 flex-col bg-app text-foreground">
        <Toolbar
          theme={theme}
          interactionMode={interactionMode}
          isSearchPanelOpen={isSearchPanelOpen}
          onInteractionModeChange={setAppInteractionMode}
          onToggleTheme={toggleTheme}
          onFitView={fitView}
          onOpenSaveDialog={() => {
            setShowSaveConflict(false)
            setIsSaveDialogOpen(true)
          }}
          onSearchPanelOpenChange={setIsSearchPanelOpen}
        />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <Canvas
            onFitViewReady={setFitView}
            interactionMode={interactionMode}
            onInteractionModeChange={setAppInteractionMode}
            inlineEditTarget={inlineEditTarget}
            onInlineEditTargetChange={setInlineEditTarget}
          />
          <aside
            className={`inspector-shell ${isSidebarCollapsed ? "inspector-shell-collapsed" : "inspector-shell-expanded"}`}
            style={{ width: isSidebarCollapsed ? collapsedSidebarWidth : sidebarWidth }}
            aria-label="Inspector panel"
          >
            {!isSidebarCollapsed && (
              <div
                className="inspector-resize-handle"
                role="separator"
                aria-label="Resize inspector"
                aria-orientation="vertical"
                onPointerDown={startSidebarResize}
              />
            )}
            {isSidebarCollapsed && (
              <button
                type="button"
                className="inspector-collapse-button inspector-collapse-button-collapsed"
                onClick={() => setSidebarCollapsed(false)}
                aria-label="Expand inspector"
                title="Expand inspector"
              >
                <PanelRightOpen size={17} />
                <span className="sr-only">Expand</span>
              </button>
            )}
            <div className="inspector-content-shell">
              {!isSidebarCollapsed && (
                <div className="inspector-tab-bar grid gap-1 border-b border-border bg-toolbar/80 p-2">
                  <button
                    type="button"
                    className="inspector-collapse-button inspector-collapse-button-inline"
                    onClick={() => setSidebarCollapsed(true)}
                    aria-label="Collapse inspector"
                    title="Collapse inspector"
                  >
                    <PanelRightClose size={17} />
                    <span className="sr-only">Collapse</span>
                  </button>
                  <button
                    type="button"
                    className={`segmented-button justify-center ${sidebarTab === "inspector" ? "segmented-button-active" : ""}`}
                    onClick={() => setSidebarTab("inspector")}
                  >
                    <SlidersHorizontal size={14} />
                    Inspector
                  </button>
                  <button
                    type="button"
                    className={`segmented-button justify-center ${sidebarTab === "story" ? "segmented-button-active" : ""}`}
                    onClick={() => setSidebarTab("story")}
                  >
                    <FileText size={14} />
                    Story
                  </button>
                </div>
              )}
              {sidebarTab === "story" ? <StoryOutlinePanel /> : <InspectorPanel />}
            </div>
            {!isSidebarCollapsed && (
              <div className="inspector-width-readout" aria-hidden="true">
                <ChevronLeft size={12} />
                {Math.round(sidebarWidth)}px
                <ChevronRight size={12} />
              </div>
            )}
          </aside>
        </div>
        {persistenceMode === "remote" && !workspaceReady && sharedRecord && (
          <AsteriaChoiceDialog
            title="Choose a starting version"
            description="Select the workspace you want before editing Asteria on this computer."
            primary={{
              icon: <CloudUpload size={18} />,
              tone: "shared",
              badge: "Shared",
              title: "Use shared version",
              description: `Load the shared map last saved ${formatDialogDate(sharedRecord.updatedAt)}. A local safety backup is created first, and newer block content on this computer is kept.`,
              onClick: () => void chooseSharedWorkspace(),
            }}
            secondary={{
              icon: <FilePlus2 size={18} />,
              tone: "new",
              badge: "Local only",
              title: "New from scratch",
              description: "Start an empty local draft. This does not replace the shared version until you save to Shared.",
              onClick: chooseNewWorkspace,
            }}
          />
        )}
        {isSaveDialogOpen && (
          <AsteriaChoiceDialog
            title={showSaveConflict ? "Shared version changed" : "Save current version"}
            description={
              showSaveConflict
                ? "Another computer saved the shared version after this workspace loaded. Choose how to continue."
                : "Choose where to save the current canvas."
            }
            primary={{
              icon: showSaveConflict ? <Save size={18} /> : <CloudUpload size={18} />,
              tone: showSaveConflict ? "overwrite" : "shared",
              badge: showSaveConflict ? "Replace shared" : "All computers",
              title: showSaveConflict ? "Overwrite shared version" : "Save shared version",
              description: showSaveConflict
                ? "Replace the current shared version with this canvas."
                : "Publish this canvas as the single shared version for all computers.",
              onClick: () => void saveToShared(showSaveConflict),
            }}
            secondary={{
              icon: showSaveConflict ? <CloudUpload size={18} /> : <Archive size={18} />,
              tone: showSaveConflict ? "shared" : "fixed",
              badge: showSaveConflict ? "Keep newer local" : "This computer",
              title: showSaveConflict ? "Load shared version" : "Save fixed version",
              description: showSaveConflict
                ? "Create a local safety backup, load the shared version, and keep any newer block content from this computer."
                : "Save a local fixed checkpoint. The latest three fixed versions are kept on this computer.",
              onClick: showSaveConflict
                ? () => {
                    void chooseSharedWorkspace()
                    setShowSaveConflict(false)
                    setIsSaveDialogOpen(false)
                  }
                : () => void saveToFixed(),
            }}
            onCancel={() => {
              setShowSaveConflict(false)
              setIsSaveDialogOpen(false)
            }}
          />
        )}
      </div>
    </ReactFlowProvider>
  )
}

function formatDialogDate(value?: string) {
  if (!value) return "unknown time"
  return new Date(value).toLocaleString()
}

type DialogAction = {
  icon: React.ReactNode
  tone: "shared" | "fixed" | "new" | "overwrite"
  badge: string
  title: string
  description: string
  onClick: () => void
}

function AsteriaChoiceDialog({
  title,
  description,
  primary,
  secondary,
  onCancel,
}: {
  title: string
  description: string
  primary: DialogAction
  secondary: DialogAction
  onCancel?: () => void
}) {
  return (
    <div className="choice-dialog-backdrop" role="presentation">
      <section className="choice-dialog nodrag nopan nowheel" role="dialog" aria-modal="true" aria-labelledby="choice-dialog-title">
        <div className="choice-dialog-header">
          <div>
            <h2 id="choice-dialog-title">{title}</h2>
            <p>{description}</p>
          </div>
        </div>
        <div className="choice-dialog-options">
          {[primary, secondary].map((action) => (
            <button key={action.title} type="button" className={`choice-dialog-option choice-dialog-option-${action.tone}`} onClick={action.onClick}>
              <span className="choice-dialog-option-icon">{action.icon}</span>
              <span>
                <span className="choice-dialog-option-badge">{action.badge}</span>
                <span className="choice-dialog-option-title">{action.title}</span>
                <span className="choice-dialog-option-description">{action.description}</span>
              </span>
            </button>
          ))}
        </div>
        {onCancel && (
          <div className="choice-dialog-actions">
            <button type="button" className="toolbar-button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
