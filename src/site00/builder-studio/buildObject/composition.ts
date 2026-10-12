/**
 * Build Object composition — pure configuration → architecture.
 *
 * The Build Object is a configuration visualization, not a website design. Each studio view arranges the same
 * vocabulary (clear glass, translucent red acrylic, white marble, stone, concrete) from the client's choices, and
 * every choice has its own authored response (see TRANSFORMATION_MATRIX.md):
 *
 *   PLACE      path       → spatial scope: one pavilion · reshaped pair · bespoke cantilever · connected campus
 *   FEEL       direction  → architectural grammar: grid · monolith · layered frames · passage
 *   WORK       modules    → a recognizable module per capability, attached to the core where its toggle sits
 *   PACE       pace       → assembly rhythm (motion) and sequencing marks; never more scope
 *   BLUEPRINT  everything → the resolved location, with an inspection focus per Blueprint section
 *
 * Elements carry stable ids so the renderer moves, grows and retires them instead of swapping pictures.
 */
import type { BuildSpec, FeelVibeId, PacePreferenceId, PlacePathId, WorkModuleId } from '../studioModel';

export type BuildMaterial =
  | 'glass'
  | 'glassTint'
  | 'darkGlass'
  | 'red'
  | 'redSolid'
  | 'marble'
  | 'darkMarble'
  | 'stone'
  | 'travertine'
  | 'concrete'
  | 'steel'
  | 'ghost'
  | 'slate'
  | 'warmMarble'
  | 'hairline'
  | 'figure';

export type BuildElement = {
  id: string;
  material: BuildMaterial;
  /** Width, height, depth. */
  size: [number, number, number];
  /** Center of the box. */
  position: [number, number, number];
  rotationY?: number;
  /** Assembly order (0 first). The renderer staggers entry by it when the composition's motion asks for it. */
  seq?: number;
  /** Blueprint inspection: brought forward in red illumination (the selected layer, page home or feature). */
  lit?: boolean;
  /** Assembles now (grows in with the composition's motion) even though it was already on the stage. */
  enter?: boolean;
};

export type BuildCamera = {
  /** Fallback look-at point; the renderer re-frames on the composition's bounds. */
  target: [number, number, number];
  /** Fallback distance; the renderer fits the composition to the stage instead. */
  distance: number;
  /** Share of the stage the object should fill when fitted (0–1). */
  fill?: number;
  /** Raises the look-at point by this share of the object height, so the object sits lower in the frame. */
  lift?: number;
  /** Degrees around the vertical axis (0 = looking from +Z). */
  azimuth: number;
  /** Degrees above the horizon. */
  elevation: number;
  /** Elements the camera moves toward (Blueprint inspection). The whole object stays the reference framing. */
  focus?: string[];
  /** How far toward `focus` the camera moves: 0 frames the whole object, 1 frames the focus alone. */
  closeness?: number;
};

/** How a composition arrives. Visual pacing only: it never says anything about commercial duration. */
export type BuildMotion = {
  /** Per-element tween length (ms). */
  duration: number;
  /** Delay between assembly steps (ms) — multiplied by each element's `seq`. */
  stagger: number;
  /** Where new elements enter from: grow up from their base, slide in from the side, or settle from above. */
  entry: 'base' | 'lateral' | 'above';
  /** Re-assemble every element (not only new ones) when this composition replaces another. */
  replay: boolean;
};

export type BuildComposition = { key: string; elements: BuildElement[]; camera: BuildCamera; motion: BuildMotion };

export type BuildView = 'place' | 'feel' | 'work' | 'pace' | 'blueprint';

/** Blueprint inspection focus (one per Blueprint section). */
export type BuildFocus = 'OVERVIEW' | 'STRUCTURE' | 'PAGES' | 'FEATURES' | 'TIMELINE';

/**
 * A Blueprint inspection state, computed from the proposal by `anatomy.ts`. Only ids the composition actually has
 * are ever named, so an inspection can light, dim, separate or stage real geometry but never invent any.
 */
export type BuildInspection = {
  /** Identifies the state in the composition key (mode + selection + stage). */
  key: string;
  /** Brought forward in red illumination. */
  lit?: readonly string[];
  /** Dim every element that is not lit to a glass outline (the ground and the figures stay). */
  isolate?: boolean;
  /** Not built yet (timeline): kept in place as a glass outline. */
  future?: readonly string[];
  /** Assemble now: grow in with the composition's motion, in their own order. */
  enter?: readonly string[];
  /** Exploded axonometric: per-element offsets that pull the layers apart. */
  explode?: Readonly<Record<string, readonly [number, number, number]>>;
  /** Move the camera toward the lit elements (0 = the whole object). */
  closeness?: number;
};

/** Material roles a visual direction assigns. */
export type BuildPalette = {
  structure: BuildMaterial;
  accent: BuildMaterial;
  mass: BuildMaterial;
  plinth: BuildMaterial;
  /** Plates shown in the FEEL study, left to right. */
  study: BuildMaterial[];
};

const NEUTRAL: BuildPalette = { structure: 'glass', accent: 'red', mass: 'stone', plinth: 'marble', study: ['glass', 'stone', 'glass', 'red', 'glass', 'marble'] };

