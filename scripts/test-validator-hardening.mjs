import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { inspectProtectedTruth } from "./lib/protected-truth.mjs"
import { measureRouteGestalt } from "./lib/route-gestalt.mjs"

const cases = []

function check(name, run) {
  run()
  cases.push(name)
}

check("geometry-good-no-conflict", () => {
  const result = measureRouteGestalt({
    edges: [
      { sourceId: "a", targetId: "b", points: [{ x: 0, y: 0 }, { x: 100, y: 0 }] },
      { sourceId: "c", targetId: "d", points: [{ x: 0, y: 40 }, { x: 100, y: 40 }] },
    ],
    floatingLabels: [],
  })
  assert.equal(result.measurement.routeRatio, "observed")
  assert.equal(result.measurement.avoidableEdgeCrossing, "observed")
  assert.equal(result.avoidableEdgeCrossingCount, 0)
  assert.equal(result.floatingRelationLabelCount, 0)
  assert.equal(result.simpleArchEdgeMaxRouteRatio, 1)
})

check("geometry-bad-crossing-and-floating-label", () => {
  const result = measureRouteGestalt({
    edges: [
      { sourceId: "a", targetId: "b", points: [{ x: 0, y: 0 }, { x: 100, y: 100 }] },
      { sourceId: "c", targetId: "d", points: [{ x: 0, y: 100 }, { x: 100, y: 0 }] },
    ],
    floatingLabels: [{ visible: true, placement: "path_annotation" }],
  })
  assert.equal(result.avoidableEdgeCrossingCount, 1)
  assert.equal(result.floatingRelationLabelCount, 1)
})

check("geometry-missing-edge-measurement", () => {
  const result = measureRouteGestalt({ edges: [{ sourceId: "a", targetId: "b" }] })
  assert.equal(result.measurement.edgeSet, "observed")
  assert.equal(result.measurement.routeRatio, "missing")
  assert.equal(result.simpleArchEdgeMaxRouteRatio, null)
  assert.equal(result.avoidableEdgeCrossingCount, null)
  assert.equal(result.measurement.floatingRelationLabel, "missing")
})

check("geometry-invalid-nan", () => {
  const result = measureRouteGestalt({ edges: [{ points: [{ x: 0, y: 0 }, { x: Number.NaN, y: 1 }] }], floatingLabels: [] })
  assert.equal(result.measurement.routeRatio, "invalid_nan")
  assert.equal(result.nanEdgeGeometryCount, 1)
  assert.equal(result.simpleArchEdgeMaxRouteRatio, null)
})

check("geometry-invalid-infinity", () => {
  const result = measureRouteGestalt({ edges: [{ points: [{ x: 0, y: 0 }, { x: Number.POSITIVE_INFINITY, y: 1 }] }], floatingLabels: [] })
  assert.equal(result.measurement.routeRatio, "invalid_infinite")
  assert.equal(result.infiniteEdgeGeometryCount, 1)
  assert.equal(result.simpleArchEdgeMaxRouteRatio, null)
})

check("geometry-no-edge-data", () => {
  const result = measureRouteGestalt({ edges: [], floatingLabels: [] })
  assert.equal(result.measurement.edgeSet, "no_data")
  assert.equal(result.measurement.routeRatio, "not_applicable")
  assert.equal(result.measurement.avoidableEdgeCrossing, "not_applicable")
  assert.equal(result.simpleArchEdgeMaxRouteRatio, null)
})

check("geometry-shared-endpoint-and-stable-relation-column", () => {
  const result = measureRouteGestalt({
    edges: [
      { sourceId: "shared", targetId: "b", points: [{ x: 0, y: 50 }, { x: 100, y: 100 }] },
      { sourceId: "shared", targetId: "c", points: [{ x: 0, y: 50 }, { x: 100, y: 0 }] },
    ],
    floatingLabels: [{ visible: true, placement: "stable_relation_column" }],
  })
  assert.equal(result.eligibleEdgePairCount, 0)
  assert.equal(result.measurement.avoidableEdgeCrossing, "not_applicable")
  assert.equal(result.avoidableEdgeCrossingCount, null)
  assert.equal(result.floatingRelationLabelCount, 0)
})

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim()
}

async function withTemporaryRepository(run) {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "asteria-validator-hardening-"))
  try {
    git(cwd, ["init", "--quiet"])
    git(cwd, ["config", "user.email", "validator@example.invalid"])
    git(cwd, ["config", "user.name", "Asteria Validator"])
    const protectedPath = "src/architecture/trace.ts"
    await fs.mkdir(path.dirname(path.join(cwd, protectedPath)), { recursive: true })
    await fs.writeFile(path.join(cwd, protectedPath), "export const trace = 'baseline'\n")
    git(cwd, ["add", protectedPath])
    git(cwd, ["commit", "--quiet", "-m", "baseline"])
    const baselineRef = git(cwd, ["rev-parse", "HEAD"])
    await run({ cwd, baselineRef, protectedPath })
  } finally {
    await fs.rm(cwd, { recursive: true, force: true })
  }
}

await withTemporaryRepository(async ({ cwd, baselineRef, protectedPath }) => {
  const result = inspectProtectedTruth({ cwd, baselineRef, paths: [protectedPath] })
  assert.equal(result.status, "unchanged")
  cases.push("protected-truth-clean")
})

await withTemporaryRepository(async ({ cwd, baselineRef, protectedPath }) => {
  await fs.writeFile(path.join(cwd, protectedPath), "export const trace = 'unstaged'\n")
  const result = inspectProtectedTruth({ cwd, baselineRef, paths: [protectedPath] })
  assert.deepEqual(result.scopes.unstaged, [protectedPath])
  cases.push("protected-truth-unstaged")
})

await withTemporaryRepository(async ({ cwd, baselineRef, protectedPath }) => {
  await fs.writeFile(path.join(cwd, protectedPath), "export const trace = 'staged'\n")
  git(cwd, ["add", protectedPath])
  const result = inspectProtectedTruth({ cwd, baselineRef, paths: [protectedPath] })
  assert.deepEqual(result.scopes.staged, [protectedPath])
  cases.push("protected-truth-staged")
})

await withTemporaryRepository(async ({ cwd, baselineRef, protectedPath }) => {
  await fs.writeFile(path.join(cwd, protectedPath), "export const trace = 'committed'\n")
  git(cwd, ["add", protectedPath])
  git(cwd, ["commit", "--quiet", "-m", "candidate"])
  const result = inspectProtectedTruth({ cwd, baselineRef, paths: [protectedPath] })
  assert.deepEqual(result.scopes.committed, [protectedPath])
  cases.push("protected-truth-committed")
})

await withTemporaryRepository(async ({ cwd, protectedPath }) => {
  const result = inspectProtectedTruth({ cwd, baselineRef: "missing-approved-baseline", paths: [protectedPath] })
  assert.equal(result.status, "baseline_missing")
  cases.push("protected-truth-baseline-missing")
})

console.log(JSON.stringify({ status: "validator-hardening-controls-pass", caseCount: cases.length, cases }, null, 2))
