/**
 * Versioned production knowledge base (sprint V2 §23). Recommendations cite recorded outcomes and founder decisions; nothing here is model training.
 * Authority order: FOUNDER > APPROVED_DIRECTION > RECORDED_OUTCOME > DIRECTORIAL_HYPOTHESIS. Scope keeps a preference from hardening into a global rule.
 */
export type KnowledgeCategory =
  | 'APPROVED_CAMERA_TREATMENT'
  | 'REJECTED_VISUAL_APPROACH'
  | 'CHARACTER_IDENTITY_FAILURE'
  | 'SPATIAL_CONTINUITY_FAILURE'
  | 'PROP_CONTINUITY_FAILURE'
  | 'PROVIDER_WEAKNESS'
  | 'SUCCESSFUL_SHOT_DURATION'
  | 'EFFECTIVE_KEYFRAME_TYPE'
  | 'APPROVED_MUSIC_DIRECTION'
  | 'PREFERRED_EDITING_PATTERN'
  | 'TECHNICAL_FACT';

export type KnowledgeEntry = {
  entryId: string;
  version: number;
  category: KnowledgeCategory;
  statement: string;
  authority: 'FOUNDER' | 'APPROVED_DIRECTION' | 'RECORDED_OUTCOME' | 'DIRECTORIAL_HYPOTHESIS';
  scope: string;
  evidence: string[];
  informs: string[];
  recordedAt: string;
  supersedes: string | null;
};

const KN = "THE_EXCHANGE/SEASON_1/PRODUCTION_TEST_RECORDS/KAIS_NOTE_SCREEN_TEST_OPENART_V1.json";
const REC = 'THE_EXCHANGE/FOUNDER_SOURCE/SEASON1_HISTORY/THE_EXCHANGE_SEASON1_STRUCTURAL_RECONCILIATION_V1/12_PRODUCTION_FEASIBILITY.md';
const AT = '2026-10-24';

export const KNOWLEDGE_BASE_VERSION = 1;

