import Dexie, { type Table } from "dexie"
import type { ExportedMap } from "../types/map"

export type PersistedMap = {
  id: "main"
  map: ExportedMap
  seededDemo: boolean
  updatedAt: string
}

class AsteriaDatabase extends Dexie {
  maps!: Table<PersistedMap, string>

  constructor() {
    super("asteria-map")
    this.version(1).stores({
      maps: "id, updatedAt",
    })
  }
}

export const db = new AsteriaDatabase()

export async function loadPersistedMap() {
  return db.maps.get("main")
}

export async function savePersistedMap(map: ExportedMap, seededDemo: boolean) {
  await db.maps.put({ id: "main", map, seededDemo, updatedAt: map.updatedAt })
}
