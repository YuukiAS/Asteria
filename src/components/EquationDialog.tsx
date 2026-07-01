import katex from "katex"
import { useEffect, useMemo, useState } from "react"

type EquationDialogProps = {
  open: boolean
  title?: string
  initialLatex?: string
  displayMode?: boolean
  onCancel: () => void
  onConfirm: (latex: string) => void
}

const defaultLatex =
  "\\begin{aligned}\ny_{ij} &= \\mathbb{I}(z_{ij}>0),\\\\\nz_{ij} &= \\alpha_j+x_i^\\top\\beta_j+\\varepsilon_{ij}.\n\\end{aligned}"

export function EquationDialog({
  open,
  title = "Block equation",
  initialLatex = defaultLatex,
  displayMode = true,
  onCancel,
  onConfirm,
}: EquationDialogProps) {
  const [latex, setLatex] = useState(initialLatex)

  useEffect(() => {
    if (open) setLatex(initialLatex || "")
  }, [initialLatex, open])

  const preview = useMemo(() => {
    try {
      return katex.renderToString(latex || "\\text{}", { displayMode, throwOnError: false, strict: false })
    } catch {
      return "<code>Invalid LaTeX</code>"
    }
  }, [displayMode, latex])

  if (!open) return null

  const submit = () => {
    const trimmed = latex.trim()
    if (trimmed) onConfirm(trimmed)
  }

  return (
    <div className="equation-dialog-backdrop" role="presentation" onClick={onCancel}>
      <form
        className="equation-dialog nodrag nopan nowheel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <div className="equation-dialog-header">
          <h2>{title}</h2>
          <button type="button" className="toolbar-button !h-7" onClick={onCancel}>
            Cancel
          </button>
        </div>
        <div className="equation-dialog-body">
          <label className="field-label min-w-0">
            LaTeX
            <textarea
              className="equation-dialog-textarea"
              value={latex}
              onChange={(event) => setLatex(event.target.value)}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                  event.preventDefault()
                  submit()
                }
              }}
              autoFocus
            />
          </label>
          <div className="equation-dialog-preview" dangerouslySetInnerHTML={{ __html: preview }} />
        </div>
        <div className="equation-dialog-actions">
          <button
            type="submit"
            className="primary-button"
            disabled={!latex.trim()}
          >
            Insert
          </button>
        </div>
      </form>
    </div>
  )
}
