import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import {
  approveManifestById,
  approveSubject,
  createCampaign,
  createCampaignFromManifestItem,
  createObjective,
  ensureEvolveSeeded,
  generateManifestForOrg,
  getApprovalsInbox,
  getCampaignDetail,
  getCampaignList,
  getEmailOpsPayload,
  getEvolveDebugPayload,
  getEvolveOverview,
  getPlansPayload,
  getSocialOpsPayload,
  getCalendarItemById,
  getEvolveRoadmapByOrgId,
  listMarketingOrgs,
  rejectSubject,
  requestApproval,
  requestStudioProduction,
  runAssessmentForOrg,
  transitionCampaignStatus,
  updateObjective,
} from '../_lib/site00Evolve/evolveService.js';
import { orgIdFromSlug } from '../_lib/site00Evolve/orgRegistry.js';
import { getCalendarByOrgId, getChannelsByOrgId, getObjectivesByOrgId, getPendingApprovals, getLatestAssessment } from '../_lib/site00Evolve/storeAdapter.js';
import { resolveStoreMode, EvolveStoreUnavailableError } from '../_lib/site00Evolve/storeAdapter.js';
import type { CampaignStatus, ProductionType } from '../_lib/site00Evolve/types.js';
import {
  disconnectConnection,
  getConnectionDetail,
  initiateConnection,
  listProviderCatalog,
  listSafeConnections,
  selectAccountProperty,
  verifyConnection,
  attemptPublish,
} from '../_lib/site00Evolve/providers/connectionService.js';
import {
  getOrgConnectionsPayload,
  getPortfolioConnectionsPayload,
  getConnectionWizardPayload,
  discoverAccountsForConnection,
} from '../_lib/site00Evolve/providers/connectionsAdmin.js';
import { runConnectionSync } from '../_lib/site00Evolve/providers/syncService.js';
import { getPilotReadiness, createDistributionJob } from '../_lib/site00Evolve/providers/pilotService.js';
import { buildPerformanceSnapshot, generateEvidenceInsights } from '../_lib/site00Evolve/providers/intelligenceService.js';
import { verifySprint03Schema } from '../_lib/site00Evolve/providers/connectionStore.js';
import { ProviderError } from '../_lib/site00Evolve/providers/errors.js';
import { getOwnerConfigurationChecklist } from '../_lib/site00Evolve/providers/ownerConfigService.js';
import { evaluateFenceEnablementReadiness } from '../_lib/site00Evolve/providers/pilotActivationService.js';
import { discoverMetaInstagramAccounts, verifyConnectionCapabilities } from '../_lib/site00Evolve/providers/accountDiscoveryService.js';
import {
  saveFirstPostDraft,
  sendFirstPostForApproval,
  getFirstPostCandidateView,
  runFirstPostDryRun,
} from '../_lib/site00Evolve/providers/firstPostCandidateService.js';
import { getCanonicalMetaOAuthCallbackUrl } from '../_lib/site00Evolve/providers/oauthConstants.js';
import { runNdxbookAssessment, generateNdxbookManifest, getNdxbookMarketingState } from '../_lib/site00Evolve/providers/ndxbookService.js';
import { runNdxbookLegacyImport, getNdxbookImportReport, getNdxbookImportState } from '../_lib/site00Evolve/providers/ndxbookLegacyImportService.js';
import { startOAuthAuthorization, getProviderOAuthConfig } from '../_lib/site00Evolve/providers/oauthService.js';
import { validateSecretStoreConfiguration } from '../_lib/site00Evolve/providers/providerSecretStore.js';
import { confirmConnectionAccount } from '../_lib/site00Evolve/providers/accountConfirmation.js';
import { runPublicationDryRun } from '../_lib/site00Evolve/providers/dryRunService.js';
import { getExpandedPilotReadiness } from '../_lib/site00Evolve/providers/pilotReadinessSprint04.js';
import { runAnalyticsBaseline } from '../_lib/site00Evolve/providers/analyticsBaselineService.js';
import {
  getCreativeDirectionPayload,
  recordFounderDecision,
  ensureCreativeDirectionEngagement,
  queueFalGenerationJobs,
} from '../_lib/site00Evolve/creativeDirection/engagementService.js';

