/**
 * P0.CJ.2V — Primary founder judgment controls.
 */

import type { PresentationFounderJudgment } from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/types.js';

type Props = {
  active: PresentationFounderJudgment | string | null;
  onJudgment: (j: PresentationFounderJudgment) => void;
  compact?: boolean;
  note?: string;
  onNoteChange?: (v: string) => void;
};

const PRIMARY: PresentationFounderJudgment[] = ['LOVE_IT', 'PROMISING', 'REVISE'];

export function ConceptFounderJudgmentBar({ active, onJudgment, compact, note, onNoteChange }: Props) {
  return (
    <div className={`site00-cj-judgment${compact ? ' site00-cj-judgment--compact' : ''}`}>
      <span className="site00-cj-judgment__label">YOUR READ</span>
      <div className="site00-cj-judgment__btns">
        {PRIMARY.map((j) => (
          <button
            key={j}
            type="button"
            className={active === j ? 'is-active' : ''}
            onClick={() => onJudgment(j)}
          >
            {j.replace(/_/g, ' ')}
          </button>
        ))}
        <button
          type="button"
          className={active === 'TOO_CLOSE' || active === 'NOT_NDXBOOK' ? 'is-active is-kill' : 'is-kill'}
          onClick={() => onJudgment('REVISE')}
        >
          KILL
        </button>
      </div>
      {!compact && onNoteChange ? (
        <input
          type="text"
          className="site00-cj-judgment__note"
          placeholder="ADD NOTE — WHY I FEEL THIS"
          value={note ?? ''}
          onChange={(e) => onNoteChange(e.target.value)}
        />
      ) : null}
    </div>
  );
}