/** One palette per FEEL direction (the contract's four: MODERN · BOLD · EDITORIAL · IMMERSIVE). */
export const FEEL_PALETTES: Record<FeelVibeId, BuildPalette> = {
  MODERN: { structure: 'glass', accent: 'red', mass: 'stone', plinth: 'marble', study: ['slate', 'stone', 'glass', 'red', 'glass', 'warmMarble'] },
  BOLD: { structure: 'glassTint', accent: 'redSolid', mass: 'concrete', plinth: 'marble', study: ['redSolid', 'redSolid', 'redSolid', 'darkMarble', 'glass', 'concrete'] },
  EDITORIAL: { structure: 'glass', accent: 'red', mass: 'marble', plinth: 'marble', study: ['marble', 'glass', 'marble', 'red', 'glass', 'stone'] },
  IMMERSIVE: { structure: 'darkGlass', accent: 'red', mass: 'darkMarble', plinth: 'darkMarble', study: ['darkGlass', 'darkGlass', 'darkMarble', 'red', 'darkGlass', 'darkMarble'] },
};

export function paletteFor(feel: FeelVibeId | null): BuildPalette {
  return feel ? FEEL_PALETTES[feel] : NEUTRAL;
}

type Spec = BuildSpec;

const GROUND_LIFT = 0.003;

const box = (
  id: string,
  material: BuildMaterial,
  size: [number, number, number],
  base: [number, number, number],
  rotationY = 0,
  seq?: number,
): BuildElement => ({
  id,
  material,
  size,
  // `base` is the bottom-center of the box; the renderer works in centers. Anything standing on a surface is lifted
  // a hair (3 mm at model scale) so it never shares a plane with it: coplanar faces shimmer on a real GPU.
  position: [base[0], base[1] + size[1] / 2 + (base[1] > 0 ? GROUND_LIFT : 0), base[2]],
  rotationY,
  ...(seq === undefined ? {} : { seq }),
});

const figure = (id: string, x: number, y: number, z: number, scale = 1): BuildElement =>
  box(id, 'figure', [0.07 * scale, 0.5 * scale, 0.07 * scale], [x, y, z]);

/**
 * A portal: two posts and a lintel, `w` wide and `h` tall, facing +Z (or rotated). Used for thresholds and gates.
 * The lintel's base is computed in the rotated frame so frames stay square when turned.
 */
function portal(id: string, material: BuildMaterial, w: number, h: number, t: number, base: [number, number, number], rotationY = 0, seq?: number): BuildElement[] {
  const [x, y, z] = base;
  const cos = Math.cos(rotationY);
  const sin = Math.sin(rotationY);
  const off = (dx: number): [number, number] => [x + dx * cos, z - dx * sin];
  const [lx, lz] = off(-w / 2 + t / 2);
  const [rx, rz] = off(w / 2 - t / 2);
  return [
    box(`${id}-l`, material, [t, h, t], [lx, y, lz], rotationY, seq),
    box(`${id}-r`, material, [t, h, t], [rx, y, rz], rotationY, seq),
    box(`${id}-top`, material, [w, t, t], [x, y + h - t, z], rotationY, seq === undefined ? undefined : seq + 1),
  ];
}

/** A picture frame: four bars around an opening, standing on its lower bar. */
function frame(id: string, material: BuildMaterial, w: number, h: number, t: number, base: [number, number, number], rotationY = 0): BuildElement[] {
  const [x, y, z] = base;
  const cos = Math.cos(rotationY);
  const sin = Math.sin(rotationY);
  const at = (dx: number): [number, number] => [x + dx * cos, z - dx * sin];
  const [lx, lz] = at(-w / 2 + t / 2);
  const [rx, rz] = at(w / 2 - t / 2);
  return [
    box(`${id}-b`, material, [w, t, t], [x, y, z], rotationY),
    box(`${id}-t`, material, [w, t, t], [x, y + h - t, z], rotationY),
    box(`${id}-l`, material, [t, h, t], [lx, y, lz], rotationY),
    box(`${id}-r`, material, [t, h, t], [rx, y, rz], rotationY),
  ];
}

/* ─────────────────────────────── PLACE: spatial scope ─────────────────────────────── */

/**
 * A white wall with arched openings, as drawn inside the reference pavilion: piers, a header band, and stepped
 * haunches cut to a semicircle so each opening reads as a round arch at phone scale.
 */
function archWall(id: string, material: BuildMaterial, w: number, h: number, t: number, base: [number, number, number], openings = 2): BuildElement[] {
  const [x0, y, z] = base;
  const bay = w / openings;
  const pier = bay * 0.22;
  const open = bay - pier;
  const r = open / 2;
  const top = h * 0.88;
  const spring = top - r;
  const STEPS = 5;
  const band = (top - spring) / STEPS;
  const out: BuildElement[] = [];
  for (let i = 0; i <= openings; i += 1) out.push(box(`${id}-pier-${i}`, material, [pier, h, t], [x0 - w / 2 + i * bay, y, z]));
  out.push(box(`${id}-head`, material, [w + pier, h - top, t], [x0, y + top, z]));
  for (let i = 0; i < openings; i += 1) {
    const cx = x0 - w / 2 + (i + 0.5) * bay;
    for (let k = 1; k <= STEPS; k += 1) {
      const dy = k * band;
      const d = r - Math.sqrt(Math.max(0, r * r - dy * dy));
      for (const side of [-1, 1]) {
        out.push(box(`${id}-haunch-${i}-${k}-${side < 0 ? 'l' : 'r'}`, material, [d + 0.001, band, t], [cx + side * (r - d / 2), y + spring + (k - 1) * band, z]));
      }
    }
  }
  return out;
}

