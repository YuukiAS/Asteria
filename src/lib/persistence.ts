import type { PersistedMap, PersistedMapBackup } from "./db"
import type { ExportedMap } from "../types/map"

export type PersistenceMode = "local" | "remote"

export type RemoteRecord = {
  revision: string
  updatedAt: string
  map: ExportedMap
  seededDemo: boolean
}

type RemoteMapResponse = {
  exists: boolean
  record?: RemoteRecord
  backups: PersistedMapBackup[]
}

type SaveRemoteMapResponse = {
  record: RemoteRecord
  backups: PersistedMapBackup[]
}

export class RemoteRevisionConflictError extends Error {
  revision: string | null
  updatedAt?: string

  constructor(revision: string | null, updatedAt?: string) {
    super("The shared map changed on another computer.")
    this.name = "RemoteRevisionConflictError"
    this.revision = revision
    this.updatedAt = updatedAt
  }
}

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      Accept: "application/json",
      ...init?.headers,
    },
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : {}
  if (response.status === 409) throw new RemoteRevisionConflictError(data.revision ?? null, data.updatedAt)
  if (!response.ok) throw new Error(data.message || data.error || `Request failed with ${response.status}`)
  return data as T
}

export async function detectRemotePersistence() {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 800)
  try {
    const status = await fetchJson<{ ok: boolean; mode?: string }>("/api/asteria/status", {
      signal: controller.signal,
      cache: "no-store",
    })
    return status.ok && status.mode === "shared"
  } catch {
    return false
  } finally {
    window.clearTimeout(timer)
  }
}

export async function loadRemoteMap() {
  return fetchJson<RemoteMapResponse>("/api/asteria/map", { cache: "no-store" })
}

export async function saveRemoteMap(map: ExportedMap, seededDemo: boolean, revision: string | null, reason = "save") {
  return fetchJson<SaveRemoteMapResponse>("/api/asteria/map", {
    method: "PUT",
    body: JSON.stringify({ revision, map, seededDemo, reason }),
  })
}

export async function listRemoteBackups() {
  return fetchJson<{ backups: PersistedMapBackup[] }>("/api/asteria/backups", { cache: "no-store" })
}

export async function createRemoteBackup(map: ExportedMap, seededDemo: boolean, revision: string | null) {
  return fetchJson<{ backups: PersistedMapBackup[] }>("/api/asteria/backups", {
    method: "POST",
    body: JSON.stringify({ revision, map, seededDemo }),
  })
}

export async function restoreRemoteBackup(id: string, revision: string | null) {
  return fetchJson<SaveRemoteMapResponse>("/api/asteria/restore", {
    method: "POST",
    body: JSON.stringify({ id, revision }),
  })
}

export function remoteRecordToPersisted(record: RemoteRecord): PersistedMap {
  return {
    id: "main",
    map: record.map,
    seededDemo: record.seededDemo,
    updatedAt: record.updatedAt,
  }
}
