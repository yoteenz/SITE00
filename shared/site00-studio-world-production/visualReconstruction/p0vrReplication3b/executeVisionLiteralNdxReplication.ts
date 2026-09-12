/**
 * P0.VR.REPLICATION.3B — Vision-in-the-loop literal replication (NDX overview mobile).
 */

import type { ReconstructionTwinSession } from '../p0vrUpgrade2/types.js';
import { generateLiteralRegionSource } from './literalRegionSourceGenerator.js';
import {
  createBrowserVisionReplicationClient,
  createTestFixtureVisionClient,
  ensureHeroLiteralSpec,
} from './visionReplicationClient.js';
import { runVisionReplicationInspector } from './visionReplicationInspector.js';
import {
  captureTwinScreenshotRef,
  heroRecognizableFromScores,
  runHeroVisionCorrectionPasses,
} from './playwrightVisionLoop.js';
import { scoreRegionLiterality } from './regionLiteralityScore.js';
import { VISION_LITERAL_REGION_ORDER, P0_VR_REPLICATION_3B_BUILD, MIN_HERO_SUBREGIONS } from './constants.js';
import type { VisionReplicationClient, VisionReplicationReport, VisionReplicationReceipt } from './types.js';
import { LITERAL_UI_REPLICATION_PROMPT_CLASS } from './types.js';

export type VisionLiteralReplicationResult = {
  report: VisionReplicationReport;
  sessionPatch: Partial<ReconstructionTwinSession>;
};

function buildReceipt(input: {
  provider: string;
  model: string;
  authorityImage: string;
  twinImage: string | null;
  region: string;
  observationCount: number;
  status: VisionReplicationReceipt['status'];
}): VisionReplicationReceipt {
  return {
    provider: input.provider,
    model: input.model,
    inputImages: [
      { role: 'authority', bytesOrRef: input.authorityImage.slice(0, 120), received: Boolean(input.authorityImage) },
      { role: 'twin', bytesOrRef: input.twinImage?.slice(0, 120) ?? 'pending', received: Boolean(input.twinImage) },
    ],
    region: input.region as VisionReplicationReceipt['region'],
    visionPromptClass: LITERAL_UI_REPLICATION_PROMPT_CLASS,
    observationCount: input.observationCount,
    confidence: input.status === 'OK' ? 'HIGH' : 'MEDIUM',
    status: input.status,
    createdAt: new Date().toISOString(),
  };
}

