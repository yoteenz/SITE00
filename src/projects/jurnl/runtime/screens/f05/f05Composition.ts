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
  /** A third row of papers only when the elastic panel gives it this much breathing room beyond its own height. */
  thirdRowSlack: 80,
  mark: { left: 58, top: 71, size: 38, ls: 0.17, rot: -3.2 },
  money: { left: 166, top: 393, size: 96, ls: 0.035 },
  script: { left: 176, top: 478, size: 41 },
  band: {
    labelTop: 627,
    labelSize: 22,
    valueTop: 662,
    valueSize: 50,
    centers: [167, 377, 590, 816],
    width: 200,
    dividers: [273, 478, 700],
    dividerTop: 628,
    dividerH: 78,
    captionTop: 716,
  },
  card: { nameLeft: 33, nameTop: 16, nameSize: 31, nameLine: 1.13, amountTop: 104, amountSize: 46, noteTop: 152, chevRight: 26, chevBottom: 24 },
  chips: { size: 64, gap: 20, top: 44, right: 908, radius: 15 },
  dots: { x: 404, y: 1268, w: 132, h: 32 },
  nav: { x: 34, y: 1452, w: 870, h: 132, cell: 175, labelSize: 30, glyph: 48, pillRadius: 30 },
} as const;

export type F05Composition = typeof F05_COMPOSITION;
