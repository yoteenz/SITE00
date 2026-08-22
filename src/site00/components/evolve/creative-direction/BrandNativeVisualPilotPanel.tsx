import type { CreativeDirectionPayload } from './CreativeDirectionExperience';

type Pilot = NonNullable<CreativeDirectionPayload['brandNativeVisualPilot']>;

export function BrandNativeVisualPilotPanel({ pilot }: { pilot: Pilot }) {
  if (!pilot.publicUrl) return null;

  const qa = pilot.rawImageQa as Record<string, unknown> | undefined;
  const recognition = qa?.preOverlayDirectionRecognitionTest as string | undefined;
  const directionNative = qa?.directionNativeScore as number | undefined;

  return (
    <section
      id="visual-language-pilot"
      className="site00-cd__pilot-panel"
      aria-labelledby="cd-visual-language-pilot"
    >
      <header className="site00-cd__pilot-head">
        <p className="site00-cd__pilot-kicker">THE MARKED-UP COPY</p>
        <h2 id="cd-visual-language-pilot" className="site00-cd__pilot-title">
          {pilot.founderPilotLabel}
        </h2>
        <p className="site00-cd__pilot-meta" role="status">
          {pilot.founderPilotStatus.replace(/_/g, ' ')}
          {recognition ? ` · PRE-OVERLAY ${recognition.replace(/_/g, ' ')}` : null}
          {directionNative != null ? ` · DIRECTION-NATIVE ${directionNative}/5` : null}
          {' · RAW HERO — NO CODE OVERLAYS'}
        </p>
      </header>
      <figure className="site00-cd__pilot-figure">
        <img
          src={pilot.publicUrl}
          alt="THE MARKED-UP COPY visual language pilot — raw hero before overlays"
          className="site00-cd__pilot-image"
          loading="eager"
        />
        <figcaption className="site00-cd__pilot-caption">
          Topic: {pilot.topic} · Model-generated editorial document mid-revision
        </figcaption>
      </figure>
    </section>
  );
}
