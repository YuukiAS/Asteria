import { createServer } from "node:http"
import { createHash, randomUUID } from "node:crypto"
import { mkdir, readdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createServer as createViteServer } from "vite"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const runtimeDir = process.env.ASTERIA_RUNTIME_DIR || path.join(root, ".runtime", "asteria-server")
const dataFile = process.env.ASTERIA_SHARED_MAP_FILE || path.join(runtimeDir, "shared-map.json")
const backupDir = process.env.ASTERIA_BACKUP_DIR || path.join(runtimeDir, "backups")
const host = process.env.HOST || "127.0.0.1"
const port = Number(process.env.PORT || process.argv[2] || 5174)
const maxBackups = Number(process.env.ASTERIA_MAX_BACKUPS || 10)
const maxBodyBytes = Number(process.env.ASTERIA_MAX_BODY_BYTES || 25 * 1024 * 1024)

function jsonResponse(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
  })
  res.end(body)
}

function methodNotAllowed(res) {
  jsonResponse(res, 405, { error: "method_not_allowed" })
}

async function readJsonBody(req) {
  const chunks = []
  let total = 0
  for await (const chunk of req) {
    total += chunk.length
    if (total > maxBodyBytes) throw Object.assign(new Error("Request body is too large."), { status: 413 })
    chunks.push(chunk)
  }
  if (!chunks.length) return {}
  return JSON.parse(Buffer.concat(chunks).toString("utf8"))
}

function assertMap(value) {
  if (!value || typeof value !== "object") throw Object.assign(new Error("map must be an object"), { status: 400 })
  if (value.version !== 1) throw Object.assign(new Error("map.version must be 1"), { status: 400 })
  if (!Array.isArray(value.nodes) || !Array.isArray(value.edges)) {
    throw Object.assign(new Error("map.nodes and map.edges must be arrays"), { status: 400 })
  }
}

function createRevision(map, previousRevision) {
  return createHash("sha256")
    .update(JSON.stringify({ previousRevision, map, nonce: randomUUID(), at: new Date().toISOString() }))
    .digest("hex")
    .slice(0, 16)
}

async function ensureStorage() {
  await mkdir(runtimeDir, { recursive: true })
  await mkdir(backupDir, { recursive: true })
}

async function readRecord() {
  try {
    return JSON.parse(await readFile(dataFile, "utf8"))
  } catch (error) {
    if (error?.code === "ENOENT") return undefined
    throw error
  }
}

async function writeRecord(record) {
  await ensureStorage()
  const tempFile = `${dataFile}.${process.pid}.${Date.now()}.tmp`
  await writeFile(tempFile, `${JSON.stringify(record, null, 2)}\n`, "utf8")
  await rename(tempFile, dataFile)
}

function contentSignature(record) {
  const { updatedAt, ...mapContent } = record.map || {}
  return JSON.stringify({
    map: mapContent,
    seededDemo: record.seededDemo,
  })
}

async function pruneBackups() {
  const files = (await readdir(backupDir)).filter((name) => name.endsWith(".json")).sort().reverse()
  await Promise.all(files.slice(maxBackups).map((name) => unlink(path.join(backupDir, name)).catch(() => undefined)))
}

async function createBackup(record, reason = "save") {
  if (!record) return
  await ensureStorage()
  const createdAt = new Date().toISOString()
  const id = `backup-${createdAt.replace(/[:.]/g, "-")}-${record.revision || "initial"}`
  const backup = {
    id,
    createdAt,
    reason,
    revision: record.revision,
    map: record.map,
    seededDemo: Boolean(record.seededDemo),
  }
  await writeFile(path.join(backupDir, `${id}.json`), `${JSON.stringify(backup, null, 2)}\n`, "utf8")
  await pruneBackups()
}

async function listBackups() {
  await ensureStorage()
  const files = (await readdir(backupDir)).filter((name) => name.endsWith(".json")).sort().reverse()
  const backups = []
  for (const name of files) {
    try {
      const backup = JSON.parse(await readFile(path.join(backupDir, name), "utf8"))
      assertMap(backup.map)
      backups.push({
        id: backup.id || name.replace(/\.json$/, ""),
        createdAt: backup.createdAt || (await stat(path.join(backupDir, name))).mtime.toISOString(),
        map: backup.map,
        seededDemo: Boolean(backup.seededDemo),
      })
    } catch (error) {
      console.warn(`Skipping invalid backup ${name}:`, error)
    }
  }
  return backups
}

