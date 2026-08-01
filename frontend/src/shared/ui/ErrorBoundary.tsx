import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-page">
          <div className="error-page-container animate-fade-in">
            {/* Error icon */}
            <div className="error-icon error-icon--500 animate-float">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1 className="error-code animate-slide-up">Oops!</h1>
            <p className="error-title animate-slide-up-delay">Algo salió mal</p>
            <p className="error-message animate-slide-up-delay-2">
              Ocurrió un error inesperado en la aplicación.
              {this.state.error && (
                <span className="error-details">{this.state.error.message}</span>
              )}
            </p>

            <div className="error-actions animate-slide-up-delay-2">
              <button className="btn btn-primary" onClick={this.handleReload}>
                Recargar página
              </button>
              <button className="btn btn-secondary" onClick={this.handleReset}>
                Reintentar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}