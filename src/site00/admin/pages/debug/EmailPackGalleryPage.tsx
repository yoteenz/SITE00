import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resolveCompositionContract, familyImplementationStatus } from '@site00-email/art-direction/contracts';
import {
  EMAIL_FAMILY_CANON_LIST,
  EMAIL_FAMILY_REGISTRY,
  type EmailFamilyCanon,
} from '@site00-email/families/registry';
import { getPrimaryFamily } from '@site00-email/registry/family-map';
import {
  EMAIL_TEMPLATES,
  emailPackSummary,
} from '@site00-email/registry/templates';
import { renderEmailTemplate } from '@site00-email/render';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { useEmailDebugStatus } from '../../hooks/useEmailDebugStatus';
import type { EmailClassification, EmailDebugStatus } from '@site00-email/types';
import type { RenderedEmail } from '@site00-email/types';

type FamilyFilter = 'all' | EmailFamilyCanon;

const FAMILY_FILTERS: Array<{ id: FamilyFilter; label: string }> = [
  { id: 'all', label: 'ALL' },
  ...EMAIL_FAMILY_CANON_LIST.map((id) => ({
    id,
    label: EMAIL_FAMILY_REGISTRY[id].label.split(' / ')[0] ?? id,
  })),
];

const STATUS_FILTERS: Array<{ id: EmailDebugStatus | 'all'; label: string }> = [
  { id: 'all', label: 'ALL' },
  { id: 'needs-review', label: 'NEEDS REVIEW' },
  { id: 'approved', label: 'APPROVED' },
  { id: 'revision-needed', label: 'REVISION NEEDED' },
];

const CLASS_FILTERS: Array<{ id: EmailClassification | 'all'; label: string }> = [
  { id: 'all', label: 'ALL' },
  { id: 'transactional', label: 'TRANSACTIONAL' },
  { id: 'operational', label: 'OPERATIONAL' },
  { id: 'production', label: 'PRODUCTION' },
  { id: 'marketing', label: 'MARKETING' },
  { id: 'internal', label: 'INTERNAL' },
];

function EmailPreviewThumb({ templateId }: { templateId: string }) {
  const [rendered, setRendered] = useState<RenderedEmail | null>(null);

  useEffect(() => {
    renderEmailTemplate(templateId).then(setRendered);
  }, [templateId]);

  if (!rendered) {
    return <div className="site00-email-debug-card__thumb site00-email-debug-card__thumb--loading" aria-busy="true" />;
  }

  return (
    <div className="site00-email-debug-card__thumb">
      <iframe title={`Preview ${templateId}`} srcDoc={rendered.html} sandbox="" tabIndex={-1} />
    </div>
  );
}

