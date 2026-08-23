/**
 * Sonnet CREATIVE EXPRESSION pass — personality, wit, hero concept (preserves identity art direction).
 */

import { createHash, randomUUID } from 'node:crypto';
import { parseStructuredJson } from './formationValidation.js';
import { callAnthropicForCompletion } from './anthropicCompletion.js';
import { ANTHROPIC_CREATIVE_MODEL } from './config.js';
import { isProductionSonnetConfigured } from './directionExpressionSystemService.js';
import { MARKED_UP_COPY_DIRECTION_NAME } from './creativeDirectionBoardTypes.js';
import { MARKED_UP_COPY_IMMUTABLE } from './markedUpCopyCopyContract.js';
import { FORBIDDEN_SIBLING_VOCABULARY } from './markedUpCopyCopyContract.js';
import type { DirectionExpressionSystem } from './directionExpressionSystemTypes.js';
import type { IdentityNativeArtDirection } from './identityNativeArtDirectionTypes.js';
import type { IdentityNativeVisualPilotRecord } from './identityNativeArtDirectionTypes.js';
import {
  CREATIVE_EXPRESSION_PROMPT_VERSION,
  type CreativeExpressionSystem,
  type HeroCreativeConcept,
} from './creativeExpressionTypes.js';
import { inspectMartianMonoAvailability, typographyRolesPromptBlock } from './martianMonoTypography.js';
import { buildPersonalityLineageFromProfile } from '../../../../../shared/site00-brand-lore/personalityLineage.js';
import { buildFormatLineage } from '../../../../../shared/site00-brand-lore/formatLineage.js';
import {
  deriveFormatNativeExpressionProfile,
  summarizeFormatNativeExpression,
} from '../../../../../shared/site00-brand-lore/formatNativeExpression.js';
import { brandPromptTypographyBlock, normalizeBrandPromptContext } from '../../../../../shared/site00-brand-lore/brandIdentity.js';
import {
  enrichHeroConceptPayload,
  selectNativeProofFormat,
} from '../../../../../shared/site00-brand-lore/productionPromptNormalization.js';
import type { BrandPersonalityProfile } from '../../../../../shared/site00-brand-lore/personalityTypes.js';
import type { BrandExpressionContext } from '../../../../../shared/site00-brand-lore/types.js';

export const CREATIVE_EXPRESSION_SYSTEM_PROMPT = `You are SENIOR EDITORIAL CREATIVE DIRECTOR + COPY DIRECTOR.

DO NOT redesign the visual identity. Identity Art Direction is LOCKED.

Your job: add PERSONALITY — wit, voice, typographic character, compositional surprise, second-read discoveries.

Translate upstream Brand Personality — do NOT invent personality ex nihilo. personalityLineage must cite upstream fields.

Wit is NOT: comedy, memes, forced slang, excessive snark, trendy internet language.
Wit IS: someone intelligent noticed what everyone else ignored and wrote in the margin.

Martian Mono = THE BOOK AS A SYSTEM (metadata, evidence, issue IDs, receipts). NOT decoration. NOT every text element.

Return JSON only:
{
  "editorialPersonality": "string",
  "verbalPersonality": "string",
  "witMechanics": ["string"],
  "headlineBehavior": ["string"],
  "microcopyBehavior": ["string"],
  "annotationVoice": ["string"],
  "typographyPersonality": ["string"],
  "compositionPersonality": ["string"],
  "graphicSurpriseRules": ["string"],
  "secondReadDiscoveryRules": ["string"],
  "restraintRules": ["string"],
  "recurringEditorialJokes": ["string"],
  "culturalIntelligenceRules": ["string"],
  "artifactPersonalityTest": ["string"],
  "antiGenericCreativeRules": ["string"]
}`;

