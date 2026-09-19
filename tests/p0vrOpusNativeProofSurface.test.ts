/**
 * P0.VR.OPUS-NATIVE1 — guards for the Phase 23 proof surface.
 *
 * This is the suite the native runtime itself runs, via run_targeted_tests,
 * during the first proof. It therefore asserts the surface's INVARIANTS and
 * never the specific divider value the agent is expected to change — a guard
 * that failed the moment the agent did its job correctly would be a broken
 * guard, not a strict one.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

function read(relative: string): string {
  return readFileSync(path.resolve(process.cwd(), relative), 'utf8');
}

const CSS = 'src/site00/styles/site00-opus-native.css';
const SURFACE = 'src/site00/components/designBench/opusNative/OpusNativeProofSurface.tsx';

describe('P0.VR.OPUS-NATIVE1 — proof surface invariants', () => {
  it('draws every row boundary from the single divider token', () => {
    const css = read(CSS);
    expect(css).toMatch(/--proof-divider:\s*#[0-9a-fA-F]{3,6};/);
    expect(css).toContain('border-bottom: 1px solid var(--proof-divider);');
    expect(css).toContain('border-top: 1px solid var(--proof-divider);');
  });

  it('keeps the divider a legible grey rather than black or invisible', () => {
    const css = read(CSS);
    const match = /--proof-divider:\s*#([0-9a-fA-F]{6});/.exec(css);
    expect(match).not.toBeNull();
    const value = parseInt(match![1].slice(0, 2), 16);
    // Anything darker than 0x40 reads as a frame, anything lighter than 0xf0
    // as no boundary at all. The agent may move freely inside that band.
    expect(value).toBeGreaterThanOrEqual(0x40);
    expect(value).toBeLessThanOrEqual(0xf0);
  });

  it('stays namespaced away from the canonical reconstruction', () => {
    const css = read(CSS);
    expect(css).not.toContain('.tod-');
    for (const selector of css.match(/^\.[a-z0-9_-]+/gm) ?? []) {
      expect(selector.startsWith('.s00-opus')).toBe(true);
    }
  });

  it('renders the proof panel structure the runtime measures', () => {
    const surface = read(SURFACE);
    expect(surface).toContain('s00-opus-proof__row');
    expect(surface).toContain('aria-label="Native Opus proof surface"');
  });
});