/** One thick Carrara slab, as every reference object stands on (about a quarter of the glass height). */
function slab(prefix: string, palette: BuildPalette, w: number, h: number, d: number): { elements: BuildElement[]; top: number } {
  return { elements: [box(`${prefix}-plinth`, palette.plinth, [w, h, d], [0, 0, 0], 0, 0)], top: h };
}

function placeComposition(path: PlacePathId | null, palette: BuildPalette): BuildElement[] {
  const s = palette.structure;
  switch (path) {
    case 'ADVANCED': {
      // An established system reshaped: two interlocking framed volumes joined by a deck, a red acrylic spine
      // running through both.
      const { elements, top: t } = slab('main', palette, 5.2, 0.6, 3.6);
      return [
        ...elements,
        box('vol-a', s, [2.3, 2.7, 2.1], [-0.85, t, 0.1]),
        box('vol-b', s, [1.8, 1.8, 1.7], [1.25, t, -0.3]),
        box('deck', s, [1.6, 0.06, 1.5], [0.45, t + 1.8, -0.1]),
        box('core', palette.accent, [0.75, 3.0, 0.95], [0.35, t, 0.55]),
        box('core-2', palette.accent, [0.3, 0.58, 0.04], [0.35, 0.01, 1.81]),
        box('beam', palette.accent, [2.6, 0.08, 0.08], [0.05, t + 2.7, 0.62]),
        box('wall', palette.mass, [0.1, 2.1, 1.6], [-1.9, t, -0.15]),
        figure('fig-1', -0.6, t, 0.75),
        figure('fig-2', 1.25, t + 1.86, 0.2, 0.95),
      ];
    }
    case 'CUSTOM': {
      // From first principles: rotated, cantilevered volumes and a red frame held in the air.
      const { elements, top: t } = slab('main', palette, 4.9, 0.6, 3.5);
      return [
        ...elements,
        box('vol-a', s, [1.9, 1.6, 1.6], [-0.7, t, 0.25], 0.18),
        box('vol-b', s, [1.6, 1.2, 1.4], [0.6, t + 1.65, -0.1], -0.36),
        box('vol-c', s, [1.0, 2.3, 1.0], [1.4, t, 0.4], 0.52),
        box('core', palette.accent, [0.75, 2.4, 0.4], [-0.15, t + 0.65, 0.6], 0.62),
        box('core-2', palette.accent, [1.8, 0.12, 0.8], [0.6, t + 1.52, -0.05], -0.36),
        ...frame('halo', palette.accent, 1.2, 1.2, 0.07, [-1.0, t + 1.85, -0.55], 0.9),
        box('wall', palette.mass, [0.12, 1.6, 1.4], [-1.75, t, -0.3], 0.18),
        figure('fig-1', 0.1, t, 1.05),
      ];
    }
    case 'WORLD': {
      // A connected environment: pavilions on a campus slab, joined by glass bridges around a red tower.
      const { elements: wide, top: tw } = slab('main', palette, 6.8, 0.55, 5.0);
      return [
        ...wide,
        box('vol-a', s, [1.3, 1.4, 1.2], [-2.1, tw, 0.8]),
        box('vol-b', s, [1.1, 1.15, 1.1], [2.1, tw, 1.05]),
        box('vol-c', s, [1.6, 2.0, 1.3], [0.25, tw, -1.2]),
        box('vol-d', s, [1.0, 0.95, 1.0], [-1.4, tw, -1.4]),
        box('core', palette.accent, [0.7, 3.3, 0.7], [0.2, tw, 0.45]),
        box('bridge-a', s, [1.35, 0.05, 0.36], [-1.05, tw + 1.0, 0.6], -0.12),
        box('bridge-b', s, [1.35, 0.05, 0.36], [1.25, tw + 0.88, 0.75], 0.22),
        box('bridge-c', s, [0.36, 0.05, 1.05], [0.25, tw + 1.3, -0.35]),
        box('path', palette.mass, [5.6, 0.03, 0.24], [0, tw, 1.95]),
        box('wall', palette.mass, [2.4, 0.5, 0.12], [1.4, tw, -2.05]),
        figure('fig-1', -0.75, tw, 1.65),
        figure('fig-2', 1.25, tw, 1.75, 0.95),
        figure('fig-3', -2.0, tw, 1.6, 0.9),
      ];
    }
    case 'SIMPLE':
    default: {
      // One considered pavilion, as drawn: a large framed glass room holding an inner glass chamber and a white
      // partition, a red acrylic volume standing at its front-right corner (its red runs down the slab face), and a
      // figure for scale, on one thick Carrara slab.
      const { elements, top: t } = slab('main', palette, 4.9, 0.62, 3.5);
      return [
        ...elements,
        box('vol-a', s, [3.4, 2.6, 2.6], [-0.1, t, 0.15]),
        box('inner', s, [1.5, 2.2, 1.3], [-0.75, t, -0.2]),
        box('wall', 'travertine', [0.08, 1.95, 1.1], [-1.45, t, -0.3]),
        // White arched wall across the back of the room, as drawn.
        ...archWall('arches', 'travertine', 2.3, 2.15, 0.08, [-0.45, t, -0.92], 2),
        box('core', palette.accent, [0.8, 2.52, 0.95], [1.05, t, 0.85]),
        box('core-2', palette.accent, [0.34, 0.6, 0.04], [1.05, 0.01, 1.77]),
        figure('fig-1', -0.2, t, 0.7),
      ];
    }
  }
}

