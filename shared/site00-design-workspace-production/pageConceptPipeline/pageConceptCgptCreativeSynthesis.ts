/**
 * P0.VR.PAGE-CONCEPT-CGPT-CREATIVE-SYNTHESIS-LEAK-FIX1
 * CGPT creative-director synthesis contract, sanitization, validation, repair.
 */

import type {
  PageCreativeInjection,
  PageFunctionContract,
  PageCreativeContext,
  ProjectCreativeContext,
} from './types.js';
import { compileProjectSkinContract } from './pageConceptProjectSkinContract.js';

export const PAGE_CGPT_SYNTHESIS_PROMPT_VERSION = 'page-concept-cgpt-v2-creative-synthesis';

/** Fields required on GPT2 authority handoff (Part 26). */
export const GPT2_HANDOFF_INTEGRITY_REQUIRED_KEYS = [
  'creativePremise',
  'pageStory',
  'compositionStrategy',
  'hierarchyStrategy',
  'typographyStrategy',
  'colorStrategy',
  'materialStrategy',
  'imageryStrategy',
  'imageStrategy',
  'interactionCharacter',
  'distinctiveMove',
  'creativeLatitude',
  'mobileDirection',
  'desktopDirection',
  'visualTerritory',
  'pageSurprise',
  'avoidList',
  'mandatoryBrandSignals',
  'skinSignals',
  'identitySignals',
] as const;

export const CGPT_CREATIVE_SYNTHESIS_REQUIRED_FIELDS = [
  'creativePremise',
  'pageStory',
  'visualTerritory',
  'compositionStrategy',
  'hierarchyStrategy',
  'typographyStrategy',
  'colorStrategy',
  'materialStrategy',
  'imageryStrategy',
  'imageStrategy',
  'interactionCharacter',
  'distinctiveMove',
  'creativeLatitude',
  'mobileDirection',
  'desktopDirection',
  'pageSurprise',
  'avoidList',
  'mandatoryBrandSignals',
] as const;

export type CgptCreativeSynthesisField = (typeof CGPT_CREATIVE_SYNTHESIS_REQUIRED_FIELDS)[number];

const GENERIC_FILLER = [
  /^use brand style$/i,
  /^follow design system$/i,
  /^create strong visual$/i,
  /^strong visual hierarchy$/i,
  /^clean grid$/i,
  /^modern and clean$/i,
  /^follow brand guidelines$/i,
  /^use project identity$/i,
  /^dry_run$/i,
  /^dry run$/i,
];

const SYSTEM_CONTAMINATION = [
  /\braster cheat\b/i,
  /\bprovider bypass\b/i,
  /\bcross-?project bleed\b/i,
  /\btest flags?\b/i,
  /\bci terminology\b/i,
  /\bcomposer-freeze\b/i,
  /\bapi-?contracts?\b/i,
  /\bsupabase\b/i,
  /\bpersistence\b/i,
  /\bbusiness-?rules\b/i,
  /\broutes\b/i,
  /\bpipeline defects?\b/i,
  /\bimplementation artifacts?\b/i,
];

export function pageConceptCgptQaStopAfterCgpt(): boolean {
  return process.env.SITE00_PAGE_CONCEPT_CGPT_QA_STOP !== 'false';
}

export function stripSystemContaminationFromText(text: string): string {
  let out = text.trim();
  for (const pattern of SYSTEM_CONTAMINATION) {
    out = out.replace(pattern, '').trim();
  }
  return out.replace(/\s{2,}/g, ' ').trim();
}

export function isSystemContaminatedSignal(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  return SYSTEM_CONTAMINATION.some((p) => p.test(t));
}

export function sanitizeProjectCreativeContextForCgpt(
  ctx: ProjectCreativeContext,
): ProjectCreativeContext {
  return {
    ...ctx,
    forbiddenPatterns: stripSystemContaminationFromText(ctx.forbiddenPatterns),
    projectConstraints: stripSystemContaminationFromText(ctx.projectConstraints),
    brandTruth: ctx.brandTruth,
    designLanguage: ctx.designLanguage,
  };
}

export function sanitizeBrandSignalLines(lines: readonly string[]): string[] {
  return lines.map((l) => stripSystemContaminationFromText(l)).filter((l) => l.length > 8 && !isSystemContaminatedSignal(l));
}

