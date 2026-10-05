/**
 * C1.5 — Entry 003 via global creative intelligence runtime (no Entry-specific SCJ routing).
 */

import {
  ENTRY_003_C14_GATE_ID,
  type Entry003C14BootstrapResult,
  type Entry003C14Package,
} from '../../../../shared/site00-expression-engine/entry-003/types.js';
import { bootstrapC13Entry003CinematicContinuity } from '../entry003/entry003C13Pipeline.js';
import { saveEntry003Package } from '../entry003/entry003Store.js';
import { getSeniorCreativeJudgmentArchitectureStack } from '../seniorCreativeJudgment/seniorCreativeJudgmentEngine.js';
import { runMarketingPackageMasterDirectorWithCreativeJudgment } from '../seniorCreativeJudgment/creativeIntelligenceRuntime.js';

export async function bootstrapC14Entry003SeniorCreativeJudgment(): Promise<Entry003C14BootstrapResult> {
  const c13 = await bootstrapC13Entry003CinematicContinuity();
  const pkg = c13.entry003Package;
  const winning = pkg.evolvedReview.winningConcept;

  const mpmd = await runMarketingPackageMasterDirectorWithCreativeJudgment();
  const entry003Run = mpmd.seniorJudgmentRuns.find((r) => r.unitId === 'entry-003');
  if (!entry003Run?.judgment) {
    throw new Error('Senior creative judgment missing from global runtime');
  }
  const seniorJudgment = entry003Run.judgment;

  const c14Pkg: Entry003C14Package = {
    ...pkg,
    sprint: 'C1.4_SENIOR_CREATIVE_JUDGMENT',
    gateId: ENTRY_003_C14_GATE_ID,
    status: seniorJudgment.blocksFounderReview
      ? 'NEEDS_FOUNDER_DIRECTION'
      : 'CREATIVE_DIRECTION_AWAITING_FOUNDER_REVIEW',
    seniorCreativeJudgment: seniorJudgment,
    architectureStack: getSeniorCreativeJudgmentArchitectureStack(),
    marketingPackageMasterDirector: mpmd,
    founderInterventionDependency:
      seniorJudgment.founderHandholdingRisk === 'HIGH'
        ? 'HIGH'
        : seniorJudgment.founderHandholdingRisk === 'MODERATE'
          ? 'MODERATE'
          : 'LOW',
    artifactRecord: {
      ...pkg.artifactRecord,
      artifact: winning.artifact,
      artifactFunction:
        seniorJudgment.artifactNecessity.outcome === 'SUPPORTING_ARTIFACT_ONLY'
          ? 'Supporting evidence only — environment/behavior primary receipt'
          : winning.artifactFunction,
      noPrimaryArtifact: seniorJudgment.artifactNecessity.outcome === 'NO_ARTIFACT_REQUIRED',
    },
  };

  saveEntry003Package(c14Pkg);

  return {
    sprint: 'C1.5_CREATIVE_INTELLIGENCE_RUNTIME',
    architectureLayer: 'SENIOR_CREATIVE_JUDGMENT_ENGINE',
    architectureStack: getSeniorCreativeJudgmentArchitectureStack(),
    providerDispatchCount: 0,
    imageProviderDispatchCount: 0,
    videoProviderDispatchCount: 0,
    falDispatchCount: 0,
    entry003Package: c14Pkg,
    seniorCreativeJudgment: seniorJudgment,
    cinematicContinuityDirector: c13.cinematicContinuityDirector,
    marketingPackageMasterDirector: mpmd,
    nextAction:
      'FOUNDER REVIEWS THE SENIOR CREATIVE JUDGMENT RESULT FOR ENTRY 003 AND JUDGES WHETHER STUDIO WORLD NOW IDENTIFIED AND RESOLVED THE SAME DEEPER CREATIVE ISSUES BEFORE THE FOUNDER HAD TO POINT THEM OUT.',
  };
}

