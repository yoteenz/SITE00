// usage: node fit.mjs items.json out.json
// item: {id, text, family:'sans'|'serif', weight, ink:[x0,y0,x1,y1], align:'left'|'center'|'right', ls?: fixed letterSpacing px, size?: fixed px, ws?: fixed wordSpacing px}
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { qaChromiumPath } from '../qa-env.mjs';
const [inp, out] = process.argv.slice(2);
const items = JSON.parse(readFileSync(inp, 'utf8'));
const b = await chromium.launch({ executablePath: qaChromiumPath() });
const DEV = process.env.REPLICA_DEV_URL ?? 'http://localhost:5174';
const p = await b.newPage();
await p.goto(`${DEV}/site00/projects/jurnl/fonts/jost-OFL.txt`);
const res = await p.evaluate(async (items) => {
  const F = { sans: 'JA Sans', serif: 'JA Serif' };
  const faces = [['JA Sans', 300, 'jost-300'], ['JA Sans', 400, 'jost-400'], ['JA Sans', 500, 'jost-500'], ['JA Serif', 400, 'jurnl-authority-serif-400'], ['JA Serif', 500, 'jurnl-authority-serif-500'], ['JA Serif', 600, 'jurnl-authority-serif-600'], ['JA Sans', 600, 'jost-600']];
  for (const [fam, w, file] of faces) { const f = new FontFace(fam, `url(/site00/projects/jurnl/fonts/${file}.woff2)`, { weight: String(w) }); await f.load(); document.fonts.add(f); }
  const c = document.createElement('canvas').getContext('2d');
  const meas = (it, S, ls) => { c.font = `${it.weight} ${S}px "${F[it.family]}"`; c.letterSpacing = `${ls}px`; c.wordSpacing = `${it.ws ?? 0}px`; return c.measureText(it.text); };
  return items.map((it) => {
    const [x0, y0, x1, y1] = it.ink; const H = y1 - y0, W = x1 - x0; const n = [...it.text].length;
    let S = it.size ?? 100;
    if (it.size == null) { for (let k = 0; k < 4; k++) { const m = meas(it, S, 0); S = S * H / (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent); } }
    let ls = it.ls ?? 0;
    if (it.ls == null && n > 1) { for (let k = 0; k < 3; k++) { const m = meas(it, S, ls); const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight; ls += (W - w) / (n - 1); } }
    const m = meas(it, S, ls);
    const fA = m.fontBoundingBoxAscent, fD = m.fontBoundingBoxDescent;
    const originX = x0 + m.actualBoundingBoxLeft;
    const top = y0 + m.actualBoundingBoxAscent - (S - (fA + fD)) / 2 - fA; // line-height: 1
    const adv = m.width;
    const r = (v) => Math.round(v * 100) / 100;
    const o = { id: it.id, size: r(S), ls: r(ls), lsEm: r(ls / S * 1000) / 1000, top: r(top), adv: r(adv), inkW: r(m.actualBoundingBoxLeft + m.actualBoundingBoxRight), refW: W, inkH: r(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent), refH: H };
    if (it.align === 'center') o.cx = r(originX + adv / 2); else if (it.align === 'right') o.right = r(originX + adv); else o.left = r(originX);
    return o;
  });
}, items);
writeFileSync(out, JSON.stringify(res, null, 1));
for (const r of res) console.log(JSON.stringify(r));
await b.close();
