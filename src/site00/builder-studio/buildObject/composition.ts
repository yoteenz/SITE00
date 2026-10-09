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
  MODERN: { structure: 'glass', accent: 'red', mass: 'stone', plinth: 'marble', study: ['concrete', 'glass', 'stone', 'red', 'glass', 'marble'] },
  BOLD: { structure: 'glassTint', accent: 'redSolid', mass: 'concrete', plinth: 'marble', study: ['redSolid', 'redSolid', 'redSolid', 'darkMarble', 'glass', 'concrete'] },
  EDITORIAL: { structure: 'glass', accent: 'red', mass: 'marble', plinth: 'marble', study: ['marble', 'glass', 'marble', 'red', 'glass', 'stone'] },
  IMMERSIVE: { structure: 'darkGlass', accent: 'red', mass: 'darkMarble', plinth: 'darkMarble', study: ['darkGlass', 'darkGlass', 'darkMarble', 'red', 'darkGlass', 'darkMarble'] },
};

export function paletteFor(feel: FeelVibeId | null): BuildPalette {
  return feel ? FEEL_PALETTES[feel] : NEUTRAL;
}

type Spec = BuildSpec;

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
  // `base` is the bottom-center of the box; the renderer works in centers.
  position: [base[0], base[1] + size[1] / 2, base[2]],
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

/** A stepped plinth: a broad marble slab with a thinner top step, as in the references. */
function plinth(prefix: string, palette: BuildPalette, w: number, d: number): { elements: BuildElement[]; top: number } {
  return {
    elements: [
      box(`${prefix}-plinth`, palette.plinth, [w, 0.42, d], [0, 0, 0], 0, 0),
      box(`${prefix}-step`, palette.plinth, [w * 0.88, 0.12, d * 0.86], [0, 0.42, 0], 0, 1),
    ],
    top: 0.54,
  };
}

/* ─────────────────────────────── PLACE: spatial scope ─────────────────────────────── */

