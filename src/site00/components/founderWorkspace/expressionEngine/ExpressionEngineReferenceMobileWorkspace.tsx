/**
 * B5.3 — Reference-fidelity mobile Expression Engine workspace (founder design authority).
 */

import { useCallback, useMemo, useState } from 'react';
import { apiFetch } from '../../../../utils/api.js';
import { site00ProjectContentOperationsCampaignBoardPath } from '../../../config/routes';
import {
  resolveSocialPackageReadiness,
} from './derivedContentState';
import {
  buildProductionJourney,
  resolveActiveJourneyStage,
} from './productionJourney';
import {
  derivedSocialStatusToJourneyStatus,
  socialPackageStatusToJourneyStatus,
} from './socialPackageReadiness';
import { ReferenceChooseHowToContinue } from './ReferenceChooseHowToContinue';
import { ReferenceCurrentStageCard } from './ReferenceCurrentStageCard';
import { ReferenceDerivedContent } from './ReferenceDerivedContent';
import { ReferenceEntrySummary } from './ReferenceEntrySummary';
import { ReferenceExpandedContinuity } from './ReferenceExpandedContinuity';
import { ReferenceExpandedHistory } from './ReferenceExpandedHistory';
import { ReferenceExpandedProductionIntelligence } from './ReferenceExpandedProductionIntelligence';
import { ReferenceExpandedSystemInspector } from './ReferenceExpandedSystemInspector';
import { ReferenceExpandedWorld } from './ReferenceExpandedWorld';
import { ReferenceProductionJourney } from './ReferenceProductionJourney';
import { ReferenceSupportingIntelligence } from './ReferenceSupportingIntelligence';
import { AutonomousCreativeDirectorWorkspace } from './AutonomousCreativeDirectorWorkspace';
import { Entry003CreativeDirectorWorkspace } from './Entry003CreativeDirectorWorkspace';
import { Entry003SeniorDirectorReview } from './Entry003SeniorDirectorReview';
import { MultiUnitCreativePackageReview } from './MultiUnitCreativePackageReview';
import { ReferenceVisualAuthorities } from './ReferenceVisualAuthorities';
import { ExpressionEngineErrorState } from './ExpressionEngineErrorState';
import {
  postGenerateFinalStoryboard,
  postImportFounderStoryboard,
  useExpressionEngineEntry002,
} from './useExpressionEngineEntry002';

type Props = {
  projectSlug: string;
};

