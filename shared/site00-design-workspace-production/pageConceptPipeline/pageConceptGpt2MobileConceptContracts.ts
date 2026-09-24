/**
 * P0.VR.GPT2-MOBILE-CONCEPT-DISTINCTION-AND-FUNCTIONAL-CONTINUITY-FIX1
 * Concept quality contracts: distinct territories, light family, uppercase, bottom nav inheritance.
 */

import type { PageMobileConceptSlotId } from './pageConceptViewportAuthorityFamily.js';

export const GPT2_MOBILE_CONCEPT_QUALITY_CONTRACT_VERSION = 'gpt2-mobile-concept-quality-v1';

export type Gpt2MobileConceptThemeClass = 'LIGHT' | 'LIGHT_HYBRID' | 'DARK_HYBRID';

export type Gpt2MobileConceptTerritorySpec = {
  slot: PageMobileConceptSlotId;
  territoryKey: string;
  territoryLabel: string;
  themeClass: Gpt2MobileConceptThemeClass;
  territoryPromptBlock: string;
};

const TERRITORY_A: Omit<Gpt2MobileConceptTerritorySpec, 'slot'> = {
  territoryKey: 'ARCHIVAL_PAPER_INDEX',
  territoryLabel: 'A — ARCHIVAL PAPER INDEX',
  themeClass: 'LIGHT',
  territoryPromptBlock: [
    'TERRITORY A — ARCHIVAL PAPER INDEX (LIGHT-DOMINANT — REQUIRED).',
    'Light archival-paper page ground; evidence-first editorial blocks; structured index/register rhythm.',
    'Black + lime structure on bright field — NOT a full black inverse page.',
    'Distinct vs B/C: paper/document plates, dense index pacing, archival plate treatment.',
  ].join(' '),
};

const TERRITORY_B: Omit<Gpt2MobileConceptTerritorySpec, 'slot'> = {
  territoryKey: 'WHITE_EDITORIAL_PRODUCT',
  territoryLabel: 'B — WHITE EDITORIAL PRODUCT PAGE',
  themeClass: 'LIGHT',
  territoryPromptBlock: [
    'TERRITORY B — WHITE EDITORIAL PRODUCT PAGE (LIGHT-DOMINANT — REQUIRED).',
    'Crisp white / bright editorial system; sharper UI segmentation; refined panel stack.',
    'Clear modules: overview, entries, evidence, CTA — product-system clarity.',
    'Distinct vs A/C: cleaner interface-forward segmentation, not dossier paper stacks.',
  ].join(' '),
};

const TERRITORY_C: Omit<Gpt2MobileConceptTerritorySpec, 'slot'> = {
  territoryKey: 'ARCHITECTURAL_LIGHT_SYSTEM',
  territoryLabel: 'C — ARCHITECTURAL LIGHT SYSTEM',
  themeClass: 'LIGHT_HYBRID',
  territoryPromptBlock: [
    'TERRITORY C — ARCHITECTURAL LIGHT SYSTEM (LIGHT-HYBRID — REQUIRED).',
    'Off-white / pale concrete / pale industrial dominant; spatial modular framing.',
    'Darker bands allowed as sectional contrast — page must still read LIGHT-dominant overall.',
    'Distinct vs A/B: architectural spacing, structural modules, different hierarchy pacing.',
  ].join(' '),
};

export function resolveGpt2MobileConceptTerritorySpec(slot: PageMobileConceptSlotId): Gpt2MobileConceptTerritorySpec {
  if (slot === 'MOBILE_CONCEPT_A') return { slot, ...TERRITORY_A };
  if (slot === 'MOBILE_CONCEPT_B') return { slot, ...TERRITORY_B };
  return { slot, ...TERRITORY_C };
}

export function buildGpt2MobileAuthorityHierarchyBlock(): string {
  return [
    'AUTHORITY HIERARCHY (DO NOT INVERT):',
    '1) DESIGN AUTHORITY — CGPT creative synthesis + page architecture brief + navigation/bottom contracts + SITE 00 language.',
    '2) FUNCTIONAL REFERENCE ONLY — Structural Captures A/B/C: page anatomy, section order, nav placement, bottom continuity (no styling authority).',
    '3) Page context + function contract: required interactions and invariants.',
    'SCREENSHOT_DESIGN_AUTHORITY: FORBIDDEN — never treat captures as look-and-feel or visual inspiration.',
  ].join('\n');
}

export function buildGpt2MobileFunctionalInvariantsBlock(): string {
  return [
    'FUNCTIONAL INVARIANTS (MUST NOT CHANGE):',
    '- Page identity: target PROJECTS product Overview page (not Design workspace authoring UI).',
    '- Page type: mobile product screen — not poster, promo, moodboard, or single hero graphic.',
    '- Preserve core regions: host nav, breadcrumb/context, page identity, overview, status, entry index, content/evidence, current work, primary CTA, bottom nav panel.',
    '- Bottom nav: same tab count, order, roles, and functional logic as authoritative capture — restyle only.',
    '- Page function: orient, overview, navigate entries, show state/progress, deepen into project.',
  ].join('\n');
}

export function buildGpt2MobileUppercaseTypographyBlock(): string {
  return [
    'UPPERCASE TYPOGRAPHY (INVALID IF VIOLATED):',
    'ALL visible UI text MUST be uppercase: titles, body, labels, metadata, tabs, nav, CTAs, chips, bottom nav.',
    'No sentence case. No lowercase UI copy.',
  ].join('\n');
}

