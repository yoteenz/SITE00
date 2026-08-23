import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getClientProjectsPayload } from '../_lib/site00Production/clientStudio.js';
import { getSite00ProjectsIndexPayload, resolveSite00Project } from '../_lib/site00Projects/projectResolver.js';
import { isFounderProjectSlug } from '../_lib/site00Projects/projectRegistry.js';
import {
  canAccessFounderProjectAsOwner,
  canAccessFounderProjectIndex,
} from '../_lib/site00Access/accessModel.js';
import {
  getCreativeDirectionPayload,
  recordFounderDecision,
} from '../_lib/site00Evolve/creativeDirection/engagementService.js';
import { orgIdFromSlug } from '../_lib/site00Evolve/orgRegistry.js';
import { submitOrgLoreCalibration, getOrReconcileBrandLoreForOrg } from '../_lib/site00BrandLore/loreService.js';
import {
  getOrCreateActivePersonalityReplay,
  saveReplayPersonalityAnswers,
  completeReplayPersonalityIntake,
  resolvePersonalityReplayResumeStepId,
  getPersonalityReplay,
  executePersonalityReplayDownstream,
  getReplayExecutionDiagnosticForId,
} from '../_lib/site00Evolve/creativeDirection/personalityReplay/replayService.js';
import {
  executeSixDirectionConsistencyValidation,
  setSixDirectionFounderJudgment,
} from '../_lib/site00Evolve/creativeDirection/personalityReplay/sixDirectionConsistencyService.js';
import {
  executeCanonicalCreativeRangeValidation,
  getCanonicalCreativeRangeRun,
  getCanonicalRangePreflight,
  setCanonicalRangeFounderJudgment,
} from '../_lib/site00Evolve/creativeDirection/canonicalCreativeRange/canonicalCreativeRangeService.js';
import {
  executeCanonicalCarouselExpansion,
  getCarouselExpansionPreflight,
  getCanonicalCarouselExpansionRun,
  setCarouselDirectionFounderVerdict,
  setCarouselSlideFounderJudgment,
} from '../_lib/site00Evolve/creativeDirection/canonicalCarouselExpansion/canonicalCarouselExpansionService.js';
import type { CarouselExecuteMode } from '../../shared/site00-brand-lore/canonicalCarouselExpansionTypes.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function json(res: VercelResponse, status: number, payload: unknown): void {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.json(payload);
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