/* ─────────────────────────────── FEEL: architectural grammar ─────────────────────────────── */

const FEEL_CAMERAS: Record<FeelVibeId | 'NONE', Partial<BuildCamera>> = {
  NONE: { azimuth: -14, elevation: 5 },
  MODERN: { azimuth: -6, elevation: 2, fill: 1.02 },
  BOLD: { azimuth: -26, elevation: 9 },
  EDITORIAL: { azimuth: -6, elevation: 4 },
  IMMERSIVE: { azimuth: -32, elevation: 7, lift: 0.02 },
};

function feelComposition(feel: FeelVibeId | null, palette: BuildPalette): BuildElement[] {
  // Six study materials per direction; pad defensively so a short palette can never yield an undefined material.
  const m: BuildMaterial[] = Array.from({ length: 6 }, (_, i) => palette.study[i] ?? palette.study[i % palette.study.length] ?? 'glass');
  const table = (w: number, d: number, material: BuildMaterial = 'glassTint', rot = 0.32) => [
    box('main-plinth', material, [w, 0.06, d], [0.15, 0, -0.3], rot),
    box('main-step', palette.plinth, [w * 0.92, 0.08, 0.36], [0.0, 0, 0.78], rot),
  ];
  switch (feel) {
    case 'BOLD':
      // Sculptural contrast: three red monoliths of falling height, a cantilevered red slab, one dark mass.
      return [
        ...table(5.0, 2.6, 'marble'),
        box('plate-0', m[0], [1.25, 3.9, 0.55], [-1.2, 0.08, 0.1], 0.32),
        box('plate-1', m[1], [1.05, 2.7, 0.55], [0.15, 0.08, -0.25], 0.32),
        box('plate-2', m[2], [0.95, 1.55, 0.55], [1.35, 0.08, -0.55], 0.32),
        box('plate-3', m[3], [1.6, 0.9, 1.0], [0.55, 0.08, 0.75], 0.32),
        box('plate-4', m[4], [0.06, 2.2, 1.2], [-2.1, 0.08, 0.35], 0.32),
        box('slab', 'redSolid', [2.8, 0.22, 0.7], [-0.45, 3.0, -0.05], 0.32),
        figure('fig-1', 2.15, 0.08, 1.15),
      ];
    case 'EDITORIAL':
      // Layered planes: an asymmetric spread of panels at different depths, held by fine frames and red rules.
      return [
        ...table(5.2, 2.6, 'glassTint', 0.12),
        box('plate-0', m[0], [1.7, 3.2, 0.09], [-1.15, 0.06, -0.7], 0.12),
        box('plate-1', m[1], [1.15, 2.0, 0.04], [-0.35, 0.5, 0.15], 0.12),
        box('plate-2', m[2], [0.85, 2.5, 0.09], [0.85, 0.06, -0.45], 0.12),
        box('plate-3', m[3], [0.05, 3.5, 0.05], [0.25, 0.06, -0.15], 0.12),
        box('plate-4', m[4], [1.25, 1.35, 0.04], [1.55, 1.25, 0.35], 0.12),
        box('rule', 'red', [1.9, 0.05, 0.05], [0.65, 2.85, 0.15], 0.12),
        ...frame('frame-a', 'steel', 1.35, 1.75, 0.04, [-0.4, 0.06, 0.55], 0.12),
        ...frame('frame-b', 'steel', 0.95, 1.2, 0.035, [1.75, 0.06, 0.75], 0.12),
        figure('fig-1', 2.25, 0.06, 1.25),
      ];
    case 'IMMERSIVE': {
      // Spatial enclosure: a passage of thresholds receding into depth, dark walls, a red light at its end.
      const out: BuildElement[] = [
        box('main-plinth', 'darkMarble', [2.0, 0.06, 5.2], [0, 0, -0.9]),
        box('main-step', palette.plinth, [2.0, 0.08, 0.36], [0, 0, 1.85]),
        // Clear walls keep the SITE 00 glass identity; the depth comes from the passage, not from darkness.
        box('plate-0', 'glassTint', [0.06, 2.6, 4.4], [-1.0, 0.06, -0.9]),
        box('plate-1', 'glassTint', [0.06, 2.6, 4.4], [1.0, 0.06, -0.9]),
        box('plate-2', m[0], [2.06, 0.06, 4.4], [0, 2.66, -0.9]),
        box('plate-3', 'red', [1.5, 2.3, 0.05], [0, 0.06, -3.05]),
        box('plate-4', m[2], [0.06, 1.8, 1.4], [-1.55, 0.06, 0.9]),
      ];
      [0.95, 0.05, -0.85, -1.75].forEach((z, i) => out.push(...portal(`gate-${i}`, i === 3 ? 'red' : 'steel', 2.14, 2.74, 0.07, [0, 0.06, z])));
      out.push(figure('fig-1', 0.15, 0.06, -0.4, 0.95));
      return out;
    }
    case 'MODERN':
    default: {
      // As drawn: a deck of tall panels hung in the air on a receding diagonal — charcoal slate, grey stone, glass,
      // the tallest in red acrylic, glass, warm marble — over a glass shelf, before a glass screen, with two visitors
      // standing beneath.
      // Panels fan at ~32° to the view so every sheet reads on its own, each one further back than the last.
      const P: [BuildMaterial, number, number, number, number][] = [
        [m[0], -1.9, 0.95, 2.9, 1.05],
        [m[1], -1.2, 0.55, 3.3, 0.85],
        [m[2], -0.5, 0.15, 3.0, 1.0],
        [m[3], 0.2, -0.25, 3.75, 0.72],
        [m[4], 0.9, -0.65, 3.05, 1.0],
        [m[5], 1.6, -1.05, 3.25, 0.9],
      ];
      return [
        ...P.map(([material, x, z, h, y], i) => {
          const thin = material.includes('lass') || material.startsWith('red');
          return box(`plate-${i}`, material, [1.2, h, thin ? 0.05 : 0.07], [x, y, z], -0.62, i);
        }),
        box('plate-shelf', 'glass', [4.8, 0.04, 1.2], [-0.15, 0.6, -0.05], -0.5, 6),
        box('plate-screen', 'glass', [5.4, 4.4, 0.03], [0.3, 0, -1.9], -0.5, 0),
        figure('fig-1', 1.45, 0, 1.6, 0.95),
        figure('fig-2', 1.78, 0, 1.45, 0.92),
      ];
    }
  }
}

