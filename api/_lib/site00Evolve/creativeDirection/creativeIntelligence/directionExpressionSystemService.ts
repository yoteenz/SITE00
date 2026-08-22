/**
 * Sonnet DirectionExpressionSystem generation + quality gates (50-post, no-explanation).
 */

import { createHash, randomUUID } from 'node:crypto';
import { parseStructuredJson } from './formationValidation.js';
import { getCreativeIntelligenceProvider } from './providerRegistry.js';
import { callAnthropicForCompletion } from './anthropicCompletion.js';
import { ANTHROPIC_CREATIVE_MODEL } from './config.js';
import type { CreativeDirectionBoard, CreativeDirectionBoardPlan } from './creativeDirectionBoardTypes.js';
import {
  FOUNDER_VISUAL_FEEDBACK_V2,
  MARKED_UP_COPY_DIRECTION_NAME,
} from './creativeDirectionBoardTypes.js';
import { MARKED_UP_COPY_IMMUTABLE } from './markedUpCopyCopyContract.js';
import type {
  AnnotationGrammarSpec,
  ColorSystemSpec,
  ContentFranchiseSpec,
  DirectionExpressionSystem,
  ExpressionSystemQualityGates,
  GraphicGrammarSpec,
  MaterialLanguageSpec,
  PhotographySystemSpec,
  SocialBehaviorSpec,
  TypographySystemSpec,
} from './directionExpressionSystemTypes.js';
import { DIRECTION_EXPRESSION_SYSTEM_PROMPT_VERSION } from './directionExpressionSystemTypes.js';
import type { ComparisonDirectionCandidate, CoreDirectionFormationInput } from './types.js';
import type { ResolvedBoardReference } from './creativeDirectionBoardTypes.js';

export const DIRECTION_EXPRESSION_SYSTEM_SYSTEM_PROMPT = `You are a SENIOR CREATIVE DIRECTOR + BRAND SYSTEM DESIGNER.

Design the VISUAL EXPRESSION SYSTEM that makes ONE existing Core Direction a real, repeatable SOCIAL-FIRST brand world.

This is NOT moodboard generation. NOT board layout. NOT Core Direction formation.

THE MARKED-UP COPY = ACTIVE REVISION (live edit, cross-out, replacement, margin argument).
THE ANNOTATED COPY (cousin) = PRE-LIVED-IN accumulated evidence — do NOT collapse into that territory.

Return structured JSON only — no markdown fences.

Required top-level shape:
{
  "conceptualWorld": "string",
  "visualThesis": "string",
  "emotionalAtmosphere": "string",
  "governingVisualBehavior": "string",
  "photographySystem": { "subjectMatter", "cameraDistance", "croppingBehavior", "lighting", "grainTexture", "humanPresence", "objectPresence", "documentaryEditorialBalance", "mustNeverLookLike": [] },
  "typographySystem": { "cleanVoice", "revisionVoice", "marginVoice", "metadataVoice", "scaleRelationships", "alignmentBehavior", "interruptionBehavior" },
  "graphicGrammar": { "selectedDevices": [], "semanticRoles": {} },
  "annotationGrammar": { "whoIsSpeaking", "disagreementBehavior", "correctionBehavior", "secondaryOpinionBehavior", "ambiguityVisibility" },
  "materialLanguage": { "paperTypes": [], "physicalBehaviors": [], "digitalBehaviors": [], "justifiedMaterials": [] },
  "colorSystem": { "semanticRoles": {} },
  "imageTreatment": "string",
  "spatialBehavior": "string",
  "primaryBrandArtifacts": [],
  "secondaryBrandArtifacts": [],
  "recurringDevices": [],
  "recurringContentFranchises": [{ "franchiseId", "name", "behavior", "socialFormat", "specimenLabel" }],
  "socialBehavior": { "feedBehavior", "carouselBehavior", "storyBehavior", "reelBehavior", "motionBehavior" },
  "physicalWorldBehavior": "string",
  "digitalWorldBehavior": "string",
  "signatureMoments": [],
  "extensibilityRules": [],
  "antiTemplateRules": [],
  "antiGenericRules": [],
  "antiCousinRules": [],
  "referenceApplications": [],
  "productionImplications": [],
  "qualityGates": {
    "fiftyPostTest": { "score": 0-5, "result": "PASS|FAIL", "evidence": "string" },
    "noExplanationTest": { "score": 0-5, "result": "PASS|FAIL", "evidence": "string" }
  }
}

FIFTY_POST_TEST: Could a competent designer create 50 different posts from this system without another CD meeting? Score >=4 and PASS required.
NO_EXPLANATION_TEST: Could a founder understand the world from visual system rules alone (no strategy essay)? Score >=4 and PASS required.`;

