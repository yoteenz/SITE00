/** READY_FOR_FENCE_ENABLEMENT evaluation */

import { getOwnerConfigurationChecklist } from './ownerConfigService.js';
import { listSafeConnections } from './connectionService.js';
import { isAccountConfirmed } from './accountConfirmation.js';
import {
  evaluateBrandReadiness,
  evaluateContentBrainReadiness,
  getNdxbookMarketingState,
} from './ndxbookService.js';
import { getLatestAssessment } from '../storeAdapter.js';
import { orgIdFromSlug } from '../orgRegistry.js';

export async function evaluateFenceEnablementReadiness(orgSlug: string) {
  const config = getOwnerConfigurationChecklist();
  const state = await getNdxbookMarketingState();
  const connections = await listSafeConnections(orgSlug);
  const social = connections.find((c) => c.providerCategory === 'SOCIAL');
  const brand = await evaluateBrandReadiness(orgSlug);
  const cb = await evaluateContentBrainReadiness(orgSlug);
  const assessment = await getLatestAssessment(orgIdFromSlug(orgSlug)!);

  const accountConfirmed = social
    ? isAccountConfirmed({
        account_confirmed_at: social.accountConfirmedAt,
        metadata: {},
      })
    : false;

  const checks = {
    configComplete: config.allConfigured,
    assessmentComplete: Boolean(assessment),
    profileExists: Boolean(state.profile),
    objectivesExist: state.objectives.length > 0,
    channelsExist: state.channels.length > 0,
    manifestExists: Boolean(state.assessment),
    contentBrainSufficient: cb.sufficient,
    brandAcceptable: brand.overall === 'READY' || brand.overall === 'PARTIAL',
    connectionVerified: social?.status === 'CONNECTED' || social?.health === 'HEALTHY',
    accountConfirmed,
    publishingCapability: social?.capabilityMap?.PUBLISH_CONTENT === 'AVAILABLE' || social?.publishingCapability === 'AVAILABLE',
  };

  const allPass = Object.values(checks).every(Boolean);
  return {
    readiness: allPass ? 'READY_FOR_FENCE_ENABLEMENT' : 'PARTIAL',
    checks,
    fenceEnablementNote: allPass
      ? 'READY TO ENABLE IN NEXT SPRINT — owner authorization required'
      : 'Complete remaining prerequisites before fence enablement',
  };
}
