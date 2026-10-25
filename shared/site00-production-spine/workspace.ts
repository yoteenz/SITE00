import { committedCredits } from './gate.js';
import { decideTake, DISPATCHED_STATES, takeDisplayState } from './machines.js';
import type { MediaStore } from './media.js';
import type { ProductionRunner } from './runner.js';
import type { RecordStore } from './store.js';
import { NOT_AVAILABLE, TAKE_ACTIONS, TEST_FIXTURE, UNKNOWN, type Actor, type GenerationJobRecord, type ProjectRef, type ProviderRef, type ReleaseRef, type SceneRef, type TakeAction, type Unknowable } from './types.js';
import type { ActionState, JobView, ShotView, TakesWorkspaceView, TakeView } from './view.js';

/** The canon references a project contributes: resolved from its own records, never copied into the spine. */
export type ProjectSpineRefs = { project: ProjectRef; release: ReleaseRef; scene: SceneRef; providers: ProviderRef[] };

export const PREVIEW_TTL_SEC = 300;

export const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

function actualOf(jobs: readonly GenerationJobRecord[]): Unknowable<number> {
  const closed = jobs.flatMap((j) => j.attempts.filter((a) => a.outcome !== 'OPEN'));
  if (!closed.length) return NOT_AVAILABLE;
  return closed.every((a) => typeof a.chargedCredits === 'number') ? closed.reduce((n, a) => n + (a.chargedCredits as number), 0) : UNKNOWN;
}

export async function buildTakesWorkspace(a: { refs: ProjectSpineRefs; store: RecordStore; media: MediaStore; runner: ProductionRunner; viewer: Actor; now: string }): Promise<TakesWorkspaceView> {
  const { refs, store, media, runner, viewer, now } = a;
  const [shots, jobs, takes, approvals, budgets] = await Promise.all([store.list('SHOT'), store.list('GENERATION_JOB'), store.list('TAKE'), store.list('APPROVAL'), store.list('BUDGET')]);

  const jobView = async (j: GenerationJobRecord): Promise<JobView> => ({
    jobId: j.id,
    jobKind: j.jobKind,
    status: j.status,
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
    dispatch: DISPATCHED_STATES.includes(j.status) ? { enabled: false, reasons: [{ code: 'DUPLICATE_REQUEST', detail: `${j.id} is ${j.status}` }] } : await runner.dispatchPreview(j.id),
  });

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
        continuity: t.continuity.status,
        estimatedCredits: job?.quotedCost.credits ?? null,
        actualCredits: job?.actualSpend.credits ?? NOT_AVAILABLE,
        preview,
        previewUnavailable,
        history: approvals
          .filter((x) => x.subject.id === t.id)
          .sort((x, y) => x.at.localeCompare(y.at) || x.id.localeCompare(y.id))
          .map((x) => ({ approvalId: x.id, kind: x.approvalKind, decision: x.decision, actor: x.actor, actorRole: x.actorRole, at: x.at, note: x.note })),
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
      budget: { budgetId: budget.id, status: budget.status, plannedCredits: budget.plannedCredits, authorizedCredits: budget.authorizedCredits, committedCredits: sJobs.reduce((n, j) => n + committedCredits(j), 0), actualCredits: actualOf(sJobs), note: budget.note },
      jobs: jobViews,
      takes: takeViews,
      generate: next ? { enabled: next.dispatch.enabled, reasons: next.dispatch.reasons } : { enabled: false, reasons: [{ code: 'NOTHING_TO_DISPATCH', detail: 'every planned job has been dispatched or canceled' }] },
      liveProviderCheck: s.liveProviderCheck,
    });
  }

  return {
    projectId: refs.project.projectId,
    displayName: refs.project.displayName,
    catalogue: { kind: store.live ? 'LIVE' : 'TEST_FIXTURE', records: store.description, media: media.adapter, readOnlyReason: store.readOnlyReason },
    viewer: { id: viewer.id, role: viewer.role },
    project: { releases: refs.project.releases, runtime: mmss(refs.project.runtimeSec), castAuthority: refs.project.castAuthority, globalActorCatalogue: refs.project.globalActorCatalogue },
    release: { releaseId: refs.release.releaseId, title: refs.release.title, runtimeTargetSec: refs.release.runtimeTargetSec },
    scene: { sceneId: refs.scene.sceneId, packetStatus: refs.scene.packetStatus, screenplayStatus: refs.scene.screenplayStatus },
    shots: shotViews,
    providers: refs.providers,
    generatedAt: now,
  };
}
