import type { VercelRequest, VercelResponse } from '@vercel/node';
import os from 'node:os';
import path from 'node:path';
import { FOUNDER_PRIVILEGED_ADMIN_EMAIL, resolveAdminAuth } from '../_lib/adminAuth.js';
import { FOUNDER_ACTOR } from '../../shared/site00-fiction-production/approvals.js';
import { MediaSigner, type MediaStore } from '../../shared/site00-production-spine/media.js';
import { FfmpegFrameExtractor, FfprobeMediaProbe } from '../../shared/site00-production-spine/node/ffmpeg.js';
import { jsonFileStore } from '../../shared/site00-production-spine/node/jsonStore.js';
import { LocalPrivateMediaStore } from '../../shared/site00-production-spine/node/localMedia.js';
import { SupabasePrivateMediaStore, type StorageClient } from '../../shared/site00-production-spine/node/supabaseMedia.js';
import { spineProject } from '../../shared/site00-production-spine/projects/index.js';
import { OpenArtAgentSessionTransport, type ProviderTransport } from '../../shared/site00-production-spine/providers.js';
import { ProductionRunner } from '../../shared/site00-production-spine/runner.js';
import type { RecordStore } from '../../shared/site00-production-spine/store.js';
import { SpineError, TAKE_ACTIONS, type Actor, type TakeAction } from '../../shared/site00-production-spine/types.js';
import { buildTakesWorkspace, type ProjectSpineRefs } from '../../shared/site00-production-spine/workspace.js';
import { getSupabaseAdminServiceRole } from '../_lib/supabase.js';
import { resolvePersistencePolicyMode } from '../../shared/site00-studio-world-execution/persistencePolicy.js';

/**
 * Production record spine API (EXPRESSION → CAST + PERFORMANCE → TAKES).
 *
 *   GET  ?action=workspace&project=<id>                 the Takes workspace for the signed-in founder or reviewer
 *   GET  ?action=media&project&ref&exp&sig             a signed, expiring read of a private master (no session needed)
 *   POST {action:'take-decision', project, takeId, decision, note}
 *   POST {action:'continuity-review', project, takeId, status, note}
 *   POST {action:'extract-frame', project, takeId, frameIndex, purpose, inspectionOnly}
 *   POST {action:'dispatch', project, jobId}           runs the spend gate; provider execution is disabled
 *
 * There is no endpoint that authorizes generation or a budget: D-11 is not granted.
 */

export type SpineContext = { store: RecordStore; media: MediaStore; runner: ProductionRunner; refs: ProjectSpineRefs };
export type SpineAuth = { ok: true; actor: Actor } | { ok: false; status: number; error: string; code: string };
export type SpineHandlerDeps = {
  authenticate(req: VercelRequest): Promise<SpineAuth>;
  open(projectId: string): Promise<SpineContext | null>;
  signer: MediaSigner;
  now(): string;
};

const STATUS: Record<string, number> = {
  FORBIDDEN: 403,
  CROSS_PROJECT_DENIED: 403,
  NOT_FOUND: 404,
  MEDIA_NOT_FOUND: 404,
  ILLEGAL_TRANSITION: 409,
  SELECTION_CONFLICT: 409,
  CONFLICT: 409,
  TAKE_NOT_APPROVED: 409,
  MEDIA_UNVERIFIED: 409,
  STORE_READ_ONLY: 503,
  SIGNED_READ_EXPIRED: 403,
  SIGNED_READ_INVALID: 403,
};

const one = (v: unknown) => (Array.isArray(v) ? v[0] : v) as string | undefined;

function fail(res: VercelResponse, e: unknown) {
  if (e instanceof SpineError) return res.status(STATUS[e.code] ?? 400).json({ ok: false, code: e.code, error: e.message });
  return res.status(500).json({ ok: false, code: 'INTERNAL', error: e instanceof Error ? e.message : String(e) });
}

