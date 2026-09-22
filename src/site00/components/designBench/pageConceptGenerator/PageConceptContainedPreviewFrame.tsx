/**
 * Bounded concept artifact preview — contained in panel; fullscreen is explicit.
 */

import type { ReactNode } from 'react';

import {
  PAGE_CONCEPT_CONTAINED_PREVIEW_CLASS,
  PAGE_CONCEPT_CONTAINED_PREVIEW_IMG_CLASS,
  PAGE_CONCEPT_PREVIEW_OBJECT_FIT,
  type PageConceptPreviewContainSize,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptImageContainment.js';
import { AiConsoleIcon } from '../aiConsoles/AiConsoleIcon';

export type PageConceptPreviewFrameStatus = 'PENDING' | 'GENERATING' | 'READY' | 'FAILED';

export function PageConceptContainedPreviewFrame({
  size = 'mobile',
  viewportLabel,
  status,
  imageSrc,
  failureReason,
  onRetryLoad,
  testId = 'page-concept-contained-preview',
}: {
  size?: PageConceptPreviewContainSize;
  viewportLabel?: string;
  status: PageConceptPreviewFrameStatus;
  imageSrc?: string | null;
  failureReason?: string | null;
  onRetryLoad?: () => void;
  testId?: string;
}) {
  let inner: ReactNode;
  if (status === 'READY' && imageSrc) {
    inner = (
      <img
        src={imageSrc}
        alt={viewportLabel ? `${viewportLabel} concept preview` : 'Concept preview'}
        className={PAGE_CONCEPT_CONTAINED_PREVIEW_IMG_CLASS}
        draggable={false}
        decoding="async"
      />
    );
  } else if (status === 'FAILED') {
    inner = (
      <div className="s00-pcg__containPreviewEmpty s00-pcg__containPreviewEmpty--failed">
        <AiConsoleIcon name="status-error" size={16} />
        <span>PREVIEW UNAVAILABLE</span>
        {failureReason ? <span className="s00-pcg__containPreviewFailReason">{failureReason}</span> : null}
        {onRetryLoad ?
          <button type="button" className="s00-pcg__secAction" onClick={onRetryLoad}>
            RETRY LOAD
          </button>
        : null}
      </div>
    );
  } else if (status === 'GENERATING') {
    inner = (
      <div className="s00-pcg__containPreviewSkeleton" aria-hidden="true">
        <AiConsoleIcon name="status-generating" size={16} />
        <span>GENERATING</span>
      </div>
    );
  } else {
    inner = (
      <div className="s00-pcg__containPreviewSkeleton" aria-hidden="true">
        <AiConsoleIcon name="empty-concept" size={16} />
        <span>PENDING</span>
      </div>
    );
  }

  return (
    <div
      className={PAGE_CONCEPT_CONTAINED_PREVIEW_CLASS}
      data-testid={testId}
      data-contain-size={size}
      data-preview-status={status}
      data-object-fit={PAGE_CONCEPT_PREVIEW_OBJECT_FIT}
    >
      {viewportLabel ?
        <span className="s00-pcg__containPreviewLabel">{viewportLabel}</span>
      : null}
      <div className="s00-pcg__containPreviewStage">{inner}</div>
    </div>
  );
}
