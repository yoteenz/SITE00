import type { CreativeDirectionPayload } from './CreativeDirectionExperience';

type BrandPilot = NonNullable<CreativeDirectionPayload['brandNativeVisualPilot']>;
type IdentityPilot = NonNullable<CreativeDirectionPayload['identityNativeVisualPilot']>;

type Props = {
  brandNativePilot: BrandPilot | null | undefined;
  identityNativePilot: IdentityPilot | null | undefined;
};

function QaScore({ label, value, invert }: { label: string; value: number | undefined; invert?: boolean }) {
  if (value == null) return null;
  const display = invert ? `${value}/5 (lower is better)` : `${value}/5`;
  return (
    <li className="site00-cd__pilot-qa-item">
      <span className="site00-cd__pilot-qa-label">{label}</span>
      <span className="site00-cd__pilot-qa-value">{display}</span>
    </li>
  );
}

export function VisualPilotComparisonPanel({ brandNativePilot, identityNativePilot }: Props) {
  if (!brandNativePilot?.publicUrl && !identityNativePilot?.publicUrl) return null;

  const identityQa = identityNativePilot?.rawImageQa as Record<string, unknown> | undefined;

  return (
    <section
      id="visual-language-pilot"
      className="site00-cd__pilot-comparison"
      aria-labelledby="cd-visual-language-pilot"
    >
      <header className="site00-cd__pilot-comparison-head">
        <p className="site00-cd__pilot-kicker">THE MARKED-UP COPY</p>
        <h2 id="cd-visual-language-pilot" className="site00-cd__pilot-title">
          VISUAL GENERATION PILOT COMPARISON
        </h2>
        <p className="site00-cd__pilot-meta">
          RAW HEROES — NO CODE OVERLAYS · FOUNDER REVIEW ONLY
        </p>
      </header>

      <div className="site00-cd__pilot-comparison-grid">
        {brandNativePilot?.publicUrl ? (
          <article className="site00-cd__pilot-card site00-cd__pilot-card--brand">
            <header className="site00-cd__pilot-card-head">
              <p className="site00-cd__pilot-card-label">A</p>
              <h3 className="site00-cd__pilot-card-title">BRAND-NATIVE PILOT</h3>
              <p className="site00-cd__pilot-card-sub">
                {brandNativePilot.founderPilotLabel ?? 'DIRECTION-NATIVE / IDENTITY-INCOMPLETE'}
              </p>
              <p className="site00-cd__pilot-card-meta" role="status">
                {brandNativePilot.founderPilotStatus.replace(/_/g, ' ')}
              </p>
            </header>
            <figure className="site00-cd__pilot-figure">
              <img
                src={brandNativePilot.publicUrl}
                alt="Brand-native visual pilot — direction-native hero before overlays"
                className="site00-cd__pilot-image"
                loading="eager"
              />
              <figcaption className="site00-cd__pilot-caption">
                {brandNativePilot.assetId ?? 'MUC-BRAND-NATIVE-HERO-PILOT'} · Topic: {brandNativePilot.topic}
              </figcaption>
            </figure>
          </article>
        ) : null}

        {identityNativePilot?.publicUrl ? (
          <article className="site00-cd__pilot-card site00-cd__pilot-card--identity">
            <header className="site00-cd__pilot-card-head">
              <p className="site00-cd__pilot-card-label">B</p>
              <h3 className="site00-cd__pilot-card-title">IDENTITY-NATIVE VISUAL PILOT</h3>
              <p className="site00-cd__pilot-card-sub">
                {identityNativePilot.founderPilotLabel ?? 'IDENTITY-NATIVE VISUAL PILOT'}
              </p>
              <p className="site00-cd__pilot-card-meta" role="status">
                {identityNativePilot.founderPilotStatus.replace(/_/g, ' ')}
              </p>
            </header>
            <figure className="site00-cd__pilot-figure">
              <img
                src={identityNativePilot.publicUrl}
                alt="Identity-native visual pilot — custom editorial artwork before overlays"
                className="site00-cd__pilot-image"
                loading="eager"
              />
              <figcaption className="site00-cd__pilot-caption">
                {identityNativePilot.assetId ?? 'MUC-IDENTITY-NATIVE-HERO-PILOT'} · Topic: {identityNativePilot.topic}
              </figcaption>
            </figure>
            <ul className="site00-cd__pilot-qa" aria-label="Identity-native QA scores">
              <QaScore label="IDENTITY NATIVE" value={identityQa?.identityNativeScore as number | undefined} />
              <QaScore label="DIRECTION NATIVE" value={identityQa?.directionNativeScore as number | undefined} />
              <QaScore label="PALETTE" value={identityQa?.paletteFidelity as number | undefined} />
              <QaScore label="TYPOGRAPHY" value={identityQa?.typographicDna as number | undefined} />
              <QaScore label="GRAPHIC GRAMMAR" value={identityQa?.graphicGrammarFidelity as number | undefined} />
              <QaScore label="ARTIFACT AUTHORITY" value={identityQa?.artifactDesignAuthority as number | undefined} />
              <QaScore label="STOCK RESEMBLANCE" value={identityQa?.stockResemblance as number | undefined} invert />
            </ul>
          </article>
        ) : null}
      </div>
    </section>
  );
}
