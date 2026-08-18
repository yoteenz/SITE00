import { describe, expect, it } from 'vitest';
import {
  computeDisplayedImageBounds,
  normalizedRectToViewport,
  buildCompositionLayout,
} from './engine';
import { ASSTS_LIBRARY_CORRIDOR_COMPOSITION_V1 } from '../compositions/assts-library-corridor-v1';

describe('composition engine', () => {
  it('maps center-top cover correctly for 9:16 source in portrait viewport', () => {
    const displayed = computeDisplayedImageBounds(390, 844, 1080, 1920, 'cover', 'center top');
    expect(displayed.scale).toBeGreaterThan(0);
    expect(displayed.offsetY).toBe(0);
    expect(displayed.height).toBeGreaterThanOrEqual(844);
  });

  it('translates normalized corridor zone into viewport space', () => {
    const zones = buildCompositionLayout(ASSTS_LIBRARY_CORRIDOR_COMPOSITION_V1, 390, 844);
    const corridor = zones.get('central-corridor');
    expect(corridor).toBeDefined();
    expect(corridor!.width).toBeGreaterThan(0);
    expect(corridor!.left + corridor!.width / 2).toBeCloseTo(195, 0);
  });

  it('normalized rect stays stable under horizontal crop', () => {
    const displayed = computeDisplayedImageBounds(390, 844, 1080, 1920, 'cover', 'center top');
    const center = normalizedRectToViewport({ x: 0.5, y: 0.34, width: 0.01, height: 0.01 }, displayed);
    expect(center.left + center.width / 2).toBeCloseTo(195, -1);
  });
});
