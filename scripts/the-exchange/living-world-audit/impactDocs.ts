import * as X from '../../../shared/site00-fiction-production/index.js';
import { A, BOARD_ORDER, bullets, countBy, generatedNote, impactFlags, list, plusSec, PROPOSAL_NOTE, secs, table, type Ctx } from './md.js';

type Proposal = X.Audit.Proposal;

export const BOARD_KEY: Record<X.Audit.BoardAction, string> = {
  APPROVE: 'The audit recommends adopting it as written when the affected screenplay is drafted. Fits the locked runtime.',
  REVISE: 'Worth having only after a change: its seconds must be found inside the same release before it can be adopted.',
  HOLD: 'Waits on a founder decision, a choice between alternatives, or a later season.',
  REJECT: 'The audit recommends against it, with a stated reason. Recorded so the idea is not proposed again unexamined.',
};

const citesTruth = (p: Proposal) => p.cites.some((c) => c.file === A.TRUTH_DOC);

export function dependencyGraphJson(c: Ctx): string {
  const edges: Array<{ from: string; to: string; kind: string }> = [];
  for (const p of A.PROPOSALS) {
    for (const d of p.dependsOn ?? []) edges.push({ from: p.id, to: d, kind: 'DEPENDS_ON' });
    for (const d of p.conflictsWith ?? []) edges.push({ from: p.id, to: d, kind: 'CONFLICTS_WITH' });
    for (const d of p.blockedBy ?? []) edges.push({ from: p.id, to: d, kind: 'WAITS_ON_DECISION' });
    for (const d of p.techIds ?? []) edges.push({ from: p.id, to: d, kind: 'USES_TECHNOLOGY' });
    if (p.inventionId) edges.push({ from: p.id, to: p.inventionId, kind: 'USES_INVENTION' });
  }
  const decisions = [...new Set(A.PROPOSALS.flatMap((p) => p.blockedBy ?? []))].sort();
  const live = A.PROPOSALS.filter((p) => p.board !== 'REJECT');
  return X.serializeJson({
    graphId: 'THE-EXCHANGE.S1.LIVING-WORLD-AUDIT.DEPENDENCY-GRAPH.V1',
    auditId: A.AUDIT_ID,
    classification: 'NEW_PROPOSAL — NOT CANON',
    note: 'Nodes are proposals, open founder decisions, existing systems and invention candidates. An APPROVE or REVISE proposal never depends on a HOLD or REJECT one (validator DEPENDENCIES).',
    nodes: {
      proposals: A.PROPOSALS.map((p) => ({
        id: p.id,
        title: p.title,
        type: p.type,
        category: p.category,
        auditRecommendation: p.board,
        strength: p.strength,
        placement: p.releases[0],
        releases: p.releases,
        runtimeSec: p.runtimeSec,
        risk: p.risk,
        canonImpact: p.canonImpact,
        citesTruthDocument: citesTruth(p),
        touchesS101: Boolean(p.s101),
      })),
      decisions: decisions.map((id) => {
        const fd = c.packet.decisions.find((d) => d.decisionId === id);
        const q = c.ledger.openQuestions.find((x) => x.id === id);
        return { id, question: fd?.question ?? q?.question ?? null, status: fd?.status ?? q?.status ?? null };
      }),
      technology: A.EXISTING_TECHNOLOGY.map((t) => ({ id: t.id, name: t.name, tier: t.tier })),
      inventions: A.INVENTION_CANDIDATES.map((n) => ({ id: n.id, name: n.name, category: n.category, approvalStatus: n.approvalStatus })),
    },
    edges,
    canonRisk: {
      byRiskLevel: countBy(live, (p) => p.risk.level),
      seasonRules: live.filter((p) => p.category === 'C').map((p) => ({ id: p.id, canonImpact: p.canonImpact })),
      highRisk: live.filter((p) => p.risk.level === 'HIGH').map((p) => ({ id: p.id, note: p.risk.note })),
      dependsOnTruthDocument: live.filter(citesTruth).map((p) => p.id),
      touchesS101: live.filter((p) => p.s101).map((p) => p.id),
    },
  });
}

