/**
 * P0.VR.2B — Visual match score panel (founder-facing).
 */

import type { CSSProperties } from 'react';
import type { VisualMatchResult } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2b/client.js';

type Props = {
  match: VisualMatchResult;
  compact?: boolean;
  onViewDetails?: () => void;
};

const BREAKDOWN_LABELS: Array<[keyof VisualMatchResult['breakdown'], string]> = [
  ['shell', 'Shell'],
  ['layout', 'Layout'],
  ['typography', 'Typography'],
  ['spacing', 'Spacing'],
  ['assets', 'Assets'],
  ['borders', 'Borders'],
];

export function DesignVisualMatchPanel({ match, compact = false, onViewDetails }: Props) {
  return (
    <aside className={`site00-dw-match${compact ? ' site00-dw-match--compact' : ''}`}>
      <h3 className="site00-dw-match__title">VISUAL MATCH</h3>
      <div className="site00-dw-match__score-ring" style={{ '--score': match.overall } as CSSProperties}>
        <span className="site00-dw-match__score-value">{match.overall}%</span>
      </div>
      <p className="site00-dw-match__status">{match.statusLabel}</p>
      <p className="site00-dw-match__summary">{match.summary}</p>

      {!compact ? (
        <>
          <h4 className="site00-dw-match__breakdown-title">BREAKDOWN</h4>
          <ul className="site00-dw-match__breakdown">
            {BREAKDOWN_LABELS.map(([key, label]) => (
              <li key={key}>
                <span>{label}</span>
                <div className="site00-dw-match__bar">
                  <span style={{ width: `${match.breakdown[key]}%` }} />
                </div>
                <span className="site00-dw-match__pct">{match.breakdown[key]}%</span>
              </li>
            ))}
          </ul>
          <h4 className="site00-dw-match__breakdown-title">DELTA HIGHLIGHTS</h4>
          <ul className="site00-dw-match__deltas">
            {match.deltaHighlights.map((d) => (
              <li key={d}>• {d}</li>
            ))}
          </ul>
        </>
      ) : null}

      <button type="button" className="site00-dw-match__details" onClick={onViewDetails}>
        VIEW DETAILS
      </button>
    </aside>
  );
}
