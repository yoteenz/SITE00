/**
 * B5.0 — Entry 002 visual creative-production workspace.
 */

import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../../../utils/api.js';
import { site00ProjectContentOperationsCampaignBoardPath } from '../../../config/routes';
import { QuietAction } from '../WorkspaceCompositionPrimitives';
import { AuthorityGalleryWorkspace } from './AuthorityGalleryWorkspace';
import { CampaignBoardDestination } from './CampaignBoardDestination';
import { ContinuityMap } from './ContinuityMap';
import { CurrentGate } from './CurrentGate';
import { EntryCommandHeader } from './EntryCommandHeader';
import { FinalStoryboardWorkspace } from './FinalStoryboardWorkspace';
import { FormatChips } from './FormatChips';
import { HistoryPanel } from './HistoryPanel';
import { ProductionIntelligence } from './ProductionIntelligence';
import { ProductionJourney } from './ProductionJourney';
import {
  buildProductionJourney,
  resolveActiveJourneyStage,
  type JourneyStageId,
} from './productionJourney';
import { SystemInspector } from './SystemInspector';
import { ArtifactCard, CreativeAnchorCard, WorldCard } from './WorldArtifactCards';
import type { B49R4PipelineResponse, WorkspaceNavId } from './types';
import { useExpressionEngineEntry002 } from './useExpressionEngineEntry002';

const NAV_ITEMS: Array<{ id: WorkspaceNavId; label: string }> = [
  { id: 'work', label: 'WORK' },
  { id: 'world', label: 'WORLD' },
  { id: 'continuity', label: 'CONTINUITY' },
  { id: 'formats', label: 'FORMATS' },
  { id: 'production', label: 'PRODUCTION' },
  { id: 'history', label: 'HISTORY' },
];

type Props = {
  projectSlug: string;
};

export function ExpressionEngineEntry002Workspace({ projectSlug }: Props) {
  const { phase2, blueprint, b48, b49r4, loading, error, reload } = useExpressionEngineEntry002();
  const [nav, setNav] = useState<WorkspaceNavId>('work');
  const [workFocus, setWorkFocus] = useState<'auto' | JourneyStageId>('auto');
  const [judging, setJudging] = useState(false);

  const pipeline = b48?.pipelineState ?? b49r4?.pipelineState;
  const preStoryboardComplete =
    b48?.gateSatisfaction?.satisfied ??
    b48?.preStoryboardAuthorityPack?.approvalState?.allAuthoritiesLoveIt ??
    false;

  const journey = useMemo(() => {
    if (!pipeline) return [];
    return buildProductionJourney({
      coverAuthority: pipeline.coverAuthority ?? 'APPROVED',
      reelTreatment: pipeline.reelTreatment ?? 'LOCKED',
      preStoryboardComplete,
      activeProductionStep: pipeline.activeProductionStep,
      finalStoryboardStatus: pipeline.finalStoryboard.status,
      finalStoryboardValid: pipeline.finalStoryboard.valid ?? false,
      finalStoryboardApproved: pipeline.finalStoryboard.approved,
      keyframeEligibility: b49r4?.productionEligibility.keyframeEligibility ?? b48?.productionEligibility.keyframeEligibility ?? 'BLOCKED',
      videoEligibility: b49r4?.video ?? b48?.video ?? 'BLOCKED',
      campaignReady: phase2?.readiness002.ready ?? false,
      storyboardFailed: b49r4?.finalCinematicStoryboard?.status === 'REVISION_REQUIRED',
    });
  }, [pipeline, preStoryboardComplete, b49r4, b48, phase2]);

  const activeStageId = workFocus === 'auto' ? resolveActiveJourneyStage(journey) : workFocus;

  const currentStageLabel = useMemo(() => {
    const stage = journey.find((s) => s.id === activeStageId);
    return stage?.label.toUpperCase() ?? 'PRODUCTION';
  }, [journey, activeStageId]);

  const currentStageStatus = useMemo(() => {
    const stage = journey.find((s) => s.id === activeStageId);
    if (!stage) return 'IN PROGRESS';
    if (stage.status === 'ACTIVE') return 'IN PROGRESS';
    if (stage.status === 'APPROVED') return 'APPROVED';
    if (stage.status === 'READY') return 'READY';
    if (stage.status === 'FAILED') return 'REVISION';
    return stage.status;
  }, [journey, activeStageId]);

  const nextAction = b49r4?.nextAction ?? b48?.nextAction ?? pipeline?.nextAction ?? 'Continue production';

  const gateLabel = useMemo(() => {
    if (activeStageId === 'STORYBOARD') return 'REVIEW FINAL STORYBOARD';
    if (activeStageId === 'VISUAL_AUTHORITIES') return 'VISUAL AUTHORITIES';
    if (activeStageId === 'KEYFRAMES') return 'APPROVE KEYFRAMES';
    return nextAction.split('—')[0]?.trim().toUpperCase() ?? 'PRODUCTION GATE';
  }, [activeStageId, nextAction]);

  const primaryActionLabel = useMemo(() => {
    if (nextAction.includes('REVIEW')) return 'REVIEW STORYBOARD';
    if (nextAction.includes('GENERATE')) return 'GENERATE STORYBOARD';
    if (nextAction.includes('REPAIR')) return 'REPAIR STORYBOARD';
    return undefined;
  }, [nextAction]);

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
    return <p className="site00-expr-engine-panel__meta">Loading Expression Engine workspace…</p>;
  }

  if (error || !phase2) {
    return <p className="site00-expr-engine-panel__meta">{error ?? 'Failed to load workspace'}</p>;
  }

  const campaignPath = site00ProjectContentOperationsCampaignBoardPath(projectSlug);

  return (
    <div className="site00-ee-workspace-root">
      <EntryCommandHeader
        entryId="ENTRY 002"
        title={phase2.entry002.title}
        subject="2016 IG BADDIE FASHION"
        chapter="CHAPTER 01"
        chapterTitle="WHICH ONE IS IT?"
        currentStageLabel={currentStageLabel}
        currentStageStatus={currentStageStatus}
        journey={journey}
      />

      <ProductionJourney
        stages={journey}
        activeStageId={activeStageId}
        onStageSelect={(id) => {
          setNav('work');
          setWorkFocus(id as JourneyStageId);
        }}
      />

      <nav className="site00-ee-nav" aria-label="Workspace navigation">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`site00-ee-nav__btn${nav === item.id ? ' site00-ee-nav__btn--active' : ''}`}
            onClick={() => setNav(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="site00-ee-layout">
        <main className="site00-ee-layout__center">
          {nav === 'work' ? (
            <WorkPanel
              activeStageId={activeStageId}
              b48={b48}
              b49r4={b49r4}
              judging={judging}
              onJudgment={submitJudgment}
            />
          ) : null}
          {nav === 'world' ? (
            <div className="site00-ee-world-stack">
              <WorldCard blueprint={blueprint} />
              <ArtifactCard blueprint={blueprint} />
              <CreativeAnchorCard blueprint={blueprint} />
            </div>
          ) : null}
          {nav === 'continuity' ? <ContinuityMap entryId="ENTRY 002" blueprint={blueprint} /> : null}
          {nav === 'formats' ? <FormatChips blueprint={blueprint} /> : null}
          {nav === 'production' ? (
            <ProductionIntelligence blueprint={blueprint} readiness={phase2.readiness002} />
          ) : null}
          {nav === 'history' ? (
            <HistoryPanel b49r4={b49r4} cinematicSequenceStatus={b48?.cinematicSequence?.status} />
          ) : null}
        </main>

        <aside className="site00-ee-layout__side">
          <CurrentGate gateLabel={gateLabel} nextAction={nextAction} primaryActionLabel={primaryActionLabel} />
          <CampaignBoardDestination
            ready={phase2.readiness002.ready}
            blockers={phase2.readiness002.blockers}
            campaignBoardPath={campaignPath}
          />
        </aside>
      </div>

      <SystemInspector
        rawPayload={{ phase2, b48, b49r4 }}
        sections={[
          {
            id: 'gates',
            label: 'Gate IDs',
            content: (
              <ul className="site00-ee-inspector__list">
                <li>Active gate: {pipeline?.activeGate.gateId}</li>
                <li>Review gate: {b49r4?.finalStoryboardReviewGate.gateId}</li>
                <li>Stage: {pipeline?.activeProductionStep}</li>
              </ul>
            ),
          },
          {
            id: 'routing',
            label: 'Provider routing',
            content: (
              <ul className="site00-ee-inspector__list">
                {blueprint.providerRouting.map((r) => (
                  <li key={`${r.taskClass}-${r.format}`}>
                    {r.taskClass}/{r.format}: {r.recommendedProvider} · {r.recommendedModel}
                  </li>
                ))}
              </ul>
            ),
          },
        ]}
      />

      <footer className="site00-ee-footer">
        <Link to={campaignPath} className="site00-fws-ingest-link">
          ← CAMPAIGN BOARD
        </Link>
        <QuietAction
          onClick={() => {
            void navigator.clipboard.writeText(JSON.stringify({ phase2, b48, b49r4 }, null, 2));
          }}
        >
          COPY JSON →
        </QuietAction>
      </footer>
    </div>
  );
}

