import React, { Component, type ReactNode } from 'react'
import { UI_STRINGS } from '../lib/uiStrings'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-neutral-950 text-neutral-100">
          <div className="max-w-md w-full panel border border-red-500/50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-2 text-red-400">
              {UI_STRINGS.ERROR_BOUNDARY_TITLE}
            </h2>
            <p className="text-sm opacity-80 mb-4">
              {UI_STRINGS.ERROR_BOUNDARY_MESSAGE}
            </p>
            {this.state.error && (
              <details className="mb-4 text-xs opacity-60">
                <summary className="cursor-pointer mb-2">Error details</summary>
                <pre className="overflow-auto p-2 bg-neutral-900 rounded">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReload}
              className="btn btn-accent w-full"
            >
              {UI_STRINGS.ERROR_BOUNDARY_RELOAD}
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

