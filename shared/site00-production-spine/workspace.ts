import { committedTotal, MAX_QUOTE_AGE_HOURS, quoteAgeHours } from './gate.js';
import { decideTake, DISPATCHED_STATES, takeDisplayState } from './machines.js';
import { MAX_SIGNED_READ_SEC, type MediaStore } from './media.js';
import { permissionsOf } from './permissions.js';
import type { ProductionRunner } from './runner.js';
import type { RecordStore } from './store.js';
import { NOT_AVAILABLE, TAKE_ACTIONS, TEST_FIXTURE, UNKNOWN, type Actor, type BudgetRecord, type GenerationJobRecord, type ProjectRef, type ProviderRef, type ReleaseRef, type SceneRef, type ShotRecord, type TakeAction, type TakeRecord, type Unknowable } from './types.js';
import type { ActionState, JobView, ReadinessView, ShotView, TakesWorkspaceView, TakeView } from './view.js';

/** The canon references a project contributes: resolved from its own records, never copied into the spine. */
export type ProjectSpineRefs = { project: ProjectRef; release: ReleaseRef; scene: SceneRef; providers: ProviderRef[] };

export const PREVIEW_TTL_SEC = 300;

export const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

function actualOf(jobs: readonly GenerationJobRecord[]): Unknowable<number> {
  const closed = jobs.flatMap((j) => j.attempts.filter((a) => a.outcome !== 'OPEN' && a.outcome !== 'UNCERTAIN'));
  if (!closed.length) return NOT_AVAILABLE;
  return closed.every((a) => typeof a.chargedCredits === 'number') ? closed.reduce((n, a) => n + (a.chargedCredits as number), 0) : UNKNOWN;
}

const RUNNING_STATES = ['QUEUED', 'RUNNING', 'RECONCILIATION_REQUIRED', 'SUCCEEDED', 'ASSET_CAPTURE_PENDING'];

/** The six readiness stages for one shot, each from its own evidence (§25). */
export function shotReadiness(a: { shot: ShotRecord; jobs: readonly GenerationJobRecord[]; takes: readonly TakeRecord[]; budget: BudgetRecord; store: RecordStore; media: MediaStore; routeEnabled: { enabled: boolean; reason: string }; now: string }): ReadinessView[] {
  const { shot, jobs, takes, budget, store, media, routeEnabled, now } = a;
  const check = (label: string, met: boolean, detail: string) => ({ label, met, detail });
  const stage = (s: ReadinessView['stage'], label: string, checks: ReadinessView['checks']): ReadinessView => ({ stage: s, label, met: checks.every((c) => c.met), detail: checks.filter((c) => !c.met).map((c) => c.label).join(' · ') || 'met', checks });
  const creative = shot.requiredDecisions.filter((d) => d.role !== 'GENERATION_AUTHORIZATION');
  const spendDecisions = shot.requiredDecisions.filter((d) => d.role === 'GENERATION_AUTHORIZATION');
  const video = jobs.find((j) => j.jobKind === 'VIDEO_I2V');
  const fresh = (j: GenerationJobRecord) => {
    const h = quoteAgeHours(j.quotedCost.quotedAt, now);
    return j.quotedCost.credits !== null && h !== null && h >= 0 && h <= MAX_QUOTE_AGE_HOURS;
  };
  return [
    stage('TECHNICALLY_READY', 'Technically ready', [
      check('Durable record store', store.durable && !store.readOnlyReason, store.durable ? (store.readOnlyReason ?? store.description) : `${store.description}: not durable${store.readOnlyReason ? `; ${store.readOnlyReason}` : ''}`),
      check('Private master storage', media.live, media.live ? `${media.adapter} ${media.bucket}` : `${media.adapter}: test storage only`),
      check('Production setup records', shot.setup === 'PRODUCTION_SETUP_READY', shot.setup),
      check('Provider route available', routeEnabled.enabled, routeEnabled.reason),
    ]),
    stage('CREATIVELY_APPROVED', 'Creatively approved', [
      ...creative.map((d) => check(`${d.decisionId} (${d.role.toLowerCase().replace(/_/g, ' ')})`, d.status === 'ANSWERED', d.status)),
      ...shot.references.map((r) => check(`${r.referenceId} approved`, r.status === 'APPROVED', r.status)),
    ]),
    stage('FINANCIALLY_AUTHORIZED', 'Financially authorized', [
      ...spendDecisions.map((d) => check(`${d.decisionId} (generation budget)`, d.status === 'ANSWERED', d.status)),
      check('Budget authorized by the founder', budget.status === 'AUTHORIZED', `${budget.status}${budget.plannedCredits !== null ? ` · ${budget.plannedCredits} planned (estimate, not a quote)` : ''}`),
      ...jobs.map((j) => check(`${j.id} current quote`, fresh(j), j.quotedCost.credits === null ? 'no quote' : `${j.quotedCost.credits} quoted ${j.quotedCost.quotedAt ?? 'at an unknown time'}${fresh(j) ? '' : ` — older than ${MAX_QUOTE_AGE_HOURS} h, planning only`}`)),
      check(`${video?.id ?? 'video job'} authorized`, !!video && (video.status === 'AUTHORIZED' || DISPATCHED_STATES.includes(video.status)), video?.status ?? 'none'),
    ]),
    stage('GENERATION_RUNNING', 'Generation running', [check('A job with the provider', jobs.some((j) => RUNNING_STATES.includes(j.status)), jobs.map((j) => `${j.id.replace(/^JOB-/, '')} ${j.status}`).join(' · '))]),
    stage('TAKE_READY_FOR_REVIEW', 'Take ready for review', [check('A take awaits review', takes.some((t) => t.decision === 'READY_FOR_REVIEW' || t.decision === 'HELD'), `${takes.length} take${takes.length === 1 ? '' : 's'}`)]),
    stage('TAKE_APPROVED', 'Take approved', [check('A take approved by the founder', takes.some((t) => t.decision === 'APPROVED'), takes.filter((t) => t.decision === 'APPROVED').map((t) => t.id).join(', ') || 'none')]),
  ];
}

