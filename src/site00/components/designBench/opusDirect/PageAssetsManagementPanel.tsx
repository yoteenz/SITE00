/**
 * P0.VR.DESIGN-ASSET-MANAGEMENT1 — PAGE ASSETS inspector (select · regenerate · replace · history).
 */

import { useCallback, useMemo, useRef, useState } from 'react';

import {
  approveFounderUploadReplacement,
  approveRegeneratedAsset,
  buildRegenerateConfirmModel,
  getPageAssetById,
  listActivePageAssets,
  listPageAssetHistory,
  listPageAssetVersionHistory,
  PAGE_ASSET_POST_APPROVAL_CAPTURE_HINT,
  requestFixtureAssetRegeneration,
  stageFounderUploadReplacement,
  validatePageAssetUpload,
  type PageAssetVersionRecord,
} from '../../../../../shared/site00-design-workspace-production/designPageActiveAssetManifest.js';
import { useDesignGrokEligibility } from './DesignGrokEligibilityProvider';

type Props = {
  projectSlug: string;
  pageId: string;
  viewport: 'MOBILE' | 'TABLET' | 'DESKTOP';
  initialSelectedAssetId?: string;
  onManifestUpdated?: () => void;
};

type FlowStep =
  | 'grid'
  | 'inspect'
  | 'regenerate-confirm'
  | 'regenerate-review'
  | 'replace-upload'
  | 'replace-review'
  | 'history';

function readImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('IMAGE_LOAD_FAILED'));
    img.src = dataUrl;
  });
}