function placeComposition(path: PlacePathId | null, palette: BuildPalette): BuildElement[] {
  const s = palette.structure;
  switch (path) {
    case 'ADVANCED': {
      // An established system reshaped: two interlocking volumes joined by a deck, a red spine running through both.
      const { elements, top: t } = plinth('main', palette, 4.9, 3.5);
      return [
        ...elements,
        box('vol-a', s, [2.0, 2.6, 1.8], [-0.75, t, 0.15]),
        box('vol-b', s, [1.6, 1.7, 1.5], [1.15, t, -0.3]),
        box('deck', s, [1.5, 0.06, 1.35], [0.45, t + 1.7, -0.05]),
        box('core', palette.accent, [0.85, 2.95, 0.1], [0.3, t, 0.5]),
        box('core-2', palette.accent, [0.1, 2.2, 0.95], [0.9, t, 0.0]),
        box('beam', palette.accent, [2.6, 0.08, 0.08], [0.05, t + 2.62, 0.62]),
        box('wall', palette.mass, [0.12, 2.0, 1.6], [-1.85, t, -0.15]),
        figure('fig-1', -0.6, t, 0.85),
        figure('fig-2', 1.15, t + 1.76, 0.2, 0.95),
      ];
    }
    case 'CUSTOM': {
      // From first principles: rotated, cantilevered volumes and a red frame held in the air.
      const { elements, top: t } = plinth('main', palette, 4.6, 3.4);
      return [
        ...elements,
        box('vol-a', s, [1.7, 1.5, 1.5], [-0.65, t, 0.25], 0.18),
        box('vol-b', s, [1.45, 1.1, 1.3], [0.6, t + 1.55, -0.1], -0.36),
        box('vol-c', s, [0.95, 2.1, 0.95], [1.3, t, 0.4], 0.52),
        box('core', palette.accent, [0.7, 2.3, 0.1], [-0.2, t + 0.65, 0.6], 0.62),
        box('core-2', palette.accent, [1.7, 0.1, 0.72], [0.6, t + 1.45, -0.05], -0.36),
        ...frame('halo', palette.accent, 1.15, 1.15, 0.07, [-0.95, t + 1.75, -0.55], 0.9),
        box('wall', palette.mass, [0.14, 1.5, 1.3], [-1.65, t, -0.3], 0.18),
        figure('fig-1', 0.1, t, 1.05),
      ];
    }
    case 'WORLD': {
      // A connected environment: pavilions on a campus plinth, joined by glass bridges around a red tower.
      const { elements: wide, top: tw } = plinth('main', palette, 6.6, 4.8);
      return [
        ...wide,
        box('vol-a', s, [1.2, 1.3, 1.1], [-2.05, tw, 0.75]),
        box('vol-b', s, [1.0, 1.05, 1.0], [2.05, tw, 1.0]),
        box('vol-c', s, [1.45, 1.85, 1.2], [0.25, tw, -1.15]),
        box('vol-d', s, [0.95, 0.85, 0.95], [-1.35, tw, -1.35]),
        box('core', palette.accent, [0.55, 3.1, 0.55], [0.2, tw, 0.45]),
        box('bridge-a', s, [1.35, 0.05, 0.36], [-1.05, tw + 0.95, 0.6], -0.12),
        box('bridge-b', s, [1.35, 0.05, 0.36], [1.25, tw + 0.82, 0.75], 0.22),
        box('bridge-c', s, [0.36, 0.05, 1.05], [0.25, tw + 1.25, -0.35]),
        box('path', palette.mass, [5.4, 0.03, 0.22], [0, tw, 1.85]),
        box('wall', palette.mass, [2.4, 0.5, 0.12], [1.4, tw, -1.95]),
        figure('fig-1', -0.75, tw, 1.65),
        figure('fig-2', 1.25, tw, 1.75, 0.95),
        figure('fig-3', -2.0, tw, 1.55, 0.9),
      ];
    }
    case 'SIMPLE':
    default: {
      // One considered pavilion: a single glass volume, a red core plane and a stone wall.
      const { elements, top: t } = plinth('main', palette, 4.4, 3.3);
      return [
        ...elements,
        box('vol-a', s, [2.7, 2.35, 2.1], [-0.25, t, 0.05]),
        box('inner', s, [0.06, 2.3, 1.7], [-0.7, t, 0.05]),
        box('wall', palette.mass, [0.08, 1.9, 1.1], [-1.3, t, -0.35]),
        box('wall-2', palette.mass, [0.9, 1.9, 0.08], [-0.9, t, -0.85]),
        box('core', palette.accent, [0.95, 2.6, 0.1], [0.6, t, 0.62]),
        box('core-2', palette.accent, [0.1, 2.6, 1.3], [1.08, t, -0.05]),
        figure('fig-1', -0.95, t, 0.5),
      ];
    }
  }
}

/* ─────────────────────────────── FEEL: architectural grammar ─────────────────────────────── */

const FEEL_CAMERAS: Record<FeelVibeId | 'NONE', Partial<BuildCamera>> = {
  NONE: { azimuth: -14, elevation: 5 },
  MODERN: { azimuth: -16, elevation: 6 },
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
      // Controlled geometry: a fanned sequence of parallel plates at one strict interval, each lifted off the
      // ground on the same datum, stone and glass alternating around a single red plate.
      const heights = [3.0, 3.25, 3.1, 3.35, 3.05, 2.85];
      return [
        // The plinth and datum run along the line of the plates (0.5 rad), so every edge in the study is parallel.
        ...table(5.0, 2.4, 'glassTint', 0.5),
        ...m.map((material, i) => {
          const thin = material.includes('lass') || material.startsWith('red');
          return box(`plate-${i}`, material, [1.2, heights[i], thin ? 0.05 : 0.09], [-1.75 + i * 0.66, 0.42, 0.6 - i * 0.36], 0.82, i);
        }),
        box('plate-datum', 'glassTint', [4.5, 0.04, 1.1], [-0.1, 0.38, -0.3], 0.5),
        figure('fig-1', 2.05, 0.06, 1.45),
        figure('fig-2', 2.3, 0.06, 1.3, 0.95),
      ];
    }
  }
}

