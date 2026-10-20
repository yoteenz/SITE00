import { Component, type ErrorInfo, type ReactNode, useEffect, useRef, useState } from 'react';
import DigitalFoundationReviewPreviewHost from './DigitalFoundationReviewPreviewHost';
import type { DfReviewEntry } from './digitalFoundationReviewRegistry';
import { GALLERY_EAGER_MOUNT_COUNT } from './digitalFoundationReviewGallery';
import { previewStatusForEntry, previewStatusLabel } from './reviewPreviewStatus';

type Props = {
  entry: DfReviewEntry;
  index: number;
};

class SectionErrorBoundary extends Component<{ anchorId: string; children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[df-review-gallery]', this.props.anchorId, error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <article className="df-review__item df-review__item--broken" id={this.props.anchorId}>
          <div className="df-review__mark">
            <p className="df-review__label">BROKEN · {this.props.anchorId}</p>
          </div>
          <p className="df-review__wait df-review__wait--panel">THIS SECTION FAILED TO RENDER — OTHER GALLERY SCREENS REMAIN AVAILABLE.</p>
        </article>
      );
    }
    return this.props.children;
  }
}

export default function DigitalFoundationReviewGallerySection({ entry, index }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [mount, setMount] = useState(index < GALLERY_EAGER_MOUNT_COUNT);

  useEffect(() => {
    if (mount) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([hit]) => {
        if (hit?.isIntersecting) setMount(true);
      },
      { root: null, rootMargin: '600px 0px', threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mount]);

  const status = previewStatusLabel(previewStatusForEntry(entry));

  return (
    <section
      ref={ref}
      className="df-review__gallery-section"
      data-review-gallery-section={entry.anchorId}
      data-review-group={entry.group}
      aria-label={`${entry.pageName} · ${status}`}
    >
      <p className="df-review__gallery-meta">
        {entry.pageName} · {entry.group.replace(/_/g, ' ')} · {status}
      </p>
      {mount ? (
        <SectionErrorBoundary anchorId={entry.anchorId}>
          <DigitalFoundationReviewPreviewHost anchorId={entry.anchorId} />
        </SectionErrorBoundary>
      ) : (
        <article className="df-review__item df-review__item--placeholder" id={entry.anchorId}>
          <div className="df-review__mark">
            <p className="df-review__label">{entry.pageName.toUpperCase()}</p>
          </div>
          <p className="df-review__wait">APPROACHING · SCROLL TO MOUNT · {entry.anchorId}</p>
        </article>
      )}
    </section>
  );
}
