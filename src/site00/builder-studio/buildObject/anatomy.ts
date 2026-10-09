/**
 * Blueprint anatomy — where each part of the proposal lives in the Build Object.
 *
 * The five Blueprint sections are inspection modes of one structure. This module binds what each section lists to
 * the geometry that actually carries it, from the canonical contracts only:
 *
 *   STRUCTURE  the Blueprint lines            → the layer of the model each line drives (or NOT DRAWN)
 *   PAGES      the Blueprint experiences      → the volume each page lives in, traced through the registry:
 *                                                a structure's starter page lives in the glass envelope; a page a
 *                                                capability adds lives in the wing of the WORK module behind it
 *   FEATURES   the Blueprint capabilities     → the module of the WORK choice that brings it (directly, through
 *                                                COMES WITH, or from the structure)
 *   TIMELINE   the resolved structure         → an illustrative assembly order (never a schedule or a duration)
 *
 * Lists, counts and order always come from the Blueprint snapshot; a binding only attaches to them. An element id
 * is named only if the composition really has it, so nothing here can light geometry that is not on the stage.
 */
import {
  CAPABILITY_BY_ID,
  STRUCTURE_BY_ID,
  WORK_TO_CAPABILITIES,
  chosenExperiences,
  deriveBuildLevel,
  effectiveCapabilities,
  EXPERIENCE_BY_ID,
} from '../../builder-experience';
import type { BlueprintLine, BlueprintSessionSnapshot, CapabilityId, ExperienceId } from '../../builder-experience';
import { CORE_INCLUDED, WORK_MODULE_BY_ID } from '../studioModel';
import type { BuildSpec, WorkModuleId } from '../studioModel';
import { blueprintElements, type BuildElement, type BuildInspection } from './composition';

/** Where something lives in the model. `elements` is empty when the model does not draw it. */
export type Home = { key: string; label: string; elements: string[] };

export type StructureLayerId = 'FOUNDATION' | 'CORE' | 'ENVELOPE' | 'WINGS' | 'MATERIAL' | 'PACE' | 'OTHER';

export type StructureLayer = {
  id: StructureLayerId;
  /** Editorial index, bottom up (L1 …). */
  n: string;
  label: string;
  /** What the geometry of this layer shows, in the client's words. */
  caption: string;
  /** Canonical Blueprint lines this layer's geometry carries. */
  lines: BlueprintLine[];
  /** Canonical Blueprint lines that belong here but that the model does not draw. */
  notDrawn: BlueprintLine[];
  /** Named parts (the WORK modules of the wings). */
  items: string[];
  elements: string[];
};

export type PageEntry = { n: number; group: string; label: string; depth: string; home: Home | null; via: string | null };
export type PageAtlas = {
  total: number;
  groups: { group: string; pages: PageEntry[] }[];
  /** Each volume that holds pages, with how many. */
  homes: (Home & { count: number })[];
};

export type FeatureEntry = {
  n: number;
  id: CapabilityId | null;
  verb: string;
  plain: string;
  comesWith: boolean;
  /** How it arrives: from a WORK choice, with another capability, or with the structure. */
  source: 'MODULE' | 'COMES_WITH' | 'STRUCTURE' | null;
  module: WorkModuleId | null;
  /** The capability it comes with (when `source` is COMES_WITH). */
  parent: string | null;
  /** Capabilities this one brings along (that the proposal includes). */
  bringsAlong: string[];
  /** Pages of the proposal this capability adds. */
  addsPages: string[];
  home: Home | null;
};

export type TimelineStage = { n: string; label: string; caption: string; items: string[]; elements: string[] };

export type BlueprintAnatomy = {
  layers: StructureLayer[];
  /** Null for a WORLD: it is designed as places, shaped at Blueprint review. */
  pages: PageAtlas | null;
  core: { label: string; plain: string; home: Home };
  features: FeatureEntry[];
  stages: TimelineStage[];
  /** Exploded axonometric offsets for the STRUCTURE mode. */
  explode: Record<string, [number, number, number]>;
};