export function translateFunctionContractToCreativeRequirements(input: {
  functionContract: PageFunctionContract;
  pageContext: PageCreativeContext;
}): string[] {
  const creative: string[] = [];
  for (const region of input.functionContract.regions) {
    const r = region.trim();
    if (!r || isSystemContaminatedSignal(r)) continue;
    if (/^(ROUTES|PERSISTENCE|API|SUPABASE|COMPOSER)/i.test(r)) continue;
    creative.push(`Founder/user must access ${r.replace(/_/g, ' ').toLowerCase()} on this page`);
  }
  for (const action of input.functionContract.interactions) {
    const a = action.trim();
    if (!a || isSystemContaminatedSignal(a)) continue;
    creative.push(`Required interaction: ${a.replace(/_/g, ' ').toLowerCase()}`);
  }
  for (const behavior of input.functionContract.immutableBehaviors) {
    const b = behavior.trim();
    if (!b || isSystemContaminatedSignal(b)) continue;
    if (/^(ROUTES|PERSISTENCE|API|SUPABASE)/i.test(b)) continue;
    creative.push(`Must preserve: ${b}`);
  }
  for (const content of input.pageContext.requiredContent) {
    const c = content.trim();
    if (!c || isSystemContaminatedSignal(c)) continue;
    if (/COMPOSER-FREEZE|API-CONTRACT|SUPABASE|BUSINESS-RULE/i.test(c)) continue;
    creative.push(`Page must represent: ${c}`);
  }
  return creative;
}

export function buildCgptCreativeDirectorSystemPrompt(): string {
  return [
    'You are CGPT — CREATIVE DIRECTOR + EDITORIAL EXPERIENCE DESIGNER + PAGE CONCEPT STRATEGIST for SITE 00.',
    'You receive sanitized project identity, SKINS design language, intake/personality, page purpose, and translated functional requirements.',
    'Your task is NOT to restate brand inventory. You must SYNTHESIZE a page-specific visual concept with decisive creative direction.',
    `Return exactly ONE JSON object matching promptVersion ${PAGE_CGPT_SYNTHESIS_PROMPT_VERSION}.`,
    'Do NOT return arrays of concepts.',
    'Every required synthesis field must contain substantive, page-specific prose (not generic filler).',
    'Do NOT include SITE 00 system/QA/debug terms (raster cheat, provider bypass, cross-project bleed, Supabase, API contracts) in creative or brand fields.',
    'mandatoryBrandSignals = project visual/brand signals only — never pipeline or implementation debug labels.',
  ].join('\n');
}

export const CGPT_CREATIVE_OUTPUT_SHAPE: Record<string, string> = {
  creativePremise: 'One strong conceptual statement for THIS page',
  pageStory: 'Attention sequence: ENTRY → primary statement → evidence → work → action',
  visualTerritory: 'Primary visual field and mood for this page',
  compositionStrategy: 'Spatial regions, density, rhythm, image/text balance',
  hierarchyStrategy: 'First read, second read, metadata, actions',
  typographyStrategy: 'How SKINS typefaces behave on this page (not font list only)',
  colorStrategy: 'Dominant field, accent usage rules, what to avoid',
  materialStrategy: 'How project materials appear on surfaces',
  imageryStrategy: 'What images communicate, cropping, evidence treatment',
  imageStrategy: 'Hero/supporting image roles and rhythm',
  interactionCharacter: 'Editorial/investigative feel of use — not generic motion',
  distinctiveMove: 'The one move that makes this page unmistakable',
  creativeLatitude: 'What GPT2 may reinterpret vs what must stay fixed',
  mobileDirection: 'Mobile-specific narrative and scroll rhythm (not stack desktop)',
  desktopDirection: 'Desktop spatial field and simultaneous information',
  pageSurprise: 'Unexpected but on-brand visual/spatial moment',
  avoidList: 'string[] — project-appropriate forbidden drift',
  mandatoryBrandSignals: 'string[] — visual brand signals only',
  audienceIntent: 'string',
  informationPriority: 'string — key messages',
};

