/**
 * F05 MONEY motion pilot — composition of the 9:16 founder reference (941 x 1672), in source px.
 *
 * Objects (papers, seal, title paper, tag) come from F05_MOTION_GEOMETRY.json, made by extract_layers_9x16.py from
 * the text-free SIDEKICK. Live type is placed here, measured from the reference's ink and checked automatically
 * (runtime ink − SIDEKICK vs reference ink; see 11_VISUAL_FIDELITY_COMPARISON.md).
 */

export const F05_COMPOSITION = {
  /** Source px that may be cropped from each side on narrow screens (stone and red paper only). */
  crop: 30,
  mark: { left: 53, top: 71, size: 38, ls: 0.17, rot: -3.2 },
  money: { left: 163, top: 384, size: 96, ls: 0.133 },
  script: { left: 176, top: 484, size: 43.5, ls: 0.035 },
  band: {
    labelTop: 627,
    labelSize: 22,
    valueTop: 662,
    valueSize: 43,
    centers: [167, 377, 590, 816],
    width: 200,
    dividers: [273, 478, 700],
    dividerTop: 628,
    dividerH: 78,
    captionTop: 716,
  },
  card: { nameLeft: 30, nameTop: 12, nameSize: 32.4, nameLs: 0.085, nameLine: 1.08, namePitch: 35, amountGap: 18, captionGap: 63, linkFromBottom: 72, amountTop: 104, amountSize: 46, noteTop: 152, chevRight: 26, chevBottom: 24 },
  chips: { size: 64, gap: 20, top: 44, right: 908, radius: 15 },
  dots: { x: 404, y: 1268, w: 132, h: 32 },
  nav: { x: 34, y: 1448, w: 870, h: 132, cell: 175, labelSize: 28, glyph: 48, gap: 10, pillRadius: 30 },
} as const;

export type F05Composition = typeof F05_COMPOSITION;