export function buildGpt2MobileLightFamilyBlock(): string {
  return [
    'LIGHT-THEME FAMILY (RUN-LEVEL):',
    'Concepts A and B MUST be light-dominant. Concept C MUST be light-hybrid (light field dominant).',
    'FORBIDDEN: three full-black / inverse-dominant pages in one run.',
    'Black/lime may appear as accents — not as the primary field for all three concepts.',
  ].join('\n');
}

export function buildGpt2MobileDistinctnessBlock(): string {
  return [
    'CONCEPT DISTINCTNESS:',
    'A/B/C must differ at page-design level: composition, density, panel treatment, pacing, module emphasis.',
    'NOT acceptable: same dark layout with swapped hero image or minor shuffle.',
  ].join('\n');
}

export function buildGpt2MobileBottomNavInheritanceBlock(bottomContinuityApplied: boolean): string {
  const base = [
    'BOTTOM NAV / PANEL INHERITANCE:',
    'Derive bottom navigation structure from Structural Capture C (true page bottom).',
    'Preserve: destination count, order, functional roles, and label meaning.',
    'Uppercase bottom labels. Visual restyle allowed — inventing new tabs/footer nav is FORBIDDEN.',
  ];
  if (bottomContinuityApplied) {
    base.push('Capture C shows real bottom continuity — match functional pattern, do not redesign nav logic.');
  }
  return base.join('\n');
}

export function gpt2MobileConceptTerritoryDelta(slot: PageMobileConceptSlotId): string {
  const spec = resolveGpt2MobileConceptTerritorySpec(slot);
  return `${spec.territoryPromptBlock} Same functional page as siblings — vary design expression only. Theme class: ${spec.themeClass}.`;
}

export type Gpt2MobileConceptQualityPromptValidation = {
  ok: boolean;
  missingContracts: string[];
};

export function validateGpt2MobileConceptQualityPrompt(prompt: string): Gpt2MobileConceptQualityPromptValidation {
  const lower = prompt.toLowerCase();
  const missingContracts: string[] = [];
  if (!lower.includes('uppercase')) missingContracts.push('uppercaseTypography');
  if (!lower.includes('light-dominant') && !lower.includes('light-theme family')) {
    missingContracts.push('lightThemeFamily');
  }
  if (!lower.includes('bottom nav') && !lower.includes('bottom navigation')) {
    missingContracts.push('bottomNavInheritance');
  }
  if (!lower.includes('concept distinctness') && !lower.includes('distinctness')) {
    missingContracts.push('conceptDistinctness');
  }
  if (!lower.includes('authority hierarchy')) missingContracts.push('authorityHierarchy');
  return { ok: missingContracts.length === 0, missingContracts };
}

export function evaluateGpt2MobileConceptHandoffValidity(prompt: string): {
  ok: boolean;
  failedChecks: string[];
} {
  const failedChecks: string[] = [];
  const quality = validateGpt2MobileConceptQualityPrompt(prompt);
  if (!quality.ok) failedChecks.push(...quality.missingContracts.map((c) => `concept_contract_${c}`));
  const lower = prompt.toLowerCase();
  const hasLegacyTerritory =
    lower.includes('territory a') || lower.includes('territory b') || lower.includes('territory c');
  const hasWebTerritory = lower.includes('web expression territory');
  if (!hasLegacyTerritory && !hasWebTerritory) {
    failedChecks.push('territory_marker');
  }
  if (!lower.includes('forbidden: three full-black')) failedChecks.push('dark_collapse_guard');
  if (!lower.includes('inventing new tabs') && !lower.includes('inventing a new bottom nav')) {
    failedChecks.push('bottom_nav_invention_guard');
  }
  return { ok: failedChecks.length === 0, failedChecks };
}

export function buildGpt2MobileConceptQualityDebugLines(input: {
  pageArchitectureBriefId: string | null;
  structuralAuthoritySource: string;
  bottomContinuitySource: string;
  slot: PageMobileConceptSlotId;
  uppercaseContractApplied: boolean;
  conceptDiversityContractApplied: boolean;
  lightFamilyContractApplied: boolean;
  bottomNavInherited: boolean;
  pageValidityPass: boolean;
  posterRejectionPass: boolean;
}): string[] {
  const spec = resolveGpt2MobileConceptTerritorySpec(input.slot);
  return [
    `CONCEPT QUALITY CONTRACT: ${GPT2_MOBILE_CONCEPT_QUALITY_CONTRACT_VERSION}`,
    `PAGE ARCHITECTURE BRIEF ID: ${input.pageArchitectureBriefId ?? '—'}`,
    `STRUCTURAL AUTHORITY: ${input.structuralAuthoritySource}`,
    `BOTTOM CONTINUITY SOURCE: ${input.bottomContinuitySource}`,
    `CONCEPT TERRITORY: ${spec.territoryLabel}`,
    `THEME CLASS: ${spec.themeClass}`,
    `UPPERCASE CONTRACT: ${input.uppercaseContractApplied ? 'APPLIED' : 'MISSING'}`,
    `CONCEPT DIVERSITY CONTRACT: ${input.conceptDiversityContractApplied ? 'APPLIED' : 'MISSING'}`,
    `LIGHT FAMILY CONTRACT: ${input.lightFamilyContractApplied ? 'APPLIED' : 'MISSING'}`,
    `BOTTOM NAV INHERITED (NOT REDESIGNED): ${input.bottomNavInherited ? 'REQUIRED IN PROMPT' : 'NO'}`,
    `PAGE VALIDITY EVAL: ${input.pageValidityPass ? 'PASS' : 'FAIL'}`,
    `POSTER REJECTION: ${input.posterRejectionPass ? 'PASS' : 'WARN'}`,
  ];
}
