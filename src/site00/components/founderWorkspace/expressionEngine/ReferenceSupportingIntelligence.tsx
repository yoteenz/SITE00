/**
 * Reference-fidelity — collapsible supporting intelligence sections.
 */

import type { ReactNode } from 'react';

type Section = { id: string; label: string; content: ReactNode };

type Props = {
  sections: Section[];
};

export function ReferenceSupportingIntelligence({ sections }: Props) {
  return (
    <section className="site00-ee-ref-support">
      {sections.map((s) => (
        <details key={s.id} className="site00-ee-ref-support__block">
          <summary>{s.label}</summary>
          <div className="site00-ee-ref-support__body">{s.content}</div>
        </details>
      ))}
    </section>
  );
}
