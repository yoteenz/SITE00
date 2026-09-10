/**
 * P0.PCI.3 — One derivative at a time with sibling context + swipe.
 */

import { useRef } from 'react';
import type { PageFamilyNode } from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/types.js';

type Props = {
  active: PageFamilyNode;
  prev: PageFamilyNode | null;
  next: PageFamilyNode | null;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onEnterSubfamily?: () => void;
  liveCaptureUnavailable?: boolean;
};

function PreviewFrame({
  node,
  dimmed,
  liveCaptureUnavailable,
}: {
  node: PageFamilyNode;
  dimmed?: boolean;
  liveCaptureUnavailable?: boolean;
}) {
  return (
    <article className={`site00-pfw-derivative__frame${dimmed ? ' is-dimmed' : ''}`}>
      <div className="site00-pfw-derivative__preview">
        {node.previewUrl ? (
          <img src={node.previewUrl} alt="" />
        ) : node.referenceUrl ? (
          <img src={node.referenceUrl} alt="" />
        ) : (
          <div className="site00-pfw-derivative__empty">
            <span aria-hidden>▢</span>
            <small>
              {liveCaptureUnavailable
                ? 'LIVE CAPTURE UNAVAILABLE'
                : node.captureStatus === 'CAPTURE_PENDING'
                  ? 'LIVE CAPTURE PENDING'
                  : 'NO PREVIEW'}
            </small>
          </div>
        )}
      </div>
      <div className="site00-pfw-derivative__meta">
        <strong>{node.route.toUpperCase()}</strong>
        {node.derivedFromLabel ? <p>Derived from {node.derivedFromLabel}</p> : null}
        <ul className="site00-pfw-derivative__status-list">
          <li className="is-ready">Structure inherited</li>
          <li className={node.captureStatus === 'CURRENT' ? 'is-ready' : 'is-attention'}>
            {node.captureStatus === 'CURRENT'
              ? 'Live capture current'
              : liveCaptureUnavailable
                ? 'Live capture unavailable'
                : 'Live capture pending'}
          </li>
          <li className={node.linkageStatus === 'WIRED' ? 'is-ready' : 'is-neutral'}>
            {node.linkageStatus === 'WIRED' ? 'Wiring confirmed' : 'Wiring pending'}
          </li>
        </ul>
      </div>
    </article>
  );
}

export function DerivativeReviewCarousel({
  active,
  prev,
  next,
  index,
  total,
  onPrev,
  onNext,
  onEnterSubfamily,
  liveCaptureUnavailable,
}: Props) {
  const touchStartX = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (dx > 48) onPrev();
    else if (dx < -48) onNext();
    touchStartX.current = null;
  };

  return (
    <section className="site00-pfw-derivative" aria-label="Derivative review">
      <header className="site00-pfw-derivative__head">
        <h3>DERIVATIVE REVIEW</h3>
        <div className="site00-pfw-derivative__nav">
          <span>
            {index + 1} / {total}
          </span>
          <button type="button" aria-label="Previous derivative" onClick={onPrev} disabled={!prev}>
            ‹
          </button>
          <button type="button" aria-label="Next derivative" onClick={onNext} disabled={!next}>
            ›
          </button>
        </div>
      </header>
      <div className="site00-pfw-derivative__carousel" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {prev ? (
          <PreviewFrame node={prev} dimmed liveCaptureUnavailable={liveCaptureUnavailable} />
        ) : (
          <div className="site00-pfw-derivative__spacer" aria-hidden />
        )}
        <PreviewFrame node={active} liveCaptureUnavailable={liveCaptureUnavailable} />
        {next ? (
          <PreviewFrame node={next} dimmed liveCaptureUnavailable={liveCaptureUnavailable} />
        ) : (
          <div className="site00-pfw-derivative__spacer" aria-hidden />
        )}
      </div>
      {active.childCount > 0 && onEnterSubfamily ? (
        <button type="button" className="site00-pfw-derivative__subfamily" onClick={onEnterSubfamily}>
          VIEW SUBFAMILY · {active.childCount} CHILD SURFACE{active.childCount === 1 ? '' : 'S'}
        </button>
      ) : null}
      <p className="site00-pfw-derivative__tip">Swipe through derivatives one at a time. Confirm structure before generation.</p>
    </section>
  );
}
