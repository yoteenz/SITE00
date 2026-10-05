/**
 * P0.VR.PAGE-CONCEPT-CGPT-BRIEF-INSPECTOR1 + CREATIVE-SYNTHESIS-LEAK-FIX1
 */

import type {
  PageConceptCgptBriefSectionSource,
  PageConceptCgptBriefSourceLineage,
  PageConceptCgptCreativeBrief,
  PageCreativeContext,
  PageCreativeInjection,
  PageFunctionContract,
  ProjectCreativeContext,
} from './types.js';

export type {
  PageConceptCgptBriefSectionSource,
  PageConceptCgptBriefSourceLineage,
  PageConceptCgptCreativeBrief,
};
import { compileProjectSkinContract, type ProjectSkinContract } from './pageConceptProjectSkinContract.js';
import { resolvePageConceptProjectVisualIdentity } from './pageConceptProjectVisualIdentity.js';
import {
  buildPageConceptGpt2AuthorityPackage,
  type PageConceptGpt2AuthorityPackage,
} from './pageConceptGpt2AuthorityPackage.js';
import {
  GPT2_HANDOFF_INTEGRITY_REQUIRED_KEYS,
  sanitizeBrandSignalLines,
  sanitizeProjectCreativeContextForCgpt,
  translateFunctionContractToCreativeRequirements,
} from './pageConceptCgptCreativeSynthesis.js';

export const PAGE_CGPT_BRIEF_VERSION = 'page-concept-cgpt-brief-v2-synthesis';

export type PageConceptCreativeLeakageDiagnostic = {
  identityGrounding: 'PRESENT' | 'MISSING';
  skinGrounding: 'PRESENT' | 'MISSING';
  pageFunction: 'PRESENT' | 'MISSING';
  currentCaptureRole: 'FUNCTION ONLY' | 'VISUAL AUTHORITY';
  gpt2Handoff: 'COMPLETE' | 'CONTEXT_LOSS';
};

export type PageConceptGpt2HandoffPresentation = {
  cgptBriefId: string;
  cgptBriefVersion: string;
  projectContextVersion: string;
  skinContractId: string;
  skinContractVersion: string;
  pageContextVersion: string;
  functionContractVersion: string;
  /** @deprecated use gpt2TaskInstructions — kept for log compatibility */
  authorityInstructions: string;
  gpt2OutputTarget: string;
  gpt2TaskInstructions: string;
  founderSelectionGate: string;
  currentCapturePriority: number;
  currentCaptureRole: string;
  cgptCreativeDirection: Record<string, string>;
};

