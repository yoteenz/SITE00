/**
 * Build Object renderer (three.js).
 *
 * Renders a `BuildComposition` as a real-time scene and animates between compositions by element id: elements
 * that persist move and resize, new elements grow up from their base, removed elements sink away. Glass volumes
 * are built as framed panes (thin white members + a clear face), red acrylic is translucent, and stone is
 * procedural (no raster stand-ins). The camera fits the composition to whatever stage it is given, so the same
 * object fills a phone stage and a desktop column. Honors reduced motion by snapping instead of tweening.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { BuildCamera, BuildComposition, BuildElement, BuildMaterial, BuildMotion } from './composition';

/** Option-card thumbnails sit on the references' card white (the live stage is transparent over its plate). */
const THUMB_BACKGROUND = 0xf6f4f3;
const TWEEN_MS = 760;
const DEG = Math.PI / 180;
const FOV = 26;
const FRAME_T = 0.034;

/* ─────────────────────────────── procedural textures ─────────────────────────────── */

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function stoneCanvas(base: string, vein: string, opts: { veins: number; speckle: number; banding?: boolean; seed: number; veinAlpha?: number }): HTMLCanvasElement {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const rand = seeded(opts.seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  const image = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    const n = (rand() - 0.5) * opts.speckle;
    image.data[i] = Math.max(0, Math.min(255, image.data[i] + n));
    image.data[i + 1] = Math.max(0, Math.min(255, image.data[i + 1] + n));
    image.data[i + 2] = Math.max(0, Math.min(255, image.data[i + 2] + n));
  }
  ctx.putImageData(image, 0, 0);
  if (opts.banding) {
    for (let y = 0; y < size; y += 6 + Math.floor(rand() * 18)) {
      ctx.fillStyle = `rgba(112, 114, 120, ${0.04 + rand() * 0.06})`;
      ctx.fillRect(0, y, size, 2 + rand() * 5);
    }
  }
  const strength = opts.veinAlpha ?? 0.55;
  for (let v = 0; v < opts.veins; v += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const angle = rand() * Math.PI * 2;
    const length = 140 + rand() * 460;
    const branches = 1 + Math.floor(rand() * 3);
    for (let b = 0; b < branches; b += 1) {
      for (const pass of [{ width: 7, alpha: strength * 0.12 }, { width: 2.2, alpha: strength * 0.4 }, { width: 0.9, alpha: strength }]) {
        const r2 = seeded(opts.seed * 31 + v * 7 + b);
        ctx.strokeStyle = vein;
        ctx.globalAlpha = pass.alpha;
        ctx.lineWidth = pass.width;
        ctx.beginPath();
        let px = x;
        let py = y;
        let a = angle + b * 0.6;
        ctx.moveTo(px, py);
        for (let step = 0; step < length; step += 7) {
          a += (r2() - 0.5) * 0.55;
          px += Math.cos(a) * 7;
          py += Math.sin(a) * 7;
          ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
  return canvas;
}

/**
 * Carrara as drawn in the references: a light grey ground with soft mottling and a network of bold, angular dark
 * veins that branch like cracks (not the faint wisps of a generic marble).
 */
function crackMarbleCanvas(opts: { base: string; mottle: string; vein: string; seed: number; veins: number; size?: number }): HTMLCanvasElement {
  const size = opts.size ?? 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const rand = seeded(opts.seed);
  ctx.fillStyle = opts.base;
  ctx.fillRect(0, 0, size, size);
  // Low-frequency mottling.
  for (let i = 0; i < 90; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 40 + rand() * 180;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, opts.mottle);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.1 + rand() * 0.16;
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.globalAlpha = 1;
  // Crack veins: angular polylines that taper and branch.
  const drawVein = (x: number, y: number, angle: number, width: number, length: number, depth: number) => {
    const points: [number, number][] = [[x, y]];
    let a = angle;
    let px = x;
    let py = y;
    for (let travelled = 0; travelled < length; ) {
      const step = 8 + rand() * 16;
      a += (rand() - 0.5) * (rand() < 0.2 ? 1.6 : 0.5);
      px += Math.cos(a) * step;
      py += Math.sin(a) * step;
      points.push([px, py]);
      travelled += step;
      if (depth < 3 && rand() < 0.07) drawVein(px, py, a + (rand() < 0.5 ? 1 : -1) * (0.5 + rand() * 0.9), width * 0.6, length * (0.25 + rand() * 0.35), depth + 1);
    }
    for (const pass of [{ w: width * 3.2, a: 0.1 }, { w: width, a: 0.82 }]) {
      ctx.strokeStyle = opts.vein;
      ctx.globalAlpha = pass.a;
      ctx.lineWidth = pass.w;
      ctx.lineJoin = 'miter';
      ctx.beginPath();
      points.forEach(([vx, vy], i) => (i ? ctx.lineTo(vx, vy) : ctx.moveTo(vx, vy)));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };
  for (let v = 0; v < opts.veins; v += 1) {
    drawVein(rand() * size, rand() * size, rand() * Math.PI * 2, 2.6 + rand() * 3.2, 260 + rand() * 520, 0);
  }
  return canvas;
}

function canvasTexture(canvas: HTMLCanvasElement, repeat = 1): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.anisotropy = 4;
  return texture;
}

/* ─────────────────────────────── materials ─────────────────────────────── */

type MaterialSet = {
  surface: Record<BuildMaterial, THREE.Material>;
  edge: Partial<Record<BuildMaterial, THREE.LineBasicMaterial>>;
  /** Pane subdivisions drawn on the faces of glass and acrylic volumes (the references' mullion grids). */
  mullion: Partial<Record<BuildMaterial, THREE.LineBasicMaterial>>;
  frame: Partial<Record<BuildMaterial, THREE.Material>>;
  castsShadow: Record<BuildMaterial, boolean>;
};

function createMaterials(): MaterialSet {
  // Cool Carrara white with grey veining; neutral limestone and concrete (no warm cast).
  const marble = canvasTexture(crackMarbleCanvas({ base: '#d6d4d2', mottle: '#a9a6a3', vein: '#2b2a2a', seed: 7, veins: 24 }));
  const darkMarble = canvasTexture(stoneCanvas('#1c1e21', '#dadde2', { veins: 12, speckle: 12, seed: 11, veinAlpha: 0.8 }));
  // FEEL study stones as drawn: a charcoal slate and a warm taupe marble, both crack-veined.
  const slate = canvasTexture(crackMarbleCanvas({ base: '#6a6968', mottle: '#525150', vein: '#4a4948', seed: 17, veins: 6, size: 512 }));
  const warmMarble = canvasTexture(crackMarbleCanvas({ base: '#b7aea6', mottle: '#8e857c', vein: '#3f3934', seed: 19, veins: 20, size: 512 }));
  // Grey veined stone (the FEEL panel and the Blueprint's standing slabs).
  const stone = canvasTexture(crackMarbleCanvas({ base: '#a6a4a2', mottle: '#7c7a78', vein: '#353434', seed: 3, veins: 18, size: 512 }));
  const concrete = canvasTexture(stoneCanvas('#c8cacd', '#8c8f95', { veins: 0, speckle: 36, seed: 5 }));
  const travertine = canvasTexture(stoneCanvas('#e2e2e0', '#acaaa6', { veins: 1, speckle: 22, banding: true, seed: 13 }));

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xf1f3f3,
    roughness: 0.03,
    metalness: 0,
    transparent: true,
    opacity: 0.27,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: 2.2,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const glassTint = glass.clone();
  glassTint.color = new THREE.Color(0xd8e3e8);
  glassTint.opacity = 0.32;
  const darkGlass = glass.clone();
  darkGlass.color = new THREE.Color(0x1d2125);
  darkGlass.opacity = 0.64;
  // Translucent SITE 00 red acrylic: luminous through its body, deeper at its edges.
  const red = new THREE.MeshPhysicalMaterial({
    color: 0xdc0a14,
    roughness: 0.06,
    metalness: 0,
    transparent: true,
    opacity: 0.9,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    emissive: new THREE.Color(0xa3000d),
    emissiveIntensity: 0.4,
    envMapIntensity: 1.4,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const redSolid = new THREE.MeshPhysicalMaterial({ color: 0xd4121c, roughness: 0.2, clearcoat: 0.9, clearcoatRoughness: 0.08, emissive: new THREE.Color(0x52000a), emissiveIntensity: 0.24 });
  // Blueprint inspection: what is not in focus stays as a faint glass outline.
  const ghost = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.05, depthWrite: false });
  const surface: Record<BuildMaterial, THREE.Material> = {
    glass,
    glassTint,
    darkGlass,
    red,
    redSolid,
    // Carrara is drawn mid-grey on its faces (never blown out): the map is toned down and kept fairly matte.
    marble: new THREE.MeshStandardMaterial({ map: marble, color: 0xe4e2e0, roughness: 0.42, metalness: 0 }),
    darkMarble: new THREE.MeshStandardMaterial({ map: darkMarble, roughness: 0.25, metalness: 0 }),
    stone: new THREE.MeshStandardMaterial({ map: stone, roughness: 0.6, metalness: 0 }),
    concrete: new THREE.MeshStandardMaterial({ map: concrete, roughness: 0.88, metalness: 0 }),
    travertine: new THREE.MeshStandardMaterial({ map: travertine, roughness: 0.62, metalness: 0 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xb4b9bf, roughness: 0.22, metalness: 0.9 }),
    ghost,
    slate: new THREE.MeshStandardMaterial({ map: slate, roughness: 0.55, metalness: 0 }),
    warmMarble: new THREE.MeshStandardMaterial({ map: warmMarble, roughness: 0.4, metalness: 0 }),
    // Drafting lines (the references' construction hairlines): flat, unlit, faint.
    hairline: new THREE.MeshBasicMaterial({ color: 0x8a8682, transparent: true, opacity: 0.5, depthWrite: false }),
    figure: new THREE.MeshStandardMaterial({ color: 0x2c2e32, roughness: 0.9, metalness: 0 }),
  };
  const line = (color: number, opacity: number) => new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  // Chrome-white mullions: crisp edges that define every glass volume.
  const lightFrame = new THREE.MeshStandardMaterial({ color: 0xdcdedf, roughness: 0.2, metalness: 0.7 });
  const darkFrame = new THREE.MeshStandardMaterial({ color: 0x1a1d20, roughness: 0.3, metalness: 0.5 });
  // Red acrylic reads with a deeper red edge where the sheet is seen through its thickness.
  const redFrame = new THREE.MeshStandardMaterial({ color: 0x8e0710, roughness: 0.25, metalness: 0.1, emissive: new THREE.Color(0x3a0004), emissiveIntensity: 0.3 });
  const outline = line(0x34363b, 0.14);
  return {
    surface,
    edge: {
      glass: line(0x8d9396, 0.55),
      glassTint: line(0x76848c, 0.66),
      darkGlass: line(0x0c0e10, 0.85),
      red: line(0xb00010, 0.9),
      redSolid: line(0x7a000a, 0.5),
      marble: outline,
      darkMarble: line(0x000000, 0.3),
      stone: outline,
      concrete: outline,
      travertine: outline,
      ghost: line(0xa6aeb5, 0.32),
      slate: line(0x1a1a1a, 0.3),
      warmMarble: outline,
    },
    frame: { glass: lightFrame, glassTint: lightFrame, darkGlass: darkFrame, red: redFrame },
    mullion: { glass: line(0x9ba1a4, 0.34), glassTint: line(0x8f979b, 0.38), darkGlass: line(0x0b0d0f, 0.5), red: line(0x86050d, 0.55) },
    castsShadow: {
      glass: false,
      glassTint: false,
      darkGlass: true,
      red: true,
      redSolid: true,
      marble: true,
      darkMarble: true,
      stone: true,
      concrete: true,
      travertine: true,
      steel: true,
      ghost: false,
      slate: true,
      warmMarble: true,
      hairline: false,
      figure: true,
    },
  };
}

/* ─────────────────────────────── scene ─────────────────────────────── */

const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);
const UNIT_EDGES = new THREE.EdgesGeometry(UNIT_BOX);
/** Approximate pane size of the references' glazing, in scene units. */
const PANE = 1.05;
const gridCache = new Map<string, THREE.BufferGeometry>();
/** Mullion lines on the four vertical faces of a unit box, with pane counts chosen from the element's real size. */
function paneGrid(size: readonly number[]): THREE.BufferGeometry {
  const [w, h, d] = size;
  const nx = Math.max(1, Math.round(w / PANE));
  const ny = Math.max(1, Math.round(h / PANE));
  const nz = Math.max(1, Math.round(d / PANE));
  const key = `${nx}.${ny}.${nz}`;
  const cached = gridCache.get(key);
  if (cached) return cached;
  const v: number[] = [];
  const seg = (a: number[], b: number[]) => v.push(...a, ...b);
  for (const z of [-0.5, 0.5]) {
    for (let i = 1; i < nx; i += 1) seg([-0.5 + i / nx, -0.5, z], [-0.5 + i / nx, 0.5, z]);
    for (let j = 1; j < ny; j += 1) seg([-0.5, -0.5 + j / ny, z], [0.5, -0.5 + j / ny, z]);
  }
  for (const x of [-0.5, 0.5]) {
    for (let i = 1; i < nz; i += 1) seg([x, -0.5, -0.5 + i / nz], [x, 0.5, -0.5 + i / nz]);
    for (let j = 1; j < ny; j += 1) seg([x, -0.5 + j / ny, -0.5], [x, -0.5 + j / ny, 0.5]);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  gridCache.set(key, geometry);
  return geometry;
}

/** A slender human figure for scale, one unit tall (feet at -0.5, head at +0.5), scaled uniformly. */
const FIGURE_BODY = (() => {
  const body = new THREE.CapsuleGeometry(0.075, 0.6, 4, 10);
  body.translate(0, -0.125, 0);
  const head = new THREE.SphereGeometry(0.075, 12, 10);
  head.translate(0, 0.39, 0);
  return mergeGeometries([body, head])!;
})();

/** Interim reflection map from SITE 00's own atrium render (until the GA-01 HDRI exists). */
const REFLECTION_MAP = '/site00/builder-studio/env/atrium-reflection.webp';

function buildStage(scene: THREE.Scene, renderer: THREE.WebGLRenderer, mobile: boolean, onEnvironment?: (ready: boolean) => void) {
  // The stage is composited: a photographic environment plate sits behind a transparent canvas (CSS layer), so the
  // scene draws only the architecture, its shadow on the floor and its reflections.
  scene.background = null;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  new THREE.TextureLoader().load(
    REFLECTION_MAP,
    (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      const previous = scene.environment;
      scene.environment = pmrem.fromEquirectangular(texture).texture;
      scene.environmentIntensity = 0.95;
      previous?.dispose();
      texture.dispose();
      pmrem.dispose();
      // Repaint once now, so the reflection swap lands immediately (also under reduced motion), never on a later frame.
      onEnvironment?.(true);
    },
    undefined,
    () => {
      pmrem.dispose();
      onEnvironment?.(false);
    },
  );

  scene.add(new THREE.HemisphereLight(0xffffff, 0xe6e2df, 0.62));
  const sun = new THREE.DirectionalLight(0xffffff, 2.3);
  sun.position.set(-6, 10, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  sun.shadow.camera.left = -9;
  sun.shadow.camera.right = 9;
  sun.shadow.camera.top = 9;
  sun.shadow.camera.bottom = -9;
  sun.shadow.camera.far = 40;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.025;
  sun.shadow.radius = 4;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xf8f6f5, 0.6);
  fill.position.set(7, 4, -2);
  scene.add(fill);
  const front = new THREE.DirectionalLight(0xffffff, 0.4);
  front.position.set(2, 2, 10);
  scene.add(front);

  // Shadow catcher: the plate's polished floor shows through; only the object's soft shadow is drawn.
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.ShadowMaterial({ color: 0x3a3634, opacity: 0.16 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
}

type NodeState = { position: THREE.Vector3; size: THREE.Vector3; rotationY: number };

type SceneNode = {
  id: string;
  material: BuildMaterial;
  group: THREE.Group;
  mesh: THREE.Mesh;
  edges: THREE.LineSegments | null;
  mullions: THREE.LineSegments | null;
  frames: THREE.Mesh[];
  from: NodeState;
  to: NodeState;
  start: number;
  /** Assembly delay (ms) before this node starts moving, and its own tween length. */
  delay: number;
  duration: number;
  removing: boolean;
};

function stateOf(el: BuildElement): NodeState {
  return {
    position: new THREE.Vector3(...el.position),
    size: new THREE.Vector3(...el.size),
    rotationY: el.rotationY ?? 0,
  };
}

/** Collapsed state at an element's base, used for growing in and sinking out. */
function collapsed(state: NodeState): NodeState {
  const base = state.position.y - state.size.y / 2;
  return {
    position: new THREE.Vector3(state.position.x, base + 0.001, state.position.z),
    size: new THREE.Vector3(state.size.x, 0.002, state.size.z),
    rotationY: state.rotationY,
  };
}

/** Where an element enters from, per the composition's motion. */
function entryState(state: NodeState, entry: BuildMotion['entry']): NodeState {
  if (entry === 'lateral') {
    const side = state.position.x === 0 ? 1 : Math.sign(state.position.x);
    return { position: state.position.clone().add(new THREE.Vector3(side * 1.4, 0, 0.35)), size: state.size.clone().multiplyScalar(0.92), rotationY: state.rotationY };
  }
  if (entry === 'above') {
    return { position: state.position.clone().add(new THREE.Vector3(0, 0.9, 0)), size: state.size.clone(), rotationY: state.rotationY };
  }
  return collapsed(state);
}

function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Twelve frame members around a box of the given size. */
function layoutFrames(frames: THREE.Mesh[], size: THREE.Vector3) {
  if (!frames.length) return;
  const [w, h, d] = [size.x, size.y, size.z];
  const t = Math.min(FRAME_T, w * 0.3, Math.max(h, 0.002) * 0.3, d * 0.3);
  let i = 0;
  for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    frames[i].scale.set(w + t, t, t);
    frames[i].position.set(0, (sy * h) / 2, (sz * d) / 2);
    i += 1;
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    frames[i].scale.set(t, h, t);
    frames[i].position.set((sx * w) / 2, 0, (sz * d) / 2);
    i += 1;
  }
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    frames[i].scale.set(t, t, d + t);
    frames[i].position.set((sx * w) / 2, (sy * h) / 2, 0);
    i += 1;
  }
}

function applyState(node: SceneNode, state: NodeState) {
  node.group.position.copy(state.position);
  node.group.rotation.y = state.rotationY;
  if (node.material === 'figure') {
    node.mesh.scale.setScalar(Math.max(state.size.y, 0.001));
    return;
  }
  node.mesh.scale.copy(state.size);
  node.edges?.scale.copy(state.size);
  node.mullions?.scale.copy(state.size);
  layoutFrames(node.frames, state.size);
}

function cameraPosition(camera: BuildCamera, extraAzimuth = 0): THREE.Vector3 {
  const az = (camera.azimuth + extraAzimuth) * DEG;
  const el = camera.elevation * DEG;
  const [tx, ty, tz] = camera.target;
  return new THREE.Vector3(
    tx + camera.distance * Math.cos(el) * Math.sin(az),
    ty + camera.distance * Math.sin(el),
    tz + camera.distance * Math.cos(el) * Math.cos(az),
  );
}

function lerpCamera(a: BuildCamera, b: BuildCamera, t: number): BuildCamera {
  const l = (x: number, y: number) => x + (y - x) * t;
  return {
    target: [l(a.target[0], b.target[0]), l(a.target[1], b.target[1]), l(a.target[2], b.target[2])],
    distance: l(a.distance, b.distance),
    azimuth: l(a.azimuth, b.azimuth),
    elevation: l(a.elevation, b.elevation),
  };
}

const fitCam = new THREE.PerspectiveCamera(FOV, 1, 0.1, 400);

/**
 * Frames a composition for a stage aspect: the camera keeps the composition's angle and moves until the
 * object's bounds fill `fill` of the frame.
 */
export function fitCamera(elements: BuildElement[], camera: BuildCamera, aspect: number): BuildCamera {
  const box = new THREE.Box3();
  const v = new THREE.Vector3();
  for (const el of elements) {
    // Drafting hairlines run past the object on purpose; they never drive the framing.
    if (el.material === 'hairline') continue;
    const [w, h, d] = el.size;
    const [x, y, z] = el.position;
    const r = el.rotationY ?? 0;
    const hw = (Math.abs(Math.cos(r)) * w + Math.abs(Math.sin(r)) * d) / 2;
    const hd = (Math.abs(Math.sin(r)) * w + Math.abs(Math.cos(r)) * d) / 2;
    box.expandByPoint(v.set(x - hw, y - h / 2, z - hd));
    box.expandByPoint(v.set(x + hw, y + h / 2, z + hd));
  }
  if (box.isEmpty()) return camera;
  const center = box.getCenter(new THREE.Vector3());
  center.y += (camera.lift ?? 0) * (box.max.y - box.min.y);
  const corners: THREE.Vector3[] = [];
  for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) corners.push(new THREE.Vector3(x, y, z));
  const fill = camera.fill ?? 0.86;
  fitCam.aspect = aspect;
  fitCam.updateProjectionMatrix();
  let distance = box.getSize(v).length() * 1.6;
  const target: [number, number, number] = [center.x, center.y, center.z];
  for (let i = 0; i < 8; i += 1) {
    fitCam.position.copy(cameraPosition({ ...camera, target, distance }));
    fitCam.lookAt(center);
    fitCam.updateMatrixWorld();
    let m = 0;
    for (const corner of corners) {
      const p = corner.clone().project(fitCam);
      m = Math.max(m, Math.abs(p.x) / fill, Math.abs(p.y) / fill);
    }
    distance *= 1 + (m - 1) * 0.85;
  }
  return { ...camera, target, distance };
}

export function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function makeNodeFactory(scene: THREE.Scene, materials: MaterialSet) {
  return (el: BuildElement): SceneNode => {
    const group = new THREE.Group();
    const isFigure = el.material === 'figure';
    const mesh = new THREE.Mesh(isFigure ? FIGURE_BODY : UNIT_BOX, materials.surface[el.material]);
    mesh.castShadow = materials.castsShadow[el.material];
    mesh.receiveShadow = !isFigure;
    if (el.material.includes('lass') || el.material === 'red' || el.material === 'ghost') mesh.renderOrder = 2;
    group.add(mesh);
    let edges: THREE.LineSegments | null = null;
    const edgeMaterial = materials.edge[el.material];
    if (edgeMaterial) {
      edges = new THREE.LineSegments(UNIT_EDGES, edgeMaterial);
      edges.renderOrder = 3;
      group.add(edges);
    }
    let mullions: THREE.LineSegments | null = null;
    const mullionMaterial = materials.mullion[el.material];
    if (mullionMaterial) {
      mullions = new THREE.LineSegments(paneGrid(el.size), mullionMaterial);
      mullions.renderOrder = 3;
      group.add(mullions);
    }
    const frames: THREE.Mesh[] = [];
    const frameMaterial = materials.frame[el.material];
    if (frameMaterial) {
      for (let i = 0; i < 12; i += 1) {
        const member = new THREE.Mesh(UNIT_BOX, frameMaterial);
        member.castShadow = true;
        member.receiveShadow = true;
        frames.push(member);
        group.add(member);
      }
    }
    scene.add(group);
    const target = stateOf(el);
    return { id: el.id, material: el.material, group, mesh, edges, mullions, frames, from: collapsed(target), to: target, start: performance.now(), delay: 0, duration: TWEEN_MS, removing: false };
  };
}

/* ─────────────────────────────── live engine ─────────────────────────────── */

export type BuildObjectEngine = {
  setComposition: (composition: BuildComposition) => void;
  setInteractive: (interactive: boolean) => void;
  resetView: () => void;
  dispose: () => void;
};

export function createBuildObjectEngine(container: HTMLElement, options: { reducedMotion: boolean }): BuildObjectEngine {
  const mobile = Math.min(window.innerWidth, window.innerHeight) < 700;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 2 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 0.94;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = 'bs-object__canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  // The stage reports when its reflections are in place (`data-env`), so captures and checks can wait for the final look.
  buildStage(scene, renderer, mobile, (ready) => {
    container.dataset.env = ready ? 'ready' : 'fallback';
    requestFrame();
  });
  const materials = createMaterials();
  const makeNode = makeNodeFactory(scene, materials);
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 160);

  const nodes = new Map<string, SceneNode>();
  let composition: BuildComposition | null = null;
  let aspect = 1;
  let currentCamera: BuildCamera | null = null;
  let fromCamera: BuildCamera | null = null;
  let toCamera: BuildCamera | null = null;
  let cameraStart = 0;
  let dragAzimuth = 0;
  let dragElevation = 0;
  let interactive = false;
  let visible = true;
  let frame = 0;
  let disposed = false;
  let lastSwayRender = 0;
  const reducedMotion = options.reducedMotion;

  function setNodeMaterial(node: SceneNode, material: BuildMaterial) {
    if (node.material === material) return;
    // A material family change (glass ↔ stone) rebuilds the node in place.
    const needsFrames = Boolean(materials.frame[material]);
    if (needsFrames !== node.frames.length > 0 || (node.material === 'figure') !== (material === 'figure')) {
      scene.remove(node.group);
      const rebuilt = makeNode({ id: node.id, material, size: node.to.size.toArray() as [number, number, number], position: node.to.position.toArray() as [number, number, number], rotationY: node.to.rotationY });
      Object.assign(node, { group: rebuilt.group, mesh: rebuilt.mesh, edges: rebuilt.edges, mullions: rebuilt.mullions, frames: rebuilt.frames, material });
      return;
    }
    node.material = material;
    node.mesh.material = materials.surface[material];
    node.mesh.castShadow = materials.castsShadow[material];
    node.mesh.renderOrder = material.includes('lass') || material === 'red' || material === 'ghost' ? 2 : 0;
    for (const member of node.frames) member.material = materials.frame[material]!;
    const edgeMaterial = materials.edge[material];
    if (edgeMaterial && !node.edges) {
      node.edges = new THREE.LineSegments(UNIT_EDGES, edgeMaterial);
      node.edges.renderOrder = 3;
      node.group.add(node.edges);
    } else if (!edgeMaterial && node.edges) {
      node.group.remove(node.edges);
      node.edges = null;
    } else if (edgeMaterial && node.edges) {
      node.edges.material = edgeMaterial;
    }
    const mullionMaterial = materials.mullion[material];
    if (mullionMaterial && !node.mullions) {
      node.mullions = new THREE.LineSegments(paneGrid(node.to.size.toArray()), mullionMaterial);
      node.mullions.renderOrder = 3;
      node.mullions.scale.copy(node.to.size);
      node.group.add(node.mullions);
    } else if (!mullionMaterial && node.mullions) {
      node.group.remove(node.mullions);
      node.mullions = null;
    } else if (mullionMaterial && node.mullions) {
      node.mullions.material = mullionMaterial;
    }
  }

  function progress(node: SceneNode, now: number): number {
    if (reducedMotion) return 1;
    return Math.max(0, Math.min(1, (now - node.start - node.delay) / node.duration));
  }

  function currentStateOf(node: SceneNode, now: number): NodeState {
    const t = ease(progress(node, now));
    return {
      position: node.from.position.clone().lerp(node.to.position, t),
      size: node.from.size.clone().lerp(node.to.size, t),
      rotationY: node.from.rotationY + (node.to.rotationY - node.from.rotationY) * t,
    };
  }

  function fitted(): BuildCamera | null {
    return composition ? fitCamera(composition.elements, composition.camera, aspect) : null;
  }

  function resize() {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    renderer.setSize(width, height, false);
    aspect = width / height;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    // A new stage shape re-frames immediately (no tween on resize).
    const next = fitted();
    if (next) {
      currentCamera = next;
      fromCamera = null;
      toCamera = next;
    }
    requestFrame();
  }

  function tick(now: number) {
    frame = 0;
    if (disposed) return;
    let animating = false;
    for (const node of [...nodes.values()]) {
      const t = progress(node, now);
      if (t < 1) animating = true;
      applyState(node, currentStateOf(node, now));
      if (node.removing && t >= 1) {
        scene.remove(node.group);
        nodes.delete(node.id);
      }
    }
    if (fromCamera && toCamera) {
      const t = reducedMotion ? 1 : Math.min(1, (now - cameraStart) / TWEEN_MS);
      currentCamera = lerpCamera(fromCamera, toCamera, ease(t));
      if (t < 1) animating = true;
      else fromCamera = null;
    }
    if (currentCamera) {
      const sway = reducedMotion || interactive ? 0 : Math.sin(now / 5200) * 2.2;
      const view = { ...currentCamera, elevation: Math.max(2, Math.min(55, currentCamera.elevation + dragElevation)) };
      camera.position.copy(cameraPosition(view, sway + dragAzimuth));
      camera.lookAt(...view.target);
    }
    renderer.render(scene, camera);
    if (animating) requestFrame();
    else if (!reducedMotion && !interactive && visible) {
      // A gentle idle sway at a low frame rate; transitions run at full rate.
      const wait = Math.max(0, 1000 / 20 - (now - lastSwayRender));
      lastSwayRender = now;
      window.setTimeout(requestFrame, wait);
    }
  }

  function requestFrame() {
    if (!frame && !disposed && visible) frame = requestAnimationFrame(tick);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const intersection = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting) && document.visibilityState === 'visible';
    requestFrame();
  });
  intersection.observe(container);
  const onVisibility = () => {
    visible = document.visibilityState === 'visible';
    requestFrame();
  };
  document.addEventListener('visibilitychange', onVisibility);

  let dragging: { x: number; y: number; az: number; el: number } | null = null;
  const canvas = renderer.domElement;
  const onDown = (event: PointerEvent) => {
    if (!interactive) return;
    dragging = { x: event.clientX, y: event.clientY, az: dragAzimuth, el: dragElevation };
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = 'grabbing';
  };
  const onMove = (event: PointerEvent) => {
    if (!dragging) return;
    dragAzimuth = dragging.az - (event.clientX - dragging.x) * 0.35;
    dragElevation = dragging.el + (event.clientY - dragging.y) * 0.2;
    requestFrame();
  };
  const onUp = () => {
    dragging = null;
    if (interactive) canvas.style.cursor = 'grab';
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  resize();

  return {
    setComposition(next) {
      const now = performance.now();
      const first = composition === null;
      const changed = composition?.key !== next.key;
      composition = next;
      const motion = next.motion;
      // A replaying composition (PACE, Blueprint timeline) re-assembles everything in its own rhythm.
      const replay = !first && changed && motion.replay;
      const seen = new Set<string>();
      for (const el of next.elements) {
        seen.add(el.id);
        const existing = nodes.get(el.id);
        const target = stateOf(el);
        const delay = (el.seq ?? 0) * motion.stagger;
        if (!existing) {
          const node = makeNode(el);
          node.from = first ? target : entryState(target, motion.entry);
          node.delay = first ? 0 : delay;
          node.duration = motion.duration;
          nodes.set(el.id, node);
          continue;
        }
        const from = existing.removing || replay ? entryState(target, motion.entry) : currentStateOf(existing, now);
        setNodeMaterial(existing, el.material);
        existing.from = from;
        existing.to = target;
        existing.start = now;
        existing.delay = replay ? delay : Math.min(delay, 240);
        existing.duration = motion.duration;
        existing.removing = false;
        if (replay) applyState(existing, from);
      }
      for (const node of nodes.values()) {
        if (seen.has(node.id) || node.removing) continue;
        node.from = currentStateOf(node, now);
        node.to = collapsed(node.to);
        node.start = now;
        node.delay = 0;
        node.duration = Math.min(motion.duration, 520);
        node.removing = true;
      }
      const target = fitted()!;
      if (!currentCamera) {
        currentCamera = target;
      } else {
        fromCamera = currentCamera;
        cameraStart = now;
      }
      toCamera = target;
      requestFrame();
    },
    setInteractive(next) {
      interactive = next;
      canvas.style.touchAction = next ? 'none' : '';
      canvas.style.cursor = next ? 'grab' : '';
      requestFrame();
    },
    resetView() {
      dragAzimuth = 0;
      dragElevation = 0;
      requestFrame();
    },
    dispose() {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      scene.environment?.dispose();
      for (const material of Object.values(materials.surface)) {
        (material as THREE.MeshStandardMaterial).map?.dispose();
        material.dispose();
      }
      renderer.dispose();
      canvas.remove();
    },
  };
}

/* ─────────────────────────────── thumbnails ─────────────────────────────── */

let thumbRenderer: THREE.WebGLRenderer | null = null;
let thumbScene: THREE.Scene | null = null;
let thumbMaterials: MaterialSet | null = null;
const thumbCache = new Map<string, string>();

/**
 * Renders a composition still to a data URL using one shared offscreen context, so every option card shows the
 * same object the stage shows rather than an unrelated illustration.
 */
export function renderBuildThumbnail(composition: BuildComposition, width: number, height: number): string | null {
  const cacheKey = `${composition.key}@${width}x${height}`;
  const cached = thumbCache.get(cacheKey);
  if (cached) return cached;
  try {
    if (!thumbRenderer) {
      thumbRenderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      thumbRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      thumbRenderer.outputColorSpace = THREE.SRGBColorSpace;
      thumbRenderer.toneMapping = THREE.NeutralToneMapping;
      thumbRenderer.shadowMap.enabled = true;
      thumbRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
      thumbScene = new THREE.Scene();
      buildStage(thumbScene, thumbRenderer, true);
      thumbScene.background = new THREE.Color(THUMB_BACKGROUND);
      thumbMaterials = createMaterials();
    }
    const renderer = thumbRenderer;
    const scene = thumbScene!;
    const group = new THREE.Group();
    scene.add(group);
    const makeNode = makeNodeFactory(group as unknown as THREE.Scene, thumbMaterials!);
    for (const el of composition.elements) applyState(makeNode(el), stateOf(el));
    renderer.setSize(width, height, false);
    const framing = fitCamera(composition.elements, { ...composition.camera, fill: Math.min(0.94, (composition.camera.fill ?? 0.86) + 0.04), lift: 0 }, width / height);
    const cam = new THREE.PerspectiveCamera(FOV, width / height, 0.1, 160);
    cam.position.copy(cameraPosition(framing));
    cam.lookAt(...framing.target);
    renderer.render(scene, cam);
    const url = renderer.domElement.toDataURL('image/jpeg', 0.86);
    scene.remove(group);
    thumbCache.set(cacheKey, url);
    return url;
  } catch {
    return null;
  }
}
