import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { imageLinkLabelFromUrl, normalizeImageLinkUrl } from "../lib/imageLinks"

type ImageLinkDialogProps = {
  open: boolean
  initialHref?: string
  onCancel: () => void
  onConfirm: (href: string) => void
}

function ImagePreview({ href, label }: { href: string; label: string }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [href])

  if (failed) return <span className="equation-dialog-invalid-text">Image unavailable</span>
  return <img src={href} alt={label} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
}

export function ImageLinkDialog({ open, initialHref = "", onCancel, onConfirm }: ImageLinkDialogProps) {
  const [href, setHref] = useState(initialHref || "https://")

  useEffect(() => {
    if (open) setHref(initialHref || "https://")
  }, [initialHref, open])

  const normalizedHref = useMemo(() => normalizeImageLinkUrl(href), [href])
  const trimmedHref = href.trim()
  const previewLabel = normalizedHref ? imageLinkLabelFromUrl(normalizedHref) : "Image preview"
  const isEmpty = !trimmedHref || trimmedHref === "https://"
  const isInvalid = Boolean(trimmedHref) && !isEmpty && !normalizedHref

  if (!open || typeof document === "undefined") return null

  const submit = () => {
    if (normalizedHref) onConfirm(normalizedHref)
  }

  return createPortal(
    <div className="equation-dialog-backdrop" role="presentation" onClick={onCancel}>
      <form
        className="equation-dialog image-link-dialog nodrag nopan nowheel"
        role="dialog"
        aria-modal="true"
        aria-label="Image link"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <div className="equation-dialog-header">
          <h2>Image link</h2>
          <button type="button" className="toolbar-button !h-7" onClick={onCancel}>
            Cancel
          </button>
        </div>
        <div className="equation-dialog-body image-link-dialog-body">
          <label className="field-label min-w-0">
            Link
            <input
              className="image-link-dialog-input"
              value={href}
              onChange={(event) => setHref(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
                  event.preventDefault()
                  submit()
                }
                if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                  event.preventDefault()
                  submit()
                }
              }}
              autoFocus
              spellCheck={false}
              placeholder="https://example.com/image.png"
            />
          </label>
          <div className={`equation-dialog-preview image-link-dialog-preview ${isInvalid ? "equation-dialog-preview-invalid" : ""}`} aria-live="polite">
            {normalizedHref ? (
              <ImagePreview href={normalizedHref} label={previewLabel} />
            ) : isInvalid ? (
              <span className="equation-dialog-invalid-text">Use an http or https image URL</span>
            ) : (
              <span className="equation-dialog-preview-placeholder">Preview</span>
            )}
          </div>
        </div>
        <div className="equation-dialog-actions">
          <button type="submit" className="primary-button" disabled={!normalizedHref}>
            Insert
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
