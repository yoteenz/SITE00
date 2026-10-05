import type { ReactNode } from 'react';
import type { CreativeIntakeExperience } from '../../../../../shared/site00-marketing/creativeIntake/types';
import { INTAKE_COPY, INTAKE_INSIGHTS, INTAKE_MANIFESTO } from '../../../../../shared/site00-marketing/creativeIntake/copySystem';

type Props = {
  experience: CreativeIntakeExperience;
  serviceTitle: string;
  serviceDescription?: string;
  stageIndex: number;
  progress: number;
  children: ReactNode;
  artifact: ReactNode;
};

function breadcrumbFor(experience: CreativeIntakeExperience): string {
  switch (experience.discipline) {
    case 'social-content':
      return INTAKE_COPY.social.breadcrumb;
    case 'ugc-style':
      return INTAKE_COPY.ugc.breadcrumb;
    case 'brand-film':
      return INTAKE_COPY.film.breadcrumb;
    case 'campaign':
      return INTAKE_COPY.campaign.breadcrumb;
    case 'product-campaign':
      return INTAKE_COPY.product.breadcrumb;
    case 'launch-campaign':
      return INTAKE_COPY.launch.breadcrumb;
    case 'content-system':
      return INTAKE_COPY.contentSystem.breadcrumb;
    default:
      return 'EVOLVE / INTAKE';
  }
}

function descriptionFor(experience: CreativeIntakeExperience): string {
  switch (experience.discipline) {
    case 'social-content':
      return INTAKE_COPY.social.description;
    case 'ugc-style':
      return INTAKE_COPY.ugc.description;
    case 'brand-film':
      return INTAKE_COPY.film.description;
    case 'campaign':
      return INTAKE_COPY.campaign.description;
    case 'product-campaign':
      return INTAKE_COPY.product.description;
    case 'launch-campaign':
      return INTAKE_COPY.launch.description;
    case 'content-system':
      return INTAKE_COPY.contentSystem.description;
    default:
      return '';
  }
}

export function CreativeIntakeShell({
  experience,
  serviceTitle,
  serviceDescription,
  stageIndex,
  progress,
  children,
  artifact,
}: Props) {
  const insights = INTAKE_INSIGHTS[experience.discipline] ?? [];
  const manifesto = INTAKE_MANIFESTO[experience.discipline] ?? 'CAPTURED INTENT ONLY — NO FABRICATED METRICS.';
  const description = serviceDescription ?? descriptionFor(experience);
  const stage = experience.stages[stageIndex];

  return (
    <div
      className={`site00-creative-intake site00-creative-intake--${experience.family.toLowerCase().replace(/_/g, '-')}`}
      data-artifact={experience.differentiationMarker}
      data-family={experience.family}
      data-visual-mode={experience.visualMode}
    >
      <header className="site00-creative-intake__header">
        <p className="site00-creative-intake__breadcrumb">{breadcrumbFor(experience)}</p>
        <p className="site00-creative-intake__environment">{experience.environment}</p>
        {serviceTitle ? <h1 className="site00-creative-intake__discipline">{serviceTitle}</h1> : null}
        {description ? <p className="site00-creative-intake__description">{description}</p> : null}

        <div className="site00-creative-intake__progress-row">
          <ol className="site00-creative-intake__stage-dots" aria-label="INTAKE PROGRESS">
            {experience.stages.map((s, i) => (
              <li
                key={s.id}
                className={[
                  'site00-creative-intake__stage-dot',
                  i === stageIndex ? 'is-active' : '',
                  i < stageIndex ? 'is-complete' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="site00-creative-intake__stage-dot-num">{String(i + 1).padStart(2, '0')}</span>
                {i === stageIndex ? <span className="site00-creative-intake__stage-dot-label">{s.progressLabel}</span> : null}
              </li>
            ))}
          </ol>
        </div>
      </header>

      <div className="site00-creative-intake__workstation">
        <nav className="site00-creative-intake__stage-rail" aria-label="STAGE NAVIGATION">
          <ol>
            {experience.stages.map((s, i) => (
              <li
                key={s.id}
                className={[
                  i === stageIndex ? 'is-active' : '',
                  i < stageIndex ? 'is-complete' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="site00-creative-intake__rail-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="site00-creative-intake__rail-label">{s.progressLabel}</span>
              </li>
            ))}
          </ol>
          <div className="site00-creative-intake__technical-mark">
            <span className="site00-creative-intake__crosshair" aria-hidden>⊕</span>
            <span>{manifesto}</span>
          </div>
        </nav>

        <section className="site00-creative-intake__stage" aria-labelledby="creative-intake-prompt">
          {children}
        </section>

        <aside className="site00-creative-intake__artifact-col" aria-label={`${experience.signatureArtifact.replace(/_/g, ' ')} PREVIEW`}>
          {artifact}
        </aside>

        <aside className="site00-creative-intake__insights" aria-label="STAGE INSIGHTS">
          <p className="site00-creative-intake__insights-title">{stage?.progressLabel} INSIGHT</p>
          <ul>
            {insights.map((item) => (
              <li key={item.title}>
                <span className="site00-creative-intake__insight-icon" aria-hidden>◈</span>
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </li>
            ))}
          </ul>
          <div className="site00-creative-intake__insights-manifesto">
            <span className="site00-creative-intake__crosshair" aria-hidden>⊕</span>
            <span>{manifesto}</span>
          </div>
        </aside>
      </div>

      <div className="site00-creative-intake__progress" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-hidden>
        <div className="site00-creative-intake__progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
