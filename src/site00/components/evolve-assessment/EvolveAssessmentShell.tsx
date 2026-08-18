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
import type { EvolvePathAssessmentConfig } from '../../config/evolve-assessment';
import { EvolvePathIcon } from '../evolve/EvolvePathIcon';
import type { EvolvePathId } from '../../config/evolve';

type EvolveAssessmentShellProps = {
  state: EvolvePathAssessmentConfig;
  pathId: EvolvePathId;
  children?: ReactNode;
  panel?: ReactNode;
};

function EvolveAssessmentMobileBackground() {
  const assetUrl = resolveSite00PublicAsset(SITE00_IDNTY_ASSESSMENT_MOBILE_BG);
  return (
    <div
      className="site00-idnty-assessment-mobile-bg"
      aria-hidden="true"
      style={{ backgroundImage: `url("${assetUrl.replace(/"/g, '\\"')}")` }}
    />
  );
}

export function EvolveAssessmentBreadcrumb({ label }: { label: string }) {
  return (
    <nav className="site00-idnty-assessment__breadcrumb" aria-label="Breadcrumb">
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
    <div className="site00-idnty-assessment__actions">
      <button type="button" className="site00-btn-primary" onClick={onPrimary}>
        {primaryLabel}
      </button>
      {secondaryLabel && onSecondary ? (
        <button type="button" className="site00-btn-ghost" onClick={onSecondary}>
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
      <div className="site00-idnty-assessment__icon site00-idnty-assessment__icon--mobile">
        <EvolvePathIcon id={pathId} title={state.title} size={72} />
      </div>
      <p className="site00-idnty-assessment__marker">{state.stageMarker}</p>
      <h1 className="site00-idnty-assessment__title">{state.title}</h1>
      <p className="site00-idnty-assessment__declaration">{state.declaration}</p>
      <p className="site00-idnty-assessment__body">{state.editorialBody}</p>
    </>
  );

  if (!isDesktopArtboard) {
    return (
      <div className="site00-idnty-assessment site00-idnty-assessment--mobile">
        <EvolveAssessmentMobileBackground />
        <Site00MobileShell activeNav="origin" showEnvironmentBackground={false} shellClassName="site00-idnty-assessment-mobile-shell">
          <div className="site00-idnty-assessment__mobile-content">
            <EvolveAssessmentBreadcrumb label={state.breadcrumb} />
            <header className="site00-idnty-assessment__mobile-hero">{hero}</header>
            {panel ? <div className="site00-idnty-assessment__panel">{panel}</div> : null}
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
          <aside className="site00-idnty-assessment__intro" aria-label="Evolve path overview">
            <div className="site00-idnty-assessment__intro-inner">
              <div className="site00-idnty-assessment__icon">
                <EvolvePathIcon id={pathId} title={state.title} size={88} />
              </div>
              {hero}
            </div>
          </aside>
          <div className="site00-idnty-assessment__main">
            <EvolveAssessmentBreadcrumb label={state.breadcrumb} />
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
    <div className="site00-idnty-assessment__complete">
      <p className="site00-label-red">{title}</p>
      <p className="site00-body">{subtitle}</p>
      <Link to={href} className="site00-link-red">
        ENTER CTRL ROOM →
      </Link>
    </div>
  );
}
