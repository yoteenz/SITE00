/**
 * B5.8 — Highlight / cover profile-native preview.
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

const NEIGHBOR_LABELS = ['Archive', 'Essays', 'NDX', 'Clips', 'More'];

export function HighlightSocialPreview({ format, accountHandle: _accountHandle, editHref, variant = 'desktop' }: Props) {
  const icon = format.slots[0];
  const label = icon?.title ?? 'Entry Cover';

  return (
    <div className={`site00-spp-highlight site00-spp-highlight--${variant}`}>
      <div className="site00-spp-highlight__hero">
        <div className="site00-spp-highlight__ring">
          {icon && !icon.placeholder ? (
            <PreviewMediaSlot slot={icon} formatFamily="HIGHLIGHT" fill />
          ) : (
            <PreviewMediaSlot
              slot={{
                slotId: 'empty',
                label: 'COVER',
                sequenceNumber: null,
                filePath: null,
                mediaType: 'NONE',
                title: 'Cover',
                placeholder: true,
                placeholderLabel: 'Add Cover',
                deliverableId: null,
                assetRole: null,
                assetType: null,
                approvalState: null,
                dimensions: null,
                source: null,
                version: null,
                notes: null,
              }}
              formatFamily="HIGHLIGHT"
              fill
            />
          )}
        </div>
        <p className="site00-spp-highlight__label">{label}</p>
        {editHref && variant === 'desktop' && (
          <Link to={editHref} className="site00-spp-highlight__edit">
            Edit Cover
          </Link>
        )}
      </div>

      <div className="site00-spp-highlight__profile-row" aria-label="Profile highlight context">
        {NEIGHBOR_LABELS.map((name, i) => (
          <div key={name} className={`site00-spp-highlight__neighbor${i === 2 ? ' is-active' : ''}`}>
            <span className="site00-spp-highlight__neighbor-ring" />
            <span>{name}</span>
          </div>
        ))}
      </div>

      {variant === 'mobile' && (
        <footer className="site00-spp-format-footer">
          <span className={`site00-spp-chip site00-spp-chip--${format.status.toLowerCase()}`}>
            {formatStatusLabel(format.status)}
          </span>
          {editHref && (
            <Link to={editHref} className="site00-spp-btn site00-spp-btn--primary">
              {icon && !icon.placeholder ? 'EDIT COVER' : 'ADD COVER'}
            </Link>
          )}
        </footer>
      )}
    </div>
  );
}
