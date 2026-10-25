import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as X from '../shared/site00-fiction-production/index.js';
import { buildS101AlignmentDocs, S101_ALIGNMENT_DOCS_DIR } from '../scripts/the-exchange/s101-alignment/build.js';

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');
const P = X.Promotion;
const PACKET = 'THE_EXCHANGE/SEASON_1/PRODUCTION_SCENES/S1-01/DIRECTORIAL_PACKET_V1.json';
const packet = JSON.parse(read(PACKET)) as {
  sections: {
    '3_DIRECTORS_TREATMENT': { embellishments: Array<{ id: string; description: string; label: string; affects: string[] }> };
    '6_CHARACTERS_AND_ASSETS': { cast: { people: Array<{ personId: string; tier: string }>; rule: string }; forwardReferences: { note: string; references: X.Directorial.ForwardReference[] } };
    '9_FOUNDER_DECISIONS': Array<{ decisionId: string; status: string; answer: string | null; note?: string; progress?: string[] }>;
  };
};
const plan = X.directedSceneBundle('S1-01', root).direction.plan;
const decision = (id: string) => packet.sections['9_FOUNDER_DECISIONS'].find((d) => d.decisionId === id)!;
const emb = (id: string) => packet.sections['3_DIRECTORS_TREATMENT'].embellishments.find((e) => e.id === id)!;
const kf = (id: string) => plan.keyframes.find((k) => k.keyframeId === id)!;

