import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { NdxFounderWorkspacePage } from '../components/founderWorkspace';
import { EmptyState } from '../components/pages/Site00PagePrimitives';
import { ProjectPrivilegedUtilities } from '../components/access/ProjectPrivilegedUtilities';
import { ProjectPersonalityReplayStatus } from '../components/validation/ProjectPersonalityReplayStatus';
import { useSite00ProjectDetail } from '../hooks/useSite00Projects';
import { SITE00_ROUTES, site00ProjectCreativeAppetitePath, site00ProjectExperimentsPath, site00ProjectExperimentGPath, site00ProjectIdentityPath, site00ProjectOriginPath, site00ProjectPersonalityReplayPath } from '../config/routes';
import type { Site00FounderProjectSlug } from '../../../shared/site00-projects/types';
import '../styles/site00-projects.css';
import '../styles/site00-founder-workspace.css';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="site00-project-command__section">
      <h2 className="site00-project-command__section-title">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="site00-project-command__row">
      <span className="site00-project-command__label">{label}</span>
      <span className="site00-project-command__value">{value}</span>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { projectSlug = '' } = useParams();
  const { project, state, error } = useSite00ProjectDetail(projectSlug);

  const projectBody =
    state === 'error' || !project ? null : (
      <>
        {!hasProjectCapability(projectSlug, 'PROJECT_CORE') ? (
          <header className="site00-project-command__header">
            <p className="site00-label-red">{project.currentSystem}</p>
            <h1 className="site00-project-command__title">{project.displayName}</h1>
            {project.internalLabel ? <p className="site00-project-command__internal">{project.internalLabel}</p> : null}
            <p className="site00-body">{project.overview.description}</p>
            {project.overview.boundaryNote ? (
              <p className="site00-project-command__boundary">{project.overview.boundaryNote}</p>
            ) : null}
          </header>
        ) : (
          <>
            <p className="site00-body">{project.overview.description}</p>
            {project.overview.boundaryNote ? (
              <p className="site00-project-command__boundary">{project.overview.boundaryNote}</p>
            ) : null}
          </>
        )}

            {projectSlug === 'ndxbook' ? (
              <div className="site00-project-command__experiments-banner">
                <Link className="site00-btn site00-btn--primary site00-project-command__experiments-cta" to={site00ProjectExperimentsPath(projectSlug)}>
                  EXPERIMENTS &amp; VALIDATION HUB →
                </Link>
                <Link className="site00-btn site00-project-command__experiments-cta" to={site00ProjectExperimentGPath(projectSlug)}>
                  EXPERIMENT G — BRAND PRESENTATION CONCEPTS →
                </Link>
                <p className="site00-project-command__experiments-note">
                  All intake steps, Experiments A–G, experience expression, visual development, and content library in one place.
                  Experiment G is the corrected six brand-presentation concepts (topic-blind) — not Experiment F.
                </p>
              </div>
            ) : null}

            <div className="site00-project-command__grid">
              <Section title="OVERVIEW">
                <Row label="ORGANIZATION" value={project.organizationSlug} />
                <Row label="PROJECT TYPE" value={projectSlug === 'astral-world' ? 'WORLD' : project.classification.replace(/_/g, ' ')} />
                {projectSlug === 'astral-world' ? (
                  <>
                    <Row label="STATUS" value={project.overview.lifecycleStage ?? 'PRE_INGESTION'} />
                    <Row label="CAPABILITIES" value="PROJECT_CORE · ORIGIN · CLIENT_TRUTH · PROJECT_INTELLIGENCE" />
                    {hasProjectCapability(projectSlug, 'ORIGIN_INGESTION') ? (
                      <Link className="site00-btn site00-btn--primary site00-project-command__cta" to={site00ProjectOriginPath(projectSlug)}>
                        OPEN ORIGIN · CLIENT TRUTH →
                      </Link>
                    ) : null}
                    {hasProjectCapability(projectSlug, 'BRAND_INTELLIGENCE') ? (
                      <Link className="site00-btn site00-project-command__cta site00-project-command__cta--secondary" to={site00ProjectIdentityPath(projectSlug)}>
                        OPEN IDENTITY · EXPLORATION →
                      </Link>
                    ) : null}
                  </>
                ) : (
                  <Row label="CLASSIFICATION" value={project.classification.replace(/_/g, ' ')} />
                )}
                <Row label="CURRENT PHASE" value={project.currentPhase} />
                <Row label="LIFECYCLE" value={project.overview.lifecycleStage?.replace(/_/g, ' ') ?? null} />
                <Row label="FOCUS NOW" value={project.focusNow} />
                {project.overview.importState ? <Row label="IMPORT STATE" value={project.overview.importState} /> : null}
                {project.overview.repositoryConnection ? (
                  <Row label="REPOSITORY CONNECTION" value={project.overview.repositoryConnection} />
                ) : null}
              </Section>

              <Section title="INTELLIGENCE">
                {project.intelligence.available ? (
                  <>
                    <Row label="CANONICAL" value={String(project.intelligence.canonical)} />
                    <Row label="REFERENCE" value={String(project.intelligence.reference)} />
                    <Row label="IDEAS" value={String(project.intelligence.ideas)} />
                    <Row label="INSIGHTS" value={String(project.intelligence.insights)} />
                  </>
                ) : (
                  <p className="site00-body">NO CONTENT BRAIN ENTRIES INDEXED YET.</p>
                )}
              </Section>

              <Section title="EVOLVE">
                <Row label="MARKETING CLIENT" value={project.evolve.isMarketingClient ? 'YES' : 'NO — INFRASTRUCTURE'} />
                {project.evolve.isMarketingClient ? (
                  <>
                    <Row label="ACTIVE CAMPAIGNS" value={String(project.evolve.activeCampaigns)} />
                    <Row label="NEEDS APPROVAL" value={String(project.evolve.needsApproval)} />
                  </>
                ) : null}
                {project.evolve.isMarketingClient ? (
                  <Link className="site00-action-link site00-action-link--red" to={project.evolve.route}>
                    OPEN EVOLVE →
                  </Link>
                ) : null}
              </Section>

              {project.creativeDirection ? (
                <Section title="CREATIVE DIRECTION">
                  <Row label="LIFECYCLE" value={project.creativeDirection.lifecycleState} />
                  <Row label="FOUNDER DECISION" value={project.creativeDirection.founderDecision} />
                  <Row label="VISUAL DNA" value={project.creativeDirection.visualDnaStatus} />
                  <Row label="TERRITORIES" value={project.creativeDirection.territoriesGenerated ? 'GENERATED' : 'NOT GENERATED'} />
                  <Row label="PAGE 001 GATE" value={project.creativeDirection.page001Gate.productionEligible ? 'OPEN' : 'BLOCKED'} />
                  {!project.creativeDirection.page001Gate.productionEligible && project.creativeDirection.page001Gate.blockedReason ? (
                    <p className="site00-project-command__note">{project.creativeDirection.page001Gate.blockedReason.toUpperCase()}</p>
                  ) : null}
                  <Link className="site00-btn site00-btn--primary site00-project-command__cta" to={project.creativeDirection.route}>
                    REVIEW CREATIVE DIRECTION →
                  </Link>
                  <Link
                    className="site00-btn site00-project-command__cta site00-project-command__cta--secondary"
                    to={site00ProjectCreativeAppetitePath(projectSlug)}
                  >
                    HOW FAR CAN WE TAKE IT? →
                  </Link>
                  {projectSlug === 'ndxbook' ? (
                    <>
                      <Link
                        className="site00-btn site00-project-command__cta site00-project-command__cta--secondary"
                        to={site00ProjectPersonalityReplayPath(projectSlug)}
                      >
                        HOW YOU SHOW UP — PERSONALITY INTAKE →
                      </Link>
                      <ProjectPersonalityReplayStatus projectSlug={projectSlug} />
                    </>
                  ) : null}
                </Section>
              ) : null}

              <Section title="COMMERCIAL">
                <Row label="APPLICABILITY" value={project.commercial.applicability.replace(/_/g, ' ')} />
                <Row
                  label="PLAN"
                  value={project.commercial.plan ? `${project.commercial.plan.name} \u2014 ${project.commercial.plan.priceLabel}` : project.commercial.planStatus.replace(/_/g, ' ')}
                />
                {project.commercial.foundation ? (
                  <Row label="FOUNDATION" value={project.commercial.foundation.status.replace(/_/g, ' ')} />
                ) : null}
                {project.commercial.entitlements ? (
                  <>
                    <Row
                      label="CHANNEL CAPACITY"
                      value={project.commercial.entitlements.customScopeRequired ? 'CUSTOM SCOPE' : String(project.commercial.entitlements.channelLimit ?? '—')}
                    />
                    <Row label="ASSET CAPACITY" value={project.commercial.entitlements.assetCapacityLabel ?? 'CUSTOM SCOPE'} />
                  </>
                ) : null}
                <Row label="PAID MEDIA" value={project.commercial.paidMediaStatus.replace(/_/g, ' ')} />
                <p className="site00-project-command__note">{project.commercial.applicabilityNote}</p>
                {project.commercial.applicability === 'BILLABLE_CLIENT' ? (
                  <Link className="site00-action-link site00-action-link--red" to={project.commercial.route}>
                    VIEW EVOLVE PLANS →
                  </Link>
                ) : null}
              </Section>

              <Section title="PRODUCTION">
                <Row label="LAUNCH STATE" value={project.production.launchState} />
                <Row label="PUBLISHING" value={project.production.publishingEnabled ? 'ENABLED' : 'DISABLED'} />
                <Row label="CROSS-POSTING" value={project.production.crossPostingEnabled ? 'ENABLED' : 'DISABLED'} />
                {project.production.page001 ? (
                  <>
                    <Row label="PAGE 001 TOPIC" value={project.production.page001.topic} />
                    <Row label="CONTENT STATE" value={project.production.page001.contentState} />
                    <Row label="VISUAL APPROVAL" value={project.production.page001.visualApproval} />
                    <Row label="PUBLICATION" value={project.production.page001.publicationApproval} />
                    <Row label="DISTRIBUTION" value={project.production.page001.distribution} />
                  </>
                ) : null}
              </Section>

              <Section title="CHANNELS">
                {project.channels.length ? (
                  <ul className="site00-project-command__channels">
                    {project.channels.map((c) => (
                      <li key={c.key}>
                        {c.key} · {c.state}{c.locked ? ' · LOCKED' : ''}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="site00-body">NO CHANNELS CONFIGURED.</p>
                )}
                {project.evolve.isMarketingClient ? (
                  <Link className="site00-action-link site00-action-link--red" to={project.channelsRoute}>
                    MANAGE CONNECTIONS →
                  </Link>
                ) : null}
              </Section>

              <Section title="DECISIONS / COMMAND">
                {[...project.command.focusNow, ...project.command.needsYou, ...project.command.blocked, ...project.command.deferred].length ? (
                  <ul className="site00-project-command__command-list">
                    {[...project.command.focusNow, ...project.command.needsYou, ...project.command.blocked, ...project.command.deferred].map((item) => (
                      <li key={item.id}>
                        <span className="site00-project-command__command-cat">{item.category}</span>
                        <strong>{item.title}</strong>
                        <span>{item.reason}</span>
                        <Link to={item.route}>GO →</Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="site00-body">NO PENDING COMMAND ITEMS.</p>
                )}
              </Section>

              <Section title="ACTIVITY">
                {project.activity.length ? (
                  <ul className="site00-project-command__activity">
                    {project.activity.map((a) => (
                      <li key={a.id}>
                        <span>{a.summary}</span>
                        {a.timestamp ? <time dateTime={a.timestamp}>{a.timestamp}</time> : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="site00-body">NO INDEXED ACTIVITY YET.</p>
                )}
                {project.activityNote ? <p className="site00-project-command__note">{project.activityNote}</p> : null}
              </Section>

              <Section title="SURFACES">
                <ul className="site00-project-command__surfaces">
                  {project.surfaces.filter((s) => s.available).map((s) => (
                    <li key={s.id}>
                      <Link to={s.route}>{s.label} →</Link>
                      {s.description ? <span>{s.description}</span> : null}
                    </li>
                  ))}
                </ul>
              </Section>
            </div>

            <ProjectPrivilegedUtilities
              slug={project.slug as Site00FounderProjectSlug}
              organizationUuid={project.organizationUuid}
            />
      </>
    );

  if (projectSlug === 'ndxbook') {
    return (
      <NdxFounderWorkspacePage
        projectSlug={projectSlug}
        title={project?.displayName ?? 'NDXBOOK'}
        subtitle="PROJECT OVERVIEW"
        loading={state === 'loading'}
        loadingLabel="LOADING PROJECT…"
        error={
          state === 'error' || (!project && state !== 'loading')
            ? { title: 'PROJECT NOT FOUND', message: error ?? 'NO TRUTHFUL PROJECT RECORD FOR THIS SLUG.' }
            : null
        }
        operate={
          projectBody ? (
            <div className="site00-fws-overview-grid site00-page site00-page--project-detail">{projectBody}</div>
          ) : null
        }
      />
    );
  }

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-page site00-page--project-detail">
        <nav className="site00-project-command__back">
          <Link to={SITE00_ROUTES.projects}>← PROJECTS</Link>
        </nav>

        {state === 'loading' ? (
          <p className="site00-body">LOADING PROJECT…</p>
        ) : state === 'error' || !project ? (
          <EmptyState title="PROJECT NOT FOUND" body={error ?? 'NO TRUTHFUL PROJECT RECORD FOR THIS SLUG.'} />
        ) : (
          projectBody
        )}
      </div>
    </EcosystemShell>
  );
}
