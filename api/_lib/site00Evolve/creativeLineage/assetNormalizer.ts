/**
 * Normalize existing NDXBOOK validation outputs into CreativeAssetRecords.
 * Idempotent — does NOT mutate source JSONB runs.
 */

import type { CanonicalCarouselExpansionRun } from '../../../../shared/site00-brand-lore/canonicalCarouselExpansionTypes.js';
import type { CanonicalCreativeRangeRun } from '../../../../shared/site00-brand-lore/canonicalCreativeRangeTypes.js';
import type {
  CreativeAssetRecord,
  CreativeConceptRecord,
  CreativeFamily,
  ContentFranchiseRecord,
  EditorialIdeaRecord,
} from '../../../../shared/site00-brand-lore/creativeLineage/types.js';
import { CANONICAL_NDXBOOK_DIRECTION_NAMES } from '../../../../shared/site00-brand-lore/canonicalCreativeRangeConstants.js';
import { NDXBOOK_ORG_ID } from '../creativeDirection/creativeIntelligence/founderComparisonSet.js';
import {
  buildCarouselSlideAssetRecord,
  buildRangeHeroAssetRecord,
} from './assetRecordBuilders.js';

const TOPIC_ID = 'credit-utilization';
const TOPIC_NAME = 'CREDIT UTILIZATION';

function nowIso(): string {
  return new Date().toISOString();
}

function familyId(topicId: string, directionId: string): string {
  return `family-${topicId}-${directionId}`;
}

function buildHeroAssetFromRange(params: {
  rangeRun: CanonicalCreativeRangeRun;
  canonVersion: number;
}): { assets: CreativeAssetRecord[]; families: CreativeFamily[] } {
  const assets: CreativeAssetRecord[] = [];
  const families: CreativeFamily[] = [];
  const ts = nowIso();

  for (const dir of params.rangeRun.directions) {
    if (!dir.heroAsset?.storagePath) continue;

    const worldId = `world-${dir.directionId}`;
    const fid = familyId(TOPIC_ID, dir.directionId);
    const asset = buildRangeHeroAssetRecord({ dir, canonVersion: params.canonVersion, ts });

    families.push({
      familyId: fid,
      brandSlug: 'ndxbook',
      orgId: NDXBOOK_ORG_ID,
      topicId: TOPIC_ID,
      directionId: dir.directionId,
      directionName: dir.canonicalName,
      worldId,
      name: `${TOPIC_NAME} / ${dir.canonicalName} / HERO FAMILY`,
      primaryAssetId: asset.assetId,
      memberAssetIds: [asset.assetId],
      memberConceptIds: [],
      memberFranchiseIds: [],
      status: 'ACTIVE',
      createdAt: ts,
      updatedAt: ts,
    });

    assets.push(asset);
  }
  return { assets, families };
}

function buildCarouselAssets(params: {
  carouselRun: CanonicalCarouselExpansionRun;
  heroAssetsByDirection: Map<string, CreativeAssetRecord>;
  canonVersion: number;
}): { assets: CreativeAssetRecord[]; families: CreativeFamily[] } {
  const assets: CreativeAssetRecord[] = [];
  const families: CreativeFamily[] = [];
  const ts = nowIso();

  for (const dir of params.carouselRun.directions) {
    const worldId = `world-${dir.directionId}`;
    const fid = familyId(TOPIC_ID, dir.directionId);
    const hero = params.heroAssetsByDirection.get(dir.directionId);
    const memberIds: string[] = hero ? [hero.assetId] : [];

    for (const slide of dir.slides) {
      if (!slide.asset?.storagePath) continue;

      if (slide.preserved && slide.slideNumber === 1 && hero) {
        continue;
      }

      const asset = buildCarouselSlideAssetRecord({
        dir,
        slide,
        carouselExperimentVersion: params.carouselRun.carouselExperimentVersion,
        canonVersion: params.canonVersion,
        hero: hero ?? null,
        ts,
      });
      memberIds.push(asset.assetId);
      assets.push(asset);
    }

    if (hero && memberIds.length > 1) {
      hero.relationship.derivedAssetIds = memberIds.filter((id) => id !== hero.assetId);
    }

    families.push({
      familyId: fid,
      brandSlug: 'ndxbook',
      orgId: NDXBOOK_ORG_ID,
      topicId: TOPIC_ID,
      directionId: dir.directionId,
      directionName: dir.directionName,
      worldId,
      name: `${TOPIC_NAME} / ${dir.directionName} / CAROUSEL FAMILY`,
      primaryAssetId: hero?.assetId ?? memberIds[0] ?? null,
      memberAssetIds: memberIds,
      memberConceptIds: [],
      memberFranchiseIds: [],
      status: 'ACTIVE',
      createdAt: ts,
      updatedAt: ts,
    });
  }
  return { assets, families };
}

