import { Link, useNavigate } from 'react-router-dom';
import { EnvironmentShell } from '../components/environment/EnvironmentShell';
import { Site00AppShell } from '../components/shell/Site00AppShell';
import { Site00OriginLayoutSwitch } from '../components/shell/Site00OriginLayoutSwitch';
import { BLDR_BUILD_CLASSES, BLDR_INVESTMENT_TIERS, BLDR_STATE_COPY } from '../config/builder';
import { BuildClassCard, InvestmentColumn, WorkflowSummary } from '../components/workflow/WorkflowCards';
import { useSite00 } from '../state/Site00Context';
import { ArchitecturalPanel } from '../components/panels/ArchitecturalPanel';
import { useBldrAssessment } from '../hooks/useBldrAssessment';
import { buildClassToAssessmentSlug } from '../config/bldr-assessment-brand-map';
import { bldrAssessmentPath } from '../config/bldr-assessment';
import { useSite00DesktopArtboardPreview } from '../components/shell/Site00DesktopArtboardContext';
import { site00BldrAssessmentDesktopPath } from '../config/routes';

export default function BldrStatePage() {
  const { state, selectBuildClass } = useSite00();
  const navigate = useNavigate();
  const isDesktop = useSite00DesktopArtboardPreview();
  const { hasResume, resumeTarget, record } = useBldrAssessment();

  const handleSelectClass = (classId: string) => {
    selectBuildClass(classId);
    const slug = buildClassToAssessmentSlug(classId);
    if (!slug) return;
    const path = bldrAssessmentPath(slug);
    navigate(isDesktop ? site00BldrAssessmentDesktopPath(path) : path);
  };

  return (
    <EnvironmentShell environmentId="WORKFLOW_ENVIRONMENT" className="site00-state-page site00-state-page--bldr">
      <Site00AppShell locationLabel={BLDR_STATE_COPY.locationLabel}>
        <div className="site00-state-page-layout">
          <header style={{ textAlign: 'center', marginBottom: 32 }}>
            <p className="site00-label-red" style={{ marginBottom: 8 }}>
              {BLDR_STATE_COPY.headline}
            </p>
            <p className="site00-body site00-state-page__subhead" style={{ maxWidth: 560, margin: '0 auto' }}>
              {BLDR_STATE_COPY.subhead}
            </p>
            <p className="site00-label" style={{ marginTop: 8 }}>
              {BLDR_STATE_COPY.helper}
            </p>
          </header>

          {hasResume && resumeTarget ? (
            <div className="site00-idnty-state-resume">
              <p className="site00-idnty-state-resume__label">
                RESUME YOUR BUILD — {record.buildClass?.replace(/-/g, ' ').toUpperCase()}
              </p>
              <Link to={isDesktop ? site00BldrAssessmentDesktopPath(resumeTarget) : resumeTarget} className="site00-idnty-state-resume__link">
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
            aria-label="Build classes"
          >
            {BLDR_BUILD_CLASSES.map((buildClass) => (
              <BuildClassCard
                key={buildClass.id}
                buildClassId={buildClass.id}
                code={buildClass.code}
                title={buildClass.title}
                subtitle={buildClass.subtitle}
                description={buildClass.description}
                cta={buildClass.cta}
                selected={state.selectedBuildClassId === buildClass.id}
                onSelect={() => handleSelectClass(buildClass.id)}
              />
            ))}
          </div>

          <ArchitecturalPanel variant="workflow">
            <div style={{ padding: '24px 20px' }}>
              <p className="site00-label-red">{BLDR_STATE_COPY.investmentHeading}</p>
              <p className="site00-label" style={{ marginBottom: 20 }}>
                {BLDR_STATE_COPY.investmentSubhead}
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 8,
                }}
              >
                {BLDR_INVESTMENT_TIERS.map((tier) => (
                  <InvestmentColumn
                    key={tier.id}
                    label={tier.label}
                    priceLabel={tier.priceLabel}
                    items={tier.keywords}
                  />
                ))}
              </div>
            </div>
          </ArchitecturalPanel>
        </div>

        <WorkflowSummary text={BLDR_STATE_COPY.footer} />
      </Site00AppShell>
      <Site00OriginLayoutSwitch />
    </EnvironmentShell>
  );
}
