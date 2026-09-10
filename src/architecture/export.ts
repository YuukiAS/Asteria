import { generateArchitectureOutline } from "./outline"
import { validateArchitectureProject, type ArchitectureValidationOptions } from "./validation"
import type { ArchitectureProjectV2, SemanticLayer, StatisticalEntity } from "./types"

function escapeCell(value: unknown) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ").trim()
}

function latexInline(value: string | undefined) {
  return value ? `$${value}$` : ""
}

function relationText(project: ArchitectureProjectV2, entityId: string) {
  return Object.values(project.relations)
    .filter((relation) => relation.sourceId === entityId || relation.targetId === entityId)
    .map((relation) => {
      const source = project.entities[relation.sourceId]?.label || relation.sourceId
      const target = project.entities[relation.targetId]?.label || relation.targetId
      return `${source} --${relation.type}--> ${target}`
    })
}

function entityDefinition(entity: StatisticalEntity) {
  return entity.definition || entity.description || "UNRESOLVED: no definition recorded."
}

export function exportArchitectureMarkdown(project: ArchitectureProjectV2, options: { variantId?: string; diffSummary?: string } = {}) {
  const variant = options.variantId ? project.variants[options.variantId] : Object.values(project.variants)[0]
  const outline = generateArchitectureOutline(project)
  const validation = validateArchitectureProject(project)
  const lines: string[] = []
  lines.push(`# ${project.project.title}`)
  lines.push("")
  lines.push(`Scope: ${project.project.sourceSchema}.`)
  lines.push(`Selected canonical model variant: ${variant?.label || "not specified"}.`)
  lines.push("")
  lines.push("## Model Purpose")
  lines.push("")
  lines.push(project.project.title.includes("CAT-TRACE") ? "CAT-TRACE Frozen V2 separates finite catalogue identity from catalogue-external open-tail discovery while preserving TRACE-style open-tail calibration." : "Original TRACE models an open-ended species response list through latent probit occurrence and calibrated tail intercepts.")
  lines.push("")
  lines.push("## Architecture Layers")
  outline.sections.forEach((section) => {
    lines.push("")
    lines.push(`### ${section.label}`)
    section.entityIds.forEach((entityId) => {
      const entity = project.entities[entityId]
      if (!entity) return
      const symbols = (entity.symbolIds || []).map((symbolId) => project.symbols[symbolId]).filter(Boolean)
      const symbolText = symbols.map((symbol) => latexInline(symbol.latex)).filter(Boolean).join(", ")
      lines.push(`- **${entity.label}**${symbolText ? ` ${symbolText}` : ""}: ${entityDefinition(entity)}`)
      if (entity.constraints?.length) lines.push(`  - Constraints: ${entity.constraints.join("; ")}`)
    })
  })
  lines.push("")
  lines.push("## Canonical Symbols")
  lines.push("")
  lines.push("| Symbol | Meaning | Layer | Definition source |")
  lines.push("|---|---|---|---|")
  const seen = new Set<string>()
  Object.values(project.symbols).forEach((symbol) => {
    const dedupeKey = `${symbol.modelScopeId || ""}:${symbol.latex}`
    if (seen.has(dedupeKey)) return
    seen.add(dedupeKey)
    lines.push(`| ${escapeCell(latexInline(symbol.latex))} | ${escapeCell(symbol.meaning)} | ${escapeCell(symbol.layer)} | ${escapeCell(symbol.definitionRef)} |`)
  })
  lines.push("")
  lines.push("## Relations")
  Object.values(project.entities).forEach((entity) => {
    const relations = relationText(project, entity.id)
    if (!relations.length) return
    lines.push("")
    lines.push(`### ${entity.label}`)
    relations.forEach((relation) => lines.push(`- ${relation}`))
  })
  lines.push("")
  lines.push("## Assumptions And Constraints")
  const constrained = Object.values(project.entities).filter((entity) => entity.constraints?.length || entity.layer === "assumption")
  if (constrained.length) constrained.forEach((entity) => lines.push(`- **${entity.label}**: ${(entity.constraints || [entity.description || "assumption"]).join("; ")}`))
  else lines.push("- No explicit assumptions or constraints recorded.")
  lines.push("")
  lines.push("## Validation Warnings")
  if (validation.length) validation.forEach((warning) => lines.push(`- [${warning.severity}] ${warning.message}`))
  else lines.push("- None.")
  if (options.diffSummary) {
    lines.push("")
    lines.push("## Semantic Diff Summary")
    lines.push(options.diffSummary)
  }
  return `${lines.join("\n")}\n`
}

export function exportArchitectureJsonV2(project: ArchitectureProjectV2, options: ArchitectureValidationOptions = {}) {
  return JSON.stringify({ ...project, validationWarnings: validateArchitectureProject(project, options) }, null, 2)
}

export function entitiesByLayer(project: ArchitectureProjectV2, layer: SemanticLayer) {
  return Object.values(project.entities).filter((entity) => entity.layer === layer)
}
