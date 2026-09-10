/**
 * P0.CGO.1 — Campaign Director wizard workspace.
 */

import { useMemo, useState } from 'react';
import {
  campaignWorldGenesisEngine,
  creativeDirectionOrchestrationSystem,
  runConceptExecutionFidelityQA,
  diagnoseConceptDrift,
  directCreativeRevision,
  saveOrchestration,
  saveWorldBible,
} from '../../../../../shared/site00-expression-engine/campaign-genesis-orchestration/index.js';
import type {
  CampaignWorldBible,
  CampaignWorldCandidate,
  DirectorWizardStep,
  ProductCategory,
} from '../../../../../shared/site00-expression-engine/campaign-genesis-orchestration/types.js';
import { FORENSIC_BENCHMARK_LABEL } from '../../../../../shared/site00-expression-engine/campaign-genesis-orchestration/forensicBenchmark.js';
import { CampaignDirectorStepRail } from './CampaignDirectorStepRail';
import { CampaignDirectorWorldScreen } from './CampaignDirectorWorldScreen';
import { CampaignDirectorLookScreen } from './CampaignDirectorLookScreen';
import { CampaignDirectorStylingScreen } from './CampaignDirectorStylingScreen';
import { CampaignDirectorShotsScreen } from './CampaignDirectorShotsScreen';
import { CampaignDirectorSequenceScreen } from './CampaignDirectorSequenceScreen';
import { CampaignDirectorProductionScreen } from './CampaignDirectorProductionScreen';
import { CampaignDirectorReviewScreen } from './CampaignDirectorReviewScreen';
import { ForensicBenchmarkPanel } from './ForensicBenchmarkPanel';
import { BrandCreativeContextPanel } from '../brandContext/BrandCreativeContextPanel';
import { useBrandCreativeContext } from '../../../hooks/useBrandCreativeContext';

const STEPS: DirectorWizardStep[] = ['world', 'look', 'styling', 'shots', 'sequence', 'production', 'review'];

type Props = {
  projectSlug?: string;
  initialMode?: 'genesis' | 'forensic';
};

function slugToBrand(slug: string): string {
  const map: Record<string, string> = {
    ndxbook: 'ndxbook',
    'frontal-slayer': 'frontal-slayer',
    site00: 'site-00',
  };
  return map[slug.toLowerCase()] ?? slug.toLowerCase();
}

function slugToProduct(slug: string): ProductCategory {
  if (slug.includes('frontal')) return 'HAIR';
  if (slug.includes('ndx')) return 'GENERAL';
  return 'JEWELRY';
}

