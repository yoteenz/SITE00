/**
 * ACTIVITY — living project memory (P0.STUDIOOS.PRODUCTION.ACTIVITY.ONE-VIEWPORT-CONVERGENCE.OPUS1).
 *
 * Every event answers: what changed, who changed it, when, which version / state, which project · entry · area,
 * what it affects, what it unlocks or blocks downstream, and what came before / after it (lineage).
 * Events are derived from records that already exist — nothing is authored for the UI:
 *   - recorded production activity + production requests (hub `activity`)
 *   - the live production graph (graph blocker lines → BLOCKED, completed upstream → UNLOCKED)
 *   - canonical Entry 002 records (narrative plan version, cast characters, locked authority sheets, storyboard)
 */
import type { HubActivityItem, HubNodeId } from '../../../../shared/site00-production-hub/index.js';
import type { HubData } from '../productionHub/useProductionHubData';

export const ACTIVITY_DOMAINS = ['ALL', 'DESIGN', 'EXPERIENCE', 'EXPRESSION', 'LIBRARY', 'PEOPLE', 'SYSTEM'] as const;
export type ActivityDomain = (typeof ACTIVITY_DOMAINS)[number];
export type EventDomain = Exclude<ActivityDomain, 'ALL'>;

export const ACTIVITY_RANGES = [
  { id: 'today', label: 'TODAY', ms: 24 * 3600_000 },
  { id: 'week', label: 'THIS WEEK', ms: 7 * 24 * 3600_000 },
  { id: 'month', label: 'THIS MONTH', ms: 31 * 24 * 3600_000 },
  { id: 'all', label: 'FULL HISTORY', ms: Number.POSITIVE_INFINITY },
] as const;
export type ActivityRange = (typeof ACTIVITY_RANGES)[number]['id'];

/** Change types — secondary metadata (filterable), never the primary navigation. */
export const ACTIVITY_VERBS = ['CREATED', 'UPDATED', 'APPROVED', 'REVISED', 'SUPERSEDED', 'GENERATED', 'CAST', 'PUBLISHED', 'UNLOCKED', 'BLOCKED', 'RESOLVED', 'DEPLOYED'] as const;
export type ActivityVerb = (typeof ACTIVITY_VERBS)[number];

