/**
 * Sonnet senior creative-director pass — production board art-direction authority (v3).
 * Deterministic fallback is NOT founder-ready production art direction.
 */

import { createHash } from 'node:crypto';
import { parseStructuredJson } from './formationValidation.js';
import { getCreativeIntelligenceProvider } from './providerRegistry.js';
import { callAnthropicForCompletion } from './anthropicCompletion.js';
import { ANTHROPIC_CREATIVE_MODEL } from './config.js';
import type {
  BoardAssetDecision,
  BoardAssetManifestEntry,
  BoardCompositionMap,
  BoardCreativeCritique,
  BoardCreativeDirectorPass,
  BoardHierarchyPlan,
  BoardReferenceTranslationDecision,
  CreativeDirectionBoard,
  CreativeDirectionBoardArtDirection,
  CreativeDirectionBoardPlan,
  ResolvedBoardReference,
} from './creativeDirectionBoardTypes.js';
import {
  FOUNDER_VISUAL_FEEDBACK_V2,
  MARKED_UP_COPY_BOARD_PLAN_VERSION_V3,
} from './creativeDirectionBoardTypes.js';
import type { ComparisonDirectionCandidate, CoreDirectionFormationInput } from './types.js';
import { MARKED_UP_COPY_IMMUTABLE } from './markedUpCopyCopyContract.js';
import { buildFallbackBoardArtDirection } from './boardArtDirectionService.js';
import { desktopMapV3, mobileMapV3 } from './markedUpCopyBoardPlanV3.js';

export const BOARD_CREATIVE_DIRECTOR_PROMPT_VERSION = 'marked-up-copy-board-creative-director-v3';

export const BOARD_CREATIVE_DIRECTOR_SYSTEM_PROMPT = `You are a SENIOR CREATIVE DIRECTOR reviewing and redesigning ONE existing Core Direction board.

You are NOT a copywriter, brand strategist, direction generator, web designer, or moodboard generator.
The Core Direction already exists. DO NOT create a new Core Direction.

THE MARKED-UP COPY must not merely SHOW editing — THE BOARD ITSELF MUST FEEL EDITED.
Editorial friction must alter COMPOSITION, not decorate it.

Return structured JSON only — no markdown fences.

Required shape:
{
  "critique": {
    "whatWorks": ["string"],
    "whatFeelsMechanical": ["string"],
    "whatIsTooSafe": ["string"],
    "whatIsTooClean": ["string"],
    "whatIsTooEven": ["string"],
    "whatNeedsMoreTension": ["string"],
    "whatNeedsMoreNegativeSpace": ["string"],
    "whatNeedsMoreScaleContrast": ["string"],
    "whatNeedsMoreMateriality": ["string"],
    "whatNeedsMoreReferenceTranslation": ["string"],
    "whatNeedsMoreBrandSpecificity": ["string"],
    "whatShouldBeRemoved": ["string"],
    "whatShouldBecomeDominant": ["string"],
    "whatShouldBecomeSecondary": ["string"],
    "whatShouldOverlap": ["string"],
    "whatShouldBreakTheGrid": ["string"],
    "whatShouldRemainQuiet": ["string"]
  },
  "artDirection": {
    "boardStory": "string",
    "firstRead": "string",
    "secondRead": "string",
    "thirdRead": "string",
    "signatureMoment": "string",
    "visualHierarchy": "string",
    "compositionBehavior": "string",
    "negativeSpaceStrategy": "string",
    "imageLanguageApplication": "string",
    "materialApplication": "string",
    "typographicBehavior": "string",
    "graphicGrammar": "string",
    "annotationGrammar": "string",
    "artifactBehavior": "string",
    "socialBehavior": "string",
    "motionBehavior": "string",
    "referenceApplication": ["string"],
    "antiGenericRules": ["string"],
    "antiCousinRules": ["string"]
  },
  "hierarchy": {
    "dominantEvent": "string",
    "supportingDiscoveries": ["string"],
    "minorEvidence": ["string"],
    "quietZone": "string"
  },
  "referenceTranslations": [{
    "referenceId": "string",
    "cropId": "string",
    "trait": "string",
    "currentBoardUnderuse": "string",
    "newBoardTranslation": "string",
    "zone": "heroEditorialSpread",
    "assetManifestId": "MU01",
    "compositionDecision": "string"
  }],
  "typographicVoices": {
    "cleanVoice": "string",
    "revisionVoice": "string",
    "marginVoice": "string",
    "metadataVoice": "string"
  },
  "graphicGrammar": {
    "selectedDevices": ["string"],
    "semanticBehavior": "string"
  },
  "colorRoles": {
    "BLACK": "published clean copy",
    "RED": "editorial intervention"
  },
  "socialSystem": "string",
  "motionSystem": "string",
  "assetDecisions": [{
    "manifestId": "MU01",
    "decision": "REUSE_AS_IS|REUSE_WITH_NEW_CROP|REUSE_WITH_EDIT|REGENERATE|REMOVE|NEW_ASSET_REQUIRED",
    "rationale": "string",
    "referenceConditioned": true
  }],
  "creativeDirectionAuthorityScore": 4
}`;

