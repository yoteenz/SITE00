/**
 * P0.CJ.2V — Structured creative breakdown (header / subtext).
 */

import { summarizeLine } from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/conceptDisplayUtils.js';
import type { ConceptPanel } from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/types.js';

type Props = {
  panel: ConceptPanel;
  variant?: 'gallery' | 'detail';
};

export function ConceptBreakdownRows({ panel, variant = 'gallery' }: Props) {
  const rows =
    variant === 'gallery'
      ? [
          { label: 'TENSION', value: panel.centralTension },
          { label: 'MECHANISM', value: panel.mechanism },
          { label: 'WORLD', value: panel.world },
          { label: 'INTERJECTION', value: panel.interjection },
        ]
      : [
          { label: 'TENSION', value: panel.centralTension },
          { label: 'MECHANISM', value: panel.mechanism },
          { label: 'WORLD', value: panel.world },
          { label: 'ARTIFACT', value: panel.artifact },
          { label: 'REVEAL', value: panel.reveal },
          { label: 'PAYOFF', value: panel.payoff },
          { label: 'INTERJECTION', value: panel.interjection },
        ];

  return (
    <dl className={`site00-cj-breakdown site00-cj-breakdown--${variant}`}>
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{summarizeLine(row.value, variant === 'gallery' ? 72 : 120)}</dd>
        </div>
      ))}
    </dl>
  );
}
