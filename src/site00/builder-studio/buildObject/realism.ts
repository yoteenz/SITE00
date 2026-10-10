/**
 * Realism benchmark (V2), opt-in with `?realism=v2` and scoped to PLACE · ADVANCED until the founder approves it.
 *
 * The default renderer composites a transparent canvas over a CSS plate, so glass can only be painted: a
 * transmission pass would refract empty alpha. Here the room plate is drawn inside the scene with the exact
 * `center 62% / cover` fit the CSS uses, which gives transmission real content to bend. On top of that every
 * element is built at its true size instead of a scaled unit cube:
 *
 * - glass rooms are wall and roof panels with thickness, beveled chrome frame members and mullion bars;
 * - red acrylic is a beveled transmissive shell with volumetric attenuation around a dense core, so it reads
 *   as a solid translucent block (darker through its depth, brighter at the rims) and stays visible through glass;
 * - stone is a beveled slab whose finer veins are unfolded over the faces, so they wrap the edges like a real cut;
 * - grounded elements get a baked contact-occlusion decal sized to their footprint.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { BuildComposition, BuildElement, BuildMaterial } from './composition';

export type RealismMode = 'v2';

/** The single monument the benchmark covers. Every other composition keeps the default renderer. */
export function isRealismBenchmark(composition: Pick<BuildComposition, 'key'>): boolean {
  return composition.key.startsWith('place|ADVANCED|');
}

export function realismRequested(): RealismMode | null {
  if (typeof window === 'undefined') return null;
  try {
    return new URLSearchParams(window.location.search).get('realism') === 'v2' ? 'v2' : null;
  } catch {
    return null;
  }
}

const FRAME_T = 0.034;
const PANEL_T = 0.022;
const MULLION_T = 0.011;
const PANE = 1.05;

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* ─────────────────────────────── stone ─────────────────────────────── */

/**
 * Light Carrara with fine, flowing veins: soft grey drifts along one bedding direction, a few thin primary veins
 * with a faint halo, and hair-fine secondaries. A matching roughness map makes the veins a touch less polished.
 */
const marbleCache = new Map<string, { color: HTMLCanvasElement; rough: HTMLCanvasElement }>();

function fineMarble(size: number, seed: number): { color: HTMLCanvasElement; rough: HTMLCanvasElement } {
  const key = `${size}.${seed}`;
  const cached = marbleCache.get(key);
  if (cached) return cached;
  const maps = paintMarble(size, seed);
  marbleCache.set(key, maps);
  return maps;
}

