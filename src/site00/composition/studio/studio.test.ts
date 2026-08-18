import { describe, expect, it } from 'vitest';
import { createHistoryState, pushHistory, undoHistory, redoHistory } from './history';
import { createAsstsLibraryStudioDocument } from './assts-library-template';
import { clampNormalizedRect, viewportRectToNormalized } from './coordinates';

describe('composition studio history', () => {
  it('undo/redo restores document snapshots', () => {
    const doc = createAsstsLibraryStudioDocument();
    let state = createHistoryState(doc);
    const edited = { ...doc, version: '1.0.1' };
    state = pushHistory(state, edited);
    expect(state.present.version).toBe('1.0.1');
    state = undoHistory(state);
    expect(state.present.version).toBe('1.0.0');
    state = redoHistory(state);
    expect(state.present.version).toBe('1.0.1');
  });
});

describe('composition studio coordinates', () => {
  it('maps viewport rect to normalized space', () => {
    const displayed = { offsetX: 0, offsetY: 0, width: 390, height: 844, scale: 1, visibleSource: { x: 0, y: 0, width: 1, height: 1 } };
    const norm = viewportRectToNormalized({ left: 39, top: 84.4, width: 195, height: 84.4 }, displayed);
    expect(norm.x).toBeCloseTo(0.1, 2);
    expect(norm.y).toBeCloseTo(0.1, 2);
    expect(clampNormalizedRect({ x: -0.1, y: 0, width: 1.2, height: 0.5 }).x).toBe(0);
  });
});
