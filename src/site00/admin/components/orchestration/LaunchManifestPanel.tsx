import type { ManifestRequirementDisplay } from '../../types/orchestration';

function reqClass(displayState: string): string {
  const s = displayState.toUpperCase();
  if (s === 'COMPLETE') return 'site00-control-priority__pill--ready';
  if (s === 'BLOCKED') return 'site00-control-priority__pill--blocked';
  if (s === 'DEFERRED' || s === 'OPTIONAL') return 'site00-control-priority__pill--milestone';
  if (s === 'REQUIRES_REVIEW' || s === 'OVERRIDDEN') return 'site00-control-priority__pill--action';
  return 'site00-control-priority__pill--info';
}

type LaunchManifestPanelProps = {
  requirements: ManifestRequirementDisplay[];
  targetName: string | null;
  isProvisional: boolean;
  readinessExplanation: string[];
  readinessScore: number | null;
  completeItems: number;
  requiredItems: number;
  blockingReasons: string[];
};

export function LaunchManifestPanel({
  requirements,
  targetName,
  isProvisional,
  readinessExplanation,
  readinessScore,
  completeItems,
  requiredItems,
  blockingReasons,
}: LaunchManifestPanelProps) {
  return (
    <section className="site00-control-panel" aria-labelledby="manifest-heading">
      <div className="site00-control-panel__head">
        <h2 id="manifest-heading" className="site00-control-panel__title">LAUNCH MANIFEST · {targetName ?? 'NONE'}</h2>
        {isProvisional ? <span className="site00-orchestration-tag">PROVISIONAL</span> : null}
      </div>

      {readinessScore != null ? (
        <div className="site00-orchestration-readiness-block">
          <p className="site00-orchestration-readiness-score">
            LAUNCH READINESS · {readinessScore}%
            {isProvisional ? ' (PROVISIONAL)' : ''}
          </p>
          <p className="site00-orchestration-meta">{completeItems} / {requiredItems} required launch requirements complete</p>
          {blockingReasons.length > 0 ? (
            <div>
              <p className="site00-orchestration-meta">BLOCKED BY:</p>
              <ul>{blockingReasons.slice(0, 3).map((b, i) => <li key={i}>{b}</li>)}</ul>
            </div>
          ) : null}
          <ul className="site00-orchestration-meta">{readinessExplanation.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      ) : null}

      <table className="site00-admin-table site00-control-table site00-orchestration-table">
        <thead>
          <tr><th>REQUIREMENT</th><th>CLASSIFICATION</th><th>EXECUTION</th><th>DISPLAY</th><th>WORKSTREAM</th></tr>
        </thead>
        <tbody>
          {requirements.map((r) => (
            <tr key={r.id}>
              <td>{r.title}</td>
              <td>{r.classification.replace(/_/g, ' ')}</td>
              <td>{r.executionStatus.replace(/_/g, ' ')}</td>
              <td><span className={`site00-control-priority__pill ${reqClass(r.displayState)}`}>{r.displayState}</span></td>
              <td>{r.workstreamTitle ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
