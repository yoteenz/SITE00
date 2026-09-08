/**
 * B5.0 — System inspector — raw technical intelligence (progressive disclosure).
 */

import { useState } from 'react';

type Props = {
  rawPayload: unknown;
  sections?: Array<{ id: string; label: string; content: React.ReactNode }>;
};

export function SystemInspector({ rawPayload, sections = [] }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <details className="site00-ee-inspector" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary>SYSTEM INSPECTOR</summary>
      <div className="site00-ee-inspector__body">
        {sections.map((s) => (
          <section key={s.id} className="site00-ee-inspector__section">
            <h4>{s.label}</h4>
            {s.content}
          </section>
        ))}
        <section className="site00-ee-inspector__section">
          <h4>Raw JSON</h4>
          <pre className="site00-ee-inspector__json">{JSON.stringify(rawPayload, null, 2)}</pre>
        </section>
      </div>
    </details>
  );
}
