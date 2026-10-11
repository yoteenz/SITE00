import { useEffect, useMemo, useState } from 'react';
import { renderEmailTemplate } from '@site00-email/render';
import { getTemplateById } from '@site00-email/registry/templates';
import type { DevicePreviewMode, EmailPreviewSource } from '../../../../../shared/site00-correspondence-studio/types.js';
import { DEVICE_PREVIEW_MIN_HEIGHT, DEVICE_PREVIEW_WIDTHS, REPOSITORY_PREVIEW_WIDTHS } from '../../../../../shared/site00-correspondence-studio/devicePreview.js';
import { EmailPreviewCanvas } from '../debug/EmailPreviewCanvas';

type Props = {
  previewSource: EmailPreviewSource;
  device: DevicePreviewMode;
  subject?: string;
  preheader?: string;
  fromLabel?: string;
  toLabel?: string;
  /** Version label shown above the frame (used when two versions sit side by side). */
  versionLabel?: string;
};

export function CorrespondencePreviewPane({
  previewSource,
  device,
  subject = 'SUBJECT PREVIEW',
  preheader = '',
  fromLabel = 'SITE 00 · SENDER PENDING REGISTRATION',
  toLabel = 'RECIPIENT PREVIEW',
  versionLabel,
}: Props) {
  const width =
    previewSource.kind === 'repository_html' ? REPOSITORY_PREVIEW_WIDTHS[device] : DEVICE_PREVIEW_WIDTHS[device];
  const minHeight = DEVICE_PREVIEW_MIN_HEIGHT[device];
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const iframeSrc = useMemo(() => {
    if (previewSource.kind === 'repository_html' && previewSource.publicPreviewPath) {
      return previewSource.publicPreviewPath;
    }
    return null;
  }, [previewSource]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      if (previewSource.kind === 'site00_email_template') {
        const tpl = getTemplateById(previewSource.templateId);
        if (!tpl) {
          if (!cancelled) {
            setHtml('');
            setError('TEMPLATE NOT YET COMPOSED IN CORRESPONDENCE STUDIO.');
            setLoading(false);
          }
          return;
        }
        const rendered = await renderEmailTemplate(previewSource.templateId);
        if (!cancelled) {
          setHtml(rendered.html);
          setLoading(false);
        }
        return;
      }
      if (previewSource.kind === 'repository_html') {
        if (!iframeSrc) {
          setError('PREVIEW PATH NOT PUBLISHED. RUN sync-opus-previews.');
          setLoading(false);
          return;
        }
        setHtml('');
        setLoading(false);
        return;
      }
      setError('UNSUPPORTED PREVIEW SOURCE');
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [previewSource, iframeSrc]);

  return (
    <div className="cs-preview-pane">
      {versionLabel ? <p className="cs-preview-pane__version">{versionLabel}</p> : null}
      {previewSource.kind === 'repository_html' ? null : (
        <header className="cs-preview-pane__inbox">
          <p className="cs-preview-pane__from">{fromLabel}</p>
          <p className="cs-preview-pane__to">TO · {toLabel}</p>
          <h1 className="cs-preview-pane__subject">{subject}</h1>
          {preheader ? <p className="cs-preview-pane__pre">{preheader}</p> : null}
        </header>
      )}
      <div className="cs-preview-pane__body">
        {loading ? <p className="cs-preview-pane__loading">LOADING PREVIEW…</p> : null}
        {error ? <p className="cs-preview-pane__error">{error}</p> : null}
        {!loading && !error && iframeSrc ? (
          <iframe
            title="Correspondence email preview"
            src={iframeSrc}
            sandbox="allow-same-origin"
            className="cs-preview-pane__iframe"
            style={{ width, minHeight, border: 0 }}
          />
        ) : null}
        {!loading && !error && html ? (
          <EmailPreviewCanvas html={html} canonicalWidth={width} minHeight={minHeight} stagePadding={8} />
        ) : null}
      </div>
    </div>
  );
}
