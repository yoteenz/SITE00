import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as X from '../shared/site00-fiction-production/index.js';

const root = process.cwd();
const P = X.EXCHANGE_PATHS;
const readJson = <T>(rel: string) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')) as T;
const dialogue = X.loadDialogueRegistry(root);
const assets = X.loadAssetRegistry(root);
const edits = X.loadCastEdits(root);
const approvals = readJson<X.ApprovalBook>(P.approvals);
const visual = readJson<{ characters: Array<{ characterId: string; canonicalName: string }> }>(P.visualRegistry);
const build = (log = edits) => X.buildCastRegistry({ dialogue, assets, visual, edits: log, approvals });
const cast = build();
const of = (id: string) => cast.characters.find((c) => c.characterId === id)!;
const hard = (fs_: X.CastFinding[]) => fs_.filter((f) => f.severity === 'HARD_CONFLICT').map((f) => f.detail);
const VOICES = { 'sloane-lockwood': 'sLyuEdbnawgNCsS8wQQK', 'gideon-shaw': '41wdZQ488o8wXI20MrNC', 'kai-fontaine': 'U22Zv2xBsGGfhZWk4aSy' } as const;

describe('THE EXCHANGE cast registry', () => {
  it('covers every character in the existing registries and matches the committed file', () => {
    const ids = new Set([...dialogue.characters, ...assets.characters, ...visual.characters].map((c) => c.characterId));
    expect(cast.characters.map((c) => c.characterId)).toEqual([...ids].sort());
    const committed = readJson<X.CastRegistry & { findings: X.CastFinding[] }>(X.CAST_REGISTRY_PATH);
    expect(JSON.parse(JSON.stringify(committed.characters))).toEqual(JSON.parse(JSON.stringify(cast.characters)));
    expect(committed.findings).toEqual(X.validateCastRegistry(cast, edits, dialogue, assets, root));
  });

  it('links the three founder voices as connector-derived evidence, never as a provider sync', () => {
    for (const [id, voiceId] of Object.entries(VOICES)) {
      const c = of(id);
      expect(c.voice).toMatchObject({ provider: 'ElevenLabs', voiceId, status: 'CONNECTOR_VERIFIED', externalSync: 'NOT_SUPPORTED' });
      expect(c.fields.voiceId).toMatchObject({ value: voiceId, owner: 'DIALOGUE_REGISTRY', status: 'RECORDED' });
      expect(assets.characters.find((a) => a.characterId === id)!.voice.voiceAssetId).toBe(voiceId);
      const rec = X.findRecords(approvals, 'CHARACTER_VOICE', id)[0];
      expect(rec).toMatchObject({ state: 'APPROVED', actor: 'founder' });
      expect(rec.note).toContain('Identity only');
    }
    for (const id of ['nadine-lockwood', 'richard-lockwood', 'royce-bell']) expect(of(id).voice?.voiceId ?? null).toBeNull();
    expect(cast.rules.join(' ')).toContain('never updates the ElevenLabs voice library');
    for (const c of cast.characters) expect(c.fields.approvedAudioTakes.value).toBeNull();
  });

  it('reads owner fields through from their registries and keeps version history', () => {
    expect(of('kai-fontaine').fields.heightAndProportions).toMatchObject({ owner: 'ASSET_REGISTRY', value: assets.characters.find((a) => a.cue === 'KAI')!.bodyProportions });
    expect(of('kai-fontaine').fields.age).toMatchObject({ owner: 'DIALOGUE_REGISTRY', value: 34 });
    expect(of('kai-fontaine').fields.facialMasters.status).toBe('NO_OWNER_RECORD');
    expect(of('vivienne-lockwood').fields.displayName.status).toBe('NO_OWNER_RECORD');
    for (const c of cast.characters) expect(c.version).toBe(1 + edits.edits.filter((e) => e.characterId === c.characterId).length);
    expect(of('gideon-shaw').history.map((h) => h.field)).toEqual(['voiceId', 'personality', 'angleReferences', 'wardrobeReferences', 'fashionPreferences']);
    const later: X.CastEditLog = { ...edits, edits: [...edits.edits, { ...edits.edits[5], editId: 'CE-9999', at: '2026-10-25T00:00Z', to: 'Revised.' }] };
    expect(build(later).characters.find((c) => c.characterId === 'kai-fontaine')!.fields.personality.value).toBe('Revised.');
    expect(of('kai-fontaine').fields.voiceTags.status).toBe('NOT_IMPORTED');
  });

  it('reconciles visual references without inventing assets', () => {
    expect(hard(X.validateCastRegistry(cast, edits, dialogue, assets, root))).toEqual([]);
    const refs = (id: string, f: 'angleReferences' | 'wardrobeReferences') => of(id).fields[f].value as X.CastAssetRef[];
    expect(refs('gideon-shaw', 'wardrobeReferences')[0]).toMatchObject({ status: 'APPROVED', assetId: 'gideon-character-sheet-oct22' });
    expect(refs('gideon-shaw', 'angleReferences')).toHaveLength(5);
    const kai = [...refs('kai-fontaine', 'angleReferences'), ...refs('kai-fontaine', 'wardrobeReferences')];
    expect(kai).toHaveLength(11);
    for (const r of kai) expect(r).toMatchObject({ status: 'UNIMPORTED', assetId: null, repoPath: null, sha256: null });
    const blockers = X.validateCastRegistry(cast, edits, dialogue, assets, root).filter((f) => f.severity === 'BLOCKER');
    expect(blockers.filter((b) => b.subject === 'kai-fontaine')).toHaveLength(11);
    expect(blockers.filter((b) => b.subject === 'sloane-lockwood')).toHaveLength(1);
  });

  it('rejects fabricated hashes, phantom files and invented approvals', () => {
    const tamper = (fn: (log: X.CastEditLog) => void) => {
      const log = structuredClone(edits);
      fn(log);
      return hard(X.validateCastRegistry(build(log), log, dialogue, assets, root));
    };
    const sloaneBoard = (log: X.CastEditLog) => (log.edits.find((e) => e.editId === 'CE-0010')!.to as X.CastAssetRef[])[3];
    expect(tamper((l) => (sloaneBoard(l).sha256 = `${sloaneBoard(l).sha256!.slice(0, 12)}${'0'.repeat(52)}`))).toEqual(['Expression range: intensity, amusement, vulnerability, composure: recorded sha256 does not match THE_EXCHANGE/FOUNDER_SOURCE/CHARACTER_VISUAL_HANDOFF_OCT22_2026/assets/sloane_face_lock_board.jpeg']);
    expect(tamper((l) => (sloaneBoard(l).repoPath = 'THE_EXCHANGE/NOT_HERE.jpeg')).join(' ')).toContain('is not in the repository');
    expect(tamper((l) => ((l.edits.find((e) => e.editId === 'CE-0012')!.to as X.CastAssetRef[])[0].sha256 = 'abc')).join(' ')).toContain('an unimported asset cannot carry a path, hash or id');
    expect(tamper((l) => ((l.edits.find((e) => e.editId === 'CE-0012')!.to as X.CastAssetRef[])[0].status = 'APPROVED')).join(' ')).toContain("APPROVED must point at one of this character's approved visual registry assets");
    expect(tamper((l) => (l.edits[1].reason = ' '))).toContain('every edit records a reason and a source');
    expect(tamper((l) => (l.edits[3].at = '2026-10-23T00:00Z'))).toContain('edit log is append-only and in time order');
    expect(tamper((l) => (l.edits[4].field = 'shoeSize'))).toContain('unknown field shoeSize');
    const split = structuredClone(assets);
    split.characters.find((a) => a.cue === 'KAI')!.voice.voiceAssetId = 'something-else';
    expect(hard(X.validateCastRegistry(cast, edits, dialogue, split, root))).toContain('dialogue and asset registries disagree on the voice id');
  });
});
