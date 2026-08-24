type WorkspaceErrorStateProps = {
  title: string;
  message: string;
  preserved?: string;
  onRetry?: () => void;
  inspectDetails?: string;
};

export function WorkspaceErrorState({ title, message, preserved, onRetry, inspectDetails }: WorkspaceErrorStateProps) {
  return (
    <div className="site00-fws-error" role="alert">
      <h3 className="site00-fws-error__title">{title}</h3>
      <p className="site00-fws-error__message">{message}</p>
      {preserved ? <p className="site00-fws-error__preserved">Preserved: {preserved}</p> : null}
      {onRetry ? (
        <button type="button" className="site00-fws-error__retry" onClick={onRetry}>
          RETRY →
        </button>
      ) : null}
      {inspectDetails ? (
        <details className="site00-fws-error__inspect">
          <summary>INSPECT DETAILS</summary>
          <pre>{inspectDetails}</pre>
        </details>
      ) : null}
    </div>
  );
}
