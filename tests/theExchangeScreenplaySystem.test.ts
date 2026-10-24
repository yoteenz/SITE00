import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as X from '../shared/site00-fiction-production/index.js';

const root = process.cwd();
const P = X.EXCHANGE_PATHS;
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');
const master = X.loadSeasonMaster(root);
const dialogue = X.loadDialogueRegistry(root);
const assets = X.loadAssetRegistry(root);
const quotes = X.loadPriceQuotes(root);
const docs = X.loadScreenplays(root);
const silentReleases = master.releases.filter((r) => X.silentRelease(master, r.id)).map((r) => r.id);
const ctx = { master, dialogue, assets, silentReleases };
const doc = (id: string) => docs.find((d) => d.meta.identity.releaseId === id)!;
const source = (id: string) => read(doc(id).sourcePath);
const metaBlock = (id: string) => source(id).match(/^---\n[\s\S]*?\n---\n/)![0];
const hard = <F extends { severity: string; check?: string }>(fs_: F[], check?: string) => fs_.filter((f) => f.severity === 'HARD_CONFLICT' && (!check || f.check === check));

describe('THE EXCHANGE screenplay system', () => {
  it('character dialogue registry', () => {
    const findings = X.validateDialogueRegistry(dialogue);
    expect(hard(findings)).toEqual([]);
    expect(findings.every((f) => f.severity !== 'BLOCKER' || f.detail.includes('voice'))).toBe(true);
    const cues = dialogue.characters.map((c) => c.cue);
    expect(new Set(cues).size).toBe(cues.length);
    for (const c of ['SLOANE', 'GIDEON', 'KAI', 'NADINE', 'RICHARD']) expect(cues).toContain(c);
    const kai = X.cueIndex(dialogue).get('KAI')!;
    expect(kai.age).toBe(34);
    expect(String(kai.voiceIdentity)).toMatch(/sarcastic/i);
    expect(String(kai.voiceIdentity)).toMatch(/sincerity/i);
    const avoid = (kai.linguisticPersonality.avoid as string[]).join(' | ');
    for (const term of [/slang/i, /comic relief/i, /stereotype/i, /sexuality/i]) expect(avoid).toMatch(term);
    expect(dialogue.globalRules.join(' ')).toContain('never a quota');
    const linked: Record<string, string> = { SLOANE: 'sLyuEdbnawgNCsS8wQQK', GIDEON: '41wdZQ488o8wXI20MrNC', KAI: 'U22Zv2xBsGGfhZWk4aSy' };
    for (const c of dialogue.characters) {
      expect(c.voiceAsset.voiceId, c.cue).toBe(linked[c.cue] ?? null);
      if (linked[c.cue]) {
        expect(c.voiceAsset.status).toBe('CONNECTOR_VERIFIED');
        expect(c.voiceAsset.evidence?.source).toBe('ChatGPT ElevenLabs connector verification');
        expect(c.voiceAsset.evidence?.composerIndependentVerification).toMatch(/^NOT_PERFORMED/);
      }
    }
    const stripped = structuredClone(dialogue);
    delete stripped.characters.find((c) => c.cue === 'KAI')!.voiceAsset.evidence;
    expect(hard(X.validateDialogueRegistry(stripped)).map((f) => f.detail)).toEqual(['CONNECTOR_VERIFIED voice id without source, date and verification scope']);
    const unverified = structuredClone(dialogue);
    unverified.characters.find((c) => c.cue === 'NADINE')!.voiceAsset.voiceId = 'made-up';
    expect(hard(X.validateDialogueRegistry(unverified)).map((f) => f.detail)).toEqual(['voice id present without verification']);
  });

  it('screenplay schema', () => {
    expect(docs.map((d) => d.meta.identity.releaseId)).toEqual(['S1-01', 'S1-02', 'S1-03', 'S1-04', 'S1-05']);
    for (const d of docs) {
      expect(d.meta.identity.approvalStatus).toBe(X.DRAFT_STATUS);
      expect(hard(X.validateScreenplay(d, ctx)), d.meta.identity.releaseId).toEqual([]);
      for (const section of ['identity', 'story', 'performance', 'visual', 'production', 'continuity', 'editorial']) {
        expect((d.meta as unknown as Record<string, unknown>)[section], section).toBeTruthy();
      }
    }
    expect(X.dialogueLines(doc('S1-01'))).toHaveLength(0);
    expect(silentReleases).toContain('S1-01');
    expect(X.dialogueLines(doc('S1-03')).length).toBeGreaterThan(10);
  });

  it('rejects malformed and unauthorised screenplay drafts', () => {
    expect(() => X.parseExchangeScreenplay('INT. HALCYON HOUSE — NIGHT\n\nNo meta.')).toThrow(X.ScreenplayParseError);
    expect(() => X.parseExchangeScreenplay('---\n{bad json}\n---\nINT. HALCYON HOUSE — NIGHT\n')).toThrow(X.ScreenplayParseError);
    expect(() => X.parseExchangeScreenplay(`${metaBlock('S1-02')}INT. HALCYON HOUSE\n\nNo time of day.\n`)).toThrow(X.ScreenplayParseError);

    const approved = structuredClone(doc('S1-02'));
    approved.meta.identity.approvalStatus = 'APPROVED';
    expect(hard(X.validateScreenplay(approved, ctx), 'APPROVAL')).toHaveLength(1);

    const retitled = structuredClone(doc('S1-02'));
    retitled.meta.identity.title = 'Something Else';
    expect(hard(X.validateScreenplay(retitled, ctx), 'RELEASE')).toHaveLength(1);

    const tagged = X.parseExchangeScreenplay(`${source('S1-02')}\n\n[[CAMEO: a famous face]]\n`, 'memory');
    expect(hard(X.validateScreenplay(tagged, ctx), 'NOTE')).toHaveLength(1);

    const stranger = X.parseExchangeScreenplay(`${source('S1-02')}\n\nSTRANGER\nHello there.\n`, 'memory');
    expect(hard(X.validateScreenplay(stranger, ctx), 'VOICE')).toHaveLength(1);

    const talking = X.parseExchangeScreenplay(`${source('S1-01')}\n\nSLOANE\nHello.\n`, 'memory');
    expect(hard(X.validateScreenplay(talking, ctx), 'PERFORMABILITY').length).toBeGreaterThan(0);
  });

  it('runtime estimation', () => {
    for (const d of docs) {
      const rt = X.estimateRuntime(d);
      expect(rt.band, `${rt.releaseId} ${rt.ratio}`).toBe('ON_TARGET');
      expect(rt.targetSec).toBe(master.releases.find((r) => r.id === rt.releaseId)!.runtimeTargetSec);
    }
    const body = "INT. SLOANE'S APARTMENT — BEDROOM — NIGHT\n\nSloane stands at the mirror.\n\n[[TIME: 25]]\n\nSLOANE\n(beat)\nOne two three four five six seven eight nine ten.\n\n[[FREEZE: SLOANE LOCKWOOD.]]\n";
    const synthetic = X.parseExchangeScreenplay(`${metaBlock('S1-02')}${body}`, 'memory');
    expect(X.estimateRuntime(synthetic).estimatedSec).toBe(25 + 4 + 1 + 2.5);
    expect(X.pacingBand(0.84)).toBe('UNDER');
    expect(X.pacingBand(1)).toBe('ON_TARGET');
    expect(X.pacingBand(1.2)).toBe('OVER');
    expect(X.pacingBand(1.31)).toBe('HIGH_RISK');
  });

  it('script-to-shot', () => {
    const SHOT_FIELDS = ['shotId', 'releaseId', 'sceneId', 'purpose', 'onScreen', 'framing', 'movement', 'blocking', 'dialogueRefs', 'durationSec', 'startFrameRef', 'endFrameRef', 'wardrobeState', 'setRef', 'propState', 'movementConstraints', 'technicalComplexity', 'generationProvider', 'generationStatus', 'approvalStatus', 'estimatedCost', 'actualCost'];
    for (const d of docs) {
      const id = d.meta.identity.releaseId;
      const plan = X.planShots(d, assets, quotes);
      const rt = X.estimateRuntime(d);
      expect(Math.abs(plan.totalSec - rt.estimatedSec), id).toBeLessThan(0.2);
      expect(plan.shots[0].type).toBe('ESTABLISHING');
      expect(new Set(plan.shots.map((s) => s.shotId)).size).toBe(plan.shots.length);
      for (const s of plan.shots) {
        for (const f of SHOT_FIELDS) expect(s, `${s.shotId}.${f}`).toHaveProperty(f);
        expect(s.shotId.startsWith(`${s.sceneId}-SH`)).toBe(true);
        expect(s.durationSec).toBeLessThanOrEqual(X.MAX_GENERATION_SEC);
        expect(s.generationStatus).toBe('NOT_STARTED');
        expect(s.actualCost).toBeNull();
      }
      plan.shots.forEach((s, i) => {
        if (s.endFrameRef) expect(plan.shots[i + 1].startFrameRef).toBe(s.endFrameRef);
      });
      for (const sc of rt.scenes) if (sc.estimatedSec > X.MAX_GENERATION_SEC) expect(plan.shots.filter((s) => s.sceneId === sc.sceneId).length, sc.sceneId).toBeGreaterThan(1);
      const covered = new Set(plan.shots.flatMap((s) => s.dialogueRefs));
      for (const l of X.dialogueLines(d)) expect(covered.has(l.lineId), l.lineId).toBe(true);

      const stored = JSON.parse(read(`${P.shotLists}/${id}.json`)) as { screenplay: { sha256: string }; shots: unknown[]; status: string };
      expect(stored.status).toBe(X.DRAFT_STATUS);
      expect(stored.screenplay.sha256).toBe(createHash('sha256').update(read(d.sourcePath)).digest('hex'));
      expect(stored.shots).toEqual(JSON.parse(JSON.stringify(plan.shots)));
    }
    const types = new Set(docs.flatMap((d) => X.planShots(d, assets, quotes).shots.map((s) => s.type)));
    for (const t of ['ESTABLISHING', 'DIALOGUE', 'REACTION', 'INSERT', 'FREEZE_FRAME']) expect(types, t).toContain(t);

    const long = X.parseExchangeScreenplay(`${metaBlock('S1-02')}INT. SLOANE'S APARTMENT — BEDROOM — NIGHT\n\nSloane stands at the mirror for a long time.\n\n[[TIME: 25]]\n`, 'memory');
    const split = X.planShots(long, assets, quotes).shots;
    expect(split).toHaveLength(3);
    expect(split[0].endFrameRef).toBe(split[1].startFrameRef);
    expect(split[1].endFrameRef).toBe(split[2].startFrameRef);
    expect(split[2].endFrameRef).toBeNull();
  });

  it('continuity engine flags without rewriting', () => {
    const before = JSON.stringify(docs);
    const findings = X.validateContinuity({ master, dialogue, assets, screenplays: docs });
    expect(JSON.stringify(docs)).toBe(before);
    expect(hard(findings)).toEqual([]);
    for (const c of X.CONTINUITY_CHECKS) expect(typeof c).toBe('string');
    expect(findings.filter((f) => f.severity === 'OPEN_QUESTION').length).toBeGreaterThan(0);

    const leak = X.parseExchangeScreenplay(`${source('S1-02')}\n\nSLOANE\nThis season is my last.\n`, doc('S1-02').sourcePath);
    const leaked = X.validateContinuity({ master, dialogue, assets, screenplays: docs.map((d) => (d.meta.identity.releaseId === 'S1-02' ? leak : d)) });
    expect(hard(leaked, 'KNOWLEDGE_AND_REVEALS').length).toBeGreaterThan(0);

    const ember = X.parseExchangeScreenplay(`${source('S1-02')}\n\nThe ember flares gold.\n`, doc('S1-02').sourcePath);
    const golden = X.validateContinuity({ master, dialogue, assets, screenplays: docs.map((d) => (d.meta.identity.releaseId === 'S1-02' ? ember : d)) });
    expect(hard(golden, 'EMBER_RULE')).toHaveLength(1);

    const stored = JSON.parse(read(P.continuityReport)) as { summary: { hardConflicts: number } };
    expect(stored.summary.hardConflicts).toBe(0);
  });
});
