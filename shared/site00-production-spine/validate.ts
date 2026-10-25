import { z } from 'zod';
import { APPROVAL_KINDS, JOB_STATES, SPINE_SCHEMA_VERSION, SpineError, TAKE_DECISION_STATES, TEST_FIXTURE, type AnyRecord, type StoredKind } from './types.js';

/** Schema validation for every stored record. Unknown fields are refused, so a typo cannot hide a value. */

const id = z.string().min(1).max(160).regex(/^[A-Za-z0-9._:-]+$/);
const iso = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?Z$/);
const sha = z.string().regex(/^[0-9a-f]{64}$/);
const unknowable = <T extends z.ZodTypeAny>(t: T) => z.union([t, z.literal('UNKNOWN'), z.literal('NOT_AVAILABLE')]);
const source = z.strictObject({ path: z.string().min(1), recordId: z.string().min(1), sha256: sha.nullable() });
const setting = z.union([z.string(), z.number(), z.boolean()]);

const base = <K extends StoredKind>(kind: K) => ({
  kind: z.literal(kind),
  id,
  projectId: id,
  schemaVersion: z.literal(SPINE_SCHEMA_VERSION),
  revision: z.number().int().min(1),
  createdAt: iso,
  updatedAt: iso,
  createdBy: z.string().min(1),
  fixture: z.literal(TEST_FIXTURE).optional(),
});

const shot = z.strictObject({
  ...base('SHOT'),
  releaseId: id,
  sceneId: id,
  shotId: id,
  source,
  setup: z.enum(['PRODUCTION_SETUP_READY', 'PRODUCTION_SETUP_INCOMPLETE']),
  generation: z.enum(['GENERATION_AUTHORIZATION_PENDING', 'GENERATION_READY']),
  fps: z.number().int().positive(),
  screenFrames: z.number().int().positive(),
  screenSec: z.number().positive(),
  generationSec: z.number().int().positive(),
  aspect: z.string().min(1),
  summary: z.strictObject({ purpose: z.string(), subject: z.string(), framing: z.string(), movement: z.string(), lighting: z.string() }),
  requiredDecisions: z.array(z.strictObject({ decisionId: id, role: z.enum(['SCREENPLAY', 'CITY_REFERENCE', 'GENERATION_AUTHORIZATION']), question: z.string(), status: z.enum(['OPEN', 'ANSWERED']), source })),
  references: z.array(z.strictObject({ referenceId: id, role: z.enum(['START_FRAME', 'REFERENCE']), title: z.string(), status: z.enum(['NOT_CREATED', 'CREATED_UNAPPROVED', 'APPROVED']), blockedBy: z.array(id), assetId: id.nullable() })),
  jobIds: z.array(id),
  budgetId: id,
  liveProviderCheck: z.enum(['NOT_RUN', 'PASSED', 'FAILED']),
});

const job = z.strictObject({
  ...base('GENERATION_JOB'),
  releaseId: id,
  sceneId: id,
  shotId: id,
  jobKind: z.enum(['REFERENCE_IMAGE', 'KEYFRAME_IMAGE', 'VIDEO_I2V']),
  producesReferenceId: id.nullable(),
  requestedOutputs: z.strictObject({ mediaType: z.enum(['IMAGE', 'VIDEO']), count: z.number().int().positive(), durationSec: z.number().int().positive().nullable(), aspect: z.string(), resolution: z.string(), audio: z.boolean() }),
  inputs: z.array(z.strictObject({ role: z.enum(['START_FRAME', 'END_FRAME', 'REFERENCE']), referenceId: id, assetId: id.nullable(), contentSha256: sha.nullable() })),
  prompt: z.strictObject({ text: z.string().min(1), source: z.literal('DERIVED_FROM_PACKET'), sourceRef: source }),
  routeId: id,
  provider: z.string().min(1),
  model: z.string().min(1),
  mode: z.string().min(1),
  settings: z.record(z.string(), setting),
  quotedCost: z.strictObject({ credits: z.number().int().nonnegative().nullable(), source, quotedAt: z.string().nullable() }),
  maxAuthorizedCost: z.strictObject({ credits: z.number().int().nonnegative().nullable() }),
  founderApprovalRef: id.nullable(),
  inputHash: sha,
  idempotencyKey: sha,
  providerOperationId: unknowable(z.string().min(1)),
  status: z.enum(JOB_STATES),
  submittedAt: iso.nullable(),
  completedAt: iso.nullable(),
  actualSpend: z.strictObject({ credits: unknowable(z.number().nonnegative()) }),
  outputAssetIds: z.array(id),
  errors: z.array(z.strictObject({ at: iso, code: z.string(), message: z.string() })),
  attempts: z.array(z.strictObject({ attempt: z.number().int().positive(), authorizationId: id.nullable(), ticketId: z.string().nullable(), operationId: unknowable(z.string().min(1)), outcome: z.enum(['OPEN', 'SUCCEEDED', 'FAILED', 'CANCELED']), chargedCredits: unknowable(z.number().nonnegative()) })),
  transitions: z.array(z.strictObject({ from: z.enum(JOB_STATES), to: z.enum(JOB_STATES), at: iso, actor: z.string(), reason: z.string(), evidence: z.record(z.string(), z.string()) })),
});

