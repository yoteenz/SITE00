/**
 * Runtime GPT2 authority package — identity-first creative hierarchy.
 */

import type {
  PageConceptCgptCreativeBrief,
  PageCreativeInjection,
  PageCreativeContext,
  PageFunctionContract,
  PageGPT2AuthorityConcept,
  ProjectCreativeContext,
} from './types.js';
import { cgptCreativeDirectionHandoffFromBrief } from './pageConceptCgptCreativeBrief.js';
import {
  pageContextForGpt2Package,
  projectIdentityFromContext,
  resolvePageConceptProjectVisualIdentity,
  type PageConceptProjectVisualIdentity,
} from './pageConceptProjectVisualIdentity.js';

export type PageConceptGpt2AuthorityPackageSection = {
  id: string;
  title: string;
  approximateChars: number;
  priority: number;
};

export type PageConceptGpt2AuthorityPackage = {
  promptVersion: string;
  creativeAuthorityHierarchy: readonly string[];
  sections: PageConceptGpt2AuthorityPackageSection[];
  payload: Record<string, unknown>;
  identitySource: string;
  brandBibleSource: string;
  designSystemSource: string;
  creativeAppetiteSource: string;
  currentCapturePriority: number;
};

export const PAGE_GPT2_HANDOFF_OUTPUT_TARGET = '3_MOBILE_CONCEPTS' as const;

export const PAGE_GPT2_MOBILE_CONCEPT_SLOT_LABELS = [
  'GPT2 MOBILE PAGE CONCEPT A',
  'GPT2 MOBILE PAGE CONCEPT B',
  'GPT2 MOBILE PAGE CONCEPT C',
] as const;

export const PAGE_GPT2_MOBILE_HANDOFF_TASK = [
  'CREATE EXACTLY THREE DISTINCT MOBILE PAGE CONCEPTS FOR THIS PAGE.',
  '',
  'ALL THREE MUST:',
  '- derive from the SAME approved CGPT Creative Direction Brief',
  '- belong unmistakably to the same project world',
  '- preserve the same project identity',
  '- preserve the same SKINS contract',
  '- preserve the same required page function/content',
  '- treat the current implementation screenshot as FUNCTIONAL_CONTEXT_ONLY',
  '- preserve all forbidden-drift rules',
  '',
  'THE THREE CONCEPTS MUST NOT BE: color variants; minor layout variants; typography swaps; superficial rearrangements.',
  '',
  'THE THREE CONCEPTS MUST EXPLORE MEANINGFULLY DIFFERENT: composition strategies; information hierarchy; spatial rhythm; density; evidence placement; image use; editorial storytelling; interaction framing; page surprise.',
  '',
  'Each concept is a valid interpretation of the SAME creative premise.',
  '',
  'MOBILE-FIRST ONLY — do not generate Tablet, Desktop, or paired viewport outputs at this stage.',
  'Founder selects one Mobile concept before downstream viewport interpretation.',
].join('\n');

export const PAGE_CONCEPT_CREATIVE_AUTHORITY_HIERARCHY = [
  'PROJECT IDENTITY / BRAND BIBLE',
  'APPROVED PROJECT DESIGN LANGUAGE',
  'FOUNDER CREATIVE APPETITE / CREATIVE PARAMETERS',
  'CGPT CREATIVE DIRECTION',
  'PAGE ROLE + FUNCTION CONTRACT',
  'APPROVED VISUAL REFERENCES / AUTHORITY REFERENCES',
  'CURRENT IMPLEMENTATION CAPTURE (functional context only)',
  'GENERIC MODEL PRIORS (lowest — override when conflict)',
] as const;

export function pageConceptRequiresGpt2FounderReview(): boolean {
  return process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW !== 'false';
}

function cgptContractFromInjection(
  injection: PageCreativeInjection,
  brief?: PageConceptCgptCreativeBrief | null,
): Record<string, string> {
  if (brief) {
    return cgptCreativeDirectionHandoffFromBrief(brief);
  }
  const immutableRequirements = injection.immutableRequirements ?? [];
  const avoid =
    injection.avoidList && injection.avoidList.length > 0 ?
      injection.avoidList.join(' · ')
    : immutableRequirements.join(' · ');
  return {
    creativePremise: injection.creativeThesis,
    pageStory: injection.pagePurposeInterpretation,
    visualTerritory: injection.visualOpportunity,
    compositionStrategy: injection.spatialDirection,
    hierarchyStrategy: injection.hierarchyDirection,
    imageStrategy: injection.assetStrategy,
    typographyStrategy: injection.typographyStrategy ?? injection.hierarchyDirection,
    colorStrategy: injection.colorStrategy ?? injection.visualOpportunity,
    materialStrategy: injection.materialStrategy ?? injection.referenceStrategy,
    interactionCharacter: injection.responsiveDirection,
    identitySignals: '',
    skinSignals: '',
    distinctiveMove: injection.distinctiveMove ?? injection.informationPriority,
    mandatoryBrandSignals: immutableRequirements.join(' · ') || injection.creativeThesis,
    avoidList: avoid,
    creativeLatitude: injection.creativeLatitude,
    pageSurprise: injection.informationPriority,
    mobileDirection: injection.mobileDirection,
    desktopDirection: injection.desktopDirection,
  };
}

function sectionSize(value: unknown): number {
  try {
    return JSON.stringify(value).length;
  } catch {
    return 0;
  }
}