function paintMarble(size: number, seed: number): { color: HTMLCanvasElement; rough: HTMLCanvasElement } {
  const color = document.createElement('canvas');
  const rough = document.createElement('canvas');
  color.width = color.height = rough.width = rough.height = size;
  const c = color.getContext('2d')!;
  const r = rough.getContext('2d')!;
  const rand = seeded(seed);
  const k = size / 1024;
  c.fillStyle = '#e4e1dd';
  c.fillRect(0, 0, size, size);
  r.fillStyle = 'rgb(70,70,70)';
  r.fillRect(0, 0, size, size);
  const bedding = -0.62;
  // Clouded drifts along the bedding.
  for (let i = 0; i < 70; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const len = (160 + rand() * 420) * k;
    const wid = (18 + rand() * 60) * k;
    c.save();
    c.translate(x, y);
    c.rotate(bedding + (rand() - 0.5) * 0.4);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, len / 2);
    g.addColorStop(0, rand() < 0.5 ? 'rgba(150,147,144,0.16)' : 'rgba(196,192,188,0.22)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.scale(1, wid / len);
    c.fillStyle = g;
    c.fillRect(-len / 2, -len / 2, len, len);
    c.restore();
  }
  const vein = (x: number, y: number, angle: number, width: number, length: number, alpha: number, depth: number) => {
    const pts: [number, number][] = [[x, y]];
    let a = angle;
    let px = x;
    let py = y;
    for (let t = 0; t < length; ) {
      const step = (5 + rand() * 9) * k;
      a += (rand() - 0.5) * 0.32 + (bedding - a) * 0.04;
      px += Math.cos(a) * step;
      py += Math.sin(a) * step;
      pts.push([px, py]);
      t += step;
      if (depth < 2 && rand() < 0.05) vein(px, py, a + (rand() < 0.5 ? 0.7 : -0.7), width * 0.55, length * (0.2 + rand() * 0.3), alpha * 0.8, depth + 1);
    }
    const stroke = (ctx: CanvasRenderingContext2D, style: string, w: number, ga: number) => {
      ctx.strokeStyle = style;
      ctx.globalAlpha = ga;
      ctx.lineWidth = w;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      pts.forEach(([vx, vy], i) => (i ? ctx.lineTo(vx, vy) : ctx.moveTo(vx, vy)));
      ctx.stroke();
    };
    stroke(c, '#8f8b87', width * 5, alpha * 0.08);
    stroke(c, '#6d6965', width * 2, alpha * 0.22);
    stroke(c, '#4a4743', width, alpha * 0.7);
    stroke(r, 'rgb(130,130,130)', width * 2, alpha * 0.6);
    c.globalAlpha = 1;
    r.globalAlpha = 1;
  };
  for (let i = 0; i < 14; i += 1) vein(rand() * size, rand() * size, bedding + (rand() - 0.5) * 0.5, (1.3 + rand() * 1.1) * k, (500 + rand() * 700) * k, 0.9, 0);
  for (let i = 0; i < 40; i += 1) vein(rand() * size, rand() * size, bedding + (rand() - 0.5) * 1.2, (0.45 + rand() * 0.4) * k, (80 + rand() * 260) * k, 0.55, 2);
  // Grain: a faint crystalline speckle in colour, micro-roughness in the gloss.
  const img = c.getImageData(0, 0, size, size);
  const rimg = r.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rand() - 0.5) * 7;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
    const m = (rand() - 0.5) * 24;
    rimg.data[i] += m;
    rimg.data[i + 1] += m;
    rimg.data[i + 2] += m;
  }
  c.putImageData(img, 0, 0);
  r.putImageData(rimg, 0, 0);
  return { color, rough };
}

/**
 * Unfolds a box's faces into one texture space (top in the middle, sides hinged off its edges), so a vein that
 * reaches an edge continues down the face below it. `span` is the texture's size in scene units.
 */
function unfoldUVs(geometry: THREE.BufferGeometry, size: THREE.Vector3, span: number) {
  const pos = geometry.getAttribute('position');
  const nor = geometry.getAttribute('normal');
  const uv = geometry.getAttribute('uv') as THREE.BufferAttribute;
  const [hw, hh, hd] = [size.x / 2, size.y / 2, size.z / 2];
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const ax = Math.abs(nor.getX(i));
    const ay = Math.abs(nor.getY(i));
    const az = Math.abs(nor.getZ(i));
    let u: number;
    let v: number;
    if (ay >= ax && ay >= az) {
      u = x;
      v = z;
    } else if (az >= ax) {
      u = x;
      v = Math.sign(nor.getZ(i)) * (hd + (hh - y));
    } else {
      u = Math.sign(nor.getX(i)) * (hw + (hh - y));
      v = z;
    }
    uv.setXY(i, 0.5 + u / span, 0.5 - v / span);
  }
  uv.needsUpdate = true;
}

/* ─────────────────────────────── materials ─────────────────────────────── */

export type RealismMaterials = {
  glass: THREE.MeshPhysicalMaterial;
  glassTint: THREE.MeshPhysicalMaterial;
  darkGlass: THREE.MeshPhysicalMaterial;
  floorGlass: THREE.MeshPhysicalMaterial;
  chrome: THREE.MeshPhysicalMaterial;
  darkChrome: THREE.MeshPhysicalMaterial;
  redCore: THREE.MeshStandardMaterial;
  marble: THREE.MeshPhysicalMaterial;
  stone: THREE.MeshPhysicalMaterial;
  contact: THREE.MeshBasicMaterial;
  lite: boolean;
  owned: (THREE.Material | THREE.Texture | THREE.BufferGeometry)[];
};

