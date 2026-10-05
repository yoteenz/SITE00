/**
 * SITE 00 — canonical Identity + Builder intake API (client + guest facing).
 *
 * Follows the existing SITE 00 API convention (single resource file + `action` dispatch) rather
 * than inventing Vercel dynamic path segments this repository does not otherwise use — see
 * api/site00/marketing-engagements.ts for the established pattern.
 *
 * Guests are NEVER required to sign in. Authorization is server-authoritative: an authenticated
 * caller may only touch their own records; a guest caller must present the raw access token
 * (never trusted from body alone for anything but the initial /start and /send-access calls,
 * which do not require pre-existing access).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { isIntakeType } from '../../shared/site00-intakes/types.js';
import type { IntakeType } from '../../shared/site00-intakes/types.js';
import {
  IntakeAccessDeniedError,
  IntakeNotFoundError,
  IntakeValidationError,
  autosaveIntake,
  claimGuestIntakesForVerifiedEmail,
  getIntakeForAccess,
  listMyIntakes,
  sendGuestAccess,
  startIntake,
  submitIntake,
} from '../_lib/site00Intakes/intakeService.js';
import { resolveGuestAccessToken } from '../_lib/site00Intakes/tokens.js';
import type { IntakeAccessContext } from '../_lib/site00Intakes/authorization.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function redactForLog(body: unknown): unknown {
  if (typeof body !== 'object' || body === null) return body;
  const clone: Record<string, unknown> = { ...(body as Record<string, unknown>) };
  delete clone.draftPayload;
  delete clone.email;
  delete clone.guestToken;
  return clone;
}

/**
 * Resolves the request's access context: an authenticated Supabase session, OR a guest token
 * scoped to a specific intake. Experience/UI context never grants access (XXVI) — only one of
 * these two server-verified facts does.
 */
async function resolveContext(
  req: VercelRequest,
): Promise<{ ctx: IntakeAccessContext; userEmail: string | null }> {
  const user = await getAuthUser(req);
  if (user) return { ctx: { kind: 'AUTHENTICATED', userId: user.id }, userEmail: user.email };

  const guestToken = String(req.body?.guestToken ?? req.query.guestToken ?? '');
  if (guestToken) {
    const resolution = await resolveGuestAccessToken(guestToken);
    if (resolution.ok) {
      return {
        ctx: { kind: 'GUEST', tokenIntakeType: resolution.token.intakeType, tokenIntakeId: resolution.token.intakeId },
        userEmail: null,
      };
    }
  }
  return { ctx: { kind: 'NONE' }, userEmail: null };
}

function parseIntakeType(value: unknown): IntakeType {
  if (!isIntakeType(value)) throw new IntakeValidationError('intakeType must be IDENTITY or BUILDER');
  return value;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const action = String(req.query.action ?? '');
  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};

  try {
    if (req.method === 'GET') {
      if (action === 'list') {
        const user = await getAuthUser(req);
        if (!user) return res.status(401).json({ error: 'Sign in required to view your intakes' });
        return res.status(200).json({ intakes: await listMyIntakes(user.id) });
      }

      if (action === 'get') {
        const intakeType = parseIntakeType(req.query.intakeType);
        const id = String(req.query.id ?? '');
        if (!id) return res.status(400).json({ error: 'id required' });
        const { ctx } = await resolveContext(req);
        const intake = await getIntakeForAccess(intakeType, id, ctx.kind === 'NONE' ? { kind: 'ANONYMOUS_DIRECT' } : ctx);
        return res.status(200).json({ intake });
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    if (req.method === 'POST') {
      const postAction = String(body.action ?? action);

      if (postAction === 'start') {
        const intakeType = parseIntakeType(body.intakeType);
        const user = await getAuthUser(req);
        const intake = await startIntake({
          intakeType,
          domainLabel: String(body.domainLabel ?? 'unspecified'),
          userId: user?.id ?? null,
          email: user?.email ?? body.email ?? null,
          sourceRoute: body.sourceRoute ? String(body.sourceRoute) : null,
          draftPayload: body.draftPayload && typeof body.draftPayload === 'object' ? body.draftPayload : {},
        });
        return res.status(200).json({ intake });
      }

      if (postAction === 'claim') {
        const user = await getAuthUser(req);
        if (!user?.email) return res.status(401).json({ error: 'Sign in required to claim an intake' });
        const claimed = await claimGuestIntakesForVerifiedEmail(user.id, user.email);
        return res.status(200).json({ claimed });
      }

      const intakeType = parseIntakeType(body.intakeType);
      const id = String(body.id ?? '');
      if (!id) return res.status(400).json({ error: 'id required' });
      const { ctx: resolvedCtx } = await resolveContext(req);
      const ctx: IntakeAccessContext = resolvedCtx.kind === 'NONE' ? { kind: 'ANONYMOUS_DIRECT' } : resolvedCtx;

      switch (postAction) {
        case 'update': {
          const intake = await autosaveIntake(intakeType, id, ctx, {
            currentStep: body.currentStep !== undefined ? String(body.currentStep) : undefined,
            totalSteps: body.totalSteps !== undefined ? Number(body.totalSteps) : undefined,
            draftPayload: body.draftPayload && typeof body.draftPayload === 'object' ? body.draftPayload : undefined,
            email: body.email !== undefined ? String(body.email) : undefined,
          });
          return res.status(200).json({ intake });
        }
        case 'submit': {
          const intake = await submitIntake(intakeType, id, ctx, {
            requiredFields: Array.isArray(body.requiredFields) ? body.requiredFields.map(String) : undefined,
          });
          return res.status(200).json({ intake });
        }
        case 'send-access': {
          const result = await sendGuestAccess(intakeType, id, ctx, { email: String(body.email ?? '') });
          return res.status(200).json({
            intake: result.intake,
            accessToken: result.rawToken,
            expiresAt: result.expiresAt,
          });
        }
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    if (e instanceof IntakeAccessDeniedError) return res.status(403).json({ error: 'Access denied' });
    if (e instanceof IntakeNotFoundError) return res.status(404).json({ error: 'Intake not found' });
    if (e instanceof IntakeValidationError) return res.status(400).json({ error: e.message });
    console.error('[site00/intakes]', e instanceof Error ? e.message : e, redactForLog(body));
    return res.status(500).json({ error: 'We could not complete this operation. Try again.' });
  }
}
