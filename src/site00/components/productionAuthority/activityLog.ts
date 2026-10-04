/**
 * ACTIVITY LOG model (P0.PRODUCTION.INBOX-ACTIVITY.AUTHORITY-CONVERGENCE2).
 *
 * Production memory as events: VERB · SUBJECT · version · actor · what it affects downstream · what caused it.
 * Every event is derived from a live or canonical record — nothing is authored for the UI:
 *   - recorded production activity + production requests (hub `activity`)
 *   - live production-graph state (BLOCKED nodes, UNLOCKED nodes whose upstream completed)
 *   - canonical Entry 002 records (narrative plan, cast characters, character authority sheets, storyboard pipeline)
 * Lineage: each event may name the event that caused it (`causeId`); the reverse edge gives its downstream effects.
 */
import type { HubActivityItem, HubNodeId } from '../../../../shared/site00-production-hub/index.js';
import type { HubData } from '../productionHub/useProductionHubData';

export const ACTIVITY_VERBS = ['CREATED', 'UPDATED', 'APPROVED', 'REVISED', 'SUPERSEDED', 'GENERATED', 'CAST', 'PUBLISHED', 'UNLOCKED', 'BLOCKED', 'RESOLVED', 'DEPLOYED'] as const;
export type ActivityVerb = (typeof ACTIVITY_VERBS)[number];

export const ACTIVITY_DOMAINS = ['ALL', 'DESIGN', 'EXPERIENCE', 'EXPRESSION', 'LIBRARY', 'PEOPLE', 'SYSTEM'] as const;
export type ActivityDomain = (typeof ACTIVITY_DOMAINS)[number];

export const ACTIVITY_RANGES = [
  { id: 'today', label: 'TODAY', ms: 24 * 3600_000 },
  { id: 'week', label: 'THIS WEEK', ms: 7 * 24 * 3600_000 },
  { id: 'month', label: 'THIS MONTH', ms: 31 * 24 * 3600_000 },
  { id: 'all', label: 'FULL HISTORY', ms: Number.POSITIVE_INFINITY },
] as const;
export type ActivityRange = (typeof ACTIVITY_RANGES)[number]['id'];

export type LogEvent = {
  id: string;
  verb: ActivityVerb;
  domain: Exclude<ActivityDomain, 'ALL'>;
  subject: string;
  /** "VERSION 1.1.0" · "FROM 001 TO 002" · null when the record carries no version */
  version: string | null;
  /** who / what performed it */
  by: string;
  /** what it touches downstream */
  affects: string | null;
  /** plain cause line (always shown when present) */
  cause: string | null;
  /** lineage edge: the event that caused this one */
  causeId: string | null;
  /** ISO time; null = undated canonical record (FULL HISTORY only) */
  at: string | null;
  /** live state read now (dated "NOW") */
  live: boolean;
  nodeId: HubNodeId | null;
  source: 'RECORDED' | 'REQUEST' | 'GRAPH' | 'CANONICAL';
};

const VERB_PATTERNS: readonly [ActivityVerb, RegExp][] = [
  ['SUPERSEDED', /supersed|replaced/i],
  ['DEPLOYED', /deploy/i],
  ['PUBLISHED', /publish/i],
  ['REVISED', /revis/i],
  ['APPROVED', /approv|signoff|sign-off|love it/i],
  ['UNLOCKED', /unlock/i],
  ['BLOCKED', /block/i],
  ['RESOLVED', /resolv|complete/i],
  ['CAST', /\bcast\b|casting decision|new character/i],
  ['GENERATED', /render|generat|compil/i],
  ['UPDATED', /updat|change|wardrobe/i],
];
const DOMAIN_PATTERNS: readonly [LogEvent['domain'], RegExp][] = [
  ['DESIGN', /design|brand|surface|compiler|viewport/i],
  ['EXPERIENCE', /experience|world|zone|environment|simulation/i],
  ['LIBRARY', /library|asset|canon|vault|upload/i],
  ['PEOPLE', /cast|people|character|actor|talent/i],
  ['EXPRESSION', /expression|storyboard|scene|frame|render|narrative|look|wardrobe|campaign|set/i],
];

export function verbFor(item: Pick<HubActivityItem, 'category' | 'title' | 'detail'>): ActivityVerb {
  const text = `${item.title} ${item.detail}`;
  for (const [v, re] of VERB_PATTERNS) if (re.test(text)) return v;
  if (item.category === 'APPROVAL') return 'APPROVED';
  if (item.category === 'RENDER') return 'GENERATED';
  if (item.category === 'ASSET') return 'UPDATED';
  return 'CREATED';
}
export function domainFor(item: Pick<HubActivityItem, 'category' | 'title' | 'detail'>): LogEvent['domain'] {
  if (item.category === 'ASSET') return 'LIBRARY';
  const text = `${item.title} ${item.detail}`;
  for (const [d, re] of DOMAIN_PATTERNS) if (re.test(text)) return d;
  return 'SYSTEM';
}