function fingerprintInput(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16);
}

export function isProductionSonnetConfigured(): boolean {
  return getCreativeIntelligenceProvider().providerId !== 'unavailable';
}

export function isFounderReadyArtDirection(artDirection: CreativeDirectionBoardArtDirection): boolean {
  return artDirection.lineage.provider === 'anthropic';
}

function arr(v: unknown): string[] {
  return Array.isArray(v) ? v.map(String).filter(Boolean) : [];
}

function normalizeCritique(
  raw: Record<string, unknown>,
  meta: BoardCreativeCritique['lineage'],
): BoardCreativeCritique {
  const c = (raw.critique ?? raw) as Record<string, unknown>;
  return {
    whatWorks: arr(c.whatWorks),
    whatFeelsMechanical: arr(c.whatFeelsMechanical),
    whatIsTooSafe: arr(c.whatIsTooSafe),
    whatIsTooClean: arr(c.whatIsTooClean),
    whatIsTooEven: arr(c.whatIsTooEven),
    whatNeedsMoreTension: arr(c.whatNeedsMoreTension),
    whatNeedsMoreNegativeSpace: arr(c.whatNeedsMoreNegativeSpace),
    whatNeedsMoreScaleContrast: arr(c.whatNeedsMoreScaleContrast),
    whatNeedsMoreMateriality: arr(c.whatNeedsMoreMateriality),
    whatNeedsMoreReferenceTranslation: arr(c.whatNeedsMoreReferenceTranslation),
    whatNeedsMoreBrandSpecificity: arr(c.whatNeedsMoreBrandSpecificity),
    whatShouldBeRemoved: arr(c.whatShouldBeRemoved),
    whatShouldBecomeDominant: arr(c.whatShouldBecomeDominant),
    whatShouldBecomeSecondary: arr(c.whatShouldBecomeSecondary),
    whatShouldOverlap: arr(c.whatShouldOverlap),
    whatShouldBreakTheGrid: arr(c.whatShouldBreakTheGrid),
    whatShouldRemainQuiet: arr(c.whatShouldRemainQuiet),
    lineage: meta,
  };
}

function normalizeArtDirection(
  raw: Record<string, unknown>,
  meta: CreativeDirectionBoardArtDirection['lineage'],
): CreativeDirectionBoardArtDirection {
  const art = (raw.artDirection ?? raw) as Record<string, unknown>;
  return {
    boardStory: String(art.boardStory ?? ''),
    firstRead: String(art.firstRead ?? ''),
    secondRead: String(art.secondRead ?? ''),
    thirdRead: String(art.thirdRead ?? ''),
    signatureMoment: String(art.signatureMoment ?? ''),
    visualHierarchy: String(art.visualHierarchy ?? ''),
    compositionBehavior: String(art.compositionBehavior ?? ''),
    negativeSpaceStrategy: String(art.negativeSpaceStrategy ?? ''),
    imageLanguageApplication: String(art.imageLanguageApplication ?? ''),
    materialApplication: String(art.materialApplication ?? ''),
    typographicBehavior: String(art.typographicBehavior ?? ''),
    graphicGrammar: String(art.graphicGrammar ?? ''),
    annotationGrammar: String(art.annotationGrammar ?? ''),
    artifactBehavior: String(art.artifactBehavior ?? ''),
    socialBehavior: String(art.socialBehavior ?? ''),
    motionBehavior: String(art.motionBehavior ?? ''),
    referenceApplication: arr(art.referenceApplication),
    antiGenericRules: arr(art.antiGenericRules),
    antiCousinRules: arr(art.antiCousinRules),
    lineage: meta,
  };
}

