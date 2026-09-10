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
  const [{ canonicalTraceProjects }, { directTraceForSymbol }, { serializeArchitectureProjectV2, parseArchitectureProjectV2 }, { renameSymbolDisplay, resolveFormulaBinding }] = await Promise.all([
    vite.ssrLoadModule("/src/architecture/fixtures/canonicalTraceFixtures.ts"),
    vite.ssrLoadModule("/src/architecture/trace.ts"),
    vite.ssrLoadModule("/src/architecture/schema.ts"),
    vite.ssrLoadModule("/src/architecture/formulaBindings.ts"),
  ])
  const original = canonicalTraceProjects["original-trace"]
  const cat = canonicalTraceProjects["cat-trace-frozen-v2"]
  assert(original && cat, "Expected both canonical projects to load.")

  const originalText = JSON.stringify(original)
  for (const forbidden of ["c(f)", "a_g", "pi_g", "p_g^*", "nu_g", "mathcal K"]) {
    assert(!originalText.includes(forbidden), `Original TRACE fixture must not include CAT-TRACE-only notation ${forbidden}.`)
  }
  for (const required of ["symbol:original-trace:beta_j", "symbol:original-trace:p", "symbol:original-trace:gamma"]) {
    assert(original.symbols[required], `Original TRACE missing ${required}.`)
  }
  assert(directTraceForSymbol(original, "symbol:original-trace:beta_j").downstreamEntityIds.has("entity:original-trace:z_ij"), "Expected beta_j downstream z_ij trace.")
  assert(directTraceForSymbol(original, "symbol:original-trace:gamma").downstreamEntityIds.has("entity:original-trace:mu_p_gamma"), "Expected gamma to calibrate mu_p(gamma).")

  const betaTrace = directTraceForSymbol(cat, "symbol:cat-trace-frozen-v2:betaU_gh")
  assert(betaTrace.upstreamEntityIds.has("entity:cat-trace-frozen-v2:nu"), "beta^U_gh missing upstream nu.")
  assert(betaTrace.upstreamEntityIds.has("entity:cat-trace-frozen-v2:a_g"), "beta^U_gh missing upstream a_g.")
  assert(betaTrace.upstreamEntityIds.has("entity:cat-trace-frozen-v2:vU_gh"), "beta^U_gh missing upstream v^U_gh.")
  assert(betaTrace.downstreamEntityIds.has("entity:cat-trace-frozen-v2:zU_igh"), "beta^U_gh missing downstream z^U_igh.")

  const gammaTrace = directTraceForSymbol(cat, "symbol:cat-trace-frozen-v2:gamma_g")
  assert(gammaTrace.upstreamEntityIds.has("entity:cat-trace-frozen-v2:gamma0"), "gamma_g missing gamma_0 upstream.")
  assert(gammaTrace.upstreamEntityIds.has("entity:cat-trace-frozen-v2:pi_g"), "gamma_g missing pi_g upstream.")
  assert(cat.entities["entity:cat-trace-frozen-v2:gamma_g"].definition === "gamma_g = gamma_0*pi_g", "gamma_g definition must be deterministic product.")
  assert(cat.entities["entity:cat-trace-frozen-v2:gamma_g"].constraints.includes("No independent prior"), "gamma_g must not have independent prior.")

  const pg = cat.entities["entity:cat-trace-frozen-v2:p_g"]
  assert(pg.observedStatus === "fixed", "p_g must be fixed.")
  assert(pg.constraints.includes("not estimand"), "p_g must be not estimand.")
  assert(pg.constraints.includes("not true unknown species count"), "p_g must not be true unknown species count.")

  const ag = cat.entities["entity:cat-trace-frozen-v2:a_g"]
  assert(ag.constraints.includes("sum_g a_g = 0"), "a_g must carry sum-to-zero constraint.")

  const sigma = cat.entities["entity:cat-trace-frozen-v2:Sigma_W"]
  assert(sigma.constraints.includes("diag(Sigma_W)=1"), "Sigma_W must carry unit diagonal.")
  assert(sigma.constraints.includes("only finite working set W"), "Sigma_W must be scoped to finite W.")
  assert(cat.symbols["symbol:cat-trace-frozen-v2:yU_igh"].indices.join(",") === "i,g,h", "Open-tail response index order must be i,g,h.")
  assert(cat.symbols["symbol:cat-trace-frozen-v2:nu"].meaning.includes("not an intercept"), "nu must not be global intercept.")

  for (const required of ["symbol:cat-trace-frozen-v2:p_g", "symbol:cat-trace-frozen-v2:p_g_star", "symbol:cat-trace-frozen-v2:gamma_g", "symbol:cat-trace-frozen-v2:Sigma_W", "symbol:cat-trace-frozen-v2:factor_index"]) {
    assert(cat.symbols[required], `CAT-TRACE missing ${required}.`)
  }

  const parsed = parseArchitectureProjectV2(JSON.parse(serializeArchitectureProjectV2(cat)))
  assert(parsed.symbols["symbol:cat-trace-frozen-v2:betaU_gh"].id === "symbol:cat-trace-frozen-v2:betaU_gh", "Expected symbol ID round-trip.")
  const renamed = renameSymbolDisplay(cat, "symbol:cat-trace-frozen-v2:betaU_gh", "\\tilde\\beta^{\\mathcal U}_{gh}")
  const binding = cat.entities["entity:cat-trace-frozen-v2:betaU_gh"].formulaBindings[0]
  assert(resolveFormulaBinding(renamed, binding).id === "symbol:cat-trace-frozen-v2:betaU_gh", "Formula binding must survive display rename.")
  assert(!resolveFormulaBinding(cat, { id: "binding:bad", formulaId: "formula:bad", fragment: "?", symbolId: "missing", unresolved: true }), "Unresolved token should remain safe.")

  if (!process.exitCode) console.log("Validated Original TRACE and CAT-TRACE Frozen V2 canonical fixtures and direct trace.")
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await vite.close()
  process.exit(process.exitCode ?? 0)
}