/* ─────────────────────────────── WORK: capability modules ─────────────────────────────── */

const CORE_FLOORS = 6;
const FLOOR_H = 0.6;
/** Top of the stepped WORK base. */
const WORK_BASE = 0.52;

/** The core floors of the WORK tower (kept for tests and the Blueprint thumbnails). */
export function towerFloors(modules: readonly WorkModuleId[]): { id: string; module: WorkModuleId | null }[] {
  void modules;
  return Array.from({ length: CORE_FLOORS }, (_, i) => ({ id: `floor-core-${i}`, module: null }));
}

/** Floor shift, as drawn: each floor sits slightly off the one below. */
const FLOOR_SHIFT: [number, number][] = [[0, 0], [0.12, -0.08], [-0.1, 0.06], [0.08, -0.05], [-0.07, 0.07], [0.1, 0]];

/**
 * Each capability adds a recognizable module where its toggle sits (top: PAGES · BLOG, middle: SHOP · MEMBER AREA,
 * ground: BOOKING · PORTAL), cantilevered from the tower face on that side. These are visual metaphors for what the
 * capability adds to the place, not literal backend functions.
 */
function workModule(id: WorkModuleId, t: number, palette: BuildPalette): BuildElement[] {
  const a = palette.accent;
  const level = (n: number) => t + n * FLOOR_H;
  switch (id) {
    case 'PAGES': {
      // Spatial divisions: a stack of floor plates cantilevered from the upper floors, the top one red.
      const y = level(4) + 0.04;
      const out: BuildElement[] = [];
      for (let i = 0; i < 4; i += 1) out.push(box(`m-pages-${i}`, i === 3 ? a : palette.structure, [0.95, 0.03, 0.95], [-1.45, y + i * 0.17, 0.05], 0, i));
      out.push(box('m-pages-spine', palette.plinth, [0.05, 0.56, 0.9], [-1.95, y, 0.05], 0, 0));
      return out;
    }
    case 'BLOG': {
      // An editorial rack: thin marble leaves on a ledge, the newest one red.
      const y = level(4) + 0.04;
      const out: BuildElement[] = [box('m-blog-ledge', palette.plinth, [1.05, 0.06, 0.7], [1.45, y, -0.05], 0, 0)];
      for (let i = 0; i < 6; i += 1) out.push(box(`m-blog-${i}`, i === 5 ? a : 'marble', [0.035, 0.56 - i * 0.03, 0.6], [1.02 + i * 0.17, y + 0.06, -0.05], 0, i + 1));
      return out;
    }
    case 'SHOP': {
      // A display gallery: a glass vitrine on a stone base, red objects on pedestals inside.
      const y = level(2);
      return [
        box('m-shop-base', palette.plinth, [0.95, 0.1, 0.7], [-1.45, y, 0.25], 0, 0),
        box('m-shop-case', palette.structure, [0.95, 0.5, 0.7], [-1.45, y + 0.1, 0.25], 0, 1),
        box('m-shop-item-0', a, [0.14, 0.14, 0.14], [-1.72, y + 0.1, 0.25], 0, 2),
        box('m-shop-item-1', a, [0.12, 0.26, 0.12], [-1.45, y + 0.1, 0.3], 0, 2),
        box('m-shop-item-2', a, [0.16, 0.09, 0.16], [-1.18, y + 0.1, 0.2], 0, 2),
      ];
    }
    case 'MEMBER_AREA': {
      // An enclosed chamber: a closed dark-glass room with a red threshold — entry is by invitation.
      const y = level(2);
      return [
        box('m-member-room', 'darkGlass', [0.72, 0.58, 0.8], [1.22, y, 0.1], 0, 0),
        ...portal('m-member-door', a, 0.36, 0.5, 0.045, [1.22, y, 0.52], 0, 1),
      ];
    }
    case 'BOOKING': {
      // Timed access: a colonnade of slots under a red lintel, leading to the entrance.
      const out: BuildElement[] = [];
      for (let i = 0; i < 4; i += 1) {
        out.push(box(`m-booking-post-${i}`, 'marble', [0.08, 1.05, 0.08], [-1.3, t, 1.1 - i * 0.42], 0, i));
        out.push(box(`m-booking-post-${i}-b`, 'marble', [0.08, 1.05, 0.08], [-1.8, t, 1.1 - i * 0.42], 0, i));
      }
      out.push(box('m-booking-lintel', a, [0.6, 0.09, 1.4], [-1.55, t + 1.05, 0.47], 0, 4));
      out.push(box('m-booking-floor', a, [0.46, 0.025, 1.4], [-1.55, t, 0.47], 0, 0));
      return out;
    }
    case 'PORTAL': {
      // A deeper threshold: red frames receding into the base of the structure.
      return [0, 1, 2].flatMap((i) => portal(`m-portal-${i}`, i === 0 ? a : 'steel', 0.85 - i * 0.16, 1.05 - i * 0.18, 0.055, [1.4 - i * 0.26, t, 0.85 - i * 0.28], -0.55, i));
    }
  }
}

