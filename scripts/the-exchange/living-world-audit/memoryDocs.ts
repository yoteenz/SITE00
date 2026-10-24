import * as X from '../../../shared/site00-fiction-production/index.js';
import { A, bullets, catName, citeLine, countBy, generatedNote, list, plusSec, PROPOSAL_NOTE, table, type Ctx } from './md.js';

const SRC = ['shared/site00-fiction-production/audit/memoryInventory.ts', 'shared/site00-fiction-production/audit/proposals/memory.ts', X.EXCHANGE_PATHS.knowledge];
const sensory = () => A.PROPOSALS.filter((p) => p.type === 'SENSORY_FLASHBACK');
const withMemory = () => A.PROPOSALS.filter((p) => p.memory);
const whose = (m: X.Audit.MemorySpec) => (m.memoryType ? `${m.pov} (${m.memoryType}; witnessed: ${m.povWitnessed})` : 'Nobody\'s: the film\'s own voice');

/** Section 09 subjects, mapped to what the season already has and what the audit proposes. */
const SUBJECTS: Array<{ subject: string; now: string; ids: string[]; verdict: string }> = [
  { subject: 'Vivienne', now: 'A ledger entry (S1-08), Richard\'s recollection (S1-58), Celestine\'s flash (S1-77), a funny story (S1-80), two lines in her hand (S1-86).', ids: ['F-06', 'F-07', 'V-07', 'F-09', 'F-14', 'F-13', 'T-16'], verdict: 'She is never heard speaking. She speaks only in her own handwriting. Keep it.' },
  { subject: 'Sloane\'s childhood', now: 'Dessert first (S1-02), unexplained until later.', ids: ['F-17', 'F-09'], verdict: 'NO CHANGE RECOMMENDED for Season 1.' },
  { subject: 'Nadine', now: 'She works out the year of her birth from a dance card (S1-20).', ids: ['F-01', 'F-10', 'F-18'], verdict: 'Sound only: Mavis\'s truck heard in S1-12, the song returning in S1-20.' },
  { subject: 'Richard', now: 'His recollection is the season\'s only extended flashback (S1-58).', ids: ['F-06', 'F-15'], verdict: 'Make the recollection honest about where he stood (F-06).' },
  { subject: 'Gideon', now: 'No memory scenes.', ids: ['F-16'], verdict: 'NO CHANGE RECOMMENDED for Season 1.' },
  { subject: 'Kai and his shared history', now: 'Told in three lines (S1-56).', ids: ['F-20', 'F-11'], verdict: 'Keep it told. Showing it costs runtime or spends a reveal.' },
  { subject: 'Institutional legacy', now: 'Ada\'s year-end ledger (S1-83); the old rig\'s memory (S1-76).', ids: ['F-08', 'T-12'], verdict: 'The institution remembers in paper and machines, never in pictures.' },
  { subject: 'Patrons\' pasts', now: 'Clementine\'s recited menu (S1-16), Inez\'s 1981 sketch (S1-25), Dee\'s record (S1-40), Honora\'s account (S1-36).', ids: ['F-02', 'F-03', 'F-04', 'F-05', 'F-12'], verdict: 'Each patron\'s past enters through their own sense: rhythm, line, crowd, laugh. Honora\'s harm stays told by her.' },
  { subject: 'Past Exchange Nights', now: 'The first pavilion survives only in the rig\'s memory (S1-76).', ids: ['F-19', 'F-11'], verdict: 'No pavilion flashback; music carries Nights forward instead.' },
  { subject: 'Generations', now: '1981 sketch to S1-70 skirt; Ezekiel\'s menu to S1-73; Mavis\'s 1986 to S1-20.', ids: ['F-03', 'F-02', 'F-01'], verdict: 'Objects and music pass between generations without cutting to the past.' },
];

