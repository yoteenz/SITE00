/**
 * B5.8 — Carousel platform-native preview.
 */

import { Link } from 'react-router-dom';
import type { SocialFormatPreviewModel } from './types.js';
import { PreviewMediaSlot } from './PreviewMediaSlot.js';
import { formatStatusLabel } from './buildSocialPreviewModel.js';

type Props = {
  format: SocialFormatPreviewModel;
  accountHandle: string;
  selectedIndex: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  editHref?: string;
  variant?: 'desktop' | 'mobile';
};

export function CarouselSocialPreview({
  format,
  accountHandle,
  selectedIndex,
  onSelect,
  onPrev,
  onNext,
  editHref,
  variant = 'desktop',
}: Props) {
  const slides = format.slots.filter((s) => s.slotId !== 'x-copy');
  const total = slides.length || 1;
  const current = slides[selectedIndex] ?? slides[0];
  const idx = Math.min(selectedIndex, total - 1);

  return (
    <div className={`site00-spp-carousel site00-spp-carousel--${variant}`}>
      <div className={variant === 'desktop' ? 'site00-spp-carousel__phone-wrap' : undefined}>
        {variant === 'desktop' && (
          <>
            <button type="button" className="site00-spp-carousel__nav site00-spp-carousel__nav--prev" onClick={onPrev} aria-label="Previous slide">
              ‹
            </button>
            <button type="button" className="site00-spp-carousel__nav site00-spp-carousel__nav--next" onClick={onNext} aria-label="Next slide">
              ›
            </button>
          </>
        )}
        <article className="site00-spp-carousel__post">
          <header className="site00-spp-carousel__account">
            <span className="site00-spp-carousel__avatar" aria-hidden />
            <div>
              <strong>{accountHandle}</strong>
              <span>Sponsored</span>
            </div>
          </header>
          <div className="site00-spp-carousel__media">
            {current ? (
              <PreviewMediaSlot slot={current} formatFamily="CAROUSEL" fill />
            ) : (
              <PreviewMediaSlot
                slot={{
                  slotId: 'empty',
                  label: 'SLIDE',
                  sequenceNumber: 1,
                  filePath: null,
                  mediaType: 'NONE',
                  title: 'Slide',
                  placeholder: true,
                  placeholderLabel: 'Add Slide',
                  deliverableId: null,
                  assetRole: null,
                  assetType: null,
                  approvalState: null,
                  dimensions: null,
                  source: null,
                  version: null,
                  notes: null,
                }}
                formatFamily="CAROUSEL"
                fill
              />
            )}
            <span className="site00-spp-carousel__count">
              {idx + 1} / {total}
            </span>
          </div>
          <div className="site00-spp-carousel__engage" aria-hidden>
            <span>♡</span>
            <span>💬</span>
            <span>↗</span>
            <span>⌁</span>
          </div>
          <p className="site00-spp-carousel__caption">
            <strong>{accountHandle}</strong> {format.caption ?? format.copyText ?? 'Caption pending'}
          </p>
        </article>
      </div>

      <div className="site00-spp-carousel__strip">
        {slides.map((slide, i) => (
          <button
            key={slide.slotId}
            type="button"
            className={`site00-spp-carousel__thumb${i === idx ? ' is-active' : ''}`}
            onClick={() => onSelect(i)}
            aria-label={`Slide ${i + 1}`}
          >
            <span>{String(i + 1).padStart(2, '0')}</span>
            <PreviewMediaSlot slot={slide} formatFamily="CAROUSEL" />
          </button>
        ))}
      </div>

      {variant === 'mobile' && (
        <footer className="site00-spp-format-footer">
          <span className={`site00-spp-chip site00-spp-chip--${format.status.toLowerCase()}`}>
            {formatStatusLabel(format.status)}
          </span>
          {editHref && (
            <Link to={editHref} className="site00-spp-btn site00-spp-btn--primary">
              EDIT SLIDES
            </Link>
          )}
        </footer>
      )}
    </div>
  );
}