function fieldValue(injection: PageCreativeInjection, field: CgptCreativeSynthesisField): string {
  const trim = (value: string | undefined) => (value ?? '').trim();
  switch (field) {
    case 'creativePremise':
      return trim(injection.creativePremise ?? injection.creativeThesis);
    case 'pageStory':
      return trim(injection.pageStory);
    case 'visualTerritory':
      return trim(injection.visualTerritory ?? injection.visualOpportunity);
    case 'compositionStrategy':
      return trim(injection.compositionStrategy ?? injection.spatialDirection);
    case 'hierarchyStrategy':
      return trim(injection.hierarchyStrategy ?? injection.hierarchyDirection);
    case 'typographyStrategy':
      return trim(injection.typographyStrategy);
    case 'colorStrategy':
      return trim(injection.colorStrategy);
    case 'materialStrategy':
      return trim(injection.materialStrategy);
    case 'imageryStrategy':
      return trim(injection.imageryStrategy ?? injection.assetStrategy);
    case 'imageStrategy':
      return trim(injection.imageStrategy ?? injection.imageDataBalance);
    case 'interactionCharacter':
      return trim(injection.interactionCharacter ?? injection.responsiveDirection);
    case 'distinctiveMove':
      return trim(injection.distinctiveMove);
    case 'creativeLatitude':
      return trim(injection.creativeLatitude);
    case 'mobileDirection':
      return trim(injection.mobileDirection);
    case 'desktopDirection':
      return trim(injection.desktopDirection);
    case 'pageSurprise':
      return (injection.pageSurprise ?? '').trim();
    case 'avoidList':
      return (injection.avoidList ?? []).join(' · ').trim();
    case 'mandatoryBrandSignals':
      return (injection.mandatoryBrandSignals ?? []).join(' · ').trim();
    default:
      return '';
  }
}

export function isSubstantiveCreativeText(value: string, minLen = 24): boolean {
  const t = value.trim();
  if (t.length < minLen) return false;
  if (GENERIC_FILLER.some((p) => p.test(t))) return false;
  if (isSystemContaminatedSignal(t) && t.length < 40) return false;
  return true;
}

export type CgptCreativeSynthesisValidation = {
  ok: boolean;
  errorCode: string | null;
  missingFields: string[];
  weakFields: string[];
};

export function validateCgptCreativeSynthesis(injection: PageCreativeInjection): CgptCreativeSynthesisValidation {
  const missingFields: string[] = [];
  const weakFields: string[] = [];

  for (const field of CGPT_CREATIVE_SYNTHESIS_REQUIRED_FIELDS) {
    const value = fieldValue(injection, field);
    if (field === 'avoidList' || field === 'mandatoryBrandSignals') {
      const arr =
        field === 'avoidList' ? (injection.avoidList ?? []) : (injection.mandatoryBrandSignals ?? []);
      if (arr.length === 0 || arr.every((x) => !x.trim())) {
        missingFields.push(field);
        continue;
      }
      if (arr.some((x) => isSystemContaminatedSignal(x))) {
        weakFields.push(`${field}_CONTAMINATION`);
      }
      continue;
    }
    if (!value) {
      missingFields.push(field);
      continue;
    }
    const minLen = field === 'creativePremise' || field === 'pageStory' ? 40 : 24;
    if (!isSubstantiveCreativeText(value, minLen)) {
      weakFields.push(field);
    }
  }

  const allMissing = [...missingFields, ...weakFields];
  return {
    ok: allMissing.length === 0,
    errorCode: allMissing.length ? 'CGPT_SYNTHESIS_INCOMPLETE' : null,
    missingFields: allMissing,
    weakFields,
  };
}

export function buildCgptSynthesisRepairUserMessage(missingFields: readonly string[]): string {
  return JSON.stringify({
    task: 'CGPT_SYNTHESIS_REPAIR',
    instruction:
      'Complete ONLY the missing or weak required creative synthesis fields using the same page/project context. Do not regenerate unrelated fields.',
    missingFields: [...missingFields],
    requiredShape: CGPT_CREATIVE_OUTPUT_SHAPE,
  });
}

export function buildCgptProviderUserPayload(input: {
  projectContext: ProjectCreativeContext;
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
}): Record<string, unknown> {
  const skin = compileProjectSkinContract(input.projectContext.projectId);
  const projectContext = sanitizeProjectCreativeContextForCgpt(input.projectContext);
  const creativePageRequirements = translateFunctionContractToCreativeRequirements({
    functionContract: input.functionContract,
    pageContext: input.pageContext,
  });

  return {
    promptVersion: PAGE_CGPT_SYNTHESIS_PROMPT_VERSION,
    requiredOutputShape: CGPT_CREATIVE_OUTPUT_SHAPE,
    projectCreativeIntelligence: projectContext,
    projectSkinContract: {
      skinName: skin.skinName,
      version: skin.version,
      typography: skin.typography,
      palette: skin.palette,
      material: skin.material,
      imagery: skin.imagery,
      forbiddenDrift: skin.forbiddenDrift,
    },
    pageContext: {
      ...input.pageContext,
      requiredContent: input.pageContext.requiredContent.filter((c) => !isSystemContaminatedSignal(c)),
    },
    creativePageContract: {
      purpose: input.pageContext.purpose,
      pageRole: input.pageContext.pageRole,
      creativeRequirements: creativePageRequirements,
      currentImplementationRole: 'FUNCTIONAL_REFERENCE_ONLY',
      aestheticAuthorityFromCapture: 'NO',
    },
    implementationContract: {
      contractId: input.functionContract.contractId,
      version: input.functionContract.version,
      route: input.functionContract.route,
      regions: input.functionContract.regions,
      interactions: input.functionContract.interactions,
      immutableBehaviors: input.functionContract.immutableBehaviors,
      note: 'Implementation-only — do not echo raw infra tokens in creative fields',
    },
    synthesisQuestions: [
      'Why does this page exist?',
      'What should the founder feel first?',
      'What is the page story and primary visual idea?',
      'What is the distinctive move and page surprise?',
      'How do mobile and desktop differ intentionally?',
    ],
  };
}

