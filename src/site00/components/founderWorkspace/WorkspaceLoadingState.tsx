import type { ReactNode } from 'react';

type WorkspaceLoadingStateProps = {
  label?: string;
  preserveGeometry?: boolean;
  rows?: number;
};

export function WorkspaceLoadingState({
  label = 'LOADING WORKSPACE…',
  preserveGeometry = true,
  rows = 3,
}: WorkspaceLoadingStateProps) {
  return (
    <div className="site00-fws-loading" role="status" aria-live="polite" aria-busy="true">
      <p className="site00-fws-loading__label">{label}</p>
      {preserveGeometry ? (
        <div className="site00-fws-loading__skeleton" aria-hidden="true">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="site00-fws-loading__row" style={{ width: `${88 - i * 12}%` }} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function WorkspaceLoadingPanel({ children }: { children?: ReactNode }) {
  return <div className="site00-fws-panel site00-fws-panel--loading">{children ?? <WorkspaceLoadingState />}</div>;
}
