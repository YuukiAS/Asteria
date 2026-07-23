import { useMemo, useState, type CSSProperties, type FocusEvent, type PointerEvent } from "react"
import { writeStyledMathClipboardFromSelection } from "../editor/mathPasteHandler"
import { imageLinkLabelFromUrl, normalizeImageLinkSize, normalizeImageLinkUrl, type ImageLinkReference } from "../lib/imageLinks"
import { stripScriptTags } from "../lib/sanitize"

type RichTextPreviewProps = {
  html?: string
  color?: string
  accentColor?: string
  imagePreviewMode?: "none" | "hover" | "inline"
}

type HoverPreviewState = ImageLinkReference & {
  left: number
  top: number
}

function ImageLinkImage({ link }: { link: ImageLinkReference }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <span className="rich-image-link-error">Image unavailable</span>
  return <img src={link.href} alt={link.label} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max))
}

function imageLinkFromAnchor(anchor: HTMLAnchorElement): ImageLinkReference | undefined {
  if (anchor.dataset.asteriaImageLink !== "true") return undefined
  const href = normalizeImageLinkUrl(anchor.href || anchor.getAttribute("href") || "")
  if (!href) return undefined
  return {
    href,
    label: anchor.textContent?.trim() || imageLinkLabelFromUrl(href),
    size: normalizeImageLinkSize(anchor.dataset.asteriaImageSize),
  }
}

function collectImageLinksFromHtml(safeHtml: string): ImageLinkReference[] {
  if (typeof window === "undefined" || typeof window.DOMParser === "undefined") return []
  const document = new window.DOMParser().parseFromString(safeHtml, "text/html")
  return Array.from(document.querySelectorAll<HTMLAnchorElement>('a[data-asteria-image-link="true"]'))
    .map(imageLinkFromAnchor)
    .filter((link): link is ImageLinkReference => Boolean(link))
}

function hoverStateForAnchor(anchor: HTMLAnchorElement, link: ImageLinkReference): HoverPreviewState {
  const rect = anchor.getBoundingClientRect()
  const previewWidth = Math.min(320, window.innerWidth - 24)
  const previewHeight = 250
  const belowTop = rect.bottom + 8
  const aboveTop = rect.top - previewHeight - 8
  return {
    ...link,
    left: clamp(rect.left, 12, window.innerWidth - previewWidth - 12),
    top: belowTop + previewHeight <= window.innerHeight - 12 ? belowTop : clamp(aboveTop, 12, window.innerHeight - previewHeight - 12),
  }
}

export function RichTextPreview({ html, color, accentColor, imagePreviewMode = "hover" }: RichTextPreviewProps) {
  const [hoverPreview, setHoverPreview] = useState<HoverPreviewState>()
  const safeHtml = useMemo(() => stripScriptTags(html || "<p>Empty block</p>"), [html])
  const inlineImageLinks = useMemo(() => (imagePreviewMode === "inline" ? collectImageLinksFromHtml(safeHtml) : []), [imagePreviewMode, safeHtml])

  const showHoverPreview = (target: EventTarget | null) => {
    if (imagePreviewMode !== "hover" || !(target instanceof Element)) return
    const anchor = target.closest<HTMLAnchorElement>('a[data-asteria-image-link="true"]')
    if (!anchor) return
    const link = imageLinkFromAnchor(anchor)
    if (!link) return
    setHoverPreview(hoverStateForAnchor(anchor, link))
  }

  const handlePointerOver = (event: PointerEvent<HTMLDivElement>) => showHoverPreview(event.target)
  const handlePointerLeave = () => setHoverPreview(undefined)
  const handleFocus = (event: FocusEvent<HTMLDivElement>) => showHoverPreview(event.target)
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setHoverPreview(undefined)
  }

  return (
    <>
      <div
        className="rich-preview"
        style={{ color, "--asteria-rich-accent-color": accentColor } as CSSProperties}
        onCopy={(event) => writeStyledMathClipboardFromSelection(event.nativeEvent)}
        onCut={(event) => writeStyledMathClipboardFromSelection(event.nativeEvent)}
        onPointerOver={handlePointerOver}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
      {hoverPreview ? (
        <div className="rich-image-link-popover" style={{ left: hoverPreview.left, top: hoverPreview.top }} role="tooltip">
          <ImageLinkImage link={hoverPreview} />
          <div className="rich-image-link-caption">{hoverPreview.label}</div>
        </div>
      ) : null}
      {inlineImageLinks.length ? (
        <div className="rich-image-link-inline-list">
          {inlineImageLinks.map((link, index) => (
            <a key={`${link.href}-${index}`} className="rich-image-link-inline-card" href={link.href} target="_blank" rel="noreferrer">
              <ImageLinkImage link={link} />
              <span className="rich-image-link-caption">{link.label}</span>
            </a>
          ))}
        </div>
      ) : null}
    </>
  )
}
