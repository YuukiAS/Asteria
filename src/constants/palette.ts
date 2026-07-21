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
  "#fffbeb",
  "#fef9c3",
  "#ffedd5",
  "#fff7ed",
  "#fffaf0",
  "#dbeafe",
  "#dcfce7",
  "#ecfeff",
  "#f3e8ff",
  "#f5f3ff",
  "#fce7f3",
  "#fee2e2",
  "#e0f2fe",
] as const

export const defaultBlockColors = {
  background: "#ffffff",
  text: "#111827",
  border: "#cbd5e1",
  edge: "#94a3b8",
}

export const blockTypeColors = {
  generic: { background: "#ffffff", border: "#d1d5db" },
  definition: { background: "#fff7ed", border: "#fed7aa" },
  notation: { background: "#fef9c3", border: "#fde68a" },
  symbol: { background: "#fffbeb", border: "#fbbf24" },
  model: { background: "#fffaf0", border: "#fdba74" },
  prior: { background: "#eef2ff", border: "#a5b4fc" },
  assumption: { background: "#f5f3ff", border: "#ddd6fe" },
  theorem: { background: "#ffedd5", border: "#fb923c" },
  algorithm: { background: "#f3e8ff", border: "#c084fc" },
  dataset: { background: "#ecfeff", border: "#67e8f9" },
  result: { background: "#f1f5f9", border: "#cbd5e1" },
  reference: { background: "#f8fafc", border: "#cbd5e1" },
  remark: { background: "#fce7f3", border: "#f9a8d4" },
  example: { background: "#e0f2fe", border: "#7dd3fc" },
  warning: { background: "#fee2e2", border: "#fca5a5" },
  todo: { background: "#f9fafb", border: "#d1d5db" },
} as const