/** Full provider JSON fixture for tests and mocked Anthropic responses. */
export function buildCgptSynthesisParsedFixture(input: {
  projectContext: ProjectCreativeContext;
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
}): Record<string, unknown> {
  const inj = buildVitestCgptCreativeInjection(input);
  return {
    creativePremise: inj.creativePremise,
    pageStory: inj.pageStory,
    visualTerritory: inj.visualTerritory,
    compositionStrategy: inj.compositionStrategy,
    hierarchyStrategy: inj.hierarchyStrategy,
    typographyStrategy: inj.typographyStrategy,
    colorStrategy: inj.colorStrategy,
    materialStrategy: inj.materialStrategy,
    imageryStrategy: inj.imageryStrategy,
    imageStrategy: inj.imageStrategy,
    interactionCharacter: inj.interactionCharacter,
    distinctiveMove: inj.distinctiveMove,
    creativeLatitude: inj.creativeLatitude,
    mobileDirection: inj.mobileDirection,
    desktopDirection: inj.desktopDirection,
    pageSurprise: inj.pageSurprise,
    avoidList: inj.avoidList,
    mandatoryBrandSignals: inj.mandatoryBrandSignals,
    pagePurposeInterpretation: inj.pagePurposeInterpretation,
    audienceIntent: inj.audienceIntent,
    informationPriority: inj.informationPriority,
  };
}

export function buildVitestCgptCreativeInjection(input: {
  projectContext: ProjectCreativeContext;
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
}): PageCreativeInjection {
  const skin = compileProjectSkinContract(input.projectContext.projectId);
  const pageName = input.pageContext.pageName;
  const now = new Date().toISOString();
  const premise = `The ${pageName} page behaves as a live project intelligence index: editorial evidence, active cultural work, and founder judgments assemble into one high-contrast field — not a generic dashboard.`;
  const pageStory = `ENTRY → primary editorial statement → project state evidence → active cultural work surfaces → founder decisions → next signal / action on ${pageName}.`;
  return {
    injectionId: `pinj-vitest-${input.pageContext.pageId}`,
    projectId: input.pageContext.projectId,
    pageId: input.pageContext.pageId,
    projectContextVersion: input.projectContext.contextVersion,
    pageContextVersion: input.pageContext.contextVersion,
    functionContractVersion: input.functionContract.version,
    creativePremise: premise,
    creativeThesis: premise,
    pageStory,
    pagePurposeInterpretation: input.pageContext.purpose,
    visualTerritory: 'Black/white editorial plate with intentional lime signal accents and archival image evidence',
    visualOpportunity: 'High-contrast editorial asymmetry with image-led storytelling',
    compositionStrategy:
      'Asymmetric editorial regions: dominant hero read, supporting evidence band, dense metadata rail; deliberate density shifts on scroll',
    spatialDirection:
      'Asymmetric editorial regions: dominant hero read, supporting evidence band, dense metadata rail; deliberate density shifts on scroll',
    hierarchyStrategy:
      'First read: page premise · Second: active work/evidence · Supporting: metadata mono · Actions: founder decisions only',
    hierarchyDirection:
      'First read: page premise · Second: active work/evidence · Supporting: metadata mono · Actions: founder decisions only',
    typographyStrategy: `Display ${skin.typography.displayFont} leads headlines; body ${skin.typography.bodyFont}; mono ${skin.typography.monoFont} for metadata and index labels — uppercase where editorial authority required`,
    colorStrategy: `Near-black field, paper white text blocks, ${skin.palette.find((p) => p.includes('ACCENT')) ?? 'lime accent'} used sparingly for signals — never beige dominance`,
    materialStrategy: `Paper and archival grain on content surfaces; ${skin.material.slice(0, 2).join('; ')}`,
    imageryStrategy: 'Photographic cultural evidence, archival crops, high contrast — no stock lifestyle photography',
    imageStrategy: 'One dominant evidence hero, 2–3 supporting artifact crops, image field may collide with display type intentionally',
    assetStrategy: 'Photographic cultural evidence, archival crops, high contrast — no stock lifestyle photography',
    imageDataBalance: 'Image-led with readable type collision zones',
    interactionCharacter: 'Editorial, investigative, deliberate reveals — not generic SaaS motion',
    responsiveDirection: 'Editorial, investigative, deliberate reveals — not generic SaaS motion',
    distinctiveMove: 'Live cultural index rail where evidence and founder judgment share one editorial spine',
    pageSurprise: 'Oversized archival artifact interrupts the grid mid-scroll — unexpected but on-brand',
    creativeLatitude:
      'GPT2 may reinterpret composition, imagery placement, hierarchy rhythm, and section order; must preserve page purpose, required actions, and project identity signals',
    mobileDirection:
      'Vertical narrative: statement → stacked evidence cards → sequential founder actions; lime accents only at decision points',
    desktopDirection:
      'Wide editorial field with simultaneous evidence column and primary story; secondary metadata rail at reduced weight',
    informationPriority: input.pageContext.requiredContent.slice(0, 3).join(' · ') || 'Project intelligence overview',
    audienceIntent: input.projectContext.audience,
    avoidList: [...skin.forbiddenDrift.slice(0, 4), 'generic dashboard card grid'],
    mandatoryBrandSignals: sanitizeBrandSignalLines([
      skin.tagline,
      ...skin.brandSignals.slice(0, 3),
      'High-contrast editorial black/white with intentional accent',
    ]),
    immutableRequirements: translateFunctionContractToCreativeRequirements({
      functionContract: input.functionContract,
      pageContext: input.pageContext,
    }),
    referenceStrategy: 'Approved authority references; current capture functional only',
    createdAt: now,
    cgptProvider: 'vitest',
    cgptModel: 'mock-page-cgpt',
  };
}