function normalizeAssetDecisions(raw: unknown): BoardAssetDecision[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const o = item as Record<string, unknown>;
    const decision = String(o.decision ?? 'REUSE_AS_IS') as BoardAssetDecision['decision'];
    return {
      manifestId: String(o.manifestId ?? ''),
      decision,
      rationale: String(o.rationale ?? ''),
      referenceConditioned: o.referenceConditioned === true,
    };
  });
}

function normalizeReferenceTranslations(raw: unknown): BoardReferenceTranslationDecision[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const o = item as Record<string, unknown>;
    return {
      referenceId: String(o.referenceId ?? ''),
      cropId: o.cropId ? String(o.cropId) : undefined,
      trait: String(o.trait ?? ''),
      currentBoardUnderuse: String(o.currentBoardUnderuse ?? ''),
      newBoardTranslation: String(o.newBoardTranslation ?? ''),
      zone: String(o.zone ?? 'heroEditorialSpread') as BoardReferenceTranslationDecision['zone'],
      assetManifestId: String(o.assetManifestId ?? ''),
      compositionDecision: String(o.compositionDecision ?? ''),
    };
  });
}

function normalizeHierarchy(raw: unknown): BoardHierarchyPlan {
  const h = (raw ?? {}) as Record<string, unknown>;
  return {
    dominantEvent: String(h.dominantEvent ?? ''),
    supportingDiscoveries: arr(h.supportingDiscoveries),
    minorEvidence: arr(h.minorEvidence),
    quietZone: String(h.quietZone ?? ''),
  };
}

export function parseSonnetCreativeDirectorResponse(params: {
  text: string;
  inputFingerprint: string;
  v2Plan: CreativeDirectionBoardPlan;
  v2AssetManifest: BoardAssetManifestEntry[];
}): BoardCreativeDirectorPass {
  const parsed = parseStructuredJson(params.text) as Record<string, unknown>;
  const outputHash = createHash('sha256').update(params.text).digest('hex').slice(0, 16);
  const meta = {
    provider: 'anthropic',
    model: ANTHROPIC_CREATIVE_MODEL,
    promptVersion: BOARD_CREATIVE_DIRECTOR_PROMPT_VERSION,
    inputFingerprint: params.inputFingerprint,
    outputHash,
    createdAt: new Date().toISOString(),
  };

  const artDirection = normalizeArtDirection(parsed, meta);
  const critique = normalizeCritique(parsed, meta);
  const hierarchy = normalizeHierarchy(parsed.hierarchy);
  const assetDecisions = normalizeAssetDecisions(parsed.assetDecisions);
  const referenceTranslations = normalizeReferenceTranslations(parsed.referenceTranslations);

  const typographicVoices = parsed.typographicVoices as Record<string, unknown> | undefined;
  const graphicGrammar = parsed.graphicGrammar as Record<string, unknown> | undefined;
  const colorRoles = (parsed.colorRoles ?? {}) as Record<string, string>;

  return {
    critique,
    artDirection,
    hierarchy,
    referenceTranslations,
    typographicVoices: {
      cleanVoice: String(typographicVoices?.cleanVoice ?? 'Publication serif/sans — clean published copy'),
      revisionVoice: String(typographicVoices?.revisionVoice ?? 'Bold strike + replacement overlay'),
      marginVoice: String(typographicVoices?.marginVoice ?? 'Secondary reader rebuttal in margin'),
      metadataVoice: String(typographicVoices?.metadataVoice ?? 'Issue code / version mark micro type'),
    },
    graphicGrammar: {
      selectedDevices: arr(graphicGrammar?.selectedDevices).length
        ? arr(graphicGrammar?.selectedDevices)
        : ['strike', 'replacement-tab', 'margin-caret', 'proof-stamp'],
      semanticBehavior: String(
        graphicGrammar?.semanticBehavior ?? 'Limited repeatable grammar — revision interrupts clean copy',
      ),
    },
    colorRoles,
    socialSystem: String(parsed.socialSystem ?? artDirection.socialBehavior),
    motionSystem: String(parsed.motionSystem ?? artDirection.motionBehavior),
    desktopMap: desktopMapV3(hierarchy),
    mobileMap: mobileMapV3(hierarchy),
    assetManifest: params.v2AssetManifest,
    assetDecisions: assetDecisions.length
      ? assetDecisions
      : params.v2AssetManifest.map((entry) => ({
          manifestId: entry.manifestId,
          decision: entry.manifestId === 'MU01' || entry.manifestId === 'MU02' ? 'REGENERATE' : 'REUSE_AS_IS',
          rationale: 'Default v3 recomposition — hero and primary artifact require reference-conditioned regeneration',
          referenceConditioned: entry.manifestId === 'MU01',
        })),
    creativeDirectionAuthorityScore: Math.min(
      5,
      Math.max(0, Number(parsed.creativeDirectionAuthorityScore ?? 4)),
    ),
  };
}

