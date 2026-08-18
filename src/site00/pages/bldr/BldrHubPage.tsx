import { Link } from 'react-router-dom';
import { Site00PublicShell } from '../../components/shell/Site00PublicShell';
import { BracketHeading, PageIntro } from '../../components/pages/Site00PagePrimitives';
import { SITE00_ROUTES } from '../../config/routes';

const BLDR_STEPS = [
  { num: '01', title: 'SHARE YOUR VISION', body: 'TELL US WHAT YOU ARE BUILDING AND WHY IT MATTERS.' },
  { num: '02', title: 'DISCOVERY & STRATEGY', body: 'ALIGN ON SCOPE, TIMELINE, AND CREATIVE DIRECTION.' },
  { num: '03', title: 'DESIGN & BUILD', body: 'PRODUCE, ITERATE, AND REFINE WITHIN SITE 00 SYSTEMS.' },
  { num: '04', title: 'LAUNCH & GROW', body: 'DEPLOY, MONITOR, AND EVOLVE YOUR DIGITAL PLACE.' },
] as const;

export default function BldrHubPage() {
  return (
    <Site00PublicShell mobileActiveNav="build">
      <div className="site00-page site00-page--bldr-hub">
        <PageIntro
          title={<BracketHeading>BLDR</BracketHeading>}
          subtitle="START YOUR BUILD. WE'LL GUIDE YOU FROM IDEA TO LAUNCH."
        />
        <div className="site00-bldr-split">
          <section className="site00-bldr-split__steps" aria-label="Build process">
            <ol className="site00-bldr-step-list">
              {BLDR_STEPS.map((step) => (
                <li key={step.num} className="site00-bldr-step-list__item">
                  <span className="site00-bldr-step-list__num">{step.num}</span>
                  <div>
                    <h2 className="site00-bldr-step-list__title">{step.title}</h2>
                    <p className="site00-bldr-step-list__body">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          <aside className="site00-bldr-split__cta">
            <div className="site00-bldr-ready-panel">
              <p className="site00-label-red">READY TO BEGIN?</p>
              <p className="site00-body">START YOUR BUILD INTAKE AND ENTER THE SITE 00 BUILD FLOW.</p>
              <Link to={SITE00_ROUTES.bldrStart} className="site00-link-red site00-bldr-ready-panel__action">
                START BUILDING →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </Site00PublicShell>
  );
}
