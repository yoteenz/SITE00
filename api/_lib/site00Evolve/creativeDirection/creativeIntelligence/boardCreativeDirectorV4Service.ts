/**
 * Sonnet board critique v4 + board art direction derived FROM DirectionExpressionSystem.
 */

import { createHash } from 'node:crypto';
import { parseStructuredJson } from './formationValidation.js';
import { callAnthropicForCompletion } from './anthropicCompletion.js';
import { ANTHROPIC_CREATIVE_MODEL } from './config.js';
import type { CreativeDirectionBoard, CreativeDirectionBoardPlan } from './creativeDirectionBoardTypes.js';
import type { DirectionExpressionSystem, BoardV4CreativeCritique } from './directionExpressionSystemTypes.js';
import type { BoardAssetDecision, BoardAssetManifestEntry, BoardCompositionMap } from './creativeDirectionBoardTypes.js';
import { isProductionSonnetConfigured } from './directionExpressionSystemService.js';

export const BOARD_V4_ART_DIRECTION_PROMPT_VERSION = 'marked-up-copy-board-art-direction-v4';

export const BOARD_V4_CRITIQUE_SYSTEM_PROMPT = `You are SENIOR CREATIVE DIRECTOR acting as BOARD ART DIRECTOR.

You receive a completed DirectionExpressionSystem. Design CreativeDirectionBoardPlan v4 evidence structure.

The board must VISUALLY DEMONSTRATE the expression system — not explain it with text essays.
Board structure emerges from the Expression System — NOT a fixed seven-zone template.

Return JSON only — no markdown fences. Do NOT return desktopPlacements or mobilePlacements (composition maps are derived server-side from the Expression System).

Keep critique arrays to max 3 concise bullets each. assetManifest max 8 entries; prompts max 120 characters; assetDecisions cover MU01–MU06 plus any new assets.

{
  "critique": {
    "whatWorked": [], "whatWasTooTemplateLike": [], "whatWasTooExplanatory": [],
    "whatWasTooSparse": [], "whatWasTooEqual": [], "whatWasMissingFromIdentitySystem": [],
    "whatWasMissingFromSocialSystem": [], "whatWasMissingFromPhotography": [],
    "whatWasMissingFromMaterialLanguage": [], "whatWasMissingFromTypography": [],
    "whatWasMissingFromRecurringFranchises": [], "whatWasMissingFromMotion": [],
    "whatShouldBecomeDominant": [], "whatShouldBecomeSecondary": [], "whatShouldDisappear": [],
    "whatShouldOverlap": [], "whatShouldBreakTheGrid": [], "whatNeedsBreathingRoom": []
  },
  "boardStructureRationale": "why this structure belongs to The Marked-Up Copy",
  "fixedTemplateInherited": false,
  "dominantEvidence": "string",
  "quietZone": "string",
  "assetManifest": [{
    "manifestId": "MUC-HERO-01",
    "role": "HERO_EDITORIAL_SPREAD",
    "zoneId": "heroEditorialSpread",
    "classification": "FAL_REFERENCE_CONDITIONED",
    "generationMethod": "REFERENCE_CONDITIONED_GENERATION",
    "prompt": "string",
    "referenceConditioned": true,
    "referenceCropIds": ["REF-COMP-01"]
  }],
  "assetDecisions": [{
    "manifestId": "MU01",
    "decision": "REGENERATE|REUSE_AS_IS|REMOVE|NEW_ASSET_REQUIRED|REUSE_WITH_EDIT|REUSE_WITH_NEW_CROP",
    "rationale": "tied to expression system",
    "referenceConditioned": true
  }],
  "templateSubstitutionRisk": "LOW|MEDIUM|HIGH",
  "visualEvidenceDominance": "HIGH|MEDIUM|LOW"
}`;

function arr(v: unknown): string[] {
  return Array.isArray(v) ? v.map(String).filter(Boolean) : [];
}

function fingerprintInput(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16);
}

function summarizeExpressionSystemForBoard(system: DirectionExpressionSystem) {
  return {
    expressionSystemId: system.expressionSystemId,
    conceptualWorld: system.conceptualWorld,
    visualThesis: system.visualThesis,
    governingVisualBehavior: system.governingVisualBehavior,
    photographySystem: system.photographySystem,
    typographySystem: system.typographySystem,
    graphicGrammar: system.graphicGrammar,
    annotationGrammar: system.annotationGrammar,
    materialLanguage: system.materialLanguage,
    colorSystem: system.colorSystem,
    primaryBrandArtifacts: system.primaryBrandArtifacts,
    recurringContentFranchises: system.recurringContentFranchises,
    socialBehavior: system.socialBehavior,
    signatureMoments: system.signatureMoments,
    antiTemplateRules: system.antiTemplateRules,
    antiGenericRules: system.antiGenericRules,
    antiCousinRules: system.antiCousinRules,
    qualityGates: system.qualityGates,
  };
}

