/**
 * GPT2 mobile concept review cards — bounded contained previews only.
 */

import { useState } from 'react';

import type { NbpSlotPresentation } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorBinding.js';
import { PageConceptConceptInspectDrawer } from './PageConceptConceptInspectDrawer';
import { PageConceptContainedPreviewFrame } from './PageConceptContainedPreviewFrame';

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
        const isSelected = selectedLabel === slot.label;
        const frameStatus =
          slot.status === 'READY' ? 'READY'
          : slot.status === 'FAILED' ? 'FAILED'
          : slot.status === 'GENERATING' ? 'GENERATING'
          : 'PENDING';

        return (
          <article
            key={slot.key}
            className="s00-pcg__mobileReviewCard"
            data-testid={`page-concept-mobile-review-${slot.label.toLowerCase()}`}
            data-selected={isSelected ? 'true' : undefined}
          >
            <header className="s00-pcg__mobileReviewHead">
              <span className="s00-pcg__mobileReviewTitle">{title}</span>
              {isSelected ?
                <span className="s00-pcg__mobileReviewSelectedBadge" data-testid="page-concept-mobile-selected-badge">
                  SELECTED
                </span>
              : null}
              <span className="s00-pcg__mobileReviewTerritory">{territory}</span>
            </header>
            <PageConceptContainedPreviewFrame
              size="mobile"
              viewportLabel={title}
              status={frameStatus}
              imageSrc={slot.imageSrc}
              failureReason={slot.failureReason}
              testId={`page-concept-contained-preview-${slot.label.toLowerCase()}`}
            />
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
                  data-testid={`page-concept-fullscreen-${slot.label.toLowerCase()}`}
                  onClick={() => onInspectFullscreen?.(slot.imageSrc!, title)}
                >
                  FULLSCREEN
                </button>
              : null}
              {onSelect && !isSelected ?
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
