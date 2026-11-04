import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as X from '../shared/site00-fiction-production/index.js';
import { buildLivingWorldAuditDocs } from '../scripts/the-exchange/living-world-audit/build.js';
import { CLOSING, DOCS_DIR } from '../scripts/the-exchange/living-world-audit/md.js';

const A = X.Audit;
type AuditData = X.Audit.AuditData;

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');
const files = buildLivingWorldAuditDocs(root);
const review = files['00_FOUNDER_REVIEW_LIVING_WORLD_AUDIT.md'];

/** Validate an altered copy of the committed records and return one check's errors. */
function errorsAfter(checkId: string, alter: (d: AuditData, p: (id: string) => X.Audit.Proposal) => void): string[] {
  const d = structuredClone(A.AUDIT_DATA);
  alter(d, (id) => d.proposals.find((x) => x.id === id)!);
  const check = A.validateAudit(root, d).find((c) => c.id === checkId);
  if (!check) throw new Error(`no check ${checkId}`);
  return check.errors;
}

describe('THE EXCHANGE Season 1 living-world audit: records', () => {
  it('passes every validator check against committed canon', () => {
    const checks = A.validateAudit(root);
    expect(checks.map((c) => c.id)).toHaveLength(21);
    expect(A.auditErrors(checks)).toEqual([]);
  });

  it('judges all 86 releases in master order and keeps the master locked', () => {
    const master = X.loadSeasonMaster(root);
    expect(master.releases).toHaveLength(A.AUDIT_BASELINE_RELEASES);
    expect(master.releases.reduce((n, r) => n + r.runtimeTargetSec, 0)).toBe(A.AUDIT_BASELINE_RUNTIME_SEC);
    expect(A.RELEASE_JUDGMENTS.map((j) => j.id)).toEqual(master.releases.map((r) => r.id));
  });

  it('leaves the S1-01 packet files and the Fountain drafts byte-identical, and the master apart from founder-promoted amendments', () => {
    expect(A.PROTECTED_BASELINE).toHaveLength(15);
    for (const f of A.PROTECTED_BASELINE) {
      if (f.path === X.EXCHANGE_PATHS.master) expect(A.baselineState(f, root), f.path).not.toBe('CHANGED');
      else expect(A.sha256(X.repoPath(f.path, root)), f.path).toBe(f.sha256);
    }
  });

  it('ranks at most twelve priorities, each with a written reason on all ten dimensions', () => {
    expect(A.PRIORITIES.length).toBeLessThanOrEqual(12);
    for (const pr of A.PRIORITIES)
      for (const d of A.SCORE_DIMENSIONS) {
        expect(['HIGH', 'MEDIUM', 'LOW'], `${pr.id} ${d}`).toContain(pr.scores[d].rating);
        expect(pr.scores[d].reason.length, `${pr.id} ${d}`).toBeGreaterThan(10);
      }
  });

  it('adds no runtime for anything recommended outright, and states no price', () => {
    for (const p of A.PROPOSALS.filter((x) => x.board === 'APPROVE')) expect(p.runtimeSec, p.id).toBe(0);
    for (const n of A.INVENTION_CANDIDATES) expect(n.priceTier, n.id).toMatch(/UNKNOWN/);
  });
});

