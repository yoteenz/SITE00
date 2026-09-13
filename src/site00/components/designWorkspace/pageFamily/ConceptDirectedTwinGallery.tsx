/**
 * P0.VR.TWINV2.2 — Horizontal concept gallery + readiness + blueprint peek.
 */

import { useCallback, useRef, useState, type TouchEvent } from 'react';
import type { ConceptCandidate, ConceptBlueprint } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/types.js';
import { sortCandidatesForGallery } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import { canBuildConcept } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/computeConceptBuildReadiness.js';

type BlueprintViewMode = 'VISUAL' | 'BLUEPRINT' | 'OVERLAY' | 'OBJECT_MAP' | 'FUNCTION_MAP' | 'ASSETS';

type Props = {
  candidates: ConceptCandidate[];
  activeConceptId: string | null;
  blueprints: Record<string, ConceptBlueprint>;
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
      {r.status === 'READY_TO_BUILD' || r.status === 'APPROVED_READY_TO_BUILD' ? (
        <strong className="site00-twin-v2-gallery__ready-ok">READY TO BUILD</strong>
      ) : candidate.founderJudgment === 'APPROVED' ? (
        <strong className="site00-twin-v2-gallery__ready-warn">PREPARING BUILD PACKAGE</strong>
      ) : (
        <strong className="site00-twin-v2-gallery__ready-warn">VISUAL ONLY — NOT BUILD READY</strong>
      )}
    </div>
  );
}

export function ConceptDirectedTwinGallery({
  candidates,
  activeConceptId,
  blueprints,
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
  const blueprint = active ? blueprints[active.conceptBlueprintId] : null;
  const bindings = active ? bindingSummaries[active.functionBindingPlanId] ?? [] : [];

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

  const buildOk = active.founderJudgment === 'APPROVED' && canBuildConcept(active.buildReadiness, true);

  return (
    <div className="site00-twin-v2-gallery">
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
        >
          BUILD THIS CONCEPT
        </button>
      </div>

      <div className="site00-twin-v2-gallery__view-tabs" role="tablist" aria-label="Blueprint view">
        {(['VISUAL', 'BLUEPRINT', 'OVERLAY', 'OBJECT_MAP', 'FUNCTION_MAP', 'ASSETS'] as BlueprintViewMode[]).map(
          (mode) => (
            <button
              key={mode}
              type="button"
              role="tab"
              className={viewMode === mode ? 'is-active' : ''}
              onClick={() => setViewMode(mode)}
            >
              {mode === 'BLUEPRINT' || mode === 'ASSETS' ? `VIEW ${mode.replace(/_/g, ' ')}` : mode.replace(/_/g, ' ')}
            </button>
          ),
        )}
      </div>

      {viewMode !== 'VISUAL' && blueprint ? (
        <section className="site00-twin-v2-gallery__blueprint-panel">
          {viewMode === 'BLUEPRINT' || viewMode === 'OVERLAY' ? (
            <ul>
              {blueprint.sections.map((s) => (
                <li key={s.id}>
                  {s.label} — y:{s.bounds.y.toFixed(2)} h:{s.bounds.h.toFixed(2)}
                </li>
              ))}
            </ul>
          ) : null}
          {viewMode === 'OBJECT_MAP' ? (
            <ul>
              {blueprint.objects.slice(0, 12).map((o) => (
                <li key={o.objectId}>
                  {o.objectId} · {o.role} · z{o.zLayer}
                </li>
              ))}
            </ul>
          ) : null}
          {viewMode === 'FUNCTION_MAP' ? (
            <ul>
              {bindings.map((b) => (
                <li key={b.region}>
                  {b.region} → {b.fn}
                </li>
              ))}
            </ul>
          ) : null}
          {viewMode === 'ASSETS' ? <p>{blueprint.assetSlots.length} asset slots mapped to concept regions.</p> : null}
        </section>
      ) : null}
    </div>
  );
}