function fingerprintInput(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16);
}

export function isProductionSonnetConfigured(): boolean {
  return getCreativeIntelligenceProvider().providerId !== 'unavailable';
}

function arr(v: unknown): string[] {
  return Array.isArray(v) ? v.map(String).filter(Boolean) : [];
}

function normalizePhotography(raw: unknown): PhotographySystemSpec {
  const p = (raw ?? {}) as Record<string, unknown>;
  return {
    subjectMatter: String(p.subjectMatter ?? ''),
    cameraDistance: String(p.cameraDistance ?? ''),
    croppingBehavior: String(p.croppingBehavior ?? ''),
    lighting: String(p.lighting ?? ''),
    grainTexture: String(p.grainTexture ?? ''),
    humanPresence: String(p.humanPresence ?? ''),
    objectPresence: String(p.objectPresence ?? ''),
    documentaryEditorialBalance: String(p.documentaryEditorialBalance ?? ''),
    mustNeverLookLike: arr(p.mustNeverLookLike),
  };
}

function normalizeTypography(raw: unknown): TypographySystemSpec {
  const t = (raw ?? {}) as Record<string, unknown>;
  return {
    cleanVoice: String(t.cleanVoice ?? ''),
    revisionVoice: String(t.revisionVoice ?? ''),
    marginVoice: String(t.marginVoice ?? ''),
    metadataVoice: String(t.metadataVoice ?? ''),
    scaleRelationships: String(t.scaleRelationships ?? ''),
    alignmentBehavior: String(t.alignmentBehavior ?? ''),
    interruptionBehavior: String(t.interruptionBehavior ?? ''),
  };
}

function normalizeFranchises(raw: unknown): ContentFranchiseSpec[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const o = item as Record<string, unknown>;
    return {
      franchiseId: String(o.franchiseId ?? randomUUID().slice(0, 8)),
      name: String(o.name ?? ''),
      behavior: String(o.behavior ?? ''),
      socialFormat: (String(o.socialFormat ?? 'FEED') as ContentFranchiseSpec['socialFormat']),
      specimenLabel: String(o.specimenLabel ?? ''),
    };
  });
}

function normalizeQualityGates(raw: unknown): ExpressionSystemQualityGates {
  const q = (raw ?? {}) as Record<string, unknown>;
  const fifty = (q.fiftyPostTest ?? {}) as Record<string, unknown>;
  const noExp = (q.noExplanationTest ?? {}) as Record<string, unknown>;
  const fiftyScore = Math.min(5, Math.max(0, Number(fifty.score ?? 0)));
  const noExpScore = Math.min(5, Math.max(0, Number(noExp.score ?? 0)));
  return {
    fiftyPostTest: {
      score: fiftyScore,
      result: fiftyScore >= 4 && String(fifty.result) === 'PASS' ? 'PASS' : 'FAIL',
      evidence: String(fifty.evidence ?? ''),
    },
    noExplanationTest: {
      score: noExpScore,
      result: noExpScore >= 4 && String(noExp.result) === 'PASS' ? 'PASS' : 'FAIL',
      evidence: String(noExp.evidence ?? ''),
    },
  };
}

