/**
 * P0.CGO.1 — Generic execution detector.
 */

import type { CampaignShotFamily } from './types.js';

const GENERIC_PATTERNS: Array<{ pattern: RegExp; code: string }> = [
  { pattern: /centered product|product in center|hero product every/i, code: 'PRODUCT_CENTERED_EVERY_FRAME' },
  { pattern: /posing at|model pose|static pose|editorial pose/i, code: 'MODEL_POSING_WITHOUT_BEHAVIOR' },
  { pattern: /backdrop only|background only|generic location/i, code: 'ENVIRONMENT_BACKDROP_ONLY' },
  { pattern: /no motif|without motif|motif absent/i, code: 'MOTIFS_ABSENT' },
  { pattern: /generic editorial|fashion editorial default/i, code: 'GENERIC_EDITORIAL_POSES' },
  { pattern: /studio polish|over.staged|too polished/i, code: 'STUDIO_STERILITY' },
  { pattern: /explains the|caption explains|copy explains/i, code: 'COPY_OVEREXPLAINING' },
  { pattern: /styling disconnected|unrelated styling/i, code: 'STYLING_DISCONNECTED' },
];

export function detectGenericExecution(description: string, shotRole: CampaignShotFamily): string[] {
  const issues: string[] = [];
  for (const { pattern, code } of GENERIC_PATTERNS) {
    if (pattern.test(description)) issues.push(code);
  }
  if (shotRole === 'CLUE' && /full product reveal|product hero/i.test(description)) {
    issues.push('PRODUCT_CENTERED_EVERY_FRAME');
  }
  if (issues.length === 0 && /beautiful woman|pretty model|luxury shoot/i.test(description)) {
    issues.push('GENERIC_EDITORIAL_POSES');
  }
  return [...new Set(issues)];
}
