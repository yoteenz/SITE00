/**
 * P0.VR.4 — Reference Assets panel for Design Workspace.
 */

import { useCallback, useMemo, useState } from 'react';
import {
  REFERENCE_ASSET_RECONSTRUCTION_FEATURE_LABEL,
  groupAssetsByStatus,
  listReconstructionAssets,
  dispatchReconstructionGeneration,
  approveAssetLoveIt,
  getReconstructionAsset,
  type DesignReconstructionAsset,
  type ApprovedScreenshotSource,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4/client.js';
import { DesignAssetReconstructionDetail } from './DesignAssetReconstructionDetail';

export type DesignReferenceAssetsPanelProps = {
  projectId: string;
  pageId: string;
  route: string;
  referenceUrl: string | null;
  screenshotSource: ApprovedScreenshotSource | null;
  onRefresh?: () => void;
};

export function DesignReferenceAssetsPanel({
  projectId,
  pageId,
  route: _route,
  referenceUrl,
  screenshotSource,
  onRefresh,
}: DesignReferenceAssetsPanelProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const assets = useMemo(
    () => listReconstructionAssets({ projectId, pageId }),
    [projectId, pageId, generating],
  );

  const grouped = useMemo(() => groupAssetsByStatus(assets), [assets]);
  const selected = selectedAssetId ? getReconstructionAsset(selectedAssetId) : null;

  const handleGenerate = useCallback(
    async (assetId: string) => {
      setGenerating(true);
      dispatchReconstructionGeneration({ assetId, explicitFounderAction: true });
      setGenerating(false);
      onRefresh?.();
    },
    [onRefresh],
  );

  const handleLoveIt = useCallback(
    (assetId: string) => {
      approveAssetLoveIt(assetId);
      onRefresh?.();
    },
    [onRefresh],
  );

  const renderCard = (asset: DesignReconstructionAsset) => (
    <button
      key={asset.assetId}
      type="button"
      className={`site00-dw-ref-asset-card${selectedAssetId === asset.assetId ? ' site00-dw-ref-asset-card--selected' : ''}`}
      onClick={() => setSelectedAssetId(asset.assetId)}
    >
      <div className="site00-dw-ref-asset-card__thumb">
        {asset.referenceCropUrl ? (
          <img src={asset.referenceCropUrl} alt="" />
        ) : (
          <span className="site00-dw-ref-asset-card__placeholder">CROP</span>
        )}
      </div>
      <div className="site00-dw-ref-asset-card__meta">
        <strong>{asset.semanticName}</strong>
        <span>{asset.assetType}</span>
        <span>{asset.status}</span>
        {asset.reconstructionModel && <span>{asset.reconstructionModel.split('/').pop()}</span>}
      </div>
    </button>
  );

  const renderSection = (title: string, items: DesignReconstructionAsset[]) => {
    if (!items.length) return null;
    return (
      <section className="site00-dw-ref-assets-section">
        <h3>{title}</h3>
        <div className="site00-dw-ref-assets-grid">{items.map(renderCard)}</div>
      </section>
    );
  };

  return (
    <div className="site00-dw-ref-assets">
      <header className="site00-dw-ref-assets__header">
        <h2>{REFERENCE_ASSET_RECONSTRUCTION_FEATURE_LABEL}</h2>
        <p className="site00-body">
          Screenshot → crop → GPT Image 2 Edit → transparency → QA → Supabase → live binding
        </p>
        {referenceUrl && (
          <div className="site00-dw-ref-assets__reference-preview">
            <img src={referenceUrl} alt="Approved reference" />
          </div>
        )}
        {screenshotSource && screenshotSource.approvalStatus !== 'APPROVED' && (
          <p className="site00-dw-ref-assets__warn">Only approved screenshots are design authority.</p>
        )}
      </header>

      <div className="site00-dw-ref-assets__layout">
        <div className="site00-dw-ref-assets__list">
          {renderSection('DETECTED', grouped.DETECTED)}
          {renderSection('READY TO RECONSTRUCT', grouped.READY_TO_RECONSTRUCT)}
          {renderSection('IN REVIEW', grouped.IN_REVIEW)}
          {renderSection('APPROVED', grouped.APPROVED)}
          {renderSection('LIVE', grouped.LIVE)}
          {!assets.length && (
            <p className="site00-body">No reconstructable assets detected for this page yet.</p>
          )}
        </div>

        {selected && (
          <DesignAssetReconstructionDetail
            asset={selected}
            onGenerate={() => handleGenerate(selected.assetId)}
            onLoveIt={() => handleLoveIt(selected.assetId)}
            generating={generating}
          />
        )}
      </div>
    </div>
  );
}