const COMMERCIAL_LINES = ['COMMERCE', 'PLATFORM', 'PLATFORM_USAGE', 'PAYMENT_PROCESSING', 'ONGOING_SUPPORT'];

const LINE_LAYER: Record<string, StructureLayerId> = {
  BUILD: 'FOUNDATION',
  WORLD: 'FOUNDATION',
  LEVEL: 'CORE',
  STRUCTURE: 'ENVELOPE',
  EXPRESSION: 'MATERIAL',
  TYPE: 'MATERIAL',
  COLOR: 'MATERIAL',
  IMAGE: 'MATERIAL',
  MOTION: 'MATERIAL',
  DELIVERY: 'PACE',
};

/** Lines a layer carries without any geometry of their own (the model shows materials, not type or colour). */
const NEVER_DRAWN = new Set(['TYPE', 'COLOR', 'IMAGE', 'MOTION']);

/** The Blueprint lines the STRUCTURE section shows (commercial lines are shown with the estimate). */
export function structureLines(lines: readonly BlueprintLine[]): BlueprintLine[] {
  return lines.filter((line) => !COMMERCIAL_LINES.includes(line.key));
}

function moduleLabel(id: WorkModuleId): string {
  return WORK_MODULE_BY_ID[id].label;
}

export function blueprintAnatomy(spec: BuildSpec, snapshot: BlueprintSessionSnapshot): BlueprintAnatomy {
  const elements = blueprintElements(spec);
  const has = new Set(elements.map((el) => el.id));
  const only = (ids: string[]) => ids.filter((id) => has.has(id));
  const byId = new Map(elements.map((el) => [el.id, el]));
  const selection = snapshot.selection;
  const world = spec.path === 'WORLD';

  /* ── volumes ── */
  const wingIndex = (module: WorkModuleId) => spec.modules.indexOf(module);
  const wingElements = (i: number) => only([`side-${i}`, `side-${i}-module`, `side-${i}-mark`, `side-${i}-joint`]);
  const wingHome = (module: WorkModuleId): Home | null => {
    const i = wingIndex(module);
    if (i < 0 || !has.has(`side-${i}`)) return null;
    return { key: `WING-${module}`, label: `THE ${moduleLabel(module)} WING`, elements: only([`side-${i}`, `side-${i}-module`]) };
  };
  const envelope: Home = { key: 'ENVELOPE', label: 'THE MAIN ENVELOPE', elements: only(['vol-a']) };
  const coreHome: Home = { key: 'CORE', label: 'THE RED CORE', elements: only(['core', 'core-cap']) };
  const sides = elements.filter((el) => /^side-\d+$/.test(el.id)).map((el) => el.id);
  const massing = sides.filter((id) => Number(id.slice(5)) >= spec.modules.length);
  const wings = spec.modules.flatMap((_, i) => wingElements(i));
  const paceMarks = only(['core-mark', ...sides.flatMap((id) => [`${id}-mark`, `${id}-joint`])]);

  /* ── capability provenance (registry): which WORK module brings each capability ── */
  const effective = effectiveCapabilities(selection);
  const moduleFor = (cap: CapabilityId, seen = new Set<CapabilityId>()): { module: WorkModuleId | null; parent: CapabilityId | null } => {
    const direct = spec.modules.find((m) => WORK_TO_CAPABILITIES[m].includes(cap));
    if (direct) return { module: direct, parent: null };
    seen.add(cap);
    for (const parent of effective) {
      if (seen.has(parent) || !CAPABILITY_BY_ID[parent].comesWith.includes(cap)) continue;
      const up = moduleFor(parent, seen);
      if (up.module) return { module: up.module, parent };
    }
    return { module: null, parent: null };
  };
  const firstParent = (cap: CapabilityId) => effective.find((p) => p !== cap && CAPABILITY_BY_ID[p].comesWith.includes(cap)) ?? null;

  /* ── pages: every page of the snapshot, traced to its volume ── */
  let pages: PageAtlas | null = null;
  if (!world) {
    const level = deriveBuildLevel(selection).level;
    const chosen = chosenExperiences(selection, level).map((c) => c.id);
    const starters = new Set<ExperienceId>(
      [selection.structure, selection.structureSecondary].flatMap((s) => (s ? STRUCTURE_BY_ID[s].starterExperiences : [])),
    );
    const structureName = selection.structure ? STRUCTURE_BY_ID[selection.structure].label.toUpperCase() : null;
    const homeOf = (id: ExperienceId): { home: Home | null; via: string | null } => {
      const adders = effective.filter((cap) => CAPABILITY_BY_ID[cap].addsExperiences.includes(id));
      for (const cap of adders) {
        const { module } = moduleFor(cap);
        const home = module ? wingHome(module) : null;
        if (home) return { home, via: `${CAPABILITY_BY_ID[cap].verb}${module ? ` · FROM ${moduleLabel(module)}` : ''}` };
      }
      if (starters.has(id)) return { home: envelope.elements.length ? envelope : null, via: structureName ? `YOUR ${structureName} STRUCTURE` : 'YOUR STRUCTURE' };
      if (adders.length) return { home: envelope.elements.length ? envelope : null, via: CAPABILITY_BY_ID[adders[0]].verb };
      return { home: null, via: null };
    };
    // Match the snapshot's pages to registry ids by group and label (the snapshot builds them the same way).
    const byKey = new Map(chosen.map((id) => [`${EXPERIENCE_BY_ID[id].group}|${EXPERIENCE_BY_ID[id].label}`, id]));
    let n = 0;
    const groups = snapshot.blueprint.experiences.map((group) => ({
      group: group.group,
      pages: group.items.map((item) => {
        n += 1;
        const id = byKey.get(`${group.group}|${item.label}`);
        const { home, via } = id ? homeOf(id) : { home: null, via: null };
        return { n, group: group.group, label: item.label, depth: item.depth, home, via };
      }),
    }));
    const homes = new Map<string, Home & { count: number }>();
    for (const page of groups.flatMap((g) => g.pages)) {
      if (!page.home) continue;
      const entry = homes.get(page.home.key) ?? { ...page.home, count: 0 };
      entry.count += 1;
      homes.set(page.home.key, entry);
    }
    pages = { total: n, groups, homes: [...homes.values()] };
  }

  /* ── features: the snapshot's capabilities, each traced to its module ── */
  const verbToId = new Map(Object.values(CAPABILITY_BY_ID).map((c) => [c.verb, c.id]));
  const chosenPages = new Set(world ? [] : chosenExperiences(selection, deriveBuildLevel(selection).level).map((c) => c.id));
  const features: FeatureEntry[] = snapshot.blueprint.capabilities.map((cap, i) => {
    const id = verbToId.get(cap.verb) ?? null;
    if (!id) {
      return { n: i + 1, id: null, verb: cap.verb, plain: '', comesWith: cap.comesWith, source: null, module: null, parent: null, bringsAlong: [], addsPages: [], home: null };
    }
    const { module, parent } = moduleFor(id);
    const source: FeatureEntry['source'] = module ? (parent ? 'COMES_WITH' : 'MODULE') : 'STRUCTURE';
    const wing = module ? wingHome(module) : null;
    const home: Home | null = wing
      ? { key: `MODULE-${module}`, label: `THE ${moduleLabel(module!)} MODULE`, elements: wing.elements }
      : coreHome.elements.length
        ? coreHome
        : null;
    const parentId = parent ?? (cap.comesWith ? firstParent(id) : null);
    return {
      n: i + 1,
      id,
      verb: cap.verb,
      plain: CAPABILITY_BY_ID[id].plain,
      comesWith: cap.comesWith,
      source,
      module,
      parent: parentId ? CAPABILITY_BY_ID[parentId].verb : null,
      bringsAlong: CAPABILITY_BY_ID[id].comesWith.filter((c) => effective.includes(c)).map((c) => CAPABILITY_BY_ID[c].verb),
      addsPages: CAPABILITY_BY_ID[id].addsExperiences.filter((e) => chosenPages.has(e)).map((e) => EXPERIENCE_BY_ID[e].label),
      home,
    };
  });

  /* ── structure: every canonical line, in the layer whose geometry it drives ── */
  const lines = structureLines(snapshot.blueprint.lines);
  const pace = spec.pace ?? 'STANDARD';
  const layerDefs: { id: StructureLayerId; label: string; elements: string[]; caption: string; items?: string[] }[] = [
    {
      id: 'FOUNDATION',
      label: 'FOUNDATION',
      elements: only(['main-plinth', 'pav-1', 'pav-2']),
      caption: world
        ? 'A WORLD STANDS ON A WIDER CAMPUS SLAB, WITH PAVILIONS FOR ITS PLACES.'
        : 'ONE CARRARA SLAB: THE GROUND THE WHOLE BUILD STANDS ON.',
    },
    {
      id: 'CORE',
      label: 'CORE',
      elements: coreHome.elements,
      caption: `THE RED ACRYLIC CORE: ${CORE_INCLUDED.map((c) => (world ? c.worldLabel : c.label)).join(' · ')}, INCLUDED IN EVERY BUILD. IT RISES WITH THE BUILD, FROM SIMPLE TO CUSTOM.`,
    },
    {
      id: 'ENVELOPE',
      label: 'ENVELOPE',
      elements: [...envelope.elements, ...massing],
      caption: `THE GLASS ENVELOPE HOLDS THE MAIN EXPERIENCES OF YOUR STRUCTURE.${massing.length ? ` ${massing.length === 1 ? 'ONE VOLUME STEPS' : `${massing.length} VOLUMES STEP`} DOWN FROM IT FOR PROPORTION; THEY ARE NOT FEATURES.` : ''}`,
    },
    {
      id: 'WINGS',
      label: 'WINGS',
      elements: only(wings.filter((id) => !/-(mark|joint)$/.test(id))),
      caption: 'ONE GLASS WING PER CAPABILITY YOU CHOSE IN ROOM 03, EACH HOLDING ITS RED MODULE.',
      items: spec.modules.map(moduleLabel),
    },
    {
      id: 'MATERIAL',
      label: 'MATERIAL',
      elements: only(['mass-a', 'mass-b']),
      caption: 'THE MATERIAL STUDY FROM ROOM 02 STANDS BESIDE THE PLACE. THE GLAZING, ACRYLIC AND STONE FOLLOW THIS SYSTEM.',
    },
    {
      id: 'PACE',
      label: 'PACE',
      elements: paceMarks,
      caption:
        pace === 'EXPEDITED'
          ? 'STEEL MARKS SHOW WHERE PRIORITY SEQUENCES THE WORK. PACE NEVER ADDS SCOPE.'
          : pace === 'FLEXIBLE'
            ? 'STEEL JOINTS SHOW THE PARTS THAT CAN MOVE. PACE NEVER ADDS SCOPE.'
            : 'STANDARD PACE ADDS NOTHING TO THE MODEL. SEE 05 TIMELINE.',
    },
  ];
  const layers: StructureLayer[] = [];
  for (const def of layerDefs) {
    const mine = lines.filter((line) => (LINE_LAYER[line.key] ?? 'OTHER') === def.id);
    const drawn = def.elements.length > 0;
    const layer: StructureLayer = {
      id: def.id,
      n: '',
      label: def.label,
      caption: def.caption,
      lines: drawn ? mine.filter((line) => !NEVER_DRAWN.has(line.key)) : [],
      notDrawn: drawn ? mine.filter((line) => NEVER_DRAWN.has(line.key)) : mine,
      items: def.items ?? [],
      elements: def.elements,
    };
    // A layer with neither geometry nor lines has nothing to inspect (e.g. no pace marks at STANDARD is still shown,
    // because the DELIVERY line belongs to it).
    if (drawn || mine.length) layers.push(layer);
  }
  const other = lines.filter((line) => !LINE_LAYER[line.key]);
  if (other.length) layers.push({ id: 'OTHER', n: '', label: 'ALSO IN THE BLUEPRINT', caption: 'NOT DRAWN IN THE MODEL.', lines: [], notDrawn: other, items: [], elements: [] });
  layers.forEach((layer, i) => (layer.n = `L${i + 1}`));

  /* ── exploded axonometric: layers lift apart, wings and the study spread outward ── */
  const explode: Record<string, [number, number, number]> = {};
  const outward = (el: BuildElement | undefined, dy: number, dx: number): [number, number, number] => [Math.sign(el?.position[0] ?? 0) * dx, dy, 0.08];
  for (const id of coreHome.elements) explode[id] = [0, 0.95, 0.18];
  for (const id of envelope.elements) explode[id] = [0, 0.5, 0];
  for (const id of massing) explode[id] = outward(byId.get(id), 0.5, 0.18);
  spec.modules.forEach((_, i) => {
    for (const id of wingElements(i)) explode[id] = outward(byId.get(`side-${i}`), 0.26, 0.3);
  });
  for (const id of only(['mass-a', 'mass-b'])) explode[id] = [-0.5, 0.12, 0];
  for (const id of only(['core-mark'])) explode[id] = [0, 0.5, 0];
  for (const id of massing) for (const extra of only([`${id}-mark`, `${id}-joint`])) explode[extra] = explode[id];
  for (const id of only(['pav-1', 'pav-2'])) explode[id] = outward(byId.get(id), 0.2, 0.25);

  /* ── timeline: an illustrative assembly order of this structure (not a schedule; no stage has a duration) ── */
  const structurePages = pages ? pages.groups.flatMap((g) => g.pages).filter((p) => p.home?.key === 'ENVELOPE').map((p) => p.label.toUpperCase()) : [];
  const visual = lines.find((line) => line.key === 'EXPRESSION')?.value ?? null;
  const broughtAlong = features.filter((f) => f.source === 'COMES_WITH').length;
  const stages: TimelineStage[] = [
    {
      n: '01',
      label: 'GROUNDWORK',
      caption: 'THE CORE EVERY BUILD INCLUDES.',
      items: CORE_INCLUDED.map((c) => (world ? c.worldLabel : c.label)),
      elements: only(['main-plinth', 'core', 'core-cap']),
    },
    {
      n: '02',
      label: 'DIRECTION',
      caption: 'CREATIVE DIRECTION SETS THE MATERIALS.',
      items: visual ? [visual.toUpperCase()] : [],
      elements: only(['mass-a', 'mass-b']),
    },
    {
      n: '03',
      label: world ? 'MAIN PLACES' : 'MAIN EXPERIENCES',
      caption: world
        ? 'THE ENVELOPE AND ITS PAVILIONS. A WORLD’S PLACES ARE SHAPED AT BLUEPRINT REVIEW.'
        : `${structurePages.length} ${structurePages.length === 1 ? 'PAGE' : 'PAGES'} FROM YOUR STRUCTURE, APPROVED BEFORE THEIR DETAIL VIEWS.`,
      items: structurePages,
      elements: [...envelope.elements, ...massing, ...only(['pav-1', 'pav-2']), ...only(massing.flatMap((id) => [`${id}-mark`, `${id}-joint`]))],
    },
    {
      n: '04',
      label: 'CAPABILITIES',
      caption: `${spec.modules.length} ${spec.modules.length === 1 ? 'CAPABILITY' : 'CAPABILITIES'} FROM ROOM 03${broughtAlong ? `, AND ${broughtAlong} THAT COME WITH THEM` : ''}.`,
      items: spec.modules.map(moduleLabel),
      elements: [...wings, ...only(['core-mark'])],
    },
  ].filter((stage) => stage.elements.length > 0);

  return {
    layers,
    pages,
    core: { label: CORE_INCLUDED.map((c) => (world ? c.worldLabel : c.label)).join(' · '), plain: CORE_INCLUDED[0].plain, home: coreHome },
    features,
    stages,
    explode,
  };
}

