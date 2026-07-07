import type { CSSProperties } from "react"
import type { ModelVersion } from "../types/map"

type VersionStripProps = {
  availableVersionIds: string[]
  activeVersionId: string
  modelVersions: ModelVersion[]
  title: string
}

const versionMarkerColors = ["#2563eb", "#7c3aed", "#059669", "#0891b2", "#db2777"]

export function VersionStrip({ availableVersionIds, activeVersionId, modelVersions, title }: VersionStripProps) {
  if (!modelVersions.length) return null
  const available = new Set(availableVersionIds)
  return (
    <span className="version-strip" title={title} aria-label={title}>
      {modelVersions.map((version, index) => {
        const exists = available.has(version.id)
        const active = activeVersionId === version.id
        return (
          <span
            key={version.id}
            className={`version-strip-marker ${exists ? "version-strip-marker-filled" : "version-strip-marker-empty"} ${active ? "version-strip-marker-active" : ""}`}
            style={{ "--version-marker-color": versionMarkerColors[index % versionMarkerColors.length] } as CSSProperties & Record<string, string>}
            title={`${version.label}: ${exists ? "variant exists" : "uses default fallback"}`}
            aria-label={`${version.label}: ${exists ? "variant exists" : "uses default fallback"}${active ? ", active" : ""}`}
          >
            {index + 1}
          </span>
        )
      })}
    </span>
  )
}
