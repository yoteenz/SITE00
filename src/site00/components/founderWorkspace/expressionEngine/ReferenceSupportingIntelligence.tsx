/**
 * B5.3 — collapsible supporting intelligence sections with status summaries.
 */

import type { ReactNode } from 'react';

export type ReferenceSupportSection = {
  id: string;
  label: string;
  status?: string;
  content: ReactNode;
};

type Props = {
  sections: ReferenceSupportSection[];
};

export function ReferenceSupportingIntelligence({ sections }: Props) {
  return (
    <section className="site00-ee-ref-support" aria-label="Supporting intelligence">
      {sections.map((s) => (
        <details key={s.id} className="site00-ee-ref-support__block">
          <summary>
            <span className="site00-ee-ref-support__label">{s.label}</span>
            {s.status ? <span className="site00-ee-ref-support__status">{s.status}</span> : null}
            <span className="site00-ee-ref-support__chevron" aria-hidden>›</span>
          </summary>
          <div className="site00-ee-ref-support__body">{s.content}</div>
        </details>
      ))}
    </section>
  );
}
