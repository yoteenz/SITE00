/**
 * B5.2 — Entry 001 Campaign Package page (reference-fidelity operate surface).
 */

import { useCallback, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Entry001CampaignAsset } from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import {
  site00ProjectContentOperationsCampaignBoardPath,
  site00ProjectLabPath,
} from '../../../config/routes';
import { compileEntry001ArchiveDerivationPlan } from './entry001ArchiveDerivationPlan.js';
import { buildEntry001WhatsLeft } from './entry001PackageReadiness.js';
import { entry001NarrativeDescriptor } from './entry001NarrativeContinuity.js';
import { useEntry001PackageState } from './useEntry001PackageState.js';
import { ENTRY_001_TITLE } from '../../../../../shared/site00-expression-engine/constants.js';

type Props = {
  projectSlug: string;
};

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
}: {
  asset: Entry001CampaignAsset | null;
  onClose: () => void;
}) {
  if (!asset) return null;
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
        <p className="site00-e001-package__modal-meta">
          {asset.role} · {asset.status} · {asset.source}
        </p>
      </div>
    </div>
  );
}

export function Entry001CampaignPackageWorkspace({ projectSlug }: Props) {
  const {
    heroAsset,
    approvedArchive,
    missingDeliverables,
    readiness,
    addAssetForRole,
    batchAddAssets,
    approvedArchiveCount,
    extraAssets,
  } = useEntry001PackageState();

  const [preview, setPreview] = useState<Entry001CampaignAsset | null>(null);
  const [derivePlanOpen, setDerivePlanOpen] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const batchRef = useRef<HTMLInputElement>(null);
  const pendingRoleRef = useRef<Entry001CampaignAsset['role'] | null>(null);

  const derivationPlan = useMemo(
    () => compileEntry001ArchiveDerivationPlan(approvedArchive),
    [approvedArchive],
  );
  const whatsLeft = useMemo(() => buildEntry001WhatsLeft(readiness), [readiness]);

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
    <div className="site00-e001-package site00-fws-mobile-content-shell" data-visual-reconstruction="entry001-campaign-package-b52">
      <input ref={uploadRef} type="file" accept="image/*,video/*" hidden onChange={handleFileChange} />
      <input ref={batchRef} type="file" accept="image/*,video/*" multiple hidden onChange={handleBatchChange} />

      <nav className="site00-e001-package__breadcrumb" aria-label="Campaign navigation">
        <Link to={labPath}>LAB HUB</Link>
        <span aria-hidden>›</span>
        <Link to={boardPath}>CAMPAIGN BOARD</Link>
        <span className="site00-e001-package__breadcrumb-site">SITE 00</span>
      </nav>

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

      <section className="site00-e001-package__section">
        <header className="site00-e001-package__section-head">
          <span className="site00-e001-package__section-icon">
            <LayersIcon />
          </span>
          <h2>APPROVED ARCHIVE</h2>
          <span className="site00-e001-package__section-meta">
            {approvedArchiveCount} ASSETS UPLOADED ›
          </span>
        </header>
        <div className="site00-e001-package__archive-grid">
          {approvedArchive.map((asset) => (
            <button
              key={asset.assetId}
              type="button"
              className="site00-e001-package__archive-card"
              onClick={() => setPreview(asset)}
            >
              <img src={asset.filePath} alt={asset.title} loading="lazy" />
              <span className="site00-e001-package__archive-label">{asset.title}</span>
              <span className="site00-e001-package__archive-status">{asset.version}</span>
            </button>
          ))}
        </div>
        <button type="button" className="site00-e001-package__batch-btn" onClick={() => batchRef.current?.click()}>
          + ADD ASSETS
        </button>
      </section>

      <section className="site00-e001-package__section">
        <header className="site00-e001-package__section-head">
          <span className="site00-e001-package__section-icon site00-e001-package__section-icon--dashed" />
          <h2>REMAINING DELIVERABLES</h2>
          <span className="site00-e001-package__section-meta">
            {completeDeliverables} / {totalDeliverables} COMPLETE ›
          </span>
        </header>
        <div className="site00-e001-package__deliverables-row">
          {missingDeliverables.map((slot) => {
            const isMissing = slot.status === 'MISSING' || !slot.filePath;
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
                  {isMissing ? 'Pending' : slot.status}
                </p>
                {isMissing && (
                  <button
                    type="button"
                    className="site00-e001-package__upload-link"
                    onClick={() => handleUploadClick(slot.role)}
                  >
                    UPLOAD ASSET
                  </button>
                )}
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
                <p key={t.role}>
                  <strong>{t.role}</strong> — {t.generationStrategy}
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
          CAMPAIGN BOARD DEPLOYMENT —{' '}
          <strong>{readiness.campaignBoardEligible ? 'ELIGIBLE' : 'LOCKED'}</strong>
        </p>
        {extraAssets.length > 0 && (
          <p className="site00-e001-package__extra-count">{extraAssets.length} pending/extra uploads in session</p>
        )}
      </div>

      <AssetPreviewModal asset={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
