import { CANONICAL_AGES, APPROVED_MAX_NIGHT_GAP, APPROVED_NIGHTS, OPEN_QUESTIONS, RECURRING_PATRON_NAMES, SLOANE_RESUMED_LEADERSHIP_AT, VIVIENNE } from './founderDecisions.js';
import { dialogueLines, notes } from './fountain.js';
import { KNOWLEDGE_FACTS, type KnowledgeFact } from './knowledge.js';
import { resolveSet, type AssetRegistry, type DialogueRegistry } from './registries.js';
import { longestRunWithout } from './seasonMaster.js';
import type { ScreenplayDocument, SeasonMaster } from './types.js';

export type ContinuitySeverity = 'HARD_CONFLICT' | 'WARNING' | 'OPEN_QUESTION';
export type ContinuityFinding = { check: string; severity: ContinuitySeverity; releases: string[]; detail: string };
export type ContinuityInput = { master: SeasonMaster; dialogue: DialogueRegistry; assets: AssetRegistry; screenplays: ScreenplayDocument[]; facts?: KnowledgeFact[] };

export const CONTINUITY_CHECKS = [
  'RELEASE_ORDER', 'AGES', 'FAMILY_CHRONOLOGY', 'PLATONIC_GIDEON_SLOANE', 'KNOWLEDGE_AND_REVEALS', 'PATRON_TIMING', 'EMBER_RULE',
  'NIGHTS_DISTRIBUTION', 'ARRIVALS_DEPARTURES', 'GEOGRAPHY', 'WARDROBE', 'PROPS_AND_HANDOFFS', 'DIALOGUE_CONTINUITY', 'DEPENDENCIES', 'OPEN_QUESTIONS',
] as const;

const norm = (s: string) => s.replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\*/g, '').replace(/\s+/g, ' ').trim();
const lower = (s: string) => norm(s).toLowerCase();
const ROMANCE = /\b(kiss(es|ed|ing)?|lovers?|romantic|in love with|their date|make out|sleeps? with)\b/i;

export function audienceText(doc: ScreenplayDocument): string {
  return norm(doc.scenes.flatMap((s) => s.elements.map((e) => ('text' in e ? e.text : e.value))).join('\n'));
}

export function silentRelease(master: SeasonMaster, id: string): boolean {
  return /no dialogue/i.test(master.releases.find((r) => r.id === id)?.narrativeDevelopment ?? '');
}

export function quotedLines(master: SeasonMaster, id: string): string[] {
  const r = master.releases.find((x) => x.id === id);
  if (!r || silentRelease(master, id)) return [];
  return [...norm(`${r.narrativeDevelopment} ${r.endingTransition}`).matchAll(/"([^"]+)"/g)].map((m) => m[1].trim());
}

