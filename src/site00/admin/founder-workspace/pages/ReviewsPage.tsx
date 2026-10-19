import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { foundationAdminApi, type PipelineRow } from '../../services/foundationAdminApi';
import { SITE00_ROUTES } from '../../../config/routes';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';

export function ReviewsPage() {
  const [rows, setRows] = useState<PipelineRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void foundationAdminApi
      .pipeline()
      .then((j) => setRows(j.rows ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, []);

  const queue = rows.filter(
    (r) =>
      r.next_action?.toLowerCase().includes('review') ||
      r.next_action?.toLowerCase().includes('approval') ||
      r.current_stage?.toLowerCase().includes('quote'),
  );

  return (
    <FounderWorkspacePageFrame destination="reviews">
      <div className="ifw-reviews">
        {error ? (
          <p role="alert" className="ifw-inline-error">
            {error}
          </p>
        ) : null}
        <p className="ifw-lede">Review actions only where backend supports persistence — no client-side fake approval.</p>
        {!queue.length ? <p className="ifw-muted">Review queue empty (pipeline has no review-tagged next actions).</p> : null}
        <ul className="ifw-queue">
          {queue.map((r) => (
            <li key={r.artifact_id} className="ifw-queue__item">
              <div>
                <strong>{r.business_name ?? r.artifact_id.slice(0, 8)}</strong>
                <span className="ifw-muted">{r.current_stage ?? '—'}</span>
              </div>
              <p>{r.next_action ?? '—'}</p>
              {r.blocker ? <p className="ifw-inline-error">{r.blocker}</p> : null}
              <Link className="ifw-btn ifw-btn--ghost" to={SITE00_ROUTES.digitalFoundationAdminDetail.replace(':id', r.artifact_id)}>
                Open artifact admin
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </FounderWorkspacePageFrame>
  );
}
