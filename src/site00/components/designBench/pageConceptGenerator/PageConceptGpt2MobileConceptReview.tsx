/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-FOUNDER-REVIEW-UX-REFINEMENT1 — large mobile concept review cards.
 */

import { useState } from 'react';

import type { NbpSlotPresentation } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorBinding.js';
import { AiConsoleIcon } from '../aiConsoles/AiConsoleIcon';
import { PageConceptConceptInspectDrawer } from './PageConceptConceptInspectDrawer';

export function PageConceptGpt2MobileConceptReview({
  slots,
  onInspectFullscreen,
  onSelect,
  selectedLabel,
}: {
  slots: readonly NbpSlotPresentation[];
  onInspectFullscreen?: (src: string, title: string) => void;
  onSelect?: (slot: NbpSlotPresentation) => void;
  selectedLabel?: 'A' | 'B' | 'C' | null;
}) {
  const [inspectSlot, setInspectSlot] = useState<NbpSlotPresentation | null>(null);

  return (
    <div className="s00-pcg__mobileReview" data-testid="page-concept-gpt2-mobile-review">
      {slots.map((slot) => {
        const meta = slot.gpt2Mobile;
        const title = `MOBILE CONCEPT ${slot.label}`;
        const territory = meta?.territoryLabel ?? 'TERRITORY PENDING';
        const validity =
          meta?.pageValidityPass === true ? 'PASS'
          : meta?.pageValidityPass === false ? 'FAIL'
          : 'PENDING';
        return (
          <article
            key={slot.key}
            className="s00-pcg__mobileReviewCard"
            data-testid={`page-concept-mobile-review-${slot.label.toLowerCase()}`}
            data-selected={selectedLabel === slot.label ? 'true' : undefined}
          >
            <header className="s00-pcg__mobileReviewHead">
              <span className="s00-pcg__mobileReviewTitle">{title}</span>
              <span className="s00-pcg__mobileReviewTerritory">{territory}</span>
            </header>
            <div className="s00-pcg__mobileReviewThumb">
              {slot.status === 'READY' && slot.imageSrc ?
                <img src={slot.imageSrc} alt={`${title} preview`} draggable={false} />
              : slot.status === 'FAILED' ?
                <span className="s00-pcg__frameEmpty s00-pcg__frameEmpty--failed">
                  <AiConsoleIcon name="status-error" size={16} />
                  <span>FAILED</span>
                </span>
              : slot.status === 'GENERATING' ?
                <span className="s00-pcg__frameEmpty">
                  <AiConsoleIcon name="status-generating" size={16} />
                  <span>GENERATING</span>
                </span>
              : <span className="s00-pcg__frameEmpty">
                  <AiConsoleIcon name="empty-concept" size={16} />
                  <span>PENDING</span>
                </span>
              }
            </div>
            <p className="s00-pcg__mobileReviewRationale">
              {meta?.rationale ? meta.rationale : 'RATIONALE WILL APPEAR WHEN GPT2 COMPLETES.'}
            </p>
            <dl className="s00-pcg__mobileReviewMeta">
              <div>
                <dt>PAGE VALIDITY</dt>
                <dd data-validity={validity}>{validity}</dd>
              </div>
              <div>
                <dt>CAPTURE INFLUENCE</dt>
                <dd>{meta?.captureInfluenceMode?.replace(/_/g, ' ') ?? '—'}</dd>
              </div>
            </dl>
            <div className="s00-pcg__mobileReviewActions">
              <button type="button" className="s00-pcg__secAction" onClick={() => setInspectSlot(slot)}>
                INSPECT
              </button>
              {slot.imageSrc ?
                <button
                  type="button"
                  className="s00-pcg__secAction"
                  onClick={() => onInspectFullscreen?.(slot.imageSrc!, title)}
                >
                  FULLSCREEN
                </button>
              : null}
              {onSelect ?
                <button
                  type="button"
                  className="s00-pcg__secAction s00-pcg__secAction--primary"
                  data-testid={`page-concept-select-mobile-${slot.label.toLowerCase()}`}
                  disabled={slot.status !== 'READY'}
                  onClick={() => onSelect(slot)}
                >
                  SELECT
                </button>
              : null}
            </div>
          </article>
        );
      })}
      {inspectSlot ?
        <PageConceptConceptInspectDrawer slot={inspectSlot} onClose={() => setInspectSlot(null)} />
      : null}
    </div>
  );
}
