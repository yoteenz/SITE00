import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { label: string; children: ReactNode };

type State = { error: Error | null };

/** Keeps Design workspace alive when one authority subsection throws (mobile Safari / stale LS). */
export class DesignPageV3SectionErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[design-v3:${this.props.label}]`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <section className="site00-dw-v3-authority__error" role="alert" data-testid="v3-section-error-boundary">
          <strong>{this.props.label} — could not render</strong>
          <p>{this.state.error.message}</p>
          <p className="site00-dw-v3-authority__hint">
            Hard refresh Design. If this persists, clear site data for this origin or sign in again at Ctrl Room.
          </p>
          <button type="button" onClick={() => this.setState({ error: null })}>
            RETRY SECTION
          </button>
        </section>
      );
    }
    return this.props.children;
  }
}
