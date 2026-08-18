import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AsstsEnvironmentShell } from '../components/AsstsEnvironmentShell';
import { AsstsDevPanel, useAsstsAutoRefresh } from '../components/AsstsDevPanel';
import { AsstsBottomDock, AsstsViewModeToggle, type BatchViewMode } from '../components/AsstsMobileNav';
import { AsstsPageShell } from '../components/AsstsPageShell';
import { AsstsAssetCard, AsstsBatchSummaryPanel } from '../components/AsstsCards';
import { AsstsLockConfirmSheet } from '../components/AsstsSheets';
import { ASSTS_ENVIRONMENT_SLOTS } from '../config/slots';
import { fetchAsstsBatch, lockAsstsBatch, type AsstsBatchDetail } from '../services/asstsApi';

export default function AsstsBatchPage() {
  const { batchId = '' } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<AsstsBatchDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locking, setLocking] = useState(false);
  const [lockOpen, setLockOpen] = useState(false);
  const [viewMode, setViewMode] = useState<BatchViewMode>('grid');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!batchId) return;
    try {
      setError(null);
      const res = await fetchAsstsBatch(batchId);
      setBatch(res.batch);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load batch');
    }
  }, [batchId]);

  const hasGenerating =
    batch?.status === 'GENERATING' ||
    (batch?.counts.regenerating ?? 0) > 0 ||
    batch?.assets.some((a) => a.status === 'GENERATING' || a.status === 'REGENERATING');

  useAsstsAutoRefresh(load, { hasGenerating: !!hasGenerating });

  const readyToLock = batch?.status === 'READY_TO_LOCK';
  const progressPercent =
    batch?.progressPercent ??
    (batch ? Math.round((batch.counts.approved / Math.max(batch.counts.total, 1)) * 100) : 0);

  const slotKeys = useMemo(
    () =>
      batch?.assets
        .filter((a) => a.approved_version_id)
        .map((a) => (a as { semantic_slot_key?: string | null }).semantic_slot_key ?? a.asset_key)
        .filter(Boolean) ?? [],
    [batch],
  );

  const handleLock = () => {
    if (!batch) return;
    setLocking(true);
    void lockAsstsBatch(batch.id)
      .then(() => {
        setLockOpen(false);
        return load();
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Lock failed'))
      .finally(() => setLocking(false));
  };

  const openAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    window.setTimeout(() => navigate(`/assts/${assetId}`), 120);
  };

  return (
    <AsstsEnvironmentShell slotKey={ASSTS_ENVIRONMENT_SLOTS.batch}>
      <AsstsPageShell variant="batch">
        <header className="assts-page-header assts-depth-surface">
          <Link to="/assts/batches" className="assts-back-link">
            ← BATCHES
          </Link>
          <h1 className="assts-page-header__title">{batch?.batch_key ?? 'BATCH'}</h1>
          <p className="assts-page-header__sub">{batch?.category ?? batch?.display_name}</p>
          {batch ? (
            <p className="assts-page-header__meta">
              {String(batch.counts.total).padStart(2, '0')} TOTAL ASSETS
            </p>
          ) : null}
        </header>

        {batch ? (
          <AsstsBatchSummaryPanel
            counts={batch.counts}
            progressPercent={progressPercent}
            compact
          />
        ) : null}

        <AsstsViewModeToggle mode={viewMode} onChange={setViewMode} showContact className="assts-view-mode-toggle--compact" />

        <AsstsDevPanel batchId={batchId} onRefresh={load} />

        {error ? (
          <div className="assts-alert assts-glass assts-glass--panel" role="alert">
            {error}
          </div>
        ) : null}

        {!batch?.assets.length ? (
          <p className="assts-empty">
            {hasGenerating ? 'Batch generating — assets will appear automatically.' : 'Batch empty or loading…'}
          </p>
        ) : viewMode === 'grid' ? (
          <div className="assts-review-wall">
            <div className="assts-review-grid" role="list">
              {batch.assets.map((asset) => (
                <AsstsAssetCard
                  key={asset.id}
                  assetKey={asset.asset_key}
                  displayName={asset.display_name}
                  environmentRoleLabel={(asset as { environmentRoleLabel?: string | null }).environmentRoleLabel}
                  environmentRoleSublabel={(asset as { environmentRoleSublabel?: string | null }).environmentRoleSublabel}
                  previewUrl={asset.currentVersion?.previewUrl}
                  status={asset.status}
                  selected={selectedAssetId === asset.id}
                  onClick={() => openAsset(asset.id)}
                />
              ))}
            </div>
          </div>
        ) : viewMode === 'contact' ? (
          <div className="assts-contact-sheet">
            {batch.assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                className="assts-contact-sheet__item"
                onClick={() => openAsset(asset.id)}
              >
                {asset.currentVersion?.previewUrl ? (
                  <img src={asset.currentVersion.previewUrl} alt="" loading="lazy" />
                ) : (
                  <div className="assts-contact-sheet__empty" />
                )}
                <span className="assts-mono">{asset.asset_key}</span>
              </button>
            ))}
          </div>
        ) : null}
      </AsstsPageShell>

      {batch ? (
        <div className="assts-batch-progress-bar assts-depth-floating">
          <div className="assts-batch-progress-bar__info">
            <span className="assts-batch-progress-bar__label">BATCH PROGRESS</span>
            <span className="assts-batch-progress-bar__count">
              {String(batch.counts.approved).padStart(2, '0')} / {String(batch.counts.total).padStart(2, '0')} APPROVED
            </span>
          </div>
          <div className="assts-batch-progress-bar__track">
            <div className="assts-batch-progress-bar__fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <button
            type="button"
            className="assts-batch-progress-bar__lock"
            disabled={!readyToLock || locking}
            onClick={() => setLockOpen(true)}
          >
            🔒 LOCK BATCH
          </button>
        </div>
      ) : null}

      <AsstsLockConfirmSheet
        open={lockOpen}
        busy={locking}
        batchKey={batch?.batch_key ?? ''}
        assetCount={batch?.counts.approved ?? 0}
        slotKeys={slotKeys}
        onClose={() => setLockOpen(false)}
        onConfirm={handleLock}
      />

      <AsstsBottomDock />
    </AsstsEnvironmentShell>
  );
}
