import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as X from '../shared/site00-fiction-production/index.js';

const root = process.cwd();
const P = X.EXCHANGE_PATHS;
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');
const readJson = <T>(rel: string) => JSON.parse(read(rel)) as T;
const sha = (abs: string) => createHash('sha256').update(fs.readFileSync(abs)).digest('hex');
const master = X.loadSeasonMaster(root);
const release = (id: string) => master.releases.find((r) => r.id === id)!;
const beats = (id: string) => {
  const r = release(id);
  return [r.openingHook.text, r.narrativeDevelopment, r.payoff, r.endingTransition].join('\n');
};
const ledger = readJson<{ seasonDecisions: X.LedgerEntry[]; recommendations: X.LedgerEntry[]; characterDecisions: X.LedgerEntry[] }>(P.ledger);
const allEntries = [...ledger.seasonDecisions, ...ledger.recommendations, ...ledger.characterDecisions];
const baselineIds = X.parseCsv(read(P.baselineCsv)).map((r) => r.ID);

describe('THE EXCHANGE Season 1 founder canon lock', () => {
  it('canonical promotion', () => {
    const byId = new Map(allEntries.map((e) => [e.entryId, e]));
    expect(byId.get('PL-S1')?.classification).toBe('APPROVED_CANON');
    expect(byId.get('PL-S2')?.classification).toBe('APPROVED_CANON');
    expect(byId.get('PL-S3')?.classification).toBe('APPROVED_CANON');
    for (const nr of Array.from({ length: 11 }, (_, i) => `NR-${i + 1}`)) {
      expect(allEntries.some((e) => new RegExp(`\\b${nr}\\b`).test(e.subject)), nr).toBe(true);
    }
    for (const e of allEntries) {
      expect(X.CANON_CLASSIFICATIONS).toContain(e.classification);
      expect(e.source.length, e.entryId).toBeGreaterThan(0);
      expect(e.founderApproval).toContain(X.FOUNDER_APPROVAL.sprint);
      expect(e.implementation.length, e.entryId).toBeGreaterThan(0);
      expect(e.validation.length, e.entryId).toBeGreaterThan(0);
    }
    expect(readJson(P.ledger)).toEqual(JSON.parse(JSON.stringify(X.buildPromotionLedger())));

    const matrix = readJson<{ topics: Array<{ topic: string; classification: string; promotedBy?: string }>; classificationDefinitions: Record<string, string> }>(P.approvalMatrix);
    expect(matrix.topics.find((t) => t.topic.includes('42–45'))?.classification).toBe('APPROVED_CANON');
    for (const t of X.sprintTopics()) expect(matrix.topics.some((m) => m.topic === t.topic && m.classification === t.classification), t.topic).toBe(true);
    for (const c of X.CANON_CLASSIFICATIONS) expect(matrix.classificationDefinitions[c], c).toBeTruthy();
    expect(matrix.topics.filter((t) => t.promotedBy !== X.FOUNDER_APPROVAL.sprint).length).toBeGreaterThan(0);
  });

  it('historical version preservation', () => {
    const archives = readJson<{ archives: Array<{ folder: string; fileCount: number; classification: string }> }>(P.historyArchives);
    expect(archives.archives).toHaveLength(3);
    for (const a of archives.archives) {
      const dir = path.join(root, P.history, a.folder);
      const lines = fs.readFileSync(path.join(dir, 'MANIFEST_SHA256.txt'), 'utf8').trim().split('\n');
      const files = fs.readdirSync(dir);
      expect(files.length, a.folder).toBe(a.fileCount);
      const listed = lines.map((line) => {
        const [hash, file] = line.split(/\s+\*?/);
        expect(sha(path.join(dir, file)), `${a.folder}/${file}`).toBe(hash);
        return file;
      });
      expect([...listed, 'MANIFEST_SHA256.txt'].sort()).toEqual([...files].sort());
    }
    expect(master.history.map((h) => h.classification)).toEqual(['HISTORICAL_SUPERSEDED', 'HISTORICAL_SUPERSEDED']);
    expect(master.sourceDocument.sha256).toBe(sha(path.join(root, P.optionACsv)));
  });

  it('86-release master integrity', () => {
    const findings = X.validateSeasonMaster(master, baselineIds);
    for (const f of findings) expect(f.ok, `${f.check}: ${f.detail}`).toBe(true);
    expect(master.releases).toHaveLength(X.APPROVED_RELEASE_COUNT);
    expect(master.structure.runtimeTotal).toBe(X.APPROVED_RUNTIME);
    expect(master.releases.reduce((a, r) => a + r.runtimeTargetSec, 0)).toBe(master.structure.runtimeTotalSec);
    for (const r of master.releases) {
      for (const v of [r.title, r.fictionalDay, r.setting, r.openingHook.text, r.narrativeDevelopment, r.payoff, r.endingTransition, r.lineage.founderApproval]) {
        expect(typeof v === 'string' && v.trim().length > 0, r.id).toBe(true);
      }
      expect(r.layers.length, r.id).toBeGreaterThan(0);
      expect(X.CANON_CLASSIFICATIONS).toContain(r.classification);
    }
    expect(master).toEqual(JSON.parse(JSON.stringify(X.buildSeasonMaster(root))));
    expect(read(P.masterCsv)).toBe(X.masterCsv(master));
  });

  it('adds no releases against BASELINE V1', () => {
    expect(baselineIds).toHaveLength(86);
    expect(master.releases.map((r) => r.id)).toEqual(baselineIds);
    expect(fs.readdirSync(path.join(root, P.screenplays)).filter((f) => f.endsWith('.fountain'))).toHaveLength(5);
  });

  it('approved Nights placement', () => {
    for (const [id, title] of Object.entries(X.APPROVED_NIGHTS)) {
      expect(release(id).title).toBe(title);
      expect(release(id).exchangeNight).toBe(true);
      expect(release(id).layers).toContain('N');
    }
    expect(X.longestRunWithout(master, 'N').length).toBeLessThanOrEqual(X.APPROVED_MAX_NIGHT_GAP);
  });

  it('recurring patron scenario retention', () => {
    const where = (px: string) => master.releases.filter((r) => r.patronScenarios.includes(px)).map((r) => r.id);
    expect(new Set(master.releases.flatMap((r) => r.patronScenarios)).size).toBe(10);
    expect(where('PX-04')).toEqual(expect.arrayContaining(['S1-62', 'S1-64', 'S1-72']));
    expect(where('PX-05')).toEqual(expect.arrayContaining(['S1-12', 'S1-20']));
    expect(where('PX-07')).toEqual(expect.arrayContaining(['S1-37', 'S1-40']));
    expect(where('PX-08')).toContain('S1-51');
    expect(beats('S1-45')).toContain("Don't let me near it");
    expect(beats('S1-45')).not.toContain('apology for the toast');
  });

  it('Hybrid H continuity', () => {
    const s1 = master.releases.filter((r) => r.lineage.s1Dependent);
    expect(s1.map((r) => r.id)).toEqual([...X.S1_DEPENDENT_RELEASES]);
    for (const r of s1) expect(r.lineage.changeVsV1).toBe('REVISED_S1_DEPENDENT');
    expect(beats('S1-75')).toContain('Living Legacy');
    expect(release('S1-75').lineage.changeVsV1).toBe('UNCHANGED');
    expect(beats('S1-83')).toContain('Show her in');
    const k3 = X.KNOWLEDGE_FACTS.find((f) => f.factId === 'KF-03')!;
    expect(k3.classification).toBe('APPROVED_CANON');
    expect(beats('S1-20')).toMatch(/Bunny/);
    expect(beats('S1-54')).toContain('Rich told me');
  });

  it('superseded Plan C status', () => {
    expect(ledger.recommendations.find((e) => e.entryId === 'PL-NR-7')?.classification).toBe('HISTORICAL_SUPERSEDED');
    const hybrid = master.history.find((h) => h.path === P.hybridCsv)!;
    expect(hybrid.classification).toBe('HISTORICAL_SUPERSEDED');
    expect(hybrid.role).toContain('Plan');
    expect(X.parseCsv(read(P.hybridCsv))).toHaveLength(74);
  });

  it('81-release fallback preservation', () => {
    expect(X.parseCsv(read(P.optionBCsv))).toHaveLength(81);
    expect(master.fallback.releaseCount).toBe(81);
    expect(master.fallback.status).toContain('INACTIVE');
    expect(ledger.seasonDecisions.find((e) => e.entryId === 'PL-S2-FB')?.classification).toBe('APPROVED_DEVELOPMENT_DIRECTION');
    expect(master.releases).toHaveLength(86);
  });

  it('structural stress-test regression never upgrades a PARTIAL without evidence', () => {
    const findings = X.validateContinuity({ master, dialogue: X.loadDialogueRegistry(root), assets: X.loadAssetRegistry(root), screenplays: X.loadScreenplays(root) });
    const reg = X.runStressRegression(master, findings, root);
    expect(reg.prior).toEqual({ PASS: 24, PARTIAL: 8, FAIL: 0 });
    expect(reg.current).toEqual({ PASS: 24, PARTIAL: 8, FAIL: 0 });
    expect(reg.upgrades).toEqual([]);
    expect(reg.rows).toHaveLength(32);
    const stored = readJson<{ current: unknown; upgrades: unknown }>(P.stressRegression);
    expect(stored.current).toEqual(reg.current);
    expect(stored.upgrades).toEqual([]);
  });
});