export function runtimeImpactDoc(c: Ctx): string {
  const byBoard = (b: X.Audit.BoardAction) => A.PROPOSALS.filter((p) => p.board === b);
  const sum = (ps: Proposal[]) => ps.reduce((n, p) => n + p.runtimeSec, 0);
  const expansions = A.PROPOSALS.filter((p) => p.category === 'B');
  const approve = byBoard('APPROVE');
  const notRejected = A.PROPOSALS.filter((p) => p.board !== 'REJECT');
  const costs = countBy(approve, (p) => p.impact?.generationCost ?? 'NOT_APPLICABLE');
  const assets = notRejected.filter((p) => p.impact && (p.impact.newProp || p.impact.newMusicOrSfx || p.impact.newCharacterAsset || p.impact.newScene));
  return [
    '# 13 — Runtime and production impact report',
    '',
    generatedNote(['shared/site00-fiction-production/audit/proposals/', X.EXCHANGE_PATHS.master]),
    '',
    PROPOSAL_NOTE,
    '',
    '## 1. Runtime',
    '',
    table(
      ['Scenario', 'Releases', 'Runtime'],
      [
        ['Baseline (approved master)', c.master.releases.length, `${secs(A.AUDIT_BASELINE_RUNTIME_SEC)} (${A.AUDIT_BASELINE_RUNTIME_SEC} s)`],
        [`Adopt all ${approve.length} APPROVE items`, c.master.releases.length, `${secs(A.AUDIT_BASELINE_RUNTIME_SEC + sum(approve))} (${plusSec(sum(approve))})`],
        [`Also adopt the ${byBoard('REVISE').length} REVISE item without a trim`, c.master.releases.length, `${secs(A.AUDIT_BASELINE_RUNTIME_SEC + sum(approve) + sum(byBoard('REVISE')))} (${plusSec(sum(byBoard('REVISE')))})`],
        [
          'Adopt every B expansion, including the rejected ones',
          c.master.releases.length + expansions.reduce((n, p) => n + (p.releaseCountDelta ?? 0), 0),
          `${secs(A.AUDIT_BASELINE_RUNTIME_SEC + sum(expansions))} (${plusSec(sum(expansions))})`,
        ],
      ],
    ),
    '',
    'Every A, C, D and E item adds 0 s by rule (validator RUNTIME_AND_COST). Only B items add footage, and none is recommended outright.',
    '',
    table(['B item', 'Recommendation', 'Adds', 'Release count', 'Runtime consequence', 'Why'], expansions.map((p) => [p.id, p.board, plusSec(p.runtimeSec), p.releaseCountDelta ? `+${p.releaseCountDelta}` : '0', p.expansion!.runtime, p.board === 'REJECT' ? p.rejectReason : p.founderDecision])),
    '',
    '## 2. Production impact (section 21)',
    '',
    'Costs are directions only. No price is estimated anywhere in this audit; where the direction is not known it says UNKNOWN.',
    '',
    table(
      ['ID', 'Recommendation', 'Fits runtime', 'Replaces', 'Extra s', 'New scene', 'New character asset', 'New prop', 'New music or SFX', 'Reuses location', 'Reuses character', 'Generation cost', 'Note'],
      notRejected.map((p) => {
        const i = p.impact;
        return i
          ? [p.id, p.board, i.fitsRuntime ? 'YES' : 'NO', i.replaces ?? '—', i.extraSec, i.newScene ? 'YES' : 'NO', i.newCharacterAsset ? 'YES' : 'NO', i.newProp ? 'YES' : 'NO', i.newMusicOrSfx ? 'YES' : 'NO', i.reusesLocation ?? '—', i.reusesCharacter ?? '—', i.generationCost, i.note]
          : [p.id, p.board, 'YES', '—', 0, 'NO', 'NO', 'NO', 'NO', '—', '—', 'NO_CHANGE', p.futureImpact ?? 'Season 2 only.'];
      }),
    ),
    '',
    `Cost direction across the ${approve.length} APPROVE items: ${Object.entries(costs).map(([k, v]) => `${k} ${v}`).join(', ')}.`,
    '',
    '## 3. New assets any surviving proposal would need',
    '',
    table(['ID', 'Recommendation', 'Needs', 'Cost direction'], assets.map((p) => [p.id, p.board, impactFlags(p.impact), p.impact!.generationCost])),
    '',
    '## 4. S1-01',
    '',
    bullets([
      `No recommended proposal changes S1-01\'s ${c.packet.duration}, its ${c.packet.shots.length} shots, ${c.packet.keyframes} keyframes or its cues.`,
      'S-02 adds a choreography note to SH05–SH07 (0 s). Returns of S1-01 inhabitants need an FD-S101-06 tier decision but no new S1-01 asset: their faces are fixed by each vignette\'s first start frame, as the packet already plans.',
      'C-01 (held) would add a recurring Wendell Ames identity reference before any S1-01 frame is generated: cost direction HIGHER.',
    ]),
    '',
    '## 5. Credits',
    '',
    'No provider job was dispatched. No ElevenLabs or OpenArt credit was spent. No media was generated.',
  ].join('\n');
}

