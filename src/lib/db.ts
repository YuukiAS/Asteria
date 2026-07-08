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
  }
}

export const db = new AsteriaDatabase()
const maxPersistedBackups = 3

export async function loadPersistedMap() {
  return db.maps.get("main")
}

export async function savePersistedMap(map: ExportedMap, seededDemo: boolean) {
  await db.maps.put({ id: "main", map, seededDemo, updatedAt: map.updatedAt })
}

export async function listPersistedMapBackups() {
  return db.backups.orderBy("createdAt").reverse().toArray()
}

export async function createPersistedMapBackup(map: ExportedMap, seededDemo: boolean) {
  const createdAt = new Date().toISOString()
  await db.transaction("rw", db.backups, async () => {
    await db.backups.put({ id: `backup-${createdAt}`, map, seededDemo, createdAt })
    const backups = await listPersistedMapBackups()
    const staleBackups = backups.slice(maxPersistedBackups)
    if (staleBackups.length) await db.backups.bulkDelete(staleBackups.map((backup) => backup.id))
  })
  return listPersistedMapBackups()
}
