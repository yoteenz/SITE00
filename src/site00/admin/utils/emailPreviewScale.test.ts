import { describe, expect, it } from 'vitest';
import { computeEmailPreviewScale, measureEmailPreviewScaleBox } from './emailPreviewScale';

describe('computeEmailPreviewScale', () => {
  it('returns 1 when viewport exceeds canonical width', () => {
    expect(computeEmailPreviewScale(420, 375, 16)).toBe(1);
    expect(computeEmailPreviewScale(700, 640, 24)).toBe(1);
  });

  it('scales down proportionally on narrow viewports', () => {
    expect(computeEmailPreviewScale(320, 375, 16)).toBeCloseTo(288 / 375);
    expect(computeEmailPreviewScale(390, 375, 20)).toBeCloseTo(350 / 375);
  });

  it('never scales above 100%', () => {
    expect(computeEmailPreviewScale(1200, 640, 0)).toBe(1);
  });
});

describe('measureEmailPreviewScaleBox', () => {
  it('compensates wrapper height when scaled', () => {
    const box = measureEmailPreviewScaleBox(320, 375, 820, 16);
    expect(box.scaledWidth).toBeCloseTo(375 * box.scale);
    expect(box.scaledHeight).toBeCloseTo(820 * box.scale);
  });
});
