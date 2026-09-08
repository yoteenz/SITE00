/**
 * B5.0 — Format expression chips.
 */

import type { Entry002ProductionBlueprint } from '../../../../../shared/site00-expression-engine/types.js';

type Props = {
  blueprint: Entry002ProductionBlueprint;
};

export function FormatChips({ blueprint }: Props) {
  return (
    <div className="site00-ee-formats">
      {blueprint.formatExpressions.map((f) => (
        <article
          key={f.format}
          className={`site00-ee-formats__chip site00-ee-formats__chip--${f.status.toLowerCase().replace(/[^a-z]+/g, '-')}`}
        >
          <span className="site00-ee-formats__name">{f.format}</span>
          <span className="site00-ee-formats__role">{f.role}</span>
          <span className="site00-ee-formats__status">{f.status.replace(/_/g, ' ')}</span>
        </article>
      ))}
    </div>
  );
}
