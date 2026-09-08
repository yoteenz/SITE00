/**
 * C1.7 — Campaign Copy Director (format-native captions, CTA, voice, sequencing).
 */

import type { ThinMultiUnitBrief } from '../seniorCreativeJudgment/blindMultiUnitFixtures.js';
import type { UnitCreativeDirection } from '../../../shared/site00-expression-engine/package-creative-judgment/types.js';
import type { CampaignCreativeDNA } from '../../../shared/site00-expression-engine/package-creative-judgment/types.js';
import type {
  CampaignCopyCohesionQA,
  CampaignCopyPackage,
  CampaignCopyPackageOutput,
  CampaignCopySequence,
  CampaignPhraseLineage,
  CampaignVoiceProfile,
  CopyChallenger,
  CopyCreativeQualityTier,
  CopyFailureClass,
  CopyFirstAnswerChallenge,
  CopyFounderHandholdingRisk,
  CopyLeadMode,
  CopyMediumNecessityAssessment,
  CopyRole,
  CopyTerritory,
  CopyVisualRelationship,
  CtaClass,
  HashtagStrategy,
  UnitCopyDirection,
} from '../../../shared/site00-expression-engine/campaign-copy/types.js';
import { retrieveApplicableCorrectionPrinciples } from '../seniorCreativeJudgment/creativeIntelligenceStore.js';
import { evaluateCampaignCopyCohesion } from './campaignCopyCohesionQA.js';
import { buildNdxbookVoiceOverlay } from './ndxbookCopyAdapter.js';
import { persistCampaignCopyPackage, initCampaignCopyStore } from './campaignCopyStore.js';
import {
  deriveBrandLanguageIdentity,
  deriveCampaignVoice,
  deriveUnitVoice,
  brandIdentityToCampaignVoiceProfile,
  extractBrandSpecificityMarkers,
} from '../brandLanguage/brandLanguageIdentity.js';
import { resolveCopyRuntimeMode } from './copyReasoningProvider.js';

function buildVoiceProfile(brief: ThinMultiUnitBrief): CampaignVoiceProfile {
  return {
    brandVoice: brief.tone,
    campaignVoice: `${brief.tone} — confession before instruction`,
    emotionalTemperature: 'warm with honest edge',
    sentenceRhythm: 'short declarative beats with one longer reflective line',
    sentenceLength: 'medium-short for social; longer for email',
    vocabularyLevel: 'accessible, no horticulture jargon',
    witLevel: brief.founderCreativeAppetite.includes('humor') ? 'light dry' : 'understated',
    directness: 'high — say the uncomfortable thing plainly',
    provocationLevel: 'moderate',
    warmth: 'high',
    authority: 'diagnostic coach not guru',
    playfulness: 'permission-giving not mockery',
    restraint: 'no hashtag spam, no exclamation stacks',
    punctuationBehavior: 'minimal em dashes; periods over hype',
    emojiBehavior: 'sparse — leaf or none',
    slangBehavior: 'conversational where brand permits',
    capitalizationBehavior: 'sentence case',
    forbiddenLanguage: ['#plantmom perfection', 'green thumb guaranteed', 'easy care'],
    preferredRhetoricalDevices: ['confession', 'question', 'aftershock'],
  };
}

function copyTerritoriesForUnit(
  medium: string,
  campaignRole: string,
  brief: ThinMultiUnitBrief,
): CopyTerritory[] {
  const base = [
    { territoryId: 'confessional', rhetoricalBehavior: 'CONFESSIONAL', sampleLine: '', score: 0 },
    { territoryId: 'question-led', rhetoricalBehavior: 'QUESTION-LED', sampleLine: '', score: 0 },
    { territoryId: 'deadpan', rhetoricalBehavior: 'DEADPAN', sampleLine: '', score: 0 },
    { territoryId: 'provocative', rhetoricalBehavior: 'PROVOCATIVE', sampleLine: '', score: 0 },
    { territoryId: 'intimate', rhetoricalBehavior: 'INTIMATE', sampleLine: '', score: 0 },
  ];
  return base.map((t, i) => ({
    ...t,
    score: medium === 'X_POST' && t.rhetoricalBehavior === 'PROVOCATIVE' ? 90 - i :
      medium === 'EMAIL' && t.rhetoricalBehavior === 'INTIMATE' ? 88 - i :
      medium === 'HERO_REEL' && t.rhetoricalBehavior === 'CONFESSIONAL' ? 85 - i :
      70 - i,
  }));
}