export async function buildTakesWorkspace(a: { refs: ProjectSpineRefs; store: RecordStore; media: MediaStore; runner: ProductionRunner; viewer: Actor; now: string }): Promise<TakesWorkspaceView> {
  const { refs, store, media, runner, viewer, now } = a;
  const [shots, jobs, takes, approvals, budgets] = await Promise.all([store.list('SHOT'), store.list('GENERATION_JOB'), store.list('TAKE'), store.list('APPROVAL'), store.list('BUDGET')]);

  const jobView = async (j: GenerationJobRecord): Promise<JobView> => ({
    jobId: j.id,
    jobKind: j.jobKind,
    status: j.status,
    purpose: `${j.jobKind === 'VIDEO_I2V' ? 'Shot video' : 'Reference image'}${j.producesReferenceId ? ` → ${j.producesReferenceId}` : ''}`,
    mode: j.mode,
    settings: j.settings,
    quote: (() => {
      const h = quoteAgeHours(j.quotedCost.quotedAt, now);
      return { credits: j.quotedCost.credits, quotedAt: j.quotedCost.quotedAt, ageHours: h === null ? null : Math.round(h * 10) / 10, fresh: j.quotedCost.credits !== null && h !== null && h >= 0 && h <= MAX_QUOTE_AGE_HOURS, source: `${j.quotedCost.source.path}#${j.quotedCost.source.recordId}` };
    })(),
    attempts: j.attempts.map((x) => ({ attempt: x.attempt, outcome: x.outcome, quotedCredits: x.quotedCredits, chargedCredits: x.chargedCredits })),
    producesReferenceId: j.producesReferenceId,
    routeId: j.routeId,
    provider: j.provider,
    model: j.model,
    quotedCredits: j.quotedCost.credits,
    maxAuthorizedCredits: j.maxAuthorizedCost.credits,
    actualCredits: j.actualSpend.credits,
    providerOperationId: j.providerOperationId,
    submittedAt: j.submittedAt,
    completedAt: j.completedAt,
    errors: j.errors,
    dispatch: DISPATCHED_STATES.includes(j.status) ? { enabled: false, reasons: [{ code: 'DUPLICATE_REQUEST', detail: `${j.id} is ${j.status}` }] } : await runner.dispatchPreview(j.id, viewer),
  });

  const routeStatus = (sJobs: readonly GenerationJobRecord[]) => {
    const p = refs.providers.filter((x) => sJobs.some((j) => j.routeId === x.routeId));
    const off = p.find((x) => x.execution !== 'ENABLED');
    return off ? { enabled: false, reason: `${off.routeId}: ${off.execution} — ${off.reason}` } : p.length ? { enabled: true, reason: p.map((x) => x.routeId).join(', ') } : { enabled: false, reason: 'no route' };
  };

  const shotViews: ShotView[] = [];
  for (const s of shots) {
    const sJobs = s.jobIds.map((id) => jobs.find((j) => j.id === id)).filter((j): j is GenerationJobRecord => !!j);
    const sTakes = takes.filter((t) => t.shotId === s.shotId).sort((x, y) => x.takeNumber - y.takeNumber);
    const budget = budgets.find((b) => b.id === s.budgetId)!;
    const jobViews = await Promise.all(sJobs.map(jobView));
    const next = jobViews.find((j) => !DISPATCHED_STATES.includes(j.status) && j.status !== 'CANCELED');
    const takeViews: TakeView[] = [];
    for (const t of sTakes) {
      const job = sJobs.find((j) => j.id === t.jobId);
      const actions = Object.fromEntries(
        TAKE_ACTIONS.map((act): [TakeAction, ActionState] => {
          try {
            decideTake(t, act, viewer, now, 'APR-PREVIEW', sTakes);
            return [act, { allowed: true, reason: null }];
          } catch (e) {
            return [act, { allowed: false, reason: (e as Error).message }];
          }
        }),
      ) as Record<TakeAction, ActionState>;
      let preview: TakeView['preview'] = null;
      let previewUnavailable: string | null = null;
      try {
        const asset = await store.get('ASSET', t.assetId);
        const signed = await media.signRead(t.storageRef, { projectId: t.projectId, ttlSec: PREVIEW_TTL_SEC, now });
        preview = { ...signed, mimeType: asset?.mimeType ?? 'video/mp4' };
      } catch (e) {
        previewUnavailable = (e as Error).message;
      }
      takeViews.push({
        takeId: t.id,
        jobId: t.jobId,
        takeNumber: t.takeNumber,
        state: takeDisplayState(t),
        decision: t.decision,
        selectedForEdit: t.selectedForEdit,
        runtimeSec: t.runtimeSec,
        resolution: t.resolution,
        frameRate: t.frameRate,
        aspectRatio: t.aspectRatio,
        audioPresent: t.audioPresent,
        provider: t.provider,
        model: t.model,
        contentSha256: t.contentSha256,
        storage: (await store.get('ASSET', t.assetId))?.adapter ?? media.adapter,
        intendedEditSec: t.intendedEditSec,
        continuity: t.continuity.status,
        continuityFindings: t.continuity.findings,
        estimatedCredits: job?.quotedCost.credits ?? null,
        actualCredits: job?.actualSpend.credits ?? NOT_AVAILABLE,
        preview,
        previewUnavailable,
        history: approvals
          .filter((x) => x.subject.id === t.id)
          .sort((x, y) => x.at.localeCompare(y.at) || x.id.localeCompare(y.id))
          .map((x) => ({ approvalId: x.id, kind: x.approvalKind, decision: x.decision, actor: x.actor, actorRole: x.actorRole, at: x.at, note: x.note, previousState: x.previousState, newState: x.newState, sourceVersion: x.sourceVersion })),
        sourceAssets: [...(job?.inputs ?? []).map((i) => ({ assetId: i.assetId ?? i.referenceId, role: i.role, sha256: i.contentSha256 })), { assetId: t.assetId, role: 'TAKE_MASTER', sha256: t.contentSha256 }],
        fixture: t.fixture === TEST_FIXTURE,
        actions,
      });
    }
    shotViews.push({
      shotId: s.shotId,
      sceneId: s.sceneId,
      setup: s.setup,
      generation: s.generation,
      fps: s.fps,
      screenSec: s.screenSec,
      generationSec: s.generationSec,
      aspect: s.aspect,
      summary: s.summary,
      requiredDecisions: s.requiredDecisions,
      references: s.references,
      budget: { budgetId: budget.id, status: budget.status, plannedCredits: budget.plannedCredits, authorizedCredits: budget.authorizedCredits, committedCredits: committedTotal(sJobs), actualCredits: actualOf(sJobs), note: budget.note },
      readiness: shotReadiness({ shot: s, jobs: sJobs, takes: sTakes, budget, store, media, routeEnabled: routeStatus(sJobs), now }),
      jobs: jobViews,
      takes: takeViews,
      generate: next ? { enabled: next.dispatch.enabled, reasons: next.dispatch.reasons } : { enabled: false, reasons: [{ code: 'NOTHING_TO_DISPATCH', detail: 'every planned job has been dispatched or canceled' }] },
      liveProviderCheck: s.liveProviderCheck,
    });
  }

  return {
    projectId: refs.project.projectId,
    displayName: refs.project.displayName,
    catalogue: { kind: store.live ? 'LIVE' : 'TEST_FIXTURE', records: store.description, durable: store.durable, media: media.adapter, readOnlyReason: store.readOnlyReason },
    storage: { adapter: media.adapter, bucket: media.bucket, live: media.live, access: `private; read through signed links that expire within ${PREVIEW_TTL_SEC / 60} min (maximum ${MAX_SIGNED_READ_SEC / 60} min)` },
    viewer: { id: viewer.id, role: viewer.role, permissions: permissionsOf(viewer.role) },
    project: { releases: refs.project.releases, runtime: mmss(refs.project.runtimeSec), castAuthority: refs.project.castAuthority, globalActorCatalogue: refs.project.globalActorCatalogue },
    release: { releaseId: refs.release.releaseId, title: refs.release.title, runtimeTargetSec: refs.release.runtimeTargetSec },
    scene: { sceneId: refs.scene.sceneId, packetStatus: refs.scene.packetStatus, screenplayStatus: refs.scene.screenplayStatus },
    shots: shotViews,
    providers: refs.providers,
    generatedAt: now,
  };
}
