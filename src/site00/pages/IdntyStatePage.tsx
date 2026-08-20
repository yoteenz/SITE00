import { Link, useNavigate } from 'react-router-dom';
import { EnvironmentShell } from '../components/environment/EnvironmentShell';
import { Site00AppShell } from '../components/shell/Site00AppShell';
import { Site00OriginLayoutSwitch } from '../components/shell/Site00OriginLayoutSwitch';
import { Site00MobileShell } from '../components/mobile/Site00MobileShell';
import {
  IDNTY_BRAND_STATES,
  IDNTY_INVESTMENT_TIERS,
  IDNTY_STATE_COPY,
} from '../config/identity';
import { StateCard, InvestmentColumn, WorkflowSummary } from '../components/workflow/WorkflowCards';
import { IdntyMobileDiagnostic } from '../components/idnty/mobile/IdntyMobileDiagnostic';
import { useSite00 } from '../state/Site00Context';
import { ArchitecturalPanel } from '../components/panels/ArchitecturalPanel';
import { useIdntyAssessment } from '../hooks/useIdntyAssessment';
import { brandStateToAssessmentSlug } from '../config/idnty-assessment-brand-map';
import { idntyAssessmentPath } from '../config/idnty-assessment';
import { useSite00DesktopArtboardPreview } from '../components/shell/Site00DesktopArtboardContext';
import { site00IdntyAssessmentDesktopPath } from '../config/routes';

type IdntyStatePageBodyProps = {
  isDesktopArtboard: boolean;
  selectedIdentityStateId: string | null;
  onSelectState: (stateId: string) => void;
  hasResume: boolean;
  resumeTarget: string | null;
  resumeStateLabel: string;
};

function IdntyDesktopStatePageBody({
  isDesktopArtboard,
  selectedIdentityStateId,
  onSelectState,
  hasResume,
  resumeTarget,
  resumeStateLabel,
}: IdntyStatePageBodyProps) {
  return (
    <div className="site00-state-page-layout">
      <header style={{ textAlign: 'center', marginBottom: 32 }}>
        <p className="site00-label-red" style={{ marginBottom: 8 }}>
          {IDNTY_STATE_COPY.headline}
        </p>
        <p className="site00-body site00-state-page__subhead" style={{ maxWidth: 560, margin: '0 auto' }}>
          {IDNTY_STATE_COPY.subhead}
        </p>
      </header>

      {hasResume && resumeTarget ? (
        <div className="site00-idnty-state-resume">
          <p className="site00-idnty-state-resume__label">RESUME IDNTY ASSESSMENT — {resumeStateLabel}</p>
          <Link
            to={isDesktopArtboard ? site00IdntyAssessmentDesktopPath(resumeTarget) : resumeTarget}
            className="site00-idnty-state-resume__link"
          >
            CONTINUE →
          </Link>
        </div>
      ) : null}

      <div className="site00-idnty-state-grid" role="list" aria-label="BRAND STATES">
        {IDNTY_BRAND_STATES.map((brandState) => (
          <StateCard
            key={brandState.id}
            state={brandState}
            selected={selectedIdentityStateId === brandState.id}
            onSelect={onSelectState}
          />
        ))}
      </div>

      <ArchitecturalPanel variant="workflow">
        <div style={{ padding: '24px 20px' }}>
          <p className="site00-label-red">{IDNTY_STATE_COPY.investmentHeading}</p>
          <p className="site00-label" style={{ marginBottom: 20 }}>
            {IDNTY_STATE_COPY.investmentSubhead}
          </p>
          <div className="site00-idnty-investment-grid">
            {IDNTY_INVESTMENT_TIERS.map((tier) => (
              <InvestmentColumn
                key={tier.id}
                label={tier.label}
                priceLabel={tier.priceLabel}
                items={tier.services}
              />
            ))}
          </div>
        </div>
      </ArchitecturalPanel>
    </div>
  );
}

export default function IdntyStatePage() {
  const { state, selectIdentityState } = useSite00();
  const navigate = useNavigate();
  const isDesktopArtboard = useSite00DesktopArtboardPreview();
  const { hasResume, resumeTarget, record } = useIdntyAssessment();

  const handleDesktopSelectState = (stateId: string) => {
    selectIdentityState(stateId);
    const slug = brandStateToAssessmentSlug(stateId);
    if (!slug) return;
    const path = idntyAssessmentPath(slug);
    navigate(isDesktopArtboard ? site00IdntyAssessmentDesktopPath(path) : path);
  };

  const resumeStateLabel = record.identityState?.replace(/-/g, ' ').toUpperCase() ?? '';

  if (!isDesktopArtboard) {
    return (
      <Site00MobileShell showEnvironmentBackground={false} shellClassName="site00-idnty-state-mobile-shell">
        <div className="site00-state-page site00-state-page--idnty site00-state-page--mobile">
          <IdntyMobileDiagnostic
            selectedStateId={state.selectedIdentityStateId}
            onSelectState={selectIdentityState}
            hasResume={hasResume}
            resumeTarget={resumeTarget}
            resumeStateLabel={resumeStateLabel}
          />
        </div>
      </Site00MobileShell>
    );
  }

  return (
    <EnvironmentShell environmentId="WORKFLOW_ENVIRONMENT" className="site00-state-page site00-state-page--idnty">
      <Site00AppShell locationLabel={IDNTY_STATE_COPY.locationLabel}>
        <IdntyDesktopStatePageBody
          isDesktopArtboard={isDesktopArtboard}
          selectedIdentityStateId={state.selectedIdentityStateId}
          onSelectState={handleDesktopSelectState}
          hasResume={hasResume}
          resumeTarget={resumeTarget}
          resumeStateLabel={resumeStateLabel}
        />
        <WorkflowSummary text={IDNTY_STATE_COPY.footer} />
      </Site00AppShell>
      <Site00OriginLayoutSwitch />
    </EnvironmentShell>
  );
}
