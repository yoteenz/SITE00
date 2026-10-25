import fs from 'node:fs';
import * as X from '../../../shared/site00-fiction-production/index.js';
import { A, allAmendments, BANNER, bullets, CLOSING, generatedNote, P, release, rid, SRC, table, type Ctx } from './md.js';

const head = (n: string, title: string, sources: string[]) => [`# ${n} — ${title}`, '', generatedNote(sources), '', BANNER, ''];
const auditTitle = (id: string) => A.proposalById(id).title;

export function decisionRecordDoc(): string {
  const d = P.buildPromotionLedger();
  return [
    ...head('01', 'Founder decision record', [SRC.promotion]),
    `Sprint \`${P.PROMOTION_SPRINT}\`, ${P.PROMOTION_DATE}. Audit read at \`${P.AUDIT_COMMIT}\` (head of PR #1693). The founder's words are recorded as given; nothing is inferred from the audit's own recommendations.`,
    '',
    '## 1. Approved priority groups',
    '',
    `The founder approved twelve priority groups, which carry exactly ${P.FOUNDER_APPROVED_IDS.length} proposal IDs.`,
    '',
    table(['Group', "Founder's label", 'Proposals', 'Audit titles'], P.APPROVED_GROUPS.map((g) => [g.priority, g.founderLabel, g.proposals.join(', '), g.proposals.map(auditTitle).join(' / ')])),
    '',
    '## 2. The four follow-up decisions',
    '',
    ...P.FOUNDER_ANSWERS.flatMap((a) => [
      `### ${a.decisionId}: ${a.answer}`,
      '',
      a.meaning,
      '',
      `- **Not authorized:** ${a.notAuthorized.join('; ')}.`,
      `- **Resolves:** ${a.resolves.join(', ')}.`,
      `- **Still open:** ${a.stillOpen ?? 'Nothing.'}`,
      '',
    ]),
    '## 3. Alternatives the founder declined',
    '',
    table(['ID', "Founder's instruction"], P.NOT_APPROVED.map((n) => [n.id, n.founderNote])),
    '',
    'Each stays in the audit with its original recommendation. None is promoted or substituted.',
    '',
    '## 4. Decision and production states',
    '',
    table(
      ['State', 'Layer', 'Meaning', 'Count'],
      [
        ['FOUNDER_APPROVED', 'Decision', 'The founder approved the creative proposal.', d.counts.founderApproved],
        ['FOUNDER_HELD', 'Decision', 'The founder chose to hold it.', d.counts.founderHeld],
        ['FOUNDER_REJECTED', 'Decision', 'The founder rejected it.', d.counts.founderRejected],
        ['PENDING_FOUNDER', 'Decision', 'No founder decision yet. The audit recommendation is kept as a recommendation.', d.counts.pendingFounder],
        ['CONDITIONAL_PRODUCTION_HOLD', 'Production', 'Approved, but a named design, decision or packet review must land before anything is generated.', d.counts.conditionalProductionHold],
      ],
    ),
    '',
    'An audit APPROVE, HOLD or REJECT is a recommendation, never a founder decision. No proposal is FOUNDER_HELD or FOUNDER_REJECTED: the founder did not hold or reject any.',
    '',
    '## 5. S1-01 inhabitants',
    '',
    table(['Inhabitant', 'Tier and flags'], Object.entries(P.S101_TIERS).map(([k, v]) => [`\`${k}\``, v.join(', ')])),
    '',
    '## 6. Source precedence applied',
    '',
    bullets([
      '1. Existing approved canon: the 86-release master, 127:40, its Nights and every existing line.',
      '2. Explicit founder decisions in this sprint: sections 1 to 3 above.',
      '3. Explicit earlier founder approvals: the canon lock (2026-10-23) and the directorial engine authorization.',
      '4. Source-grounded audit proposals: the approved behaviour is the audit text word for word, except the R-01 alternative the founder declined.',
      '5. Provisional screenplay and directorial interpretations: the S1-01 packet stays as it is; the patch plan (deliverable 08) proposes its update.',
    ]),
    '',
    CLOSING,
  ].join('\n');
}

export const reconciliationJson = () =>
  JSON.stringify({ schemaVersion: '1.0.0', sprint: P.PROMOTION_SPRINT, auditCommit: P.AUDIT_COMMIT, counts: P.buildPromotionLedger().counts, rows: P.RECONCILIATION }, null, 2);

export const pendingJson = () =>
  JSON.stringify(
    {
      schemaVersion: '1.0.0',
      sprint: P.PROMOTION_SPRINT,
      rule: 'These 53 proposals have no founder decision. Each keeps its audit recommendation, is not promoted, and enters no screenplay or production plan as a requirement. A later founder decision may approve, revise, hold or reject any of them.',
      count: P.RECONCILIATION.filter((r) => r.founderDecision === 'PENDING_FOUNDER').length,
      proposals: P.RECONCILIATION.filter((r) => r.founderDecision === 'PENDING_FOUNDER').map((r) => {
        const p = A.proposalById(r.proposalId);
        return { ...r, releases: p.releases, placement: p.placement, proposed: p.proposed, auditReason: p.rejectReason ?? null };
      }),
    },
    null,
    2,
  );

