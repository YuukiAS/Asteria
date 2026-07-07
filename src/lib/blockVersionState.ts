import { allVersionsId, defaultVariantKey } from "../constants/versioning"
import type { BlockData, BlockVariantKey, ModelVersion, ResolvedVariantState, VersionVariantRow } from "../types/map"

export function versionLabel(version?: ModelVersion, fallback = "Version") {
  return version?.label || fallback
}

export function versionShortLabel(version?: ModelVersion, index?: number, fallback = "V") {
  if (version?.shortLabel) return version.shortLabel
  if (index !== undefined && index >= 0) return `${fallback}${index + 1}`
  return version?.label || fallback
}

export function hasBaseVariant(data: BlockData) {
  return Boolean(data.variants?.[defaultVariantKey])
}

function modelVersionIndex(modelVersions: ModelVersion[], versionId?: string) {
  return modelVersions.findIndex((version) => version.id === versionId)
}

function versionById(modelVersions: ModelVersion[], versionId?: string) {
  return modelVersions.find((version) => version.id === versionId)
}

function ownVersionIds(data: BlockData, modelVersions: ModelVersion[]) {
  return modelVersions.filter((version) => Boolean(data.variants?.[version.id])).map((version) => version.id)
}

function findNearestOwnVersion(data: BlockData, modelVersions: ModelVersion[], requestedIndex: number) {
  for (let index = requestedIndex; index >= 0; index -= 1) {
    const version = modelVersions[index]
    if (version && data.variants?.[version.id]) return version
  }
  return undefined
}

function resolveRequestedVariantKey(activeVersionId: string, modelVersions: ModelVersion[], fixedVariantKey?: BlockVariantKey) {
  if (fixedVariantKey && fixedVariantKey !== defaultVariantKey && modelVersions.some((version) => version.id === fixedVariantKey)) {
    return fixedVariantKey
  }
  return activeVersionId !== allVersionsId && modelVersions.some((version) => version.id === activeVersionId) ? activeVersionId : defaultVariantKey
}

