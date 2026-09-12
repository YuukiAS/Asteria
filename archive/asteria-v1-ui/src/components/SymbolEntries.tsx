import { Plus, Trash2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { openSymbolEquationEvent } from "../lib/inlineEditEvents"
import { compareSymbolEntries, renderSymbolLatexHtml, renderSymbolMeaningHtml, sortedSymbolEntries } from "../lib/symbolEntries"
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

type SymbolEquationTarget = {
  entryId: string
  field: "latex" | "meaning"
  selectionStart?: number
  selectionEnd?: number
}

function updateEntry(entries: SymbolEntry[], id: string, patch: Partial<Pick<SymbolEntry, "latex" | "meaning">>) {
  const updatedAt = nowIso()
  return entries.map((entry) => (entry.id === id ? { ...entry, ...patch, updatedAt } : entry))
}

function sortEditableSymbolEntries(entries: readonly SymbolEntry[]) {
  return entries.slice().sort((left, right) => {
    const leftHasLatex = Boolean(left.latex.trim())
    const rightHasLatex = Boolean(right.latex.trim())
    if (leftHasLatex && rightHasLatex) return compareSymbolEntries(left, right)
    if (leftHasLatex) return -1
    if (rightHasLatex) return 1
    return left.createdAt.localeCompare(right.createdAt)
  })
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
          <div className="symbols-meaning" role="cell" dangerouslySetInnerHTML={{ __html: renderSymbolMeaningHtml(entry.meaning) }} />
        </div>
      ))}
    </div>
  )
}