function buildConceptsFromDirections(
  rangeRun: CanonicalCreativeRangeRun | null,
  canonVersion: number,
): CreativeConceptRecord[] {
  const ts = nowIso();
  const portableCores: Record<string, { expression: string; core: string; type: CreativeConceptRecord['conceptType'] }> = {
    'THE MARKED-UP COPY': {
      expression: 'Live revision — strike, replace, margin argument',
      core: 'Make editorial correction visible and entertaining',
      type: 'EDITORIAL_MECHANIC',
    },
    'THE COUNTDOWN ROOM': {
      expression: 'Ranked scoreboard / leaderboard world',
      core: 'Rank information confidently — placement IS the entertainment',
      type: 'CONTENT_FRANCHISE',
    },
    'THE PERSONAL ARCHIVE': {
      expression: 'Saved screenshots, notes, receipts in personal folder',
      core: 'Personal evidence accumulation as trust signal',
      type: 'ARTIFACT_CONCEPT',
    },
    'THE ANNOTATED COPY': {
      expression: 'Pre-lived-in document with accumulated margin notes',
      core: 'Layer skeptical reading over source material',
      type: 'EDITORIAL_MECHANIC',
    },
    'THE ROOM WHERE IT HAPPENS': {
      expression: 'Editorial room / working wall / inside-the-room spatiality',
      core: 'Show the editorial process as accessible drama',
      type: 'AUDIENCE_RITUAL',
    },
    'THE INDEX': {
      expression: 'Classification system / cross-references / taxonomy',
      core: 'Organize complex information through index logic',
      type: 'INFORMATION_ARCHITECTURE',
    },
  };

  return CANONICAL_NDXBOOK_DIRECTION_NAMES.map((name, i) => {
    const spec = portableCores[name]!;
    const rangeDir = rangeRun?.directions.find((d) => d.canonicalName === name);
    const directionId = rangeDir?.directionId ?? `canonical-direction-${i + 1}`;
    return {
      conceptId: `concept-${directionId}-${spec.type.toLowerCase()}`,
      brandSlug: 'ndxbook',
      orgId: NDXBOOK_ORG_ID,
      originDirectionId: directionId,
      originDirectionName: name,
      originWorldId: `world-${directionId}`,
      conceptType: spec.type,
      name: `${name} — ${spec.type.replace(/_/g, ' ')}`,
      description: spec.expression,
      whyItWorks: spec.core,
      originalExpression: spec.expression,
      portableCore: spec.core,
      directionSpecificElements: [name, spec.expression],
      visualDependencies: [spec.expression],
      voiceDependencies: ['NDXBOOK editorial voice'],
      formatDependencies: ['CAROUSEL', 'FEED', 'STORY'],
      topicDependencies: [TOPIC_NAME],
      reuseAssessment: spec.type === 'CONTENT_FRANCHISE' ? 'PORTABLE_WITH_TRANSLATION' : 'PORTABLE',
      founderJudgment: null,
      canonStatus: 'NON_CANON',
      salvageClassification: null,
      createdAt: ts,
      updatedAt: ts,
    };
  });
}

function buildFranchises(canonVersion: number): ContentFranchiseRecord[] {
  const ts = nowIso();
  return [
    {
      franchiseId: 'franchise-countdown-utilization',
      brandSlug: 'ndxbook',
      orgId: NDXBOOK_ORG_ID,
      name: 'UTILIZATION COUNTDOWN',
      originDirectionId: 'canonical-direction-2',
      originWorldId: 'world-canonical-direction-2',
      description: 'Rank credit factors — utilization placement as entertainment',
      editorialPromise: 'Make the scoreboard argument part of the story',
      audienceValue: 'Understand what matters most in your score',
      repeatability: 'HIGH — new rankings per topic',
      nativeFormats: ['CAROUSEL', 'FEED', 'REEL'],
      topicRange: ['credit', 'finance literacy'],
      voiceBehavior: 'Confident ranking with wit',
      visualBehavior: 'Scoreboard / placement (origin: Countdown Room)',
      motionBehavior: 'Rank shifts between slides',
      frequencyPotential: 'Weekly',
      evergreenPotential: 'HIGH',
      reactivePotential: 'MEDIUM',
      saveabilityPotential: 'HIGH',
      status: 'PROPOSED',
      translationPolicy: 'TRANSLATE_TO_WINNING_WORLD',
      createdAt: ts,
      updatedAt: ts,
    },
  ];
}

