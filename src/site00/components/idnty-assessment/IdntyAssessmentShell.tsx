import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { EnvironmentShell } from '../environment/EnvironmentShell';
import { Site00AppShell } from '../shell/Site00AppShell';
import { Site00MobileShell } from '../mobile/Site00MobileShell';
import { Site00PageFooter } from '../shell/Site00PageFooter';
import { Site00OriginLayoutSwitch } from '../shell/Site00OriginLayoutSwitch';
import { useSite00DesktopArtboardPreview } from '../shell/Site00DesktopArtboardContext';
import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';
import {
  SITE00_IDNTY_ASSESSMENT_MOBILE_BG,
} from '../../config/idnty-assessment-env';
import type { IdntyAssessmentStateConfig } from '../../config/idnty-assessment';
import { getIdentityStateProgress } from '../../config/identity-state-v2';
import { IdntyBrandStateIcon } from '../idnty/IdntyBrandStateIcon';
import type { IdntyBrandStateIconId } from '../../config/idnty-brand-state-icons';

type IdntyAssessmentShellProps = {
  state: IdntyAssessmentStateConfig;
  children?: ReactNode;
  /** Right-side functional panel content on desktop; full-width card on mobile */
  panel?: ReactNode;
  showProcessStrip?: boolean;
  processStrip?: ReactNode;
  /** Mobile diagnostic V2 — white system shell, no corridor photo background */
  mobileLayout?: 'legacy' | 'diagnostic-v2' | 'calibration';
};

function IdntyAssessmentMobileBackground() {
  const assetUrl = resolveSite00PublicAsset(SITE00_IDNTY_ASSESSMENT_MOBILE_BG);
  return (
    <div
      className="site00-idnty-assessment-mobile-bg"
      aria-hidden="true"
      style={{
        backgroundImage: `url("${assetUrl.replace(/"/g, '\\"')}")`,
      }}
    />
  );
}

function IdntyIntroPanel({ state }: { state: IdntyAssessmentStateConfig }) {
  const iconId = (state.iconId ?? state.id) as IdntyBrandStateIconId;

  return (
    <aside className="site00-idnty-assessment__intro" aria-label="IDENTITY STATE OVERVIEW">
      <div className="site00-idnty-assessment__intro-inner">
        <div className="site00-idnty-assessment__icon">
          <IdntyBrandStateIcon id={iconId} title={state.title} />
        </div>
        <p className="site00-idnty-assessment__marker">{state.stageMarker}</p>
        <h1 className="site00-idnty-assessment__title">{state.title}</h1>
        <p className="site00-idnty-assessment__declaration">{state.declaration}</p>
        <hr className="site00-idnty-assessment__rule" aria-hidden="true" />
        <p className="site00-idnty-assessment__body">{state.editorialBody}</p>
        <p className="site00-idnty-assessment__cta-text">{state.editorialCta}</p>
      </div>
    </aside>
  );
}

function IdntyMobileHero({ state }: { state: IdntyAssessmentStateConfig }) {
  const iconId = (state.iconId ?? state.id) as IdntyBrandStateIconId;

  return (
    <header className="site00-idnty-assessment__mobile-hero">
      <div className="site00-idnty-assessment__icon site00-idnty-assessment__icon--mobile">
        <IdntyBrandStateIcon id={iconId} title={state.title} />
      </div>
      <p className="site00-idnty-assessment__marker">{state.stageMarker}</p>
      <h1 className="site00-idnty-assessment__title">{state.title}</h1>
      <p className="site00-idnty-assessment__declaration">{state.declaration}</p>
      <p className="site00-idnty-assessment__body">{state.editorialBody}</p>
      <p className="site00-idnty-assessment__cta-text">{state.editorialCta}</p>
    </header>
  );
}

export function IdntyAssessmentBreadcrumb({ label }: { label: string }) {
  return (
    <nav className="site00-idnty-assessment__breadcrumb" aria-label="BREADCRUMB">
      {label}
    </nav>
  );
}

export function IdntyAssessmentShell({
  state,
  children,
  panel,
  showProcessStrip = true,
  processStrip,
  mobileLayout = 'legacy',
}: IdntyAssessmentShellProps) {
  const isDesktopArtboard = useSite00DesktopArtboardPreview();

  if (!isDesktopArtboard) {
    const isV2 = mobileLayout === 'diagnostic-v2';
    const isCalibration = mobileLayout === 'calibration';
    const mobileClass = [
      'site00-idnty-assessment',
      'site00-idnty-assessment--mobile',
      isV2 ? 'site00-idnty-assessment--v2-mobile' : '',
      isCalibration ? 'site00-idnty-assessment--calibration-mobile' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={mobileClass}>
        {!isV2 ? <IdntyAssessmentMobileBackground /> : null}
        <Site00MobileShell showEnvironmentBackground={false} shellClassName="site00-idnty-assessment-mobile-shell">
          <div className="site00-idnty-assessment__mobile-content">
            <IdntyAssessmentBreadcrumb
              label={
                isV2 || isCalibration
                  ? `${state.breadcrumb} / ${getIdentityStateProgress(state.id).code}`
                  : state.breadcrumb
              }
            />
            {isV2 || isCalibration ? (
              children
            ) : (
              <>
                <IdntyMobileHero state={state} />
                {panel ? <div className="site00-idnty-assessment__panel">{panel}</div> : null}
                {children}
                {showProcessStrip && processStrip ? (
                  <div className="site00-idnty-assessment__process-mobile">{processStrip}</div>
                ) : null}
              </>
            )}
            {!isV2 && !isCalibration ? <Site00PageFooter /> : null}
          </div>
        </Site00MobileShell>
      </div>
    );
  }

  return (
    <EnvironmentShell environmentId="IDNTY_ASSESSMENT_ENVIRONMENT" className="site00-idnty-assessment site00-idnty-assessment--desktop">
      <Site00AppShell locationLabel={state.breadcrumb.split(' / ')[0]}>
        <div className="site00-idnty-assessment__desktop-layout">
          <IdntyAssessmentBreadcrumb label={state.breadcrumb} />
          <div className="site00-idnty-assessment__split">
            <IdntyIntroPanel state={state} />
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

export function IdntyAssessmentActions({
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

export { IdntyIntroPanel, IdntyMobileHero };