function workComposition(spec: Spec, palette: BuildPalette): BuildElement[] {
  // As drawn: a stacked tower — glass floors on Carrara slabs, each shifted off the one below, red acrylic rooms
  // inside — on a stepped Carrara base, with drafting lines running out toward the capability toggles.
  const t = WORK_BASE;
  const out: BuildElement[] = [
    box('main-plinth', palette.plinth, [2.9, 0.34, 2.55], [0, 0, 0], 0, 0),
    box('main-step', palette.plinth, [2.3, 0.18, 2.0], [0, 0.34, 0], 0, 1),
  ];
  for (let i = 0; i < CORE_FLOORS; i += 1) {
    const y = t + i * FLOOR_H;
    const [dx, dz] = FLOOR_SHIFT[i];
    const w = i % 2 ? 1.62 : 1.78;
    out.push(box(`floor-core-${i}-shell`, palette.structure, [w, FLOOR_H - 0.07, 1.5], [dx, y, dz], 0, i + 2));
    out.push(box(`floor-core-${i}-slab`, palette.plinth, [w + 0.14, 0.07, 1.64], [dx, y + FLOOR_H - 0.07, dz], 0, i + 2));
  }
  // The red acrylic: a shaft through the lower floors, a red room mid-tower and a red slab near the top.
  out.push(box('core', palette.accent, [0.55, FLOOR_H * 3 - 0.1, 0.5], [0.15, t, 0.3], 0, 2));
  out.push(box('core-room', palette.accent, [0.7, FLOOR_H - 0.16, 0.6], [0.2, t + FLOOR_H * 3 + 0.02, 0.25], 0, 5));
  out.push(box('core-slab', palette.accent, [1.05, 0.05, 0.95], [-0.1, t + FLOOR_H * 5 - 0.03, 0.1], 0, 7));
  // Drafting lines: the tower's corner verticals carried past it, and the three toggle levels carried out.
  const H = t + CORE_FLOORS * FLOOR_H;
  for (const [i, [x, z]] of ([[-0.95, 0.8], [0.95, 0.8], [-0.95, -0.8], [0.95, -0.8]] as const).entries()) {
    out.push(box(`line-v-${i}`, 'hairline', [0.012, H + 0.9, 0.012], [x, 0, z], 0, 0));
  }
  for (const [i, n] of [4, 2, 0].entries()) {
    out.push(box(`line-h-${i}`, 'hairline', [4.8, 0.012, 0.012], [0, t + n * FLOOR_H + 0.3, 0.8], 0, 0));
  }
  for (const id of spec.modules) out.push(...workModule(id, t, palette));
  out.push(figure('fig-1', -0.35, t, 0.55, 0.85));
  return out;
}

/* ─────────────────────────────── PACE / BLUEPRINT: the resolved structure ─────────────────────────────── */

const PACE_MOTION: Record<PacePreferenceId, BuildMotion> = {
  // Measured progression: floor by floor from the ground up.
  STANDARD: { duration: 620, stagger: 85, entry: 'base', replay: true },
  // Immediate assembly: everything arrives almost together, quickly.
  EXPEDITED: { duration: 340, stagger: 12, entry: 'above', replay: true },
  // Modular: parts slide in from the sides at a relaxed rhythm.
  FLEXIBLE: { duration: 860, stagger: 105, entry: 'lateral', replay: true },
};

