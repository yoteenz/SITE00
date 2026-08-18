import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LibraryHomeCompositionProvider } from '../composition/LibraryHomeCompositionContext';
import { LibraryHomeRegion } from '../composition/LibraryHomeRegion';
import { LibraryHomeReferenceMapDebug } from '../composition/LibraryHomeReferenceMapDebug';
import { LibraryHomeHeroZone } from '../composition/LibraryHomeHeroZone';
import { LibraryHomeHeroRefMapToggle } from '../composition/LibraryHomeHeroRefMapToggle';
import { AsstsDevPanel, useAsstsAutoRefresh } from '../components/AsstsDevPanel';
import { AsstsVaultNav } from '../components/AsstsMobileNav';
import { AsstsPageShell } from '../components/AsstsPageShell';
import {
  AsstsAssetListRow,
  AsstsLibraryCategoryCard,
  AsstsLibraryPriorityCard,
  AsstsLibraryRecentBatchTile,
} from '../components/AsstsCards';
import { AsstsLibraryShell } from '../components/AsstsLibraryShell';
import { fetchAsstsLibrary, type AsstsLibraryResponse } from '../services/asstsApi';
import { batchProgressPercent, batchStatusHint } from '../utils/batchHelpers';

const BROWSE_REGION_BY_CATEGORY: Record<string, 'browseLibrary.environments' | 'browseLibrary.objects' | 'browseLibrary.uiGraphics' | 'browseLibrary.brandSystems' | 'browseLibrary.projectAssets'> = {
  environments: 'browseLibrary.environments',
  objects: 'browseLibrary.objects',
  'ui-graphics': 'browseLibrary.uiGraphics',
  'brand-systems': 'browseLibrary.brandSystems',
  'project-assets': 'browseLibrary.projectAssets',
};

const RECENT_BATCH_SLOTS = ['recentBatches.card01', 'recentBatches.card02', 'recentBatches.card03'] as const;

function batchNeedsAttention(priority: AsstsLibraryResponse['priorityBatch']): boolean {
  if (!priority) return false;
  const counts = priority.counts ?? { needsReview: 0, regenerating: 0 };
  if (priority.status === 'READY_TO_LOCK') return true;
  if ((counts.needsReview ?? 0) > 0) return true;
  if ((counts.regenerating ?? 0) > 0 || priority.status === 'GENERATING') return true;
  return false;
}