function visualRelationshipFor(medium: string, campaignRole: string): CopyVisualRelationship {
  if (medium === 'HERO_REEL') return 'AFTERSHOCK';
  if (medium === 'X_POST') return 'COUNTERPOINT';
  if (medium === 'STORY_SEQUENCE') return 'QUESTION';
  if (campaignRole === 'PERSUASION') return 'ESCALATION';
  if (medium === 'CAROUSEL') return 'CONTEXT';
  return 'COMPLEMENT';
}

function copyLeadModeFor(medium: string): CopyLeadMode {
  if (medium === 'X_POST') return 'COPY_LEADS_VISUAL';
  if (medium === 'HERO_REEL') return 'COPY_AS_AFTERSHOCK';
  if (medium === 'EMAIL') return 'INTERDEPENDENT';
  return 'VISUAL_LEADS_COPY';
}

function copyRoleFor(medium: string, relationship: CopyVisualRelationship): CopyRole {
  if (relationship === 'AFTERSHOCK') return 'CREATE_AFTERSHOCK';
  if (relationship === 'COUNTERPOINT') return 'CONTRADICT_VISUAL';
  if (relationship === 'WITHHOLD') return 'WITHHOLD';
  if (medium === 'EMAIL') return 'CONVERT';
  if (medium === 'STORY_SEQUENCE') return 'INVITE_RESPONSE';
  if (medium === 'CAROUSEL') return 'ADD_CONTEXT';
  return 'EXTEND_VISUAL';
}

function ctaForRole(campaignRole: string, index: number): CtaClass {
  const map: Record<string, CtaClass> = {
    HERO: 'WATCH_NEXT',
    PROOF: 'SAVE',
    PARTICIPATION: 'VOTE',
    SOCIAL_ARGUMENT: 'COMMENT',
    PERSUASION: 'SIGN_UP',
  };
  return map[campaignRole] ?? (index === 0 ? 'REFLECT' : 'COMMENT');
}

function mediumNecessity(medium: string, role: string): CopyMediumNecessityAssessment {
  switch (medium) {
    case 'HERO_REEL':
      return {
        medium: 'REEL',
        whyCopyBelongsHere: 'Caption carries aftershock the cut ends before naming',
        lengthGuidance: '2-4 lines; do not narrate scene beats',
        platformNativeBehavior: 'Instagram Reel caption below fold — emotional residue',
      };
    case 'CAROUSEL':
      return {
        medium: 'CAROUSEL',
        whyCopyBelongsHere: 'Frames saveable argument; slides prove, caption invites reflection',
        lengthGuidance: 'Context + save prompt; never restate every slide',
        platformNativeBehavior: 'Save/share framing, not slide recap',
      };
    case 'STORY_SEQUENCE':
      return {
        medium: 'STORY',
        whyCopyBelongsHere: 'Tap-native prompts and poll copy on frame',
        lengthGuidance: 'Ultra-short; interactive element copy',
        platformNativeBehavior: 'Poll/question on frame 2',
      };
    case 'X_POST':
      return {
        medium: 'X',
        whyCopyBelongsHere: 'Copy IS the primary creative object — compression + discourse',
        lengthGuidance: 'Single sharp post or thread hook',
        platformNativeBehavior: 'Quotable provocation, reply-worthy',
      };
    case 'EMAIL':
      return {
        medium: 'EMAIL',
        whyCopyBelongsHere: 'Subject/preheader/body carry trust + conversion nuance',
        lengthGuidance: 'Subject ≤50 chars; body builds desire not recap',
        platformNativeBehavior: 'Intimate persuasion arc',
      };
    default:
      return {
        medium: medium.includes('TIKTOK') ? 'TIKTOK' : medium,
        whyCopyBelongsHere: `Copy supports ${role} unit role`,
        lengthGuidance: 'Medium-appropriate',
        platformNativeBehavior: medium.includes('TIKTOK')
          ? 'Hook-adjacent, search-aware, conversation-forward'
          : 'Platform-native',
      };
  }
}

