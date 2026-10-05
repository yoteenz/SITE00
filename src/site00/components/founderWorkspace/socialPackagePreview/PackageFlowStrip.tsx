/**
 * B5.8 — Compact package flow strip.
 */

import type { SocialPackageFlowStep } from './types.js';

type Props = {
  steps: SocialPackageFlowStep[];
  compact?: boolean;
};

export function PackageFlowStrip({ steps, compact }: Props) {
  return (
    <div className={`site00-spp-flow${compact ? ' site00-spp-flow--compact' : ''}`} aria-label="Package flow">
      {steps.map((step, i) => (
        <span key={step.formatFamily} className={`site00-spp-flow__step${step.status === 'COMPLETE' ? ' is-complete' : ''}`}>
          {i > 0 && <span className="site00-spp-flow__arrow" aria-hidden>→</span>}
          <span>{step.label}</span>
        </span>
      ))}
    </div>
  );
}
