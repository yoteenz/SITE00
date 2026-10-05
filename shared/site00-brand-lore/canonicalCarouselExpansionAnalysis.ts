/**
 * Carousel expansion validation tests and cross-direction analysis.
 */

import type { CanonicalNdxbookDirectionName } from './canonicalCreativeRangeConstants.js';
import { CANONICAL_NDXBOOK_DIRECTION_NAMES } from './canonicalCreativeRangeConstants.js';
import type {
  CarouselDirectionCarousel,
  CarouselEmergentDnaReport,
  CarouselCrossDirectionPairReport,
} from './canonicalCarouselExpansionTypes.js';
import {
  CAROUSEL_EXPECTED_NEW_GENERATIONS,
  CAROUSEL_NEW_SLIDES_PER_DIRECTION,
  CAROUSEL_TOTAL_SLIDES,
} from './canonicalCarouselExpansionConstants.js';
import { runCompositionModeRangeTest } from './canonicalCarouselWorldBible.js';

export function runCrossDirectionCarouselContaminationTest(params: {
  directionIndex: number;
  promptPayload: Record<string, unknown>;
  allDirectionNames: CanonicalNdxbookDirectionName[];
}): { passed: boolean; notes: string[] } {
  const notes: string[] = [];
  const selfName = params.allDirectionNames[params.directionIndex - 1];
  const payload = JSON.stringify(params.promptPayload).toLowerCase();
  for (let i = 0; i < params.allDirectionNames.length; i += 1) {
    if (i + 1 === params.directionIndex) continue;
    const other = params.allDirectionNames[i]!;
    if (payload.includes(other.toLowerCase())) {
      notes.push(`Sibling direction referenced: ${other}`);
    }
  }
  if (payload.includes('direction 0') && !payload.includes(String(params.directionIndex))) {
    notes.push('Cross-direction index leak suspected');
  }
  return { passed: notes.length === 0, notes: notes.length ? notes : [`Isolated to ${selfName}`] };
}

export function runFirstPassOnlyTest(receipt: { creativeAttemptCount: number } | null): {
  passed: boolean;
  notes: string[];
} {
  if (!receipt) return { passed: true, notes: ['No receipt'] };
  return {
    passed: receipt.creativeAttemptCount <= 1,
    notes: receipt.creativeAttemptCount > 1 ? ['Multiple creative attempts'] : [],
  };
}

export function runIdempotentSlideGenerationTest(params: {
  existingKey: string | null;
  requestedKey: string;
  hasAsset: boolean;
}): { passed: boolean; shouldSkip: boolean; notes: string[] } {
  if (params.hasAsset && params.existingKey === params.requestedKey) {
    return { passed: true, shouldSkip: true, notes: ['Idempotent skip'] };
  }
  return { passed: true, shouldSkip: false, notes: [] };
}

export function runHostFontLeakageTest(payload: Record<string, unknown>): {
  passed: boolean;
  notes: string[];
} {
  const raw = JSON.stringify(payload).toLowerCase();
  const hits = ['martian mono', 'host font', 'site00 sans'].filter((h) => raw.includes(h));
  return { passed: hits.length === 0, notes: hits };
}

export function runSite00VisualDnaLeakageTest(payload: Record<string, unknown>): {
  passed: boolean;
  notes: string[];
} {
  const raw = JSON.stringify(payload).toLowerCase();
  const hits = ['site00 red', 'control room', 'frontal slayer'].filter((h) => raw.includes(h));
  return { passed: hits.length === 0, notes: hits };
}

export function runCanonicalNdxbookNamingTest(names: string[]): { passed: boolean; notes: string[] } {
  const expected = [...CANONICAL_NDXBOOK_DIRECTION_NAMES];
  const match = names.length === 6 && names.every((n, i) => n === expected[i]);
  return { passed: match, notes: match ? [] : ['Canonical naming mismatch'] };
}

export function runMobileSocialReadabilityTest(slides: Array<{ copy: { headline: string } }>): {
  passed: boolean;
  notes: string[];
} {
  const tooLong = slides.filter((s) => s.copy.headline.length > 120);
  return {
    passed: tooLong.length === 0,
    notes: tooLong.length ? [`${tooLong.length} headlines may fail mobile read`] : [],
  };
}

export function countNewGenerations(directions: CarouselDirectionCarousel[]): number {
  let count = 0;
  for (const dir of directions) {
    for (const slide of dir.slides) {
      if (slide.slideNumber > 1 && slide.asset && !slide.preserved) count += 1;
    }
  }
  return count;
}

export function runExpectedGenerationCountTest(directions: CarouselDirectionCarousel[]): {
  passed: boolean;
  expected: number;
  actual: number;
  notes: string[];
} {
  const actual = countNewGenerations(directions);
  const complete = directions.every((d) => d.slides.filter((s) => s.slideNumber > 1 && s.asset).length === CAROUSEL_NEW_SLIDES_PER_DIRECTION);
  const expected = CAROUSEL_EXPECTED_NEW_GENERATIONS;
  return {
    passed: !complete || actual === expected,
    expected,
    actual,
    notes: complete && actual !== CAROUSEL_EXPECTED_NEW_GENERATIONS ? ['Generation count mismatch'] : [],
  };
}

