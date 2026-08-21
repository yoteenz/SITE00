/**
 * SITE 00 Admin — canonical Identity + Builder Intake detail.
 * Conservative actions only (MARK IN REVIEW / ARCHIVE / OPEN PROJECT) — never rewrites what the
 * client submitted (see api/_lib/site00Intakes/intakeService.ts applyAdminIntakeAction).
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { AdminStatusBadge } from '../../components/operations/AdminStatusBadge';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { site00AdminIntakesApi } from '../../services/intakesApi';
import { isIntakeType } from '../../../../../shared/site00-intakes/types';
import type { IntakeAuditEvent, IntakeDetail, IntakeType } from '../../../../../shared/site00-intakes/types';
import type { BrandLoreProfile } from '../../../../../shared/site00-brand-lore/types';
import { BrandIntelligencePanel } from '../../components/operations/BrandIntelligencePanel';

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

export default function IntakeDetailPage() {
  const { intakeType: rawType, intakeId = '' } = useParams<{ intakeType: string; intakeId: string }>();
  const navigate = useNavigate();
  const intakeType: IntakeType | null = isIntakeType(rawType?.toUpperCase()) ? (rawType!.toUpperCase() as IntakeType) : null;

  const [intake, setIntake] = useState<IntakeDetail | null>(null);
  const [brandLore, setBrandLore] = useState<BrandLoreProfile | null>(null);
  const [events, setEvents] = useState<IntakeAuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmingField, setConfirmingField] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const load = () => {
    if (!intakeType || !intakeId) return;
    setLoading(true);
    site00AdminIntakesApi
      .detail(intakeType, intakeId)
      .then((data) => {
        setIntake(data.intake);
        setBrandLore((data as { brandLore?: BrandLoreProfile | null }).brandLore ?? null);
        setEvents(data.events ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD INTAKE'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [intakeType, intakeId]);

  const handleMarkInReview = () => {
    if (!intakeType) return;
    setActionLoading('review');
    site00AdminIntakesApi
      .markInReview(intakeType, intakeId)
      .then(load)
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO MARK IN REVIEW'))
      .finally(() => setActionLoading(null));
  };

  const handleArchive = () => {
    if (!intakeType) return;
    setActionLoading('archive');
    site00AdminIntakesApi
      .archive(intakeType, intakeId)
      .then(load)
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO ARCHIVE'))
      .finally(() => setActionLoading(null));
  };

  const handleConfirmLoreField = (fieldKey: keyof BrandLoreProfile) => {
    setConfirmError(null);
    setConfirmingField(String(fieldKey));
    site00AdminIntakesApi
      .confirmLoreField(intakeId, String(fieldKey))
      .then((data) => setBrandLore(data.brandLore))
      .catch((e) => setConfirmError(e instanceof Error ? e.message : 'CONFIRMATION FAILED — NOT PERSISTED'))
      .finally(() => setConfirmingField(null));
  };

  if (!intakeType) {
    return (
      <Site00AdminShell>
        <p className="site00-admin-panel site00-admin-panel--error">INVALID INTAKE TYPE.</p>
      </Site00AdminShell>
    );
  }

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <Link className="site00-admin-link-cta" to={SITE00_ADMIN_ROUTES.intakes}>
            ← BACK TO INTAKES
          </Link>
          <h1 className="site00-admin-page-title">
            {loading ? '[ INTAKE ]' : `[ ${intake?.publicReference ?? 'INTAKE'} ]`}
          </h1>
        </div>
        {intake ? (
          <div className="site00-admin-period">
            <button type="button" disabled={actionLoading !== null} onClick={handleMarkInReview}>
              {actionLoading === 'review' ? 'MARKING…' : 'MARK IN REVIEW'}
            </button>
            <button type="button" disabled={actionLoading !== null} onClick={handleArchive}>
              {actionLoading === 'archive' ? 'ARCHIVING…' : 'ARCHIVE'}
            </button>
            {intake.projectId ? (
              <button type="button" onClick={() => navigate(SITE00_ADMIN_ROUTES.project(intake.projectId!))}>
                OPEN PROJECT
              </button>
            ) : null}
          </div>
        ) : null}
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      {loading ? (
        <div className="site00-admin-skeleton-grid" aria-busy="true" aria-label="LOADING INTAKE" />
      ) : intake ? (
        <div className="site00-admin-dashboard-grid">
          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">INTAKE SUMMARY</h2>
            <dl className="site00-admin-dl">
              <dt>REFERENCE</dt>
              <dd>{intake.publicReference}</dd>
              <dt>TYPE</dt>
              <dd>{intake.intakeType}</dd>
              <dt>STATUS</dt>
              <dd>
                <AdminStatusBadge status={intake.status} />
              </dd>
              <dt>OWNER</dt>
              <dd>{intake.ownerKind === 'GUEST' ? 'GUEST' : 'SIGNED-IN CLIENT'}</dd>
              <dt>EMAIL</dt>
              <dd>{intake.email ?? '—'}</dd>
              <dt>VERIFIED EMAIL</dt>
              <dd>{formatDateTime(intake.verifiedEmailAt)}</dd>
              <dt>CREATED</dt>
              <dd>{formatDateTime(intake.createdAt)}</dd>
              <dt>LAST SAVED</dt>
              <dd>{formatDateTime(intake.lastSavedAt)}</dd>
              <dt>SUBMITTED</dt>
              <dd>{formatDateTime(intake.submittedAt)}</dd>
              <dt>CLAIMED</dt>
              <dd>{formatDateTime(intake.claimedAt)}</dd>
              <dt>SOURCE</dt>
              <dd>{intake.source}{intake.sourceRoute ? ` · ${intake.sourceRoute}` : ''}</dd>
              {intake.projectId ? (
                <>
                  <dt>PROJECT</dt>
                  <dd>
                    <Link to={SITE00_ADMIN_ROUTES.project(intake.projectId)}>OPEN PROJECT →</Link>
                  </dd>
                </>
              ) : null}
            </dl>
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">BRAND INTELLIGENCE</h2>
            {confirmError ? <p className="site00-admin-panel site00-admin-panel--error">{confirmError}</p> : null}
            <BrandIntelligencePanel
              profile={brandLore}
              rawLoreAnswers={
                (intake.draftPayload as Record<string, unknown>)?.loreAnswers as
                  | Record<string, string | string[]>
                  | undefined
              }
              onConfirmField={intakeType === 'IDENTITY' ? handleConfirmLoreField : undefined}
              confirmingField={confirmingField}
            />
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">DRAFT ANSWERS</h2>
            {intake.draftPayload && Object.keys(intake.draftPayload).length > 0 ? (
              <pre className="site00-admin-code">{JSON.stringify(intake.draftPayload, null, 2)}</pre>
            ) : (
              <p className="site00-admin-empty">NO DRAFT ANSWERS RECORDED.</p>
            )}
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">SUBMITTED SNAPSHOT</h2>
            {intake.submittedPayload ? (
              <pre className="site00-admin-code">{JSON.stringify(intake.submittedPayload, null, 2)}</pre>
            ) : (
              <p className="site00-admin-empty">NOT YET SUBMITTED — IMMUTABLE SNAPSHOT WILL APPEAR HERE ON SUBMIT.</p>
            )}
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">AUDIT TIMELINE</h2>
            {events.length > 0 ? (
              <ul className="site00-admin-activity-list">
                {events.map((event) => (
                  <li key={event.id} className="site00-admin-activity-list__item">
                    <p className="site00-admin-activity-list__summary">
                      {event.eventType.replace(/_/g, ' ')}
                      {event.actor ? ` · ${event.actor}` : ''}
                    </p>
                    <time dateTime={event.createdAt}>{formatDateTime(event.createdAt)}</time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="site00-admin-empty">NO AUDIT EVENTS RECORDED.</p>
            )}
          </section>
        </div>
      ) : (
        <p className="site00-admin-empty">INTAKE NOT FOUND.</p>
      )}
    </Site00AdminShell>
  );
}