export type MemoryEvent = {
  id: string;
  verb: ActivityVerb;
  domain: EventDomain;
  subject: string;
  /** "v1.1.0" · null when the record carries no version */
  version: string | null;
  /** state before → after, when the record knows it */
  prior: string | null;
  result: string | null;
  /** who / what performed it */
  by: string;
  project: string;
  entry: string | null;
  /** production area (graph node label) */
  area: string | null;
  /** directly affected areas · second-order downstream areas */
  affects: string[];
  downstream: string[];
  /** plain cause line */
  cause: string | null;
  /** lineage edge to the event that caused this one */
  causeId: string | null;
  /** ISO time; null = undated canonical record (FULL HISTORY only) */
  at: string | null;
  /** live state read now */
  live: boolean;
  nodeId: HubNodeId | null;
  source: 'RECORDED' | 'REQUEST' | 'GRAPH' | 'CANONICAL';
  /** extra recorded detail line */
  detail: string | null;
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
const DOMAIN_PATTERNS: readonly [EventDomain, RegExp][] = [
  ['DESIGN', /design|brand|surface|compiler|viewport/i],
  ['EXPERIENCE', /experience|world|zone|environment|simulation/i],
  ['LIBRARY', /library|asset|canon|vault|upload/i],
  ['PEOPLE', /cast|people|character|actor|talent/i],
  ['EXPRESSION', /expression|storyboard|scene|frame|render|narrative|look|wardrobe|campaign|set/i],
];
const NODE_DOMAIN: Record<HubNodeId, EventDomain> = {
  narrative: 'EXPRESSION',
  cast: 'PEOPLE',
  look: 'EXPRESSION',
  performance: 'EXPRESSION',
  set: 'EXPRESSION',
  storyboard: 'EXPRESSION',
  keyframes: 'EXPRESSION',
};

export function verbFor(item: Pick<HubActivityItem, 'category' | 'title' | 'detail'>): ActivityVerb {
  const text = `${item.title} ${item.detail}`;
  for (const [v, re] of VERB_PATTERNS) if (re.test(text)) return v;
  if (item.category === 'APPROVAL') return 'APPROVED';
  if (item.category === 'RENDER') return 'GENERATED';
  if (item.category === 'ASSET') return 'UPDATED';
  return 'CREATED';
}
export function domainFor(item: Pick<HubActivityItem, 'category' | 'title' | 'detail'>): EventDomain {
  if (item.category === 'ASSET') return 'LIBRARY';
  const text = `${item.title} ${item.detail}`;
  for (const [d, re] of DOMAIN_PATTERNS) if (re.test(text)) return d;
  return 'SYSTEM';
}

const words = (s: string | null | undefined) => (s ? s.replace(/_/g, ' ') : null);

/** Build the project memory, newest first (live state first, undated canonical records last). */
export function buildActivityMemory(data: HubData | null, now = Date.now()): MemoryEvent[] {
  if (!data) return [];
  const events: MemoryEvent[] = [];
  const nowIso = new Date(now).toISOString();
  const project = (data.project?.name ?? 'PROJECT').toUpperCase();
  const entry = data.production?.label ?? null;
  const { graph, plan, cast } = data;
  const label = (id: HubNodeId) => graph.byId[id]?.label ?? id.toUpperCase();
  /** affects = what this node unlocks; downstream = what those unlock (second order) */
  const impact = (id: HubNodeId | null) => {
    if (!id || !graph.byId[id]) return { affects: [] as string[], downstream: [] as string[] };
    const first = graph.byId[id]!.unlocks;
    const second = [...new Set(first.flatMap((u) => graph.byId[u]?.unlocks ?? []))].filter((u) => !first.includes(u));
    return { affects: first.map(label), downstream: second.map(label) };
  };
  const base = (nodeId: HubNodeId | null) => ({ project, entry, area: nodeId ? label(nodeId) : null, nodeId, ...impact(nodeId), detail: null });

  /* canonical records ------------------------------------------------------------------------------- */
  const characters = cast?.characters ?? [];
  const looks = cast?.looks ?? [];
  const sheets = cast?.authoritySheets ?? [];
  const firstRecord = [...characters.map((c) => c.createdAt), ...looks.map((l) => l.createdAt)].filter(Boolean).sort()[0] ?? null;
  if (data.production) {
    events.push({
      ...base(null),
      id: 'evt.entry.created',
      verb: 'CREATED',
      domain: 'SYSTEM',
      subject: entry ?? 'ENTRY',
      version: plan ? `v${plan.version}` : null,
      prior: null,
      result: 'IN PRODUCTION',
      by: 'SYSTEM',
      downstream: ['PRODUCTION'],
      cause: null,
      causeId: null,
      at: firstRecord,
      live: false,
      source: 'CANONICAL',
    });
  }
  if (plan) {
    events.push({
      ...base('narrative'),
      id: 'evt.narrative.generated',
      verb: 'GENERATED',
      domain: 'EXPRESSION',
      subject: 'NARRATIVE',
      version: `v${plan.version}`,
      prior: null,
      result: words(plan.founderStatus),
      by: plan.layerMode === 'RETROACTIVE_AUTHORITY_LAYER' ? 'EXPRESSION ENGINE · RETROACTIVE' : 'EXPRESSION ENGINE',
      cause: data.production ? `${entry} CREATED` : null,
      causeId: data.production ? 'evt.entry.created' : null,
      at: plan.updatedAt ?? plan.createdAt ?? null,
      live: false,
      source: 'CANONICAL',
      detail: `${plan.beats.length} BEATS · ${words(plan.selectedGrammarId)}`,
    });
    if (plan.founderStatus === 'APPROVED') {
      events.push({
        ...base('narrative'),
        id: 'evt.narrative.approved',
        verb: 'APPROVED',
        domain: 'EXPRESSION',
        subject: 'NARRATIVE',
        version: `v${plan.version}`,
        prior: 'IN REVIEW',
        result: 'APPROVED',
        by: 'FOUNDER',
        cause: 'NARRATIVE GENERATED',
        causeId: 'evt.narrative.generated',
        at: plan.updatedAt ?? null,
        live: false,
        source: 'CANONICAL',
      });
    }
  }
  for (const c of characters) {
    if (!c.actorId) continue;
    events.push({
      ...base('cast'),
      id: `evt.cast.${c.characterId}`,
      verb: 'CAST',
      domain: 'PEOPLE',
      subject: c.characterName,
      version: null,
      prior: null,
      result: words(c.status),
      by: 'CASTING',
      cause: plan ? 'NARRATIVE CASTING REQUIREMENT' : null,
      causeId: plan ? 'evt.narrative.generated' : null,
      at: c.updatedAt ?? c.createdAt ?? null,
      live: false,
      source: 'CANONICAL',
      detail: `ACTOR ${c.actorId.toUpperCase()} · ${c.narrativeRole}`,
    });
  }
  for (const s of sheets) {
    if (!s.locked) continue;
    const ch = characters.find((c) => c.characterId === s.characterId);
    events.push({
      ...base('look'),
      id: `evt.authority.${s.characterAuthorityId}`,
      verb: 'APPROVED',
      domain: 'EXPRESSION',
      subject: `${s.characterName} · LOOK AUTHORITY`,
      version: null,
      prior: null,
      result: 'LOCKED',
      by: 'AUTHORITY SHEET',
      cause: ch ? `${ch.characterName} CAST` : null,
      causeId: ch?.actorId ? `evt.cast.${ch.characterId}` : null,
      at: s.updatedAt ?? null,
      live: false,
      source: 'CANONICAL',
      detail: s.continuityNotes || null,
    });
  }
  if (data.storyboardVersion && data.frames.some((f) => !!f.canonicalUrl)) {
    events.push({
      ...base('storyboard'),
      id: 'evt.storyboard.generated',
      verb: 'GENERATED',
      domain: 'EXPRESSION',
      subject: 'STORYBOARD',
      version: `v${data.storyboardVersion}`,
      prior: null,
      result: `${data.frames.length} FRAMES`,
      by: 'STORYBOARD PIPELINE',
      cause: 'CAST LOCKED',
      causeId: null,
      at: null,
      live: false,
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
      ...base(n?.id ?? null),
      id: `evt.graph.blocked.${n?.id ?? name.toLowerCase().replace(/\W+/g, '-')}`,
      verb: 'BLOCKED',
      domain: n ? NODE_DOMAIN[n.id] : 'SYSTEM',
      subject: n?.label ?? name,
      version: null,
      prior: n ? words(n.status) : null,
      result: 'BLOCKED',
      by: 'SYSTEM',
      cause: reason.toUpperCase() || null,
      causeId: null,
      at: nowIso,
      live: true,
      source: 'GRAPH',
    });
  }
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
        ...base(n.id),
        id: `evt.graph.unlocked.${n.id}`,
        verb: 'UNLOCKED',
        domain: NODE_DOMAIN[n.id],
        subject: n.label,
        version: null,
        prior: 'LOCKED',
        result: words(n.status),
        by: 'SYSTEM',
        cause: `${ups.map((u) => u!.label).join(' + ')} COMPLETE`,
        causeId: null,
        at: nowIso,
        live: true,
        source: 'GRAPH',
      });
    }
  }

  /* recorded activity + production requests ---------------------------------------------------------- */
  for (const a of data.activity) {
    const text = `${a.title} ${a.detail}`.toUpperCase();
    const node = graph.nodes.find((n) => text.includes(n.label.toUpperCase()))?.id ?? null;
    events.push({
      ...base(node),
      id: `evt.rec.${a.id}`,
      verb: verbFor(a),
      domain: domainFor(a),
      subject: a.title,
      version: null,
      prior: null,
      result: null,
      by: a.actor ?? (a.category === 'REQUEST' ? 'PROJECT REQUEST' : 'SYSTEM'),
      cause: null,
      causeId: null,
      at: a.at,
      live: false,
      source: a.category === 'REQUEST' ? 'REQUEST' : 'RECORDED',
      detail: a.detail || null,
    });
  }

  const ids = new Set(events.map((e) => e.id));
  for (const e of events) if (e.causeId && !ids.has(e.causeId)) e.causeId = null;

  return events.sort((x, y) => {
    if (x.live !== y.live) return x.live ? -1 : 1;
    if (!x.at || !y.at) return x.at ? -1 : y.at ? 1 : 0;
    return y.at.localeCompare(x.at);
  });
}

export function inRange(e: MemoryEvent, range: ActivityRange, now = Date.now()): boolean {
  if (range === 'all') return true;
  if (!e.at) return false;
  const ms = ACTIVITY_RANGES.find((r) => r.id === range)!.ms;
  const t = new Date(e.at).getTime();
  return !Number.isNaN(t) && now - t <= ms && t <= now + 60_000;
}

/** Downstream events (reverse lineage edge). */
export const effectsOf = (events: readonly MemoryEvent[], id: string) => events.filter((e) => e.causeId === id);
/** Cause chain, nearest first. */
export function causeChain(events: readonly MemoryEvent[], e: MemoryEvent): MemoryEvent[] {
  const out: MemoryEvent[] = [];
  let cur: MemoryEvent | undefined = e;
  const seen = new Set<string>();
  while (cur?.causeId && !seen.has(cur.causeId)) {
    seen.add(cur.causeId);
    cur = events.find((x) => x.id === cur!.causeId);
    if (cur) out.push(cur);
  }
  return out;
}