export default function EmailPackGalleryPage() {
  const navigate = useNavigate();
  const { statuses, getStatus } = useEmailDebugStatus();
  const [familyFilter, setFamilyFilter] = useState<FamilyFilter>('all');
  const [statusFilter, setStatusFilter] = useState<EmailDebugStatus | 'all'>('all');
  const [classFilter, setClassFilter] = useState<EmailClassification | 'all'>('all');

  const resolvedStatuses = useMemo(() => {
    const map: Record<string, EmailDebugStatus> = {};
    for (const t of EMAIL_TEMPLATES) map[t.id] = getStatus(t.id, t.debugStatus);
    return map;
  }, [getStatus, statuses]);

  const summary = emailPackSummary(resolvedStatuses);

  const items = useMemo(() => {
    return EMAIL_TEMPLATES.filter((t) => {
      if (familyFilter !== 'all' && getPrimaryFamily(t.id) !== familyFilter) return false;
      if (classFilter !== 'all' && t.classification !== classFilter) return false;
      if (statusFilter !== 'all' && resolvedStatuses[t.id] !== statusFilter) return false;
      return true;
    });
  }, [familyFilter, classFilter, statusFilter, resolvedStatuses]);

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="SITE 00 ◆ EMAIL SYSTEM / DEBUG"
        title="TEMPLATE REVIEW ENVIRONMENT"
        subtitle="ONE SYSTEM · NINE MOODS · REVIEW BEFORE PRODUCTION."
      />

      <section className="site00-email-debug-family-index">
        {EMAIL_FAMILY_CANON_LIST.map((canon) => {
          const spec = EMAIL_FAMILY_REGISTRY[canon];
          const fs = familyImplementationStatus(canon);
          return (
            <div key={canon} className="site00-email-debug-family-index__item">
              <span>{spec.num}</span>
              <strong>{spec.label}</strong>
              <em>{fs.templateCount} templates · {fs.implementation}</em>
            </div>
          );
        })}
      </section>

      <section className="site00-email-debug-summary">
        <div><span>EMAIL PACK</span><strong>{summary.total}</strong></div>
        <div><span>NEEDS REVIEW</span><strong>{summary.needsReview}</strong></div>
        <div><span>FAMILIES</span><strong>9</strong></div>
      </section>

      <div className="site00-email-debug-filters">
        <div>
          <span className="site00-email-debug-filters__label">FAMILY</span>
          {FAMILY_FILTERS.map((f) => (
            <button key={f.id} type="button" className={familyFilter === f.id ? 'active' : ''} onClick={() => setFamilyFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <div>
          <span className="site00-email-debug-filters__label">STATUS</span>
          {STATUS_FILTERS.map((f) => (
            <button key={f.id} type="button" className={statusFilter === f.id ? 'active' : ''} onClick={() => setStatusFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <div>
          <span className="site00-email-debug-filters__label">CLASS</span>
          {CLASS_FILTERS.map((f) => (
            <button key={f.id} type="button" className={classFilter === f.id ? 'active' : ''} onClick={() => setClassFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <section className="site00-email-debug-gallery">
        {items.map((t) => {
          const status = resolvedStatuses[t.id];
          const contract = resolveCompositionContract(t.id, t.family, t.archetype);
          return (
            <article key={t.id} className="site00-email-debug-card">
              <EmailPreviewThumb templateId={t.id} />
              <div className="site00-email-debug-card__body">
                <p className="site00-email-debug-card__num">{contract.familyNum} · {contract.visualFamily.replace(/_/g, ' ')}</p>
                <h2>{t.name}</h2>
                <p className="site00-email-debug-card__trigger">TRIGGER: {t.event}</p>
                <span className={`site00-email-debug-card__fidelity site00-email-debug-card__fidelity--${contract.fidelityStatus}`}>
                  {contract.fidelityStatus.replace(/-/g, ' ').toUpperCase()}
                </span>
                <span className={`site00-email-debug-card__status site00-email-debug-card__status--${status}`}>{status.replace(/-/g, ' ').toUpperCase()}</span>
                <button type="button" className="site00-email-debug-card__link" onClick={() => navigate(SITE00_ADMIN_ROUTES.emailTemplate(t.id))}>
                  VIEW TEMPLATE →
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <section className="site00-email-debug-index">
        <h2 className="site00-email-debug-index__title">MASTER INDEX</h2>
        <div className="site00-email-debug-index__scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>TEMPLATE</th>
                <th>FAMILY</th>
                <th>TRIGGER</th>
                <th>STATE</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => {
                const status = resolvedStatuses[t.id];
                const canon = getPrimaryFamily(t.id);
                return (
                  <tr key={t.id}>
                    <td>{String(t.num).padStart(2, '0')}</td>
                    <td><Link to={SITE00_ADMIN_ROUTES.emailTemplate(t.id)}>{t.name}</Link></td>
                    <td>{EMAIL_FAMILY_REGISTRY[canon].label}</td>
                    <td>{t.event}</td>
                    <td>{status.toUpperCase()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </Site00AdminShell>
  );
}
