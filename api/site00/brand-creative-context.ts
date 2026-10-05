/**
 * P0.CBI.1 — Brand Creative Context API
 * GET ?action=get|assemble|refresh|readiness&brandId=
 * POST action=save_override body: { brandId, overrides, projectSlug? }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { canAccessFounderProjectAsOwner } from '../_lib/site00Access/accessModel.js';
import { normalizeBrandId, projectIdForBrand } from '../../shared/site00-brand-lore/brandCreativeContext/constants.js';
import {
  assembleBrandCreativeContext,
  getBrandCreativeContext,
  getBrandCreativeContextReadiness,
  refreshBrandCreativeContext,
  saveFounderContextOverride,
} from '../_lib/site00BrandLore/brandCreativeContextService.js';

function json(res: VercelResponse, status: number, body: unknown) {
  res.status(status).json(body);
}

function parseBody(req: VercelRequest): Record<string, unknown> | null {
  if (!req.body) return null;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return req.body as Record<string, unknown>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getAuthUser(req);
  if (!user?.email) {
    return json(res, 401, { ok: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
  }

  const action = String(req.query.action ?? req.body?.action ?? 'get');
  const body = req.method === 'POST' ? parseBody(req) ?? {} : {};
  const brandId = normalizeBrandId(String(req.query.brandId ?? body.brandId ?? ''));
  const projectSlug = String(req.query.projectSlug ?? body.projectSlug ?? projectIdForBrand(brandId));

  if (!brandId) {
    return json(res, 400, { ok: false, error: { code: 'BRAND_ID_REQUIRED', message: 'brandId required' } });
  }

  if (!canAccessFounderProjectAsOwner(user.email, projectSlug)) {
    return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' } });
  }

  try {
    switch (action) {
      case 'get': {
        let ctx = await getBrandCreativeContext(brandId);
        if (!ctx) {
          const assembled = await assembleBrandCreativeContext({ brandId, projectSlug });
          ctx = assembled.context;
        }
        return json(res, 200, { ok: true, context: ctx, source: 'brand_creative_context' });
      }
      case 'assemble': {
        const result = await assembleBrandCreativeContext({ brandId, projectSlug });
        return json(res, 200, { ok: true, ...result, source: 'brand_creative_context_assembler' });
      }
      case 'refresh': {
        const result = await refreshBrandCreativeContext(brandId, projectSlug);
        return json(res, 200, { ok: true, ...result, source: 'brand_creative_context_refresh' });
      }
      case 'readiness': {
        const result = await getBrandCreativeContextReadiness(brandId);
        return json(res, 200, { ok: true, ...result, source: 'brand_creative_context_readiness' });
      }
      case 'save_override': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const overrides = (body.overrides ?? {}) as Record<string, unknown>;
        const ctx = await saveFounderContextOverride(brandId, overrides, projectSlug);
        return json(res, 200, { ok: true, context: ctx, source: 'brand_creative_context_override' });
      }
      default:
        return json(res, 400, { ok: false, error: { code: 'INVALID_ACTION', message: `Unknown action: ${action}` } });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Brand creative context error';
    return json(res, 500, { ok: false, error: { code: 'BRAND_CONTEXT_ERROR', message } });
  }
}