export const HERO_CREATIVE_CONCEPT_PROMPT = `You are SENIOR EDITORIAL CREATIVE DIRECTOR for ONE hero artifact.

Identity + Creative Expression are LOCKED. Create the specific creative concept for THIS V2 hero.

Topic (credit utilization) is TEST CONTENT subordinate to identity and personality.

Martian Mono documents the system (metadata/evidence). Display voice makes argument. Revision challenges. Margin reacts.

Return JSON only:
{
  "centralEditorialArgument": "string",
  "dominantEvent": "string",
  "cleanClaim": "string — confident editorial claim with NDX personality",
  "revisionMove": "string — what gets struck/corrected and why",
  "replacementMove": "string — sharper truth on lime tape or insert",
  "marginCounterpoint": "string — witty reactive margin voice",
  "microcopyDiscovery": "string — second-read tiny detail with attitude",
  "evidenceDevice": "string — chart/table/receipt that proves the margin",
  "visualPunchline": "string — the clever visual/copy relationship",
  "dominantTypeBehavior": "string",
  "martianMonoApplication": ["string — exact metadata labels in Martian Mono character"],
  "graphicInterventions": [{ "device": "STRIKE|CARET|etc", "semanticPurpose": "string" }],
  "intentionalGridBreak": "string — ONE chosen grid violation with meaning",
  "quietZone": "string",
  "readingSequence": ["FIRST READ", "SECOND READ", "THIRD READ"],
  "restraintDecision": "string — what you deliberately did NOT add"
}`;

const FOUNDER_V1_CRITIQUE = [
  'Typography needs refinement — Martian Mono must enter typographic DNA',
  'Copy needs more wit and personality — should feel authored by NDX BOOK not generated to demonstrate a concept',
  'Markups need more semantic cleverness not decorative scribbles',
  'Composition needs additional artistic flare via juxtaposition/scale/tension not clutter',
  'Piece should reward second inspection like approved manual boards',
  'Previous 5/5 QA was too generous on typographic DNA and artifact authority',
];

function arr(v: unknown): string[] {
  return Array.isArray(v) ? v.map(String).filter(Boolean) : [];
}

export function buildDeterministicCreativeExpression(params: {
  artDirection: IdentityNativeArtDirection;
  typographyRoles: ReturnType<typeof inspectMartianMonoAvailability>;
  upstreamPersonality?: BrandPersonalityProfile | null;
  expressionContext?: BrandExpressionContext;
}): CreativeExpressionSystem {
  const personalityLineage = buildPersonalityLineageFromProfile(params.upstreamPersonality);
  const context = params.expressionContext ?? 'SOCIAL_FIRST_EDITORIAL';
  const formatProfile = deriveFormatNativeExpressionProfile({ context, personality: params.upstreamPersonality });
  const formatLineage = buildFormatLineage({
    context,
    formatProfile,
    personality: params.upstreamPersonality,
  });
  return {
    expressionId: createHash('sha256').update(`creative-fallback:${params.artDirection.artDirectionId}`).digest('hex').slice(0, 16),
    directionId: params.artDirection.directionId,
    directionName: MARKED_UP_COPY_DIRECTION_NAME,
    expressionSystemId: params.artDirection.expressionSystemId,
    artDirectionId: params.artDirection.artDirectionId,
    editorialPersonality: 'Observant, opinionated, investigative — publishes the margin wars',
    verbalPersonality: 'Intelligent skepticism; understatement over hype; specificity over strategy-speak',
    witMechanics: [
      'Contradiction via strike → replacement',
      'Margin asks the uncomfortable question clean copy avoided',
      'Metadata behaves like commentary (status labels with attitude)',
      'Delayed payoff in footnote or micro label',
    ],
    headlineBehavior: ['Display claim at architectural scale', 'Claim overstates certainty then gets corrected'],
    microcopyBehavior: ['Martian Mono metadata rewards close read', 'Issue IDs and dates imply recent argument change'],
    annotationVoice: ['Prior reader knows something clean copy does not', 'Reactive not decorative'],
    typographyPersonality: typographyRolesPromptBlock(params.typographyRoles),
    compositionPersonality: [
      'One dominant event, two supporting discoveries, one quiet zone, one strange detail',
      'Grid break only where meaning requires it',
    ],
    graphicSurpriseRules: ['Every mark answers WHY IS THIS HERE', 'No scrapbook accumulation'],
    secondReadDiscoveryRules: [
      'Tiny source note contradicts headline certainty',
      'Status metadata contains editorial attitude',
      'Footnote answers margin question',
    ],
    restraintRules: ['No clutter response', 'Lime remains single decisive intervention', 'Not every zone equally loud'],
    recurringEditorialJokes: ['Proof status that refuses finality', 'Margin demands receipts'],
    culturalIntelligenceRules: ['No memes', 'No corporate finance voice as dominant register'],
    artifactPersonalityTest: ['Would generic copy replacement lose meaningful identity? YES required'],
    antiGenericCreativeRules: FOUNDER_V1_CRITIQUE,
    typographyRoles: params.typographyRoles,
    personalityLineage,
    formatLineage,
    provider: 'deterministic-fallback',
    model: 'fallback',
    promptVersion: CREATIVE_EXPRESSION_PROMPT_VERSION,
    createdAt: new Date().toISOString(),
  };
}

