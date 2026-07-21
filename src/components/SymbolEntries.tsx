import { Plus, Trash2 } from "lucide-react"
import { useCallback, useEffect } from "react"
import { insertSymbolEntryEvent } from "../lib/inlineEditEvents"
import { renderSymbolLatexHtml, sortedSymbolEntries } from "../lib/symbolEntries"
import { createId } from "../lib/ids"
import { nowIso } from "../lib/time"
import type { SymbolEntry } from "../types/map"

type SymbolEntriesPreviewProps = {
  entries?: SymbolEntry[]
}

type SymbolEntriesEditorProps = {
  entries?: SymbolEntry[]
  nodeId: string
  onChange: (entries: SymbolEntry[]) => void
}

function updateEntry(entries: SymbolEntry[], id: string, patch: Partial<Pick<SymbolEntry, "latex" | "meaning">>) {
  const updatedAt = nowIso()
  return entries.map((entry) => (entry.id === id ? { ...entry, ...patch, updatedAt } : entry))
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

export function SymbolEntriesEditor({ entries = [], nodeId, onChange }: SymbolEntriesEditorProps) {
  const addEntry = useCallback(() => {
    const at = nowIso()
    const entryId = createId("symbol")
    onChange([
      ...entries,
      {
        id: entryId,
        latex: "",
        meaning: "",
        createdAt: at,
        updatedAt: at,
      },
    ])
    window.setTimeout(() => {
      document.querySelector<HTMLInputElement>(`.symbols-latex-input[data-symbol-id="${entryId}"]`)?.focus()
    }, 0)
  }, [entries, onChange])

  useEffect(() => {
    const insertEntry = (event: Event) => {
      const detail = (event as CustomEvent<{ nodeId: string }>).detail
      if (detail?.nodeId !== nodeId) return
      addEntry()
    }
    window.addEventListener(insertSymbolEntryEvent, insertEntry)
    return () => window.removeEventListener(insertSymbolEntryEvent, insertEntry)
  }, [addEntry, nodeId])

  return (
    <div className="symbols-editor">
      {entries.length === 0 ? <div className="symbols-empty-state">No symbols yet.</div> : null}
      {entries.map((entry) => (
        <div key={entry.id} className="symbols-editor-row">
          <label className="symbols-editor-field">
            <span>LaTeX</span>
            <input
              className="field-input symbols-latex-input"
              data-symbol-id={entry.id}
              value={entry.latex}
              spellCheck={false}
              onChange={(event) => onChange(updateEntry(entries, entry.id, { latex: event.target.value }))}
            />
          </label>
          <div className="symbols-editor-preview" dangerouslySetInnerHTML={{ __html: renderSymbolLatexHtml(entry.latex) || "&nbsp;" }} />
          <label className="symbols-editor-field">
            <span>Meaning</span>
            <input
              className="field-input"
              value={entry.meaning}
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
    </div>
  )
}