export function sensoryAuditDoc(_c: Ctx): string {
  const kinds = countBy(A.MEMORY_INVENTORY, (m) => m.kind);
  const detail = withMemory().map((p) => {
    const m = p.memory!;
    return [
      `### ${p.id} — ${p.title}`,
      '',
      `${catName(p.category)} · audit recommendation **${p.board}** · placement ${p.placement}`,
      '',
      table(
        ['Field (sections 10 and 11)', 'Value'],
        [
          ['Mode', m.mode],
          ['Memory type', m.memoryType ?? 'None claimed'],
          ['Whose memory', whose(m)],
          ['Recorded source', m.recordedSource ?? '—'],
          ['Present-day trigger', m.trigger],
          ['Memory period', m.period],
          ['Source of sound', m.soundSource],
          ['Transition sound', m.transitionSound],
          ['Visual transition', m.visualTransition],
          ['Audience information gained', m.audienceGains],
          ['Character emotional change', m.emotionalChange],
          ['Return-to-present cue', m.returnCue],
          ['Continuity implication', m.continuityImplication],
          ['Approximate runtime effect', plusSec(p.runtimeSec)],
        ],
      ),
      '',
      p.board === 'REJECT' ? `Rejected: ${p.rejectReason}` : `Proposed: ${p.proposed}`,
      '',
      bullets(p.cites.map(citeLine)),
    ].join('\n');
  });
  const noSpec = sensory().filter((p) => !p.memory);
  return [
    '# 06 — Sensory flashback and memory audit',
    '',
    generatedNote(SRC),
    '',
    PROPOSAL_NOTE,
    '',
    '## 1. How the season remembers now',
    '',
    `The master has ${kinds.VISUAL_FLASHBACK ?? 0} pictures of the past (S1-58 and S1-77). Everything else is speech, paper, inference or archive. Sound is therefore the season\'s memory register, and the audit keeps it that way: no proposal recommended outright adds a new visual flashback.`,
    '',
    table(['Release', 'Kind', 'Memory type', 'Who', 'Master text', 'Note'], A.MEMORY_INVENTORY.map((m) => [m.releaseId, m.kind, m.memoryType, m.who, `"${m.quote}"`, m.note])),
    '',
    `By kind: ${Object.entries(kinds).map(([k, v]) => `${k} ${v}`).join(', ')}.`,
    '',
    '## 2. Subjects (section 09)',
    '',
    table(['Subject', 'Already in the season', 'Proposals (recommendation)', 'Verdict'], SUBJECTS.map((s) => [s.subject, s.now, s.ids.map((id) => `${id} (${A.proposalById(id).board})`).join(', '), s.verdict])),
    '',
    '## 3. Every memory moment proposed',
    '',
    'Memory types follow section 11. Score motifs and object matches are the film\'s voice and claim nobody\'s memory. Acoustic matches can be the film\'s alone or heard by a character. A flashback is never Echo Archive access to a mind.',
    '',
    detail.join('\n\n'),
    '',
    '## 4. Ideas without a memory specification',
    '',
    'Held for Season 2 or rejected before a transition was worth designing.',
    '',
    table(['ID', 'Title', 'Category', 'Recommendation', 'Why'], noSpec.map((p) => [p.id, p.title, catName(p.category), p.board, p.board === 'REJECT' ? p.rejectReason : p.futureImpact])),
    '',
    '## 5. Scenes a flashback would make weaker',
    '',
    bullets(sensory().filter((p) => p.board === 'REJECT').map((p) => `${p.releases[0]} (${p.id}): ${p.rejectReason}`)),
  ].join('\n');
}

