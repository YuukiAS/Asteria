import { cloneArchitectureProjectV2 } from "../schema"
import type { ArchitectureProjectV2, ArchitectureViewKind, RelationType, SemanticLayer, StatisticalEntity, TypedRelation } from "../types"
import { catTraceFrozenV2Project } from "./canonicalTraceFixtures"

const at = "2026-09-10T00:00:00.000Z"

export const multiViewIds = {
  architecture: "view:architecture",
  lineage: "view:lineage",
  evidence: "view:evidence",
} as const

export type MultiViewId = (typeof multiViewIds)[keyof typeof multiViewIds]

type EntitySeed = {
  id: string
  kind: StatisticalEntity["kind"]
  label: string
  layer?: SemanticLayer
  role: string
  description: string
  definition?: string
  observedStatus?: StatisticalEntity["observedStatus"]
  constraints?: string[]
  variantNote?: string
}

type RelationSeed = {
  id: string
  type: RelationType
  sourceId: string
  targetId: string
  label: string
}

function provenance(note: string) {
  return [{ source: "fixture" as const, sourceId: "cat-trace-multiview", note }]
}

function addEntity(project: ArchitectureProjectV2, seed: EntitySeed) {
  project.entities[seed.id] = {
    id: seed.id,
    kind: seed.kind,
    label: seed.label,
    layer: seed.layer || "validation",
    role: seed.role,
    description: seed.description,
    definition: seed.definition,
    observedStatus: seed.observedStatus || "not_applicable",
    constraints: seed.constraints,
    variantNote: seed.variantNote,
    provenance: provenance("G06 multi-view canonical seed."),
  }
}

function addRelation(project: ArchitectureProjectV2, seed: RelationSeed) {
  project.relations[seed.id] = {
    id: seed.id,
    type: seed.type,
    sourceId: seed.sourceId,
    targetId: seed.targetId,
    directed: true,
    label: seed.label,
    provenance: provenance("G06 multi-view relation seed."),
  }
}

function projection(id: string, entityId: string, x: number, y: number, width = 190, height = 84) {
  return {
    id,
    entityId,
    position: { x, y },
    size: { width, height },
  }
}

const viewPositions: Partial<Record<MultiViewId, Record<string, { x: number; y: number; width?: number }>>> = {
  [multiViewIds.lineage]: {
    "entity:lineage:hmsc": { x: 160, y: 72 },
    "entity:lineage:trace": { x: 160, y: 220 },
    "entity:lineage:bigmvp": { x: 160, y: 382 },
    "entity:lineage:mgp": { x: 168, y: 520 },
    "entity:lineage:cat-trace": { x: 620, y: 292, width: 220 },
  },
  [multiViewIds.evidence]: {
    "entity:evidence:proof:trace-reference": { x: 430, y: 70 },
    "entity:evidence:claim:tail-calibration": { x: 560, y: 214 },
    "entity:evidence:claim:open-tail-response": { x: 560, y: 360 },
    "entity:evidence:claim:zero-slots": { x: 440, y: 530 },
    "entity:evidence:implementation:fixtures": { x: 150, y: 590 },
    "entity:evidence:stress:g05": { x: 760, y: 590 },
    "entity:evidence:data:finland": { x: 930, y: 168 },
    "entity:evidence:data:malagasy": { x: 150, y: 360 },
    "entity:evidence:data:swa-plants": { x: 930, y: 690 },
    "entity:evidence:limitation:real-data": { x: 930, y: 298 },
    "entity:evidence:claim:marked-discovery": { x: 930, y: 498 },
  },
}

