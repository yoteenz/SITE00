import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import {
  approveManifest,
  deferRequirement,
  decideReconciliation,
  ensureBootstrapped,
  getOrchestrationDashboardSnapshot,
  getOrchestrationDebugPayload,
  getOrchestrationProjectDetail,
  getReadinessForOrg,
  getRequirementExplanation,
  ingestProject,
  previewDeferralImpact,
  proposeManifest,
  applyLaunchOverride,
  recordExternalEvidence,
  runBootstrap,
  runReconciliation,
} from '../_lib/site00Orchestration/orchestrationService.js';

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

const WORKSPACE_ROOT = process.cwd();

/**
 * SITE 00 Production Orchestration API (admin-only)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) return res.status(auth.failure.status).json({ error: auth.failure.error });

  try {
    if (req.method === 'GET') {
      const action = String(req.query.action ?? 'debug');

      switch (action) {
        case 'debug': {
          await ensureBootstrapped(WORKSPACE_ROOT);
          return res.status(200).json(await getOrchestrationDebugPayload());
        }
        case 'readiness': {
          const orgSlug = String(req.query.orgSlug ?? 'site-00');
          return res.status(200).json({ orgSlug, readiness: await getReadinessForOrg(orgSlug) });
        }
        case 'explain': {
          const requirementId = String(req.query.requirementId ?? '');
          return res.status(200).json({ requirementId, explanation: await getRequirementExplanation(requirementId) });
        }
        case 'defer-preview': {
          const requirementId = String(req.query.requirementId ?? '');
          return res.status(200).json({ requirementId, impact: await previewDeferralImpact(requirementId) });
        }
        case 'dashboard': {
          await ensureBootstrapped(WORKSPACE_ROOT);
          return res.status(200).json(await getOrchestrationDashboardSnapshot());
        }
        case 'project': {
          await ensureBootstrapped(WORKSPACE_ROOT);
          const orgSlug = String(req.query.orgSlug ?? '');
          const detail = await getOrchestrationProjectDetail(orgSlug);
          if (!detail) return res.status(404).json({ error: 'ORGANIZATION NOT FOUND' });
          return res.status(200).json(detail);
        }
        default:
          return res.status(400).json({ error: 'UNKNOWN ACTION' });
      }
    }

    if (req.method === 'POST') {
      const body = parseBody(req) ?? {};
      const action = String(body.action ?? req.query.action ?? '');

      switch (action) {
        case 'bootstrap':
          return res.status(200).json(await runBootstrap(WORKSPACE_ROOT));
        case 'propose-manifest':
          return res.status(200).json(proposeManifest(body as Parameters<typeof proposeManifest>[0]));
        case 'approve-manifest': {
          const result = await approveManifest(String(body.manifestId), auth.user.email);
          return res.status(result.ok ? 200 : 400).json(result);
        }
        case 'defer-requirement': {
          const result = await deferRequirement(
            String(body.requirementId),
            auth.user.email,
            String(body.reason ?? 'Deferred by admin'),
          );
          return res.status(result.ok ? 200 : 400).json(result);
        }
        case 'launch-override': {
          const result = await applyLaunchOverride(
            String(body.requirementId),
            auth.user.email,
            String(body.reason ?? ''),
            String(body.impactAcknowledgment ?? ''),
          );
          return res.status(result.ok ? 200 : 400).json(result);
        }
        case 'record-evidence':
          return res.status(200).json(
            await recordExternalEvidence({
              organizationSlug: String(body.organizationSlug),
              requirementKey: String(body.requirementKey),
              title: String(body.title),
              source: String(body.source ?? 'manual'),
            }),
          );
        case 'reconcile':
          return res.status(200).json(
            await runReconciliation({
              organizationSlug: String(body.organizationSlug),
              requirementKey: String(body.requirementKey),
              declaredState: String(body.declaredState ?? 'BUILDING'),
            }),
          );
        case 'reconcile-decide':
          return res.status(200).json(
            await decideReconciliation(
              String(body.reconciliationId),
              body.decision as 'ACCEPT' | 'REJECT' | 'MODIFY',
              auth.user.email,
              body.modifiedState ? String(body.modifiedState) : undefined,
            ),
          );
        case 'ingest-project':
          return res.status(200).json(await ingestProject(body as Parameters<typeof ingestProject>[0]));
        default:
          return res.status(400).json({ error: 'UNKNOWN ACTION' });
      }
    }

    return res.status(405).json({ error: 'METHOD NOT ALLOWED' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'ORCHESTRATION ERROR';
    return res.status(500).json({ error: message });
  }
}