export function buildDeterministicHeroConcept(topic: string, expressionContext: BrandExpressionContext = 'SOCIAL_FIRST_EDITORIAL'): HeroCreativeConcept {
  const primaryProofFormat = selectNativeProofFormat(
    expressionContext,
    deriveFormatNativeExpressionProfile({ context: expressionContext }),
  );
  return {
    conceptId: randomUUID().slice(0, 16),
    centralEditorialArgument: 'Utilization rates move — treating a snapshot as destiny is the real mistake',
    dominantEvent: 'Display claim struck through; lime replacement tape carries the sharper truth',
    cleanClaim: 'Your utilization is locked at ninety-two percent.',
    revisionMove: 'Strike "locked" and "ninety-two" — the number moved twice this quarter',
    replacementMove: 'Tape insert: "Utilization shifts. The question is whether you noticed."',
    marginCounterpoint: 'HOW IS 92% STILL THE HEADLINE IF IT WAS 78% IN MARCH? SHOW THE RECEIPTS.',
    microcopyDiscovery: 'Martian Mono footer: STATUS REVISED 05.12 · PRIOR READER 7B · NOT FINAL',
    evidenceDevice: 'Small utilization table with circled 78%→92% shift — margin arrow points to Q1 row',
    visualPunchline: 'Enormous certainty crossed out by tiny dated evidence',
    dominantTypeBehavior: 'Display serif claim ~45% height; Martian Mono metadata absurdly small beside it',
    martianMonoApplication: [
      'VOL.04 · DRAFT 7B · WORKING PROOF',
      'FILE: UTIL-RECPT-0412 · PAGE 03 · REV 2',
      'STATUS: DISPUTED — SEE MARGIN',
    ],
    graphicInterventions: [
      { device: 'STRIKE', semanticPurpose: 'Crosses absolute certainty in the primary claim' },
      { device: 'REPLACEMENT BLOCK', semanticPurpose: 'Lime tape carries corrected editorial truth' },
      { device: 'MARGIN-ARROW', semanticPurpose: 'Connects margin skepticism to table evidence row' },
    ],
    intentionalGridBreak: 'Lime replacement tape crosses slightly into black field — intervention escapes document boundary',
    quietZone: 'Upper right black field reserved — sparse except DISPUTED stamp',
    readingSequence: [
      'FIRST READ: oversized struck claim dominates',
      'SECOND READ: lime replacement + red strike sequence',
      'THIRD READ: tiny Martian Mono date/status proves argument changed recently',
    ],
    restraintDecision: 'No extra arrows, stickers, or decorative scribbles — three semantic marks only',
    primaryProofFormat,
  };
}