/** Test/dev only — deterministic pass when Sonnet unavailable. NOT founder-ready. */
export function buildDeterministicCreativeDirectorPass(params: {
  direction: ComparisonDirectionCandidate;
  v2Plan: CreativeDirectionBoardPlan;
  references: ResolvedBoardReference[];
}): BoardCreativeDirectorPass {
  const fallbackArt = buildFallbackBoardArtDirection({
    direction: params.direction,
    references: params.references,
  });
  fallbackArt.lineage.provider = 'deterministic-fallback';
  fallbackArt.lineage.promptVersion = BOARD_CREATIVE_DIRECTOR_PROMPT_VERSION;

  const meta = fallbackArt.lineage as BoardCreativeCritique['lineage'];
  const hierarchy: BoardHierarchyPlan = {
    dominantEvent: 'Oversized editorial spread undergoing visible correction',
    supportingDiscoveries: [
      'Ripped replacement strip violently interrupting composition',
      'Photographic evidence crop partially obscured by annotation',
    ],
    minorEvidence: ['Editorial mark', 'Issue code', 'Social expression', 'Motion strip', 'Margin rebuttal'],
    quietZone: 'Upper-right matte paper field — deliberate tension, not unused space',
  };

  return {
    critique: {
      whatWorks: ['Concept legible', 'Reference crops exist', 'Hybrid artifact pathway'],
      whatFeelsMechanical: ['Even slot distribution', 'Decorative annotations', 'Modular proportions'],
      whatIsTooSafe: ['Balanced cards', 'Clean schematic layout'],
      whatIsTooClean: ['Paper field too uniform', 'Hero too neutral'],
      whatIsTooEven: ['Same-size rectangles', 'UI-like hierarchy'],
      whatNeedsMoreTension: ['Overlap aggression', 'Grid violation', 'Margin crossing boundaries'],
      whatNeedsMoreNegativeSpace: ['Upper-right quiet zone must breathe'],
      whatNeedsMoreScaleContrast: ['Hero vs margin note vs micro metadata'],
      whatNeedsMoreMateriality: ['Primary artifact physicality', 'Tape/torn edge'],
      whatNeedsMoreReferenceTranslation: ['Reference crops underused in composition'],
      whatNeedsMoreBrandSpecificity: ['THE MARKED-UP COPY editorial argument'],
      whatShouldBeRemoved: ['Even modular slots'],
      whatShouldBecomeDominant: hierarchy.dominantEvent,
      whatShouldBecomeSecondary: hierarchy.supportingDiscoveries.join('; '),
      whatShouldOverlap: ['Replacement strip over hero', 'Annotation over photo crop'],
      whatShouldBreakTheGrid: ['Primary artifact rotation and overlap'],
      whatShouldRemainQuiet: [hierarchy.quietZone],
      lineage: meta,
    },
    artDirection: fallbackArt,
    hierarchy,
    referenceTranslations: params.references.map((r) => ({
      referenceId: r.referenceId,
      trait: r.referenceRole,
      currentBoardUnderuse: 'Reference present but composition treats it as decoration',
      newBoardTranslation: `Structural ${r.founderNote}`,
      zone: 'heroEditorialSpread' as const,
      assetManifestId: 'MU01',
      compositionDecision: 'Hero participates in editorial argument',
    })),
    typographicVoices: {
      cleanVoice: 'Publication typography — clean copy',
      revisionVoice: 'Strike + replacement — editor intervention',
      marginVoice: 'Margin rebuttal — secondary reader',
      metadataVoice: 'Issue/version micro type',
    },
    graphicGrammar: {
      selectedDevices: ['strike', 'replacement-tab', 'margin-caret', 'proof-stamp'],
      semanticBehavior: 'Revision grammar scales to feed/carousel/story',
    },
    colorRoles: {
      BLACK: 'Published clean copy',
      RED: 'Editorial intervention',
      'PAPER_NEUTRAL': 'Working surface',
    },
    socialSystem: fallbackArt.socialBehavior,
    motionSystem: fallbackArt.motionBehavior,
    desktopMap: desktopMapV3(hierarchy),
    mobileMap: mobileMapV3(hierarchy),
    assetManifest: params.v2Plan.assetManifest,
    assetDecisions: params.v2Plan.assetManifest.map((entry) => ({
      manifestId: entry.manifestId,
      decision:
        entry.manifestId === 'MU01' || entry.manifestId === 'MU02'
          ? ('REGENERATE' as const)
          : entry.manifestId === 'MU04'
            ? ('REUSE_AS_IS' as const)
            : ('REUSE_WITH_EDIT' as const),
      rationale:
        entry.manifestId === 'MU01'
          ? 'Hero must participate in editorial argument with reference-conditioned FAL'
          : entry.manifestId === 'MU02'
            ? 'Primary artifact needs stronger physical irregularity and overlap'
            : 'Compositor edit sufficient',
      referenceConditioned: entry.manifestId === 'MU01',
    })),
    creativeDirectionAuthorityScore: 3,
  };
}

