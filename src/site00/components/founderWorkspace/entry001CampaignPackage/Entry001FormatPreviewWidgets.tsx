/**
 * B5.5 — Format-native social preview widgets.
 */

import { useCallback, useState } from 'react';
import type {
  Entry001DeliverableRecord,
  Entry001FormatFamily,
  Entry001FormatPreview,
  Entry001FormatPreviewSlot,
} from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';

type PreviewProps = {
  preview: Entry001FormatPreview;
  compact?: boolean;
};

function MediaSlot({ slot }: { slot: Entry001FormatPreviewSlot }) {
  const d = slot.deliverable;
  if (slot.placeholder || !d?.filePath) {
    return (
      <div className="site00-e001-preview__placeholder">
        <span>{slot.placeholderLabel ?? slot.label}</span>
      </div>
    );
  }
  if (d.format === 'VIDEO') {
    return <video src={d.filePath} controls className="site00-e001-preview__media" />;
  }
  return <img src={d.filePath} alt={d.title} className="site00-e001-preview__media" />;
}

export function Entry001ReelPreview({ preview, compact }: PreviewProps) {
  const cover = preview.slots.find((s) => s.slotId === 'reel-cover');
  const video = preview.slots.find((s) => s.slotId === 'final-reel');
  const videoDeliverable = video?.deliverable;
  const roughCut = preview.slots.find(
    (s) => s.deliverable?.format === 'VIDEO' && s.slotId !== 'final-reel',
  );

  return (
    <div className={`site00-e001-preview site00-e001-preview--reel${compact ? ' site00-e001-preview--compact' : ''}`}>
      <div className="site00-e001-preview__reel-frame">
        {cover && (
          <div className="site00-e001-preview__reel-cover">
            <MediaSlot slot={cover} />
          </div>
        )}
        <div className="site00-e001-preview__reel-video">
          {videoDeliverable?.filePath ? (
            <video src={videoDeliverable.filePath} controls className="site00-e001-preview__media" />
          ) : roughCut?.deliverable?.filePath ? (
            <video src={roughCut.deliverable.filePath} controls className="site00-e001-preview__media" />
          ) : (
            <div className="site00-e001-preview__placeholder">
              <span>VIDEO AREA — FINAL REEL PENDING</span>
            </div>
          )}
        </div>
        {preview.caption && <p className="site00-e001-preview__caption">{preview.caption}</p>}
        <span className="site00-e001-preview__status">{preview.status.replace(/_/g, ' ')}</span>
      </div>
    </div>
  );
}

export function Entry001CarouselPreview({ preview, compact }: PreviewProps) {
  const slides = preview.slots.filter((s) => s.deliverable || s.placeholder);
  const [index, setIndex] = useState(0);
  const current = slides[index] ?? slides[0];
  const total = slides.length || 1;

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIndex((i) => Math.min(total - 1, i + 1)), [total]);

  if (!current) {
    return (
      <div className="site00-e001-preview site00-e001-preview--carousel">
        <div className="site00-e001-preview__placeholder">CAROUSEL PENDING</div>
      </div>
    );
  }

  return (
    <div className={`site00-e001-preview site00-e001-preview--carousel${compact ? ' site00-e001-preview--compact' : ''}`}>
      <div className="site00-e001-preview__carousel-stage">
        <MediaSlot slot={current} />
      </div>
      <div className="site00-e001-preview__carousel-controls">
        <button type="button" onClick={prev} disabled={index === 0}>
          PREVIOUS
        </button>
        <span>
          {index + 1} / {total}
        </span>
        <button type="button" onClick={next} disabled={index >= total - 1}>
          NEXT
        </button>
      </div>
    </div>
  );
}

export function Entry001StoryPreview({ preview, compact }: PreviewProps) {
  const frames = preview.slots;
  const [index, setIndex] = useState(0);
  const current = frames[index] ?? frames[0];
  const total = frames.length || 1;

  return (
    <div className={`site00-e001-preview site00-e001-preview--story${compact ? ' site00-e001-preview--compact' : ''}`}>
      <div className="site00-e001-preview__story-progress">
        {frames.map((_, i) => (
          <span key={i} className={i <= index ? 'is-filled' : undefined} />
        ))}
      </div>
      <div className="site00-e001-preview__story-frame">
        {current ? <MediaSlot slot={current} /> : <div className="site00-e001-preview__placeholder">STORY PENDING</div>}
      </div>
      <div className="site00-e001-preview__story-tap">
        <button type="button" aria-label="Previous frame" onClick={() => setIndex((i) => Math.max(0, i - 1))} />
        <button
          type="button"
          aria-label="Next frame"
          onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
        />
      </div>
    </div>
  );
}

