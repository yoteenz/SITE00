/**
 * SITE 00 — canonical client Intake surface (Identity + Builder intake persistence infra).
 * Client-safe: never exposes admin metadata, token hashes, or other clients' records — see
 * shared/site00-intakes/types.ts IntakeSummary (server strips internal-only fields before this
 * reaches the browser).
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EcosystemShell } from '../../components/ecosystem/EcosystemShell';
import { EmptyState, StatusBadge } from '../../components/pages/Site00PagePrimitives';
import { SITE00_ROUTES, site00AccountIntakeDetailPath } from '../../config/routes';
import { claimGuestIntakes, listMyIntakes } from '../../api/intakesApi';
import type { IntakeSummary } from '../../../../shared/site00-intakes/types';
import '../../styles/site00-projects.css';
import '../../styles/site00-account-intakes.css';

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

function statusTone(status: IntakeSummary['status']): 'published' | 'draft' | 'progress' | 'archived' {
  switch (status) {
    case 'SUBMITTED':
    case 'IN_REVIEW':
    case 'CONVERTED':
      return 'published';
    case 'ARCHIVED':
      return 'archived';
    case 'ACTIVE':
    case 'AWAITING_EMAIL_VERIFICATION':
      return 'progress';
    default:
      return 'draft';
  }
}

function primaryAction(intake: IntakeSummary): { label: string; href: string } {
  if (intake.status === 'SUBMITTED' || intake.status === 'IN_REVIEW' || intake.status === 'CONVERTED') {
    return { label: 'VIEW SUBMISSION →', href: site00AccountIntakeDetailPath(intake.intakeType, intake.id) };
  }
  if (intake.status === 'ARCHIVED') {
    return { label: 'VIEW →', href: site00AccountIntakeDetailPath(intake.intakeType, intake.id) };
  }
  return { label: 'CONTINUE →', href: site00AccountIntakeDetailPath(intake.intakeType, intake.id) };
}

export default function AccountIntakesPage() {
  const [intakes, setIntakes] = useState<IntakeSummary[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState('loading');
      try {
        // Guest → account claim: if this authenticated visitor has verified, unclaimed guest
        // intakes tied to their email, surface them here automatically (VIII). Failure here is
        // non-fatal — the list still loads with whatever the account already owns.
        await claimGuestIntakes().catch(() => null);
        const result = await listMyIntakes();
        if (cancelled) return;
        setIntakes(result);
        setState('ready');
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'INTAKE INDEX UNAVAILABLE');
        setState('error');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <EcosystemShell>
      <div className="site00-page site00-page--projects site00-account-intakes">
        <header className="site00-projects-header">
          <p className="site00-label-red">INTAKE INDEX</p>
          <h1 className="site00-projects-header__title">INTAKES</h1>
          <p className="site00-body site00-projects-header__sub">
            YOUR IDENTITY + BUILDER INTAKE DRAFTS AND SUBMISSIONS — CANONICAL SERVER RECORDS.
          </p>
        </header>

        {state === 'loading' ? (
          <p className="site00-body">LOADING INTAKES…</p>
        ) : state === 'error' ? (
          <EmptyState title="INTAKE INDEX UNAVAILABLE" body={error ?? 'INTAKE DATA COULD NOT BE LOADED.'} />
        ) : intakes.length === 0 ? (
          <EmptyState
            title="NO INTAKES YET"
            body="START AN IDENTITY OR BUILDER INTAKE — YOUR ANSWERS WILL SAVE HERE AUTOMATICALLY."
          />
        ) : (
          <ul className="site00-account-intakes-list">
            {intakes.map((intake) => {
              const action = primaryAction(intake);
              return (
                <li key={intake.id} className="site00-account-intakes-card">
                  <div className="site00-account-intakes-card__body">
                    <p className="site00-account-intakes-card__kicker">
                      {intake.intakeType} · {intake.publicReference}
                    </p>
                    <div className="site00-account-intakes-card__status-row">
                      <StatusBadge status={intake.status.replace(/_/g, ' ')} tone={statusTone(intake.status)} />
                      {intake.projectId ? <span className="site00-account-intakes-card__project">LINKED TO PROJECT</span> : null}
                    </div>
                    <dl className="site00-account-intakes-card__meta">
                      <div>
                        <dt>CREATED</dt>
                        <dd>{formatDate(intake.createdAt)}</dd>
                      </div>
                      <div>
                        <dt>LAST SAVED</dt>
                        <dd>{formatDate(intake.lastSavedAt)}</dd>
                      </div>
                      <div>
                        <dt>SUBMITTED</dt>
                        <dd>{formatDate(intake.submittedAt)}</dd>
                      </div>
                    </dl>
                  </div>
                  <Link to={action.href} className="site00-account-intakes-card__cta">
                    {action.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className="site00-eco-mobile-cta">
          <Link to={SITE00_ROUTES.idnty} className="site00-btn-outline site00-btn-outline--block">
            START IDENTITY →
          </Link>
        </div>
      </div>
    </EcosystemShell>
  );
}
