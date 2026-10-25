import fs from 'node:fs';
import { authorizeGenerationJob, type SceneReviewState } from '../../site00-fiction-production/directorial/review.js';
import { loadQuotesV2, PROVIDER_ROUTES, QUOTES_V2_PATH, quoteCredits } from '../../site00-fiction-production/directorial/routing.js';
import { EXCHANGE_PATHS, repoPath } from '../../site00-fiction-production/paths.js';
import { loadSceneReviewState, SCENE_FILES, scenePath } from '../../site00-fiction-production/scenes/index.js';
import { loadSeasonMaster } from '../../site00-fiction-production/seasonMaster.js';
import type { SceneGateResult } from '../gate.js';
import { jobIdempotencyKey, jobInputHash, sha256Hex } from '../hash.js';
import { NOT_AVAILABLE, SPINE_SCHEMA_VERSION, SpineError, type BudgetRecord, type DecisionRole, type GenerationJobRecord, type JobInput, type ProviderExecution, type ProviderRef, type SettingValue, type ShotRecord, type SourceRef } from '../types.js';
import type { ProjectSpineRefs } from '../workspace.js';

/**
 * THE EXCHANGE as a managed production project (D-08, §27). Everything here is read from the project's own canon:
 * the 86-release master, the S1-01 directorial packet and review state, and the V2 provider quotes. Nothing is
 * copied into the spine beyond what a shot setup needs, and each copy carries the hash of the file it came from.
 */

export const EXCHANGE_PROJECT_ID = 'the-exchange';
export const EXCHANGE_RECORDS_DIR = `${EXCHANGE_PATHS.season}/PRODUCTION_RECORDS`;
export const SH01 = { releaseId: 'S1-01', shotId: 'S1-01-SH01', budgetId: 'BUDGET-S1-01-SH01-PILOT' } as const;
/** Creation time of the committed setup records, fixed so the build is reproducible. */
export const SETUP_AT = '2026-10-25T12:00:00Z';
const SETUP_BY = 'system:production-spine-setup';

const SH01_DECISIONS: ReadonlyArray<[string, DecisionRole]> = [
  ['FD-S101-01', 'SCREENPLAY'],
  ['FD-S101-08', 'CITY_REFERENCE'],
  ['FD-S101-11', 'GENERATION_AUTHORIZATION'],
];

const fileSha = (rel: string, root: string) => sha256Hex(fs.readFileSync(repoPath(rel, root)));
const readJson = <T>(rel: string, root: string) => JSON.parse(fs.readFileSync(repoPath(rel, root), 'utf8')) as T;

type PacketShot = Record<string, string>;
type PacketKeyframe = { keyframeId: string; title: string; usedBy: string[]; candidates: number; effectiveBlockers: string[]; spec: { architecture: string; lighting: string; visible: string[]; hidden: string[]; cameraAngle: string; shotScale: string } };
type Packet = {
  status: string;
  fps: number;
  aspect: string;
  sections: {
    '1_SCENE_OVERVIEW': { screenplay: { status: string } };
    '3_DIRECTORS_TREATMENT': { lighting: Array<{ id: string; description: string }> };
    '4_SHOT_STORYBOARD': { shots: PacketShot[]; keyframes: PacketKeyframe[] };
    '9_FOUNDER_DECISIONS': Array<{ decisionId: string; question: string; status: 'OPEN' | 'ANSWERED' }>;
  };
};

const PACKET = scenePath(SH01.releaseId, SCENE_FILES.packet);

export function loadExchangePacket(root = process.cwd()) {
  return { packet: readJson<Packet>(PACKET, root), sha: fileSha(PACKET, root) };
}

/* ── references ─────────────────────────────────────────────────────────────────────────────────────── */

export function exchangeProviderRefs(execution: (routeId: string) => { execution: ProviderExecution; reason: string; transportId: string }): ProviderRef[] {
  return ['OA-NBP-I2I-2K-REF', 'OA-K3O-I2V-PRO'].map((routeId) => {
    const r = PROVIDER_ROUTES.find((x) => x.routeId === routeId)!;
    const e = execution(routeId);
    return { kind: 'PROVIDER', routeId, provider: r.provider, model: r.model, mode: String(r.config.mode), config: r.config as Record<string, string | number | boolean>, transportId: e.transportId, execution: e.execution, reason: e.reason };
  });
}

