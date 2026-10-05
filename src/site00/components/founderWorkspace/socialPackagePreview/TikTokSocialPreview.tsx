/**
 * B5.8 — TikTok platform-native preview (distinct from Reel).
 */

import { Link } from 'react-router-dom';
import type { SocialFormatPreviewModel } from './types.js';
import { PreviewMediaSlot } from './PreviewMediaSlot.js';
import { formatStatusLabel } from './buildSocialPreviewModel.js';

type Props = {
  format: SocialFormatPreviewModel;
  accountHandle: string;
  editHref?: string;
  variant?: 'desktop' | 'mobile';
};

export function TikTokSocialPreview({ format, accountHandle, editHref, variant = 'desktop' }: Props) {
  const video = format.slots.find((s) => s.slotId === 'tiktok-video') ?? format.slots[0];

  return (
    <div className={`site00-spp-tiktok site00-spp-tiktok--${variant}`}>
      <div className="site00-spp-tiktok__stage">
        {video ? (
          <PreviewMediaSlot slot={video} formatFamily="TIKTOK" fill />
        ) : (
          <PreviewMediaSlot
            slot={{
              slotId: 'empty',
              label: 'VIDEO',
              sequenceNumber: null,
              filePath: null,
              mediaType: 'NONE',
              title: 'TikTok',
              placeholder: true,
              placeholderLabel: 'Add Video',
              deliverableId: null,
              assetRole: null,
              assetType: null,
              approvalState: null,
              dimensions: null,
              source: null,
              version: null,
              notes: null,
            }}
            formatFamily="TIKTOK"
            fill
          />
        )}
        <div className="site00-spp-tiktok__rail" aria-hidden>
          <span>+</span>
          <span>♡</span>
          <span>💬</span>
          <span>★</span>
          <span>↗</span>
        </div>
        <div className="site00-spp-tiktok__meta">
          <strong>@{accountHandle}</strong>
          <p>{format.caption ?? format.copyText ?? 'Caption pending'}</p>
          <span className="site00-spp-tiktok__sound">♫ original sound — @{accountHandle}</span>
        </div>
      </div>

      {variant === 'mobile' && (
        <footer className="site00-spp-format-footer">
          <span className={`site00-spp-chip site00-spp-chip--${format.status.toLowerCase()}`}>
            {formatStatusLabel(format.status)}
          </span>
          {editHref && (
            <Link to={editHref} className="site00-spp-btn site00-spp-btn--primary">
              {video && !video.placeholder ? 'EDIT VIDEO' : 'ADD VIDEO'}
            </Link>
          )}
        </footer>
      )}
    </div>
  );
}
