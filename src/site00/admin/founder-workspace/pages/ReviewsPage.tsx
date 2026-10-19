import { useEffect, useState } from 'react';
import { foundationAdminApi, type PipelineRow } from '../../services/foundationAdminApi';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';
import { useFounderWorkspaceOverlay } from '../overlay/OverlayContext';
import { IDNTY_FOUNDER_WORKSPACE_ROUTES } from '../config/routes';
import { Link } from 'react-router-dom';

export function ReviewsPage() {
  const { openOverlay } = useFounderWorkspaceOverlay();
  const [rows, setRows] = useState<PipelineRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<Array<{ approval_id: string; status: string; kind?: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void foundationAdminApi
      .pipeline()
      .then((j) => setRows(j.rows ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    void foundationAdminApi
      .detail(selectedId)
      .then((json) => {
        const list = (json as { approvals?: Array<{ approval_id: string; status: string; kind?: string }> }).approvals ?? [];
        setApprovals(list);
      })
      .catch(() => setApprovals([]));
  }, [selectedId]);

  const queue = rows.filter(
    (r) =>
      r.next_action?.toLowerCase().includes('review') ||
      r.next_action?.toLowerCase().includes('approval') ||
      r.current_stage?.toLowerCase().includes('quote'),
  );

  return (
    <FounderWorkspacePageFrame destination="reviews">
      <div className="ifw-reviews ifw-reviews__workbench">
        {error ? (
          <p role="alert" className="ifw-inline-error">
            {error}
          </p>
        ) : null}
        <div className="ifw-reviews__grid">
          <section className="ifw-panel">
            <h2 className="ifw-panel__title">Queue</h2>
            {!queue.length ? <p className="ifw-muted">No pipeline rows tagged for review.</p> : null}
            <ul className="ifw-queue">
              {queue.map((r) => (
                <li key={r.artifact_id}>
                  <button type="button" className="ifw-registry-row" onClick={() => setSelectedId(r.artifact_id)}>
                    <span>{r.business_name ?? r.artifact_id.slice(0, 8)}</span>
                    <span className="ifw-muted">{r.next_action ?? '—'}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <aside className="ifw-inspector">
            <h2 className="ifw-panel__title">Decision</h2>
            {!selectedId ? <p className="ifw-muted">Select a queue row</p> : null}
            {approvals.map((a) => (
              <div key={a.approval_id} className="ifw-review-card">
                <p>
                  {a.kind ?? 'Approval'} · {a.status}
                </p>
                <button
                  type="button"
                  className="ifw-btn ifw-btn--ghost"
                  onClick={() =>
                    openOverlay('OL-11', { artifact_id: selectedId, approval_id: a.approval_id })
                  }
                >
                  Request changes
                </button>
              </div>
            ))}
            {selectedId ? (
              <Link to={IDNTY_FOUNDER_WORKSPACE_ROUTES.client(selectedId)} className="ifw-btn ifw-btn--primary">
                Client record
              </Link>
            ) : null}
          </aside>
        </div>
      </div>
    </FounderWorkspacePageFrame>
  );
}
