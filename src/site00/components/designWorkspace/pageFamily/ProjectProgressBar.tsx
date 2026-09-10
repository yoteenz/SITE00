/**
 * P0.PCI.3 — Compact project progress summary (real data only).
 */

import type { ProjectProgressSummary } from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/types.js';

type Props = {
  summary: ProjectProgressSummary;
};

export function ProjectProgressBar({ summary }: Props) {
  return (
    <section className="site00-pfw-progress" aria-label="Project progress">
      <h3 className="site00-pfw-progress__title">PROJECT PROGRESS</h3>
      <div className="site00-pfw-progress__grid">
        {summary.chips.map((chip) => (
          <div key={chip.label} className={`site00-pfw-progress__chip is-${chip.tone}`}>
            <strong>{chip.value ?? '—'}</strong>
            <span>{chip.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
