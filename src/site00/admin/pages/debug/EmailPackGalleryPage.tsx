import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resolveCompositionContract } from '@site00-email/art-direction/contracts';
import { visualFamilyForRegistryFamily } from '@site00-email/art-direction/families';
import type { FidelityStatus } from '@site00-email/art-direction/contracts';
import {
  EMAIL_TEMPLATES,
  emailPackSummary,
  filterTemplates,
} from '@site00-email/registry/templates';
import { renderEmailTemplate } from '@site00-email/render';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { useEmailDebugStatus } from '../../hooks/useEmailDebugStatus';
import type { EmailClassification, EmailDebugStatus } from '@site00-email/types';
import type { RenderedEmail } from '@site00-email/types';

type VisualFamilyFilter =
  | 'all'
  | 'ACCESS'
  | 'ONBOARDING'
  | 'PRODUCTION'
  | 'ACTION'
  | 'MILESTONE'
  | 'DELIVERY'
  | 'BILLING'
  | 'SECURITY'
  | 'RE-ENGAGEMENT'
  | 'launch-qa';

const VISUAL_FAMILY_FILTERS: Array<{ id: VisualFamilyFilter; label: string }> = [
  { id: 'all', label: 'ALL' },
  { id: 'ACCESS', label: 'ACCESS' },
  { id: 'ONBOARDING', label: 'ONBOARDING' },
  { id: 'PRODUCTION', label: 'PRODUCTION' },
  { id: 'ACTION', label: 'ACTION' },
  { id: 'MILESTONE', label: 'MILESTONE' },
  { id: 'DELIVERY', label: 'DELIVERY' },
  { id: 'BILLING', label: 'BILLING' },
  { id: 'SECURITY', label: 'SECURITY' },
  { id: 'RE-ENGAGEMENT', label: 'SIGNAL' },
  { id: 'launch-qa', label: 'QA / LAUNCH' },
];

const STATUS_FILTERS: Array<{ id: EmailDebugStatus | 'all'; label: string }> = [
  { id: 'all', label: 'ALL' },
  { id: 'needs-review', label: 'NEEDS REVIEW' },
  { id: 'approved', label: 'APPROVED' },
  { id: 'revision-needed', label: 'REVISION NEEDED' },
];

const FIDELITY_FILTERS: Array<{ id: FidelityStatus | 'all'; label: string }> = [
  { id: 'all', label: 'ALL' },
  { id: 'calibrated', label: 'CALIBRATED' },
  { id: 'in-progress', label: 'IN PROGRESS' },
  { id: 'needs-calibration', label: 'NEEDS CALIBRATION' },
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
  const [visualFamily, setVisualFamily] = useState<VisualFamilyFilter>('all');
  const [statusFilter, setStatusFilter] = useState<EmailDebugStatus | 'all'>('all');
  const [fidelityFilter, setFidelityFilter] = useState<FidelityStatus | 'all'>('all');
  const [classFilter, setClassFilter] = useState<EmailClassification | 'all'>('all');

  const resolvedStatuses = useMemo(() => {
    const map: Record<string, EmailDebugStatus> = {};
    for (const t of EMAIL_TEMPLATES) map[t.id] = getStatus(t.id, t.debugStatus);
    return map;
  }, [getStatus, statuses]);

  const summary = emailPackSummary(resolvedStatuses);

  const items = useMemo(() => {
    let filtered = filterTemplates({
      family: visualFamily === 'launch-qa' ? 'launch-qa' : 'all',
      classification: classFilter,
    });

    if (visualFamily !== 'all' && visualFamily !== 'launch-qa') {
      filtered = filtered.filter((t) => visualFamilyForRegistryFamily(t.family) === visualFamily);
    }

    return filtered.filter((t) => {
      if (statusFilter !== 'all' && resolvedStatuses[t.id] !== statusFilter) return false;
      if (fidelityFilter !== 'all') {
        const contract = resolveCompositionContract(t.id, t.family, t.archetype);
        if (contract.fidelityStatus !== fidelityFilter) return false;
      }
      return true;
    });
  }, [visualFamily, classFilter, statusFilter, fidelityFilter, resolvedStatuses]);

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="SITE 00 ◆ EMAIL SYSTEM / DEBUG"
        title="TEMPLATE REVIEW ENVIRONMENT"
        subtitle="REVIEW EVERY CLIENT COMMUNICATION BEFORE IT ENTERS PRODUCTION."
      />

      <section className="site00-email-debug-summary">
        <div><span>EMAIL PACK</span><strong>{summary.total}</strong></div>
        <div><span>NEEDS REVIEW</span><strong>{summary.needsReview}</strong></div>
        <div><span>TRANSACTIONAL</span><strong>{summary.transactional}</strong></div>
        <div><span>ACCESS</span><strong>{summary.access}</strong></div>
        <div><span>PROJECT</span><strong>{summary.project}</strong></div>
        <div><span>STUDIO</span><strong>{summary.studio}</strong></div>
        <div><span>REVIEW</span><strong>{summary.review}</strong></div>
        <div><span>BILLING</span><strong>{summary.billing}</strong></div>
        <div><span>LAUNCH</span><strong>{summary.launch}</strong></div>
        <div><span>MARKETING</span><strong>{summary.marketing + summary.signal}</strong></div>
      </section>

      <div className="site00-email-debug-filters">
        <div>
          <span className="site00-email-debug-filters__label">FAMILY</span>
          {VISUAL_FAMILY_FILTERS.map((f) => (
            <button key={f.id} type="button" className={visualFamily === f.id ? 'active' : ''} onClick={() => setVisualFamily(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <div>
          <span className="site00-email-debug-filters__label">FIDELITY</span>
          {FIDELITY_FILTERS.map((f) => (
            <button key={f.id} type="button" className={fidelityFilter === f.id ? 'active' : ''} onClick={() => setFidelityFilter(f.id)}>
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
                <p className="site00-email-debug-card__num">{String(t.num).padStart(2, '0')} / {contract.visualFamily}</p>
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
                <th>FIDELITY</th>
                <th>TRIGGER</th>
                <th>STATE</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => {
                const status = resolvedStatuses[t.id];
                const contract = resolveCompositionContract(t.id, t.family, t.archetype);
                return (
                  <tr key={t.id}>
                    <td>{String(t.num).padStart(2, '0')}</td>
                    <td><Link to={SITE00_ADMIN_ROUTES.emailTemplate(t.id)}>{t.name}</Link></td>
                    <td>{contract.visualFamily}</td>
                    <td>{contract.fidelityStatus.toUpperCase()}</td>
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
