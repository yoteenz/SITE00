import { EXCHANGE_PATHS } from '../paths.js';
import { scenePath, SCENE_FILES } from '../scenes/index.js';
import type { AuditSource } from './types.js';

const BIBLE = 'THE_EXCHANGE/FOUNDER_SOURCE/THE_EXCHANGE_MASTER_BIBLE_V1';
const MANIFEST = 'THE_EXCHANGE/MANIFEST';
export const TRUTH_DOC = `${EXCHANGE_PATHS.hybrid}/THE_EXCHANGE_HYBRID_V1_WRITERS_ROOM_TRUTH.md`;
export const S101_DECISIONS = 'shared/site00-fiction-production/scenes/s1-01/decisions.ts';
export const S101_PACKET = scenePath('S1-01', SCENE_FILES.packet);
export const SCENE_INDEX = `${EXCHANGE_PATHS.season}/SEASON1_SCENE_INDEX_V1.json`;
export const NIGHTS_REPAIR = `${EXCHANGE_PATHS.reconciliation}/03_EXCHANGE_NIGHTS_REPAIR_OPTIONS.md`;
export const DIRECTORIAL_BIBLE = 'docs/site00/the-exchange/directorial-production-engine-v2/04_SEASON1_DIRECTORIAL_BIBLE.md';