function makeView(id: MultiViewId, kind: ArchitectureViewKind, label: string, entityIds: string[], columns = 3): ArchitectureProjectV2["views"][string] {
  const projections: ArchitectureProjectV2["views"][string]["projections"] = {}
  entityIds.forEach((entityId, index) => {
    const position = viewPositions[id]?.[entityId] || { x: (index % columns) * 230, y: Math.floor(index / columns) * 138 }
    projections[`projection:${id}:${index}`] = projection(`projection:${id}:${index}`, entityId, position.x, position.y, position.width)
  })
  return {
    id,
    kind,
    label,
    projectedEntityIds: entityIds,
    projections,
    viewport: { x: 0, y: 0, zoom: 1 },
    filters: { variantId: "cat-trace-frozen-v2" },
  }
}

const catArchitectureEntity = "entity:cat-trace-frozen-v2:betaU_gh"
const gammaEntity = "entity:cat-trace-frozen-v2:gamma_g"
const pEntity = "entity:cat-trace-frozen-v2:p_g"

export const crossViewLinks: Record<string, Partial<Record<"architecture" | "lineage" | "evidence", string>>> = {
  [catArchitectureEntity]: { lineage: "entity:lineage:cat-trace", evidence: "entity:evidence:claim:open-tail-response" },
  [gammaEntity]: { lineage: "entity:lineage:trace", evidence: "entity:evidence:claim:tail-calibration" },
  [pEntity]: { evidence: "entity:evidence:claim:zero-slots" },
  "entity:lineage:cat-trace": { architecture: catArchitectureEntity, evidence: "entity:evidence:claim:open-tail-response" },
  "entity:lineage:trace": { architecture: gammaEntity, evidence: "entity:evidence:claim:tail-calibration" },
  "entity:evidence:claim:open-tail-response": { architecture: catArchitectureEntity, lineage: "entity:lineage:cat-trace" },
  "entity:evidence:claim:tail-calibration": { architecture: gammaEntity, lineage: "entity:lineage:trace" },
  "entity:evidence:claim:zero-slots": { architecture: pEntity },
}

