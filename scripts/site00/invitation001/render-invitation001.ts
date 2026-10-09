#!/usr/bin/env npx tsx
/**
 * Renders INVITATION 001 founder review artifacts (three physical territories + comparison board).
 *
 *   npx tsx scripts/site00/invitation001/render-invitation001.ts [--out docs/site00/invitation-system/invitation-001/renders]
 *
 * The QR on every render is generated from the canonical invitation contract (`shared/site00-invitation-system/qr.ts`).
 * It is labelled PROTOTYPE until the production destination is deployed and scanned on physical proofs.
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import QRCode from 'qrcode';
import { chromium, type Browser } from 'playwright';
import {
  aioOfficeInvitationCodeValue,
  invitationPublicUrl,
  renderInvitationQrSvg,
} from '../../../shared/site00-invitation-system/index.js';
import { BASE_CSS, FONT_LINK, PX_PER_MM, RED, TERRITORIES, mm, type Territory } from './territories.js';

const outArg = process.argv.indexOf('--out');
const OUT = resolve(outArg >= 0 ? process.argv[outArg + 1] : 'docs/site00/invitation-system/invitation-001/renders');
const HTML_OUT = resolve(OUT, '../html');

const DESTINATION = invitationPublicUrl('https://site00.com', aioOfficeInvitationCodeValue());

function page(body: string, bg = 'transparent', extraCss = ''): string {
  return `<!doctype html><html><head><meta charset="utf-8">${FONT_LINK}<style>${BASE_CSS}body{background:${bg}}${extraCss}</style></head><body>${body}</body></html>`;
}

const MARBLE = `
  <svg width="0" height="0" style="position:absolute"><filter id="marble" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="turbulence" baseFrequency="0.0016 0.0055" numOctaves="5" seed="11"/>
    <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.54  0 0 0 0 0.53  0 0 0 -5 0.9"/>
  </filter></svg>`;

function scene(t: Territory, face: string, opts: { rotX: number; rotZ: number; rotY: number; zoom?: number; origin?: string; w: number; h: number }) {
  const W = mm(t.widthMm);
  const H = mm(t.heightMm);
  const T = t.thicknessMm * PX_PER_MM;
  const n = t.edgePlies.length;
  const stops = (dir: string) =>
    `linear-gradient(${dir},${t.edgePlies.map((c, i) => `${c} ${(i / n) * 100}%,${c} ${((i + 1) / n) * 100}%`).join(',')})`;
  const edgeShade = 'linear-gradient(rgba(0,0,0,.10),rgba(0,0,0,.10))';
  const edges = `
    <div class="edge" style="left:0;top:${H}px;width:${W}px;height:${T}px;transform-origin:top;transform:rotateX(-90deg);background:${stops('to bottom')}"></div>
    <div class="edge" style="left:${W}px;top:0;width:${T}px;height:${H}px;transform-origin:left;transform:rotateY(90deg);background:${edgeShade},${stops('to right')}"></div>
    <div class="edge" style="left:${-T}px;top:0;width:${T}px;height:${H}px;transform-origin:right;transform:rotateY(-90deg);background:${edgeShade},${stops('to left')}"></div>
    <div class="edge" style="left:0;top:${-T}px;width:${W}px;height:${T}px;transform-origin:bottom;transform:rotateX(90deg);background:${stops('to top')}"></div>`;
  return `${MARBLE}
  <div class="stage" style="width:${opts.w}px;height:${opts.h}px">
    <div class="marble"></div><div class="light"></div>
    <div class="zoom" style="transform:scale(${opts.zoom ?? 1});transform-origin:${opts.origin ?? '50% 50%'}">
      <div class="cam">
        <div class="card" style="width:${W}px;height:${H}px;transform:translate(-50%,-50%) rotateX(${opts.rotX}deg) rotateY(${opts.rotY}deg) rotateZ(${opts.rotZ}deg)">
          <div class="contact" style="transform:translateZ(${-T - 1}px) translate(${W * 0.02}px,${H * 0.05}px)"></div>
          <div class="back-face" style="background:${t.backFill};transform:translateZ(${-T}px)"></div>
          ${edges}
          <div class="front-face">${face}<div class="sheen"></div></div>
        </div>
      </div>
    </div>
  </div>`;
}

const SCENE_CSS = `
  .stage{position:relative;overflow:hidden;background:#efedea}
  .marble{position:absolute;inset:0;background:#f3f1ee}
  .marble::after{content:'';position:absolute;inset:0;filter:url(#marble);opacity:.55}
  .light{position:absolute;inset:0;background:radial-gradient(120% 90% at 30% 10%,rgba(255,255,255,.75),rgba(255,255,255,0) 55%),linear-gradient(180deg,rgba(0,0,0,0) 60%,rgba(0,0,0,.06))}
  .zoom{position:absolute;inset:0}
  .cam{position:absolute;inset:0;perspective:2600px;perspective-origin:50% 30%}
  .card{position:absolute;left:50%;top:50%;transform-style:preserve-3d}
  .back-face{position:absolute;inset:0}
  .edge{position:absolute}
  .contact{position:absolute;inset:-1%;background:rgba(24,20,16,.42);filter:blur(22px)}
  .front-face{position:absolute;inset:0;overflow:hidden;isolation:isolate}
  .sheen{position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,rgba(255,255,255,0) 30%,rgba(255,255,255,.18) 48%,rgba(255,255,255,0) 62%)}
`;

type Shot = { file: string; html: string; w: number; h: number; scale?: number; type?: 'png' | 'jpeg' };

async function shoot(browser: Browser, s: Shot): Promise<void> {
  const ctx = await browser.newContext({ viewport: { width: Math.ceil(s.w), height: Math.ceil(s.h) }, deviceScaleFactor: s.scale ?? 1 });
  const p = await ctx.newPage();
  await p.setContent(s.html, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(250);
  const path = join(OUT, s.file);
  await p.screenshot({ path, type: s.type ?? 'png', ...(s.type === 'jpeg' ? { quality: 88 } : {}), omitBackground: (s.type ?? 'png') === 'png' });
  writeFileSync(
    join(HTML_OUT, s.file.replace(/\.(png|jpe?g)$/, '.html')),
    s.html.replace(/data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+/g, '#embedded-render'),
  );
  await ctx.close();
  console.log('rendered', s.file);
}

function specSheet(t: Territory, qr: string, qrModules: number): string {
  const W = mm(t.widthMm);
  const H = mm(t.heightMm);
  const bleed = mm(3.175);
  const safe = mm(3.175);
  const moduleMm = (t.qrSizeMm / qrModules).toFixed(2);
  const rows = t.typeStudy
    .map((r) => `<tr><td>${r.role}</td><td>${r.face}</td><td>${r.size}</td><td>${r.use}</td></tr>`)
    .join('');
  const finish = t.finish.map((f) => `<li>${f}</li>`).join('');
  return `
  <div class="sheet">
    <header><div class="wm" style="font-size:28px"><span>SITE 00</span><i class="dia" style="width:9px;height:9px"></i></div>
      <div class="lbl t">INVITATION 001 · TERRITORY ${t.id} — ${t.name} · PRINT GEOMETRY + TYPE STUDY</div></header>
    <div class="row">
      <div class="art" style="width:${W + bleed * 2}px;height:${H + bleed * 2}px">
        <div class="bleed"></div>
        <div class="trimbox" style="left:${bleed}px;top:${bleed}px;width:${W}px;height:${H}px">${t.back(qr)}</div>
        <div class="trim" style="left:${bleed}px;top:${bleed}px;width:${W}px;height:${H}px"></div>
        <div class="safe" style="left:${bleed + safe}px;top:${bleed + safe}px;width:${W - safe * 2}px;height:${H - safe * 2}px"></div>
        <div class="legend lbl"><b class="k1"></b>BLEED 3.175 MM <b class="k2"></b>TRIM ${t.widthMm} × ${t.heightMm} MM <b class="k3"></b>SAFE 3.175 MM</div>
      </div>
      <div class="notes">
        <h3 class="lbl">QR placement</h3>
        <p>${t.qrSizeMm} × ${t.qrSizeMm} mm printed area including the 4-module quiet zone · QR version 5-H · ${qrModules} modules → ${moduleMm} mm per module (≥ 0.40 mm target for phone cameras at arm's length).</p>
        <p>Black on white only. No foil, gloss, deboss, or texture across the QR or its quiet zone.</p>
        <p class="warn lbl">PROTOTYPE QR · encodes ${DESTINATION} · not print-verified</p>
        <h3 class="lbl">Type study</h3>
        <table>${rows}</table>
        <h3 class="lbl">Finish concept</h3>
        <ul>${finish}</ul>
      </div>
    </div>
  </div>`;
}

const SHEET_CSS = `
  body{background:#f5f3f3;color:#0a0a0a;font-family:'Barlow',sans-serif}
  .sheet{padding:56px 64px;width:2200px}
  header{display:flex;align-items:center;gap:32px;margin-bottom:40px}
  header .t{font-size:20px;color:#555}
  .row{display:flex;gap:64px;align-items:flex-start}
  .art{position:relative;flex-shrink:0;background:repeating-linear-gradient(45deg,#ffd9da 0 6px,#fff 6px 12px)}
  .trimbox{position:absolute;overflow:hidden}
  .trim{position:absolute;outline:2px solid #0a0a0a;pointer-events:none}
  .safe{position:absolute;outline:2px dashed #1d6fe0;pointer-events:none}
  .legend{position:absolute;left:0;top:calc(100% + 18px);font-size:16px;color:#333;display:flex;gap:14px;align-items:center;white-space:nowrap}
  .legend b{display:inline-block;width:22px;height:12px}
  .k1{background:repeating-linear-gradient(45deg,#ffd9da 0 4px,#fff 4px 8px)} .k2{border:2px solid #0a0a0a} .k3{border:2px dashed #1d6fe0}
  .notes{flex:1;font-size:20px;line-height:1.45}
  .notes h3{font-size:16px;color:${RED};margin:28px 0 10px}
  .notes h3:first-child{margin-top:0}
  .notes .warn{display:inline-block;margin-top:6px;padding:8px 12px;border:2px solid ${RED};color:${RED};font-size:15px}
  table{border-collapse:collapse;width:100%;font-size:17px} td{border-top:1px solid #ddd;padding:7px 10px 7px 0;vertical-align:top}
  td:first-child{font-weight:700;width:150px}
  ul{padding-left:22px}
`;

function scaleCompare(t: Territory, frontFile: string): string {
  const s = 7; // px per mm for this diagram
  const card = { w: t.widthMm * s, h: t.heightMm * s };
  const phone = { w: 71.6 * s, h: 147.6 * s };
  const cc = { w: 85.6 * s, h: 53.98 * s };
  return `
  <div class="scale">
    <div class="lbl head">TERRITORY ${t.id} — ${t.name} · TRUE SCALE (1 MM = ${s} PX)</div>
    <div class="items">
      <figure><div class="phone" style="width:${phone.w}px;height:${phone.h}px"><div class="screen"><div class="vf"></div><span class="lbl">PHONE CAMERA · 71.6 × 147.6 MM</span></div></div></figure>
      <figure><img src="${frontFile}" style="width:${card.w}px;height:${card.h}px"/><figcaption class="lbl">INVITATION 001 · ${t.widthMm} × ${t.heightMm} × ${t.thicknessMm} MM</figcaption>
        <div class="ccbox" style="width:${cc.w}px;height:${cc.h}px"><span class="lbl">PAYMENT CARD OUTLINE 85.6 × 54 MM (FOR SIZE ONLY)</span></div></figure>
    </div>
  </div>`;
}

const SCALE_CSS = `
  body{background:#f5f3f3}
  .scale{padding:48px 56px;width:1500px}
  .head{font-size:18px;color:#555;margin-bottom:36px}
  .items{display:flex;gap:80px;align-items:flex-end}
  figure{position:relative}
  figure img{display:block;box-shadow:0 18px 40px rgba(0,0,0,.18)}
  figcaption{margin-top:16px;font-size:16px;color:#333}
  .phone{border-radius:70px;background:#111;padding:18px;box-shadow:0 20px 50px rgba(0,0,0,.25)}
  .screen{position:relative;width:100%;height:100%;border-radius:54px;background:linear-gradient(180deg,#2a2a2c,#18181a);display:flex;align-items:flex-end;justify-content:center;padding-bottom:40px}
  .screen span{color:#aaa;font-size:15px}
  .vf{position:absolute;left:50%;top:40%;width:58%;aspect-ratio:1;transform:translate(-50%,-50%);border:3px solid rgba(255,255,255,.7);border-radius:28px}
  .ccbox{position:absolute;left:0;bottom:44px;border:2px dashed rgba(0,0,0,.35);pointer-events:none}
  .ccbox span{position:absolute;left:0;top:calc(100% + 54px);font-size:14px;color:#777;white-space:nowrap}
`;

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  mkdirSync(HTML_OUT, { recursive: true });
  const qr = await renderInvitationQrSvg({ destinationUrl: DESTINATION });
  const qrModules = QRCode.create(DESTINATION, { errorCorrectionLevel: 'H' }).modules.size + 8;
  writeFileSync(join(OUT, 'invitation001-prototype-qr.svg'), qr);

  const exe = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? join(homedir(), '.cache/ms-playwright/chromium-1148/chrome-linux/chrome');
  const browser = await chromium.launch(existsSync(exe) ? { executablePath: exe } : {});
  try {
    for (const t of TERRITORIES) {
      const W = mm(t.widthMm);
      const H = mm(t.heightMm);
      const key = `territory-${t.id.toLowerCase()}`;
      await shoot(browser, { file: `${key}-front.png`, html: page(t.front(qr)), w: W, h: H, scale: 2 });
      await shoot(browser, { file: `${key}-back.png`, html: page(t.back(qr)), w: W, h: H, scale: 2 });

      const portrait = t.heightMm > t.widthMm;
      const sw = portrait ? 1400 : 1800;
      const sh = portrait ? 1500 : 1200;
      await shoot(browser, {
        file: `${key}-material-three-quarter.jpg`,
        type: 'jpeg',
        w: sw,
        h: sh,
        html: page(scene(t, t.front(qr), { rotX: 52, rotY: 0, rotZ: portrait ? -24 : -18, w: sw, h: sh }), '#efedea', SCENE_CSS),
      });
      await shoot(browser, {
        file: `${key}-material-back.jpg`,
        type: 'jpeg',
        w: sw,
        h: sh,
        html: page(scene(t, t.back(qr), { rotX: 40, rotY: 0, rotZ: portrait ? 14 : 12, w: sw, h: sh }), '#efedea', SCENE_CSS),
      });
      await shoot(browser, {
        file: `${key}-detail-macro.jpg`,
        type: 'jpeg',
        w: 1400,
        h: 1000,
        html: page(
          scene(t, t.front(qr), {
            rotX: 62,
            rotY: 0,
            rotZ: portrait ? -30 : -22,
            zoom: 2.9,
            origin: portrait ? '40% 70%' : '70% 58%',
            w: 1400,
            h: 1000,
          }),
          '#efedea',
          SCENE_CSS,
        ),
      });
      await shoot(browser, { file: `${key}-print-spec.png`, html: page(specSheet(t, qr, qrModules), '#f5f3f3', SHEET_CSS), w: 2328, h: portrait ? 1600 : 1160 });
      await shoot(browser, {
        file: `${key}-in-hand-scale.png`,
        html: page(
          scaleCompare(t, `data:image/png;base64,${readFileSync(join(OUT, `${key}-front.png`)).toString('base64')}`),
          '#f5f3f3',
          SCALE_CSS,
        ),
        w: 1612,
        h: 1300,
      });
    }
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify({ out: OUT, destination: DESTINATION, qr_modules_with_quiet_zone: qrModules }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