describe('THE EXCHANGE Season 1 living-world audit: each check can fail', () => {
  it('FORBIDDEN_CAPABILITY: a surviving proposal that proves truth', () => {
    expect(errorsAfter('FORBIDDEN_CAPABILITY', (_d, p) => (p('T-01').claims = ['PROVE_TRUTH']))).toContain('T-01: claims PROVE_TRUTH but is not rejected');
  });

  it('CITATIONS: a misquoted citation', () => {
    expect(errorsAfter('CITATIONS', (_d, p) => (p('T-01').cites[0].quote = 'a line the master never wrote')).join()).toMatch(/T-01 → .*quote not found/);
  });

  it('MEMORY_POV: a character memory nobody witnessed', () => {
    expect(errorsAfter('MEMORY_POV', (_d, p) => (p('F-04').memory!.povWitnessed = 'NOT_CLAIMED'))).toContain('F-04: a character memory needs a witness');
  });

  it('REVEAL_TIMING: a fact shown before the release the ledger names', () => {
    expect(errorsAfter('REVEAL_TIMING', (_d, p) => (p('F-01').memory!.revealsFacts = ['KF-06']))).toContain('F-01: KF-06 is not known to the audience by S1-12');
    expect(errorsAfter('REVEAL_TIMING', (_d, p) => (p('F-04').memory!.revealsFacts = ['KF-09']))).toContain('F-04: KF-09 is not a fact the season reveals');
  });

  it('VENUE_ACCESS: an invited venue with no route in', () => {
    expect(
      errorsAfter('VENUE_ACCESS', (_d, p) => {
        p('R-08').callback!.venue = 'INVITED';
        p('R-08').callback!.accessRoute = '';
      }),
    ).toContain('R-08: INVITED with no access route');
  });

  it('CALLBACK_DENSITY: a fifth recommended callback in one release', () => {
    const errors = errorsAfter('CALLBACK_DENSITY', (d, p) => {
      for (const n of [90, 91, 92]) d.proposals.push({ ...structuredClone(p('R-05')), id: `R-${n}` });
    });
    expect(errors).toContain('S1-59: 5 recommended callbacks');
  });

  it('S1-01_PROTECTION: an S1-01 idea without its section 25 block, or naming a shot that does not exist', () => {
    expect(errorsAfter('S1-01_PROTECTION', (_d, p) => delete p('S-02').s101)).toContain('S-02: touches S1-01 with no section 25 block');
    expect(errorsAfter('S1-01_PROTECTION', (_d, p) => (p('S-02').s101!.shots = ['S1-01-SH99']))).toContain('S-02: no shot S1-01-SH99');
  });

  it('INVENTIONS: an invention with a price', () => {
    expect(errorsAfter('INVENTIONS', (d) => (d.inventions[0].priceTier = '$40 a roll'))).toContain(`${A.INVENTION_CANDIDATES[0].id}: price must be UNKNOWN`);
  });

  it('PRIORITIES: a thirteenth priority, and a missing written reason', () => {
    expect(errorsAfter('PRIORITIES', (d) => d.priorities.push({ ...structuredClone(d.priorities[0]), id: 'P-13', proposals: [] }))).toContain('13 priorities; the brief allows twelve');
    expect(errorsAfter('PRIORITIES', (d) => (d.priorities[0].scores.ORIGINALITY.reason = ''))).toContain('P-01: no written reason for ORIGINALITY');
  });

  it('RUNTIME_AND_COST: a recommended item that adds seconds', () => {
    expect(errorsAfter('RUNTIME_AND_COST', (_d, p) => (p('T-01').runtimeSec = 5))).toContain('T-01: recommended outright but adds 5 s');
  });

  it('CATEGORY_RULES: a rejected item without a reason', () => {
    expect(errorsAfter('CATEGORY_RULES', (_d, p) => delete p('T-14').rejectReason)).toContain('T-14 (E): a rejected proposal needs a reason');
  });

  it('RELEASE_COVERAGE: judgments out of master order', () => {
    expect(errorsAfter('RELEASE_COVERAGE', (d) => d.judgments.reverse())).toContain('judgments are not the 86 master releases in order');
  });

  it('DEPENDENCIES: a recommended proposal leaning on a rejected one', () => {
    expect(errorsAfter('DEPENDENCIES', (_d, p) => (p('T-01').dependsOn = ['T-14']))).toContain('T-01 (APPROVE) depends on T-14 (REJECT)');
  });
});

describe('THE EXCHANGE Season 1 living-world audit: deliverables', () => {
  it('commits deliverables 00 to 18 exactly as rendered, and nothing else but the completion report', () => {
    expect(Object.keys(files)).toHaveLength(19);
    for (const [name, body] of Object.entries(files)) expect(read(`${DOCS_DIR}/${name}`), name).toBe(body);
    const extra = fs.readdirSync(path.join(root, DOCS_DIR)).filter((f) => !(f in files));
    expect(extra.filter((f) => f !== '19_COMPLETION_REPORT.md')).toEqual([]);
  });

  it('keeps the founder review to Parts 1 to 8, every decision PENDING, and no approval claims', () => {
    expect([...review.matchAll(/^## Part (\d)\. /gm)].map((m) => Number(m[1]))).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    for (const p of A.PROPOSALS) expect(review, p.id).toContain(`| ${p.id} | ${p.title} |`);
    expect(review.trimEnd().endsWith(CLOSING)).toBe(true);
    for (const body of Object.values(files)) {
      expect(body).not.toMatch(/production[- ]approved/i);
      expect(body).not.toMatch(/founder (has )?approved/i);
    }
    const matrix = JSON.parse(files['16_FOUNDER_APPROVAL_MATRIX.json']) as { proposals: Array<{ founderDecisionStatus: string }> };
    expect(matrix.proposals).toHaveLength(A.PROPOSALS.length);
    expect(new Set(matrix.proposals.map((p) => p.founderDecisionStatus))).toEqual(new Set(['PENDING']));
  });

  it('covers 86 releases by 5 opportunity types in the matrix, with NO CHANGE RECOMMENDED written out', () => {
    const rows = X.parseCsv(files['02_SEASON1_86_RELEASE_ENHANCEMENT_MATRIX.csv']);
    const cells = new Set(rows.map((r) => `${r.RELEASE_ID}|${r.OPPORTUNITY_TYPE}`));
    expect(cells.size).toBe(86 * A.OPPORTUNITY_TYPES.length);
    expect(rows.filter((r) => r.PROPOSAL_ID).map((r) => r.PROPOSAL_ID).sort()).toEqual(A.PROPOSALS.map((p) => p.id).sort());
    expect(rows.some((r) => r.AUDIT_RECOMMENDATION === 'NO CHANGE RECOMMENDED')).toBe(true);
    expect(new Set(rows.map((r) => r.FOUNDER_DECISION))).toEqual(new Set(['PENDING', 'NOT_REQUIRED']));
  });

  it('names only proposal IDs that exist', () => {
    const known = new Set(A.PROPOSALS.map((p) => p.id));
    for (const [name, body] of Object.entries(files)) for (const m of body.match(/\b[TFRSCVW]-\d{2}\b/g) ?? []) expect(known.has(m), `${name}: ${m}`).toBe(true);
  });

  it('renders the same bytes twice', () => {
    expect(buildLivingWorldAuditDocs(root)).toEqual(files);
  });
});
