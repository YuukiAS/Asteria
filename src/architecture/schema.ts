import { architectureSchemaVersion, type ArchitectureProjectV2 } from "./types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function assertRecord(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (!isRecord(value)) throw new Error(`${label} must be an object.`)
}

function normalizeRecord<T>(value: unknown, label: string): Record<string, T> {
  assertRecord(value, label)
  return value as Record<string, T>
}

export function parseArchitectureProjectV2(input: unknown): ArchitectureProjectV2 {
  assertRecord(input, "Architecture project")
  if (input.schemaVersion !== architectureSchemaVersion) {
    throw new Error(`Unsupported architecture schemaVersion "${String(input.schemaVersion)}".`)
  }
  assertRecord(input.project, "project")
  const project = input.project as ArchitectureProjectV2["project"]
  return {
    schemaVersion: architectureSchemaVersion,
    project,
    entities: normalizeRecord(input.entities, "entities"),
    symbols: normalizeRecord(input.symbols, "symbols"),
    relations: normalizeRecord(input.relations, "relations"),
    variants: normalizeRecord(input.variants, "variants"),
    views: normalizeRecord(input.views, "views"),
    legacy: isRecord(input.legacy) ? (input.legacy as ArchitectureProjectV2["legacy"]) : undefined,
    updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : project.updatedAt,
  }
}

export function serializeArchitectureProjectV2(project: ArchitectureProjectV2) {
  return JSON.stringify(project, null, 2)
}

export function cloneArchitectureProjectV2(project: ArchitectureProjectV2): ArchitectureProjectV2 {
  return parseArchitectureProjectV2(JSON.parse(serializeArchitectureProjectV2(project)))
}
