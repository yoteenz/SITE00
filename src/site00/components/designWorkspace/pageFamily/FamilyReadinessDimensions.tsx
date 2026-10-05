/**
 * P0.PCI.3R1 — Compact structure / design / wiring / capture readiness row.
 */

import type { PageFamilyReadiness } from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/types.js';

type Props = {
  readiness: PageFamilyReadiness;
};

function tone(status: string): string {
  if (status === 'READY') return 'ready';
  if (status === 'UNAVAILABLE' || status === 'ISSUES') return 'attention';
  return 'neutral';
}

export function FamilyReadinessDimensions({ readiness }: Props) {
  const rows = [
    { label: 'STRUCTURE', value: readiness.dimensions.structure },
    { label: 'DESIGN', value: readiness.dimensions.design },
    { label: 'WIRING', value: readiness.dimensions.wiring },
    { label: 'CAPTURE', value: readiness.dimensions.capture },
  ];

  return (
    <ul className="site00-pfw-readiness-dims" aria-label="Family readiness dimensions">
      {rows.map((row) => (
        <li key={row.label} className={`is-${tone(row.value)}`}>
          <span>{row.label}</span>
          <strong>{row.value}</strong>
        </li>
      ))}
    </ul>
  );
}
