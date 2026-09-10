/**
 * P0.VR.MOF.R2 — Raw route audit diagnostics (details drawer only).
 */

import {
  buildRouteRecoveryInspectorState,
  getRouteAuditLineageBreak,
  getProjectRecoveryResult,
} from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r2/client.js';

type Props = {
  projectId: string;
};

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="site00-dw-more-tool__detail-section">
      <h4>{title}</h4>
      {children}
    </section>
  );
}

function DetailGrid({ rows }: { rows: Array<{ label: string; value: string }> }) {
  return (
    <dl className="site00-dw-more-tool__detail-grid">
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DesignRouteAuditDetailsContent({ projectId }: Props) {
  const inspector = buildRouteRecoveryInspectorState(projectId);
  const projectResult = getProjectRecoveryResult(projectId);
  const lineage = getRouteAuditLineageBreak();

  return (
    <div className="site00-dw-more-tool__details">
      <DetailSection title="AUDIT">
        <DetailGrid
          rows={[
            { label: 'LAST AUDIT ID', value: inspector.lastAuditId ?? '—' },
            { label: 'PRIOR AUDIT FOUND', value: inspector.priorAuditFound ? 'YES' : 'NO' },
            { label: 'STATUS', value: inspector.status },
          ]}
        />
      </DetailSection>

      <DetailSection title="RECONCILIATION">
        <DetailGrid
          rows={[
            { label: 'PRIOR ROUTES', value: String(projectResult?.priorRouteCount ?? inspector.priorRoutes) },
            { label: 'RECOVERED ROUTES', value: String(projectResult?.recoveredRouteCount ?? inspector.recoveredRoutes) },
            { label: 'CURRENT ROUTES', value: String(projectResult?.currentRouteCount ?? inspector.currentRoutes) },
            { label: 'UNCHANGED', value: String(inspector.unchanged) },
            { label: 'UPDATED', value: String(inspector.updated) },
            { label: 'NEW', value: String(inspector.newRoutes) },
            { label: 'REMOVED', value: String(inspector.removed) },
          ]}
        />
      </DetailSection>

      <DetailSection title="CAPTURE STATE">
        <DetailGrid
          rows={[
            { label: 'CAPTURES STALE', value: String(inspector.capturesStale) },
            { label: 'CAPTURES REFRESHING', value: String(inspector.capturesRefreshing) },
            { label: 'COMPLETION REFRESHING', value: String(inspector.completionRefreshing) },
          ]}
        />
      </DetailSection>

      <DetailSection title="REPOSITORIES RECOVERED">
        <ul className="site00-dw-more-tool__detail-list">
          {inspector.repositories.map((repo) => (
            <li key={repo.repositoryId}>
              {repo.repositoryName} — prior {repo.priorRouteCount} · current {repo.currentRouteCount}
            </li>
          ))}
        </ul>
      </DetailSection>

      <DetailSection title="LINEAGE BREAK">
        <p>{lineage.breakDescription}</p>
        <DetailGrid
          rows={[
            { label: 'PREVIOUS', value: lineage.previousProducer },
            { label: 'STORE', value: lineage.previousStore },
            { label: 'CONSUMER', value: lineage.currentConsumer },
            { label: 'FIX', value: lineage.missingAdapter },
          ]}
        />
      </DetailSection>
    </div>
  );
}
