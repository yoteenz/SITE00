/**
 * Vertical ink-span probe: for each named band, reports the first/last row of
 * ink in the golden vs the live capture so text baselines can be aligned.
 */
import sharp from 'sharp';
import fs from 'node:fs';

const G = '/workspace/public/site00/twin-v3-design-page-authority/founder-r5f2-ndxbook/mobile-master.jpg';
const tag = process.argv[2] || 'loop11';
const gold = await sharp(G).resize(768, 1376, { kernel: 'lanczos3' }).png().toBuffer();
const live = fs.readFileSync(`/tmp/r1/${tag}-live.png`);

const BANDS = [
  ['header crumbs', 18, 8, 230, 30],
  ['header status', 540, 8, 200, 30],
  ['nav labels', 10, 44, 700, 30],
  ['context bar', 14, 78, 500, 30],
  ['band label', 14, 116, 300, 26],
  ['band devices', 250, 130, 300, 60],
  ['hero eyebrow', 30, 228, 260, 22],
  ['hero footer', 30, 560, 480, 40],
  ['rail head', 552, 224, 190, 30],
  ['gallery head', 22, 632, 400, 26],
  ['actions row', 30, 790, 700, 28],
  ['structured head', 22, 840, 400, 26],
  ['pipeline head', 22, 1044, 400, 26],
  ['tabs row', 10, 1202, 700, 28],
  ['concept row', 14, 1244, 700, 70],
  ['dock row', 10, 1332, 740, 42],
];

const span = async (buf, [x, y, w, h]) => {
  const { data, info } = await sharp(buf).extract({ left: x, top: y, width: w, height: h })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  let first = -1, last = -1;
  for (let r = 0; r < info.height; r++) {
    let s = 0;
    for (let c = 0; c < info.width; c++) s += 255 - data[r * info.width + c];
    if (s / info.width > 26) { if (first < 0) first = r; last = r; }
  }
  return first < 0 ? null : [first + y, last + y];
};

console.log(`band               gold[y0,y1]   live[y0,y1]   dTop dBot`);
for (const [name, ...box] of BANDS) {
  const a = await span(gold, box);
  const b = await span(live, box);
  const d = a && b ? `${(b[0] - a[0]).toString().padStart(4)} ${(b[1] - a[1]).toString().padStart(4)}` : '   -    -';
  console.log(name.padEnd(18), JSON.stringify(a).padEnd(13), JSON.stringify(b).padEnd(13), d);
}