function buildEditorialIdeas(): EditorialIdeaRecord[] {
  const ts = nowIso();
  return [
    {
      ideaId: 'idea-credit-utilization-statement-date',
      brandSlug: 'ndxbook',
      orgId: NDXBOOK_ORG_ID,
      originDirectionId: 'canonical-direction-1',
      originWorldId: 'world-canonical-direction-1',
      ideaType: 'EPISODE',
      title: 'WHICH BALANCE GETS REPORTED?',
      premise: 'Statement date vs payment date — the utilization number lenders see',
      whyItMatters: 'Most people optimize the wrong balance snapshot',
      audienceValue: 'Actionable timing insight',
      contentPotential: 'Carousel + reel + saveable reference',
      suggestedFormats: ['CAROUSEL', 'STORY', 'FEED'],
      suggestedFranchises: ['franchise-countdown-utilization'],
      portableCore: 'Reporting timing determines the utilization lenders see',
      status: 'PROMISING',
      createdAt: ts,
      updatedAt: ts,
    },
  ];
}

export type NormalizationResult = {
  assetsNormalized: number;
  conceptsNormalized: number;
  franchisesNormalized: number;
  familiesNormalized: number;
  ideasNormalized: number;
};

export function normalizeFromValidationRuns(params: {
  rangeRun: CanonicalCreativeRangeRun | null;
  carouselRun: CanonicalCarouselExpansionRun | null;
  brandCanonVersion?: number;
}): {
  assets: CreativeAssetRecord[];
  concepts: CreativeConceptRecord[];
  franchises: ContentFranchiseRecord[];
  families: CreativeFamily[];
  ideas: EditorialIdeaRecord[];
} {
  const canonVersion = params.brandCanonVersion ?? 0;
  let assets: CreativeAssetRecord[] = [];
  let families: CreativeFamily[] = [];

  if (params.rangeRun) {
    const range = buildHeroAssetFromRange({ rangeRun: params.rangeRun, canonVersion });
    assets = [...assets, ...range.assets];
    families = [...families, ...range.families];
  }

  if (params.carouselRun) {
    const heroMap = new Map(assets.filter((a) => a.assetType === 'HERO').map((a) => [a.directionLineage.directionId, a]));
    const carousel = buildCarouselAssets({
      carouselRun: params.carouselRun,
      heroAssetsByDirection: heroMap,
      canonVersion,
    });
    assets = [...assets.filter((a) => !carousel.assets.some((c) => c.assetId === a.assetId)), ...carousel.assets];
    for (const f of carousel.families) {
      const idx = families.findIndex((x) => x.familyId === f.familyId);
      if (idx >= 0) families[idx] = f;
      else families.push(f);
    }
  }

  return {
    assets,
    concepts: buildConceptsFromDirections(params.rangeRun, canonVersion),
    franchises: buildFranchises(canonVersion),
    families,
    ideas: buildEditorialIdeas(),
  };
}

export async function persistNormalization(
  data: ReturnType<typeof normalizeFromValidationRuns>,
  store: typeof import('./storeAdapter.js'),
): Promise<NormalizationResult> {
  for (const asset of data.assets) await store.upsertCreativeAsset(asset);
  for (const concept of data.concepts) await store.upsertCreativeConcept(concept);
  for (const franchise of data.franchises) await store.upsertContentFranchise(franchise);
  for (const family of data.families) await store.upsertCreativeFamily(family);
  for (const idea of data.ideas) await store.upsertEditorialIdea(idea);
  return {
    assetsNormalized: data.assets.length,
    conceptsNormalized: data.concepts.length,
    franchisesNormalized: data.franchises.length,
    familiesNormalized: data.families.length,
    ideasNormalized: data.ideas.length,
  };
}

export { buildCarouselSlideAssetRecord, buildRangeHeroAssetRecord } from './assetRecordBuilders.js';