/** Float glass: no clearcoat (a second reflecting layer reads as a milky veil), Fresnel from the ior alone. */
function clearGlass(opts: { tint: number; distance: number; thickness: number; roughness?: number; env?: number; color?: number }): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: opts.color ?? 0xffffff,
    metalness: 0,
    roughness: opts.roughness ?? 0.035,
    transmission: 1,
    thickness: opts.thickness,
    ior: 1.52,
    attenuationColor: new THREE.Color(opts.tint),
    attenuationDistance: opts.distance,
    specularIntensity: 1,
    specularColor: new THREE.Color(0xffffff),
    envMapIntensity: opts.env ?? 0.8,
  });
}

function stoneTexture(canvas: HTMLCanvasElement, colorSpace: THREE.ColorSpace): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.MirroredRepeatWrapping;
  texture.wrapT = THREE.MirroredRepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

export function createRealismMaterials(lite: boolean): RealismMaterials {
  const marbleMaps = fineMarble(lite ? 1024 : 2048, 7);
  const stoneMaps = fineMarble(512, 3);
  const marbleColor = stoneTexture(marbleMaps.color, THREE.SRGBColorSpace);
  const marbleRough = stoneTexture(marbleMaps.rough, THREE.NoColorSpace);
  const stoneColor = stoneTexture(stoneMaps.color, THREE.SRGBColorSpace);
  const stoneRough = stoneTexture(stoneMaps.rough, THREE.NoColorSpace);
  const marble = new THREE.MeshPhysicalMaterial({
    map: marbleColor,
    roughnessMap: marbleRough,
    roughness: 0.62,
    bumpMap: marbleRough,
    bumpScale: 0.004,
    metalness: 0,
    color: 0xe9e7e4,
    clearcoat: lite ? 0 : 0.55,
    clearcoatRoughness: 0.09,
    envMapIntensity: 0.62,
  });
  const stone = new THREE.MeshPhysicalMaterial({
    map: stoneColor,
    roughnessMap: stoneRough,
    roughness: 0.9,
    color: 0xb3b1ae,
    metalness: 0,
    clearcoat: lite ? 0 : 0.2,
    clearcoatRoughness: 0.2,
    envMapIntensity: 0.5,
  });
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xe9ecee, roughness: 0.14, metalness: 0.9, clearcoat: lite ? 0 : 0.35, clearcoatRoughness: 0.08, envMapIntensity: 0.95 });
  const darkChrome = new THREE.MeshPhysicalMaterial({ color: 0x15181b, roughness: 0.26, metalness: 0.65, envMapIntensity: 0.5 });
  const redCore = new THREE.MeshStandardMaterial({ color: 0xe50107, roughness: 0.5, metalness: 0, emissive: new THREE.Color(0x9a0008), emissiveIntensity: 0.32 });
  const contact = new THREE.MeshBasicMaterial({ color: 0x1b1918, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  const glass = clearGlass({ tint: 0xd7e6e2, distance: 0.9, thickness: PANEL_T });
  const glassTint = clearGlass({ tint: 0xb9cdd6, distance: 0.45, thickness: PANEL_T, color: 0xeef4f7 });
  const darkGlass = clearGlass({ tint: 0x22282d, distance: 0.08, thickness: PANEL_T, roughness: 0.06, env: 0.9 });
  const floorGlass = clearGlass({ tint: 0xbfd8d0, distance: 0.22, thickness: 0.06, roughness: 0.04 });
  return {
    glass,
    glassTint,
    darkGlass,
    floorGlass,
    chrome,
    darkChrome,
    redCore,
    marble,
    stone,
    contact,
    lite,
    owned: [marbleColor, marbleRough, stoneColor, stoneRough, marble, stone, chrome, darkChrome, redCore, contact, glass, glassTint, darkGlass, floorGlass],
  };
}

export function disposeRealism(materials: RealismMaterials) {
  for (const item of materials.owned) item.dispose();
  materials.owned.length = 0;
}

/* ─────────────────────────────── bodies ─────────────────────────────── */

function rounded(w: number, h: number, d: number, radius: number, segments: number): THREE.BufferGeometry {
  const r = Math.max(0.0005, Math.min(radius, w / 2.01, h / 2.01, d / 2.01));
  return new RoundedBoxGeometry(w, h, d, segments, r);
}

/** The twelve frame members of a glass volume, beveled, at the volume's real size. */
function frameMembers(size: THREE.Vector3, segments: number): THREE.BufferGeometry[] {
  const [w, h, d] = [size.x, size.y, size.z];
  const t = Math.min(FRAME_T, w * 0.3, h * 0.3, d * 0.3);
  const r = t * 0.28;
  const out: THREE.BufferGeometry[] = [];
  for (const sy of [-1, 1]) for (const sz of [-1, 1]) out.push(rounded(w + t, t, t, r, segments).translate(0, (sy * h) / 2, (sz * d) / 2));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) out.push(rounded(t, h, t, r, segments).translate((sx * w) / 2, 0, (sz * d) / 2));
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) out.push(rounded(t, t, d + t, r, segments).translate((sx * w) / 2, (sy * h) / 2, 0));
  return out;
}