export function buildPageConceptGpt2AuthorityPackage(input: {
  projectContext: ProjectCreativeContext;
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
  injection: PageCreativeInjection;
  cgptBrief?: PageConceptCgptCreativeBrief | null;
  implementationCaptureNote?: string;
}): PageConceptGpt2AuthorityPackage {
  const visualIdentity = resolvePageConceptProjectVisualIdentity(input.projectContext.projectId);
  const projectIdentity = projectIdentityFromContext(input.projectContext, visualIdentity);
  const pagePackage = pageContextForGpt2Package(input.pageContext);
  const cgptContract = cgptContractFromInjection(input.injection, input.cgptBrief);

  const payload = {
    outputTarget: PAGE_GPT2_HANDOFF_OUTPUT_TARGET,
    mobileConceptSlots: PAGE_GPT2_MOBILE_CONCEPT_SLOT_LABELS,
    founderSelectionGate: 'AWAITING_FOUNDER_MOBILE_SELECTION',
    gpt2Task: PAGE_GPT2_MOBILE_HANDOFF_TASK,
    creativeAuthorityHierarchy: PAGE_CONCEPT_CREATIVE_AUTHORITY_HIERARCHY,
    projectIdentity,
    projectVisualIdentity: visualIdentity,
    pageContext: pagePackage,
    functionContract: {
      contractId: input.functionContract.contractId,
      version: input.functionContract.version,
      regions: input.functionContract.regions,
      interactions: input.functionContract.interactions,
      immutableBehaviors: input.functionContract.immutableBehaviors,
    },
    cgptCreativeDirection: cgptContract,
    implementationCapture: {
      role: 'FUNCTIONAL_CONTEXT_ONLY',
      priority: 7,
      note:
        input.implementationCaptureNote ??
        'Structural/information context only. Higher-priority identity layers override screenshot palette and layout clichés.',
    },
    forbiddenVisualDrift: visualIdentity?.forbiddenDrift ?? [],
    requiredOutputShape: {
      perMobileConcept: {
        slot: 'MOBILE CONCEPT A | MOBILE CONCEPT B | MOBILE CONCEPT C',
        artifactId: 'string',
        conceptId: 'string',
        conceptRationale: 'string',
        compositionSummary: 'string',
        hierarchySummary: 'string',
        distinctiveMove: 'string',
        cgptBriefId: 'string',
        skinContractVersion: 'string',
        projectIdentityVersion: 'string',
        mobileViewportImage: 'image',
      },
      count: 3,
    },
  };

  const sections: PageConceptGpt2AuthorityPackageSection[] = [
    { id: 'projectIdentity', title: 'PROJECT IDENTITY', approximateChars: sectionSize(projectIdentity), priority: 1 },
    {
      id: 'visualIdentity',
      title: 'PROJECT VISUAL IDENTITY',
      approximateChars: sectionSize(visualIdentity),
      priority: 1,
    },
    { id: 'cgpt', title: 'CGPT CREATIVE DIRECTION', approximateChars: sectionSize(cgptContract), priority: 4 },
    { id: 'page', title: 'PAGE ROLE', approximateChars: sectionSize(pagePackage), priority: 5 },
    { id: 'contract', title: 'FUNCTION CONTRACT', approximateChars: sectionSize(input.functionContract), priority: 5 },
    {
      id: 'capture',
      title: 'CURRENT IMPLEMENTATION CAPTURE',
      approximateChars: sectionSize(payload.implementationCapture),
      priority: 7,
    },
  ];

  return {
    promptVersion: 'page-gpt2-mobile-triple-handoff-v1',
    creativeAuthorityHierarchy: PAGE_CONCEPT_CREATIVE_AUTHORITY_HIERARCHY,
    sections,
    payload,
    identitySource: 'compileProjectCreativeContext + projectIntelligence',
    brandBibleSource: 'designProjectBinding/projectIntelligence + PROJECT_COPY',
    designSystemSource: 'pageConceptProjectVisualIdentity + project creative context',
    creativeAppetiteSource: 'ProjectCreativeContext.creativeAppetite',
    currentCapturePriority: 7,
  };
}

export type PageConceptGpt2GroundingValidation = {
  ok: boolean;
  errorCode: string | null;
  missing: string[];
};

export function validatePageConceptGpt2GroundingBeforeNbp(input: {
  projectId: string;
  package: PageConceptGpt2AuthorityPackage;
  concept: PageGPT2AuthorityConcept;
}): PageConceptGpt2GroundingValidation {
  const missing: string[] = [];
  if (input.projectId === 'ndxbook') {
    const identity = input.package.payload.projectVisualIdentity as PageConceptProjectVisualIdentity | null;
    if (!identity) missing.push('NDXBOOK_VISUAL_IDENTITY');
    const drift = identity?.forbiddenDrift?.length ?? 0;
    if (drift < 3) missing.push('NDXBOOK_FORBIDDEN_DRIFT_RULES');
    const signals = identity?.mandatoryBrandSignals?.length ?? 0;
    if (signals < 2) missing.push('NDXBOOK_MANDATORY_SIGNALS');
  }
  if (!input.concept.premise?.trim()) missing.push('GPT2_PREMISE');
  if (!input.concept.visualLanguage?.trim()) missing.push('GPT2_VISUAL_LANGUAGE');
  const cgpt = input.package.payload.cgptCreativeDirection as Record<string, string> | undefined;
  if (!cgpt?.creativePremise?.trim()) missing.push('CGPT_CREATIVE_PREMISE');
  return {
    ok: missing.length === 0,
    errorCode: missing.length ? 'GPT2_AUTHORITY_CONTEXT_INCOMPLETE' : null,
    missing,
  };
}

export function sanitizePageConceptGpt2AuthorityPackageForLog(
  pkg: PageConceptGpt2AuthorityPackage,
): PageConceptGpt2AuthorityPackage {
  return {
    ...pkg,
    payload: {
      ...pkg.payload,
      sections: pkg.sections.map((s) => ({ id: s.id, chars: s.approximateChars, priority: s.priority })),
    },
  };
}
