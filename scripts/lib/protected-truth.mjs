import { execFileSync } from "node:child_process"

export const RC19_APPROVED_SCIENTIFIC_BASELINE = "193c033659a7612a99442763077217b130e9b756"

export const PROTECTED_TRUTH_PATHS = Object.freeze([
  "src/architecture/fixtures/canonicalTraceFixtures.ts",
  "src/architecture/fixtures/multiViewTraceProject.ts",
  "src/architecture/trace.ts",
  "src/architecture/session.tsx",
  "src/architecture/repositoryBridge.ts",
  "src/architecture/schema.ts",
  "src/architecture/validation.ts",
])

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim()
}

function refExists(cwd, ref) {
  try {
    git(cwd, ["rev-parse", "--verify", `${ref}^{commit}`])
    return true
  } catch {
    return false
  }
}

function lines(output) {
  return output.split("\n").map((line) => line.trim()).filter(Boolean)
}

export function inspectProtectedTruth({ cwd = process.cwd(), baselineRef = RC19_APPROVED_SCIENTIFIC_BASELINE, candidateRef = "HEAD", paths = PROTECTED_TRUTH_PATHS } = {}) {
  if (!refExists(cwd, baselineRef)) {
    return { status: "baseline_missing", baselineRef, candidateRef, changedFiles: [], scopes: {} }
  }
  if (!refExists(cwd, candidateRef)) {
    return { status: "candidate_missing", baselineRef, candidateRef, changedFiles: [], scopes: {} }
  }

  const pathspec = ["--", ...paths]
  const scopes = {
    committed: lines(git(cwd, ["diff", "--name-only", baselineRef, candidateRef, ...pathspec])),
    staged: lines(git(cwd, ["diff", "--cached", "--name-only", candidateRef, ...pathspec])),
    unstaged: lines(git(cwd, ["diff", "--name-only", ...pathspec])),
    untracked: lines(git(cwd, ["ls-files", "--others", "--exclude-standard", ...pathspec])),
  }
  const changedFiles = [...new Set(Object.values(scopes).flat())].sort()
  return {
    status: changedFiles.length ? "changed" : "unchanged",
    baselineRef,
    candidateRef: git(cwd, ["rev-parse", candidateRef]),
    changedFiles,
    scopes,
  }
}
