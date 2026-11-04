/**
 * F05 MONEY parent — composition of authority 01 (DOT 01 · VIEW ALL ACCOUNTS, 941 x 1672), in source px.
 *
 * Objects (account papers, seal, title paper) come from F05_MOTION_GEOMETRY.json, made by extract_dot01.py from the
 * founder's SK01 SIDEKICK, which is pixel-aligned with authority 01 (doc 04 of the DOT 01 evidence). The JURNL tag
 * paper is part of SK01 itself. Live type and controls are placed here, measured from authority 01's ink and checked
 * automatically (runtime ink vs authority ink).
 */

export const F05_COMPOSITION = {
  /** Source px that may be cropped from each side on narrow screens (stone and red paper only). */
  crop: 30,
  mark: { left: 53, top: 71, size: 38, ls: 0.17, rot: -3.2 },
  money: { left: 168, top: 384, size: 96, ls: 0.133 },
  script: { left: 176, top: 484, size: 43.5, ls: 0.035 },
  band: {
    labelTop: 627,
    labelSize: 22,
    valueTop: 662,
    valueSize: 46,
    centers: [167, 377, 590, 816],
    width: 200,
    dividers: [273, 478, 700],
    dividerTop: 628,
    dividerH: 78,
    captionTop: 716,
  },
  card: { nameLeft: 30, nameTop: 18, nameSize: 32.4, nameLs: 0.085, nameLine: 1.08, namePitch: 35, amountGap: 21, captionGap: 63, linkFromBottom: 72, amountTop: 104, amountSize: 46, noteTop: 152, chevRight: 26, chevBottom: 24 },
  chips: { size: 64, gap: 20, top: 44, right: 908, radius: 15 },
  dots: { x: 405, y: 1306, w: 132, h: 32 },
  /** VIEW ALL ACCOUNTS: the paper strip under the four account papers (ACCOUNTS collection). */
  viewAll: { x: 128, y: 1212, w: 702, h: 80, radius: 22, iconLeft: 64, labelLeft: 210, labelSize: 31, arrowRight: 46 },
  nav: { x: 34, y: 1478, w: 870, h: 138, cell: 175, labelSize: 28, glyph: 48, gap: 10, pillRadius: 30 },
} as const;

export type F05Composition = typeof F05_COMPOSITION;
