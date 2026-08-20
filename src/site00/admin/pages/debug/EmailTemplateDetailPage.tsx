import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { referenceCompositionLabel } from '@site00-email/archetypes';
import { resolveCompositionContract, familyImplementationStatus } from '@site00-email/art-direction/contracts';
import { renderReferenceTarget, referenceCompareLabel } from '@site00-email/art-direction/reference-render';
import { getFamilySpec } from '@site00-email/families/registry';
import { getPrimaryFamily } from '@site00-email/registry/family-map';
import { getTemplateById } from '@site00-email/registry/templates';
import { renderEmailTemplate, resolveTemplateVars } from '@site00-email/render';
import type { RenderedEmail } from '@site00-email/types';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { EmailPreviewCanvas } from '../../components/debug/EmailPreviewCanvas';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { useEmailDebugStatus } from '../../hooks/useEmailDebugStatus';
import type { EmailDebugStatus } from '@site00-email/types';

type PreviewMode = 'mobile' | 'desktop';
type InboxMode = 'light' | 'dark';
type ReviewMode = 'implementation' | 'reference' | 'compare';

const PREVIEW_WIDTHS: Record<PreviewMode, number> = {
  mobile: 375,
  desktop: 640,
};

const PREVIEW_STAGE_PADDING = 12;

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
  const contract = template ? resolveCompositionContract(template.id, template.family, template.archetype) : null;

  useEffect(() => {
    if (!template) return;
    setLoading(true);
    renderEmailTemplate(template.id)
      .then(setRendered)
      .finally(() => setLoading(false));
  }, [template]);

  const referenceHtml = useMemo(() => {
    if (!template) return '';
    return renderReferenceTarget(template.archetype, referenceCompositionLabel(template.archetype, template.id), template.id);
  }, [template]);

  if (!template || !contract) {
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
  const refLabel = referenceCompositionLabel(template.archetype, template.id);
  const familyCanon = getPrimaryFamily(template.id);
  const familySpec = getFamilySpec(familyCanon);
  const familyStatus = familyImplementationStatus(familyCanon);
  const frameHeight = previewMode === 'mobile' ? 820 : 960;

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="SITE 00 ◆ EMAIL SYSTEM / DEBUG"
        title={template.name}
        subtitle={`${String(template.num).padStart(2, '0')} / ${contract.visualFamily} · ${template.event}`}
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
              <dt>FAMILY</dt><dd>{familySpec.num} · {familySpec.label}</dd>
              <dt>METAPHOR</dt><dd>{familySpec.metaphor}</dd>
              <dt>SIGNATURE ARTIFACT</dt><dd>{familySpec.signatureArtifact}</dd>
              <dt>DOMINANT FIELD</dt><dd>{familySpec.dominantField.toUpperCase()}</dd>
              <dt>FAMILY IMPLEMENTATION</dt><dd>{familyStatus.implementation.toUpperCase()} · {familyStatus.templateCount} templates</dd>
            </dl>
          </section>

          <section className="site00-email-debug-meta-block site00-email-debug-meta-block--contract">
            <h2>COMPOSITION CONTRACT</h2>
            <dl>
              <dt>FAMILY</dt><dd>{contract.visualFamily}</dd>
              <dt>VISUAL THESIS</dt><dd>{contract.visualThesis}</dd>
              <dt>PRIMARY FOCAL</dt><dd>{contract.primaryFocal}</dd>
              <dt>DOMINANT FIELD</dt><dd>{contract.dominantField.toUpperCase()}</dd>
              <dt>DENSITY</dt><dd>{contract.density.toUpperCase()}</dd>
              <dt>SYMMETRY</dt><dd>{contract.symmetry.toUpperCase()}</dd>
              <dt>FIDELITY STATUS</dt>
              <dd className={`site00-email-debug-fidelity site00-email-debug-fidelity--${contract.fidelityStatus}`}>
                {contract.fidelityStatus.replace(/-/g, ' ').toUpperCase()}
              </dd>
              <dt>PROHIBITED</dt><dd>{contract.prohibited.join(' · ')}</dd>
            </dl>
          </section>

          <section className="site00-email-debug-meta-block">
            <h2>METADATA</h2>
            <dl>
              <dt>ID</dt><dd>{template.id}</dd>
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
              <button type="button" className={reviewMode === 'reference' ? 'active' : ''} onClick={() => setReviewMode('reference')}>REFERENCE</button>
              <button type="button" className={reviewMode === 'compare' ? 'active' : ''} onClick={() => setReviewMode('compare')}>COMPARE</button>
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
            <div className="site00-email-debug-inbox" style={{ background: inboxBg }}>
              <p className="site00-email-debug-compare-label">{referenceCompareLabel(familyCanon)}</p>
              <EmailPreviewCanvas html={referenceHtml} canonicalWidth={previewWidth} minHeight={frameHeight} stagePadding={PREVIEW_STAGE_PADDING} />
            </div>
          ) : reviewMode === 'compare' ? (
            <div className="site00-email-debug-compare" style={{ background: inboxBg }}>
              <div className="site00-email-debug-compare__panel">
                <p className="site00-email-debug-compare-label">{referenceCompareLabel(familyCanon)}</p>
                <EmailPreviewCanvas html={referenceHtml} canonicalWidth={previewWidth} minHeight={frameHeight} stagePadding={PREVIEW_STAGE_PADDING} />
              </div>
              <div className="site00-email-debug-compare__panel">
                <p className="site00-email-debug-compare-label">IMPLEMENTATION</p>
                <EmailPreviewCanvas html={rendered.html} canonicalWidth={previewWidth} minHeight={frameHeight} stagePadding={PREVIEW_STAGE_PADDING} />
              </div>
            </div>
          ) : (
            <div className="site00-email-debug-inbox" style={{ background: inboxBg }}>
              <p className="site00-email-debug-compare-label">IMPLEMENTATION</p>
              <EmailPreviewCanvas html={rendered.html} canonicalWidth={previewWidth} minHeight={frameHeight} stagePadding={PREVIEW_STAGE_PADDING} />
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