/* ─────────────────────────────── inspection states ─────────────────────────────── */

export type InspectMode = 'OVERVIEW' | 'STRUCTURE' | 'PAGES' | 'FEATURES' | 'TIMELINE';

/** A selection inside a section: a layer, a page (`P<n>`), a page group (`G:<group>`), the core, or a feature (`F<n>`). */
export type InspectPick = string | null;

const CLOSE = 0.42;

/** Element ids a selection lights, or null when the selection has no geometry (shown as NOT DRAWN). */
export function pickElements(anatomy: BlueprintAnatomy, mode: InspectMode, pick: InspectPick): string[] | null {
  if (!pick) return null;
  if (mode === 'STRUCTURE') return anatomy.layers.find((l) => l.id === pick)?.elements ?? null;
  if (mode === 'PAGES' && anatomy.pages) {
    if (pick.startsWith('G:')) {
      const group = anatomy.pages.groups.find((g) => g.group === pick.slice(2));
      return group ? [...new Set(group.pages.flatMap((p) => p.home?.elements ?? []))] : null;
    }
    const page = anatomy.pages.groups.flatMap((g) => g.pages).find((p) => `P${p.n}` === pick);
    return page?.home?.elements ?? null;
  }
  if (mode === 'FEATURES') {
    if (pick === 'CORE') return anatomy.core.home.elements;
    return anatomy.features.find((f) => `F${f.n}` === pick)?.home?.elements ?? null;
  }
  return null;
}

