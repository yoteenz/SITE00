/**
 * Each overlay's own wax seal (OPUS3 gate 1), lifted from its V9 authority with a disc alpha slightly inside its measured
 * rim — `scripts/jurnl/f05-motion-pilot/lift_dot01_sk03_parts.py`, provenance in `SCENES/F05_DOT01_PILL_SK03.json`
 * (`seals`): no pixel painted, no lettering (the titles never reach the seals).
 *
 * Seating:
 * - on the wide title paper (`'wide'`), the banner already covers the SIDEKICK's own seal, so the screen's seal sits at its
 *   authority place and size;
 * - on the SK03 SIDEKICK's heading paper (`'env'`), its laurel seal is baked into the environment, so the screen's seal is
 *   centred on that seal's disc and scaled (uniformly) just enough to cover it — no rim of the SIDEKICK seal shows. Where an
 *   authority draws a smaller seal than the SIDEKICK's (21 / 24 / 25 / 23 / 28), it is drawn up to the SIDEKICK's size.
 */
import parts from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_PILL_SK03.json';
import seal16 from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SEAL_16.webp';
import seal17 from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SEAL_17.webp';
import seal18 from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SEAL_18.webp';
import seal19 from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SEAL_19.webp';
import seal20 from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SEAL_20.webp';
import seal21 from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SEAL_21.webp';
import seal23 from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SEAL_23.webp';
import seal24 from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SEAL_24.webp';
import seal25 from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SEAL_25.webp';
import seal27 from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SEAL_27.webp';
import seal28 from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SEAL_28.webp';
import seal29 from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SEAL_29.webp';
import type { Dot01Heading, Dot01Layer } from './Dot01Frame';

const SRC = { '16': seal16, '17': seal17, '18': seal18, '19': seal19, '20': seal20, '21': seal21, '23': seal23, '24': seal24, '25': seal25, '27': seal27, '28': seal28, '29': seal29 } as const;
export type SealId = keyof typeof SRC;
type SealMeta = { centre: number[]; radius: number; mask_radius: number; box: number[] };
const META = parts.seals as Record<SealId, SealMeta>;
/** The SK03 SIDEKICK's own laurel seal (disc measured on F05_DOT01_SK03_FIELD.webp). */
export const SK03_SEAL_DISC = { cx: 102, cy: 401, r: 74.5 } as const;

/** The overlay's seal layer, seated for the paper it is drawn on. */
export function screenSeal(id: SealId, on: Dot01Heading): Dot01Layer[] {
  const m = META[id];
  const size = m.box[2]! - m.box[0]!;
  if (on === 'wide') return [{ id: `seal_${id}`, src: SRC[id], box: { x: m.box[0]!, y: m.box[1]!, w: size, h: size }, alt: '' }];
  // cover the SIDEKICK's disc plus its 1.5 px anti-aliased rim; never shrink a seal that is already larger
  const d = size * Math.max(1, (SK03_SEAL_DISC.r + 1.5) / m.mask_radius);
  return [{ id: `seal_${id}`, src: SRC[id], box: { x: SK03_SEAL_DISC.cx - d / 2, y: SK03_SEAL_DISC.cy - d / 2, w: d, h: d }, alt: '' }];
}
