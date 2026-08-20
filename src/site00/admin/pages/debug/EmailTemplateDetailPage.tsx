import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { referenceCompositionLabel } from '@site00-email/archetypes';
import { getReferenceSpec } from '@site00-email/design/reference';
import { getTemplateById } from '@site00-email/registry/templates';
import { renderEmailTemplate, resolveTemplateVars } from '@site00-email/render';
import type { RenderedEmail } from '@site00-email/types';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { useEmailDebugStatus } from '../../hooks/useEmailDebugStatus';
import type { EmailDebugStatus } from '@site00-email/types';

type PreviewMode = 'mobile' | 'desktop';
type InboxMode = 'light' | 'dark';
type ReviewMode = 'implementation' | 'reference';

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
  const [reviewMode, setReviewMode] = useState<ReviewMode>('implementation');
  const [rendered, setRendered] = useState<RenderedEmail | null>(null);
  const [loading, setLoading] = useState(true);

  const previewVars = template ? resolveTemplateVars(template.id) : null;

  useEffect(() => {
    if (!template) return;
    setLoading(true);
    renderEmailTemplate(template.id)
      .then(setRendered)
      .finally(() => setLoading(false));
  }, [template]);

  if (!template) {
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
  const refLabel = referenceCompositionLabel(template.archetype);
  const refSpec = getReferenceSpec(template.archetype);

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
          <section className="site00-email-debug-meta-block site00-email-debug-meta-block--reference">
            <h2>REFERENCE TARGET</h2>
            <p className="site00-email-debug-reference">{refLabel}</p>
            <dl>
              <dt>THEME</dt><dd>{refSpec.theme.toUpperCase()}</dd>
              <dt>HERO</dt><dd>{refSpec.heroElement}</dd>
              <dt>COMPOSITION</dt><dd>{refSpec.composition}</dd>
              <dt>COPY</dt><dd>{refSpec.copyNotes}</dd>
            </dl>
          </section>

          <section className="site00-email-debug-meta-block">
            <h2>METADATA</h2>
            <dl>
              <dt>ID</dt><dd>{template.id}</dd>
              <dt>FAMILY</dt><dd>{template.familyLabel}</dd>
              <dt>ARCHETYPE</dt><dd>{template.archetype.toUpperCase()}</dd>
              <dt>CLASSIFICATION</dt><dd>{template.classification.toUpperCase()}</dd>
              <dt>TRIGGER</dt><dd>{template.event}</dd>
              <dt>ENABLED</dt><dd>{template.enabled ? 'YES' : `NO — ${template.notes ?? 'NOT WIRED'}`}</dd>
            </dl>
          </section>

          {rendered ? (
            <section className="site00-email-debug-meta-block">
              <h2>COPY</h2>
              <dl>
                <dt>SUBJECT</dt><dd>{rendered.subject}</dd>
                <dt>PREHEADER</dt><dd>{rendered.preheader}</dd>
                <dt>HEADLINE</dt><dd>{previewVars ? template.headline(previewVars) : '—'}</dd>
                <dt>CTA</dt><dd>{template.ctaLabel}</dd>
              </dl>
            </section>
          ) : null}

          <section className="site00-email-debug-meta-block">
            <h2>REVIEW STATE</h2>
            <div className="site00-email-debug-status-actions">
              {(['needs-review', 'approved', 'revision-needed'] as EmailDebugStatus[]).map((s) => (
                <button key={s} type="button" className={status === s ? 'active' : ''} onClick={() => setStatus(template.id, s)}>
                  {s.replace(/-/g, ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </section>

          {rendered ? (
            <section className="site00-email-debug-meta-block">
              <h2>TEXT FALLBACK</h2>
              <pre className="site00-email-debug-text">{rendered.text}</pre>
            </section>
          ) : null}
        </aside>

        <div className="site00-email-debug-detail__preview site00-email-debug-detail__preview--full">
          <div className="site00-email-debug-preview-controls">
            <div>
              <span>VIEWPORT</span>
              <button type="button" className={previewMode === 'mobile' ? 'active' : ''} onClick={() => setPreviewMode('mobile')}>MOBILE · 375</button>
              <button type="button" className={previewMode === 'desktop' ? 'active' : ''} onClick={() => setPreviewMode('desktop')}>DESKTOP · 640</button>
            </div>
            <div>
              <span>REVIEW</span>
              <button type="button" className={reviewMode === 'implementation' ? 'active' : ''} onClick={() => setReviewMode('implementation')}>IMPLEMENTATION</button>
              <button type="button" className={reviewMode === 'reference' ? 'active' : ''} onClick={() => setReviewMode('reference')}>REFERENCE BRIEF</button>
            </div>
            <div>
              <span>INBOX</span>
              <button type="button" className={inboxMode === 'light' ? 'active' : ''} onClick={() => setInboxMode('light')}>LIGHT</button>
              <button type="button" className={inboxMode === 'dark' ? 'active' : ''} onClick={() => setInboxMode('dark')}>DARK</button>
            </div>
          </div>

          {loading || !rendered ? (
            <p className="site00-control-empty" aria-busy="true">RENDERING TEMPLATE…</p>
          ) : reviewMode === 'reference' ? (
            <div className="site00-email-debug-reference-panel">
              <p className="site00-email-debug-reference-panel__title">{refSpec.refId} — {refSpec.label}</p>
              <p><strong>Composition</strong><br />{refSpec.composition}</p>
              <p><strong>Approved copy</strong><br />{refSpec.copyNotes}</p>
              <p><strong>Hero element</strong><br />{refSpec.heroElement}</p>
              <p className="site00-email-debug-note">Switch to IMPLEMENTATION to compare rendered output at {previewMode} width.</p>
            </div>
          ) : (
            <div className="site00-email-debug-inbox" style={{ background: inboxBg }}>
              <div className="site00-email-debug-inbox__frame" style={{ maxWidth: previewWidth }}>
                <iframe title={`${template.name} preview`} srcDoc={rendered.html} sandbox="" style={{ width: '100%', minHeight: previewMode === 'mobile' ? 820 : 960, border: 0 }} />
              </div>
            </div>
          )}

          <p className="site00-email-debug-note site00-email-debug-note--center">
            Read-only preview — includes real QR on access templates. Does not send email.
          </p>
        </div>
      </div>
    </Site00AdminShell>
  );
}
