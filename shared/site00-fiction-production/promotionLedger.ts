import { EXCHANGE_PATHS as P } from './paths.js';
import { FOUNDER_APPROVAL } from './founderDecisions.js';
import type { CanonClassification } from './types.js';

export type LedgerEntry = {
  entryId: string;
  subject: string;
  decision: string;
  classification: CanonClassification;
  source: string;
  founderApproval: string;
  implementation: string[];
  validation: string[];
  notes?: string;
};

const R = `${P.reconciliation}`;
const SPRINT = `${FOUNDER_APPROVAL.date} ${FOUNDER_APPROVAL.sprint}`;
const M = P.master;
const T = {
  promotion: 'tests/theExchangeSeason1Master.test.ts › canonical promotion',
  history: 'tests/theExchangeSeason1Master.test.ts › historical version preservation',
  master: 'tests/theExchangeSeason1Master.test.ts › 86-release master integrity',
  nights: 'tests/theExchangeSeason1Master.test.ts › approved Nights placement',
  patrons: 'tests/theExchangeSeason1Master.test.ts › recurring patron scenario retention',
  hybridH: 'tests/theExchangeSeason1Master.test.ts › Hybrid H continuity',
  planC: 'tests/theExchangeSeason1Master.test.ts › superseded Plan C status',
  fallback: 'tests/theExchangeSeason1Master.test.ts › 81-release fallback preservation',
  dialogue: 'tests/theExchangeScreenplaySystem.test.ts › character dialogue registry',
  assets: 'tests/theExchangeProductionPipeline.test.ts › asset reference validation',
};

const e = (
  entryId: string,
  subject: string,
  decision: string,
  classification: CanonClassification,
  source: string,
  implementation: string[],
  validation: string[],
  notes?: string,
): LedgerEntry => ({ entryId, subject, decision, classification, source, founderApproval: SPRINT, implementation, validation, ...(notes ? { notes } : {}) });

export const SEASON_DECISIONS: LedgerEntry[] = [
  e('PL-S1', 'S-1 / NR-1 Hybrid H', 'Sloane stops deciding for everyone else and keeps her love of facilitating. She does not retire or abandon The Exchange. Her arc: being needed is not the same as being loved. S1-75 Living Legacy mechanics unchanged.', 'APPROVED_CANON', `${R}/02_SLOANE_STEP_BACK_ALTERNATIVES.md §6–7`, [`${M} S1-10, S1-74, S1-80 (REVISED_S1_DEPENDENT); S1-75 UNCHANGED`], [T.hybridH]),
  e('PL-S2', 'S-2 / NR-2 Option A', '86 releases, IDs S1-01..S1-86 in established order, runtime target 127:40: the authoritative development master.', 'APPROVED_CANON', `${R}/04_EXPANDED_86_RELEASE_MAP.csv`, [M, P.masterCsv], [T.master, T.promotion]),
  e('PL-S2-FB', 'S-2 / NR-2 Option B', '81-release lean map kept as a pre-cleared production fallback only. No merge is active; each needs separate founder activation after production testing.', 'APPROVED_DEVELOPMENT_DIRECTION', `${R}/05_LEAN_RELEASE_MAP.csv`, [`${M} fallback`, P.optionBCsv], [T.fallback]),
  e('PL-S2-V1', 'BASELINE V1', 'The original 86-release map is immutable historical evidence.', 'HISTORICAL_SUPERSEDED', P.baselineCsv, [P.historyArchives], [T.history]),
  e('PL-S3', 'S-3 / NR-4 N1 + N2', 'Nights integrated into existing releases: S1-20 Nineteen Eighty-Six, S1-40 The Breakfast Dance. No release added. Longest run without a Night: 19.', 'APPROVED_CANON', `${R}/03_EXCHANGE_NIGHTS_REPAIR_OPTIONS.md`, [`${M} S1-12, S1-20, S1-37, S1-40`], [T.nights]),
];

