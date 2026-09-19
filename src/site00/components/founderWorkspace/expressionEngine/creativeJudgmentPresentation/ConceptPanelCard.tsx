/**
 * P0.CJ.2V — Concept board panel (gallery / thumb variants).
 */

import { judgmentStateClass } from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/conceptDisplayUtils.js';
import type { ConceptPanel, PresentationFounderJudgment } from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/types.js';
import { ConceptBreakdownRows } from './ConceptBreakdownRows.js';
import { ConceptEngineRead } from './ConceptEngineRead.js';
import { ConceptFounderJudgmentBar } from './ConceptFounderJudgmentBar.js';
import { ConceptHeroVisual } from './ConceptHeroVisual.js';

type Props = {
  panel: ConceptPanel;
  index?: number;
  total?: number;
  variant?: 'gallery' | 'thumb' | 'detail';
  selected?: boolean;
  onSelect?: () => void;
  onOpenDetail?: () => void;
  onJudgment?: (j: PresentationFounderJudgment) => void;
  note?: string;
  onNoteChange?: (v: string) => void;
  showInternalGrounding?: boolean;
};

export function ConceptPanelCard({
  panel,
  index,
  total,
  variant = 'gallery',
  selected,
  onSelect,
  onOpenDetail,
  onJudgment,
  note,
  onNoteChange,
  showInternalGrounding = true,
}: Props) {
  const stateClass = judgmentStateClass(panel.founderJudgment, panel.status);
  const isThumb = variant === 'thumb';
  const isDetail = variant === 'detail';

  return (
    <article
      className={`site00-cj-board site00-cj-board--${variant} ${stateClass}${selected ? ' is-selected' : ''}${panel.isRealBrandDemo ? ' is-real-brand' : ''}`}
      onClick={isThumb ? onSelect : undefined}
      role={isThumb ? 'button' : undefined}
      tabIndex={isThumb ? 0 : undefined}
    >
      {!isThumb && index != null && total != null ? (
        <div className="site00-cj-board__meta">
          <span className="site00-cj-board__index">{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
          <span className="site00-cj-board__case">{panel.brandName}</span>
        </div>
      ) : null}

      <ConceptHeroVisual panel={panel} size={isThumb ? 'thumb' : isDetail ? 'detail' : 'gallery'} />

      <div className="site00-cj-board__body">
        {isThumb ? (
          <>
            <h4>{panel.conceptTitle}</h4>
            <p>{panel.brandName}</p>
          </>
        ) : (
          <>
            <h3>{panel.conceptTitle}</h3>
            <p className="site00-cj-board__premise">{panel.oneLinePremise}</p>
          </>
        )}

        {showInternalGrounding && !isThumb ? (
          <span className={`site00-cj-board__grounding is-${panel.groundingMode.replace(/_/g, '-')}`}>
            {panel.groundingLabel}
          </span>
        ) : null}

        {!isThumb ? <ConceptBreakdownRows panel={panel} variant={isDetail ? 'detail' : 'gallery'} /> : null}

        {!isThumb ? <ConceptEngineRead panel={panel} /> : null}

        {panel.founderJudgment && !isThumb ? (
          <p className="site00-cj-board__founder-chip">{String(panel.founderJudgment).replace(/_/g, ' ')}</p>
        ) : null}

        {isDetail ? (
          <details className="site00-cj-board__details-group">
            <summary>WHY THIS WORKS</summary>
            <p>{panel.diagnostics.selectionRationale}</p>
          </details>
        ) : null}

        {isDetail ? (
          <>
            <details className="site00-cj-board__details-group">
              <summary>CHANNEL PLAN</summary>
              <ul className="site00-cj-board__channels">
                {panel.primaryChannels.map((ch) => (
                  <li key={ch}>{ch.replace(/-/g, ' ').toUpperCase()}</li>
                ))}
              </ul>
            </details>
            <details className="site00-cj-board__details-group">
              <summary>ENGINE CRITIQUE</summary>
              <p>{panel.diagnostics.brandFidelityAnalysis}</p>
            </details>
            <details className="site00-cj-board__details-group">
              <summary>FULL REASONING</summary>
              <p className="site00-cj-board__reasoning-muted">{panel.diagnostics.fullReasoning}</p>
            </details>
          </>
        ) : null}

        {!isThumb && onJudgment ? (
          <ConceptFounderJudgmentBar
            active={panel.founderJudgment}
            onJudgment={onJudgment}
            compact={variant === 'gallery'}
            note={note}
            onNoteChange={onNoteChange}
          />
        ) : null}

        {onOpenDetail && variant === 'gallery' ? (
          <button type="button" className="site00-cj-board__open-detail" onClick={onOpenDetail}>
            OPEN DETAIL
          </button>
        ) : null}
      </div>
    </article>
  );
}
