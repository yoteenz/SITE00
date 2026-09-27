/**
 * P0.VR.NDXBOOK-BRAND-FAMILIARITY-LAYER1
 * Upstream NDX graphic intelligence brief — consumed before GPT2 mobile prompt finalization.
 */

import type { PageConceptPageArchitectureBrief } from './pageConceptPageArchitectureBrief.js';
import type { PageConceptTargetRouteContract } from './pageConceptTargetPageContext.js';
import type { ScreenshotFunctionalPageMap } from './pageConceptScreenshotFunctionalPageMap.js';
import type { WebExpressionTerritory, WebExpressionTerritorySet } from './pageConceptWebExpressionTerritories.js';
/** Keep aligned with pageConceptGpt2MobileProviderPromptCompiler MAX_PROVIDER_PROMPT_CHARS */
const MAX_PROVIDER_PROMPT_CHARS = 24000;

export const NDX_BRAND_FAMILIARITY_BRIEF_VERSION = 'ndx-brand-familiarity-brief-v1';

export type NdxBrandVisualTemperament = {
  summary: string;
  traits: readonly string[];
};

export type NdxImageBehaviorRules = {
  summary: string;
  rules: readonly string[];
};

export type NdxGraphicDeviceLibrary = {
  summary: string;
  deviceCategories: readonly string[];
  usageRule: string;
};

export type NdxTypographicBehavior = {
  summary: string;
  rules: readonly string[];
};

export type NdxCompositionalLogic = {
  summary: string;
  rules: readonly string[];
};

export type NdxBrandDistinctionRule = {
  summary: string;
  notNdx: readonly string[];
  isNdx: readonly string[];
};

export type NdxFunctionalRespectRule = {
  rules: readonly string[];
};

export type NdxBrandFamiliarityBrief = {
  briefId: string;
  version: typeof NDX_BRAND_FAMILIARITY_BRIEF_VERSION;
  projectId: string;
  pageId: string;
  targetRouteLabel: string;
  sourceFunctionMapId: string;
  sourcePageArchitectureBriefId: string;
  contentDigest: string;
  visualTemperament: NdxBrandVisualTemperament;
  imageBehavior: NdxImageBehaviorRules;
  graphicDeviceLibrary: NdxGraphicDeviceLibrary;
  typographicBehavior: NdxTypographicBehavior;
  compositionalLogic: NdxCompositionalLogic;
  brandDistinction: NdxBrandDistinctionRule;
  functionalRespect: NdxFunctionalRespectRule;
  createdAt: string;
};

const NDX_VISUAL_TEMPERAMENT_TRAITS = [
  'authored',
  'cultural',
  'evidentiary',
  'intelligent',
  'intentional',
  'archival',
  'analytical',
  'editorial',
  'designed with pressure',
  'sparse but not empty',
  'expressive but not decorative',
  'confident without corporate polish',
  'graphic without poster-only collapse',
] as const;

const NDX_IMAGE_BEHAVIOR_RULES = [
  'Imagery is evidence, artifact, witness, signal, or material — not stock filler.',
  'Treat images as found, marked, stamped, filed, pinned, cropped, scanned, indexed, annotated, or institutionally handled.',
  'Every image must change page meaning — hierarchy, tension, or categorization.',
  'Integrate assets into the system (rails, IDs, crops) — never drop decorative panels.',
] as const;

const NDX_GRAPHIC_DEVICE_CATEGORIES = [
  'evidence tags',
  'indexing numerals',
  'archival labels',
  'marginal notes',
  'ledger lines',
  'stamps / seals / filed markers',
  'proofing marks',
  'bracketed emphasis',
  'mono metadata',
  'signal dots',
  'highlighted annotations',
  'document edge treatments',
  'controlled crop frames',
  'structured rails / dividers',
  'institutional markers',
  'compositional authority anchors',
] as const;