export function parseDirectionExpressionSystemResponse(params: {
  text: string;
  direction: ComparisonDirectionCandidate;
  brandLoreFingerprint: string;
  brandLoreVersion: number;
  inputFingerprint: string;
}): DirectionExpressionSystem {
  const parsed = parseStructuredJson(params.text) as Record<string, unknown>;
  const outputHash = createHash('sha256').update(params.text).digest('hex').slice(0, 16);
  const graphic = (parsed.graphicGrammar ?? {}) as Record<string, unknown>;
  const annotation = (parsed.annotationGrammar ?? {}) as Record<string, unknown>;
  const material = (parsed.materialLanguage ?? {}) as Record<string, unknown>;
  const color = (parsed.colorSystem ?? {}) as Record<string, unknown>;
  const social = (parsed.socialBehavior ?? {}) as Record<string, unknown>;

  return {
    expressionSystemId: createHash('sha256')
      .update(`${params.direction.directionId}:des:${params.brandLoreFingerprint}`)
      .digest('hex')
      .slice(0, 16),
    directionId: params.direction.directionId,
    directionName: params.direction.directionName,
    sourceFormationId: params.direction.sourceFormationId,
    sourceFormationVersion: params.direction.sourceFormationVersion,
    brandLoreVersion: params.brandLoreVersion,
    brandLoreFingerprint: params.brandLoreFingerprint,
    conceptualWorld: String(parsed.conceptualWorld ?? ''),
    visualThesis: String(parsed.visualThesis ?? ''),
    emotionalAtmosphere: String(parsed.emotionalAtmosphere ?? ''),
    governingVisualBehavior: String(parsed.governingVisualBehavior ?? ''),
    photographySystem: normalizePhotography(parsed.photographySystem),
    typographySystem: normalizeTypography(parsed.typographySystem),
    graphicGrammar: {
      selectedDevices: arr(graphic.selectedDevices),
      semanticRoles: (graphic.semanticRoles ?? {}) as Record<string, string>,
    } as GraphicGrammarSpec,
    annotationGrammar: {
      whoIsSpeaking: String(annotation.whoIsSpeaking ?? ''),
      disagreementBehavior: String(annotation.disagreementBehavior ?? ''),
      correctionBehavior: String(annotation.correctionBehavior ?? ''),
      secondaryOpinionBehavior: String(annotation.secondaryOpinionBehavior ?? ''),
      ambiguityVisibility: String(annotation.ambiguityVisibility ?? ''),
    } as AnnotationGrammarSpec,
    materialLanguage: {
      paperTypes: arr(material.paperTypes),
      physicalBehaviors: arr(material.physicalBehaviors),
      digitalBehaviors: arr(material.digitalBehaviors),
      justifiedMaterials: arr(material.justifiedMaterials),
    } as MaterialLanguageSpec,
    colorSystem: { semanticRoles: (color.semanticRoles ?? color) as Record<string, string> } as ColorSystemSpec,
    imageTreatment: String(parsed.imageTreatment ?? ''),
    spatialBehavior: String(parsed.spatialBehavior ?? ''),
    primaryBrandArtifacts: arr(parsed.primaryBrandArtifacts),
    secondaryBrandArtifacts: arr(parsed.secondaryBrandArtifacts),
    recurringDevices: arr(parsed.recurringDevices),
    recurringContentFranchises: normalizeFranchises(parsed.recurringContentFranchises),
    socialBehavior: {
      feedBehavior: String(social.feedBehavior ?? ''),
      carouselBehavior: String(social.carouselBehavior ?? ''),
      storyBehavior: String(social.storyBehavior ?? ''),
      reelBehavior: String(social.reelBehavior ?? ''),
      motionBehavior: String(social.motionBehavior ?? parsed.motionBehavior ?? ''),
    } as SocialBehaviorSpec,
    physicalWorldBehavior: String(parsed.physicalWorldBehavior ?? ''),
    digitalWorldBehavior: String(parsed.digitalWorldBehavior ?? ''),
    signatureMoments: arr(parsed.signatureMoments),
    extensibilityRules: arr(parsed.extensibilityRules),
    antiTemplateRules: arr(parsed.antiTemplateRules),
    antiGenericRules: arr(parsed.antiGenericRules),
    antiCousinRules: arr(parsed.antiCousinRules),
    referenceApplications: Array.isArray(parsed.referenceApplications)
      ? (parsed.referenceApplications as DirectionExpressionSystem['referenceApplications'])
      : [],
    productionImplications: arr(parsed.productionImplications),
    qualityGates: normalizeQualityGates(parsed.qualityGates),
    provider: 'anthropic',
    model: ANTHROPIC_CREATIVE_MODEL,
    promptVersion: DIRECTION_EXPRESSION_SYSTEM_PROMPT_VERSION,
    inputFingerprint: params.inputFingerprint,
    outputHash,
    createdAt: new Date().toISOString(),
  };
}