const NODE_DOMAIN: Record<HubNodeId, LogEvent['domain']> = {
  narrative: 'EXPRESSION',
  cast: 'PEOPLE',
  look: 'EXPRESSION',
  performance: 'EXPRESSION',
  set: 'EXPRESSION',
  storyboard: 'EXPRESSION',
  keyframes: 'EXPRESSION',
};

/** Build the production's event log, newest first (live state first, undated canonical records last). */
export function buildActivityLog(data: HubData | null, now = Date.now()): LogEvent[] {
  if (!data) return [];
  const events: LogEvent[] = [];
  const nowIso = new Date(now).toISOString();
  const entry = data.production?.label ?? 'ENTRY';
  const { graph, plan, cast } = data;
  const label = (id: HubNodeId) => graph.byId[id]?.label ?? id.toUpperCase();

  /* canonical records ------------------------------------------------------------------------------- */
  const characters = cast?.characters ?? [];
  const looks = cast?.looks ?? [];
  const sheets = cast?.authoritySheets ?? [];
  const firstRecord = [...characters.map((c) => c.createdAt), ...looks.map((l) => l.createdAt)].filter(Boolean).sort()[0] ?? null;
  if (data.production) {
    events.push({
      id: 'evt.entry.created',
      verb: 'CREATED',
      domain: 'SYSTEM',
      subject: entry,
      version: plan ? `Version ${plan.version}` : null,
      by: 'SYSTEM',
      affects: 'Downstream: PRODUCTION',
      cause: null,
      causeId: null,
      at: firstRecord,
      live: false,
      nodeId: null,
      source: 'CANONICAL',
    });
  }
  if (plan) {
    events.push({
      id: 'evt.narrative.generated',
      verb: 'GENERATED',
      domain: 'EXPRESSION',
      subject: 'NARRATIVE',
      version: `Version ${plan.version}`,
      by: plan.layerMode === 'RETROACTIVE_AUTHORITY_LAYER' ? 'EXPRESSION ENGINE · RETROACTIVE' : 'EXPRESSION ENGINE',
      affects: `Affects: ${plan.beats.length} BEATS · CASTING`,
      cause: data.production ? `${entry} CREATED` : null,
      causeId: data.production ? 'evt.entry.created' : null,
      at: plan.updatedAt ?? plan.createdAt ?? null,
      live: false,
      nodeId: 'narrative',
      source: 'CANONICAL',
    });
    if (plan.founderStatus === 'APPROVED') {
      events.push({
        id: 'evt.narrative.approved',
        verb: 'APPROVED',
        domain: 'EXPRESSION',
        subject: 'NARRATIVE',
        version: `Version ${plan.version}`,
        by: 'FOUNDER',
        affects: 'Affects: CAST',
        cause: 'NARRATIVE GENERATED',
        causeId: 'evt.narrative.generated',
        at: plan.updatedAt ?? null,
        live: false,
        nodeId: 'narrative',
        source: 'CANONICAL',
      });
    }
  }
  {
    for (const c of characters) {
      if (!c.actorId) continue;
      events.push({
        id: `evt.cast.${c.characterId}`,
        verb: 'CAST',
        domain: 'PEOPLE',
        subject: c.characterName,
        version: null,
        by: 'CASTING',
        affects: `Actor: ${c.actorId.toUpperCase()} · Affects: LOOK`,
        cause: plan ? 'NARRATIVE CASTING REQUIREMENT' : null,
        causeId: plan ? 'evt.narrative.generated' : null,
        at: c.updatedAt ?? c.createdAt ?? null,
        live: false,
        nodeId: 'cast',
        source: 'CANONICAL',
      });
    }
    for (const s of sheets) {
      if (!s.locked) continue;
      const ch = characters.find((c) => c.characterId === s.characterId);
      events.push({
        id: `evt.authority.${s.characterAuthorityId}`,
        verb: 'APPROVED',
        domain: 'EXPRESSION',
        subject: `${s.characterName} · LOOK AUTHORITY`,
        version: null,
        by: 'AUTHORITY SHEET · LOCKED',
        affects: 'Affects: PERFORMANCE · STORYBOARD',
        cause: ch ? `${ch.characterName} CAST` : null,
        causeId: ch?.actorId ? `evt.cast.${ch.characterId}` : null,
        at: s.updatedAt ?? null,
        live: false,
        nodeId: 'look',
        source: 'CANONICAL',
      });
    }
  }
  if (data.storyboardVersion && data.frames.some((f) => !!f.canonicalUrl)) {
    events.push({
      id: 'evt.storyboard.generated',
      verb: 'GENERATED',
      domain: 'EXPRESSION',
      subject: 'STORYBOARD',
      version: `Version ${data.storyboardVersion}`,
      by: 'STORYBOARD PIPELINE',
      affects: `Affects: ${data.frames.length} FRAMES · KEYFRAMES`,
      cause: 'CAST LOCKED',
      causeId: null,
      at: null,
      live: false,
      nodeId: 'storyboard',
      source: 'CANONICAL',
    });
  }

  /* live production graph --------------------------------------------------------------------------- */
  // BLOCKED = the graph's own blocker lines ("NODE: reason") — the same list the status strip counts.
  const blockedIds = new Set<HubNodeId>();
  for (const line of graph.blockers) {
    const i = line.indexOf(':');
    const name = (i > 0 ? line.slice(0, i) : line).trim().toUpperCase();
    const reason = i > 0 ? line.slice(i + 1).trim() : '';
    const n = graph.nodes.find((x) => x.label.toUpperCase() === name || x.id.toUpperCase() === name);
    if (n) blockedIds.add(n.id);
    events.push({
      id: `evt.graph.blocked.${n?.id ?? name.toLowerCase().replace(/\W+/g, '-')}`,
      verb: 'BLOCKED',
      domain: n ? (NODE_DOMAIN[n.id] ?? 'SYSTEM') : 'SYSTEM',
      subject: n?.label ?? name,
      version: null,
      by: 'SYSTEM',
      affects: n?.unlocks.length ? `Affects: ${n.unlocks.map(label).join(' · ')}` : null,
      cause: reason.toUpperCase() || null,
      causeId: null,
      at: nowIso,
      live: true,
      nodeId: n?.id ?? null,
      source: 'GRAPH',
    });
  }
  // lineage: a node blocked because its upstream is blocked points at that upstream's BLOCKED event
  for (const e of events) {
    if (e.verb !== 'BLOCKED' || !e.nodeId) continue;
    const up = graph.byId[e.nodeId]?.dependsOn.find((d) => blockedIds.has(d));
    if (up) e.causeId = `evt.graph.blocked.${up}`;
  }
  for (const n of graph.nodes) {
    if (blockedIds.has(n.id)) continue;
    const ups = n.dependsOn.map((d) => graph.byId[d]).filter(Boolean);
    if ((n.status === 'ACTIVE' || n.status === 'REVIEW_REQUIRED') && ups.length && ups.every((u) => u!.status === 'COMPLETE')) {
      events.push({
        id: `evt.graph.unlocked.${n.id}`,
        verb: 'UNLOCKED',
        domain: NODE_DOMAIN[n.id] ?? 'SYSTEM',
        subject: n.label,
        version: null,
        by: 'SYSTEM',
        affects: n.status === 'REVIEW_REQUIRED' ? 'Awaiting founder review' : `Downstream: ${n.unlocks.map(label).join(' · ') || '—'}`,
        cause: `${ups.map((u) => u!.label).join(' + ')} COMPLETE`,
        causeId: null,
        at: nowIso,
        live: true,
        nodeId: n.id,
        source: 'GRAPH',
      });
    }
  }

  /* recorded activity + production requests ---------------------------------------------------------- */
  for (const a of data.activity) {
    events.push({
      id: `evt.rec.${a.id}`,
      verb: verbFor(a),
      domain: domainFor(a),
      subject: a.title,
      version: null,
      by: a.actor ?? (a.category === 'REQUEST' ? 'PROJECT REQUEST' : 'SYSTEM'),
      affects: a.detail || null,
      cause: null,
      causeId: null,
      at: a.at,
      live: false,
      nodeId: null,
      source: a.category === 'REQUEST' ? 'REQUEST' : 'RECORDED',
    });
  }

  // a BLOCKED cause that points at a node with no BLOCKED event of its own falls back to the plain cause line
  const ids = new Set(events.map((e) => e.id));
  for (const e of events) if (e.causeId && !ids.has(e.causeId)) e.causeId = null;

  return events.sort((x, y) => {
    if (x.live !== y.live) return x.live ? -1 : 1;
    if (!x.at || !y.at) return x.at ? -1 : y.at ? 1 : 0;
    return y.at.localeCompare(x.at);
  });
}

export function inRange(e: LogEvent, range: ActivityRange, now = Date.now()): boolean {
  if (range === 'all') return true;
  if (!e.at) return false;
  const ms = ACTIVITY_RANGES.find((r) => r.id === range)!.ms;
  const t = new Date(e.at).getTime();
  return !Number.isNaN(t) && now - t <= ms && t <= now + 60_000;
}

/** Downstream effects of an event (reverse lineage edge). */
export const effectsOf = (events: readonly LogEvent[], id: string) => events.filter((e) => e.causeId === id);
/** Cause chain, nearest first. */
export function causeChain(events: readonly LogEvent[], e: LogEvent): LogEvent[] {
  const out: LogEvent[] = [];
  let cur: LogEvent | undefined = e;
  const seen = new Set<string>();
  while (cur?.causeId && !seen.has(cur.causeId)) {
    seen.add(cur.causeId);
    cur = events.find((x) => x.id === cur!.causeId);
    if (cur) out.push(cur);
  }
  return out;
}
