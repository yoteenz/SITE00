/**
 * C1.2 — Entry 003 format intelligence (no asset generation).
 */

import type { Entry003FormatImplications } from '../../../../shared/site00-expression-engine/entry-003/types.js';
import type { CreativeTerritoryCandidate } from '../../../../shared/site00-expression-engine/creative-director/types.js';

export function deriveEntry003FormatImplications(
  winner: CreativeTerritoryCandidate,
  thesis: string,
): Entry003FormatImplications {
  return {
    reel: `Primary — ${winner.narrativeMechanism}; counter/receipt escalation native to ${winner.world}`,
    carousel: `SKU/step receipt cards from ${winner.artifact}; each card one claim-to-receipt pair`,
    story: `Poll frames: "${thesis.slice(0, 40)}…" vs receipt snapshot — audience complicity beat`,
    xTwitter: `Interjection line + single receipt frame — quotable contradiction hook`,
    tiktok: `GRWM-clock parallel only if duration receipt is verified — otherwise defer`,
  };
}
