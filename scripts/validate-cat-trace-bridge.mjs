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
  const { parseRepositoryBridgeManifest, syntheticCatTraceRepositoryBridgeFixture, validateRepositoryBridgeManifest } = await vite.ssrLoadModule("/src/architecture/repositoryBridge.ts")

  const parsed = parseRepositoryBridgeManifest(syntheticCatTraceRepositoryBridgeFixture)
  assert(parsed.schemaId === "asteria.cat_trace.repository_bridge", "Bridge schema id must be frozen.")
  assert(parsed.schemaVersion === "0.1.0", "Bridge schema version must be 0.1.0.")
  assert(parsed.sourceRepository.owner === "YuukiAS", "Bridge fixture must bind to YuukiAS.")
  assert(parsed.sourceRepository.name === "CAT-TRACE", "Bridge fixture must bind to CAT-TRACE.")
  assert(parsed.sourceRepository.commit === "628ed400670140c8557234e5c49bf3526d241214", "Bridge fixture must pin current audited CAT-TRACE main commit.")
  assert(parsed.evidenceBoundary.implementationBindingIsScientificProof === false, "Implementation bindings must not be scientific proof.")
  assert(parsed.evidenceBoundary.codeDoesNotUpdateScientificTruth === true, "Bridge must not update scientific truth from code.")

  const states = new Set(parsed.bindings.map((binding) => binding.implementationState))
  assert(states.has("TESTED"), "Synthetic fixture must include tested bindings.")
  assert(parsed.bindings.some((binding) => binding.qualifiedName === "ct_probit_laplace"), "Fixture must cover C01 probit Laplace.")
  assert(parsed.bindings.some((binding) => binding.qualifiedName === "validate_cat_trace_data"), "Fixture must cover C02 synthetic data validation.")
  assert(parsed.bindings.some((binding) => binding.qualifiedName === "ref_ct_fit"), "Fixture must cover C04 reference fit.")
  assert(parsed.bindings.some((binding) => binding.entityId === "entity:cat-trace-frozen-v2:zero_slots"), "Fixture must bind zero-slot bookkeeping.")
  assert(parsed.statusObjects.some((status) => status.id === "cat-trace-c03-production" && status.implementationState === "BLOCKED"), "Fixture must honestly mark C03 blocked.")
  assert(parsed.statusObjects.some((status) => status.id === "cat-trace-zero-slot-production-integrator" && status.implementationState === "BLOCKED"), "Fixture must honestly mark zero-slot production blocker.")

  for (const binding of parsed.bindings) {
    assert(!binding.path.startsWith("/"), `Binding ${binding.id} path must not be absolute.`)
    assert(!binding.path.includes(".."), `Binding ${binding.id} path must not traverse upward.`)
    assert(!("span" in binding), `Binding ${binding.id} must not freeze line number as persistent identity.`)
  }

  const absolutePathProbe = structuredClone(syntheticCatTraceRepositoryBridgeFixture)
  absolutePathProbe.bindings[0] = { ...absolutePathProbe.bindings[0], path: "/home/yuukias/code/CAT-TRACE/package/TRACE/src/ct_math.cpp" }
  assert(!validateRepositoryBridgeManifest(absolutePathProbe).ok, "Validator must reject private absolute paths.")

  const proofProbe = structuredClone(syntheticCatTraceRepositoryBridgeFixture)
  proofProbe.evidenceBoundary = { ...proofProbe.evidenceBoundary, implementationBindingIsScientificProof: true }
  assert(!validateRepositoryBridgeManifest(proofProbe).ok, "Validator must reject manifests that treat implementation bindings as scientific proof.")

  if (!process.exitCode) {
    console.log(
      JSON.stringify(
        {
          status: "validated",
          schemaId: parsed.schemaId,
          schemaVersion: parsed.schemaVersion,
          sourceCommit: parsed.sourceRepository.commit,
          bindingCount: parsed.bindings.length,
          statusObjectCount: parsed.statusObjects.length,
          c03Status: parsed.statusObjects.find((status) => status.id === "cat-trace-c03-production")?.implementationState,
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
