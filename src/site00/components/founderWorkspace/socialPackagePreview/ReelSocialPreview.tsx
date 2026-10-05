/**
 * B5.8 — Reel platform-native preview.
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

export function ReelSocialPreview({ format, accountHandle, editHref, variant = 'desktop' }: Props) {
  const cover = format.slots.find((s) => s.slotId === 'reel-cover');
  const finalReel = format.slots.find((s) => s.slotId === 'final-reel');
  const hasVideo = finalReel && !finalReel.placeholder;
  const hasCover = cover && !cover.placeholder;

  return (
    <div className={`site00-spp-reel site00-spp-reel--${variant}`}>
      <div className="site00-spp-reel__phone">
        <div className="site00-spp-reel__chrome-top">
          <span>Reels</span>
        </div>
        <div className="site00-spp-reel__stage">
          {hasVideo && finalReel ? (
            <PreviewMediaSlot slot={finalReel} formatFamily="REEL" fill />
          ) : hasCover && cover ? (
            <div className="site00-spp-reel__cover-stage">
              <PreviewMediaSlot slot={cover} formatFamily="REEL" fill />
              <span className="site00-spp-reel__pending-label">Final video pending</span>
            </div>
          ) : (
            <PreviewMediaSlot
              slot={finalReel ?? cover ?? format.slots[0] ?? { slotId: 'empty', label: 'REEL', sequenceNumber: null, filePath: null, mediaType: 'NONE', title: 'REEL', placeholder: true, placeholderLabel: 'Upload Reel Cover', deliverableId: null, assetRole: null, assetType: null, approvalState: null, dimensions: null, source: null, version: null, notes: null }}
              formatFamily="REEL"
              fill
            />
          )}
          <div className="site00-spp-reel__side-rail" aria-hidden>
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="site00-spp-reel__bottom">
            <strong>{accountHandle}</strong>
            <p>{format.caption ?? 'Caption pending'}</p>
            <span className="site00-spp-reel__audio">Original audio · {accountHandle}</span>
          </div>
        </div>
      </div>

      {variant === 'mobile' && (
        <footer className="site00-spp-format-footer">
          <span className={`site00-spp-chip site00-spp-chip--${format.status.toLowerCase()}`}>
            {formatStatusLabel(format.status)}
          </span>
          {editHref && (
            <Link to={editHref} className="site00-spp-btn site00-spp-btn--primary">
              {hasVideo ? 'EDIT REEL' : hasCover ? 'ADD FINAL REEL' : 'ADD ASSETS'}
            </Link>
          )}
        </footer>
      )}
    </div>
  );
}