describe('THE EXCHANGE S1-01 packet alignment (PATCH-S101-01 to -07)', () => {
  it('applies exactly seven founder-authorized patches, and every validator passes', () => {
    expect(P.S101_PATCH.map((x) => x.patchId)).toEqual(['PATCH-S101-01', 'PATCH-S101-02', 'PATCH-S101-03', 'PATCH-S101-04', 'PATCH-S101-05', 'PATCH-S101-06', 'PATCH-S101-07']);
    expect(P.S101_PATCH.every((x) => x.status === 'APPLIED_FOUNDER_AUTHORIZED' && x.applied)).toBe(true);
    expect(P.promotionErrors(P.validatePromotion(root))).toEqual([]);
    expect(X.Audit.validateAudit(root).flatMap((c) => c.errors)).toEqual([]);
  });

  it('classifies the three returning inhabitants as recurring background and keeps the other two scene-scoped', () => {
    const tiers = Object.fromEntries(packet.sections['6_CHARACTERS_AND_ASSETS'].cast.people.map((p) => [p.personId, p.tier]));
    expect(tiers).toEqual({ ...Object.fromEntries(Object.entries(P.S101_TIERS).map(([id, f]) => [id, f[0]])) });
    expect(decision('FD-S101-06')).toMatchObject({ status: 'ANSWERED' });
    expect(decision('FD-S101-06').answer).toMatch(/^RECURRING \(founder, 2026-10-25\)/);
    expect(packet.sections['6_CHARACTERS_AND_ASSETS'].cast.rule).toMatch(/no voice, biography or principal package/);
    for (const b of P.BACKGROUND_IDENTITIES) expect(b.name, b.identityId).toBeNull();
  });

  it('keeps the tailor anonymous: not Wendell Ames, no name, no sign', () => {
    expect(decision('FD-S101-07').answer).toBe('No: an unnamed tailor (ANONYMOUS, founder, 2026-10-25). The shop sign stays unreadable.');
    expect(emb('E-10')).toMatchObject({ label: 'FOUNDER_DECIDED', description: 'The tailor is anonymous (FD-S101-07). He is not Wendell Ames and has no biography.' });
    expect(P.PROMOTION_DATA.approvedIds).not.toContain('C-01');
    expect(P.PROMOTION_DATA.approvedIds).not.toContain('R-12');
    const mentions = read(PACKET).match(/Wendell/g) ?? [];
    expect(mentions.length).toBe((read(PACKET).match(/not Wendell Ames|Is the tailor Wendell Ames\?|Yes: Wendell Ames, 58, Ferry Street|Season master names Wendell Ames/g) ?? []).length);
  });

  it('keeps the grandmother as the S1-59 speaking grandmother, with her face reference on her first face-readable frame', () => {
    const g = P.BACKGROUND_IDENTITIES.find((b) => b.identityId === 'BG-S101-GRANDMOTHER')!;
    expect(g.dialogue).toEqual([{ releaseId: 'S1-59', line: "Something good. They're humming.", source: expect.any(String) }]);
    expect(g.facialReference.keyframeId).toBe('KF-SF-SH10');
    expect(kf('KF-SF-SH10').spec!.characterPlacement).toMatch(/Face/);
    expect(kf('KF-SF-SH09').spec!.hidden).toContain('her face');
    expect(kf('KF-SF-SH10').reusableBeyondUnit.join(' ')).toMatch(/S1-59 \(R-01\).*S1-77 \(R-02\)/);
    expect(kf('KF-SF-SH09').reusableBeyondUnit).toEqual([]);
  });

  it('keeps the jewel-green dress one undesigned garment, blocked by FD-S101-05', () => {
    const fd05 = decision('FD-S101-05');
    expect(fd05.status).toBe('OPEN');
    expect(fd05.progress).toEqual(['STORY_CONTINUITY_APPROVED', 'VISUAL_DESIGN_PENDING']);
    expect(fd05.note).toMatch(/No candidate is chosen\.$/);
    expect(fd05.note).not.toMatch(/satin|bias-cut|cocktail/i);
    expect(kf('KF-WD-GREEN-DRESS').blockedBy).toEqual(['FD-S101-05']);
    expect(emb('E-08').affects).toEqual(['KF-WD-GREEN-DRESS', 'S1-01-SH08', 'S1-01-SH09', 'S1-01-SH10', 'S1-01-SH17']);
  });

  it("attaches the four-count step to SH05 to SH07 without choreographing it or changing a frame", () => {
    expect(emb('E-14')).toMatchObject({ label: 'FOUNDER_APPROVAL_REQUIRED', affects: ['S1-01-SH05', 'S1-01-SH06', 'S1-01-SH07'] });
    expect(decision('FD-S101-12')).toMatchObject({ status: 'OPEN', answer: null });
    expect(kf('KF-SF-SH05').blockedBy).toEqual(['FD-S101-12']);
    expect(plan.shots.find((s) => s.shotId === 'S1-01-SH05')!.blocking).toBe('He tries the four-count step and stumbles out of it.');
    expect(emb('E-06').description).toMatch(/downbeat/);
    expect(plan.shots.find((s) => s.shotId === 'S1-01-SH07')!.continuityRisk).toContain('Landing must sit on frame 324');
    expect(P.PRODUCTION_HOLDS.find((h) => h.holdId === 'HOLD-FD-S101-12')!.blocks).toEqual(['S-02', 'R-04']);
  });

  it('names the forward callbacks, in public places, with nobody meeting and no new dialogue', () => {
    const fwd = packet.sections['6_CHARACTERS_AND_ASSETS'].forwardReferences;
    expect(fwd.references.map((r) => `${r.subject} ${r.releaseId} ${r.proposalId}`)).toEqual(['GRANDMOTHER S1-59 R-01', 'GRANDMOTHER S1-77 R-02', 'TAILOR S1-77 R-03', 'TEENAGER S1-51 R-04']);
    expect(fwd.note).toMatch(/None of them meet, and none is named\.$/);
    const text = JSON.stringify(fwd);
    expect(text).not.toMatch(/Exchange Night|invitation(?!s? implied)|invited/i);
    expect(text).not.toMatch(/"[^"]*humming[^"]*"/);
    expect(plan.dialogue).toEqual([]);
  });

  it('preserves the protected baseline: 45 s, 1,080 frames, 19 shots in order, cues, 86 releases, 127:40', () => {
    const g = P.S101_GUARDS.baseline;
    expect([plan.durationFrames, plan.fps, plan.durationFrames / plan.fps]).toEqual([g.frames, g.fps, g.durationSec]);
    expect(plan.shots.map((s) => s.shotId)).toEqual(Array.from({ length: 19 }, (_, i) => `S1-01-SH${String(i + 1).padStart(2, '0')}`));
    expect(plan.keyframes).toHaveLength(g.keyframes);
    expect(plan.music.filter((m) => m.cueType !== 'SILENCE')).toHaveLength(g.musicCues);
    expect(plan.music.filter((m) => m.cueType === 'SILENCE')).toHaveLength(g.silences);
    expect(plan.sound).toHaveLength(g.soundCues);
    expect(plan.screenplay.status).toMatch(/^DRAFT/);
    const master = X.loadSeasonMaster(root);
    expect([master.releases.length, master.structure.runtimeTotalSec]).toEqual([86, 7660]);
    expect(P.RECONCILIATION.filter((r) => r.founderDecision === 'PENDING_FOUNDER')).toHaveLength(53);
    for (const f of X.Audit.PROTECTED_BASELINE.filter((x) => x.path.endsWith('.fountain'))) expect(X.Audit.baselineState(f, root), f.path).toBe('UNCHANGED');
  });

  it('commits the rebuilt S1-01 files exactly as the source builds them', () => {
    const b = X.directedSceneBundle('S1-01', root);
    expect(JSON.parse(read(X.scenePath('S1-01', X.SCENE_FILES.shotList)))).toEqual(JSON.parse(JSON.stringify(b.shotList)));
    expect(read(X.scenePath('S1-01', X.SCENE_FILES.shotListCsv))).toBe(b.shotListCsv);
    for (const [p, sha] of Object.entries(X.Audit.FOUNDER_S101_PATCH_BASELINE)) expect(X.Audit.sha256(X.repoPath(p, root)), p).toBe(sha);
  });

  it('commits deliverables 03 and 04 exactly as rendered', () => {
    for (const [name, body] of Object.entries(buildS101AlignmentDocs(root))) expect(read(`${S101_ALIGNMENT_DOCS_DIR}/${name}`), name).toBe(body);
  });
});
