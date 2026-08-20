import type { ReactNode } from 'react';
import type { CreativeIntakeExperience } from '../../../../../shared/site00-marketing/creativeIntake/types';
import { INTAKE_COPY } from '../../../../../shared/site00-marketing/creativeIntake/copySystem';

type Props = {
  experience: CreativeIntakeExperience;
  serviceTitle: string;
  stageIndex: number;
  progress: number;
  children: ReactNode;
  artifact: ReactNode;
};

function breadcrumbFor(experience: CreativeIntakeExperience): string {
  switch (experience.family) {
    case 'ATTENTION':
      return INTAKE_COPY.social.breadcrumb;
    case 'FILM_SET':
      return INTAKE_COPY.film.breadcrumb;
    case 'CAMPAIGN_CONTROL':
      return INTAKE_COPY.campaign.breadcrumb;
    case 'EDITORIAL':
      return INTAKE_COPY.editorial.breadcrumb;
    default:
      return 'EVOLVE / INTAKE';
  }
}

export function CreativeIntakeShell({ experience, serviceTitle, progress, children, artifact }: Props) {
  return (
    <div
      className={`site00-creative-intake site00-creative-intake--${experience.family.toLowerCase().replace('_', '-')}`}
      data-artifact={experience.differentiationMarker}
      data-family={experience.family}
      data-visual-mode={experience.visualMode}
    >
      <header className="site00-creative-intake__header">
        <p className="site00-creative-intake__breadcrumb">{breadcrumbFor(experience)}</p>
        <p className="site00-creative-intake__environment">{experience.environment}</p>
        <h1 className="site00-creative-intake__discipline">{serviceTitle}</h1>
        <div className="site00-creative-intake__progress" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div className="site00-creative-intake__progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="site00-creative-intake__metaphor">{experience.progressMetaphor}</p>
      </header>

      <div className="site00-creative-intake__layout">
        <aside className="site00-creative-intake__artifact" aria-label={`${experience.signatureArtifact.replace(/_/g, ' ')} preview`}>
          {artifact}
        </aside>
        <section className="site00-creative-intake__stage" aria-labelledby="creative-intake-prompt">
          {children}
        </section>
      </div>
    </div>
  );
}