function assembled(spec: Spec, palette: BuildPalette, resolved: boolean): BuildElement[] {
  // As drawn (PACE and the Blueprint): a glass envelope with a tall red acrylic core and a lower red wing, glass
  // volumes stepping down on either side (one per capability, plus two), grey veined stone slabs standing at the
  // left, on one long thick Carrara slab.
  const world = spec.path === 'WORLD';
  const pace: PacePreferenceId = spec.pace ?? 'STANDARD';
  const flexible = pace === 'FLEXIBLE';
  const spread = flexible ? 1.18 : 1;
  const coreH = spec.path === 'CUSTOM' ? 3.4 : spec.path === 'ADVANCED' ? 3.1 : 2.8;
  const { elements, top: t } = slab('main', palette, (world ? 7.4 : 6.6) * (resolved ? 1.05 : 1), resolved ? 0.6 : 0.5, world ? 4.4 : 3.4);
  const s = palette.structure;
  const out: BuildElement[] = [...elements];
  out.push(box('vol-a', s, [2.5, coreH + 0.35, 2.1], [0.05, t, -0.25], 0, 2));
  out.push(box('core', palette.accent, [0.95, coreH + 0.5, 0.85], [0.3, t, 0.45], 0, 3));
  out.push(box('core-cap', palette.accent, [0.8, coreH * 0.42, 0.75], [-0.5, t, 0.75], 0, 4));
  // Side volumes: one per selected capability, plus two, stepping down away from the core.
  const sides = Math.min(spec.modules.length + 2, 6);
  for (let i = 0; i < sides; i += 1) {
    const left = i % 2 === 0;
    const rank = Math.floor(i / 2);
    const h = Math.max(0.9, coreH - 0.55 - rank * 0.6);
    const x = (left ? -1 : 1) * (1.65 + rank * 0.82) * spread;
    const z = (left ? 0.15 : -0.35) + rank * 0.22;
    out.push(box(`side-${i}`, s, [1.05, h, 1.45], [x, t, z], 0, 5 + rank));
    if (i < spec.modules.length) out.push(box(`side-${i}-module`, palette.accent, [0.34, h * 0.42, 0.4], [x, t, z + 0.3], 0, 6 + rank));
    // EXPEDITED: sequencing marks — a steel cap on each volume as it is reached. Pacing, not scope: red stays
    // reserved for capabilities, so priority never reads as more product.
    if (pace === 'EXPEDITED') out.push(box(`side-${i}-mark`, 'steel', [1.07, 0.03, 1.47], [x, t + h, z], 0, 6 + rank));
    // FLEXIBLE: a visible joint where each module meets the plinth — parts that can move.
    if (flexible) out.push(box(`side-${i}-joint`, 'steel', [1.13, 0.04, 1.53], [x, t, z], 0, 5 + rank));
  }
  // The Blueprint stands grey veined stone slabs at the left; while pacing, those places are smoky glass.
  const mass: BuildMaterial = resolved ? 'stone' : 'glassTint';
  out.push(box('mass-a', mass, [resolved ? 0.32 : 0.9, coreH * 0.95, 1.35], [-2.75 * spread, t, -0.35], 0, 4));
  out.push(box('mass-b', mass, [resolved ? 0.3 : 0.8, coreH * 0.72, 1.05], [-3.15 * spread, t, 0.3], 0, 4));
  if (pace === 'EXPEDITED') out.push(box('core-mark', 'steel', [2.52, 0.03, 2.12], [0.05, t + coreH + 0.38, -0.25], 0, 5));
  if (world) {
    out.push(box('pav-1', s, [0.9, 0.9, 0.9], [-2.9 * spread, t, 1.45], 0, 8));
    out.push(box('pav-2', s, [0.8, 1.1, 0.8], [2.9 * spread, t, 1.35], 0, 8));
  }
  out.push(figure('fig-1', -0.95, t, 0.95));
  if (resolved) out.push(figure('fig-2', 0.95, t, 1.25, 0.96));
  return out;
}

/** Blueprint inspection: each section brings its part of the structure forward and ghosts the rest. */
function focusElements(elements: BuildElement[], focus: BuildFocus): BuildElement[] {
  if (focus === 'OVERVIEW' || focus === 'TIMELINE') return elements;
  const isGround = (el: BuildElement) => el.id.startsWith('main-') || el.material === 'figure';
  const isRed = (el: BuildElement) => el.material === 'red' || el.material === 'redSolid';
  const isPage = (el: BuildElement) => /^side-\d+$|^pav-/.test(el.id);
  const isVolume = (el: BuildElement) => /^vol-|^side-\d+$|^pav-|^mass-/.test(el.id);
  const ghost = (el: BuildElement): BuildElement => ({ ...el, material: 'ghost' });
  const lit = (el: BuildElement): BuildElement => (el.material === 'glass' ? { ...el, material: 'glassTint' } : el);
  return elements.map((el) => {
    if (isGround(el)) return el;
    switch (focus) {
      // The architecture itself: volumes and masses held forward, every capability set aside.
      case 'STRUCTURE':
        return isRed(el) ? ghost(el) : isVolume(el) ? lit(el) : el;
      // The pages and places: the side volumes, nothing else.
      case 'PAGES':
        return isPage(el) ? lit(el) : ghost(el);
      // The capabilities: the red core and modules alone.
      case 'FEATURES':
        return isRed(el) ? el : ghost(el);
      default:
        return el;
    }
  });
}

/** The ground and the figures are context: an inspection never dims, lights or stages them. */
const isContext = (el: BuildElement) => el.id.startsWith('main-') || el.material === 'figure';

