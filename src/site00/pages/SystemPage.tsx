import { Site00PublicShell } from '../components/shell/Site00PublicShell';
import { BracketHeading, PageIntro } from '../components/pages/Site00PagePrimitives';
import { SITE00_SYSTEM_LAYERS } from '../config/seed/site00-page-seed';

export default function SystemPage() {
  return (
    <Site00PublicShell>
      <div className="site00-page site00-page--system">
        <PageIntro title={<BracketHeading>SYSTEM</BracketHeading>} subtitle="THE FOUNDATION." />
        <div className="site00-system-foundation">
          <section className="site00-system-foundation__layers" aria-label="SITE 00 system layers">
            <ol className="site00-system-layer-list">
              {SITE00_SYSTEM_LAYERS.map((layer) => (
                <li key={layer.id} className="site00-system-layer-list__item">
                  <span className="site00-system-layer-list__num">{layer.num}</span>
                  <div>
                    <h2 className="site00-system-layer-list__title">{layer.title}</h2>
                    <p className="site00-system-layer-list__desc">{layer.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          <aside className="site00-system-foundation__visual" aria-label="System layer stack visualization">
            <div className="site00-system-stack-viz">
              {SITE00_SYSTEM_LAYERS.map((layer) => (
                <div key={layer.id} className="site00-system-stack-viz__plate">
                  <span className="site00-system-stack-viz__label">{layer.title}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </Site00PublicShell>
  );
}
