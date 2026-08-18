import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AsstsEnvironmentShell } from '../components/AsstsEnvironmentShell';
import { AsstsDevPanel, useAsstsAutoRefresh } from '../components/AsstsDevPanel';
import { AsstsBottomDock } from '../components/AsstsMobileNav';
import { AsstsPageShell } from '../components/AsstsPageShell';
import {
  AsstsCompareOverlay,
  AsstsFullScreenViewer,
  AsstsInspectorFooter,
  AsstsMetadataPanel,
  AsstsVersionStrip,
} from '../components/AsstsInspectorParts';
import { AsstsRegenerateSheet, AsstsRejectSheet, AsstsVariantSheet } from '../components/AsstsSheets';
import { ASSTS_ENVIRONMENT_SLOTS, type CorrectionCategory } from '../config/slots';
import {
  addAsstsNote,
  approveAsstsAsset,
  EMPTY_ASSTS_NAVIGATION,
  fetchAsstsAsset,
  regenerateAsstsAsset,
  rejectAsstsAsset,
  requestAsstsVariant,
  type AsstsAssetDetail,
  type AsstsAssetNavigation,
} from '../services/asstsApi';
import { getAssetPresentationMode } from '../utils/assetPresentation';

export default function AsstsInspectionPage() {
  const { assetId = '' } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<AsstsAssetDetail | null>(null);
  const [navigation, setNavigation] = useState<AsstsAssetNavigation>(EMPTY_ASSTS_NAVIGATION);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const [regenOpen, setRegenOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [variantOpen, setVariantOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [approvedFlash, setApprovedFlash] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAsset(null);
    setNavigation(EMPTY_ASSTS_NAVIGATION);
    setSelectedVersionId(null);
    setError(null);
  }, [assetId]);

  const load = useCallback(async () => {
    if (!assetId) return;
    try {
      setError(null);
      setLoading(true);
      const res = await fetchAsstsAsset(assetId);
      setAsset({
        ...res.asset,
        canonicalMaster: res.asset.canonicalMaster ?? res.canonicalMaster ?? null,
      });
      setNavigation(res.navigation ?? EMPTY_ASSTS_NAVIGATION);
      setSelectedVersionId((prev) => {
        if (prev && res.asset.versions.some((v) => v.id === prev)) return prev;
        return res.asset.currentVersion?.id ?? null;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load asset');
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  const isGenerating = asset?.status === 'GENERATING' || asset?.status === 'REGENERATING';
  useAsstsAutoRefresh(load, { hasGenerating: isGenerating });

  const selectedVersion = useMemo(() => {
    if (!asset) return null;
    return asset.versions.find((v) => v.id === selectedVersionId) ?? asset.currentVersion;
  }, [asset, selectedVersionId]);

  const canReview = selectedVersion && selectedVersion.id === asset?.currentVersion?.id && selectedVersion.status === 'NEEDS_REVIEW';

  const presentationMode = getAssetPresentationMode(asset?.asset_type);

  const versionStripItems = useMemo(() => {
    if (!asset) return [];
    return asset.versions.map((v) => ({
      ...v,
      label:
        v.id === asset.approved_version_id
          ? 'APPROVED'
          : v.id === asset.currentVersion?.id
            ? 'CURRENT ASSET'
            : undefined,
    }));
  }, [asset]);

  useEffect(() => {
    if (!approvedFlash) return;
    const t = window.setTimeout(() => setApprovedFlash(false), 600);
    return () => window.clearTimeout(t);
  }, [approvedFlash]);

  const heroUrl = selectedVersion?.previewUrl ?? asset?.currentVersion?.previewUrl;
  const masterUrl = asset?.canonicalMaster?.previewUrl ?? null;
  const isCanonicalDerivative = Boolean(asset?.canonicalMaster);

  return (
    <AsstsEnvironmentShell slotKey={ASSTS_ENVIRONMENT_SLOTS.inspection}>
      <AsstsPageShell variant="inspection">
        <div className="assts-inspection-layout">
          <header className="assts-inspection-header-min">
            <Link to={asset?.batch_id ? `/assts/batches/${asset.batch_id}` : '/assts'} className="assts-back-link">
              ← BATCH
            </Link>
            <span className="assts-mono assts-inspection-header-min__key">{asset?.asset_key}</span>
          </header>

          <AsstsDevPanel batchId={asset?.batch_id ?? null} onRefresh={load} />

          {error ? (
            <div className="assts-alert assts-glass assts-glass--panel" role="alert">
              {error}
            </div>
          ) : null}

          <div
            className={`assts-inspection-chamber assts-inspection-chamber--${presentationMode} ${approvedFlash ? 'assts-inspection-hero-stage--flash' : ''}`}
          >
            <div className="assts-inspection-chamber__guides" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="assts-inspection-chamber__floor" aria-hidden="true" />
            <div className="assts-inspection-chamber__pedestal" aria-hidden="true" />
            <div className="assts-inspection-chamber__stage">
              {heroUrl ? (
                <img src={heroUrl} alt={asset?.display_name ?? ''} className="assts-inspection-hero-stage__img" />
              ) : (
                <div className="assts-inspection-hero-stage__empty">
                  {loading ? 'LOADING ASSET…' : isGenerating ? 'GENERATING…' : 'NO PREVIEW YET'}
                </div>
              )}
            </div>
          </div>

          <AsstsVersionStrip
            versions={versionStripItems}
            selectedId={selectedVersionId}
            onSelect={setSelectedVersionId}
            approvedVersionId={asset?.approved_version_id}
          />

          {asset && selectedVersion ? (
            <AsstsMetadataPanel
              batchKey={asset.batch_key}
              versionNumber={selectedVersion.version_number}
              status={selectedVersion.status}
              generator={selectedVersion.generation_provider}
              promptVersion={selectedVersion.prompt_version}
              viewType={asset.viewType ?? selectedVersion.viewType ?? null}
              worldIdentity={asset.worldIdentity ?? selectedVersion.worldIdentity ?? null}
              referenceStrength={asset.referenceStrength ?? selectedVersion.referenceStrength ?? null}
              expandedContent={
                <dl className="assts-metadata-panel__list assts-metadata-panel__list--expanded">
                  {selectedVersion.generation_model ? (
                    <>
                      <dt>MODEL</dt>
                      <dd>{selectedVersion.generation_model}</dd>
                    </>
                  ) : null}
                  {selectedVersion.prompt_snapshot ? (
                    <>
                      <dt>PROMPT</dt>
                      <dd className="assts-metadata-panel__prompt">{selectedVersion.prompt_snapshot}</dd>
                    </>
                  ) : null}
                  {selectedVersion.created_at ? (
                    <>
                      <dt>GENERATED</dt>
                      <dd>{new Date(selectedVersion.created_at).toLocaleString()}</dd>
                    </>
                  ) : null}
                </dl>
              }
            />
          ) : null}

          <div className="assts-control-console">
            <div className="assts-review-actions">
              <button
                type="button"
                className="assts-btn assts-btn--approve"
                disabled={!canReview || busy}
                onClick={() => {
                  if (!asset || !asset.currentVersion) return;
                  setBusy(true);
                  void approveAsstsAsset(asset.id, asset.currentVersion.id)
                    .then((res) => {
                      setApprovedFlash(true);
                      if (res.nextAssetId) navigate(`/assts/${res.nextAssetId}`);
                      else void load();
                    })
                    .catch((e) => setError(e instanceof Error ? e.message : 'Approve failed'))
                    .finally(() => setBusy(false));
                }}
              >
                ✓ APPROVE
              </button>
              <button
                type="button"
                className="assts-btn assts-btn--regen"
                disabled={!asset || busy || asset.status === 'LOCKED'}
                onClick={() => setRegenOpen(true)}
              >
                ↻ REGENERATE
              </button>
              <button type="button" className="assts-btn assts-btn--reject" disabled={!canReview || busy} onClick={() => setRejectOpen(true)}>
                ✕ REJECT
              </button>
            </div>
          </div>

          <div className="assts-secondary-console">
            <div className="assts-secondary-actions">
              <button type="button" className="assts-btn assts-btn--secondary" disabled={!asset || busy} onClick={() => setVariantOpen(true)}>
                REQUEST VARIANT
              </button>
              <button
                type="button"
                className="assts-btn assts-btn--secondary"
                disabled={!heroUrl || !masterUrl}
                onClick={() => setCompareOpen(true)}
              >
                COMPARE TO MASTER
              </button>
              <button type="button" className="assts-btn assts-btn--secondary" disabled={!asset || busy} onClick={() => setNoteOpen(true)}>
                ADD NOTE
              </button>
              <button
                type="button"
                className="assts-btn assts-btn--secondary"
                disabled={!heroUrl}
                onClick={() => setFullScreenOpen(true)}
              >
                VIEW FULL SIZE
              </button>
            </div>
          </div>

          {noteOpen ? (
            <div className="site00-assts-sheet-backdrop" role="presentation" onClick={() => setNoteOpen(false)}>
              <div className="site00-assts-sheet assts-glass assts-glass--panel" onClick={(e) => e.stopPropagation()}>
                <h2 className="site00-assts-sheet__title">ADD NOTE</h2>
                <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={4} placeholder="REVIEW NOTE…" />
                <div className="site00-assts-sheet__actions">
                  <button type="button" className="assts-btn" onClick={() => setNoteOpen(false)}>
                    CANCEL
                  </button>
                  <button
                    type="button"
                    className="assts-btn assts-btn--regen"
                    disabled={!noteText.trim() || busy}
                    onClick={() => {
                      if (!asset) return;
                      setBusy(true);
                      void addAsstsNote(asset.id, noteText.trim())
                        .then(() => {
                          setNoteOpen(false);
                          setNoteText('');
                        })
                        .catch((e) => setError(e instanceof Error ? e.message : 'Note failed'))
                        .finally(() => setBusy(false));
                    }}
                  >
                    SAVE NOTE
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <AsstsRegenerateSheet
            open={regenOpen}
            busy={busy}
            onClose={() => setRegenOpen(false)}
            onSubmit={(categories: CorrectionCategory[], note: string) => {
              if (!asset) return;
              setBusy(true);
              void regenerateAsstsAsset(asset.id, categories, note)
                .then(() => {
                  setRegenOpen(false);
                  return load();
                })
                .catch((e) => setError(e instanceof Error ? e.message : 'Regenerate failed'))
                .finally(() => setBusy(false));
            }}
          />

          <AsstsRejectSheet
            open={rejectOpen}
            busy={busy}
            onClose={() => setRejectOpen(false)}
            onSubmit={(note, categories) => {
              if (!asset || !asset.currentVersion) return;
              setBusy(true);
              void rejectAsstsAsset(asset.id, asset.currentVersion.id, note, categories)
                .then(() => {
                  setRejectOpen(false);
                  if (navigation?.nextAssetId) navigate(`/assts/${navigation.nextAssetId}`);
                  else void load();
                })
                .catch((e) => setError(e instanceof Error ? e.message : 'Reject failed'))
                .finally(() => setBusy(false));
            }}
          />

          <AsstsVariantSheet
            open={variantOpen}
            busy={busy}
            onClose={() => setVariantOpen(false)}
            onSubmit={(note, kind) => {
              if (!asset) return;
              setBusy(true);
              void requestAsstsVariant(asset.id, `${kind}: ${note}`)
                .then(() => {
                  setVariantOpen(false);
                  return load();
                })
                .catch((e) => setError(e instanceof Error ? e.message : 'Variant request failed'))
                .finally(() => setBusy(false));
            }}
          />

          {compareOpen && heroUrl ? (
            <AsstsCompareOverlay
              currentUrl={heroUrl}
              masterUrl={masterUrl}
              currentLabel="GENERATED DERIVATIVE"
              masterLabel={isCanonicalDerivative ? 'CANONICAL MASTER' : 'REFERENCE'}
              onClose={() => setCompareOpen(false)}
            />
          ) : null}

          <AsstsFullScreenViewer
            open={fullScreenOpen}
            url={heroUrl ?? ''}
            title={asset?.display_name ?? asset?.asset_key ?? 'Asset'}
            onClose={() => setFullScreenOpen(false)}
          />

          <AsstsInspectorFooter
            prevAssetId={navigation?.prevAssetId ?? null}
            nextAssetId={navigation?.nextAssetId ?? null}
            position={navigation?.position ?? 0}
            total={navigation?.total ?? 0}
            onNavigate={(id) => navigate(`/assts/${id}`)}
          />
        </div>
      </AsstsPageShell>

      <AsstsBottomDock />
    </AsstsEnvironmentShell>
  );
}