export function Entry001TikTokPreview({ preview, compact }: PreviewProps) {
  const video = preview.slots[0];
  return (
    <div className={`site00-e001-preview site00-e001-preview--tiktok${compact ? ' site00-e001-preview--compact' : ''}`}>
      <div className="site00-e001-preview__tiktok-video">
        {video ? <MediaSlot slot={video} /> : <div className="site00-e001-preview__placeholder">TIKTOK PENDING</div>}
      </div>
      <div className="site00-e001-preview__tiktok-meta">
        <span className="site00-e001-preview__tiktok-creator">@site00</span>
        <p>{preview.caption ?? 'Caption pending'}</p>
        {video?.deliverable?.lineage?.sourceAssetIds?.length ? (
          <span className="site00-e001-preview__lineage">DERIVED FROM FINAL REEL</span>
        ) : null}
      </div>
    </div>
  );
}

export function Entry001XPreview({ preview, compact }: PreviewProps) {
  const copySlot = preview.slots.find((s) => s.slotId === 'x-copy');
  const mediaSlot = preview.slots.find((s) => s.slotId === 'x-media');
  const copy =
    copySlot?.deliverable?.caption ??
    copySlot?.deliverable?.description ??
    preview.copyText ??
    null;

  return (
    <div className={`site00-e001-preview site00-e001-preview--x${compact ? ' site00-e001-preview--compact' : ''}`}>
      <div className="site00-e001-preview__x-header">
        <span className="site00-e001-preview__x-avatar" />
        <span>SITE 00</span>
        <span className="site00-e001-preview__x-handle">@site00</span>
      </div>
      <p className="site00-e001-preview__x-copy">
        {copy ?? <span className="site00-e001-preview__copy-placeholder">Post copy placeholder — edit in workspace</span>}
      </p>
      {mediaSlot && (
        <div className="site00-e001-preview__x-media">
          <MediaSlot slot={mediaSlot} />
        </div>
      )}
    </div>
  );
}

export function Entry001HighlightPreview({ preview, compact }: PreviewProps) {
  const icon = preview.slots[0];
  const label = icon?.deliverable?.title ?? 'ENTRY 001';

  return (
    <div className={`site00-e001-preview site00-e001-preview--highlight${compact ? ' site00-e001-preview--compact' : ''}`}>
      <div className="site00-e001-preview__highlight-ring">
        {icon?.deliverable?.filePath ? (
          <img src={icon.deliverable.filePath} alt={label} />
        ) : (
          <div className="site00-e001-preview__placeholder">ICON PENDING</div>
        )}
      </div>
      <p className="site00-e001-preview__highlight-label">ENTRY 001 / {label}</p>
    </div>
  );
}

export function Entry001FormatPreviewWidget({ preview, compact }: PreviewProps) {
  switch (preview.formatFamily) {
    case 'REEL':
      return <Entry001ReelPreview preview={preview} compact={compact} />;
    case 'CAROUSEL':
      return <Entry001CarouselPreview preview={preview} compact={compact} />;
    case 'STORY':
      return <Entry001StoryPreview preview={preview} compact={compact} />;
    case 'TIKTOK':
      return <Entry001TikTokPreview preview={preview} compact={compact} />;
    case 'X':
      return <Entry001XPreview preview={preview} compact={compact} />;
    case 'HIGHLIGHT':
      return <Entry001HighlightPreview preview={preview} compact={compact} />;
    default:
      return <div className="site00-e001-preview__placeholder">{preview.label} — preview pending</div>;
  }
}

export function LineageBadge({ deliverable }: { deliverable: Entry001DeliverableRecord | null }) {
  if (!deliverable?.lineage?.sourceAssetIds?.length) return null;
  return (
    <span className="site00-e001-preview__lineage">
      DERIVED FROM {deliverable.lineage.sourceEntryId ?? 'ARCHIVE'}
    </span>
  );
}

export function formatFamilyToPreviewComponent(family: Entry001FormatFamily) {
  return family;
}
