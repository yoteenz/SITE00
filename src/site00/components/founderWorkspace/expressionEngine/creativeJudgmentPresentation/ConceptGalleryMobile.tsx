/**
 * P0.CJ.2V — Mobile snap carousel with next-panel peek.
 */

import type { ConceptPanel, PresentationFounderJudgment } from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/types.js';
import { ConceptPanelCard } from './ConceptPanelCard.js';

type Props = {
  concepts: ConceptPanel[];
  activeIndex: number;
  onIndexChange: (i: number) => void;
  onJudgment: (id: string, j: PresentationFounderJudgment) => void;
  onOpenDetail: () => void;
  note: string;
  onNoteChange: (v: string) => void;
};

export function ConceptGalleryMobile({
  concepts,
  activeIndex,
  onIndexChange,
  onJudgment,
  onOpenDetail,
  note,
  onNoteChange,
}: Props) {
  const active = concepts[activeIndex];

  return (
    <div className="site00-cj-gallery-mobile">
      <div className="site00-cj-gallery-mobile__track">
        {concepts.map((panel, i) => (
          <div
            key={panel.id}
            className={`site00-cj-gallery-mobile__slide${i === activeIndex ? ' is-active' : ''}`}
            aria-hidden={i !== activeIndex}
          >
            <ConceptPanelCard
              panel={panel}
              index={i}
              total={concepts.length}
              variant="gallery"
              onJudgment={(j) => onJudgment(panel.id, j)}
              onOpenDetail={onOpenDetail}
              note={note}
              onNoteChange={onNoteChange}
            />
          </div>
        ))}
      </div>

      <div className="site00-cj-gallery-mobile__nav">
        <button type="button" disabled={activeIndex <= 0} onClick={() => onIndexChange(activeIndex - 1)}>
          PREV
        </button>
        <span>{String(activeIndex + 1).padStart(2, '0')} / {String(concepts.length).padStart(2, '0')}</span>
        <button
          type="button"
          disabled={activeIndex >= concepts.length - 1}
          onClick={() => onIndexChange(activeIndex + 1)}
        >
          NEXT
        </button>
      </div>

      <div className="site00-cj-gallery-mobile__dots">
        {concepts.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className={i === activeIndex ? 'is-active' : ''}
            aria-label={`Concept ${i + 1}`}
            onClick={() => onIndexChange(i)}
          />
        ))}
      </div>

      {active ? (
        <p className="site00-cj-gallery-mobile__peek-hint">
          SWIPE · {active.conceptTitle}
        </p>
      ) : null}
    </div>
  );
}