export function futureReserveDoc(c: Ctx): string {
  const reserve = A.PROPOSALS.filter((p) => p.category === 'D');
  const held = A.PROPOSALS.filter((p) => p.board === 'HOLD' && p.category !== 'D');
  const inventions = A.INVENTION_CANDIDATES.filter((n) => n.category === 'D');
  const carry = c.ledger.openQuestions.filter((q) => ['U-1', 'U-3', 'U-9'].includes(q.id));
  return [
    '# 15 — Future-season reserve',
    '',
    generatedNote(['shared/site00-fiction-production/audit/proposals/', 'shared/site00-fiction-production/audit/inventions.ts', X.EXCHANGE_PATHS.knowledge]),
    '',
    PROPOSAL_NOTE,
    '',
    'Nothing here is a Season 1 change. No spinoff, no new principal, and no background person promoted to a lead.',
    '',
    '## 1. Reserved proposals (category D)',
    '',
    table(['ID', 'Title', 'Grows from', 'What Season 2 would do with it', 'Founder decision'], reserve.map((p) => [p.id, p.title, p.releases.join(', '), p.futureImpact, p.founderDecision])),
    '',
    '## 2. Reserved invention candidates',
    '',
    table(['ID', 'Name', 'Opportunity', 'Continuity risk'], inventions.map((n) => [n.id, n.name, n.opportunity, n.continuityRisk])),
    '',
    '## 3. Held for a Season 1 decision',
    '',
    table(['ID', 'Title', 'Category', 'Waits on', 'Founder decision'], held.map((p) => [p.id, p.title, p.category, list([...(p.blockedBy ?? []), ...(p.conflictsWith ?? []), ...(p.dependsOn ?? [])]), p.founderDecision])),
    '',
    '## 4. Future continuity register (section 23)',
    '',
    'A light register of what Season 1 leaves open on purpose. The audit adds nothing that resolves these.',
    '',
    table(
      ['Item', 'Origin', 'Status', 'Guard'],
      [
        ...carry.map((q) => [`${q.id}: ${q.question}`, q.appliesTo, q.status, 'No Season 1 proposal answers it.']),
        ...reserve.map((p) => [p.title, p.releases[0], 'FUTURE-SEASON RESERVE', 'No Season 1 runtime; no new identity until approved.']),
        ...inventions.map((n) => [n.name, 'New invention candidate', 'NEW_PROPOSAL', 'Needs a Bible 06 invention dossier before any use.']),
      ],
    ),
  ].join('\n');
}

export function approvalMatrixJson(_c: Ctx): string {
  return X.serializeJson({
    matrixId: 'THE-EXCHANGE.S1.LIVING-WORLD-AUDIT.FOUNDER-APPROVAL-MATRIX.V1',
    auditId: A.AUDIT_ID,
    sprintId: A.AUDIT_SPRINT_ID,
    baselineCommit: A.AUDIT_BASELINE_COMMIT,
    classification: 'NEW_PROPOSAL — NOT CANON. The founder decision on every item is PENDING.',
    boardKey: BOARD_KEY,
    counts: {
      proposals: A.PROPOSALS.length,
      byAuditRecommendation: Object.fromEntries(BOARD_ORDER.map((b) => [b, A.PROPOSALS.filter((p) => p.board === b).length])),
      byCategory: Object.fromEntries(Object.keys(A.CATEGORIES).map((k) => [k, A.PROPOSALS.filter((p) => p.category === k).length])),
      byType: Object.fromEntries(A.OPPORTUNITY_TYPES.map((t) => [t, A.PROPOSALS.filter((p) => p.type === t).length])),
    },
    priorities: A.PRIORITIES,
    secondTier: A.SECOND_TIER,
    proposals: A.PROPOSALS.map((p) => ({ ...p, auditRecommendation: p.board, founderDecisionStatus: 'PENDING' })),
  });
}
