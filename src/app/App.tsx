import "katex/dist/katex.min.css"
import { Download, GitBranch, Moon, Network, PanelRightClose, PanelRightOpen, RotateCcw, Save, Search, ShieldCheck, Sun } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"
import { ArchitectureSessionProvider, useArchitectureSession } from "../architecture/session"
import { multiViewIds } from "../architecture/fixtures/multiViewTraceProject"
import { AppErrorBoundary } from "../components/AppErrorBoundary"
import { ArchitectureReferencePanel } from "../components/ArchitectureReferencePanel"
import { ArchitectureWorkspace } from "../components/ArchitectureWorkspace"

const appVersion = "2.0.0-rc.4"
const sidebarWidthKey = "asteria-v2-sidebar-width"
const sidebarCollapsedKey = "asteria-v2-sidebar-collapsed"
const minSidebarWidth = 320
const maxSidebarWidth = 520
const collapsedSidebarWidth = 44

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("asteria-theme")
    return stored === "light" ? "light" : "dark"
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("asteria-theme", theme)
  }, [theme])
  return [theme, setTheme] as const
}

function clampSidebarWidth(width: number) {
  return Math.min(Math.max(width, minSidebarWidth), maxSidebarWidth)
}

function viewLabel(viewId: string) {
  if (viewId === multiViewIds.lineage) return "Lineage"
  if (viewId === multiViewIds.evidence) return "Evidence"
  return "Architecture"
}

function viewIcon(viewId: string) {
  if (viewId === multiViewIds.lineage) return GitBranch
  if (viewId === multiViewIds.evidence) return ShieldCheck
  return Network
}

function focusArchitectureSearch() {
  document.querySelector<HTMLElement>('[data-testid="architecture-search-input"]')?.focus()
}

function focusArchitectureExport() {
  document.querySelector<HTMLElement>('[data-testid="export-markdown"]')?.click()
  document.querySelector<HTMLElement>('[data-testid="architecture-export-preview"]')?.scrollIntoView({ block: "center" })
}

function AsteriaV2TopBar({ theme, onToggleTheme, onToggleInspector, inspectorCollapsed }: { theme: "light" | "dark"; onToggleTheme: () => void; onToggleInspector: () => void; inspectorCollapsed: boolean }) {
  const { activeViewId, modelId, saveViewState, restoreViewState } = useArchitectureSession()
  const Icon = viewIcon(activeViewId)
  const modelLabel = modelId === "original-trace" ? "Original TRACE" : "CAT-TRACE Frozen V2"

  return (
    <header className="asteria-v2-topbar" data-testid="asteria-v2-topbar">
      <div className="asteria-v2-brand">
        <img src="/app-icon.png" alt="" aria-hidden="true" />
        <div>
          <strong>Asteria 2.0</strong>
          <span>{appVersion}</span>
        </div>
      </div>

      <div className="asteria-v2-context" aria-label="Current Asteria 2.0 context">
        <span data-testid="current-project">Project: CAT-TRACE</span>
        <span data-testid="current-view">
          <Icon size={14} />
          {viewLabel(activeViewId)}
        </span>
        {activeViewId === multiViewIds.architecture ? <span data-testid="current-model">Model: {modelLabel}</span> : null}
      </div>

      <div className="asteria-v2-actions">
        <button type="button" className="toolbar-button" onClick={focusArchitectureSearch} data-testid="topbar-search">
          <Search size={15} />
          <span className="toolbar-label">Search</span>
        </button>
        <button type="button" className="toolbar-button" onClick={focusArchitectureExport} data-testid="topbar-export">
          <Download size={15} />
          <span className="toolbar-label">Export</span>
        </button>
        <button type="button" className="toolbar-button" onClick={saveViewState} data-testid="topbar-save-view">
          <Save size={15} />
          <span className="toolbar-label">Save</span>
        </button>
        <button type="button" className="toolbar-button" onClick={restoreViewState} data-testid="topbar-restore-view">
          <RotateCcw size={15} />
          <span className="toolbar-label">Restore</span>
        </button>
        <button type="button" className="toolbar-button" onClick={onToggleInspector} aria-label={inspectorCollapsed ? "Open inspector" : "Close inspector"} data-testid="topbar-toggle-inspector">
          {inspectorCollapsed ? <PanelRightOpen size={15} /> : <PanelRightClose size={15} />}
        </button>
        <button type="button" className="toolbar-button" onClick={onToggleTheme} aria-label={theme === "dark" ? "Light theme" : "Dark theme"} data-testid="topbar-toggle-theme">
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  )
}