const NDX_TYPOGRAPHY_RULES = [
  'Typography is structural — divides zones, creates pressure, establishes evidence hierarchy.',
  'Display type creates force and orientation; mono type behaves as ledger / archival notation.',
  'ALL UI copy UPPERCASE on the page concept.',
  'Hierarchy must feel composed and branded — not CMS-default stacks.',
] as const;

const NDX_COMPOSITION_RULES = [
  'Remain a functional digital product page — visible pacing across sections.',
  'Controlled asymmetry allowed; whitespace is editorial, not empty.',
  'Sections carry different graphic pressure (evidence zones, index zones, status zones).',
  'Lower page stays creatively alive — no generic footer blocks.',
] as const;

const NDX_NOT_NDX = [
  'brutalist editorial template',
  'monochrome publishing cliché',
  'generic design-system minimalism',
  'moodboard collage page',
  'poster disguised as UI',
  'clean modern SaaS dashboard',
  'stock editorial photography panels',
] as const;

const NDX_IS_NDX = [
  'annotated-minimal editorial intelligence',
  'evidence-forward image behavior',
  'graphic devices with institutional handling',
  'typographic force with archival metadata',
  'NDX color discipline (paper/black/lime/gray — lime as signal not wallpaper)',
] as const;

const GENERIC_EDITORIAL_DRIFT_PATTERNS =
  /generic editorial|modern template|clean editorial site|stock photo hero|saas dashboard|card stack ui|uniform module grid|sentence-case ui|lorem ipsum|behance layout|dribbble landing/i;

