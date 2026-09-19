/**
 * Experience Engine V0 — /enter proof summary for Design Workspace inspect tab.
 */

import { useEffect, useState } from 'react';
import type { ExperienceEngineRouteProof } from '../../../../shared/site00-experience-engine/types.js';

type Props = {
  enabled: boolean;
};

export function ExperienceEngineProofPanel({ enabled }: Props) {
  const [proof, setProof] = useState<ExperienceEngineRouteProof | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoading(true);
    fetch('/api/site00/experience-engine?route=/enter')
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json() as Promise<ExperienceEngineRouteProof>;
      })
      .then((data) => {
        if (!cancelled) setProof(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load Experience Engine proof');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (!enabled) return null;

  const latest = proof?.iterations[proof.iterations.length - 1] ?? null;

  return (
    <aside className="site00-dw-match site00-dw-match--compact site00-ee-proof">
      <h3 className="site00-dw-match__title">EXPERIENCE ENGINE · /enter</h3>
      {loading ? <p className="site00-dw-match__summary">Loading fidelity proof…</p> : null}
      {error ? <p className="site00-dw-match__summary">{error}</p> : null}
      {proof ? (
        <>
          <p className="site00-dw-match__status">
            {latest ? `${(latest.pixelScore * 100).toFixed(1)}% · ${latest.status}` : 'NO ITERATIONS'}
          </p>
          <p className="site00-dw-match__summary">
            Promotion: {proof.promotion.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
          </p>
          {latest?.comparisonMetadata.regionScores.length ? (
            <ul className="site00-dw-match__deltas">
              {latest.comparisonMetadata.regionScores.map((r) => (
                <li key={r.regionId}>
                  {r.label}: {(r.pixelScore * 100).toFixed(1)}% {r.passed ? 'PASS' : 'FAIL'}
                </li>
              ))}
            </ul>
          ) : null}
          <p className="site00-dw-match__summary">
            Mobile:{' '}
            {proof.references.find((r) => r.viewportClass === 'MOBILE')?.status ??
              'BLOCKED_PENDING_REFERENCE_AUTHORITY'}
          </p>
        </>
      ) : null}
    </aside>
  );
}