export function exchangeRefs(root: string, providers: ProviderRef[]): ProjectSpineRefs {
  const master = loadSeasonMaster(root);
  const release = master.releases.find((r) => r.id === SH01.releaseId)!;
  const { packet, sha } = loadExchangePacket(root);
  const shot = packet.sections['4_SHOT_STORYBOARD'].shots.find((s) => s.shotId === SH01.shotId)!;
  const src = (path: string, recordId: string): SourceRef => ({ path, recordId, sha256: fileSha(path, root) });
  return {
    project: {
      kind: 'PROJECT',
      projectId: EXCHANGE_PROJECT_ID,
      displayName: 'THE EXCHANGE',
      canon: [src(EXCHANGE_PATHS.master, 'SEASON1_86_RELEASE_MASTER_V1'), { path: PACKET, recordId: `${SH01.releaseId}.DIRECTORIAL_PACKET`, sha256: sha }],
      releases: master.releases.length,
      runtimeSec: master.releases.reduce((n, r) => n + r.runtimeTargetSec, 0),
      castAuthority: 'PROJECT_LOCAL',
      globalActorCatalogue: 'NOT_IMPORTED',
    },
    release: { kind: 'RELEASE', projectId: EXCHANGE_PROJECT_ID, releaseId: release.id, title: release.title, runtimeTargetSec: release.runtimeTargetSec, source: src(EXCHANGE_PATHS.master, release.id) },
    scene: { kind: 'SCENE', projectId: EXCHANGE_PROJECT_ID, releaseId: release.id, sceneId: shot.sceneId, packetStatus: packet.status, screenplayStatus: packet.sections['1_SCENE_OVERVIEW'].screenplay.status, source: { path: PACKET, recordId: shot.sceneId, sha256: sha } },
    providers,
  };
}

/* ── the S1-01-SH01 first-take setup (§23) ─────────────────────────────────────────────────────────── */

const seconds = (s: string) => {
  const m = /^(\d+(?:\.\d+)?) s/.exec(s);
  if (!m) throw new SpineError('PACKET_FORMAT', `cannot read seconds from "${s}"`);
  return Number(m[1]);
};

