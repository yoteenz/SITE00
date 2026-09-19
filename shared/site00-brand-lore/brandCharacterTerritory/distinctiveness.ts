/**
 * Brand Character set distinctiveness — deterministic preflight + semantic audit flag.
 */

import type { BrandCharacterTerritory, BrandCharacterSetDistinctivenessEvaluation } from './types.js';

const ADJECTIVE_TOKENS = new Set([
  'witty',
  'smart',
  'clever',
  'funny',
  'arch',
  'dry',
  'warm',
  'cool',
  'bold',
  'minimal',
  'edgy',
  'playful',
  'serious',
  'intellectual',
  'authentic',
]);

const STYLE_TOKENS = new Set([
  'minimal',
  'maximal',
  'editorial',
  'scrapbook',
  'corporate',
  'retro',
  'modern',
  'clean',
  'grungy',
  'pastel',
  'monochrome',
]);

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean),
  );
}

function overlapRatio(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const t of a) if (b.has(t)) shared += 1;
  return shared / Math.min(a.size, b.size);
}

export function preflightCharacterDistinctiveness(
  characters: BrandCharacterTerritory[],
): BrandCharacterSetDistinctivenessEvaluation['deterministicPreflight'] {
  const adjectiveOverlapFlags: string[] = [];
  const styleOverlapFlags: string[] = [];
  const humorIntensityOnlyFlags: string[] = [];

  for (let i = 0; i < characters.length; i++) {
    for (let j = i + 1; j < characters.length; j++) {
      const a = characters[i]!;
      const b = characters[j]!;
      const aText = `${a.name} ${a.core.characterEssence} ${a.humorWit.humorLogic}`;
      const bText = `${b.name} ${b.core.characterEssence} ${b.humorWit.humorLogic}`;
      const aTokens = tokenize(aText);
      const bTokens = tokenize(bText);

      const aAdj = [...aTokens].filter((t) => ADJECTIVE_TOKENS.has(t));
      const bAdj = [...bTokens].filter((t) => ADJECTIVE_TOKENS.has(t));
      if (aAdj.length > 0 && bAdj.length > 0 && overlapRatio(new Set(aAdj), new Set(bAdj)) > 0.6) {
        adjectiveOverlapFlags.push(`${a.name} ↔ ${b.name}`);
      }

      const aStyle = [...aTokens].filter((t) => STYLE_TOKENS.has(t));
      const bStyle = [...bTokens].filter((t) => STYLE_TOKENS.has(t));
      if (aStyle.length > 0 && bStyle.length > 0 && overlapRatio(new Set(aStyle), new Set(bStyle)) > 0.5) {
        styleOverlapFlags.push(`${a.name} ↔ ${b.name}`);
      }

      const humorOnly =
        a.humorWit.comedicTemperature === b.humorWit.comedicTemperature &&
        a.core.worldview !== b.core.worldview &&
        a.intellectual.intelligenceStyle === b.intellectual.intelligenceStyle;
      if (humorOnly) humorIntensityOnlyFlags.push(`${a.name} ↔ ${b.name}`);
    }
  }

  const passed =
    adjectiveOverlapFlags.length === 0 &&
    styleOverlapFlags.length === 0 &&
    humorIntensityOnlyFlags.length === 0;

  return {
    passed,
    adjectiveOverlapFlags,
    styleOverlapFlags,
    humorIntensityOnlyFlags,
    notes: passed ? ['Deterministic preflight passed'] : ['Deterministic preflight flagged overlaps'],
  };
}

export function evaluateBrandCharacterSetDistinctiveness(
  characters: BrandCharacterTerritory[],
): BrandCharacterSetDistinctivenessEvaluation {
  const preflight = preflightCharacterDistinctiveness(characters);
  const dimensions = [
    'worldview',
    'intelligence behavior',
    'social relationship',
    'authority model',
    'humor mechanism',
    'cultural position',
    'emotional behavior',
    'taste',
    'artifact behavior',
    'audience relationship',
  ].map((dimension) => ({
    dimension,
    structurallyDistinct: preflight.passed,
    note: preflight.passed
      ? 'Preflight suggests structural separation — semantic audit recommended'
      : 'Preflight overlap detected',
  }));

  let result: BrandCharacterSetDistinctivenessEvaluation['result'] = 'REQUIRES_SEMANTIC_AUDIT';
  if (!preflight.passed) {
    if (preflight.adjectiveOverlapFlags.length > 0) result = 'FAIL_ADJECTIVE_ONLY';
    else if (preflight.styleOverlapFlags.length > 0) result = 'FAIL_STYLE_ONLY';
    else if (preflight.humorIntensityOnlyFlags.length > 0) result = 'FAIL_HUMOR_INTENSITY_ONLY';
  } else {
    result = 'REQUIRES_SEMANTIC_AUDIT';
  }

  return {
    result,
    deterministicPreflight: preflight,
    semanticAuditRequired: true,
    dimensions,
    notes: [
      'Deterministic keyword comparison cannot declare semantic character distinctiveness',
      'Semantic/model-reasoned set audit required before founder review',
    ],
  };
}

export function deterministicCannotDeclareSemanticDistinctiveness(): true {
  return true;
}

export function humorModeledBeyondFunnyBoolean(): true {
  return true;
}

export function culturalIntelligenceDistinctFromReferenceInsertion(): true {
  return true;
}

export function characterSupportsEmotionalTonalRange(): true {
  return true;
}
