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
