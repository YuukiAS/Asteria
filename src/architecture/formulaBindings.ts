import type { ArchitectureProjectV2, FormulaBinding } from "./types"

export function resolveFormulaBinding(project: ArchitectureProjectV2, binding: FormulaBinding) {
  if (binding.unresolved) return undefined
  return project.symbols[binding.symbolId]
}

export function renameSymbolDisplay(project: ArchitectureProjectV2, symbolId: string, latex: string): ArchitectureProjectV2 {
  const symbol = project.symbols[symbolId]
  if (!symbol) return project
  return {
    ...project,
    symbols: {
      ...project.symbols,
      [symbolId]: { ...symbol, latex },
    },
  }
}
