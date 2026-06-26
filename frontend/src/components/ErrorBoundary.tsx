import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-svh items-center justify-center bg-fondo px-4">
          <div className="max-w-md rounded-xl border border-borde/30 bg-tarjeta p-8 text-center shadow-2xl shadow-black/40">
            <h1 className="mb-2 text-2xl font-bold text-primary">Algo salió mal</h1>
            <p className="mb-6 text-sm text-gray-300">
              Ocurrió un error inesperado. Recargá la página o intentá de nuevo.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-primary px-6 py-3 font-semibold text-black transition-all duration-200 hover:bg-primary/80"
            >
              Recargar
            </button>
            {this.state.error && (
              <details className="mt-4 text-left text-xs text-gray-400">
                <summary className="cursor-pointer">Detalles técnicos</summary>
                <pre className="mt-2 whitespace-pre-wrap rounded bg-black/30 p-2">{this.state.error.message}</pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
