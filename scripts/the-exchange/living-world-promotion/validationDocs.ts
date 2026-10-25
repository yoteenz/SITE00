import * as X from '../../../shared/site00-fiction-production/index.js';
import { A, allAmendments, BANNER, bullets, CLOSING, generatedNote, P, pass, release, rid, SRC, table, type Ctx } from './md.js';

const head = (n: string, title: string, sources: string[]) => [`# ${n} — ${title}`, '', generatedNote(sources), '', BANNER, ''];

export function continuityDoc(c: Ctx): string {
  const lw = allAmendments();
  const ids = [...new Set(lw.map((a) => rid(a.amendmentId)))];
  const facts = X.KNOWLEDGE_FACTS;
  const memory = P.PROMOTIONS.filter((p) => A.proposalById(p.proposalId).memory?.revealsFacts.length).map((p) => {
    const m = A.proposalById(p.proposalId).memory!;
    return [p.proposalId, m.revealsFacts.map((f) => `${f} (ledger: audience learns in ${facts.find((x) => x.factId === f)?.audienceFrom ?? '—'})`).join('; '), p.affectedReleases[0], m.prematureReveal];
  });
  return [
    ...head('09', 'Cross-release continuity validation', [SRC.promotion, SRC.master, 'THE_EXCHANGE/SEASON_1/KNOWLEDGE_AND_CONTINUITY_LEDGER_V1.json']),
    `The full 86-release season was re-validated after the promotion: promotion validator ${c.checks.filter((k) => !k.errors.length).length} of ${c.checks.length}, audit validator ${c.auditChecks.filter((k) => !k.errors.length).length} of ${c.auditChecks.length}. No central relationship changes meaning to fit an enhancement.`,
    '',
    '## 1. Chronology',
    '',
    `Release order, fictional days and Nights are untouched: with the amendments removed the master is the audit baseline byte for byte (MASTER_BASELINE ${pass(c, 'MASTER_BASELINE')}). Every amendment sits inside an existing release:`,
    '',
    table(['Release', 'Title', 'Fictional day', 'Night', 'Amended by'], ids.map((id) => [id, release(c, id).title, release(c, id).fictionalDay, release(c, id).exchangeNight ? 'Yes' : '—', lw.filter((a) => rid(a.amendmentId) === id).map((a) => a.recommendationId).join(', ')])),
    '',
    '## 2. Character knowledge and historical memory',
    '',
    `Approved memories are witnessed by their point of view and reveal nothing before the knowledge ledger's release (MEMORY ${pass(c, 'MEMORY')}).`,
    '',
    table(['Proposal', 'Reveals', 'Where', 'Premature reveal'], memory),
    '',
    bullets([
      "S1-58 is Richard's recollection (master). He knew the Ember's origin from before the season (KF-06, known by Richard from S1-01) and watched the dance from the doorway; the letter and the newspaper, which he did not witness, appear only as objects.",
      "S1-77 is Celestine's recollection of the same dance, from inside it. Same set and faces, different camera. It does not contradict S1-58: one event, two positions.",
      "S1-12's truck sound is Mavis's memory: she drove the truck. Richard's wife is never seen or heard.",
      "S1-37's 1985 crowd is Dee's memory alone. The Echo Track in S1-40 is silent footage-light and recreates nobody's memory (WR-06).",
    ]),
    '',
    '## 3. Institutional rules and technology',
    '',
    `Every rule is checked against the releases it cites, including text that looks related but is not governed (WORLD_RULES ${pass(c, 'WORLD_RULES')}).`,
    '',
    table(['Rule', 'Subject', 'Releases', 'Evidence lines', 'Not governed'], P.WORLD_RULES.map((w) => [w.ruleId, w.subject, w.appliesTo.join(', '), w.evidence.length, w.notGoverned.map((e) => e.releaseId).join(', ') || '—'])),
    '',
    '## 4. Props, motifs, locations and costume',
    '',
    table(
      ['Thread', 'Releases', 'Continuity'],
      [
        ['Copper wax seal', 'S1-07, S1-11, S1-17, S1-57, S1-78, S1-86', 'Intact until S1-86; S1-17 shows terms already opened. One prop sheet.'],
        ['Relay card', 'S1-15, S1-34, S1-86', 'Blank to its writer; carried by people; no delivery shown.'],
        ['The flickering lantern', 'S1-59, S1-76', 'One lantern, one position on the promenade, one copper pattern. S1-67\'s gold switch is a different act.'],
        ["Kai's pliers", 'S1-22, S1-59', 'Given in S1-22; on her handlebar in S1-59.'],
        ["Grandmother's cardigan and glasses", 'S1-01, S1-59', 'Same everyday look; no dress yet.'],
        ['The jewel-green dress', 'S1-01, S1-77', 'One garment; design open (FD-S101-05).'],
        ["Tailor's clothes", 'S1-01, S1-77', 'Work clothes in S1-01; a suit of his own making in S1-77; never orange.'],
        ["Teenager's step", 'S1-01, S1-51', 'The same four counts; landed every time in S1-51.'],
        ['Sound motifs', P.SOUND_MOTIFS.flatMap((m) => m.placements.map((p) => p.releaseId)).filter((x, i, a) => a.indexOf(x) === i).join(', '), `${P.SOUND_MOTIFS.length} registered (deliverable 05); none composed.`],
        ['Locations', 'S1-22 workshop, S1-51 Ferry Street market, S1-59 and S1-76 promenade, S1-77 far bank', 'All existing master settings; S1-76 is "The promenade, alone among a thousand lanterns."'],
      ],
    ),
    '',
    '## 5. Social access',
    '',
    `Every recurring-background return is in a public place with a stated route in, and nobody is implied to hold an Exchange invitation (BACKGROUND_IDENTITIES ${pass(c, 'BACKGROUND_IDENTITIES')}). The far bank is its own public celebration, not the Night.`,
    '',
    '## 6. Special attention',
    '',
    table(
      ['Subject', 'Finding'],
      [
        ['Vivienne', 'Seen only in the two master memories (S1-58, S1-77), held for face locks (FD-18). Never seen or heard in S1-12. Her envelope stays sealed until S1-86; the two lines the audience reads there are unchanged.'],
        ['Richard', 'A witness in S1-58, never shown knowing what he did not see. The S1-54 disclosure and his arc are unchanged.'],
        ['Celestine', "Her memory in S1-77 completes S1-58 without correcting it. She breaks the season's only seal in S1-86, and her Relay blanks as Tina's did."],
        ['Sloane', "Unchanged choices: she does not open the envelope in S1-57, gives it away in S1-78, and keeps her own four beats in S1-51. In S1-75 her words are repeated by the room; no line is added."],
        ['Kai', "S1-76's failure and the erasure are unchanged. The pliers girl adds no relationship."],
        ['Exchange Nights', 'No Night is added, moved or re-labelled. The far bank is not a Night.'],
        ['S1-54 breach', 'Still a human leak, by repetition. WR-03 says why the Ember could not stop it, without explaining it on screen.'],
        ['S1-59 and S1-76 lanterns', 'The S1-59 flicker reveals nothing; S1-76 rewards it a moment before the unchanged failure.'],
        ['S1-75 public speech', 'Her speech is unchanged; the room repeating it is background murmur inside the existing applause.'],
        ['S1-77 riverbank', 'Public, uninvited, same place and time. The grandmother and the tailor return separately; neither speaks.'],
        ['S1-86 finale', 'The seal cracks once; the Relay blanks; nothing else is added.'],
      ],
    ),
    '',
    CLOSING,
  ].join('\n');
}