/** Authenticated project index + canonical client project-owner API */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'POST') {
    return json(res, 405, {
      ok: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' },
      source: 'site00_project_resolver',
    });
  }

  const user = await getAuthUser(req);
  if (!user?.email) {
    return json(res, 401, {
      ok: false,
      error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
      source: 'site00_project_resolver',
    });
  }

  const action = String(req.query.action ?? (req.method === 'POST' ? parseBody(req)?.action : '') ?? 'index');

  try {
    switch (action) {
      case 'index': {
        const clientPayload = await getClientProjectsPayload(user.email, user.id);
        const clientProjects = (clientPayload.projects ?? [])
          .filter((p) => !isFounderProjectSlug(p.slug))
          .map((p) => ({ id: p.id, slug: p.slug, name: p.name, studioRoute: p.studioRoute }));

        if (!canAccessFounderProjectIndex(user.email)) {
          return json(res, 200, {
            ok: true,
            projects: [],
            source: 'site00_project_resolver',
            summary: {
              total: clientProjects.length,
              founderIndex: 0,
              clientProjects: clientProjects.length,
              partial: 0,
            },
            clientProjects,
          });
        }

        const payload = await getSite00ProjectsIndexPayload(clientProjects);
        return json(res, 200, payload);
      }
      case 'detail': {
        const slug = String(req.query.slug ?? '');
        if (!slug) {
          return json(res, 400, {
            ok: false,
            error: { code: 'SLUG_REQUIRED', message: 'slug required' },
            source: 'site00_project_resolver',
          });
        }
        if (isFounderProjectSlug(slug) && !canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_project_resolver',
          });
        }
        const detail = await resolveSite00Project(slug);
        if (!detail) {
          return json(res, 404, {
            ok: false,
            error: { code: 'NOT_FOUND', message: 'Project not found' },
            source: 'site00_project_resolver',
          });
        }
        return json(res, 200, { ok: true, project: detail, source: 'site00_project_resolver' });
      }
      case 'creative_direction': {
        const slug = String(req.query.slug ?? '');
        if (!slug) {
          return json(res, 400, {
            ok: false,
            error: { code: 'SLUG_REQUIRED', message: 'slug required' },
            source: 'site00_project_resolver',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_project_resolver',
          });
        }
        const payload = await getCreativeDirectionPayload(slug);
        const orgId = orgIdFromSlug(slug);
        const loreProfile = orgId ? await getOrReconcileBrandLoreForOrg(orgId, slug) : null;
        return json(res, 200, {
          ...payload,
          brandLoreCalibrationAnswers: loreProfile?.rawLoreAnswers ?? {},
        });
      }
      case 'creative_direction_decision': {
        if (req.method !== 'POST') {
          return json(res, 405, {
            ok: false,
            error: { code: 'POST_REQUIRED', message: 'POST required' },
            source: 'site00_project_resolver',
          });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        if (!slug) {
          return json(res, 400, {
            ok: false,
            error: { code: 'SLUG_REQUIRED', message: 'slug required' },
            source: 'site00_project_resolver',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_project_resolver',
          });
        }
        const type = String(body.type ?? '') as 'APPROVE' | 'REFINE' | 'HYBRIDIZE' | 'REJECT';
        if (!['APPROVE', 'REFINE', 'HYBRIDIZE', 'REJECT'].includes(type)) {
          return json(res, 400, {
            ok: false,
            error: { code: 'INVALID_DECISION', message: 'Invalid decision type' },
            source: 'site00_project_resolver',
          });
        }
        const engagement = await recordFounderDecision(slug, {
          type,
          selectedTerritoryId: body.selectedTerritoryId ? String(body.selectedTerritoryId) : undefined,
          hybridSelections: Array.isArray(body.hybridSelections)
            ? (body.hybridSelections as Array<{ territoryId: string; elements: string[] }>)
            : undefined,
          refinementNotes: body.refinementNotes ? String(body.refinementNotes) : undefined,
          rejectedTerritoryIds: Array.isArray(body.rejectedTerritoryIds)
            ? body.rejectedTerritoryIds.map(String)
            : undefined,
          by: user.email,
        });
        return json(res, 200, { ok: true, engagement, source: 'canonical_founder_decision_service' });
      }
      case 'lore_calibration_submit': {
        if (req.method !== 'POST') {
          return json(res, 405, {
            ok: false,
            error: { code: 'POST_REQUIRED', message: 'POST required' },
            source: 'site00_project_resolver',
          });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        if (!slug) {
          return json(res, 400, {
            ok: false,
            error: { code: 'SLUG_REQUIRED', message: 'slug required' },
            source: 'site00_project_resolver',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_project_resolver',
          });
        }
        const orgId = orgIdFromSlug(slug);
        if (!orgId) {
          return json(res, 400, {
            ok: false,
            error: { code: 'ORG_NOT_REGISTERED', message: 'Organization not registered' },
            source: 'site00_project_resolver',
          });
        }
        const answers = (body.answers ?? {}) as Record<string, string | string[]>;
        const personalityAnswers = (body.personalityAnswers ?? {}) as Record<string, string | string[]>;
        if (
          (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) &&
          (!personalityAnswers || Object.keys(personalityAnswers).length === 0)
        ) {
          return json(res, 400, {
            ok: false,
            error: { code: 'ANSWERS_REQUIRED', message: 'At least one calibration answer required' },
            source: 'site00_project_resolver',
          });
        }
        const { invalidateCreativeDirectionEngagement } = await import(
          '../_lib/site00Evolve/creativeDirection/engagementService.js'
        );
        await submitOrgLoreCalibration({
          orgId,
          orgSlug: slug,
          answers,
          personalityAnswers: Object.keys(personalityAnswers).length ? personalityAnswers : undefined,
        });
        // Force the next `creative_direction` read to re-resolve readiness from the just-updated
        // profile instead of returning this org's cached in-memory engagement (see engagementService.ts).
        invalidateCreativeDirectionEngagement(slug);
        const payload = await getCreativeDirectionPayload(slug);
        return json(res, 200, { ok: true, ...payload, source: 'site00_lore_calibration' });
      }
      case 'personality_calibration_submit': {
        if (req.method !== 'POST') {
          return json(res, 405, {
            ok: false,
            error: { code: 'POST_REQUIRED', message: 'POST required' },
            source: 'site00_personality_calibration',
          });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        if (!slug) {
          return json(res, 400, {
            ok: false,
            error: { code: 'SLUG_REQUIRED', message: 'slug required' },
            source: 'site00_personality_calibration',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_personality_calibration',
          });
        }
        const orgId = orgIdFromSlug(slug);
        if (!orgId) {
          return json(res, 400, {
            ok: false,
            error: { code: 'ORG_NOT_REGISTERED', message: 'Organization not registered' },
            source: 'site00_personality_calibration',
          });
        }
        const personalityAnswers = (body.personalityAnswers ?? body.answers ?? {}) as Record<
          string,
          string | string[]
        >;
        if (!personalityAnswers || Object.keys(personalityAnswers).length === 0) {
          return json(res, 400, {
            ok: false,
            error: { code: 'ANSWERS_REQUIRED', message: 'At least one personality answer required' },
            source: 'site00_personality_calibration',
          });
        }
        const { submitOrgPersonalityCalibration } = await import('../_lib/site00BrandLore/loreService.js');
        const { invalidateCreativeDirectionEngagement } = await import(
          '../_lib/site00Evolve/creativeDirection/engagementService.js'
        );
        await submitOrgPersonalityCalibration({ orgId, orgSlug: slug, personalityAnswers });
        invalidateCreativeDirectionEngagement(slug);
        const payload = await getCreativeDirectionPayload(slug);
        return json(res, 200, { ok: true, ...payload, source: 'site00_personality_calibration' });
      }
      case 'personality_replay_bootstrap': {
        const slug = String(req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, {
            ok: false,
            error: { code: 'NDXBOOK_ONLY', message: 'Personality replay is NDX BOOK only' },
            source: 'site00_personality_replay',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_personality_replay',
          });
        }
        const orgId = orgIdFromSlug(slug)!;
        const replay = await getOrCreateActivePersonalityReplay({
          organizationId: orgId,
          orgSlug: slug,
          createdBy: user.email,
        });
        const resumeStepId = resolvePersonalityReplayResumeStepId(replay.rawPersonalityAnswers);
        return json(res, 200, {
          ok: true,
          replay,
          resumeStepId,
          source: 'site00_personality_replay',
        });
      }
      case 'personality_replay_save': {
        if (req.method !== 'POST') {
          return json(res, 405, {
            ok: false,
            error: { code: 'POST_REQUIRED', message: 'POST required' },
            source: 'site00_personality_replay',
          });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        const replayId = String(body.replayId ?? '');
        if (slug !== 'ndxbook' || !replayId) {
          return json(res, 400, {
            ok: false,
            error: { code: 'INVALID_REQUEST', message: 'ndxbook slug and replayId required' },
            source: 'site00_personality_replay',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_personality_replay',
          });
        }
        const replay = await saveReplayPersonalityAnswers({
          replayId,
          answers: (body.answers ?? {}) as Record<string, string | string[]>,
          completedSteps: body.completedSteps as string[] | undefined,
        });
        return json(res, 200, { ok: true, replay, source: 'site00_personality_replay' });
      }
      case 'personality_replay_complete': {
        if (req.method !== 'POST') {
          return json(res, 405, {
            ok: false,
            error: { code: 'POST_REQUIRED', message: 'POST required' },
            source: 'site00_personality_replay',
          });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        const replayId = String(body.replayId ?? '');
        if (slug !== 'ndxbook' || !replayId) {
          return json(res, 400, {
            ok: false,
            error: { code: 'INVALID_REQUEST', message: 'ndxbook slug and replayId required' },
            source: 'site00_personality_replay',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_personality_replay',
          });
        }
        const replay = await completeReplayPersonalityIntake(replayId);
        return json(res, 200, { ok: true, replay, source: 'site00_personality_replay' });
      }
      case 'personality_replay_get': {
        const slug = String(req.query.slug ?? '');
        const replayId = String(req.query.replayId ?? '');
        if (slug !== 'ndxbook' || !replayId) {
          return json(res, 400, {
            ok: false,
            error: { code: 'INVALID_REQUEST', message: 'ndxbook slug and replayId required' },
            source: 'site00_personality_replay',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_personality_replay',
          });
        }
        const replay = await getPersonalityReplay(replayId);
        return replay
          ? json(res, 200, { ok: true, replay, source: 'site00_personality_replay' })
          : json(res, 404, {
              ok: false,
              error: { code: 'REPLAY_NOT_FOUND', message: 'Replay not found' },
              source: 'site00_personality_replay',
            });
      }
      case 'personality_replay_diagnostic': {
        const slug = String(req.query.slug ?? '');
        const replayId = String(req.query.replayId ?? '');
        if (slug !== 'ndxbook' || !replayId) {
          return json(res, 400, {
            ok: false,
            error: { code: 'INVALID_REQUEST', message: 'ndxbook slug and replayId required' },
            source: 'site00_personality_replay',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_personality_replay',
          });
        }
        const diagnostic = await getReplayExecutionDiagnosticForId(replayId);
        return diagnostic
          ? json(res, 200, { ok: true, diagnostic, source: 'site00_personality_replay' })
          : json(res, 404, {
              ok: false,
              error: { code: 'REPLAY_NOT_FOUND', message: 'Replay not found' },
              source: 'site00_personality_replay',
            });
      }
      case 'personality_replay_execute': {
        if (req.method !== 'POST') {
          return json(res, 405, {
            ok: false,
            error: { code: 'POST_REQUIRED', message: 'POST required' },
            source: 'site00_personality_replay',
          });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        const replayId = String(body.replayId ?? '');
        if (slug !== 'ndxbook' || !replayId) {
          return json(res, 400, {
            ok: false,
            error: { code: 'INVALID_REQUEST', message: 'ndxbook slug and replayId required' },
            source: 'site00_personality_replay',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_personality_replay',
          });
        }
        const existing = await getPersonalityReplay(replayId);
        if (!existing) {
          return json(res, 404, {
            ok: false,
            error: { code: 'REPLAY_NOT_FOUND', message: 'Replay not found' },
            source: 'site00_personality_replay',
          });
        }
        if (existing.status === 'COMPARISON_READY' || existing.comparisonReport) {
          return json(res, 200, { ok: true, replay: existing, source: 'site00_personality_replay' });
        }
        if (process.env.VITEST === 'true') {
          const replay = await executePersonalityReplayDownstream(replayId);
          return json(res, 200, { ok: true, replay, source: 'site00_personality_replay' });
        }
        void executePersonalityReplayDownstream(replayId).catch((err) => {
          console.error('[personality-replay] resume execution failed', err);
        });
        const replay = await getPersonalityReplay(replayId);
        return json(res, 202, { ok: true, replay, source: 'site00_personality_replay' });
      }
      case 'personality_replay_six_direction_execute': {
        if (req.method !== 'POST') {
          return json(res, 405, {
            ok: false,
            error: { code: 'POST_REQUIRED', message: 'POST required' },
            source: 'site00_personality_replay',
          });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        const replayId = String(body.replayId ?? '');
        if (slug !== 'ndxbook' || !replayId) {
          return json(res, 400, {
            ok: false,
            error: { code: 'INVALID_REQUEST', message: 'ndxbook slug and replayId required' },
            source: 'site00_personality_replay',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_personality_replay',
          });
        }
        const existing = await getPersonalityReplay(replayId);
        if (!existing) {
          return json(res, 404, {
            ok: false,
            error: { code: 'REPLAY_NOT_FOUND', message: 'Replay not found' },
            source: 'site00_personality_replay',
          });
        }
        if (existing.sixDirectionConsistency?.status === 'COMPLETE') {
          return json(res, 200, { ok: true, replay: existing, source: 'site00_personality_replay' });
        }
        if (process.env.VITEST === 'true') {
          const replay = await executeSixDirectionConsistencyValidation(replayId);
          return json(res, 200, { ok: true, replay, source: 'site00_personality_replay' });
        }
        void executeSixDirectionConsistencyValidation(replayId).catch((err) => {
          console.error('[personality-replay] six-direction consistency failed', err);
        });
        const replay = await getPersonalityReplay(replayId);
        return json(res, 202, { ok: true, replay, source: 'site00_personality_replay' });
      }
      case 'personality_replay_six_direction_judgment': {
        if (req.method !== 'POST') {
          return json(res, 405, {
            ok: false,
            error: { code: 'POST_REQUIRED', message: 'POST required' },
            source: 'site00_personality_replay',
          });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const replayId = String(body.replayId ?? '');
        const comparisonIndex = Number(body.comparisonIndex ?? 0);
        const judgment = body.judgment as 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_NDXBOOK' | null;
        if (slug !== 'ndxbook' || !replayId || !comparisonIndex) {
          return json(res, 400, {
            ok: false,
            error: { code: 'INVALID_REQUEST', message: 'slug, replayId, comparisonIndex required' },
            source: 'site00_personality_replay',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_personality_replay',
          });
        }
        const replay = await setSixDirectionFounderJudgment({ replayId, comparisonIndex, judgment });
        return json(res, 200, { ok: true, replay, source: 'site00_personality_replay' });
      }
      case 'canonical_creative_range_preflight': {
        if (req.method !== 'GET' && req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'GET or POST required' } });
        }
        const slug = String(req.query.slug ?? parseBody(req)?.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const preflight = await getCanonicalRangePreflight();
        return json(res, 200, { ok: true, preflight, source: 'site00_canonical_creative_range' });
      }
      case 'canonical_creative_range_get': {
        const slug = String(req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await getCanonicalCreativeRangeRun();
        return json(res, 200, { ok: true, run, source: 'site00_canonical_creative_range' });
      }
      case 'canonical_creative_range_execute': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const existing = await getCanonicalCreativeRangeRun();
        if (existing?.status === 'COMPLETE') {
          return json(res, 200, { ok: true, run: existing, source: 'site00_canonical_creative_range' });
        }
        if (process.env.VITEST === 'true') {
          const run = await executeCanonicalCreativeRangeValidation();
          return json(res, 200, { ok: true, run, source: 'site00_canonical_creative_range' });
        }
        void executeCanonicalCreativeRangeValidation().catch((err) => {
          console.error('[canonical-creative-range] execute failed', err);
        });
        const run = await getCanonicalCreativeRangeRun();
        return json(res, 202, { ok: true, run, source: 'site00_canonical_creative_range' });
      }
      case 'canonical_creative_range_judgment': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const comparisonIndex = Number(body.comparisonIndex ?? 0);
        const judgment = body.judgment as 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_NDXBOOK' | null;
        if (slug !== 'ndxbook' || !comparisonIndex) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await setCanonicalRangeFounderJudgment({ comparisonIndex, judgment });
        return json(res, 200, { ok: true, run, source: 'site00_canonical_creative_range' });
      }
      case 'canonical_carousel_expansion_preflight': {
        if (req.method !== 'GET' && req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'GET or POST required' } });
        }
        const slug = String(req.query.slug ?? parseBody(req)?.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const preflight = await getCarouselExpansionPreflight();
        return json(res, 200, { ok: true, preflight, source: 'site00_canonical_carousel_expansion' });
      }
      case 'canonical_carousel_expansion_get': {
        const slug = String(req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await getCanonicalCarouselExpansionRun();
        return json(res, 200, { ok: true, run, source: 'site00_canonical_carousel_expansion' });
      }
      case 'canonical_carousel_expansion_execute': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        const mode = String(body.mode ?? 'ALL_REMAINING') as CarouselExecuteMode;
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        if (process.env.VITEST === 'true') {
          const run = await executeCanonicalCarouselExpansion({ mode });
          return json(res, 200, { ok: true, run, source: 'site00_canonical_carousel_expansion' });
        }
        void executeCanonicalCarouselExpansion({ mode }).catch((err) => {
          console.error('[canonical-carousel-expansion] execute failed', err);
        });
        const run = await getCanonicalCarouselExpansionRun();
        return json(res, 202, { ok: true, run, source: 'site00_canonical_carousel_expansion' });
      }
      case 'canonical_carousel_expansion_slide_judgment': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const comparisonIndex = Number(body.comparisonIndex ?? 0);
        const slideNumber = Number(body.slideNumber ?? 0);
        const judgment = body.judgment as 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_FOR_ME' | null;
        if (slug !== 'ndxbook' || !comparisonIndex || !slideNumber) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await setCarouselSlideFounderJudgment({ comparisonIndex, slideNumber, judgment });
        return json(res, 200, { ok: true, run, source: 'site00_canonical_carousel_expansion' });
      }
      case 'canonical_carousel_expansion_direction_verdict': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const comparisonIndex = Number(body.comparisonIndex ?? 0);
        const verdict = body.verdict as
          | 'LOVE_THIS_DIRECTION'
          | 'KEEP_IN_CONTENTION'
          | 'BEAUTIFUL_BUT_TOO_NARROW'
          | 'TOO_REPETITIVE'
          | 'NOT_NDXBOOK'
          | null;
        const note = body.note as string | null | undefined;
        if (slug !== 'ndxbook' || !comparisonIndex) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await setCarouselDirectionFounderVerdict({ comparisonIndex, verdict, note });
        return json(res, 200, { ok: true, run, source: 'site00_canonical_carousel_expansion' });
      }
      default:
        return json(res, 400, {
          ok: false,
          error: { code: 'UNKNOWN_ACTION', message: 'Unknown action' },
          source: 'site00_project_resolver',
        });
    }
  } catch (e) {
    console.error('[api/site00/projects]', e);
    const msg = e instanceof Error ? e.message : 'Internal error';
    if (msg === 'Replay not found') {
      return json(res, 404, {
        ok: false,
        error: { code: 'REPLAY_NOT_FOUND', message: msg },
        source: 'site00_personality_replay',
      });
    }
    return json(res, 500, {
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: msg },
      source: 'site00_project_resolver',
    });
  }
}
