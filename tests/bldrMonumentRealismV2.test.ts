/**
 * Monument realism V2 benchmark: opt-in (`?realism=v2`), PLACE · ADVANCED only, default renderer untouched.
 */
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { compose } from '../src/site00/builder-studio/buildObject/composition';
import { buildRealismBody, fitPlate, isRealismBenchmark, type RealismMaterials } from '../src/site00/builder-studio/buildObject/realism';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const engine = read('../src/site00/builder-studio/buildObject/engine.ts');
const stage = read('../src/site00/builder-studio/buildObject/BuildObjectStage.tsx');
const realism = read('../src/site00/builder-studio/buildObject/realism.ts');

const spec = (path: 'SIMPLE' | 'ADVANCED' | 'CUSTOM' | 'WORLD') => ({ path, feel: null, modules: [], pace: null });

function fakeMaterials(): RealismMaterials {
  const physical = () => new THREE.MeshPhysicalMaterial();
  return {
    glass: physical(),
    glassTint: physical(),
    darkGlass: physical(),
    floorGlass: physical(),
    chrome: physical(),
    darkChrome: physical(),
    redCore: new THREE.MeshStandardMaterial(),
    marble: physical(),
    stone: physical(),
    contact: new THREE.MeshBasicMaterial(),
    lite: true,
    owned: [],
  };
}

function bounds(object: THREE.Object3D): THREE.Vector3 {
  object.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
}

describe('BLDR monument realism V2 benchmark', () => {
  it('covers PLACE · ADVANCED only', () => {
    expect(isRealismBenchmark(compose('place', spec('ADVANCED')))).toBe(true);
    for (const path of ['SIMPLE', 'CUSTOM', 'WORLD'] as const) expect(isRealismBenchmark(compose('place', spec(path)))).toBe(false);
    for (const view of ['feel', 'work', 'pace', 'blueprint'] as const) expect(isRealismBenchmark(compose(view, spec('ADVANCED')))).toBe(false);
  });

  it('is opt-in: the stage asks for it only with the flag on the benchmark composition', () => {
    expect(stage).toContain('isRealismBenchmark(composition) ? realismRequested() : null');
    expect(realism).toContain("get('realism') === 'v2'");
    expect(engine).toContain("const realism = options.realism === 'v2';");
  });

  it('leaves the default renderer as it was', () => {
    expect(engine).toContain('Painted glass, not transmission');
    expect(engine).not.toContain('transmission:');
    expect(engine).toContain('Math.sin(now / 5200) * 2.2');
    expect(realism).toContain('transmission: 1');
  });

  it('holds still when idle and adapts resolution instead of dropping effects', () => {
    expect(engine).toContain('reducedMotion || interactive || realism ? 0');
    expect(engine).toContain('!reducedMotion && !interactive && visible && !realism');
    expect(engine).toContain('renderer.transmissionResolutionScale = mobile ? 0.75 : 1');
    expect(engine).toContain('renderer.transmissionResolutionScale = 0.5');
  });

  it('draws the room plate with the CSS cover fit (center 62%)', () => {
    const texture = new THREE.Texture({ width: 640, height: 407 } as unknown as HTMLImageElement);
    // A stage wider than the plate crops top and bottom around 62%.
    fitPlate(texture, 3);
    expect(texture.repeat.x).toBeCloseTo(1);
    expect(texture.repeat.y).toBeCloseTo(640 / 407 / 3);
    expect(texture.offset.y).toBeCloseTo((1 - texture.repeat.y) * 0.38);
    // A phone stage (narrower than the plate) crops the sides, centred.
    fitPlate(texture, 393 / 302);
    expect(texture.repeat.y).toBeCloseTo(1);
    expect(texture.repeat.x).toBeCloseTo(393 / 302 / (640 / 407));
    expect(texture.offset.x).toBeCloseTo((1 - texture.repeat.x) / 2);
  });

  it('builds every element of the benchmark at its true size, without changing the silhouette', () => {
    const mats = fakeMaterials();
    const owned: THREE.BufferGeometry[] = [];
    const elements = compose('place', spec('ADVANCED')).elements;
    for (const el of elements) {
      const body = buildRealismBody(el, mats, owned);
      if (el.material === 'figure') {
        expect(body).toBeNull();
        continue;
      }
      expect(body, el.id).not.toBeNull();
      const size = bounds(body!);
      const frame = el.material === 'glass' ? 0.034 + 0.022 : 0.001;
      for (const [axis, i] of [['x', 0], ['y', 1], ['z', 2]] as const) {
        expect(size[axis], `${el.id}.${axis}`).toBeGreaterThanOrEqual(el.size[i] - 0.001);
        expect(size[axis], `${el.id}.${axis}`).toBeLessThanOrEqual(el.size[i] + frame + 0.001);
      }
    }
    expect(owned.length).toBeGreaterThan(0);
  });

  it('gives glass real panels, red a solid core, and stone a bevel', () => {
    const mats = fakeMaterials();
    const owned: THREE.BufferGeometry[] = [];
    const elements = compose('place', spec('ADVANCED')).elements;
    const byId = (id: string) => buildRealismBody(elements.find((el) => el.id === id)!, mats, owned)!;
    const room = byId('vol-a');
    expect(room.children).toHaveLength(2);
    expect((room.children[0] as THREE.Mesh).material).toBe(mats.glass);
    const core = byId('core');
    expect(core.children).toHaveLength(2);
    expect(((core.children[0] as THREE.Mesh).material as THREE.MeshPhysicalMaterial).transmission).toBe(1);
    expect((core.children[1] as THREE.Mesh).material).toBe(mats.redCore);
    expect(byId('beam').children).toHaveLength(1);
    const plinth = byId('main-plinth').children[0] as THREE.Mesh;
    expect(plinth.geometry.type).toBe('RoundedBoxGeometry');
    const uv = plinth.geometry.getAttribute('uv');
    for (let i = 0; i < uv.count; i += 1) {
      expect(uv.getX(i)).toBeGreaterThanOrEqual(0);
      expect(uv.getX(i)).toBeLessThanOrEqual(1);
    }
  });
});
