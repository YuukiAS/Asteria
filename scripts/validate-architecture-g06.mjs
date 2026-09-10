import { createServer } from "vite"

function fail(message) {
  console.error(message)
  process.exitCode = 1
}

function assert(condition, message) {
  if (!condition) fail(message)
}

const vite = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "silent",
})

try {
  const [{ catTraceMultiViewProject, crossViewLinks, evidenceClosureWarnings, multiViewIds, projectedEntities, searchCanonicalEntities }, { validateArchitectureProject }] =
    await Promise.all([vite.ssrLoadModule("/src/architecture/fixtures/multiViewTraceProject.ts"), vite.ssrLoadModule("/src/architecture/validation.ts")])

  const project = catTraceMultiViewProject
  const architecture = project.views[multiViewIds.architecture]
  const lineage = project.views[multiViewIds.lineage]
  const evidence = project.views[multiViewIds.evidence]
  const catArchitectureEntity = project.entities["entity:cat-trace-frozen-v2:betaU_gh"]
  const catLineageEntity = project.entities["entity:lineage:cat-trace"]
  const openTailClaim = project.entities["entity:evidence:claim:open-tail-response"]
  const evidenceLabels = projectedEntities(project, multiViewIds.evidence).map((entity) => entity.label).join("\n")
  const lineageLabels = projectedEntities(project, multiViewIds.lineage).map((entity) => entity.label).join("\n")
  const relationTypes = new Set(Object.values(project.relations).map((relation) => relation.type))
  const closure = evidenceClosureWarnings(project)
  const warnings = validateArchitectureProject(project)

  assert(Boolean(architecture && lineage && evidence), "Architecture, Lineage, and Evidence views must all exist.")
  assert(architecture.id !== lineage.id && lineage.id !== evidence.id, "Views must have independent identities.")
  assert(lineage.projectedEntityIds.length < architecture.projectedEntityIds.length, "Lineage should not project all architecture micro-symbols.")
  assert(evidence.projectedEntityIds.length < architecture.projectedEntityIds.length, "Evidence should not project all architecture micro-symbols.")
  assert(catArchitectureEntity.definition.includes("beta^U_gh = nu + a_g + v^U_gh"), "Shared architecture entity definition must remain canonical.")
  assert(catLineageEntity.variantNote.includes("Not a mechanical"), "Lineage inspector should reject mechanical TRACE + HMSC framing.")
  assert(openTailClaim.role === "claim", "Evidence center should be a claim entity.")
  for (const required of ["extends", "preserves", "borrows_interpretation_from", "computationally_inspired_by", "uses_methodological_component_from"]) {
    assert(relationTypes.has(required), `Missing Lineage relation type ${required}.`)
  }
  for (const required of ["theoretically_supports", "validates_implementation", "stress_tests", "limited_by", "pending"]) {
    assert(relationTypes.has(required), `Missing Evidence relation type ${required}.`)
  }
  for (const requiredName of ["TRACE / Infinite JSDM", "HMSC framework", "bigMVP", "Sparse Bayesian infinite factor / MGP", "CAT-TRACE Frozen V2"]) {
    assert(lineageLabels.includes(requiredName), `Lineage seed missing ${requiredName}.`)
  }
  for (const requiredName of ["Finland fungi", "Malagasy arthropods", "South-West Australia plants"]) {
    assert(evidenceLabels.includes(requiredName), `Evidence seed missing first-paper data line ${requiredName}.`)
  }
  assert(!evidenceLabels.includes("GSMc"), "GSMc must not enter the first-paper main Evidence chain.")
  assert(crossViewLinks["entity:lineage:cat-trace"].architecture === "entity:cat-trace-frozen-v2:betaU_gh", "CAT-TRACE Lineage should link back into Architecture.")
  assert(crossViewLinks["entity:evidence:claim:open-tail-response"].lineage === "entity:lineage:cat-trace", "Open-tail claim should link back into Lineage.")
  assert(searchCanonicalEntities(project, "Finland", undefined).some((entity) => entity.id === "entity:evidence:data:finland"), "All-graph search should find Finland fungi.")
  assert(closure.some((item) => item.label.includes("Marked discovery") && item.status === "pending"), "Marked discovery theorem should stay pending.")
  assert(closure.some((item) => item.label.includes("Open-tail response") && item.supportCount > 0), "Open-tail response claim should have implementation evidence.")
  assert(!warnings.some((warning) => warning.rule === "claim-without-evidence"), "Evidence claims should be connected to evidence or explicit gaps.")

  if (!process.exitCode) {
    console.log(
      JSON.stringify(
        {
          status: "validated",
          architectureEntities: architecture.projectedEntityIds.length,
          lineageEntities: lineage.projectedEntityIds.length,
          evidenceEntities: evidence.projectedEntityIds.length,
          closure,
        },
        null,
        2,
      ),
    )
  }
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await vite.close()
  process.exit(process.exitCode ?? 0)
}
