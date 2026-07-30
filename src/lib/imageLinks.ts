import type { JSONContent } from "@tiptap/react"

export const imageLinkAttribute = "data-asteria-image-link"
export const imageLinkSizeAttribute = "data-asteria-image-size"
export const defaultImageLinkSize = "medium"

export type ImageLinkSize = "medium"

export type ImageLinkReference = {
  href: string
  label: string
  size: ImageLinkSize
}

const previewableImagePathPattern = /\.(png|jpe?g|gif|webp|svg)$/i
const previewableImageQueryNames = new Set(["content-type", "ext", "fm", "format", "mime", "type"])
const previewableImageQueryValuePattern = /^(?:image\/)?(?:png|jpe?g|gif|webp|svg(?:\+xml)?)$/i
const googleImageThumbnailHostPattern = /^encrypted-tbn\d*\.gstatic\.com$/i

export function normalizeImageLinkUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  try {
    const url = new URL(trimmed)
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined
    return url.href
  } catch {
    return undefined
  }
}

export function normalizeImageLinkSize(value: unknown): ImageLinkSize {
  return value === "medium" ? "medium" : defaultImageLinkSize
}

export function isPreviewableImageUrl(value: string) {
  const href = normalizeImageLinkUrl(value)
  if (!href) return false
  try {
    const url = new URL(href)
    const pathname = decodeURIComponent(url.pathname)
    if (previewableImagePathPattern.test(pathname)) return true
    for (const [name, queryValue] of url.searchParams) {
      if (previewableImageQueryNames.has(name.toLowerCase()) && previewableImageQueryValuePattern.test(queryValue.trim())) return true
    }
    return googleImageThumbnailHostPattern.test(url.hostname) && /^\/images?$/i.test(pathname) && url.searchParams.has("q")
  } catch {
    return false
  }
}

export function imageLinkReferenceFromUrl(href: string, label?: string, size: unknown = defaultImageLinkSize): ImageLinkReference | undefined {
  const normalizedHref = normalizeImageLinkUrl(href)
  if (!normalizedHref) return undefined
  return {
    href: normalizedHref,
    label: label?.trim() || imageLinkLabelFromUrl(normalizedHref),
    size: normalizeImageLinkSize(size),
  }
}

export function imageLinkReferenceFromAnchorParts({
  href,
  label,
  asteriaImageLink,
  asteriaImageSize,
  includePreviewableImageUrls = false,
}: {
  href: string
  label?: string
  asteriaImageLink?: unknown
  asteriaImageSize?: unknown
  includePreviewableImageUrls?: boolean
}) {
  if (asteriaImageLink !== "true" && (!includePreviewableImageUrls || !isPreviewableImageUrl(href))) return undefined
  return imageLinkReferenceFromUrl(href, label, asteriaImageSize)
}

export function imageLinkLabelFromUrl(href: string) {
  try {
    const url = new URL(href)
    const lastPathPart = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() || "").trim()
    return lastPathPart || url.hostname || "Image"
  } catch {
    return "Image"
  }
}

export function imageLinkInsertionTextFromUrl(href: string) {
  const label = imageLinkLabelFromUrl(href)
  return label === "Image" ? label : `Image: ${label}`
}

export function markdownImageAlt(value: string) {
  return (value || "Image").replace(/[\[\]\n\r]/g, " ").replace(/\s+/g, " ").trim() || "Image"
}

export function extractImageLinksFromContent(contentJson?: JSONContent): ImageLinkReference[] {
  if (!contentJson) return []
  const references: ImageLinkReference[] = []

  const visit = (node: JSONContent) => {
    if (node.type === "text" && node.marks?.length) {
      node.marks.forEach((mark) => {
        if (mark.type !== "link" || mark.attrs?.asteriaImageLink !== "true") return
        const href = normalizeImageLinkUrl(String(mark.attrs.href || ""))
        if (!href) return
        references.push({
          href,
          label: (node.text || "").trim() || imageLinkLabelFromUrl(href),
          size: normalizeImageLinkSize(mark.attrs.asteriaImageSize),
        })
      })
    }
    node.content?.forEach(visit)
  }

  visit(contentJson)
  return references
}
