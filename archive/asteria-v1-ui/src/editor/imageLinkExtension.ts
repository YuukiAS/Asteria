import Link from "@tiptap/extension-link"
import { defaultImageLinkSize, imageLinkSizeAttribute, normalizeImageLinkSize } from "../lib/imageLinks"

export const ImageLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      asteriaImageLink: {
        default: null,
        parseHTML: (element) => (element.getAttribute("data-asteria-image-link") === "true" ? "true" : null),
        renderHTML: (attributes) => (attributes.asteriaImageLink === "true" ? { "data-asteria-image-link": "true" } : {}),
      },
      asteriaImageSize: {
        default: null,
        parseHTML: (element) => {
          if (element.getAttribute("data-asteria-image-link") !== "true") return null
          return normalizeImageLinkSize(element.getAttribute(imageLinkSizeAttribute))
        },
        renderHTML: (attributes) =>
          attributes.asteriaImageLink === "true" ? { [imageLinkSizeAttribute]: normalizeImageLinkSize(attributes.asteriaImageSize || defaultImageLinkSize) } : {},
      },
    }
  },
})
