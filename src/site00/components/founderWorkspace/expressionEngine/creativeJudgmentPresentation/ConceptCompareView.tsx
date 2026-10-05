/**
 * P0.CJ.2V — Compare mode (mobile toggle / desktop side-by-side).
 */

import { useState } from 'react';
import { formatEngineRead, summarizeLine } from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/conceptDisplayUtils.js';
import type { ConceptPanel } from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/types.js';
import { ConceptHeroVisual } from './ConceptHeroVisual.js';

type Props = {
  panels: ConceptPanel[];
  isMobile: boolean;
  onPickWinner?: (id: string) => void;
  onKeepBoth?: () => void;
};

const ROWS = [
  'oneLinePremise',
  'centralTension',
  'mechanism',
  'world',
  'heroMove',
  'interjection',
  'brandFidelityStatus',
] as const;

const ROW_LABELS: Record<(typeof ROWS)[number], string> = {
  oneLinePremise: 'PREMISE',
  centralTension: 'TENSION',
  mechanism: 'MECHANISM',
  world: 'WORLD',
  heroMove: 'HERO MOVE',
  interjection: 'INTERJECTION',
  brandFidelityStatus: 'BRAND FIDELITY',
};

export function ConceptCompareView({ panels, isMobile, onPickWinner, onKeepBoth }: Props) {
  const [mobileSide, setMobileSide] = useState(0);

  if (panels.length < 2) {
    return <p className="site00-cj-compare__empty">SELECT TWO CONCEPTS TO COMPARE.</p>;
  }

  const a = panels[0]!;
  const b = panels[1]!;

  if (isMobile) {
    const active = mobileSide === 0 ? a : b;
    return (
      <div className="site00-cj-compare site00-cj-compare--mobile">
        <div className="site00-cj-compare__toggle">
          <button type="button" className={mobileSide === 0 ? 'is-active' : ''} onClick={() => setMobileSide(0)}>
            CONCEPT A
          </button>
          <button type="button" className={mobileSide === 1 ? 'is-active' : ''} onClick={() => setMobileSide(1)}>
            CONCEPT B
          </button>
        </div>
        <ConceptHeroVisual panel={active} size="gallery" />
        <h3>{active.conceptTitle}</h3>
        <dl className="site00-cj-compare__rows">
          {ROWS.map((key) => (
            <div key={key}>
              <dt>{ROW_LABELS[key]}</dt>
              <dd>{summarizeLine(String(active[key]), 96)}</dd>
            </div>
          ))}
          <div>
            <dt>ENGINE READ</dt>
            <dd>{formatEngineRead(active.decision, active.score)}</dd>
          </div>
        </dl>
        <footer className="site00-cj-compare__footer">
          <button type="button" onClick={() => onPickWinner?.(a.id)}>CHOOSE A</button>
          <button type="button" onClick={() => onPickWinner?.(b.id)}>CHOOSE B</button>
          <button type="button" onClick={onKeepBoth}>KEEP BOTH</button>
        </footer>
      </div>
    );
  }

  return (
    <div className="site00-cj-compare site00-cj-compare--desktop">
      <div className="site00-cj-compare__labels">
        {ROWS.map((key) => (
          <span key={key}>{ROW_LABELS[key]}</span>
        ))}
        <span>ENGINE READ</span>
      </div>
      <div className="site00-cj-compare__cols">
        {[a, b].map((panel) => (
          <article key={panel.id} className="site00-cj-compare__col">
            <ConceptHeroVisual panel={panel} size="thumb" />
            <h4>{panel.conceptTitle}</h4>
            <span className="site00-cj-compare__brand">{panel.brandName}</span>
            <dl>
              {ROWS.map((key) => (
                <div key={key}>
                  <dd>{summarizeLine(String(panel[key]), 88)}</dd>
                </div>
              ))}
              <div>
                <dd>{formatEngineRead(panel.decision, panel.score)}</dd>
              </div>
            </dl>
            <button type="button" onClick={() => onPickWinner?.(panel.id)}>CHOOSE</button>
          </article>
        ))}
      </div>
      <footer className="site00-cj-compare__footer">
        <button type="button" onClick={onKeepBoth}>KEEP BOTH</button>
        <button type="button" onClick={() => onPickWinner?.(a.id)}>SEND BOTH BACK</button>
      </footer>
    </div>
  );
}
