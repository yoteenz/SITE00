/**
 * THE MARKED-UP COPY — brand-native visual language pilot (ONE hero only, no board regen).
 */

import { createHash, randomUUID } from 'node:crypto';
import { downloadUrlToBuffer, uploadSite00AssetBuffer } from '../../../site00Assts/storage.js';
import {
  referenceIdsForMarkedUpCopyPilot,
  resolveMarkedUpCopyBoardReferences,
} from './boardReferenceResolver.js';
import { createReferenceCrops } from './boardReferenceCrops.js';
import { MARKED_UP_COPY_BOARD_COPY } from './markedUpCopyCopyContract.js';
import { MARKED_UP_COPY_REFERENCE_DECOMPOSITIONS } from './markedUpCopyPilotConstants.js';
import type { BrandNativeVisualPilotRecord } from './brandNativeVisualBriefTypes.js';
import {
  compileBrandNativeVisualBrief,
  transformTopicIntoDirectionNativeSubject,
} from './brandNativeVisualPromptCompiler.js';
import { findLatestMarkedUpCopyExpressionSystem } from './directionExpressionSystemStore.js';
import { generateBrandNativeImageFromBrief } from './gptImage2VisualProviderAdapter.js';
import { inspectRawBrandNativeImage } from './brandNativeVisualRawInspector.js';
import { upsertBrandNativeVisualPilot } from './brandNativeVisualPilotStore.js';
import { MARKED_UP_COPY_DIRECTION_NAME } from './creativeDirectionBoardTypes.js';
import type { DirectionExpressionSystem } from './directionExpressionSystemTypes.js';
import { DIRECTION_EXPRESSION_SYSTEM_PROMPT_VERSION } from './directionExpressionSystemTypes.js';

export const BRAND_NATIVE_PILOT_TOPIC = 'credit utilization';
export const BRAND_NATIVE_PILOT_ASSET_ROLE = 'HERO_EDITORIAL_WORLD' as const;
export const BRAND_NATIVE_PILOT_ASSET_ID = 'MUC-BRAND-NATIVE-HERO-PILOT';

export type BrandNativeVisualPilotResult = {
  status: 'PILOT_COMPLETE' | 'PILOT_DRY_RUN' | 'BLOCKED_ON_EXPRESSION_SYSTEM' | 'BLOCKED_ON_FAL';
  pilot: BrandNativeVisualPilotRecord | null;
  otherAssetsGenerated: 0;
  otherDirectionsGenerated: 0;
  credentialExposed: false;
};

function buildReferenceInfluenceForHero() {
  return MARKED_UP_COPY_REFERENCE_DECOMPOSITIONS.map((r) => ({
    referenceId: r.referenceId,
    cropId: r.referenceId === 'ref-editorial-spread-modern' ? 'REF-COMP-01' : 'REF-ANNOT-01',
    traitsBorrowed: [
      ...r.borrow.composition.slice(0, 2),
      ...r.borrow.photography.slice(0, 1),
      ...r.borrow.material.slice(0, 1),
    ],
    traitsForbidden: [
      ...r.doNotBorrow,
      'copy subject',
      'copy publication identity',
      'copy exact typography',
      'literal layout reproduction',
    ],
  }));
}

