import { BracketHeading, PageIntro } from '../../components/pages/Site00PagePrimitives';
import { Site00ExperiencePage } from '../../components/experience/Site00ExperiencePage';
import { SITE00_SOUND_LAYERS_SEED } from '../../config/seed/site00-page-seed';

export default function SoundPage() {
  return (
    <Site00ExperiencePage pageClassName="site00-page--sound" pageLabel="SOUND">
      <PageIntro
        title={<BracketHeading>SOUND</BracketHeading>}
        subtitle="AUDIO LAYERS FOR THE SITE 00 ENVIRONMENT — PLACEHOLDER UNTIL CANONICAL SOUND DESIGN."
      />
      <div className="site00-principles-grid">
        {SITE00_SOUND_LAYERS_SEED.map((layer) => (
          <article key={layer.id} className="site00-principle-card">
            <h2 className="site00-principle-card__title">{layer.title}</h2>
            <p className="site00-principle-card__desc">{layer.description}</p>
          </article>
        ))}
      </div>
    </Site00ExperiencePage>
  );
}
