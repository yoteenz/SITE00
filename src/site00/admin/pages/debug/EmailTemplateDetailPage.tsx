import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTemplateById } from '@site00-email/registry/templates';
import { renderEmailTemplate, resolveTemplateVars } from '@site00-email/render';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { useEmailDebugStatus } from '../../hooks/useEmailDebugStatus';
import type { EmailDebugStatus } from '@site00-email/types';

type PreviewMode = 'mobile' | 'desktop';
type InboxMode = 'light' | 'dark';

const PREVIEW_WIDTHS: Record<PreviewMode, number> = {
  mobile: 375,
  desktop: 640,
};

export default function EmailTemplateDetailPage() {
  const { templateId = '' } = useParams();
  const template = getTemplateById(templateId);
  const { getStatus, setStatus } = useEmailDebugStatus();
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [inboxMode, setInboxMode] = useState<InboxMode>('light');

  const rendered = useMemo(() => (template ? renderEmailTemplate(template.id) : null), [template]);
  const previewVars = useMemo(() => (template ? resolveTemplateVars(template.id) : null), [template]);

  if (!template || !rendered) {
    return (
      <Site00AdminShell>
        <ControlPageHeader kicker="EMAIL SYSTEM / DEBUG" title="TEMPLATE NOT FOUND" />
        <p className="site00-control-empty">UNKNOWN TEMPLATE ID</p>
        <Link to={SITE00_ADMIN_ROUTES.emailPack}>← BACK TO GALLERY</Link>
      </Site00AdminShell>
    );
  }

  const status = getStatus(template.id, template.debugStatus);
  const previewWidth = PREVIEW_WIDTHS[previewMode];
  const inboxBg = inboxMode === 'dark' ? '#1a1a1a' : '#e8e8e8';

  const setReviewStatus = (next: EmailDebugStatus) => setStatus(template.id, next);

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="SITE 00 ◆ EMAIL SYSTEM / DEBUG"
        title={template.name}
        subtitle={`${String(template.num).padStart(2, '0')} / ${template.familyLabel} · ${template.event}`}
        actions={
          <Link className="site00-admin-btn" to={SITE00_ADMIN_ROUTES.emailPack}>
            ← GALLERY
          </Link>
        }
      />

      <div className="site00-email-debug-detail">
        <aside className="site00-email-debug-detail__meta">
          <section className="site00-email-debug-meta-block">
            <h2>METADATA</h2>
            <dl>
              <dt>FAMILY</dt><dd>{template.familyLabel}</dd>
              <dt>ARCHETYPE</dt><dd>{template.archetype.toUpperCase()}</dd>
              <dt>CLASSIFICATION</dt><dd>{template.classification.toUpperCase()}</dd>
              <dt>TRIGGER</dt><dd>{template.event}</dd>
              <dt>ENABLED</dt><dd>{template.enabled ? 'YES' : 'NO — ' + (template.notes ?? 'NOT WIRED')}</dd>
            </dl>
          </section>

          <section className="site00-email-debug-meta-block">
            <h2>COPY</h2>
            <dl>
              <dt>SUBJECT</dt><dd>{rendered.subject}</dd>
              <dt>PREHEADER</dt><dd>{rendered.preheader}</dd>
              <dt>HEADLINE</dt><dd>{previewVars ? template.headline(previewVars) : '—'}</dd>
              <dt>CTA</dt><dd>{template.ctaLabel}</dd>
            </dl>
          </section>

          <section className="site00-email-debug-meta-block">
            <h2>REVIEW STATE</h2>
            <div className="site00-email-debug-status-actions">
              {(['needs-review', 'approved', 'revision-needed'] as EmailDebugStatus[]).map((s) => (
                <button key={s} type="button" className={status === s ? 'active' : ''} onClick={() => setReviewStatus(s)}>
                  {s.replace(/-/g, ' ').toUpperCase()}
                </button>
              ))}
            </div>
            <p className="site00-email-debug-note">Debug-only — stored in localStorage, not production send state.</p>
          </section>

          <section className="site00-email-debug-meta-block">
            <h2>TEXT FALLBACK</h2>
            <pre className="site00-email-debug-text">{rendered.text}</pre>
          </section>
        </aside>

        <div className="site00-email-debug-detail__preview">
          <div className="site00-email-debug-preview-controls">
            <div>
              <span>VIEWPORT</span>
              <button type="button" className={previewMode === 'mobile' ? 'active' : ''} onClick={() => setPreviewMode('mobile')}>MOBILE · 375</button>
              <button type="button" className={previewMode === 'desktop' ? 'active' : ''} onClick={() => setPreviewMode('desktop')}>DESKTOP · 640</button>
            </div>
            <div>
              <span>INBOX</span>
              <button type="button" className={inboxMode === 'light' ? 'active' : ''} onClick={() => setInboxMode('light')}>LIGHT</button>
              <button type="button" className={inboxMode === 'dark' ? 'active' : ''} onClick={() => setInboxMode('dark')}>DARK</button>
            </div>
          </div>

          <div className="site00-email-debug-inbox" style={{ background: inboxBg }}>
            <div className="site00-email-debug-inbox__frame" style={{ maxWidth: previewWidth }}>
              <iframe title={`${template.name} preview`} srcDoc={rendered.html} sandbox="" style={{ width: '100%', minHeight: previewMode === 'mobile' ? 720 : 880, border: 0 }} />
            </div>
          </div>

          <p className="site00-email-debug-note site00-email-debug-note--center">
            Read-only preview — opening this page does not send email.
          </p>
        </div>
      </div>
    </Site00AdminShell>
  );
}
