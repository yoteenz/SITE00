/**
 * Direction DNA Envelope — per-direction creative intelligence compiled independently.
 */

import type { FormedCoreDirection } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/types.js';
import type { DirectionNativeFormatSelection } from './directionNativeFormatSelection.js';
import type { CanonicalNdxbookDirectionName } from './canonicalCreativeRangeConstants.js';
import type { DirectionDnaEnvelope } from './canonicalCreativeRangeTypes.js';

function firstNonEmpty(...values: Array<string | undefined | null>): string {
  for (const value of values) {
    if (value != null && value.trim().length > 0) return value;
  }
  return '';
}

export function compileDirectionDnaEnvelope(params: {
  direction: FormedCoreDirection;
  canonicalName: CanonicalNdxbookDirectionName;
  comparisonIndex: number;
  formatSelection: DirectionNativeFormatSelection;
  personalityLineage?: string[];
  formatLineage?: string[];
}): DirectionDnaEnvelope {
  const d = params.direction;
  const palette = firstNonEmpty(d.coreColorLogic, d.colorLogic);
  const typographicAttitude = firstNonEmpty(d.typographicAttitude);

  return {
    directionId: d.directionId,
    canonicalName: params.canonicalName,
    comparisonIndex: params.comparisonIndex,
    centralThesis: d.oneLineThesis ?? d.bigIdea ?? '',
    creativePremise: d.bigIdea ?? d.oneLineThesis ?? '',
    personalityTranslation: d.governingBehavior ?? d.brandConnection ?? '',
    emotionalTerritory: d.emotionalPromise ?? '',
    socialBehavior: d.socialExpressionHypothesis ?? '',
    contentBehavior: d.primaryBrandArtifact ?? d.governingBehavior ?? '',
    visualWorld: d.visualMetaphor ?? d.materialImageryLanguage ?? '',
    visualGrammar: d.materialImageryLanguage ?? d.imageryLanguage ?? '',
    compositionLogic: d.governingBehavior ?? '',
    typographicAttitude,
    typographyRoleBehavior: typographicAttitude,
    typographySelectionSource: 'CANONICAL_CORE_DIRECTION',
    typographySelectionReason: typographicAttitude
      ? `Derived from ${params.canonicalName} typographicAttitude in formation record.`
      : 'Missing typographicAttitude on canonical direction record.',
    typographyDerivedFromDirection: Boolean(typographicAttitude),
    hostTypographyExcluded: true,
    palette,
    dominantColor: palette.split(/[,;/]/)[0]?.trim() ?? '',
    supportingColors: palette,
    accentColors: d.signatureDevices?.join(', ') ?? '',
    colorHierarchy: palette,
    colorBehavior: d.coreColorLogic ?? d.colorLogic ?? '',
    paletteSource: 'CANONICAL_CORE_DIRECTION',
    paletteReason: palette
      ? `Derived from ${params.canonicalName} coreColorLogic/colorLogic — no sibling or benchmark injection.`
      : 'Missing color logic on canonical direction record.',
    paletteDerivedFromDirection: Boolean(palette),
    materialLanguage: d.materialImageryLanguage ?? '',
    imageLanguage: d.imageryLanguage ?? d.materialImageryLanguage ?? '',
    annotationLanguage: d.signatureDevices?.join('; ') ?? '',
    motionLanguage: d.motionSeed ?? '',
    nativeFormat: params.formatSelection.nativeFormat,
    nativeFormatBehavior: params.formatSelection.nativeFormatReason,
    signatureDevices: d.signatureDevices ?? [],
    antiPatterns: d.antiDirection ?? [],
    mustNotResemble: d.antiDirection ?? [],
    personalityLineage: params.personalityLineage ?? (d.loreLineage ?? []),
    formatLineage: params.formatLineage ?? [],
    directionLineage: d.loreLineage ?? [],
  };
}

function tokenSet(text: string): Set<string> {
  const out = new Set<string>();
  for (const token of text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(/\s+/)) {
    if (token.length > 2) out.add(token);
  }
  return out;
}

function overlapRatio(a: string, b: string): number {
  const setA = tokenSet(a);
  const setB = tokenSet(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let shared = 0;
  for (const t of setA) if (setB.has(t)) shared += 1;
  return shared / Math.max(setA.size, setB.size);
}

export function compareDnaEnvelopes(
  a: DirectionDnaEnvelope,
  b: DirectionDnaEnvelope,
): import('./canonicalCreativeRangeTypes.js').ConceptualDistinctivenessPairReport {
  const blobA = [
    a.centralThesis,
    a.creativePremise,
    a.visualWorld,
    a.compositionLogic,
    a.socialBehavior,
    a.typographicAttitude,
    a.palette,
    a.signatureDevices.join(' '),
  ].join(' ');
  const blobB = [
    b.centralThesis,
    b.creativePremise,
    b.visualWorld,
    b.compositionLogic,
    b.socialBehavior,
    b.typographicAttitude,
    b.palette,
    b.signatureDevices.join(' '),
  ].join(' ');
  const overlap = overlapRatio(blobA, blobB);
  const nameMatch = a.canonicalName === b.canonicalName;
  const collapseSuspected = nameMatch;
  return {
    directionA: a.canonicalName,
    directionB: b.canonicalName,
    conceptualOverlap: Math.round(overlap * 100) / 100,
    legitimateSharedBrandDna: 'Shared NDXBOOK editorial personality and social-first context expected.',
    directionSpecificDifference: `${a.canonicalName}: ${a.centralThesis.slice(0, 80)} vs ${b.canonicalName}: ${b.centralThesis.slice(0, 80)}`,
    collapseSuspected,
    reason: collapseSuspected
      ? 'Same canonical name — implementation error.'
      : overlap >= 0.55
        ? `Observed overlap ${Math.round(overlap * 100)}% — cousin directions may share brand DNA; not a roster failure.`
        : 'Distinct canonical direction records.',
  };
}

export function runCrossDirectionGenerationContaminationTest(params: {
  promptPayload: Record<string, unknown>;
  siblingKeys?: string[];
}): import('./canonicalCreativeRangeTypes.js').CrossDirectionGenerationContaminationTest {
  const siblingKeys = params.siblingKeys ?? [
    'priorDirectionHeroImage',
    'priorDirectionHeroPrompt',
    'otherDirectionHeroImages',
    'siblingHeroBrief',
    'siblingVisualBrief',
    'benchmarkHeroImage',
  ];
  const notes: string[] = [];
  let siblingHeroReferenced = false;
  let siblingPromptReferenced = false;
  for (const key of siblingKeys) {
    if (key in params.promptPayload && params.promptPayload[key] != null) {
      notes.push(`Forbidden sibling context key present: ${key}`);
      if (key.toLowerCase().includes('hero')) siblingHeroReferenced = true;
      if (key.toLowerCase().includes('prompt') || key.toLowerCase().includes('brief')) {
        siblingPromptReferenced = true;
      }
    }
  }
  const passed = notes.length === 0;
  if (passed) notes.push('No sibling hero or prompt context detected in generation payload.');
  return { passed, siblingHeroReferenced, siblingPromptReferenced, notes };
}