export function parseBoardV4CritiqueResponse(params: {
  text: string;
  inputFingerprint: string;
}): {
  critique: BoardV4CreativeCritique;
  boardStructureRationale: string;
  fixedTemplateInherited: boolean;
  assetManifest: BoardAssetManifestEntry[];
  assetDecisions: BoardAssetDecision[];
  desktopMap: BoardCompositionMap;
  mobileMap: BoardCompositionMap;
  templateSubstitutionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  visualEvidenceDominance: 'HIGH' | 'MEDIUM' | 'LOW';
} {
  const parsed = parseStructuredJson(params.text) as Record<string, unknown>;
  const outputHash = createHash('sha256').update(params.text).digest('hex').slice(0, 16);
  const meta = {
    provider: 'anthropic',
    model: ANTHROPIC_CREATIVE_MODEL,
    promptVersion: BOARD_V4_ART_DIRECTION_PROMPT_VERSION,
    inputFingerprint: params.inputFingerprint,
    outputHash,
    createdAt: new Date().toISOString(),
  };
  const c = (parsed.critique ?? {}) as Record<string, unknown>;

  const critique: BoardV4CreativeCritique = {
    whatWorked: arr(c.whatWorked),
    whatWasTooTemplateLike: arr(c.whatWasTooTemplateLike),
    whatWasTooExplanatory: arr(c.whatWasTooExplanatory),
    whatWasTooSparse: arr(c.whatWasTooSparse),
    whatWasTooEqual: arr(c.whatWasTooEqual),
    whatWasMissingFromIdentitySystem: arr(c.whatWasMissingFromIdentitySystem),
    whatWasMissingFromSocialSystem: arr(c.whatWasMissingFromSocialSystem),
    whatWasMissingFromPhotography: arr(c.whatWasMissingFromPhotography),
    whatWasMissingFromMaterialLanguage: arr(c.whatWasMissingFromMaterialLanguage),
    whatWasMissingFromTypography: arr(c.whatWasMissingFromTypography),
    whatWasMissingFromRecurringFranchises: arr(c.whatWasMissingFromRecurringFranchises),
    whatWasMissingFromMotion: arr(c.whatWasMissingFromMotion),
    whatShouldBecomeDominant: arr(c.whatShouldBecomeDominant),
    whatShouldBecomeSecondary: arr(c.whatShouldBecomeSecondary),
    whatShouldDisappear: arr(c.whatShouldDisappear),
    whatShouldOverlap: arr(c.whatShouldOverlap),
    whatShouldBreakTheGrid: arr(c.whatShouldBreakTheGrid),
    whatNeedsBreathingRoom: arr(c.whatNeedsBreathingRoom),
    lineage: meta,
  };

  const desktopPlacements = Array.isArray(parsed.desktopPlacements) ? parsed.desktopPlacements : [];
  const mobilePlacements = Array.isArray(parsed.mobilePlacements) ? parsed.mobilePlacements : [];

  function mapFromPlacements(
    placements: unknown[],
    breakpoint: 'DESKTOP' | 'MOBILE',
    canvasW: number,
    canvasH: number,
  ): BoardCompositionMap {
    return {
      canvasWidth: canvasW,
      canvasHeight: canvasH,
      breakpoint,
      placements: placements.map((p) => {
        const o = p as Record<string, unknown>;
        return {
          zoneId: String(o.zoneId ?? 'heroEditorialSpread') as BoardCompositionMap['placements'][0]['zoneId'],
          x: Number(o.x ?? 0),
          y: Number(o.y ?? 0),
          width: Number(o.width ?? 100),
          height: Number(o.height ?? 100),
          rotation: Number(o.rotation ?? 0),
          zIndex: Number(o.zIndex ?? 1),
          anchor: 'top-left' as const,
          cropMode: 'cover' as const,
          backgroundMode: 'editorial-field' as const,
          shadowOwner: 'NONE' as const,
          overlapTarget: o.overlapTarget
            ? (String(o.overlapTarget) as BoardCompositionMap['placements'][0]['zoneId'])
            : undefined,
          overlapAmount: o.overlapAmount ? Number(o.overlapAmount) : undefined,
        };
      }),
    };
  }

  const desktopMap =
    desktopPlacements.length > 0
      ? mapFromPlacements(desktopPlacements, 'DESKTOP', 1440, 960)
      : mapFromPlacements([], 'DESKTOP', 1440, 960);

  const mobileMap =
    mobilePlacements.length > 0
      ? mapFromPlacements(mobilePlacements, 'MOBILE', 390, 820)
      : mapFromPlacements([], 'MOBILE', 390, 820);

  const assetManifestRaw = Array.isArray(parsed.assetManifest) ? parsed.assetManifest : [];
  const assetManifest: BoardAssetManifestEntry[] = assetManifestRaw.map((item, i) => {
    const o = item as Record<string, unknown>;
    const zoneId = String(o.zoneId ?? 'heroEditorialSpread') as BoardAssetManifestEntry['zoneId'];
    const dp = desktopMap.placements.find((p) => p.zoneId === zoneId);
    const mp = mobileMap.placements.find((p) => p.zoneId === zoneId);
    return {
      assetId: createHash('sha256').update(`v4-${i}-${zoneId}`).digest('hex').slice(0, 16),
      manifestId: String(o.manifestId ?? `MUC-${String(i + 1).padStart(2, '0')}`),
      role: String(o.role ?? 'HERO_EDITORIAL_SPREAD') as BoardAssetManifestEntry['role'],
      zoneId,
      classification: String(o.classification ?? 'FAL_GENERATED') as BoardAssetManifestEntry['classification'],
      generationMethod: String(o.generationMethod ?? 'FAL_TEXT_TO_IMAGE') as BoardAssetManifestEntry['generationMethod'],
      referenceInputs: arr(o.referenceInputs),
      referenceCropIds: arr(o.referenceCropIds),
      textOwnership: 'FAL_FORBIDDEN',
      backgroundTreatment: 'FULL_BLEED',
      backgroundRemovalRequired: String(o.classification).includes('ISOLATED'),
      edgeTreatment: 'NOT_APPLICABLE',
      shadowOwner: 'NONE',
      desktopPlacement: dp ?? desktopMap.placements[0],
      mobilePlacement: mp ?? mobileMap.placements[0],
      prompt: String(o.prompt ?? ''),
      negativeConstraints: ['stock photo', 'readable text', 'logos'],
      qaCriteria: ['expression-system fidelity'],
    };
  });

  const assetDecisions: BoardAssetDecision[] = Array.isArray(parsed.assetDecisions)
    ? (parsed.assetDecisions as BoardAssetDecision[])
    : [];

  return {
    critique,
    boardStructureRationale: String(parsed.boardStructureRationale ?? ''),
    fixedTemplateInherited: parsed.fixedTemplateInherited === true,
    assetManifest,
    assetDecisions,
    desktopMap,
    mobileMap,
    templateSubstitutionRisk: (String(parsed.templateSubstitutionRisk ?? 'LOW') as 'LOW' | 'MEDIUM' | 'HIGH'),
    visualEvidenceDominance: (String(parsed.visualEvidenceDominance ?? 'HIGH') as 'HIGH' | 'MEDIUM' | 'LOW'),
  };
}

