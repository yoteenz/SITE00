import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as X from '../shared/site00-fiction-production/index.js';

const root = process.cwd();
const P = X.EXCHANGE_PATHS;
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');
const readJson = <T>(rel: string) => JSON.parse(read(rel)) as T;
const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const dialogue = X.loadDialogueRegistry(root);
const assets = X.loadAssetRegistry(root);
const quotes = X.loadPriceQuotes(root);
const docs = X.loadScreenplays(root);
const doc = (id: string) => docs.find((d) => d.meta.identity.releaseId === id)!;
const manifestOf = (id: string) => X.buildProductionManifest(doc(id), sha(read(doc(id).sourcePath)), X.planShots(doc(id), assets, quotes), assets, dialogue);
const T = '2026-10-23T12:00:00Z';
const AGENT = 'claude-opus-cursor-agent';

type PipelineState = { spendAuthorizations: unknown[]; jobs: unknown[]; verifiedGenerationProviders: string[]; releases: Array<{ releaseId: string; currentStage: string; currentStatus: string; stages?: X.StageEvaluation[] }> };

describe('THE EXCHANGE production pipeline', () => {
  it('asset reference validation', () => {
    expect(X.validateAssetRegistry(assets, root).filter((f) => f.severity === 'HARD_CONFLICT')).toEqual([]);
    const visual = readJson<{ characters: Array<{ characterId: string; assets: Array<{ sourceAssetPath: string; sha256: string }> }> }>(P.visualRegistry);
    for (const c of assets.characters.filter((x) => x.visualRegistryRef)) {
      const v = visual.characters.find((x) => x.characterId === c.visualRegistryRef)!;
      expect(v, c.characterId).toBeTruthy();
      for (const a of v.assets) expect(sha(fs.readFileSync(path.join(root, a.sourceAssetPath))), a.sourceAssetPath).toBe(a.sha256);
    }
    const kai = assets.characters.find((c) => c.cue === 'KAI')!;
    expect(kai.visualRegistryRef).toBeNull();
    expect(kai.appearance).toContain('hazel-green');
    expect(kai.grooming).toContain('locs');
    for (const c of assets.characters) expect(c.voice.voiceAssetId, c.cue).toBeNull();

    const broken = structuredClone(assets);
    broken.characters[0].visualRegistryRef = 'not-a-registered-face';
    broken.wardrobe[0].accessories = [...broken.wardrobe[0].accessories, 'PR-DOES-NOT-EXIST'];
    broken.sets[0].establishingAngles = ['THE_EXCHANGE/NO_SUCH_FILE.png'];
    const details = X.validateAssetRegistry(broken, root).filter((f) => f.severity === 'HARD_CONFLICT').map((f) => f.detail).join('\n');
    expect(details).toContain('not-a-registered-face');
    expect(details).toContain('PR-DOES-NOT-EXIST');
    expect(details).toContain('NO_SUCH_FILE.png');
  });

  it('missing asset handling', () => {
    const m = manifestOf('S1-03');
    const has = (kind: string, subject: string) => m.blockers.some((b) => b.kind === kind && b.subject === subject);
    expect(has('CHARACTER_FACE', 'KAI')).toBe(true);
    expect(has('CHARACTER_FACE', 'ROYCE')).toBe(true);
    for (const cue of new Set(X.dialogueLines(doc('S1-03')).map((l) => l.character))) expect(has('CHARACTER_VOICE', cue), cue).toBe(true);
    expect(has('PROP', 'PR-KAI-NOTE')).toBe(true);
    expect(m.blockers.some((b) => b.kind === 'WARDROBE')).toBe(true);
    expect(m.audio.dialogue.every((r) => r.voiceId === null)).toBe(true);
    expect([...m.audio.music, ...m.audio.sfx].every((c) => c.asset === null)).toBe(true);
    const kaiShot = X.planShots(doc('S1-03'), assets, quotes).shots.find((s) => s.onScreen.includes('KAI'))!;
    expect(kaiShot.movementConstraints.join(' ')).toContain('no approved face asset — generation blocked');

    const state = readJson<PipelineState>(P.pipelineState);
    const s3 = state.releases.find((r) => r.releaseId === 'S1-03')!.stages!.find((s) => s.stage === 'ASSETS_RESOLVED')!;
    expect(s3.status).toBe('BLOCKED');
    expect(s3.blockers.some((b) => b.startsWith('CHARACTER_FACE KAI'))).toBe(true);

    const extra = X.parseExchangeScreenplay(`${read(doc('S1-02').sourcePath)}\n\n[[ENTER: MYSTERY GUEST]]\n`, 'memory');
    const mm = X.buildProductionManifest(extra, 'x', X.planShots(extra, assets, quotes), assets, dialogue);
    expect(mm.blockers.some((b) => b.kind === 'UNREGISTERED' && b.subject === 'MYSTERY GUEST')).toBe(true);
  });

  it('manifest generation', () => {
    for (const d of docs) {
      const id = d.meta.identity.releaseId;
      const plan = X.planShots(d, assets, quotes);
      const m = manifestOf(id);
      expect(readJson(`${P.manifests}/${id}.json`)).toEqual(JSON.parse(JSON.stringify(m)));
      expect(m.status).toBe(X.DRAFT_STATUS);
      expect(m.shots.count).toBe(plan.shots.length);
      expect(m.shots.actualCost).toBeNull();
      expect(m.audio.dialogue).toHaveLength(X.dialogueLines(d).length);
      expect(m.runtime.shotListSec).toBe(plan.totalSec);
      expect(m.providerExports.edit.format).toBe('EXCHANGE_EDL_V1');
      expect(m.providerExports.edit.totalSec).toBe(plan.totalSec);
      expect(m.providerExports.edit.events).toHaveLength(plan.shots.length);
    }
  });

  it('cost estimation', () => {
    expect(X.shotCost('ACTION', 5, false, quotes)).toMatchObject({ credits: 42 + 175, usd: 1.4 });
    expect(X.shotCost('DIALOGUE', 7, true, quotes)).toMatchObject({ credits: 42 + 175 * 2, usd: 3.15 });
    expect(X.shotCost('FREEZE_FRAME', 2.5, false, quotes)).toMatchObject({ credits: 0, usd: 0 });
    let usd = 0;
    let credits = 0;
    for (const d of docs) {
      const plan = X.planShots(d, assets, quotes);
      const c = X.summarizeCost(plan);
      expect(c.credits).toBe(plan.shots.reduce((a, s) => a + (s.estimatedCost.credits ?? 0), 0));
      usd += c.usd ?? 0;
      credits += c.credits ?? 0;
    }
    expect(Math.round(usd * 100) / 100).toBe(178.22);
    expect(credits).toBe(26236);
  });

  it('approval transitions', () => {
    let r = X.newRecord('S1-01', 'SCREENPLAY');
    r = X.transition(r, 'DRAFT', AGENT, T);
    r = X.transition(r, 'IN_REVIEW', AGENT, T);
    expect(() => X.transition(r, 'APPROVED', AGENT, T, null, () => ['APPROVED'])).toThrow(X.ApprovalError);
    expect(() => X.transition(r, 'APPROVED', X.FOUNDER_ACTOR, T)).toThrow(/STORY_STRUCTURE must be approved/);
    const ok = X.transition(r, 'APPROVED', X.FOUNDER_ACTOR, T, 'Approved', () => ['APPROVED']);
    expect(ok).toMatchObject({ state: 'APPROVED', actor: 'founder', decidedAt: T });
    expect(ok.history.map((h) => h.to)).toEqual(['DRAFT', 'IN_REVIEW', 'APPROVED']);
    expect(() => X.transition(X.newRecord('S1-01', 'SCREENPLAY'), 'APPROVED', X.FOUNDER_ACTOR, T)).toThrow(/not allowed/);
    const [old, next] = X.revise(ok, AGENT, T, 'v2');
    expect(old.state).toBe('SUPERSEDED');
    expect(next).toMatchObject({ state: 'DRAFT', version: 2 });
    expect(() => X.revise(r, AGENT, T, 'no')).toThrow(X.ApprovalError);
    expect(X.toFictionApprovalStatus('APPROVED')).toBe('FOUNDER_APPROVED');
    expect(X.toFictionApprovalStatus('IN_REVIEW')).toBe('PENDING_REVIEW');
    expect(X.DOMAIN_PREREQUISITES.GENERATED_VIDEO).toEqual(['SHOT_PLAN', 'CHARACTER_VISUAL_IDENTITY', 'CHARACTER_VOICE', 'SET', 'WARDROBE']);
    expect(X.APPROVAL_DOMAINS).toHaveLength(9);
  });

  it('founder review gating', () => {
    expect(X.PIPELINE_STAGES.map((s) => s.id)).toEqual(['STORY_APPROVED', 'SCREENPLAY_DRAFTED', 'CONTINUITY_VALIDATED', 'FOUNDER_SCRIPT_APPROVAL', 'SHOT_LIST_GENERATED', 'ASSETS_RESOLVED', 'VOICE_RECORDINGS_PREPARED', 'KEYFRAMES_GENERATED', 'SHOT_ANIMATION', 'AUDIO_DRIVEN_LIP_SYNC', 'SCENE_ASSEMBLY', 'CONTINUITY_QUALITY_REVIEW', 'FOUNDER_FINAL_APPROVAL', 'EXPORT_RELEASE_PACKAGE']);
    const book = readJson<X.ApprovalBook>(P.approvals);
    for (const d of ['SCREENPLAY', 'SHOT_PLAN', 'GENERATED_VIDEO', 'FINAL_EDIT'] as const) expect(X.findRecords(book, d).filter((r) => r.state === 'APPROVED'), d).toEqual([]);
    expect(X.findRecords(book, 'STORY_STRUCTURE').filter((r) => r.state === 'APPROVED' && r.actor === 'founder')).toHaveLength(86);

    const state = readJson<PipelineState>(P.pipelineState);
    expect(state.spendAuthorizations).toEqual([]);
    expect(state.jobs).toEqual([]);
    expect(state.verifiedGenerationProviders).toEqual([]);
    for (const r of state.releases.slice(0, 5)) expect([r.currentStage, r.currentStatus]).toEqual(['FOUNDER_SCRIPT_APPROVAL', 'AWAITING_APPROVAL']);
    for (const r of state.releases.slice(5)) expect([r.currentStage, r.currentStatus]).toEqual(['SCREENPLAY_DRAFTED', 'NOT_STARTED']);

    const approvedDomains = new Set<X.ApprovalDomain>(['STORY_STRUCTURE']);
    const facts = (over: Partial<X.ReleaseFacts> = {}): X.ReleaseFacts => ({
      releaseId: 'S1-01',
      approval: (d) => [approvedDomains.has(d) ? 'APPROVED' : 'DRAFT'],
      screenplay: { path: 'a.fountain', sha256: 'S', version: 1 },
      hardFindings: [],
      shotList: { path: 'a.json', sha256: 'L', screenplaySha256: 'S', estimatedCost: { usd: 1, credits: 1 } },
      assetBlockers: [],
      voiceBlockers: [],
      spendAuthorized: () => false,
      failures: {},
      ...over,
    });
    const stage = (f: X.ReleaseFacts, id: string) => X.evaluatePipeline(f).find((s) => s.stage === id)!;
    expect(X.currentStage(X.evaluatePipeline(facts())).stage).toBe('FOUNDER_SCRIPT_APPROVAL');
    approvedDomains.add('SCREENPLAY');
    expect(stage(facts(), 'SHOT_LIST_GENERATED').status).toBe('AWAITING_APPROVAL');
    expect(stage(facts({ shotList: { path: 'a.json', sha256: 'L', screenplaySha256: 'OLD', estimatedCost: { usd: 1, credits: 1 } } }), 'SHOT_LIST_GENERATED').status).toBe('BLOCKED');
    for (const d of X.APPROVAL_DOMAINS) approvedDomains.add(d);
    const voice = stage(facts(), 'VOICE_RECORDINGS_PREPARED');
    expect(voice.status).toBe('BLOCKED');
    expect(voice.blockers.join(' ')).toContain('UNAUTHORIZED_SPEND');
    const authorized = X.evaluatePipeline(facts({ spendAuthorized: () => true }));
    expect(authorized.find((s) => s.stage === 'VOICE_RECORDINGS_PREPARED')!.status).toBe('READY');
    expect(authorized.filter((s) => s.order > 6).every((s) => s.status !== 'COMPLETE')).toBe(true);
    expect(stage(facts({ hardFindings: ['KNOWLEDGE_AND_REVEALS: leak'] }), 'CONTINUITY_VALIDATED').status).toBe('BLOCKED');
  });

  const job: X.GenerationJob = { releaseId: 'S1-01', stage: 'KEYFRAMES_GENERATED', shotId: 'S1-01-SC01-SH01', lineId: null, provider: 'OPENART:kling-3-omni:image2video', model: 'kling-3-omni', inputs: { start: 'a', set: 'b' }, estimatedCredits: 217, estimatedUsd: null };
  const auth: X.SpendAuthorization = { authorizationId: 'A1', releaseId: 'S1-01', stage: 'KEYFRAMES_GENERATED', maxCredits: 500, maxUsd: null, authorizedBy: 'founder', authorizedAt: T };
  const ctx = (over: Partial<X.DispatchContext> = {}): X.DispatchContext => ({ ledger: [], authorizations: [auth], verifiedProviders: [job.provider], plannedProvider: job.provider, upstreamApproved: true, ...over });
  const reason = (d: X.DispatchDecision) => (d.status === 'BLOCKED' ? d.blockedReason : d.status);

  it('duplicate generation prevention', () => {
    expect(X.idempotencyKey({ ...job, inputs: { set: 'b', start: 'a' } })).toBe(X.idempotencyKey(job));
    expect(X.idempotencyKey({ ...job, inputs: { start: 'z', set: 'b' } })).not.toBe(X.idempotencyKey(job));
    expect(X.precheckProductionDispatch(job, ctx())).toEqual({ status: 'READY_TO_DISPATCH', idempotencyKey: X.idempotencyKey(job), creditsSpent: 0 });
    const ledger = X.openJob(job, []);
    expect(reason(X.precheckProductionDispatch(job, ctx({ ledger })))).toBe('DUPLICATE_GENERATION');
    expect(() => X.openJob(job, ledger)).toThrow();
    const done = X.recordSuccess(ledger, X.idempotencyKey(job), { creationId: 'c1', credits: 217, usd: null });
    expect(reason(X.precheckProductionDispatch(job, ctx({ ledger: done })))).toBe('DUPLICATE_GENERATION');
    expect(X.actualCost(done, 'S1-01')).toEqual({ credits: 217, usd: 0 });
    const second = { ...job, shotId: 'S1-01-SC01-SH02' };
    expect(reason(X.precheckProductionDispatch(second, ctx({ ledger: done })))).toBe('READY_TO_DISPATCH');
    const both = X.recordSuccess(X.openJob(second, done), X.idempotencyKey(second), { creationId: 'c2', credits: 217, usd: null });
    expect(reason(X.precheckProductionDispatch({ ...job, shotId: 'S1-01-SC01-SH03' }, ctx({ ledger: both })))).toBe('UNAUTHORIZED_SPEND');
  });

  it('provider failure handling', () => {
    const key = X.idempotencyKey(job);
    let ledger = X.openJob(job, []);
    for (let attempt = 1; attempt < X.MAX_ATTEMPTS; attempt += 1) {
      ledger = X.recordFailure(ledger, key, `timeout ${attempt}`, true);
      expect(ledger[0].status).toBe('FAILED_RETRYABLE');
      expect(X.precheckProductionDispatch(job, ctx({ ledger })).status).toBe('READY_TO_DISPATCH');
      ledger = X.openJob(job, ledger);
      expect(ledger[0]).toMatchObject({ status: 'IN_FLIGHT', attempts: attempt + 1 });
    }
    ledger = X.recordFailure(ledger, key, 'timeout 3', true);
    expect(ledger[0]).toMatchObject({ status: 'FAILED_TERMINAL', attempts: X.MAX_ATTEMPTS });
    expect(ledger[0].errors).toHaveLength(X.MAX_ATTEMPTS);
    expect(reason(X.precheckProductionDispatch(job, ctx({ ledger })))).toBe('DUPLICATE_GENERATION');
    expect(X.recordFailure(X.openJob(job, []), key, 'content policy', false)[0].status).toBe('FAILED_TERMINAL');
    expect(reason(X.precheckProductionDispatch({ ...job, provider: 'FAL:kling' }, ctx({ verifiedProviders: [job.provider, 'FAL:kling'] })))).toBe('SILENT_FALLBACK_ATTEMPT');
  });

  it('never dispatches without verified providers, upstream approval and founder spend authorization', () => {
    const audit = readJson<{ audit: X.ProviderCapability[]; verifiedGenerationProviders: string[] }>(P.providerCapabilities);
    expect(audit.verifiedGenerationProviders).toEqual([]);
    expect(X.verifiedGenerationProviders()).toEqual([]);
    expect(audit.audit.find((a) => a.role === 'VOICE')?.integration).toBe('NOT_VERIFIED');
    const blocked = [
      X.precheckProductionDispatch(job, ctx({ verifiedProviders: X.verifiedGenerationProviders() })),
      X.precheckProductionDispatch(job, ctx({ upstreamApproved: false })),
      X.precheckProductionDispatch(job, ctx({ authorizations: [] })),
      X.precheckProductionDispatch(job, ctx({ authorizations: [{ ...auth, authorizedBy: AGENT }] })),
      X.precheckProductionDispatch({ ...job, estimatedCredits: 501 }, ctx()),
    ];
    expect(blocked.map(reason)).toEqual(['PROVIDER_NOT_VERIFIED', 'UPSTREAM_NOT_APPROVED', 'UNAUTHORIZED_SPEND', 'UNAUTHORIZED_SPEND', 'UNAUTHORIZED_SPEND']);
    for (const d of blocked) expect(d.creditsSpent).toBe(0);
  });
});