const take = z.strictObject({
  ...base('TAKE'),
  releaseId: id,
  sceneId: id,
  shotId: id,
  jobId: id,
  takeNumber: z.number().int().positive(),
  assetId: id,
  storageRef: z.string().startsWith('spine-media://'),
  contentSha256: sha,
  runtimeSec: unknowable(z.number().positive()),
  resolution: unknowable(z.string().regex(/^\d+x\d+$/)),
  frameRate: unknowable(z.number().positive()),
  aspectRatio: unknowable(z.string()),
  audioPresent: unknowable(z.boolean()),
  provider: z.string(),
  model: z.string(),
  continuity: z.strictObject({ status: z.enum(['NOT_REVIEWED', 'PASS', 'ISSUES']), approvalId: id.nullable() }),
  decision: z.enum(TAKE_DECISION_STATES),
  selectedForEdit: z.boolean(),
  approvalIds: z.array(id),
});

const asset = z.strictObject({
  ...base('ASSET'),
  mediaType: z.enum(['VIDEO', 'IMAGE']),
  mimeType: z.string().regex(/^(video|image)\/[a-z0-9.+-]+$/),
  adapter: z.enum(['MEMORY_TEST', 'LOCAL_PRIVATE', 'SUPABASE_PRIVATE']),
  storageRef: z.string().startsWith('spine-media://'),
  contentSha256: sha,
  byteSize: z.number().int().positive(),
  verifiedAt: iso,
  lineage: z.strictObject({ sourceJobId: id.nullable(), sourceTakeId: id.nullable(), derivedFromAssetId: id.nullable(), providerOperationId: unknowable(z.string().min(1)), providerSourceHost: unknowable(z.string().regex(/^[a-z0-9.-]+$/)) }),
});

const approval = z.strictObject({
  ...base('APPROVAL'),
  approvalKind: z.enum(APPROVAL_KINDS),
  subject: z.strictObject({ kind: z.enum(['SHOT', 'GENERATION_JOB', 'TAKE', 'ASSET', 'APPROVAL', 'BUDGET', 'CONTINUITY_REFERENCE']), id }),
  decision: z.enum(['AUTHORIZE', 'REVOKE', 'APPROVE', 'HOLD', 'REJECT', 'SELECT_FOR_EDIT', 'DESELECT_FOR_EDIT', 'PASS', 'ISSUES']),
  actor: z.string().min(1),
  actorRole: z.enum(['FOUNDER', 'REVIEWER', 'SYSTEM']),
  at: iso,
  note: z.string().max(2000).nullable(),
  decisionRefs: z.array(id),
  supersedes: id.nullable(),
  inputHash: sha.optional(),
  maxCredits: z.number().int().nonnegative().optional(),
  expiresAt: iso.optional(),
  budgetId: id.optional(),
  authorizedCredits: z.number().int().nonnegative().optional(),
});

const budget = z.strictObject({
  ...base('BUDGET'),
  releaseId: id,
  shotIds: z.array(id),
  status: z.enum(['PLANNING_ESTIMATE_ONLY', 'AUTHORIZED', 'CLOSED']),
  plannedCredits: z.number().int().nonnegative().nullable(),
  authorizedCredits: z.number().int().nonnegative(),
  approvalId: id.nullable(),
  lines: z.array(z.strictObject({ lineId: id, jobIds: z.array(id), description: z.string(), credits: z.number().int().nonnegative().nullable(), basis: z.string() })),
  quoteSource: source,
  quotedAt: z.string().nullable(),
  note: z.string(),
});

const continuity = z.strictObject({
  ...base('CONTINUITY_REFERENCE'),
  shotId: id,
  takeId: id,
  sourceAssetId: id,
  sourceSha256: sha,
  frameIndex: z.number().int().nonnegative(),
  timestampSec: z.number().nonnegative(),
  resolution: z.string().regex(/^\d+x\d+$/),
  assetId: id,
  contentSha256: sha,
  takeDecisionAtExtraction: z.enum(TAKE_DECISION_STATES),
  status: z.enum(['CANONICAL', 'INSPECTION_ONLY', 'INVALIDATED']),
  purpose: z.string().min(1),
});