/* ─────────────────────────────── WORK: capability modules ─────────────────────────────── */

const CORE_FLOORS = 4;
const FLOOR_H = 0.58;

/** The core floors of the WORK tower (kept for tests and the Blueprint thumbnails). */
export function towerFloors(modules: readonly WorkModuleId[]): { id: string; module: WorkModuleId | null }[] {
  void modules;
  return Array.from({ length: CORE_FLOORS }, (_, i) => ({ id: `floor-core-${i}`, module: null }));
}

/**
 * Each capability adds a recognizable module where its toggle sits (top: PAGES · BLOG, middle: SHOP · MEMBER AREA,
 * ground: BOOKING · PORTAL). These are visual metaphors for what the capability adds to the place, not literal
 * backend functions.
 */
function workModule(id: WorkModuleId, t: number, palette: BuildPalette): BuildElement[] {
  const a = palette.accent;
  const level = (n: number) => t + n * FLOOR_H;
  switch (id) {
    case 'PAGES': {
      // Spatial divisions: a stack of floor plates cantilevered from the upper floors.
      const y = level(2) + 0.05;
      const out: BuildElement[] = [];
      for (let i = 0; i < 4; i += 1) out.push(box(`m-pages-${i}`, i === 3 ? a : palette.structure, [1.05, 0.03, 0.95], [-1.45, y + i * 0.2, 0.05], 0, i));
      out.push(box('m-pages-spine', palette.mass, [0.05, 0.66, 0.9], [-1.95, y, 0.05], 0, 0));
      return out;
    }
    case 'BLOG': {
      // An editorial rack: thin marble leaves on a ledge, the newest one red.
      const y = level(2) + 0.05;
      const out: BuildElement[] = [box('m-blog-ledge', palette.mass, [1.2, 0.06, 0.72], [1.5, y, -0.05], 0, 0)];
      for (let i = 0; i < 6; i += 1) out.push(box(`m-blog-${i}`, i === 5 ? a : 'marble', [0.04, 0.95 - i * 0.05, 0.62], [1.0 + i * 0.2, y + 0.06, -0.05], 0, i + 1));
      return out;
    }
    case 'SHOP': {
      // A display gallery: a glass vitrine on a stone base, red objects on pedestals inside.
      const y = level(1);
      return [
        box('m-shop-base', palette.mass, [1.05, 0.12, 0.7], [-1.5, y, 0.25], 0, 0),
        box('m-shop-case', palette.structure, [1.05, 0.62, 0.7], [-1.5, y + 0.12, 0.25], 0, 1),
        box('m-shop-item-0', a, [0.16, 0.16, 0.16], [-1.8, y + 0.12, 0.25], 0, 2),
        box('m-shop-item-1', a, [0.14, 0.3, 0.14], [-1.5, y + 0.12, 0.3], 0, 2),
        box('m-shop-item-2', a, [0.18, 0.1, 0.18], [-1.2, y + 0.12, 0.2], 0, 2),
      ];
    }
    case 'MEMBER_AREA': {
      // An enclosed chamber: a closed dark-glass room with a red threshold — entry is by invitation.
      const y = level(1);
      return [
        box('m-member-room', 'darkGlass', [0.84, 0.72, 0.85], [1.38, y, 0.1], 0, 0),
        ...portal('m-member-door', a, 0.42, 0.6, 0.05, [1.38, y, 0.56], 0, 1),
      ];
    }
    case 'BOOKING': {
      // Timed access: a colonnade of slots under a red lintel, leading to the entrance.
      const out: BuildElement[] = [];
      for (let i = 0; i < 4; i += 1) {
        out.push(box(`m-booking-post-${i}`, 'marble', [0.09, 1.3, 0.09], [-1.3, t, 1.25 - i * 0.48], 0, i));
        out.push(box(`m-booking-post-${i}-b`, 'marble', [0.09, 1.3, 0.09], [-1.85, t, 1.25 - i * 0.48], 0, i));
      }
      out.push(box('m-booking-lintel', a, [0.66, 0.1, 1.6], [-1.575, t + 1.3, 0.53], 0, 4));
      out.push(box('m-booking-floor', a, [0.5, 0.025, 1.6], [-1.575, t, 0.53], 0, 0));
      return out;
    }
    case 'PORTAL': {
      // A deeper threshold: red frames receding into the base of the structure.
      return [0, 1, 2].flatMap((i) => portal(`m-portal-${i}`, i === 0 ? a : 'steel', 0.95 - i * 0.18, 1.25 - i * 0.22, 0.06, [1.45 - i * 0.3, t, 0.95 - i * 0.32], -0.55, i));
    }
  }
}

