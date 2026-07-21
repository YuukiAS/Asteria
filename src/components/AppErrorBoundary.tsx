import { Component, type ErrorInfo, type ReactNode } from "react"

type AppErrorBoundaryProps = {
  children: ReactNode
  label: string
  resetKey?: string
}

type AppErrorBoundaryState = {
  error?: Error
  resetKey?: string
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { resetKey: this.props.resetKey }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  static getDerivedStateFromProps(props: AppErrorBoundaryProps, state: AppErrorBoundaryState) {
    if (props.resetKey !== state.resetKey) return { error: undefined, resetKey: props.resetKey }
    return null
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`Asteria ${this.props.label} failed to render`, error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="m-3 grid gap-2 rounded-lg border border-danger/30 bg-panel p-4 text-sm text-secondary">
        <div className="font-semibold text-danger">Could not render {this.props.label}.</div>
        <div>The rest of Asteria is still available. Clear the selection or choose another result.</div>
      </div>
    )
  }
}
