/**
 * P0.VR.TWINV2.2 + 2R2R1 — Concept gallery with execution blueprint + host boundary UI.
 */

import { useCallback, useRef, useState, type TouchEvent } from 'react';
import type { ConceptCandidate, ConceptBlueprint } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/types.js';
import type {
  GeneratedHostArtifact,
  HostShellContract,
} from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22R2/types.js';
import type { ClientCanvasBoundary } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22R2/computeClientCanvasBoundary.js';
import type { HostBoundarySanitizationReceipt } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22R2/buildHostBoundarySanitizationReceipt.js';
import { sortCandidatesForGallery } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import { canBuildConcept } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/computeConceptBuildReadiness.js';
import { buildBlueprintRegionInspectionRows } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22R2/buildBlueprintRegionInspectionRows.js';
import { computeExecutableConceptPackageReadiness } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22R2/computeExecutableConceptPackageReadiness.js';
import { TwinV2HostShellCompositePreview } from './TwinV2HostShellCompositePreview.js';
import { TwinV2ExecutionClientCanvasFrame } from './TwinV2ExecutionClientCanvasFrame.js';

type BlueprintViewMode =
  | 'VISUAL'
  | 'CLIENT_CANVAS'
  | 'HOST_PREVIEW'
  | 'BLUEPRINT'
  | 'OVERLAY'
  | 'OBJECT_MAP'
  | 'FUNCTION_MAP'
  | 'ASSETS';

type Props = {
  projectSlug: string;
  candidates: ConceptCandidate[];
  activeConceptId: string | null;
  blueprints: Record<string, ConceptBlueprint>;
  sanitizedBlueprints: Record<string, ConceptBlueprint>;
  generatedHostArtifacts: Record<string, GeneratedHostArtifact[]>;
  hostShellContracts: Record<string, HostShellContract>;
  hostBoundaryReceipts: Record<string, HostBoundarySanitizationReceipt>;
  clientCanvasBoundaries: Record<string, ClientCanvasBoundary>;
  bindingSummaries: Record<string, { region: string; fn: string }[]>;
  onSelectConcept: (conceptId: string) => void;
  onApprove: () => void;
  onRefine: () => void;
  onRegenerate: () => void;
  onBuild: () => void;
  building: boolean;
  generating: boolean;
};

function ReadinessStrip({ candidate }: { candidate: ConceptCandidate }) {
  const r = candidate.buildReadiness;
  const chip = (ready: boolean, label: string) => (
    <span className={`site00-twin-v2-gallery__ready${ready ? ' is-ok' : ' is-pending'}`}>
      {label}
      {ready ? ' ✓' : ' PENDING'}
    </span>
  );
  return (
    <div className="site00-twin-v2-gallery__readiness" aria-label="Build readiness">
      {chip(r.visualReady, 'VISUAL')}
      {chip(r.blueprintReady, 'BLUEPRINT')}
      {chip(r.assetsReady, 'ASSETS')}
      {chip(r.functionsReady, 'FUNCTIONS')}
      {chip(r.hostBoundaryReady === true, 'HOST BOUNDARY')}
    </div>
  );
}

function tabLabel(mode: BlueprintViewMode): string {
  switch (mode) {
    case 'CLIENT_CANVAS':
      return 'CLIENT CANVAS';
    case 'HOST_PREVIEW':
      return 'HOST PREVIEW';
    case 'BLUEPRINT':
      return 'VIEW BLUEPRINT';
    case 'ASSETS':
      return 'VIEW ASSETS';
    default:
      return mode.replace(/_/g, ' ');
  }
}

