/**
 * P0.VR.GPT2-PROMPT-COMPACTION-COMPILER1 — compact provider prompt, full contract lineage stored upstream.
 */

import type {
  PageConceptCgptCreativeBrief,
  PageConceptPageArchitectureBrief,
  PageCreativeInjection,
  PageFunctionContract,
  PageCreativeContext,
} from './types.js';
import type { ProjectSkinContract } from './pageConceptProjectSkinContract.js';
import type { PageMobileConceptSlotId } from './pageConceptViewportAuthorityFamily.js';
import { PAGE_GPT2_MOBILE_FORBIDDEN_OUTPUT_TYPES } from './pageConceptGpt2MobilePageAuthority.js';
import {
  buildGpt2MobileAuthorityHierarchyBlock,
  buildGpt2MobileBottomNavInheritanceBlock,
  buildGpt2MobileDistinctnessBlock,
  buildGpt2MobileFunctionalInvariantsBlock,
  buildGpt2MobileLightFamilyBlock,
  buildGpt2MobileUppercaseTypographyBlock,
  gpt2MobileConceptTerritoryDelta,
  resolveGpt2MobileConceptTerritorySpec,
  validateGpt2MobileConceptQualityPrompt,
  type Gpt2MobileConceptThemeClass,
} from './pageConceptGpt2MobileConceptContracts.js';
import {
  buildGpt2MobileBottomContinuityAuthorityBlock,
  buildGpt2MobileBottomNavLockBlock,
  buildGpt2MobileConceptualFreedomBoundaryBlock,
  buildGpt2MobileDesignAuthoritySourceBlock,
  buildGpt2MobileFullPageOutputRequirementBlock,
  buildGpt2MobileFunctionalReferenceOnlyBlock,
  buildGpt2MobileLowerPageRegionMapBlock,
  buildGpt2MobileMobilePageFunctionAuthorityBlock,
} from './pageConceptGpt2MobileContinuityLock.js';
import { assertScreenshotDesignAuthorityForbidden } from './pageConceptGpt2MobileReferenceAuthority.js';
import {
  compileGpt2MobileScreenshotFunctionBlock,
  type ScreenshotFunctionalPageMap,
} from './pageConceptScreenshotFunctionalPageMap.js';
import { buildGpt2TargetRouteContextBlock } from './pageConceptTargetPageContext.js';
import {
  compileWebExpressionTerritoryPromptBlock,
  type WebExpressionTerritory,
} from './pageConceptWebExpressionTerritories.js';

export const COMPILED_GPT2_MOBILE_PROVIDER_PROMPT_VERSION =
  'gpt2-mobile-provider-prompt-v7-web-expression-territories';

/** Provider hard max (gpt-image-2). */
export const GPT2_PROVIDER_PROMPT_MAX_CHARS = 32000;

/** Internal safe ceiling — fail dispatch before provider if above this after compaction. */
export const MAX_PROVIDER_PROMPT_CHARS = 24000;

export type Gpt2MobileProviderPromptCompileInput = {
  slot: PageMobileConceptSlotId;
  cgptBrief: PageConceptCgptCreativeBrief | null;
  pageArchitectureBrief: PageConceptPageArchitectureBrief | null;
  skinContract: ProjectSkinContract;
  functionContract: PageFunctionContract;
  pageContext: PageCreativeContext;
  injection: PageCreativeInjection;
  bottomContinuityApplied: boolean;
  mobileViewport: { width: number; height: number };
  referenceImageRoleSummary?: string;
  creativeSupportAttached?: boolean;
  bottomHalfAuthorityAttached?: boolean;
  bottomNavAuthorityAttached?: boolean;
  topStructuralCaptureAttached?: boolean;
  middleStructuralCaptureAttached?: boolean;
  bottomStructuralCaptureAttached?: boolean;
  bottomContinuityLockActive?: boolean;
  screenshotFunctionalPageMap?: ScreenshotFunctionalPageMap | null;
  webExpressionTerritory?: WebExpressionTerritory | null;
};