function hashPayload(payload: unknown): string {
  const s = JSON.stringify(payload);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function ndxBrandFamiliarityApplies(projectId: string): boolean {
  return projectId.toLowerCase().replace(/[^a-z0-9]/g, '') === 'ndxbook';
}

export function compileNdxBrandFamiliarityBrief(input: {
  projectId: string;
  pageId: string;
  target: PageConceptTargetRouteContract;
  pageArchitectureBrief: PageConceptPageArchitectureBrief;
  screenshotFunctionalPageMap: ScreenshotFunctionalPageMap;
}): NdxBrandFamiliarityBrief | null {
  if (!ndxBrandFamiliarityApplies(input.projectId)) return null;

  const core = {
    projectId: input.projectId,
    pageId: input.pageId,
    targetRouteLabel: input.target.targetRouteLabel,
    sourceFunctionMapId: input.screenshotFunctionalPageMap.mapId,
    sourcePageArchitectureBriefId: input.pageArchitectureBrief.briefId,
  };

  const contentDigest = hashPayload({
    version: NDX_BRAND_FAMILIARITY_BRIEF_VERSION,
    ...core,
    temperament: NDX_VISUAL_TEMPERAMENT_TRAITS,
    imageRules: NDX_IMAGE_BEHAVIOR_RULES,
  });

  const briefId = `ndxfam-${contentDigest}`;

  return {
    briefId,
    version: NDX_BRAND_FAMILIARITY_BRIEF_VERSION,
    ...core,
    contentDigest,
    visualTemperament: {
      summary:
        'NDX reads as authored cultural evidence — intelligent, archival, analytical editorial pressure without corporate sterility.',
      traits: NDX_VISUAL_TEMPERAMENT_TRAITS,
    },
    imageBehavior: {
      summary: 'Images behave as indexed evidence and material — never decorative stock.',
      rules: NDX_IMAGE_BEHAVIOR_RULES,
    },
    graphicDeviceLibrary: {
      summary: 'Selective vocabulary of NDX-native graphic moves — not copied literally every time.',
      deviceCategories: NDX_GRAPHIC_DEVICE_CATEGORIES,
      usageRule: 'Pick 2–4 devices per concept that reinforce territory attitude; integrate with function map zones.',
    },
    typographicBehavior: {
      summary: 'Type is structural uppercase authorship — display force + mono ledger metadata.',
      rules: NDX_TYPOGRAPHY_RULES,
    },
    compositionalLogic: {
      summary: 'Functional web page with deliberate pacing and zone-specific graphic pressure.',
      rules: NDX_COMPOSITION_RULES,
    },
    brandDistinction: {
      summary: 'NDX-authored editorial intelligence ≠ generic editorial web styling.',
      notNdx: NDX_NOT_NDX,
      isNdx: NDX_IS_NDX,
    },
    functionalRespect: {
      rules: [
        'Keep the function — redesign visual authorship only.',
        'Preserve real website page usability, route identity, and bottom navigation contract.',
        `Target remains ${input.target.targetRouteLabel} — never Design workspace chrome.`,
        'Do not flatten NDX into black/white/lime wallpaper — lime is signal accent only.',
      ],
    },
    createdAt: new Date().toISOString(),
  };
}

export function compileNdxBrandFamiliarityPromptBlock(brief: NdxBrandFamiliarityBrief): string {
  const devices = brief.graphicDeviceLibrary.deviceCategories.slice(0, 8).join(', ');
  return [
    'NDX BRAND FAMILIARITY (AUTHORITY — HOW NDX AUTHORS WEB PAGES; NOT SCREENSHOT STYLE):',
    `Brief ${brief.briefId} · digest ${brief.contentDigest}.`,
    `TEMPERAMENT: ${brief.visualTemperament.summary}`,
    `IMAGERY: ${brief.imageBehavior.rules.slice(0, 3).join(' ')}`,
    `GRAPHIC VOCAB (selective): ${devices}.`,
    `TYPE: ${brief.typographicBehavior.rules.slice(0, 2).join(' ')}`,
    `COMPOSITION: ${brief.compositionalLogic.rules.slice(0, 2).join(' ')}`,
    `NOT NDX: ${brief.brandDistinction.notNdx.slice(0, 4).join('; ')}.`,
    `IS NDX: ${brief.brandDistinction.isNdx.slice(0, 3).join('; ')}.`,
    `FUNCTION RESPECT: ${brief.functionalRespect.rules.slice(0, 2).join(' ')}`,
    'Blend this with SCREENSHOT FUNCTION MAP (what) + WEB EXPRESSION TERRITORY (which attitude) — never generic editorial template drift.',
  ].join('\n');
}

export function validateGenericEditorialDriftGuard(input: {
  compiledPrompt: string;
  territory: WebExpressionTerritory | null;
}): { ok: boolean; errorCode: 'GENERIC_EDITORIAL_DRIFT' | null; detail: string | null } {
  /** Provider prompts intentionally list forbidden drifts in AVOID/NOT NDX blocks — scan territory only. */
  if (input.territory) {
    const blob = [
      input.territory.compositionSystem,
      input.territory.imageArtDirection,
      input.territory.graphicLanguage,
      input.territory.typographicConcept,
    ].join(' ');
    if (GENERIC_EDITORIAL_DRIFT_PATTERNS.test(blob)) {
      return { ok: false, errorCode: 'GENERIC_EDITORIAL_DRIFT', detail: `territory-${input.territory.territorySlot}` };
    }
    const lacksEvidence =
      !/evidence|artifact|index|archival|pin|stamp|ledger|mono|annotation|crop|filed/i.test(blob) &&
      /card stack|dashboard|saas|template/i.test(blob);
    if (lacksEvidence) {
      return { ok: false, errorCode: 'GENERIC_EDITORIAL_DRIFT', detail: 'territory-lacks-ndx-evidence-language' };
    }
  }
  return { ok: true, errorCode: null, detail: null };
}

export function evaluateNdxBrandAuthenticity(input: {
  compiledPrompt: string;
  brief: NdxBrandFamiliarityBrief | null;
}): { ok: boolean; failureCode: 'NDX_AUTHENTICITY_MISSING' | null; checks: Record<string, boolean> } {
  if (!input.brief) {
    return { ok: true, failureCode: null, checks: { briefRequired: false } };
  }
  const lower = input.compiledPrompt.toLowerCase();
  const checks = {
    familiarityBlockPresent: lower.includes('ndx brand familiarity'),
    functionMapPresent: lower.includes('screenshot functional page map'),
    evidenceLanguage: /evidence|artifact|archival|indexed|institutional/i.test(input.compiledPrompt),
    notGenericEditorial: input.brief ? input.compiledPrompt.includes('NDX BRAND FAMILIARITY') : true,
    uppercaseRule: lower.includes('uppercase'),
  };
  const ok = Object.values(checks).every(Boolean);
  return { ok, failureCode: ok ? null : 'NDX_AUTHENTICITY_MISSING', checks };
}

export function validateTerritoryNdxFamiliarityDistinction(set: WebExpressionTerritorySet): {
  ok: boolean;
  errorCode: 'TERRITORY_NDX_FAMILIARITY_WEAK' | null;
  detail: string | null;
} {
  for (const t of set.territories) {
    const blob = [
      t.imageArtDirection,
      t.signatureGraphicDevice,
      t.artDirectionPremise,
      t.imageGraphicRelationship,
    ].join(' ');
    const hasImageBehavior = /evidence|artifact|crop|pin|stamp|index|filed|halftone|documentary|plate/i.test(blob);
    const hasGraphicDevice = Boolean(t.signatureGraphicDevice.trim()) && t.secondaryGraphicDevices.length >= 1;
    if (!hasImageBehavior || !hasGraphicDevice) {
      return {
        ok: false,
        errorCode: 'TERRITORY_NDX_FAMILIARITY_WEAK',
        detail: t.territorySlot,
      };
    }
  }
  return { ok: true, errorCode: null, detail: null };
}

export function ndxBrandFamiliarityPromptWithinBudget(charCount: number): boolean {
  return charCount <= MAX_PROVIDER_PROMPT_CHARS;
}

export function formatNdxBrandFamiliarityDebugLines(input: {
  brief: NdxBrandFamiliarityBrief | null;
  screenshotFunctionMapId: string | null;
  compiledPrompt: string;
  genericEditorialDrift: { ok: boolean; errorCode: string | null };
  territoryDistinction: { ok: boolean; errorCode: string | null };
  ndxAuthenticity: { ok: boolean; failureCode: string | null };
}): string[] {
  const briefIncluded =
    input.brief ?
      input.compiledPrompt.includes('NDX BRAND FAMILIARITY') ? 'YES'
      : 'NO'
    : 'N/A';
  const functionMapIncluded = input.compiledPrompt.includes('PAGE FUNCTION (SCREENSHOT FUNCTIONAL PAGE MAP') ? 'YES' : 'NO';
  return [
    `NDX_BRAND_FAMILIARITY_BRIEF_ID: ${input.brief?.briefId ?? '—'}`,
    `NDX_BRAND_FAMILIARITY_DIGEST: ${input.brief?.contentDigest ?? '—'}`,
    `SCREENSHOT_FUNCTION_MAP_ID: ${input.screenshotFunctionMapId ?? '—'}`,
    `PROMPT_INCLUDES_FAMILIARITY: ${briefIncluded}`,
    `PROMPT_INCLUDES_FUNCTION_MAP: ${functionMapIncluded}`,
    `GENERIC_EDITORIAL_DRIFT_GUARD: ${input.genericEditorialDrift.ok ? 'PASS' : input.genericEditorialDrift.errorCode ?? 'FAIL'}`,
    `TERRITORY_DISTINCTION_VALIDATOR: ${input.territoryDistinction.ok ? 'PASS' : input.territoryDistinction.errorCode ?? 'FAIL'}`,
    `NDX_AUTHENTICITY_EVAL: ${input.ndxAuthenticity.ok ? 'PASS' : input.ndxAuthenticity.failureCode ?? 'FAIL'}`,
  ];
}
