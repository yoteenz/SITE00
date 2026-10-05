import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { EnvironmentShell } from '../environment/EnvironmentShell';
import { Site00AppShell } from '../shell/Site00AppShell';
import { Site00MobileShell } from '../mobile/Site00MobileShell';
import { Site00PageFooter } from '../shell/Site00PageFooter';
import { Site00OriginLayoutSwitch } from '../shell/Site00OriginLayoutSwitch';
import { useSite00DesktopArtboardPreview } from '../shell/Site00DesktopArtboardContext';
import type { EvolvePathAssessmentConfig } from '../../config/evolve-assessment';
import { EvolvePathIcon } from '../evolve/EvolvePathIcon';
import { EvolveHeroArtwork } from '../evolve/mobile/EvolveHeroArtwork';
import { Site00ThreeCornerMark } from '../mark/Site00ThreeCornerMark';
import type { EvolvePathId } from '../../config/evolve';

type EvolveAssessmentShellProps = {
  state: EvolvePathAssessmentConfig;
  pathId: EvolvePathId;
  children?: ReactNode;
  panel?: ReactNode;
};

export function EvolveAssessmentBreadcrumb({ label }: { label: string }) {
  return (
    <nav className="site00-evolve-assessment__breadcrumb" aria-label="BREADCRUMB">
      {label}
    </nav>
  );
}

export function EvolveAssessmentActions({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <div className="site00-evolve-assessment__actions">
      <button type="button" className="site00-evolve-assessment__cta-primary" onClick={onPrimary}>
        {primaryLabel}
      </button>
      {secondaryLabel && onSecondary ? (
        <button type="button" className="site00-evolve-assessment__cta-secondary" onClick={onSecondary}>
          {secondaryLabel}
        </button>
      ) : null}
    </div>
  );
}

export function EvolveAssessmentShell({ state, pathId, children, panel }: EvolveAssessmentShellProps) {
  const isDesktopArtboard = useSite00DesktopArtboardPreview();

  const hero = (
    <>
      <div className="site00-evolve-assessment__icon">
        <EvolvePathIcon id={pathId} title={state.title} size={64} />
      </div>
      <p className="site00-evolve-assessment__marker">{state.stageMarker}</p>
      <h1 className="site00-evolve-assessment__title">{state.title}</h1>
      <p className="site00-evolve-assessment__declaration">{state.declaration}</p>
      <p className="site00-evolve-assessment__body">{state.editorialBody}</p>
    </>
  );

  if (!isDesktopArtboard) {
    return (
      <div className="site00-evolve-assessment site00-evolve-assessment--mobile">
        <Site00MobileShell showEnvironmentBackground={false} shellClassName="site00-evolve-assessment-mobile-shell">
          <div className="site00-evolve-assessment__mobile-content">
            <header className="site00-evolve-assessment__mobile-hero">
              <Site00ThreeCornerMark className="site00-evolve-assessment__mark" />
              <EvolveAssessmentBreadcrumb label={state.breadcrumb} />
              <div className="site00-evolve-assessment__hero-grid">
                <div className="site00-evolve-assessment__hero-copy">{hero}</div>
                <EvolveHeroArtwork className="site00-evolve-assessment__hero-art" />
              </div>
            </header>
            {panel ? <div className="site00-evolve-assessment__panel">{panel}</div> : null}
            {children}
            <Site00PageFooter />
          </div>
        </Site00MobileShell>
      </div>
    );
  }

  return (
    <EnvironmentShell environmentId="IDNTY_ASSESSMENT_ENVIRONMENT" className="site00-idnty-assessment site00-idnty-assessment--desktop">
      <Site00AppShell locationLabel={state.breadcrumb}>
        <div className="site00-idnty-assessment__desktop-grid">
          <aside className="site00-idnty-assessment__intro" aria-label="EVOLVE PATH OVERVIEW">
            <div className="site00-idnty-assessment__intro-inner">
              <div className="site00-idnty-assessment__icon">
                <EvolvePathIcon id={pathId} title={state.title} size={88} />
              </div>
              <p className="site00-idnty-assessment__marker">{state.stageMarker}</p>
              <h1 className="site00-idnty-assessment__title">{state.title}</h1>
              <p className="site00-idnty-assessment__declaration">{state.declaration}</p>
              <p className="site00-idnty-assessment__body">{state.editorialBody}</p>
            </div>
          </aside>
          <div className="site00-idnty-assessment__main">
            <nav className="site00-idnty-assessment__breadcrumb" aria-label="BREADCRUMB">
              {state.breadcrumb}
            </nav>
            {panel}
            {children}
          </div>
        </div>
      </Site00AppShell>
      <Site00OriginLayoutSwitch />
    </EnvironmentShell>
  );
}

export function EvolveAssessmentCompletePanel({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <div className="site00-evolve-assessment__complete">
      <p className="site00-label-red">{title}</p>
      <p className="site00-body">{subtitle}</p>
      <Link to={href} className="site00-link-red">
        ENTER CTRL ROOM →
      </Link>
    </div>
  );
}
