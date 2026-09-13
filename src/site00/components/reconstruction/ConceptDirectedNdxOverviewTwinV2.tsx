/**
 * P0.VR.TWINV2.1 — Coded twin from approved visual authority (function transplant).
 */

import type { ConceptDirectedTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/types.js';
import { TwinSite00HostBottomNav } from './TwinSite00HostBottomNav.js';
import '../../styles/site00-twin-v2-concept.css';

type Props = {
  projectSlug: string;
  session: ConceptDirectedTwinSession;
};

export function ConceptDirectedNdxOverviewTwinV2({ projectSlug, session }: Props) {
  const spec = session.twinV2VisualSpec;
  const authorityUrl = session.approvedVisualAuthority?.imageUrl;
  const fg = session.functionGraph;

  return (
    <div
      className="site00-twin-v2-ndx"
      data-twin-v2="concept-directed"
      data-twin-v2-session={session.sessionId}
      data-twin-v2-build={session.buildRef}
    >
      <header className="site00-twin-v2-ndx__host">
        <span className="site00-twin-v2-ndx__host-label">SITE 00</span>
        <span className="site00-twin-v2-ndx__host-route">{projectSlug.toUpperCase()}</span>
      </header>

      {authorityUrl ? (
        <figure className="site00-twin-v2-ndx__authority-ghost" aria-hidden>
          <img src={authorityUrl} alt="" />
        </figure>
      ) : null}

      <section className="site00-twin-v2-ndx__masthead">
        <p className="site00-twin-v2-ndx__kicker">NDXBOOK · OVERVIEW</p>
        <h1>{session.pageIntent.pageType}</h1>
        <p className="site00-twin-v2-ndx__decision">{session.pageIntent.primaryDecision}</p>
      </section>

      <nav className="site00-twin-v2-ndx__module-nav" aria-label="Module navigation">
        {fg.sectionNavigation.map((item) => (
          <span key={item} className="site00-twin-v2-ndx__chip">
            {item}
          </span>
        ))}
      </nav>

      {(spec?.bands ?? session.blueprintGrammar.informationBands).map((band) => {
        const id = typeof band === 'string' ? band : band.id;
        const role = typeof band === 'string' ? band : band.role;
        return (
          <section key={id} className="site00-twin-v2-ndx__band" data-band={id}>
            <h2>{role}</h2>
            <div className="site00-twin-v2-ndx__band-body">
              {id.toLowerCase().includes('hero') ? (
                <p>{session.creativeDirection?.heroConcept}</p>
              ) : id.toLowerCase().includes('metric') ? (
                <ul>
                  {fg.metrics.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              ) : id.toLowerCase().includes('focus') ? (
                <ul>
                  {fg.currentFocus.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              ) : id.toLowerCase().includes('milestone') ? (
                <ul>
                  {fg.milestone.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              ) : id.toLowerCase().includes('activity') ? (
                <ul>
                  {fg.recentActivity.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              ) : (
                <p>{session.creativeDirection?.sectionRoles[id] ?? session.pageIntent.summary}</p>
              )}
            </div>
          </section>
        );
      })}

      <section className="site00-twin-v2-ndx__progress">
        {fg.progress.map((p) => (
          <span key={p} className="site00-twin-v2-ndx__progress-item">
            {p}
          </span>
        ))}
      </section>

      <TwinSite00HostBottomNav />
    </div>
  );
}