export function SymbolEntriesEditor({ entries = [], nodeId, enableEquationShortcut = false, onChange }: SymbolEntriesEditorProps) {
  const [equationTarget, setEquationTarget] = useState<SymbolEquationTarget | null>(null)
  const [editingLatexEntryId, setEditingLatexEntryId] = useState<string | null>(null)
  const lastFocusedEntryIdRef = useRef<string | null>(null)
  const lastFocusedTargetRef = useRef<SymbolEquationTarget | null>(null)
  const sortedEntries = useMemo(() => sortEditableSymbolEntries(entries), [entries])
  const equationTargetEntry = useMemo(() => entries.find((entry) => entry.id === equationTarget?.entryId), [entries, equationTarget?.entryId])

  const commitEntries = useCallback((nextEntries: SymbolEntry[]) => onChange(sortEditableSymbolEntries(nextEntries)), [onChange])

  const rememberFocusedTarget = (entryId: string, field: SymbolEquationTarget["field"], input?: HTMLInputElement) => {
    const nextTarget = {
      entryId,
      field,
      selectionStart: input?.selectionStart ?? undefined,
      selectionEnd: input?.selectionEnd ?? undefined,
    }
    lastFocusedEntryIdRef.current = entryId
    lastFocusedTargetRef.current = nextTarget
  }

  const activeEquationTarget = () => {
    const active = document.activeElement instanceof HTMLInputElement ? document.activeElement : null
    const rowId = active?.closest<HTMLElement>("[data-symbol-row-id]")?.dataset.symbolRowId
    if (!rowId) return lastFocusedTargetRef.current
    return {
      entryId: rowId,
      field: active.classList.contains("symbols-meaning-input") ? "meaning" : "latex",
      selectionStart: active.selectionStart ?? undefined,
      selectionEnd: active.selectionEnd ?? undefined,
    } satisfies SymbolEquationTarget
  }

  const addEntry = useCallback(() => {
    const entry = createSymbolEntry()
    commitEntries([...entries, entry])
    setEditingLatexEntryId(entry.id)
    window.setTimeout(() => {
      document.querySelector<HTMLInputElement>(`.symbols-latex-input[data-symbol-id="${entry.id}"]`)?.focus()
    }, 0)
  }, [commitEntries, entries])

  const openEquationDialog = useCallback(
    (target?: SymbolEquationTarget | null) => {
      const nextTarget = target || lastFocusedTargetRef.current
      const targetId = nextTarget?.entryId || entries[0]?.id
      if (targetId) {
        setEditingLatexEntryId(null)
        setEquationTarget(nextTarget?.entryId ? nextTarget : { entryId: targetId, field: "latex" })
        return
      }
      setEditingLatexEntryId(null)
      setEquationTarget({ entryId: createId("symbol"), field: "latex" })
    },
    [entries],
  )

  useEffect(() => {
    if (!enableEquationShortcut) return
    const openEquation = (event: Event) => {
      const detail = (event as CustomEvent<{ nodeId: string }>).detail
      if (detail?.nodeId !== nodeId) return
      openEquationDialog(activeEquationTarget())
    }
    window.addEventListener(openSymbolEquationEvent, openEquation)
    return () => window.removeEventListener(openSymbolEquationEvent, openEquation)
  }, [enableEquationShortcut, nodeId, openEquationDialog])

  const confirmEquation = (latex: string) => {
    const target = equationTarget
    setEquationTarget(null)
    setEditingLatexEntryId(null)
    if (!target?.entryId) return

    const existing = entries.find((entry) => entry.id === target.entryId)
    if (existing) {
      if (target.field === "meaning") {
        const start = Math.max(0, Math.min(target.selectionStart ?? existing.meaning.length, existing.meaning.length))
        const end = Math.max(start, Math.min(target.selectionEnd ?? start, existing.meaning.length))
        const inlineMath = `$${latex}$`
        const meaning = `${existing.meaning.slice(0, start)}${inlineMath}${existing.meaning.slice(end)}`
        commitEntries(updateEntry(entries, target.entryId, { meaning }))
        window.setTimeout(() => {
          const input = document.querySelector<HTMLInputElement>(`.symbols-meaning-input[data-symbol-id="${target.entryId}"]`)
          input?.focus()
          input?.setSelectionRange(start + inlineMath.length, start + inlineMath.length)
        }, 0)
        return
      }
      commitEntries(updateEntry(entries, target.entryId, { latex }))
    } else {
      commitEntries([...entries, createSymbolEntry(latex, "", target.entryId)])
    }
    window.setTimeout(() => {
      document.querySelector<HTMLInputElement>(`.symbols-meaning-input[data-symbol-id="${target.entryId}"]`)?.focus()
    }, 0)
  }

  return (
    <div className="symbols-editor">
      {entries.length === 0 ? <div className="symbols-empty-state">No symbols yet.</div> : null}
      {sortedEntries.map((entry) => (
        <div key={entry.id} className="symbols-editor-row" data-symbol-row-id={entry.id}>
          <label className="symbols-editor-field">
            <span>LaTeX</span>
            {editingLatexEntryId === entry.id ? (
              <input
                className="field-input symbols-latex-input"
                data-symbol-id={entry.id}
                value={entry.latex}
                spellCheck={false}
                onFocus={(event) => rememberFocusedTarget(entry.id, "latex", event.currentTarget)}
                onSelect={(event) => rememberFocusedTarget(entry.id, "latex", event.currentTarget)}
                onBlur={() => setEditingLatexEntryId(null)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === "Escape") {
                    event.preventDefault()
                    event.currentTarget.blur()
                  }
                }}
                onChange={(event) => commitEntries(updateEntry(entries, entry.id, { latex: event.target.value }))}
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
                  rememberFocusedTarget(entry.id, "latex")
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
              onFocus={(event) => rememberFocusedTarget(entry.id, "meaning", event.currentTarget)}
              onClick={(event) => rememberFocusedTarget(entry.id, "meaning", event.currentTarget)}
              onKeyUp={(event) => rememberFocusedTarget(entry.id, "meaning", event.currentTarget)}
              onSelect={(event) => rememberFocusedTarget(entry.id, "meaning", event.currentTarget)}
              onChange={(event) => commitEntries(updateEntry(entries, entry.id, { meaning: event.target.value }))}
            />
          </label>
          <button
            type="button"
            className="symbols-delete-button"
            aria-label="Delete symbol"
            title="Delete symbol"
            onClick={() => commitEntries(entries.filter((item) => item.id !== entry.id))}
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
        open={Boolean(equationTarget)}
        title={equationTarget?.field === "meaning" ? "Meaning symbol" : "Symbol equation"}
        initialLatex={equationTarget?.field === "latex" ? equationTargetEntry?.latex || "" : ""}
        displayMode={false}
        confirmLabel={equationTarget?.field === "latex" && equationTargetEntry?.latex ? "Update" : "Insert"}
        submitOnEnter
        onCancel={() => setEquationTarget(null)}
        onConfirm={confirmEquation}
      />
    </div>
  )
}
