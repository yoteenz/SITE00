/**
 * B5.3 — Choose How To Continue (reference-fidelity generate vs import cards).
 */

type Props = {
  attemptCount: number;
  providerLabel: string;
  autoRetryOff: boolean;
  onGenerate: () => void;
  onImport: () => void;
  generating: boolean;
  importing: boolean;
  generateDisabled?: boolean;
  generateDisabledReason?: string;
};

export function ReferenceChooseHowToContinue({
  attemptCount,
  providerLabel,
  autoRetryOff,
  onGenerate,
  onImport,
  generating,
  importing,
  generateDisabled,
  generateDisabledReason,
}: Props) {
  return (
    <section className="site00-ee-ref-continue" aria-label="Choose how to continue">
      <h3 className="site00-ee-ref-continue__title">CHOOSE HOW TO CONTINUE</h3>
      <div className="site00-ee-ref-continue__grid">
        <article className="site00-ee-ref-continue__card">
          <span className="site00-ee-ref-continue__accent" aria-hidden />
          <h4>GENERATE WITH STUDIO WORLD</h4>
          <ul className="site00-ee-ref-continue__meta">
            <li>
              <span>PROVIDER</span>
              <strong>{providerLabel}</strong>
            </li>
            <li>
              <span>ATTEMPTS</span>
              <strong>{attemptCount}</strong>
            </li>
            <li>
              <span>AUTO-RETRY</span>
              <strong>{autoRetryOff ? 'OFF' : 'ON'}</strong>
            </li>
          </ul>
          {generateDisabledReason ? (
            <p className="site00-ee-ref-continue__hint">{generateDisabledReason}</p>
          ) : null}
          <button
            type="button"
            className="site00-ee-ref-continue__btn"
            disabled={generating || importing || generateDisabled}
            onClick={onGenerate}
          >
            {generating ? 'GENERATING…' : 'GENERATE STORYBOARD'}
          </button>
        </article>

        <article className="site00-ee-ref-continue__card">
          <span className="site00-ee-ref-continue__accent" aria-hidden />
          <h4>IMPORT MY STORYBOARD</h4>
          <p className="site00-ee-ref-continue__desc">Use an externally created storyboard without provider generation.</p>
          <button
            type="button"
            className="site00-ee-ref-continue__btn site00-ee-ref-continue__btn--secondary"
            disabled={generating || importing}
            onClick={onImport}
          >
            {importing ? 'IMPORTING…' : 'UPLOAD STORYBOARD'}
          </button>
        </article>
      </div>
    </section>
  );
}
