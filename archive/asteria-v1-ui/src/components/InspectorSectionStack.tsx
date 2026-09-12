import { ChevronDown, ChevronRight, GripVertical, MoveDown, MoveUp } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

export type InspectorSection = {
  id: string
  title: string
  summary?: string
  defaultCollapsed?: boolean
  children: ReactNode
}

type InspectorSectionStackProps = {
  storageKey: string
  sections: InspectorSection[]
}

type StoredLayout = {
  order?: string[]
  collapsed?: Record<string, boolean>
}

function readLayout(storageKey: string): StoredLayout {
  try {
    const raw = localStorage.getItem(storageKey)
    return raw ? (JSON.parse(raw) as StoredLayout) : {}
  } catch {
    return {}
  }
}

function orderSections(sections: InspectorSection[], storedOrder?: string[]) {
  if (!storedOrder?.length) return sections
  const byId = new Map(sections.map((section) => [section.id, section]))
  const ordered = storedOrder.flatMap((id) => {
    const section = byId.get(id)
    if (!section) return []
    byId.delete(id)
    return [section]
  })
  return [...ordered, ...sections.filter((section) => byId.has(section.id))]
}

export function InspectorSectionStack({ storageKey, sections }: InspectorSectionStackProps) {
  const [storedLayout, setStoredLayout] = useState<StoredLayout>(() => readLayout(storageKey))

  useEffect(() => {
    setStoredLayout(readLayout(storageKey))
  }, [storageKey])

  const orderedSections = useMemo(() => orderSections(sections, storedLayout.order), [sections, storedLayout.order])
  const orderedIds = orderedSections.map((section) => section.id)

  const updateLayout = (nextLayout: StoredLayout) => {
    setStoredLayout(nextLayout)
    localStorage.setItem(storageKey, JSON.stringify(nextLayout))
  }

  const moveSection = (id: string, direction: -1 | 1) => {
    const index = orderedIds.indexOf(id)
    const nextIndex = index + direction
    if (index < 0 || nextIndex < 0 || nextIndex >= orderedIds.length) return
    const nextOrder = [...orderedIds]
    const [item] = nextOrder.splice(index, 1)
    nextOrder.splice(nextIndex, 0, item)
    updateLayout({ ...storedLayout, order: nextOrder })
  }

  const toggleSection = (section: InspectorSection) => {
    const isCollapsed = storedLayout.collapsed?.[section.id] ?? Boolean(section.defaultCollapsed)
    updateLayout({
      ...storedLayout,
      collapsed: {
        ...storedLayout.collapsed,
        [section.id]: !isCollapsed,
      },
    })
  }

  return (
    <div className="inspector-section-stack">
      {orderedSections.map((section, index) => {
        const isCollapsed = storedLayout.collapsed?.[section.id] ?? Boolean(section.defaultCollapsed)
        const contentId = `${storageKey}-${section.id}-content`
        return (
          <section key={section.id} className={`panel-section inspector-accordion-section ${isCollapsed ? "inspector-accordion-section-collapsed" : ""}`}>
            <div className="inspector-section-header">
              <button
                type="button"
                className="inspector-section-toggle"
                aria-expanded={!isCollapsed}
                aria-controls={contentId}
                onClick={() => toggleSection(section)}
              >
                {isCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                <span className="section-title">{section.title}</span>
                {section.summary && <span className="inspector-section-summary">{section.summary}</span>}
              </button>
              <div className="inspector-section-controls" aria-label={`${section.title} section order`}>
                <GripVertical size={14} aria-hidden="true" />
                <button
                  type="button"
                  className="inspector-section-order-button"
                  onClick={() => moveSection(section.id, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${section.title} up`}
                  title="Move up"
                >
                  <MoveUp size={13} />
                </button>
                <button
                  type="button"
                  className="inspector-section-order-button"
                  onClick={() => moveSection(section.id, 1)}
                  disabled={index === orderedSections.length - 1}
                  aria-label={`Move ${section.title} down`}
                  title="Move down"
                >
                  <MoveDown size={13} />
                </button>
              </div>
            </div>
            {!isCollapsed && (
              <div id={contentId} className="inspector-section-content">
                {section.children}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
