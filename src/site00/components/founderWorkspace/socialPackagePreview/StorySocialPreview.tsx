/**
 * B5.8 — Story platform-native preview.
 */

import { Link } from 'react-router-dom';
import type { SocialFormatPreviewModel } from './types.js';
import { PreviewMediaSlot } from './PreviewMediaSlot.js';
import { formatStatusLabel } from './buildSocialPreviewModel.js';

type Props = {
  format: SocialFormatPreviewModel;
  accountHandle: string;
  selectedIndex: number;
  onPrev: () => void;
  onNext: () => void;
  editHref?: string;
  variant?: 'desktop' | 'mobile';
};

export function StorySocialPreview({
  format,
  accountHandle,
  selectedIndex,
  onPrev,
  onNext,
  editHref,
  variant = 'desktop',
}: Props) {
  const frames = format.slots;
  const total = frames.length || 1;
  const idx = Math.min(selectedIndex, total - 1);
  const current = frames[idx] ?? frames[0];

  return (
    <div className={`site00-spp-story site00-spp-story--${variant}`}>
      <div className="site00-spp-story__frame">
        <div className="site00-spp-story__progress">
          {frames.map((_, i) => (
            <span key={i} className={i <= idx ? 'is-filled' : undefined} />
          ))}
        </div>
        <header className="site00-spp-story__head">
          <span className="site00-spp-story__avatar" aria-hidden />
          <strong>{accountHandle}</strong>
          <span>2h</span>
        </header>
        <div className="site00-spp-story__media" onClick={onNext} onKeyDown={(e) => e.key === 'Enter' && onNext()} role="button" tabIndex={0}>
          {current ? (
            <PreviewMediaSlot slot={current} formatFamily="STORY" fill />
          ) : (
            <PreviewMediaSlot
              slot={{
                slotId: 'empty',
                label: 'FRAME',
                sequenceNumber: 1,
                filePath: null,
                mediaType: 'NONE',
                title: 'Frame',
                placeholder: true,
                placeholderLabel: 'Add Story Frame',
                deliverableId: null,
                assetRole: null,
                assetType: null,
                approvalState: null,
                dimensions: null,
                source: null,
                version: null,
                notes: null,
              }}
              formatFamily="STORY"
              fill
            />
          )}
        </div>
        <div className="site00-spp-story__reply">
          <span>Send message...</span>
        </div>
        <div className="site00-spp-story__tap">
          <button type="button" aria-label="Previous frame" onClick={onPrev} />
          <button type="button" aria-label="Next frame" onClick={onNext} />
        </div>
      </div>

      {variant === 'mobile' && (
        <footer className="site00-spp-format-footer">
          <span className={`site00-spp-chip site00-spp-chip--${format.status.toLowerCase()}`}>
            {formatStatusLabel(format.status)} · {total} frame{total === 1 ? '' : 's'}
          </span>
          {editHref && (
            <Link to={editHref} className="site00-spp-btn site00-spp-btn--primary">
              EDIT STORY
            </Link>
          )}
        </footer>
      )}
    </div>
  );
}