export const registryCopy = (c: Ctx) => fs.readFileSync(X.repoPath(SRC.registry, c.root), 'utf8');

export function canonDiffDoc(c: Ctx): string {
  const lw = allAmendments();
  const briefs = c.master.releases.filter((r) => r.approvedAmendments.some((a) => a.amendmentId.startsWith(P.LIVING_WORLD_PREFIX)));
  const ruleReleases = [...new Set(P.WORLD_RULES.flatMap((w) => w.appliesTo))].sort((a, b) => release(c, a).order - release(c, b).order);
  const protectedFiles = [...A.PROTECTED_BASELINE.filter((f) => f.path !== X.EXCHANGE_PATHS.master), ...P.UNCHANGED_BY_PROMOTION];
  return [
    ...head('03', 'Canon promotion diff', [SRC.promotion, SRC.master]),
    'What this promotion changes, file by file. Every changed canonical file is generated; the change lives in `shared/site00-fiction-production/promotion/`. Removing it returns the master to the audit baseline byte for byte.',
    '',
    '## 1. Files',
    '',
    table(
      ['File', 'Change', 'Produced by'],
      [
        [`\`${SRC.master}\``, `${lw.length} amendments (AM-LW-*) in ${briefs.length} releases; nothing else`, '`build-season1-production.ts`'],
        ['`THE_EXCHANGE/SEASON_1/SEASON1_86_RELEASE_MASTER_V1.csv`', 'The amendments column', '`build-season1-production.ts`'],
        ['`THE_EXCHANGE/SEASON_1/SCREENPLAY_BACKLOG_V1.json` and `.csv`', 'Amendment IDs per release', '`build-season1-production.ts`'],
        ['`THE_EXCHANGE/SEASON_1/SEASON1_SCENE_INDEX_V1.json`', `New \`developmentRequirements\` in each of the 86 briefs: amendments in ${c.master.releases.filter((r) => r.approvedAmendments.length).length} releases, season rules in ${ruleReleases.length}`, '`build-directorial-production.ts`'],
        ['`THE_EXCHANGE/SEASON_1/FUTURE_PRODUCTION_DEPENDENCIES_V1.json`', 'New `livingWorld` section: recurring identities, per-release needs, holds', '`build-directorial-production.ts`'],
        [`\`${SRC.ledger}\``, 'New: the promotion record (19 promotions, 72 reconciled, rules, motifs, S1-01 patch, holds, assets)', '`build-living-world-promotion.ts`'],
        [`\`${SRC.registry}\``, 'New: recurring-background identities', '`build-living-world-promotion.ts`'],
        ['`docs/site00/the-exchange/directorial-production-engine-v2/05_SEASON1_SCREENPLAY_AND_SCENE_INDEX.json`', 'Byte copy of the scene index, refreshed', '`render-directorial-docs.ts`'],
        ['`docs/site00/the-exchange/living-world-audit-v1/18_VALIDATION_REPORT.md`', 'Protected-file table shows the master as UNCHANGED_EXCEPT_FOUNDER_PROMOTION', '`render-living-world-audit.ts`'],
      ],
    ),
    '',
    '## 2. Master amendments, by release',
    '',
    'Each states the approved behaviour for that release. Every quote in an approved text is a line the master already has (validator NO_NEW_DIALOGUE).',
    '',
    table(['Release', 'Title', 'Amendment', 'From', 'Approved direction', 'Production hold'], lw.map((a) => [rid(a.amendmentId), release(c, rid(a.amendmentId)).title, a.amendmentId, a.recommendationId, a.text, a.productionHold ?? 'None'])),
    '',
    '## 3. Season rules',
    '',
    `Seven season rules (WR-01 to WR-07) are recorded in the promotion ledger and named in the briefs of ${ruleReleases.length} releases: ${ruleReleases.join(', ')}. They add no release text. Deliverable 04 holds the rules and their evidence.`,
    '',
    '## 4. Code',
    '',
    bullets([
      '`promotion/` (new): founder record, amendments, rules, background register, S1-01 patch plan, asset ledger, promotion records, validator (17 checks), ledger builder.',
      '`seasonMaster.ts`: merges the living-world amendments after the canon-lock ones. The canon-lock amendments and their U-4 flag are unchanged.',
      '`types.ts`: `ApprovedAmendment` gains two optional fields, `founderApproval` and `productionHold`.',
      '`sceneIndex.ts`: each brief carries `developmentRequirements`.',
      '`audit/baseline.ts`, `audit/validate.ts`: the audit\'s protected-file check accepts the master only when it equals the baseline once the AM-LW amendments are removed. Any other change still fails. `tests/theExchangeLivingWorldAudit.test.ts` uses the same rule.',
      '`build-directorial-production.ts`: writes the `livingWorld` section.',
    ]),
    '',
    '## 5. Not changed',
    '',
    'Files this promotion left untouched. The S1-01 packet files may instead show FOUNDER_S101_PATCH: the founder-authorized patch moved them later (2026-10-25, deliverable 08).',
    '',
    table(['File', 'Now'], protectedFiles.map((f) => [`\`${f.path}\``, P.sha256(fs.readFileSync(X.repoPath(f.path, c.root))) === f.sha256 ? 'UNCHANGED' : X.Audit.baselineState(f, c.root) === 'FOUNDER_S101_PATCH' ? 'FOUNDER_S101_PATCH' : 'CHANGED'])),
    '',
    'The approval book records no new approval: the founder approved creative directions, not a screenplay, visual identity, voice, wardrobe or shot plan.',
    '',
    '## 6. Not regenerated',
    '',
    'The canon-lock deliverables in `docs/site00/the-exchange/founder-canon-lock-v1/` are that sprint\'s review snapshot, and none of them is drift-tested. Five (06, 07, 12, 13, 14) already differed from a fresh render before this branch; 03 and 04 would now also pick up the amendments. The canonical master and backlog carry the amendments. Regenerating the snapshot would rewrite another sprint\'s record with unrelated changes, so it is left as it is.',
    '',
    CLOSING,
  ].join('\n');
}

