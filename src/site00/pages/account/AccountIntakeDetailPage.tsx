/**
 * SITE 00 — client-safe Identity/Builder intake detail (Identity + Builder intake persistence
 * infra). Never shows internal admin notes, service-role metadata, token hashes, or raw audit
 * payloads — the API layer (api/site00/intakes.ts) already strips those before this renders.
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EcosystemShell } from '../../components/ecosystem/EcosystemShell';
import { EmptyState, StatusBadge } from '../../components/pages/Site00PagePrimitives';
import { SITE00_ROUTES } from '../../config/routes';
import { getIntake } from '../../api/intakesApi';
import { isIntakeType } from '../../../../shared/site00-intakes/types';
import type { IntakeDetail, IntakeType } from '../../../../shared/site00-intakes/types';
import '../../styles/site00-projects.css';
import '../../styles/site00-account-intakes.css';

function formatDateTime(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function nextStepCopy(intake: IntakeDetail): string {
  switch (intake.status) {
    case 'DRAFT':
    case 'AWAITING_EMAIL_VERIFICATION':
    case 'ACTIVE':
      return 'CONTINUE ANSWERING TO SUBMIT YOUR INTAKE.';
    case 'SUBMITTED':
      return 'YOUR INTAKE HAS BEEN SUBMITTED. WE WILL REACH OUT WITH NEXT STEPS.';
    case 'IN_REVIEW':
      return 'YOUR INTAKE IS UNDER REVIEW.';
    case 'CONVERTED':
      return 'YOUR INTAKE HAS BECOME AN ACTIVE PROJECT.';
    case 'ARCHIVED':
      return 'THIS INTAKE IS ARCHIVED.';
    default:
      return '';
  }
}

export default function AccountIntakeDetailPage() {
  const { intakeType: rawType, intakeId = '' } = useParams<{ intakeType: string; intakeId: string }>();
  const intakeType: IntakeType | null = isIntakeType(rawType?.toUpperCase()) ? (rawType!.toUpperCase() as IntakeType) : null;

  const [intake, setIntake] = useState<IntakeDetail | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!intakeType || !intakeId) {
      setState('error');
      setError('INVALID INTAKE REFERENCE.');
      return;
    }
    let cancelled = false;
    setState('loading');
    getIntake({ intakeType, id: intakeId })
      .then((result) => {
        if (cancelled) return;
        setIntake(result);
        setState('ready');
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'INTAKE NOT FOUND.');
        setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [intakeType, intakeId]);

  const resumeHref = intake?.sourceRoute || (intakeType === 'IDENTITY' ? SITE00_ROUTES.idnty : SITE00_ROUTES.bldr);
  const canContinue = intake?.status === 'DRAFT' || intake?.status === 'AWAITING_EMAIL_VERIFICATION' || intake?.status === 'ACTIVE';

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-page site00-page--project-detail site00-account-intakes">
        <nav className="site00-project-command__back">
          <Link to={SITE00_ROUTES.accountIntakes}>← INTAKES</Link>
        </nav>

        {state === 'loading' ? (
          <p className="site00-body">LOADING INTAKE…</p>
        ) : state === 'error' || !intake ? (
          <EmptyState title="INTAKE NOT FOUND" body={error ?? 'THIS INTAKE IS NOT AVAILABLE TO YOU.'} />
        ) : (
          <>
            <header className="site00-project-command__header">
              <p className="site00-label-red">{intake.intakeType} INTAKE</p>
              <h1 className="site00-project-command__title">{intake.publicReference}</h1>
              <StatusBadge
                status={intake.status.replace(/_/g, ' ')}
                tone={intake.status === 'SUBMITTED' || intake.status === 'IN_REVIEW' || intake.status === 'CONVERTED' ? 'published' : 'progress'}
              />
              <p className="site00-body site00-account-intakes-detail__next-step">{nextStepCopy(intake)}</p>
            </header>

            <div className="site00-project-command__grid">
              <section className="site00-project-command__section">
                <h2 className="site00-project-command__section-title">TIMELINE</h2>
                <div className="site00-project-command__row">
                  <span className="site00-project-command__label">CREATED</span>
                  <span className="site00-project-command__value">{formatDateTime(intake.createdAt)}</span>
                </div>
                <div className="site00-project-command__row">
                  <span className="site00-project-command__label">LAST SAVED</span>
                  <span className="site00-project-command__value">{formatDateTime(intake.lastSavedAt)}</span>
                </div>
                {intake.submittedAt ? (
                  <div className="site00-project-command__row">
                    <span className="site00-project-command__label">SUBMITTED</span>
                    <span className="site00-project-command__value">{formatDateTime(intake.submittedAt)}</span>
                  </div>
                ) : null}
              </section>

              {intake.projectId ? (
                <section className="site00-project-command__section">
                  <h2 className="site00-project-command__section-title">PROJECT</h2>
                  <p className="site00-body">THIS INTAKE IS LINKED TO AN ACTIVE PROJECT.</p>
                  <Link className="site00-action-link site00-action-link--red" to={`/projects/${intake.projectId}`}>
                    VIEW PROJECT →
                  </Link>
                </section>
              ) : null}

              {intake.submittedPayload ? (
                <section className="site00-project-command__section">
                  <h2 className="site00-project-command__section-title">YOUR SUBMISSION</h2>
                  <pre className="site00-account-intakes-detail__payload">
                    {JSON.stringify(intake.submittedPayload, null, 2)}
                  </pre>
                </section>
              ) : intake.draftPayload && Object.keys(intake.draftPayload).length > 0 ? (
                <section className="site00-project-command__section">
                  <h2 className="site00-project-command__section-title">YOUR ANSWERS SO FAR</h2>
                  <pre className="site00-account-intakes-detail__payload">
                    {JSON.stringify(intake.draftPayload, null, 2)}
                  </pre>
                </section>
              ) : null}
            </div>

            {canContinue ? (
              <div className="site00-eco-mobile-cta">
                <Link to={resumeHref} className="site00-btn site00-btn--primary site00-project-command__cta">
                  CONTINUE INTAKE →
                </Link>
              </div>
            ) : null}
          </>
        )}
      </div>
    </EcosystemShell>
  );
}
