import { Component, type ErrorInfo, type ReactNode } from 'react';
import { isChunkLoadError } from '../../../utils/lazyWithChunkRecovery';

type Props = { children: ReactNode };
type State = { error: Error | null };

/** Catches lazy route chunk failures after the immersive gate — avoids a blank #root on Safari. */
export class Site00WorldRouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[Site00WorldRouteErrorBoundary]', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const chunkLike = isChunkLoadError(error);

    return (
      <div
        className="site00-world-route-suspense site00-world-route-suspense--error"
        role="alert"
        style={{
          minHeight: '100lvh',
          background: '#f5f5f3',
          color: '#1a1a18',
          padding: '32px 20px',
          font: '600 14px/1.5 system-ui, sans-serif',
          textAlign: 'center',
          maxWidth: 420,
          margin: '0 auto',
        }}
      >
        <p style={{ margin: '0 0 12px', letterSpacing: '0.04em' }}>SITE 00 COULD NOT LOAD THIS SCREEN</p>
        <p style={{ margin: '0 0 16px', fontWeight: 500, opacity: 0.85 }}>
          {chunkLike
            ? 'A new build was deployed while this tab was open. Safari often keeps an older JavaScript bundle and then fails to load updated page chunks.'
            : 'This route crashed during initialization.'}
        </p>
        <p style={{ margin: '0 0 20px', fontWeight: 500, fontSize: 12, opacity: 0.75 }}>
          <code style={{ fontWeight: 600 }}>{error.message}</code>
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 18px',
            border: 0,
            borderRadius: 8,
            background: '#1a1a18',
            color: '#f5f5f3',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Reload
        </button>
      </div>
    );
  }
}
