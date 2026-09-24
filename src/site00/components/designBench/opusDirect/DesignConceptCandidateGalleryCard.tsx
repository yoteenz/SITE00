/**
 * Shared concept candidate gallery card — Grid + List use identical preview data.
 */

import { PAGE_CONCEPT_HEADER_THUMBNAIL_CROP } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptConceptHeaderThumbnail.js';
import { PageConceptContainedPreviewFrame } from '../pageConceptGenerator/PageConceptContainedPreviewFrame';
import type { TwinOpusDirectCandidate, TwinOpusDirectCandidateSurface } from './twinOpusDirectContent';

export function previewStatusForCandidate(
  candidate: TwinOpusDirectCandidate,
): 'PENDING' | 'GENERATING' | 'READY' | 'FAILED' {
  if (candidate.artifactStatus === 'FAILED') return 'FAILED';
  if (candidate.headerThumbnailUri ?? candidate.previewSrc) return 'READY';
  if (candidate.artifactStatus === 'RUNNING') return 'GENERATING';
  return 'PENDING';
}

function LegacyCandidateSurface({ surface }: { surface: TwinOpusDirectCandidateSurface }) {
  if (surface === 'plate') {
    return (
      <div className="tod-card__surface tod-card__surface--plate">
        <div className="tod-card__copy">
          <p className="tod-card__headline">
            <span>THE SIGNAL</span>
            <span>IS THE INDEX</span>
          </p>
        </div>
      </div>
    );
  }
  return <div className="tod-card__surface tod-card__surface--archive" />;
}

export function DesignConceptCandidateGalleryCard({
  candidate,
  testIdPrefix = 'gallery-candidate-preview',
  metaClassPrefix = 'tod-card',
}: {
  candidate: TwinOpusDirectCandidate;
  testIdPrefix?: string;
  metaClassPrefix?: 'tod-card' | 'tod-lv-card';
}) {
  const thumbSrc = candidate.headerThumbnailUri ?? candidate.previewSrc ?? null;
  const useConceptPreview =
    thumbSrc ||
    candidate.artifactRole === 'MOBILE_CANDIDATE' ||
    candidate.artifactRole === 'TABLET_INTERPRETATION' ||
    candidate.artifactRole === 'DESKTOP_INTERPRETATION';

  if (useConceptPreview) {
    const metaLine = `${metaClassPrefix}__metaLine`;
    const metaDim = `${metaClassPrefix}__metaLine--dim`;
    const surfaceClass =
      metaClassPrefix === 'tod-lv-card' ?
        'tod-lv-card__surface tod-lv-card__surface--conceptPreview'
      : 'tod-card__surface tod-card__surface--conceptPreview';
    return (
      <div className={surfaceClass}>
        <PageConceptContainedPreviewFrame
          size="headerThumb"
          objectFit="cover"
          viewportLabel={undefined}
          status={previewStatusForCandidate(candidate)}
          imageSrc={thumbSrc}
          headerThumbnailCrop={{
            ...PAGE_CONCEPT_HEADER_THUMBNAIL_CROP,
            ...candidate.headerThumbnailCrop,
            scale:
              candidate.headerThumbnailCrop?.scale ??
              PAGE_CONCEPT_HEADER_THUMBNAIL_CROP.scale,
          }}
          testId={`${testIdPrefix}-${candidate.id}`}
        />
        <div className={`${metaClassPrefix}__meta`}>
          <span className={metaLine}>{candidate.version}</span>
          <span className={metaLine}>{candidate.pipelineLabel ?? 'GPT2 MOBILE'}</span>
          {candidate.territoryLabel ?
            <span className={metaDim}>{candidate.territoryLabel}</span>
          : null}
        </div>
      </div>
    );
  }
  return <LegacyCandidateSurface surface={candidate.surface} />;
}