export function ExpressionEngineReferenceMobileWorkspace({ projectSlug }: Props) {
  const { phase2, blueprint, b48, b49r4, c11, c12, c16, loading, error, errorView, reload } = useExpressionEngineEntry002();
  const [judging, setJudging] = useState(false);
  const [cdJudging, setCdJudging] = useState(false);
  const [e003Judging, setE003Judging] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [importing, setImporting] = useState(false);

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

  const authorities = b48?.preStoryboardAuthorityPack.authorities ?? [];
  const approvedAuthorityCount =
    b48?.productionEligibility.approvedAuthorityCount ??
    authorities.filter((a) => a.founderJudgment === 'LOVE_IT').length;
  const requiredAuthorityCount = b48?.productionEligibility.requiredAuthorityCount ?? 5;

  const entryThumb =
    authorities.find((a) => a.boardNumber === 4)?.previewUrl ??
    authorities.find((a) => a.boardNumber === 2)?.previewUrl ??
    authorities.find((a) => a.boardNumber === 1)?.previewUrl ??
    null;

  const worldImageUrl =
    authorities.find((a) => a.boardNumber === 1)?.previewUrl ?? entryThumb;

  const costGuard = b49r4?.storyboardCostGuard;
  const attemptCount = costGuard?.storyboardGenerationAttemptCount ?? 0;
  const autoRetryOff = (costGuard?.storyboardAutoRetryCount ?? 0) === 0;

  const providerRouting = useMemo(() => {
    const reelRoute = blueprint?.providerRouting.find((r) => r.format === 'REEL');
    if (reelRoute) return `${reelRoute.recommendedProvider} / ${reelRoute.recommendedModel}`.toUpperCase();
    return 'GPT IMAGE 2 / FAL';
  }, [blueprint]);

  const historyCount = useMemo(() => {
    let count = 0;
    if (b49r4?.finalCinematicStoryboard) count += 1;
    if (b49r4?.storyboard001Historical) count += 1;
    if (b49r4?.storyboard002Historical) count += 1;
    if (b49r4?.storyboard003Historical) count += 1;
    if (b49r4?.storyboard004Historical) count += 1;
    if (b49r4?.storyboard005Historical) count += 1;
    if (b48?.cinematicSequence?.status) count += 1;
    return count;
  }, [b49r4, b48]);

  const authorityApprovedAt =
    authorities.find((a) => a.record?.approvedAt)?.record?.approvedAt ?? null;

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      await postGenerateFinalStoryboard();
      await reload();
    } finally {
      setGenerating(false);
    }
  }, [reload]);

  const handleImport = useCallback(async () => {
    setImporting(true);
    try {
      await postImportFounderStoryboard('A');
      await reload();
    } finally {
      setImporting(false);
    }
  }, [reload]);

  const handlePrimaryAction = useCallback(() => {
    if (primaryActionLabel === 'GENERATE STORYBOARD') {
      void handleGenerate();
    }
  }, [primaryActionLabel, handleGenerate]);

  const submitEntry003Judgment = useCallback(
    async (
      founderJudgment:
        | 'LOVE_IT'
        | 'PUSH_FURTHER'
        | 'TOO_SAFE'
        | 'TOO_CLOSE'
        | 'CHANGE_THE_WORLD'
        | 'CHANGE_THE_ROLE'
        | 'REVISE'
        | 'NOT_FOR_ME',
    ) => {
      setE003Judging(true);
      try {
        const res = await apiFetch('/api/site00/expression-engine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SET_ENTRY_003_CREATIVE_JUDGMENT',
            founderJudgment,
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        await reload();
      } finally {
        setE003Judging(false);
      }
    },
    [reload],
  );

  const submitCreativeDirectorJudgment = useCallback(
    async (
      founderJudgment:
        | 'LOVE_IT'
        | 'PUSH_FURTHER'
        | 'TOO_SAFE'
        | 'TOO_CLOSE'
        | 'CHANGE_THE_WORLD'
        | 'CHANGE_THE_ROLE'
        | 'REVISE'
        | 'NOT_FOR_ME',
    ) => {
      setCdJudging(true);
      try {
        const res = await apiFetch('/api/site00/expression-engine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SET_CREATIVE_DIRECTOR_JUDGMENT',
            founderJudgment,
            entryId: c11?.creativeDirectorRun.entryId ?? 'entry-c1-blind',
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        await reload();
      } finally {
        setCdJudging(false);
      }
    },
    [c11?.creativeDirectorRun.entryId, reload],
  );

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

  const campaignPath = site00ProjectContentOperationsCampaignBoardPath(projectSlug);

  if (errorView) {
    return (
      <ExpressionEngineErrorState
        error={errorView}
        campaignBoardPath={campaignPath}
        onRetry={() => void reload()}
      />
    );
  }

  if (!phase2 || !blueprint) {
    return <p className="site00-ee-ref-loading">Failed to load workspace</p>;
  }

  const stageTitle =
    activeStageId === 'STORYBOARD'
      ? 'FINAL STORYBOARD'
      : (activeStage?.label.toUpperCase() ?? 'PRODUCTION');

  const stageDescription =
    activeStageId === 'STORYBOARD'
      ? 'Shot list, sequence, and pacing for final reel.'
      : 'Active production stage workspace.';

  const showChoosePaths =
    activeStageId === 'STORYBOARD' &&
    !b49r4?.finalStoryboardReviewGate.active &&
    (!b49r4?.finalCinematicStoryboard?.storyboardStripUrl ||
      b49r4.finalCinematicStoryboard.status === 'PIPELINE_TEST_ONLY' ||
      b49r4.finalCinematicStoryboard.status === 'STORYBOARD_REQUIRES_FOUNDER_DECISION');

  const worldStatus = blueprint.territoryLockStatus === 'TERRITORY_LOCKED' ? 'DEFINED' : 'TO BE DEFINED';
  const continuityStatus = preStoryboardComplete ? 'ANALYZED' : 'TO BE ANALYZED';
  const prodIntelStatus = phase2.readiness002.ready ? 'READY' : 'PENDING';
  const authoritiesStatus = preStoryboardComplete
    ? `${approvedAuthorityCount} / ${requiredAuthorityCount} APPROVED`
    : 'TO BE GENERATED';

  return (
    <div className="site00-ee-ref-root">
      <ReferenceEntrySummary
        entryId="ENTRY 002"
        title={phase2.entry002.title}
        subject="2016 IG BADDIE FASHION"
        stageBadge={stageBadge}
        thumbnailUrl={entryThumb}
        createdLabel="SEP 8, 2026"
        updatedLabel="TODAY"
      />

      <ReferenceProductionJourney stages={journey} />

      <ReferenceCurrentStageCard
        stageTitle={stageTitle}
        stageDescription={stageDescription}
        statusLabel={activeStage?.status === 'ACTIVE' ? 'IN PROGRESS' : activeStage?.status ?? 'IN PROGRESS'}
        primaryActionLabel={primaryActionLabel}
        data={b49r4}
        onPrimaryAction={handlePrimaryAction}
        onJudgment={submitJudgment}
        judging={judging}
      />

      {showChoosePaths ? (
        <ReferenceChooseHowToContinue
          attemptCount={attemptCount}
          providerLabel={providerRouting}
          autoRetryOff={autoRetryOff}
          onGenerate={() => void handleGenerate()}
          onImport={() => void handleImport()}
          generating={generating}
          importing={importing}
          generateDisabled={generating || importing}
        />
      ) : null}

      <ReferenceDerivedContent cards={derivedCards} />

      <ReferenceSupportingIntelligence
        sections={[
          {
            id: 'c16-multi-unit-creative',
            label: 'FRESH CAMPAIGN · MULTI-UNIT REVIEW (C1.6)',
            status: c16?.multiUnitBlindCampaign?.packageJudgment?.status ?? 'LOADING',
            content: (
              <MultiUnitCreativePackageReview
                campaign={
                  c16?.multiUnitBlindCampaign
                    ? {
                        ...c16.multiUnitBlindCampaign,
                        copyPackage: c16.multiUnitBlindCampaign.copyPackage,
                      }
                    : null
                }
              />
            ),
          },
          {
            id: 'entry-003-creative-director',
            label: 'ENTRY 003 · SENIOR CREATIVE JUDGMENT (C1.4)',
            status: c12?.entry003Package.founderInterventionDependency ?? 'LOADING',
            content: (
              <>
                <Entry003SeniorDirectorReview pkg={c12?.entry003Package ?? null} />
                <Entry003CreativeDirectorWorkspace
                  pkg={c12?.entry003Package ?? null}
                  onJudgment={submitEntry003Judgment}
                  judging={e003Judging}
                />
              </>
            ),
          },
          {
            id: 'creative-director',
            label: 'AUTONOMOUS CREATIVE DIRECTOR',
            status: c11?.creativeDirectorRun.founderInterventionDependency ?? 'LOADING',
            content: (
              <AutonomousCreativeDirectorWorkspace
                run={c11?.creativeDirectorRun ?? null}
                onJudgment={submitCreativeDirectorJudgment}
                judging={cdJudging}
              />
            ),
          },
          {
            id: 'authorities',
            label: 'VISUAL AUTHORITIES',
            status: authoritiesStatus,
            content: b48 ? (
              <ReferenceVisualAuthorities
                authorities={authorities}
                approvedCount={approvedAuthorityCount}
                requiredCount={requiredAuthorityCount}
                showHeader={false}
              />
            ) : (
              <p className="site00-ee-ref-support__empty">Authority pack loading…</p>
            ),
          },
          {
            id: 'world',
            label: 'WORLD',
            status: worldStatus,
            content: <ReferenceExpandedWorld blueprint={blueprint} worldImageUrl={worldImageUrl} />,
          },
          {
            id: 'continuity',
            label: 'CONTINUITY',
            status: continuityStatus,
            content: b48 ? (
              <ReferenceExpandedContinuity authorities={authorities} />
            ) : (
              <p className="site00-ee-ref-support__empty">Continuity unavailable until authorities load.</p>
            ),
          },
          {
            id: 'production',
            label: 'PRODUCTION INTELLIGENCE',
            status: prodIntelStatus,
            content: (
              <ReferenceExpandedProductionIntelligence
                activeGate={`${activeStage?.shortLabel ?? 'STORYBOARD'} (${activeStage?.status === 'ACTIVE' ? 'IN PROGRESS' : activeStage?.status ?? 'ACTIVE'})`}
                providerRouting={providerRouting}
                attempts={`${attemptCount} / 4 (${Math.max(0, 4 - attemptCount)} REMAINING)`}
                retryPolicy={autoRetryOff ? 'AUTOMATIC (OFF)' : 'AUTOMATIC (ON FAILURE)'}
                dispatchMode="EXPLICIT FOUNDER ACTION"
                readiness={phase2.readiness002.ready ? 'READY (ALL SYSTEMS NOMINAL)' : 'NOT READY'}
                nextAction={nextAction}
                onNextAction={primaryActionLabel.includes('GENERATE') ? () => void handleGenerate() : undefined}
                nextActionDisabled={generating || importing}
                nextActionLabel={
                  primaryActionLabel.includes('GENERATE') ? 'GENERATE NEXT' : primaryActionLabel.replace(' STORYBOARD', '')
                }
              />
            ),
          },
          {
            id: 'history',
            label: 'HISTORY',
            status: `${historyCount} ENTRIES`,
            content: (
              <ReferenceExpandedHistory
                b49r4={b49r4}
                cinematicSequenceStatus={b48?.cinematicSequence?.status}
                authorityApprovedAt={authorityApprovedAt}
              />
            ),
          },
          {
            id: 'inspector',
            label: 'SYSTEM INSPECTOR',
            content: (
              <ReferenceExpandedSystemInspector
                fields={[
                  { label: 'ENTRY ID', value: phase2.entry002.id ?? 'NDX-ENTRY-002' },
                  { label: 'CURRENT STAGE', value: activeStage?.shortLabel ?? 'STORYBOARD' },
                  { label: 'GATE STATUS', value: pipeline?.activeGate.gateStatus ?? 'ACTIVE' },
                  {
                    label: 'STORYBOARD STATUS',
                    value: b49r4?.finalCinematicStoryboard?.status ?? pipeline?.finalStoryboard.status ?? 'IN PROGRESS',
                  },
                  {
                    label: 'DOWNSTREAM LOCK',
                    value: finalReelApproved ? 'UNLOCKED' : 'LOCKED UNTIL REEL',
                  },
                ]}
                payload={{ phase2, b48, b49r4, technicalError: error }}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
