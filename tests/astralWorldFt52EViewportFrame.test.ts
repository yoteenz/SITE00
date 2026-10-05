/**
 * P0.E.FT5.2E — Viewport edge-to-edge + scroll height cleanup tests
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  AW_M_01_EXPECTED_STAGE_HEIGHT_390,
  AW_M_01_EXPECTED_STAGE_HEIGHT_430,
  canonicalStageRenderedHeight,
} from '../shared/site00-astral-world/screen-masters/canonicalViewportFrame.js';

describe('P0.E.FT5.2E AW_M_01 viewport frame cleanup', () => {
  it('FT52E-1 — expected canonical stage height at 390px ≈ 841.2px', () => {
    expect(AW_M_01_EXPECTED_STAGE_HEIGHT_390).toBeCloseTo(841.19, 1);
    expect(canonicalStageRenderedHeight(390)).toBeCloseTo(841.19, 1);
  });

  it('FT52E-2 — expected canonical stage height at 430px ≈ 927.5px', () => {
    expect(AW_M_01_EXPECTED_STAGE_HEIGHT_430).toBeCloseTo(927.47, 1);
  });

  it('FT52E-3 — root body margin reset for M01 layered route', () => {
    const css = readFileSync('src/site00/astral-world/styles/astral-world.css', 'utf8');
    expect(css).toContain('html:has(.aw-m01-layered)');
    expect(css).toContain('body:has(.aw-m01-layered)');
    expect(css).toMatch(/body:has\(\.aw-m01-layered\)[\s\S]*margin:\s*0/);
  });

  it('FT52E-4 — redundant mobile nav bottom reserve removed for M01', () => {
    const css = readFileSync('src/site00/astral-world/styles/astral-world.css', 'utf8');
    expect(css).toContain('.aw-experience-root:has(.aw-m01-layered)');
    expect(css).toMatch(/\.aw-experience-root:has\(\.aw-m01-layered\)[\s\S]*padding-bottom:\s*0\s*!important/);
  });

  it('FT52E-5 — M01 stage is full width (no max-width centering gap)', () => {
    const css = readFileSync('src/site00/astral-world/styles/astral-world.css', 'utf8');
    expect(css).toMatch(/\.aw-m01-layered[\s\S]*max-width:\s*none/);
    const src = readFileSync('src/site00/astral-world/components/scenes/AwM01WorldEntryScreen.tsx', 'utf8');
    expect(src).not.toContain('maxWidth={430}');
  });

  it('FT52E-6 — route scene min-height auto for M01 (no 100dvh filler)', () => {
    const css = readFileSync('src/site00/astral-world/styles/astral-world.css', 'utf8');
    expect(css).toMatch(/\.aw-experience-root:has\(\.aw-m01-layered\)[\s\S]*\.aw-route-scene--immersive[\s\S]*min-height:\s*auto/);
  });

  it('FT52E-7 — desktop body margin reset for D01', () => {
    const css = readFileSync('src/site00/astral-world/styles/astral-world.css', 'utf8');
    expect(css).toContain('body:has(.aw-d01-layered)');
    expect(css).toMatch(/\.aw-experience-root:has\(\.aw-d01-layered\)[\s\S]*padding-bottom:\s*0\s*!important/);
  });

  it('FT52E-8 — overscroll background set on html/body for M01', () => {
    const css = readFileSync('src/site00/astral-world/styles/astral-world.css', 'utf8');
    expect(css).toMatch(/body:has\(\.aw-m01-layered\)[\s\S]*background:\s*var\(--aw-bg-deep\)/);
  });

  it('FT52E-9 — mobile routing preserved', () => {
    const scene = readFileSync('src/site00/astral-world/components/scenes/MobileArrivalScene.tsx', 'utf8');
    expect(scene).toContain('AwM01WorldEntryScreen');
  });
});
