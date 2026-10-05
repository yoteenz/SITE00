/**
 * P0.CJ.2V — Concept detail (mobile stack / desktop split).
 */

import { channelRoleLabel } from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/conceptDisplayUtils.js';
import type { ConceptPanel, PresentationFounderJudgment } from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/types.js';
import { ConceptBreakdownRows } from './ConceptBreakdownRows.js';
import { ConceptFounderJudgmentBar } from './ConceptFounderJudgmentBar.js';
import { ConceptHeroVisual } from './ConceptHeroVisual.js';

type Props = {
  panel: ConceptPanel;
  isMobile: boolean;
  onJudgment: (j: PresentationFounderJudgment) => void;
  note: string;
  onNoteChange: (v: string) => void;
  onCompare: () => void;
  onTrailer: () => void;
};

export function ConceptDetailView({
  panel,
  isMobile,
  onJudgment,
  note,
  onNoteChange,
  onCompare,
  onTrailer,
}: Props) {
  const channels = panel.primaryChannels.map((part) => {
    const [ch, ...rest] = part.split('-');
    return { channel: channelRoleLabel(ch ?? part), role: rest.join(' ').toUpperCase() || 'EXPRESSION' };
  });

  return (
    <div className={`site00-cj-detail${isMobile ? ' site00-cj-detail--mobile' : ' site00-cj-detail--desktop'}`}>
      <div className="site00-cj-detail__hero-col">
        <ConceptHeroVisual panel={panel} size="detail" />
        {!isMobile ? (
          <div className="site00-cj-detail__channel-strip">
            {channels.map((c) => (
              <div key={c.channel} className="site00-cj-detail__channel-chip">
                <span>{c.channel}</span>
                <small>{c.role}</small>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="site00-cj-detail__copy-col">
        <span className="site00-cj-detail__brand">{panel.brandName}</span>
        <h2>{panel.conceptTitle}</h2>
        <p className="site00-cj-detail__premise">{panel.oneLinePremise}</p>

        <ConceptBreakdownRows panel={panel} variant="detail" />

        {isMobile ? (
          <div className="site00-cj-detail__channel-strip">
            {channels.map((c) => (
              <div key={c.channel} className="site00-cj-detail__channel-chip">
                <span>{c.channel}</span>
                <small>{c.role}</small>
              </div>
            ))}
          </div>
        ) : null}

        <ConceptFounderJudgmentBar
          active={panel.founderJudgment}
          onJudgment={onJudgment}
          note={note}
          onNoteChange={onNoteChange}
        />

        <div className="site00-cj-detail__actions">
          <button type="button" onClick={onCompare}>COMPARE</button>
          <button type="button" onClick={onTrailer}>TRAILER</button>
        </div>

        <details className="site00-cj-detail__accordion">
          <summary>WHY THIS WORKS</summary>
          <p>{panel.diagnostics.selectionRationale}</p>
        </details>
        <details className="site00-cj-detail__accordion">
          <summary>BRAND FIDELITY</summary>
          <p>{panel.diagnostics.brandFidelityAnalysis}</p>
        </details>
        <details className="site00-cj-detail__accordion">
          <summary>FULL REASONING</summary>
          <p className="site00-cj-detail__reasoning-muted">{panel.diagnostics.fullReasoning}</p>
        </details>
      </div>
    </div>
  );
}
