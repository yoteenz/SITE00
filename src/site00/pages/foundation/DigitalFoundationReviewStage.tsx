import { Component, type ErrorInfo, type ReactNode } from 'react';
import DigitalFoundationReviewPreviewHost from './DigitalFoundationReviewPreviewHost';
import type { DfReviewEntry } from './digitalFoundationReviewRegistry';
import { previewStatusForEntry, previewStatusLabel } from './reviewPreviewStatus';

class StageErrorBoundary extends Component<{ anchorId: string; children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[df-review-stage]', this.props.anchorId, error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <article className="df-review__item df-review__item--broken" id={this.props.anchorId}>
          <div className="df-review__mark">
            <p className="df-review__label">BROKEN · {this.props.anchorId}</p>
          </div>
          <p className="df-review__wait df-review__wait--panel">THIS SCREEN FAILED TO RENDER — PICK ANOTHER FROM THE ROW ABOVE.</p>
        </article>
      );
    }
    return this.props.children;
  }
}

export default function DigitalFoundationReviewStage({
  entry,
  anchorId,
}: {
  entry: DfReviewEntry | undefined;
  anchorId: string;
}) {
  if (!entry) {
    return (
      <article className="df-review__item df-review__item--placeholder" id="df-review-empty">
        <p className="df-review__wait df-review__wait--panel">NO SCREEN SELECTED IN THIS ZONE.</p>
      </article>
    );
  }

  const status = previewStatusLabel(previewStatusForEntry(entry));

  return (
    <section
      className="df-review__stage"
      id={anchorId}
      data-review-gallery-section={anchorId}
      data-review-group={entry.group}
      aria-label={`${entry.pageName} · ${status}`}
    >
      <p className="df-review__gallery-meta">
        {entry.pageName} · {entry.group.replace(/_/g, ' ')} · {status}
      </p>
      <StageErrorBoundary anchorId={anchorId} key={anchorId}>
        <DigitalFoundationReviewPreviewHost anchorId={anchorId} />
      </StageErrorBoundary>
    </section>
  );
}
