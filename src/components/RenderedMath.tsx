import katex from "katex"
import { useMemo } from "react"

type RenderedMathProps = {
  latex?: string
  fallback?: string
  display?: boolean
  className?: string
  testId?: string
}

export function RenderedMath({ latex, fallback, display = false, className = "", testId }: RenderedMathProps) {
  const source = latex || fallback || ""
  const html = useMemo(() => {
    if (!source) return ""
    return katex.renderToString(source, {
      displayMode: display,
      throwOnError: false,
      strict: false,
      output: "html",
    })
  }, [display, source])

  if (!source) return null

  return (
    <span
      className={`rendered-math ${display ? "rendered-math-display" : ""} ${className}`.trim()}
      aria-label={fallback || source}
      data-latex-source={source}
      data-testid={testId}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