export function parseCreativeExpressionResponse(params: {
  text: string;
  artDirection: IdentityNativeArtDirection;
  typographyRoles: ReturnType<typeof inspectMartianMonoAvailability>;
  provider: string;
  model: string;
  upstreamPersonality?: BrandPersonalityProfile | null;
  expressionContext?: BrandExpressionContext;
}): CreativeExpressionSystem {
  const parsed = parseStructuredJson(params.text) as Record<string, unknown>;
  const personalityLineage = buildPersonalityLineageFromProfile(params.upstreamPersonality);
  const context = params.expressionContext ?? 'SOCIAL_FIRST_EDITORIAL';
  const formatProfile = deriveFormatNativeExpressionProfile({ context, personality: params.upstreamPersonality });
  const formatLineage = buildFormatLineage({
    context,
    formatProfile,
    personality: params.upstreamPersonality,
  });
  return {
    expressionId: createHash('sha256').update(params.text).digest('hex').slice(0, 16),
    directionId: params.artDirection.directionId,
    directionName: MARKED_UP_COPY_DIRECTION_NAME,
    expressionSystemId: params.artDirection.expressionSystemId,
    artDirectionId: params.artDirection.artDirectionId,
    editorialPersonality: String(parsed.editorialPersonality ?? ''),
    verbalPersonality: String(parsed.verbalPersonality ?? ''),
    witMechanics: arr(parsed.witMechanics),
    headlineBehavior: arr(parsed.headlineBehavior),
    microcopyBehavior: arr(parsed.microcopyBehavior),
    annotationVoice: arr(parsed.annotationVoice),
    typographyPersonality: arr(parsed.typographyPersonality),
    compositionPersonality: arr(parsed.compositionPersonality),
    graphicSurpriseRules: arr(parsed.graphicSurpriseRules),
    secondReadDiscoveryRules: arr(parsed.secondReadDiscoveryRules),
    restraintRules: arr(parsed.restraintRules),
    recurringEditorialJokes: arr(parsed.recurringEditorialJokes),
    culturalIntelligenceRules: arr(parsed.culturalIntelligenceRules),
    artifactPersonalityTest: arr(parsed.artifactPersonalityTest),
    antiGenericCreativeRules: arr(parsed.antiGenericCreativeRules),
    typographyRoles: params.typographyRoles,
    personalityLineage,
    formatLineage,
    provider: params.provider,
    model: params.model,
    promptVersion: CREATIVE_EXPRESSION_PROMPT_VERSION,
    createdAt: new Date().toISOString(),
  };
}

export function parseHeroCreativeConcept(text: string): HeroCreativeConcept {
  const parsed = parseStructuredJson(text) as Record<string, unknown>;
  const interventions = Array.isArray(parsed.graphicInterventions)
    ? (parsed.graphicInterventions as Array<Record<string, string>>).map((g) => ({
        device: String(g.device ?? ''),
        semanticPurpose: String(g.semanticPurpose ?? ''),
      }))
    : [];
  return {
    conceptId: createHash('sha256').update(text).digest('hex').slice(0, 16),
    centralEditorialArgument: String(parsed.centralEditorialArgument ?? ''),
    dominantEvent: String(parsed.dominantEvent ?? ''),
    cleanClaim: String(parsed.cleanClaim ?? ''),
    revisionMove: String(parsed.revisionMove ?? ''),
    replacementMove: String(parsed.replacementMove ?? ''),
    marginCounterpoint: String(parsed.marginCounterpoint ?? ''),
    microcopyDiscovery: String(parsed.microcopyDiscovery ?? ''),
    evidenceDevice: String(parsed.evidenceDevice ?? ''),
    visualPunchline: String(parsed.visualPunchline ?? ''),
    dominantTypeBehavior: String(parsed.dominantTypeBehavior ?? ''),
    martianMonoApplication: arr(parsed.martianMonoApplication),
    graphicInterventions: interventions,
    intentionalGridBreak: String(parsed.intentionalGridBreak ?? ''),
    quietZone: String(parsed.quietZone ?? ''),
    readingSequence: arr(parsed.readingSequence),
    restraintDecision: String(parsed.restraintDecision ?? ''),
    primaryProofFormat: String(parsed.primaryProofFormat ?? parsed.nativeProofFormat ?? ''),
  };
}

