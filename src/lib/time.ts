export function nowIso() {
  return new Date().toISOString()
}

export function formatJsonTimestamp(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`
}

export function formatLocalDateTime(value?: string) {
  if (!value) return "Not saved"
  return new Date(value).toLocaleString()
}
