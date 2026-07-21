export const blockConnectionHandleIds = ["top", "right", "bottom", "left"] as const

export type BlockConnectionHandleId = (typeof blockConnectionHandleIds)[number]

export function isBlockConnectionHandleId(value: unknown): value is BlockConnectionHandleId {
  return typeof value === "string" && (blockConnectionHandleIds as readonly string[]).includes(value)
}
