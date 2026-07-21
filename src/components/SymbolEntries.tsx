import { Plus, Trash2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { openSymbolEquationEvent } from "../lib/inlineEditEvents"
import { renderSymbolLatexHtml, sortedSymbolEntries } from "../lib/symbolEntries"
import { createId } from "../lib/ids"
import { nowIso } from "../lib/time"
import type { SymbolEntry } from "../types/map"
import { EquationDialog } from "./EquationDialog"

type SymbolEntriesPreviewProps = {
  entries?: SymbolEntry[]
}

type SymbolEntriesEditorProps = {
  entries?: SymbolEntry[]
  nodeId: string
  enableEquationShortcut?: boolean
  onChange: (entries: SymbolEntry[]) => void
}

function updateEntry(entries: SymbolEntry[], id: string, patch: Partial<Pick<SymbolEntry, "latex" | "meaning">>) {
  const updatedAt = nowIso()
  return entries.map((entry) => (entry.id === id ? { ...entry, ...patch, updatedAt } : entry))
}

function createSymbolEntry(latex = "", meaning = "", id = createId("symbol")): SymbolEntry {
  const at = nowIso()
  return {
    id,
    latex,
    meaning,
    createdAt: at,
    updatedAt: at,
  }
}

export function SymbolEntriesPreview({ entries = [] }: SymbolEntriesPreviewProps) {
  const sorted = sortedSymbolEntries(entries)
  if (!sorted.length) return <div className="symbols-empty-state">No symbols yet.</div>
  return (
    <div className="symbols-table" role="table" aria-label="Symbols">
      <div className="symbols-table-header" role="row">
        <div role="columnheader">Symbol</div>
        <div role="columnheader">Meaning</div>
      </div>
      {sorted.map((entry) => (
        <div key={entry.id} className="symbols-table-row" role="row">
          <div className="symbols-symbol" role="cell" dangerouslySetInnerHTML={{ __html: renderSymbolLatexHtml(entry.latex) }} />
          <div className="symbols-meaning" role="cell">
            {entry.meaning}
          </div>
        </div>
      ))}
    </div>
  )
}

export function SymbolEntriesEditor({ entries = [], nodeId, enableEquationShortcut = false, onChange }: SymbolEntriesEditorProps) {
  const [equationTargetId, setEquationTargetId] = useState<string | null>(null)
  const [editingLatexEntryId, setEditingLatexEntryId] = useState<string | null>(null)
  const lastFocusedEntryIdRef = useRef<string | null>(null)
  const equationTarget = useMemo(() => entries.find((entry) => entry.id === equationTargetId), [entries, equationTargetId])

  const addEntry = useCallback(() => {
    const entry = createSymbolEntry()
    onChange([...entries, entry])
    setEditingLatexEntryId(entry.id)
    window.setTimeout(() => {
      document.querySelector<HTMLInputElement>(`.symbols-latex-input[data-symbol-id="${entry.id}"]`)?.focus()
    }, 0)
  }, [entries, onChange])

  const openEquationDialog = useCallback(
    (entryId?: string | null) => {
      const targetId = entryId || entries[0]?.id
      if (targetId) {
        setEditingLatexEntryId(null)
        setEquationTargetId(targetId)
        return
      }
      setEditingLatexEntryId(null)
      setEquationTargetId(createId("symbol"))
    },
    [entries],
  )

  useEffect(() => {
    if (!enableEquationShortcut) return
    const openEquation = (event: Event) => {
      const detail = (event as CustomEvent<{ nodeId: string }>).detail
      if (detail?.nodeId !== nodeId) return
      const active = document.activeElement instanceof HTMLElement ? document.activeElement : null
      const activeRowId = active?.closest<HTMLElement>("[data-symbol-row-id]")?.dataset.symbolRowId
      openEquationDialog(activeRowId || lastFocusedEntryIdRef.current)
    }
    window.addEventListener(openSymbolEquationEvent, openEquation)
    return () => window.removeEventListener(openSymbolEquationEvent, openEquation)
  }, [enableEquationShortcut, nodeId, openEquationDialog])

  const confirmEquation = (latex: string) => {
    const targetId = equationTargetId
    setEquationTargetId(null)
    setEditingLatexEntryId(null)
    if (!targetId) return

    const existing = entries.find((entry) => entry.id === targetId)
    if (existing) {
      onChange(updateEntry(entries, targetId, { latex }))
    } else {
      onChange([...entries, createSymbolEntry(latex, "", targetId)])
    }
    window.setTimeout(() => {
      document.querySelector<HTMLInputElement>(`.symbols-meaning-input[data-symbol-id="${targetId}"]`)?.focus()
    }, 0)
  }

  return (
    <div className="symbols-editor">
      {entries.length === 0 ? <div className="symbols-empty-state">No symbols yet.</div> : null}
      {entries.map((entry) => (
        <div key={entry.id} className="symbols-editor-row" data-symbol-row-id={entry.id}>
          <label className="symbols-editor-field">
            <span>LaTeX</span>
            {editingLatexEntryId === entry.id ? (
              <input
                className="field-input symbols-latex-input"
                data-symbol-id={entry.id}
                value={entry.latex}
                spellCheck={false}
                onFocus={() => {
                  lastFocusedEntryIdRef.current = entry.id
                }}
                onBlur={() => setEditingLatexEntryId(null)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === "Escape") {
                    event.preventDefault()
                    event.currentTarget.blur()
                  }
                }}
                onChange={(event) => onChange(updateEntry(entries, entry.id, { latex: event.target.value }))}
              />
            ) : (
              <button
                type="button"
                className={`symbols-latex-preview-button ${entry.latex.trim() ? "" : "symbols-latex-preview-button-empty"}`}
                data-symbol-id={entry.id}
                aria-label="Edit symbol LaTeX"
                title="Edit symbol LaTeX"
                onClick={() => {
                  lastFocusedEntryIdRef.current = entry.id
                  setEditingLatexEntryId(entry.id)
                  window.setTimeout(() => {
                    document.querySelector<HTMLInputElement>(`.symbols-latex-input[data-symbol-id="${entry.id}"]`)?.focus()
                  }, 0)
                }}
                onFocus={() => {
                  lastFocusedEntryIdRef.current = entry.id
                }}
                dangerouslySetInnerHTML={{ __html: renderSymbolLatexHtml(entry.latex) || "Preview" }}
              />
            )}
          </label>
          <label className="symbols-editor-field">
            <span>Meaning</span>
            <input
              className="field-input symbols-meaning-input"
              data-symbol-id={entry.id}
              value={entry.meaning}
              onFocus={() => {
                lastFocusedEntryIdRef.current = entry.id
              }}
              onChange={(event) => onChange(updateEntry(entries, entry.id, { meaning: event.target.value }))}
            />
          </label>
          <button
            type="button"
            className="symbols-delete-button"
            aria-label="Delete symbol"
            title="Delete symbol"
            onClick={() => onChange(entries.filter((item) => item.id !== entry.id))}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" className="toolbar-button symbols-add-button" onClick={addEntry}>
        <Plus size={14} />
        Add symbol
      </button>
      <EquationDialog
        open={Boolean(equationTargetId)}
        title="Symbol equation"
        initialLatex={equationTarget?.latex || ""}
        displayMode={false}
        confirmLabel={equationTarget?.latex ? "Update" : "Insert"}
        submitOnEnter
        onCancel={() => setEquationTargetId(null)}
        onConfirm={confirmEquation}
      />
    </div>
  )
}
