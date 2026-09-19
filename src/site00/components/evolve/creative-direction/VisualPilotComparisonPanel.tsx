import type { CreativeDirectionPayload } from './CreativeDirectionExperience';

type BrandPilot = NonNullable<CreativeDirectionPayload['brandNativeVisualPilot']>;
type IdentityPilot = NonNullable<CreativeDirectionPayload['identityNativeVisualPilot']>;
type IdentityV2Pilot = NonNullable<CreativeDirectionPayload['identityNativeV2VisualPilot']>;

type Props = {
  brandNativePilot: BrandPilot | null | undefined;
  identityNativePilot: IdentityPilot | null | undefined;
  identityNativeV2Pilot: IdentityV2Pilot | null | undefined;
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

export function VisualPilotComparisonPanel({
  brandNativePilot,
  identityNativePilot,
  identityNativeV2Pilot,
}: Props) {
  if (
    !brandNativePilot?.publicUrl &&
    !identityNativePilot?.publicUrl &&
    !identityNativeV2Pilot?.publicUrl
  ) {
    return null;
  }

  const v2Qa = identityNativeV2Pilot?.rawImageQa as Record<string, unknown> | undefined;

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
          A → SUBJECT BELONGS TO WORLD · B → IMAGE BELONGS TO IDENTITY · C → IMAGE SPEAKS WITH BRAND
          PERSONALITY · RAW HEROES — NO CODE OVERLAYS
        </p>
      </header>

      <div className="site00-cd__pilot-comparison-grid site00-cd__pilot-comparison-grid--three">
        {brandNativePilot?.publicUrl ? (
          <article className="site00-cd__pilot-card site00-cd__pilot-card--brand">
            <header className="site00-cd__pilot-card-head">
              <p className="site00-cd__pilot-card-label">A</p>
              <h3 className="site00-cd__pilot-card-title">BRAND-NATIVE PILOT</h3>
              <p className="site00-cd__pilot-card-sub">DIRECTION-NATIVE / IDENTITY-INCOMPLETE</p>
              <p className="site00-cd__pilot-card-meta" role="status">
                {brandNativePilot.founderPilotStatus.replace(/_/g, ' ')}
              </p>
            </header>
            <figure className="site00-cd__pilot-figure">
              <img
                src={brandNativePilot.publicUrl}
                alt="Brand-native visual pilot"
                className="site00-cd__pilot-image"
                loading="eager"
              />
              <figcaption className="site00-cd__pilot-caption">
                MUC-BRAND-NATIVE-HERO-PILOT · {brandNativePilot.topic}
              </figcaption>
            </figure>
          </article>
        ) : null}

        {identityNativePilot?.publicUrl ? (
          <article className="site00-cd__pilot-card site00-cd__pilot-card--identity">
            <header className="site00-cd__pilot-card-head">
              <p className="site00-cd__pilot-card-label">B</p>
              <h3 className="site00-cd__pilot-card-title">IDENTITY-NATIVE PILOT</h3>
              <p className="site00-cd__pilot-card-sub">IDENTITY-NATIVE VISUAL PILOT</p>
              <p className="site00-cd__pilot-card-meta" role="status">
                {identityNativePilot.founderPilotStatus.replace(/_/g, ' ')}
              </p>
            </header>
            <figure className="site00-cd__pilot-figure">
              <img
                src={identityNativePilot.publicUrl}
                alt="Identity-native visual pilot"
                className="site00-cd__pilot-image"
                loading="lazy"
              />
              <figcaption className="site00-cd__pilot-caption">
                MUC-IDENTITY-NATIVE-HERO-PILOT · {identityNativePilot.topic}
              </figcaption>
            </figure>
          </article>
        ) : null}

        {identityNativeV2Pilot?.publicUrl ? (
          <article className="site00-cd__pilot-card site00-cd__pilot-card--v2">
            <header className="site00-cd__pilot-card-head">
              <p className="site00-cd__pilot-card-label">C</p>
              <h3 className="site00-cd__pilot-card-title">CREATIVE-REFINED IDENTITY PILOT</h3>
              <p className="site00-cd__pilot-card-sub">CREATIVE-REFINED IDENTITY PILOT · V2</p>
              <p className="site00-cd__pilot-card-meta" role="status">
                {identityNativeV2Pilot.founderPilotStatus.replace(/_/g, ' ')}
              </p>
            </header>
            <figure className="site00-cd__pilot-figure">
              <img
                src={identityNativeV2Pilot.publicUrl}
                alt="Creative-refined identity visual pilot V2"
                className="site00-cd__pilot-image"
                loading="eager"
              />
              <figcaption className="site00-cd__pilot-caption">
                MUC-IDENTITY-NATIVE-HERO-PILOT-V2 · {identityNativeV2Pilot.topic}
              </figcaption>
            </figure>
            <ul className="site00-cd__pilot-qa" aria-label="Creative-refined V2 QA scores">
              <QaScore label="IDENTITY" value={v2Qa?.identityNativeScore as number | undefined} />
              <QaScore label="TYPOGRAPHY" value={v2Qa?.typographicDna as number | undefined} />
              <QaScore label="MARTIAN MONO" value={v2Qa?.martianMonoIntegration as number | undefined} />
              <QaScore label="VOICE" value={v2Qa?.voicePersonality as number | undefined} />
              <QaScore label="WIT" value={v2Qa?.wit as number | undefined} />
              <QaScore label="GRAPHIC GRAMMAR" value={v2Qa?.graphicGrammarFidelity as number | undefined} />
              <QaScore label="COMPOSITION" value={v2Qa?.compositionalArtistry as number | undefined} />
              <QaScore label="SECOND READ" value={v2Qa?.secondReadDepth as number | undefined} />
              <QaScore label="MEMORABILITY" value={v2Qa?.memorability as number | undefined} />
              <QaScore label="STOCK RESEMBLANCE" value={v2Qa?.stockResemblance as number | undefined} invert />
            </ul>
          </article>
        ) : null}
      </div>
    </section>
  );
}