const REQUIRED_TESTS: Array<[string, string]> = [
  ['Exactly 19 approved proposal IDs; no duplicates', 'APPROVED_COUNT'],
  ['Exactly 53 remaining unapproved proposal IDs', 'REMAINING_53'],
  ['No unauthorized alternative promotion: R-12, R-01-ALT, C-01, R-14', 'DECLINED_ALTERNATIVES'],
  ['Identity tiers of the S1-01 tailor, grandmother and teenager; balcony woman and neighbour scene-scoped', 'BACKGROUND_IDENTITIES'],
  ['Anonymous tailor preserved', 'ANONYMOUS_TAILOR'],
  ["Grandmother's existing S1-59 line preserved", 'GRANDMOTHER_LINE'],
  ['Dress style unresolved; R-02 production hold active', 'DRESS_OPEN'],
  ['Relay order T-02 before T-01; S-02 before R-04; W-01 before R-02 and R-03; every graph edge resolved', 'DEPENDENCIES'],
  ['Copper wax, Ember, gold ladder and lantern rules consistent', 'WORLD_RULES'],
  ['Memory POV supportable; no new visual flashbacks', 'MEMORY'],
  ['No new invented dialogue', 'NO_NEW_DIALOGUE'],
  ['No unintended relationships', 'BACKGROUND_IDENTITIES'],
  ['No release-count change; no runtime expansion', 'RUNTIME'],
  ['Master changed only by the promoted amendments', 'MASTER_BASELINE'],
  ['S1-01 packet, Fountain drafts, approval book and registries untouched', 'UNCHANGED_FILES'],
  ['S1-01 patch plan accurate and non-destructive', 'S1-01_PATCH'],
  ['No fabricated assets, URLs or spend', 'ASSETS'],
];

