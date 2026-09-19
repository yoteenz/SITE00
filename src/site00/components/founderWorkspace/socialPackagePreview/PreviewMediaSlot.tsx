/**
 * B5.8 — Shared media slot renderer.
 */

import type { SocialPreviewSlot } from './types.js';
import { PlatformEmptyState } from './PlatformEmptyState.js';
import type { SocialFormatFamily } from './types.js';

type Props = {
  slot: SocialPreviewSlot;
  formatFamily: SocialFormatFamily;
  fill?: boolean;
  className?: string;
};

export function PreviewMediaSlot({ slot, formatFamily, fill, className }: Props) {
  if (slot.placeholder || !slot.filePath) {
    return (
      <PlatformEmptyState
        formatFamily={formatFamily}
        label={slot.placeholderLabel ?? slot.label}
        compact={!fill}
      />
    );
  }
  if (slot.mediaType === 'VIDEO') {
    return (
      <video
        src={slot.filePath}
        controls
        className={`site00-spp-media${fill ? ' site00-spp-media--fill' : ''}${className ? ` ${className}` : ''}`}
      />
    );
  }
  return (
    <img
      src={slot.filePath}
      alt={slot.title}
      className={`site00-spp-media${fill ? ' site00-spp-media--fill' : ''}${className ? ` ${className}` : ''}`}
    />
  );
}
