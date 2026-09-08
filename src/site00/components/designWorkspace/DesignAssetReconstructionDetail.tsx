/**
 * P0.VR.4 — Asset detail workspace (reference vs reconstruction + QA + binding).
 */

import {
  buildSystemInspectorLineage,
  type DesignReconstructionAsset,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4/client.js';
import type { BackgroundRemovalProviderId } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4/backgroundRemovalProvider.js';

export type DesignAssetReconstructionDetailProps = {
  asset: DesignReconstructionAsset;
  onGenerate: () => void;
  onLoveIt: () => void;
  generating?: boolean;
  reconstructionModel?: string;
  backgroundRemovalPreference?: BackgroundRemovalProviderId;
  onBackgroundRemovalChange?: (pref: BackgroundRemovalProviderId) => void;
};

export function DesignAssetReconstructionDetail({
  asset,
  onGenerate,
  onLoveIt,
  generating = false,
  reconstructionModel = 'GPT IMAGE 2 EDIT',
  backgroundRemovalPreference = 'AUTO',
  onBackgroundRemovalChange,
}: DesignAssetReconstructionDetailProps) {
  const lineage = buildSystemInspectorLineage(asset.assetId);
  const displayUrl = asset.cleanedAssetUrl ?? asset.generatedAssetUrl;

  return (
    <aside className="site00-dw-ref-asset-detail">
      <h3>{asset.semanticName}</h3>
      <p className="site00-dw-ref-asset-detail__type">
        {asset.assetType}
        {asset.liveUiRole ? ` · ${asset.liveUiRole}` : ''}
      </p>

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
          <h4>RECONSTRUCTION</h4>
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

      {asset.qa && (
        <div className="site00-dw-ref-asset-detail__qa">
          <h4>QA</h4>
          <ul>
            {asset.qa.domains.slice(0, 6).map((d) => (
              <li key={d.domain}>
                {d.domain}: {d.verdict}
              </li>
            ))}
          </ul>
          <p>Overall: {asset.qa.overallPass ? 'PASS' : 'REVIEW'}</p>
        </div>
      )}

      <div className="site00-dw-ref-asset-detail__actions">
        <button type="button" onClick={onGenerate} disabled={generating}>
          {generating ? 'GENERATING…' : 'GENERATE'}
        </button>
        <button type="button" onClick={onLoveIt} disabled={asset.founderJudgment === 'LOVE_IT'}>
          LOVE IT
        </button>
      </div>

      <details className="site00-dw-ref-asset-detail__inspector">
        <summary>SYSTEM INSPECTOR</summary>
        <dl>
          <dt>dispatchCount</dt>
          <dd>{lineage.dispatchCount}</dd>
          <dt>generationModel</dt>
          <dd>{lineage.generationModel ?? '—'}</dd>
          <dt>backgroundRemoval</dt>
          <dd>{lineage.backgroundRemovalProvider ?? '—'}</dd>
          <dt>supabasePath</dt>
          <dd>{lineage.supabasePath ?? '—'}</dd>
          <dt>binding</dt>
          <dd>{lineage.liveBinding?.bindingStatus ?? '—'}</dd>
        </dl>
      </details>
    </aside>
  );
}
