import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as X from '../shared/site00-fiction-production/index.js';

const D = X.Directorial;
const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');
const readJson = <T>(rel: string) => JSON.parse(read(rel)) as T;
const rt = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const out = (f: keyof typeof X.SCENE_FILES) => X.scenePath('S1-01', X.SCENE_FILES[f]);
const plan = X.S1_01_PLAN;
const bundle = X.directedSceneBundle('S1-01', root);
const cast = readJson<X.CastRegistry>(X.CAST_REGISTRY_PATH);
const F = X.FOUNDER_ACTOR;
const AT = '2026-10-24T16:00:00Z';
const fresh = () => D.newReviewState(plan, X.S1_01_REVIEW_EXTRAS);

describe('THE EXCHANGE S1-01 directorial packet and production controls', () => {
  it('commits scene outputs that match the plan, and points the pipeline at them', () => {
    expect(readJson(out('shotList'))).toEqual(rt(bundle.shotList));
    expect(read(out('shotListCsv'))).toBe(bundle.shotListCsv);
    expect(read(out('cueSheet'))).toBe(bundle.cueSheetCsv);
    expect(readJson(out('budget'))).toEqual(rt(bundle.budget));
    expect(readJson(out('review'))).toEqual(rt(fresh()));
    expect(readJson<{ events: unknown }>(out('timeline')).events).toEqual(rt(D.deriveTimelineEvents(plan)));
    expect(readJson(out('multitrack'))).toEqual(rt(D.buildMultitrack(plan)));
    expect(readJson<{ counts: unknown }>(out('keyframes')).counts).toEqual(D.keyframeCounts(plan));
    const packet = readJson<X.Directorial.ScenePacket>(out('packet'));
    expect(Object.keys(packet.sections)).toHaveLength(10);
    expect(packet.status).toBe('FOUNDER_REVIEW_REQUIRED');
    expect(packet.validation).toEqual(rt({ errors: 0, warnings: 0, advisories: 3, findings: D.validateDirection(X.S1_01_DIRECTION, X.approvedAssetIds(cast)) }));
    expect(packet.sections['2_SCREENPLAY'].text).toBe(read(plan.screenplay.path));
    expect(packet.sections['8_PRODUCTION_COST']).toEqual(rt(bundle.budget));
    expect(packet.sections['9_FOUNDER_DECISIONS']).toEqual(rt(X.S1_01_DIRECTION.founderDecisions));
    expect(readJson(`${X.EXCHANGE_PATHS.season}/ACTIVE_PRODUCTION_V1.json`)).toEqual(D.initialActiveProduction(X.loadSeasonMaster(root).releases.map((r) => r.id), 'S1-01'));
    expect(readJson<{ entries: unknown }>(`${X.EXCHANGE_PATHS.season}/PRODUCTION_KNOWLEDGE_BASE_V1.json`).entries).toEqual(D.PRODUCTION_KNOWLEDGE);
    const stage = readJson<{ releases: Array<{ releaseId: string; stages?: Array<{ stage: string; artifact?: string; artifactSha256?: string; estimatedCost?: unknown }> }> }>(X.EXCHANGE_PATHS.pipelineState)
      .releases.find((r) => r.releaseId === 'S1-01')!.stages!.find((s) => s.artifact?.includes('SHOT_LIST'))!;
    expect(stage.artifact).toBe(out('shotList'));
    expect(stage.artifactSha256).toBe(createHash('sha256').update(read(out('shotList'))).digest('hex'));
    expect(stage.estimatedCost).toEqual({ usd: bundle.budget.estimated.usd, credits: bundle.budget.estimated.credits });
    expect(readJson<{ supersededBy: { path: string } }>(`${X.EXCHANGE_PATHS.shotLists}/S1-01.json`).supersededBy.path).toBe(out('shotList'));
  });

  it('exports every sprint field for shots, events, keyframes, performance and the multitrack', () => {
    for (const r of bundle.shotList.shots) expect(D.missingFields(r, Object.values(D.SHOT_RECORD_FIELDS)), r.shotId).toEqual([]);
    for (const e of D.deriveTimelineEvents(plan)) expect(D.missingFields(e, Object.values(D.TIMELINE_EVENT_FIELDS)), e.eventId).toEqual([]);
    for (const k of plan.keyframes.filter((x) => x.spec)) expect(D.missingFields(k.spec!, Object.values(D.KEYFRAME_SPEC_FIELDS)), k.keyframeId).toEqual([]);
    for (const p of X.S1_01_DIRECTION.performance) expect(D.missingFields(p as unknown as Record<string, unknown>, D.PERFORMANCE_SCHEMA.required)).toEqual([]);
    expect(D.missingFields(D.buildMultitrack(plan), D.MULTITRACK_SCHEMA.required)).toEqual([]);
    expect(bundle.shotListCsv.split('\n')[0].split(',')).toEqual(Object.keys(bundle.shotList.shots[0]));
    expect(bundle.cueSheetCsv.trim().split('\n')).toHaveLength(1 + plan.music.length + plan.sound.length);
  });

  it('estimates cost from recorded quotes and marks anything unquoted UNKNOWN', () => {
    const b = bundle.budget;
    const line = (id: string) => b.lines.find((l) => l.lineId === id)!;
    expect([line('B-01').jobs, line('B-01').credits, line('B-02').jobs, line('B-02').credits, line('B-03').jobs, line('B-03').credits]).toEqual([9, 360, 20, 800, 18, 2240]);
    expect([line('B-04').status, line('B-05').status, line('B-09').status]).toEqual(['NOT_REQUIRED', 'NOT_REQUIRED', 'UNKNOWN']);
    expect(line('B-05').basis).toBe('Do not invent narration');
    expect(line('B-06').jobs).toBe(2 * plan.sound.filter((c) => c.layer !== 'SILENCE').length);
    expect(b.estimated.credits).toBe(3400);
    expect(b.expectedTotalCredits).toBe(3400 + b.revisions.expectedCredits);
    expect(b.ledger).toEqual({ authorizedCredits: 0, actualCredits: 0, refundedCredits: 0, regenerationCredits: 0, authorizedUsd: 0, actualUsd: 0 });
    for (const s of b.perShot) expect(s.credits).toBe(s.generationSec * 35);
    const q = D.loadQuotesV2(root);
    q.openart.quotes = q.openart.quotes.filter((x) => !(x.model === 'kling-3-omni' && x.config.duration === 6));
    const unq = D.buildBudget(plan, q);
    expect(unq.lines.find((l) => l.lineId === 'B-03')).toMatchObject({ credits: null, status: 'UNKNOWN' });
    expect(unq.estimated.unknownLines).toContain('B-03');
  });

  it('gates every paid job behind founder steps, an approved target, a known price within budget and an executable route', () => {
    let s = fresh();
    const kfJob = { jobId: 'J-KF', kind: 'REFERENCE_IMAGE' as const, target: 'KF-ENV-CITY-DUSK-A', estimatedCredits: 80, routeExecutable: true };
    const denied = D.authorizeGenerationJob(s, kfJob, 1000, 0);
    expect(denied).toMatchObject({ allowed: false, creditsSpent: 0 });
    expect(denied.reasons).toEqual(expect.arrayContaining(['GENERATION_BUDGET not authorized', 'KF-ENV-CITY-DUSK-A is PENDING']));
    expect(() => D.authorizeStep(s, 'SCREENPLAY', 'composer-agent', AT)).toThrow(/only the founder/);
    expect(() => D.authorizeStep(s, 'DIRECTION', F, AT)).toThrow(/SCREENPLAY must be authorized first/);
    s = D.authorizeStep(D.authorizeStep(s, 'SCREENPLAY', F, AT), 'DIRECTION', F, AT);
    expect(() => D.authorizeStep(s, 'KEYFRAMES', F, AT)).toThrow(/not yet approved/);
    for (const e of D.stepElements(s, 'KEYFRAMES')) s = D.decideElement(s, e.elementId, 'APPROVED', F, AT);
    s = D.decideElement(D.authorizeStep(s, 'KEYFRAMES', F, AT), 'S1-01/BUDGET', 'APPROVED', F, AT);
    s = D.authorizeStep(s, 'GENERATION_BUDGET', F, AT);
    expect(D.authorizeGenerationJob(s, kfJob, 1000, 0)).toMatchObject({ allowed: true, creditsSpent: 0 });
    expect(D.authorizeGenerationJob(s, kfJob, 1000, 950).reasons[0]).toMatch(/exceeds authorized budget/);
    expect(D.authorizeGenerationJob(s, { ...kfJob, estimatedCredits: null }, 1000, 0).reasons).toContain('price UNKNOWN: quote before authorizing');
    expect(D.authorizeGenerationJob(s, { ...kfJob, routeExecutable: false }, 1000, 0).allowed).toBe(false);
    const video = (target: string) => ({ jobId: `J-${target}`, kind: 'VIDEO_I2V' as const, target, estimatedCredits: 175, routeExecutable: true });
    expect(D.authorizeGenerationJob(s, video('S1-01-SH01'), 5000, 0).reasons).toContain('PRODUCTION not authorized');
    s = D.authorizeStep(s, 'PRODUCTION', F, AT, 'first shot only', ['S1-01-SH01']);
    expect(D.authorizeGenerationJob(s, video('S1-01-SH01'), 5000, 0).allowed).toBe(true);
    expect(D.authorizeGenerationJob(s, video('S1-01-SH02'), 5000, 0).reasons).toContain('S1-01-SH02 is outside the authorized production scope');
  });

  it('keeps partial approvals when a change request touches one element', () => {
    let s = D.authorizeStep(D.authorizeStep(fresh(), 'SCREENPLAY', F, AT), 'DIRECTION', F, AT);
    for (const e of D.stepElements(s, 'KEYFRAMES')) s = D.decideElement(s, e.elementId, 'APPROVED', F, AT);
    s = D.authorizeStep(s, 'KEYFRAMES', F, AT);
    const music = D.requestChange(s, plan, { requestId: 'CR-1', at: AT, actor: F, text: 'Bring the groove back more softly', kind: 'MUSIC', targets: ['S1-01-MX03'] });
    expect(music.changeRequests[0].invalidated).toEqual(['S1-01-MX03']);
    expect(music.steps.DIRECTION.state).toBe('PENDING');
    expect(music.steps.KEYFRAMES.state).toBe('AUTHORIZED');
    expect(music.changeRequests[0].preserved).toEqual(expect.arrayContaining(['KF-ENV-CITY-DUSK-A', 'S1-01-SH01', 'S1-01-MX01']));
    const env = D.requestChange(s, plan, { requestId: 'CR-2', at: AT, actor: F, text: 'Warmer brick on the street', kind: 'ENVIRONMENT', targets: ['KF-ENV-CITY-DUSK-A'] });
    const inv = env.changeRequests[0].invalidated;
    expect(inv).toEqual(expect.arrayContaining(['KF-SF-SH02', 'S1-01-SH02', 'KF-SF-SH03', 'KF-ENV-CITY-DUSK-B', 'KF-SF-SH07', 'S1-01-SH07', 'KF-ENV-HALCYON-EXT']));
    expect(inv.some((id) => id.includes('MX') || id.includes('FL') || id.includes('AMB'))).toBe(false);
    expect(env.steps.KEYFRAMES.state).toBe('PENDING');
    expect(() => D.requestChange(s, plan, { requestId: 'CR-3', at: AT, actor: 'composer-agent', text: 'x', kind: 'MUSIC', targets: ['S1-01-MX03'] })).toThrow(/only the founder/);
  });

  it('reuses approved assets only and keeps the saved review state across rebuilds', () => {
    const approved = X.approvedAssetIds(cast);
    expect(approved).toEqual(new Set(['gideon-executive-portrait-founder-approved', 'gideon-character-sheet-oct22', 'sloane-facial-identity-sheet-oct22', 'sloane-face-lock-board-oct22']));
    const p: X.Directorial.ProductionPlan = rt(plan);
    p.keyframes.push({ ...p.keyframes[0], keyframeId: 'FX-REUSE-OK', source: 'REUSE_APPROVED', reuseOf: 'gideon-character-sheet-oct22', candidates: 0, usedBy: [] });
    p.keyframes.push({ ...p.keyframes[0], keyframeId: 'FX-REUSE-NO', source: 'REUSE_APPROVED', reuseOf: 'vivienne-refinement-v1-oct22', candidates: 0, usedBy: [] });
    expect(D.validateKeyframes(p, approved).map((f) => `${f.code}:${f.subject}`)).toEqual(['KEYFRAME_REUSE:FX-REUSE-NO']);
    const saved = D.decideElement(fresh(), 'S1-01-SH10', 'APPROVED', F, AT, 'the look lands');
    expect(D.reconcileReviewState(saved, fresh()).elements.find((e) => e.elementId === 'S1-01-SH10')!.state).toBe('APPROVED');
    const without10 = D.newReviewState({ ...plan, shots: plan.shots.filter((s) => s.shotId !== 'S1-01-SH10') }, X.S1_01_REVIEW_EXTRAS);
    expect(() => D.reconcileReviewState(saved, without10)).toThrow(/founder history/);
    expect(() => D.reconcileReviewState({ ...saved, unitId: 'S1-02' }, fresh())).toThrow(/belongs to S1-02/);
  });

  it('keeps exactly one unit in founder review and advances only on founder action', () => {
    const ids = X.loadSeasonMaster(root).releases.map((r) => r.id);
    const a = D.initialActiveProduction(ids, 'S1-01');
    expect(D.founderReviewQueue(a)).toEqual(['S1-01']);
    expect(a.units.filter((u) => u.status === 'QUEUED')).toHaveLength(85);
    expect(() => D.advanceProduction(a, { kind: 'ARCHIVE', finalApprovedBy: 'composer-agent', archivePath: 'x' }, F, AT)).toThrow(/founder final approval/);
    expect(() => D.advanceProduction(a, { kind: 'PARK', reason: 'x' }, 'composer-agent', AT)).toThrow(/only the founder/);
    const b = D.advanceProduction(a, { kind: 'ARCHIVE', finalApprovedBy: F, archivePath: 'THE_EXCHANGE/SEASON_1/ARCHIVE/S1-01' }, F, AT);
    expect([b.activeUnit, b.units[0].status, b.history.length]).toEqual(['S1-02', 'ARCHIVED', 2]);
    const c = D.advanceProduction(b, { kind: 'PARK', reason: 'waiting on a location' }, F, AT);
    expect([c.activeUnit, c.units[1].status]).toEqual(['S1-03', 'PARKED']);
  });

  it('surfaces creative choices to the founder instead of answering them', () => {
    const onScreen = new Set(plan.shots.flatMap((s) => s.onScreen));
    expect([...onScreen].sort()).toEqual(['GRANDMOTHER', 'NEIGHBOUR', 'TAILOR', 'TEENAGER', 'WOMAN ON THE BALCONY']);
    expect(plan.dialogue).toEqual([]);
    expect(plan.subtitles.every((s) => s.kind === 'ACCESSIBILITY')).toBe(true);
    const refs = new Set(X.S1_01_DIRECTION.founderDecisions.flatMap((d) => d.refs));
    for (const e of plan.embellishments.filter((x) => x.label === 'FOUNDER_APPROVAL_REQUIRED')) expect(refs.has(e.id), e.id).toBe(true);
    const answered = X.S1_01_DIRECTION.founderDecisions.filter((d) => d.status === 'ANSWERED');
    expect(answered.map((d) => d.decisionId)).toEqual(['FD-S101-06', 'FD-S101-07']);
    for (const d of answered) expect(d.answer, d.decisionId).toMatch(/founder, 2026-10-25/);
    expect(X.S1_01_DIRECTION.founderDecisions.filter((d) => d.status === 'OPEN').every((d) => d.answer === null)).toBe(true);
    expect(D.validateIntent(X.S1_01_DIRECTION.intent)).toEqual([]);
    const k = (id: string) => plan.keyframes.find((x) => x.keyframeId === id)!;
    expect(k('KF-ENV-HALCYON-EXT').spec!.hidden).toEqual(expect.arrayContaining(['facade detail', 'signage']));
    expect(k('KF-ENV-HALCYON-EXT').blockedBy).toEqual(['FD-S101-04']);
    expect(k('KF-EMBER-LOOK').spec!.hidden).toContain('any gold tone');
    expect(plan.lighting.find((l) => l.id === 'LS-BLUE-HOUR')!.palette.some((p) => /gold/i.test(p))).toBe(false);
    const census = X.buildCastCensus(X.loadSeasonMaster(root), X.loadScreenplays(root), cast).filter((p) => p.releases.includes('S1-01'));
    expect(Object.fromEntries(census.map((p) => [p.personId, p.tier]))).toEqual({
      'scene:S1-01:tailor': 'RECURRING_BACKGROUND',
      'scene:S1-01:teenager': 'RECURRING_BACKGROUND',
      'scene:S1-01:grandmother': 'RECURRING_BACKGROUND',
      'scene:S1-01:woman on the balcony': 'SCENE_SCOPED',
      'scene:S1-01:neighbour': 'SCENE_SCOPED',
    });
    expect(X.requestCastPackage({ personId: 'scene:S1-01:tailor', scope: 'PERMANENT', activeReleaseId: 'S1-01' }, census).code).toBe('RECURRING_BACKGROUND_NO_PRINCIPAL_PACKAGE');
    expect(X.requestCastPackage({ personId: 'scene:S1-01:neighbour', scope: 'PERMANENT', activeReleaseId: 'S1-01' }, census).code).toBe('SCENE_SCOPED_NO_PERMANENT_PACKAGE');
    for (const p of X.S1_01_DIRECTION.performance) expect(p.avoid).toEqual(expect.arrayContaining([...D.PERFORMANCE_GLOBAL_AVOID]));
  });

  it('does not label draft-screenplay sound and music as source-established', () => {
    expect(plan.screenplay.status).toMatch(/^DRAFT/);
    const sourced = [...plan.music, ...plan.sound].filter((c) => c.label === 'SOURCE_ESTABLISHED').map((c) => c.cueId);
    expect(sourced).toEqual([]);
  });
});
