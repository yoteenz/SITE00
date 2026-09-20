/**
 * Interactive NBP stage: separate Mobile / Desktop A–C selection, hero preview, paging.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react';

import type { NbpSlotPresentation } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorBinding.js';
import { AiConsoleIcon } from '../aiConsoles/AiConsoleIcon';
import { NbpPreviewHero, NbpSlotCell } from './PageConceptGeneratorResults';

const LETTERS = ['A', 'B', 'C'] as const;

function slotsForViewport(slots: readonly NbpSlotPresentation[], viewport: 'MOBILE' | 'DESKTOP') {
  return slots.filter((s) => s.viewport === viewport);
}

export function PageConceptGeneratorNbpStage({
  slots,
  projectId,
  pageId,
  onInspect,
}: {
  slots: readonly NbpSlotPresentation[];
  projectId: string;
  pageId: string;
  onInspect?: (src: string, title: string) => void;
}) {
  const storageKey = `site00:pcg:carousel:${projectId}:${pageId}`;
  const [mobileIndex, setMobileIndex] = useState(0);
  const [desktopIndex, setDesktopIndex] = useState(0);
  const touchStart = useRef<{ x: number; viewport: 'MOBILE' | 'DESKTOP' } | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { mobile?: number; desktop?: number };
      if (typeof parsed.mobile === 'number') setMobileIndex(parsed.mobile);
      if (typeof parsed.desktop === 'number') setDesktopIndex(parsed.desktop);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ mobile: mobileIndex, desktop: desktopIndex }));
    } catch {
      /* ignore */
    }
  }, [desktopIndex, mobileIndex, storageKey]);

  const mobileSlots = useMemo(() => slotsForViewport(slots, 'MOBILE'), [slots]);
  const desktopSlots = useMemo(() => slotsForViewport(slots, 'DESKTOP'), [slots]);

  const mobileHero = mobileSlots[mobileIndex] ?? null;
  const desktopHero = desktopSlots[desktopIndex] ?? null;

  const bump = useCallback((viewport: 'MOBILE' | 'DESKTOP', delta: number) => {
    if (viewport === 'MOBILE') setMobileIndex((i) => (i + delta + 3) % 3);
    else setDesktopIndex((i) => (i + delta + 3) % 3);
  }, []);

  const onTouchStart = (viewport: 'MOBILE' | 'DESKTOP') => (e: TouchEvent) => {
    const t = e.changedTouches[0];
    if (!t) return;
    touchStart.current = { x: t.clientX, viewport };
  };

  const onTouchEnd = (viewport: 'MOBILE' | 'DESKTOP') => (e: TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || start.viewport !== viewport) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - start.x;
    if (Math.abs(dx) < 36) return;
    bump(viewport, dx < 0 ? 1 : -1);
  };

  const openInspect = (src: string, slot: NbpSlotPresentation) => {
    onInspect?.(src, `${slot.viewport} · RENDITION ${slot.label}`);
  };

  return (
    <div className="s00-pcg__groups" data-result-slot="nbp.renditions">
      <section className="s00-pcg__group" aria-label="MOBILE (3)">
        <header className="s00-pcg__groupHead">
          <span className="s00-pcg__groupGlyph" aria-hidden="true">
            <AiConsoleIcon name="auth-mobile" size={11} />
          </span>
          MOBILE (3)
        </header>
        <div
          className="s00-pcg__nbpSwipe"
          onTouchStart={onTouchStart('MOBILE')}
          onTouchEnd={onTouchEnd('MOBILE')}
        >
          <NbpPreviewHero
            slot={mobileHero}
            onInspect={(src) => mobileHero && openInspect(src, mobileHero)}
          />
        </div>
        <div className="s00-pcg__groupRail">
          {mobileSlots.map((slot, index) => (
            <NbpSlotCell
              key={slot.key}
              slot={slot}
              selected={index === mobileIndex}
              onSelect={() => setMobileIndex(index)}
              onInspect={(src) => openInspect(src, slot)}
            />
          ))}
        </div>
        <div className="s00-pcg__paging" aria-label="Mobile rendition paging">
          <button type="button" className="s00-pcg__pageArrow" data-dir="prev" onClick={() => bump('MOBILE', -1)}>
            <AiConsoleIcon name="preview-prev" size={10} />
          </button>
          <span className="s00-pcg__dots">
            {LETTERS.map((letter, index) => (
              <button
                type="button"
                key={letter}
                className="s00-pcg__dot"
                data-active={index === mobileIndex ? 'true' : undefined}
                aria-label={`Mobile rendition ${letter}`}
                onClick={() => setMobileIndex(index)}
              />
            ))}
          </span>
          <button type="button" className="s00-pcg__pageArrow" data-dir="next" onClick={() => bump('MOBILE', 1)}>
            <AiConsoleIcon name="preview-next" size={10} />
          </button>
        </div>
      </section>

      <section className="s00-pcg__group" aria-label="DESKTOP (3)">
        <header className="s00-pcg__groupHead">
          <span className="s00-pcg__groupGlyph" aria-hidden="true">
            <AiConsoleIcon name="auth-desktop" size={11} />
          </span>
          DESKTOP (3)
        </header>
        <div
          className="s00-pcg__nbpSwipe"
          onTouchStart={onTouchStart('DESKTOP')}
          onTouchEnd={onTouchEnd('DESKTOP')}
        >
          <NbpPreviewHero
            slot={desktopHero}
            onInspect={(src) => desktopHero && openInspect(src, desktopHero)}
          />
        </div>
        <div className="s00-pcg__groupRail">
          {desktopSlots.map((slot, index) => (
            <NbpSlotCell
              key={slot.key}
              slot={slot}
              selected={index === desktopIndex}
              onSelect={() => setDesktopIndex(index)}
              onInspect={(src) => openInspect(src, slot)}
            />
          ))}
        </div>
        <div className="s00-pcg__paging" aria-label="Desktop rendition paging">
          <button type="button" className="s00-pcg__pageArrow" data-dir="prev" onClick={() => bump('DESKTOP', -1)}>
            <AiConsoleIcon name="preview-prev" size={10} />
          </button>
          <span className="s00-pcg__dots">
            {LETTERS.map((letter, index) => (
              <button
                type="button"
                key={letter}
                className="s00-pcg__dot"
                data-active={index === desktopIndex ? 'true' : undefined}
                aria-label={`Desktop rendition ${letter}`}
                onClick={() => setDesktopIndex(index)}
              />
            ))}
          </span>
          <button type="button" className="s00-pcg__pageArrow" data-dir="next" onClick={() => bump('DESKTOP', 1)}>
            <AiConsoleIcon name="preview-next" size={10} />
          </button>
        </div>
      </section>
    </div>
  );
}
