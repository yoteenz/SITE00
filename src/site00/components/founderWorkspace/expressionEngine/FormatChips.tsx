/**
 * B5.0R1 — Format lineage: SOURCE → DERIVED → PACKAGE → DESTINATION.
 */

import type { Entry002ProductionBlueprint } from '../../../../../shared/site00-expression-engine/types.js';
import type { SocialPackageReadiness } from './socialPackageReadiness';

type Props = {
  blueprint: Entry002ProductionBlueprint;
  readiness: SocialPackageReadiness;
};

function statusLabel(status: string): string {
  return status.replace(/_/g, ' ');
}

export function FormatChips({ blueprint, readiness }: Props) {
  const reel = blueprint.formatExpressions.find((f) => f.format === 'REEL');
  const derived = readiness.derivatives.map((d) => {
    const expr = blueprint.formatExpressions.find((f) => f.format === d.format);
    return { ...d, role: expr?.role ?? 'Platform-native derivative' };
  });

  return (
    <div className="site00-ee-formats-lineage">
      <section className="site00-ee-formats-lineage__section">
        <h3 className="site00-ee-formats-lineage__heading">SOURCE</h3>
        <article className="site00-ee-formats-lineage__chip site00-ee-formats-lineage__chip--source">
          <span className="site00-ee-formats__name">FINAL REEL</span>
          <span className="site00-ee-formats__role">{reel?.role ?? 'Cinematic revision sequence'}</span>
          <span className="site00-ee-formats__status">{statusLabel(reel?.status ?? 'PLANNED')}</span>
        </article>
      </section>

      <span className="site00-ee-formats-lineage__connector" aria-hidden>
        →
      </span>

      <section className="site00-ee-formats-lineage__section">
        <h3 className="site00-ee-formats-lineage__heading">DERIVED</h3>
        <div className="site00-ee-formats">
          {derived.map((d) => (
            <article
              key={d.id}
              className={`site00-ee-formats__chip site00-ee-formats__chip--${d.status.toLowerCase().replace(/[^a-z]+/g, '-')}`}
            >
              <span className="site00-ee-formats__name">{d.label}</span>
              <span className="site00-ee-formats__role">{d.role}</span>
              <span className="site00-ee-formats__status">{statusLabel(d.status)}</span>
            </article>
          ))}
        </div>
      </section>

      <span className="site00-ee-formats-lineage__connector" aria-hidden>
        →
      </span>

      <section className="site00-ee-formats-lineage__section">
        <h3 className="site00-ee-formats-lineage__heading">PACKAGE</h3>
        <article className={`site00-ee-formats-lineage__chip site00-ee-formats-lineage__chip--package site00-ee-formats-lineage__chip--${readiness.packageStatus.toLowerCase()}`}>
          <span className="site00-ee-formats__name">SOCIAL PACKAGE</span>
          <span className="site00-ee-formats__role">Complete approved derivative set</span>
          <span className="site00-ee-formats__status">
            {readiness.approvedDerivativeCount}/{readiness.requiredDerivativeCount} · {readiness.packageStatus}
          </span>
        </article>
      </section>

      <span className="site00-ee-formats-lineage__connector" aria-hidden>
        →
      </span>

      <section className="site00-ee-formats-lineage__section">
        <h3 className="site00-ee-formats-lineage__heading">DESTINATION</h3>
        <article
          className={`site00-ee-formats-lineage__chip site00-ee-formats-lineage__chip--destination${readiness.campaignBoardEligible ? ' site00-ee-formats-lineage__chip--ready' : ''}`}
        >
          <span className="site00-ee-formats__name">CAMPAIGN BOARD</span>
          <span className="site00-ee-formats__role">Scheduling / deployment</span>
          <span className="site00-ee-formats__status">{readiness.campaignBoardEligible ? 'READY' : 'LOCKED'}</span>
        </article>
      </section>
    </div>
  );
}
