/**
 * SITE 00 — Digital Foundation founder mini console API.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import {
  CLOUD_PREVIEW_FOUNDER_ADMIN_USER,
  isCloudMobilePreviewDev,
} from '../_lib/cloudMobilePreview.js';
import {
  applyManualQuoteAdjustment,
  createArtifactForLeadDurable,
  createClientAction,
  createLead,
  getArtifactPayload,
  listReferralSources,
  markFoundationComplete,
  markQuoteCommerciallyReady,
  materializeFixtureScenario,
  requestApproval,
  resolveApproval,
  updateProjectStage,
  updateQuoteSelections,
} from '../_lib/digitalFoundation/service.js';
import { listArtifacts } from '../_lib/digitalFoundation/memoryStore.js';
import {
  listProjectMessages,
  markProjectMessagesRead,
  sendProjectMessage,
} from '../_lib/digitalFoundation/messaging.js';
import { syncAllArtifactsIntoMemory } from '../_lib/digitalFoundation/persistence/supabaseStore.js';
import {
  activateRunbookForArtifact,
  generateRunbookForArtifact,
  getPipelineView,
  getProjectCommandSnapshot,
  getRunbookView,
  getWorkbenchView,
  runTaskVerification,
  setBlocker,
  setProjectProviders,
  startTask,
  completeTask,
  escalateTaskMode,
  assessArtifactCompletion,
} from '../_lib/digitalFoundation/operationsEngine.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const auth = isCloudMobilePreviewDev()
    ? ({ ok: true as const, user: { ...CLOUD_PREVIEW_FOUNDER_ADMIN_USER } })
    : await resolveAdminAuth(req);
  if (!auth.ok) {
    return res.status(auth.failure.status).json({ error: auth.failure.error, code: auth.failure.code });
  }
  void auth.user;

  const action = String(req.query.action ?? '');
  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};

  try {
    if (req.method === 'GET') {
      switch (action) {
        case 'list':
          await syncAllArtifactsIntoMemory();
          return res.status(200).json({
            artifacts: listArtifacts().map((a) => ({
              artifact_id: a.artifact_id,
              public_token: a.public_token,
              state: a.state,
              payment_state: a.payment_state,
              intake_state: a.intake_state,
              business_name: a.intake?.business_name ?? null,
              lead_id: a.lead_id,
              referral_source_id: a.referral_source_id,
              created_at: a.created_at,
              last_activity_at: a.last_activity_at,
            })),
            referral_sources: listReferralSources(),
          });
        case 'detail': {
          const id = String(req.query.id ?? '');
          return res.status(200).json(getArtifactPayload(id));
        }
        case 'pipeline':
          return res.status(200).json(getPipelineView());
        case 'project-command': {
          const id = String(req.query.id ?? '');
          return res.status(200).json(getProjectCommandSnapshot(id));
        }
        case 'workbench': {
          const id = String(req.query.id ?? '');
          return res.status(200).json(getWorkbenchView(id));
        }
        case 'completion-gate': {
          const id = String(req.query.id ?? '');
          return res.status(200).json(assessArtifactCompletion(id));
        }
        case 'runbook': {
          const id = String(req.query.id ?? '');
          return res.status(200).json(getRunbookView(id));
        }
        case 'messages': {
          const id = String(req.query.id ?? '');
          markProjectMessagesRead({ artifact_id: id, reader_role: 'FOUNDER' });
          return res.status(200).json({ messages: listProjectMessages(id) });
        }
        case 'readiness-report': {
          const { buildFounderReadinessReportAsync } = await import('../_lib/digitalFoundation/founderReadiness.js');
          return res.status(200).json(
            await buildFounderReadinessReportAsync({
              founder_admin_verified: true,
              founder_email: auth.user.email,
            }),
          );
        }
        case 'email-timeline': {
          const { listEmailTimeline } = await import('../_lib/digitalFoundation/founderReadiness.js');
          return res.status(200).json({ events: listEmailTimeline() });
        }
        case 'test-journey': {
          const id = String(req.query.id ?? '');
          const { getSyntheticTestJourney } = await import('../_lib/digitalFoundation/founderReadiness.js');
          return res.status(200).json(getSyntheticTestJourney(id));
        }
        case 'prepare-test-invitation': {
          const intentId = String(req.query.intent_id ?? '');
          const { prepareTestInvitation } = await import('../_lib/digitalFoundation/founderReadiness.js');
          return res.status(200).json(prepareTestInvitation(intentId));
        }
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    if (req.method === 'POST') {
      const postAction = String(body.action ?? action);
      switch (postAction) {
        case 'create-lead':
          return res.status(200).json({ lead: createLead(body) });
        case 'create-artifact': {
          const artifact = await createArtifactForLeadDurable(body);
          return res.status(200).json({
            artifact,
            personalized_url: `/foundation/${artifact.public_token}`,
          });
        }
        case 'create-artifact-for-lead': {
          const artifact = await createArtifactForLeadDurable({ lead_id: String(body.lead_id) });
          return res.status(200).json({
            artifact,
            personalized_url: `/foundation/${artifact.public_token}`,
          });
        }
        case 'update-quote':
          return res.status(200).json({
            quote: updateQuoteSelections(String(body.artifact_id), body.selections ?? [], 'FOUNDER'),
          });
        case 'manual-adjustment':
          return res.status(200).json({
            quote: applyManualQuoteAdjustment(String(body.artifact_id), Number(body.adjustment_minor ?? 0)),
          });
        case 'quote-commercial-ready':
          return res.status(200).json({
            quote: markQuoteCommerciallyReady(String(body.artifact_id)),
          });
        case 'client-action':
          return res.status(200).json({ request: createClientAction(body) });
        case 'approval-request':
          return res.status(200).json({ approval: requestApproval(body) });
        case 'approval-resolve':
          return res.status(200).json({
            approval: resolveApproval(
              String(body.artifact_id),
              String(body.approval_id),
              body.status === 'REVISION_REQUESTED' ? 'REVISION_REQUESTED' : 'APPROVED',
              'FOUNDER',
              body.note ? String(body.note) : undefined,
            ),
          });
        case 'update-stage':
          return res.status(200).json({
            stages: updateProjectStage(String(body.artifact_id), body.stage_code, body.status),
          });
        case 'mark-complete':
          return res.status(200).json({
            artifact: markFoundationComplete(
              String(body.artifact_id),
              body.ownership,
              body.founder_override ? { founder_override: true, override_reason: String(body.override_reason ?? '') } : undefined,
            ),
          });
        case 'generate-runbook':
          return res.status(200).json(generateRunbookForArtifact(String(body.artifact_id), { supersede: Boolean(body.supersede) }));
        case 'activate-runbook':
          return res.status(200).json({ runbook: activateRunbookForArtifact(String(body.artifact_id)) });
        case 'set-providers':
          return res.status(200).json({ config: setProjectProviders(String(body.artifact_id), body) });
        case 'start-task':
          return res.status(200).json({ task: startTask(String(body.artifact_id), String(body.task_id)) });
        case 'complete-task':
          return res.status(200).json({ task: completeTask(String(body.artifact_id), String(body.task_id), body.metadata ?? {}) });
        case 'verify-task':
          return res.status(200).json({
            task: runTaskVerification(String(body.artifact_id), String(body.task_id), body.pass !== false, body.observed),
          });
        case 'escalate-task':
          return res.status(200).json({
            task: escalateTaskMode(String(body.artifact_id), String(body.task_id), body.mode ?? 'ASSISTED', String(body.reason ?? '')),
          });
        case 'set-blocker':
          return res.status(200).json({
            task: setBlocker(String(body.artifact_id), String(body.task_id), body.category ?? 'UNKNOWN', String(body.reason ?? '')),
          });
        case 'materialize-fixture':
          return res.status(200).json(await materializeFixtureScenario(String(body.fixture_id)));
        case 'send-message':
          sendProjectMessage({
            artifact_id: String(body.artifact_id),
            author_role: 'FOUNDER',
            body: String(body.body ?? ''),
          });
          return res.status(200).json({ messages: listProjectMessages(String(body.artifact_id)) });
        case 'create-test-client': {
          const { createSyntheticTestClient } = await import('../_lib/digitalFoundation/founderReadiness.js');
          return res.status(200).json(
            await createSyntheticTestClient({
              display_name: String(body.display_name ?? 'Founder E2E'),
              contact_email: String(body.contact_email ?? ''),
              contact_name: body.contact_name ? String(body.contact_name) : undefined,
              test_run_id: body.test_run_id ? String(body.test_run_id) : undefined,
            }),
          );
        }
        case 'advance-test-intake': {
          const { advanceSyntheticIntakeSubmitted } = await import('../_lib/digitalFoundation/founderReadiness.js');
          return res.status(200).json(advanceSyntheticIntakeSubmitted(String(body.artifact_id)));
        }
        case 'advance-test-quote': {
          const { advanceSyntheticQuoteReady } = await import('../_lib/digitalFoundation/founderReadiness.js');
          return res.status(200).json(advanceSyntheticQuoteReady(String(body.artifact_id)));
        }
        case 'dispatch-test-email': {
          const { dispatchQueuedEmail } = await import('../_lib/digitalFoundation/founderReadiness.js');
          return res.status(200).json(
            await dispatchQueuedEmail(String(body.intent_id), {
              founderApprovedSend: body.founder_approved_send === true || body.founder_approved_send === 'true',
            }),
          );
        }
        case 'prepare-test-invitation': {
          const { prepareTestInvitation } = await import('../_lib/digitalFoundation/founderReadiness.js');
          return res.status(200).json(prepareTestInvitation(String(body.intent_id)));
        }
        case 'reset-test-data': {
          const { resetSyntheticTestData } = await import('../_lib/digitalFoundation/founderReadiness.js');
          return res.status(200).json(await resetSyntheticTestData());
        }
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[admin site00-foundation]', e);
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Admin foundation operation failed' });
  }
}
