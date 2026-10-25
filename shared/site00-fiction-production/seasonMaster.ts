import crypto from 'node:crypto';
import fs from 'node:fs';
import { parseCsv } from './csv.js';
import { EXCHANGE_PATHS, repoPath } from './paths.js';
import {
  APPROVED_AMENDMENTS,
  APPROVED_MAX_NIGHT_GAP,
  APPROVED_NIGHTS,
  APPROVED_RELEASE_COUNT,
  APPROVED_RUNTIME,
  FOUNDER_APPROVAL,
  INVENTION_NAMES,
  PRINCIPALS,
  RECURRING_PATRON_NAMES,
  REVISION_DECISIONS,
  S1_DEPENDENT_RELEASES,
} from './founderDecisions.js';
import { LIVING_WORLD_AMENDMENTS } from './promotion/amendments.js';
import {
  FICTION_PRODUCTION_SCHEMA_VERSION,
  type MasterRelease,
  type ReleaseChange,
  type SeasonMaster,
  type StoryLayer,
} from './types.js';

export function durationToSec(d: string): number {
  const [m, s] = d.split(':').map(Number);
  return m * 60 + s;
}

export function secToDuration(total: number): string {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function dayOffset(day: string): number {
  const m = day.match(/GE\s*([−+-]?)\s*(\d+)/);
  if (!m) throw new Error(`Unparseable fictional day: ${day}`);
  return (m[1] === '−' || m[1] === '-' ? -1 : 1) * Number(m[2]);
}

const ID_RE = /S1-(\d{2})/g;
const idsIn = (text: string) => [...new Set([...text.matchAll(ID_RE)].map((m) => `S1-${m[1]}`))];
const sha256 = (p: string) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

const WRITERS_NOTE = /pilot beats?\b|\bCC-\d|^MIDPOINT\b|^This is\b/;

function firstBeat(happens: string): string {
  const clean = happens.replace(/^\s*-\s*/, '').replace(/\*\*/g, '').replace(/\s+-\s+/g, ' ');
  const DOT = '\u2024';
  const guarded = clean.replace(/\b(a)\.m\./g, `a${DOT}m${DOT}`).replace(/\b(p)\.m\./g, `p${DOT}m${DOT}`).replace(/\b(Mr|Mrs|Ms|Dr|St)\./g, `$1${DOT}`);
  const raw = guarded.match(/[^.!?]+[.!?]+["”]?/g) ?? [guarded];
  const sentences: string[] = [];
  for (const piece of raw) {
    const prev = sentences[sentences.length - 1];
    const openQuote = prev !== undefined && ((prev.match(/"/g) ?? []).length % 2 === 1 || /[“][^”]*$/.test(prev));
    if (openQuote) sentences[sentences.length - 1] = prev + piece;
    else sentences.push(piece);
  }
  const usable = sentences.map((s) => s.split(DOT).join('.').trim()).filter((s) => !WRITERS_NOTE.test(s));
  const pick = usable.length ? usable : sentences.map((s) => s.split(DOT).join('.').trim());
  return (pick[0].length < 32 && pick[1] ? `${pick[0]} ${pick[1]}` : pick[0]).trim();
}

function unresolvedFor(row: Record<string, string>): string[] {
  const text = `${row['FEATURED CHARACTERS']} ${row['WHAT ACTUALLY HAPPENS']} ${row['ENDING / TRANSITION']}`;
  const out: string[] = [];
  if (row.ID === 'S1-86') out.push('U-1');
  if (/Emmett/.test(row['FEATURED CHARACTERS'])) out.push('U-3');
  if (/\b(wears|wearing|dress|gown|jacket|coat|suit|tailor|hat|looks?\b|closet|lining|cardigan|wig)/i.test(text) || APPROVED_AMENDMENTS[row.ID]) out.push('U-4');
  if (INVENTION_NAMES.some((n) => new RegExp(`\\b${n}`).test(text))) out.push('U-5');
  if (RECURRING_PATRON_NAMES.some((n) => new RegExp(`\\b${n}\\b`).test(row['FEATURED CHARACTERS']))) out.push('U-6');
  if (row.SOURCE.startsWith('NEW')) out.push('U-7');
  if (row.ID === 'S1-83') out.push('U-9');
  return out;
}

const CHANGE: Record<string, ReleaseChange> = { A: 'UNCHANGED', B: 'REVISED', 'B (S-1 dependent)': 'REVISED_S1_DEPENDENT' };

export function buildSeasonMaster(root = process.cwd()): SeasonMaster {
  const rows = parseCsv(fs.readFileSync(repoPath(EXCHANGE_PATHS.optionACsv, root), 'utf8'));
  const lean = parseCsv(fs.readFileSync(repoPath(EXCHANGE_PATHS.optionBCsv, root), 'utf8'));
  const leanOf = new Map<string, { id: string; merged: string[] }>();
  for (const l of lean) {
    const src = idsIn(l['V1 SOURCE']);
    for (const s of src) leanOf.set(s, { id: l.ID, merged: src.filter((x) => x !== s) });
  }
  const nightIds = new Set(rows.filter((r) => r.LAYERS.split(',').includes('N')).map((r) => r.ID));
  const releases: MasterRelease[] = rows.map((r, i) => {
    const [arcNo, arcName] = r['INTERNAL ARC'].split(' · ');
    const [rating, ...rest] = r['PRODUCTION COMPLEXITY'].split(' (');
    const refs = idsIn(`${r['CONTINUITY DEPENDENCIES']} ${r['STORY OR EXPERIENTIAL VALUE']}`).filter((x) => x !== r.ID);
    const order = i + 1;
    const dependsOn = refs.filter((x) => Number(x.slice(3)) < order);
    const paysOffIn = refs.filter((x) => Number(x.slice(3)) > order);
    const decisions = REVISION_DECISIONS[r.ID];
    return {
      id: r.ID,
      order,
      title: r['WORKING TITLE'],
      arc: { number: Number(arcNo), name: arcName },
      category: r['CONTENT CATEGORY'],
      runtimeTarget: r.DURATION,
      runtimeTargetSec: durationToSec(r.DURATION),
      fictionalDay: r['FICTIONAL DAY'],
      dayOffsetStart: dayOffset(r['FICTIONAL DAY']),
      layers: r.LAYERS.split(',').map((x) => x.trim()) as StoryLayer[],
      exchangeNight: nightIds.has(r.ID),
      featuredCharacters: r['FEATURED CHARACTERS'],
      principalCharacters: PRINCIPALS.filter((p) => new RegExp(`\\b${p}\\b`).test(r['FEATURED CHARACTERS'])),
      setting: r.SETTING,
      openingHook: { text: firstBeat(r['WHAT ACTUALLY HAPPENS']), derivation: 'First beat of WHAT ACTUALLY HAPPENS in the approved Option A map' },
      narrativeDevelopment: r['WHAT ACTUALLY HAPPENS'],
      characterPurpose: r['CHARACTER PURPOSE'],
      payoff: r['STORY OR EXPERIENTIAL VALUE'],
      endingTransition: r['ENDING / TRANSITION'],
      emotionalTurningPoint: { text: null, source: 'Not in the approved map. Authored at screenplay stage; promoted only with SCREENPLAY approval.' },
      patronScenarios: r['EXCHANGE SCENARIO ID'].split(';').map((x) => x.trim()).filter((x) => x.startsWith('PX-')),
      nightDependencies: [...dependsOn, ...paysOffIn].filter((x) => nightIds.has(x)),
      continuityDependencies: r['CONTINUITY DEPENDENCIES'],
      dependsOn,
      paysOffIn,
      unresolvedQuestions: unresolvedFor(r),
      productionComplexity: { rating: rating.trim() as MasterRelease['productionComplexity']['rating'], notes: rest.join(' (').replace(/\)$/, '') },
      approvedAmendments: [...(APPROVED_AMENDMENTS[r.ID] ?? []), ...(LIVING_WORLD_AMENDMENTS[r.ID] ?? [])],
      classification: 'APPROVED_DEVELOPMENT_DIRECTION',
      lineage: {
        hybridSource: r.SOURCE,
        changeBaselineToV1: r['CHANGE (BASELINE → V1)'],
        changeVsV1: CHANGE[r['CHANGE VS V1']],
        workstream: r.WORKSTREAM,
        s1Dependent: r['S-1 DEPENDENT'] === 'YES',
        changeNote: r['CHANGE NOTE'],
        leanId: leanOf.get(r.ID)?.id ?? '',
        leanMergedWith: leanOf.get(r.ID)?.merged ?? [],
        sourceDocument: `${EXCHANGE_PATHS.optionACsv}#${r.ID}`,
        founderApproval: `${FOUNDER_APPROVAL.date} ${decisions ? decisions.join(' + ') : 'S-2 + NR-2 (Option A as written)'}`,
      },
    };
  });
  const arcs = [...new Set(releases.map((r) => r.arc.number))].map((n) => {
    const inArc = releases.filter((r) => r.arc.number === n);
    return { number: n, name: inArc[0].arc.name, first: inArc[0].id, last: inArc[inArc.length - 1].id };
  });
  const totalSec = releases.reduce((s, r) => s + r.runtimeTargetSec, 0);
  return {
    schemaVersion: FICTION_PRODUCTION_SCHEMA_VERSION,
    propertySlug: 'the-exchange',
    masterId: 'THE_EXCHANGE.S1.MASTER.V1',
    classification: 'APPROVED_CANON',
    structure: { releaseCount: releases.length, runtimeTotal: secToDuration(totalSec), runtimeTotalSec: totalSec, arcs },
    sourceDocument: { path: EXCHANGE_PATHS.optionACsv, sha256: sha256(repoPath(EXCHANGE_PATHS.optionACsv, root)) },
    founderApproval: { date: FOUNDER_APPROVAL.date, sprint: FOUNDER_APPROVAL.sprint, decisions: [...FOUNDER_APPROVAL.scope] },
    fallback: { path: EXCHANGE_PATHS.optionBCsv, releaseCount: lean.length, status: 'APPROVED_PRODUCTION_FALLBACK_INACTIVE: each of the five merges needs its own founder activation after production testing' },
    history: [
      { path: EXCHANGE_PATHS.baselineCsv, classification: 'HISTORICAL_SUPERSEDED', role: 'BASELINE V1, 86 releases' },
      { path: EXCHANGE_PATHS.hybridCsv, classification: 'HISTORICAL_SUPERSEDED', role: '74-release hybrid architecture incl. Plans A, B and C (FD-17), superseded by NR-7' },
    ],
    releases,
  };
}

export function loadSeasonMaster(root = process.cwd()): SeasonMaster {
  return JSON.parse(fs.readFileSync(repoPath(EXCHANGE_PATHS.master, root), 'utf8')) as SeasonMaster;
}

export function longestRunWithout(master: SeasonMaster, layer: StoryLayer): { length: number; from: string; to: string } {
  let best = { length: 0, from: '', to: '' };
  let start = -1;
  master.releases.forEach((r, i) => {
    const has = r.layers.includes(layer);
    if (!has && start < 0) start = i;
    const endRun = has || i === master.releases.length - 1;
    if (start >= 0 && endRun) {
      const end = has ? i - 1 : i;
      const length = end - start + 1;
      if (length > best.length) best = { length, from: master.releases[start].id, to: master.releases[end].id };
      start = -1;
    }
  });
  return best;
}

export type MasterFinding = { check: string; ok: boolean; detail: string };

export function validateSeasonMaster(master: SeasonMaster, baselineIds: string[]): MasterFinding[] {
  const f: MasterFinding[] = [];
  const ids = master.releases.map((r) => r.id);
  const expected = Array.from({ length: APPROVED_RELEASE_COUNT }, (_, i) => `S1-${String(i + 1).padStart(2, '0')}`);
  f.push({ check: 'Release count is 86', ok: ids.length === APPROVED_RELEASE_COUNT, detail: `${ids.length} releases` });
  f.push({ check: 'IDs S1-01..S1-86 in order', ok: ids.join() === expected.join(), detail: `${ids[0]}..${ids[ids.length - 1]}` });
  const added = ids.filter((x) => !baselineIds.includes(x));
  const removed = baselineIds.filter((x) => !ids.includes(x));
  f.push({ check: 'No release added or removed against BASELINE V1', ok: !added.length && !removed.length, detail: `added ${added.length}, removed ${removed.length}` });
  f.push({ check: 'Runtime target 127:40', ok: master.structure.runtimeTotal === APPROVED_RUNTIME, detail: master.structure.runtimeTotal });
  const back = master.releases.filter((r, i) => i > 0 && r.dayOffsetStart < master.releases[i - 1].dayOffsetStart).map((r) => r.id);
  f.push({ check: 'Fictional days never run backwards', ok: !back.length, detail: back.join(', ') || 'none' });
  for (const [id, title] of Object.entries(APPROVED_NIGHTS)) {
    const r = master.releases.find((x) => x.id === id);
    f.push({ check: `${id} is the Night "${title}"`, ok: !!r && r.title === title && r.exchangeNight, detail: r ? `${r.title}; layers ${r.layers.join(',')}` : 'missing' });
  }
  const gap = longestRunWithout(master, 'N');
  f.push({ check: `Longest run without a Night is at most ${APPROVED_MAX_NIGHT_GAP}`, ok: gap.length <= APPROVED_MAX_NIGHT_GAP, detail: `${gap.length} (${gap.from} to ${gap.to})` });
  const s1 = master.releases.filter((r) => r.lineage.s1Dependent).map((r) => r.id);
  f.push({ check: 'S-1 dependent rows are exactly S1-10, S1-74, S1-80', ok: s1.join() === S1_DEPENDENT_RELEASES.join(), detail: s1.join(', ') });
  const px = new Set(master.releases.flatMap((r) => r.patronScenarios));
  f.push({ check: 'All ten patron scenarios present', ok: px.size === 10, detail: [...px].sort().join(', ') });
  const arcsOk = master.structure.arcs.every((a, i, all) => i === 0 || Number(a.first.slice(3)) === Number(all[i - 1].last.slice(3)) + 1);
  f.push({ check: 'Arcs contiguous', ok: arcsOk, detail: master.structure.arcs.map((a) => `${a.number}:${a.first}-${a.last}`).join(' ') });
  const supersededPlanC = master.history.some((h) => h.path.includes('HYBRID') && h.classification === 'HISTORICAL_SUPERSEDED');
  f.push({ check: '74-release Plan C architecture recorded as superseded', ok: supersededPlanC, detail: 'hybrid map HISTORICAL_SUPERSEDED' });
  f.push({ check: 'Option B is fallback only', ok: master.fallback.releaseCount === 81 && master.fallback.status.includes('INACTIVE'), detail: master.fallback.status });
  return f;
}
