import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as X from '../shared/site00-fiction-production/index.js';
import { buildLivingWorldPromotionDocs } from '../scripts/the-exchange/living-world-promotion/build.js';
import { CLOSING, DOCS_DIR } from '../scripts/the-exchange/living-world-promotion/md.js';

const P = X.Promotion;
type Data = X.Promotion.PromotionData;

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');
const files = buildLivingWorldPromotionDocs(root);

/** Validate an altered copy of the promotion records and return one check's errors. */
function errorsAfter(checkId: string, alter: (d: Data) => void): string[] {
  const d = structuredClone(P.PROMOTION_DATA);
  alter(d);
  const check = P.validatePromotion(root, d).find((c) => c.id === checkId);
  if (!check) throw new Error(`no check ${checkId}`);
  return check.errors;
}
const amendment = (d: Data, releaseId: string, proposalId: string) => d.amendments[releaseId].find((a) => a.recommendationId === proposalId)!;

describe('THE EXCHANGE living-world promotion: records', () => {
  it('passes every promotion check against committed canon', () => {
    const checks = P.validatePromotion(root);
    expect(checks.map((c) => c.id)).toHaveLength(17);
    expect(P.promotionErrors(checks)).toEqual([]);
  });

  it('approves exactly the founder\'s 19 and leaves 53 pending with their audit recommendations', () => {
    expect(P.FOUNDER_APPROVED_IDS).toHaveLength(19);
    expect(new Set(P.APPROVED_GROUPS.flatMap((g) => g.proposals))).toEqual(new Set(P.FOUNDER_APPROVED_IDS));
    const rows = P.RECONCILIATION;
    expect(rows).toHaveLength(72);
    expect(rows.filter((r) => r.founderDecision === 'FOUNDER_APPROVED')).toHaveLength(19);
    const pending = rows.filter((r) => r.founderDecision === 'PENDING_FOUNDER');
    expect(pending).toHaveLength(53);
    for (const r of pending) expect(r.auditRecommendation, r.proposalId).toBe(X.Audit.proposalById(r.proposalId).board);
    for (const id of ['R-12', 'C-01', 'R-14']) expect(rows.find((r) => r.proposalId === id)!.founderDecision).toBe('PENDING_FOUNDER');
  });

  it('changes the master only by the promoted amendments, inside the 86 releases and 127:40', () => {
    const master = X.loadSeasonMaster(root);
    const baseline = X.Audit.PROTECTED_BASELINE.find((f) => f.path === X.EXCHANGE_PATHS.master)!;
    expect(P.sha256(P.serializeJson(P.withoutLivingWorldAmendments(master)))).toBe(baseline.sha256);
    expect(X.Audit.baselineState(baseline, root)).toBe('UNCHANGED_EXCEPT_FOUNDER_PROMOTION');
    expect(master.releases).toHaveLength(86);
    expect(master.structure.runtimeTotalSec).toBe(7660);
    expect(master.releases.filter((r) => r.approvedAmendments.some((a) => a.amendmentId.startsWith(P.LIVING_WORLD_PREFIX)))).toHaveLength(22);
    expect(master.releases.find((r) => r.id === 'S1-69')!.approvedAmendments).toEqual([]);
  });

  it('carries the approved directions into the writing briefs and the future production ledger', () => {
    const index = JSON.parse(read(`${X.EXCHANGE_PATHS.season}/SEASON1_SCENE_INDEX_V1.json`)) as { releases: Array<{ releaseId: string; developmentRequirements: { amendments: Array<{ recommendationId: string }>; worldRules: Array<{ ruleId: string }> } }> };
    const brief = (id: string) => index.releases.find((r) => r.releaseId === id)!.developmentRequirements;
    expect(brief('S1-86').amendments.map((a) => a.recommendationId)).toEqual(['V-07', 'T-01']);
    expect(brief('S1-15').worldRules.map((w) => w.ruleId)).toEqual(['WR-02']);
    const future = JSON.parse(read(`${X.EXCHANGE_PATHS.season}/FUTURE_PRODUCTION_DEPENDENCIES_V1.json`)) as { livingWorld: unknown };
    expect(future.livingWorld).toEqual(JSON.parse(JSON.stringify(P.livingWorldDependencies(X.loadSeasonMaster(root)))));
  });

  it('keeps the S1-01 packet as reviewed: FD-S101-06 and -07 stay open there until the founder accepts the patch', () => {
    const packet = JSON.parse(read('THE_EXCHANGE/SEASON_1/PRODUCTION_SCENES/S1-01/DIRECTORIAL_PACKET_V1.json')) as { sections: { '9_FOUNDER_DECISIONS': Array<{ decisionId: string; status: string }> } };
    for (const d of packet.sections['9_FOUNDER_DECISIONS']) expect(d.status, d.decisionId).toBe('OPEN');
    expect(P.S101_PATCH.every((x) => x.status === 'PROPOSED_PENDING_FOUNDER_PACKET_REVIEW')).toBe(true);
  });

  it('commits the ledger and the registry exactly as built', () => {
    expect(JSON.parse(read(P.PROMOTION_LEDGER_PATH))).toEqual(JSON.parse(JSON.stringify(P.buildPromotionLedger())));
    expect(JSON.parse(read(P.BACKGROUND_REGISTRY_PATH))).toEqual(JSON.parse(JSON.stringify(P.buildBackgroundRegistry())));
  });
});