export function createProductionSpineHandler(deps: SpineHandlerDeps) {
  return async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Cache-Control', 'private, no-store');
    if (req.method === 'OPTIONS') return res.status(204).end();
    const body = (req.body ?? {}) as Record<string, unknown>;
    const action = String(one(req.query.action) ?? body.action ?? '');
    const projectId = String(one(req.query.project) ?? body.project ?? '').toLowerCase();

    try {
      if (req.method === 'GET' && action === 'media') {
        // The signature is the authorization: it names the project and the object, and expires within minutes.
        const ref = deps.signer.check({ project: projectId, ref: one(req.query.ref), exp: one(req.query.exp), sig: one(req.query.sig) }, deps.now());
        const ctx = await deps.open(projectId);
        if (!ctx) return res.status(404).json({ ok: false, code: 'NOT_A_SPINE_PROJECT' });
        const bytes = await ctx.media.read(ref);
        const ext = ref.split('.').pop();
        res.setHeader('Content-Type', ext === 'mp4' ? 'video/mp4' : ext === 'png' ? 'image/png' : ext === 'jpg' ? 'image/jpeg' : 'application/octet-stream');
        res.setHeader('Content-Length', String(bytes.byteLength));
        return res.status(200).end(Buffer.from(bytes));
      }

      const auth = await deps.authenticate(req);
      if (!auth.ok) return res.status(auth.status).json({ ok: false, code: auth.code, error: auth.error });
      const ctx = await deps.open(projectId);
      if (!ctx) return res.status(404).json({ ok: false, code: 'NOT_A_SPINE_PROJECT', error: `${projectId || '(none)'} has no production record spine` });
      const { runner, store, media, refs } = ctx;

      if (req.method === 'GET' && action === 'workspace') {
        return res.status(200).json({ ok: true, workspace: await buildTakesWorkspace({ refs, store, media, runner, viewer: auth.actor, now: deps.now() }) });
      }
      if (req.method !== 'POST') return res.status(405).json({ ok: false, code: 'METHOD', error: `${req.method} ${action}` });

      const note = typeof body.note === 'string' && body.note.trim() ? body.note.trim().slice(0, 2000) : null;
      switch (action) {
        case 'take-decision': {
          const decision = String(body.decision) as TakeAction;
          if (!TAKE_ACTIONS.includes(decision)) return res.status(400).json({ ok: false, code: 'BAD_DECISION', error: `decision must be one of ${TAKE_ACTIONS.join(', ')}` });
          const take = await runner.decideTake(String(body.takeId), decision, auth.actor, { note });
          return res.status(200).json({ ok: true, take });
        }
        case 'continuity-review': {
          const status = String(body.status);
          if (status !== 'PASS' && status !== 'ISSUES') return res.status(400).json({ ok: false, code: 'BAD_STATUS', error: 'status must be PASS or ISSUES' });
          return res.status(200).json({ ok: true, take: await runner.reviewContinuity(String(body.takeId), status, auth.actor, note) });
        }
        case 'extract-frame': {
          const cref = await runner.extractFrame(String(body.takeId), Number(body.frameIndex), auth.actor, { purpose: String(body.purpose ?? 'continuity reference'), inspectionOnly: body.inspectionOnly === true });
          return res.status(200).json({ ok: true, continuityReference: cref });
        }
        case 'dispatch': {
          if (auth.actor.role !== 'FOUNDER') return res.status(403).json({ ok: false, code: 'FORBIDDEN', error: 'only the founder dispatches generation' });
          const out = await runner.dispatch(String(body.jobId));
          const code = out.outcome === 'SUBMITTED' ? 202 : out.outcome === 'DUPLICATE_IDEMPOTENT' ? 200 : out.outcome === 'BLOCKED' ? 409 : 502;
          return res.status(code).json({ ok: out.outcome === 'SUBMITTED' || out.outcome === 'DUPLICATE_IDEMPOTENT', ...out });
        }
        default:
          return res.status(400).json({ ok: false, code: 'UNKNOWN_ACTION', error: action || '(none)' });
      }
    } catch (e) {
      return fail(res, e);
    }
  };
}

