/**
 * B5.2 / B5.4 — Entry 001 Campaign Package page (reference-fidelity operate surface).
 */

import { useCallback, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import type {
  Entry001ArchiveFilter,
  Entry001AssetType,
  Entry001CampaignAsset,
  Entry001ContentRole,
} from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import {
  site00ProjectContentOperationsCampaignBoardPath,
  site00ProjectLabPath,
} from '../../../config/routes';
import { compileEntry001ArchiveDerivationPlan } from './entry001ArchiveDerivationPlan.js';
import { buildEntry001WhatsLeft } from './entry001PackageReadiness.js';
import { entry001NarrativeDescriptor } from './entry001NarrativeContinuity.js';
import { useEntry001PackageState } from './useEntry001PackageState.js';
import { ENTRY_001_TITLE } from '../../../../../shared/site00-expression-engine/constants.js';
import {
  ENTRY001_ASSET_TYPE_LABELS,
  ENTRY001_CONTENT_ROLE_LABELS,
  ENTRY001_INGESTION_ROLE_OPTIONS,
  ENTRY001_INGESTION_TYPE_OPTIONS,
} from './entry001AssetTaxonomy.js';
import { Entry001ClassificationSheet } from './Entry001ClassificationSheet.js';
import { Entry001PackageNav } from './Entry001PackageNav.js';
import { Entry001PackageContentSection } from './Entry001PackageContentSection.js';
import { Entry001PostUploadSuccess } from './Entry001PostUploadSuccess.js';
import { entry001DeliverablePath, entry001PreviewPath } from './Entry001PackageNav.js';
import { buildArchiveIntelligencePreviewSnapshot } from './entry001PackagePreview.js';

type Props = {
  projectSlug: string;
};

const FILTERS: { id: Entry001ArchiveFilter; label: string }[] = [
  { id: 'ALL', label: 'ALL' },
  { id: 'REEL', label: 'REEL' },
  { id: 'CAROUSEL', label: 'CAROUSEL' },
  { id: 'STORY', label: 'STORY' },
  { id: 'X', label: 'X' },
  { id: 'TIKTOK', label: 'TIKTOK' },
  { id: 'STATIC', label: 'STATIC' },
];

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <path d="M2.5 7.2 5.4 10l6.1-6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path d="M9 2 2 6l7 4 7-4-7-4Zm0 6L2 12l7 4 7-4-7-4Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <path d="M8 1v3M8 12v3M1 8h3M12 8h3M3.05 3.05l2.12 2.12M10.83 10.83l2.12 2.12M3.05 12.95l2.12-2.12M10.83 5.17l2.12-2.12" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function AssetPreviewModal({
  asset,
  onClose,
  onRemove,
  onReclassify,
}: {
  asset: Entry001CampaignAsset | null;
  onClose: () => void;
  onRemove: (id: string) => void;
  onReclassify: (id: string, type: Entry001AssetType, role: Entry001ContentRole | null) => void;
}) {
  const [editType, setEditType] = useState<Entry001AssetType | null>(null);
  const [editRole, setEditRole] = useState<Entry001ContentRole | null>(null);

  if (!asset) return null;

  const typeVal = editType ?? asset.assetType;
  const roleVal = editRole ?? asset.assetRole ?? null;

  return (
    <div className="site00-e001-package__modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="site00-e001-package__modal-inner" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="site00-e001-package__modal-close" onClick={onClose}>
          CLOSE
        </button>
        {asset.format === 'VIDEO' ? (
          <video src={asset.filePath} controls className="site00-e001-package__modal-media" />
        ) : (
          <img src={asset.filePath} alt={asset.title} className="site00-e001-package__modal-media" />
        )}
        <p className="site00-e001-package__modal-title">{asset.title}</p>
        <dl className="site00-e001-package__modal-meta-list">
          <div>
            <dt>TYPE</dt>
            <dd>
              <select value={typeVal} onChange={(e) => setEditType(e.target.value as Entry001AssetType)}>
                {ENTRY001_INGESTION_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {ENTRY001_ASSET_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </dd>
          </div>
          <div>
            <dt>ROLE</dt>
            <dd>
              <select
                value={roleVal ?? ''}
                onChange={(e) => setEditRole((e.target.value || null) as Entry001ContentRole | null)}
              >
                <option value="">—</option>
                {ENTRY001_INGESTION_ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {ENTRY001_CONTENT_ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </dd>
          </div>
          <div>
            <dt>STATUS</dt>
            <dd>{asset.status}</dd>
          </div>
          <div>
            <dt>SOURCE</dt>
            <dd>{asset.source}</dd>
          </div>
          <div>
            <dt>VERSION</dt>
            <dd>{asset.version}</dd>
          </div>
          {asset.sequenceIndex != null && (
            <div>
              <dt>SEQUENCE</dt>
              <dd>{String(asset.sequenceIndex).padStart(2, '0')}</dd>
            </div>
          )}
          {asset.packageId && (
            <div>
              <dt>PARENT PACKAGE</dt>
              <dd>{asset.packageId}</dd>
            </div>
          )}
        </dl>
        <div className="site00-e001-package__modal-actions">
          <button
            type="button"
            onClick={() => {
              onReclassify(asset.assetId, typeVal, roleVal);
              onClose();
            }}
          >
            SAVE CLASSIFICATION
          </button>
          <button type="button" className="site00-e001-package__modal-remove" onClick={() => onRemove(asset.assetId)}>
            REMOVE FROM ARCHIVE
          </button>
        </div>
      </div>
    </div>
  );
}

export function Entry001CampaignPackageWorkspace({ projectSlug }: Props) {
  const {
    heroAsset,
    archiveGroups,
    archivedAssets,
    missingDeliverables,
    readiness,
    intelligence,
    addAssetForRole,
    batchAddAssets,
    approvedArchiveCount,
    archiveFilter,
    setArchiveFilter,
    pendingQueue,
    updatePendingClassification,
    acceptAllPendingAndApply,
    dismissPendingQueue,
    setPendingAccepted,
    removeFromArchive,
    restoreToArchive,
    reclassifyAsset,
    deliverables,
    formatSummaries,
    packagePreview,
    postUploadSuccess,
    dismissPostUploadSuccess,
    saveState,
    saveError,
    syncRequired,
    retrySync,
  } = useEntry001PackageState();

  const [preview, setPreview] = useState<Entry001CampaignAsset | null>(null);
  const [derivePlanOpen, setDerivePlanOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const batchRef = useRef<HTMLInputElement>(null);
  const pendingRoleRef = useRef<Entry001CampaignAsset['role'] | null>(null);

  const activeArchiveForPlan = useMemo(
    () => archiveGroups.flatMap((g) => g.assets),
    [archiveGroups],
  );

  const derivationPlan = useMemo(
    () => compileEntry001ArchiveDerivationPlan(activeArchiveForPlan),
    [activeArchiveForPlan],
  );
  const whatsLeft = useMemo(() => buildEntry001WhatsLeft(readiness), [readiness]);
  const previewIntel = useMemo(
    () => buildArchiveIntelligencePreviewSnapshot(deliverables),
    [deliverables],
  );
  const previewPath = entry001PreviewPath(projectSlug);

  const boardPath = site00ProjectContentOperationsCampaignBoardPath(projectSlug);
  const labPath = site00ProjectLabPath(projectSlug);

  const handleUploadClick = useCallback((role: Entry001CampaignAsset['role']) => {
    pendingRoleRef.current = role;
    uploadRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const role = pendingRoleRef.current;
      if (file && role) {
        addAssetForRole(role, file, true);
      }
      e.target.value = '';
      pendingRoleRef.current = null;
    },
    [addAssetForRole],
  );

  const handleBatchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) batchAddAssets(e.target.files);
      e.target.value = '';
    },
    [batchAddAssets],
  );

  const completeDeliverables = readiness.approvedAssetCount;
  const totalDeliverables = readiness.requiredAssetCount;

  return (
    <div className="site00-e001-package site00-fws-mobile-content-shell" data-visual-reconstruction="entry001-campaign-package-b55">
      <input ref={uploadRef} type="file" accept="image/*,video/*" hidden onChange={handleFileChange} />
      <input ref={batchRef} type="file" accept="image/*,video/*" multiple hidden onChange={handleBatchChange} />

      <Entry001PackageNav projectSlug={projectSlug} />

      <nav className="site00-e001-package__breadcrumb" aria-label="Campaign navigation">
        <Link to={labPath}>LAB HUB</Link>
        <span aria-hidden>›</span>
        <Link to={boardPath}>CAMPAIGN BOARD</Link>
        <span className="site00-e001-package__breadcrumb-site">SITE 00</span>
        <span className="site00-e001-package__save-status" aria-live="polite">
          {saveState === 'loading' && 'LOADING…'}
          {saveState === 'saving' && 'SAVING…'}
          {saveState === 'saved' && 'SAVED'}
          {saveState === 'failed' && 'SAVE FAILED'}
        </span>
      </nav>

      {syncRequired && (
        <div className="site00-e001-package__sync-banner" role="alert">
          <p>PACKAGE SYNC REQUIRED</p>
          <p>Your local package could not be migrated safely.</p>
          <button type="button" onClick={() => void retrySync()}>
            RETRY SYNC
          </button>
        </div>
      )}

      {saveError && saveState === 'failed' && !syncRequired && (
        <div className="site00-e001-package__sync-banner" role="alert">
          <p>{saveError}</p>
          <button type="button" onClick={() => void retrySync()}>
            RETRY
          </button>
        </div>
      )}

      <section className="site00-e001-package__hero">
        <div className="site00-e001-package__hero-copy">
          <span className="site00-e001-package__entry-tag">ENTRY 001</span>
          <h1 className="site00-e001-package__hero-title">{ENTRY_001_TITLE}</h1>
          <p className="site00-e001-package__hero-subject">BRITNEY SPEARS / MEDIA COMPLICITY</p>
          <p className="site00-e001-package__hero-thesis">{entry001NarrativeDescriptor()}</p>
          <span className="site00-e001-package__status-pill">
            <CheckIcon /> ARCHIVE CAPTURED
          </span>
        </div>
        <button
          type="button"
          className="site00-e001-package__hero-visual"
          onClick={() => setPreview(heroAsset)}
        >
          <img src={heroAsset.filePath} alt="Entry 001 hero" />
          <span className="site00-e001-package__hero-note">PUBLIC MEMORY DESERVES BETTER.</span>
        </button>
      </section>

      <section className="site00-e001-package__section" id="archive">
        <header className="site00-e001-package__section-head">
          <span className="site00-e001-package__section-icon">
            <LayersIcon />
          </span>
          <h2>APPROVED ARCHIVE</h2>
          <span className="site00-e001-package__section-meta">
            {approvedArchiveCount} ACTIVE ASSETS ›
          </span>
        </header>

        <div className="site00-e001-package__archive-filters" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={archiveFilter === f.id}
              className={archiveFilter === f.id ? 'is-active' : undefined}
              onClick={() => setArchiveFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {archiveGroups.map((group) => (
          <div key={group.type} className="site00-e001-package__archive-group">
            <h3>
              {group.label} · {group.assets.length} ASSET{group.assets.length === 1 ? '' : 'S'}
            </h3>
            <div className="site00-e001-package__archive-grid">
              {group.assets.map((asset) => (
                <div key={asset.assetId} className="site00-e001-package__archive-card-wrap">
                  <button
                    type="button"
                    className="site00-e001-package__archive-card"
                    onClick={() => setPreview(asset)}
                  >
                    <img src={asset.filePath} alt={asset.title} loading="lazy" />
                    <span className="site00-e001-package__archive-type">
                      {ENTRY001_ASSET_TYPE_LABELS[asset.assetType]}
                    </span>
                    {asset.assetRole && (
                      <span className="site00-e001-package__archive-role">
                        {ENTRY001_CONTENT_ROLE_LABELS[asset.assetRole]}
                      </span>
                    )}
                    <span className="site00-e001-package__archive-status">APPROVED</span>
                  </button>
                  <button
                    type="button"
                    className="site00-e001-package__archive-overflow"
                    aria-label="Remove from archive"
                    onClick={() => removeFromArchive(asset.assetId)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button type="button" className="site00-e001-package__batch-btn" onClick={() => batchRef.current?.click()}>
          + ADD ASSETS
        </button>

        {archivedAssets.length > 0 && (
          <details
            className="site00-e001-package__history"
            open={historyOpen}
            onToggle={(e) => setHistoryOpen((e.target as HTMLDetailsElement).open)}
          >
            <summary>ARCHIVED / REMOVED ({archivedAssets.length})</summary>
            <ul>
              {archivedAssets.map((a) => (
                <li key={a.assetId}>
                  <span>{a.title}</span>
                  <button type="button" onClick={() => restoreToArchive(a.assetId)}>
                    RESTORE
                  </button>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      <Entry001PackageContentSection projectSlug={projectSlug} summaries={formatSummaries} />

      <section className="site00-e001-package__section" id="remaining">
        <header className="site00-e001-package__section-head">
          <span className="site00-e001-package__section-icon site00-e001-package__section-icon--dashed" />
          <h2>REMAINING DELIVERABLES</h2>
          <span className="site00-e001-package__section-meta">
            {completeDeliverables} / {totalDeliverables} COMPLETE ›
          </span>
        </header>
        <Link to={previewPath} className="site00-e001-package__preview-package-link">
          PREVIEW PACKAGE
        </Link>
        <div className="site00-e001-package__deliverables-row">
          {missingDeliverables.map((slot) => {
            const isMissing = slot.status === 'MISSING' || !slot.filePath;
            const deliverable = deliverables.find(
              (d) => d.assetType === slot.assetType && !d.removedFromPackage && d.filePath,
            );
            return (
              <div key={slot.assetId} className="site00-e001-package__deliverable-slot">
                <button
                  type="button"
                  className={`site00-e001-package__deliverable-box${isMissing ? '' : ' site00-e001-package__deliverable-box--filled'}`}
                  onClick={() => {
                    if (slot.filePath) setPreview(slot);
                    else handleUploadClick(slot.role);
                  }}
                >
                  {slot.filePath ? (
                    slot.format === 'VIDEO' ? (
                      <video src={slot.filePath} muted />
                    ) : (
                      <img src={slot.filePath} alt={slot.title} />
                    )
                  ) : (
                    <span className="site00-e001-package__deliverable-plus">+</span>
                  )}
                </button>
                <p className="site00-e001-package__deliverable-label">{slot.title}</p>
                <p className="site00-e001-package__deliverable-status">
                  {isMissing ? 'Pending' : slot.approved ? 'APPROVED ✓' : slot.status}
                </p>
                {isMissing ? (
                  <button
                    type="button"
                    className="site00-e001-package__upload-link"
                    onClick={() => handleUploadClick(slot.role)}
                  >
                    UPLOAD ASSET
                  </button>
                ) : deliverable ? (
                  <div className="site00-e001-package__deliverable-actions">
                    <Link to={entry001DeliverablePath(projectSlug, deliverable.deliverableId)}>VIEW</Link>
                    <Link to={entry001DeliverablePath(projectSlug, deliverable.deliverableId)}>EDIT</Link>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <div className="site00-e001-package__footer-cards">
        <section className="site00-e001-package__intel-card">
          <header>
            <SparkleIcon />
            <h3>AI CREATIVE INTELLIGENCE</h3>
          </header>
          <ul>
            <li className={readiness.derivationReady ? 'site00-e001-package__intel-on' : ''}>
              <CheckIcon /> DERIVE FROM ARCHIVE
            </li>
            <li className={readiness.styleContinuityLocked ? 'site00-e001-package__intel-on' : ''}>
              <CheckIcon /> STYLE CONTINUITY LOCKED
            </li>
            <li>
              TYPES PRESENT: {intelligence.existingAssetTypes.slice(0, 4).join(', ')}
              {intelligence.existingAssetTypes.length > 4 ? '…' : ''}
            </li>
            <li>
              PREVIEW STRUCTURE: {previewIntel.previewStructureExposed ? 'EXPOSED' : 'HIDDEN'} ·{' '}
              {previewIntel.activeDeliverableCount} deliverables
            </li>
            <li>
              PACKAGE PREVIEW: {packagePreview.previewReadiness} · BOARD:{' '}
              {packagePreview.campaignBoardEligibility ? 'ELIGIBLE' : 'LOCKED'}
            </li>
            {intelligence.doNotRegenerateTypes.length > 0 && (
              <li>DO NOT REGENERATE: {intelligence.doNotRegenerateTypes.join(', ')}</li>
            )}
            <li className={readiness.derivationReady ? 'site00-e001-package__intel-ready' : ''}>
              {readiness.derivationReady ? 'READY TO GENERATE' : 'AWAITING ARCHIVE COVERAGE'}
            </li>
          </ul>
          <button
            type="button"
            className="site00-e001-package__derive-btn"
            disabled={!readiness.derivationReady}
            onClick={() => setDerivePlanOpen((v) => !v)}
          >
            DERIVE FROM ARCHIVE
          </button>
          {derivePlanOpen && (
            <div className="site00-e001-package__derive-plan">
              {derivationPlan.targets.map((t) => (
                <p key={t.targetAssetType}>
                  <strong>{t.targetAssetType}</strong> — sources: {t.sourceAssetTypes.join(', ') || 'none'} ·{' '}
                  {t.generationStrategy}
                </p>
              ))}
              <p className="site00-e001-package__derive-note">
                Provider dispatch: {derivationPlan.providerDispatchCount} · Founder approval required
              </p>
            </div>
          )}
        </section>

        <section className="site00-e001-package__left-card">
          <header>
            <span className="site00-e001-package__list-icon" aria-hidden />
            <h3>WHAT&apos;S LEFT</h3>
          </header>
          <ul className="site00-e001-package__checklist">
            {whatsLeft.map((item) => (
              <li key={item.id} className={item.complete ? 'site00-e001-package__check-done' : ''}>
                <span className="site00-e001-package__check-dot" aria-hidden />
                {item.label}
              </li>
            ))}
          </ul>
          <p className="site00-e001-package__finish-note">FINISH THE STORY.</p>
        </section>
      </div>

      <div className="site00-e001-package__package-status">
        <p>
          ENTRY 001 SOCIAL PACKAGE —{' '}
          <strong>{readiness.packageStatus === 'COMPLETE' ? 'COMPLETE' : 'INCOMPLETE'}</strong>
        </p>
        <p>
          PACKAGE PREVIEW — <strong>{readiness.previewReadiness}</strong>
        </p>
        <p>
          CAMPAIGN BOARD DEPLOYMENT —{' '}
          <strong>{readiness.campaignBoardEligible ? 'ELIGIBLE' : 'LOCKED'}</strong>
        </p>
      </div>

      {postUploadSuccess && (
        <Entry001PostUploadSuccess
          projectSlug={projectSlug}
          success={postUploadSuccess}
          onDismiss={dismissPostUploadSuccess}
        />
      )}

      {pendingQueue.length > 0 && (
        <Entry001ClassificationSheet
          queue={pendingQueue}
          onUpdate={updatePendingClassification}
          onAccept={(id) => setPendingAccepted(id, true)}
          onApplyAll={acceptAllPendingAndApply}
          onApplyTypeToAll={(type) => {
            pendingQueue.forEach((p) => updatePendingClassification(p.assetId, type, p.assetRole));
          }}
          onDismiss={dismissPendingQueue}
        />
      )}

      <AssetPreviewModal
        asset={preview}
        onClose={() => setPreview(null)}
        onRemove={removeFromArchive}
        onReclassify={reclassifyAsset}
      />
    </div>
  );
}
