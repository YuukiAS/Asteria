import { createServer } from "node:http"
import { createHash, randomUUID } from "node:crypto"
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createServer as createViteServer } from "vite"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const runtimeDir = process.env.ASTERIA_RUNTIME_DIR || path.join(root, ".runtime", "asteria-server")
const dataFile = process.env.ASTERIA_SHARED_MAP_FILE || path.join(runtimeDir, "shared-map.json")
const host = process.env.HOST || "127.0.0.1"
const port = Number(process.env.PORT || process.argv[2] || 5174)
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

  await writeRecord(next)
  return { status: 200, value: { record: next } }
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
        exists: Boolean(record),
        revision: record?.revision || null,
        updatedAt: record?.updatedAt,
      })
    }

    if (pathname === "/api/asteria/session" || pathname === "/api/asteria/map") {
      if (req.method === "GET") {
        const record = await readRecord()
        return jsonResponse(res, 200, record ? { exists: true, record } : { exists: false })
      }
      if (req.method === "PUT") {
        const result = await saveMap(await readJsonBody(req))
        return jsonResponse(res, result.status, result.value)
      }
      return methodNotAllowed(res)
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