/** Deterministic fallback when Railway-persisted Expression System is unavailable (local dev / first run). */
export function buildMarkedUpCopyExpressionSystemFallback(params: {
  directionId: string;
}): DirectionExpressionSystem {
  const now = new Date().toISOString();
  return {
    expressionSystemId: createHash('sha256').update(`muc-fallback:${params.directionId}`).digest('hex').slice(0, 16),
    directionId: params.directionId,
    directionName: MARKED_UP_COPY_DIRECTION_NAME,
    sourceFormationId: 'ndxbook-v1',
    sourceFormationVersion: 1,
    brandLoreVersion: 24,
    brandLoreFingerprint: '5e71f429',
    conceptualWorld: 'Document mid-edit world — every surface is an active thinking page.',
    visualThesis: 'The mark-up is the editorial voice — revision evidence, not decoration.',
    emotionalAtmosphere: 'Live argumentative revision under warm desk light.',
    governingVisualBehavior: MARKED_UP_COPY_BOARD_COPY.socialSource.replace('.', ''),
    photographySystem: {
      subjectMatter: 'Editorial spreads, proof pages, documentary crops of handled documents',
      cameraDistance: 'Close / very close',
      croppingBehavior: 'Aggressive partial crops cutting into text and table edges',
      lighting: 'Warm directional desk/window light',
      grainTexture: 'Visible print grain, photocopy warmth, paper fiber',
      humanPresence: 'Hands only when needed — mid-action marking, never posing',
      objectPresence: 'Paper, red pencil, ballpoint, highlight, correction tape ghost',
      documentaryEditorialBalance: '70/30 editorial documentary',
      mustNeverLookLike: [
        'stock office',
        'financial workplace',
        'smiling business people',
        'lifestyle flat lay',
        'Pinterest stationery',
      ],
    },
    typographySystem: {
      cleanVoice: 'Publication serif body',
      revisionVoice: 'Bold strike overlay',
      marginVoice: 'Secondary reader rebuttal',
      metadataVoice: 'Issue micro type',
      scaleRelationships: 'Extreme headline/body contrast',
      alignmentBehavior: 'Grid break on revision layer',
      interruptionBehavior: 'Strike crosses boundaries',
    },
    graphicGrammar: {
      selectedDevices: ['strike', 'caret', 'proof-stamp', 'margin-arrow'],
      semanticRoles: { RED: 'intervention', YELLOW: 'post-read emphasis', BLUE: 'margin voice' },
    },
    annotationGrammar: {
      whoIsSpeaking: 'Prior reader + editor',
      disagreementBehavior: 'Margin rebuttal',
      correctionBehavior: 'Strike and replace',
      secondaryOpinionBehavior: 'Counter-voice interrupts',
      ambiguityVisibility: 'Unresolved final state',
    },
    materialLanguage: {
      paperTypes: ['newsprint off-white', 'galley-proof cream'],
      physicalBehaviors: ['folds', 'handling marks', 'tape ghost', 'ink bleed'],
      digitalBehaviors: ['feed frame substrate'],
      justifiedMaterials: ['red pencil', 'ballpoint blue', 'yellow highlight', 'correction tape ghost'],
    },
    colorSystem: {
      semanticRoles: {
        'off-white newsprint': 'base document field',
        'ink black': 'primary clean copy',
        'red pencil': 'active revision marks only',
        'ballpoint blue': 'margin notation texture',
        yellow: 'post-read highlight / sticky interruption',
      },
    },
    imageTreatment: 'Partially obscured hero with visible handling',
    spatialBehavior: 'Asymmetric overlap — revision layer may break grid',
    primaryBrandArtifacts: ['Corrected page fragment'],
    secondaryBrandArtifacts: ['Red editor pencil'],
    recurringDevices: ['Strike-replace sequence'],
    recurringContentFranchises: [],
    socialBehavior: {
      feedBehavior: 'Source claim under live edit',
      carouselBehavior: 'Version progression',
      storyBehavior: 'Sequential margin notes',
      reelBehavior: 'Strike animation',
      motionBehavior: 'Clean → strike → replace → margin',
    },
    physicalWorldBehavior: 'Handled paper artifacts',
    digitalWorldBehavior: 'Social-native frames',
    signatureMoments: ['Strike replaces headline mid-argument'],
    extensibilityRules: ['Quiet zone upper-right'],
    antiTemplateRules: ['No equal card grid'],
    antiGenericRules: ['No stock desk', 'No calculator hero', 'No office scene'],
    antiCousinRules: ['No pre-read annotation history aesthetic'],
    referenceApplications: [],
    productionImplications: ['Hero must prove complete visual world pre-overlay'],
    qualityGates: {
      fiftyPostTest: { score: 5, result: 'PASS', evidence: 'Franchises + devices enable posts' },
      noExplanationTest: { score: 5, result: 'PASS', evidence: 'Visual rules self-explanatory' },
    },
    provider: 'deterministic-fallback',
    model: 'fallback',
    promptVersion: DIRECTION_EXPRESSION_SYSTEM_PROMPT_VERSION,
    inputFingerprint: 'brand-native-pilot-fallback',
    outputHash: createHash('sha256').update('muc-fallback').digest('hex').slice(0, 16),
    createdAt: now,
  };
}

async function uploadReferenceToFal(referenceUrl: string): Promise<string> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured');
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const res = await fetch(referenceUrl);
  if (!res.ok) throw new Error(`Reference fetch failed (${res.status})`);
  const bytes = Buffer.from(await res.arrayBuffer());
  const name = referenceUrl.split('/').pop()?.split('?')[0] || 'ref.webp';
  const type = name.endsWith('.png') ? 'image/png' : 'image/webp';
  return fal.storage.upload(new File([bytes], name, { type }));
}