/**
 * The inspection a section and its selection put on the stage. OVERVIEW returns nothing: the whole place, as
 * composed. `stage` is the TIMELINE's current stage (null = complete).
 */
export function inspectionFor(anatomy: BlueprintAnatomy, mode: InspectMode, pick: InspectPick, stage: number | null = null): BuildInspection | undefined {
  const picked = pickElements(anatomy, mode, pick);
  const lit = picked && picked.length ? picked : null;
  switch (mode) {
    case 'STRUCTURE':
      return { key: `STRUCTURE:${pick ?? '-'}`, explode: anatomy.explode, lit: lit ?? [], isolate: Boolean(lit), closeness: lit ? CLOSE : 0 };
    case 'PAGES': {
      if (!anatomy.pages) return { key: 'PAGES:WORLD' };
      const all = [...new Set(anatomy.pages.homes.flatMap((h) => h.elements))];
      return { key: `PAGES:${pick ?? '-'}`, lit: lit ?? all, isolate: true, closeness: lit ? CLOSE : 0 };
    }
    case 'FEATURES': {
      const all = [...new Set([...anatomy.core.home.elements, ...anatomy.features.flatMap((f) => f.home?.elements ?? [])])];
      return { key: `FEATURES:${pick ?? '-'}`, lit: lit ?? all, isolate: true, closeness: lit ? CLOSE : 0 };
    }
    case 'TIMELINE': {
      if (stage === null || stage >= anatomy.stages.length) return { key: 'TIMELINE:done' };
      const current = anatomy.stages[stage];
      const future = anatomy.stages.slice(stage + 1).flatMap((s) => s.elements);
      return { key: `TIMELINE:${stage}`, lit: current.elements, future, enter: current.elements };
    }
    default:
      return undefined;
  }
}
