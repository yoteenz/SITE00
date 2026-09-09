/**
 * P0.CJ.2 — Single concept review panel (visual-first summary).
 */

import type { ConceptPanel, PresentationFounderJudgment } from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/types.js';

type Props = {
  panel: ConceptPanel;
  compact?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onOpenDetail?: () => void;
  onJudgment?: (j: PresentationFounderJudgment) => void;
  showActions?: boolean;
};

const JUDGMENTS: PresentationFounderJudgment[] = [
  'LOVE_IT',
  'PROMISING',
  'TOO_CLOSE',
  'NOT_NDXBOOK',
  'REVISE',
  'HOLD',
  'APPROVED_FOR_NEXT_STAGE',
];

export function ConceptPanelCard({
  panel,
  compact,
  selected,
  onSelect,
  onOpenDetail,
  onJudgment,
  showActions = true,
}: Props) {
  const hero = panel.assets.find((a) => a.assetId === panel.heroVisualAssetId);

  return (
    <article
      className={`site00-cj-panel${compact ? ' site00-cj-panel--compact' : ''}${selected ? ' is-selected' : ''}${panel.isRealBrandDemo ? ' is-real-brand-demo' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpenDetail?.();
      }}
    >
      <div className="site00-cj-panel__hero" aria-hidden="true">
        <span className="site00-cj-panel__hero-symbol">{hero?.symbolicTreatment ?? '◌'}</span>
        {panel.isRealBrandDemo ? <span className="site00-cj-panel__demo-badge">REAL BRAND DEMO</span> : null}
      </div>

      <header className="site00-cj-panel__head">
        <span className={`site00-cj-panel__grounding is-${panel.groundingMode.replace(/_/g, '-')}`}>
          {panel.groundingLabel}
        </span>
        <h3>{panel.conceptTitle}</h3>
        <p className="site00-cj-panel__brand">{panel.brandName}</p>
        <p className="site00-cj-panel__premise">{panel.oneLinePremise}</p>
      </header>

      <dl className="site00-cj-panel__strip">
        <div><dt>TENSION</dt><dd>{panel.centralTension}</dd></div>
        <div><dt>MECHANISM</dt><dd>{panel.mechanism}</dd></div>
        <div><dt>WORLD</dt><dd>{panel.world}</dd></div>
        <div><dt>HERO MOVE</dt><dd>{panel.heroMove}</dd></div>
        <div><dt>INTERJECTION</dt><dd>{panel.interjection}</dd></div>
        <div><dt>DECISION</dt><dd>{panel.decision}</dd></div>
        <div><dt>SCORE</dt><dd>{panel.score}</dd></div>
        <div><dt>STATUS</dt><dd>{panel.status.replace(/_/g, ' ')}</dd></div>
        {panel.ndxLeakStatus !== 'CLEAR' ? (
          <div><dt>LEAK</dt><dd className="is-warn">{panel.ndxLeakStatus}</dd></div>
        ) : null}
      </dl>

      {panel.founderJudgment ? (
        <p className="site00-cj-panel__judgment-chip">{String(panel.founderJudgment).replace(/_/g, ' ')}</p>
      ) : null}

      {!compact ? (
        <details className="site00-cj-panel__depth">
          <summary>DEEPER REASONING</summary>
          <div className="site00-cj-panel__depth-body">
            <p><strong>Selection:</strong> {panel.diagnostics.selectionRationale}</p>
            <p><strong>Brand fidelity:</strong> {panel.diagnostics.brandFidelityAnalysis}</p>
            <p><strong>Leak:</strong> {panel.diagnostics.leakAnalysis}</p>
            {panel.diagnostics.risks.length ? (
              <p><strong>Risks:</strong> {panel.diagnostics.risks.join(' · ')}</p>
            ) : null}
            <p className="site00-cj-panel__full-reasoning">{panel.diagnostics.fullReasoning}</p>
          </div>
        </details>
      ) : null}

      {showActions && onJudgment ? (
        <footer className="site00-cj-panel__actions">
          {JUDGMENTS.map((j) => (
            <button
              key={j}
              type="button"
              className={panel.founderJudgment === j ? 'is-active' : ''}
              onClick={(e) => {
                e.stopPropagation();
                onJudgment(j);
              }}
            >
              {j.replace(/_/g, ' ')}
            </button>
          ))}
          {onOpenDetail ? (
            <button type="button" className="site00-cj-panel__open" onClick={(e) => { e.stopPropagation(); onOpenDetail(); }}>
              OPEN
            </button>
          ) : null}
        </footer>
      ) : null}
    </article>
  );
}