export function validateContinuity(input: ContinuityInput): ContinuityFinding[] {
  const { master, dialogue, assets } = input;
  const facts = input.facts ?? KNOWLEDGE_FACTS;
  const out: ContinuityFinding[] = [];
  const add = (check: string, severity: ContinuitySeverity, releases: string[], detail: string) => out.push({ check, severity, releases, detail });
  const order = new Map(master.releases.map((r) => [r.id, r.order]));
  const docs = [...input.screenplays].sort((a, b) => (order.get(a.meta.identity.releaseId) ?? 0) - (order.get(b.meta.identity.releaseId) ?? 0));
  const ord = (id: string) => order.get(id) ?? Number.POSITIVE_INFINITY;

  master.releases.forEach((r, i) => {
    const expected = `S1-${String(i + 1).padStart(2, '0')}`;
    if (r.id !== expected || r.order !== i + 1) add('RELEASE_ORDER', 'HARD_CONFLICT', [r.id], `expected ${expected} at position ${i + 1}`);
  });
  for (const d of docs) if (!order.has(d.meta.identity.releaseId)) add('RELEASE_ORDER', 'HARD_CONFLICT', [d.meta.identity.releaseId], 'screenplay for a release not in the master');

  for (const c of dialogue.characters) {
    const first = c.displayName.split(' ')[0];
    const canon = CANONICAL_AGES[first];
    if (canon && c.age !== canon.age) add('AGES', 'HARD_CONFLICT', [], `${c.displayName}: registry age ${c.age} ≠ canon ${canon.age}`);
  }
  const ageText = [...master.releases.map((r) => ({ id: r.id, t: norm(r.narrativeDevelopment) })), ...docs.map((d) => ({ id: d.meta.identity.releaseId, t: audienceText(d) }))];
  for (const { id, t } of ageText) {
    for (const [name, { age }] of Object.entries(CANONICAL_AGES)) {
      for (const m of t.matchAll(new RegExp(`\\b${name}(?: [A-Z][a-z]+)?, (\\d{2})\\b`, 'g'))) {
        if (Number(m[1]) !== age) add('AGES', 'HARD_CONFLICT', [id], `"${m[0]}" contradicts ${name} ${age}`);
      }
    }
  }

  const sloaneAtDeath = CANONICAL_AGES.Sloane.age - VIVIENNE.diedYearsAgo;
  const yearsSinceResume = CANONICAL_AGES.Sloane.age - SLOANE_RESUMED_LEADERSHIP_AT;
  const gap = VIVIENNE.diedYearsAgo - yearsSinceResume;
  const s08 = norm(master.releases.find((r) => r.id === 'S1-08')?.narrativeDevelopment ?? '');
  if (!/five years/.test(s08) || gap !== 5) add('FAMILY_CHRONOLOGY', 'HARD_CONFLICT', ['S1-08'], `Ada's interregnum should be ${gap} years (Vivienne died ${VIVIENNE.diedYearsAgo} years ago; Sloane resumed at ${SLOANE_RESUMED_LEADERSHIP_AT}, ${yearsSinceResume} years ago)`);
  const kaiThen = CANONICAL_AGES.Kai.age - VIVIENNE.diedYearsAgo;
  const s56 = norm(master.releases.find((r) => r.id === 'S1-56')?.narrativeDevelopment ?? '');
  if (!s56.includes(`ten years ago, at ${kaiThen}`)) add('FAMILY_CHRONOLOGY', 'HARD_CONFLICT', ['S1-56'], `Kai's commission should be ten years ago at ${kaiThen}`);
  add('FAMILY_CHRONOLOGY', 'OPEN_QUESTION', [], `Sloane was ${sloaneAtDeath} when Vivienne died and resumed leadership at ${SLOANE_RESUMED_LEADERSHIP_AT}. FD-12 (led at 23) and FD-15 (joined at 27) remain unruled (FC-03); CC-001B (Gideon family chronology) stays open.`);

  for (const r of master.releases) {
    if (/Gideon/.test(r.featuredCharacters) && /Sloane/.test(r.featuredCharacters) && ROMANCE.test(r.narrativeDevelopment)) {
      const m = r.narrativeDevelopment.match(ROMANCE)!;
      add('PLATONIC_GIDEON_SLOANE', 'WARNING', [r.id], `romance word "${m[0]}" in a Gideon–Sloane release; confirm it does not apply to them`);
    }
  }
  for (const d of docs) {
    for (const s of d.scenes) {
      const cues = new Set(s.elements.flatMap((e) => (e.kind === 'dialogue' ? [e.character] : e.kind === 'note' && e.tag === 'ENTER' ? [e.value.toUpperCase()] : [])));
      const t = s.elements.map((e) => ('text' in e ? e.text : e.value)).join(' ');
      if (cues.has('GIDEON') && cues.has('SLOANE') && ROMANCE.test(t)) add('PLATONIC_GIDEON_SLOANE', 'HARD_CONFLICT', [d.meta.identity.releaseId], `${s.sceneId}: Gideon and Sloane are platonic (APPROVED_CANON)`);
    }
  }

  for (const f of facts) {
    if (!f.audienceFrom) {
      add('KNOWLEDGE_AND_REVEALS', 'OPEN_QUESTION', [], `${f.factId}: ${f.statement} Writers' room ${f.writersRoom}; not revealed in Season 1 screenplays.`);
      continue;
    }
    const from = ord(f.audienceFrom);
    const kws = f.guardKeywords.map(lower);
    const anchor = lower(master.releases.find((r) => r.id === f.audienceFrom)?.narrativeDevelopment ?? '');
    if (kws.length && !kws.some((k) => anchor.includes(k))) add('KNOWLEDGE_AND_REVEALS', 'WARNING', [f.audienceFrom], `${f.factId}: reveal release does not contain a guard phrase`);
    for (const r of master.releases) {
      if (r.order >= from) break;
      const t = lower(r.narrativeDevelopment);
      for (const k of kws) if (t.includes(k)) add('KNOWLEDGE_AND_REVEALS', 'HARD_CONFLICT', [r.id, f.audienceFrom], `${f.factId} leaks before ${f.audienceFrom}: "${k}"`);
    }
    for (const d of docs) {
      const id = d.meta.identity.releaseId;
      if (ord(id) < from) for (const k of kws) if (lower(audienceText(d)).includes(k)) add('KNOWLEDGE_AND_REVEALS', 'HARD_CONFLICT', [id, f.audienceFrom], `${f.factId} leaks in the screenplay before ${f.audienceFrom}: "${k}"`);
      for (const l of dialogueLines(d)) {
        const who = f.knownBy.find((k) => k.character.toUpperCase() === l.character);
        if (who && ord(id) < ord(who.from) && kws.some((k) => lower(l.text).includes(k))) add('KNOWLEDGE_AND_REVEALS', 'HARD_CONFLICT', [id], `${l.lineId}: ${l.character} speaks ${f.factId} before learning it (${who.from})`);
      }
    }
  }

  const firstFeatured = new Map<string, string>();
  for (const name of RECURRING_PATRON_NAMES) {
    const r = master.releases.find((x) => new RegExp(`\\b${name}\\b`).test(x.featuredCharacters));
    if (r) firstFeatured.set(name.toUpperCase(), r.id);
    else add('PATRON_TIMING', 'WARNING', [], `${name} is never featured in the master`);
  }
  for (const d of docs) {
    const id = d.meta.identity.releaseId;
    const present = new Set([...dialogueLines(d).map((l) => l.character), ...notes(d, 'ENTER').map((n) => n.value.toUpperCase())]);
    for (const p of present) {
      const first = firstFeatured.get(p);
      if (first && ord(id) < ord(first)) add('PATRON_TIMING', 'HARD_CONFLICT', [id, first], `${p} appears before the master introduces them (${first})`);
    }
  }

  for (const d of docs) {
    const id = d.meta.identity.releaseId;
    const t = lower(audienceText(d));
    if (ord(id) < ord('S1-58') && /\bember\b/.test(t) && /\bgold\b/.test(t)) add('EMBER_RULE', 'HARD_CONFLICT', [id], 'the gold yes is unrevealed until S1-58');
    if (id === 'S1-01' && !/copper/.test(t)) add('EMBER_RULE', 'HARD_CONFLICT', [id], 'S1-01 must define the Ember as a copper glow');
  }

  const run = longestRunWithout(master, 'N');
  if (run.length > APPROVED_MAX_NIGHT_GAP) add('NIGHTS_DISTRIBUTION', 'HARD_CONFLICT', [run.from, run.to], `longest run without a Night is ${run.length} (approved max ${APPROVED_MAX_NIGHT_GAP})`);
  for (const id of Object.keys(APPROVED_NIGHTS)) if (!master.releases.find((r) => r.id === id)?.exchangeNight) add('NIGHTS_DISTRIBUTION', 'HARD_CONFLICT', [id], 'approved Night is not marked N');

  const cueOwner = new Map(assets.characters.map((c) => [c.characterId, c.cue]));
  const holder = new Map<string, string>(assets.props.map((p) => [p.propId, p.owner ? cueOwner.get(p.owner) ?? p.owner.toUpperCase() : '']));
  const dayWardrobe = new Map<string, { wid: string; release: string }>();
  for (const d of docs) {
    const id = d.meta.identity.releaseId;
    const seenThisRelease = new Set<string>();
    const release = master.releases.find((r) => r.id === id);
    const featured = release?.featuredCharacters ?? '';
    for (const s of d.scenes) {
      const present = new Set<string>();
      const { set } = resolveSet(assets, s.location, s.subLocation);
      if (!set) add('GEOGRAPHY', 'HARD_CONFLICT', [id], `${s.sceneId}: unregistered location "${s.location}"`);
      else if (set.releases && !set.releases.includes(id)) add('GEOGRAPHY', 'WARNING', [id], `${s.sceneId}: ${set.setId} does not list ${id}`);
      for (const e of s.elements) {
        if (e.kind === 'note' && e.tag === 'ENTER') {
          if (present.has(e.value.toUpperCase())) add('ARRIVALS_DEPARTURES', 'WARNING', [id], `${s.sceneId}: ${e.value} enters twice`);
          present.add(e.value.toUpperCase());
        } else if (e.kind === 'note' && e.tag === 'EXIT') {
          if (!present.delete(e.value.toUpperCase())) add('ARRIVALS_DEPARTURES', 'WARNING', [id], `${s.sceneId}: ${e.value} exits without entering`);
        } else if (e.kind === 'dialogue' && !['V.O.', 'O.S.', 'O.C.'].includes(e.extension ?? '') && !present.has(e.character)) {
          add('ARRIVALS_DEPARTURES', 'WARNING', [id], `${e.lineId}: ${e.character} speaks without an ENTER in ${s.sceneId}`);
        } else if (e.kind === 'note' && e.tag === 'WARDROBE') {
          const [who, wid] = e.value.split(':').map((x) => x.trim());
          const w = assets.wardrobe.find((x) => x.wardrobeId === wid);
          if (!w) add('WARDROBE', 'HARD_CONFLICT', [id], `${s.sceneId}: unregistered wardrobe ${wid}`);
          else if (!w.releases.includes(id)) add('WARDROBE', 'HARD_CONFLICT', [id], `${wid} is not scheduled for ${id}`);
          const key = `${release?.fictionalDay}|${who.toUpperCase()}`;
          const prev = dayWardrobe.get(key);
          if (prev && prev.release !== id && !seenThisRelease.has(key) && prev.wid !== wid) {
            add('WARDROBE', 'HARD_CONFLICT', [prev.release, id], `${who} ends ${prev.release} in ${prev.wid} but starts ${id} in ${wid} (${release?.fictionalDay})`);
          }
          seenThisRelease.add(key);
          dayWardrobe.set(key, { wid, release: id });
        } else if (e.kind === 'note' && (e.tag === 'PROP' || e.tag === 'HANDOFF')) {
          const pid = e.value.split(':')[0].trim();
          if (!holder.has(pid)) add('PROPS_AND_HANDOFFS', 'HARD_CONFLICT', [id], `${s.sceneId}: unregistered prop ${pid}`);
          if (e.tag === 'HANDOFF') {
            const [from, to] = e.value.slice(e.value.indexOf(':') + 1).split('→').map((x) => x.trim().toUpperCase());
            if (holder.get(pid) !== from) add('PROPS_AND_HANDOFFS', 'HARD_CONFLICT', [id], `${pid}: ${from} hands it on but ${holder.get(pid) || 'nobody'} holds it`);
            holder.set(pid, to);
          }
        }
      }
    }
    const reg = new Map(dialogue.characters.map((c) => [c.cue, c]));
    for (const l of dialogueLines(d)) {
      const c = reg.get(l.character);
      const first = c?.displayName.split(' ')[0] ?? '';
      if (c && l.extension !== 'V.O.' && !featured.includes(first)) {
        const named = `${release?.openingHook.text} ${release?.narrativeDevelopment} ${release?.endingTransition}`.includes(first);
        if (named) add('DIALOGUE_CONTINUITY', 'WARNING', [id], `${l.lineId}: ${c.displayName} appears in the master for ${id} but is not featured; this draft gives the character lines`);
        else add('DIALOGUE_CONTINUITY', 'HARD_CONFLICT', [id], `${l.lineId}: ${c.displayName} is not in ${id}`);
      }
    }
    const text = audienceText(d);
    for (const c of dialogue.characters) for (const l of c.dialogueContinuity.establishedLines) if (l.release === id && !text.includes(norm(l.line))) add('DIALOGUE_CONTINUITY', 'HARD_CONFLICT', [id], `established line missing: "${l.line}"`);
    for (const q of quotedLines(master, id)) if (!text.includes(q)) add('DIALOGUE_CONTINUITY', 'HARD_CONFLICT', [id], `master line missing: "${q}"`);
    if (silentRelease(master, id) && dialogueLines(d).length) add('DIALOGUE_CONTINUITY', 'HARD_CONFLICT', [id], 'no-dialogue release has dialogue');
    for (const u of release?.unresolvedQuestions ?? []) add('OPEN_QUESTIONS', 'OPEN_QUESTION', [id], `${u}: ${OPEN_QUESTIONS.find((q) => q.id === u)?.question ?? ''}`);
  }

  for (const r of master.releases) {
    for (const dep of r.dependsOn) if (!order.has(dep) || ord(dep) >= r.order) add('DEPENDENCIES', 'HARD_CONFLICT', [r.id], `dependsOn ${dep} is missing or not earlier`);
    for (const p of r.paysOffIn) if (!order.has(p) || ord(p) <= r.order) add('DEPENDENCIES', 'HARD_CONFLICT', [r.id], `paysOffIn ${p} is missing or not later`);
  }
  return out;
}

export function forwardDependencies(master: SeasonMaster, screenplays: ScreenplayDocument[]) {
  const ids = new Set(screenplays.map((d) => d.meta.identity.releaseId));
  return master.releases.filter((r) => ids.has(r.id)).flatMap((r) => r.paysOffIn.filter((p) => !ids.has(p)).map((p) => ({ from: r.id, to: p })));
}

export function continuitySummary(findings: ContinuityFinding[]) {
  const count = (s: ContinuitySeverity) => findings.filter((f) => f.severity === s).length;
  return { hardConflicts: count('HARD_CONFLICT'), warnings: count('WARNING'), openQuestions: count('OPEN_QUESTION'), checksRun: [...CONTINUITY_CHECKS] };
}