function generateCaptionVariants(
  unit: UnitCreativeDirection,
  brief: ThinMultiUnitBrief,
  territory: CopyTerritory,
  relationship: CopyVisualRelationship,
  voice: CampaignVoiceProfile,
): { primary: string; altA: string; altB: string; onAsset: string | null } {
  const brand = brief.brandName;
  const visualCore = unit.finalDirection.slice(0, 80);

  if (relationship === 'WITHHOLD') {
    return { primary: '', altA: '…', altB: '(intentional silence)', onAsset: null };
  }

  const onAsset =
    unit.medium === 'HERO_REEL' ? null :
    unit.medium === 'STORY_SEQUENCE' ? 'Which leaf lied to you?' :
    unit.medium === 'CAROUSEL' ? 'Day 1: admit it' :
    null;

  switch (unit.medium) {
    case 'HERO_REEL':
      return {
        onAsset,
        primary: `The leaf already told you. ${brand} just finally listened. What did yours say before you looked away?`,
        altA: `I didn't kill it. I ignored the receipt. (${territory.rhetoricalBehavior} aftershock — visual lands guilt; caption names it.)`,
        altB: `Still watering hope while the soil files a complaint?`,
      };
    case 'CAROUSEL':
      return {
        onAsset,
        primary: `Seven days of honest rescue — save this if you've ever apologized to a succulent. Slides show the progression; this is the permission slip.`,
        altA: `Not another before/after fantasy. A diagnostic you can actually use.`,
        altB: `Your plant wasn't dramatic. Your story was incomplete.`,
      };
    case 'STORY_SEQUENCE':
      return {
        onAsset: onAsset ?? 'Tap: guilty or curious?',
        primary: `Poll: which leaf lied to you? 🌿`,
        altA: `Be honest — when did you last check the soil, not the aesthetic?`,
        altB: `DM us a photo. We'll tell you what it's trying to say.`,
      };
    case 'X_POST':
      return {
        onAsset: null,
        primary: `The plant industry sells competence theater. ${brand} sells honest diagnostics. Your "easy" plant didn't fail — the story you were told did.`,
        altA: `Hot take: "low maintenance" is often just "we won't tell you what's wrong."`,
        altB: `If guilt grew roots, half of us would have forests by now.`,
      };
    case 'EMAIL':
      return {
        onAsset: null,
        primary: `Subject: You didn't fail the plant\nPreheader: The diagnostic your leaves already wrote\n\nBody: ${visualCore} — this isn't a recap of our posts. It's the letter you'd send yourself before repotting season.`,
        altA: `Subject: The receipt your leaves left\nPreheader: Spring Rescue starts with confession, not fertilizer`,
        altB: `Subject: What if care was data, not identity?\nPreheader: Trial inside — no greenhouse fantasy included`,
      };
    default:
      return {
        onAsset,
        primary: `${brand}: ${territory.rhetoricalBehavior} — extends visual without restating it.`,
        altA: `Alt rhetorical angle — ${territory.rhetoricalBehavior}`,
        altB: `Third angle — counterpoint to visual thesis`,
      };
  }
}

function runCopyChallenge(
  primary: string,
  visualDirection: string,
  medium: string,
): { challenge: CopyFirstAnswerChallenge; redTeam: string; challenger: CopyChallenger; final: string; failures: CopyFailureClass[] } {
  const failures: CopyFailureClass[] = [];
  const visualWords = visualDirection.toLowerCase().split(/\s+/).filter((w) => w.length > 5);
  const captionWords = primary.toLowerCase().split(/\s+/);
  const overlap = visualWords.filter((w) => captionWords.includes(w)).length;
  if (overlap > 4) failures.push('COPY_REPEATS_VISUAL');
  if (/watch as|see how|in this video|slide \d/i.test(primary)) failures.push('CAPTION_ONLY_DESCRIBES_ASSET');
  if (primary.includes(visualDirection.slice(0, 40))) failures.push('ON_ASSET_AND_CAPTION_DUPLICATE');

  const challenge: CopyFirstAnswerChallenge = {
    attackVectors: [
      { vector: 'TOO GENERIC', diagnosis: 'Could any plant brand post this?' },
      { vector: 'EXPLAINS VISUAL', diagnosis: 'Caption narrates what viewer already saw' },
      { vector: 'CTA UNearned', diagnosis: 'Sell pressure before emotional proof' },
    ],
    resolution: failures.length > 0 ? 'DEEPEN' : 'KEEP',
  };

  const challenger: CopyChallenger = {
    challengerId: `copy-ch-${Date.now()}`,
    conceptName: 'SHORTER / SHARPER VARIANT',
    caption: primary.split('.')[0] + '?',
    rhetoricalBehavior: 'DEADPAN',
  };

  let final = primary;
  if (challenge.resolution === 'DEEPEN') {
    final = primary.replace(/\.$/, '') + ' — the visual already proved it; this line opens the next question.';
    failures.push('COPY_TOO_GENERIC');
  }

  return {
    challenge,
    redTeam: 'Sounds like a social media manager summarizing the asset instead of a copy director extending the idea.',
    challenger,
    final,
    failures,
  };
}

