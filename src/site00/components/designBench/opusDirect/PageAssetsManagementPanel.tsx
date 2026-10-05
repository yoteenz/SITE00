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
import {
  OverlayActions,
  OverlayBody,
  OverlayCallout,
  OverlayChips,
  OverlayCompare,
  OverlayDropzone,
  OverlayEmpty,
  OverlayMeta,
  OverlayPreview,
  OverlaySection,
  OverlayStatus,
  OverlayThumbs,
  OverlayTimeline,
} from '../production/designOverlayKit';
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

  const originFilters = useMemo(() => {
    const counts = new Map<string, number>();
    for (const asset of assets) counts.set(asset.origin, (counts.get(asset.origin) ?? 0) + 1);
    return [...counts.entries()].map(([id, count]) => ({ id, label: `${id.replace(/_/g, ' ')} ${count}` }));
  }, [assets]);
  const [originFilter, setOriginFilter] = useState('ALL');
  const visibleAssets = originFilter === 'ALL' ? assets : assets.filter((asset) => asset.origin === originFilter);

  return (
    <div className="tod-page-assets" data-testid="page-assets-management">
      <OverlayBody>
        {statusMessage ?
          <OverlayCallout title="NEXT" tone="next">
            {statusMessage}
          </OverlayCallout>
        : null}

        {step === 'grid' ?
          <>
            <OverlayChips
              active={originFilter}
              onSelect={setOriginFilter}
              chips={[{ id: 'ALL', label: `ALL ${assets.length}` }, ...originFilters]}
            />

            <OverlaySection title="PAGE ASSETS" meta={`${pageId} · ${viewport}`}>
              <OverlayThumbs
                items={visibleAssets.map((asset) => ({
                  id: asset.assetId,
                  src: asset.previewDataUrl,
                  label: asset.displayName,
                  sub: `${asset.slot} · v${asset.versionNumber}`,
                  selected: asset.assetId === selectedAssetId,
                }))}
                onPick={setSelectedAssetId}
                emptyLabel="NO PAGE ASSETS IN MANIFEST"
                emptyHint="Assets appear here once Grok production or a founder upload lands on this page."
              />
            </OverlaySection>

            {selected ?
              <OverlaySection title="SELECTED" meta={<OverlayStatus label={selected.status} />}>
                <OverlayPreview
                  src={selected.previewDataUrl}
                  caption={selected.displayName}
                  side={<OverlayStatus label={`V${selected.versionNumber}`} tone="idle" />}
                />
                <OverlayMeta
                  entries={[
                    { k: 'SLOT', v: selected.slot },
                    { k: 'ORIGIN', v: selected.origin.replace(/_/g, ' ') },
                    { k: 'FORMAT', v: `${selected.format} · ${selected.width}×${selected.height}` },
                  ]}
                />
              </OverlaySection>
            : <OverlayEmpty label="SELECT AN ASSET" hint="Pick an asset above to regenerate, replace or inspect it." />}

            {regenerateBlocked && selected ?
              <OverlayCallout title="REGENERATE BLOCKED" tone="blocked">
                {regenerateBlockReason}
              </OverlayCallout>
            : null}

            <OverlayActions
              primary={{
                label: 'REGENERATE',
                onClick: openRegenerateConfirm,
                disabled: !selected || regenerateBlocked,
              }}
              secondary={[
                {
                  label: 'REPLACE',
                  onClick: () => {
                    setUploadPreview(null);
                    setStep('replace-upload');
                  },
                  disabled: !selected,
                },
                { label: 'INSPECT', onClick: () => setStep('inspect'), disabled: !selected },
                { label: 'HISTORY', onClick: () => setStep('history'), disabled: !selected },
              ]}
            />
          </>
        : null}

        {step === 'inspect' && selected ?
          <>
            <OverlayPreview
              src={selected.previewDataUrl}
              caption={selected.displayName}
              side={<OverlayStatus label={selected.status} />}
            />
            <OverlayMeta
              entries={[
                { k: 'SLOT', v: selected.slot },
                { k: 'ORIGIN', v: selected.origin.replace(/_/g, ' ') },
                { k: 'VERSION', v: `v${selected.versionNumber}` },
                { k: 'FORMAT', v: `${selected.format} · ${selected.width}×${selected.height}` },
              ]}
            />
            <OverlayActions secondary={[{ label: 'BACK TO ASSETS', onClick: () => setStep('grid') }]} />
          </>
        : null}

        {step === 'regenerate-confirm' && regenConfirmModel ?
          <div data-testid="page-asset-regenerate-confirm">
            <OverlayBody>
              <OverlayPreview
                src={regenConfirmModel.asset.previewDataUrl}
                caption={`CURRENT · ${regenConfirmModel.currentVersionLabel}`}
                side={<OverlayStatus label={regenConfirmModel.asset.status} />}
              />
              <OverlayMeta
                entries={[
                  { k: 'SLOT', v: regenConfirmModel.slot },
                  { k: 'MODEL', v: regenConfirmModel.model },
                  { k: 'ESTIMATE', v: `$${regenConfirmModel.estimatedCostUsd.toFixed(2)}` },
                ]}
              />
              <OverlayCallout title="WHAT HAPPENS">
                A new candidate is generated. The current asset stays active until you approve the replacement.
              </OverlayCallout>
              <OverlaySection title="OPTIONAL INSTRUCTION" flat>
                <textarea
                  className="tod-ok-composer__field"
                  value={regenInstruction}
                  onChange={(event) => setRegenInstruction(event.target.value)}
                  placeholder={regenConfirmModel.defaultInstruction}
                  rows={3}
                />
              </OverlaySection>
              {regenConfirmModel.eligibilityBlocked ?
                <OverlayCallout title="BLOCKED" tone="blocked">
                  {regenConfirmModel.blockReason}
                </OverlayCallout>
              : null}
              <OverlayActions
                primary={{
                  label: 'CONFIRM REGENERATE',
                  onClick: confirmRegenerate,
                  disabled: regenConfirmModel.eligibilityBlocked,
                }}
                secondary={[{ label: 'CANCEL', onClick: () => setStep('grid') }]}
              />
            </OverlayBody>
          </div>
        : null}

        {step === 'regenerate-review' && selected && stagedCandidate ?
          <div data-testid="page-asset-old-new">
            <OverlayBody>
              <OverlayCompare>
                <OverlayPreview
                  src={selected.previewDataUrl}
                  caption={`OLD · v${selected.versionNumber}`}
                  side={<OverlayStatus label="ACTIVE" />}
                />
                <OverlayPreview
                  src={stagedCandidate.previewDataUrl}
                  caption="NEW · STAGED"
                  side={<OverlayStatus label="STAGED" />}
                />
              </OverlayCompare>
              <OverlayActions
                primary={{ label: 'APPROVE REPLACEMENT', onClick: approveRegen }}
                secondary={[
                  { label: 'REGENERATE AGAIN', onClick: openRegenerateConfirm },
                  { label: 'CANCEL', onClick: () => setStep('grid') },
                ]}
              />
            </OverlayBody>
          </div>
        : null}

        {step === 'replace-upload' && selected ?
          <div data-testid="page-asset-replace-upload">
            <OverlayBody>
              <OverlayPreview
                src={selected.previewDataUrl}
                caption={`REPLACING · ${selected.slot}`}
                side={<OverlayStatus label={`V${selected.versionNumber}`} tone="idle" />}
              />
              <OverlayDropzone
                label="DROP REPLACEMENT OR TAP TO UPLOAD"
                hint={`${selected.format} · ${selected.width}×${selected.height}`}
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onFiles={(files) => {
                  const file = files[0];
                  if (file) void onPickReplaceFile(file);
                }}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="tod-page-assets__file"
                data-interaction-id="page-asset-file-picker"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void onPickReplaceFile(file);
                }}
              />
              <OverlayActions secondary={[{ label: 'CANCEL', onClick: () => setStep('grid') }]} />
            </OverlayBody>
          </div>
        : null}

        {step === 'replace-review' && selected && uploadPreview ?
          <div data-testid="page-asset-replace-preview">
            <OverlayBody>
              <OverlayCompare>
                <OverlayPreview
                  src={selected.previewDataUrl}
                  caption="CURRENT"
                  side={<OverlayStatus label="ACTIVE" />}
                />
                <OverlayPreview
                  src={uploadPreview.dataUrl}
                  caption={`UPLOADED · ${uploadPreview.format}`}
                  side={<OverlayStatus label={uploadPreview.validation.ok ? 'COMPATIBLE' : 'BLOCKED'} />}
                />
              </OverlayCompare>
              <OverlayMeta
                entries={[
                  { k: 'SLOT', v: selected.slot },
                  { k: 'DIMENSIONS', v: `${uploadPreview.width}×${uploadPreview.height}` },
                  { k: 'SIZE', v: `${Math.round(uploadPreview.byteSize / 1024)} KB` },
                  { k: 'EXPECTED', v: `${selected.format} · ${selected.width}×${selected.height}` },
                ]}
              />
              {uploadPreview.validation.errors.length ?
                <OverlayCallout title="CANNOT REPLACE" tone="blocked">
                  {uploadPreview.validation.errors.join(' · ')}
                </OverlayCallout>
              : null}
              {uploadPreview.validation.warnings.length ?
                <OverlayCallout title="CHECK">{uploadPreview.validation.warnings.join(' · ')}</OverlayCallout>
              : null}
              <OverlayActions
                primary={{
                  label: 'CONFIRM REPLACEMENT',
                  onClick: confirmReplace,
                  disabled: !uploadPreview.validation.ok,
                }}
                secondary={[{ label: 'CANCEL', onClick: () => setStep('replace-upload') }]}
              />
            </OverlayBody>
          </div>
        : null}

        {step === 'history' && selected ?
          <>
            <OverlaySection title={`VERSIONS · ${selected.slot}`} meta={`${slotHistory.length}`}>
              <OverlayThumbs
                items={slotHistory.map((version: PageAssetVersionRecord) => ({
                  id: version.versionId,
                  src: version.previewDataUrl,
                  label: `v${version.versionNumber}`,
                  sub: version.origin.replace(/_/g, ' '),
                  selected: version.assetId === selected.assetId,
                }))}
                emptyLabel="NO VERSION HISTORY"
              />
            </OverlaySection>
            <OverlaySection title="EVENTS" flat>
              <OverlayTimeline
                entries={eventHistory.map((event, index) => ({
                  id: event.id,
                  when: event.timestamp.slice(0, 16).replace('T', ' '),
                  what: event.type.replace(/_/g, ' ').toUpperCase(),
                  who: event.detail,
                  current: index === 0,
                }))}
              />
            </OverlaySection>
            <OverlayActions secondary={[{ label: 'BACK TO ASSETS', onClick: () => setStep('grid') }]} />
          </>
        : null}
      </OverlayBody>
    </div>
  );
}