describe('THE EXCHANGE living-world promotion: each check can fail', () => {
  it('APPROVED_COUNT: a twentieth approval', () => {
    expect(errorsAfter('APPROVED_COUNT', (d) => d.approvedIds.push('R-12'))).toContain('20 approved; expected 19');
  });

  it('DECLINED_ALTERNATIVES: R-12 approved, or R-01 carrying its alternative', () => {
    expect(errorsAfter('DECLINED_ALTERNATIVES', (d) => d.approvedIds.push('R-12'))).toContain('R-12 is approved');
    expect(errorsAfter('DECLINED_ALTERNATIVES', (d) => (d.promotions.find((p) => p.proposalId === 'R-01')!.approvedBehavior += ' Alternative (R-01-ALT): another grandmother keeps the line.'))).toContain('R-01 carries its alternative');
  });

  it('REMAINING_53: an unapproved proposal promoted', () => {
    expect(errorsAfter('REMAINING_53', (d) => (d.reconciliation.find((r) => r.proposalId === 'R-14')!.promoted = true))).toContain('R-14: not pending');
  });

  it('BACKGROUND_IDENTITIES and ANONYMOUS_TAILOR: a recurring balcony woman, a named tailor', () => {
    expect(errorsAfter('BACKGROUND_IDENTITIES', (d) => (d.background.find((b) => b.identityId === 'SC-S101-WOMAN-ON-THE-BALCONY')!.tier = 'RECURRING_BACKGROUND'))).toContain('scene:S1-01:woman on the balcony: tier RECURRING_BACKGROUND, founder SCENE_SCOPED');
    expect(errorsAfter('ANONYMOUS_TAILOR', (d) => (d.background.find((b) => b.identityId === 'BG-S101-TAILOR')!.flags = []))).toContain('tailor not flagged ANONYMOUS');
    expect(errorsAfter('DECLINED_ALTERNATIVES', (d) => (amendment(d, 'S1-77', 'R-03').text += ' He is Wendell Ames.')).join()).toMatch(/names Wendell/);
  });

  it('DRESS_OPEN: a chosen silhouette, or the design marked decided', () => {
    expect(errorsAfter('DRESS_OPEN', (d) => (amendment(d, 'S1-77', 'R-02').text += ' A bias-cut evening dress.'))).toContain('AM-LW-S1-77-R02 picks a silhouette');
    expect(errorsAfter('DRESS_OPEN', (d) => (d.answers.find((a) => a.decisionId === 'FD-S101-05')!.stillOpen = null))).toContain('FD-S101-05 recorded as fully decided');
  });

  it('DEPENDENCIES: T-01 before T-02', () => {
    expect(errorsAfter('DEPENDENCIES', (d) => (d.order = ['T-01', ...d.order.filter((id) => id !== 'T-01')]))).toContain('T-02 must precede T-01');
  });

  it('NO_NEW_DIALOGUE: an invented line', () => {
    expect(errorsAfter('NO_NEW_DIALOGUE', (d) => (amendment(d, 'S1-59', 'R-01').text += ' She adds, "Mind the river."'))).toContain('AM-LW-S1-59-R01: new line "Mind the river."');
  });

  it('WORLD_RULES: a second seal break, city-scale gold before S1-77', () => {
    expect(errorsAfter('WORLD_RULES', (d) => (amendment(d, 'S1-57', 'V-07').text += ' The seal cracks.')).join()).toMatch(/on-screen breaks in AM-LW-S1-57-V07/);
    expect(errorsAfter('WORLD_RULES', (d) => (amendment(d, 'S1-59', 'T-12').text += " The promenade's capture is bound to revocation."))).toContain('city-scale gold before S1-77');
  });

  it('MASTER_AMENDMENTS: an amendment for an unapproved proposal', () => {
    expect(errorsAfter('MASTER_AMENDMENTS', (d) => d.amendments['S1-77'].push({ ...amendment(d, 'S1-77', 'R-03'), amendmentId: 'AM-LW-S1-77-R12', recommendationId: 'R-12' })).join()).toMatch(/AM-LW-S1-77-R12: R-12 is not approved/);
  });

  it('ASSETS and S1-01_PATCH: an asset that does not exist, a patch quoting text the packet lacks', () => {
    expect(errorsAfter('ASSETS', (d) => (d.assets[0].status = 'EXISTS_VERIFIED'))).toContain(`${P.ASSET_REQUIREMENTS[0].assetId}: claims EXISTS_VERIFIED`);
    expect(errorsAfter('S1-01_PATCH', (d) => (d.patch[0].before = ['A line the packet never had']))).toContain('PATCH-S101-01: "A line the packet never had" is not in the packet');
  });
});

describe('THE EXCHANGE living-world promotion: deliverables', () => {
  it('commits deliverables 01 to 14 exactly as rendered, and nothing else but the completion report', () => {
    expect(Object.keys(files)).toHaveLength(14);
    for (const [name, body] of Object.entries(files)) expect(read(`${DOCS_DIR}/${name}`), name).toBe(body);
    const extra = fs.readdirSync(path.join(root, DOCS_DIR)).filter((f) => !(f in files));
    expect(extra.filter((f) => f !== '15_COMPLETION_REPORT.md')).toEqual([]);
  });

  it('copies the registry byte for byte, ends every document on the closing line, and claims no founder approval it did not get', () => {
    expect(files['07_RECURRING_BACKGROUND_IDENTITY_REGISTER.json']).toBe(read(P.BACKGROUND_REGISTRY_PATH));
    for (const [name, body] of Object.entries(files)) if (name.endsWith('.md')) expect(body.trimEnd().endsWith(CLOSING), name).toBe(true);
    for (const body of Object.values(files)) expect(body).not.toMatch(/production[- ]approved|production-ready: yes/i);
  });

  it('renders the same bytes twice', () => {
    expect(buildLivingWorldPromotionDocs(root)).toEqual(files);
  });
});
