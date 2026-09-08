/**
 * B5.3 — System Inspector expanded accordion (KV grid + scrollable JSON preview).
 */

import { useCallback, useState } from 'react';

type Props = {
  fields: Array<{ label: string; value: string }>;
  payload: unknown;
};

export function ReferenceExpandedSystemInspector({ fields, payload }: Props) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(payload, null, 2);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [json]);

  return (
    <section className="site00-ee-ref-inspector">
      <div className="site00-ee-ref-inspector__grid">
        <dl className="site00-ee-ref-inspector__kv">
          {fields.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
        <div className="site00-ee-ref-inspector__payload">
          <header>
            <span>SYSTEM PAYLOAD (PREVIEW)</span>
            <button type="button" onClick={() => void handleCopy()}>
              {copied ? 'COPIED' : 'COPY'}
            </button>
          </header>
          <pre>{json}</pre>
        </div>
      </div>
    </section>
  );
}
