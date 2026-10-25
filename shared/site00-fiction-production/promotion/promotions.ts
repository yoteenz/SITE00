import { PROPOSALS } from '../audit/proposals/index.js';
import type { Citation, Proposal } from '../audit/types.js';
import { LIVING_WORLD_AMENDMENTS } from './amendments.js';
import { ASSET_REQUIREMENTS, PRODUCTION_HOLDS } from './assets.js';
import { BACKGROUND_IDENTITIES } from './background.js';
import {
  APPROVED_GROUPS,
  FOUNDER_ANSWERS,
  FOUNDER_APPROVED_IDS,
  NOT_APPROVED,
  PHASE,
  PROMOTION_APPROVAL,
  PROMOTION_ORDER,
  type DecisionState,
  type ProductionState,
} from './founder.js';
import { SOUND_MOTIFS, WORLD_RULES } from './rules.js';
import { S101_PATCH } from './s101Patch.js';

const APPROVED = new Set(FOUNDER_APPROVED_IDS);
const groupOf = (id: string) => APPROVED_GROUPS.find((g) => g.proposals.includes(id)) ?? null;
const answerFor = (decisionId: string) => FOUNDER_ANSWERS.find((a) => a.decisionId === decisionId) ?? null;
const ALT = /\s*Alternative \(R-01-ALT\):.*$/s;

/** The approved behaviour is the audit's proposed text, word for word. The only cut is the alternative the founder declined. */
export const approvedBehavior = (p: Proposal) => (p.id === 'R-01' ? p.proposed.replace(ALT, '') : p.proposed);

export type EdgeResolution = { to: string; kind: 'DEPENDS_ON' | 'WAITS_ON_DECISION' | 'CONFLICTS_WITH'; resolution: string; open: boolean };

function edgesFor(p: Proposal): EdgeResolution[] {
  const out: EdgeResolution[] = [];
  for (const d of p.dependsOn ?? []) {
    const before = PROMOTION_ORDER.indexOf(d) >= 0 && PROMOTION_ORDER.indexOf(d) < PROMOTION_ORDER.indexOf(p.id);
    out.push({ to: d, kind: 'DEPENDS_ON', resolution: APPROVED.has(d) ? `${d} is founder-approved and promoted ${before ? 'first' : 'out of order'}.` : `${d} is not approved; ${p.id} cannot be promoted.`, open: !APPROVED.has(d) || !before });
  }
  for (const b of p.blockedBy ?? []) {
    const a = answerFor(b);
    if (!a) out.push({ to: b, kind: 'WAITS_ON_DECISION', resolution: `${b} is still open.`, open: true });
    else out.push({ to: b, kind: 'WAITS_ON_DECISION', resolution: `${b} answered ${a.answer}.${a.stillOpen ? ` Still open: ${a.stillOpen}` : ''}`, open: Boolean(a.stillOpen) });
  }
  for (const c of p.conflictsWith ?? []) out.push({ to: c, kind: 'CONFLICTS_WITH', resolution: APPROVED.has(c) ? `${c} is also approved: conflict.` : `${c} stays unapproved and is not promoted.`, open: APPROVED.has(c) });
  return out;
}

const beatOf = (c: Citation) => `${c.sceneId}${c.beat === undefined || c.beat === null ? '' : ` beat ${c.beat}`}`;

export type PromotionRecord = ReturnType<typeof promotionRecord>;

function promotionRecord(p: Proposal) {
  const group = groupOf(p.id)!;
  const amendments = Object.values(LIVING_WORLD_AMENDMENTS).flat().filter((a) => a.recommendationId === p.id);
  const holds = PRODUCTION_HOLDS.filter((h) => !h.lifted && h.blocks.includes(p.id));
  const assets = ASSET_REQUIREMENTS.filter((a) => a.proposalIds.includes(p.id));
  const productionState: ProductionState = holds.length ? 'CONDITIONAL_PRODUCTION_HOLD' : assets.every((a) => a.status === 'NOT_REQUIRED') ? 'NO_PRODUCTION_ASSET' : 'PENDING_PRODUCTION';
  return {
    proposalId: p.id,
    title: p.title,
    type: p.type,
    category: p.category,
    priority: group.priority,
    founderLabel: group.founderLabel,
    phase: PHASE[p.id],
    order: PROMOTION_ORDER.indexOf(p.id) + 1,
    decisionState: 'FOUNDER_APPROVED' as DecisionState,
    auditRecommendation: p.board,
    founderApproval: `${PROMOTION_APPROVAL} (${group.priority} ${group.founderLabel})`,
    sourceEvidence: p.cites.map((c) => ({ ref: beatOf(c), file: c.file ?? 'THE_EXCHANGE/SEASON_1/SEASON1_86_RELEASE_MASTER_V1.json', quote: c.quote })),
    affectedReleases: p.releases,
    affectedBeats: amendments.length ? [...new Set(amendments.map((a) => a.placementEvidence.split(':')[0]))] : [p.placement],
    originalBehavior: p.current,
    approvedBehavior: approvedBehavior(p),
    runtimeImpactSec: 0,
    continuityImplications: [p.memory?.continuityImplication, p.callback ? `${p.callback.recognition} recognition; ${p.callback.venue} venue (${p.callback.accessRoute}); speaks: ${p.callback.speaks}.` : undefined, p.expansion?.continuity, p.risk.note].filter((x): x is string => Boolean(x)),
    assetImplications: assets.map((a) => `${a.assetId}: ${a.item} — ${a.status}`),
    productionState,
    productionHolds: holds.map((h) => h.holdId),
    dependencies: edgesFor(p),
    implementation: {
      masterAmendments: amendments.map((a) => a.amendmentId),
      worldRules: WORLD_RULES.filter((r) => r.proposalIds.includes(p.id)).map((r) => r.ruleId),
      soundMotifs: SOUND_MOTIFS.filter((m) => m.proposalIds.includes(p.id)).map((m) => m.motifId),
      backgroundIdentities: BACKGROUND_IDENTITIES.filter((b) => b.approvedAppearances.some((a) => a.proposalId === p.id)).map((b) => b.identityId),
      s101Patch: S101_PATCH.filter((x) => x.proposals.includes(p.id)).map((x) => x.patchId),
    },
  };
}

