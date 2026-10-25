import type { DirectorialFinding, DirectorsIntent, Embellishment, PerformanceDirection, ProductionPlan } from './types.js';

/** Words that stand in for direction instead of giving it (sprint V2 §05, §25). */
export const FILLER_TERMS = /\b(cinematic|epic|stunning|breathtaking|gorgeous|visually striking|dynamic shot|beautiful shot|moody|vibes?)\b/i;
const MECHANICAL = /\b(dramatic pause|gasps?|clutches (her|his) chest|eyes widen in shock|single tear)\b/i;
const MIN_WORDS = 8;
const words = (s: string) => (s.match(/[A-Za-z0-9'’-]+/g) ?? []).length;

export const INTENT_FIELDS: Array<{ key: string; letter: string; label: string; get: (i: DirectorsIntent) => string }> = [
  { key: 'dramaticPurpose', letter: 'A', label: 'Dramatic purpose', get: (i) => i.dramaticPurpose },
  { key: 'emotionalCenter', letter: 'B', label: 'Emotional center', get: (i) => i.emotionalCenter },
  { key: 'characterObjectives', letter: 'C', label: 'Character objectives', get: (i) => Object.entries(i.characterObjectives).map(([k, v]) => `${k}: ${v}`).join(' ') },
  { key: 'subtext', letter: 'D', label: 'Subtext', get: (i) => i.subtext },
  { key: 'powerDynamics', letter: 'E', label: 'Power dynamics', get: (i) => i.powerDynamics },
  { key: 'informationControl', letter: 'F', label: 'Information control', get: (i) => [i.informationControl.before, i.informationControl.during, i.informationControl.after].join(' ') },
  { key: 'cinematicPointOfView', letter: 'G', label: 'Point of view', get: (i) => i.cinematicPointOfView },
  { key: 'visualDramaturgy', letter: 'H', label: 'Visual dramaturgy', get: (i) => Object.values(i.visualDramaturgy).join(' ') },
  { key: 'atmosphere', letter: 'I', label: 'Atmosphere', get: (i) => i.atmosphere },
  { key: 'sonicIdentity', letter: 'J', label: 'Sonic identity', get: (i) => i.sonicIdentity },
  { key: 'endingImpression', letter: 'K', label: 'Ending impression', get: (i) => i.endingImpression },
];

export function validateIntent(intent: DirectorsIntent): DirectorialFinding[] {
  const out: DirectorialFinding[] = [];
  for (const f of INTENT_FIELDS) {
    const text = f.get(intent);
    if (words(text) < MIN_WORDS) out.push({ severity: 'ERROR', code: 'INTENT_THIN', subject: `${f.letter} ${f.label}`, detail: `${words(text)} words; state the reason, not a label` });
    const m = FILLER_TERMS.exec(text);
    if (m) out.push({ severity: 'WARNING', code: 'GENERIC_FILLER', subject: `${f.letter} ${f.label}`, detail: `"${m[0]}" used in place of direction` });
  }
  for (const [k, v] of Object.entries(intent.visualDramaturgy)) if (!v.trim()) out.push({ severity: 'ERROR', code: 'INTENT_THIN', subject: `H ${k}`, detail: 'empty' });
  if (!Object.keys(intent.characterObjectives).length) out.push({ severity: 'ERROR', code: 'INTENT_THIN', subject: 'C Character objectives', detail: 'no character objective' });
  return out;
}

export function validatePerformance(dirs: PerformanceDirection[], plan: ProductionPlan): DirectorialFinding[] {
  const out: DirectorialFinding[] = [];
  const shotIds = new Set(plan.shots.map((s) => s.shotId));
  const speakers = new Set(plan.dialogue.map((d) => d.speaker));
  const onScreen = new Set(plan.shots.flatMap((s) => s.onScreen));
  const directed = new Set(dirs.map((d) => d.character));
  for (const sp of speakers) if (!directed.has(sp)) out.push({ severity: 'ERROR', code: 'PERFORMANCE_MISSING', subject: sp, detail: 'a speaking character needs performance direction' });
  for (const c of onScreen) if (!directed.has(c)) out.push({ severity: 'WARNING', code: 'PERFORMANCE_MISSING', subject: c, detail: 'on screen without performance direction' });
  for (const d of dirs) {
    for (const s of d.shots) if (!shotIds.has(s)) out.push({ severity: 'ERROR', code: 'PERFORMANCE_SHOT', subject: d.character, detail: `unknown shot ${s}` });
    if (d.speaking !== speakers.has(d.character)) out.push({ severity: 'ERROR', code: 'PERFORMANCE_SPEAKING', subject: d.character, detail: `speaking flag ${d.speaking} disagrees with the dialogue track` });
    if (!d.avoid.length) out.push({ severity: 'WARNING', code: 'PERFORMANCE_AVOID', subject: d.character, detail: 'name what the performance must not do' });
    const text = [d.physicalBehavior, d.eyes, d.microExpressions, d.listening, d.reactionTiming].join(' ');
    const m = MECHANICAL.exec(text);
    if (m) out.push({ severity: 'WARNING', code: 'MECHANICAL_ACTING', subject: d.character, detail: `"${m[0]}" tends to produce exaggerated acting` });
  }
  return out;
}

export function validateEmbellishments(list: Embellishment[], founderDecisionRefs: ReadonlySet<string>): DirectorialFinding[] {
  const out: DirectorialFinding[] = [];
  for (const e of list) {
    if (!e.source.trim()) out.push({ severity: 'ERROR', code: 'EMBELLISHMENT_SOURCE', subject: e.id, detail: 'every embellishment names its source or its reasoning' });
    if (e.label === 'FOUNDER_APPROVAL_REQUIRED' && !founderDecisionRefs.has(e.id)) out.push({ severity: 'ERROR', code: 'EMBELLISHMENT_UNSURFACED', subject: e.id, detail: 'needs founder approval but no founder decision references it' });
    if (e.label === 'FOUNDER_DECIDED' && !founderDecisionRefs.has(e.id)) out.push({ severity: 'ERROR', code: 'EMBELLISHMENT_UNSURFACED', subject: e.id, detail: 'marked founder-decided but no founder decision references it' });
  }
  return out;
}

/** Character baselines from the founder's performance brief (sprint V2 §15). Scene direction modulates them; it never replaces them. */
export const PERFORMANCE_BASELINES = [
  { character: 'SLOANE', preserve: ['glamour', 'warmth', 'wit', 'charisma', 'emotional intelligence'], label: 'SOURCE_ESTABLISHED', source: 'Founder sprint V2 §15' },
  { character: 'GIDEON', preserve: ['understated authority', 'dry humor', 'familiarity', 'protectiveness', 'natural conversational pacing'], label: 'SOURCE_ESTABLISHED', source: 'Founder sprint V2 §15' },
  { character: 'KAI', preserve: ['intelligence', 'articulate delivery', 'charm', 'quiet sarcasm', 'social fluency', 'masculine ease', 'emotional depth'], label: 'SOURCE_ESTABLISHED', source: 'Founder sprint V2 §15' },
] as const;

export const PERFORMANCE_GLOBAL_AVOID = ['overused slang', 'theatrical pauses', 'dramatic expressions out of proportion to the moment', 'mouth motion on a character who is not speaking'];
