/**
 * Reference-fidelity — mobile Expression Engine workspace (founder design authority).
 */

import { useCallback, useMemo, useState } from 'react';
import { apiFetch } from '../../../../utils/api.js';
import { site00ProjectContentOperationsCampaignBoardPath } from '../../../config/routes';
import { ContinuityMap } from './ContinuityMap';
import {
  resolveCampaignBoardDerivedStatus,
  resolveSocialPackageReadiness,
} from './derivedContentState';
import { FormatChips } from './FormatChips';
import { HistoryPanel } from './HistoryPanel';
import { ProductionIntelligence } from './ProductionIntelligence';
import {
  buildProductionJourney,
  resolveActiveJourneyStage,
} from './productionJourney';
import {
  derivedSocialStatusToJourneyStatus,
  socialPackageStatusToJourneyStatus,
} from './socialPackageReadiness';
import { ReferenceCurrentStageCard } from './ReferenceCurrentStageCard';
import { ReferenceDerivedContent } from './ReferenceDerivedContent';
import { ReferenceEntrySummary } from './ReferenceEntrySummary';
import { ReferenceProductionJourney } from './ReferenceProductionJourney';
import { ReferenceSupportingIntelligence } from './ReferenceSupportingIntelligence';
import { ReferenceVisualAuthorities } from './ReferenceVisualAuthorities';
import { SystemInspector } from './SystemInspector';
import { ArtifactCard, CreativeAnchorCard, WorldCard } from './WorldArtifactCards';
import { useExpressionEngineEntry002 } from './useExpressionEngineEntry002';

type Props = {
  projectSlug: string;
};