export type Gpt2MobileCompiledProviderPrompt = {
  prompt: string;
  compiledPromptVersion: string;
  compiledPromptHash: string;
  compiledPromptCharCount: number;
  safeLimit: number;
  sourceContractIds: {
    cgptBriefId: string | null;
    pageArchitectureBriefId: string | null;
    skinContractId: string;
    functionContractId: string;
    bottomContinuityContractId: string | null;
  };
  territoryDelta: string;
  sharedBaseHash: string;
  conceptTerritoryLabel: string;
  conceptThemeClass: Gpt2MobileConceptThemeClass;
  conceptQualityContractsApplied: boolean;
};

function hashPrompt(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function clipSentences(text: string, maxSentences: number): string {
  const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  return parts.slice(0, maxSentences).join(' ').trim();
}

function compactSkin(skin: ProjectSkinContract): string {
  const palette = skin.palette.slice(0, 4).join(' / ');
  const materials = skin.material.slice(0, 4).join(' / ');
  const imagery = skin.imagery.slice(0, 3).join(' / ');
  const avoid = skin.forbiddenDrift.slice(0, 5).join('; ');
  return [
    `DISPLAY: ${skin.typography.displayFont}`,
    `BODY: ${skin.typography.bodyFont}`,
    `MONO: ${skin.typography.monoFont}`,
    `PALETTE: ${palette}`,
    `MATERIALS: ${materials}`,
    `IMAGE LANGUAGE: ${imagery}`,
    `AVOID DRIFT: ${avoid}`,
  ].join('\n');
}

function compactCreativeDirection(
  brief: PageConceptCgptCreativeBrief | null,
  injection: PageCreativeInjection,
): string {
  const premise = clipSentences(brief?.creativePremise ?? injection.creativeThesis ?? injection.creativePremise ?? '', 2);
  const story = clipSentences(brief?.pageStory ?? injection.pagePurposeInterpretation ?? '', 3);
  const move = clipSentences(brief?.distinctiveMove ?? injection.distinctiveMove ?? injection.informationPriority ?? '', 1);
  const surprise = clipSentences(brief?.pageSurprise ?? injection.pageSurprise ?? '', 1);
  const mobile = clipSentences(brief?.mobileDirection ?? injection.mobileDirection ?? '', 3);
  return [
    `CREATIVE PREMISE: ${premise}`,
    `PAGE STORY: ${story}`,
    `DISTINCTIVE MOVE: ${move}`,
    `PAGE SURPRISE: ${surprise}`,
    `MOBILE DIRECTION: ${mobile}`,
  ].join('\n');
}

function compactPageRegions(arch: PageConceptPageArchitectureBrief): string {
  return arch.mobileRegionMap
    .map((r, i) => `${i + 1}. ${r.title}: ${clipSentences(r.obligations[0] ?? r.title, 1)}`)
    .join('\n');
}

function compactNavigation(arch: PageConceptPageArchitectureBrief): string {
  const targetLabel = arch.targetRouteContract?.targetRouteLabel ?? `${arch.pageIdentity.moduleContext} > ${arch.pageIdentity.page}`;
  const lines = [
    `Target product route: ${targetLabel} — NOT the Design workspace authoring environment.`,
    'Entry/index rows are functional navigation — not decorative labels.',
    'Overview must read as the current page in the PROJECTS product experience.',
    'Preserve approved bottom navigation from capture C — do not invent unrelated nav systems.',
  ];
  for (const line of arch.navigationContract.inPageNavigation.slice(0, 2)) {
    lines.push(clipSentences(line.replace(/^Interaction /i, ''), 1));
  }
  return lines.map((l) => `- ${l}`).join('\n');
}

function compactRequiredContent(arch: PageConceptPageArchitectureBrief): string {
  const items = arch.translatedPagePurpose.slice(0, 6).map((t) => clipSentences(t, 1));
  if (items.length === 0) {
    return '- Overview identity, entries, evidence, active state, deeper access, bottom host continuity.';
  }
  return items.map((t) => `- ${t}`).join('\n');
}

function compactAvoidList(
  brief: PageConceptCgptCreativeBrief | null,
  injection: PageCreativeInjection,
  skin: ProjectSkinContract,
): string {
  const parts = new Set<string>();
  for (const t of PAGE_GPT2_MOBILE_FORBIDDEN_OUTPUT_TYPES) {
    parts.add(t.replace(/\s+/g, ' ').trim());
  }
  for (const a of brief?.avoidList ?? injection.avoidList ?? []) {
    if (a.trim()) parts.add(a.trim());
  }
  for (const d of skin.forbiddenDrift) {
    if (d.trim()) parts.add(d.trim());
  }
  parts.add('poster composition');
  parts.add('brand-board layout');
  parts.add('generic SaaS dashboard');
  parts.add('full-page screenshot mimicry');
  parts.add('decorative navigation only');
  return [...parts].slice(0, 14).join('; ');
}

/** @deprecated use gpt2MobileConceptTerritoryDelta from concept contracts */
export function compactGpt2MobileTerritoryDelta(input: {
  slot: PageMobileConceptSlotId;
  injection: PageCreativeInjection;
  brief: PageConceptCgptCreativeBrief | null;
}): string {
  return gpt2MobileConceptTerritoryDelta(input.slot);
}

function buildImageRoleDefinitions(input: Gpt2MobileProviderPromptCompileInput): string {
  const topAttached = input.topStructuralCaptureAttached ?? input.bottomHalfAuthorityAttached;
  const middleAttached = input.middleStructuralCaptureAttached ?? input.bottomHalfAuthorityAttached;
  const bottomAttached = input.bottomStructuralCaptureAttached ?? input.bottomNavAuthorityAttached;
  const imageALine =
    topAttached ?
      'Structural Capture A (TOP_STRUCTURAL_CAPTURE): top nav/shell, breadcrumb, page identity header, first major block — FUNCTIONAL context only.'
    : 'Structural Capture A (TOP_STRUCTURAL_CAPTURE): missing — package invalid.';
  const imageBLine =
    middleAttached ?
      'Structural Capture B (MIDDLE_STRUCTURAL_CAPTURE): core content, cards/metrics, middle interactions — FUNCTIONAL context only.'
    : 'Structural Capture B (MIDDLE_STRUCTURAL_CAPTURE): missing — package invalid.';
  const imageCLine =
    bottomAttached ?
      'Structural Capture C (BOTTOM_STRUCTURAL_CAPTURE): true page bottom — lower continuation, final content, real bottom nav/panel — FUNCTIONAL context only.'
    : 'Structural Capture C (BOTTOM_STRUCTURAL_CAPTURE): missing — do not invent bottom nav.';
  return [
    'IMAGE ROLE DEFINITIONS (provider attachments — fixed order):',
    'These captures show the current page function and structure only. They are not visual design references.',
    imageALine,
    imageBLine,
    imageCLine,
    '',
    'DESIGN AUTHORITY: CGPT creative direction + PAGE REGIONS + architecture contract + VISUAL SYSTEM + territory.',
    'FUNCTIONAL REFERENCE ONLY: Structural Captures A/B/C (layout logic, anatomy, nav placement — never styling).',
    'SCREENSHOT_DESIGN_AUTHORITY: FORBIDDEN.',
    '',
    'USE CAPTURES FOR: section order, page anatomy, navigation placement, bottom continuity, interaction presence.',
    'DO NOT USE CAPTURES FOR: styling mimicry, literal pixel clone, screenshot restyle, inventing new bottom tabs/footer, poster compositions.',
    input.referenceImageRoleSummary ? `ATTACHED SUMMARY: ${input.referenceImageRoleSummary}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildRoleHeader(arch: PageConceptPageArchitectureBrief, viewport: { width: number; height: number }): string {
  const id = arch.pageIdentity;
  const target = arch.targetRouteContract;
  return [
    'ROLE:',
    'Design ONE real mobile website page concept (full scrollable product page in a digital product).',
    '',
    `PAGE: ${target?.targetRouteLabel ?? `${id.siteContext} > ${id.moduleContext} > ${id.page}`}`,
    `ROUTE: ${target?.targetRoute ?? id.route}`,
    `VIEWPORT: ${viewport.width}×${viewport.height} portrait mobile.`,
    '',
    'NOT: poster, graphic, social asset, book cover, brand board, campaign artboard.',
    '',
    'GOAL:',
    'Create a usable mobile Overview page with required navigation, content regions, scroll structure, and bottom continuity.',
    'STEP 2 GPT2 MOBILE — NOT NBP rendition pass.',
  ].join('\n');
}

export function compileGpt2MobileProviderPromptBase(input: Gpt2MobileProviderPromptCompileInput): {
  basePrompt: string;
  territoryDelta: string;
} {
  const arch = input.pageArchitectureBrief;
  if (!arch) {
    throw new Error('PAGE_ARCHITECTURE_INCOMPLETE: missing brief for provider compile');
  }
  if (!input.screenshotFunctionalPageMap) {
    throw new Error('SCREENSHOT_FUNCTION_MAP_INCOMPLETE: missing functional page map for GPT2 compile');
  }

  const territoryDelta =
    input.webExpressionTerritory ?
      compileWebExpressionTerritoryPromptBlock(input.webExpressionTerritory)
    : gpt2MobileConceptTerritoryDelta(input.slot);
  const functionBlock = compileGpt2MobileScreenshotFunctionBlock(input.screenshotFunctionalPageMap);
  const targetRouteBlock = arch.targetRouteContract ? buildGpt2TargetRouteContextBlock(arch.targetRouteContract) : '';

  const baseSections = [
    buildRoleHeader(arch, input.mobileViewport),
    '',
    targetRouteBlock,
    targetRouteBlock ? '' : null,
    buildGpt2MobileAuthorityHierarchyBlock(),
    '',
    buildGpt2MobileDesignAuthoritySourceBlock(),
    '',
    buildGpt2MobileFunctionalReferenceOnlyBlock(),
    '',
    functionBlock,
    '',
    buildGpt2MobileFunctionalInvariantsBlock(),
    '',
    buildGpt2MobileMobilePageFunctionAuthorityBlock(),
    '',
    buildGpt2MobileBottomContinuityAuthorityBlock(),
    '',
    buildGpt2MobileConceptualFreedomBoundaryBlock(),
    '',
    buildImageRoleDefinitions(input),
    '',
    buildGpt2MobileBottomNavLockBlock(),
    '',
    buildGpt2MobileFullPageOutputRequirementBlock(),
    '',
    buildGpt2MobileLowerPageRegionMapBlock(),
    '',
    buildGpt2MobileBottomNavInheritanceBlock(input.bottomContinuityApplied || input.bottomContinuityLockActive === true),
    '',
    buildGpt2MobileUppercaseTypographyBlock(),
    '',
    buildGpt2MobileLightFamilyBlock(),
    '',
    buildGpt2MobileDistinctnessBlock(),
    '',
    'PAGE ARCHITECTURE / LAYOUT AUTHORITY:',
    'Full mobile website page — SITE 00 host shell, PROJECTS product route, project Overview identity, hero/overview read, status/orientation block, entry index navigation, evidence/content field, current work / deeper access, lower page + bottom navigation.',
    '',
    'PAGE REGIONS:',
    compactPageRegions(arch),
    '',
    'NAVIGATION / CONTINUITY:',
    compactNavigation(arch),
    input.bottomContinuityLockActive ?
      'Bottom continuity lock ACTIVE: Structural Capture C defines true page bottom + bottom nav — inherit exactly; no invented footer/tabs.'
    : input.bottomContinuityApplied ?
      'Bottom continuity: inherit bottom nav/panel from Images A+C — do not redesign tabs.'
    : 'Bottom continuity: inherit bottom nav structure from full-page capture — do not redesign tabs.',
    '',
    'REQUIRED PAGE CONTENT:',
    compactRequiredContent(arch),
    '',
    'VISUAL SYSTEM / BRAND LANGUAGE:',
    compactSkin(input.skinContract),
    '',
    'CREATIVE DIRECTION (style — not structure):',
    compactCreativeDirection(input.cgptBrief, input.injection),
    '',
    'HARD DO / DO NOT:',
    'DO: one coherent portrait mobile product page; ALL UPPERCASE UI text; light-dominant field per territory; interactable regions; structure from captures + page architecture; design from CGPT + contracts; distinct territory vs A/B/C siblings.',
    'DO NOT: poster, moodboard, three black inverse pages, invented bottom nav, sentence-case text, design-only-from-support-images, superficial shuffle variants.',
    '',
    'AVOID:',
    compactAvoidList(input.cgptBrief, input.injection, input.skinContract),
    '',
    'OUTPUT FORMAT:',
    'One FULL portrait mobile viewport page concept (9:16) including lower-page continuity context and source-locked bottom nav — edge-to-edge readable hierarchy; not a cropped top-half poster.',
  ];

  return { basePrompt: baseSections.filter((s) => s != null).join('\n'), territoryDelta };
}

function dedupeLines(text: string): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of text.split('\n')) {
    const key = line.trim().toLowerCase();
    if (!key) {
      out.push('');
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out.join('\n');
}

function compressionPass(prompt: string): string {
  let out = dedupeLines(prompt);
  out = out.replace(/\n{3,}/g, '\n\n');
  out = out.replace(/ {2,}/g, ' ');
  if (out.length > MAX_PROVIDER_PROMPT_CHARS) {
    out = out.replace(/CREATIVE DIRECTION:[\s\S]*?(?=BOTTOM CONTINUITY:)/, (block) => {
      const lines = block.split('\n').slice(0, 4);
      return `${lines.join('\n')}\n`;
    });
  }
  if (out.length > MAX_PROVIDER_PROMPT_CHARS) {
    out = out.replace(/VISUAL SYSTEM:[\s\S]*?(?=CREATIVE DIRECTION:)/, (block) => {
      const lines = block.split('\n').slice(0, 5);
      return `${lines.join('\n')}\n`;
    });
  }
  return out.trim();
}

export type CompiledProviderPromptValidation = {
  ok: boolean;
  errorCode: 'GPT2_PROVIDER_PROMPT_TOO_LONG' | 'GPT2_PROVIDER_PROMPT_EMPTY' | 'GPT2_PROVIDER_PROMPT_INCOMPLETE' | null;
  missingSections: string[];
  compiledCharCount: number;
  maxAllowed: number;
  largestSection?: string;
};

export function validateCompiledProviderPrompt(prompt: string): CompiledProviderPromptValidation {
  const compiledCharCount = prompt.length;
  const missingSections: string[] = [];
  if (!prompt.trim()) {
    return {
      ok: false,
      errorCode: 'GPT2_PROVIDER_PROMPT_EMPTY',
      missingSections: ['prompt'],
      compiledCharCount,
      maxAllowed: MAX_PROVIDER_PROMPT_CHARS,
    };
  }
  const lower = prompt.toLowerCase();
  if (!lower.includes('page regions')) missingSections.push('architecture');
  if (!lower.includes('navigation')) missingSections.push('navigation');
  if (!lower.includes('visual system')) missingSections.push('skin');
  if (!lower.includes('continuity')) missingSections.push('continuity');
  if (!lower.includes('image role definitions')) missingSections.push('imageRoles');
  if (!lower.includes('output format')) missingSections.push('outputFormat');
  if (!lower.includes('site 00') && !lower.includes('role:')) missingSections.push('pageIdentity');
  const quality = validateGpt2MobileConceptQualityPrompt(prompt);
  if (!quality.ok) missingSections.push(...quality.missingContracts);

  if (compiledCharCount > MAX_PROVIDER_PROMPT_CHARS) {
    const sections = prompt.split(/\n(?=[A-Z][A-Z /]+:)/);
    const largest = sections.reduce(
      (best, s) => (s.length > (best?.length ?? 0) ? s : best),
      sections[0] ?? '',
    );
    const head = largest.split('\n')[0]?.trim() ?? 'unknown';
    return {
      ok: false,
      errorCode: 'GPT2_PROVIDER_PROMPT_TOO_LONG',
      missingSections,
      compiledCharCount,
      maxAllowed: MAX_PROVIDER_PROMPT_CHARS,
      largestSection: head,
    };
  }
  if (missingSections.length) {
    return {
      ok: false,
      errorCode: 'GPT2_PROVIDER_PROMPT_INCOMPLETE',
      missingSections,
      compiledCharCount,
      maxAllowed: MAX_PROVIDER_PROMPT_CHARS,
    };
  }
  return {
    ok: true,
    errorCode: null,
    missingSections: [],
    compiledCharCount,
    maxAllowed: MAX_PROVIDER_PROMPT_CHARS,
  };
}

export function compileGpt2MobileProviderPrompt(
  input: Gpt2MobileProviderPromptCompileInput,
): Gpt2MobileCompiledProviderPrompt {
  const { basePrompt, territoryDelta } = compileGpt2MobileProviderPromptBase(input);
  let prompt =
    input.webExpressionTerritory ?
      `${basePrompt}\n\n${territoryDelta}`
    : `${basePrompt}\n\nCONCEPT TERRITORY (VARIES A/B/C — ARCHITECTURE SHARED):\n${territoryDelta}`;
  if (prompt.length > MAX_PROVIDER_PROMPT_CHARS) {
    prompt = compressionPass(prompt);
    if (prompt.length > MAX_PROVIDER_PROMPT_CHARS) {
      prompt = `${compressionPass(basePrompt)}\n\nTERRITORY:\n${clipSentences(territoryDelta, 2)}`;
    }
  }

  const validation = validateCompiledProviderPrompt(prompt);
  if (!validation.ok) {
    throw new Error(
      `${validation.errorCode ?? 'GPT2_PROVIDER_PROMPT_INVALID'}: chars=${validation.compiledCharCount} max=${validation.maxAllowed} section=${validation.largestSection ?? '—'} missing=${validation.missingSections.join(',')}`,
    );
  }
  if (prompt.length > GPT2_PROVIDER_PROMPT_MAX_CHARS) {
    throw new Error(`GPT2_PROVIDER_PROMPT_TOO_LONG: chars=${prompt.length} max=${GPT2_PROVIDER_PROMPT_MAX_CHARS}`);
  }
  assertScreenshotDesignAuthorityForbidden(prompt);

  const arch = input.pageArchitectureBrief!;
  const territorySpec =
    input.webExpressionTerritory ?
      {
        slot: input.slot,
        territoryKey: input.webExpressionTerritory.territoryId,
        territoryLabel: input.webExpressionTerritory.name,
        themeClass: 'LIGHT' as const,
        territoryPromptBlock: territoryDelta,
      }
    : resolveGpt2MobileConceptTerritorySpec(input.slot);
  const quality = validateGpt2MobileConceptQualityPrompt(prompt);
  return {
    prompt,
    compiledPromptVersion: COMPILED_GPT2_MOBILE_PROVIDER_PROMPT_VERSION,
    compiledPromptHash: hashPrompt(prompt),
    compiledPromptCharCount: prompt.length,
    safeLimit: MAX_PROVIDER_PROMPT_CHARS,
    sourceContractIds: {
      cgptBriefId: input.cgptBrief?.briefId ?? null,
      pageArchitectureBriefId: arch.briefId,
      skinContractId: input.skinContract.contractId,
      functionContractId: input.functionContract.contractId,
      bottomContinuityContractId: arch.bottomContinuityContractId,
    },
    territoryDelta,
    sharedBaseHash: hashPrompt(basePrompt),
    conceptTerritoryLabel: territorySpec.territoryLabel,
    conceptThemeClass: territorySpec.themeClass,
    conceptQualityContractsApplied: quality.ok,
  };
}

/** For tests: verify A/B/C share identical base hash with different territory. */
export function compileGpt2MobileProviderPromptSharedBaseHash(
  input: Omit<Gpt2MobileProviderPromptCompileInput, 'slot'>,
): string {
  return compileGpt2MobileProviderPromptBase({ ...input, slot: 'MOBILE_CONCEPT_A' }).basePrompt;
}
