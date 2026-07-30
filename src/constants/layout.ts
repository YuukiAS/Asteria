export const blockSizeLimits = {
  minWidth: 220,
  maxWidth: 860,
  minHeight: 160,
  maxHeight: 720,
} as const

export const blockSizePresets = {
  small: { label: "Small", width: 480, height: 280 },
  medium: { label: "Medium", width: 640, height: 360 },
  large: { label: "Large", width: 820, height: 500 },
} as const

export type BlockSizePreset = keyof typeof blockSizePresets
export type BlockSize = Pick<(typeof blockSizePresets)[BlockSizePreset], "width" | "height">

export const blockHeaderHeight = 36
export const blockPreviewHorizontalPadding = 24
export const blockPreviewVerticalPadding = 16
export const blockFitExtraPadding = 12
