import { toCsv } from './csv.js';
import { CANONICAL_AGES, FOUNDER_APPROVAL, OPEN_QUESTIONS, SLOANE_RESUMED_LEADERSHIP_AT, VIVIENNE } from './founderDecisions.js';
import { KNOWLEDGE_FACTS } from './knowledge.js';
import { EXCHANGE_PATHS as P } from './paths.js';
import { CHARACTER_DECISIONS, RECOMMENDATIONS, SEASON_DECISIONS } from './promotionLedger.js';
import { CANON_CLASSIFICATIONS, type CanonClassification, type SeasonMaster } from './types.js';

export const MASTER_CSV_HEADER = [
  'ID', 'ORDER', 'TITLE', 'ARC', 'ARC NAME', 'CATEGORY', 'RUNTIME TARGET', 'FICTIONAL DAY', 'LAYERS', 'EXCHANGE NIGHT', 'FEATURED CHARACTERS',
  'PRINCIPALS', 'SETTING', 'OPENING HOOK', 'NARRATIVE DEVELOPMENT', 'CHARACTER PURPOSE', 'PAYOFF', 'ENDING TRANSITION', 'EMOTIONAL TURNING POINT',
  'PATRON SCENARIOS', 'NIGHT DEPENDENCIES', 'CONTINUITY DEPENDENCIES', 'DEPENDS ON', 'PAYS OFF IN', 'UNRESOLVED QUESTIONS', 'PRODUCTION COMPLEXITY',
  'COMPLEXITY NOTES', 'APPROVED AMENDMENTS', 'CLASSIFICATION', 'CHANGE VS V1', 'WORKSTREAM', 'S-1 DEPENDENT', 'HYBRID SOURCE', 'LEAN ID', 'SOURCE DOCUMENT',
];

export function masterCsv(m: SeasonMaster): string {
  return toCsv(
    MASTER_CSV_HEADER,
    m.releases.map((r) => [
      r.id, r.order, r.title, r.arc.number, r.arc.name, r.category, r.runtimeTarget, r.fictionalDay, r.layers.join(''), r.exchangeNight, r.featuredCharacters,
      r.principalCharacters.join('; '), r.setting, r.openingHook.text, r.narrativeDevelopment, r.characterPurpose, r.payoff, r.endingTransition,
      r.emotionalTurningPoint.text ?? `(${r.emotionalTurningPoint.source})`, r.patronScenarios.join('; '), r.nightDependencies.join('; '), r.continuityDependencies,
      r.dependsOn.join('; '), r.paysOffIn.join('; '), r.unresolvedQuestions.join('; '), r.productionComplexity.rating, r.productionComplexity.notes,
      r.approvedAmendments.map((a) => `${a.amendmentId}: ${a.text}`).join(' | '), r.classification, r.lineage.changeVsV1, r.lineage.workstream, r.lineage.s1Dependent,
      r.lineage.hybridSource, r.lineage.leanId, r.lineage.sourceDocument,
    ]),
  );
}

export const NEW_CLASSIFICATION_DEFINITIONS: Record<string, string> = {
  APPROVED_DEVELOPMENT_DIRECTION: 'Founder-approved direction for development; specific wording may still be refined at screenplay stage',
  PROVISIONAL_IMPLEMENTATION: "An agent's implementation of an approved direction; awaits founder confirmation",
  HISTORICAL_SUPERSEDED: 'Preserved unchanged as history; no longer the active structure',
  PRODUCTION_TEST_ONLY: 'Experimental production output; never canon unless separately approved',
};

type MatrixTopic = { topic: string; classification: string; source: string; promotedBy?: string; ledgerEntry?: string };
type Matrix = { classificationDefinitions: Record<string, string>; topics: MatrixTopic[]; [k: string]: unknown };

export function sprintTopics(): MatrixTopic[] {
  const fromLedger = [...SEASON_DECISIONS, ...RECOMMENDATIONS, ...CHARACTER_DECISIONS].map((e) => ({
    topic: `Season 1 — ${e.subject}`,
    classification: e.classification,
    source: e.source,
    promotedBy: FOUNDER_APPROVAL.sprint,
    ledgerEntry: e.entryId,
  }));
  const extra: Array<[string, CanonClassification, string]> = [
    ['Season 1 — Screenplay architecture V1 (format, schema, runtime model)', 'PROVISIONAL_IMPLEMENTATION', 'docs/site00/the-exchange/founder-canon-lock-v1/05_SEASON1_SCREENPLAY_ARCHITECTURE.md'],
    ['Season 1 — Screenplays S1-01 to S1-05 (DRAFT — FOUNDER REVIEW REQUIRED)', 'PROVISIONAL_IMPLEMENTATION', P.screenplays],
    ["Season 1 — Kai's Note screen test (OpenArt)", 'PRODUCTION_TEST_ONLY', `${P.season}/PRODUCTION_TEST_RECORDS/KAIS_NOTE_SCREEN_TEST_OPENART_V1.json`],
    ...OPEN_QUESTIONS.filter((q) => q.status === 'OPEN_CREATIVE_QUESTION').map((q): [string, CanonClassification, string] => [`Season 1 — ${q.id}: ${q.question}`, 'OPEN_CREATIVE_QUESTION', `${P.reconciliation}/09_FOUNDER_DECISION_BOARD.md`]),
  ];
  return [...fromLedger, ...extra.map(([topic, classification, source]) => ({ topic, classification, source, promotedBy: FOUNDER_APPROVAL.sprint }))];
}

/** Adds this sprint's topics and definitions. Existing topics and definitions are kept untouched; reruns replace only this sprint's rows. */
export function updateApprovalMatrix(matrix: Matrix): Matrix {
  const kept = matrix.topics.filter((t) => t.promotedBy !== FOUNDER_APPROVAL.sprint);
  const defs = { ...matrix.classificationDefinitions };
  for (const [k, v] of Object.entries(NEW_CLASSIFICATION_DEFINITIONS)) if (!defs[k]) defs[k] = v;
  for (const c of CANON_CLASSIFICATIONS) if (!defs[c]) throw new Error(`missing classification definition ${c}`);
  return { ...matrix, classificationDefinitions: defs, topics: [...kept, ...sprintTopics()] };
}

export function knowledgeLedger() {
  return {
    schemaVersion: '1.0.0',
    ledgerId: 'THE_EXCHANGE.SEASON1.KNOWLEDGE_AND_CONTINUITY.V1',
    classification: 'APPROVED_DEVELOPMENT_DIRECTION',
    note: "Writers'-room knowledge is kept apart from audience knowledge. Open questions stay open.",
    ages: CANONICAL_AGES,
    vivienne: VIVIENNE,
    sloaneResumedLeadershipAt: SLOANE_RESUMED_LEADERSHIP_AT,
    derived: {
      sloaneAgeAtVivienneDeath: CANONICAL_AGES.Sloane.age - VIVIENNE.diedYearsAgo,
      yearsSinceSloaneResumed: CANONICAL_AGES.Sloane.age - SLOANE_RESUMED_LEADERSHIP_AT,
      adaInterregnumYears: VIVIENNE.diedYearsAgo - (CANONICAL_AGES.Sloane.age - SLOANE_RESUMED_LEADERSHIP_AT),
      kaiAgeAtCommission: CANONICAL_AGES.Kai.age - VIVIENNE.diedYearsAgo,
    },
    facts: KNOWLEDGE_FACTS,
    openQuestions: OPEN_QUESTIONS,
  };
}