export async function runSonnetCreativeDirectorPass(params: {
  direction: ComparisonDirectionCandidate;
  formationInput: CoreDirectionFormationInput | null;
  references: ResolvedBoardReference[];
  v2Plan: CreativeDirectionBoardPlan;
  v2Board: CreativeDirectionBoard | null;
  expressionContext?: string;
}): Promise<{
  pass: BoardCreativeDirectorPass;
  anthropicRequests: number;
  usage: { inputTokens: number; outputTokens: number };
}> {
  if (!isProductionSonnetConfigured()) {
    throw new Error('BLOCKED_ON_SONNET_ART_DIRECTION');
  }

  const inputFingerprint = fingerprintInput({
    directionId: params.direction.directionId,
    v2PlanId: params.v2Plan.planId,
    boardPlanVersion: MARKED_UP_COPY_BOARD_PLAN_VERSION_V3,
  });

  const userPayload = {
    instruction: 'DO NOT create a new Core Direction. Redesign board composition only.',
    immutableAnchors: MARKED_UP_COPY_IMMUTABLE,
    direction: {
      directionName: params.direction.directionName,
      bigIdea: params.direction.bigIdea,
      oneLineThesis: params.direction.oneLineThesis,
      governingBehavior: params.direction.governingBehavior,
      visualMetaphor: params.direction.visualMetaphor,
      materialImageryLanguage: params.direction.materialImageryLanguage,
      typographicAttitude: params.direction.typographicAttitude,
      imageryLanguage: params.direction.imageryLanguage,
      primaryBrandArtifact: params.direction.primaryBrandArtifact,
      motionSeed: params.direction.motionSeed,
      socialExpressionHypothesis: params.direction.socialExpressionHypothesis,
    },
    brandLore: params.formationInput,
    expressionContext: params.expressionContext ?? 'SOCIAL_FIRST_EDITORIAL',
    referenceDecomposition: params.v2Plan.referenceDecompositions,
    referenceCrops: params.v2Plan.referenceCrops,
    referenceInfluenceGraph: params.v2Plan.referenceInfluenceGraph,
    currentV2Plan: {
      planId: params.v2Plan.planId,
      boardPlanVersion: params.v2Plan.boardPlanVersion,
      desktopMap: params.v2Plan.desktopMap,
      mobileMap: params.v2Plan.mobileMap,
      assetManifest: params.v2Plan.assetManifest.map((a) => ({
        manifestId: a.manifestId,
        role: a.role,
        zoneId: a.zoneId,
        classification: a.classification,
      })),
      dynamicArtDirection: params.v2Plan.dynamicArtDirection,
    },
    currentV2Qa: params.v2Board?.qaScoreReport ?? null,
    founderFeedback: FOUNDER_VISUAL_FEEDBACK_V2,
    referenceEvidence: params.references.map((r) => ({
      referenceId: r.referenceId,
      founderNote: r.founderNote,
      role: r.referenceRole,
    })),
  };

  const { text, usage } = await callAnthropicForCompletion(
    BOARD_CREATIVE_DIRECTOR_SYSTEM_PROMPT,
    userPayload,
  );

  const pass = parseSonnetCreativeDirectorResponse({
    text,
    inputFingerprint,
    v2Plan: params.v2Plan,
    v2AssetManifest: params.v2Plan.assetManifest,
  });

  return {
    pass,
    anthropicRequests: 1,
    usage: {
      inputTokens: usage.inputTokens ?? 0,
      outputTokens: usage.outputTokens ?? 0,
    },
  };
}
