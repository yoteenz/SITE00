import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { AsstsLibraryRecentBatchRow } from '../components/AsstsCards';
import { useAsstsAutoRefresh } from '../components/AsstsDevPanel';
import { AsstsVaultSubpageShell } from '../components/AsstsVaultSubpageShell';
import { fetchAsstsLibrary, type AsstsBatchSummary } from '../services/asstsApi';
import { batchStatusHint } from '../utils/batchHelpers';

export default function AsstsNotificationsPage() {
  const [needsReview, setNeedsReview] = useState<AsstsBatchSummary[]>([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetchAsstsLibrary();
      const reviewCount = res.summary?.needsReview ?? 0;
      setCount(reviewCount);
      const batches = (res.summary?.batchesList ?? []).filter((b) => {
        const hint = batchStatusHint(b).toUpperCase();
        return hint.includes('REVIEW') || hint.includes('NEED') || b.status === 'READY_TO_LOCK';
      });
      setNeedsReview(batches);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useAsstsAutoRefresh(load, { hasGenerating: false });

  return (
    <AsstsVaultSubpageShell title="NOTIFICATIONS." tagline="REVIEW SIGNALS FROM THE VAULT.">
      {error ? (
        <div className="assts-alert assts-glass assts-glass--panel" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? <p className="assts-library-home__empty-note">Loading notifications…</p> : null}

      {!loading && count === 0 ? (
        <p className="assts-library-home__status-strip">
          <span className="assts-library-home__status-strip-dot" aria-hidden="true" />
          ALL CLEAR — NOTHING NEEDS REVIEW
        </p>
      ) : null}

      {!loading && count > 0 ? (
        <>
          <div className="assts-library-home__section-head">
            <h2 className="assts-library-home__section-title">NEEDS ATTENTION</h2>
            <Link to="/assts?status=needs-review" className="assts-library-home__see-all">
              SEE ALL
            </Link>
          </div>
          <div className="assts-library-recent-list">
            {needsReview.map((b) => (
              <AsstsLibraryRecentBatchRow
                key={b.id}
                batchKey={b.batch_key}
                category={b.category}
                displayName={b.display_name}
                thumbnailUrl={b.thumbnailUrl}
                status={b.status}
                statusHint={batchStatusHint(b)}
                to={`/assts/batches/${b.id}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </AsstsVaultSubpageShell>
  );
}
