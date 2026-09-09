/**
 * P0.VR.4 / P0.VR.4R1 / P0.VR.4R2 — Reference Assets panel for Design Workspace.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  REFERENCE_ASSET_RECONSTRUCTION_FEATURE_LABEL,
  groupAssetsByStatus,
  listReconstructionAssets,
  dispatchReconstructionGeneration,
  upsertReconstructionAsset,
  approveAssetLoveIt,
  getReconstructionAsset,
  type DesignReconstructionAsset,
  type ApprovedScreenshotSource,
  PROJECTS_GOLDEN_TEST,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4/client.js';
import { isProjectsHeaderPlanetAsset } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4r1/browserClient.js';
import type {
  GenerationReceipt,
  BackgroundRemovalReceipt,
  MaterialPreservationQA,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4r1/browserClient.js';
import {
  PROJECTS_HEADER_PLANET_OBJECT_BOUNDS,
  PROJECTS_HEADER_PLANET_GOLDEN_FINAL_BOUNDS,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4r2/browserClient.js';
import { PROJECTS_INDEX_APPROVED_REFERENCE_PATH } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4r1/browserClient.js';
import type { CropCoordinateRecord, SourcePixelBounds } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4r2/browserClient.js';
import { DesignAssetReconstructionDetail } from './DesignAssetReconstructionDetail';
import { DesignReferenceCropEditor } from './DesignReferenceCropEditor';
import { DesignAssetJobWorkspace } from './DesignAssetJobWorkspace';
import { DesignSkinsReferenceAssetJobs } from './DesignSkinsReferenceAssetJobs';
import {
  generateLivePlanetAsset,
  approveLiveAsset,
  applyAssetToPage,
  fetchFalProviderHealth,
  extractPlanetCrop,
  approvePlanetCrop,
  preflightPlanetGenerate,
} from './designAssetReconstructionApi';

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
  screenshotSource: _screenshotSource,
  onRefresh,
}: DesignReferenceAssetsPanelProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [applying, setApplying] = useState(false);
  const [falHealthBlocker, setFalHealthBlocker] = useState<string | null>(null);
  const [generationBlocker, setGenerationBlocker] = useState<string | null>('GENERATION_BLOCKED_BY_CROP_QA');
  const [liveReceipt, setLiveReceipt] = useState<GenerationReceipt | null>(null);
  const [liveBgReceipt, setLiveBgReceipt] = useState<BackgroundRemovalReceipt | null>(null);
  const [liveMaterialQa, setLiveMaterialQa] = useState<MaterialPreservationQA | null>(null);
  const [cropRecord, setCropRecord] = useState<CropCoordinateRecord | null>(null);
  const [cropApproved, setCropApproved] = useState(false);
  const [founderBounds, setFounderBounds] = useState<SourcePixelBounds>(PROJECTS_HEADER_PLANET_OBJECT_BOUNDS);
  const [dispatchCounts, setDispatchCounts] = useState({ generations: 0, cropVersion: 0 });
  const [refreshKey, setRefreshKey] = useState(0);

  const planetReferenceUrl = referenceUrl ?? PROJECTS_INDEX_APPROVED_REFERENCE_PATH;

  useEffect(() => {
    void fetchFalProviderHealth().then((res) => {
      const health = res.health as { liveDispatchAllowed?: boolean; blocker?: string } | undefined;
      if (health && !health.liveDispatchAllowed) {
        setFalHealthBlocker(health.blocker ?? 'LIVE_FAL_BLOCKED');
      }
    });
  }, []);

  const assets = useMemo(
    () => listReconstructionAssets({ projectId, pageId }),
    [projectId, pageId, refreshKey, generating],
  );

  const grouped = useMemo(() => groupAssetsByStatus(assets), [assets]);
  const selected = selectedAssetId ? getReconstructionAsset(selectedAssetId) : null;

  const isLivePlanetAsset = useCallback(
    (asset: DesignReconstructionAsset) =>
      isProjectsHeaderPlanetAsset(asset.semanticName) &&
      projectId === PROJECTS_GOLDEN_TEST.projectId &&
      pageId === PROJECTS_GOLDEN_TEST.pageId,
    [projectId, pageId],
  );

  const syncAsset = useCallback((asset: DesignReconstructionAsset | null | undefined) => {
    if (asset) {
      upsertReconstructionAsset(asset);
      setSelectedAssetId(asset.assetId);
      setRefreshKey((n) => n + 1);
    }
  }, []);

  const runExtractCrop = useCallback(
    async (assetId?: string, bounds?: SourcePixelBounds | null) => {
      setExtracting(true);
      try {
        const res = await extractPlanetCrop({
          assetId,
          founderAdjustedBounds: bounds ?? founderBounds,
        });
        if (res.cropRecord) {
          setCropRecord(res.cropRecord);
          setCropApproved(res.cropRecord.locked);
          setDispatchCounts({
            generations: res.cropRecord.generationIdsUsingCrop.length,
            cropVersion: res.cropRecord.cropVersion,
          });
        }
        syncAsset(res.asset);
        if (res.asset?.assetId) {
          const pf = await preflightPlanetGenerate(res.asset.assetId);
          setDispatchCounts(pf.dispatchCounts ?? dispatchCounts);
          if (!pf.ok) setGenerationBlocker(pf.preflight?.blocker ?? 'GENERATION_BLOCKED_BY_CROP_QA');
          else setGenerationBlocker(null);
        }
      } finally {
        setExtracting(false);
      }
    },
    [founderBounds, syncAsset, dispatchCounts],
  );

  useEffect(() => {
    if (!selected || !isLivePlanetAsset(selected)) return;
    void runExtractCrop(selected.assetId);
  }, [selected?.assetId, isLivePlanetAsset, selected, runExtractCrop]);

  const handleUseCrop = useCallback(async () => {
    if (!selected) return;
    const res = await approvePlanetCrop(selected.assetId);
    if (res.ok && res.cropRecord) {
      setCropRecord(res.cropRecord);
      setCropApproved(true);
      setGenerationBlocker(null);
    }
  }, [selected]);

  const handleGenerate = useCallback(
    async (asset: DesignReconstructionAsset) => {
      if (isLivePlanetAsset(asset) && !cropApproved) {
        setGenerationBlocker('GENERATION_BLOCKED_BY_CROP_QA: approve crop with USE CROP first');
        return;
      }
      setGenerating(true);
      try {
        if (isLivePlanetAsset(asset)) {
          const res = await generateLivePlanetAsset({
            assetId: asset.assetId,
            cropApproved: true,
            founderAdjustedBounds: founderBounds,
          });
          if (res.result?.generationReceipt) setLiveReceipt(res.result.generationReceipt);
          if (res.result?.backgroundRemovalReceipt) setLiveBgReceipt(res.result.backgroundRemovalReceipt);
          if (res.result?.materialQa) setLiveMaterialQa(res.result.materialQa);
          if (res.blocked) setGenerationBlocker(res.blocker ?? res.preflight?.blocker ?? 'GENERATION_BLOCKED');
          if (res.dispatchCounts) setDispatchCounts(res.dispatchCounts);
          syncAsset(res.asset ?? undefined);
        } else {
          dispatchReconstructionGeneration({ assetId: asset.assetId, explicitFounderAction: true });
          setRefreshKey((n) => n + 1);
        }
      } finally {
        setGenerating(false);
        onRefresh?.();
      }
    },
    [isLivePlanetAsset, onRefresh, syncAsset, cropApproved, founderBounds],
  );

  const handleLoveIt = useCallback(
    async (asset: DesignReconstructionAsset) => {
      if (isLivePlanetAsset(asset)) {
        const res = await approveLiveAsset(asset.assetId);
        syncAsset(res.asset);
      } else {
        approveAssetLoveIt(asset.assetId);
        setRefreshKey((n) => n + 1);
      }
      onRefresh?.();
    },
    [isLivePlanetAsset, onRefresh, syncAsset],
  );

  const handleApplyToPage = useCallback(
    async (asset: DesignReconstructionAsset) => {
      setApplying(true);
      try {
        const res = await applyAssetToPage(asset.assetId);
        if (res.ok) syncAsset(getReconstructionAsset(asset.assetId) ?? undefined);
      } finally {
        setApplying(false);
        onRefresh?.();
      }
    },
    [onRefresh, syncAsset],
  );

  const handleViewOnPage = useCallback(() => {
    window.open('/projects?designPreview=1', '_blank', 'noopener,noreferrer');
  }, []);

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

  const generateBlocker = generationBlocker ?? falHealthBlocker;

  return (
    <div className="site00-dw-ref-assets">
      <DesignSkinsReferenceAssetJobs viewport="MOBILE" />

      <DesignAssetJobWorkspace
        projectId={projectId}
        pageId={pageId}
        route={_route}
        referenceUrl={referenceUrl}
        sourcePage={pageId}
      />

      <details className="site00-dw-ref-assets__legacy">
        <summary>LEGACY SINGLE-ASSET PIPELINE (P0.VR.4)</summary>
      <header className="site00-dw-ref-assets__header">
        <h2>{REFERENCE_ASSET_RECONSTRUCTION_FEATURE_LABEL}</h2>
        <p className="site00-body">DETECT → CROP → QA CROP → GENERATE (crop QA required before any paid dispatch)</p>
      </header>

      <div className="site00-dw-ref-assets__layout">
        <div className="site00-dw-ref-assets__list">
          {renderSection('DETECTED', grouped.DETECTED)}
          {renderSection('READY TO RECONSTRUCT', grouped.READY_TO_RECONSTRUCT)}
          {renderSection('IN REVIEW', grouped.IN_REVIEW)}
          {renderSection('APPROVED', grouped.APPROVED)}
          {renderSection('LIVE', grouped.LIVE)}
        </div>

        {selected && isLivePlanetAsset(selected) && (
          <DesignReferenceCropEditor
            referenceUrl={planetReferenceUrl}
            cropPreviewUrl={selected.referenceCropUrl}
            objectBounds={founderBounds}
            finalBounds={cropRecord?.finalBounds ?? PROJECTS_HEADER_PLANET_GOLDEN_FINAL_BOUNDS}
            qaStatus={cropRecord?.qaStatus ?? 'CROP_DRAFT'}
            qaFailures={cropRecord?.qaFailures ?? []}
            cropChecksum={cropRecord?.cropChecksum ?? null}
            cropApproved={cropApproved}
            dispatchCounts={dispatchCounts}
            onBoundsChange={setFounderBounds}
            onExtractCrop={() => runExtractCrop(selected.assetId, founderBounds)}
            onUseCrop={handleUseCrop}
            extracting={extracting}
          />
        )}

        {selected && (
          <DesignAssetReconstructionDetail
            asset={selected}
            onGenerate={() => handleGenerate(selected)}
            onLoveIt={() => handleLoveIt(selected)}
            onApplyToPage={isLivePlanetAsset(selected) ? () => handleApplyToPage(selected) : undefined}
            onViewOnPage={isLivePlanetAsset(selected) ? handleViewOnPage : undefined}
            generating={generating}
            applying={applying}
            liveGenerationReceipt={isLivePlanetAsset(selected) ? liveReceipt : null}
            liveBackgroundRemovalReceipt={isLivePlanetAsset(selected) ? liveBgReceipt : null}
            liveMaterialQa={isLivePlanetAsset(selected) ? liveMaterialQa : null}
            falHealthBlocker={isLivePlanetAsset(selected) ? generateBlocker : null}
            cropApproved={isLivePlanetAsset(selected) ? cropApproved : true}
            dispatchCounts={isLivePlanetAsset(selected) ? dispatchCounts : undefined}
          />
        )}
      </div>
      </details>
    </div>
  );
}