export async function executeVisionLiteralNdxReplication(input: {
  session: ReconstructionTwinSession;
  twinVersionId: string;
  authorityImageUrl: string | null;
  twinPreviewUrl?: string | null;
  visionClient?: VisionReplicationClient;
  preVisionBaselineRenderMode?: 'SHELL_FIRST_NDX_OVERVIEW';
}): Promise<VisionLiteralReplicationResult> {
  const client = input.visionClient ?? (process.env.VITEST === 'true' ? createTestFixtureVisionClient() : createBrowserVisionReplicationClient());
  const audit = client.auditProvider();
  const authorityImage = input.authorityImageUrl ?? input.session.designAuthorityAssetRef ?? '';

  let twinScreenshot = await captureTwinScreenshotRef(input.twinPreviewUrl ?? input.session.twinRoute, input.session.viewport);
  if (!twinScreenshot && input.session.twinRoute) {
    twinScreenshot = `twin-route:${input.session.twinRoute}`;
  }

  const inspection = await runVisionReplicationInspector({
    authorityImage,
    twinScreenshot,
    viewport: input.session.viewport,
    regionIds: [...VISION_LITERAL_REGION_ORDER],
    client,
    domSummary: 'NDXBOOK overview mobile twin',
  });

  let literalSpecs = ensureHeroLiteralSpec(inspection.literalSpecs);
  const heroSpec = literalSpecs.find((s) => s.regionId === 'hero-editorial');
  const heroSource = heroSpec ? generateLiteralRegionSource(heroSpec) : null;

  const regionScores = literalSpecs.map((spec) => {
    const obs = inspection.regions.find((r) => r.regionId === spec.regionId);
    return scoreRegionLiterality({
      spec,
      observation: obs ?? inspection.regions[0],
      afterPass: false,
    });
  });

  let correctionPasses = heroSpec
    ? runHeroVisionCorrectionPasses({
        heroSpec,
        initialScore: regionScores.find((s) => s.regionId === 'hero-editorial')?.overall ?? 45,
      })
    : [];

  const afterScores = literalSpecs.map((spec) =>
    scoreRegionLiterality({
      spec,
      observation: inspection.regions.find((r) => r.regionId === spec.regionId) ?? inspection.regions[0],
      afterPass: true,
    }),
  );

  const heroRecognizable =
    heroRecognizableFromScores(afterScores) &&
    (heroSpec?.subregions.length ?? 0) >= MIN_HERO_SUBREGIONS &&
    heroSource != null &&
    !heroSource.collapsed;

  const capabilityLimit =
    !heroRecognizable &&
    correctionPasses.length >= 3 &&
    inspection.genericFailures.includes('hero-editorial');

  const receipts: VisionReplicationReceipt[] = [
    buildReceipt({
      provider: audit.provider,
      model: audit.model,
      authorityImage,
      twinImage: twinScreenshot,
      region: 'whole-page',
      observationCount: inspection.regions.length + (inspection.wholePage ? 1 : 0),
      status: inspection.wholePage?.status === 'OK' || inspection.wholePage == null ? 'OK' : inspection.wholePage.status,
    }),
  ];

  const newTwinVersionId = `${input.twinVersionId}_vision_${Date.now()}`;

  const report: VisionReplicationReport = {
    reportId: `vrr_${input.session.sessionId}_${Date.now()}`,
    sessionId: input.session.sessionId,
    buildRef: P0_VR_REPLICATION_3B_BUILD,
    providerAudit: audit,
    wholePageObservation: inspection.wholePage,
    regionObservations: inspection.regions,
    literalRegionSpecs: literalSpecs,
    correctionPasses,
    regionScores: afterScores,
    receipts,
    preVisionBaselineRenderMode: input.preVisionBaselineRenderMode ?? 'SHELL_FIRST_NDX_OVERVIEW',
    twinRenderMode: 'VISION_LITERAL_NDX_OVERVIEW',
    newTwinVersionId,
    heroRecognizable,
    capabilityLimit,
    nextStrategy: capabilityLimit ? 'DIRECT_VISUAL_CODE_GENERATION_WITH_VISION_QA' : heroRecognizable ? 'CONTINUE_VISION_LOOP' : null,
    playwrightLoopUsed: Boolean(twinScreenshot?.startsWith('playwright:')),
    createdAt: new Date().toISOString(),
  };

  const generatedSources = literalSpecs.map((s) => generateLiteralRegionSource(s));

  return {
    report,
    sessionPatch: {
      twinRenderMode: 'VISION_LITERAL_NDX_OVERVIEW',
      preVisionBaselineRenderMode: input.preVisionBaselineRenderMode ?? 'SHELL_FIRST_NDX_OVERVIEW',
      visionReplicationReport: report,
      visionLiteralRegionSpecs: literalSpecs,
      visionGeneratedSources: generatedSources,
      twinVersionId: newTwinVersionId,
      twinVersions: [
        ...(input.session.twinVersions ?? []),
        {
          versionId: newTwinVersionId,
          sessionId: input.session.sessionId,
          revisionNumber: (input.session.twinVersions?.length ?? 0) + 1,
          buildRef: P0_VR_REPLICATION_3B_BUILD,
          commitSha: null,
          createdAt: new Date().toISOString(),
          status: 'READY',
        },
      ],
    },
  };
}
