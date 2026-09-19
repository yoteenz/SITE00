/**
 * B5.8 — Active format preview dispatcher.
 */

import type { SocialFormatFamily, SocialFormatPreviewModel } from './types.js';
import { CarouselSocialPreview } from './CarouselSocialPreview.js';
import { HighlightSocialPreview } from './HighlightSocialPreview.js';
import { ReelSocialPreview } from './ReelSocialPreview.js';
import { StorySocialPreview } from './StorySocialPreview.js';
import { TikTokSocialPreview } from './TikTokSocialPreview.js';
import { XSocialPreview } from './XSocialPreview.js';

type Props = {
  format: SocialFormatPreviewModel;
  accountHandle: string;
  displayName: string;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  editHref?: string;
  variant?: 'desktop' | 'mobile';
};

export function FormatPreviewStage({
  format,
  accountHandle,
  displayName,
  selectedIndex,
  onSelectIndex,
  onPrev,
  onNext,
  editHref,
  variant = 'desktop',
}: Props) {
  switch (format.formatFamily as SocialFormatFamily) {
    case 'REEL':
      return (
        <ReelSocialPreview format={format} accountHandle={accountHandle} editHref={editHref} variant={variant} />
      );
    case 'CAROUSEL':
      return (
        <CarouselSocialPreview
          format={format}
          accountHandle={accountHandle}
          selectedIndex={selectedIndex}
          onSelect={onSelectIndex}
          onPrev={onPrev}
          onNext={onNext}
          editHref={editHref}
          variant={variant}
        />
      );
    case 'STORY':
      return (
        <StorySocialPreview
          format={format}
          accountHandle={accountHandle}
          selectedIndex={selectedIndex}
          onPrev={onPrev}
          onNext={onNext}
          editHref={editHref}
          variant={variant}
        />
      );
    case 'TIKTOK':
      return (
        <TikTokSocialPreview format={format} accountHandle={accountHandle} editHref={editHref} variant={variant} />
      );
    case 'X':
      return (
        <XSocialPreview
          format={format}
          accountHandle={accountHandle}
          displayName={displayName}
          editHref={editHref}
          variant={variant}
        />
      );
    case 'HIGHLIGHT':
      return (
        <HighlightSocialPreview format={format} accountHandle={accountHandle} editHref={editHref} variant={variant} />
      );
    default:
      return null;
  }
}