export function ConceptDirectedTwinGallery({
  projectSlug,
  candidates,
  activeConceptId,
  blueprints,
  sanitizedBlueprints,
  generatedHostArtifacts,
  hostShellContracts,
  hostBoundaryReceipts,
  clientCanvasBoundaries,
  bindingSummaries,
  onSelectConcept,
  onApprove,
  onRefine,
  onRegenerate,
  onBuild,
  building,
  generating,
}: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [viewMode, setViewMode] = useState<BlueprintViewMode>('VISUAL');
  const sorted = sortCandidatesForGallery(candidates);
  const activeIndex = Math.max(
    0,
    sorted.findIndex((c) => c.conceptId === activeConceptId),
  );
  const active = sorted[activeIndex] ?? sorted.at(-1);

  const originalBlueprint = active ? blueprints[active.conceptBlueprintId] : null;
  const executionBlueprint =
    active && active.executionBlueprintId
      ? sanitizedBlueprints[active.executionBlueprintId]
      : active
        ? Object.values(sanitizedBlueprints).find((b) => b.conceptId === active.conceptId) ?? null
        : null;
  const hostArtifacts = active ? generatedHostArtifacts[active.conceptId] ?? [] : [];
  const hostContract = active ? hostShellContracts[active.conceptId] ?? null : null;
  const hostReceipt = active ? hostBoundaryReceipts[active.conceptId] : null;
  const clientCanvasBoundary = active ? clientCanvasBoundaries[active.conceptId] ?? null : null;
  const bindings = active ? bindingSummaries[active.functionBindingPlanId] ?? [] : [];

  const inspectionRows =
    originalBlueprint && executionBlueprint
      ? buildBlueprintRegionInspectionRows({
          originalBlueprint,
          executionBlueprint,
          generatedHostArtifacts: hostArtifacts,
          hostShellContract: hostContract,
        })
      : [];

  const packageReadiness = active
    ? computeExecutableConceptPackageReadiness({ candidate: active, readiness: active.buildReadiness })
    : null;

  const scrollToIndex = useCallback(
    (idx: number) => {
      const bounded = Math.max(0, Math.min(sorted.length - 1, idx));
      const c = sorted[bounded];
      if (!c) return;
      onSelectConcept(c.conceptId);
      const el = railRef.current?.querySelector(`[data-concept-id="${c.conceptId}"]`);
      el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    },
    [onSelectConcept, sorted],
  );

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: TouchEvent) => {
    const start = touchStartX.current;
    const end = e.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (start == null || end == null) return;
    const delta = end - start;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) scrollToIndex(activeIndex + 1);
    else scrollToIndex(activeIndex - 1);
  };

  if (!active) {
    return <p>No concepts in gallery yet.</p>;
  }

  const buildOk =
    active.founderJudgment === 'APPROVED' &&
    canBuildConcept(active.buildReadiness, true) &&
    active.buildReadiness.hostBoundaryReady === true;

  const buildBlockReason =
    !active.buildReadiness.hostBoundaryReady
      ? 'HOST BOUNDARY INCOMPLETE — verify VIEW BLUEPRINT + HOST PREVIEW'
      : active.founderJudgment !== 'APPROVED'
        ? 'Approve concept after host boundary verification'
        : null;

  return (
    <div className="site00-twin-v2-gallery" data-twin-v2-host-boundary-ui="1">
      <header className="site00-twin-v2-gallery__head">
        <strong>TWIN V2 — CONCEPTS</strong>
        <span>
          CONCEPT {active.versionNumber} OF {sorted.length}
        </span>
      </header>

      <div
        ref={railRef}
        className="site00-twin-v2-gallery__rail"
        role="list"
        aria-label="Concept gallery swipe rail"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {sorted.map((c) => (
          <article
            key={c.conceptId}
            role="listitem"
            data-concept-id={c.conceptId}
            className={`site00-twin-v2-gallery__slide${c.conceptId === active.conceptId ? ' is-active' : ''}`}
            onClick={() => onSelectConcept(c.conceptId)}
          >
            {c.visualAssetUrl || c.visualAsset ? (
              <img src={c.visualAssetUrl ?? undefined} alt={`Concept ${c.versionNumber}`} draggable={false} />
            ) : (
              <div className="site00-twin-v2-gallery__empty">NO IMAGE</div>
            )}
            <footer>
              <span>CONCEPT {String(c.versionNumber).padStart(2, '0')}</span>
              {c.generationType === 'LEGACY_V2_CONCEPT' ? (
                <span className="site00-twin-v2-gallery__legacy">RECOVERED</span>
              ) : (
                <span>{c.generationType.replace(/_/g, ' ')}</span>
              )}
            </footer>
          </article>
        ))}
      </div>

      <div className="site00-twin-v2-gallery__filmstrip" aria-label="Concept thumbnails">
        {sorted.map((c, idx) => (
          <button
            key={c.conceptId}
            type="button"
            className={c.conceptId === active.conceptId ? 'is-active' : ''}
            onClick={() => scrollToIndex(idx)}
          >
            {String(c.versionNumber).padStart(2, '0')}
          </button>
        ))}
      </div>

      <ReadinessStrip candidate={active} />
      {hostReceipt ? (
        <p className="site00-twin-v2-gallery__host-receipt" aria-label="Host boundary receipt">
          Execution blueprint: {hostReceipt.executionBlueprintId} · excluded artifacts:{' '}
          {hostReceipt.generatedHostArtifactCount}
        </p>
      ) : null}

      <div className="site00-twin-v2-gallery__actions">
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={onApprove}>
          APPROVE
        </button>
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" disabled={generating} onClick={onRegenerate}>
          REGENERATE
        </button>
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" disabled={generating} onClick={onRefine}>
          REFINE
        </button>
        <button
          type="button"
          className="site00-dw-v3-btn site00-dw-v3-btn--primary"
          disabled={!buildOk || building}
          onClick={onBuild}
          title={buildBlockReason ?? undefined}
        >
          BUILD THIS CONCEPT
        </button>
      </div>
      {buildBlockReason ? <p className="site00-twin-v2-gallery__build-block">{buildBlockReason}</p> : null}

      <div className="site00-twin-v2-gallery__view-tabs" role="tablist" aria-label="Concept inspection views">
        {(
          [
            'VISUAL',
            'CLIENT_CANVAS',
            'HOST_PREVIEW',
            'BLUEPRINT',
            'OVERLAY',
            'OBJECT_MAP',
            'FUNCTION_MAP',
            'ASSETS',
          ] as BlueprintViewMode[]
        ).map((mode) => (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={viewMode === mode}
            data-view-tab={mode}
            className={viewMode === mode ? 'is-active' : ''}
            onClick={() => setViewMode(mode)}
          >
            {tabLabel(mode)}
          </button>
        ))}
      </div>

      {viewMode === 'CLIENT_CANVAS' && active.visualAssetUrl && clientCanvasBoundary ? (
        <section className="site00-twin-v2-gallery__blueprint-panel" data-panel="client-canvas">
          <p>NDXBOOK client creative area only (trimmed at last client-owned boundary).</p>
          <TwinV2ExecutionClientCanvasFrame
            imageUrl={active.visualAssetUrl}
            boundary={clientCanvasBoundary}
            alt="Client canvas authority"
          />
        </section>
      ) : null}

      {viewMode === 'HOST_PREVIEW' ? (
        <section data-panel="host-preview" aria-label="Host preview">
          <TwinV2HostShellCompositePreview
            projectSlug={projectSlug}
            clientCanvasImageUrl={active.visualAssetUrl ?? null}
            clientCanvasBoundary={clientCanvasBoundary}
          />
          <p className="site00-twin-v2-gallery__host-preview-note">
            REAL SITE 00 HOST SHELL + APPROVED NDXBOOK CLIENT CANVAS. Generated host artifacts are excluded from build.
          </p>
        </section>
      ) : null}

      {viewMode !== 'VISUAL' && viewMode !== 'CLIENT_CANVAS' && viewMode !== 'HOST_PREVIEW' && originalBlueprint ? (
        <section className="site00-twin-v2-gallery__blueprint-panel">
          {viewMode === 'BLUEPRINT' || viewMode === 'OVERLAY' ? (
            <ul className="site00-twin-v2-gallery__region-list">
              {inspectionRows.map((row) => (
                <li key={row.regionId} className="site00-twin-v2-gallery__region-row">
                  <strong>{row.label}</strong>
                  <span>
                    y:{row.bounds.y.toFixed(2)} h:{row.bounds.h.toFixed(2)}
                  </span>
                  <div className="site00-twin-v2-gallery__region-meta">
                    <span>OWNERSHIP: {row.ownership}</span>
                    {row.generatedSource ? (
                      <span className="site00-twin-v2-gallery__ownership-badge is-host-artifact">
                        GENERATED HOST ARTIFACT
                      </span>
                    ) : null}
                    {row.executionStatus === 'EXCLUDED_FROM_CLIENT_BUILD' ? (
                      <span className="site00-twin-v2-gallery__ownership-badge is-host-artifact">EXCLUDED</span>
                    ) : null}
                    <span>EXECUTION: {row.executionStatus}</span>
                    {row.runtimeSource ? <span>→ {row.runtimeSource}</span> : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          {viewMode === 'OBJECT_MAP' && executionBlueprint ? (
            <ul>
              {executionBlueprint.objects.map((o) => (
                <li key={o.objectId}>
                  {o.objectId} · {o.role} · z{o.zLayer}
                  <span className="site00-twin-v2-gallery__ownership-badge is-client">CLIENT CREATIVE</span>
                </li>
              ))}
            </ul>
          ) : null}
          {viewMode === 'FUNCTION_MAP' ? (
            <>
              <p className="site00-twin-v2-gallery__fn-head">CLIENT PAGE FUNCTIONS</p>
              <ul>
                {bindings.map((b) => (
                  <li key={b.region}>
                    {b.region} → {b.fn}
                  </li>
                ))}
              </ul>
              {hostContract ? (
                <>
                  <p className="site00-twin-v2-gallery__fn-head">HOST COMPONENT BINDINGS</p>
                  <ul>
                    <li>{hostContract.hostHeaderComponent}</li>
                    <li>{hostContract.hostBottomNavComponent}</li>
                    <li>{hostContract.pageMountPoint}</li>
                  </ul>
                </>
              ) : null}
            </>
          ) : null}
          {viewMode === 'ASSETS' && executionBlueprint ? (
            <p>{executionBlueprint.assetSlots.length} client asset slots (host artifacts excluded).</p>
          ) : null}
          {packageReadiness && viewMode === 'BLUEPRINT' ? (
            <p className="site00-twin-v2-gallery__package-ready">
              Package readiness: {packageReadiness.readyToBuild ? 'READY' : packageReadiness.blockingReasons.join(', ')}
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
