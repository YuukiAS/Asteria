import Dexie, { type Table } from "dexie"
import type { ExportedMap } from "../types/map"

export type PersistedMap = {
  id: "main"
  map: ExportedMap
  seededDemo: boolean
  updatedAt: string
}

export type PersistedMapBackup = {
  id: string
  kind?: "recent" | "fixed"
  map: ExportedMap
  seededDemo: boolean
  createdAt: string
}

class AsteriaDatabase extends Dexie {
  maps!: Table<PersistedMap, string>
  backups!: Table<PersistedMapBackup, string>

  constructor() {
    super("asteria-map")
    this.version(1).stores({
      maps: "id, updatedAt",
    })
    this.version(2).stores({
      maps: "id, updatedAt",
      backups: "id, createdAt",
    })
    this.version(3).stores({
      maps: "id, updatedAt",
      backups: "id, kind, createdAt",
    })
  }
}

export const db = new AsteriaDatabase()
const maxPersistedBackupsByKind = 3

export async function loadPersistedMap() {
  return db.maps.get("main")
}

export async function savePersistedMap(map: ExportedMap, seededDemo: boolean) {
  await db.maps.put({ id: "main", map, seededDemo, updatedAt: map.updatedAt })
}

export async function listPersistedMapBackups() {
  const backups = await db.backups.orderBy("createdAt").reverse().toArray()
  return backups.map((backup) => ({ ...backup, kind: backup.kind || "recent" }))
}

export async function createPersistedMapBackup(map: ExportedMap, seededDemo: boolean, kind: PersistedMapBackup["kind"] = "recent") {
  const createdAt = new Date().toISOString()
  await db.transaction("rw", db.backups, async () => {
    const normalizedKind = kind || "recent"
    await db.backups.put({ id: `${normalizedKind}-${createdAt}`, kind: normalizedKind, map, seededDemo, createdAt })
    const backups = await listPersistedMapBackups()
    const staleBackups = backups.filter((backup) => (backup.kind || "recent") === normalizedKind).slice(maxPersistedBackupsByKind)
    if (staleBackups.length) await db.backups.bulkDelete(staleBackups.map((backup) => backup.id))
  })
  return listPersistedMapBackups()
}
