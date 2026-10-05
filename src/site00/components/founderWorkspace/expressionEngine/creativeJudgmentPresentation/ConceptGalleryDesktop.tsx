/**
 * P0.CJ.2V — Desktop creative review table (active large + preview boards).
 */

import type { ConceptPanel, PresentationFounderJudgment } from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/types.js';
import { ConceptPanelCard } from './ConceptPanelCard.js';

type Props = {
  concepts: ConceptPanel[];
  activeIndex: number;
  compareIds: string[];
  onActiveChange: (i: number) => void;
  onToggleCompare: (id: string) => void;
  onJudgment: (id: string, j: PresentationFounderJudgment) => void;
  onOpenDetail: () => void;
  note: string;
  onNoteChange: (v: string) => void;
};

export function ConceptGalleryDesktop({
  concepts,
  activeIndex,
  compareIds,
  onActiveChange,
  onToggleCompare,
  onJudgment,
  onOpenDetail,
  note,
  onNoteChange,
}: Props) {
  const active = concepts[activeIndex];
  const previews = concepts.filter((_, i) => i !== activeIndex).slice(0, 3);

  return (
    <div className="site00-cj-gallery-desktop">
      <div className="site00-cj-gallery-desktop__main">
        {active ? (
          <ConceptPanelCard
            panel={active}
            index={activeIndex}
            total={concepts.length}
            variant="gallery"
            onJudgment={(j) => onJudgment(active.id, j)}
            onOpenDetail={onOpenDetail}
            note={note}
            onNoteChange={onNoteChange}
          />
        ) : null}
      </div>
      <aside className="site00-cj-gallery-desktop__rail">
        <span className="site00-cj-gallery-desktop__rail-label">NEXT TERRITORIES</span>
        {previews.map((panel) => {
          const idx = concepts.findIndex((c) => c.id === panel.id);
          return (
            <ConceptPanelCard
              key={panel.id}
              panel={panel}
              variant="thumb"
              selected={compareIds.includes(panel.id)}
              onSelect={() => {
                onActiveChange(idx);
                onToggleCompare(panel.id);
              }}
            />
          );
        })}
      </aside>
    </div>
  );
}