export function buildSh01Records(root = process.cwd()): { budget: BudgetRecord; shot: ShotRecord; jobs: GenerationJobRecord[] } {
  const { packet, sha } = loadExchangePacket(root);
  const board = packet.sections['4_SHOT_STORYBOARD'];
  const row = board.shots.find((s) => s.shotId === SH01.shotId);
  if (!row) throw new SpineError('PACKET_FORMAT', `${SH01.shotId} is not in the packet`);
  const kf = board.keyframes.find((k) => k.keyframeId === row.startFrame);
  if (!kf) throw new SpineError('PACKET_FORMAT', `${row.startFrame} is not in the packet`);
  const lighting = packet.sections['3_DIRECTORS_TREATMENT'].lighting.find((l) => l.id === row.lighting)!;
  const decisions = packet.sections['9_FOUNDER_DECISIONS'];
  const packetSrc = (recordId: string): SourceRef => ({ path: PACKET, recordId, sha256: sha });

  const quotes = loadQuotesV2(root);
  const quoteSrc = (recordId: string): SourceRef => ({ path: QUOTES_V2_PATH, recordId, sha256: fileSha(QUOTES_V2_PATH, root) });
  const screenFrames = Number(/\((\d+) frames\)/.exec(row.intendedScreenTime)?.[1]);
  const generationSec = seconds(row.generationDuration);

  const base = { projectId: EXCHANGE_PROJECT_ID, schemaVersion: SPINE_SCHEMA_VERSION, revision: 1, createdAt: SETUP_AT, updatedAt: SETUP_AT, createdBy: SETUP_BY } as const;
  const job = (id: string, j: { jobKind: GenerationJobRecord['jobKind']; routeId: string; producesReferenceId: string | null; settings: Record<string, SettingValue>; requestedOutputs: GenerationJobRecord['requestedOutputs']; inputs: JobInput[]; prompt: string; promptRecord: string }): GenerationJobRecord => {
    const route = PROVIDER_ROUTES.find((r) => r.routeId === j.routeId)!;
    const mode = String(route.config.mode);
    const draft = {
      ...base,
      kind: 'GENERATION_JOB' as const,
      id,
      releaseId: SH01.releaseId,
      sceneId: row.sceneId,
      shotId: SH01.shotId,
      jobKind: j.jobKind,
      producesReferenceId: j.producesReferenceId,
      requestedOutputs: j.requestedOutputs,
      inputs: j.inputs,
      prompt: { text: j.prompt, source: 'DERIVED_FROM_PACKET' as const, sourceRef: packetSrc(j.promptRecord) },
      routeId: j.routeId,
      provider: route.provider,
      model: route.model,
      mode,
      settings: j.settings,
      quotedCost: { credits: quoteCredits(quotes, route.model, mode, j.settings), source: quoteSrc(`${route.model} ${mode}`), quotedAt: quotes.retrievedAtUtc },
      maxAuthorizedCost: { credits: null },
      founderApprovalRef: null,
      providerOperationId: NOT_AVAILABLE,
      status: 'DRAFT' as const,
      submittedAt: null,
      completedAt: null,
      actualSpend: { credits: NOT_AVAILABLE },
      outputAssetIds: [],
      errors: [],
      attempts: [],
      transitions: [],
    };
    const inputHash = jobInputHash(draft);
    return { ...draft, inputHash, idempotencyKey: jobIdempotencyKey(id, inputHash) };
  };

  const refPrompt = [
    `${kf.title}.`,
    `Architecture: ${kf.spec.architecture}.`,
    `Lighting: ${kf.spec.lighting}.`,
    `Visible: ${kf.spec.visible.join(', ')}.`,
    `Not shown: ${kf.spec.hidden.join(', ')}.`,
    `Camera: ${kf.spec.cameraAngle}; ${kf.spec.shotScale}.`,
  ].join(' ');
  const refJobs = Array.from({ length: kf.candidates }, (_, i) =>
    job(`JOB-${SH01.shotId}-REF-${String(i + 1).padStart(2, '0')}`, {
      jobKind: 'REFERENCE_IMAGE',
      routeId: 'OA-NBP-I2I-2K-REF',
      producesReferenceId: kf.keyframeId,
      settings: { imageCount: 1, resolution: '2K', aspectRatio: '9:16' },
      requestedOutputs: { mediaType: 'IMAGE', count: 1, durationSec: null, aspect: packet.aspect, resolution: '2K', audio: false },
      // How the street is seeded (founder photograph or look development) is FD-S101-08; no source image is assumed.
      inputs: [],
      prompt: refPrompt,
      promptRecord: kf.keyframeId,
    }),
  );
  const videoPrompt = [
    `${row.subject}`,
    `Framing: ${row.framing}; camera ${row.cameraHeight.toLowerCase()}, ${row.cameraAngle.toLowerCase()}.`,
    `Movement: ${row.cameraMovement}, ${row.movementSpeed.toLowerCase()}.`,
    `Composition: ${row.composition}.`,
    `Action: ${row.primaryAction}.`,
    `Blocking: ${row.blocking}`,
    `Lighting: ${lighting.description}`,
    `Depth of field: ${row.depthOfField}.`,
  ].join(' ');
  const video = job(`JOB-${SH01.shotId}-VIDEO-01`, {
    jobKind: 'VIDEO_I2V',
    routeId: 'OA-K3O-I2V-PRO',
    producesReferenceId: null,
    settings: { videoCount: 1, resolution: 'pro', duration: generationSec, generateSound: false },
    requestedOutputs: { mediaType: 'VIDEO', count: 1, durationSec: generationSec, aspect: packet.aspect, resolution: 'pro', audio: false },
    inputs: [{ role: 'START_FRAME', referenceId: kf.keyframeId, assetId: null, contentSha256: null }],
    prompt: videoPrompt,
    promptRecord: SH01.shotId,
  });
  const jobs = [...refJobs, video];

  const refCredits = refJobs.reduce((n, j) => n + (j.quotedCost.credits ?? 0), 0);
  const known = jobs.every((j) => j.quotedCost.credits !== null);
  const budget: BudgetRecord = {
    ...base,
    kind: 'BUDGET',
    id: SH01.budgetId,
    releaseId: SH01.releaseId,
    shotIds: [SH01.shotId],
    status: 'PLANNING_ESTIMATE_ONLY',
    plannedCredits: known ? jobs.reduce((n, j) => n + j.quotedCost.credits!, 0) : null,
    authorizedCredits: 0,
    approvalId: null,
    lines: [
      { lineId: 'L-01', jobIds: refJobs.map((j) => j.id), description: `Reference development: ${kf.keyframeId} ×${kf.candidates} (also the start frame)`, credits: known ? refCredits : null, basis: `nano-banana-pro image2image 2K 9:16, ${refJobs[0]!.quotedCost.credits} credits per image` },
      { lineId: 'L-02', jobIds: [video.id], description: `Initial video: ${generationSec} s generated for ${seconds(row.intendedScreenTime)} s on screen`, credits: video.quotedCost.credits, basis: `kling-3-omni image2video pro, ${generationSec} s, sound off` },
    ],
    quoteSource: quoteSrc('openart.quotes'),
    quotedAt: quotes.retrievedAtUtc,
    note: 'Planning estimate only (§23). Not an approved budget: nothing is reserved, debited or spent. FD-S101-11 decides the generation budget.',
  };

  const shot: ShotRecord = {
    ...base,
    kind: 'SHOT',
    id: SH01.shotId,
    releaseId: SH01.releaseId,
    sceneId: row.sceneId,
    shotId: SH01.shotId,
    source: packetSrc(SH01.shotId),
    setup: 'PRODUCTION_SETUP_READY',
    generation: 'GENERATION_AUTHORIZATION_PENDING',
    fps: packet.fps,
    screenFrames,
    screenSec: seconds(row.intendedScreenTime),
    generationSec,
    aspect: packet.aspect,
    summary: { purpose: row.purpose, subject: row.subject, framing: row.framing, movement: row.cameraMovement, lighting: `${row.lighting}: ${lighting.description}` },
    requiredDecisions: SH01_DECISIONS.map(([decisionId, role]) => {
      const d = decisions.find((x) => x.decisionId === decisionId);
      if (!d) throw new SpineError('PACKET_FORMAT', `${decisionId} is not in the packet`);
      return { decisionId, role, question: d.question, status: d.status, source: packetSrc(decisionId) };
    }),
    references: [{ referenceId: kf.keyframeId, role: 'START_FRAME', title: kf.title, status: 'NOT_CREATED', blockedBy: kf.effectiveBlockers, assetId: null }],
    jobIds: jobs.map((j) => j.id),
    budgetId: budget.id,
    liveProviderCheck: 'NOT_RUN',
  };
  return { budget, shot, jobs };
}

