import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { EnvironmentShell } from '../environment/EnvironmentShell';
import { Site00AppShell } from '../shell/Site00AppShell';
import { Site00MobileShell } from '../mobile/Site00MobileShell';
import { Site00PageFooter } from '../shell/Site00PageFooter';
import { Site00OriginLayoutSwitch } from '../shell/Site00OriginLayoutSwitch';
import { useSite00DesktopArtboardPreview } from '../shell/Site00DesktopArtboardContext';
import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';
import { SITE00_IDNTY_ASSESSMENT_MOBILE_BG } from '../../config/idnty-assessment-env';
import type { BldrAssessmentStateConfig } from '../../config/bldr-assessment';
import { BldrBuildClassIcon } from '../bldr/BldrBuildClassIcon';

type BldrAssessmentShellProps = {
  state: BldrAssessmentStateConfig;
  children?: ReactNode;
  panel?: ReactNode;
  showProcessStrip?: boolean;
  processStrip?: ReactNode;
};

function BldrAssessmentMobileBackground() {
  const assetUrl = resolveSite00PublicAsset(SITE00_IDNTY_ASSESSMENT_MOBILE_BG);
  return (
    <div
      className="site00-idnty-assessment-mobile-bg"
      aria-hidden="true"
      style={{ backgroundImage: `url("${assetUrl.replace(/"/g, '\\"')}")` }}
    />
  );
}

function BldrIntroPanel({ state }: { state: BldrAssessmentStateConfig }) {
  return (
    <aside className="site00-idnty-assessment__intro" aria-label="Build class overview">
      <div className="site00-idnty-assessment__intro-inner">
        <div className="site00-idnty-assessment__icon">
          <BldrBuildClassIcon id={state.iconId} title={state.title} />
        </div>
        <p className="site00-idnty-assessment__marker">{state.stageMarker}</p>
        <h1 className="site00-idnty-assessment__title">{state.title}</h1>
        <p className="site00-idnty-assessment__declaration">{state.declaration}</p>
        <hr className="site00-idnty-assessment__rule" aria-hidden="true" />
        <p className="site00-idnty-assessment__body">{state.editorialBody}</p>
        {state.editorialCta ? (
          <p className="site00-idnty-assessment__cta-text">{state.editorialCta}</p>
        ) : null}
      </div>
    </aside>
  );
}

function BldrMobileHero({ state }: { state: BldrAssessmentStateConfig }) {
  return (
    <header className="site00-idnty-assessment__mobile-hero">
      <div className="site00-idnty-assessment__icon site00-idnty-assessment__icon--mobile">
        <BldrBuildClassIcon id={state.iconId} title={state.title} />
      </div>
      <p className="site00-idnty-assessment__marker">{state.stageMarker}</p>
      <h1 className="site00-idnty-assessment__title">{state.title}</h1>
      <p className="site00-idnty-assessment__declaration">{state.declaration}</p>
      <p className="site00-idnty-assessment__body">{state.editorialBody}</p>
      {state.editorialCta ? (
        <p className="site00-idnty-assessment__cta-text">{state.editorialCta}</p>
      ) : null}
    </header>
  );
}

export function BldrAssessmentBreadcrumb({ label }: { label: string }) {
  return (
    <nav className="site00-idnty-assessment__breadcrumb" aria-label="Breadcrumb">
      {label}
    </nav>
  );
}

export function BldrAssessmentShell({
  state,
  children,
  panel,
  showProcessStrip = true,
  processStrip,
}: BldrAssessmentShellProps) {
  const isDesktopArtboard = useSite00DesktopArtboardPreview();

  if (!isDesktopArtboard) {
    return (
      <div className="site00-idnty-assessment site00-idnty-assessment--mobile">
        <BldrAssessmentMobileBackground />
        <Site00MobileShell activeNav="build" showEnvironmentBackground={false} shellClassName="site00-idnty-assessment-mobile-shell">
          <div className="site00-idnty-assessment__mobile-content">
            <BldrAssessmentBreadcrumb label={state.breadcrumb} />
            <BldrMobileHero state={state} />
            {panel ? <div className="site00-idnty-assessment__panel">{panel}</div> : null}
            {children}
            {showProcessStrip && processStrip ? (
              <div className="site00-idnty-assessment__process-mobile">{processStrip}</div>
            ) : null}
            <Site00PageFooter />
          </div>
        </Site00MobileShell>
      </div>
    );
  }

  return (
    <EnvironmentShell environmentId="IDNTY_ASSESSMENT_ENVIRONMENT" className="site00-idnty-assessment site00-idnty-assessment--desktop">
      <Site00AppShell locationLabel={state.breadcrumb.split(' / ').slice(0, 2).join(' / ')}>
        <div className="site00-idnty-assessment__desktop-layout">
          <BldrAssessmentBreadcrumb label={state.breadcrumb} />
          <div className="site00-idnty-assessment__split">
            <BldrIntroPanel state={state} />
            <div className="site00-idnty-assessment__panel site00-idnty-assessment__panel--desktop">
              {panel ?? children}
            </div>
          </div>
          {!panel ? children : null}
          {showProcessStrip && processStrip ? (
            <div className="site00-idnty-assessment__process">{processStrip}</div>
          ) : null}
          <Site00PageFooter />
        </div>
      </Site00AppShell>
      <Site00OriginLayoutSwitch />
    </EnvironmentShell>
  );
}

export function BldrAssessmentActions({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  secondaryHref,
  primaryDisabled,
}: {
  primaryLabel: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  secondaryHref?: string;
  primaryDisabled?: boolean;
}) {
  return (
    <div className="site00-idnty-assessment__actions">
      <button type="button" className="site00-idnty-assessment__btn-primary" onClick={onPrimary} disabled={primaryDisabled}>
        {primaryLabel}
      </button>
      {secondaryLabel ? (
        secondaryHref ? (
          <Link to={secondaryHref} className="site00-idnty-assessment__btn-secondary">
            {secondaryLabel}
          </Link>
        ) : (
          <button type="button" className="site00-idnty-assessment__btn-secondary" onClick={onSecondary}>
            {secondaryLabel}
          </button>
        )
      ) : null}
    </div>
  );
}