export function PageAssetsManagementPanel({
  projectSlug,
  pageId,
  viewport,
  initialSelectedAssetId,
  onManifestUpdated,
}: Props) {
  const { eligibility } = useDesignGrokEligibility();
  const [revision, setRevision] = useState(0);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(initialSelectedAssetId ?? null);
  const [step, setStep] = useState<FlowStep>('grid');
  const [regenInstruction, setRegenInstruction] = useState('');
  const [uploadPreview, setUploadPreview] = useState<{
    dataUrl: string;
    format: string;
    width: number;
    height: number;
    byteSize: number;
    validation: ReturnType<typeof validatePageAssetUpload>;
  } | null>(null);
  const [pendingStagedId, setPendingStagedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const assets = useMemo(() => {
    void revision;
    return listActivePageAssets(projectSlug, pageId);
  }, [pageId, projectSlug, revision]);

  const selected = useMemo(
    () => (selectedAssetId ? getPageAssetById(projectSlug, pageId, selectedAssetId) : null),
    [pageId, projectSlug, revision, selectedAssetId],
  );

  const stagedCandidate = useMemo(() => {
    if (!pendingStagedId) return null;
    return getPageAssetById(projectSlug, pageId, pendingStagedId);
  }, [pageId, pendingStagedId, projectSlug, revision]);

  const bump = useCallback(() => {
    setRevision((n) => n + 1);
    onManifestUpdated?.();
  }, [onManifestUpdated]);

  const regenerateBlocked = eligibility.eligibility !== 'ELIGIBLE';
  const regenerateBlockReason = regenerateBlocked ? eligibility.shortReason : null;

  const openRegenerateConfirm = useCallback(() => {
    if (!selected) return;
    setRegenInstruction('');
    setStep('regenerate-confirm');
  }, [selected]);

  const confirmRegenerate = useCallback(() => {
    if (!selected || regenerateBlocked) return;
    const result = requestFixtureAssetRegeneration({
      projectId: projectSlug,
      pageId,
      sourceAssetId: selected.assetId,
      instruction: regenInstruction,
    });
    if (!result) return;
    setPendingStagedId(result.staged.assetId);
    setStep('regenerate-review');
    bump();
  }, [bump, pageId, projectSlug, regenInstruction, regenerateBlocked, selected]);

  const approveRegen = useCallback(() => {
    if (!pendingStagedId) return;
    const next = approveRegeneratedAsset(projectSlug, pageId, pendingStagedId);
    if (!next) return;
    setSelectedAssetId(next.assetId);
    setPendingStagedId(null);
    setStep('grid');
    setStatusMessage(PAGE_ASSET_POST_APPROVAL_CAPTURE_HINT);
    bump();
  }, [bump, pageId, pendingStagedId, projectSlug]);

  const onPickReplaceFile = useCallback(async (file: File) => {
    if (!selected) return;
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('READ_FAILED'));
      reader.readAsDataURL(file);
    });
    let width = 0;
    let height = 0;
    try {
      const dims = await readImageDimensions(dataUrl);
      width = dims.width;
      height = dims.height;
    } catch {
      width = selected.width;
      height = selected.height;
    }
    const validation = validatePageAssetUpload({
      mimeType: file.type,
      byteSize: file.size,
      width,
      height,
      slotFormat: selected.format,
      slotWidth: selected.width,
      slotHeight: selected.height,
    });
    setUploadPreview({
      dataUrl,
      format: validation.format ?? selected.format,
      width,
      height,
      byteSize: file.size,
      validation,
    });
    setStep('replace-review');
  }, [selected]);

  const confirmReplace = useCallback(() => {
    if (!selected || !uploadPreview || !uploadPreview.validation.ok) return;
    const staged = stageFounderUploadReplacement({
      projectId: projectSlug,
      pageId,
      sourceAssetId: selected.assetId,
      previewDataUrl: uploadPreview.dataUrl,
      format: uploadPreview.format,
      width: uploadPreview.width,
      height: uploadPreview.height,
      byteSize: uploadPreview.byteSize,
    });
    if (!staged) return;
    setPendingStagedId(staged.assetId);
    const approved = approveFounderUploadReplacement(projectSlug, pageId, staged.assetId);
    if (approved) {
      setSelectedAssetId(approved.assetId);
      setStatusMessage(PAGE_ASSET_POST_APPROVAL_CAPTURE_HINT);
    }
    setUploadPreview(null);
    setStep('grid');
    bump();
  }, [bump, pageId, projectSlug, selected, uploadPreview]);

  const regenConfirmModel =
    selected ?
      buildRegenerateConfirmModel(selected, regenerateBlocked, regenerateBlockReason)
    : null;

  const slotHistory =
    selected ?
      listPageAssetVersionHistory(projectSlug, pageId, selected.slot)
    : [];
  const eventHistory = listPageAssetHistory(projectSlug, pageId, selected?.slot);

  return (
    <div className="tod-page-assets" data-testid="page-assets-management">
      <p className="tod-dcs-lead">
        PAGE ASSETS · {pageId} · {viewport}
      </p>
      {statusMessage ?
        <p className="tod-page-assets__hint" role="status">
          {statusMessage}
        </p>
      : null}

      {step === 'grid' ?
        <>
          <div className="tod-page-assets__grid" role="list">
            {assets.length === 0 ?
              <p className="tod-psr__empty">NO PAGE ASSETS IN MANIFEST</p>
            : assets.map((asset) => {
                const active = asset.assetId === selectedAssetId;
                return (
                  <button
                    key={asset.assetId}
                    type="button"
                    role="listitem"
                    className={`tod-page-assets__cell${active ? ' is-selected' : ''}`}
                    onClick={() => setSelectedAssetId(asset.assetId)}
                    data-interaction-id="page-asset-select"
                    aria-pressed={active}
                  >
                    <span className="tod-page-assets__thumb">
                      <img src={asset.previewDataUrl} alt="" draggable={false} />
                    </span>
                    <span className="tod-page-assets__name">{asset.displayName}</span>
                    <span className="tod-page-assets__meta">
                      {asset.slot} · {asset.origin} · v{asset.versionNumber} · {asset.status}
                    </span>
                  </button>
                );
              })
            }
          </div>

          {selected ?
            <div className="tod-page-assets__actions" role="toolbar" aria-label="Selected asset actions">
              <button
                type="button"
                className="tod-dcs__primary"
                data-interaction-id="page-asset-regenerate"
                disabled={regenerateBlocked}
                title={regenerateBlockReason ?? undefined}
                onClick={openRegenerateConfirm}
              >
                REGENERATE
              </button>
              <button
                type="button"
                className="tod-dcs__ghost"
                data-interaction-id="page-asset-replace"
                onClick={() => {
                  setUploadPreview(null);
                  setStep('replace-upload');
                }}
              >
                REPLACE
              </button>
              <button
                type="button"
                className="tod-dcs__ghost"
                data-interaction-id="page-asset-inspect"
                onClick={() => setStep('inspect')}
              >
                INSPECT
              </button>
              <button type="button" className="tod-dcs__ghost" onClick={() => setStep('history')}>
                VIEW HISTORY
              </button>
            </div>
          : (
            <p className="tod-page-assets__hint">SELECT AN ASSET TO REGENERATE OR REPLACE.</p>
          )}
          {regenerateBlocked && selected ?
            <p className="tod-page-assets__block">{regenerateBlockReason}</p>
          : null}
        </>
      : null}

      {step === 'inspect' && selected ?
        <div className="tod-page-assets__history">
          <h3 className="tod-page-assets__modalTitle">INSPECT · {selected.displayName}</h3>
          <img src={selected.previewDataUrl} alt="" className="tod-dcs-compare__img" />
          <dl className="tod-dcs-meta">
            <div>
              <dt>SLOT</dt>
              <dd>{selected.slot}</dd>
            </div>
            <div>
              <dt>ORIGIN</dt>
              <dd>{selected.origin}</dd>
            </div>
            <div>
              <dt>STATUS</dt>
              <dd>{selected.status}</dd>
            </div>
            <div>
              <dt>VERSION</dt>
              <dd>v{selected.versionNumber}</dd>
            </div>
          </dl>
          <button type="button" className="tod-dcs__ghost" onClick={() => setStep('grid')}>
            BACK
          </button>
        </div>
      : null}

      {step === 'regenerate-confirm' && regenConfirmModel ?
        <div className="tod-page-assets__modal" data-testid="page-asset-regenerate-confirm">
          <h3 className="tod-page-assets__modalTitle">REGENERATE SIMILAR ASSET</h3>
          <dl className="tod-dcs-meta">
            <div>
              <dt>ASSET</dt>
              <dd>{regenConfirmModel.asset.displayName}</dd>
            </div>
            <div>
              <dt>SLOT</dt>
              <dd>{regenConfirmModel.slot}</dd>
            </div>
            <div>
              <dt>CURRENT VERSION</dt>
              <dd>{regenConfirmModel.currentVersionLabel}</dd>
            </div>
            <div>
              <dt>MODEL</dt>
              <dd>{regenConfirmModel.model}</dd>
            </div>
            <div>
              <dt>ESTIMATED COST</dt>
              <dd>${regenConfirmModel.estimatedCostUsd.toFixed(2)}</dd>
            </div>
          </dl>
          <p className="tod-page-assets__hint">
            A new candidate asset will be generated. The current asset stays active until you approve the replacement.
          </p>
          <label className="tod-page-assets__field">
            OPTIONAL INSTRUCTION
            <textarea
              value={regenInstruction}
              onChange={(e) => setRegenInstruction(e.target.value)}
              placeholder={regenConfirmModel.defaultInstruction}
              rows={3}
            />
          </label>
          {regenConfirmModel.eligibilityBlocked ?
            <p className="tod-page-assets__block">{regenConfirmModel.blockReason}</p>
          : null}
          <div className="tod-dcs-modalActions">
            <button type="button" className="tod-dcs__ghost" onClick={() => setStep('grid')}>
              CANCEL
            </button>
            <button
              type="button"
              className="tod-dcs__primary"
              data-interaction-id="page-asset-regenerate-confirm"
              disabled={regenConfirmModel.eligibilityBlocked}
              onClick={confirmRegenerate}
            >
              CONFIRM REGENERATE
            </button>
          </div>
        </div>
      : null}

      {step === 'regenerate-review' && selected && stagedCandidate ?
        <div className="tod-page-assets__compare" data-testid="page-asset-old-new">
          <h3 className="tod-page-assets__modalTitle">OLD VS NEW · REVIEW</h3>
          <div className="tod-page-assets__compareRow">
            <figure>
              <figcaption>OLD · v{selected.versionNumber}</figcaption>
              <img src={selected.previewDataUrl} alt="" className="tod-dcs-compare__img" />
            </figure>
            <figure>
              <figcaption>NEW · STAGED</figcaption>
              <img src={stagedCandidate.previewDataUrl} alt="" className="tod-dcs-compare__img" />
            </figure>
          </div>
          <div className="tod-dcs-modalActions">
            <button type="button" className="tod-dcs__ghost" onClick={() => setStep('grid')}>
              CANCEL
            </button>
            <button type="button" className="tod-dcs__ghost" onClick={openRegenerateConfirm}>
              REGENERATE AGAIN
            </button>
            <button
              type="button"
              className="tod-dcs__primary"
              data-interaction-id="page-asset-approve-regen"
              onClick={approveRegen}
            >
              APPROVE REPLACEMENT
            </button>
          </div>
        </div>
      : null}

      {step === 'replace-upload' && selected ?
        <div className="tod-page-assets__modal" data-testid="page-asset-replace-upload">
          <h3 className="tod-page-assets__modalTitle">REPLACE · {selected.slot}</h3>
          <p className="tod-page-assets__hint">Upload PNG, JPG, WEBP, or SVG for this slot.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="tod-page-assets__file"
            data-interaction-id="page-asset-file-picker"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onPickReplaceFile(file);
            }}
          />
          <div className="tod-dcs-modalActions">
            <button type="button" className="tod-dcs__ghost" onClick={() => setStep('grid')}>
              CANCEL
            </button>
          </div>
        </div>
      : null}

      {step === 'replace-review' && selected && uploadPreview ?
        <div className="tod-page-assets__compare" data-testid="page-asset-replace-preview">
          <h3 className="tod-page-assets__modalTitle">REPLACE THIS ASSET?</h3>
          <p className="tod-page-assets__hint">
            The new file will become the active asset for {pageId} · {selected.slot}. Previous version stays in history.
          </p>
          <div className="tod-page-assets__compareRow">
            <figure>
              <figcaption>CURRENT</figcaption>
              <img src={selected.previewDataUrl} alt="" className="tod-dcs-compare__img" />
            </figure>
            <figure>
              <figcaption>UPLOADED · {uploadPreview.format}</figcaption>
              <img src={uploadPreview.dataUrl} alt="" className="tod-dcs-compare__img" />
            </figure>
          </div>
          <p className="tod-page-assets__meta">
            {uploadPreview.width}×{uploadPreview.height} · {Math.round(uploadPreview.byteSize / 1024)} KB
          </p>
          {uploadPreview.validation.errors.map((err) => (
            <p key={err} className="tod-page-assets__block">
              {err}
            </p>
          ))}
          {uploadPreview.validation.warnings.map((warn) => (
            <p key={warn} className="tod-page-assets__hint">
              {warn}
            </p>
          ))}
          <div className="tod-dcs-modalActions">
            <button type="button" className="tod-dcs__ghost" onClick={() => setStep('replace-upload')}>
              CANCEL
            </button>
            <button
              type="button"
              className="tod-dcs__primary"
              data-interaction-id="page-asset-replace-confirm"
              disabled={!uploadPreview.validation.ok}
              onClick={confirmReplace}
            >
              CONFIRM REPLACEMENT
            </button>
          </div>
        </div>
      : null}

      {step === 'history' && selected ?
        <div className="tod-page-assets__history">
          <h3 className="tod-page-assets__modalTitle">ASSET HISTORY · {selected.slot}</h3>
          <ul className="tod-dcs-gates">
            {slotHistory.map((v: PageAssetVersionRecord) => (
              <li key={v.versionId} className="tod-dcs-gate">
                <strong className="tod-dcs-gate__name">
                  v{v.versionNumber} · {v.origin} · {v.status}
                </strong>
                <span>{v.createdAt}</span>
              </li>
            ))}
          </ul>
          <ul className="tod-dcs-gates">
            {eventHistory.map((ev) => (
              <li key={ev.id} className="tod-dcs-gate">
                <strong className="tod-dcs-gate__name">{ev.type.replace(/_/g, ' ').toUpperCase()}</strong>
                <p className="tod-dcs-gate__reason">{ev.detail}</p>
              </li>
            ))}
          </ul>
          <button type="button" className="tod-dcs__ghost" onClick={() => setStep('grid')}>
            BACK
          </button>
        </div>
      : null}
    </div>
  );
}
