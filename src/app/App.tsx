import "@xyflow/react/dist/style.css"
import "katex/dist/katex.min.css"
import { ReactFlowProvider } from "@xyflow/react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Canvas } from "../components/Canvas"
import { InspectorPanel } from "../components/InspectorPanel"
import { Toolbar } from "../components/Toolbar"
import { exportMapFile } from "../lib/exportImport"
import { formatJsonTimestamp } from "../lib/time"
import { useMapStore } from "../store/useMapStore"

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(target.closest("input, textarea, select, button, [contenteditable='true'], .ProseMirror"))
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

export function App() {
  const fitViewRef = useRef<() => void>(() => undefined)
  const [theme, setTheme] = useTheme()
  const [interactionMode, setInteractionMode] = useState<"move" | "edit">("move")
  const { hydrate, isHydrated, deleteSelected, setSelectedNode, setSelectedEdge, saveNow, nodes, edges, viewport } = useMapStore()

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  const setFitView = useCallback((fitView: () => void) => {
    fitViewRef.current = fitView
  }, [])

  const exportJson = useCallback(() => {
    exportMapFile(
      { version: 1, nodes, edges, viewport, updatedAt: new Date().toISOString() },
      `trace-map-${formatJsonTimestamp()}.json`,
    )
  }, [edges, nodes, viewport])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isMod = event.ctrlKey || event.metaKey
      if (isMod && event.key.toLowerCase() === "s") {
        event.preventDefault()
        void saveNow()
        return
      }
      if (isMod && event.key.toLowerCase() === "e") {
        event.preventDefault()
        exportJson()
        return
      }
      if (event.key === "Escape") {
        setSelectedNode(undefined)
        setSelectedEdge(undefined)
        return
      }
      if ((event.key === "Delete" || event.key === "Backspace") && !isEditableTarget(event.target)) {
        event.preventDefault()
        deleteSelected()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [deleteSelected, exportJson, saveNow, setSelectedEdge, setSelectedNode])

  const toggleTheme = useCallback(() => setTheme((current) => (current === "dark" ? "light" : "dark")), [setTheme])
  const fitView = useMemo(() => () => fitViewRef.current(), [])

  if (!isHydrated) {
    return <div className="grid h-screen place-items-center bg-app text-sm text-secondary">Loading Asteria...</div>
  }

  return (
    <ReactFlowProvider>
      <div className="flex h-screen min-h-0 flex-col bg-app text-foreground">
        <Toolbar
          theme={theme}
          interactionMode={interactionMode}
          onInteractionModeChange={setInteractionMode}
          onToggleTheme={toggleTheme}
          onFitView={fitView}
        />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <Canvas onFitViewReady={setFitView} interactionMode={interactionMode} />
          <InspectorPanel />
        </div>
      </div>
    </ReactFlowProvider>
  )
}
