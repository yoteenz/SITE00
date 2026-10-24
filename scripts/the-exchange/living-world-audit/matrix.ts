import * as X from '../../../shared/site00-fiction-production/index.js';
import { A, citeRef, list, plusSec, table, type Ctx } from './md.js';

const HEADER = [
  'RELEASE_ID',
  'RELEASE_TITLE',
  'CURRENT_RUNTIME',
  'CANON_STATUS',
  'STORY_PURPOSE',
  'MAJOR_CHARACTERS',
  'CURRENT_SCENES',
  'CURRENT_TECHNOLOGY',
  'CURRENT_FLASHBACKS',
  'CURRENT_BACKGROUND_CONTINUITY',
  'RELEASE_VERDICT',
  'OPPORTUNITY_TYPE',
  'PROPOSAL_ID',
  'CATEGORY',
  'EXACT_PLACEMENT',
  'ORIGINAL_SCENE_REFERENCE',
  'PROPOSED_CHANGE',
  'NARRATIVE_BENEFIT',
  'EMOTIONAL_BENEFIT',
  'VISUAL_BENEFIT',
  'CONTINUITY_RISK',
  'CANON_IMPACT',
  'RUNTIME_CHANGE',
  'PRODUCTION_COST_IMPACT',
  'RECOMMENDATION_STRENGTH',
  'AUDIT_RECOMMENDATION',
  'FOUNDER_DECISION_REQUIRED',
  'FOUNDER_DECISION',
  'RELEASE_NOTE',
];

/** What each release already has, from the audit's inventories. */
export function currentState(releaseId: string) {
  return {
    technology: A.EXISTING_TECHNOLOGY.filter((t) => t.appearsIn.includes(releaseId)).map((t) => t.name),
    flashbacks: A.MEMORY_INVENTORY.filter((m) => m.releaseId === releaseId).map((m) => `${m.kind} (${m.memoryType}): ${m.who}`),
    background: A.BACKGROUND_GROUPS.filter((g) => g.appearances.some((a) => a.releaseId === releaseId)).map((g) => g.name),
  };
}

/** Section 18, long format: one row per release and opportunity type, one more for each extra proposal in the same cell. */
export function matrixCsv(c: Ctx): string {
  const rows: Array<Array<string | number | null>> = [];
  for (const r of c.master.releases) {
    const brief = c.brief.get(r.id)!;
    const j = A.RELEASE_JUDGMENTS.find((x) => x.id === r.id)!;
    const now = currentState(r.id);
    const base = [
      r.id,
      r.title,
      `${r.runtimeTarget} (${r.runtimeTargetSec} s)`,
      `${r.classification}; screenplay ${brief.status.screenplay}`,
      r.characterPurpose,
      r.principalCharacters.length ? r.principalCharacters.join('; ') : r.featuredCharacters,
      brief.scenes.map((s) => s.sceneId).join('; '),
      now.technology.join('; ') || 'None on screen',
      now.flashbacks.join('; ') || 'None',
      now.background.join('; ') || 'None',
      VERDICTS[releaseVerdict(c, r.id)],
    ];
    for (const type of A.OPPORTUNITY_TYPES) {
      const note = j.notes?.[type] ?? '';
      const here = c.placedIn(r.id).filter((p) => p.type === type);
      if (!here.length) {
        const leans = referencedBy(r.id).filter((p) => p.type === type);
        const change = leans.length ? `No change placed here. Must stay consistent with ${leans.map((p) => `${p.id} (placed in ${p.releases[0]})`).join(', ')}.` : 'NO CHANGE RECOMMENDED';
        const verdict = leans.length ? 'CONTINUITY REFERENCE' : 'NO CHANGE RECOMMENDED';
        rows.push([...base, type, '', '', '', '', change, '', '', '', '', 'None', '0 s', 'NO_CHANGE', '', verdict, 'NO', 'NOT_REQUIRED', note || `Keep: ${j.keep}`]);
        continue;
      }
      for (const p of here) {
        rows.push([
          ...base,
          type,
          p.id,
          `${p.category} ${A.CATEGORIES[p.category]}`,
          p.placement,
          p.cites.filter((x) => x.releaseId === r.id).map(citeRef).join('; '),
          p.proposed,
          p.benefit?.narrative ?? '',
          p.benefit?.emotional ?? '',
          p.benefit?.visual ?? '',
          `${p.risk.level}: ${p.risk.note}`,
          p.canonImpact,
          plusSec(p.runtimeSec) + (p.releaseCountDelta ? `; +${p.releaseCountDelta} release` : ''),
          p.impact ? p.impact.generationCost : 'NOT_APPLICABLE',
          p.strength,
          p.board!,
          p.board === 'REJECT' ? 'NO' : `YES: ${p.founderDecision}${p.blockedBy?.length ? ` Waits on ${list(p.blockedBy)}.` : ''}`,
          'PENDING',
          note,
        ]);
      }
    }
  }
  return X.toCsv(HEADER, rows);
}

const live = (p: X.Audit.Proposal) => p.board === 'APPROVE' || p.board === 'REVISE';

/** Recommended proposals placed elsewhere that this release must stay consistent with (it is an origin or a later beat of theirs). */
export const referencedBy = (releaseId: string) => A.PROPOSALS.filter((p) => live(p) && p.releases[0] !== releaseId && p.releases.includes(releaseId));

export const VERDICTS = {
  ENHANCE: 'Enhance (see IDs)',
  CONTINUITY: 'Continuity reference only',
  HELD: 'Held for a founder decision',
  NO_CHANGE: 'NO CHANGE RECOMMENDED',
} as const;

/** One verdict per release. A release keeps NO CHANGE RECOMMENDED only if no surviving proposal is placed in it or leans on it. */
export function releaseVerdict(c: Ctx, releaseId: string): keyof typeof VERDICTS {
  if (c.placedIn(releaseId).some(live)) return 'ENHANCE';
  if (referencedBy(releaseId).length) return 'CONTINUITY';
  if (c.placedIn(releaseId).some((p) => p.board === 'HOLD')) return 'HELD';
  return 'NO_CHANGE';
}

/** Section 24 part 6: the 86 releases on one screen. */
export function compactMatrix(c: Ctx): string {
  const ids = (r: string, boards: X.Audit.BoardAction[]) => c.placedIn(r).filter((p) => boards.includes(p.board!)).map((p) => p.id).join(', ');
  return table(
    ['Release', 'Title', 'Runtime', 'Recommended here', 'Must stay consistent with', 'Held', 'Rejected', 'Verdict'],
    c.master.releases.map((r) => [
      r.id,
      r.title,
      r.runtimeTarget,
      ids(r.id, ['APPROVE', 'REVISE']) || '—',
      list(referencedBy(r.id).map((p) => p.id)),
      ids(r.id, ['HOLD']) || '—',
      ids(r.id, ['REJECT']) || '—',
      VERDICTS[releaseVerdict(c, r.id)],
    ]),
  );
}
