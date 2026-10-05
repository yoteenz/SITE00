/**
 * P0.SITE00.AUTHORITY-ASSET-COMPOSITING-AND-FIXED-PANEL-CONVERGENCE1 — compile-time guards.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { characterFigureBoxFromAnchor, DEFAULT_CHARACTER_FIGURE_ANCHOR } from '../shared/site00-character-fabrication/index.js';

const ROOT = join(import.meta.dirname, '..');
const FIGURE = join(ROOT, 'public/site00/character-fabrication/actor/sw017/chamber/figure.webp');

async function cornerAlphaZeroCount(path: string): Promise<number> {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const a = (x: number, y: number) => data[(y * width + x) * channels + (channels - 1)]!;
  const pts: [number, number][] = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];
  return pts.filter(([x, y]) => a(x, y) === 0).length;
}

describe('P0 authority compositing convergence', () => {
  it('character figure anchor centers on chamber axis 216', () => {
    const box = characterFigureBoxFromAnchor(DEFAULT_CHARACTER_FIGURE_ANCHOR);
    expect(box.x + box.w / 2).toBe(DEFAULT_CHARACTER_FIGURE_ANCHOR.centerX);
  });

  it('chamber figure webp has zero alpha outside subject (corners)', async () => {
    expect(existsSync(FIGURE)).toBe(true);
    expect(await cornerAlphaZeroCount(FIGURE)).toBe(4);
  });

  it('production hub authority CSS fixes suspended panel outer height', () => {
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-production-hub-authority.css'), 'utf8');
    expect(css).toMatch(/\.ph--hub \.ph-node[\s\S]*height:\s*113px/);
    expect(css).not.toMatch(/\.ph--hub \.ph-qa[\s\S]*margin:\s*0 10px 10px/);
  });

  it('character figure CSS grounds subject to bottom of slot', () => {
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-character-fabrication-authority.css'), 'utf8');
    expect(css).toContain('object-position: center bottom');
    expect(css).toContain('cf-character-viewport');
  });
});
