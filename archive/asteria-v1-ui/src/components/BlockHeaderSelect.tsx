import { Check, ChevronDown } from "lucide-react"
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

type BlockHeaderSelectOption<T extends string> = {
  value: T
  label: string
  className?: string
  description?: string
}

type BlockHeaderSelectProps<T extends string> = {
  value: T
  options: ReadonlyArray<BlockHeaderSelectOption<T>>
  onChange: (value: T) => void
  ariaLabel: string
  title?: string
  menuTitle?: string
  onOpenChange?: (open: boolean) => void
  className?: string
  disabled?: boolean
  menuWidth?: number
  minMenuWidth?: number
  showDescriptions?: boolean
  size?: "compact" | "field"
}

export function BlockHeaderSelect<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  title,
  menuTitle,
  onOpenChange,
  className = "",
  disabled = false,
  menuWidth,
  minMenuWidth,
  showDescriptions = false,
  size = "compact",
}: BlockHeaderSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0, width: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value))
  const selectedOption = options[selectedIndex] || options[0]
  const menuId = useId()
  const accessibleLabel = title ? `${ariaLabel}: ${title}` : ariaLabel

  const setOpenState = (nextOpen: boolean) => {
    setOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }

  const updateMenuPosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    const requestedWidth = menuWidth ?? Math.max(rect.width, minMenuWidth ?? 0)
    const width = Math.min(requestedWidth, window.innerWidth - 16)
    setMenuPosition({
      width,
      left: Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8)),
      top: Math.min(rect.bottom + 6, window.innerHeight - 12),
    })
  }

  useLayoutEffect(() => {
    if (!open) return
    setActiveIndex(selectedIndex)
    updateMenuPosition()
  }, [open, selectedIndex])

  useEffect(() => {
    if (!open) return
    const closeOnPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpenState(false)
    }
    const closeOnResize = () => updateMenuPosition()
    window.addEventListener("pointerdown", closeOnPointerDown)
    window.addEventListener("resize", closeOnResize)
    window.addEventListener("scroll", closeOnResize, true)
    return () => {
      window.removeEventListener("pointerdown", closeOnPointerDown)
      window.removeEventListener("resize", closeOnResize)
      window.removeEventListener("scroll", closeOnResize, true)
    }
  }, [open])

  const choose = (nextValue: T) => {
    onChange(nextValue)
    setOpenState(false)
    triggerRef.current?.focus()
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`block-header-select-trigger nodrag nopan ${selectedOption?.className || ""} ${className}`}
        aria-label={accessibleLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        disabled={disabled}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          if (!disabled) setOpenState(!open)
        }}
        onKeyDown={(event) => {
          if (disabled) return
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault()
            setOpenState(true)
            setActiveIndex((current) => {
              const direction = event.key === "ArrowDown" ? 1 : -1
              return (current + direction + options.length) % options.length
            })
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            if (open) choose(options[activeIndex]?.value ?? value)
            else setOpenState(true)
          }
          if (event.key === "Escape") {
            event.preventDefault()
            setOpenState(false)
          }
        }}
      >
        <span className="min-w-0 truncate">{selectedOption?.label}</span>
        <ChevronDown size={12} className={`block-header-select-chevron ${open ? "block-header-select-chevron-open" : ""}`} />
      </button>
      {open
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="listbox"
              className={`block-header-select-menu block-header-select-menu-${size} nodrag nopan`}
              style={{ left: menuPosition.left, top: menuPosition.top, width: menuPosition.width }}
              onPointerDown={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault()
                  setOpenState(false)
                  triggerRef.current?.focus()
                }
              }}
            >
              {menuTitle ? <div className="block-header-select-menu-title">{menuTitle}</div> : null}
              {options.map((option, index) => {
                const selected = option.value === value
                const active = index === activeIndex
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`block-header-select-option ${active ? "block-header-select-option-active" : ""}`}
                    onPointerEnter={() => setActiveIndex(index)}
                    onClick={() => choose(option.value)}
                    aria-label={option.description ? `${option.label}: ${option.description}` : option.label}
                  >
                    <span className="min-w-0 flex-1">
                      <span className={`block font-medium ${size === "field" ? "text-[12px]" : "truncate text-xs"}`}>{option.label}</span>
                      {showDescriptions && option.description ? (
                        <span className={`block font-normal normal-case tracking-normal text-secondary ${size === "field" ? "text-[10px] leading-snug" : "truncate text-[8px]"}`}>{option.description}</span>
                      ) : null}
                    </span>
                    {selected ? <Check size={12} className="shrink-0 text-accent" /> : <span className="h-3 w-3 shrink-0" />}
                  </button>
                )
              })}
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
