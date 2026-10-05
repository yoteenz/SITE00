/**
 * B5.0R2 — Generate vs Import storyboard paths (cost-controlled).
 */

type Props = {
  onGenerate: () => void;
  onImport: (variant: 'A' | 'B') => void;
  generating: boolean;
  importing: boolean;
  requiresFounderDecision?: boolean;
};

export function StoryboardCreatePanel({
  onGenerate,
  onImport,
  generating,
  importing,
  requiresFounderDecision,
}: Props) {
  return (
    <section className="site00-ee-storyboard-create">
      <header>
        <span className="site00-ee-storyboard-create__kicker">CREATE STORYBOARD</span>
        <h3>Choose how to continue</h3>
      </header>

      {requiresFounderDecision ? (
        <p className="site00-ee-storyboard-create__decision">
          STORYBOARD REQUIRES FOUNDER DECISION — try one controlled generation or import your storyboard.
        </p>
      ) : null}

      <article className="site00-ee-storyboard-create__path">
        <h4>GENERATE WITH STUDIO WORLD</h4>
        <p>Uses the approved reel authorities. One provider attempt. No automatic retries.</p>
        <ul className="site00-ee-storyboard-create__meta">
          <li>PROVIDER: GPT IMAGE 2 / FAL</li>
          <li>ATTEMPTS: 1</li>
          <li>AUTO-RETRY: OFF</li>
        </ul>
        <button type="button" className="site00-btn site00-btn--primary" disabled={generating || importing} onClick={onGenerate}>
          {generating ? 'GENERATING…' : 'GENERATE STORYBOARD'}
        </button>
      </article>

      <article className="site00-ee-storyboard-create__path">
        <h4>IMPORT MY STORYBOARD</h4>
        <p>Use an externally created storyboard without provider generation.</p>
        <div className="site00-ee-storyboard-create__variants">
          <button type="button" className="site00-btn" disabled={generating || importing} onClick={() => onImport('A')}>
            {importing ? 'IMPORTING…' : 'VARIANT A'}
          </button>
          <button type="button" className="site00-btn" disabled={generating || importing} onClick={() => onImport('B')}>
            VARIANT B
          </button>
        </div>
      </article>
    </section>
  );
}
