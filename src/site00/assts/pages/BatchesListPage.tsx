import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { AsstsEnvironmentShell } from '../components/AsstsEnvironmentShell';
import { AsstsDevPanel, useAsstsAutoRefresh } from '../components/AsstsDevPanel';
import { AsstsBottomDock } from '../components/AsstsMobileNav';
import { AsstsPageShell } from '../components/AsstsPageShell';
import { AsstsBatchCard } from '../components/AsstsCards';
import { AsstsSectionHeader } from '../components/AsstsGlass';
import { ASSTS_ENVIRONMENT_SLOTS } from '../config/slots';
import { fetchAsstsLibrary } from '../services/asstsApi';
import { batchProgressPercent, batchStatusHint } from '../utils/batchHelpers';

export default function AsstsBatchesListPage() {
  const [batches, setBatches] = useState<Awaited<ReturnType<typeof fetchAsstsLibrary>>['summary']['batchesList']>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetchAsstsLibrary();
      setBatches(res.summary.batchesList);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  }, []);

  useAsstsAutoRefresh(load, { hasGenerating: false });

  return (
    <AsstsEnvironmentShell slotKey={ASSTS_ENVIRONMENT_SLOTS.library}>
      <AsstsPageShell variant="batches">
        <header className="assts-page-header assts-hero--spatial">
          <Link to="/assts" className="assts-back-link">
            ← LIBRARY
          </Link>
          <h1 className="assts-page-header__title">BATCHES</h1>
          <p className="assts-page-header__sub">Vault directory</p>
        </header>

        <AsstsDevPanel batchId={null} onRefresh={load} />

        {error ? (
          <div className="assts-alert assts-glass assts-glass--panel" role="alert">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="assts-batch-directory" aria-hidden="true">
            <div className="assts-skeleton assts-skeleton--batch-row" />
            <div className="assts-skeleton assts-skeleton--batch-row" />
          </div>
        ) : null}

        <div className="assts-batch-directory">
          <AsstsSectionHeader title="ALL BATCHES" />
          <div className="assts-batch-list">
            {batches.map((b) => (
              <AsstsBatchCard
                key={b.id}
                batchKey={b.batch_key}
                category={b.category}
                displayName={b.display_name}
                thumbnailUrl={b.thumbnailUrl}
                reviewedCount={b.counts?.approved ?? 0}
                totalCount={b.counts?.total ?? 0}
                progressPercent={batchProgressPercent(b.counts ?? {})}
                status={b.status}
                statusHint={batchStatusHint(b)}
                to={`/assts/batches/${b.id}`}
                variant="row"
              />
            ))}
          </div>
        </div>
      </AsstsPageShell>

      <AsstsBottomDock />
    </AsstsEnvironmentShell>
  );
}
