/**
 * P0.VR.4 / P0.VR.4R1 — Asset detail workspace (reference vs reconstruction + QA + binding).
 */

import {
  buildSystemInspectorLineage,
  type DesignReconstructionAsset,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4/client.js';
import type { BackgroundRemovalProviderId } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4/backgroundRemovalProvider.js';
import type {
  GenerationReceipt,
  BackgroundRemovalReceipt,
  MaterialPreservationQA,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4r1/browserClient.js';

export type DesignAssetReconstructionDetailProps = {
  asset: DesignReconstructionAsset;
  onGenerate: () => void;
  onLoveIt: () => void;
  onApplyToPage?: () => void;
  onViewOnPage?: () => void;
  generating?: boolean;
  applying?: boolean;
  reconstructionModel?: string;
  backgroundRemovalPreference?: BackgroundRemovalProviderId;
  onBackgroundRemovalChange?: (pref: BackgroundRemovalProviderId) => void;
  liveGenerationReceipt?: GenerationReceipt | null;
  liveBackgroundRemovalReceipt?: BackgroundRemovalReceipt | null;
  liveMaterialQa?: MaterialPreservationQA | null;
  falHealthBlocker?: string | null;
};

export function DesignAssetReconstructionDetail({
  asset,
  onGenerate,
  onLoveIt,
  onApplyToPage,
  onViewOnPage,
  generating = false,
  applying = false,
  reconstructionModel = 'GPT IMAGE 2 EDIT',
  backgroundRemovalPreference = 'AUTO',
  onBackgroundRemovalChange,
  liveGenerationReceipt,
  liveBackgroundRemovalReceipt,
  liveMaterialQa,
  falHealthBlocker,
}: DesignAssetReconstructionDetailProps) {
  const lineage = buildSystemInspectorLineage(asset.assetId);
  const displayUrl = asset.cleanedAssetUrl ?? asset.generatedAssetUrl;
  const canApply =
    asset.founderJudgment === 'LOVE_IT' &&
    Boolean(asset.storage?.path || displayUrl) &&
    (asset.status === 'APPROVED' || asset.status === 'PERSISTED' || asset.status === 'BOUND' || asset.status === 'VERIFIED');

  return (
    <aside className="site00-dw-ref-asset-detail">
      <h3>{asset.semanticName}</h3>
      <p className="site00-dw-ref-asset-detail__type">
        {asset.assetType}
        {asset.liveUiRole ? ` · ${asset.liveUiRole}` : ''}
      </p>
      <p className="site00-dw-ref-asset-detail__status">Status: {asset.status}</p>

      {falHealthBlocker ? (
        <p className="site00-dw-ref-assets__warn">{falHealthBlocker}</p>
      ) : null}

      <div className="site00-dw-ref-asset-detail__compare">
        <div className="site00-dw-ref-asset-detail__pane">
          <h4>REFERENCE CROP</h4>
          {asset.referenceCropUrl ? (
            <img src={asset.referenceCropUrl} alt="Reference crop" />
          ) : (
            <span>No crop</span>
          )}
        </div>
        <div className="site00-dw-ref-asset-detail__pane">
          <h4>LIVE RECONSTRUCTION</h4>
          {displayUrl ? (
            <img src={displayUrl} alt="Reconstructed asset" />
          ) : (
            <span>Not generated</span>
          )}
        </div>
      </div>

      <div className="site00-dw-ref-asset-detail__providers">
        <label>
          RECONSTRUCTION MODEL
          <select value={reconstructionModel} disabled aria-readonly>
            <option value="GPT IMAGE 2 EDIT">GPT IMAGE 2 EDIT</option>
          </select>
        </label>
        <label>
          BACKGROUND REMOVAL
          <select
            value={backgroundRemovalPreference}
            onChange={(e) => onBackgroundRemovalChange?.(e.target.value as BackgroundRemovalProviderId)}
          >
            <option value="AUTO">AUTO</option>
            <option value="IDEOGRAM">IDEOGRAM</option>
            <option value="PIXELCUT">PIXELCUT</option>
            <option value="FAL_BIREFNET">FAL BiRefNet</option>
            <option value="FAL_BRIA">FAL Bria</option>
          </select>
        </label>
      </div>

      {liveGenerationReceipt ? (
        <div className="site00-dw-ref-asset-detail__qa">
          <h4>LIVE DISPATCH RECEIPT</h4>
          <dl>
            <dt>requestId</dt>
            <dd>{liveGenerationReceipt.requestId}</dd>
            <dt>provider</dt>
            <dd>{liveGenerationReceipt.provider}</dd>
            <dt>model</dt>
            <dd>{liveGenerationReceipt.model}</dd>
            <dt>dispatchCount</dt>
            <dd>{liveGenerationReceipt.dispatchCount}</dd>
            <dt>referenceCropUrl</dt>
            <dd className="site00-dw-ref-asset-detail__mono">{liveGenerationReceipt.referenceCropUrl}</dd>
          </dl>
        </div>
      ) : null}

      {liveBackgroundRemovalReceipt ? (
        <div className="site00-dw-ref-asset-detail__qa">
          <h4>BACKGROUND REMOVAL</h4>
          <p>
            {liveBackgroundRemovalReceipt.required
              ? `Required — ${liveBackgroundRemovalReceipt.provider ?? 'none'}`
              : 'Not required'}
          </p>
          <p>{liveBackgroundRemovalReceipt.reason}</p>
        </div>
      ) : null}

      {liveMaterialQa ? (
        <div className="site00-dw-ref-asset-detail__qa">
          <h4>MATERIAL PRESERVATION</h4>
          <p>{liveMaterialQa.overallPass ? 'PASS' : 'REVIEW'}</p>
        </div>
      ) : null}

      {asset.qa && (
        <div className="site00-dw-ref-asset-detail__qa">
          <h4>REFERENCE QA</h4>
          <ul>
            {asset.qa.domains.slice(0, 8).map((d) => (
              <li key={d.domain}>
                {d.domain}: {d.verdict}
              </li>
            ))}
          </ul>
          <p>Overall: {asset.qa.overallPass ? 'PASS' : 'REVIEW'}</p>
        </div>
      )}

      <div className="site00-dw-ref-asset-detail__actions">
        <button type="button" onClick={onGenerate} disabled={generating || Boolean(falHealthBlocker)}>
          {generating ? 'GENERATING…' : 'GENERATE'}
        </button>
        <button
          type="button"
          onClick={onLoveIt}
          disabled={asset.founderJudgment === 'LOVE_IT' || !displayUrl}
        >
          LOVE IT
        </button>
        {onApplyToPage ? (
          <button type="button" onClick={onApplyToPage} disabled={!canApply || applying}>
            {applying ? 'APPLYING…' : 'APPLY TO PAGE'}
          </button>
        ) : null}
        {onViewOnPage ? (
          <button type="button" onClick={onViewOnPage} disabled={!canApply}>
            VIEW ON PAGE
          </button>
        ) : null}
      </div>

      <details className="site00-dw-ref-asset-detail__inspector">
        <summary>SYSTEM INSPECTOR</summary>
        <dl>
          <dt>status</dt>
          <dd>{asset.status}</dd>
          <dt>founderJudgment</dt>
          <dd>{asset.founderJudgment}</dd>
          <dt>dispatchCount</dt>
          <dd>{lineage.dispatchCount}</dd>
          <dt>generationModel</dt>
          <dd>{lineage.generationModel ?? liveGenerationReceipt?.model ?? '—'}</dd>
          <dt>generationRequestId</dt>
          <dd>{asset.reconstructionRequestId ?? liveGenerationReceipt?.requestId ?? '—'}</dd>
          <dt>backgroundRemoval</dt>
          <dd>{lineage.backgroundRemovalProvider ?? asset.backgroundRemovalProvider ?? '—'}</dd>
          <dt>supabasePath</dt>
          <dd>{lineage.supabasePath ?? asset.storage?.path ?? '—'}</dd>
          <dt>canonicalUrl</dt>
          <dd>{asset.storage?.path ? 'Supabase' : displayUrl ?? '—'}</dd>
          <dt>bindingRoute</dt>
          <dd>{lineage.liveBinding?.route ?? '/projects'}</dd>
          <dt>bindingComponent</dt>
          <dd>{lineage.liveBinding?.componentPath ?? 'ProjectsHeaderPlanet'}</dd>
          <dt>bindingSlot</dt>
          <dd>{lineage.liveBinding?.assetSlot ?? 'header-planet-icon'}</dd>
          <dt>binding</dt>
          <dd>{lineage.liveBinding?.bindingStatus ?? '—'}</dd>
        </dl>
      </details>
    </aside>
  );
}
