import { BlockHeaderSelect } from "./BlockHeaderSelect"

type FieldSelectOption<T extends string> = {
  value: T
  label: string
  description?: string
}

type FieldSelectProps<T extends string> = {
  value: T
  options: ReadonlyArray<FieldSelectOption<T>>
  onChange: (value: T) => void
  ariaLabel: string
  showDescriptions?: boolean
  className?: string
  disabled?: boolean
}

export function FieldSelect<T extends string>({ value, options, onChange, ariaLabel, showDescriptions = false, className = "", disabled = false }: FieldSelectProps<T>) {
  return (
    <BlockHeaderSelect
      value={value}
      options={options}
      onChange={onChange}
      ariaLabel={ariaLabel}
      className={`field-select-trigger ${className}`}
      showDescriptions={showDescriptions}
      size="field"
      disabled={disabled}
    />
  )
}
