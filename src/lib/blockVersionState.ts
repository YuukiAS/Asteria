import { allVersionsId, defaultVariantKey } from "../constants/versioning"
import type { BlockData, ModelVersion } from "../types/map"

export function versionLabel(version?: ModelVersion, fallback = "Version") {
  return version?.label || fallback
}

export function versionShortLabel(version?: ModelVersion) {
  return version?.shortLabel || version?.label || "V"
}

export function resolveBlockVersionState(data: BlockData, activeVersionId: string, modelVersions: ModelVersion[]) {
  const pinnedVariantKey = data.activeVariantKey && data.activeVariantKey !== defaultVariantKey ? data.activeVariantKey : undefined
  const isAuto = !pinnedVariantKey
  const modelVersionIds = new Set(modelVersions.map((version) => version.id))
  const requestedVariantKey = pinnedVariantKey || (activeVersionId !== allVersionsId && modelVersionIds.has(activeVersionId) ? activeVersionId : defaultVariantKey)
  const requestedVersion = modelVersions.find((version) => version.id === requestedVariantKey)
  const hasRequestedVariant = requestedVariantKey === defaultVariantKey || Boolean(data.variants?.[requestedVariantKey])
  const renderedVariantKey = hasRequestedVariant ? requestedVariantKey : defaultVariantKey
  const renderedVersion = modelVersions.find((version) => version.id === renderedVariantKey)
  const availableVersionIds = modelVersions.filter((version) => Boolean(data.variants?.[version.id])).map((version) => version.id)
  const availableLabels = modelVersions.filter((version) => availableVersionIds.includes(version.id)).map((version) => version.label)
  const isFallbackToDefault = requestedVariantKey !== defaultVariantKey && renderedVariantKey === defaultVariantKey
  const modeLabel = isAuto ? "AUTO" : "PINNED"
  const renderedLabel = renderedVariantKey === defaultVariantKey ? "Default" : versionLabel(renderedVersion)
  const requestedLabel = requestedVariantKey === defaultVariantKey ? "Default" : versionLabel(requestedVersion, requestedVariantKey)
  const variantSummary = availableLabels.length ? availableLabels.join(", ") : "none"
  const tooltip = isFallbackToDefault
    ? `Variants: ${variantSummary}. Showing: Default fallback because ${requestedLabel} is not available via ${modeLabel}.`
    : `Variants: ${variantSummary}. Showing: ${renderedLabel} via ${modeLabel}.`

  return {
    availableVersionIds,
    hasRequestedVariant,
    isAuto,
    isFallbackToDefault,
    isPinned: !isAuto,
    modeLabel,
    renderedLabel,
    renderedVariantKey,
    renderedVersion,
    requestedLabel,
    requestedVariantKey,
    requestedVersion,
    tooltip,
  }
}
