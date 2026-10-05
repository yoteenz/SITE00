/**
 * Semantic character viewport anchor — authority px on the 432-wide fabrication canvas.
 * Keeps the static figure slot replaceable by a live CharacterRenderer later.
 */
export type CharacterFigureAnchor = {
  centerX: number;
  footY: number;
  width: number;
  height: number;
  groundPlaneY: number;
};

/** Default chamber figure box (authority screens 5414–5429 family). */
export const DEFAULT_CHARACTER_FIGURE_ANCHOR: CharacterFigureAnchor = {
  centerX: 216,
  footY: 258,
  width: 88,
  height: 244,
  groundPlaneY: 262,
};

export function characterFigureBoxFromAnchor(anchor: CharacterFigureAnchor): { x: number; y: number; w: number; h: number } {
  return {
    x: anchor.centerX - anchor.width / 2,
    y: anchor.footY - anchor.height,
    w: anchor.width,
    h: anchor.height,
  };
}
