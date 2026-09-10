import type { ArchitectureValidationWarning } from "./validationTypes"
import type { ArchitectureProjectV2, TypedRelation } from "./types"

export type ArchitectureValidationOptions = {
  pathExists?: (path: string) => boolean
}

function warning(id: string, message: string, extra: Partial<ArchitectureValidationWarning> = {}): ArchitectureValidationWarning {
  return { id, severity: "warning", message, rule: id.replace(/:.*/, ""), ...extra }
}

function relationTouches(relations: TypedRelation[], entityId: string, types?: string[]) {
  return relations.some((relation) => (relation.sourceId === entityId || relation.targetId === entityId) && (!types || types.includes(relation.type)))
}

export function validateArchitectureProject(project: ArchitectureProjectV2, options: ArchitectureValidationOptions = {}): ArchitectureValidationWarning[] {
  const warnings: ArchitectureValidationWarning[] = []
  const relations = Object.values(project.relations)
  const symbols = Object.values(project.symbols)

  relations.forEach((relation) => {
    if (!project.entities[relation.sourceId]) warnings.push(warning("missing-ref:source", `Relation ${relation.id} references missing source entity ${relation.sourceId}.`, { relationIds: [relation.id] }))
    if (!project.entities[relation.targetId]) warnings.push(warning("missing-ref:target", `Relation ${relation.id} references missing target entity ${relation.targetId}.`, { relationIds: [relation.id] }))
  })

  symbols.forEach((symbol) => {
    if (symbol.entityId && !project.entities[symbol.entityId]) warnings.push(warning("missing-ref:symbol-entity", `Symbol ${symbol.id} references missing entity ${symbol.entityId}.`, { entityIds: [symbol.entityId] }))
  })

  const symbolKeys = new Map<string, string>()
  symbols.forEach((symbol) => {
    const key = `${symbol.modelScopeId || "global"}:${symbol.scopeEntityId || "project"}:${symbol.latex}`
    const previous = symbolKeys.get(key)
    if (previous && project.symbols[previous]?.meaning !== symbol.meaning) warnings.push(warning("symbol-conflict", `Canonical symbol ${symbol.latex} has conflicting meanings in the same scope.`, { entityIds: [symbol.entityId || "", project.symbols[previous].entityId || ""].filter(Boolean) }))
    else symbolKeys.set(key, symbol.id)
  })

  Object.values(project.entities).forEach((entity) => {
    entity.formulaBindings?.forEach((binding) => {
      if (!binding.unresolved && !project.symbols[binding.symbolId]) warnings.push(warning("stale-formula-binding", `Formula binding ${binding.id} points to stale symbol ${binding.symbolId}.`, { entityIds: [entity.id] }))
    })
    if (entity.indices?.length && entity.dimension && /\^q\b/.test(entity.dimension) && !entity.indices.some((index) => index === "q")) {
      warnings.push(warning("dimension-index-mismatch", `${entity.label} declares dimension ${entity.dimension} without a matching q index/dimension note.`, { entityIds: [entity.id], layer: entity.layer }))
    }
    if (entity.observedStatus === "derived" && entity.definitionMode === "stochastic") {
      warnings.push(warning("derived-independent-prior", `${entity.label} is marked derived but also has an independent stochastic law.`, { entityIds: [entity.id], layer: entity.layer }))
    }
    if (!relationTouches(relations, entity.id) && !entity.constraints?.includes("ignore isolated")) {
      warnings.push(warning("isolated-object", `${entity.label} is not connected to any relation or target.`, { entityIds: [entity.id], layer: entity.layer }))
    }
    if ((entity.layer === "inference" || entity.role?.includes("estimator")) && !relationTouches(relations, entity.id, ["estimated_by", "targets", "predicts", "optimizes", "solves"])) {
      warnings.push(warning("estimator-without-target", `${entity.label} is an estimator/inference object without a target relation.`, { entityIds: [entity.id], layer: entity.layer }))
    }
    const isLikelihoodLike = entity.definitionMode === "stochastic" && (entity.layer === "latent" || entity.role?.includes("stochastic mechanism") || entity.role?.includes("latent variable"))
    if (isLikelihoodLike && !relations.some((relation) => relation.targetId === entity.id && project.entities[relation.sourceId]?.observedStatus === "observed")) {
      warnings.push(warning("likelihood-without-observed-input", `${entity.label} is stochastic but has no observed-data input relation.`, { entityIds: [entity.id], layer: entity.layer }))
    }
    if (entity.role?.includes("causal estimand") && !relationTouches(relations, entity.id, ["identified_by"])) {
      warnings.push(warning("causal-identification-missing", `${entity.label} is causal but lacks an identification condition link.`, { entityIds: [entity.id], layer: entity.layer }))
    }
    if (
      entity.role?.includes("claim") &&
      !relationTouches(relations, entity.id, [
        "supports",
        "tests",
        "validated_on",
        "theoretically_supports",
        "empirically_tests",
        "validates_implementation",
        "stress_tests",
        "pending",
        "limited_by",
        "contradicts_or_challenges",
      ])
    ) {
      warnings.push(warning("claim-without-evidence", `${entity.label} has no supporting/test/validation evidence relation.`, { entityIds: [entity.id], layer: entity.layer }))
    }
    if ((entity as { diffStatus?: string }).diffStatus === "modified" && entity.constraints?.includes("unchanged")) {
      warnings.push(warning("variant-diff-inconsistent", `${entity.label} has a modified definition but is still marked unchanged.`, { entityIds: [entity.id], layer: entity.layer }))
    }
    ;(entity as { codeBindings?: Array<{ path: string }> }).codeBindings?.forEach((binding) => {
      if (options.pathExists && !options.pathExists(binding.path)) warnings.push(warning("missing-code-binding", `${entity.label} code binding path does not exist: ${binding.path}.`, { entityIds: [entity.id], layer: entity.layer }))
    })
  })

  return warnings
}
