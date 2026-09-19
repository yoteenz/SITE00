/**
 * Sprint B4.6 follow-up — Assemble pre-storyboard visual authority pack record.
 */

import type { PreStoryboardVisualAuthorityPack } from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import { ENTRY_002_PRE_STORYBOARD_AUTHORITY_PACK_001 } from '../../../shared/site00-expression-engine/preStoryboardAuthorityIds.js';
import { ENTRY_002_REEL_TREATMENT_001 } from '../../../shared/site00-expression-engine/storyboardAuthorityIds.js';
import { buildEntry002PreStoryboardVisualAuthorities } from './entry002PreStoryboardVisualAuthorities.js';
import { buildPreStoryboardApprovalState } from './preStoryboardAuthorityGate.js';
import { applyStoredPreStoryboardJudgments } from './preStoryboardFounderJudgment.js';
import { attachPreStoryboardAuthorityRecords } from './entry002PreStoryboardAuthorityRecordBuilder.js';

export function buildEntry002PreStoryboardVisualAuthorityPack(
  authoritiesWithUrls?: ReturnType<typeof buildEntry002PreStoryboardVisualAuthorities>,
): PreStoryboardVisualAuthorityPack {
  const base = authoritiesWithUrls ?? buildEntry002PreStoryboardVisualAuthorities();
  const authorities = attachPreStoryboardAuthorityRecords(applyStoredPreStoryboardJudgments(base));
  const approvalState = buildPreStoryboardApprovalState(authorities);

  return {
    packId: ENTRY_002_PRE_STORYBOARD_AUTHORITY_PACK_001,
    entryId: 'entry-002',
    treatmentId: ENTRY_002_REEL_TREATMENT_001,
    authorities,
    approvalState,
    canonState: approvalState.allAuthoritiesLoveIt ? 'PRODUCTION_CANDIDATE' : 'NON_CANON',
  };
}
