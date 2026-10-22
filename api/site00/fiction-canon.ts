/**
 * Fiction canon API — THE EXCHANGE and future serialized properties.
 * Founder-scoped; not a public lore surface.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { canAccessFounderProjectAsOwner } from '../_lib/site00Access/accessModel.js';
import { denyUnlessProjectCapability } from '../_lib/site00Projects/projectCapabilityGuard.js';
import { registerTheExchangeProperty } from '../_lib/site00FictionCanon/propertyService.js';
import { ingestFictionCanonBatch } from '../_lib/site00FictionCanon/ingestService.js';
import {
  assessOpusExecutionReadiness,
  buildIngestionReadinessReport,
} from '../_lib/site00FictionCanon/readinessReport.js';
import { evaluateFictionPremise } from '../_lib/site00FictionCanon/opusEvaluationAdapter.js';
import { assembleFictionEvaluationContext } from '../_lib/site00FictionCanon/contextAssembly.js';
import { ingestFounderBiblePackageFromDirectory } from '../_lib/site00FictionCanon/founderPackage/ingestFounderPackage.js';
import { buildOpusDryRunPreview, assessPersistenceLayer } from '../_lib/site00FictionCanon/opusDryRunPreview.js';
import path from 'node:path';
import { getFictionPropertyBySlug, listFictionDocuments } from '../_lib/site00FictionCanon/fictionCanonStore.js';
import type { FictionIngestBatch } from '../../shared/site00-fiction-canon/types.js';
import { FICTION_PROPERTY_SLUG_THE_EXCHANGE } from '../../shared/site00-fiction-canon/types.js';

function json(res: VercelResponse, status: number, body: unknown): void {
  res.status(status).json(body);
}

async function assertFictionAccess(req: VercelRequest, res: VercelResponse, slug: string): Promise<boolean> {
  const user = await getAuthUser(req);
  if (!user) {
    json(res, 401, { ok: false, error: 'UNAUTHORIZED' });
    return false;
  }
  const allowed = await canAccessFounderProjectAsOwner(user, slug);
  if (!allowed) {
    json(res, 403, { ok: false, error: 'FORBIDDEN' });
    return false;
  }
  const cap = denyUnlessProjectCapability(res, slug, 'FICTION_CANON');
  if (cap) return false;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const action = String(req.query.action ?? req.body?.action ?? '');

  if (req.method === 'GET' && action === 'opus_preview') {
    const slug = String(req.query.propertySlug ?? FICTION_PROPERTY_SLUG_THE_EXCHANGE);
    if (!(await assertFictionAccess(req, res, slug))) return;
    const preview = await buildOpusDryRunPreview(slug);
    if (!preview) return json(res, 404, { ok: false, error: 'PROPERTY_NOT_FOUND' });
    return json(res, 200, { ok: true, preview, persistence: await assessPersistenceLayer() });
  }

  if (req.method === 'GET' && action === 'readiness') {
    const slug = String(req.query.propertySlug ?? FICTION_PROPERTY_SLUG_THE_EXCHANGE);
    if (!(await assertFictionAccess(req, res, slug))) return;
    const report = await buildIngestionReadinessReport(slug);
    return json(res, 200, { ok: true, report, opus: assessOpusExecutionReadiness() });
  }

  if (req.method === 'GET' && action === 'property') {
    const slug = String(req.query.propertySlug ?? FICTION_PROPERTY_SLUG_THE_EXCHANGE);
    if (!(await assertFictionAccess(req, res, slug))) return;
    const property = await getFictionPropertyBySlug(slug);
    if (!property) return json(res, 404, { ok: false, error: 'PROPERTY_NOT_FOUND' });
    const docs = await listFictionDocuments(property.id);
    return json(res, 200, { ok: true, property, documentCount: docs.length });
  }

  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;

  if (action === 'ingest_founder_bible_v1') {
    if (!(await assertFictionAccess(req, res, FICTION_PROPERTY_SLUG_THE_EXCHANGE))) return;
    const packageRoot =
      typeof body.packageRoot === 'string' && body.packageRoot.trim()
        ? body.packageRoot.trim()
        : path.join(process.cwd(), 'THE_EXCHANGE/FOUNDER_SOURCE/THE_EXCHANGE_MASTER_BIBLE_V1');
    const result = await ingestFounderBiblePackageFromDirectory(packageRoot);
    if (!result.validation.ok) {
      return json(res, 400, { ok: false, validation: result.validation, ...result });
    }
    return json(res, 200, { ok: true, ...result });
  }

  if (action === 'register_the_exchange') {
    if (!(await assertFictionAccess(req, res, FICTION_PROPERTY_SLUG_THE_EXCHANGE))) return;
    const property = await registerTheExchangeProperty({
      importOrientationSeed: body.importOrientationSeed !== false,
    });
    return json(res, 200, { ok: true, property });
  }

  if (action === 'ingest_batch') {
    const batch = body.batch as FictionIngestBatch;
    const slug = batch?.propertySlug ?? FICTION_PROPERTY_SLUG_THE_EXCHANGE;
    if (!(await assertFictionAccess(req, res, slug))) return;
    const cap = denyUnlessProjectCapability(res, slug, 'FICTION_CANON');
    if (cap) return;
    const result = await ingestFictionCanonBatch(batch);
    if (!result.ok) return json(res, 400, { ok: false, ...result });
    return json(res, 200, { ok: true, ...result });
  }

  if (action === 'assemble_context') {
    const slug = String(body.propertySlug ?? FICTION_PROPERTY_SLUG_THE_EXCHANGE);
    if (!(await assertFictionAccess(req, res, slug))) return;
    const property = await getFictionPropertyBySlug(slug);
    if (!property) return json(res, 404, { ok: false, error: 'PROPERTY_NOT_FOUND' });
    const assembly = await assembleFictionEvaluationContext(property.id);
    return json(res, 200, { ok: true, assembly });
  }

  if (action === 'evaluate_premise') {
    const slug = String(body.propertySlug ?? FICTION_PROPERTY_SLUG_THE_EXCHANGE);
    if (!(await assertFictionAccess(req, res, slug))) return;
    const capEval = denyUnlessProjectCapability(res, slug, 'FICTION_OPUS_EVALUATION');
    if (capEval) return;
    const evaluation = await evaluateFictionPremise({
      propertySlug: slug,
      approvedBibleVersion: body.approvedBibleVersion as string | undefined,
      execute: body.execute === true,
    });
    return json(res, 200, { ok: true, evaluation });
  }

  return json(res, 400, { ok: false, error: 'UNKNOWN_ACTION' });
}