export async function bootstrapC15CreativeIntelligenceRuntime(): Promise<{
  sprint: string;
  mpmd: Awaited<ReturnType<typeof runMarketingPackageMasterDirectorWithCreativeJudgment>>;
  blindTest: Awaited<ReturnType<typeof import('../seniorCreativeJudgment/creativeIntelligenceRuntime.js').runBlindCreativeMarketingTest>>;
  entry003Regression: Awaited<ReturnType<typeof import('../seniorCreativeJudgment/creativeIntelligenceRuntime.js').runEntry003SharedRegression>>;
  textReasoningDispatchCount: number;
  imageProviderDispatchCount: 0;
  videoProviderDispatchCount: 0;
  falDispatchCount: 0;
}> {
  const { runBlindCreativeMarketingTest, runEntry003SharedRegression } = await import(
    '../seniorCreativeJudgment/creativeIntelligenceRuntime.js'
  );
  const mpmd = await runMarketingPackageMasterDirectorWithCreativeJudgment();
  const blindTest = await runBlindCreativeMarketingTest();
  const entry003Regression = await runEntry003SharedRegression();

  return {
    sprint: 'C1.5_CREATIVE_INTELLIGENCE_RUNTIME',
    mpmd,
    blindTest,
    entry003Regression,
    textReasoningDispatchCount: mpmd.textReasoningDispatchCount + blindTest.textReasoningDispatchCount,
    imageProviderDispatchCount: 0,
    videoProviderDispatchCount: 0,
    falDispatchCount: 0,
  };
}

export async function bootstrapC16MultiUnitCreativeIntelligence(): Promise<{
  sprint: string;
  multiUnitBlindCampaign: import('../seniorCreativeJudgment/multiUnitCampaignArchitect.js').MultiUnitBlindCampaignOutput;
  mpmd: Awaited<ReturnType<typeof runMarketingPackageMasterDirectorWithCreativeJudgment>>;
  entry003Regression: Awaited<ReturnType<typeof import('../seniorCreativeJudgment/creativeIntelligenceRuntime.js').runEntry003SharedRegression>>;
  solsticeRegression: Awaited<ReturnType<typeof import('../seniorCreativeJudgment/creativeIntelligenceRuntime.js').runBlindCreativeMarketingTest>>;
  providerHealth: Awaited<ReturnType<typeof import('../seniorCreativeJudgment/creativeReasoningProvider.js').checkCreativeReasoningProviderHealth>>;
  persistenceMode: ReturnType<typeof import('../seniorCreativeJudgment/creativeIntelligenceStore.js').getCreativeIntelligenceStoreModeSync>;
  textReasoningDispatchCount: number;
  imageProviderDispatchCount: 0;
  videoProviderDispatchCount: 0;
  falDispatchCount: 0;
}> {
  const {
    runMultiUnitBlindCampaignPackage,
    runEntry003SharedRegression,
    runBlindCreativeMarketingTest,
    runMarketingPackageMasterDirectorWithCreativeJudgment,
    checkCreativeReasoningProviderHealth,
    initCreativeIntelligenceStore,
    getCreativeIntelligenceStoreModeSync,
  } = await import('../seniorCreativeJudgment/creativeIntelligenceRuntime.js');

  await initCreativeIntelligenceStore();
  const providerHealth = await checkCreativeReasoningProviderHealth();
  const multiUnitBlindCampaign = await runMultiUnitBlindCampaignPackage();
  const mpmd = await runMarketingPackageMasterDirectorWithCreativeJudgment();
  const entry003Regression = await runEntry003SharedRegression();
  const solsticeRegression = await runBlindCreativeMarketingTest();

  return {
    sprint: 'C1.6_MULTI_UNIT_CREATIVE_GLOBALIZATION',
    multiUnitBlindCampaign,
    mpmd,
    entry003Regression,
    solsticeRegression,
    providerHealth,
    persistenceMode: getCreativeIntelligenceStoreModeSync(),
    textReasoningDispatchCount:
      multiUnitBlindCampaign.textReasoningDispatchCount + mpmd.textReasoningDispatchCount,
    imageProviderDispatchCount: 0,
    videoProviderDispatchCount: 0,
    falDispatchCount: 0,
  };
}

