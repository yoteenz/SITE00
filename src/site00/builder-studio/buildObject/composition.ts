/**
 * Build Object composition — pure configuration → architecture.
 *
 * The Build Object is a configuration visualization, not a website design. Each studio view arranges the same
 * vocabulary (clear glass, translucent red acrylic, white stone, marble, concrete) from the client's choices:
 *
 *   PLACE      path       → structural composition
 *   FEEL       direction  → material treatment (a study of plates)
 *   WORK       modules    → floors added to the structure
 *   PACE       pace       → the assembled structure's posture
 *   BLUEPRINT  everything → the resolved location
 *
 * Elements carry stable ids so the renderer can move, add and remove them instead of swapping images.
 */
import type { VisualSystemId } from '../../../studioos/estimation/types';
import type { StudioDraft, StudioPace, StudioPath, WorkModuleId } from '../studioModel';

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
  | 'figure';

export type BuildElement = {
  id: string;
  material: BuildMaterial;
  /** Width, height, depth. */
  size: [number, number, number];
  /** Center of the box. */
  position: [number, number, number];
  rotationY?: number;
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

export type BuildComposition = { key: string; elements: BuildElement[]; camera: BuildCamera };

export type BuildView = 'place' | 'feel' | 'work' | 'pace' | 'blueprint';

/** Material roles a visual direction assigns. */
export type BuildPalette = {
  structure: BuildMaterial;
  accent: BuildMaterial;
  mass: BuildMaterial;
  plinth: BuildMaterial;
  /** Plates shown in the FEEL material study, left to right. */
  study: BuildMaterial[];
};

const NEUTRAL: BuildPalette = { structure: 'glass', accent: 'red', mass: 'stone', plinth: 'marble', study: ['stone', 'glass', 'red', 'glass', 'marble'] };

export const FEEL_PALETTES: Record<VisualSystemId, BuildPalette> = {
  ARCHITECTURAL_MINIMAL: { structure: 'glass', accent: 'red', mass: 'stone', plinth: 'marble', study: ['darkMarble', 'stone', 'glass', 'red', 'red', 'marble', 'glass'] },
  POP_EDITORIAL: { structure: 'glassTint', accent: 'redSolid', mass: 'concrete', plinth: 'marble', study: ['redSolid', 'glass', 'darkMarble', 'redSolid', 'red', 'concrete', 'redSolid'] },
  EDITORIAL_OBJECT: { structure: 'glass', accent: 'red', mass: 'marble', plinth: 'marble', study: ['marble', 'glass', 'darkMarble', 'marble', 'red', 'glass', 'marble'] },
  CINEMATIC_LUXURY: { structure: 'darkGlass', accent: 'red', mass: 'darkMarble', plinth: 'darkMarble', study: ['darkMarble', 'darkGlass', 'red', 'darkMarble', 'red', 'darkGlass', 'darkMarble'] },
  SOFT_ORGANIC: { structure: 'glassTint', accent: 'red', mass: 'travertine', plinth: 'travertine', study: ['travertine', 'glassTint', 'travertine', 'red', 'glass', 'travertine', 'glassTint'] },
  INDUSTRIAL_COMMAND: { structure: 'glass', accent: 'red', mass: 'steel', plinth: 'concrete', study: ['steel', 'concrete', 'glass', 'red', 'steel', 'glass', 'concrete'] },
};

export function paletteFor(feel: VisualSystemId | null): BuildPalette {
  return feel ? FEEL_PALETTES[feel] : NEUTRAL;
}

type Spec = Pick<StudioDraft, 'path' | 'feel' | 'modules' | 'pace'>;

const box = (
  id: string,
  material: BuildMaterial,
  size: [number, number, number],
  base: [number, number, number],
  rotationY = 0,
): BuildElement => ({
  id,
  material,
  size,
  // `base` is the bottom-center of the box; the renderer works in centers.
  position: [base[0], base[1] + size[1] / 2, base[2]],
  rotationY,
});

const figure = (id: string, x: number, y: number, z: number, scale = 1): BuildElement =>
  box(id, 'figure', [0.07 * scale, 0.5 * scale, 0.07 * scale], [x, y, z]);

/** A stepped plinth: a broad marble slab with a thinner top step, as in the references. */
function plinth(prefix: string, palette: BuildPalette, w: number, d: number): { elements: BuildElement[]; top: number } {
  return {
    elements: [
      box(`${prefix}-plinth`, palette.plinth, [w, 0.42, d], [0, 0, 0]),
      box(`${prefix}-step`, palette.plinth, [w * 0.88, 0.12, d * 0.86], [0, 0.42, 0]),
    ],
    top: 0.54,
  };
}

/* ─────────────────────────────── PLACE ─────────────────────────────── */

function placeComposition(path: StudioPath | null, palette: BuildPalette): BuildElement[] {
  const { elements, top: t } = plinth('main', palette, 4.6, 3.4);
  const s = palette.structure;
  switch (path) {
    case 'ADVANCED':
      return [
        ...elements,
        box('vol-a', s, [2.0, 2.6, 1.8], [-0.7, t, 0.1]),
        box('vol-b', s, [1.5, 1.6, 1.5], [1.15, t, -0.25]),
        box('core', palette.accent, [0.85, 2.9, 0.1], [0.45, t, 0.45]),
        box('core-2', palette.accent, [0.1, 2.2, 0.9], [0.92, t, 0.05]),
        box('wall', palette.mass, [0.12, 2.0, 1.6], [-1.75, t, -0.1]),
        figure('fig-1', -0.6, t, 0.75),
      ];
    case 'CUSTOM':
      return [
        ...elements,
        box('vol-a', s, [1.7, 1.5, 1.5], [-0.6, t, 0.2], 0.18),
        box('vol-b', s, [1.3, 1.2, 1.3], [0.55, t + 1.5, -0.1], -0.32),
        box('vol-c', s, [1.0, 1.9, 1.0], [1.25, t, 0.35], 0.5),
        box('core', palette.accent, [0.7, 2.3, 0.1], [-0.15, t + 0.6, 0.55], 0.6),
        box('core-2', palette.accent, [1.6, 0.1, 0.7], [0.55, t + 1.42, -0.05], -0.32),
        box('wall', palette.mass, [0.14, 1.4, 1.3], [-1.6, t, -0.3], 0.18),
        figure('fig-1', 0.1, t, 1.0),
      ];
    case 'WORLD': {
      const { elements: wide, top: tw } = plinth('main', palette, 6.2, 4.4);
      return [
        ...wide,
        box('vol-a', s, [1.2, 1.3, 1.1], [-1.9, tw, 0.6]),
        box('vol-b', s, [1.0, 1.0, 1.0], [1.95, tw, 0.9]),
        box('vol-c', s, [1.4, 1.8, 1.2], [0.15, tw, -1.0]),
        box('vol-d', s, [0.9, 0.8, 0.9], [-1.2, tw, -1.25]),
        box('core', palette.accent, [0.5, 3.0, 0.5], [0.2, tw, 0.4]),
        box('wall', palette.mass, [2.4, 0.5, 0.12], [1.3, tw, -1.75]),
        figure('fig-1', -0.7, tw, 1.25),
        figure('fig-2', 1.2, tw, 0.2, 0.95),
      ];
    }
    case 'SIMPLE':
    default:
      return [
        ...elements,
        box('vol-a', s, [2.8, 2.35, 2.1], [-0.2, t, 0.05]),
        box('inner', s, [0.06, 2.3, 1.7], [-0.65, t, 0.05]),
        box('wall', 'stone', [0.08, 1.9, 1.1], [-1.25, t, -0.35]),
        box('wall-2', 'stone', [0.9, 1.9, 0.08], [-0.85, t, -0.85]),
        box('core', palette.accent, [0.95, 2.6, 0.1], [0.62, t, 0.62]),
        box('core-2', palette.accent, [0.1, 2.6, 1.3], [1.12, t, -0.05]),
        box('core-strip', palette.accent, [0.16, 0.5, 0.04], [0.95, 0.02, 1.43]),
        figure('fig-1', -0.95, t, 0.45),
      ];
  }
}

/* ─────────────────────────────── FEEL ─────────────────────────────── */

function feelComposition(palette: BuildPalette): BuildElement[] {
  // Standing plates fanned into depth and lifted off a glass table: a material study.
  const base: BuildElement[] = [
    box('main-plinth', 'glassTint', [5.0, 0.06, 2.4], [0.25, 0, -0.35], 0.32),
    box('main-step', palette.plinth, [4.6, 0.08, 0.36], [0.05, 0, 0.75], 0.32),
  ];
  const n = palette.study.length;
  const plates = palette.study.map((material, i) => {
    const x = -1.75 + i * (3.6 / Math.max(1, n - 1));
    const z = 0.55 - i * 0.24 + (i % 2 ? -0.12 : 0.1);
    const thin = material.includes('lass') || material.startsWith('red');
    const height = (thin ? 3.4 : 3.05) + (i % 3) * 0.22 - (i === 0 ? 0.35 : 0);
    const lift = 0.38 + (i % 2) * 0.16;
    return box(`plate-${i}`, material, [1.0, height, thin ? 0.05 : 0.11], [x, lift, z], 0.62);
  });
  return [...base, ...plates, figure('fig-1', 1.95, 0.06, 1.45), figure('fig-2', 2.2, 0.06, 1.3, 0.95)];
}

/* ─────────────────────────────── WORK ─────────────────────────────── */

const MODULE_ORDER: WorkModuleId[] = ['PAGES', 'BLOG', 'SHOP', 'MEMBER_AREA', 'BOOKING', 'PORTAL'];
const FLOOR_H = 0.56;
const CORE_FLOORS = 5;

export function towerFloors(modules: readonly WorkModuleId[]): { id: string; module: WorkModuleId | null }[] {
  const core = Array.from({ length: CORE_FLOORS }, (_, i) => ({ id: `floor-core-${i}`, module: null }));
  const added = MODULE_ORDER.filter((id) => modules.includes(id)).map((id) => ({ id: `floor-${id}`, module: id }));
  // Core floors carry the building; each capability adds a floor with a red module inside it.
  return [...core, ...added];
}

function workComposition(spec: Spec, palette: BuildPalette): BuildElement[] {
  const { elements, top: t } = plinth('main', palette, 2.9, 2.6);
  const out: BuildElement[] = [...elements];
  const floors = towerFloors(spec.modules);
  floors.forEach((floor, i) => {
    const y = t + i * FLOOR_H;
    const dx = [0, 0.14, -0.1, 0.18, -0.06, 0.1][i % 6];
    const dz = [0, -0.08, 0.1, 0.02, -0.12, 0.06][i % 6];
    const w = i % 3 === 1 ? 1.75 : 1.6;
    out.push(box(`${floor.id}-shell`, palette.structure, [w, FLOOR_H - 0.05, 1.5], [dx, y, dz]));
    out.push(box(`${floor.id}-slab`, palette.mass === 'steel' ? 'concrete' : 'stone', [w + 0.12, 0.05, 1.62], [dx, y + FLOOR_H - 0.05, dz]));
    if (floor.module) {
      const wide = floor.module === 'PORTAL' || floor.module === 'MEMBER_AREA';
      out.push(box(`${floor.id}-module`, palette.accent, [wide ? 1.0 : 0.62, FLOOR_H - 0.14, wide ? 0.62 : 0.5], [dx + (i % 2 ? 0.25 : -0.22), y + 0.03, dz + 0.24]));
    } else if (i === 1 || i === 3) {
      out.push(box(`${floor.id}-module`, palette.accent, [0.42, FLOOR_H - 0.14, 0.42], [dx + (i === 1 ? 0.3 : -0.28), y + 0.03, dz + 0.3]));
    } else if (i === 2) {
      out.push(box(`${floor.id}-wall`, 'stone', [0.06, FLOOR_H - 0.1, 0.9], [dx - 0.45, y, dz - 0.1]));
    }
  });
  out.push(figure('fig-1', -0.95, t, 0.95));
  return out;
}

/* ─────────────────────────────── PACE / BLUEPRINT ─────────────────────────────── */

function assembled(spec: Spec, palette: BuildPalette, resolved: boolean): BuildElement[] {
  const world = spec.path === 'WORLD';
  const pace: StudioPace = spec.pace;
  const spread = pace === 'FLEXIBLE' ? 1.18 : 1;
  const coreH = (spec.path === 'CUSTOM' ? 3.3 : spec.path === 'ADVANCED' ? 3.0 : 2.6) + (pace === 'EXPEDITED' ? 0.5 : 0);
  const { elements, top: t } = plinth('main', palette, (world ? 6.4 : 5.2) * (resolved ? 1.08 : 1), world ? 4.6 : 3.6);
  const s = palette.structure;
  const out: BuildElement[] = [...elements];
  out.push(box('vol-a', s, [2.4, coreH + 0.3, 1.9], [0, t, 0]));
  out.push(box('core', palette.accent, [1.05, coreH, 0.95], [0.25, t, 0.25]));
  out.push(box('core-cap', palette.accent, [1.2, 0.08, 1.1], [0.25, t + coreH, 0.25]));
  // Side volumes: one per selected capability floor, stepping down away from the core.
  const sides = Math.min(spec.modules.length + 2, 6);
  for (let i = 0; i < sides; i += 1) {
    const left = i % 2 === 0;
    const rank = Math.floor(i / 2);
    const h = Math.max(0.7, coreH - 0.8 - rank * 0.55);
    const x = (left ? -1 : 1) * (1.55 + rank * 0.85) * spread;
    const z = (left ? 0.3 : -0.35) + rank * 0.25;
    out.push(box(`side-${i}`, s, [0.95, h, 1.2], [x, t, z]));
    if (i < spec.modules.length) out.push(box(`side-${i}-module`, palette.accent, [0.45, h * 0.55, 0.5], [x, t, z + 0.2]));
  }
  out.push(box('mass-a', palette.mass, [0.35, coreH * 0.9, 1.5], [-1.15 * spread, t, -0.65]));
  out.push(box('mass-b', palette.mass, [0.3, coreH * 0.7, 1.1], [1.25 * spread, t, -0.95]));
  if (pace === 'EXPEDITED') out.push(box('express', palette.accent, [0.08, coreH + 0.9, 0.08], [1.0, t, 0.85]));
  if (world) {
    out.push(box('pav-1', s, [0.9, 0.9, 0.9], [-2.6, t, 1.4]));
    out.push(box('pav-2', s, [0.8, 1.1, 0.8], [2.6, t, 1.3]));
  }
  out.push(figure('fig-1', -0.95, t, 1.25));
  if (resolved) out.push(figure('fig-2', 0.75, t, 1.35, 0.96));
  return out;
}

/* ─────────────────────────────── compose ─────────────────────────────── */

const CAMERAS: Record<BuildView, BuildCamera> = {
  place: { target: [0, 1.45, 0], distance: 9.6, azimuth: -30, elevation: 8, fill: 0.96, lift: 0.05 },
  feel: { target: [0, 1.55, 0], distance: 9.0, azimuth: -14, elevation: 5, fill: 0.97, lift: 0.04 },
  work: { target: [0, 1.9, 0], distance: 10.2, azimuth: -32, elevation: 13, fill: 0.95 },
  pace: { target: [0, 1.75, 0], distance: 11.0, azimuth: -26, elevation: 12, fill: 0.95, lift: 0.04 },
  blueprint: { target: [0, 1.6, 0], distance: 10.6, azimuth: -24, elevation: 13, fill: 0.86, lift: 0.12 },
};

export function compose(view: BuildView, spec: Spec): BuildComposition {
  const palette = paletteFor(spec.feel);
  let elements: BuildElement[];
  const camera = { ...CAMERAS[view] };
  switch (view) {
    case 'place':
      elements = placeComposition(spec.path, palette);
      if (spec.path === 'WORLD') camera.distance += 1.6;
      break;
    case 'feel':
      elements = feelComposition(palette);
      break;
    case 'work': {
      elements = workComposition(spec, palette);
      break;
    }
    case 'pace':
      elements = assembled(spec, palette, false);
      break;
    case 'blueprint':
      elements = assembled(spec, palette, true);
      if (spec.path === 'WORLD') camera.distance += 1.8;
      break;
  }
  const key = `${view}|${spec.path ?? '-'}|${spec.feel ?? '-'}|${[...spec.modules].sort().join(',')}|${spec.pace}`;
  return { key, elements, camera };
}
