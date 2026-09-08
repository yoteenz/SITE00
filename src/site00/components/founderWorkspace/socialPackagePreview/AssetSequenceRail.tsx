/**
 * B5.8 — Left asset / sequence rail (desktop).
 */

import type { SocialFormatPreviewModel } from './types.js';
import { PreviewMediaSlot } from './PreviewMediaSlot.js';
import { formatStatusLabel } from './buildSocialPreviewModel.js';

type Props = {
  format: SocialFormatPreviewModel;
  selectedIndex: number;
  onSelect: (index: number) => void;
  onAddAsset?: () => void;
};

export function AssetSequenceRail({ format, selectedIndex, onSelect, onAddAsset }: Props) {
  const sequenceSlots = format.slots.filter(
    (s) =>
      !['x-copy', 'x-media'].includes(s.slotId) &&
      (format.formatFamily !== 'REEL' || s.slotId !== 'final-reel' || !s.placeholder),
  );

  const showSequence = format.formatFamily === 'CAROUSEL' || format.formatFamily === 'STORY' || format.formatFamily === 'REEL';

  return (
    <aside className="site00-spp-rail" aria-label={`${format.label} assets`}>
      <header className="site00-spp-rail__head">
        <div>
          <h2>{format.label}</h2>
          <p>
            {format.slideCount} {format.formatFamily === 'CAROUSEL' ? 'slides' : format.formatFamily === 'STORY' ? 'frames' : 'assets'} ·{' '}
            {format.platform}
          </p>
        </div>
        <span className={`site00-spp-chip site00-spp-chip--${format.status.toLowerCase()}`}>
          {formatStatusLabel(format.status)}
        </span>
      </header>

      {showSequence ? (
        <ol className="site00-spp-rail__list">
          {sequenceSlots.map((slot, index) => (
            <li key={slot.slotId}>
              <button
                type="button"
                className={`site00-spp-rail__thumb${selectedIndex === index ? ' is-active' : ''}`}
                onClick={() => onSelect(index)}
                aria-current={selectedIndex === index ? 'true' : undefined}
              >
                <span className="site00-spp-rail__num">{String(index + 1).padStart(2, '0')}</span>
                <div className="site00-spp-rail__thumb-media">
                  <PreviewMediaSlot slot={slot} formatFamily={format.formatFamily} />
                </div>
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <div className="site00-spp-rail__single">
          {sequenceSlots[0] ? (
            <PreviewMediaSlot slot={sequenceSlots[0]} formatFamily={format.formatFamily} fill />
          ) : (
            <p className="site00-spp-rail__empty">No assets yet</p>
          )}
        </div>
      )}

      {onAddAsset && (
        <button type="button" className="site00-spp-rail__add" onClick={onAddAsset}>
          + ADD {format.formatFamily === 'CAROUSEL' ? 'SLIDE' : format.formatFamily === 'STORY' ? 'FRAME' : 'ASSET'}
        </button>
      )}
    </aside>
  );
}