function WorkPanel({
  activeStageId,
  b48,
  b49r4,
  judging,
  onJudgment,
}: {
  activeStageId: JourneyStageId;
  b48: ReturnType<typeof useExpressionEngineEntry002>['b48'];
  b49r4: B49R4PipelineResponse | null;
  judging: boolean;
  onJudgment: (j: 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_FOR_ME') => Promise<void>;
}) {
  if (activeStageId === 'VISUAL_AUTHORITIES' && b48) {
    return (
      <AuthorityGalleryWorkspace
        authorities={b48.preStoryboardAuthorityPack.authorities}
        approvedCount={b48.productionEligibility.approvedAuthorityCount}
        requiredCount={b48.productionEligibility.requiredAuthorityCount}
        gateSatisfied={b48.gateSatisfaction.satisfied}
        gateStatus={b48.preStoryboardGate.gateStatus}
      />
    );
  }

  if (activeStageId === 'STORYBOARD' && b49r4) {
    return <FinalStoryboardWorkspace data={b49r4} onJudgment={onJudgment} judging={judging} />;
  }

  if (activeStageId === 'STORYBOARD' || activeStageId === 'KEYFRAMES' || activeStageId === 'VIDEO') {
    if (b49r4) {
      return <FinalStoryboardWorkspace data={b49r4} onJudgment={onJudgment} judging={judging} />;
    }
  }

  if (b48 && activeStageId === 'VISUAL_AUTHORITIES') {
    return (
      <AuthorityGalleryWorkspace
        authorities={b48.preStoryboardAuthorityPack.authorities}
        approvedCount={b48.productionEligibility.approvedAuthorityCount}
        requiredCount={b48.productionEligibility.requiredAuthorityCount}
        gateSatisfied={b48.gateSatisfaction.satisfied}
        gateStatus={b48.preStoryboardGate.gateStatus}
      />
    );
  }

  if (b49r4) {
    return <FinalStoryboardWorkspace data={b49r4} onJudgment={onJudgment} judging={judging} />;
  }

  return <p className="site00-expr-engine-panel__meta">Loading active workspace…</p>;
}
