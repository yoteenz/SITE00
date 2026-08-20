import { Link, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { EmptyState } from '../components/pages/Site00PagePrimitives';
import { useSite00ProjectDetail } from '../hooks/useSite00Projects';
import { SITE00_ROUTES } from '../config/routes';
import '../styles/site00-projects.css';

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

  return (
    <EcosystemShell>
      <div className="site00-page site00-page--project-detail">
        <nav className="site00-project-command__back">
          <Link to={SITE00_ROUTES.projects}>← PROJECTS</Link>
        </nav>

        {state === 'loading' ? (
          <p className="site00-body">LOADING PROJECT…</p>
        ) : state === 'error' || !project ? (
          <EmptyState title="PROJECT NOT FOUND" body={error ?? 'NO TRUTHFUL PROJECT RECORD FOR THIS SLUG.'} />
        ) : (
          <>
            <header className="site00-project-command__header">
              <p className="site00-label-red">{project.currentSystem}</p>
              <h1 className="site00-project-command__title">{project.displayName}</h1>
              {project.internalLabel ? <p className="site00-project-command__internal">{project.internalLabel}</p> : null}
              <p className="site00-body">{project.overview.description}</p>
              {project.overview.boundaryNote ? (
                <p className="site00-project-command__boundary">{project.overview.boundaryNote}</p>
              ) : null}
            </header>

            <div className="site00-project-command__grid">
              <Section title="OVERVIEW">
                <Row label="ORGANIZATION" value={project.organizationSlug} />
                <Row label="UUID" value={project.organizationUuid} />
                <Row label="CLASSIFICATION" value={project.classification.replace(/_/g, ' ')} />
                <Row label="CURRENT PHASE" value={project.currentPhase} />
                <Row label="LIFECYCLE" value={project.overview.lifecycleStage?.replace(/_/g, ' ') ?? null} />
                <Row label="FOCUS NOW" value={project.focusNow} />
                {project.overview.importState ? <Row label="IMPORT STATE" value={project.overview.importState} /> : null}
              </Section>

              <Section title="INTELLIGENCE">
                {project.intelligence.available ? (
                  <>
                    <Row label="CANONICAL" value={String(project.intelligence.canonical)} />
                    <Row label="REFERENCE" value={String(project.intelligence.reference)} />
                    <Row label="IDEAS" value={String(project.intelligence.ideas)} />
                    <Link className="site00-action-link site00-action-link--red" to={project.intelligence.route}>
                      OPEN INTELLIGENCE →
                    </Link>
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
                <Link className="site00-action-link site00-action-link--red" to={project.evolve.route}>
                  OPEN EVOLVE →
                </Link>
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
                </Section>
              ) : null}

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
                {[...project.command.focusNow, ...project.command.needsYou, ...project.command.blocked].length ? (
                  <ul className="site00-project-command__command-list">
                    {[...project.command.focusNow, ...project.command.needsYou, ...project.command.blocked].map((item) => (
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
          </>
        )}
      </div>
    </EcosystemShell>
  );
}