function parseBody(req: VercelRequest): Record<string, unknown> | null {
  if (typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)) {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

function orgSlugFromQuery(req: VercelRequest): string {
  return String(req.query.orgSlug ?? req.query.org ?? 'site-00');
}

/** SITE 00 EVOLVE Marketing OS API (admin-only) */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) return res.status(auth.failure.status).json({ error: auth.failure.error });

  try {
    await ensureEvolveSeeded();

    if (req.method === 'GET') {
      const action = String(req.query.action ?? 'overview');
      const orgSlug = orgSlugFromQuery(req);

      switch (action) {
        case 'overview':
          return res.status(200).json({ orgSlug, overview: await getEvolveOverview(orgSlug) });
        case 'organizations':
          return res.status(200).json({ organizations: listMarketingOrgs() });
        case 'store_mode': {
          const mode = await resolveStoreMode();
          return res.status(200).json({ mode });
        }
        case 'debug':
          return res.status(200).json(await getEvolveDebugPayload(orgSlug));
        case 'assessment': {
          const orgId = orgIdFromSlug(orgSlug);
          return res.status(200).json({ assessment: orgId ? await getLatestAssessment(orgId) : null });
        }
        case 'objectives':
          return res.status(200).json({ objectives: await getObjectivesByOrgId(orgIdFromSlug(orgSlug)!) });
        case 'channels':
          return res.status(200).json({ channels: await getChannelsByOrgId(orgIdFromSlug(orgSlug)!) });
        case 'campaigns':
          return res.status(200).json({ campaigns: await getCampaignList(orgSlug) });
        case 'campaign': {
          const campaignId = String(req.query.campaignId ?? '');
          const detail = await getCampaignDetail(orgSlug, campaignId);
          return res.status(detail ? 200 : 404).json(detail ?? { error: 'Campaign not found' });
        }
        case 'calendar':
          return res.status(200).json({ calendar: await getCalendarByOrgId(orgIdFromSlug(orgSlug)!) });
        case 'calendar_item': {
          const itemId = String(req.query.itemId ?? '');
          const item = await getCalendarItemById(itemId);
          const orgId = orgIdFromSlug(orgSlug)!;
          if (!item || item.organization_id !== orgId) {
            return res.status(404).json({ error: 'Calendar item not found' });
          }
          return res.status(200).json({ item });
        }
        case 'emails':
          return res.status(200).json(await getEmailOpsPayload(orgSlug));
        case 'social':
          return res.status(200).json(await getSocialOpsPayload(orgSlug));
        case 'plans':
          return res.status(200).json(await getPlansPayload(orgSlug));
        case 'manifest': {
          const { getMarketingManifest } = await import('../_lib/site00Evolve/manifest.js');
          return res.status(200).json(await getMarketingManifest(orgSlug));
        }
        case 'approvals':
          return res.status(200).json({ approvals: await getPendingApprovals(orgIdFromSlug(orgSlug)!) });
        case 'approvals_inbox':
          return res.status(200).json({ approvals: await getApprovalsInbox() });
        case 'roadmap':
          return res.status(200).json({ roadmap: await getEvolveRoadmapByOrgId(orgIdFromSlug(orgSlug)!) });
        case 'connections_portfolio':
          return res.status(200).json(await getPortfolioConnectionsPayload());
        case 'connections':
          return res.status(200).json(await getOrgConnectionsPayload(orgSlug));
        case 'connection_detail': {
          const connectionId = String(req.query.connectionId ?? '');
          const detail = await getConnectionDetail(orgSlug, connectionId);
          return res.status(detail ? 200 : 404).json(detail ?? { error: 'Connection not found' });
        }
        case 'connection_wizard':
          return res.status(200).json(await getConnectionWizardPayload(String(req.query.category ?? '') as never));
        case 'provider_catalog':
          return res.status(200).json({ providers: listProviderCatalog(String(req.query.category ?? '') as never) });
        case 'pilot_readiness':
          return orgSlug === 'ndxbook'
            ? res.status(200).json(await getExpandedPilotReadiness(orgSlug))
            : res.status(200).json(await getPilotReadiness(orgSlug));
        case 'ndxbook_state':
          return res.status(200).json(await getNdxbookMarketingState());
        case 'ndxbook_import_report':
          return res.status(200).json(await getNdxbookImportReport());
        case 'ndxbook_import_state':
          return res.status(200).json(getNdxbookImportState());
        case 'creative_direction':
          return res.status(200).json(await getCreativeDirectionPayload(orgSlug));
        case 'creative_direction_debug':
          return res.status(200).json({
            ...(await getCreativeDirectionPayload(orgSlug)),
            debug: true,
          });
        case 'provider_config':
          return res.status(200).json(getOwnerConfigurationChecklist());
        case 'fence_readiness':
          return res.status(200).json(await evaluateFenceEnablementReadiness(orgSlug));
        case 'oauth_callback_url':
          return res.status(200).json({ exactCallbackUrl: getCanonicalMetaOAuthCallbackUrl() });
        case 'first_post_candidate':
          return res.status(200).json(await getFirstPostCandidateView(orgSlug, String(req.query.candidateId ?? '') || undefined));
        case 'analytics_baseline':
          return res.status(200).json(
            await runAnalyticsBaseline(orgSlug, String(req.query.connectionId ?? '')),
          );
        case 'performance_snapshot':
          return res.status(200).json({
            snapshot: await buildPerformanceSnapshot(orgSlug, {
              campaignId: String(req.query.campaignId ?? '') || undefined,
              connectionId: String(req.query.connectionId ?? '') || undefined,
            }),
          });
        case 'sprint03_schema':
          return res.status(200).json(await verifySprint03Schema());
        default:
          return res.status(400).json({ error: 'UNKNOWN ACTION' });
      }
    }

    if (req.method === 'POST') {
      const body = parseBody(req) ?? {};
      const action = String(body.action ?? req.query.action ?? '');
      const orgSlug = String(body.orgSlug ?? orgSlugFromQuery(req));

      switch (action) {
        case 'run_assessment':
          return res.status(200).json({
            assessment: await runAssessmentForOrg(orgSlug, auth.user.email, body.connections as never),
          });
        case 'generate_manifest':
          return res.status(200).json(await generateManifestForOrg(orgSlug));
        case 'approve_manifest': {
          const manifestId = String(body.manifestId ?? '');
          const manifest = await approveManifestById(manifestId, auth.user.email);
          return res.status(manifest ? 200 : 404).json({ manifest });
        }
        case 'create_objective':
          return res.status(200).json({ objective: await createObjective(orgSlug, body as never) });
        case 'update_objective': {
          const id = String(body.id ?? '');
          const objective = await updateObjective(id, body as never);
          return res.status(objective ? 200 : 404).json({ objective });
        }
        case 'create_campaign':
          return res.status(200).json({ campaign: await createCampaign(orgSlug, body as never) });
        case 'create_campaign_from_manifest':
          return res.status(200).json({
            campaign: await createCampaignFromManifestItem(orgSlug, String(body.manifestItemKey ?? ''), auth.user.email),
          });
        case 'transition_campaign': {
          const result = await transitionCampaignStatus(
            orgSlug,
            String(body.campaignId ?? ''),
            String(body.status ?? '') as CampaignStatus,
            {
              hasRequiredApproval: Boolean(body.hasRequiredApproval),
              productionComplete: body.productionComplete as boolean | undefined,
              hasLiveEvidence: Boolean(body.hasLiveEvidence),
              deliverablesComplete: Boolean(body.deliverablesComplete),
              actorEmail: auth.user.email,
            },
          );
          return res.status(result.ok ? 200 : 400).json(result);
        }
        case 'request_production': {
          const { resolveOrgContext } = await import('../_lib/site00Evolve/evolveService.js');
          const org = resolveOrgContext(orgSlug);
          const result = await requestStudioProduction({
            orgSlug,
            orgClassification: org.classification,
            productionType: String(body.productionType ?? 'OTHER') as ProductionType,
            objective: body.objective ? String(body.objective) : undefined,
            brief: body.brief ? String(body.brief) : undefined,
            campaignId: body.campaignId ? String(body.campaignId) : undefined,
            calendarItemId: body.calendarItemId ? String(body.calendarItemId) : undefined,
            createdBy: auth.user.email,
            deliverables: body.deliverables as unknown[] | undefined,
            canonRefs: body.canonRefs as unknown[] | undefined,
            referenceRefs: body.referenceRefs as unknown[] | undefined,
            dueDate: body.dueDate ? String(body.dueDate) : undefined,
          });
          return res.status(result.ok ? 200 : 400).json(result);
        }
        case 'request_approval':
          return res.status(200).json({
            approval: await requestApproval(
              orgSlug,
              String(body.subjectType ?? 'campaign'),
              String(body.subjectId ?? ''),
              String(body.approvalType ?? 'STRATEGY'),
              auth.user.email,
            ),
          });
        case 'approve_item': {
          await approveSubject(String(body.approvalId ?? ''), auth.user.email);
          return res.status(200).json({ ok: true });
        }
        case 'reject_item': {
          await rejectSubject(String(body.approvalId ?? ''), auth.user.email, String(body.reason ?? ''));
          return res.status(200).json({ ok: true });
        }
        case 'initiate_connection':
          return res.status(200).json({
            connection: await initiateConnection(orgSlug, String(body.providerKey ?? ''), String(body.displayName ?? '')),
          });
        case 'select_connection_account':
          return res.status(200).json({
            connection: await selectAccountProperty(
              orgSlug,
              String(body.connectionId ?? ''),
              String(body.accountId ?? ''),
              String(body.accountName ?? ''),
              body.propertyId ? String(body.propertyId) : undefined,
              body.propertyName ? String(body.propertyName) : undefined,
            ),
          });
        case 'verify_connection':
          return res.status(200).json({
            connection: await verifyConnection(orgSlug, String(body.connectionId ?? '')),
          });
        case 'disconnect_connection':
          await disconnectConnection(orgSlug, String(body.connectionId ?? ''));
          return res.status(200).json({ ok: true });
        case 'sync_connection':
          return res.status(200).json(await runConnectionSync(orgSlug, String(body.connectionId ?? '')));
        case 'discover_accounts':
          return res.status(200).json(await discoverAccountsForConnection(orgSlug, String(body.connectionId ?? '')));
        case 'create_distribution_job':
          return res.status(200).json({ job: await createDistributionJob(orgSlug, body) });
        case 'attempt_publish':
          try {
            await attemptPublish(orgSlug, String(body.connectionId ?? ''));
            return res.status(200).json({ ok: true });
          } catch (e) {
            if (e instanceof ProviderError) {
              return res.status(403).json({ error: e.message, code: e.code });
            }
            throw e;
          }
        case 'generate_insights': {
          const connections = await listSafeConnections(orgSlug);
          return res.status(200).json({
            insights: await generateEvidenceInsights(
              orgSlug,
              connections.map((c) => c.id),
            ),
            contentBrainBoundary: (await import('../_lib/site00Evolve/providers/intelligenceService.js')).contentBrainLearningBoundary(),
          });
        }
        case 'run_ndxbook_assessment':
          return res.status(200).json({
            assessment: await runNdxbookAssessment(body.answers as never, auth.user.email),
          });
        case 'generate_ndxbook_manifest':
          return res.status(200).json(await generateNdxbookManifest());
        case 'start_oauth':
          return res.status(200).json(
            await startOAuthAuthorization(orgSlug, String(body.providerKey ?? 'meta_instagram'), String(body.connectionId ?? '')),
          );
        case 'confirm_account':
          return res.status(200).json({
            connection: await confirmConnectionAccount(orgSlug, String(body.connectionId ?? ''), auth.user.email),
          });
        case 'dry_run_publication':
          return res.status(200).json(
            await runPublicationDryRun(orgSlug, {
              connectionId: String(body.connectionId ?? ''),
              caption: body.caption ? String(body.caption) : undefined,
              approvalState: body.approvalState ? String(body.approvalState) : 'DRAFT',
              campaignId: body.campaignId ? String(body.campaignId) : undefined,
            }),
          );
        case 'discover_ig_accounts':
          return res.status(200).json(
            await discoverMetaInstagramAccounts(orgSlug, String(body.connectionId ?? '')),
          );
        case 'verify_capabilities':
          return res.status(200).json(
            await verifyConnectionCapabilities(orgSlug, String(body.connectionId ?? '')),
          );
        case 'save_first_post_draft':
          return res.status(200).json({ candidate: await saveFirstPostDraft(orgSlug, body as never) });
        case 'send_first_post_approval':
          return res.status(200).json(
            await sendFirstPostForApproval(orgSlug, String(body.candidateId ?? ''), auth.user.email),
          );
        case 'first_post_dry_run':
          return res.status(200).json(
            await runFirstPostDryRun(orgSlug, String(body.candidateId ?? ''), String(body.approvalState ?? 'APPROVED')),
          );
        case 'import_ndxbook_legacy':
          return res.status(200).json(
            await runNdxbookLegacyImport({ approvedBy: auth.user.email }),
          );
        case 'creative_direction_start':
          return res.status(200).json(await ensureCreativeDirectionEngagement(orgSlug));
        case 'creative_direction_decision':
          return res.status(200).json(
            await recordFounderDecision(orgSlug, {
              type: String(body.type ?? 'REFINE') as 'APPROVE' | 'REFINE' | 'HYBRIDIZE' | 'REJECT',
              selectedTerritoryId: body.selectedTerritoryId ? String(body.selectedTerritoryId) : undefined,
              hybridSelections: body.hybridSelections as never,
              refinementNotes: body.refinementNotes ? String(body.refinementNotes) : undefined,
              rejectedTerritoryIds: body.rejectedTerritoryIds as string[] | undefined,
              by: auth.user.email,
            }),
          );
        case 'creative_direction_queue_generation':
          return res.status(200).json(await queueFalGenerationJobs(orgSlug));
        case 'analytics_baseline_sync':
          return res.status(200).json(
            await runAnalyticsBaseline(orgSlug, String(body.connectionId ?? '')),
          );
        default:
          return res.status(400).json({ error: 'UNKNOWN ACTION' });
      }
    }

    return res.status(405).json({ error: 'METHOD NOT ALLOWED' });
  } catch (e) {
    if (e instanceof EvolveStoreUnavailableError) {
      return res.status(503).json({ error: e.message, storeUnavailable: true });
    }
    const message = e instanceof Error ? e.message : 'EVOLVE API error';
    return res.status(500).json({ error: message });
  }
}
