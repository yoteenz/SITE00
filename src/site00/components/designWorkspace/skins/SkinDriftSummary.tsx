/**
 * Compact visual drift findings — technical JSON hidden behind details.
 */

export type DriftFinding = {
  region: string;
  detail: string;
  severity: 'MAJOR' | 'MINOR';
};

type Props = {
  majorCount: number;
  minorCount: number;
  findings: DriftFinding[];
  iteration: number;
  maxIterations: number;
  onViewDetails?: () => void;
  onRunCorrection?: () => void;
  onAcceptMatch?: () => void;
  matchStatus?: 'DRIFT' | 'HIGH_MATCH' | 'VERIFIED';
};

export function SkinDriftSummary({
  majorCount,
  minorCount,
  findings,
  iteration,
  maxIterations,
  onViewDetails,
  onRunCorrection,
  onAcceptMatch,
  matchStatus = 'DRIFT',
}: Props) {
  const preview = findings.slice(0, 3);

  return (
    <div className="site00-dw-skins-drift">
      <div className="site00-dw-skins-drift__counts">
        <span className="site00-dw-skins-drift__major">{majorCount} MAJOR</span>
        <span className="site00-dw-skins-drift__minor">{minorCount} MINOR</span>
        <span className="site00-dw-skins-drift__iter">
          ITERATION {iteration} / {maxIterations}
        </span>
      </div>

      <ul className="site00-dw-skins-drift__findings">
        {preview.map((f) => (
          <li key={`${f.region}-${f.detail}`} data-severity={f.severity}>
            <strong>{f.region}</strong>
            <span>{f.detail}</span>
          </li>
        ))}
      </ul>

      {onViewDetails ? (
        <button type="button" className="site00-dw-skins-drift__details" onClick={onViewDetails}>
          VIEW DETAILS →
        </button>
      ) : null}

      <div className="site00-dw-skins-drift__actions">
        {matchStatus === 'HIGH_MATCH' && onAcceptMatch ? (
          <>
            <span className="site00-dw-skins-drift__match">HIGH MATCH</span>
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={onAcceptMatch}>
              ACCEPT MATCH
            </button>
          </>
        ) : onRunCorrection ? (
          <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={onRunCorrection}>
            RUN CORRECTION PASS
          </button>
        ) : null}
      </div>
    </div>
  );
}