/** The 19, in promotion order. */
export const PROMOTIONS: PromotionRecord[] = PROMOTION_ORDER.map((id) => promotionRecord(PROPOSALS.find((p) => p.id === id)!));

export type ReconciliationRow = {
  proposalId: string;
  title: string;
  type: string;
  category: string;
  auditRecommendation: string;
  founderDecision: DecisionState;
  priority: string | null;
  promoted: boolean;
  founderNote: string | null;
  waitsOn: Array<{ decisionId: string; status: string }>;
  conflictsWithApproved: string[];
  contradictsFounderDecision: string | null;
};

const CONTRADICTS: Record<string, string> = { 'C-01': 'FD-S101-07 ANONYMOUS: the S1-01 tailor is not Wendell Ames.' };

/** All 72 audit proposals. Only the founder's 19 are FOUNDER_APPROVED; the other 53 keep their audit recommendation and await the founder. */
export const RECONCILIATION: ReconciliationRow[] = PROPOSALS.map((p) => {
  const approved = APPROVED.has(p.id);
  return {
    proposalId: p.id,
    title: p.title,
    type: p.type,
    category: p.category,
    auditRecommendation: p.board ?? 'NONE',
    founderDecision: approved ? 'FOUNDER_APPROVED' : 'PENDING_FOUNDER',
    priority: groupOf(p.id)?.priority ?? null,
    promoted: approved,
    founderNote: NOT_APPROVED.find((n) => n.id === p.id)?.founderNote ?? null,
    waitsOn: (p.blockedBy ?? []).map((b) => {
      const a = answerFor(b);
      return { decisionId: b, status: a ? `ANSWERED ${a.answer}${a.stillOpen ? ' (part still open)' : ''}` : 'OPEN' };
    }),
    conflictsWithApproved: (p.conflictsWith ?? []).filter((c) => APPROVED.has(c)),
    contradictsFounderDecision: CONTRADICTS[p.id] ?? null,
  };
});

/** What each release will need from the approved directions, tracked silently until that release is active. */
export function livingWorldDependencies(master: { releases: Array<{ id: string }> }) {
  const releases = master.releases.map((r) => r.id);
  return {
    rule: 'Founder-approved living-world directions (2026-10-25). Identity references, designs and holds reach the founder only when their release enters active production.',
    recurringBackground: BACKGROUND_IDENTITIES.filter((b) => b.tier === 'RECURRING_BACKGROUND').map((b) => ({ identityId: b.identityId, censusPersonId: b.censusPersonId, flags: b.flags, facialReference: b.facialReference, releases: [...b.knownAppearances, ...b.approvedAppearances.map((a) => a.releaseId)] })),
    byRelease: releases
      .map((id) => ({
        releaseId: id,
        identities: BACKGROUND_IDENTITIES.filter((b) => b.approvedAppearances.some((a) => a.releaseId === id) || (b.tier === 'RECURRING_BACKGROUND' && b.knownAppearances.includes(id))).map((b) => b.identityId),
        assets: ASSET_REQUIREMENTS.filter((a) => a.releases.includes(id)).map((a) => `${a.assetId} (${a.status})`),
        holds: [...new Set(ASSET_REQUIREMENTS.filter((a) => a.releases.includes(id)).flatMap((a) => a.holds))],
      }))
      .filter((r) => r.identities.length || r.assets.length),
    holds: PRODUCTION_HOLDS,
  };
}