/**
 * Applies a Blueprint inspection: lit elements keep their material and gain red illumination; with `isolate` the
 * rest dims to a glass outline; `future` elements stand as outlines; `enter` elements grow in, in their own order
 * (renumbered from 0 so a later stage does not wait for the earlier ones); `explode` pulls layers apart.
 */
function inspectElements(elements: BuildElement[], inspect: BuildInspection): BuildElement[] {
  const lit = new Set(inspect.lit ?? []);
  const future = new Set(inspect.future ?? []);
  const enter = new Set(inspect.enter ?? []);
  const entering = elements.filter((el) => enter.has(el.id));
  const first = entering.length ? Math.min(...entering.map((el) => el.seq ?? 0)) : 0;
  return elements.map((el) => {
    if (isContext(el)) return el;
    const out: BuildElement = { ...el };
    const offset = inspect.explode?.[el.id];
    if (offset) out.position = [el.position[0] + offset[0], el.position[1] + offset[1], el.position[2] + offset[2]];
    if (future.has(el.id) || (inspect.isolate && !lit.has(el.id))) out.material = 'ghost';
    else if (lit.has(el.id)) out.lit = true;
    if (enter.has(el.id)) {
      out.enter = true;
      out.seq = (el.seq ?? 0) - first;
    }
    return out;
  });
}

/* ─────────────────────────────── compose ─────────────────────────────── */

const CAMERAS: Record<BuildView, BuildCamera> = {
  place: { target: [0, 1.45, 0], distance: 9.6, azimuth: -17, elevation: 11, fill: 1.1, lift: 0 },
  feel: { target: [0, 1.55, 0], distance: 9.0, azimuth: -14, elevation: 5, fill: 0.96, lift: 0.04 },
  // Narrower fill so the capability modules stay clear of the toggles at the stage edges.
  work: { target: [0, 1.6, 0], distance: 10.2, azimuth: -22, elevation: 13, fill: 0.9 },
  pace: { target: [0, 1.75, 0], distance: 11.0, azimuth: -24, elevation: 11, fill: 1.06, lift: 0.02 },
  blueprint: { target: [0, 1.6, 0], distance: 10.6, azimuth: -26, elevation: 9, fill: 1.05, lift: 0.04 },
};

const DEFAULT_MOTION: BuildMotion = { duration: 760, stagger: 0, entry: 'base', replay: false };

/** Motion of an inspection change: the object re-lights, separates or turns; nothing re-assembles but `enter`. */
const INSPECT_MOTION: BuildMotion = { duration: 680, stagger: 0, entry: 'base', replay: false };

export function compose(view: BuildView, spec: Spec, options: { focus?: BuildFocus; inspect?: BuildInspection } = {}): BuildComposition {
  const palette = paletteFor(spec.feel);
  let elements: BuildElement[];
  let motion: BuildMotion = DEFAULT_MOTION;
  const camera: BuildCamera = { ...CAMERAS[view] };
  const focus = options.focus ?? 'OVERVIEW';
  const inspect = view === 'blueprint' ? options.inspect : undefined;
  switch (view) {
    case 'place':
      elements = placeComposition(spec.path, palette);
      if (spec.path === 'WORLD') camera.distance += 1.6;
      break;
    case 'feel':
      elements = feelComposition(spec.feel, palette);
      Object.assign(camera, FEEL_CAMERAS[spec.feel ?? 'NONE']);
      motion = { duration: 820, stagger: 30, entry: 'base', replay: false };
      break;
    case 'work':
      elements = workComposition(spec, palette);
      motion = { duration: 620, stagger: 60, entry: 'lateral', replay: false };
      break;
    case 'pace':
      elements = assembled(spec, palette, false);
      motion = PACE_MOTION[spec.pace ?? 'STANDARD'];
      break;
    case 'blueprint':
      if (spec.path === 'WORLD') camera.distance += 1.8;
      if (inspect) {
        // An inspection binds the section's selection to real geometry (see anatomy.ts).
        elements = inspectElements(assembled(spec, palette, true), inspect);
        const lit = elements.filter((el) => el.lit).map((el) => el.id);
        if (lit.length && inspect.closeness) {
          camera.focus = lit;
          camera.closeness = inspect.closeness;
        }
        // Stages assemble in the chosen pace's rhythm (visual pacing only, never a duration).
        motion = inspect.enter?.length ? { ...PACE_MOTION[spec.pace ?? 'STANDARD'], replay: false } : INSPECT_MOTION;
        break;
      }
      elements = focusElements(assembled(spec, palette, true), focus);
      // The timeline section replays the assembly in production order at the chosen pace.
      motion = focus === 'TIMELINE' ? PACE_MOTION[spec.pace ?? 'STANDARD'] : { ...DEFAULT_MOTION, duration: 520 };
      break;
  }
  const base = `${view}|${spec.path ?? '-'}|${spec.feel ?? '-'}|${[...spec.modules].sort().join(',')}|${spec.pace ?? '-'}`;
  const suffix = inspect ? `|${inspect.key}` : view === 'blueprint' && focus !== 'OVERVIEW' ? `|${focus}` : '';
  return { key: base + suffix, elements, camera, motion };
}

/** Element ids of the resolved Blueprint structure, so inspections can only ever name geometry that exists. */
export function blueprintElements(spec: Spec): BuildElement[] {
  return assembled(spec, paletteFor(spec.feel), true);
}