export async function bootstrapC17CampaignCopyDirector(): Promise<{
  sprint: string;
  multiUnitBlindCampaign: import('../seniorCreativeJudgment/multiUnitCampaignArchitect.js').MultiUnitBlindCampaignOutput;
  copyPackage: NonNullable<
    import('../seniorCreativeJudgment/multiUnitCampaignArchitect.js').MultiUnitBlindCampaignOutput['copyPackage']
  >;
  providerHealth: Awaited<
    ReturnType<typeof import('../seniorCreativeJudgment/creativeReasoningProvider.js').checkCreativeReasoningProviderHealth>
  >;
  copyPersistenceMode: ReturnType<typeof import('../campaignCopy/campaignCopyStore.js').getCampaignCopyStoreMode>;
  textReasoningDispatchCount: number;
  imageProviderDispatchCount: 0;
  videoProviderDispatchCount: 0;
  falDispatchCount: 0;
}> {
  const { runMultiUnitBlindCampaignPackage } = await import(
    '../seniorCreativeJudgment/multiUnitCampaignArchitect.js'
  );
  const { checkCreativeReasoningProviderHealth } = await import(
    '../seniorCreativeJudgment/creativeReasoningProvider.js'
  );
  const { getCampaignCopyStoreMode } = await import('../campaignCopy/campaignCopyStore.js');

  const multiUnitBlindCampaign = await runMultiUnitBlindCampaignPackage();
  if (!multiUnitBlindCampaign.copyPackage) {
    throw new Error('CampaignCopyDirector did not produce copy package');
  }

  return {
    sprint: 'C1.7_CAMPAIGN_COPY_DIRECTOR',
    multiUnitBlindCampaign,
    copyPackage: multiUnitBlindCampaign.copyPackage,
    providerHealth: await checkCreativeReasoningProviderHealth(),
    copyPersistenceMode: getCampaignCopyStoreMode(),
    textReasoningDispatchCount: multiUnitBlindCampaign.textReasoningDispatchCount,
    imageProviderDispatchCount: 0,
    videoProviderDispatchCount: 0,
    falDispatchCount: 0,
  };
}

export async function bootstrapC18BrandTrueCopyIntelligence(): Promise<{
  sprint: string;
  multiBrandBlindTest: Awaited<
    ReturnType<typeof import('../campaignCopy/copyReasoningProvider.js').runMultiBrandLaunchCopyBlindTest>
  >;
  reasoningComparison: Awaited<
    ReturnType<typeof import('../campaignCopy/copyReasoningProvider.js').compareDeterministicVsFullReasoning>
  >;
  multiUnitBlindCampaign: import('../seniorCreativeJudgment/multiUnitCampaignArchitect.js').MultiUnitBlindCampaignOutput;
  providerHealth: Awaited<
    ReturnType<typeof import('../seniorCreativeJudgment/creativeReasoningProvider.js').checkCreativeReasoningProviderHealth>
  >;
  copyPersistenceMode: ReturnType<typeof import('../campaignCopy/campaignCopyStore.js').getCampaignCopyStoreMode>;
  copyRuntimeMode: import('../../../shared/site00-expression-engine/brand-language/types.js').CopyRuntimeMode;
  textReasoningDispatchCount: number;
  copyReasoningDispatchCount: number;
  imageProviderDispatchCount: 0;
  videoProviderDispatchCount: 0;
  falDispatchCount: 0;
}> {
  const { runMultiBrandLaunchCopyBlindTest, compareDeterministicVsFullReasoning, resolveCopyRuntimeMode } =
    await import('../campaignCopy/copyReasoningProvider.js');
  const { runMultiUnitBlindCampaignPackage } = await import(
    '../seniorCreativeJudgment/multiUnitCampaignArchitect.js'
  );
  const { checkCreativeReasoningProviderHealth } = await import(
    '../seniorCreativeJudgment/creativeReasoningProvider.js'
  );
  const { getCampaignCopyStoreMode } = await import('../campaignCopy/campaignCopyStore.js');
  const { evaluateCrossBrandVoiceDistance } = await import('../brandLanguage/crossBrandVoiceContaminationQA.js');

  const multiBrandBlindTest = await runMultiBrandLaunchCopyBlindTest('DETERMINISTIC_FALLBACK');
  const captionsByBrand = Object.fromEntries(
    multiBrandBlindTest.map((b) => [b.brandLanguageIdentity.brandId, b.result.primaryCaption]),
  );
  evaluateCrossBrandVoiceDistance(captionsByBrand);

  const reasoningComparison = await compareDeterministicVsFullReasoning();
  const multiUnitBlindCampaign = await runMultiUnitBlindCampaignPackage();
  const copyRuntimeMode = await resolveCopyRuntimeMode();

  return {
    sprint: 'C1.8_BRAND_TRUE_COPY_INTELLIGENCE',
    multiBrandBlindTest,
    reasoningComparison,
    multiUnitBlindCampaign,
    providerHealth: await checkCreativeReasoningProviderHealth(),
    copyPersistenceMode: getCampaignCopyStoreMode(),
    copyRuntimeMode,
    textReasoningDispatchCount: multiUnitBlindCampaign.textReasoningDispatchCount,
    copyReasoningDispatchCount: multiUnitBlindCampaign.copyPackage?.copyReasoningDispatchCount ?? 0,
    imageProviderDispatchCount: 0,
    videoProviderDispatchCount: 0,
    falDispatchCount: 0,
  };
}