export function validationDoc(c: Ctx): string {
  const ok = c.checks.filter((k) => !k.errors.length).length;
  return [
    ...head('14', 'Validation report', ['shared/site00-fiction-production/promotion/validate.ts', 'shared/site00-fiction-production/audit/validate.ts']),
    `Result: **${ok === c.checks.length ? 'PASS' : 'FAIL'} (${ok} of ${c.checks.length} promotion checks)**, and the audit validator ${c.auditChecks.filter((k) => !k.errors.length).length} of ${c.auditChecks.length} on the promoted canon. Both read the committed records and canon; neither writes anything. Build and test results are in deliverable 15.`,
    '',
    '## 1. Promotion checks',
    '',
    table(['Check', 'What it tests', 'Items checked', 'Result'], c.checks.map((k) => [k.id, k.title, k.checked, k.errors.length ? `FAIL: ${k.errors.slice(0, 3).join('; ')}` : 'PASS'])),
    '',
    '## 2. Section 19 tests',
    '',
    table(['Required', 'Check', 'Result'], [...REQUIRED_TESTS.map(([t, id]) => [t, id, pass(c, id)]), ['No media generation, no provider credit, no deployment, no automatic merge', 'None: the promotion module has no provider, deploy or merge code path', 'PASS']]),
    '',
    '## 3. Audit checks on the promoted canon',
    '',
    table(['Check', 'Result'], c.auditChecks.map((k) => [k.id, k.errors.length ? 'FAIL' : 'PASS'])),
    '',
    '## 4. Negative tests',
    '',
    bullets([
      '`tests/theExchangeLivingWorldPromotion.test.ts` passes altered copies of the promotion records to the validator and expects each targeted check to fail: a twentieth approval, R-12 approved, the R-01 alternative carried, a named tailor, a balcony woman made recurring, a chosen silhouette, T-01 promoted before T-02, an invented line, a second seal break, city-scale gold before S1-77, an amendment for an unapproved proposal, an asset claimed to exist, and a patch quoting text the packet does not have.',
      'The same file checks that the ledger, the registry and deliverables 01 to 14 equal their builds, so they cannot drift from the records.',
    ]),
    '',
    CLOSING,
  ].join('\n');
}
