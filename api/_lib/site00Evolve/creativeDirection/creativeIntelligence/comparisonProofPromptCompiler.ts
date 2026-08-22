/**
 * Deterministic Stage A proof prompt compiler — Brand Lore + direction + proof purpose.
 */

import { createHash } from 'node:crypto';
import type {
  ComparisonProofType,
  CoreDirectionFormationInput,
  FormedCoreDirection,
  RenderingMediumRecommendation,
  VisualProofPlan,
} from './types.js';

export type CompiledProofPrompt = {
  prompt: string;
  negativePrompt: string;
  promptHash: string;
  referenceHash: string;
  medium: RenderingMediumRecommendation;
  backgroundRemovalRequired: boolean;
  edgeTreatment: string;
  shadowOwner: 'ASSET_INTRINSIC' | 'CODE_NATIVE_SHADOW' | 'COMPOSITE_SHADOW' | 'NONE';
  aspectRatio: string;
  modelCategory: 'PHOTOGRAPHIC_EDITORIAL' | 'OBJECT_STILL_LIFE' | 'CODE_NATIVE' | 'MOTION_KEYFRAMES';
};

const DIRECTION_CREATIVE_BRIEFS: Record<
  string,
  { hero: string; artifact: string; social: string; motion: string; avoid: string[] }
> = {
  'THE MARKED-UP COPY': {
    hero: 'Contemporary editorial working draft actively being corrected in public — clean magazine spread with cross-outs, replacement copy, margin arguments, editor tape, highlighter marks, live revision energy',
    artifact: 'Live editorial revision artifact — page mid-edit with visible strike-throughs and replacement text layers',
    social: 'Social feed post visibly mutating under editorial reaction — cross-out and replace in progress',
    motion: 'Cross-out → replace → annotate → counter-annotate sequence',
    avoid: ['old manuscript', 'antique scrapbook', 'generic school notebook', 'passive annotation history'],
  },
  'THE COUNTDOWN ROOM': {
    hero: 'Editorial ranking war-room / culture scoreboard — large numerals, leaderboard fragments, placement slips, arrows up/down, position changes, editorial notes defending rank',
    artifact: 'Ranking/placement object with editorial opinion embedded — numbered card or placement slip with argument notes',
    social: 'Countdown entry / rank shift / ranking reveal card for social feed',
    motion: 'Positions re-ordering, numbers advancing, rank being challenged',
    avoid: ['generic sports scoreboard', 'newsroom wall', 'SaaS dashboard', 'TV game show kitsch'],
  },
  'THE PERSONAL ARCHIVE': {
    hero: 'Impossibly good private archive surfaced — saved screenshots, folder fragments, receipts, ticket stubs, notes, link dumps, useful disorder, personal labeling',
    artifact: 'Saved-item bundle / personal folder artifact — chaotic but taste-driven collection',
    social: 'Post pulled directly from a "save this" folder — screenshot stash energy',
    motion: 'Save → stack → surface → refile sequence',
    avoid: ['museum archive', 'library taxonomy', 'clinical filing system', 'Pinterest collage'],
  },
  'THE ANNOTATED COPY': {
    hero: 'Pre-lived-in reading copy — smartest text in the room with evidence of prior readers, marginalia as accumulated knowledge not live editing',
    artifact: 'The Marked Page — reading copy with settled annotation history',
    social: 'Annotated reading card — knowledge inherited, not mid-edit chaos',
    motion: 'Slow reveal of accumulated margin notes and reading traces',
    avoid: ['active live editing', 'cross-out replacement chaos', 'working draft energy'],
  },
  'THE ROOM WHERE IT HAPPENS': {
    hero: 'Inside the editorial room — working wall, process environment, access to how the editorial actually happens',
    artifact: 'The Wall — editorial working surface with process artifacts pinned and arranged',
    social: 'Behind-the-room editorial process card — inside access framing',
    motion: 'Camera drift across working wall, pins and layers shifting subtly',
    avoid: ['countdown scoreboard', 'leaderboard numerals', 'ranking placement slips'],
  },
  'THE INDEX': {
    hero: 'Living knowledge index with taxonomic confidence — entries, numbering, cross-reference, classification and retrieval clarity',
    artifact: 'The Entry — catalog card or index entry with cross-references',
    social: 'Index entry card — retrieval and classification as editorial format',
    motion: 'Entry cross-referencing and index navigation',
    avoid: ['personal saved-file disorder', 'screenshot stash chaos', 'useful mess'],
  },
};