/** Mullion bars on the four walls, standing just proud of the glass (the references' pane grid, as metal). */
function mullionBars(size: THREE.Vector3): THREE.BufferGeometry[] {
  const [w, h, d] = [size.x, size.y, size.z];
  const nx = Math.max(1, Math.round(w / PANE));
  const ny = Math.max(1, Math.round(h / PANE));
  const nz = Math.max(1, Math.round(d / PANE));
  const t = MULLION_T;
  const proud = PANEL_T / 2 + t / 2;
  const out: THREE.BufferGeometry[] = [];
  for (const sz of [-1, 1]) {
    const z = sz * (d / 2 + proud);
    for (let i = 1; i < nx; i += 1) out.push(new THREE.BoxGeometry(t, h, t).translate(-w / 2 + (i * w) / nx, 0, z));
    for (let j = 1; j < ny; j += 1) out.push(new THREE.BoxGeometry(w, t, t).translate(0, -h / 2 + (j * h) / ny, z));
  }
  for (const sx of [-1, 1]) {
    const x = sx * (w / 2 + proud);
    for (let i = 1; i < nz; i += 1) out.push(new THREE.BoxGeometry(t, h, t).translate(x, 0, -d / 2 + (i * d) / nz));
    for (let j = 1; j < ny; j += 1) out.push(new THREE.BoxGeometry(t, t, d).translate(x, -h / 2 + (j * h) / ny, 0));
  }
  return out;
}

function merged(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const normalized = parts.map((g) => (g.index ? g.toNonIndexed() : g));
  const geometry = mergeGeometries(normalized)!;
  for (const g of parts) g.dispose();
  for (const g of normalized) g.dispose();
  return geometry;
}

const isGlass = (m: BuildMaterial) => m === 'glass' || m === 'glassTint' || m === 'darkGlass';
const isStone = (m: BuildMaterial) => m === 'marble' || m === 'stone' || m === 'concrete' || m === 'travertine' || m === 'darkMarble' || m === 'slate' || m === 'warmMarble';

/**
 * The element at its true size, or null when the default renderer's version is kept (figures, hairlines, steel).
 * Geometries created here are registered on `owned` so the engine can free them.
 */