function hashBriefPayload(payload: unknown): string {
  const s = JSON.stringify(payload);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function skinSignalLines(skin: ProjectSkinContract): string[] {
  return [
    `DISPLAY FONT: ${skin.typography.displayFont}`,
    `BODY FONT: ${skin.typography.bodyFont}`,
    `MONO FONT: ${skin.typography.monoFont}`,
    `PRIMARY PALETTE: ${skin.palette.slice(0, 4).join(' · ')}`,
    `ACCENT: ${skin.palette.find((p) => p.toLowerCase().includes('accent') || p.includes('#dbff')) ?? skin.palette[2] ?? '—'}`,
    `BACKGROUND / MATERIAL: ${skin.material.slice(0, 3).join(' · ')}`,
    `IMAGE LANGUAGE: ${skin.imagery.join(' · ')}`,
    `SPACING / DENSITY: ${skin.composition.slice(0, 2).join(' · ')}`,
    `COMPONENT EXPRESSION: ${skin.componentExpression.join(' · ')}`,
    `FORBIDDEN DRIFT: ${skin.forbiddenDrift.slice(0, 4).join(' · ')}`,
  ];
}

function synthesisText(primary: string | undefined, legacy: string | undefined): string {
  const p = (primary ?? '').trim();
  if (p) return p;
  return (legacy ?? '').trim();
}

export function compilePageConceptCgptCreativeBrief(input: {
  injection: PageCreativeInjection;
  projectContext: ProjectCreativeContext;
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
  captureSetId?: string | null;
}): PageConceptCgptCreativeBrief {
  const { injection, pageContext, functionContract } = input;
  const projectContext = sanitizeProjectCreativeContextForCgpt(input.projectContext);
  const skin = compileProjectSkinContract(projectContext.projectId);
  const visualIdentity = resolvePageConceptProjectVisualIdentity(projectContext.projectId);

  const avoidList =
    injection.avoidList && injection.avoidList.length > 0 ?
      sanitizeBrandSignalLines([...injection.avoidList])
    : sanitizeBrandSignalLines(visualIdentity?.forbiddenDrift?.slice(0, 6) ?? []);

  const mandatoryBrandSignals =
    injection.mandatoryBrandSignals && injection.mandatoryBrandSignals.length > 0 ?
      sanitizeBrandSignalLines([...injection.mandatoryBrandSignals])
    : sanitizeBrandSignalLines(visualIdentity?.mandatoryBrandSignals?.slice(0, 6) ?? []);

  const identitySignals = sanitizeBrandSignalLines([
    projectContext.brandTruth,
    projectContext.brandPersonality,
    projectContext.projectPurpose,
    projectContext.audience,
    projectContext.designLanguage,
  ]);

  const brandSignals = sanitizeBrandSignalLines([
    projectContext.tone,
    projectContext.creativeAppetite,
    projectContext.forbiddenPatterns,
  ]);

  const creativeFunctionalRequirements = translateFunctionContractToCreativeRequirements({
    functionContract,
    pageContext,
  });

  const creativePremise = synthesisText(injection.creativePremise, injection.creativeThesis);
  const pageStory = synthesisText(injection.pageStory, injection.pagePurposeInterpretation);
  const compositionStrategy = synthesisText(injection.compositionStrategy, injection.spatialDirection);
  const hierarchyStrategy = synthesisText(injection.hierarchyStrategy, injection.hierarchyDirection);
  const typographyStrategy = synthesisText(injection.typographyStrategy, '');
  const colorStrategy = synthesisText(injection.colorStrategy, injection.visualOpportunity);
  const materialStrategy = synthesisText(injection.materialStrategy, injection.referenceStrategy);
  const imageryStrategy = synthesisText(injection.imageryStrategy, injection.assetStrategy);
  const imageStrategy = synthesisText(injection.imageStrategy, injection.imageDataBalance);
  const interactionCharacter = synthesisText(injection.interactionCharacter, injection.responsiveDirection);
  const visualTerritory = synthesisText(injection.visualTerritory, injection.visualOpportunity);
  const distinctiveMove = synthesisText(injection.distinctiveMove, '');
  const pageSurprise = synthesisText(injection.pageSurprise, '');

  const briefCore = {
    injectionId: injection.injectionId,
    creativePremise,
    pagePurpose: injection.pagePurposeInterpretation,
    audienceIntent: injection.audienceIntent ?? projectContext.audience,
    pageStory,
    compositionStrategy,
    hierarchyStrategy,
    typographyStrategy,
    colorStrategy,
    materialStrategy,
    imageryStrategy,
    imageStrategy,
    visualTerritory,
    interactionCharacter,
    distinctiveMove,
    pageSurprise,
    mobileDirection: (injection.mobileDirection ?? '').trim(),
    desktopDirection: (injection.desktopDirection ?? '').trim(),
    mandatoryBrandSignals,
    avoidList,
  };

  const contentHash = hashBriefPayload(briefCore);

  return {
    briefId: `pcgb-${injection.injectionId}`,
    version: PAGE_CGPT_BRIEF_VERSION,
    contentHash,
    projectId: injection.projectId,
    pageId: injection.pageId,
    injectionId: injection.injectionId,
    creativePremise: briefCore.creativePremise,
    pagePurpose: briefCore.pagePurpose,
    audienceIntent: briefCore.audienceIntent,
    pageStory: briefCore.pageStory,
    identitySignals,
    brandSignals,
    skinSignals: skinSignalLines(skin),
    compositionStrategy: briefCore.compositionStrategy,
    hierarchyStrategy: briefCore.hierarchyStrategy,
    typographyStrategy: briefCore.typographyStrategy,
    colorStrategy: briefCore.colorStrategy,
    materialStrategy: briefCore.materialStrategy,
    imageryStrategy: briefCore.imageryStrategy,
    imageStrategy: briefCore.imageStrategy,
    visualTerritory: briefCore.visualTerritory,
    interactionCharacter: briefCore.interactionCharacter,
    pageSurprise: briefCore.pageSurprise,
    mobileDirection: briefCore.mobileDirection,
    desktopDirection: briefCore.desktopDirection,
    mandatoryBrandSignals: briefCore.mandatoryBrandSignals,
    keyMessages: [injection.informationPriority, injection.imageDataBalance].filter(Boolean),
    requiredContent: [...pageContext.requiredContent].filter((c) => c.trim().length > 0),
    functionalRequirements: creativeFunctionalRequirements,
    creativeLatitude: injection.creativeLatitude,
    distinctiveMove: briefCore.distinctiveMove,
    avoidList: briefCore.avoidList,
    currentImplementationRole: 'FUNCTIONAL_REFERENCE_ONLY',
    aestheticAuthorityFromCapture: 'NO',
    sourceLineage: {
      projectContextVersion: projectContext.contextVersion,
      pageContextVersion: pageContext.contextVersion,
      functionContractVersion: functionContract.version,
      skinVersion: skin.version,
      captureRefs: input.captureSetId ?? pageContext.currentCaptureSummary,
    },
    sectionSources: [
      { sectionId: 'identitySignals', sourceLabel: 'IDENTITY + INTAKE' },
      { sectionId: 'skinSignals', sourceLabel: 'SKINS' },
      { sectionId: 'pageStory', sourceLabel: 'PAGE ROLE + CGPT SYNTHESIS' },
      { sectionId: 'functionalRequirements', sourceLabel: 'CREATIVE FUNCTION REQUIREMENTS' },
      { sectionId: 'currentImplementation', sourceLabel: 'FUNCTIONAL REFERENCE ONLY' },
    ],
    createdAt: injection.createdAt,
  };
}

export function cgptCreativeDirectionHandoffFromBrief(
  brief: PageConceptCgptCreativeBrief,
): Record<string, string> {
  return {
    creativePremise: brief.creativePremise,
    pageStory: brief.pageStory,
    visualTerritory: brief.visualTerritory,
    compositionStrategy: brief.compositionStrategy,
    hierarchyStrategy: brief.hierarchyStrategy,
    typographyStrategy: brief.typographyStrategy,
    colorStrategy: brief.colorStrategy,
    materialStrategy: brief.materialStrategy,
    imageryStrategy: brief.imageryStrategy,
    imageStrategy: brief.imageStrategy,
    interactionCharacter: brief.interactionCharacter,
    identitySignals: brief.identitySignals.join(' · '),
    skinSignals: brief.skinSignals.join(' · '),
    distinctiveMove: brief.distinctiveMove,
    pageSurprise: brief.pageSurprise,
    avoidList: brief.avoidList.join(' · '),
    mandatoryBrandSignals: brief.mandatoryBrandSignals.join(' · '),
    creativeLatitude: brief.creativeLatitude,
    mobileDirection: brief.mobileDirection,
    desktopDirection: brief.desktopDirection,
  };
}

export function verifyGpt2HandoffContextIntegrity(input: {
  brief: PageConceptCgptCreativeBrief;
  package: PageConceptGpt2AuthorityPackage;
}): { ok: boolean; errorCode: string | null; missing: string[] } {
  const cgpt = input.package.payload.cgptCreativeDirection as Record<string, string> | undefined;
  const missing: string[] = [];
  if (!cgpt) return { ok: false, errorCode: 'GPT2_HANDOFF_CONTEXT_LOSS', missing: ['CGPT_HANDOFF'] };

  for (const key of GPT2_HANDOFF_INTEGRITY_REQUIRED_KEYS) {
    const value = cgpt[key]?.trim();
    if (!value) missing.push(key);
  }

  return {
    ok: missing.length === 0,
    errorCode: missing.length ? 'GPT2_HANDOFF_CONTEXT_LOSS' : null,
    missing,
  };
}

export function buildPageConceptGpt2HandoffPresentation(input: {
  brief: PageConceptCgptCreativeBrief;
  package: PageConceptGpt2AuthorityPackage;
  skinContractId: string;
  skinContractVersion: string;
}): PageConceptGpt2HandoffPresentation {
  const cgpt = input.package.payload.cgptCreativeDirection as Record<string, string>;
  const capture = input.package.payload.implementationCapture as { role?: string; priority?: number };
  const task = String(input.package.payload.gpt2Task ?? '');
  return {
    cgptBriefId: input.brief.briefId,
    cgptBriefVersion: input.brief.version,
    projectContextVersion: input.brief.sourceLineage.projectContextVersion ?? '—',
    skinContractId: input.skinContractId,
    skinContractVersion: input.skinContractVersion,
    pageContextVersion: input.brief.sourceLineage.pageContextVersion ?? '—',
    functionContractVersion: input.brief.sourceLineage.functionContractVersion ?? '—',
    authorityInstructions: task,
    gpt2OutputTarget: String(input.package.payload.outputTarget ?? '3_MOBILE_CONCEPTS'),
    gpt2TaskInstructions: task,
    founderSelectionGate: String(input.package.payload.founderSelectionGate ?? 'AWAITING_FOUNDER_MOBILE_SELECTION'),
    currentCapturePriority: input.package.currentCapturePriority,
    currentCaptureRole: capture?.role ?? 'FUNCTIONAL_CONTEXT_ONLY',
    cgptCreativeDirection: cgpt,
  };
}

export function buildCreativeLeakageDiagnostic(input: {
  brief: PageConceptCgptCreativeBrief;
  handoffIntegrity: ReturnType<typeof verifyGpt2HandoffContextIntegrity>;
}): PageConceptCreativeLeakageDiagnostic {
  return {
    identityGrounding: input.brief.identitySignals.length > 0 ? 'PRESENT' : 'MISSING',
    skinGrounding: input.brief.skinSignals.length > 0 ? 'PRESENT' : 'MISSING',
    pageFunction:
      input.brief.functionalRequirements.length > 0 || input.brief.requiredContent.length > 0 ?
        'PRESENT'
      : 'MISSING',
    currentCaptureRole: 'FUNCTION ONLY',
    gpt2Handoff: input.handoffIntegrity.ok ? 'COMPLETE' : 'CONTEXT_LOSS',
  };
}

export function buildPageConceptGpt2HandoffViewModel(input: {
  brief: PageConceptCgptCreativeBrief;
  injection: PageCreativeInjection;
  projectContext: ProjectCreativeContext;
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
}): {
  handoff: PageConceptGpt2HandoffPresentation;
  integrity: ReturnType<typeof verifyGpt2HandoffContextIntegrity>;
  diagnostic: PageConceptCreativeLeakageDiagnostic;
} {
  const skin = compileProjectSkinContract(input.projectContext.projectId);
  const pkg = buildPageConceptGpt2AuthorityPackage({
    projectContext: input.projectContext,
    pageContext: input.pageContext,
    functionContract: input.functionContract,
    injection: input.injection,
    cgptBrief: input.brief,
  });
  const integrity = verifyGpt2HandoffContextIntegrity({ brief: input.brief, package: pkg });
  return {
    handoff: buildPageConceptGpt2HandoffPresentation({
      brief: input.brief,
      package: pkg,
      skinContractId: skin.contractId,
      skinContractVersion: skin.version,
    }),
    integrity,
    diagnostic: buildCreativeLeakageDiagnostic({ brief: input.brief, handoffIntegrity: integrity }),
  };
}

export function resolveCgptBriefFromGenerationState(input: {
  brief: PageConceptCgptCreativeBrief | null | undefined;
  injection: PageCreativeInjection | null;
  projectContext: ProjectCreativeContext | null;
  pageContext: PageCreativeContext | null;
  functionContract: PageFunctionContract | null;
  captureSetId?: string | null;
}): PageConceptCgptCreativeBrief | null {
  if (input.brief) return input.brief;
  if (!input.injection || !input.projectContext || !input.pageContext || !input.functionContract) {
    return null;
  }
  return compilePageConceptCgptCreativeBrief({
    injection: input.injection,
    projectContext: input.projectContext,
    pageContext: input.pageContext,
    functionContract: input.functionContract,
    captureSetId: input.captureSetId,
  });
}