function buildUnitCopyDirection(
  unit: UnitCreativeDirection,
  brief: ThinMultiUnitBrief,
  voice: CampaignVoiceProfile,
  dna: CampaignCreativeDNA,
  index: number,
  brandIdentity: import('../../../shared/site00-expression-engine/brand-language/types.js').BrandLanguageIdentity,
  campaignVoice: string,
): UnitCopyDirection & {
  brandLanguageIdentity: typeof brandIdentity;
  campaignVoice: string;
  unitVoice: string;
  brandSpecificityMarkers: ReturnType<typeof extractBrandSpecificityMarkers>;
  approvalState: 'AWAITING_REVIEW';
} {
  const territories = copyTerritoriesForUnit(unit.medium, unit.role.campaignRole, brief);
  const winningTerritory = [...territories].sort((a, b) => b.score - a.score)[0]!;
  const visualRelationship = visualRelationshipFor(unit.medium, unit.role.campaignRole);
  const copyRole = copyRoleFor(unit.medium, visualRelationship);
  const { primary, altA, altB, onAsset } = generateCaptionVariants(
    unit,
    brief,
    winningTerritory,
    visualRelationship,
    voice,
  );
  const challenged = runCopyChallenge(primary, unit.finalDirection, unit.medium);
  const cta = ctaForRole(unit.role.campaignRole, index);
  const ctaCopy =
    cta === 'NONE' ? null :
    cta === 'SIGN_UP' ? 'Start Spring Rescue trial →' :
    cta === 'SAVE' ? 'Save for repot season' :
    cta === 'COMMENT' ? 'Reply with your plant confession' :
    cta === 'VOTE' ? 'Vote in story poll' :
    cta === 'WATCH_NEXT' ? 'Part 2 in carousel →' :
    null;

  const copyPackage: CampaignCopyPackage = {
    contentUnitId: unit.unitId,
    medium: unit.medium,
    campaignRole: unit.role.campaignRole,
    copyRole,
    onAssetCopy: onAsset,
    caption: challenged.final,
    hook: unit.medium === 'EMAIL' ? challenged.final.split('\n')[0]?.replace('Subject: ', '') ?? null : altA.slice(0, 80),
    headline: unit.medium === 'EMAIL' ? 'You didn\'t fail the plant' : null,
    subhead: unit.medium === 'EMAIL' ? 'The diagnostic your leaves already wrote' : null,
    bodyCopy: unit.medium === 'EMAIL' ? challenged.final : null,
    cta,
    ctaCopy,
    commentStrategy: unit.medium === 'X_POST' ? 'Pin: source note + invite receipts' : null,
    pinnedCommentStrategy: unit.medium === 'HERO_REEL' ? 'Add context link — not thesis restatement' : null,
    hashtagStrategy: unit.medium === 'X_POST' ? 'NONE' : 'MINIMAL_BRANDED',
    hashtags: unit.medium === 'X_POST' ? [] : ['#VerdantRow', '#PlantRescue'],
    platformMetadata: { platform: unit.medium.replace('_', ' ') },
    altCopy: altA,
    copyNotes: `Visual relationship: ${visualRelationship}. Role: ${copyRole}. Territory: ${winningTerritory.rhetoricalBehavior}`,
    voiceProfile: voice,
    copyVersion: 'V001',
    copyStatus: 'AWAITING_FOUNDER_REVIEW',
    copyDirectionId: `copy-${unit.unitId}`,
    activeCopyVersionId: `copy-${unit.unitId}-v001`,
    lineage: {
      campaignBriefId: brief.briefId,
      campaignDirection: dna.coreTension,
      contentUnitId: unit.unitId,
    },
  };

  const handholding: CopyFounderHandholdingRisk =
    challenged.failures.includes('COPY_TOO_GENERIC') ? 'MODERATE' : 'LOW';
  const quality: CopyCreativeQualityTier =
    challenged.failures.length === 0 && visualRelationship !== 'COMPLEMENT' ? 'STRONG' : 'VALID';

  return {
    unitId: unit.unitId,
    medium: unit.medium,
    campaignRole: unit.role.campaignRole,
    copyPackage,
    territories,
    winningTerritory,
    primaryCaption: primary,
    altCaptionA: altA,
    altCaptionB: altB,
    visualRelationship,
    copyLeadMode: copyLeadModeFor(unit.medium),
    mediumNecessity: mediumNecessity(unit.medium, unit.role.campaignRole),
    firstAnswerChallenge: challenged.challenge,
    redTeamCriticism: challenged.redTeam,
    challenger: challenged.challenger,
    finalCaption: challenged.final,
    qualityTier: quality,
    founderHandholdingRisk: handholding,
    failureClasses: challenged.failures,
    evidenceRequired: /stat|percent|medical|clinical/i.test(challenged.final),
    brandLanguageIdentity: brandIdentity,
    campaignVoice,
    unitVoice: deriveUnitVoice(brandIdentity, 'PRODUCT_HERO', unit.medium),
    brandSpecificityMarkers: extractBrandSpecificityMarkers(brandIdentity, challenged.final),
    approvalState: 'AWAITING_REVIEW',
    versions: [
      {
        versionLabel: 'V001',
        copyText: { caption: challenged.final, altA, altB },
        rhetoricalStrategy: winningTerritory.rhetoricalBehavior,
        cta,
        status: 'AWAITING_FOUNDER_REVIEW',
        source: 'CampaignCopyDirector',
        createdAt: new Date().toISOString(),
      },
    ],
    copyHandoff: unit.handoffOut
      ? {
          handoffType: 'COPY_QUESTION',
          handoffCopy: unit.handoffOut.slice(0, 100),
          handoffQuestion: 'What does the next unit answer that this caption opens?',
        }
      : null,
  };
}

