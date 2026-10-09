/**
 * SITE 00 — Digital Foundation founder mini console API.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import {
  applyManualQuoteAdjustment,
  createArtifactForLead,
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
import { syncAllArtifactsIntoMemory } from '../_lib/digitalFoundation/persistence/supabaseStore.js';
import {
  activateRunbookForArtifact,
  generateRunbookForArtifact,
  getPipelineView,
  getProjectCommandSnapshot,
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

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

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
          const artifact = createArtifactForLead(body);
          return res.status(200).json({
            artifact,
            personalized_url: `/foundation/${artifact.public_token}`,
          });
        }
        case 'create-artifact-for-lead': {
          const artifact = createArtifactForLead({ lead_id: String(body.lead_id) });
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
