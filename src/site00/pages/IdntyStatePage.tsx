import { Link, useNavigate } from 'react-router-dom';
import { EnvironmentShell } from '../components/environment/EnvironmentShell';
import { Site00AppShell } from '../components/shell/Site00AppShell';
import { Site00OriginLayoutSwitch } from '../components/shell/Site00OriginLayoutSwitch';
import {
  IDNTY_BRAND_STATES,
  IDNTY_INVESTMENT_TIERS,
  IDNTY_STATE_COPY,
} from '../config/identity';
import { StateCard, InvestmentColumn, WorkflowSummary } from '../components/workflow/WorkflowCards';
import { useSite00 } from '../state/Site00Context';
import { ArchitecturalPanel } from '../components/panels/ArchitecturalPanel';
import { useIdntyAssessment } from '../hooks/useIdntyAssessment';
import { brandStateToAssessmentSlug } from '../config/idnty-assessment-brand-map';
import { idntyAssessmentPath } from '../config/idnty-assessment';
import { useSite00DesktopArtboardPreview } from '../components/shell/Site00DesktopArtboardContext';
import { site00IdntyAssessmentDesktopPath } from '../config/routes';

export default function IdntyStatePage() {
  const { state, selectIdentityState } = useSite00();
  const navigate = useNavigate();
  const isDesktop = useSite00DesktopArtboardPreview();
  const { hasResume, resumeTarget, record } = useIdntyAssessment();

  const handleSelectState = (stateId: string) => {
    selectIdentityState(stateId);
    const slug = brandStateToAssessmentSlug(stateId);
    if (!slug) return;
    const path = idntyAssessmentPath(slug);
    navigate(isDesktop ? site00IdntyAssessmentDesktopPath(path) : path);
  };

  return (
    <EnvironmentShell environmentId="WORKFLOW_ENVIRONMENT" className="site00-state-page site00-state-page--idnty">
      <Site00AppShell locationLabel={IDNTY_STATE_COPY.locationLabel}>
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
              <p className="site00-idnty-state-resume__label">
                RESUME IDNTY ASSESSMENT — {record.identityState?.replace(/-/g, ' ').toUpperCase()}
              </p>
              <Link to={isDesktop ? site00IdntyAssessmentDesktopPath(resumeTarget) : resumeTarget} className="site00-idnty-state-resume__link">
                CONTINUE →
              </Link>
            </div>
          ) : null}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 40,
            }}
            role="list"
            aria-label="Brand states"
          >
            {IDNTY_BRAND_STATES.map((brandState) => (
              <StateCard
                key={brandState.id}
                state={brandState}
                selected={state.selectedIdentityStateId === brandState.id}
                onSelect={handleSelectState}
              />
            ))}
          </div>

          <ArchitecturalPanel variant="workflow">
            <div style={{ padding: '24px 20px' }}>
              <p className="site00-label-red">{IDNTY_STATE_COPY.investmentHeading}</p>
              <p className="site00-label" style={{ marginBottom: 20 }}>
                {IDNTY_STATE_COPY.investmentSubhead}
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 8,
                }}
              >
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

        <WorkflowSummary text={IDNTY_STATE_COPY.footer} />
      </Site00AppShell>
      <Site00OriginLayoutSwitch />
    </EnvironmentShell>
  );
}
