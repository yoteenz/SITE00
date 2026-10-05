import { useEffect, useState } from 'react';
import { getTemplateManifest } from '@site00-email/art-direction/template-manifest';
import { EMAIL_TEMPLATES } from '@site00-email/registry/templates';
import { renderEmailTemplate } from '@site00-email/render';
import type { RenderedEmail } from '@site00-email/types';
import { EmailPreviewCanvas } from './EmailPreviewCanvas';

const LIFECYCLE_TEMPLATE_IDS = [
  'access-credential-issued',
  'welcome-location-assigned',
  'identity-path-received',
  'identity-input-saved',
  'identity-calibration-complete',
  'identity-review-ready',
  'identity-foundation-locked',
] as const;

type EmailLifecycleCompareGridProps = {
  activeTemplateId: string;
  previewWidth: number;
  frameHeight: number;
  stagePadding: number;
  inboxBg: string;
};

export function EmailLifecycleCompareGrid({
  activeTemplateId,
  previewWidth,
  frameHeight,
  stagePadding,
  inboxBg,
}: EmailLifecycleCompareGridProps) {
  const [rendered, setRendered] = useState<Record<string, RenderedEmail>>({});

  useEffect(() => {
    Promise.all(LIFECYCLE_TEMPLATE_IDS.map(async (id) => [id, await renderEmailTemplate(id)] as const)).then((pairs) => {
      setRendered(Object.fromEntries(pairs));
    });
  }, []);

  if (!getTemplateManifest(activeTemplateId)) return null;

  return (
    <section className="site00-email-debug-lifecycle-compare" style={{ background: inboxBg }}>
      <h3 className="site00-email-debug-lifecycle-compare__title">LIFECYCLE DIFFERENTIATION GRID</h3>
      <p className="site00-email-debug-lifecycle-compare__note">
        Side-by-side event compositions — same SITE 00 world, distinct artifacts.
      </p>
      <div className="site00-email-debug-lifecycle-compare__grid">
        {LIFECYCLE_TEMPLATE_IDS.map((id) => {
          const t = EMAIL_TEMPLATES.find((x) => x.id === id);
          const manifest = getTemplateManifest(id);
          const html = rendered[id]?.html;
          if (!t || !manifest) return null;
          return (
            <div
              key={id}
              className={`site00-email-debug-lifecycle-compare__cell${id === activeTemplateId ? ' site00-email-debug-lifecycle-compare__cell--active' : ''}`}
            >
              <p className="site00-email-debug-compare-label">{t.name}</p>
              <p className="site00-email-debug-card__meta">
                {manifest.visualMode.toUpperCase()} · {manifest.signatureArtifact}
              </p>
              {html ? (
                <EmailPreviewCanvas html={html} canonicalWidth={previewWidth} minHeight={frameHeight} stagePadding={stagePadding} />
              ) : (
                <p className="site00-control-empty" aria-busy="true">RENDERING…</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
