import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import type {
  FounderCreativeParentSequence,
  SlideCompareTab,
  SlideReconstructionSpec,
} from '../../../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';
import {
  deriveSlideDisplayStatus,
  judgmentFounderLabel,
  photoModeFounderLabel,
  slideDerivedLabel,
  slideDisplayStatusLabel,
} from '../../../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';
import { QuietAction } from '../../founderWorkspace/WorkspaceCompositionPrimitives';
import { FounderCreativeWorkflowFooterActions, FounderCreativeWorkflowStageHeader } from '../FounderCreativeWorkflowShell';

const QUICK_REVIEW_CHIPS = ['MATCH', 'CLOSE_REVISE', 'WRONG_INTERPRETATION', 'REPLACE_PHOTO', 'EDIT_COPY'] as const;

export function FounderCreativeSlideReviewStage({
  sequence,
  specs,
  slideIndex,
  compareTab,
  busy,
  generatingSlideId,
  estimate,
  onCompareTabChange,
  onPrevSlide,
  onNextSlide,
  onSelectSlide,
  onApprove,
  onReject,
  onRegenerate,
  onQuickReview,
  onEditPrompt,
  onUploadHq,
  onReplaceCanonicalHq,
  onEstimate,
}: {
  sequence: FounderCreativeParentSequence;
  specs: SlideReconstructionSpec[];
  slideIndex: number;
  compareTab: SlideCompareTab;
  busy: boolean;
  generatingSlideId: string | null;
  estimate: { estimatedCostUsd: number; provider: string; readiness: string } | null;
  onCompareTabChange: (tab: SlideCompareTab) => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onSelectSlide: (index: number) => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onRegenerate: () => void;
  onQuickReview: (judgment: string) => void;
  onEditPrompt: (prompt: string) => void;
  onUploadHq: (file: File) => void;
  onReplaceCanonicalHq?: () => void;
  onEstimate: () => void;
}) {
  const slide = specs[slideIndex];
  const hqInputRef = useRef<HTMLInputElement>(null);
  const [promptDraft, setPromptDraft] = useState(slide?.photography.reconstructionPrompt ?? '');
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (slide) setPromptDraft(slide.photography.reconstructionPrompt);
  }, [slide?.slideId, slide?.photography.reconstructionPrompt]);

  if (!slide) {
    return (
      <section className="site00-fci-gw__stage">
        <p className="site00-fci-gw__help">No slides to review yet.</p>
      </section>
    );
  }

  const status = deriveSlideDisplayStatus(slide, generatingSlideId);
  const slideLabel = slideDerivedLabel(slide, slideIndex);

  const handleHqChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onUploadHq(file);
  };

  return (
    <section className="site00-fci-gw__stage site00-fci-gw__stage--slide-review">
      <FounderCreativeWorkflowStageHeader
        step="SLIDE_REVIEW"
        sequenceTitle={sequence.title}
        subtitle={`Slide ${slideIndex + 1} of ${specs.length} · ${slideLabel}`}
        badge={slideDisplayStatusLabel(status)}
      />

      <div className="site00-fci-gw__slide-rail site00-fci-gw__slide-rail--compact">
        {specs.map((spec, index) => (
          <button
            key={spec.slideId}
            type="button"
            className={`site00-fci-gw__slide-rail-item site00-fci-gw__slide-rail-item--button${index === slideIndex ? ' site00-fci-gw__slide-rail-item--active' : ''}`}
            onClick={() => onSelectSlide(index)}
          >
            {String(index + 1).padStart(2, '0')}
          </button>
        ))}
      </div>

      <div className="site00-fci-gw__compare-tabs" role="tablist">
        {(['REFERENCE', 'PRODUCTION', 'COMPARE'] as SlideCompareTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={compareTab === tab}
            className={`site00-fci-gw__compare-tab${compareTab === tab ? ' site00-fci-gw__compare-tab--active' : ''}`}
            onClick={() => onCompareTabChange(tab)}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="site00-fci-gw__compare-surface">
        {(compareTab === 'REFERENCE' || compareTab === 'COMPARE') && (
          <div className="site00-fci-gw__compare-pane">
            <p className="site00-fci-gw__preview-label">Reference slide</p>
            <div className="site00-fci-gw__compare-placeholder">
              {slide.copy.exactText.slice(0, 3).join(' · ') || 'Reference evidence from decomposition'}
            </div>
          </div>
        )}
        {(compareTab === 'PRODUCTION' || compareTab === 'COMPARE') && (
          <div className="site00-fci-gw__compare-pane">
            <p className="site00-fci-gw__preview-label">Production output</p>
            {slide.productionMasterUrl && slide.productionMasterUrl.startsWith('http') ? (
              <img src={slide.productionMasterUrl} alt="Production slide" className="site00-fci-gw__preview-img" />
            ) : (
              <div className="site00-fci-gw__compare-placeholder">
                {slide.productionMasterUrl ?? 'Pending reconstruction'}
              </div>
            )}
          </div>
        )}
      </div>

      {slide.photography.required ? (
        <div className="site00-fci-gw__photo-actions">
          <p className="site00-fci-gw__preview-label">Photo actions</p>
          <div className="site00-fci-gw__chip-row">
            <QuietAction disabled={busy} onClick={onEstimate}>
              Estimate cost
            </QuietAction>
            <QuietAction disabled={busy} onClick={onRegenerate}>
              {photoModeFounderLabel('GENERATE_FROM_REFERENCE')} →
            </QuietAction>
            <QuietAction disabled={busy} onClick={() => hqInputRef.current?.click()}>
              Upload HQ Photo →
            </QuietAction>
            {onReplaceCanonicalHq ? (
              <QuietAction disabled={busy} onClick={onReplaceCanonicalHq}>
                Keep existing approved photo →
              </QuietAction>
            ) : null}
          </div>
          <input
            ref={hqInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="site00-fci__upload-input"
            aria-hidden
            tabIndex={-1}
            onChange={handleHqChange}
          />
          <textarea
            className="site00-fci__prompt-input"
            rows={4}
            value={promptDraft}
            onChange={(event) => setPromptDraft(event.target.value)}
            aria-label="Photography reconstruction prompt"
          />
          <QuietAction disabled={busy} onClick={() => onEditPrompt(promptDraft)}>
            Save prompt
          </QuietAction>
          {estimate ? (
            <p className="site00-fci-gw__estimate">
              {estimate.provider} · ${estimate.estimatedCostUsd.toFixed(2)} · {estimate.readiness}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="site00-fci-gw__chip-row">
        {QUICK_REVIEW_CHIPS.map((chip) => (
          <button key={chip} type="button" className="site00-fci-gw__chip" disabled={busy} onClick={() => onQuickReview(chip)}>
            {judgmentFounderLabel(chip)}
          </button>
        ))}
      </div>

      {showMore ? (
        <div className="site00-fci-gw__chip-row">
          <button type="button" className="site00-fci-gw__chip" disabled={busy} onClick={() => onReject('Needs revision')}>
            Mark needs revision
          </button>
          <button type="button" className="site00-fci-gw__chip" disabled={busy} onClick={() => onQuickReview('EDIT_PROMPT')}>
            Edit prompt
          </button>
        </div>
      ) : null}

      <FounderCreativeWorkflowFooterActions
        primary={
          <>
            <QuietAction disabled={busy || slideIndex <= 0} onClick={onPrevSlide}>
              ← Previous slide
            </QuietAction>
            <QuietAction disabled={busy} onClick={onApprove}>
              Approve slide →
            </QuietAction>
            <QuietAction disabled={busy || slideIndex >= specs.length - 1} onClick={onNextSlide}>
              Next slide →
            </QuietAction>
          </>
        }
        secondary={
          <>
            <QuietAction disabled={busy} onClick={onRegenerate}>
              Regenerate slide
            </QuietAction>
            <QuietAction disabled={busy} onClick={() => setShowMore((value) => !value)}>
              {showMore ? 'Less' : 'More'}
            </QuietAction>
          </>
        }
      />

      <div className="site00-fci-gw__mobile-bar" aria-label="Slide review actions">
        <button type="button" disabled={busy} onClick={onApprove}>
          Approve
        </button>
        <button type="button" disabled={busy} onClick={onRegenerate}>
          Regenerate
        </button>
        <button type="button" disabled={busy} onClick={() => hqInputRef.current?.click()}>
          Upload HQ
        </button>
        <button type="button" disabled={busy} onClick={() => setShowMore((value) => !value)}>
          More
        </button>
      </div>
    </section>
  );
}
