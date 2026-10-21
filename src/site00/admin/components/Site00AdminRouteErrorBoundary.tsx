import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode; routeLabel?: string };
type State = { error: Error | null };

export class Site00AdminRouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[Site00AdminRouteErrorBoundary]', this.props.routeLabel ?? 'admin', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const chunkLike =
      error.message.toLowerCase().includes('dynamically imported module') ||
      error.message.toLowerCase().includes('importing a module script failed');

    return (
      <div className="site00-admin-page site00-admin-route-error" role="alert">
        <h1 className="site00-admin-page-title">[ ADMIN · INITIALIZATION FAILED ]</h1>
        <p className="site00-admin-route-error__lead">
          {chunkLike
            ? 'A new staging build was deployed while this tab was open. Safari often keeps the previous JavaScript bundle and then fails to load updated page chunks.'
            : 'This admin screen crashed during initialization.'}
        </p>
        <p className="site00-admin-route-error__detail">
          <code>{error.message}</code>
        </p>
        <p className="site00-admin-route-error__actions">
          <button type="button" className="site00-admin-button" onClick={() => window.location.reload()}>
            Reload workspace
          </button>{' '}
          <a className="site00-admin-button site00-admin-button--ghost" href="/origin/sign-in">
            Return to sign-in
          </a>
        </p>
      </div>
    );
  }
}
