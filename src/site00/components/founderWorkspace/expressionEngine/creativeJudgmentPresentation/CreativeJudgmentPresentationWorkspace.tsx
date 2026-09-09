/**
 * P0.CJ.2 — Concept Review presentation layer (gallery · detail · compare · trailer).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '../../../../../utils/api.js';
import type {
  ConceptGalleryPayload,
  PresentationFounderJudgment,
} from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/types.js';
import { ConceptPanelCard } from './ConceptPanelCard.js';
import { ConceptCompareView } from './ConceptCompareView.js';
import { BrandCaseProfilePanel } from './BrandCaseProfilePanel.js';
import { ConceptTrailerMode } from './ConceptTrailerMode.js';
import { ExpressionEngineMaturityDashboard, type ExpressionEngineMaturityPayload } from '../ExpressionEngineMaturityDashboard.js';

type ViewMode = 'gallery' | 'detail' | 'compare' | 'trailer' | 'diagnostics';

type Props = {
  projectSlug: string;
  isMobile?: boolean;
};

function useIsMobileLayout(fallback = false): boolean {
  const [mobile, setMobile] = useState(fallback);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return mobile;
}

export function CreativeJudgmentPresentationWorkspace({ projectSlug, isMobile: isMobileProp }: Props) {
  const isMobileDetected = useIsMobileLayout(false);
  const isMobile = isMobileProp ?? isMobileDetected;
  const [payload, setPayload] = useState<ConceptGalleryPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [activeIndex, setActiveIndex] = useState(0);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [filterCase, setFilterCase] = useState<'all' | 'real_brand' | 'invented'>('all');
  const [noteDraft, setNoteDraft] = useState('');
  const [maturityPayload, setMaturityPayload] = useState<ExpressionEngineMaturityPayload | null>(null);
  const swipeRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  const loadGallery = useCallback(async () => {
    const res = await apiFetch('/api/site00/expression-engine?phase=P0.CJ.2');
    if (!res.ok) return null;
    return res.json() as Promise<ConceptGalleryPayload>;
  }, []);

  const loadMaturity = useCallback(async () => {
    const res = await apiFetch('/api/site00/expression-engine?phase=P0.CJ.1');
    if (!res.ok) return null;
    return res.json() as Promise<ExpressionEngineMaturityPayload>;
  }, []);

  useEffect(() => {
    setLoading(true);
    void Promise.all([loadGallery(), loadMaturity()])
      .then(([g, m]) => {
        setPayload(g);
        setMaturityPayload(m);
      })
      .finally(() => setLoading(false));
  }, [loadGallery, loadMaturity]);

  const concepts = useMemo(() => {
    const list = payload?.concepts ?? [];
    if (filterCase === 'all') return list;
    return list.filter((c) => c.caseType === filterCase);
  }, [payload, filterCase]);

  const activePanel = concepts[activeIndex] ?? null;
  const comparePanels = useMemo(
    () => concepts.filter((c) => compareIds.includes(c.id)),
    [concepts, compareIds],
  );

  const submitJudgment = useCallback(
    async (conceptId: string, judgment: PresentationFounderJudgment) => {
      await apiFetch('/api/site00/expression-engine?phase=P0.CJ.2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CONCEPT_FOUNDER_JUDGMENT',
          projectId: projectSlug,
          conceptId,
          judgment,
          whyIFeelThis: noteDraft || null,
        }),
      });
      const next = await loadGallery();
      setPayload(next);
    },
    [projectSlug, noteDraft, loadGallery],
  );

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? 0;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(dx) < 40) return;
    if (dx < 0 && activeIndex < concepts.length - 1) setActiveIndex((i) => i + 1);
    if (dx > 0 && activeIndex > 0) setActiveIndex((i) => i - 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (viewMode !== 'gallery') return;
      if (e.key === 'ArrowRight') setActiveIndex((i) => Math.min(concepts.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setActiveIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewMode, concepts.length]);

  if (loading) return <p className="site00-cj-presentation__loading">Loading concept review…</p>;
  if (!payload) return <p className="site00-cj-presentation__loading">Concept gallery unavailable.</p>;

  if (viewMode === 'trailer' && activePanel) {
    return <ConceptTrailerMode panel={activePanel} onExit={() => setViewMode('gallery')} />;
  }

  return (
    <section
      className={`site00-cj-presentation${isMobile ? ' site00-cj-presentation--mobile' : ' site00-cj-presentation--desktop'}`}
      data-visual-authority={payload.visualAuthority}
    >
      <header className="site00-cj-presentation__head">
        <div>
          <h2>CONCEPT REVIEW</h2>
          <p>{payload.presentationVersion} · {concepts.length} concepts · Level 1 Gallery</p>
        </div>
        <nav className="site00-cj-presentation__modes">
          {(['gallery', 'detail', 'compare', 'diagnostics'] as ViewMode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={viewMode === m ? 'is-active' : ''}
              onClick={() => setViewMode(m)}
            >
              {m.toUpperCase()}
            </button>
          ))}
          {activePanel && payload.trailerModeAvailable ? (
            <button type="button" onClick={() => setViewMode('trailer')}>TRAILER</button>
          ) : null}
        </nav>
      </header>

      <div className="site00-cj-presentation__filters">
        <button type="button" className={filterCase === 'all' ? 'is-active' : ''} onClick={() => setFilterCase('all')}>ALL</button>
        <button type="button" className={filterCase === 'real_brand' ? 'is-active' : ''} onClick={() => setFilterCase('real_brand')}>REAL BRAND</button>
        <button type="button" className={filterCase === 'invented' ? 'is-active' : ''} onClick={() => setFilterCase('invented')}>INVENTED</button>
        <span className="site00-cj-presentation__compare-count">{compareIds.length} selected for compare</span>
      </div>

      {payload.brandCases[0] ? (
        <details className="site00-cj-presentation__case-profile">
          <summary>CASE PROFILE · {payload.brandCases[0].brandName.toUpperCase()}</summary>
          <BrandCaseProfilePanel profile={payload.brandCases[0]} />
        </details>
      ) : null}

      {viewMode === 'gallery' ? (
        isMobile ? (
          <div
            ref={swipeRef}
            className="site00-cj-presentation__swiper"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {activePanel ? (
              <ConceptPanelCard
                panel={activePanel}
                onJudgment={(j) => void submitJudgment(activePanel.id, j)}
                onOpenDetail={() => setViewMode('detail')}
              />
            ) : null}
            <div className="site00-cj-presentation__dots">
              {concepts.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  className={i === activeIndex ? 'is-active' : ''}
                  aria-label={`Concept ${i + 1}`}
                  onClick={() => setActiveIndex(i)}
                />
              ))}
            </div>
            <div className="site00-cj-presentation__sticky-note">
              <input
                type="text"
                placeholder="Why I feel this…"
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="site00-cj-presentation__grid">
            {concepts.map((panel, i) => (
              <ConceptPanelCard
                key={panel.id}
                panel={panel}
                compact
                selected={compareIds.includes(panel.id)}
                onSelect={() => toggleCompare(panel.id)}
                onOpenDetail={() => {
                  setActiveIndex(i);
                  setViewMode('detail');
                }}
                onJudgment={(j) => void submitJudgment(panel.id, j)}
              />
            ))}
          </div>
        )
      ) : null}

      {viewMode === 'detail' && activePanel ? (
        <div className="site00-cj-presentation__detail">
          <ConceptPanelCard
            panel={activePanel}
            onJudgment={(j) => void submitJudgment(activePanel.id, j)}
          />
          <aside className="site00-cj-presentation__output-actions">
            <h4>OUTPUT ACTIONS</h4>
            <button type="button">SAVE AS AUTHORITY</button>
            <button type="button">ADVANCE TO STORYBOARD</button>
            <button type="button">GENERATE CONCEPT BOARD</button>
            <button type="button" onClick={() => setViewMode('compare')}>COMPARE WITH ANOTHER</button>
            <button type="button" onClick={() => setViewMode('trailer')}>EXPORT TRAILER</button>
          </aside>
        </div>
      ) : null}

      {viewMode === 'compare' ? (
        <ConceptCompareView
          panels={comparePanels.length >= 2 ? comparePanels : concepts.slice(0, 2)}
          onPickWinner={(id) => void submitJudgment(id, 'APPROVED_FOR_NEXT_STAGE')}
        />
      ) : null}

      {viewMode === 'diagnostics' ? (
        <details open className="site00-cj-presentation__diagnostics">
          <summary>LEVEL 3 · INTERNAL INTELLIGENCE</summary>
          <ExpressionEngineMaturityDashboard payload={maturityPayload} loading={false} />
        </details>
      ) : null}
    </section>
  );
}
