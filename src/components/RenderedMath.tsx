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

const canonicalDefinitionLatex: Record<string, string> = {
  "beta^U_gh = nu + a_g + v^U_gh": "\\beta^{\\mathcal U}_{gh}=\\nu+a_g+v^{\\mathcal U}_{gh}",
  "gamma_g = gamma_0*pi_g": "\\gamma_g=\\gamma_0\\pi_g",
  "alpha^U_gh | gamma_g,p_g ~ N(mu_{p_g}(gamma_g),tau_{p_g}^2)": "\\alpha^{\\mathcal U}_{gh}\\mid\\gamma_g,p_g\\sim N\\{\\mu_{p_g}(\\gamma_g),\\tau_{p_g}^2\\}",
  "1{z^U_igh>0}": "1\\{z^{\\mathcal U}_{igh}>0\\}",
  "1{z^K_ij>0}": "1\\{z^{\\mathcal K}_{ij}>0\\}",
  "alpha^K_j + x_i^T beta^K_j + epsilon^K_ij": "\\alpha^{\\mathcal K}_j+x_i^\\top\\beta^{\\mathcal K}_j+\\varepsilon^{\\mathcal K}_{ij}",
  "alpha^U_gh + x_i^T beta^U_gh + epsilon^U_igh": "\\alpha^{\\mathcal U}_{gh}+x_i^\\top\\beta^{\\mathcal U}_{gh}+\\varepsilon^{\\mathcal U}_{igh}",
  "D_W^{-1/2} Omega_W D_W^{-1/2}": "D_{\\mathcal W}^{-1/2}\\Omega_{\\mathcal W}D_{\\mathcal W}^{-1/2}",
  "Lambda_W Lambda_W^T + I": "\\Lambda_{\\mathcal W}\\Lambda_{\\mathcal W}^\\top+I",
  "K=|mathcal K|": "K=|\\mathcal K|",
  "c(f) in mathcal K union {empty}": "c(f)\\in\\mathcal K\\cup\\{\\varnothing\\}",
}

export function RenderedFormulaText({ source, fallback = "canonical definition", testId }: { source?: string; fallback?: string; testId?: string }) {
  if (!source) return null
  const latex = canonicalDefinitionLatex[source]
  if (!latex) return <span data-testid={testId}>{source}</span>
  return (
    <span className="rendered-definition" data-canonical-definition={source} data-testid={testId}>
      <RenderedMath latex={latex} fallback={fallback} />
      <span className="sr-only">{source}</span>
    </span>
  )
}
