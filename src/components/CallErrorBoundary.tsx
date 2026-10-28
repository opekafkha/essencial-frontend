import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  onRetry: () => void
}

/** Keep a failed conference subtree from taking down navigation and the whole app. */
export class CallErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the original error and component stack available for diagnosis.
    console.error('Essencial: error en la interfaz de videollamada', error, info.componentStack)
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="card call-status" role="alert" translate="no">
          <span className="feature-icon" aria-hidden="true">◉</span>
          <h2>No pudimos mostrar la videollamada</h2>
          <p>La interfaz de la sala encontró un problema. Puedes volver a entrar sin perder tu sesión.</p>
          <button className="button primary" onClick={this.props.onRetry}>Volver a entrar</button>
        </div>
      )
    }
    return this.props.children
  }
}
