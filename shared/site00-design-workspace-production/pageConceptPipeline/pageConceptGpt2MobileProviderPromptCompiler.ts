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

export const COMPILED_GPT2_MOBILE_PROVIDER_PROMPT_VERSION = 'gpt2-mobile-provider-prompt-v3-distinction-fix';

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
  const lines = [
    'Preserve SITE 00 host context and DESIGN workspace framing.',
    'Entry/index rows are functional navigation — not decorative labels.',
    'Overview must read as the current page in the project.',
    'Preserve approved bottom continuity navigation — do not invent unrelated nav systems.',
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
  const imageCLine =
    input.creativeSupportAttached ?
      'Image C (CREATIVE_SUPPORT_REFERENCE): optional editorial / evidence tone reference — influences aesthetic expression only, NOT page layout or navigation structure.'
    : 'Image C (CREATIVE_SUPPORT_REFERENCE): not attached for this run.';
  return [
    'IMAGE ROLE DEFINITIONS (provider attachments — fixed order):',
    'Image A (FUNCTIONAL_PAGE_REFERENCE): authoritative NDXBOOK Overview mobile capture — layout, module order, functional zones, AND bottom navigation/panel structure/behavior. Use for structure + continuity logic. Do not raster-clone aesthetics.',
    'Image B (CONTINUITY_REFERENCE): bottom host strip from same capture — confirms bottom nav/panel pixels. Match tab count/order/roles from Image A. Restyle only — never invent a new bottom nav.',
    imageCLine,
    '',
    'STRUCTURE AUTHORITY: Image A + PAGE REGIONS + architecture contract.',
    'STYLE AUTHORITY: VISUAL SYSTEM + CREATIVE DIRECTION + territory + Image C (when present).',
    '',
    'USE SCREENSHOT FOR: structure, hierarchy, zones, bottom nav/panel continuity, navigation placement, page validity.',
    'DO NOT USE SCREENSHOT FOR: literal screenshot recreation, inventing new bottom tabs, cloning every pixel, postage-stamp crop mimicry.',
    input.referenceImageRoleSummary ? `ATTACHED SUMMARY: ${input.referenceImageRoleSummary}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildRoleHeader(arch: PageConceptPageArchitectureBrief, viewport: { width: number; height: number }): string {
  const id = arch.pageIdentity;
  return [
    'ROLE:',
    'Design ONE real mobile website page concept (full viewport screen in a digital product).',
    '',
    `PAGE: ${id.siteContext} > ${id.moduleContext.replace(' > ', ' > ')} > ${id.project} > ${id.page}`,
    `ROUTE: ${id.route}`,
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

  const territorySpec = resolveGpt2MobileConceptTerritorySpec(input.slot);
  const territoryDelta = gpt2MobileConceptTerritoryDelta(input.slot);

  const baseSections = [
    buildRoleHeader(arch, input.mobileViewport),
    '',
    buildGpt2MobileAuthorityHierarchyBlock(),
    '',
    buildGpt2MobileFunctionalInvariantsBlock(),
    '',
    buildImageRoleDefinitions(input),
    '',
    buildGpt2MobileBottomNavInheritanceBlock(input.bottomContinuityApplied),
    '',
    buildGpt2MobileUppercaseTypographyBlock(),
    '',
    buildGpt2MobileLightFamilyBlock(),
    '',
    buildGpt2MobileDistinctnessBlock(),
    '',
    'PAGE ARCHITECTURE / LAYOUT AUTHORITY:',
    'Full mobile website page — SITE 00 host shell, project route context, NDXBOOK Overview identity, hero/overview read, status/orientation block, entry index navigation, evidence/content field, current work / deeper access, bottom continuity shell region.',
    '',
    'PAGE REGIONS:',
    compactPageRegions(arch),
    '',
    'NAVIGATION / CONTINUITY:',
    compactNavigation(arch),
    input.bottomContinuityApplied ?
      'Bottom continuity: inherit exact bottom nav/panel system from Image A — Image B is pixel anchor for lower shell.'
    : 'Bottom continuity: inherit bottom nav structure from Image A capture — do not redesign tabs.',
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
    'DO: one coherent portrait mobile product page; ALL UPPERCASE UI text; light-dominant field per territory; interactable regions; architecture from Image A + contracts; distinct territory vs A/B/C siblings.',
    'DO NOT: poster, moodboard, three black inverse pages, invented bottom nav, sentence-case text, design-only-from-support-images, superficial shuffle variants.',
    '',
    'AVOID:',
    compactAvoidList(input.cgptBrief, input.injection, input.skinContract),
    '',
    'OUTPUT FORMAT:',
    'One full portrait mobile viewport page concept (9:16) — design fills the frame edge-to-edge with readable hierarchy; no tiny concept floating in whitespace; no postage-stamp render.',
  ];

  return { basePrompt: baseSections.join('\n'), territoryDelta };
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
  let prompt = `${basePrompt}\n\nCONCEPT TERRITORY (VARIES A/B/C — ARCHITECTURE SHARED):\n${territoryDelta}`;
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

  const arch = input.pageArchitectureBrief!;
  const territorySpec = resolveGpt2MobileConceptTerritorySpec(input.slot);
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