export function createCatTraceMultiViewProject() {
  const project = cloneArchitectureProjectV2(catTraceFrozenV2Project)
  project.project = {
    ...project.project,
    id: "project:cat-trace-web-rc",
    title: "CAT-TRACE Frozen V2 Web RC",
    updatedAt: at,
  }
  project.updatedAt = at

  const lineageEntities: EntitySeed[] = [
    { id: "entity:lineage:trace", kind: "paper", label: "TRACE / Infinite JSDM", role: "method source", description: "Open-ended species response model with TRACE-calibrated tail intercepts.", observedStatus: "fixed" },
    { id: "entity:lineage:hmsc", kind: "method", label: "HMSC framework", role: "interpretation source", description: "Hierarchical modelling language for community ecology covariate, trait, and latent factor interpretation.", observedStatus: "fixed" },
    { id: "entity:lineage:bigmvp", kind: "method", label: "bigMVP", role: "computational inspiration", description: "High-dimensional multivariate binary response computation informing scalable probit implementation concerns.", observedStatus: "fixed" },
    { id: "entity:lineage:mgp", kind: "prior", label: "Sparse Bayesian infinite factor / MGP", role: "methodological component", description: "Shrinkage idea for residual factor structure; not a third Asteria model variant.", observedStatus: "fixed" },
    { id: "entity:lineage:cat-trace", kind: "method", label: "CAT-TRACE Frozen V2", role: "selected method", description: "Catalogue-aware TRACE extension that preserves open-tail calibration while separating finite catalogue identity from anonymous discovery.", observedStatus: "fixed", variantNote: "Not a mechanical TRACE + HMSC merge." },
  ]

  const evidenceEntities: EntitySeed[] = [
    { id: "entity:evidence:claim:tail-calibration", kind: "claim", label: "Open-tail calibration is TRACE-preserving", role: "claim", description: "CAT-TRACE keeps TRACE extreme-value calibration on group open-tail intercepts.", observedStatus: "derived" },
    { id: "entity:evidence:claim:open-tail-response", kind: "claim", label: "Open-tail response decomposition is explicit", role: "claim", description: "The open-tail slope uses beta^U_gh = nu + a_g + v^U_gh with nu as environment-response vector.", observedStatus: "derived" },
    { id: "entity:evidence:claim:zero-slots", kind: "claim", label: "Zero slots remain model information", role: "claim", description: "p_g-p_g^* anonymous zero slots are retained as likelihood information rather than discarded as empty UI rows.", observedStatus: "derived" },
    { id: "entity:evidence:claim:marked-discovery", kind: "claim", label: "Marked discovery theorem", role: "claim", description: "Future marked-discovery distributional theorem remains an open item.", observedStatus: "not_applicable", constraints: ["pending theorem"] },
    { id: "entity:evidence:proof:trace-reference", kind: "proof", label: "TRACE proof reference", role: "theory/proof evidence", description: "Original TRACE source supports tail calibration semantics used by the open-tail component.", observedStatus: "fixed" },
    { id: "entity:evidence:implementation:fixtures", kind: "implementation", label: "Asteria implementation fixtures", role: "implementation evidence", description: "Regression fixtures validate canonical symbols, semantic diff, export, and V1 migration.", observedStatus: "observed" },
    { id: "entity:evidence:stress:g05", kind: "result", label: "G05 stress fixture", role: "performance evidence", description: "Synthetic graph benchmark covers large entity/relation indexing, trace, and layer projection operations.", observedStatus: "observed" },
    { id: "entity:evidence:data:finland", kind: "dataset", label: "Finland fungi", role: "first-paper dataset", description: "Recognized first-paper data line; current Web RC does not mark it as empirical support without a linked result.", observedStatus: "fixed" },
    { id: "entity:evidence:data:malagasy", kind: "dataset", label: "Malagasy arthropods", role: "first-paper dataset", description: "Recognized first-paper data line; current Web RC keeps result status pending.", observedStatus: "fixed" },
    { id: "entity:evidence:data:swa-plants", kind: "dataset", label: "South-West Australia plants", role: "first-paper dataset", description: "Recognized first-paper data line using taxonomy-derived relatedness, not branch-length C_phy.", observedStatus: "fixed" },
    { id: "entity:evidence:limitation:real-data", kind: "limitation", label: "Real-data closure gap", role: "limitation", description: "No final real-data result is claimed in the first Web RC evidence seed.", observedStatus: "not_applicable" },
  ]

  ;[...lineageEntities, ...evidenceEntities].forEach((entity) => addEntity(project, entity))

  const lineageRelations: RelationSeed[] = [
    { id: "relation:lineage:trace-cat", type: "extends", sourceId: "entity:lineage:trace", targetId: "entity:lineage:cat-trace", label: "extends open-tail calibration" },
    { id: "relation:lineage:trace-preserve", type: "preserves", sourceId: "entity:lineage:trace", targetId: "entity:lineage:cat-trace", label: "preserves marginal probit tail semantics" },
    { id: "relation:lineage:hmsc-cat", type: "borrows_interpretation_from", sourceId: "entity:lineage:hmsc", targetId: "entity:lineage:cat-trace", label: "borrows ecological hierarchy interpretation" },
    { id: "relation:lineage:bigmvp-cat", type: "computationally_inspired_by", sourceId: "entity:lineage:bigmvp", targetId: "entity:lineage:cat-trace", label: "computationally inspired by scalable probit work" },
    { id: "relation:lineage:mgp-cat", type: "uses_methodological_component_from", sourceId: "entity:lineage:mgp", targetId: "entity:lineage:cat-trace", label: "uses factor shrinkage idea" },
  ]

  const evidenceRelations: RelationSeed[] = [
    { id: "relation:evidence:proof-tail", type: "theoretically_supports", sourceId: "entity:evidence:proof:trace-reference", targetId: "entity:evidence:claim:tail-calibration", label: "theory/proof support" },
    { id: "relation:evidence:fixture-response", type: "validates_implementation", sourceId: "entity:evidence:implementation:fixtures", targetId: "entity:evidence:claim:open-tail-response", label: "fixture validates symbol truth" },
    { id: "relation:evidence:stress-zero", type: "stress_tests", sourceId: "entity:evidence:stress:g05", targetId: "entity:evidence:claim:zero-slots", label: "stress-tests zero-slot projection" },
    { id: "relation:evidence:realdata-gap-tail", type: "limited_by", sourceId: "entity:evidence:limitation:real-data", targetId: "entity:evidence:claim:tail-calibration", label: "real-data result pending" },
    { id: "relation:evidence:finland-pending", type: "pending", sourceId: "entity:evidence:data:finland", targetId: "entity:evidence:claim:tail-calibration", label: "dataset line pending result" },
    { id: "relation:evidence:malagasy-pending", type: "pending", sourceId: "entity:evidence:data:malagasy", targetId: "entity:evidence:claim:open-tail-response", label: "dataset line pending result" },
    { id: "relation:evidence:swa-pending", type: "pending", sourceId: "entity:evidence:data:swa-plants", targetId: "entity:evidence:claim:zero-slots", label: "dataset line pending result" },
    { id: "relation:evidence:marked-pending", type: "pending", sourceId: "entity:evidence:claim:marked-discovery", targetId: "entity:evidence:limitation:real-data", label: "future theorem pending" },
  ]

  ;[...lineageRelations, ...evidenceRelations].forEach((relation) => addRelation(project, relation))

  project.views[multiViewIds.lineage] = makeView(multiViewIds.lineage, "lineage", "Lineage", lineageEntities.map((entity) => entity.id), 3)
  project.views[multiViewIds.evidence] = makeView(multiViewIds.evidence, "evidence", "Evidence", evidenceEntities.map((entity) => entity.id), 3)
  project.views[multiViewIds.architecture] = {
    ...project.views[multiViewIds.architecture],
    viewport: { x: -80, y: -40, zoom: 0.92 },
  }

  return project
}