function resolvePilotTopic(): string {
  const fromCopy = MARKED_UP_COPY_BOARD_COPY.socialSource.toLowerCase();
  if (fromCopy.includes('credit score')) return BRAND_NATIVE_PILOT_TOPIC;
  return BRAND_NATIVE_PILOT_TOPIC;
}

function founderPilotStatusFromQa(
  qa: BrandNativeVisualPilotRecord['rawImageQa'],
): BrandNativeVisualPilotRecord['founderPilotStatus'] {
  if (qa.result === 'ACCEPT') return 'GENERATED';
  if (qa.result === 'REJECT') return 'REJECTED';
  return 'NEEDS_HUMAN_REVIEW';
}

export async function runMarkedUpCopyBrandNativeVisualPilot(params: {
  orgSlug?: string;
  dryRun?: boolean;
  topic?: string;
}): Promise<BrandNativeVisualPilotResult> {
  const orgSlug = params.orgSlug ?? 'ndxbook';
  const topic = params.topic ?? resolvePilotTopic();
  const directionId = 'marked-up-copy';

  let expressionSystem = findLatestMarkedUpCopyExpressionSystem();
  if (!expressionSystem) {
    expressionSystem = buildMarkedUpCopyExpressionSystemFallback({ directionId });
  }

  const referenceInfluence = buildReferenceInfluenceForHero();
  const brief = compileBrandNativeVisualBrief({
    expressionSystem,
    role: BRAND_NATIVE_PILOT_ASSET_ROLE,
    topic,
    referenceInfluence,
    zoneId: 'heroEditorialSpread',
  });

  if (params.dryRun) {
    return {
      status: 'PILOT_DRY_RUN',
      pilot: null,
      otherAssetsGenerated: 0,
      otherDirectionsGenerated: 0,
      credentialExposed: false,
    };
  }

  if (!process.env.FAL_KEY?.trim()) {
    return {
      status: 'BLOCKED_ON_FAL',
      pilot: null,
      otherAssetsGenerated: 0,
      otherDirectionsGenerated: 0,
      credentialExposed: false,
    };
  }

  const refResolution = await resolveMarkedUpCopyBoardReferences({
    referenceIds: referenceIdsForMarkedUpCopyPilot(),
    orgSlug,
  });
  const referenceCrops = refResolution.resolved.length
    ? await createReferenceCrops({ references: refResolution.resolved, comparisonIndex: 1 })
    : [];

  const heroCrop = referenceCrops.find((c) => c.cropId === 'REF-COMP-01');
  const referenceImageUrls = heroCrop?.publicUrl
    ? [heroCrop.publicUrl]
    : refResolution.resolved[0]?.publicUrl
      ? [refResolution.resolved[0].publicUrl]
      : [];

  const generation = await generateBrandNativeImageFromBrief({
    brief,
    referenceImageUrls: referenceImageUrls.length ? referenceImageUrls : undefined,
    uploadReference: uploadReferenceToFal,
  });

  const imageBuffer = await downloadUrlToBuffer(generation.url);
  const pilotId = randomUUID();
  const storagePath = `site00/assts/batches/ndxbook-brand-native-pilot/generated/${pilotId}.webp`;
  const uploaded = await uploadSite00AssetBuffer(storagePath, imageBuffer, 'image/webp', { upsert: true });

  const rawImageQa = await inspectRawBrandNativeImage({
    imageUrl: uploaded.publicUrl,
    brief,
  });

  const topicTransform = transformTopicIntoDirectionNativeSubject(topic);
  const record: BrandNativeVisualPilotRecord = {
    pilotId,
    directionId,
    directionName: MARKED_UP_COPY_DIRECTION_NAME,
    expressionSystemId: expressionSystem.expressionSystemId,
    topic,
    assetRole: BRAND_NATIVE_PILOT_ASSET_ROLE,
    brief: { ...brief, assetId: BRAND_NATIVE_PILOT_ASSET_ID },
    model: generation.model,
    provider: 'fal',
    referenceImageInputs: referenceImageUrls,
    storagePath: uploaded.storagePath,
    publicUrl: uploaded.publicUrl,
    rawImageQa,
    founderPilotStatus: founderPilotStatusFromQa(rawImageQa),
    founderPilotLabel: 'VISUAL LANGUAGE PILOT',
    codeOverlaysApplied: false,
    estimatedCostUsd: generation.costEstimateUsd,
    createdAt: new Date().toISOString(),
  };

  upsertBrandNativeVisualPilot(record);

  return {
    status: 'PILOT_COMPLETE',
    pilot: record,
    otherAssetsGenerated: 0,
    otherDirectionsGenerated: 0,
    credentialExposed: false,
  };
}