export const RECOMMENDATIONS: LedgerEntry[] = [
  e('PL-NR-3', 'NR-3 Ten patron scenarios', 'All ten retained. Revisions adopted: PX-04 discreet family (S1-62, S1-64, S1-72), PX-05 Nineteen Eighty-Six (S1-12, S1-20), PX-07 The Breakfast Dance (S1-37, S1-40), PX-08 hat stories (S1-51), PX-01 sponsorship line (S1-45). Original payoffs kept.', 'APPROVED_DEVELOPMENT_DIRECTION', `${R}/06_PATRON_SCENARIO_AUDIT.md`, [M], [T.patrons]),
  e('PL-NR-5', 'NR-5 Disclosure setting', "Richard's disclosure happens at a Night Sloane hosted (S1-20). The chain is unchanged: Royce's inference + Richard → Bunny → Marcus.", 'APPROVED_CANON', `${R}/09_FOUNDER_DECISION_BOARD.md NR-5`, [`${M} S1-20, S1-54, S1-55`], [T.hybridH], 'The founder named all four links; causal mechanics may not change without source-supported authorization.'),
  e('PL-NR-6', 'NR-6 Motive emphasis', "FD-02 leads with the loved-or-useful question. The weight of her word and her mother's withdrawal stay as compatible elements.", 'APPROVED_CANON', `${R}/02_SLOANE_STEP_BACK_ALTERNATIVES.md §8`, [P.dialogue], [T.dialogue]),
  e('PL-NR-7', 'NR-7 Plan C', 'The 74-release architecture with Plans A, B and C (FD-17) is superseded as the active structure and archived.', 'HISTORICAL_SUPERSEDED', `${P.hybrid}/THE_EXCHANGE_HYBRID_V1_FOUNDER_DECISION_BOARD.md FD-17`, [`${M} history`, P.historyArchives], [T.planC]),
  e('PL-NR-8', 'NR-8 Two fashion beats', 'S1-43: a Duel look worn as armour. S1-81: Tina in Ophelia\'s coat (S1-81 chosen over S1-82 on continuity evidence). No release added.', 'PROVISIONAL_IMPLEMENTATION', `${R}/07_WONDER_FASHION_CULTURE_AUDIT.md §targeted improvements`, [`${M} approvedAmendments S1-43, S1-81`], [T.master], 'Direction approved; exact placement and wording are this sprint\'s implementation and await founder confirmation. Designs wait on U-4.'),
  e('PL-NR-9', 'NR-9 Tina as friend', 'Shown in S1-81 through one request-free message, not exposition.', 'PROVISIONAL_IMPLEMENTATION', `${R}/08_CHARACTER_LIFE_AND_RELATIONSHIPS.md`, [`${M} approvedAmendments S1-81`], [T.master]),
  e('PL-NR-10', 'NR-10 C-11 Category Is', 'Held for Season 2. Not placed in Season 1.', 'APPROVED_DEVELOPMENT_DIRECTION', `${R}/06_PATRON_SCENARIO_AUDIT.md C-11`, [`${M} (absent by design)`], [T.patrons]),
  e('PL-NR-11', 'NR-11 Reusable library', 'Reusable set, wardrobe and prop library is a prerequisite for scaled screenplay production.', 'APPROVED_DEVELOPMENT_DIRECTION', `${R}/12_PRODUCTION_FEASIBILITY.md`, [P.assets], [T.assets]),
];

export const CHARACTER_DECISIONS: LedgerEntry[] = [
  e('PL-C-AGES', 'Principal ages', 'Sloane 33, Gideon 44, Nadine 40, Richard 66, Kai 34. Vivienne died ten years ago at 55.', 'APPROVED_CANON', 'Founder sprint text §04', [P.dialogue, M], [T.promotion]),
  e('PL-C-SLOANE', 'Sloane', 'Resumed leadership at 28. Loves impossible requests. Season 1 is about agency, intimacy, receiving care and no longer deciding for everyone; not retirement or defeat.', 'APPROVED_CANON', 'Founder sprint text §04', [P.dialogue], [T.dialogue]),
  e('PL-C-GIDEON', 'Gideon Shaw', 'Platonic with Sloane. Independent life and future; the overseas choice (S1-85) is his own. Facial identity lock unchanged.', 'APPROVED_CANON', 'Founder sprint text §04; GIDEON_CHARACTER_AND_RELATIONSHIP_NUANCE_V1.md', [P.dialogue, P.assets], [T.dialogue]),
  e('PL-C-NADINE', 'Nadine', 'Arc: included rather than told last. Hospital COO, sabbatical trajectory and family dynamics preserved as written in the master.', 'APPROVED_DEVELOPMENT_DIRECTION', 'Founder sprint text §04; hybrid FD-14', [P.dialogue], [T.dialogue], "Partner and children's names in the hybrid remain provisional."),
  e('PL-C-RICHARD', 'Richard', 'Loving father with human flaws; the disclosure never makes him a villain.', 'APPROVED_CANON', 'Founder sprint text §04', [P.dialogue], [T.dialogue]),
  e('PL-C-VIVIENNE', 'Vivienne', "Ember and final-exchange mysteries preserved, with writers'-room truth kept distinct from audience knowledge. Her private truth stays open (U-1).", 'APPROVED_CANON', 'Founder sprint text §04', [P.knowledge], [T.promotion]),
  e('PL-C-KAI', 'Kai Fontaine', 'Excluded former collaborator; plot function, history with Sloane and emotional accountability preserved.', 'APPROVED_CANON', 'Founder sprint text §04', [P.dialogue], [T.dialogue]),
  e('PL-C-KAI-LOOK', 'Kai appearance and voice', "Light-skinned Black man, about 5'10\", hazel-green eyes, braided-back locs with clean barbered edges and lineup, polished grooming, refined formal-casual tailoring, waistcoats, quiet-luxury jewelry, light facial hair. Intelligent, articulate, charming, dryly sarcastic, fluent in Black queer creative culture, capable of direct sincerity. Never reduced to slang, comic relief or stereotype.", 'APPROVED_DEVELOPMENT_DIRECTION', 'Founder sprint text §04 (current creative direction)', [P.assets, P.dialogue], [T.assets, T.dialogue], 'No facial identity asset exists. His sexuality is not inferred or fixed from styling or speech.'),
];