export const catTraceMultiViewProject = createCatTraceMultiViewProject()

export function projectedEntities(project: ArchitectureProjectV2, viewId: MultiViewId) {
  const view = project.views[viewId]
  return (view?.projectedEntityIds || []).map((entityId) => project.entities[entityId]).filter((entity): entity is StatisticalEntity => Boolean(entity))
}

export function searchCanonicalEntities(project: ArchitectureProjectV2, query: string, scopeViewId?: MultiViewId) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []
  const scope = scopeViewId ? new Set(project.views[scopeViewId]?.projectedEntityIds || []) : undefined
  return Object.values(project.entities)
    .filter((entity) => !scope || scope.has(entity.id))
    .filter((entity) => `${entity.label} ${entity.description || ""} ${entity.definition || ""} ${entity.role || ""}`.toLowerCase().includes(normalized))
}

export function evidenceClosureWarnings(project: ArchitectureProjectV2) {
  const supportTypes = new Set<RelationType>(["theoretically_supports", "empirically_tests", "validated_on", "validates_implementation", "stress_tests", "supports", "tests"])
  const pendingTypes = new Set<RelationType>(["pending", "limited_by", "contradicts_or_challenges", "contradicts"])
  return Object.values(project.entities)
    .filter((entity) => entity.kind === "claim" || entity.role?.includes("claim"))
    .map((claim) => {
      const incoming = Object.values(project.relations).filter((relation) => relation.targetId === claim.id)
      const supportCount = incoming.filter((relation) => supportTypes.has(relation.type)).length
      const gapCount = incoming.filter((relation) => pendingTypes.has(relation.type)).length + (claim.constraints?.some((item) => item.includes("pending")) ? 1 : 0)
      return { claimId: claim.id, label: claim.label, supportCount, gapCount, status: supportCount > 0 && gapCount === 0 ? "supported" : supportCount > 0 ? "supported_with_limits" : "pending" }
    })
}
