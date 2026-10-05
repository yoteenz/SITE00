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
  // P0.CGO.2 additions
  { pattern: /jewelry store|dressing room|vanity only|salon mirror/i, code: 'LITERAL_CATEGORY_WORLD_ONLY' },
  { pattern: /hold.*toward camera|present.*product|product presentation/i, code: 'PRODUCT_PRESENTATION_POSE' },
  { pattern: /mannequin|wear product only|exists to wear/i, code: 'MODEL_AS_MANNEQUIN' },
  { pattern: /twelve shots|many shots|shot bloat|unnecessary shots/i, code: 'UNNECESSARY_SHOT_BLOAT' },
  { pattern: /too many props|prop bloat|busy frame props/i, code: 'UNNECESSARY_PROP_BLOAT' },
  { pattern: /luxury studio|white studio|generic beauty lighting/i, code: 'GENERIC_LUXURY_STUDIO' },
  { pattern: /product centered|hero centered|product forward/i, code: 'GENERIC_PRODUCT_CENTERING' },
  { pattern: /no interaction|never intersect|world with no product/i, code: 'WORLD_WITH_NO_PRODUCT_INTERACTION' },
  { pattern: /timeless luxury|luxury that moves|elevate your look/i, code: 'COPY_NOT_NATIVE_TO_WORLD' },
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