export function ExpressionEngineReferenceMobileWorkspace({ projectSlug }: Props) {
  const { phase2, blueprint, b48, b49r4, loading, error, reload } = useExpressionEngineEntry002();
  const [judging, setJudging] = useState(false);

  const pipeline = b48?.pipelineState ?? b49r4?.pipelineState;
  const preStoryboardComplete =
    b48?.gateSatisfaction?.satisfied ??
    b48?.preStoryboardAuthorityPack?.approvalState?.allAuthoritiesLoveIt ??
    false;
  const finalReelApproved = pipeline?.finalStoryboard?.approved ?? false;

  const socialPackageReadiness = useMemo(
    () => (blueprint ? resolveSocialPackageReadiness(blueprint, finalReelApproved) : null),
    [blueprint, finalReelApproved],
  );

  const derivedCards = useMemo(
    () => socialPackageReadiness?.derivatives ?? [],
    [socialPackageReadiness],
  );

  const journey = useMemo(() => {
    if (!pipeline || !socialPackageReadiness) return [];
    return buildProductionJourney({
      coverAuthority: pipeline.coverAuthority ?? 'APPROVED',
      reelTreatment: pipeline.reelTreatment ?? 'LOCKED',
      preStoryboardComplete,
      activeProductionStep: pipeline.activeProductionStep,
      finalStoryboardStatus: pipeline.finalStoryboard.status,
      finalStoryboardValid: pipeline.finalStoryboard.valid ?? false,
      finalStoryboardApproved: pipeline.finalStoryboard.approved,
      keyframeEligibility:
        b49r4?.productionEligibility.keyframeEligibility ??
        b48?.productionEligibility.keyframeEligibility ??
        'BLOCKED',
      videoEligibility: b49r4?.video ?? b48?.video ?? 'BLOCKED',
      storyboardFailed: b49r4?.finalCinematicStoryboard?.status === 'REVISION_REQUIRED',
      finalReelApproved,
      derivedSocialStatus: derivedSocialStatusToJourneyStatus(socialPackageReadiness),
      socialPackageStatus: socialPackageStatusToJourneyStatus(socialPackageReadiness),
      campaignBoardEligible: socialPackageReadiness.campaignBoardEligible,
    });
  }, [pipeline, preStoryboardComplete, b49r4, b48, finalReelApproved, socialPackageReadiness]);

  const activeStageId = resolveActiveJourneyStage(journey);
  const activeStage = journey.find((s) => s.id === activeStageId);

  const nextAction = b49r4?.nextAction ?? b48?.nextAction ?? pipeline?.nextAction ?? 'Continue production';

  const primaryActionLabel = useMemo(() => {
    if (nextAction.includes('REVIEW')) return 'REVIEW STORYBOARD';
    if (nextAction.includes('GENERATE')) return 'GENERATE STORYBOARD';
    if (nextAction.includes('REPAIR')) return 'REVISE STORYBOARD';
    return 'CONTINUE PRODUCTION';
  }, [nextAction]);

  const stageBadge = `${activeStage?.shortLabel ?? 'STORYBOARD'} ${activeStage?.status === 'ACTIVE' ? 'ACTIVE' : activeStage?.status ?? 'IN PROGRESS'}`;

  const entryThumb =
    b48?.preStoryboardAuthorityPack.authorities.find((a) => a.boardNumber === 2)?.previewUrl ??
    b48?.preStoryboardAuthorityPack.authorities[0]?.previewUrl ??
    null;

  const submitJudgment = useCallback(
    async (founderJudgment: 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_FOR_ME') => {
      setJudging(true);
      try {
        const res = await apiFetch('/api/site00/expression-engine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'SET_FINAL_CINEMATIC_STORYBOARD_JUDGMENT', founderJudgment }),
        });
        if (!res.ok) throw new Error(await res.text());
        await reload();
      } finally {
        setJudging(false);
      }
    },
    [reload],
  );

  if (loading) {
    return <p className="site00-ee-ref-loading">Loading Expression Engine…</p>;
  }

  if (error || !phase2 || !blueprint) {
    return <p className="site00-ee-ref-loading">{error ?? 'Failed to load workspace'}</p>;
  }

  const campaignPath = site00ProjectContentOperationsCampaignBoardPath(projectSlug);
  const campaignDerivedStatus = socialPackageReadiness
    ? resolveCampaignBoardDerivedStatus(socialPackageReadiness)
    : 'LOCKED';

  const stageTitle =
    activeStageId === 'STORYBOARD'
      ? 'FINAL STORYBOARD'
      : (activeStage?.label.toUpperCase() ?? 'PRODUCTION');

  const stageDescription =
    activeStageId === 'STORYBOARD'
      ? 'Shot list, sequence, and pacing for final reel.'
      : 'Active production stage workspace.';

  return (
    <div className="site00-ee-ref-root">
      <ReferenceEntrySummary
        entryId="ENTRY 002"
        title={phase2.entry002.title}
        subject="2016 IG BADDIE FASHION"
        stageBadge={stageBadge}
        thumbnailUrl={entryThumb}
      />

      <ReferenceProductionJourney stages={journey} />

      <ReferenceCurrentStageCard
        stageTitle={stageTitle}
        stageDescription={stageDescription}
        statusLabel={activeStage?.status === 'ACTIVE' ? 'IN PROGRESS' : activeStage?.status ?? 'IN PROGRESS'}
        primaryActionLabel={primaryActionLabel}
        data={b49r4}
        onJudgment={submitJudgment}
        judging={judging}
      />

      <ReferenceDerivedContent
        cards={derivedCards}
        readiness={socialPackageReadiness!}
        campaignBoardPath={campaignPath}
        campaignStatus={campaignDerivedStatus}
      />

      {b48 ? (
        <ReferenceVisualAuthorities
          authorities={b48.preStoryboardAuthorityPack.authorities}
          allApproved={b48.gateSatisfaction.satisfied}
        />
      ) : null}

      <ReferenceSupportingIntelligence
        sections={[
          {
            id: 'world',
            label: 'WORLD',
            content: (
              <div className="site00-ee-ref-support__stack">
                <WorldCard blueprint={blueprint} />
                <ArtifactCard blueprint={blueprint} />
                <CreativeAnchorCard blueprint={blueprint} />
              </div>
            ),
          },
          {
            id: 'continuity',
            label: 'CONTINUITY',
            content: <ContinuityMap entryId="ENTRY 002" blueprint={blueprint} />,
          },
          {
            id: 'production',
            label: 'PRODUCTION INTELLIGENCE',
            content: (
              <>
                <ProductionIntelligence blueprint={blueprint} readiness={phase2.readiness002} />
                {socialPackageReadiness ? (
                  <FormatChips blueprint={blueprint} readiness={socialPackageReadiness} />
                ) : null}
              </>
            ),
          },
          {
            id: 'history',
            label: 'HISTORY',
            content: (
              <HistoryPanel b49r4={b49r4} cinematicSequenceStatus={b48?.cinematicSequence?.status} />
            ),
          },
          {
            id: 'inspector',
            label: 'SYSTEM INSPECTOR',
            content: (
              <SystemInspector
                rawPayload={{ phase2, b48, b49r4 }}
                sections={[
                  {
                    id: 'gates',
                    label: 'Gate IDs',
                    content: (
                      <ul className="site00-ee-inspector__list">
                        <li>Active gate: {pipeline?.activeGate.gateId}</li>
                        <li>Stage: {pipeline?.activeProductionStep}</li>
                        <li>Next: {nextAction}</li>
                      </ul>
                    ),
                  },
                ]}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