const SCHEMAS: Record<StoredKind, z.ZodTypeAny> = {
  SHOT: shot,
  GENERATION_JOB: job,
  TAKE: take,
  ASSET: asset,
  APPROVAL: approval,
  BUDGET: budget,
  CONTINUITY_REFERENCE: continuity,
};

export const MAX_RECORD_BYTES = 256 * 1024;
const SECRET_KEY = /secret|password|api[_-]?key|token|signature|credential|bearer/i;
const URL_VALUE = /^[a-z][a-z0-9+.-]*:\/\//i;

/** Finds keys that look like secrets and string values that are URLs (records hold storage references, never URLs). */
function scan(v: unknown, path: string, out: string[]) {
  if (typeof v === 'string') {
    if (URL_VALUE.test(v) && !v.startsWith('spine-media://')) out.push(`${path}: URLs are not stored in records`);
    return;
  }
  if (Array.isArray(v)) return v.forEach((x, i) => scan(x, `${path}[${i}]`, out));
  if (v && typeof v === 'object')
    for (const [k, x] of Object.entries(v)) {
      if (SECRET_KEY.test(k)) out.push(`${path}.${k}: secret-like fields are not stored in records`);
      scan(x, `${path}.${k}`, out);
    }
}

export function recordProblems(rec: unknown): string[] {
  const kind = (rec as { kind?: string } | null)?.kind as StoredKind | undefined;
  const schema = kind ? SCHEMAS[kind] : undefined;
  if (!kind || !schema) return [`unknown record kind ${String(kind)}`];
  const parsed = schema.safeParse(rec);
  const out = parsed.success ? [] : parsed.error.issues.map((i) => `${i.path.join('.') || '(record)'}: ${i.message}`);
  scan(rec, kind, out);
  if (JSON.stringify(rec).length > MAX_RECORD_BYTES) out.push(`record exceeds ${MAX_RECORD_BYTES} bytes; media belongs in private storage`);
  if (kind === 'SHOT') out.push(...shotConsistency(rec as Extract<AnyRecord, { kind: 'SHOT' }>));
  if (kind === 'APPROVAL') out.push(...approvalConsistency(rec as Extract<AnyRecord, { kind: 'APPROVAL' }>));
  if (kind === 'TAKE') {
    const t = rec as Extract<AnyRecord, { kind: 'TAKE' }>;
    if (t.selectedForEdit && t.decision !== 'APPROVED') out.push('selectedForEdit: only an approved take can be selected for edit');
  }
  return out;
}

export function assertValidRecord(rec: unknown): asserts rec is AnyRecord {
  const problems = recordProblems(rec);
  if (problems.length) throw new SpineError('SCHEMA_INVALID', problems.join('; '));
}

/** GENERATION_READY is earned, never declared: every decision answered, every reference approved, the live check passed. */
function shotConsistency(s: Extract<AnyRecord, { kind: 'SHOT' }>): string[] {
  if (s.generation !== 'GENERATION_READY') return [];
  const out: string[] = [];
  for (const d of s.requiredDecisions) if (d.status !== 'ANSWERED') out.push(`generation: GENERATION_READY while ${d.decisionId} is ${d.status}`);
  for (const r of s.references) if (r.status !== 'APPROVED') out.push(`generation: GENERATION_READY while ${r.referenceId} is ${r.status}`);
  if (s.liveProviderCheck !== 'PASSED') out.push(`generation: GENERATION_READY while the live provider check is ${s.liveProviderCheck}`);
  return out;
}

function approvalConsistency(a: Extract<AnyRecord, { kind: 'APPROVAL' }>): string[] {
  const out: string[] = [];
  if (a.revision !== 1) out.push('revision: approvals are immutable; a new decision is a new record');
  if (a.approvalKind === 'GENERATION_AUTHORIZATION' && a.decision === 'AUTHORIZE') {
    if (a.actorRole !== 'FOUNDER') out.push('actorRole: only the founder authorizes generation');
    if (!a.inputHash || a.maxCredits === undefined || !a.expiresAt || !a.budgetId) out.push('a generation authorization needs inputHash, maxCredits, expiresAt and budgetId');
  }
  if (a.approvalKind === 'BUDGET_AUTHORIZATION' && a.decision === 'AUTHORIZE') {
    if (a.actorRole !== 'FOUNDER') out.push('actorRole: only the founder authorizes a budget');
    if (a.authorizedCredits === undefined) out.push('a budget authorization needs authorizedCredits');
  }
  return out;
}
