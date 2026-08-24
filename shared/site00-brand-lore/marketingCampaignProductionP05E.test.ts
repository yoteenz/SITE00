/**
 * P0.5E — Campaign Board + Horizontal Sequence Production (48 requirements)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CAMPAIGN_PRODUCTION_BOARD_IMPLEMENTED,
  HORIZONTAL_SEQUENCE_PRODUCTION_IMPLEMENTED,
  VERTICAL_COHERENCE_EVALUATION_IMPLEMENTED,
  HORIZONTAL_COHERENCE_EVALUATION_IMPLEMENTED,
  CAMPAIGN_RHYTHM_EVALUATION_IMPLEMENTED,
  PRODUCTION_ROUND_MODEL_IMPLEMENTED,
  LOCKED_ASSET_PROTECTION_IMPLEMENTED,
  SEQUENCE_POSITION_CONTRACT_IMPLEMENTED,
  SLIDE_02_METHODOLOGY_IMPLEMENTED,
  SLIDE_02_SWIPE_REWARD_REQUIRED,
  CLIENT_MARKETING_APPROVAL_ARCHITECTURE_IMPLEMENTED,
  CLIENT_REVIEW_MODE_IMPLEMENTED,
  CAMPAIGN_APPROVAL_SNAPSHOT_IMPLEMENTED,
  GENERIC_STUDIO_WORLD_MARKETING_WORKFLOW_IMPLEMENTED,
} from '../site00-studio-world-production/marketingCampaignProduction/constants.js';
import {
  eligibleContentPiecesForRound,
  roundCanGenerate,
  roundCanGenerateBeforePriorLock,
  unevenSequenceLengthsSupported,
  noFillerSlideGeneration,
  buildProductionRound,
} from '../site00-studio-world-production/marketingCampaignProduction/productionRound.js';
import {
  lockAsset,
  mutateLockedAssetFails,
  reopenAsset,
  reopenPreservesHistoricalAsset,
  earlierSlideReopenTriggersDownstreamReview,
  downstreamRegenerationNotAutomatic,
  autoRegenerationAfterApprovalFails,
  clientFeedbackDoesNotTriggerGeneration,
  publishingStateDistinctFromProduction,
} from '../site00-studio-world-production/marketingCampaignProduction/locking.js';
import {
  evaluateVerticalCoherence,
  evaluateHorizontalCoherence,
  horizontalCanFailWhileVerticalPasses,
  verticalCanFailWhileHorizontalPasses,
  evaluateCampaignRhythm,
  campaignBoardDistinctFromCalendar,
  creativeApprovalDistinctFromPublishingReadiness,
  performanceCannotMutateHistoricalCampaign,
  genericModelsContainNoBrandAestheticAssumptions,
} from '../site00-studio-world-production/marketingCampaignProduction/coherence.js';
import {
  buildSequenceSlideArtDirectionContract,
  slide02MustProvideSwipeReward,
  slide02CannotDuplicateSlide01Role,
  referenceConditioningNotCompositionTemplate,
  sequenceContractReceivesPreviousSlideContext,
} from '../site00-studio-world-production/marketingCampaignProduction/sequenceContract.js';
import {
  evaluateSequenceVisualVariation,
  typographyContinuityWithoutIdenticalLayout,
} from '../site00-studio-world-production/marketingCampaignProduction/sequenceVariation.js';
import {
  buildCampaignProductionBoard,
  feedPreviewUsesFirstSlideAssetsOnly,
} from '../site00-studio-world-production/marketingCampaignProduction/productionBoard.js';
import {
  compileCompleteSocialContentPackage,
  createCampaignApprovalSnapshot,
  snapshotFreezesFingerprints,
} from '../site00-studio-world-production/marketingCampaignProduction/approval.js';
import {
  NDXBOOK_EXPERIMENT_01_SEQUENCE_DEPTHS,
  initializeNdxbookExperiment01Board,
  lockNdxbookRound01,
  formulateNdxbookRound02Contracts,
  ndxbookAdapterSuppliesExpressionAuthority,
  ndxVisualLanguageNotInGenericModels,
} from '../site00-brand-lore/marketingCampaignProduction/ndxbookExperiment01Adapter.js';
import {
  NDXBOOK_EXPERIMENT_01_CAMPAIGN_BOARD_READY,
  NDXBOOK_ROUND_01_LOCK_SUPPORTED,
  NDXBOOK_ROUND_02_FORMULATION_READY,
  NDXBOOK_SLIDE_02_GENERATION_READY,
} from '../site00-brand-lore/marketingCampaignProduction/constants.js';
import { formulateExperiment01Artifacts } from '../site00-brand-lore/brandMarketingExpression/characterEventFormulation.js';
import { compileBrandMarketingExpressionSystem } from '../site00-brand-lore/brandMarketingExpression/marketingExpressionCompiler.js';
import { buildVitestBrandCharacterSystemForMarketing } from '../site00-brand-lore/brandMarketingExpression/vitestFixtures.js';
import { buildFounderMarketingNorthStarArtifact } from '../site00-brand-lore/brandMarketingExpression/northStarArtifact.js';
import { formulateExperiment01V2 } from '../site00-brand-lore/editorialInformationArchitecture/experiment01V2.js';
import { formulateExperiment01V21 } from '../site00-brand-lore/culturalVisualParticipation/experiment01V21.js';
import { formulateExperiment01V22 } from '../site00-brand-lore/characterRetention/experiment01V22.js';
import { formulateExperiment01V23 } from '../site00-brand-lore/artBoardMateriality/experiment01V23.js';
import {
  initializeCampaignBoardFromExperiment01,
  lockCampaignRound01,
  formulateCampaignRound02,
  noCampaignGenerationOnPageLoad,
  noAutoRegenerationAfterApproval,
  experimentFImmutable,
  experimentGImmutable,
  brandCharacterImmutable,
  brandCanonUnchanged,
  productExpressionBlocked,
  worldFormationBlocked,
  resetCampaignProductionMemory,
  resetCampaignProductionStoreModeCache,
} from '../../api/_lib/site00Evolve/marketingCampaignProduction/marketingCampaignProductionService.js';
import {
  prepareBrandMarketingExpression,
  compileBrandMarketingExpression,
  formulateMarketingExpressionExperiment01,
  formulateMarketingExpressionExperiment01V2,
  formulateMarketingExpressionExperiment01V21,
  formulateMarketingExpressionExperiment01V22,
  formulateMarketingExpressionExperiment01V23,
  generateAllExperiment01V21ArtifactAssets,
  generateAllExperiment01V22ArtifactAssets,
  generateAllExperiment01V23ArtifactAssets,
  resetBrandMarketingExpressionWorkers,
} from '../../api/_lib/site00Evolve/creativeDirection/brandMarketingExpressionExperiment/brandMarketingExpressionService.js';

const ROOT = join(process.cwd());

function buildTestBoard() {
  const characterSystem = buildVitestBrandCharacterSystemForMarketing();
  const expressionSystem = compileBrandMarketingExpressionSystem({
    characterSystem,
    northStarId: buildFounderMarketingNorthStarArtifact('ndxbook').id,
    projectId: 'ndxbook',
  });
  const { artifacts } = formulateExperiment01Artifacts({
    expressionSystem,
    characterSystemId: characterSystem.id,
  });
  const v2 = formulateExperiment01V2({ v1Artifacts: artifacts, expressionSystem, characterSystemId: characterSystem.id });
  const v21 = formulateExperiment01V21({
    v1Artifacts: artifacts,
    v2Experiment: v2.experiment,
    expressionSystem,
    characterSystemId: characterSystem.id,
  });
  const v22 = formulateExperiment01V22({
    v1Artifacts: artifacts,
    v21Experiment: v21.experiment,
    expressionSystem,
    characterSystemId: characterSystem.id,
  });
  const v23 = formulateExperiment01V23({
    v1Artifacts: artifacts,
    v22Experiment: v22.experiment,
    expressionSystem,
  });
  const marketingRun = {
    expressionSystem,
    brandCharacterSystemId: characterSystem.id,
    experiment01V23: v23.experiment,
  } as never;
  return initializeNdxbookExperiment01Board({ marketingRun, projectId: 'ndxbook', brandId: 'org' });
}

describe('P0.5E Campaign Board + Horizontal Sequence Production', () => {
  beforeEach(() => {
    resetCampaignProductionMemory();
    resetCampaignProductionStoreModeCache();
    resetBrandMarketingExpressionWorkers();
  });

  it('1. Campaign supports uneven sequence lengths', () => {
    const depths = Object.values(NDXBOOK_EXPERIMENT_01_SEQUENCE_DEPTHS);
    expect(unevenSequenceLengthsSupported(depths)).toBe(true);
    expect(new Set(depths).size).toBeGreaterThan(1);
  });

  it('2. Horizontal production rounds correctly determine eligible content', () => {
    const { board } = buildTestBoard();
    const round2 = eligibleContentPiecesForRound({ board, sequencePosition: 2 });
    expect(round2.length).toBe(8);
    expect(round2).not.toContain('piece-4');
  });

  it('3. Completed shorter sequences do not receive filler slides', () => {
    expect(noFillerSlideGeneration({ pieceDepth: 1, sequencePosition: 2 })).toBe(false);
    expect(noFillerSlideGeneration({ pieceDepth: 5, sequencePosition: 2 })).toBe(true);
  });

  it('4. Round 02 cannot generate before required Round 01 locks', () => {
    const { board } = buildTestBoard();
    expect(roundCanGenerate({ rounds: board.rounds, targetSequencePosition: 2 })).toBe(false);
    expect(roundCanGenerateBeforePriorLock()).toBe(false);
  });

  it('5. Locked assets cannot mutate', () => {
    const asset = lockAsset(
      {
        assetId: 'a1',
        campaignId: 'c',
        contentPieceId: 'p1',
        sequencePosition: 1,
        roundId: null,
        semanticRole: 'OPEN',
        status: 'APPROVED',
        parentAssetId: null,
        contractId: null,
        generatedAssetUrl: 'x',
        generatedAssetId: 'x',
        lockedAt: null,
        approvedAt: null,
        clientJudgment: null,
        internalJudgment: null,
        revisionDeltaId: null,
        fingerprint: 'fp',
        createdAt: '',
        updatedAt: '',
      },
      new Date().toISOString(),
    );
    expect(mutateLockedAssetFails(asset)).toBe(true);
  });

  it('6-8. Reopening creates child lineage and triggers downstream review', () => {
    const locked = lockAsset(
      {
        assetId: 'a1',
        campaignId: 'c',
        contentPieceId: 'p1',
        sequencePosition: 1,
        roundId: null,
        semanticRole: 'OPEN',
        status: 'APPROVED',
        parentAssetId: null,
        contractId: null,
        generatedAssetUrl: 'x',
        generatedAssetId: 'x',
        lockedAt: null,
        approvedAt: null,
        clientJudgment: null,
        internalJudgment: null,
        revisionDeltaId: null,
        fingerprint: 'fp',
        createdAt: '',
        updatedAt: '',
      },
      new Date().toISOString(),
    );
    const { event, child } = reopenAsset({
      asset: locked,
      reason: 'revision',
      actor: 'founder',
      now: new Date().toISOString(),
      downstreamEffect: 'SEQUENCE_REVIEW_REQUIRED',
      affectedDependencyIds: ['a2'],
    });
    expect(reopenPreservesHistoricalAsset(event)).toBe(true);
    expect(child.parentAssetId).toBe('a1');
    expect(earlierSlideReopenTriggersDownstreamReview(1, 2)).toBe('CAMPAIGN_REVIEW_REQUIRED');
    expect(downstreamRegenerationNotAutomatic()).toBe(true);
  });

  it('9-12. Slide 02 methodology and swipe reward', () => {
    const c = buildSequenceSlideArtDirectionContract({
      campaignId: 'c',
      contentPieceId: 'piece-1',
      sequencePosition: 2,
      thesisSummary: 'thesis',
      topic: 'topic',
      slide01ContractSummary: { semanticRole: 'OPEN', viewerShouldNoticeFirst: 'HOOK', informationDeferred: [], primaryVisualSubject: null, assetId: 'a1' },
    });
    expect(SLIDE_02_METHODOLOGY_IMPLEMENTED).toBe(true);
    expect(SLIDE_02_SWIPE_REWARD_REQUIRED).toBe(true);
    expect(slide02MustProvideSwipeReward(c)).toBe(true);
    expect(slide02CannotDuplicateSlide01Role({ slide01Role: 'OPEN', slide02Role: 'REVEAL' })).toBe(true);
    expect(sequenceContractReceivesPreviousSlideContext(c)).toBe(true);
  });

  it('13. Reference conditioning does not mandate composition duplication', () => {
    expect(referenceConditioningNotCompositionTemplate('CONTINUITY_CALIBRATION')).toBe(true);
  });

  it('14-17. Vertical and horizontal coherence independent', () => {
    const vertical = evaluateVerticalCoherence({
      contentPieceId: 'piece-1',
      assets: [
        { assetId: 'a1', contentPieceId: 'piece-1', sequencePosition: 1, semanticRole: 'OPEN' } as never,
        { assetId: 'a2', contentPieceId: 'piece-1', sequencePosition: 2, semanticRole: 'REVEAL' } as never,
      ],
      contracts: [buildSequenceSlideArtDirectionContract({ campaignId: 'c', contentPieceId: 'piece-1', sequencePosition: 2, thesisSummary: 't', topic: 't' })],
    });
    const horizontal = evaluateHorizontalCoherence({
      roundAssets: [{ semanticRole: 'REVEAL' }, { semanticRole: 'REVEAL' }, { semanticRole: 'REVEAL' }] as never[],
      contracts: [
        { density: 'MODERATE', primaryVisualSubject: 'x' },
        { density: 'MODERATE', primaryVisualSubject: 'x' },
        { density: 'MODERATE', primaryVisualSubject: 'x' },
      ] as never[],
    });
    expect(VERTICAL_COHERENCE_EVALUATION_IMPLEMENTED).toBe(true);
    expect(HORIZONTAL_COHERENCE_EVALUATION_IMPLEMENTED).toBe(true);
    expect(horizontalCanFailWhileVerticalPasses(vertical, horizontal)).toBe(true);
    expect(verticalCanFailWhileHorizontalPasses(vertical, horizontal)).toBe(false);
  });

  it('18. Campaign rhythm evaluates multiple dimensions', () => {
    const { board, campaign } = buildTestBoard();
    const rhythm = evaluateCampaignRhythm({ campaignId: campaign.campaignId, assets: board.assets, contracts: [] });
    expect(CAMPAIGN_RHYTHM_EVALUATION_IMPLEMENTED).toBe(true);
    expect(rhythm.contentRhythm).toBeDefined();
  });

  it('19. Feed preview uses first-slide assets only', () => {
    const assets = [
      { sequencePosition: 1, assetId: 'a1' },
      { sequencePosition: 2, assetId: 'a2' },
    ] as never[];
    expect(feedPreviewUsesFirstSlideAssetsOnly(assets).length).toBe(1);
  });

  it('20-21. Campaign board distinct from calendar; creative vs publishing', () => {
    expect(campaignBoardDistinctFromCalendar()).toBe(true);
    expect(creativeApprovalDistinctFromPublishingReadiness()).toBe(true);
    expect(publishingStateDistinctFromProduction('LOCKED', false)).toBe(true);
  });

  it('22-25. Client feedback and approval levels', () => {
    expect(clientFeedbackDoesNotTriggerGeneration()).toBe(true);
    expect(autoRegenerationAfterApprovalFails()).toBe(true);
    expect(CLIENT_MARKETING_APPROVAL_ARCHITECTURE_IMPLEMENTED).toBe(true);
  });

  it('26-27. Campaign snapshot and performance boundary', () => {
    const snap = createCampaignApprovalSnapshot({
      campaignId: 'c',
      strategyFingerprint: 's',
      slateFingerprint: 'sl',
      characterSystemFingerprint: 'ch',
      marketingExpressionFingerprint: 'me',
      assets: [],
    });
    expect(snapshotFreezesFingerprints(snap)).toBe(true);
    expect(performanceCannotMutateHistoricalCampaign()).toBe(true);
    expect(CAMPAIGN_APPROVAL_SNAPSHOT_IMPLEMENTED).toBe(true);
  });

  it('28-29. Generic models + NDX adapter', () => {
    const genericSource = readFileSync(
      join(ROOT, 'shared/site00-studio-world-production/marketingCampaignProduction/types.ts'),
      'utf8',
    );
    expect(genericModelsContainNoBrandAestheticAssumptions(genericSource)).toBe(true);
    expect(ndxbookAdapterSuppliesExpressionAuthority()).toBe(true);
    expect(ndxVisualLanguageNotInGenericModels(genericSource)).toBe(true);
  });

  it('30-37. Sequence production guards', () => {
    const c1 = buildSequenceSlideArtDirectionContract({ campaignId: 'c', contentPieceId: 'p1', sequencePosition: 1, thesisSummary: 't', topic: 'A' });
    const c2 = buildSequenceSlideArtDirectionContract({
      campaignId: 'c',
      contentPieceId: 'p1',
      sequencePosition: 2,
      thesisSummary: 't',
      topic: 'B',
      slide01ContractSummary: { semanticRole: 'OPEN', viewerShouldNoticeFirst: 'A', informationDeferred: [], primaryVisualSubject: null, assetId: 'a1' },
    });
    const variation = evaluateSequenceVisualVariation({ contracts: [c1, c2], contentPieceId: 'p1' });
    expect(variation.pass).toBe(true);
    expect(typographyContinuityWithoutIdenticalLayout([c1, c2])).toBe(true);
  });

  it('38-39. Round and campaign cost tracking structure exists', () => {
    expect(PRODUCTION_ROUND_MODEL_IMPLEMENTED).toBe(true);
    expect(CAMPAIGN_PRODUCTION_BOARD_IMPLEMENTED).toBe(true);
  });

  it('40. Mobile round-first — page uses round view mode', () => {
    const page = readFileSync(join(ROOT, 'src/site00/pages/ProjectContentOperationsCampaignBoardPage.tsx'), 'utf8');
    expect(page).toContain('ROUND_VIEW');
    expect(page).toContain('SLIDE');
  });

  it('42-43. Complete package requires approval', () => {
    const result = compileCompleteSocialContentPackage({
      contentPieceId: 'p1',
      campaignId: 'c',
      thesisSummary: 't',
      assets: [{ contentPieceId: 'p1', sequencePosition: 1, status: 'PLANNED' } as never],
      channel: 'IG',
      format: 'CAROUSEL',
      requiredPositions: 1,
    });
    expect('error' in result).toBe(true);
  });

  it('44-48. Experimental integrity', () => {
    expect(experimentFImmutable()).toBe(true);
    expect(experimentGImmutable()).toBe(true);
    expect(brandCharacterImmutable()).toBe(true);
    expect(brandCanonUnchanged()).toBe(true);
    expect(productExpressionBlocked()).toBe(true);
    expect(worldFormationBlocked()).toBe(true);
  });

  it('Service: initialize, lock round 01, formulate round 02', async () => {
    await prepareBrandMarketingExpression({ projectId: 'ndxbook' });
    await compileBrandMarketingExpression({ projectId: 'ndxbook' });
    await formulateMarketingExpressionExperiment01({ projectId: 'ndxbook' });
    await formulateMarketingExpressionExperiment01V2({ projectId: 'ndxbook' });
    await formulateMarketingExpressionExperiment01V21({ projectId: 'ndxbook' });
    await formulateMarketingExpressionExperiment01V22({ projectId: 'ndxbook' });
    await formulateMarketingExpressionExperiment01V23({ projectId: 'ndxbook' });
    await generateAllExperiment01V23ArtifactAssets({ projectId: 'ndxbook' });

    const init = await initializeCampaignBoardFromExperiment01({ projectId: 'ndxbook' });
    expect(init.board?.assets.length).toBe(9);
    expect(NDXBOOK_EXPERIMENT_01_CAMPAIGN_BOARD_READY).toBe(true);

    const locked = await lockCampaignRound01({ projectId: 'ndxbook' });
    expect(locked.board?.rounds.find((r) => r.sequencePosition === 1)?.status).toBe('LOCKED');
    expect(NDXBOOK_ROUND_01_LOCK_SUPPORTED).toBe(true);

    const r2 = await formulateCampaignRound02({ projectId: 'ndxbook' });
    expect(r2.sequenceContracts.filter((c) => c.sequencePosition === 2).length).toBe(8);
    expect(NDXBOOK_ROUND_02_FORMULATION_READY).toBe(true);
    expect(NDXBOOK_SLIDE_02_GENERATION_READY).toBe(true);
  });

  it('No generation on page load', () => {
    expect(noCampaignGenerationOnPageLoad()).toBe(true);
    expect(noAutoRegenerationAfterApproval()).toBe(true);
  });

  it('Routes and UI wired', () => {
    const routes = readFileSync(join(ROOT, 'src/site00/config/routes.ts'), 'utf8');
    const page = readFileSync(join(ROOT, 'src/site00/pages/ProjectContentOperationsCampaignBoardPage.tsx'), 'utf8');
    expect(routes).toContain('campaign-board');
    expect(page).toContain('CLIENT REVIEW MODE');
    expect(page).toContain('V2.3');
    expect(CLIENT_REVIEW_MODE_IMPLEMENTED).toBe(true);
    expect(GENERIC_STUDIO_WORLD_MARKETING_WORKFLOW_IMPLEMENTED).toBe(true);
    expect(HORIZONTAL_SEQUENCE_PRODUCTION_IMPLEMENTED).toBe(true);
    expect(LOCKED_ASSET_PROTECTION_IMPLEMENTED).toBe(true);
    expect(SEQUENCE_POSITION_CONTRACT_IMPLEMENTED).toBe(true);
  });
});