export function buildRealismBody(el: BuildElement, mats: RealismMaterials, owned: THREE.BufferGeometry[]): THREE.Group | null {
  const size = new THREE.Vector3(...el.size);
  const minDim = Math.min(size.x, size.y, size.z);
  const segments = mats.lite ? 2 : 3;
  const group = new THREE.Group();
  const add = (geometry: THREE.BufferGeometry, material: THREE.Material, opts: { cast?: boolean; receive?: boolean; order?: number } = {}) => {
    owned.push(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = opts.cast ?? false;
    mesh.receiveShadow = opts.receive ?? true;
    if (opts.order !== undefined) mesh.renderOrder = opts.order;
    group.add(mesh);
    return mesh;
  };

  if (isGlass(el.material)) {
    const frameMat = el.material === 'darkGlass' ? mats.darkChrome : mats.chrome;
    if (minDim < 0.12) {
      // A floor plate or sheet: one solid slab of glass, its thickness visible as a cool edge.
      const slab = mats.floorGlass.clone();
      slab.thickness = minDim;
      mats.owned.push(slab);
      add(rounded(size.x, size.y, size.z, Math.min(0.012, minDim * 0.35), segments), slab);
      add(merged(frameMembers(size, 1)), frameMat, { cast: true });
      return group;
    }
    const panel = mats[el.material];
    const [w, h, d] = [size.x, size.y, size.z];
    const panels = merged([
      new THREE.BoxGeometry(w, h, PANEL_T).translate(0, 0, d / 2),
      new THREE.BoxGeometry(w, h, PANEL_T).translate(0, 0, -d / 2),
      new THREE.BoxGeometry(PANEL_T, h, d).translate(w / 2, 0, 0),
      new THREE.BoxGeometry(PANEL_T, h, d).translate(-w / 2, 0, 0),
      new THREE.BoxGeometry(w, PANEL_T, d).translate(0, h / 2, 0),
    ]);
    add(panels, panel);
    add(merged([...frameMembers(size, mats.lite ? 1 : 2), ...mullionBars(size)]), frameMat, { cast: true });
    return group;
  }

  if (el.material === 'red' || el.material === 'redSolid') {
    // Cast acrylic: a transmissive shell whose red deepens with the distance light travels through it.
    const solid = minDim >= 0.2;
    const inset = Math.min(0.09, minDim * 0.18);
    const shell = new THREE.MeshPhysicalMaterial({
      color: 0xff2a22,
      metalness: 0,
      roughness: 0.05,
      transmission: el.material === 'red' ? 1 : 0.55,
      // Around a dense core light only crosses the clear rim, so the attenuation runs over the rim, not the block.
      thickness: solid ? inset * 2 : minDim,
      ior: 1.49,
      attenuationColor: new THREE.Color(0xe50107),
      attenuationDistance: solid ? 0.4 : 0.14,
      specularIntensity: 1,
      envMapIntensity: 1.5,
      clearcoat: mats.lite ? 0 : 0.8,
      clearcoatRoughness: 0.04,
    });
    mats.owned.push(shell);
    add(rounded(size.x, size.y, size.z, Math.min(0.03, minDim * 0.22), segments + 1), shell, { cast: true });
    if (solid) {
      // A dense core keeps the block solid (and visible through the glass, which cannot see other transmissive
      // surfaces); its edges sit back from the shell so the rims stay clear.
      add(new THREE.BoxGeometry(size.x - inset * 2, size.y - inset * 2, size.z - inset * 2), mats.redCore, { receive: false });
    }
    return group;
  }

  if (isStone(el.material)) {
    const radius = el.id.endsWith('-plinth') ? 0.035 : Math.min(0.02, minDim * 0.25);
    const geometry = rounded(size.x, size.y, size.z, radius, segments + 1);
    unfoldUVs(geometry, size, Math.max(size.x, size.z) + size.y * 2 + 0.3);
    add(geometry, el.material === 'marble' || el.material === 'warmMarble' ? mats.marble : mats.stone, { cast: true });
    return group;
  }

  return null;
}

/* ─────────────────────────────── contact occlusion ─────────────────────────────── */

/** A soft rectangle of occlusion around a footprint, `margin` (scene units) wide, as a mask texture. */
function contactTexture(w: number, d: number, margin: number): THREE.CanvasTexture {
  const scale = 96 / Math.max(w + margin * 2, d + margin * 2);
  const cw = Math.max(16, Math.round((w + margin * 2) * scale));
  const ch = Math.max(16, Math.round((d + margin * 2) * scale));
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d')!;
  const m = margin * scale;
  // An alpha map reads the green channel, so the mask is white on opaque black (not on transparency).
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, cw, ch);
  // The dense part sits under the footprint; only the blur reaches out. Drawn off-canvas so just the shadow lands
  // (canvas `filter` is not available on every phone).
  ctx.shadowColor = 'rgba(255,255,255,1)';
  ctx.shadowBlur = m * 1.6;
  ctx.shadowOffsetX = 4000;
  ctx.fillStyle = '#fff';
  ctx.fillRect(m * 1.1 - 4000, m * 1.1, cw - m * 2.2, ch - m * 2.2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

/**
 * Baked contact occlusion for everything standing on the plinth (and the plinth on the floor). The sun's shadow
 * map gives direction; these give the soft darkening where surfaces meet, which a shadow map cannot.
 */
export function buildContactOcclusion(elements: readonly BuildElement[], mats: RealismMaterials, owned: (THREE.BufferGeometry | THREE.Texture | THREE.Material)[]): THREE.Group {
  const group = new THREE.Group();
  const plinth = elements.find((el) => el.id.endsWith('-plinth'));
  const top = plinth ? plinth.position[1] + plinth.size[1] / 2 : 0;
  const place = (el: BuildElement, y: number, opacity: number, margin: number) => {
    const [w, , d] = el.size;
    const texture = contactTexture(w, d, margin);
    const material = mats.contact.clone();
    material.alphaMap = texture;
    material.opacity = opacity;
    const geometry = new THREE.PlaneGeometry(w + margin * 2, d + margin * 2).rotateX(-Math.PI / 2);
    owned.push(texture, material, geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(el.position[0], y, el.position[2]);
    mesh.rotation.y = el.rotationY ?? 0;
    mesh.renderOrder = 1;
    group.add(mesh);
  };
  if (plinth) place(plinth, 0.002, 0.42, 0.3);
  for (const el of elements) {
    if (el === plinth || el.material === 'hairline') continue;
    const base = el.position[1] - el.size[1] / 2;
    if (Math.abs(base - top) > 0.02) continue;
    if (el.material === 'figure') {
      place({ ...el, size: [0.09, el.size[1], 0.09] }, top + 0.0015, 0.5, 0.05);
      continue;
    }
    const glass = isGlass(el.material);
    place(el, top + 0.0015, glass ? 0.34 : 0.55, glass ? 0.1 : 0.13);
  }
  return group;
}

/* ─────────────────────────────── the room plate, in the scene ─────────────────────────────── */

/** The plate URL the stage's CSS layer uses, so the scene draws exactly the same photograph. */
export function plateUrlOf(element: HTMLElement): string | null {
  const image = getComputedStyle(element).backgroundImage;
  const match = /url\(["']?([^"')]+)["']?\)/.exec(image ?? '');
  return match ? match[1] : null;
}

/** The vertical `background-position` of an element's plate, as a fraction (`center 70%` → 0.7). */
export function plateYOf(element: HTMLElement, fallback = 0.62): number {
  const match = /(\d+(?:\.\d+)?)%\s*$/.exec(getComputedStyle(element).backgroundPositionY ?? '');
  return match ? Number(match[1]) / 100 : fallback;
}

/** `background-size: cover; background-position: center <y>` (the stage uses 62%), as a texture transform. */
export function fitPlate(texture: THREE.Texture, aspect: number, y = 0.62) {
  const image = texture.image as { width: number; height: number } | undefined;
  if (!image?.width || !image.height) return;
  const imageAspect = image.width / image.height;
  if (aspect > imageAspect) {
    const ry = imageAspect / aspect;
    texture.repeat.set(1, ry);
    texture.offset.set(0, (1 - ry) * (1 - y));
  } else {
    const rx = aspect / imageAspect;
    texture.repeat.set(rx, 1);
    texture.offset.set((1 - rx) / 2, 0);
  }
}

/**
 * The red block's colour bouncing onto the marble around its base, baked as a soft tint. A point light would do
 * the same but leaves a specular hotspot on every polished surface near it.
 */
export function redBounce(elements: readonly BuildElement[], mats: RealismMaterials, owned: (THREE.BufferGeometry | THREE.Texture | THREE.Material)[]): THREE.Mesh | null {
  const volume = (el: BuildElement) => el.size[0] * el.size[1] * el.size[2];
  const core = elements.filter((el) => el.material === 'red').sort((a, b) => volume(b) - volume(a))[0];
  const plinth = elements.find((el) => el.id.endsWith('-plinth'));
  if (!core || !plinth) return null;
  const top = plinth.position[1] + plinth.size[1] / 2;
  if (Math.abs(core.position[1] - core.size[1] / 2 - top) > 0.02) return null;
  const reach = 0.42;
  const texture = contactTexture(core.size[0], core.size[2], reach);
  const material = mats.contact.clone();
  material.color = new THREE.Color(0xe50107);
  material.alphaMap = texture;
  material.opacity = 0.3;
  const geometry = new THREE.PlaneGeometry(core.size[0] + reach * 2, core.size[2] + reach * 2).rotateX(-Math.PI / 2);
  owned.push(texture, material, geometry);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(core.position[0], top + 0.002, core.position[2]);
  mesh.rotation.y = core.rotationY ?? 0;
  mesh.renderOrder = 1;
  return mesh;
}