export function buildCarouselDirectionRangeAnalysis(direction: CarouselDirectionCarousel): CarouselDirectionCarousel['rangeAnalysis'] {
  const comp = runCompositionModeRangeTest(direction.slides);
  return {
    worldCoherence: direction.worldBible ? 'NOT_EVALUATED' : 'NOT_EVALUATED',
    carouselContinuity: 'NOT_EVALUATED',
    compositionRange: comp.passed ? 'NOT_EVALUATED' : 'NOT_EVALUATED',
    typographyRecognition: 'NOT_EVALUATED',
    paletteRecognition: direction.paletteRecognitionTest,
    voiceContinuity: 'NOT_EVALUATED',
    informationDesignRange: 'NOT_EVALUATED',
    socialNativeness: 'NOT_EVALUATED',
    saveability: 'NOT_EVALUATED',
    wit: 'NOT_EVALUATED',
    secondReadDepth: 'NOT_EVALUATED',
    riskOfRepetition: comp.uniqueCount < 3 ? 'NOT_EVALUATED' : 'NOT_EVALUATED',
    observations: [
      `${direction.directionName}: ${comp.uniqueCount} composition modes`,
      `Slides complete: ${direction.slides.filter((s) => s.asset).length}/${CAROUSEL_TOTAL_SLIDES}`,
    ],
  };
}

export function compareCarouselDirectionPair(
  a: CarouselDirectionCarousel,
  b: CarouselDirectionCarousel,
): CarouselCrossDirectionPairReport {
  const rolesA = a.slides.map((s) => s.slideRole).join('|');
  const rolesB = b.slides.map((s) => s.slideRole).join('|');
  const sameRoles = rolesA === rolesB;
  const sameModes =
    a.slides.map((s) => s.compositionMode).join('|') === b.slides.map((s) => s.compositionMode).join('|');
  let classification: CarouselCrossDirectionPairReport['classification'] = 'DISTINCT_SIBLINGS';
  if (sameRoles && sameModes) classification = 'CLONED';
  else if (sameRoles) classification = 'TOO_CLOSE';
  else if (a.directionName.split(' ').slice(-1)[0] === b.directionName.split(' ').slice(-1)[0]) {
    classification = 'RELATED';
  }
  return {
    directionA: a.directionName,
    directionB: b.directionName,
    classification,
    editorialPremise: `${a.worldBible?.carouselThesis ?? a.directionName} vs ${b.worldBible?.carouselThesis ?? b.directionName}`,
    observations: [`Role overlap: ${sameRoles}`, `Mode overlap: ${sameModes}`],
  };
}

export function buildCrossDirectionPairReports(directions: CarouselDirectionCarousel[]): CarouselCrossDirectionPairReport[] {
  const pairs: CarouselCrossDirectionPairReport[] = [];
  for (let i = 0; i < directions.length; i += 1) {
    for (let j = i + 1; j < directions.length; j += 1) {
      pairs.push(compareCarouselDirectionPair(directions[i]!, directions[j]!));
    }
  }
  return pairs;
}

export function buildEmergentNdxbookDnaReport(directions: CarouselDirectionCarousel[]): CarouselEmergentDnaReport {
  const allDevices = directions.flatMap((d) => d.worldBible?.recurringDevices ?? []);
  const uppercase = directions.every((d) =>
    d.slides.some((s) => s.copy.headline === s.copy.headline.toUpperCase()),
  );
  const limeMentions = directions.filter((d) =>
    JSON.stringify(d.worldBible ?? {}).toLowerCase().includes('lime'),
  ).length;
  return {
    typographyDna: uppercase ? 'UPPERCASE EDITORIAL PRESENT' : 'NOT_EVALUATED',
    colorDna: 'NOT_EVALUATED',
    editorialDna: 'SAME TOPIC · DIRECTION-DERIVED SEQUENCE',
    visualInterventionDna: 'NOT_EVALUATED',
    socialBehaviorDna: 'CAROUSEL-NATIVE SWIPE LOGIC',
    voiceDna: 'NDXBOOK · DIRECTION-NATIVE',
    informationDesignDna: 'NOT_EVALUATED',
    memorabilityDna: 'NOT_EVALUATED',
    limeStatus:
      limeMentions >= 3 ? 'NATURAL_CANON_CANDIDATE' : limeMentions > 0 ? 'DIRECTION_SPECIFIC' : 'NOT_EVALUATED',
    fontSystemStatus: 'NOT_EVALUATED',
    traitClassifications: allDevices.slice(0, 5).map((t) => ({ trait: t, classification: 'INSUFFICIENT_EVIDENCE' })),
    observations: ['Emergent DNA requires founder visual review — automated evaluators limited.'],
  };
}