async function saveMap(body) {
  assertMap(body.map)
  const current = await readRecord()
  const currentRevision = current?.revision || null
  if ((body.revision ?? null) !== currentRevision) {
    return {
      conflict: true,
      status: 409,
      value: { error: "revision_conflict", revision: currentRevision, updatedAt: current?.updatedAt },
    }
  }

  const next = {
    revision: createRevision(body.map, currentRevision),
    updatedAt: new Date().toISOString(),
    seededDemo: Boolean(body.seededDemo),
    map: body.map,
  }

  if (current && contentSignature(current) !== contentSignature(next)) await createBackup(current, body.reason || "save")
  await writeRecord(next)
  return { status: 200, value: { record: next, backups: await listBackups() } }
}

async function restoreBackup(body) {
  const backups = await listBackups()
  const backup = backups.find((item) => item.id === body.id)
  if (!backup) return { status: 404, value: { error: "backup_not_found" } }
  return saveMap({ revision: body.revision ?? null, map: backup.map, seededDemo: backup.seededDemo, reason: "restore" })
}

async function handleApi(req, res, pathname) {
  try {
    await ensureStorage()
    if (pathname === "/api/asteria/status") {
      if (req.method !== "GET") return methodNotAllowed(res)
      const record = await readRecord()
      return jsonResponse(res, 200, {
        ok: true,
        mode: "shared",
        dataFile,
        backupDir,
        exists: Boolean(record),
        revision: record?.revision || null,
        updatedAt: record?.updatedAt,
      })
    }

    if (pathname === "/api/asteria/map") {
      if (req.method === "GET") {
        const record = await readRecord()
        return jsonResponse(res, 200, record ? { exists: true, record, backups: await listBackups() } : { exists: false, backups: await listBackups() })
      }
      if (req.method === "PUT") {
        const result = await saveMap(await readJsonBody(req))
        return jsonResponse(res, result.status, result.value)
      }
      return methodNotAllowed(res)
    }

    if (pathname === "/api/asteria/backups") {
      if (req.method === "GET") return jsonResponse(res, 200, { backups: await listBackups() })
      if (req.method === "POST") {
        const body = await readJsonBody(req)
        const current = await readRecord()
        if ((body.revision ?? null) !== (current?.revision || null)) {
          return jsonResponse(res, 409, { error: "revision_conflict", revision: current?.revision || null, updatedAt: current?.updatedAt })
        }
        assertMap(body.map)
        if (!current || contentSignature({ map: body.map, seededDemo: Boolean(body.seededDemo) }) !== contentSignature(current)) {
          await createBackup({ revision: body.revision || "manual", map: body.map, seededDemo: Boolean(body.seededDemo) }, "manual")
        }
        return jsonResponse(res, 200, { backups: await listBackups() })
      }
      return methodNotAllowed(res)
    }

    if (pathname === "/api/asteria/restore") {
      if (req.method !== "POST") return methodNotAllowed(res)
      const result = await restoreBackup(await readJsonBody(req))
      return jsonResponse(res, result.status, result.value)
    }

    return jsonResponse(res, 404, { error: "not_found" })
  } catch (error) {
    const status = Number(error?.status) || 500
    console.error("Asteria API error:", error)
    return jsonResponse(res, status, { error: status === 500 ? "internal_error" : "bad_request", message: error?.message || "Request failed." })
  }
}

await ensureStorage()

const vite = await createViteServer({
  root,
  server: { middlewareMode: true, host, hmr: false, ws: false },
  appType: "spa",
})

const server = createServer((req, res) => {
  const pathname = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`).pathname
  if (pathname.startsWith("/api/asteria/")) {
    void handleApi(req, res, pathname)
    return
  }
  vite.middlewares(req, res)
})

server.listen(port, host, () => {
  console.log(`Asteria shared server listening at http://${host}:${port}/`)
  console.log(`Asteria shared map: ${dataFile}`)
})