export async function runCreativeExpressionDirector(params: {
  expressionSystem: DirectionExpressionSystem;
  artDirection: IdentityNativeArtDirection;
  v1Pilot: IdentityNativeVisualPilotRecord | null;
  topic: string;
  upstreamPersonality?: BrandPersonalityProfile | null;
  expressionContext?: BrandExpressionContext;
  brandSlug?: string;
}): Promise<{
  creativeExpression: CreativeExpressionSystem;
  heroConcept: HeroCreativeConcept;
  anthropicRequests: number;
}> {
  const typographyRoles = inspectMartianMonoAvailability();
  const context = params.expressionContext ?? 'SOCIAL_FIRST_EDITORIAL';
  const formatProfile = deriveFormatNativeExpressionProfile({
    context,
    personality: params.upstreamPersonality,
  });
  const brandSlug = params.brandSlug ?? 'ndxbook';
  const brandPromptBlock = brandPromptTypographyBlock(brandSlug);
  const brandCtx = normalizeBrandPromptContext(brandSlug);

  if (!isProductionSonnetConfigured()) {
    const creativeExpression = buildDeterministicCreativeExpression({
      artDirection: params.artDirection,
      typographyRoles,
      upstreamPersonality: params.upstreamPersonality,
      expressionContext: context,
    });
    return {
      creativeExpression,
      heroConcept: buildDeterministicHeroConcept(params.topic, context),
      anthropicRequests: 0,
    };
  }

  const v1CritiquePayload = {
    founderVerdict: 'APPROVED AS METHODOLOGY BREAKTHROUGH — NOT YET APPROVED AS FINAL CREATIVE QUALITY',
    v1Critique: FOUNDER_V1_CRITIQUE,
    v1PilotSummary: params.v1Pilot
      ? {
          pilotId: params.v1Pilot.pilotId,
          publicUrl: params.v1Pilot.publicUrl,
          qa: params.v1Pilot.rawImageQa,
          briefExcerpt: params.v1Pilot.identityBrief.compiledPrompt.slice(0, 2000),
        }
      : null,
    preserveFromV1: [
      'black/off-white/signal-lime identity',
      'editorial artifact architecture',
      'live revision behavior',
      'extreme type scale',
      'semantic color ownership',
      'asymmetric composition',
    ],
  };

  const expressionPayload = {
    task: 'CREATIVE EXPRESSION SYSTEM — personality layer only',
    immutable: MARKED_UP_COPY_IMMUTABLE,
    brandIdentity: brandCtx,
    brandTypography: brandPromptBlock,
    formatNativeExpression: summarizeFormatNativeExpression(formatProfile),
    upstreamPersonalitySummary: params.upstreamPersonality
      ? buildPersonalityLineageFromProfile(params.upstreamPersonality)
      : [],
    identityArtDirection: {
      identityPremise: params.artDirection.identityPremise,
      proprietaryVisualDNA: params.artDirection.proprietaryVisualDNA,
      paletteSystem: params.artDirection.paletteSystem,
      artifactDesignLanguage: params.artDirection.artifactDesignLanguage,
    },
    expressionSystemThesis: params.expressionSystem.visualThesis,
    typographyRoles,
    v1Critique: v1CritiquePayload,
    siblingForbidden: FORBIDDEN_SIBLING_VOCABULARY.slice(0, 6),
    topicTestContent: params.topic,
  };

  const { text: expressionText } = await callAnthropicForCompletion(
    CREATIVE_EXPRESSION_SYSTEM_PROMPT,
    expressionPayload,
    { maxTokens: 8192 },
  );

  let creativeExpression = parseCreativeExpressionResponse({
    text: expressionText,
    artDirection: params.artDirection,
    typographyRoles,
    provider: 'anthropic',
    model: ANTHROPIC_CREATIVE_MODEL,
    upstreamPersonality: params.upstreamPersonality,
    expressionContext: context,
  });

  if (!creativeExpression.editorialPersonality) {
    creativeExpression = buildDeterministicCreativeExpression({
      artDirection: params.artDirection,
      typographyRoles,
      upstreamPersonality: params.upstreamPersonality,
      expressionContext: context,
    });
  }

  const conceptPayload = enrichHeroConceptPayload(
    {
    task: 'HERO CREATIVE CONCEPT V2 — specific artifact idea',
    brandTypography: brandPromptBlock,
    creativeExpression,
    identityArtDirection: params.artDirection,
    typographyRoles,
    topic: params.topic,
    v1ImageUrl: params.v1Pilot?.publicUrl ?? null,
    doNot: ['redesign identity', 'add clutter', 'use corporate finance voice', 'copy V1 layout exactly'],
    },
    brandSlug,
    context,
  );

  const { text: conceptText } = await callAnthropicForCompletion(HERO_CREATIVE_CONCEPT_PROMPT, conceptPayload, {
    maxTokens: 8192,
  });

  let heroConcept = parseHeroCreativeConcept(conceptText);
  if (!heroConcept.cleanClaim) {
    heroConcept = buildDeterministicHeroConcept(params.topic, context);
  }

  return {
    creativeExpression,
    heroConcept,
    anthropicRequests: 2,
  };
}
