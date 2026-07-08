import "@xyflow/react/dist/style.css"
import "katex/dist/katex.min.css"
import { ReactFlowProvider } from "@xyflow/react"
import { ChevronLeft, ChevronRight, FileText, PanelRightClose, PanelRightOpen, SlidersHorizontal } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"
import { Canvas } from "../components/Canvas"
import { InspectorPanel } from "../components/InspectorPanel"
import { StoryOutlinePanel } from "../components/StoryOutlinePanel"
import { Toolbar } from "../components/Toolbar"
import { requestInlineBlockEdit, requestInlineEditorFocus, startInlineEditEvent, type InlineEditTarget } from "../lib/inlineEditEvents"
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
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const stored = Number(localStorage.getItem(sidebarWidthKey))
    return Number.isFinite(stored) && stored > 0 ? clampSidebarWidth(stored) : 360
  })
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem(sidebarCollapsedKey) === "true")
  const {
    hydrate,
    isHydrated,
    deleteSelected,
    duplicateSelectedBlock,
    copySelectedBlock,
    pasteBlock,
    addBlockNextToSelected,
    addLinkedBlockFromSelected,
    setSelectedNode,
    setSelectedEdge,
    saveNow,
    createBackupNow,
    undoLastCanvasChange,
    selectedNodeId,
    selectedNodeIds,
  } = useMapStore()

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!isHydrated) return
    const backupTimer = window.setInterval(() => {
      void createBackupNow()
    }, 5 * 60 * 1000)
    return () => window.clearInterval(backupTimer)
  }, [createBackupNow, isHydrated])

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
      const isMod = event.ctrlKey || event.metaKey
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
        void saveNow()
        return
      }
      if (isMod && event.shiftKey && event.key.toLowerCase() === "e" && selectedNodeId && !isEditableTarget(event.target)) {
        event.preventDefault()
        requestInlineBlockEdit(selectedNodeId, "content")
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
    pasteBlock,
    saveNow,
    selectedNodeId,
    setAppInteractionMode,
    setSelectedEdge,
    setSelectedNode,
    undoLastCanvasChange,
  ])

  const toggleTheme = useCallback(() => setTheme((current) => (current === "dark" ? "light" : "dark")), [setTheme])
  const fitView = useMemo(() => () => fitViewRef.current(), [])

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
          onInteractionModeChange={setAppInteractionMode}
          onToggleTheme={toggleTheme}
          onFitView={fitView}
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
            <button
              type="button"
              className="inspector-collapse-button"
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
              aria-label={isSidebarCollapsed ? "Expand inspector" : "Collapse inspector"}
              title={isSidebarCollapsed ? "Expand inspector" : "Collapse inspector"}
            >
              {isSidebarCollapsed ? <PanelRightOpen size={17} /> : <PanelRightClose size={17} />}
              <span className="sr-only">{isSidebarCollapsed ? "Expand" : "Collapse"}</span>
            </button>
            <div className="inspector-content-shell">
              {!isSidebarCollapsed && (
                <div className="grid grid-cols-2 gap-1 border-b border-border bg-toolbar/80 p-2">
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
      </div>
    </ReactFlowProvider>
  )
}
