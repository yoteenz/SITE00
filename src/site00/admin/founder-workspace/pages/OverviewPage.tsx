import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { foundationAdminApi, type FoundationAdminListRow, type PipelineRow } from '../../services/foundationAdminApi';
import { IDNTY_FOUNDER_WORKSPACE_ROUTES } from '../config/routes';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';

export function OverviewPage() {
  const [artifacts, setArtifacts] = useState<FoundationAdminListRow[]>([]);
  const [pipeline, setPipeline] = useState<PipelineRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [list, pipe] = await Promise.all([foundationAdminApi.list(), foundationAdminApi.pipeline()]);
        setArtifacts(list.artifacts ?? []);
        setPipeline(pipe.rows ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Load failed');
      }
    })();
  }, []);

  const metrics = useMemo(() => {
    const total = artifacts.length;
    const intakeComplete = artifacts.filter((a) => a.intake_state === 'COMPLETE').length;
    const paid = artifacts.filter((a) => a.payment_state === 'PAID').length;
    const blocked = pipeline.filter((r) => r.blocker).length;
    const reviewQueue = pipeline.filter((r) => r.next_action?.toLowerCase().includes('review')).length;
    return { total, intakeComplete, paid, blocked, reviewQueue };
  }, [artifacts, pipeline]);

  return (
    <FounderWorkspacePageFrame destination="overview">
      <div className="ifw-overview">
        {error ? (
          <p role="alert" className="ifw-inline-error">
            {error}
          </p>
        ) : null}
        <div className="ifw-metric-grid">
          <div className="ifw-metric">
            <span className="ifw-metric__label">Total clients</span>
            <span className="ifw-metric__value">{metrics.total}</span>
          </div>
          <div className="ifw-metric">
            <span className="ifw-metric__label">Intake complete</span>
            <span className="ifw-metric__value">{metrics.intakeComplete}</span>
          </div>
          <div className="ifw-metric">
            <span className="ifw-metric__label">Paid</span>
            <span className="ifw-metric__value">{metrics.paid}</span>
          </div>
          <div className="ifw-metric">
            <span className="ifw-metric__label">Pipeline blockers</span>
            <span className="ifw-metric__value">{metrics.blocked}</span>
          </div>
        </div>
        <section className="ifw-panel">
          <h2 className="ifw-panel__title">Next focus</h2>
          <p className="ifw-lede">
            {metrics.reviewQueue > 0
              ? `${metrics.reviewQueue} pipeline row(s) mention review — open Reviews.`
              : metrics.blocked > 0
                ? `${metrics.blocked} blocked operational row(s) — open Operations.`
                : 'Registry clear — create or inspect a foundation record.'}
          </p>
          <div className="ifw-actions-row">
            <Link className="ifw-btn ifw-btn--primary" to={IDNTY_FOUNDER_WORKSPACE_ROUTES.foundations}>
              Open foundations
            </Link>
            <Link className="ifw-btn ifw-btn--ghost" to={IDNTY_FOUNDER_WORKSPACE_ROUTES.reviews}>
              Reviews
            </Link>
          </div>
        </section>
        <section className="ifw-panel">
          <h2 className="ifw-panel__title">Recent activity</h2>
          <ul className="ifw-activity-list">
            {artifacts
              .slice()
              .sort((a, b) => String(b.last_activity_at ?? b.created_at).localeCompare(String(a.last_activity_at ?? a.created_at)))
              .slice(0, 6)
              .map((a) => (
                <li key={a.artifact_id}>
                  <Link to={IDNTY_FOUNDER_WORKSPACE_ROUTES.client(a.artifact_id)} className="fw-data">
                    {a.business_name || a.artifact_id.slice(0, 8)}
                  </Link>
                  <span className="ifw-muted">{a.state}</span>
                </li>
              ))}
            {!artifacts.length ? <li className="ifw-muted">No persisted artifacts yet</li> : null}
          </ul>
        </section>
      </div>
    </FounderWorkspacePageFrame>
  );
}