export const PRODUCTION_KNOWLEDGE: KnowledgeEntry[] = [
  { entryId: 'PK-001', version: 1, category: 'PREFERRED_EDITING_PATTERN', statement: 'One primary physical action per high-risk generated shot; complex interactions are split into deliberate coverage.', authority: 'FOUNDER', scope: 'Generated shots with HIGH or MODERATE motion', evidence: ['Founder sprint V2 §10'], informs: ['motion.validateMotion MULTIPLE_ACTIONS'], recordedAt: AT, supersedes: null },
  { entryId: 'PK-002', version: 1, category: 'SUCCESSFUL_SHOT_DURATION', statement: 'Motion-weighted screen time: high motion about 1–3 s, moderate 2–4 s, low motion held longer, important performances held as long as they earn.', authority: 'FOUNDER', scope: 'Adaptive guideline for every scene', evidence: ['Founder sprint V2 §09'], informs: ['motion.MOTION_GUIDE'], recordedAt: AT, supersedes: null },
  { entryId: 'PK-003', version: 1, category: 'APPROVED_CAMERA_TREATMENT', statement: 'A gown reveal is its own floor-level shot, not a by-product of a wider move.', authority: 'FOUNDER', scope: 'Fashion coverage', evidence: [`${KN} › referencePrinciples`], informs: ['Bible fashion coverage principles'], recordedAt: AT, supersedes: null },
  { entryId: 'PK-004', version: 1, category: 'SPATIAL_CONTINUITY_FAILURE', statement: "Rooms drifted in the Kai's Note screen test: the dressing suite must keep its geography and scale, and a large room must not turn into a bathroom or a narrow hallway.", authority: 'FOUNDER', scope: 'Every interior with a spatial authority record', evidence: [`${KN} › referencePrinciples`, 'Founder sprint V2 §14'], informs: ['spatial.validatePhysicalContinuity', 'keyframe environment references first'], recordedAt: AT, supersedes: null },
  { entryId: 'PK-005', version: 1, category: 'PROP_CONTINUITY_FAILURE', statement: 'Prop ownership must be physically credible: the envelope handoff needs its own coverage and a declared holder in every shot.', authority: 'FOUNDER', scope: 'Any prop that changes hands', evidence: [`${KN} › referencePrinciples`, 'Founder sprint V2 §29'], informs: ['spatial PROP_TELEPORT'], recordedAt: AT, supersedes: null },
  { entryId: 'PK-006', version: 1, category: 'PROVIDER_WEAKNESS', statement: 'kling-lipsync-v1 completed one of three attempts in the screen test (xBu6sNra0y8TRokqGh1c completed; Wge4rhOL9w389NcoFT96 and D7MloaYGj8F2FSuqYdCc failed). Budget lip-sync with retries and keep it to visible speaking mouths only.', authority: 'RECORDED_OUTCOME', scope: 'Lip-sync routing', evidence: [`${KN} › creations`], informs: ['timeline.validateCoverage', 'routing lip-sync line UNKNOWN'], recordedAt: AT, supersedes: null },
  { entryId: 'PK-007', version: 1, category: 'TECHNICAL_FACT', statement: 'Kling outputs in the screen test last 10.041667 s and 8.041667 s: 241 and 193 frames at 24 fps.', authority: 'RECORDED_OUTCOME', scope: 'Frame-rate planning until the founder sets a delivery rate', evidence: [`${KN} › creations[].durationSec`], informs: ['timecode.PROVISIONAL_FRAME_RATE'], recordedAt: AT, supersedes: null },
  { entryId: 'PK-008', version: 1, category: 'EFFECTIVE_KEYFRAME_TYPE', statement: 'A start, middle and end frame job (QWHQYpxNzNikcDgGTm9m) completed at 8.04 s. It shows controlled transitions are possible; its quality was not founder-approved.', authority: 'RECORDED_OUTCOME', scope: 'Shots that must land on an exact composition', evidence: [`${KN} › creations`], informs: ['Keyframe director: end frames only where a controlled landing matters'], recordedAt: AT, supersedes: null },
  { entryId: 'PK-009', version: 1, category: 'PREFERRED_EDITING_PATTERN', statement: 'Dialogue is one continuous audio event; picture may cut away and return. Lip-sync only where a speaking mouth is visible; silent reactions get none.', authority: 'FOUNDER', scope: 'Every dialogue scene', evidence: ['Founder sprint V2 §08, §19, §20', `${KN} › referencePrinciples (approved recorded voices)`], informs: ['timeline.validateCoverage', 'timeline.editJoins'], recordedAt: AT, supersedes: null },
  { entryId: 'PK-010', version: 1, category: 'APPROVED_CAMERA_TREATMENT', statement: 'Crowd as plate, principals as pockets; no more than two speaking faces per shot.', authority: 'APPROVED_DIRECTION', scope: 'Crowd and multi-speaker scenes', evidence: [`${REC} lines 24 and 37`], informs: ['Bible Exchange Night treatment'], recordedAt: AT, supersedes: null },
  { entryId: 'PK-011', version: 1, category: 'PREFERRED_EDITING_PATTERN', statement: 'Montage releases without lip-sync: S1-01, S1-17, S1-69, S1-81.', authority: 'APPROVED_DIRECTION', scope: 'Those four releases', evidence: [`${REC} line 77`], informs: ['S1-01 coverage plan'], recordedAt: AT, supersedes: null },
  { entryId: 'PK-012', version: 1, category: 'REJECTED_VISUAL_APPROACH', statement: 'No disposable proof-of-concept generations; every paid job serves an approved release, scene, reusable asset or documented repair.', authority: 'FOUNDER', scope: 'All generation', evidence: ['Founder sprint V2 §00'], informs: ['review.authorizeGenerationJob'], recordedAt: AT, supersedes: null },
  { entryId: 'PK-013', version: 1, category: 'REJECTED_VISUAL_APPROACH', statement: 'Do not imitate prestige drama by making everything dark, slow or distant; keep warmth, fashion, humor and spectacle.', authority: 'FOUNDER', scope: 'Season-wide tone', evidence: ['Founder sprint V2 §25'], informs: ['Bible colour and lighting philosophy'], recordedAt: AT, supersedes: null },
  { entryId: 'PK-014', version: 1, category: 'APPROVED_MUSIC_DIRECTION', statement: 'Music palette: house, R&B, funk, soul, jazz and warmer synths. Silence is a musical decision.', authority: 'FOUNDER', scope: 'Season-wide; each scene still chooses its own cue', evidence: ['THE_EXCHANGE founder bible sound palette', 'Founder sprint V2 §16'], informs: ['audio.validateMusicSupervision'], recordedAt: AT, supersedes: null },
];

export function knowledgeFor(topic: string, kb = PRODUCTION_KNOWLEDGE): KnowledgeEntry[] {
  const t = topic.toLowerCase();
  return kb.filter((e) => e.statement.toLowerCase().includes(t) || e.scope.toLowerCase().includes(t) || e.informs.some((i) => i.toLowerCase().includes(t)));
}

export function validateKnowledgeBase(kb = PRODUCTION_KNOWLEDGE): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const e of kb) {
    if (ids.has(e.entryId)) problems.push(`${e.entryId}: duplicate id`);
    ids.add(e.entryId);
    if (!e.evidence.length) problems.push(`${e.entryId}: no evidence`);
    if (e.supersedes && !kb.some((x) => x.entryId === e.supersedes)) problems.push(`${e.entryId}: supersedes unknown ${e.supersedes}`);
    if (e.authority === 'DIRECTORIAL_HYPOTHESIS' && /always|never/i.test(e.statement)) problems.push(`${e.entryId}: a hypothesis cannot be stated as a rule`);
  }
  return problems;
}