const DEVICES: Array<[string, string, string, string]> = [
  ['Sound bridge', 'The next sound arrives before the picture changes.', 'F-04 (the dusk wind thins into a 1985 crowd)', 'When the picture does not change at all, it is a sound memory, not a bridge.'],
  ['Music continuity', 'A tune carries across time or releases.', 'F-01 (the truck song becomes Clarence\'s count-off), F-19', 'Do not quote the whole tune; a figure is enough (directorial bible section 9).'],
  ['Acoustic match cut', 'Two sounds with the same shape meet at a cut.', 'F-05 (Yaz\'s laugh), F-08 (one sound per request)', 'Never two matches in one release; it becomes a trick.'],
  ['Environmental sound', 'A room\'s ambience carries a period.', 'F-06 (the garage\'s room tone against the study\'s)', 'Design each room once and reuse it with the set.'],
  ['Melodic phrase', 'A few notes stand for a person or a Night.', 'F-19 (two bars of Clarence\'s trumpet)', 'Not for Vivienne: she is never scored as a theme.'],
  ['Diegetic source', 'The memory\'s sound has a source in its own world.', 'F-06 (the record player), F-01 (the truck radio)', 'Prefer a source over score whenever the master gives one.'],
  ['Perspective shift', 'Sound heard from where the witness stood.', 'F-06 (the garage from the doorway)', 'Only for a witness the master puts in the room.'],
  ['Interruption', 'A present sound breaks the memory off.', 'F-06 (the needle lift)', 'Return cues must be clear; never leave the audience unsure which time they are in.'],
  ['Reverb change', 'The space of a sound changes with time.', 'F-04 (a far-away stadium)', 'Subtle only; no echo effects.'],
  ['Silence', 'The absence of a sound is the memory.', 'F-04 (the silent Echo Track), F-08 ("Sunset: failed." gets room tone)', 'Silence is a music decision (MB-02); record it as a cue.'],
  ['Visual match', 'A shape in the present matches one from the past without a cut back.', 'F-03 (the skirt opens into the 1981 pencil line)', 'Only for objects that exist in both periods.'],
  ['Object-led transition', 'An object carries the cut.', 'F-06 (objects for what Richard did not see), V-07 (the seal)', 'The object must already be in the scene.'],
  ['Movement match', 'A movement continues across a cut.', 'R-04 (the teenager\'s step, across releases)', 'Across releases only; inside a scene it competes with the action.'],
  ['Light and texture', 'Light or grain marks the past.', 'F-07 (the hum and warmth of the first gold light)', 'Memory texture is warmer, softer, slightly unstable, and belongs to the person remembering (directorial bible section 5).'],
];

export function transitionGrammarDoc(_c: Ctx): string {
  const live = withMemory().filter((p) => p.board !== 'REJECT');
  return [
    '# 07 — Audio-visual transition grammar',
    '',
    generatedNote([...SRC, A.DIRECTORIAL_BIBLE]),
    '',
    PROPOSAL_NOTE,
    '',
    `This grammar sits inside the provisional season directorial bible (\`${A.DIRECTORIAL_BIBLE}\`, PROVISIONAL — FOUNDER REVIEW REQUIRED) and does not replace it.`,
    '',
    '## 1. Principles',
    '',
    bullets([
      'Sound leads, picture follows. Let the next time arrive in the ear a beat before the eye (directorial bible section 11).',
      'There is no mandatory flashback sound. No two transitions use the same device in the same way.',
      'Clarity first: every move into the past has a return cue the audience can hear.',
      'The picture stays in the present unless the master already has a flashback there (S1-58, S1-77). Everywhere else memory is sound, music, an object or a match.',
      'Technology is quiet (MB-02). A device never makes a transition sound of its own. The lanterns\' hum is the exception the master gives: "They\'re humming." (S1-59).',
      'One designed sound per moment. Before an emotional line, take ambience away rather than add a sting.',
      'Undated memories keep their ambiguity. Do not add a caption, a year or a date the master does not give.',
      'A transition never claims a memory the character could not have. Score and object matches belong to the film.',
    ]),
    '',
    '## 2. Toolkit',
    '',
    table(['Device', 'What it is', 'Where the audit uses it', 'Limit'], DEVICES),
    '',
    '## 3. Transitions proposed (section 10 fields)',
    '',
    table(
      ['ID', 'Release', 'Recommendation', 'Trigger', 'Period', 'Sound source', 'Transition sound', 'Visual transition', 'Audience gains', 'Emotional change', 'Return cue', 'Continuity', 'Runtime'],
      live.map((p) => {
        const m = p.memory!;
        return [p.id, p.releases[0], p.board, m.trigger, m.period, m.soundSource, m.transitionSound, m.visualTransition, m.audienceGains, m.emotionalChange, m.returnCue, m.continuityImplication, plusSec(p.runtimeSec)];
      }),
    ),
    '',
    '## 4. Releases with more than one memory device',
    '',
    bullets(
      Object.entries(countBy(live, (p) => p.releases[0]))
        .filter(([, n]) => n > 1)
        .map(([r, n]) => `${r}: ${n} (${live.filter((p) => p.releases[0] === r).map((p) => `${p.id} ${p.memory!.mode}`).join(', ')}). Use different devices.`),
    ),
  ].join('\n');
}

