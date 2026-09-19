/**
 * C1.4 — Creative correction intelligence — principle abstraction, not surface patches.
 */

import type { CorrectionTaxonomyClass, CreativeCorrectionRecord } from '../../../shared/site00-expression-engine/senior-creative-judgment/types.js';

const PRINCIPLE_LIBRARY: Omit<CreativeCorrectionRecord, 'correctionId' | 'createdAt'>[] = [
  {
    projectId: 'studio-world',
    campaignId: 'generic',
    contentUnitId: 'generic',
    feedbackType: 'STRUCTURAL_REPAIR',
    surfaceFeedback: 'The shift receipt may be too explanatory; the environment itself might already be the receipt.',
    diagnosedUnderlyingIssue: 'Redundant explanatory artifact when world behavior already proves contradiction',
    generalizablePrinciple:
      'When world behavior already proves the contradiction, avoid adding a redundant explanatory artifact.',
    applicableDomains: ['film', 'reel', 'campaign worlds', 'editorial storytelling'],
    nonApplicableDomains: ['documentary proof packages where literal evidence is the point'],
    overfitRisk: 'LOW',
    examples: ['Employee door reveal makes shift schedule visible without schedule slip'],
    counterExamples: ['Legal receipt archive where document IS the story'],
    confidence: 0.92,
  },
  {
    projectId: 'studio-world',
    campaignId: 'generic',
    contentUnitId: 'generic',
    feedbackType: 'ORIGINALITY_PUSH',
    surfaceFeedback: 'Product count risks becoming the idea instead of cultural insight.',
    diagnosedUnderlyingIssue: 'Measurable receipt substituted for human revelation',
    generalizablePrinciple:
      'Metrics and counts are evidence — not the creative idea. Seek the human contradiction beneath the measurement.',
    applicableDomains: ['social campaigns', 'carousel', 'reel', 'editorial'],
    nonApplicableDomains: ['data journalism where the number IS the scandal'],
    overfitRisk: 'LOW',
    examples: ['SKU count vs invisible labor admission'],
    counterExamples: ['Enron ledger where numbers are the thesis'],
    confidence: 0.95,
  },
  {
    projectId: 'studio-world',
    campaignId: 'generic',
    contentUnitId: 'generic',
    feedbackType: 'CONTINUITY_CORRECTION',
    surfaceFeedback: 'Ending tease should not prematurely define the next entry subject.',
    diagnosedUnderlyingIssue: 'Closed handoff / teaser became next brief',
    generalizablePrinciple:
      'Future-unit teases should create narrative momentum without locking the next creative discovery.',
    applicableDomains: ['serialized campaigns', 'chapter arcs', 'multi-entry packages'],
    nonApplicableDomains: ['locked trilogy where next beat is canonically planned'],
    overfitRisk: 'LOW',
    examples: ['Wellness notification seed vs full Entry 004 concept lock'],
    counterExamples: ['Explicit sequel hook in locked IP bible'],
    confidence: 0.88,
  },
];

const corrections: CreativeCorrectionRecord[] = PRINCIPLE_LIBRARY.map((p, i) => ({
  ...p,
  correctionId: `corr-principle-${String(i + 1).padStart(3, '0')}`,
  createdAt: new Date().toISOString(),
}));

export function listCreativeCorrectionPrinciples(): CreativeCorrectionRecord[] {
  return [...corrections];
}

export function abstractFounderCorrection(args: {
  surfaceFeedback: string;
  taxonomy: CorrectionTaxonomyClass;
}): CreativeCorrectionRecord {
  const match = corrections.find((c) => c.diagnosedUnderlyingIssue.includes(args.taxonomy.replace(/_/g, ' ').slice(0, 12)));
  const base = match ?? corrections[0]!;
  return {
    ...base,
    correctionId: `corr-${Date.now()}`,
    surfaceFeedback: args.surfaceFeedback,
    createdAt: new Date().toISOString(),
  };
}

export function evaluateCorrectionOverfit(principle: string): { isPrinciple: boolean; isSurfaceDevice: boolean; rationale: string } {
  const surfaceDevices = [
    'always use back-of-house',
    'always use a door',
    'always remove artifacts',
    'always end on notification',
    'avoid museums',
  ];
  const lower = principle.toLowerCase();
  const isSurfaceDevice = surfaceDevices.some((d) => lower.includes(d.replace('always ', '').slice(0, 8)));
  return {
    isPrinciple: !isSurfaceDevice,
    isSurfaceDevice,
    rationale: isSurfaceDevice
      ? 'Correction reads as surface device — reject for global rule library'
      : 'Correction abstracts to methodology — safe for shared intelligence',
  };
}

export function persistCreativeCorrection(record: CreativeCorrectionRecord): void {
  corrections.push(record);
}

export function resetCreativeCorrectionStore(): void {
  corrections.length = 0;
  corrections.push(
    ...PRINCIPLE_LIBRARY.map((p, i) => ({
      ...p,
      correctionId: `corr-principle-${String(i + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    })),
  );
}