export function remainingDecisionsDoc(c: Ctx): string {
  const packet = JSON.parse(fs.readFileSync(X.repoPath(SRC.packet, c.root), 'utf8')) as { sections: { '9_FOUNDER_DECISIONS': Array<{ decisionId: string; question: string; status: string; recommendation: string }> } };
  const open = packet.sections['9_FOUNDER_DECISIONS'].filter((d) => P.S101_GUARDS.stillOpen.includes(d.decisionId));
  const pending = P.RECONCILIATION.filter((r) => r.founderDecision === 'PENDING_FOUNDER');
  const byRec = ['APPROVE', 'REVISE', 'HOLD', 'REJECT'].map((b) => [b, pending.filter((r) => r.auditRecommendation === b).length] as const);
  const note = (r: X.Promotion.ReconciliationRow) =>
    [r.founderNote && `Founder: ${r.founderNote}`, r.contradictsFounderDecision && `Contradicts ${r.contradictsFounderDecision}`, r.waitsOn.length && `Waits on ${r.waitsOn.map((w) => `${w.decisionId} (${w.status})`).join(', ')}`].filter(Boolean).join(' ') || '—';
  return [
    ...head('13', 'Remaining founder decisions', [SRC.promotion, SRC.packet]),
    '## 1. Raised or left open by this promotion',
    '',
    table(
      ['Decision', 'What it blocks', 'Why it is open'],
      [
        ['FD-S101-05 garment design', 'R-02 production (HOLD-FD-S101-05); KF-WD-GREEN-DRESS', 'The founder approved the story continuity and deferred the silhouette to S1-01 visual development. Neither candidate is chosen.'],
        ['The four-count step (FD-S101-12)', 'S-02 and R-04 production (HOLD-FD-S101-12); KF-SF-SH05', 'Opened when the founder-authorized patch was applied (PATCH-S101-05, 2026-10-25): the step is not choreographed (CHOREOGRAPHY_LOCK_PENDING). HOLD-S101-PATCH is lifted.'],
        ['The fruit-truck song', 'F-01 production (HOLD-SONG)', 'One song, chosen or commissioned once for S1-12 and S1-20.'],
        ['FD-18 memory face locks', 'F-06 and F-07 production (HOLD-FD-18)', 'Vivienne at 34 and Celestine at 33 have no face lock.'],
        ['FD-S101-06, the looks part', 'The tailor, grandmother and teenager start frames', 'RECURRING settles the tier. The looks are directorial interpretation, approved when the founder approves the S1-01 start frames.'],
        ["The grandmother's voice", 'Her one S1-59 line', 'Voice production is not authorized.'],
        ['U-5 invention dossiers', 'Relay and Echo Track production design', 'WR-02 (Relay) and WR-06 (Echo Track) now state their limits. The dossiers for the Halo, the Hush, Relay paper, the Echo Track and the Interval silk are still open.'],
      ],
    ),
    '',
    '## 2. S1-01 decisions still open',
    '',
    'This sprint answered FD-S101-06 and FD-S101-07, and the story half of FD-S101-05. The founder-authorized patch (2026-10-25) now shows FD-S101-06 and -07 ANSWERED in the packet, with FD-S101-05 still OPEN for the design. Still open:',
    '',
    table(['Decision', 'Question', 'Packet recommendation'], open.map((d) => [d.decisionId, d.question, d.recommendation])),
    '',
    '## 3. The 53 proposals awaiting the founder',
    '',
    `Audit recommendations among them: ${byRec.map(([b, n]) => `${b} ${n}`).join(', ')}. Deliverable 11 holds the full list.`,
    '',
    table(['ID', 'Title', 'Audit recommendation', 'Notes'], pending.map((r) => [r.proposalId, r.title, r.auditRecommendation, note(r)])),
    '',
    '## 4. Next action',
    '',
    'FOUNDER REVIEWS THE CANON PROMOTION DIFF, RESIDUAL DEPENDENCIES, AND UPDATED S1-01 PRODUCTION REQUIREMENTS BEFORE ANY FURTHER PRODUCTION AUTHORIZATION.',
    '',
    CLOSING,
  ].join('\n');
}