/** Every file this audit read, with its exact label. The bucket is the audit's sorting, not a reclassification. */
export const AUDIT_SOURCES: AuditSource[] = [
  { id: 'SRC-MASTER', path: EXCHANGE_PATHS.master, exactClassification: 'APPROVED_CANON (structure, S-2 Option A); each release APPROVED_DEVELOPMENT_DIRECTION', bucket: 'APPROVED_CANON', role: 'The 86 releases, runtimes, characters, settings, payoffs and dependencies. Every citation resolves here unless it names another file.' },
  { id: 'SRC-SCENE-INDEX', path: SCENE_INDEX, exactClassification: 'Per release: story FOUNDER_APPROVED; screenplay DRAFT — FOUNDER REVIEW REQUIRED (S1-01 to S1-05) or PLANNED_FROM_MASTER', bucket: 'FOUNDER_SUPPORTED_DIRECTION', role: '110 scene IDs, beats, motifs and per-release audience knowledge used to cite placements and check reveal timing.' },
  { id: 'SRC-BACKLOG', path: EXCHANGE_PATHS.backlogJson, exactClassification: 'Production planning record (no canon label)', bucket: 'PROVISIONAL', role: 'Which releases are drafted (5) and which are planned from the master (81).' },
  { id: 'SRC-SCREENPLAYS', path: EXCHANGE_PATHS.screenplays, exactClassification: 'PROVISIONAL_IMPLEMENTATION — DRAFT — FOUNDER REVIEW REQUIRED', bucket: 'DRAFT', role: 'Fountain drafts S1-01 to S1-05. Read only; no line is changed or proposed for change.' },
  { id: 'SRC-PROMOTION-LEDGER', path: EXCHANGE_PATHS.ledger, exactClassification: 'Per-decision classifications as recorded', bucket: 'APPROVED_CANON', role: 'Which reconciliation decisions were promoted, and which stayed provisional or open.' },
  { id: 'SRC-APPROVAL-MATRIX', path: EXCHANGE_PATHS.approvalMatrix, exactClassification: 'Per-topic classifications (44 topics)', bucket: 'APPROVED_CANON', role: 'The vocabulary this audit preserves: APPROVED_CANON, FOUNDER_SUPPORTED_DIRECTION, PROVISIONAL_CONCEPT, OPEN_CREATIVE_QUESTION and the rest.' },
  { id: 'SRC-KNOWLEDGE', path: EXCHANGE_PATHS.knowledge, exactClassification: 'APPROVED_DEVELOPMENT_DIRECTION', bucket: 'FOUNDER_SUPPORTED_DIRECTION', role: 'Facts KF-01 to KF-10 with the release where the audience learns each, open questions U-1 to U-9, and principal ages.' },
  { id: 'SRC-BIBLE-02', path: `${BIBLE}/02_WORLD_AND_CULTURE.md`, exactClassification: 'PROVISIONAL_CONCEPT (Master Bible V1 body; default WORKING_CONCEPT)', bucket: 'WORKING_CONCEPT', role: 'The parallel society: privacy as social grammar, culture, the city.' },
  { id: 'SRC-BIBLE-03', path: `${BIBLE}/03_EXCHANGE_INSTITUTION.md`, exactClassification: 'PROVISIONAL_CONCEPT (Master Bible V1 body; default WORKING_CONCEPT)', bucket: 'WORKING_CONCEPT', role: 'The institution, its code and its procedures.' },
  { id: 'SRC-BIBLE-04', path: `${BIBLE}/04_CHARACTER_AND_FAMILY.md`, exactClassification: 'PROVISIONAL_CONCEPT (Master Bible V1 body; default WORKING_CONCEPT)', bucket: 'WORKING_CONCEPT', role: 'Family and character foundations.' },
  { id: 'SRC-BIBLE-05', path: `${BIBLE}/05_HIDDEN_HISTORY_AND_REVELATIONS.md`, exactClassification: 'PROVISIONAL_CONCEPT (Master Bible V1 body; default WORKING_CONCEPT)', bucket: 'WORKING_CONCEPT', role: 'Hidden history and the end-state the season works toward.' },
  { id: 'SRC-BIBLE-06', path: `${BIBLE}/06_SPECULATIVE_TECHNOLOGY.md`, exactClassification: 'PROVISIONAL_CONCEPT; "All named devices below are WORKING_CONCEPTS, not automatically final canon."', bucket: 'WORKING_CONCEPT', role: 'The seven named systems, their hard limits, the three tiers and the invention dossier rule.' },
  { id: 'SRC-INVITATION', path: `${MANIFEST}/EXCHANGE_INVITATION_CULTURE_ADDENDUM_V1.md`, exactClassification: 'FOUNDER_SUPPORTED_DIRECTION', bucket: 'FOUNDER_SUPPORTED_DIRECTION', role: 'Invitations cannot be bought; personal selection, quiet scouting and trusted introduction. Used to check every proposed appearance at a private venue.' },
  { id: 'SRC-NIGHTS-SOCIAL', path: `${MANIFEST}/EXCHANGE_NIGHTS_SOCIAL_EXPERIENCE_ADDENDUM_V1.md`, exactClassification: 'FOUNDER_SUPPORTED_DIRECTION (legendary party); event category names PROVISIONAL_CONCEPT', bucket: 'FOUNDER_SUPPORTED_DIRECTION', role: 'What an Exchange Night must feel like.' },
  { id: 'SRC-NIGHTS', path: `${MANIFEST}/EXCHANGE_NIGHTS_ADDENDUM_V1.md`, exactClassification: 'PROVISIONAL (founder canon V1.1 delta); FOUNDER-SUPPORTED DIRECTION / PROVISIONAL CONCEPT', bucket: 'PROVISIONAL', role: 'Night categories and cadence.' },
  { id: 'SRC-GUEST-PRINCIPLES', path: `${MANIFEST}/RECURRING_GUEST_UNIVERSE_PRINCIPLES_V1.md`, exactClassification: 'FOUNDER_SUPPORTED_DIRECTION', bucket: 'FOUNDER_SUPPORTED_DIRECTION', role: 'How recurring guests may return without becoming leads.' },
  { id: 'SRC-GUEST-REGISTRY', path: `${MANIFEST}/RECURRING_GUEST_CONCEPT_REGISTRY_V1.json`, exactClassification: 'PROVISIONAL_SCAFFOLD (entries empty; "Populate only from founder-approved sources")', bucket: 'PROVISIONAL', role: 'Confirms no recurring guest is registered yet, so this audit proposes an extension instead of writing entries.' },
  { id: 'SRC-CANON-DELTAS', path: 'THE_EXCHANGE/FOUNDER_CANON/FOUNDER_CANON_V1_1_DELTAS.md', exactClassification: 'PROVISIONAL development record; not APPROVED_CANON until founder promotion', bucket: 'PROVISIONAL', role: 'Reconciliation record between the bible and later founder direction.' },
  { id: 'SRC-TRUTH', path: TRUTH_DOC, exactClassification: 'NONCANONICAL. PROPOSED — NOT APPROVED.', bucket: 'PROVISIONAL', role: "Writers'-room reality: timeline, Ember facts, who knows what, reveal order (section 12), rewatchable details (13), Season 2 carryovers (16), mechanics (17). Used to protect reveals, never as approved canon." },
  { id: 'SRC-NIGHTS-REPAIR', path: NIGHTS_REPAIR, exactClassification: 'N1 + N2 APPROVED_CANON (S-3 / NR-4); other options as recorded', bucket: 'APPROVED_CANON', role: 'The approved Night placements and the 16-release gap from S1-51 to S1-66.' },
  { id: 'SRC-WONDER-AUDIT', path: `${EXCHANGE_PATHS.reconciliation}/07_WONDER_FASHION_CULTURE_AUDIT.md`, exactClassification: 'NR-8 PROVISIONAL_IMPLEMENTATION', bucket: 'PROVISIONAL', role: 'The earlier wonder, fashion and culture pass. Read so this audit does not repeat it.' },
  { id: 'SRC-DECISION-BOARD', path: `${EXCHANGE_PATHS.reconciliation}/09_FOUNDER_DECISION_BOARD.md`, exactClassification: 'Per decision, as recorded in the approval matrix', bucket: 'APPROVED_CANON', role: 'Open questions U-1, U-2, U-3 and U-9.' },
  { id: 'SRC-DIRECTORIAL-BIBLE', path: DIRECTORIAL_BIBLE, exactClassification: 'PROVISIONAL — FOUNDER REVIEW REQUIRED', bucket: 'PROVISIONAL', role: 'Season camera, light, music and sound grammar the transition proposals must sit inside.' },
  { id: 'SRC-S101-PACKET', path: S101_PACKET, exactClassification: 'FOUNDER_REVIEW_REQUIRED (19 shots, 22 keyframes, 3 music cues, 1 silence, 13 sound cues)', bucket: 'DRAFT', role: 'The S1-01 shots, wardrobe and inhabitants that later returns would reference. Not modified.' },
  { id: 'SRC-S101-DECISIONS', path: S101_DECISIONS, exactClassification: 'FD-S101-01 to FD-S101-11 OPEN', bucket: 'OPEN_QUESTION', role: 'The dress design (FD-S101-05), inhabitant looks (FD-S101-06) and the tailor question (FD-S101-07).' },
];
