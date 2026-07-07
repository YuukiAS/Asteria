export const textPalette = [
  "#111827",
  "#374151",
  "#6b7280",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
] as const

export const backgroundPalette = [
  "#ffffff",
  "#f9fafb",
  "#fef3c7",
  "#ffedd5",
  "#dbeafe",
  "#dcfce7",
  "#ede9fe",
  "#fce7f3",
  "#fee2e2",
  "#e5e7eb",
] as const

export const defaultBlockColors = {
  background: "#ffffff",
  text: "#111827",
  border: "#cbd5e1",
  edge: "#94a3b8",
}

export const blockTypeColors = {
  generic: { background: "#ffffff", border: "#cbd5e1" },
  definition: { background: "#f9fafb", border: "#cbd5e1" },
  notation: { background: "#fef3c7", border: "#eab308" },
  model: { background: "#fff7ed", border: "#fb923c" },
  prior: { background: "#fef3c7", border: "#facc15" },
  assumption: { background: "#f9fafb", border: "#9ca3af" },
  theorem: { background: "#ffedd5", border: "#f97316" },
  algorithm: { background: "#ede9fe", border: "#8b5cf6" },
  dataset: { background: "#dcfce7", border: "#22c55e" },
  result: { background: "#dbeafe", border: "#3b82f6" },
  reference: { background: "#f9fafb", border: "#6b7280" },
  remark: { background: "#fce7f3", border: "#ec4899" },
  example: { background: "#dbeafe", border: "#60a5fa" },
  warning: { background: "#fee2e2", border: "#ef4444" },
  todo: { background: "#ffffff", border: "#94a3b8" },
} as const
