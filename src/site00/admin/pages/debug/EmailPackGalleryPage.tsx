import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  EMAIL_TEMPLATES,
  emailPackSummary,
  filterTemplates,
} from '@site00-email/registry/templates';
import { renderEmailTemplateSync } from '@site00-email/render';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { useEmailDebugStatus } from '../../hooks/useEmailDebugStatus';
import type { EmailClassification, EmailDebugStatus, EmailFamily } from '@site00-email/types';

const FAMILY_FILTERS: Array<{ id: EmailFamily | 'all' | 'launch-qa'; label: string }> = [
  { id: 'all', label: 'ALL' },
  { id: 'access', label: 'ACCESS' },
  { id: 'identity', label: 'IDENTITY' },
  { id: 'project', label: 'PROJECT' },
  { id: 'studio', label: 'STUDIO' },
  { id: 'input', label: 'INPUT' },
  { id: 'review', label: 'REVIEW' },
  { id: 'assets', label: 'ASSETS' },
  { id: 'milestone', label: 'MILESTONE' },
  { id: 'launch-qa', label: 'QA / LAUNCH' },
  { id: 'property', label: 'PROPERTY' },
  { id: 'billing', label: 'BILLING' },
  { id: 'support', label: 'SUPPORT' },
  { id: 'signal', label: 'SIGNAL' },
  { id: 'internal', label: 'INTERNAL' },
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

export default function EmailPackGalleryPage() {
  const navigate = useNavigate();
  const { statuses, getStatus } = useEmailDebugStatus();
  const [family, setFamily] = useState<EmailFamily | 'all' | 'launch-qa'>('all');
  const [statusFilter, setStatusFilter] = useState<EmailDebugStatus | 'all'>('all');
  const [classFilter, setClassFilter] = useState<EmailClassification | 'all'>('all');

  const resolvedStatuses = useMemo(() => {
    const map: Record<string, EmailDebugStatus> = {};
    for (const t of EMAIL_TEMPLATES) map[t.id] = getStatus(t.id, t.debugStatus);
    return map;
  }, [getStatus, statuses]);

  const summary = emailPackSummary(resolvedStatuses);

  const items = useMemo(() => {
    const filtered = filterTemplates({ family, classification: classFilter });
    return filtered.filter((t) => {
      if (statusFilter === 'all') return true;
      return resolvedStatuses[t.id] === statusFilter;
    });
  }, [family, classFilter, statusFilter, resolvedStatuses]);

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="SITE 00 ◆ EMAIL SYSTEM / DEBUG"
        title="TEMPLATE REVIEW ENVIRONMENT"
        subtitle="REVIEW EVERY CLIENT COMMUNICATION BEFORE IT ENTERS PRODUCTION."
      />

      <section className="site00-email-debug-summary">
        <div><span>EMAIL PACK</span><strong>{summary.total}</strong></div>
        <div><span>TOTAL TEMPLATES</span><strong>{summary.total}</strong></div>
        <div><span>TRANSACTIONAL</span><strong>{summary.transactional}</strong></div>
        <div><span>IDENTITY</span><strong>{summary.identity}</strong></div>
        <div><span>PROJECT</span><strong>{summary.project}</strong></div>
        <div><span>STUDIO</span><strong>{summary.studio}</strong></div>
        <div><span>BLDR / REVIEW</span><strong>{summary.review}</strong></div>
        <div><span>EVOLVE</span><strong>{summary.property}</strong></div>
        <div><span>ACCOUNT</span><strong>{summary.access}</strong></div>
        <div><span>BILLING</span><strong>{summary.billing}</strong></div>
        <div><span>LAUNCH</span><strong>{summary.launch}</strong></div>
        <div><span>MARKETING</span><strong>{summary.marketing + summary.signal}</strong></div>
        <div><span>NEEDS REVIEW</span><strong>{summary.needsReview}</strong></div>
      </section>

      <div className="site00-email-debug-filters">
        <div>
          <span className="site00-email-debug-filters__label">FAMILY</span>
          {FAMILY_FILTERS.map((f) => (
            <button key={f.id} type="button" className={family === f.id ? 'active' : ''} onClick={() => setFamily(f.id)}>
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
          const rendered = renderEmailTemplateSync(t.id);
          const status = resolvedStatuses[t.id];
          return (
            <article key={t.id} className="site00-email-debug-card">
              <div className="site00-email-debug-card__thumb">
                <iframe title={`Preview ${t.name}`} srcDoc={rendered.html} sandbox="" tabIndex={-1} />
              </div>
              <div className="site00-email-debug-card__body">
                <p className="site00-email-debug-card__num">{String(t.num).padStart(2, '0')} / {t.familyLabel}</p>
                <h2>{t.name}</h2>
                <p className="site00-email-debug-card__trigger">TRIGGER: {t.event}</p>
                <p className="site00-email-debug-card__subject">{rendered.subject}</p>
                <p className="site00-email-debug-card__pre">{rendered.preheader}</p>
                <p className="site00-email-debug-card__cta">CTA: {t.ctaLabel}</p>
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
                <th>SUBJECT</th>
                <th>CTA</th>
                <th>STATE</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => {
                const rendered = renderEmailTemplateSync(t.id);
                const status = resolvedStatuses[t.id];
                return (
                  <tr key={t.id}>
                    <td>{String(t.num).padStart(2, '0')}</td>
                    <td><Link to={SITE00_ADMIN_ROUTES.emailTemplate(t.id)}>{t.name}</Link></td>
                    <td>{t.familyLabel}</td>
                    <td>{t.event}</td>
                    <td>{rendered.subject}</td>
                    <td>{t.ctaLabel}</td>
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
