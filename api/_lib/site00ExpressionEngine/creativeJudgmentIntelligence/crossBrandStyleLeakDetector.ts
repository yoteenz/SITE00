/**
 * CrossBrandStyleLeakDetector — NDX leak into non-NDX brands.
 */

import type {
  CrossBrandLeakResult,
  CreativeJudgmentInput,
} from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/types.js';

const NDX_LEAK_PATTERNS = [
  'cultural receipt',
  'competence theater',
  'the industry sells',
  'you skipped the camera',
  'editorial indictment',
  'classified labor',
  'front-stage',
  'back-stage',
  'door guide',
  'archivist',
];

export function detectCrossBrandStyleLeak(input: CreativeJudgmentInput): CrossBrandLeakResult {
  if (input.brandId === 'ndxbook') {
    return { leaked: false, leakTypes: [], failureClass: null, evidence: [] };
  }

  const samples = [
    input.territory.oneSentenceIdea,
    input.territory.argument,
    input.interjection ?? '',
    ...(input.copySamples ?? []),
  ]
    .join(' ')
    .toLowerCase();

  const evidence: string[] = [];
  const leakTypes: string[] = [];

  for (const pattern of NDX_LEAK_PATTERNS) {
    const idx = samples.indexOf(pattern);
    if (idx >= 0) {
      const context = samples.slice(Math.max(0, idx - 24), idx + pattern.length + 24);
      if (/(not |no |fails|fail|avoid|without|reject|anti-|never )/.test(context)) continue;
      evidence.push(pattern);
      if (pattern.includes('editorial') || pattern.includes('cultural')) leakTypes.push('NDXBOOK CULTURAL EDITORIAL GRAMMAR');
      else if (pattern.includes('door') || pattern.includes('stage')) leakTypes.push('NDXBOOK VISUAL BEHAVIOR');
      else leakTypes.push('NDXBOOK ARGUMENT STYLE');
    }
  }

  const leaked = evidence.length > 0 || (input.priorBrandId === 'ndxbook' && samples.includes('skipped'));
  return {
    leaked,
    leakTypes: [...new Set(leakTypes)],
    failureClass: leaked ? 'NDX_LEAK' : null,
    evidence,
  };
}
