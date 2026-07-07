import katex from "katex"
import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"

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
    const trimmed = latex.trim()
    if (!trimmed) return { isValid: true, html: "" }

    try {
      return {
        isValid: true,
        html: katex.renderToString(trimmed, { displayMode, throwOnError: true, strict: false }),
      }
    } catch {
      return { isValid: false, html: "" }
    }
  }, [displayMode, latex])

  if (!open || typeof document === "undefined") return null

  const submit = () => {
    const trimmed = latex.trim()
    if (trimmed && preview.isValid) onConfirm(trimmed)
  }

  return createPortal(
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
          <div
            className={`equation-dialog-preview ${preview.isValid ? "" : "equation-dialog-preview-invalid"}`}
            aria-live="polite"
          >
            {preview.isValid ? (
              preview.html ? (
                <div dangerouslySetInnerHTML={{ __html: preview.html }} />
              ) : (
                <span className="equation-dialog-preview-placeholder">Preview</span>
              )
            ) : (
              <span className="equation-dialog-invalid-text">Invalid equation</span>
            )}
          </div>
        </div>
        <div className="equation-dialog-actions">
          <button
            type="submit"
            className="primary-button"
            disabled={!latex.trim() || !preview.isValid}
          >
            Insert
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