const COUSIN_GUARDS: Record<string, { cousin: string; preserve: string[]; doNot: string[] }> = {
  'THE MARKED-UP COPY': {
    cousin: 'THE ANNOTATED COPY',
    preserve: ['active edit state', 'crossed-out replacements', 'margin argument', 'live revision'],
    doNot: ['pre-lived-in reading copy', 'passive annotation history'],
  },
  'THE COUNTDOWN ROOM': {
    cousin: 'THE ROOM WHERE IT HAPPENS',
    preserve: ['rankings', 'countdown logic', 'scoreboards', 'placements', 'list revisions'],
    doNot: ['newsroom access', 'production-space architecture without ranking'],
  },
  'THE PERSONAL ARCHIVE': {
    cousin: 'THE INDEX',
    preserve: ['saved files', 'screenshot stashes', 'useful disorder', 'found-object energy'],
    doNot: ['taxonomy', 'classification database', 'reference system'],
  },
};

function hashValue(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function referenceHash(input: CoreDirectionFormationInput): string {
  const refs = input.referenceEvidence
    .slice(0, 5)
    .map((r) => `${r.id ?? ''}:${r.founderNote ?? ''}`)
    .join('|');
  return hashValue(refs || 'no-refs');
}

function proofSections(
  direction: FormedCoreDirection,
  proofType: ComparisonProofType,
  input: CoreDirectionFormationInput,
  brief: (typeof DIRECTION_CREATIVE_BRIEFS)[string],
): { subject: string; scene: string; composition: string } {
  const brand = input.brandPurpose ?? 'NDX BOOK editorial brand';
  switch (proofType) {
    case 'heroWorld':
      return {
        subject: brief.hero,
        scene: `Editorial environment embodying "${direction.visualMetaphor}" — ${direction.governingBehavior}`,
        composition: 'Wide hero composition with negative space for founder UI safe area; social-first editorial context',
      };
    case 'primaryArtifact':
      return {
        subject: brief.artifact,
        scene: direction.primaryBrandArtifact,
        composition: 'Centered artifact on neutral surface; object legibility priority; isolation-friendly framing',
      };
    case 'materialObject':
      return {
        subject: direction.materialImageryLanguage || 'Physical editorial material sample',
        scene: 'Material still-life proving tactile editorial world',
        composition: 'Close material study; shallow depth; texture-forward',
      };
    case 'typographicGraphic':
      return {
        subject: `Typographic proof: ${direction.typographicAttitude}`,
        scene: `NDX BOOK — ${direction.oneLineThesis}`,
        composition: 'Code-native typography layout; exact brand text; no AI-rendered letterforms',
      };
    case 'socialExpression':
      return {
        subject: brief.social,
        scene: direction.socialExpressionHypothesis || `${direction.directionName} social expression`,
        composition: `Social-first ${input.brandExpressionContext ?? 'editorial'} card — 4:5 or 9:16 safe framing`,
      };
    case 'motionSeed':
      return {
        subject: brief.motion,
        scene: direction.motionSeed || direction.governingBehavior,
        composition: '3–5 keyframe storyboard strip; motion seed only — not full motion system',
      };
    default:
      return { subject: direction.directionName, scene: brand, composition: 'Editorial proof' };
  }
}

export function resolveProofMedium(
  proofType: ComparisonProofType,
  plan: VisualProofPlan,
): RenderingMediumRecommendation {
  switch (proofType) {
    case 'heroWorld':
      return plan.heroWorld.mediumRecommendation;
    case 'primaryArtifact':
      return plan.primaryArtifact.mediumRecommendation;
    case 'materialObject':
      return plan.materialObjectProof?.mediumRecommendation ?? 'FAL_GENERATED';
    case 'typographicGraphic':
      return 'CODE_NATIVE';
    case 'socialExpression':
      return plan.socialExpression.mediumRecommendation;
    case 'motionSeed':
      return 'CODE_NATIVE';
    default:
      return 'FAL_GENERATED';
  }
}

export function compileComparisonProofPrompt(params: {
  direction: FormedCoreDirection;
  proofType: ComparisonProofType;
  input: CoreDirectionFormationInput;
  plan: VisualProofPlan;
}): CompiledProofPrompt {
  const { direction, proofType, input, plan } = params;
  const brief =
    DIRECTION_CREATIVE_BRIEFS[direction.directionName] ??
    DIRECTION_CREATIVE_BRIEFS['THE ANNOTATED COPY']!;
  const cousin = COUSIN_GUARDS[direction.directionName];
  const sections = proofSections(direction, proofType, input, brief);
  const refHash = referenceHash(input);

  const medium = resolveProofMedium(proofType, plan);
  const isCodeNative = medium === 'CODE_NATIVE' || medium === 'SVG_NATIVE' || proofType === 'typographicGraphic' || proofType === 'motionSeed';
  const backgroundRemovalRequired =
    !isCodeNative &&
    (proofType === 'primaryArtifact' ||
      medium === 'FAL_GENERATED_AND_ISOLATED' ||
      proofType === 'materialObject');

  const negative = [
    'generic stock photo aesthetic',
    'watermarks',
    'third-party logos',
    'literal copyrighted illustrations',
    'named brands',
    'unwanted faces',
    'generic moodboard collage',
    ...brief.avoid,
    ...(cousin?.doNot ?? []),
    ...(direction.antiDirection ?? []).slice(0, 5),
  ].join(', ');

  const prompt = [
    'SITE 00 / STUDIO WORLD — NDX BOOK Stage A visual proof',
    `PROOF TYPE: ${proofType}`,
    `DIRECTION: ${direction.directionName}`,
    `BIG IDEA: ${direction.bigIdea}`,
    `THESIS: ${direction.oneLineThesis}`,
    `GOVERNING BEHAVIOR: ${direction.governingBehavior}`,
    `VISUAL METAPHOR: ${direction.visualMetaphor}`,
    `MATERIAL LANGUAGE: ${direction.materialImageryLanguage}`,
    `IMAGERY LANGUAGE: ${direction.imageryLanguage}`,
    `COLOR LOGIC: ${direction.colorLogic || direction.coreColorLogic}`,
    `BRAND PURPOSE: ${input.brandPurpose ?? 'NDX BOOK'}`,
    '',
    'SUBJECT:',
    sections.subject,
    'SCENE / OBJECT:',
    sections.scene,
    'COMPOSITION:',
    sections.composition,
    'CAMERA / VIEW: editorial photography attitude; controlled perspective; authored not stock',
    'MATERIALS: honor materialImageryLanguage — paper, screen, object logic as specified',
    'LIGHTING: natural editorial light; no dramatic studio cliché',
    'SURFACE: appropriate to direction material world',
    'COLOR BEHAVIOR: follow colorLogic; ink, paper, accent discipline',
    'TEXTURE: tactile where material proof; crisp where editorial',
    'MOOD: proprietary editorial intelligence — not generic design aesthetic',
    cousin
      ? `COUSIN SEPARATION — must NOT collapse into ${cousin.cousin}. PRESERVE: ${cousin.preserve.join('; ')}. DO NOT: ${cousin.doNot.join('; ')}.`
      : '',
    'NEGATIVE CONSTRAINTS:',
    negative,
    'BACKGROUND REQUIREMENT:',
    backgroundRemovalRequired ? 'clean neutral background for isolation' : 'in-scene background acceptable',
    'INTENDED COMPOSITE POSITION: founder review card — full width mobile safe',
    'CROP / SAFE AREA: preserve 8% margin; no critical detail at edges',
  ]
    .filter(Boolean)
    .join('\n');

  const promptHash = hashValue(`${direction.directionId}:${proofType}:${prompt}`);

  return {
    prompt,
    negativePrompt: negative,
    promptHash,
    referenceHash: refHash,
    medium: isCodeNative ? 'CODE_NATIVE' : medium,
    backgroundRemovalRequired,
    edgeTreatment: backgroundRemovalRequired ? 'PAPER_CLEAN' : 'NOT_APPLICABLE',
    shadowOwner: backgroundRemovalRequired ? 'COMPOSITE_SHADOW' : 'NONE',
    aspectRatio:
      proofType === 'socialExpression'
        ? '4:5'
        : proofType === 'motionSeed'
          ? '16:9'
          : proofType === 'typographicGraphic'
            ? '3:2'
            : '16:9',
    modelCategory: isCodeNative
      ? proofType === 'motionSeed'
        ? 'MOTION_KEYFRAMES'
        : 'CODE_NATIVE'
      : proofType === 'primaryArtifact' || proofType === 'materialObject'
        ? 'OBJECT_STILL_LIFE'
        : 'PHOTOGRAPHIC_EDITORIAL',
  };
}

export function buildComparisonProofJobKey(params: {
  comparisonSetKey: string;
  directionId: string;
  proofType: ComparisonProofType;
  promptHash: string;
  model: string;
  referenceHash: string;
}): string {
  return `${params.comparisonSetKey}:${params.directionId}:${params.proofType}:${params.promptHash}:${params.model}:${params.referenceHash}`;
}
