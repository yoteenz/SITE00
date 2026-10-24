import * as X from '../../../shared/site00-fiction-production/index.js';
import { A, bullets, catName, citeLine, generatedNote, list, plusSec, PROPOSAL_NOTE, table, waitsOn, type Ctx } from './md.js';

type Proposal = X.Audit.Proposal;

const TYPE_TITLES: Record<X.Audit.OpportunityType, string> = {
  TECHNOLOGY: 'Technology',
  SENSORY_FLASHBACK: 'Sensory flashbacks and memory',
  AMBIENT_RETURN: 'Ambient returns',
  VISUAL_EASTER_EGG: 'Visual Easter eggs',
  SOCIAL_WORLDBUILDING: 'Social worldbuilding',
};

/** Before and after for one proposal, with its citations. Shared by deliverables 00, 14 and 17. */
export function beforeAfter(p: Proposal, heading = '###'): string {
  return [
    `${heading} ${p.id} — ${p.title}`,
    '',
    table(
      ['Field', 'Value'],
      [
        ['Category', catName(p.category)],
        ['Audit recommendation', p.board],
        ['Placement', p.placement],
        ['Before (what the source has now)', p.current],
        ['After (proposed)', p.proposed],
        ['Runtime', plusSec(p.runtimeSec)],
        ['Risk', `${p.risk.level}: ${p.risk.note}`],
        ['Canon impact', p.canonImpact],
        ['Waits on', waitsOn(p)],
        ['Founder decision needed', p.founderDecision],
        ['Founder decision', 'PENDING'],
      ],
    ),
    '',
    bullets(p.cites.map(citeLine)),
  ].join('\n');
}

export function priorityDoc(_c: Ctx): string {
  const recommended = A.PROPOSALS.filter((p) => p.board === 'APPROVE' || p.board === 'REVISE');
  const blocks = A.PRIORITIES.map((pr) =>
    [
      `## ${pr.id}. ${pr.title}`,
      '',
      pr.why,
      '',
      table(
        ['Proposal', 'Recommendation', 'Placement', 'Runtime', 'Waits on'],
        pr.proposals.map((id) => {
          const p = A.proposalById(id);
          return [`${p.id} ${p.title}`, p.board, p.placement, plusSec(p.runtimeSec), waitsOn(p)];
        }),
      ),
      '',
      table(
        ['Dimension (section 22)', 'Rating', 'Reason'],
        X.Audit.SCORE_DIMENSIONS.map((d) => [d, pr.scores[d].rating, pr.scores[d].reason]),
      ),
      '',
      ...pr.proposals.flatMap((id) => [beforeAfter(A.proposalById(id)), '']),
    ].join('\n'),
  );
  return [
    '# 14 — Priority recommendations',
    '',
    generatedNote(['shared/site00-fiction-production/audit/priorities.ts', 'shared/site00-fiction-production/audit/proposals/']),
    '',
    PROPOSAL_NOTE,
    '',
    `Twelve priorities, chosen from the ${recommended.length} proposals the audit recommends (${A.PROPOSALS.filter((p) => p.board === 'APPROVE').length} APPROVE, ${A.PROPOSALS.filter((p) => p.board === 'REVISE').length} REVISE). Each is rated on the ten section 22 dimensions, in words, with the reason for each rating. Every other recommended proposal is in the second tier. Held and rejected proposals are never ranked (validator PRIORITIES).`,
    '',
    table(
      ['Priority', 'Title', 'Proposals', 'Runtime'],
      A.PRIORITIES.map((pr) => [pr.id, pr.title, pr.proposals.join(', '), plusSec(pr.proposals.reduce((n, id) => n + A.proposalById(id).runtimeSec, 0))]),
    ),
    '',
    blocks.join('\n'),
    '## Second tier',
    '',
    'Recommended, worth doing when the affected screenplay is drafted, but not part of the main brief.',
    '',
    table(
      ['ID', 'Title', 'Type', 'Recommendation', 'Placement', 'Runtime', 'Waits on'],
      A.SECOND_TIER.map((id) => {
        const p = A.proposalById(id);
        return [p.id, p.title, p.type, p.board, p.placement, plusSec(p.runtimeSec), waitsOn(p)];
      }),
    ),
  ].join('\n');
}

export function beforeAfterDoc(_c: Ctx): string {
  const surviving = A.PROPOSALS.filter((p) => p.board !== 'REJECT');
  const rejected = A.PROPOSALS.filter((p) => p.board === 'REJECT');
  const sections = A.OPPORTUNITY_TYPES.map((t) => {
    const ps = surviving.filter((p) => p.type === t);
    return [`## ${TYPE_TITLES[t]} (${ps.length})`, '', ...ps.flatMap((p) => [beforeAfter(p), ''])].join('\n');
  });
  return [
    '# 17 — Before and after creative comparisons',
    '',
    generatedNote(['shared/site00-fiction-production/audit/proposals/', X.EXCHANGE_PATHS.master, A.SCENE_INDEX]),
    '',
    PROPOSAL_NOTE,
    '',
    `Every proposal the audit does not reject (${surviving.length} of ${A.PROPOSALS.length}), grouped by opportunity type. "Before" is what the source has now; "after" is the proposal. Each quote is verbatim from the cited release or file (validator CITATIONS). Nothing here is applied.`,
    '',
    sections.join('\n'),
    `## Rejected (${rejected.length})`,
    '',
    'Kept so each idea is not proposed again unexamined. Citations are in the 86-release matrix (02).',
    '',
    table(['ID', 'Title', 'Type', 'Placement', 'Violations', 'Reason'], rejected.map((p) => [p.id, p.title, p.type, p.releases[0], list(p.violates), p.rejectReason])),
  ].join('\n');
}
