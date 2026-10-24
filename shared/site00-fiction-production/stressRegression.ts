import fs from 'node:fs';
import { CANONICAL_AGES, APPROVED_MAX_NIGHT_GAP } from './founderDecisions.js';
import type { ContinuityFinding } from './continuity.js';
import { EXCHANGE_PATHS, repoPath } from './paths.js';
import { longestRunWithout } from './seasonMaster.js';
import type { SeasonMaster } from './types.js';

export type Verdict = 'PASS' | 'PARTIAL' | 'FAIL';
export type PriorQuestion = { id: string; question: string; verdict: Verdict };

export function parsePriorStressTest(root = process.cwd()): PriorQuestion[] {
  const text = fs.readFileSync(repoPath(EXCHANGE_PATHS.stressTest, root), 'utf8');
  return [...text.matchAll(/^\*\*(T\d{2})\. (.+?) (PASS|PARTIAL|FAIL)\.\*\*/gm)].map((m) => ({ id: m[1], question: m[2], verdict: m[3] as Verdict }));
}

type Check = { ok: boolean; evidence: string };

const has = (m: SeasonMaster, id: string, phrase: string) => {
  const r = m.releases.find((x) => x.id === id);
  if (!r) return false;
  return [r.openingHook.text, r.narrativeDevelopment, r.payoff, r.endingTransition].join('\n').replace(/\*/g, '').includes(phrase);
};

/** Questions whose prior verdict can be re-derived from the approved master and the continuity report. */
export function computedChecks(m: SeasonMaster, findings: ContinuityFinding[]): Record<string, Check> {
  const hard = (check: string) => findings.filter((f) => f.check === check && f.severity === 'HARD_CONFLICT').length;
  const run = longestRunWithout(m, 'N');
  const px = new Set(m.releases.flatMap((r) => r.patronScenarios));
  return {
    T04: { ok: has(m, 'S1-75', 'impossible') || has(m, 'S1-80', 'impossible ones'), evidence: 'S1-80 "The impossible ones. I still want the impossible ones."; S1-83 "Show her in".' },
    T05: { ok: px.size === 10, evidence: `${px.size} patron scenarios carried in the master.` },
    T19: { ok: has(m, 'S1-31', 'told last') && has(m, 'S1-61', 'Nadine. I need you.') && has(m, 'S1-74', 'asking, properly'), evidence: 'S1-31, S1-61 and S1-74 lines present.' },
    T20: { ok: hard('PLATONIC_GIDEON_SLOANE') === 0 && CANONICAL_AGES.Gideon.age === 44, evidence: `Platonic check hard conflicts: ${hard('PLATONIC_GIDEON_SLOANE')}; Gideon ${CANONICAL_AGES.Gideon.age}.` },
    T23: { ok: run.length <= APPROVED_MAX_NIGHT_GAP, evidence: `Longest run without a Night: ${run.length} (${run.from}–${run.to}).` },
    T24: { ok: /Bunny/.test(m.releases[19].narrativeDevelopment) && has(m, 'S1-54', 'Rich told me') && has(m, 'S1-55', 'He told Bunny'), evidence: 'Richard and Bunny at S1-20; chain paid off in S1-54 and S1-55.' },
    T25: { ok: hard('KNOWLEDGE_AND_REVEALS') === 0, evidence: `Knowledge-ledger leaks: ${hard('KNOWLEDGE_AND_REVEALS')}.` },
    T30: {
      ok: hard('AGES') + hard('FAMILY_CHRONOLOGY') + hard('WARDROBE') === 0 && m.releases.every((r, i) => i === 0 || r.dayOffsetStart >= m.releases[i - 1].dayOffsetStart),
      evidence: `Age, chronology and wardrobe hard conflicts: ${hard('AGES') + hard('FAMILY_CHRONOLOGY') + hard('WARDROBE')}; fictional days monotone.`,
    },
    T31: { ok: has(m, 'S1-83', 'Show her in'), evidence: 'S1-83 keeps "Show her in".' },
  };
}

/** What this sprint changed for each prior PARTIAL. None is upgraded without computed evidence. */
export const PARTIAL_NOTES: Record<string, string> = {
  T02: 'Unchanged. The first five screenplays add no mystery strand; the load is judged again when Arc 1 is fully scripted.',
  T08: 'The founder accepted the +1:50 with Option A (S-2). Momentum risk in Arc 3 is unchanged until an edit exists.',
  T13: 'The dialogue registry now forbids slang quotas, comic relief and stereotype for every voice. Still needs a cultural review of finished scripts.',
  T17: 'NR-8 beats are now in the master as PROVISIONAL_IMPLEMENTATION (S1-43, S1-81). Stays PARTIAL until the founder confirms the placements (FC-02) and the looks are designed (U-4).',
  T18: "Kai's style direction is founder-approved. Nadine's, Gideon's and Richard's styles are still unspecified (U-4).",
  T22: 'Unchanged. Arc 5 still has no Exchange-hosted gathering beyond the rehearsal.',
  T28: "The Kai's Note screen test is recorded as PRODUCTION_TEST_ONLY. Crowds, partner dancing and multi-speaker lip-sync are still untested.",
  T29: 'Option B is now an inactive, pre-cleared fallback. The 4 per cent burden reduction is unchanged.',
};

export type RegressionRow = PriorQuestion & { current: Verdict; method: 'COMPUTED' | 'EDITORIAL_CARRIED'; evidence: string };

export function runStressRegression(m: SeasonMaster, findings: ContinuityFinding[], root = process.cwd()) {
  const prior = parsePriorStressTest(root);
  const checks = computedChecks(m, findings);
  const rows: RegressionRow[] = prior.map((q) => {
    const c = checks[q.id];
    if (c) {
      const current: Verdict = c.ok ? q.verdict : q.verdict === 'PASS' ? 'PARTIAL' : 'FAIL';
      return { ...q, current, method: 'COMPUTED', evidence: c.evidence };
    }
    return { ...q, current: q.verdict, method: 'EDITORIAL_CARRIED', evidence: PARTIAL_NOTES[q.id] ?? 'Editorial verdict carried from the reconciliation stress test; no approved change affects it.' };
  });
  const tally = (key: 'verdict' | 'current') => ({
    PASS: rows.filter((r) => r[key] === 'PASS').length,
    PARTIAL: rows.filter((r) => r[key] === 'PARTIAL').length,
    FAIL: rows.filter((r) => r[key] === 'FAIL').length,
  });
  return { prior: tally('verdict'), current: tally('current'), upgrades: rows.filter((r) => r.verdict !== 'PASS' && r.current === 'PASS').map((r) => r.id), rows };
}
