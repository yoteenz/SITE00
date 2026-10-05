import { Link } from 'react-router-dom';
import { BracketHeading, EcosystemHubHero } from '../../components/pages/Site00PagePrimitives';
import { useSite00DesktopArtboardPreview } from '../../components/shell/Site00DesktopArtboardContext';
import { Site00PublicShell } from '../../components/shell/Site00PublicShell';
import { BldrMobileExperience } from '../../components/bldr/mobile/BldrMobileExperience';
import { BLDR_HUB_STAGES } from '../../config/bldr-hub-stages';
import { SITE00_ROUTES } from '../../config/routes';

function BldrDesktopHub() {
  return (
    <>
      <EcosystemHubHero
        panel="bldr"
        title={<BracketHeading>BLDR</BracketHeading>}
        subtitle="START YOUR BUILD. WE'LL GUIDE YOU FROM IDEA TO LAUNCH."
      />
      <div className="site00-bldr-split">
        <section className="site00-bldr-split__steps" aria-label="BUILD PROCESS">
          <ol className="site00-bldr-step-list">
            {BLDR_HUB_STAGES.map((step) => (
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
    </>
  );
}

export default function BldrHubPage() {
  const isDesktopArtboard = useSite00DesktopArtboardPreview();

  return (
    <Site00PublicShell>
      <div className="site00-page site00-page--bldr-hub">
        {isDesktopArtboard ? <BldrDesktopHub /> : <BldrMobileExperience />}
      </div>
    </Site00PublicShell>
  );
}