/* ── scene state ────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The scene's own review state decides whether a job may run (screenplay → direction → keyframes → budget →
 * production). Price and budget are judged by the spine gate, so only the review-state reasons are taken here.
 */
export function sceneGateFrom(review: SceneReviewState) {
  return (job: GenerationJobRecord, shot: ShotRecord): SceneGateResult => {
    const d = authorizeGenerationJob(review, { jobId: job.id, kind: job.jobKind === 'VIDEO_I2V' ? 'VIDEO_I2V' : 'REFERENCE_IMAGE', target: job.producesReferenceId ?? shot.shotId, estimatedCredits: job.quotedCost.credits ?? 0, routeExecutable: true }, Number.MAX_SAFE_INTEGER, 0);
    return { valid: d.allowed, reasons: d.reasons };
  };
}

export const exchangeSceneGate = (root = process.cwd()) => sceneGateFrom(loadSceneReviewState(SH01.releaseId, root));

/* ── cast: project-local, with an adapter for later global integration ───────────────────────────────── */

export type GlobalActorCandidate = { projectLocalId: string; displayName: string; source: SourceRef; globalActorId: null; importStatus: 'NOT_IMPORTED'; requires: 'FOUNDER_DECISION' };

const CAST_REGISTRY = `${EXCHANGE_PATHS.season}/CAST_REGISTRY_V1.json`;

/**
 * Reads THE EXCHANGE's own cast as candidates for the global Actor Catalogue. It never writes there: importing a
 * character is a founder decision this sprint does not make.
 */
export function exchangeActorAdapter(root = process.cwd()) {
  const reg = readJson<{ characters: Array<{ characterId: string; fields: { displayName?: { value?: string } } }> }>(CAST_REGISTRY, root);
  const sha = fileSha(CAST_REGISTRY, root);
  return {
    candidates(): GlobalActorCandidate[] {
      return reg.characters.map((c) => ({ projectLocalId: c.characterId, displayName: c.fields.displayName?.value ?? c.characterId, source: { path: CAST_REGISTRY, recordId: c.characterId, sha256: sha }, globalActorId: null, importStatus: 'NOT_IMPORTED', requires: 'FOUNDER_DECISION' }));
    },
    importToGlobal(characterId: string): never {
      throw new SpineError('NOT_AUTHORIZED', `${characterId} stays project-local; importing into the global Actor Catalogue needs a founder decision`);
    },
  };
}