export function CampaignDirectorWorkspace({ projectSlug, initialMode = 'genesis' }: Props) {
  const brandSlug = projectSlug ? slugToBrand(projectSlug) : 'frontal-slayer';
  const productCategory = projectSlug ? slugToProduct(projectSlug) : 'HAIR';

  const [step, setStep] = useState<DirectorWizardStep>(initialMode === 'forensic' ? 'world' : 'world');
  const [showForensic, setShowForensic] = useState(initialMode === 'forensic');
  const [selectedCandidate, setSelectedCandidate] = useState<CampaignWorldCandidate | null>(null);
  const [worldBible, setWorldBible] = useState<CampaignWorldBible | null>(null);
  const { context: brandContext, gate, loading: contextLoading, viewOpen, setViewOpen, refresh } =
    useBrandCreativeContext(brandSlug);

  const genesis = useMemo(
    () =>
      campaignWorldGenesisEngine.generateWorldCandidates({
        brandSlug,
        productCategory,
        objective: 'LAUNCH',
        brandContext,
      }),
    [brandSlug, productCategory, brandContext],
  );

  const orchestration = useMemo(() => {
    if (!worldBible) return null;
    const o = creativeDirectionOrchestrationSystem.orchestrate(worldBible);
    saveOrchestration(worldBible.worldId, o);
    return o;
  }, [worldBible]);

  const handleApproveWorld = (candidate: CampaignWorldCandidate) => {
    const bible = campaignWorldGenesisEngine.approveWorldToBible({
      candidate,
      brandId: brandSlug,
      campaignId: `campaign-${brandSlug}`,
      brandContextVersion: brandContext?.version,
    });
    saveWorldBible(bible);
    setWorldBible(bible);
    setSelectedCandidate(candidate);
    setStep('look');
  };

  const fidelityDemo = useMemo(() => {
    if (!worldBible || !orchestration) return null;
    const genericDesc = 'Beautiful woman posing at pool table wearing jewelry — centered product hero shot';
    const qa = runConceptExecutionFidelityQA({
      assetDescription: genericDesc,
      visualQualityScore: 0.92,
      shotRole: 'CLUE',
      worldBible,
      executionBible: orchestration.execution,
    });
    const drift = diagnoseConceptDrift({
      conceptSummary: worldBible.conceptThesis,
      executionSummary: genericDesc,
    });
    const revision = directCreativeRevision({ diagnosis: drift, worldConcept: worldBible.conceptThesis });
    return { qa, drift, revision };
  }, [worldBible, orchestration]);

  return (
    <div className="site00-campaign-director">
      <header className="site00-campaign-director__hero">
        <p className="site00-campaign-director__eyebrow">CREATIVE INTELLIGENCE · P0.CGO.1</p>
        <h1 className="site00-campaign-director__title">CAMPAIGN DIRECTOR</h1>
        <p className="site00-campaign-director__subtitle">
          World genesis → creative direction → concept fidelity through execution
        </p>
      </header>

      <BrandCreativeContextPanel
        context={brandContext}
        gate={gate}
        loading={contextLoading}
        viewOpen={viewOpen}
        onViewContext={() => setViewOpen(true)}
        onCloseView={() => setViewOpen(false)}
        onRefresh={refresh}
        onBuildContext={refresh}
      />

      <div className="site00-campaign-director__mode-toggle">
        <button type="button" className={!showForensic ? 'active' : ''} onClick={() => setShowForensic(false)}>
          WORLD GENESIS
        </button>
        <button type="button" className={showForensic ? 'active' : ''} onClick={() => setShowForensic(true)}>
          {FORENSIC_BENCHMARK_LABEL}
        </button>
      </div>

      {showForensic ? (
        <ForensicBenchmarkPanel comparison={campaignWorldGenesisEngine.compareForensicVsWeak()} />
      ) : (
        <>
          <CampaignDirectorStepRail steps={STEPS} current={step} onSelect={setStep} worldApproved={!!worldBible} />

          {orchestration ? (
            <p className="site00-campaign-director__next-action">
              NEXT: {orchestration.nextAction.action}
            </p>
          ) : null}

          {step === 'world' && (
            <CampaignDirectorWorldScreen
              genesis={genesis}
              selected={selectedCandidate}
              onSelect={setSelectedCandidate}
              onApprove={handleApproveWorld}
              brandSlug={brandSlug}
            />
          )}
          {step === 'look' && worldBible && orchestration && (
            <CampaignDirectorLookScreen world={worldBible} execution={orchestration.execution} onContinue={() => setStep('styling')} />
          )}
          {step === 'styling' && worldBible && (
            <CampaignDirectorStylingScreen world={worldBible} onContinue={() => setStep('shots')} />
          )}
          {step === 'shots' && worldBible && orchestration && (
            <CampaignDirectorShotsScreen
              shots={orchestration.shots}
              world={worldBible}
              execution={orchestration.execution}
              onContinue={() => setStep('sequence')}
            />
          )}
          {step === 'sequence' && orchestration && (
            <CampaignDirectorSequenceScreen sequence={orchestration.sequence} onContinue={() => setStep('production')} />
          )}
          {step === 'production' && orchestration && (
            <CampaignDirectorProductionScreen
              shots={orchestration.shots}
              sequence={orchestration.sequence}
              onContinue={() => setStep('review')}
            />
          )}
          {step === 'review' && worldBible && orchestration && fidelityDemo && (
            <CampaignDirectorReviewScreen
              fidelity={fidelityDemo.qa}
              drift={fidelityDemo.drift}
              revision={fidelityDemo.revision}
            />
          )}
        </>
      )}
    </div>
  );
}
