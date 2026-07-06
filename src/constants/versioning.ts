import type { ActiveVersionId, BlockDisplayMode, DisplayModeOverride } from "../types/map"

export const allVersionsId: ActiveVersionId = "all"
export const commonVariantKey = "common"
export const maxModelVersions = 5
export const snapGridSize = 8
export const microStraightenTolerance = 10

export const displayModeOptions = [
  { value: "block", label: "Auto" },
  { value: "full", label: "Full" },
  { value: "compact", label: "Compact" },
  { value: "title_only", label: "Title" },
] as const satisfies ReadonlyArray<{ value: DisplayModeOverride; label: string }>

export const blockDisplayModeOptions = [
  { value: "full", label: "Full" },
  { value: "compact", label: "Compact" },
  { value: "title_only", label: "Title only" },
] as const satisfies ReadonlyArray<{ value: BlockDisplayMode; label: string }>
