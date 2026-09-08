/**
 * B5.8 — X / Twitter copy-first preview.
 */

import { Link } from 'react-router-dom';
import type { SocialFormatPreviewModel } from './types.js';
import { PreviewMediaSlot } from './PreviewMediaSlot.js';
import { formatStatusLabel } from './buildSocialPreviewModel.js';

type Props = {
  format: SocialFormatPreviewModel;
  accountHandle: string;
  displayName: string;
  editHref?: string;
  variant?: 'desktop' | 'mobile';
};

export function XSocialPreview({ format, accountHandle, displayName, editHref, variant = 'desktop' }: Props) {
  const copy = format.copyText ?? format.caption;
  const media = format.slots.find((s) => s.slotId === 'x-media' && !s.placeholder);

  return (
    <div className={`site00-spp-x site00-spp-x--${variant}`}>
      <article className="site00-spp-x__post">
        <header>
          <span className="site00-spp-x__avatar" aria-hidden />
          <div>
            <strong>{displayName}</strong>
            <span>@{accountHandle}</span>
          </div>
        </header>
        <p className="site00-spp-x__copy">
          {copy ?? (
            <span className="site00-spp-x__copy-empty">
              Post copy pending — add copy in format workspace.
            </span>
          )}
        </p>
        {media && (
          <div className="site00-spp-x__media">
            <PreviewMediaSlot slot={media} formatFamily="X" fill />
          </div>
        )}
        <div className="site00-spp-x__engage" aria-hidden>
          <span>💬</span>
          <span>↻</span>
          <span>♡</span>
          <span>↗</span>
        </div>
        <time className="site00-spp-x__time">2:14 PM · Mar 8, 2026</time>
      </article>

      {copy && (
        <section className="site00-spp-x__reply-preview">
          <h4>REPLY PREVIEW</h4>
          <p>Thread continuation available when copy director adds reply units.</p>
        </section>
      )}

      {variant === 'mobile' && (
        <footer className="site00-spp-format-footer">
          <span className={`site00-spp-chip site00-spp-chip--${format.status.toLowerCase()}`}>
            {formatStatusLabel(format.status)}
          </span>
          {editHref && (
            <Link to={editHref} className="site00-spp-btn site00-spp-btn--primary">
              {copy ? 'EDIT POST' : 'ADD POST'}
            </Link>
          )}
        </footer>
      )}
    </div>
  );
}