export function revelationContinuityDoc(c: Ctx): string {
  const order = new Map(c.master.releases.map((r, i) => [r.id, i]));
  const facts = [...c.ledger.facts].sort((a, b) => (a.audienceFrom ? order.get(a.audienceFrom)! : 999) - (b.audienceFrom ? order.get(b.audienceFrom)! : 999));
  const touching = (fact: string) => A.PROPOSALS.filter((p) => p.memory?.revealsFacts.includes(fact));
  const wr = A.PROPOSALS.filter((p) => p.memory?.revealsFacts.some((f) => f.startsWith('WR-')));
  const mem = c.checks.find((k) => k.id === 'MEMORY_POV')!;
  const rev = c.checks.find((k) => k.id === 'REVEAL_TIMING')!;
  return [
    '# 08 — Memory and revelation continuity report',
    '',
    generatedNote([...SRC, A.SCENE_INDEX, A.TRUTH_DOC]),
    '',
    PROPOSAL_NOTE,
    '',
    '## 1. Reveal order, unchanged',
    '',
    'The audience learns each fact in the release the ledger names. No surviving proposal shows a fact earlier. KF-09 and KF-10 are not revealed in Season 1.',
    '',
    table(
      ['Fact', 'Statement', 'Audience learns it in', 'Proposals that put it on screen', 'Placed in'],
      facts.map((f) => [f.factId, f.statement, f.audienceFrom ?? 'Not in Season 1', touching(f.factId).map((p) => `${p.id} (${p.board})`).join(', ') || '—', touching(f.factId).map((p) => p.releases[0]).join(', ') || '—']),
    ),
    '',
    '## 2. Writers\'-room facts the audit keeps off screen',
    '',
    `The writers\'-room truth document is labelled NONCANONICAL. PROPOSED — NOT APPROVED. and says of the studio visit: "The audience does not learn it in Season 1." Every proposal that would show a writers\'-room fact is rejected.`,
    '',
    table(['ID', 'Idea', 'Fact', 'Violations', 'Reason'], wr.map((p) => [p.id, p.proposed, p.memory!.revealsFacts.join(', '), list(p.violates), p.rejectReason])),
    '',
    '## 3. Section 12 questions for every memory moment',
    '',
    table(
      ['ID', 'Recommendation', 'Whose memory', 'Audience believes now', 'Reinterprets', 'Premature reveal?', 'Undermines a mystery?', 'Unfair concealment?', 'Payoff justifies placement?'],
      withMemory().map((p) => {
        const m = p.memory!;
        return [p.id, p.board, whose(m), m.audienceBeliefNow, m.reinterprets, m.prematureReveal, m.underminesMystery, m.unfairConcealment, m.payoffJustifies];
      }),
    ),
    '',
    '## 4. Chronology and point of view',
    '',
    bullets([
      'Vivienne died ten years before the season, at 55 (knowledge ledger). Her final commission was withdrawn nineteen days before her death; the truth document\'s "20 days before" is an internal outlier (deliverable 01, SD-01).',
      'The garage dance is thirty-one years ago. Richard tells it in S1-58 and the ledger records he witnessed it; F-06 limits the picture to what he could see from the doorway.',
      'Celestine\'s S1-77 flash is her own memory of the same night (F-07), so the two flashbacks agree on facts and differ on point of view.',
      'Kai\'s apprenticeship is told by Kai (S1-56). A picture of it (F-20) would be his own memory and would arrive on time, but it costs eight seconds and a new face lock, so it is not recommended.',
      'No flashback is attributed to anyone the master does not place in the room.',
    ]),
    '',
    '## 5. Checks',
    '',
    table(
      ['Check', 'What it tests', 'Items', 'Result'],
      [mem, rev].map((k) => [k.id, k.title, k.checked, k.errors.length ? `FAIL: ${k.errors.join('; ')}` : 'PASS']),
    ),
  ].join('\n');
}