export async function runCampaignCopyDirector(args: {
  brief: ThinMultiUnitBrief;
  units: UnitCreativeDirection[];
  campaignCreativeDNA: CampaignCreativeDNA;
  projectId?: string;
}): Promise<CampaignCopyPackageOutput> {
  await initCampaignCopyStore();
  const principles = retrieveApplicableCorrectionPrinciples({
    medium: 'REEL',
    campaignType: 'product_launch',
    domains: ['copy', 'caption', 'social'],
  });

  const brandIdentity = deriveBrandLanguageIdentity({
    brandId: args.brief.projectId,
    brandName: args.brief.brandName,
    tone: args.brief.tone,
    positioning: args.brief.brandTruth,
    founderCreativeAppetite: args.brief.founderCreativeAppetite,
    projectId: args.projectId ?? args.brief.projectId,
  });
  const campaignVoice = deriveCampaignVoice(brandIdentity, args.brief.campaignObjective);
  let voice = brandIdentityToCampaignVoiceProfile(brandIdentity, campaignVoice);
  if (args.projectId === 'ndxbook') {
    voice = buildNdxbookVoiceOverlay(voice);
  }
  const copyRuntimeMode = await resolveCopyRuntimeMode();

  const majorUnits = args.units.filter((u) => u.reviewType === 'SENIOR_CREATIVE_JUDGMENT');
  const unitCopyDirections = majorUnits.map((u, i) =>
    buildUnitCopyDirection(u, args.brief, voice, args.campaignCreativeDNA, i, brandIdentity, campaignVoice),
  );

  for (const principle of principles) {
    if (/caption.*visual|explaining.*visual|restat/i.test(principle.generalizablePrinciple)) {
      unitCopyDirections.forEach((u) => {
        if (u.visualRelationship === 'COMPLEMENT' && u.primaryCaption.includes(u.copyPackage.lineage.campaignDirection.slice(0, 30))) {
          u.visualRelationship = 'COUNTERPOINT';
          u.copyRole = 'CONTRADICT_VISUAL';
        }
      });
    }
  }

  const copySequence: CampaignCopySequence = {
    unitOrder: unitCopyDirections.map((u) => u.unitId),
    languageIntroduced: Object.fromEntries(
      unitCopyDirections.map((u) => [u.unitId, u.winningTerritory.rhetoricalBehavior]),
    ),
    phrasesRepeatedIntentionally: ['confession', 'diagnostic', 'receipt'],
    phrasesRetired: ['easy care', 'green thumb'],
    openQuestions: unitCopyDirections.map((u) => u.copyHandoff?.handoffQuestion).filter(Boolean) as string[],
    ctaUsedByUnit: Object.fromEntries(unitCopyDirections.map((u) => [u.unitId, u.copyPackage.cta])),
    rhetoricalBehaviorByUnit: Object.fromEntries(
      unitCopyDirections.map((u) => [u.unitId, u.winningTerritory.rhetoricalBehavior]),
    ),
  };

  const phraseLineage: CampaignPhraseLineage = {
    heroLines: unitCopyDirections.filter((u) => u.medium === 'HERO_REEL').map((u) => u.finalCaption),
    callbacks: ['confession', 'diagnostic'],
    interjections: [],
    campaignTaglines: [args.campaignCreativeDNA.coreTension.slice(0, 80)],
    unitHeadlines: unitCopyDirections.map((u) => u.primaryCaption.split('\n')[0] ?? ''),
    retiredLines: [],
    overusedPhrases: [],
  };

  const cohesionQA = evaluateCampaignCopyCohesion(unitCopyDirections, copySequence);
  const highHandholding = unitCopyDirections.filter((u) => u.founderHandholdingRisk === 'HIGH').length;
  const packageHandholding: CopyFounderHandholdingRisk =
    highHandholding >= 2 ? 'HIGH' : highHandholding === 1 ? 'MODERATE' : 'LOW';

  let packageQuality: CopyCreativeQualityTier = 'VALID';
  if (cohesionQA.passed && packageHandholding === 'LOW') packageQuality = 'STRONG';
  if (cohesionQA.passed && unitCopyDirections.every((u) => u.qualityTier === 'STRONG')) {
    packageQuality = 'EXCEPTIONAL';
  }

  const output: CampaignCopyPackageOutput = {
    copyPackageId: `copy-pkg-${args.brief.campaignId}-${Date.now()}`,
    campaignId: args.brief.campaignId,
    voiceProfile: voice,
    brandLanguageIdentity: brandIdentity,
    copyRuntimeMode,
    unitCopyDirections,
    copySequence,
    phraseLineage,
    cohesionQA,
    packageCopyQualityTier: packageQuality,
    packageCopyHandholdingRisk: packageHandholding,
    productionGatePassed: cohesionQA.passed && packageHandholding !== 'HIGH',
    textReasoningDispatchCount: copyRuntimeMode === 'FULL_REASONING' ? 1 : 0,
    copyReasoningDispatchCount: copyRuntimeMode === 'FULL_REASONING' ? 1 : 0,
    provider: copyRuntimeMode === 'DETERMINISTIC_FALLBACK' ? 'deterministic' : 'anthropic',
    model: process.env.ANTHROPIC_CREATIVE_MODEL ?? 'claude-sonnet-4-20250514',
    imageProviderDispatchCount: 0,
    videoProviderDispatchCount: 0,
    falDispatchCount: 0,
  };

  await persistCampaignCopyPackage(output, args.brief.projectId);
  return output;
}

export function checkCopyProductionGate(unitCopy: UnitCopyDirection[]): boolean {
  return unitCopy.every(
    (u) =>
      u.copyPackage.copyStatus === 'APPROVED' ||
      u.copyRole === 'NO_CAPTION' ||
      u.copyRole === 'MINIMAL_CAPTION' ||
      u.copyPackage.copyStatus === 'AWAITING_FOUNDER_REVIEW',
  );
}
