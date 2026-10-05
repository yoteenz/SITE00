/**
 * P0.BRIDGE.1 — Prepare repo change / cross-repo handoff panel.
 * P0.BRIDGE.1B — SITE00-native vs FSBW cross-repo implementation mode labels.
 */

import { useCallback, useMemo, useState } from 'react';
import {
  classifyChangeExecution,
  getProjectAuthority,
  resolveImplementationMode,
} from '../../../../shared/site00-design-control-plane/client.js';

type Summary = {
  project: string | null | undefined;
  page: string | null | undefined;
  scope: string;
  sourceRepo: string | null;
  executionMode?: string;
  implementationModeLabel?: string;
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

/** Visible label for SITE00-native managed projects (NDXBOOK, SITE 00). */
export const SITE00_NATIVE_IMPLEMENTATION_LABEL = 'SITE 00 NATIVE';

function formatImplementationMode(projectKey: string, classification: ReturnType<typeof classifyChangeExecution>): string {
  const authority = getProjectAuthority(projectKey);
  if (authority?.executionMode === 'SITE00_NATIVE') {
    const label = resolveImplementationMode(authority.executionMode, classification.executionClass).label;
    return label.startsWith(SITE00_NATIVE_IMPLEMENTATION_LABEL) ? label : SITE00_NATIVE_IMPLEMENTATION_LABEL;
  }
  if (authority?.executionMode === 'CROSS_REPO_FSBW') {
    if (classification.implementationMode === 'RUNTIME_BINDING') return 'RUNTIME BINDING';
    return 'SOURCE REPO CHANGE';
  }
  return classification.implementationMode === 'RUNTIME_BINDING' ? 'RUNTIME BINDING' : 'SOURCE REPO CHANGE';
}

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

  const sampleOps = useMemo(
    () => [
      {
        operationOrder: 1,
        operationType: 'UPDATE_CONTENT_BINDING' as const,
        payload: { title: pageKey ?? routeKey ?? 'page' },
      },
    ],
    [pageKey, routeKey],
  );

  const classification = classifyChangeExecution('UPDATE_PAGE_METADATA', sampleOps, projectKey);
  const authority = getProjectAuthority(projectKey);
  const implementationModeLabel = formatImplementationMode(projectKey, classification);
  const isSite00Native = authority?.executionMode === 'SITE00_NATIVE';
  const isFsbwCrossRepo = authority?.executionMode === 'CROSS_REPO_FSBW';

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

  const displaySourceRepo = summary?.sourceRepo ?? authority?.sourceRepo ?? null;
  const showFsbwReceiptStatus =
    !isSite00Native &&
    summary?.receipts?.some((r) => ['APPLYING', 'PR_CREATED', 'VALIDATED', 'MERGED', 'FAILED'].includes(r.status));

  return (
    <section className="site00-dw-repo-change" data-bridge="p0-bridge-1b">
      <header className="site00-dw-repo-change__header">
        <h3>REPO CHANGE HANDOFF</h3>
        <p>
          IMPLEMENTATION MODE:{' '}
          <strong>{summary?.implementationModeLabel ?? implementationModeLabel}</strong>
        </p>
        {isFsbwCrossRepo ? (
          <p>
            SOURCE REPO: <strong>{displaySourceRepo ?? 'yoteenz/fsbw'}</strong>
          </p>
        ) : null}
        {isSite00Native ? (
          <p className="site00-dw-repo-change__native-hint">Changes materialize in yoteenz/SITE00 — no FSBW bridge.</p>
        ) : null}
      </header>

      <div className="site00-dw-repo-change__actions">
        <button type="button" className="site00-dw-btn site00-dw-btn--primary" disabled={loading} onClick={() => void prepare()}>
          PREPARE REPO CHANGE
        </button>
        {changeRequestId && summary?.status === 'DRAFT' ? (
          <button type="button" className="site00-dw-btn" disabled={loading} onClick={() => void approveForRepo()}>
            {isSite00Native ? 'APPROVE FOR SITE 00 REPO' : 'APPROVE FOR SOURCE REPO'}
          </button>
        ) : null}
      </div>

      {error ? <p className="site00-dw-repo-change__error">{error}</p> : null}

      {summary ? (
        <dl className="site00-dw-repo-change__summary">
          <div><dt>PROJECT</dt><dd>{summary.project}</dd></div>
          <div><dt>PAGE / ROUTE</dt><dd>{summary.page ?? routeKey ?? '—'}</dd></div>
          <div><dt>SCOPE</dt><dd>{summary.scope}</dd></div>
          <div><dt>SOURCE REPO</dt><dd>{displaySourceRepo ?? '—'}</dd></div>
          {summary.executionMode ? (
            <div><dt>EXECUTION MODE</dt><dd>{summary.executionMode}</dd></div>
          ) : null}
          <div><dt>BASE COMMIT</dt><dd>{summary.baseCommit ?? '—'}</dd></div>
          <div><dt>STATUS</dt><dd>{summary.status}</dd></div>
          <div><dt>RISK</dt><dd>{summary.risk}</dd></div>
          <div><dt>OPERATIONS</dt><dd>{summary.operations?.length ?? 0}</dd></div>
          {showFsbwReceiptStatus ? (
            <div><dt>FSBW RECEIPTS</dt><dd>{summary.receipts.map((r) => r.status).join(', ')}</dd></div>
          ) : null}
        </dl>
      ) : null}
    </section>
  );
}