function workComposition(spec: Spec, palette: BuildPalette): BuildElement[] {
  const { elements, top: t } = plinth('main', palette, 4.6, 3.0);
  const out: BuildElement[] = [...elements];
  for (let i = 0; i < CORE_FLOORS; i += 1) {
    const y = t + i * FLOOR_H;
    const dx = [0, 0.1, -0.08, 0.06][i];
    out.push(box(`floor-core-${i}-shell`, palette.structure, [1.6, FLOOR_H - 0.05, 1.45], [dx, y, 0], 0, i + 2));
    out.push(box(`floor-core-${i}-slab`, palette.mass === 'steel' ? 'concrete' : 'stone', [1.72, 0.05, 1.57], [dx, y + FLOOR_H - 0.05, 0], 0, i + 2));
  }
  out.push(box('core', palette.accent, [0.5, CORE_FLOORS * FLOOR_H - 0.1, 0.5], [0.2, t, 0.25], 0, 2));
  for (const id of spec.modules) out.push(...workModule(id, t, palette));
  out.push(figure('fig-1', -0.25, t, 1.15));
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
  const world = spec.path === 'WORLD';
  const pace: PacePreferenceId = spec.pace ?? 'STANDARD';
  const flexible = pace === 'FLEXIBLE';
  const spread = flexible ? 1.2 : 1;
  const coreH = spec.path === 'CUSTOM' ? 3.3 : spec.path === 'ADVANCED' ? 3.0 : 2.6;
  const { elements, top: t } = plinth('main', palette, (world ? 6.4 : 5.2) * (resolved ? 1.08 : 1), world ? 4.6 : 3.6);
  const s = palette.structure;
  const out: BuildElement[] = [...elements];
  out.push(box('vol-a', s, [2.4, coreH + 0.3, 1.9], [0, t, 0], 0, 2));
  out.push(box('core', palette.accent, [1.05, coreH, 0.95], [0.25, t, 0.25], 0, 3));
  out.push(box('core-cap', palette.accent, [1.2, 0.08, 1.1], [0.25, t + coreH, 0.25], 0, 4));
  // Side volumes: one per selected capability, stepping down away from the core.
  const sides = Math.min(spec.modules.length + 2, 6);
  for (let i = 0; i < sides; i += 1) {
    const left = i % 2 === 0;
    const rank = Math.floor(i / 2);
    const h = Math.max(0.7, coreH - 0.8 - rank * 0.55);
    const x = (left ? -1 : 1) * (1.55 + rank * 0.85) * spread;
    const z = (left ? 0.3 : -0.35) + rank * 0.25;
    out.push(box(`side-${i}`, s, [0.95, h, 1.2], [x, t, z], 0, 5 + rank));
    if (i < spec.modules.length) out.push(box(`side-${i}-module`, palette.accent, [0.45, h * 0.55, 0.5], [x, t, z + 0.2], 0, 6 + rank));
    // EXPEDITED: sequencing marks — a steel cap on each volume as it is reached. Pacing, not scope: red stays
    // reserved for capabilities, so priority never reads as more product.
    if (pace === 'EXPEDITED') out.push(box(`side-${i}-mark`, 'steel', [0.97, 0.03, 1.22], [x, t + h, z], 0, 6 + rank));
    // FLEXIBLE: a visible joint where each module meets the plinth — parts that can move.
    if (flexible) out.push(box(`side-${i}-joint`, 'steel', [1.05, 0.04, 1.3], [x, t, z], 0, 5 + rank));
  }
  out.push(box('mass-a', palette.mass, [0.35, coreH * 0.9, 1.5], [-1.15 * spread, t, -0.65], 0, 4));
  out.push(box('mass-b', palette.mass, [0.3, coreH * 0.7, 1.1], [1.25 * spread, t, -0.95], 0, 4));
  if (pace === 'EXPEDITED') out.push(box('core-mark', 'steel', [2.42, 0.03, 1.92], [0, t + coreH + 0.3, 0], 0, 5));
  if (world) {
    out.push(box('pav-1', s, [0.9, 0.9, 0.9], [-2.6 * spread, t, 1.4], 0, 8));
    out.push(box('pav-2', s, [0.8, 1.1, 0.8], [2.6 * spread, t, 1.3], 0, 8));
  }
  out.push(figure('fig-1', -0.95, t, 1.25));
  if (resolved) out.push(figure('fig-2', 0.75, t, 1.35, 0.96));
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

/* ─────────────────────────────── compose ─────────────────────────────── */

const CAMERAS: Record<BuildView, BuildCamera> = {
  place: { target: [0, 1.45, 0], distance: 9.6, azimuth: -30, elevation: 9, fill: 0.95, lift: 0.05 },
  feel: { target: [0, 1.55, 0], distance: 9.0, azimuth: -14, elevation: 5, fill: 0.96, lift: 0.04 },
  // Narrower fill so the capability modules stay clear of the toggles at the stage edges.
  work: { target: [0, 1.6, 0], distance: 10.2, azimuth: -24, elevation: 11, fill: 0.8 },
  pace: { target: [0, 1.75, 0], distance: 11.0, azimuth: -26, elevation: 12, fill: 0.95, lift: 0.04 },
  blueprint: { target: [0, 1.6, 0], distance: 10.6, azimuth: -24, elevation: 13, fill: 0.86, lift: 0.12 },
};

const DEFAULT_MOTION: BuildMotion = { duration: 760, stagger: 0, entry: 'base', replay: false };

export function compose(view: BuildView, spec: Spec, options: { focus?: BuildFocus } = {}): BuildComposition {
  const palette = paletteFor(spec.feel);
  let elements: BuildElement[];
  let motion: BuildMotion = DEFAULT_MOTION;
  const camera = { ...CAMERAS[view] };
  const focus = options.focus ?? 'OVERVIEW';
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
      elements = focusElements(assembled(spec, palette, true), focus);
      if (spec.path === 'WORLD') camera.distance += 1.8;
      // The timeline section replays the assembly in production order at the chosen pace.
      motion = focus === 'TIMELINE' ? PACE_MOTION[spec.pace ?? 'STANDARD'] : { ...DEFAULT_MOTION, duration: 520 };
      break;
  }
  const key = `${view}|${spec.path ?? '-'}|${spec.feel ?? '-'}|${[...spec.modules].sort().join(',')}|${spec.pace ?? '-'}${view === 'blueprint' && focus !== 'OVERVIEW' ? `|${focus}` : ''}`;
  return { key, elements, camera, motion };
}
