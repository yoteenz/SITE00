import { ProjectsHeaderPlanet } from './ProjectsHeaderPlanet';
import { AccountIdentityEyebrow } from './AccountIdentityEyebrow';
import { useProjectsAccountIdentity } from '../../hooks/useProjectsAccountIdentity';
import { PROJECTS_PAGE_SHELL_CONFIG } from '../../../../shared/site00-projects/projectsPageShellConfig.js';

export function ProjectIndexHero() {
  const shell = PROJECTS_PAGE_SHELL_CONFIG;
  const { identity, eyebrow } = useProjectsAccountIdentity();

  return (
    <header className="site00-pidx-hero" data-site00-hero="shared">
      <div className="site00-pidx-hero__grid">
        <div className="site00-pidx-hero__copy">
          <p className="site00-pidx-hero__brand">
            {shell.brand} <span className="site00-pidx-hero__brand-mark" aria-hidden="true">◆</span>
          </p>
          <p className="site00-pidx-hero__verbs">
            {shell.verbs.map((verb) => (
              <span key={verb}>{verb}</span>
            ))}
          </p>
          <AccountIdentityEyebrow identity={identity} eyebrow={eyebrow} />
          <h1 className="site00-pidx-hero__title">{shell.title}</h1>
          <span className="site00-pidx-hero__divider" aria-hidden="true" />
          <p className="site00-pidx-hero__tagline">{shell.tagline}</p>
          <p className="site00-pidx-hero__support">{shell.support}</p>
        </div>

        <div className="site00-pidx-hero__visual-col">
          <div className="site00-pidx-hero__visual-frame">
            <div className="site00-pidx-hero__grid-lines" aria-hidden="true" />
            <ProjectsHeaderPlanet className="site00-pidx-hero__orbital" />
          </div>
          <div className="site00-pidx-hero__rail" aria-hidden="true">
            {shell.rail.map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
          <p className="site00-pidx-hero__rail-sub">{shell.railSub}</p>
          <span className="site00-pidx-hero__index-num">{shell.indexMark}</span>
        </div>
      </div>
    </header>
  );
}