function resolveForVersion(data: BlockData, requestedVariantKey: BlockVariantKey, modelVersions: ModelVersion[], isAuto: boolean): ResolvedVariantState {
  const availableVersionIds = ownVersionIds(data, modelVersions)
  const requestedIndex = modelVersionIndex(modelVersions, requestedVariantKey)
  const requestedVersion = versionById(modelVersions, requestedVariantKey)
  const requestedShortLabel = requestedVersion ? versionShortLabel(requestedVersion, requestedIndex) : undefined
  const modeLabel = isAuto ? "AUTO" : "FIXED"

  if (requestedVariantKey === defaultVariantKey || requestedIndex < 0) {
    const isHidden = !hasBaseVariant(data) && !data.title
    const renderedLabel = hasBaseVariant(data) ? "Base" : "Hidden"
    return {
      availableVersionIds,
      hasRequestedVariant: hasBaseVariant(data),
      isAuto,
      isFallbackToBase: false,
      isFallbackToDefault: false,
      isHidden,
      isFixed: !isAuto,
      modeLabel,
      renderedLabel,
      renderedVariantKey: hasBaseVariant(data) ? defaultVariantKey : undefined,
      requestedLabel: "AUTO",
      requestedVariantKey: defaultVariantKey,
      sourceKind: hasBaseVariant(data) ? "base" : "hidden",
      tooltip: hasBaseVariant(data) ? `Showing base content via ${modeLabel}.` : `No content is available via ${modeLabel}.`,
    }
  }

  const ownVariant = data.variants?.[requestedVariantKey]
  if (ownVariant) {
    const renderedLabel = versionLabel(requestedVersion, requestedVariantKey)
    return {
      availableVersionIds,
      hasRequestedVariant: true,
      isAuto,
      isFallbackToBase: false,
      isFallbackToDefault: false,
      isHidden: false,
      isFixed: !isAuto,
      modeLabel,
      renderedLabel,
      renderedVariantKey: requestedVariantKey,
      renderedVersion: requestedVersion,
      requestedLabel: renderedLabel,
      requestedShortLabel,
      requestedVariantKey,
      requestedVersion,
      sourceKind: "own",
      tooltip: `${requestedShortLabel || renderedLabel} has its own content. Showing ${renderedLabel} via ${modeLabel}.`,
    }
  }

  const inheritedFromVersion = findNearestOwnVersion(data, modelVersions, requestedIndex - 1)
  if (inheritedFromVersion) {
    const inheritedIndex = modelVersionIndex(modelVersions, inheritedFromVersion.id)
    const inheritedShortLabel = versionShortLabel(inheritedFromVersion, inheritedIndex)
    return {
      availableVersionIds,
      hasRequestedVariant: false,
      inheritedFromVersion,
      inheritedFromVersionId: inheritedFromVersion.id,
      inheritedFromVersionLabel: inheritedFromVersion.label,
      inheritedFromVersionShortLabel: inheritedShortLabel,
      isAuto,
      isFallbackToBase: false,
      isFallbackToDefault: false,
      isHidden: false,
      isFixed: !isAuto,
      modeLabel,
      renderedLabel: inheritedFromVersion.label,
      renderedVariantKey: inheritedFromVersion.id,
      renderedVersion: inheritedFromVersion,
      requestedLabel: versionLabel(requestedVersion, requestedVariantKey),
      requestedShortLabel,
      requestedVariantKey,
      requestedVersion,
      sourceKind: "inherited",
      tooltip: `${requestedShortLabel || requestedVariantKey} inherits from ${inheritedShortLabel}. Editing creates an own ${requestedShortLabel || "version"} copy.`,
    }
  }

  if (hasBaseVariant(data)) {
    return {
      availableVersionIds,
      hasRequestedVariant: false,
      isAuto,
      isFallbackToBase: true,
      isFallbackToDefault: true,
      isHidden: false,
      isFixed: !isAuto,
      modeLabel,
      renderedLabel: "Base",
      renderedVariantKey: defaultVariantKey,
      requestedLabel: versionLabel(requestedVersion, requestedVariantKey),
      requestedShortLabel,
      requestedVariantKey,
      requestedVersion,
      sourceKind: "base",
      tooltip: `${requestedShortLabel || requestedVariantKey} uses base content because no earlier own version exists.`,
    }
  }

  return {
    availableVersionIds,
    hasRequestedVariant: false,
    isAuto,
    isFallbackToBase: false,
    isFallbackToDefault: false,
    isHidden: true,
    isFixed: !isAuto,
    modeLabel,
    renderedLabel: "Hidden",
    requestedLabel: versionLabel(requestedVersion, requestedVariantKey),
    requestedShortLabel,
    requestedVariantKey,
    requestedVersion,
    sourceKind: "hidden",
    tooltip: `${requestedShortLabel || requestedVariantKey} is hidden because this block has no content at or before that version.`,
  }
}

export function resolveBlockVersionState(data: BlockData, activeVersionId: string, modelVersions: ModelVersion[]): ResolvedVariantState {
  const fixedVariantKey =
    data.activeVariantKey && data.activeVariantKey !== defaultVariantKey && modelVersions.some((version) => version.id === data.activeVariantKey)
      ? data.activeVariantKey
      : undefined
  const requestedVariantKey = resolveRequestedVariantKey(activeVersionId, modelVersions, fixedVariantKey)
  return resolveForVersion(data, requestedVariantKey, modelVersions, !fixedVariantKey)
}

export function resolveBlockVersionRows(data: BlockData, modelVersions: ModelVersion[]): VersionVariantRow[] {
  return modelVersions.map((version, index) => {
    const state = resolveForVersion(data, version.id, modelVersions, true)
    const versionShort = versionShortLabel(version, index)
    const inheritedShort = state.inheritedFromVersion ? versionShortLabel(state.inheritedFromVersion, modelVersionIndex(modelVersions, state.inheritedFromVersion.id)) : undefined
    const statusLabel =
      state.sourceKind === "own"
        ? "Own"
        : state.sourceKind === "inherited"
          ? `Inherits ${inheritedShort}`
          : state.sourceKind === "base"
            ? "Base"
            : "Hidden"
    return {
      version,
      versionLabel: version.label,
      versionShortLabel: versionShort,
      sourceKind: state.sourceKind,
      statusLabel,
      renderedVariantKey: state.renderedVariantKey,
      inheritedFromVersion: state.inheritedFromVersion,
      tooltip: state.tooltip,
    }
  })
}
