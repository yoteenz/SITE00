/**
 * P0.BRIDGE.1 — Prepare repo change / cross-repo handoff panel.
 */

import { useCallback, useState } from 'react';
import { classifyChangeExecution } from '../../../../shared/site00-design-control-plane/client.js';

type Summary = {
  project: string | null | undefined;
  page: string | null | undefined;
  scope: string;
  sourceRepo: string | null;
  baseCommit: string | null | undefined;
  affectedPages: string[];
  affectedComponents: string[];
  affectedRoutes: string[];
  operations: Array<{ operationType: string; operationOrder: number }>;
  risk: string;
  implementationMode: string;
  status: string;
  receipts: Array<{ status: string; message?: string | null }>;
};

export type DesignRepoChangePanelProps = {
  projectKey: string;
  routeKey?: string;
  pageKey?: string;
  baseSourceCommit?: string;
};

export function DesignRepoChangePanel({
  projectKey,
  routeKey,
  pageKey,
  baseSourceCommit = 'HEAD',
}: DesignRepoChangePanelProps) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [changeRequestId, setChangeRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleOps = [
    { operationOrder: 1, operationType: 'UPDATE_CONTENT_BINDING' as const, payload: { title: pageKey ?? routeKey ?? 'page' } },
  ];

  const classification = classifyChangeExecution('UPDATE_PAGE_METADATA', sampleOps, projectKey);

  const prepare = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/site00/design-control-plane', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'prepare_repo_change',
          input: {
            projectKey,
            routeKey,
            pageKey,
            changeType: classification.executionClass === 'RUNTIME_SAFE_BINDING' ? 'PAGE_METADATA' : 'MODIFY_COMPONENT_STRUCTURE',
            scope: 'TARGET_ONLY',
            baseSourceCommit: classification.executionClass === 'SOURCE_CODE_MATERIALIZATION' ? baseSourceCommit : undefined,
            operations: sampleOps,
            requestedBy: 'founder',
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Prepare failed');
      setChangeRequestId(data.changeRequest.id);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prepare failed');
    } finally {
      setLoading(false);
    }
  }, [baseSourceCommit, classification.executionClass, pageKey, projectKey, routeKey, sampleOps]);

  const approveForRepo = useCallback(async () => {
    if (!changeRequestId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/site00/design-control-plane', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve_for_source_repo', changeRequestId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Approve failed');
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approve failed');
    } finally {
      setLoading(false);
    }
  }, [changeRequestId]);

  return (
    <section className="site00-dw-repo-change" data-bridge="p0-bridge-1">
      <header className="site00-dw-repo-change__header">
        <h3>REPO CHANGE HANDOFF</h3>
        <p>
          IMPLEMENTATION MODE:{' '}
          <strong>{classification.implementationMode === 'RUNTIME_BINDING' ? 'RUNTIME BINDING' : 'SOURCE REPO CHANGE'}</strong>
        </p>
      </header>

      <div className="site00-dw-repo-change__actions">
        <button type="button" className="site00-dw-btn site00-dw-btn--primary" disabled={loading} onClick={() => void prepare()}>
          PREPARE REPO CHANGE
        </button>
        {changeRequestId && summary?.status === 'DRAFT' ? (
          <button type="button" className="site00-dw-btn" disabled={loading} onClick={() => void approveForRepo()}>
            APPROVE FOR SOURCE REPO
          </button>
        ) : null}
      </div>

      {error ? <p className="site00-dw-repo-change__error">{error}</p> : null}

      {summary ? (
        <dl className="site00-dw-repo-change__summary">
          <div><dt>PROJECT</dt><dd>{summary.project}</dd></div>
          <div><dt>PAGE / ROUTE</dt><dd>{summary.page ?? routeKey ?? '—'}</dd></div>
          <div><dt>SCOPE</dt><dd>{summary.scope}</dd></div>
          <div><dt>SOURCE REPO</dt><dd>{summary.sourceRepo ?? '—'}</dd></div>
          <div><dt>BASE COMMIT</dt><dd>{summary.baseCommit ?? '—'}</dd></div>
          <div><dt>STATUS</dt><dd>{summary.status}</dd></div>
          <div><dt>RISK</dt><dd>{summary.risk}</dd></div>
          <div><dt>OPERATIONS</dt><dd>{summary.operations?.length ?? 0}</dd></div>
        </dl>
      ) : null}
    </section>
  );
}
