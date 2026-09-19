/**
 * P0.CJ.2V — Creative Judgment visual presentation workspace.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../../../utils/api.js';
import type {
  ConceptGalleryPayload,
  PresentationFounderJudgment,
} from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/types.js';
import { ConceptCompareView } from './ConceptCompareView.js';
import { ConceptDetailView } from './ConceptDetailView.js';
import { ConceptGalleryDesktop } from './ConceptGalleryDesktop.js';
import { ConceptGalleryMobile } from './ConceptGalleryMobile.js';
import { ConceptTrailerMode } from './ConceptTrailerMode.js';
import { ExpressionEngineMaturityDashboard, type ExpressionEngineMaturityPayload } from '../ExpressionEngineMaturityDashboard.js';

type ViewMode = 'gallery' | 'detail' | 'compare' | 'trailer' | 'maturity';

type Props = {
  projectSlug: string;
};

function useIsMobileLayout(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return mobile;
}

export function CreativeJudgmentPresentationWorkspace({ projectSlug }: Props) {
  const isMobile = useIsMobileLayout();
  const [payload, setPayload] = useState<ConceptGalleryPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [activeIndex, setActiveIndex] = useState(0);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'real_brand' | 'invented' | 'unreviewed'>('all');
  const [noteDraft, setNoteDraft] = useState('');
  const [maturityPayload, setMaturityPayload] = useState<ExpressionEngineMaturityPayload | null>(null);

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
    void loadGallery().then(setPayload).finally(() => setLoading(false));
  }, [loadGallery]);

  const concepts = useMemo(() => {
    let list = payload?.concepts ?? [];
    if (filter === 'real_brand') list = list.filter((c) => c.caseType === 'real_brand');
    if (filter === 'invented') list = list.filter((c) => c.caseType === 'invented');
    if (filter === 'unreviewed') list = list.filter((c) => !c.founderJudgment);
    return list;
  }, [payload, filter]);

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
      setPayload(await loadGallery());
    },
    [projectSlug, noteDraft, loadGallery],
  );

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1]!, id];
      return [...prev, id];
    });
  };

  useEffect(() => {
    if (activeIndex >= concepts.length) setActiveIndex(Math.max(0, concepts.length - 1));
  }, [concepts.length, activeIndex]);

  if (loading) return <p className="site00-cj-shell__loading">LOADING CREATIVE JUDGMENT…</p>;
  if (!payload) return <p className="site00-cj-shell__loading">CONCEPT GALLERY UNAVAILABLE.</p>;

  if (viewMode === 'trailer' && activePanel) {
    return <ConceptTrailerMode panel={activePanel} onExit={() => setViewMode('gallery')} />;
  }

  return (
    <section
      className={`site00-cj-shell${isMobile ? ' site00-cj-shell--mobile' : ' site00-cj-shell--desktop'}`}
      data-visual-authority="VISUAL_DIRECTION_IMPLEMENTED · VISUAL_AUTHORITY_REQUIRED"
    >
      <header className="site00-cj-shell__head">
        <div>
          <p className="site00-cj-shell__kicker">CREATIVE JUDGMENT</p>
          <h2>CONCEPT REVIEW</h2>
          <p className="site00-cj-shell__sub">
            {activePanel?.brandName ?? 'CASE'} · {String(activeIndex + 1).padStart(2, '0')} / {String(concepts.length).padStart(2, '0')}
          </p>
        </div>
        <nav className="site00-cj-shell__nav">
          {(['gallery', 'detail', 'compare'] as ViewMode[]).map((m) => (
            <button key={m} type="button" className={viewMode === m ? 'is-active' : ''} onClick={() => setViewMode(m)}>
              {m}
            </button>
          ))}
          {activePanel ? (
            <button type="button" onClick={() => setViewMode('trailer')}>TRAILER</button>
          ) : null}
          <button
            type="button"
            className="site00-cj-shell__maturity-link"
            onClick={() => {
              setViewMode('maturity');
              void loadMaturity().then(setMaturityPayload);
            }}
          >
            VIEW MATURITY
          </button>
        </nav>
      </header>

      <div className="site00-cj-shell__filters">
        {(['all', 'unreviewed', 'real_brand', 'invented'] as const).map((f) => (
          <button key={f} type="button" className={filter === f ? 'is-active' : ''} onClick={() => setFilter(f)}>
            {f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {viewMode === 'gallery' ? (
        isMobile ? (
          <ConceptGalleryMobile
            concepts={concepts}
            activeIndex={activeIndex}
            onIndexChange={setActiveIndex}
            onJudgment={submitJudgment}
            onOpenDetail={() => setViewMode('detail')}
            note={noteDraft}
            onNoteChange={setNoteDraft}
          />
        ) : (
          <ConceptGalleryDesktop
            concepts={concepts}
            activeIndex={activeIndex}
            compareIds={compareIds}
            onActiveChange={setActiveIndex}
            onToggleCompare={toggleCompare}
            onJudgment={submitJudgment}
            onOpenDetail={() => setViewMode('detail')}
            note={noteDraft}
            onNoteChange={setNoteDraft}
          />
        )
      ) : null}

      {viewMode === 'detail' && activePanel ? (
        <ConceptDetailView
          panel={activePanel}
          isMobile={isMobile}
          onJudgment={(j) => void submitJudgment(activePanel.id, j)}
          note={noteDraft}
          onNoteChange={setNoteDraft}
          onCompare={() => setViewMode('compare')}
          onTrailer={() => setViewMode('trailer')}
        />
      ) : null}

      {viewMode === 'compare' ? (
        <ConceptCompareView
          panels={comparePanels.length >= 2 ? comparePanels : concepts.slice(0, 2)}
          isMobile={isMobile}
          onPickWinner={(id) => void submitJudgment(id, 'APPROVED_FOR_NEXT_STAGE')}
          onKeepBoth={() => setViewMode('gallery')}
        />
      ) : null}

      {viewMode === 'maturity' ? (
        <details open className="site00-cj-shell__maturity">
          <summary>MATURITY · INTERNAL</summary>
          <ExpressionEngineMaturityDashboard payload={maturityPayload} loading={!maturityPayload} />
        </details>
      ) : null}
    </section>
  );
}