export async function bootstrapC19LiveCreativeIntelligence(): Promise<
  Awaited<ReturnType<typeof import('../runC19LiveProductionProof.js').runC19LiveProductionProof>>
> {
  const { runC19LiveProductionProof } = await import('../runC19LiveProductionProof.js');
  return runC19LiveProductionProof();
}

export async function bootstrapC19R1MeridianLiveProof(): Promise<
  Awaited<ReturnType<typeof import('../runC19R1MeridianLiveProof.js').runC19R1MeridianLiveProof>> & {
    view: import('../meridianComparisonSerializer.js').MeridianComparisonViewPayload;
  }
> {
  const { runC19R1MeridianLiveProof } = await import('../runC19R1MeridianLiveProof.js');
  const { serializeC19R1ForComparisonView } = await import('../meridianComparisonSerializer.js');
  const result = await runC19R1MeridianLiveProof();
  return { ...result, view: serializeC19R1ForComparisonView(result) };
}

export async function bootstrapC19R3MeridianLivePostRedeploy(): Promise<
  Awaited<ReturnType<typeof import('../runC19R3MeridianLivePostRedeploy.js').runC19R3MeridianLivePostRedeploy>> & {
    view: import('../meridianComparisonSerializer.js').MeridianComparisonViewPayload;
  }
> {
  const { runC19R3MeridianLivePostRedeploy } = await import('../runC19R3MeridianLivePostRedeploy.js');
  const { serializeC19R1ForComparisonView } = await import('../meridianComparisonSerializer.js');
  const result = await runC19R3MeridianLivePostRedeploy();
  return { ...result, view: serializeC19R1ForComparisonView(result) };
}

export async function bootstrapC19R2MeridianLiveAcceptance(): Promise<
  Awaited<ReturnType<typeof import('../runC19R2MeridianLiveAcceptance.js').runC19R2MeridianLiveAcceptance>> & {
    view: import('../meridianComparisonSerializer.js').MeridianComparisonViewPayload;
  }
> {
  const { runC19R2MeridianLiveAcceptance } = await import('../runC19R2MeridianLiveAcceptance.js');
  const { serializeC19R1ForComparisonView } = await import('../meridianComparisonSerializer.js');
  const result = await runC19R2MeridianLiveAcceptance();
  return { ...result, view: serializeC19R1ForComparisonView(result) };
}