export function expressionSystemGatesPass(system: DirectionExpressionSystem): boolean {
  return (
    system.qualityGates.fiftyPostTest.result === 'PASS' &&
    system.qualityGates.fiftyPostTest.score >= 4 &&
    system.qualityGates.noExplanationTest.result === 'PASS' &&
    system.qualityGates.noExplanationTest.score >= 4 &&
    system.recurringContentFranchises.length >= 2 &&
    system.photographySystem.subjectMatter.length > 0 &&
    system.typographySystem.cleanVoice.length > 0 &&
    system.graphicGrammar.selectedDevices.length >= 3 &&
    system.materialLanguage.justifiedMaterials.length > 0 &&
    system.antiTemplateRules.length > 0
  );
}

export function isFounderReadyExpressionSystem(system: DirectionExpressionSystem): boolean {
  return system.provider === 'anthropic';
}

export async function runSonnetDirectionExpressionSystem(params: {
  direction: ComparisonDirectionCandidate;
  formationInput: CoreDirectionFormationInput | null;
  references: ResolvedBoardReference[];
  v2Board: CreativeDirectionBoard | null;
  v2Plan: CreativeDirectionBoardPlan | null;
  expressionContext?: string;
  revisionHint?: string;
}): Promise<{
  system: DirectionExpressionSystem;
  anthropicRequests: number;
  usage: { inputTokens: number; outputTokens: number };
}> {
  if (!isProductionSonnetConfigured()) {
    throw new Error('BLOCKED_ON_PRODUCTION_SONNET_CREDENTIAL');
  }

  const inputFingerprint = fingerprintInput({
    directionId: params.direction.directionId,
    revision: params.revisionHint ?? null,
  });

  const userPayload = {
    task: 'DESIGN DIRECTION EXPRESSION SYSTEM — not board layout',
    immutable: MARKED_UP_COPY_IMMUTABLE,
    cousinDistinction: {
      markedUpCopy: 'ACTIVE REVISION — live edit, cross-out, replacement',
      annotatedCopy: 'PRE-LIVED-IN — do not collapse',
    },
    direction: params.direction,
    brandLore: params.formationInput,
    expressionContext: params.expressionContext ?? 'SOCIAL_FIRST_EDITORIAL',
    references: params.references.map((r) => ({
      referenceId: r.referenceId,
      founderNote: r.founderNote,
      role: r.referenceRole,
    })),
    priorV2Board: params.v2Board
      ? { boardPlanVersion: params.v2Board.boardPlanVersion, qa: params.v2Board.qaScoreReport }
      : null,
    founderCritique: FOUNDER_VISUAL_FEEDBACK_V2,
    revisionHint: params.revisionHint ?? null,
  };

  const { text, usage } = await callAnthropicForCompletion(
    DIRECTION_EXPRESSION_SYSTEM_SYSTEM_PROMPT,
    userPayload,
  );

  const system = parseDirectionExpressionSystemResponse({
    text,
    direction: params.direction,
    brandLoreFingerprint: params.direction.brandLoreFingerprint,
    brandLoreVersion: params.direction.brandLoreProfileVersion,
    inputFingerprint,
  });

  return {
    system,
    anthropicRequests: 1,
    usage: {
      inputTokens: usage.inputTokens ?? 0,
      outputTokens: usage.outputTokens ?? 0,
    },
  };
}