function AsteriaV2Shell() {
  const [theme, setTheme] = useTheme()
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const stored = Number(localStorage.getItem(sidebarWidthKey))
    return Number.isFinite(stored) && stored > 0 ? clampSidebarWidth(stored) : 360
  })
  const [isSidebarCollapsed, setIsSidebarCollapsedState] = useState(() => localStorage.getItem(sidebarCollapsedKey) === "true")
  const { activeViewId, modelId, selectedEntityId } = useArchitectureSession()

  const toggleTheme = useCallback(() => setTheme((current) => (current === "dark" ? "light" : "dark")), [setTheme])
  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setIsSidebarCollapsedState(collapsed)
    localStorage.setItem(sidebarCollapsedKey, String(collapsed))
  }, [])

  const startSidebarResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault()
      const startX = event.clientX
      const startWidth = sidebarWidth
      const onPointerMove = (moveEvent: PointerEvent) => {
        setSidebarWidth(clampSidebarWidth(startWidth - (moveEvent.clientX - startX)))
      }
      const onPointerUp = () => {
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

  const workspaceResetKey = useMemo(() => `${activeViewId}:${modelId}:${selectedEntityId}`, [activeViewId, modelId, selectedEntityId])

  return (
    <div className="asteria-v2-shell" data-testid="asteria-v2-root-shell">
      <AsteriaV2TopBar theme={theme} onToggleTheme={toggleTheme} onToggleInspector={() => setSidebarCollapsed(!isSidebarCollapsed)} inspectorCollapsed={isSidebarCollapsed} />
      <div className="asteria-v2-main">
        <AppErrorBoundary label="architecture workspace" resetKey={workspaceResetKey}>
          <ArchitectureWorkspace />
        </AppErrorBoundary>
        <aside
          className={`inspector-shell ${isSidebarCollapsed ? "inspector-shell-collapsed" : "inspector-shell-expanded"}`}
          style={{ width: isSidebarCollapsed ? collapsedSidebarWidth : sidebarWidth }}
          aria-label="Asteria 2.0 inspector"
        >
          {!isSidebarCollapsed && <div className="inspector-resize-handle" role="separator" aria-label="Resize inspector" aria-orientation="vertical" onPointerDown={startSidebarResize} />}
          {isSidebarCollapsed ? (
            <button type="button" className="inspector-collapse-button inspector-collapse-button-collapsed" onClick={() => setSidebarCollapsed(false)} aria-label="Expand inspector" title="Expand inspector">
              <PanelRightOpen size={17} />
              <span className="sr-only">Expand</span>
            </button>
          ) : null}
          <div className="inspector-content-shell">
            {!isSidebarCollapsed ? (
              <div className="inspector-tab-bar border-b border-border bg-toolbar/80 p-2">
                <button type="button" className="inspector-collapse-button inspector-collapse-button-inline" onClick={() => setSidebarCollapsed(true)} aria-label="Collapse inspector" title="Collapse inspector">
                  <PanelRightClose size={17} />
                  <span className="sr-only">Collapse</span>
                </button>
                <span className="asteria-v2-inspector-title">Architecture</span>
              </div>
            ) : null}
            <AppErrorBoundary label="architecture inspector" resetKey={workspaceResetKey}>
              <ArchitectureReferencePanel />
            </AppErrorBoundary>
          </div>
        </aside>
      </div>
    </div>
  )
}

export function App() {
  return (
    <ArchitectureSessionProvider>
      <AsteriaV2Shell />
    </ArchitectureSessionProvider>
  )
}