export function normalizeCgptParsedToInjectionFields(
  parsed: Record<string, unknown>,
): Partial<PageCreativeInjection> {
  const str = (k: string) => (parsed[k] != null ? String(parsed[k]).trim() : undefined);
  const strArr = (k: string) => {
    const v = parsed[k];
    if (Array.isArray(v)) return v.map(String).filter(Boolean);
    if (typeof v === 'string' && v.trim()) return [v.trim()];
    return undefined;
  };

  const creativePremise = str('creativePremise') ?? str('creativeThesis');
  const pageStory = str('pageStory') ?? str('pagePurposeInterpretation');

  return {
    creativePremise,
    creativeThesis: creativePremise ?? str('creativeThesis') ?? '',
    pageStory,
    pagePurposeInterpretation: str('pagePurposeInterpretation') ?? pageStory ?? '',
    visualTerritory: str('visualTerritory') ?? str('visualOpportunity'),
    visualOpportunity: str('visualOpportunity') ?? str('visualTerritory') ?? '',
    compositionStrategy: str('compositionStrategy') ?? str('spatialDirection'),
    spatialDirection: str('spatialDirection') ?? str('compositionStrategy') ?? '',
    hierarchyStrategy: str('hierarchyStrategy') ?? str('hierarchyDirection'),
    hierarchyDirection: str('hierarchyDirection') ?? str('hierarchyStrategy') ?? '',
    typographyStrategy: str('typographyStrategy'),
    colorStrategy: str('colorStrategy'),
    materialStrategy: str('materialStrategy'),
    imageryStrategy: str('imageryStrategy') ?? str('assetStrategy'),
    imageStrategy: str('imageStrategy') ?? str('imageDataBalance'),
    interactionCharacter: str('interactionCharacter') ?? str('responsiveDirection'),
    responsiveDirection: str('responsiveDirection') ?? str('interactionCharacter') ?? '',
    distinctiveMove: str('distinctiveMove'),
    pageSurprise: str('pageSurprise'),
    creativeLatitude: str('creativeLatitude'),
    mobileDirection: str('mobileDirection'),
    desktopDirection: str('desktopDirection'),
    audienceIntent: str('audienceIntent'),
    informationPriority: str('informationPriority'),
    imageDataBalance: str('imageDataBalance') ?? str('imageStrategy') ?? '',
    avoidList: sanitizeBrandSignalLines(strArr('avoidList') ?? []),
    mandatoryBrandSignals: sanitizeBrandSignalLines(strArr('mandatoryBrandSignals') ?? []),
    referenceStrategy: str('referenceStrategy') ?? '',
    assetStrategy: str('assetStrategy') ?? str('imageryStrategy') ?? '',
    immutableRequirements: Array.isArray(parsed.immutableRequirements) ?
      parsed.immutableRequirements.map(String)
    : [],
  };
}
