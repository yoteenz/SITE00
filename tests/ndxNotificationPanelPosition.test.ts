import { describe, expect, it } from 'vitest';
import { computeNotificationPanelPosition } from '../shared/site00-studio-world-production/projectNotifications/panelPosition.js';

describe('notification panel positioning', () => {
  it('anchors panel within viewport right gutter (16px)', () => {
    const anchor = {
      getBoundingClientRect: () => ({
        top: 48,
        left: 330,
        right: 378,
        bottom: 72,
        width: 48,
        height: 24,
      }),
    } as HTMLElement;

    const position = computeNotificationPanelPosition(anchor, 390, 844);
    expect(position.width).toBeLessThanOrEqual(340);
    expect(position.left).toBeGreaterThanOrEqual(16);
    expect(position.left + position.width).toBeLessThanOrEqual(390 - 16);
    expect(position.top).toBe(80);
    expect(position.maxHeight).toBeGreaterThan(0);
  });

  it('falls back when anchor is hidden (zero rect)', () => {
    const hidden = {
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
      }),
    } as HTMLElement;

    const position = computeNotificationPanelPosition(hidden, 390, 844);
    expect(position.left).toBeGreaterThanOrEqual(16);
    expect(position.left + position.width).toBeLessThanOrEqual(390 - 16);
  });
});
