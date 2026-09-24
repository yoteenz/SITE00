/**
 * Bounded concept artifact preview — contained in panel; fullscreen is explicit.
 */

import type { CSSProperties, ReactNode } from 'react';

import {
  PAGE_CONCEPT_CONTAINED_PREVIEW_CLASS,
  PAGE_CONCEPT_CONTAINED_PREVIEW_IMG_CLASS,
  PAGE_CONCEPT_PREVIEW_OBJECT_FIT,
  type PageConceptPreviewContainSize,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptImageContainment.js';
import type { PageConceptHeaderThumbnailCrop } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptConceptHeaderThumbnail.js';
import { PAGE_CONCEPT_HEADER_THUMBNAIL_CROP } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptConceptHeaderThumbnail.js';
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
  objectFit = PAGE_CONCEPT_PREVIEW_OBJECT_FIT,
  headerThumbnailCrop,
}: {
  size?: PageConceptPreviewContainSize;
  viewportLabel?: string;
  status: PageConceptPreviewFrameStatus;
  imageSrc?: string | null;
  failureReason?: string | null;
  onRetryLoad?: () => void;
  testId?: string;
  objectFit?: 'contain' | 'cover';
  headerThumbnailCrop?: PageConceptHeaderThumbnailCrop;
}) {
  const resolvedHeaderCrop = headerThumbnailCrop ?? PAGE_CONCEPT_HEADER_THUMBNAIL_CROP;
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

  const headerCropStyle =
    size === 'headerThumb' ?
      ({
        ['--pcg-header-crop' as string]: String(resolvedHeaderCrop.heightFraction),
        ['--pcg-header-scale' as string]: String(resolvedHeaderCrop.scale ?? 1 / resolvedHeaderCrop.heightFraction),
      } as CSSProperties)
    : undefined;

  return (
    <div
      className={PAGE_CONCEPT_CONTAINED_PREVIEW_CLASS}
      data-testid={testId}
      data-contain-size={size}
      data-preview-status={status}
      data-object-fit={objectFit}
      style={headerCropStyle}
    >
      {viewportLabel ?
        <span className="s00-pcg__containPreviewLabel">{viewportLabel}</span>
      : null}
      <div className="s00-pcg__containPreviewStage">{inner}</div>
    </div>
  );
}
