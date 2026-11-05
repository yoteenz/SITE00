/**
 * The founder eight-panel board's own decorative subjects, lifted as cut-outs (scripts/jurnl/f05-motion-pilot/
 * lift_editorial_board_parts.py; provenance in F05_ED_PARTS.json): the medallions, the coin stack, the wax direction
 * seal, the paper clip, the ledgers, the columns, the coin, the amphora, the drapes, the painted landscapes — and the
 * SK01 bust the board draws. `rect` is where each sits on its board panel (panel px): an overlay mounts it there, in
 * board units (`--jb`, one board px of the panel at the folio's width), so it is placed as drawn and never stretched.
 */
import bust from '../../../families/F05_MONEY/EDITORIAL/F05_ED_BUST.webp';
import b01amphora from '../../../families/F05_MONEY/EDITORIAL/F05_ED_B01_AMPHORA.webp';
import b01coin from '../../../families/F05_MONEY/EDITORIAL/F05_ED_B01_COIN.webp';
import b01fabric from '../../../families/F05_MONEY/EDITORIAL/F05_ED_B01_FABRIC.webp';
import b02medallion from '../../../families/F05_MONEY/EDITORIAL/F05_ED_B02_MEDALLION.webp';
import b02coins from '../../../families/F05_MONEY/EDITORIAL/F05_ED_B02_COINS.webp';
import b02fabric from '../../../families/F05_MONEY/EDITORIAL/F05_ED_B02_FABRIC.webp';
import b03seal from '../../../families/F05_MONEY/EDITORIAL/F05_ED_B03_SEAL.webp';
import b04clip from '../../../families/F05_MONEY/EDITORIAL/F05_ED_B04_CLIP.webp';
import b04fabric from '../../../families/F05_MONEY/EDITORIAL/F05_ED_B04_FABRIC.webp';
import b05books from '../../../families/F05_MONEY/EDITORIAL/F05_ED_B05_BOOKS.webp';
import b05fabric from '../../../families/F05_MONEY/EDITORIAL/F05_ED_B05_FABRIC.webp';
import b06medallion from '../../../families/F05_MONEY/EDITORIAL/F05_ED_B06_MEDALLION.webp';
import b06columns from '../../../families/F05_MONEY/EDITORIAL/F05_ED_B06_COLUMNS.webp';
import b06landscape from '../../../families/F05_MONEY/EDITORIAL/F05_ED_B06_LANDSCAPE.webp';
import b06fabric from '../../../families/F05_MONEY/EDITORIAL/F05_ED_B06_FABRIC.webp';
import b07medallion from '../../../families/F05_MONEY/EDITORIAL/F05_ED_B07_MEDALLION.webp';
import b07column from '../../../families/F05_MONEY/EDITORIAL/F05_ED_B07_COLUMN.webp';
import b07fabric from '../../../families/F05_MONEY/EDITORIAL/F05_ED_B07_FABRIC.webp';
import b08fabric from '../../../families/F05_MONEY/EDITORIAL/F05_ED_B08_FABRIC.webp';
import b01coast from '../../../families/F05_MONEY/EDITORIAL/F05_ED_B01_COAST.webp';

export type BoardPart = { src: string; w: number; h: number; rect: readonly [number, number, number, number] | null; panel: string | null };
export const PART = {
  BUST: { src: bust, w: 341, h: 351, rect: null, panel: null },
  B01_AMPHORA: { src: b01amphora, w: 166, h: 210, rect: [220.5, 174.0, 83.0, 105.0], panel: "01" },
  B01_COIN: { src: b01coin, w: 206, h: 206, rect: [219.0, 288.5, 103.0, 103.0], panel: "01" },
  B01_FABRIC: { src: b01fabric, w: 692, h: 884, rect: [0.0, 1.5, 346.0, 442.0], panel: "01" },
  B02_MEDALLION: { src: b02medallion, w: 200, h: 178, rect: [19.0, 8.0, 100.0, 89.0], panel: "02" },
  B02_COINS: { src: b02coins, w: 183, h: 118, rect: [216.5, 336.0, 91.5, 59.0], panel: "02" },
  B02_FABRIC: { src: b02fabric, w: 613, h: 759, rect: [0.0, 1.0, 306.5, 379.5], panel: "02" },
  B03_SEAL: { src: b03seal, w: 140, h: 99, rect: [137.0, 194.0, 70.0, 49.5], panel: "03" },
  B04_CLIP: { src: b04clip, w: 111, h: 139, rect: [50.0, 127.5, 55.5, 69.5], panel: "04" },
  B04_FABRIC: { src: b04fabric, w: 383, h: 494, rect: [0.0, 150.0, 191.5, 247.0], panel: "04" },
  B05_BOOKS: { src: b05books, w: 217, h: 348, rect: [0.0, 204.0, 108.5, 174.0], panel: "05" },
  B05_FABRIC: { src: b05fabric, w: 361, h: 124, rect: [0.0, 352.0, 180.5, 62.0], panel: "05" },
  B06_MEDALLION: { src: b06medallion, w: 259, h: 227, rect: [11.5, 12.0, 129.5, 113.5], panel: "06" },
  B06_COLUMNS: { src: b06columns, w: 137, h: 272, rect: [0.0, 278.0, 68.5, 136.0], panel: "06" },
  B06_LANDSCAPE: { src: b06landscape, w: 566, h: 156, rect: [54.0, 336.0, 283.0, 78.0], panel: "06" },
  B06_FABRIC: { src: b06fabric, w: 120, h: 462, rect: [0.0, 67.0, 60.0, 231.0], panel: "06" },
  B07_MEDALLION: { src: b07medallion, w: 194, h: 179, rect: [20.0, 30.5, 97.0, 89.5], panel: "07" },
  B07_COLUMN: { src: b07column, w: 108, h: 436, rect: [288.0, 196.0, 54.0, 218.0], panel: "07" },
  B07_FABRIC: { src: b07fabric, w: 647, h: 785, rect: [13.0, 12.0, 323.5, 392.5], panel: "07" },
  B08_FABRIC: { src: b08fabric, w: 120, h: 824, rect: [0.0, 2.0, 60.0, 412.0], panel: "08" },
  B01_COAST: { src: b01coast, w: 528, h: 122, rect: [0.0, 399.0, 264.0, 61.0], panel: "01" },
} satisfies Record<string, BoardPart>;
export type PartName = keyof typeof PART;
/** The board panels' size (panel px): the width each overlay's `--jbw` is measured against. */
export const PANEL_W = { '01': 346, '02': 337, '03': 342, '04': 349, '05': 346, '06': 337, '07': 342, '08': 349 } as const;
