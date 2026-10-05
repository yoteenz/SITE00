/**
 * P0.VR.8R2 — Route Audit / Recovery inspector (Design → MORE).
 */

import { useMemo } from 'react';
import {
  buildRouteRecoveryInspectorState,
  getRouteAuditLineageBreak,
  recoverAllManagedProjectRoutes,
  getProjectRecoveryResult,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r2/client.js';

type Props = {
  projectId: string;
};

export function DesignRouteAuditRecoveryInspector({ projectId }: Props) {
  const inspector = useMemo(() => {
    recoverAllManagedProjectRoutes();
    return buildRouteRecoveryInspectorState(projectId);
  }, [projectId]);

  const projectResult = useMemo(() => getProjectRecoveryResult(projectId), [projectId]);
  const lineage = getRouteAuditLineageBreak();

  return (
    <section className="site00-dw-recovery-inspector" data-panel="route-audit-recovery">
      <header className="site00-dw-recovery-inspector__head">
        <h3>ROUTE AUDIT / RECOVERY</h3>
        <span className="site00-dw-recovery-inspector__status">{inspector.status}</span>
      </header>

      <dl className="site00-dw-recovery-inspector__grid">
        <div>
          <dt>PRIOR AUDIT FOUND</dt>
          <dd>{inspector.priorAuditFound ? 'YES' : 'NO'}</dd>
        </div>
        <div>
          <dt>LAST AUDIT ID</dt>
          <dd>{inspector.lastAuditId ?? '—'}</dd>
        </div>
        <div>
          <dt>PRIOR ROUTES (PROJECT)</dt>
          <dd>{projectResult?.priorRouteCount ?? inspector.priorRoutes}</dd>
        </div>
        <div>
          <dt>RECOVERED ROUTES</dt>
          <dd>{projectResult?.recoveredRouteCount ?? inspector.recoveredRoutes}</dd>
        </div>
        <div>
          <dt>CURRENT ROUTES</dt>
          <dd>{projectResult?.currentRouteCount ?? inspector.currentRoutes}</dd>
        </div>
        <div>
          <dt>UNCHANGED</dt>
          <dd>{inspector.unchanged}</dd>
        </div>
        <div>
          <dt>UPDATED</dt>
          <dd>{inspector.updated}</dd>
        </div>
        <div>
          <dt>NEW</dt>
          <dd>{inspector.newRoutes}</dd>
        </div>
        <div>
          <dt>REMOVED</dt>
          <dd>{inspector.removed}</dd>
        </div>
        <div>
          <dt>CAPTURES STALE</dt>
          <dd>{inspector.capturesStale}</dd>
        </div>
        <div>
          <dt>CAPTURES REFRESHING</dt>
          <dd>{inspector.capturesRefreshing}</dd>
        </div>
        <div>
          <dt>COMPLETION REFRESHING</dt>
          <dd>{inspector.completionRefreshing}</dd>
        </div>
      </dl>

      <div className="site00-dw-recovery-inspector__repos">
        <strong>REPOSITORIES RECOVERED</strong>
        <ul>
          {inspector.repositories.map((repo) => (
            <li key={repo.repositoryId}>
              {repo.repositoryName} — prior {repo.priorRouteCount} · current {repo.currentRouteCount} ·{' '}
              {repo.projectBindings.join(', ')}
            </li>
          ))}
        </ul>
      </div>

      <details className="site00-dw-recovery-inspector__lineage">
        <summary>LINEAGE BREAK</summary>
        <p>{lineage.breakDescription}</p>
        <p>
          <em>Previous:</em> {lineage.previousProducer}
        </p>
        <p>
          <em>Store:</em> {lineage.previousStore}
        </p>
        <p>
          <em>Consumer:</em> {lineage.currentConsumer}
        </p>
        <p>
          <em>Fix:</em> {lineage.missingAdapter}
        </p>
      </details>
    </section>
  );
}
