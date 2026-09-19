/**
 * B5.8 — Format-specific empty states.
 */

import type { SocialFormatFamily } from './types.js';

type Props = {
  formatFamily: SocialFormatFamily;
  label?: string;
  compact?: boolean;
};

const EMPTY_COPY: Record<SocialFormatFamily, { title: string; action: string }> = {
  REEL: { title: 'Final Reel pending', action: 'Upload Reel Cover' },
  CAROUSEL: { title: 'No slides yet', action: 'Add Slide' },
  STORY: { title: 'No frames yet', action: 'Add Story Frame' },
  TIKTOK: { title: 'Video not started', action: 'Add Video' },
  X: { title: 'Post not started', action: 'Write Post' },
  HIGHLIGHT: { title: 'Cover not started', action: 'Add Cover' },
};

export function PlatformEmptyState({ formatFamily, label, compact }: Props) {
  const copy = EMPTY_COPY[formatFamily];
  return (
    <div className={`site00-spp-empty${compact ? ' site00-spp-empty--compact' : ''}`}>
      <div className="site00-spp-empty__frame">
        <span className="site00-spp-empty__glyph" aria-hidden />
        <p className="site00-spp-empty__title">{label ?? copy.title}</p>
        <p className="site00-spp-empty__action">{copy.action}</p>
      </div>
    </div>
  );
}
