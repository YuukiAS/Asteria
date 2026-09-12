import { isHexColor } from "../lib/sanitize"

type ColorPickerRowProps = {
  label: string
  value: string
  onChange: (value: string) => void
  palette: readonly string[]
}

export function ColorPickerRow({ label, value, onChange, palette }: ColorPickerRowProps) {
  const valid = isHexColor(value)
  return (
    <label className="grid gap-2 text-xs font-medium text-secondary">
      <span>{label}</span>
      <div className="flex items-center gap-2">
        <input
          className="h-8 w-10 rounded-md border border-border bg-panel p-1"
          type="color"
          value={valid ? value : "#000000"}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          className={`h-8 min-w-0 flex-1 rounded-md border bg-panel px-2 font-mono text-xs text-foreground outline-none focus:border-accent ${
            valid ? "border-border" : "border-danger"
          }`}
          value={value}
          onChange={(event) => {
            const next = event.target.value
            if (isHexColor(next)) onChange(next)
            else onChange(next)
          }}
          spellCheck={false}
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {palette.map((color) => (
          <button
            key={color}
            type="button"
            className="h-[18px] w-[18px] shrink-0 rounded-full border border-border shadow-sm"
            style={{ backgroundColor: color }}
            aria-label={`Use ${color}`}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
    </label>
  )
}
