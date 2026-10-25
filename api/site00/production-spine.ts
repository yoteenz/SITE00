import type { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'node:path';
import { FOUNDER_PRIVILEGED_ADMIN_EMAIL, resolveAdminAuth } from '../_lib/adminAuth.js';
import { FOUNDER_ACTOR } from '../../shared/site00-fiction-production/approvals.js';
import { MediaSigner, parseStorageRef, type MediaStore } from '../../shared/site00-production-spine/media.js';
import { FfmpegFrameExtractor, FfprobeMediaProbe } from '../../shared/site00-production-spine/node/ffmpeg.js';
import { jsonFileStore } from '../../shared/site00-production-spine/node/jsonStore.js';
import { LocalPrivateMediaStore } from '../../shared/site00-production-spine/node/localMedia.js';
import { planSpineStore, type StorePlan } from '../../shared/site00-production-spine/node/storeSelection.js';
import { SupabasePrivateMediaStore, type StorageClient } from '../../shared/site00-production-spine/node/supabaseMedia.js';
import { SupabaseRpcBackend, type SpineRpcClient } from '../../shared/site00-production-spine/node/supabaseStore.js';
import { can, isProjectRole, type Permission } from '../../shared/site00-production-spine/permissions.js';
import { spineProject } from '../../shared/site00-production-spine/projects/index.js';
import { OpenArtAgentSessionTransport, type ProviderTransport } from '../../shared/site00-production-spine/providers.js';
import { ProductionRunner } from '../../shared/site00-production-spine/runner.js';
import { ScopedRecordStore, type RecordStore } from '../../shared/site00-production-spine/store.js';
import { SpineError, TAKE_ACTIONS, type Actor, type ProjectRole, type TakeAction } from '../../shared/site00-production-spine/types.js';
import { buildTakesWorkspace, type ProjectSpineRefs } from '../../shared/site00-production-spine/workspace.js';
import { getSupabaseAdminServiceRole } from '../_lib/supabase.js';

/**
 * Production record spine API (EXPRESSION → CAST + PERFORMANCE → TAKES).
 *
 *   GET  ?action=workspace&project=<id>                 the Takes workspace for a signed-in project member
 *   GET  ?action=media&project&ref&exp&sig             a signed, expiring read of a private master (no session needed)
 *   POST {action:'take-decision', project, takeId, decision, note}
 *   POST {action:'continuity-review', project, takeId, status, note, findings}
 *   POST {action:'extract-frame', project, takeId, frameIndex, purpose, inspectionOnly}
 *   POST {action:'dispatch', project, jobId}           runs the spend gate; provider execution is disabled
 *
 * Every request is scoped to one project, and the caller's role comes from that project (the founder, or a row in
 * site00_spine_members); an admin who is not a member is refused. There is no endpoint that authorizes generation or a
 * budget: D-11 is not granted.
 */

export type SpineContext = { store: RecordStore; media: MediaStore; runner: ProductionRunner; refs: ProjectSpineRefs };
export type SpineAuth = { ok: true; actor: Actor } | { ok: false; status: number; error: string; code: string };
export type SpineHandlerDeps = {
  /** Identifies the caller and resolves their role on this project. */
  authenticate(req: VercelRequest, projectId: string): Promise<SpineAuth>;
  open(projectId: string): Promise<SpineContext | null>;
  signer: MediaSigner;
  now(): string;
};

/** What each action needs; checked before any work is done (the runner checks again before any record changes). */
const ACTION_PERMISSION: Record<string, Permission> = {
  workspace: 'VIEW',
  'take-decision': 'VIEW', // the decision itself is checked against the role table in the runner and the database
  'continuity-review': 'REVIEW_CONTINUITY',
  'extract-frame': 'REVIEW_CONTINUITY', // inspection frames; a canonical frame needs EXTRACT_FRAME (checked in the runner)
  dispatch: 'DISPATCH',
};

const STATUS: Record<string, number> = {
  FORBIDDEN: 403,
  NOT_A_PROJECT_MEMBER: 403,
  STORE_FORBIDDEN: 503,
  STORE_UNAVAILABLE: 503,
  STORE_SCHEMA_MISSING: 503,
  STORE_NOT_CONFIGURED: 503,
  PRODUCTION_STORE_NOT_APPROVED: 503,
  ENVIRONMENT_MISMATCH: 503,
  FIXTURE_STORE_IN_PRODUCTION: 503,
  FIXTURE_ROOT_IN_REPOSITORY: 503,
  REFERENCE_NOT_FOUND: 409,
  CONSTRAINT_VIOLATION: 409,
  IMMUTABLE_RECORD: 409,
  FINDINGS_REQUIRED: 400,
  FINDINGS_TOO_LONG: 400,
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
        // A link reads only media this project's records still name; an object the records no longer name is revoked.
        if (parseStorageRef(ref).projectId !== ctx.store.projectId || !(await ctx.store.list('ASSET')).some((a) => a.storageRef === ref)) throw new SpineError('MEDIA_NOT_FOUND', 'no asset of this project holds that media');
        const bytes = await ctx.media.read(ref);
        const ext = ref.split('.').pop();
        res.setHeader('Content-Type', ext === 'mp4' ? 'video/mp4' : ext === 'png' ? 'image/png' : ext === 'jpg' ? 'image/jpeg' : 'application/octet-stream');
        res.setHeader('Content-Length', String(bytes.byteLength));
        return res.status(200).end(Buffer.from(bytes));
      }

      const auth = await deps.authenticate(req, projectId);
      if (!auth.ok) return res.status(auth.status).json({ ok: false, code: auth.code, error: auth.error });
      const ctx = await deps.open(projectId);
      if (!ctx) return res.status(404).json({ ok: false, code: 'NOT_A_SPINE_PROJECT', error: `${projectId || '(none)'} has no production record spine` });
      const { runner, store, media, refs } = ctx;
      const need = ACTION_PERMISSION[action];
      if (need && !can(auth.actor.role, need)) return res.status(403).json({ ok: false, code: 'FORBIDDEN', error: `${action} needs ${need}; ${auth.actor.id} is ${auth.actor.role}` });

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
          const findings = Array.isArray(body.findings) ? body.findings.filter((f): f is string => typeof f === 'string') : [];
          return res.status(200).json({ ok: true, take: await runner.reviewContinuity(String(body.takeId), status, auth.actor, note, findings) });
        }
        case 'extract-frame': {
          const cref = await runner.extractFrame(String(body.takeId), Number(body.frameIndex), auth.actor, { purpose: String(body.purpose ?? 'continuity reference'), inspectionOnly: body.inspectionOnly === true });
          return res.status(200).json({ ok: true, continuityReference: cref });
        }
        case 'dispatch': {
          const out = await runner.dispatch(String(body.jobId), auth.actor);
          const code = out.outcome === 'SUBMITTED' ? 202 : out.outcome === 'DUPLICATE_IDEMPOTENT' ? 200 : out.outcome === 'BLOCKED' ? 409 : out.outcome === 'RECONCILIATION_REQUIRED' ? 202 : 502;
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

type Opened = { ctx: SpineContext; memberRole(userId: string): Promise<ProjectRole | null> };
const OPEN = new Map<string, Promise<Opened>>();

function storeError(plan: Extract<StorePlan, { ok: false }>): SpineError {
  return new SpineError(plan.code, plan.error);
}

/** Opens a project's record and media stores exactly as the plan says. Nothing falls back to another store. */
async function openProject(projectId: string): Promise<Opened> {
  const project = spineProject(projectId)!;
  const plan = planSpineStore(process.env, REPO_ROOT);
  if (!plan.ok) throw storeError(plan);
  let store: RecordStore;
  let media: MediaStore;
  let memberRole: Opened['memberRole'] = async () => null;
  if (plan.mode === 'supabase') {
    const client = getSupabaseAdminServiceRole();
    const backend = new SupabaseRpcBackend(client as unknown as SpineRpcClient, project.projectId, plan.label);
    await backend.probe(); // schema present and the key is service_role, or STORE_UNAVAILABLE / STORE_SCHEMA_MISSING
    store = new ScopedRecordStore(backend, { projectId: project.projectId, live: true });
    const supa = new SupabasePrivateMediaStore(client.storage as unknown as StorageClient, plan.bucket);
    await supa.assertPrivateBucket(); // the bucket exists and is private, or BUCKET_UNAVAILABLE / PUBLIC_BUCKET_REFUSED
    media = supa;
    memberRole = async (userId) => {
      const r = await backend.memberRole(userId);
      return isProjectRole(r) ? r : null;
    };
  } else if (plan.mode === 'fixture') {
    store = jsonFileStore(path.join(plan.root, 'records'), { projectId: project.projectId, live: false });
    media = new LocalPrivateMediaStore(path.join(plan.root, 'media'), { repoRoot: REPO_ROOT, live: false, signer: SIGNER });
  } else {
    store = jsonFileStore(path.join(REPO_ROOT, project.recordsDir), { projectId: project.projectId, live: true, readOnly: plan.readOnlyReason });
    // No durable media store either: nothing can be captured, so nothing is written anywhere temporary.
    media = { adapter: 'LOCAL_PRIVATE', bucket: 'none', live: true, put: async () => Promise.reject(new SpineError('STORE_READ_ONLY', plan.readOnlyReason)), read: async () => Promise.reject(new SpineError('MEDIA_NOT_FOUND', 'no media store configured')), verify: async () => ({ ok: false, actual: null }), signRead: async () => Promise.reject(new SpineError('MEDIA_NOT_FOUND', 'no media store configured')) };
  }
  // The only real route. With no agent-session executor attached it reports DISABLED and refuses every call.
  const openart = new OpenArtAgentSessionTransport(process.env);
  const transports: Record<string, ProviderTransport> = Object.fromEntries(project.routeIds.map((r) => [r, openart]));
  const status = openart.status();
  const providers = project.providers(() => ({ execution: status.enabled ? 'ENABLED' : 'DISABLED', reason: status.reason, transportId: openart.transportId }));
  const runner = new ProductionRunner({ store, media, transports, routeIds: project.routeIds, sceneGate: project.sceneGate(REPO_ROOT), probe: new FfprobeMediaProbe(), extractor: new FfmpegFrameExtractor(), clock: () => new Date().toISOString() });
  return { ctx: { store, media, runner, refs: project.refs(REPO_ROOT, providers) }, memberRole };
}

function opened(projectId: string): Promise<Opened> | null {
  if (!spineProject(projectId)) return null;
  let p = OPEN.get(projectId);
  if (!p) {
    p = openProject(projectId);
    OPEN.set(projectId, p);
    p.catch(() => OPEN.delete(projectId)); // a failed open is retried next request, never replaced by a fallback
  }
  return p;
}

async function open(projectId: string): Promise<SpineContext | null> {
  const p = opened(projectId);
  return p ? (await p).ctx : null;
}

async function authenticate(req: VercelRequest, projectId: string): Promise<SpineAuth> {
  const auth = await resolveAdminAuth(req);
  if (!auth.ok) return { ok: false, status: auth.failure.status, error: auth.failure.error, code: auth.failure.code };
  if (auth.user.email.trim().toLowerCase() === FOUNDER_PRIVILEGED_ADMIN_EMAIL) return { ok: true, actor: { id: FOUNDER_ACTOR, role: 'FOUNDER' } };
  const p = opened(projectId);
  const role = p ? await (await p).memberRole(auth.user.id) : null;
  if (!role) return { ok: false, status: 403, error: `${auth.user.email} is not a member of ${projectId}`, code: 'NOT_A_PROJECT_MEMBER' };
  return { ok: true, actor: { id: `user:${auth.user.id}`, role } };
}

export default createProductionSpineHandler({ authenticate, open, signer: SIGNER, now: () => new Date().toISOString() });