/* ── default wiring ─────────────────────────────────────────────────────────────────────────────────── */

const REPO_ROOT = path.resolve(process.cwd());
const SIGNER = new MediaSigner(process.env.SITE00_MEDIA_SIGNING_SECRET?.trim() || null);

async function authenticate(req: VercelRequest): Promise<SpineAuth> {
  const auth = await resolveAdminAuth(req);
  if (!auth.ok) return { ok: false, status: auth.failure.status, error: auth.failure.error, code: auth.failure.code };
  const founder = auth.user.email.trim().toLowerCase() === FOUNDER_PRIVILEGED_ADMIN_EMAIL;
  return { ok: true, actor: founder ? { id: FOUNDER_ACTOR, role: 'FOUNDER' } : { id: `reviewer:${auth.user.id}`, role: 'REVIEWER' } };
}

function mediaStore(live: boolean, fixtureRoot: string | null): MediaStore {
  const bucket = process.env.SITE00_PRODUCTION_MEDIA_BUCKET?.trim();
  if (live && bucket && process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim())
    return new SupabasePrivateMediaStore(getSupabaseAdminServiceRole().storage as unknown as StorageClient, bucket);
  const root = fixtureRoot ? path.join(fixtureRoot, 'media') : process.env.SITE00_PRIVATE_MEDIA_ROOT?.trim() || path.join(os.tmpdir(), 'site00-private-media');
  return new LocalPrivateMediaStore(root, { repoRoot: REPO_ROOT, live, signer: SIGNER });
}

async function open(projectId: string): Promise<SpineContext | null> {
  const project = spineProject(projectId);
  if (!project) return null;
  // Development only: a fixture root outside the repository serves clearly marked test records instead of the live catalogue.
  const fixtureRoot = process.env.NODE_ENV !== 'production' ? process.env.SITE00_PRODUCTION_SPINE_FIXTURE_ROOT?.trim() || null : null;
  if (fixtureRoot && path.resolve(fixtureRoot).startsWith(REPO_ROOT + path.sep)) throw new SpineError('FIXTURE_ROOT_IN_REPOSITORY', 'test fixtures never live in the repository');
  const durableRequired = resolvePersistencePolicyMode() === 'PRODUCTION_DURABLE_REQUIRED';
  const store = fixtureRoot
    ? jsonFileStore(path.join(fixtureRoot, 'records'), { projectId: project.projectId, live: false })
    : jsonFileStore(path.join(REPO_ROOT, project.recordsDir), {
        projectId: project.projectId,
        live: true,
        // Repository JSON is pilot persistence (D-03). A deployed server's checkout is not durable, so it only reads.
        readOnly: durableRequired ? 'DURABLE_PERSISTENCE_UNAVAILABLE: repository JSON is read-only in production until a durable record store is provisioned' : false,
      });
  const media = mediaStore(!fixtureRoot, fixtureRoot);
  // The only real route. With no agent-session executor attached it reports DISABLED and refuses every call.
  const openart = new OpenArtAgentSessionTransport(process.env);
  const transports: Record<string, ProviderTransport> = Object.fromEntries(project.routeIds.map((r) => [r, openart]));
  const status = openart.status();
  const providers = project.providers(() => ({ execution: status.enabled ? 'ENABLED' : 'DISABLED', reason: status.reason, transportId: openart.transportId }));
  const runner = new ProductionRunner({ store, media, transports, sceneGate: project.sceneGate(REPO_ROOT), probe: new FfprobeMediaProbe(), extractor: new FfmpegFrameExtractor(), clock: () => new Date().toISOString() });
  return { store, media, runner, refs: project.refs(REPO_ROOT, providers) };
}

export default createProductionSpineHandler({ authenticate, open, signer: SIGNER, now: () => new Date().toISOString() });
