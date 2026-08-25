import type {
  FounderCreativeIngestionState,
  FounderCreativeParentSequence,
  SlideReconstructionSpec,
} from '../../../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';
import {
  countApprovedSlides,
  countUnresolvedSlides,
  deriveSlideDisplayStatus,
  sequenceReviewBlocked,
  slideDisplayStatusLabel,
} from '../../../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';
import { QuietAction } from '../../founderWorkspace/WorkspaceCompositionPrimitives';
import { FounderCreativeWorkflowFooterActions, FounderCreativeWorkflowStageHeader } from '../FounderCreativeWorkflowShell';

export function FounderCreativeSequenceReviewStage({
  sequence,
  specs,
  busy,
  generatingSlideId,
  onReturnToSlide,
  onApproveSequence,
  onPromoteReference,
  onRegisterCampaign,
  registeredOnCampaignBoard,
}: {
  sequence: FounderCreativeParentSequence;
  specs: SlideReconstructionSpec[];
  busy: boolean;
  generatingSlideId: string | null;
  onReturnToSlide: (index: number) => void;
  onApproveSequence: () => void;
  onPromoteReference: () => void;
  onRegisterCampaign: () => void;
  registeredOnCampaignBoard: boolean;
}) {
  const blocked = sequenceReviewBlocked(specs);
  const approved = countApprovedSlides(specs);
  const unresolved = countUnresolvedSlides(specs);

  return (
    <section className="site00-fci-gw__stage">
      <FounderCreativeWorkflowStageHeader
        step="SEQUENCE_REVIEW"
        sequenceTitle={sequence.title}
        subtitle={`${approved} approved · ${unresolved} unresolved`}
        badge={blocked ? 'Blocked — unresolved slides remain' : 'Ready for sequence approval'}
      />

      <div className="site00-fci-gw__sequence-grid">
        {specs.map((spec, index) => {
          const status = deriveSlideDisplayStatus(spec, generatingSlideId);
          return (
            <button
              key={spec.slideId}
              type="button"
              className={`site00-fci-gw__sequence-grid-item site00-fci-gw__sequence-grid-item--${status.toLowerCase()}`}
              onClick={() => onReturnToSlide(index)}
            >
              <span className="site00-fci-gw__sequence-grid-num">{String(index + 1).padStart(2, '0')}</span>
              <span className="site00-fci-gw__sequence-grid-status">{slideDisplayStatusLabel(status)}</span>
            </button>
          );
        })}
      </div>

      {blocked ? (
        <p className="site00-fci-gw__blocked" role="status">
          Sequence completion is blocked until every slide is approved. Return to unresolved slides above.
        </p>
      ) : (
        <p className="site00-fci-gw__help">
          Review the carousel as a whole. Promote the draft reference only when you are ready — it is never
          auto-promoted.
        </p>
      )}

      <FounderCreativeWorkflowFooterActions
        primary={
          <>
            <QuietAction disabled={busy || blocked} onClick={onApproveSequence}>
              Approve sequence →
            </QuietAction>
            <QuietAction disabled={busy} onClick={onPromoteReference}>
              Promote new reference →
            </QuietAction>
            <QuietAction disabled={busy || blocked || registeredOnCampaignBoard} onClick={onRegisterCampaign}>
              Register on campaign board →
            </QuietAction>
          </>
        }
      />
    </section>
  );
}

export function FounderCreativeCompletionStage({
  sequence,
  ingestion,
  onViewCampaignBoard,
  onStartNextSequence,
  onReviewSlides,
}: {
  sequence: FounderCreativeParentSequence;
  ingestion: FounderCreativeIngestionState;
  onViewCampaignBoard: () => void;
  onStartNextSequence: () => void;
  onReviewSlides: () => void;
}) {
  return (
    <section className="site00-fci-gw__stage site00-fci-gw__stage--complete">
      <FounderCreativeWorkflowStageHeader
        step="COMPLETE"
        sequenceTitle={sequence.title}
        subtitle="Sequence review complete"
        badge={ingestion.registeredOnCampaignBoard ? 'Registered on campaign board' : 'Ready for campaign board'}
      />

      <ul className="site00-fci-gw__complete-list">
        <li>Sequence approved and ready for handoff</li>
        <li>Draft reference was not auto-promoted — founder chose when to promote</li>
        <li>Historical reference and production lineage preserved</li>
      </ul>

      <FounderCreativeWorkflowFooterActions
        primary={
          <>
            <QuietAction onClick={onViewCampaignBoard}>View on campaign board →</QuietAction>
            <QuietAction onClick={onReviewSlides}>Review approved slides →</QuietAction>
            <QuietAction onClick={onStartNextSequence}>Start next sequence →</QuietAction>
          </>
        }
      />
    </section>
  );
}
