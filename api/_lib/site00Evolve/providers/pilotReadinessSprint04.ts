/** Sprint 04 pilot control center — expanded readiness checklist */

import { orgIdFromSlug } from '../orgRegistry.js';
import { ensurePilotConfig, listSafeConnections } from './connectionService.js';
import { publishingFenceState, isGlobalPublishingEnabled } from './publishingFence.js';
import { getProviderOAuthConfig } from './oauthService.js';
import { validateSecretStoreConfiguration } from './providerSecretStore.js';
import { isAccountConfirmed } from './accountConfirmation.js';
import { getNdxbookMarketingState, evaluateBrandReadiness, evaluateContentBrainReadiness } from './ndxbookService.js';
import { getLatestAssessment, getProfileByOrgId } from '../storeAdapter.js';
import type { PilotReadinessItem } from './pilotService.js';

export type PilotReadinessState = 'READY' | 'PARTIAL' | 'BLOCKED' | 'NOT_CONNECTED' | 'NOT_STARTED' | 'DISABLED' | 'READY_FOR_FENCE_ENABLEMENT';

export async function getExpandedPilotReadiness(orgSlug: string) {
  const pilot = await ensurePilotConfig(orgSlug);
  const connections = await listSafeConnections(orgSlug);
  const social = connections.find((c) => c.providerCategory === 'SOCIAL');
  const orgId = orgIdFromSlug(orgSlug)!;
  const profile = await getProfileByOrgId(orgId);
  const assessment = await getLatestAssessment(orgId);
  const brand = await evaluateBrandReadiness(orgSlug);
  const contentBrain = await evaluateContentBrainReadiness(orgSlug);
  const oauthCfg = getProviderOAuthConfig('meta_instagram');
  const secretCfg = validateSecretStoreConfiguration();
  const globalFence = isGlobalPublishingEnabled();
  const orgFence = publishingFenceState(String(pilot.publishing_status) as 'DISABLED');

  const accountConfirmed = social ? isAccountConfirmed({ account_confirmed_at: null, metadata: {} }) : false;
  const connRow = social;
  const verified = connRow?.status === 'CONNECTED' || (connRow as { verification_status?: string })?.verification_status === 'VERIFIED';

  const items: Array<PilotReadinessItem & { readiness?: PilotReadinessState }> = [
    { key: 'org', label: 'Organization Registered', state: 'READY' },
    {
      key: 'assessment',
      label: 'Marketing Assessment',
      state: assessment ? 'READY' : profile?.marketing_maturity === 'ASSESSMENT_REQUIRED' ? 'NOT_STARTED' : 'PARTIAL',
    },
    {
      key: 'profile',
      label: 'Marketing Profile',
      state: profile && profile.marketing_maturity !== 'ASSESSMENT_REQUIRED' ? 'READY' : 'NOT_STARTED',
    },
    {
      key: 'objectives',
      label: 'Objectives Established',
      state: (await getNdxbookMarketingState()).objectives.length > 0 ? 'READY' : 'NOT_STARTED',
    },
    {
      key: 'channels',
      label: 'Channel Selected',
      state: (await getNdxbookMarketingState()).channels.some((c) => c.channel_key === 'INSTAGRAM') ? 'READY' : 'NOT_STARTED',
    },
    {
      key: 'provider_config',
      label: 'Provider Configured',
      state: oauthCfg.configured && secretCfg.configured ? 'READY' : 'BLOCKED',
      detail: oauthCfg.configured ? undefined : `REQUIRES_OWNER_CONFIGURATION: ${oauthCfg.missing.join(', ')}`,
    },
    {
      key: 'oauth',
      label: 'OAuth Authorization',
      state: social?.status === 'AUTHORIZATION_REQUIRED' ? 'NOT_CONNECTED' : social ? 'PARTIAL' : 'NOT_CONNECTED',
    },
    {
      key: 'verification',
      label: 'Connection Verified',
      state: verified ? 'READY' : social ? 'PARTIAL' : 'NOT_CONNECTED',
    },
    {
      key: 'account_confirm',
      label: 'Account Confirmation',
      state: accountConfirmed ? 'READY' : verified ? 'PARTIAL' : 'NOT_CONNECTED',
      detail: verified && !accountConfirmed ? 'ACCOUNT_CONFIRMATION_REQUIRED' : undefined,
    },
    {
      key: 'capabilities',
      label: 'Publishing Capability',
      state: social?.grantedCapabilities?.includes('PUBLISH_CONTENT') ? 'READY' : social ? 'PARTIAL' : 'NOT_CONNECTED',
    },
    {
      key: 'content_brain',
      label: 'Content Brain',
      state: contentBrain.state === 'CONTENT_BRAIN_INCOMPLETE' ? 'NOT_STARTED' : 'PARTIAL',
    },
    {
      key: 'brand',
      label: 'Brand Readiness',
      state: brand.overall === 'INSUFFICIENT' ? 'PARTIAL' : brand.overall === 'READY' ? 'READY' : 'PARTIAL',
    },
    {
      key: 'manifest',
      label: 'Marketing Manifest',
      state: 'NOT_STARTED',
    },
    {
      key: 'approval',
      label: 'Human Approval Required',
      state: pilot.human_approval_required !== false ? 'READY' : 'DISABLED',
    },
    {
      key: 'global_fence',
      label: 'Global Publishing Fence',
      state: globalFence ? 'READY' : 'DISABLED',
      detail: globalFence ? undefined : 'DISABLED — OWNER ACTION REQUIRED',
    },
    {
      key: 'org_fence',
      label: 'Organization Publishing Fence',
      state: orgFence.orgEnabled ? 'READY' : 'DISABLED',
      detail: 'Publishing remains DISABLED this sprint',
    },
    {
      key: 'automation',
      label: 'Automation Mode',
      state: pilot.automation_mode === 'MANUAL' ? 'DISABLED' : 'PARTIAL',
      detail: String(pilot.automation_mode),
    },
    {
      key: 'cross_posting',
      label: 'Cross-posting',
      state: String(pilot.cross_posting_status ?? 'DISABLED') === 'DISABLED' ? 'DISABLED' : 'PARTIAL',
    },
    {
      key: 'security',
      label: 'Security Configuration',
      state: secretCfg.configured ? 'READY' : 'BLOCKED',
      detail: secretCfg.configured ? undefined : secretCfg.message,
    },
  ];

  const prerequisitesMet =
    !!assessment &&
    !!profile &&
    profile.marketing_maturity !== 'ASSESSMENT_REQUIRED' &&
    verified &&
    accountConfirmed &&
    oauthCfg.configured &&
    secretCfg.configured;

  const overallReadiness: PilotReadinessState = prerequisitesMet
    ? 'READY_FOR_FENCE_ENABLEMENT'
    : assessment && profile
      ? 'PARTIAL'
      : 'NOT_STARTED';

  const nextAction = !assessment
    ? 'Complete NDXbook marketing assessment'
    : !oauthCfg.configured
      ? `Configure provider: ${oauthCfg.missing.join(', ')}`
      : !social
        ? 'Authorize NDXbook social account'
        : !verified
          ? 'Verify connection'
          : !accountConfirmed
            ? 'Confirm connected account'
            : 'Review pilot content draft';

  return {
    organizationSlug: orgSlug,
    designation: 'DISTRIBUTION_PUBLISHING_PILOT',
    currentState: overallReadiness,
    items,
    publishingFence: orgFence,
    globalPublishing: globalFence ? 'ENABLED' : 'DISABLED — OWNER ACTION REQUIRED',
    automationMode: String(pilot.automation_mode),
    humanApprovalRequired: pilot.human_approval_required !== false,
    crossPosting: String(pilot.cross_posting_status ?? 'DISABLED'),
    nextAction,
    pilotPurpose: String(pilot.pilot_purpose ?? 'EVOLVE_DISTRIBUTION_VALIDATION'),
  };
}
