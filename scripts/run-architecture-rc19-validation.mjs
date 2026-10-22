import { spawnSync, execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"

const resultDir = path.resolve("results/asteria_validator_hardening_20261022")
const resultPath = path.join(resultDir, "validator-run.json")
const temporaryDir = await fs.mkdtemp(path.join(os.tmpdir(), "asteria-rc19-validator-"))
const staticResultPath = path.join(temporaryDir, "static.json")
const browserResultPath = path.join(temporaryDir, "browser.json")

function run(name, command, args, extraEnv = {}) {
  const startedAt = Date.now()
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: { ...process.env, ...extraEnv },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  })
  const record = {
    name,
    argv: [command, ...args],
    exitCode: result.status ?? 1,
    durationMs: Date.now() - startedAt,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  }
  process.stdout.write(record.stdout)
  process.stderr.write(record.stderr)
  return record
}

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"))
  } catch {
    return null
  }
}

try {
  const candidateHead = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim()
  const status = execFileSync("git", ["status", "--short"], { encoding: "utf8" })
  const diff = execFileSync("git", ["diff", "--binary", "HEAD"], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 })
  const commands = [
    run("validator-control-set", "npm", ["run", "test:validator-hardening"]),
    run("static-rc19-observer", "node", ["scripts/validate-architecture-rc19.mjs"], { ASTERIA_VALIDATOR_STATIC_RESULT: staticResultPath }),
    run("browser-falsified-metrics-control", "npx", ["playwright", "test", "--grep", "RC19 validator hardening"]),
    run("browser-rendered-product-gate", "npx", ["playwright", "test", "--grep", "RC19 layout-first"], { ASTERIA_VALIDATOR_BROWSER_RESULT: browserResultPath }),
  ]
  const report = {
    schemaVersion: "asteria.validator-run/1",
    validator: "asteria-rc19-scientific-graph-hardening",
    candidate: {
      head: candidateHead,
      worktreeStatus: status.split("\n").filter(Boolean),
      worktreeDiffSha256: createHash("sha256").update(diff).digest("hex"),
    },
    approvedScientificBaseline: "193c033659a7612a99442763077217b130e9b756",
    approvedThresholdSource: "prompts/tasks/asteria_v2_rc19_layout_first_graph_convergence_task.md#8",
    thresholds: { simpleArchEdgeMaxRouteRatio: 1.3, archEdgeP95RouteRatio: 1.45, longDetourRouteRatio: 1.45 },
    commands: commands.map(({ stdout, stderr, ...command }) => ({
      ...command,
      stdoutTail: stdout.split("\n").slice(-30).join("\n"),
      stderrTail: stderr.split("\n").slice(-30).join("\n"),
    })),
    controls: await readJson(staticResultPath) ? { nodeCaseCount: 12, browserFalsifiedMetricsRejected: commands[2].exitCode === 0 } : null,
    static: await readJson(staticResultPath),
    browser: await readJson(browserResultPath),
    overallStatus: commands.every((command) => command.exitCode === 0) ? "pass" : "fail",
  }
  await fs.mkdir(resultDir, { recursive: true })
  await fs.writeFile(resultPath, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`ASTERIA_VALIDATOR_RESULT=${path.relative(process.cwd(), resultPath)}`)
  process.exitCode = report.overallStatus === "pass" ? 0 : 1
} finally {
  await fs.rm(temporaryDir, { recursive: true, force: true })
}
