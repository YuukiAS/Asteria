export const blockSizeLimits = {
  minWidth: 220,
  maxWidth: 860,
  minHeight: 160,
  maxHeight: 720,
} as const

export const blockSizePresets = {
  small: { label: "Small", width: 260, height: 180 },
  medium: { label: "Medium", width: 340, height: 220 },
  large: { label: "Large", width: 480, height: 320 },
} as const

export type BlockSizePreset = keyof typeof blockSizePresets
export type BlockSize = Pick<(typeof blockSizePresets)[BlockSizePreset], "width" | "height">

export const blockHeaderHeight = 36
export const blockPreviewHorizontalPadding = 24
export const blockPreviewVerticalPadding = 16
export const blockFitExtraPadding = 12