export async function runSonnetBoardArtDirectionV4(params: {
  expressionSystem: DirectionExpressionSystem;
  v2Board: CreativeDirectionBoard | null;
  v2Plan: CreativeDirectionBoardPlan | null;
  priorAssetInventory: string[];
}): Promise<{
  result: ReturnType<typeof parseBoardV4CritiqueResponse>;
  anthropicRequests: number;
  usage: { inputTokens: number; outputTokens: number };
}> {
  if (!isProductionSonnetConfigured()) {
    throw new Error('BLOCKED_ON_PRODUCTION_SONNET_CREDENTIAL');
  }

  const inputFingerprint = fingerprintInput({
    expressionSystemId: params.expressionSystem.expressionSystemId,
  });

  const userPayload = {
    expressionSystem: summarizeExpressionSystemForBoard(params.expressionSystem),
    priorV2: params.v2Board ? { version: params.v2Board.boardPlanVersion } : null,
    priorAssetInventory: params.priorAssetInventory,
    instruction: 'Board proves identity system visually — text supports, never carries.',
  };

  let anthropicRequests = 0;
  let inputTokens = 0;
  let outputTokens = 0;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const payload =
      attempt === 0
        ? userPayload
        : {
            ...userPayload,
            revisionHint:
              'Prior response was invalid or truncated JSON. Return ONE complete valid JSON object only — no markdown fences.',
          };

    const { text, usage } = await callAnthropicForCompletion(
      BOARD_V4_CRITIQUE_SYSTEM_PROMPT,
      payload,
      { maxTokens: 16384 },
    );
    anthropicRequests += 1;
    inputTokens += usage.inputTokens ?? 0;
    outputTokens += usage.outputTokens ?? 0;

    try {
      return {
        result: parseBoardV4CritiqueResponse({ text, inputFingerprint }),
        anthropicRequests,
        usage: { inputTokens, outputTokens },
      };
    } catch (err) {
      const jsonErr =
        err instanceof SyntaxError ||
        (err instanceof Error && /JSON|Unexpected token|Unterminated string/i.test(err.message));
      if (!jsonErr || attempt === 1) throw err;
    }
  }

  throw new Error('Board v4 art direction JSON parse failed after retry');
}