function AsstsLibraryPageContent() {
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') ?? '';
  const categoryFilter = searchParams.get('category') ?? '';
  const viewAll = searchParams.get('view') === 'all';

  const [data, setData] = useState<AsstsLibraryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetchAsstsLibrary({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        view: viewAll ? 'all' : undefined,
      });
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load library');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, viewAll]);

  const generating =
    data?.priorityBatch?.status === 'GENERATING' ||
    (data?.priorityBatch?.counts?.regenerating ?? 0) > 0;

  useAsstsAutoRefresh(load, { hasGenerating: generating });

  const summary = data?.summary;
  const priority = data?.priorityBatch;
  const showPriority = priority && batchNeedsAttention(priority);
  const filteredAssets = data?.filteredAssets;
  const showFiltered = Boolean(statusFilter || categoryFilter || viewAll);
  const needsReviewCount = summary?.needsReview ?? 0;
  const batchesList = summary?.batchesList ?? [];
  const categories = data?.categories ?? [];
  const recentThree = batchesList.slice(0, 3);

  const activeMetric = useMemo(() => {
    if (statusFilter === 'needs-review') return 'needs-review';
    if (statusFilter === 'approved') return 'approved';
    if (viewAll) return 'all';
    return null;
  }, [statusFilter, viewAll]);

  const priorityProgress = priority ? batchProgressPercent(priority.counts ?? {}) : 0;

  if (showFiltered && filteredAssets) {
    return (
      <AsstsPageShell variant="library">
        <div className="assts-library-home assts-library-home--filtered">
          <header className="assts-library-home__header">
            <div className="assts-library-home__header-copy">
              <p className="assts-library-home__eyebrow site00-label-red">SITE 00 · ASSTS</p>
              <h1 className="assts-library-home__title">FILTERED LIBRARY</h1>
            </div>
          </header>
          <div className="assts-library-home__section-head">
            <h2 className="assts-library-home__section-title">
              {statusFilter === 'needs-review'
                ? 'NEEDS REVIEW'
                : statusFilter === 'approved'
                  ? 'APPROVED'
                  : 'ALL ASSETS'}
            </h2>
            <Link to="/assts" className="assts-library-home__see-all">
              CLEAR
            </Link>
          </div>
          <div className="assts-filtered-list">
            {filteredAssets.length === 0 ? (
              <p className="assts-empty">No assets match this filter.</p>
            ) : (
              filteredAssets.map((a) => (
                <AsstsAssetListRow
                  key={a.id}
                  assetKey={a.asset_key}
                  displayName={a.display_name}
                  previewUrl={a.currentVersion?.previewUrl}
                  status={a.status}
                  to={`/assts/${a.id}`}
                />
              ))
            )}
          </div>
        </div>
      </AsstsPageShell>
    );
  }

  return (
    <AsstsPageShell variant="library">
      <LibraryHomeHeroZone />

      {summary ? (
        <>
          <LibraryHomeRegion id="stats.assets">
            <Link
              to="/assts?view=all"
              className={`assts-lib-stat ${activeMetric === 'all' ? 'assts-lib-stat--active' : ''}`}
            >
              <span className="assts-lib-stat__value">{summary.totalAssets}</span>
              <span className="assts-lib-stat__label">ASSETS</span>
            </Link>
          </LibraryHomeRegion>
          <LibraryHomeRegion id="stats.batches">
            <Link to="/assts/batches" className="assts-lib-stat">
              <span className="assts-lib-stat__value">{summary.batches}</span>
              <span className="assts-lib-stat__label">BATCHES</span>
            </Link>
          </LibraryHomeRegion>
          <LibraryHomeRegion id="stats.needReview">
            <Link
              to="/assts?status=needs-review"
              className={`assts-lib-stat ${activeMetric === 'needs-review' ? 'assts-lib-stat--active' : ''}`}
            >
              <span className="assts-lib-stat__value assts-lib-stat__value--review">{summary.needsReview}</span>
              <span className="assts-lib-stat__label">NEED REVIEW</span>
            </Link>
          </LibraryHomeRegion>
          <LibraryHomeRegion id="stats.approved">
            <Link
              to="/assts?status=approved"
              className={`assts-lib-stat ${activeMetric === 'approved' ? 'assts-lib-stat--active' : ''}`}
            >
              <span className="assts-lib-stat__value">{summary.approved}</span>
              <span className="assts-lib-stat__label">APPROVED</span>
            </Link>
          </LibraryHomeRegion>
        </>
      ) : loading ? (
        <>
          {(['stats.assets', 'stats.batches', 'stats.needReview', 'stats.approved'] as const).map((id) => (
            <LibraryHomeRegion key={id} id={id}>
              <div className="assts-lib-stat assts-lib-stat--skeleton" aria-hidden="true" />
            </LibraryHomeRegion>
          ))}
        </>
      ) : null}

      <LibraryHomeRegion id="status">
        {generating ? (
          <p className="assts-lib-status-strip assts-lib-status-strip--generating">
            <span className="assts-lib-status-strip__dot" aria-hidden="true" />
            GENERATION IN PROGRESS
          </p>
        ) : needsReviewCount === 0 ? (
          <p className="assts-lib-status-strip">
            <span className="assts-lib-status-strip__dot" aria-hidden="true" />
            ALL CLEAR — NOTHING NEEDS REVIEW
          </p>
        ) : (
          <p className="assts-lib-status-strip assts-lib-status-strip--attention">
            <span className="assts-lib-status-strip__dot assts-lib-status-strip__dot--review" aria-hidden="true" />
            {needsReviewCount} ITEM{needsReviewCount === 1 ? '' : 'S'} NEED REVIEW
          </p>
        )}
      </LibraryHomeRegion>

      <LibraryHomeRegion id="needsReview.header" className="assts-lib-section-head">
        <h2 className="assts-lib-section-title">NEEDS YOUR REVIEW</h2>
        <Link
          to={priority ? `/assts/batches/${priority.id}` : '/assts?status=needs-review'}
          className="assts-lib-see-all"
        >
          See All
        </Link>
      </LibraryHomeRegion>

      {showPriority && priority ? (
        <LibraryHomeRegion id="needsReview.card">
          <AsstsLibraryPriorityCard
            batchKey={priority.batch_key}
            category={priority.category}
            displayName={priority.display_name}
            thumbnailUrl={priority.thumbnailUrl}
            reviewedCount={priority.counts?.approved ?? 0}
            totalCount={priority.counts?.total ?? 0}
            progressPercent={priority.progressPercent ?? priorityProgress}
            to={`/assts/batches/${priority.id}`}
          />
        </LibraryHomeRegion>
      ) : (
        <LibraryHomeRegion id="needsReview.cardEmpty">
          <p className="assts-lib-empty-card">
            {needsReviewCount > 0
              ? `${needsReviewCount} asset${needsReviewCount === 1 ? '' : 's'} awaiting review — open See All`
              : 'No batches awaiting review right now'}
          </p>
        </LibraryHomeRegion>
      )}

      <LibraryHomeRegion id="recentBatches.header" className="assts-lib-section-head">
        <h2 className="assts-lib-section-title">RECENT BATCHES</h2>
        <Link to="/assts/batches" className="assts-lib-see-all">
          See All
        </Link>
      </LibraryHomeRegion>

      {RECENT_BATCH_SLOTS.map((slotId, index) => {
        const batch = recentThree[index];
        return (
          <LibraryHomeRegion key={slotId} id={slotId}>
            {batch ? (
              <AsstsLibraryRecentBatchTile
                batchKey={batch.batch_key}
                category={batch.category}
                displayName={batch.display_name}
                thumbnailUrl={batch.thumbnailUrl}
                status={batch.status}
                statusHint={batchStatusHint(batch)}
                to={`/assts/batches/${batch.id}`}
              />
            ) : (
              <div className="assts-lib-recent-tile assts-lib-recent-tile--empty" aria-hidden="true" />
            )}
          </LibraryHomeRegion>
        );
      })}

      <LibraryHomeRegion id="browseLibrary.header">
        <h2 className="assts-lib-section-title">BROWSE LIBRARY</h2>
      </LibraryHomeRegion>

      {categories.map((cat) => {
        const regionId = BROWSE_REGION_BY_CATEGORY[cat.id];
        if (!regionId) return null;
        return (
          <LibraryHomeRegion key={cat.id} id={regionId}>
            <AsstsLibraryCategoryCard
              id={cat.id}
              label={cat.label}
              count={cat.count}
              coverUrl={cat.coverUrl}
              to={`/assts?category=${cat.id}`}
              compact
            />
          </LibraryHomeRegion>
        );
      })}

      <div className="assts-lib-overlay-chrome">
        <AsstsDevPanel batchId={priority?.id ?? null} onRefresh={load} />
        {error ? (
          <div className="assts-alert assts-glass assts-glass--panel" role="alert">
            {error}
          </div>
        ) : null}
        <LibraryHomeReferenceMapDebug />
        <LibraryHomeHeroRefMapToggle />
      </div>
    </AsstsPageShell>
  );
}

export default function AsstsLibraryPage() {
  return (
    <AsstsLibraryShell scrollLayout>
      <LibraryHomeCompositionProvider>
        <AsstsLibraryPageContent />
        <AsstsVaultNav />
      </LibraryHomeCompositionProvider>
    </AsstsLibraryShell>
  );
}