type Fd = [string, string, CanonClassification, string];
export const FD_STATUS: Fd[] = [
  ['FD-01', 'Season 1 spine', 'APPROVED_DEVELOPMENT_DIRECTION', 'Carried by the approved master'],
  ['FD-02', "Sloane's motive", 'APPROVED_CANON', 'With the NR-6 emphasis'],
  ['FD-03', 'Living Legacy mechanics', 'APPROVED_DEVELOPMENT_DIRECTION', 'S1-75 preserved by founder instruction'],
  ['FD-04', 'Celestine and Kai; Kai excluded', 'APPROVED_CANON', 'Founder §04 names Kai the excluded collaborator'],
  ['FD-05', 'Ember backstory', 'APPROVED_DEVELOPMENT_DIRECTION', 'In the master (S1-17, S1-26, S1-58); the hybrid called this the founder\'s call: confirm (FC-01)'],
  ['FD-06', "Vivienne's private truth", 'OPEN_CREATIVE_QUESTION', 'U-1'],
  ['FD-07', 'Cause of death: aneurysm', 'OPEN_CREATIVE_QUESTION', 'Not in the master; not ruled'],
  ['FD-08', 'Breach chain', 'APPROVED_CANON', 'NR-5'],
  ['FD-09', 'Emmett Hale', 'APPROVED_DEVELOPMENT_DIRECTION', 'Function only; identity open (U-3)'],
  ['FD-10', 'Unsealing beat and notice rule', 'APPROVED_DEVELOPMENT_DIRECTION', 'In the master (S1-27, S1-48, S1-52)'],
  ['FD-11', 'Kai by Threshold; reinstatement denied', 'APPROVED_DEVELOPMENT_DIRECTION', 'In the master (S1-60, S1-61)'],
  ['FD-12', 'The Quiet Years', 'OPEN_CREATIVE_QUESTION', '"Resumed at 28" is canon (PL-C-SLOANE); "led at 23, stepped back" is not in the master and not ruled'],
  ['FD-13', 'Richard not behind the Ember', 'APPROVED_DEVELOPMENT_DIRECTION', 'Consistent with PL-C-RICHARD'],
  ['FD-14', 'Nadine: COO, Kai\'s lights, sabbatical', 'APPROVED_DEVELOPMENT_DIRECTION', 'PL-C-NADINE'],
  ['FD-15', 'Gideon at 27; his mother; offer abroad', 'OPEN_CREATIVE_QUESTION', 'Offer abroad and his own choice are canon (PL-C-GIDEON); "joined at 27" is not in the master; CC-001B stays open'],
  ['FD-16', 'Audience reads two lines', 'APPROVED_DEVELOPMENT_DIRECTION', 'In the master (S1-86)'],
  ['FD-17', '74 releases, Plan C', 'HISTORICAL_SUPERSEDED', 'NR-7'],
  ['FD-18', 'Face locks', 'OPEN_CREATIVE_QUESTION', 'Production dependency; extend to recurring patrons (U-6)'],
  ['FD-19', 'Name clearance', 'OPEN_CREATIVE_QUESTION', 'Production dependency; extend to post-hybrid names (U-7)'],
  ['FD-20', 'Narration budget and freeze-frames', 'APPROVED_DEVELOPMENT_DIRECTION', 'Used as written in the master; approval matrix keeps the device PROVISIONAL_CONCEPT'],
];

export function buildPromotionLedger() {
  return {
    schemaVersion: '1.0.0',
    propertySlug: 'the-exchange',
    ledgerId: 'THE_EXCHANGE.S1.CANON_PROMOTION_LEDGER.V1',
    founderApproval: FOUNDER_APPROVAL,
    rule: 'Every entry traces to a source document, the founder approval, an implementation change and a validation result. Founder approval of a direction does not answer questions the source leaves open.',
    seasonDecisions: SEASON_DECISIONS,
    recommendations: RECOMMENDATIONS,
    characterDecisions: CHARACTER_DECISIONS,
    hybridDecisionStatus: FD_STATUS.map(([id, subject, classification, note]) => ({ id, subject, classification, note })),
    founderConfirmationsRequested: [
      { id: 'FC-01', item: 'FD-05 Ember backstory rewrites world history; the hybrid marked it the founder\'s call.' },
      { id: 'FC-02', item: 'NR-8 and NR-9 placements in S1-43 and S1-81.' },
      { id: 'FC-03', item: 'FD-07, FD-12 (led at 23) and FD-15 (joined at 27) are not in the master and remain unruled.' },
    ],
  };
}
