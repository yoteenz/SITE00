/**
 * INVITATION 001 — three physical territories as code-authored compositions.
 * Card faces are HTML/CSS at 300 px per inch so print geometry (bleed, safe area, QR module size) is exact.
 */

export const PX_PER_MM = 300 / 25.4;
export const mm = (v: number) => Math.round(v * PX_PER_MM * 100) / 100;

export type TerritoryId = 'A' | 'B' | 'C';

export type Territory = {
  id: TerritoryId;
  name: string;
  concept: string;
  widthMm: number;
  heightMm: number;
  thicknessMm: number;
  /** Edge colours from front to back, one per laminated ply / edge treatment. */
  edgePlies: string[];
  backFill: string;
  qrSizeMm: number;
  front: (qrSvg: string) => string;
  back: (qrSvg: string) => string;
  typeStudy: { role: string; face: string; size: string; use: string }[];
  finish: string[];
};

export const RED = '#E50107';
export const INK = '#0A0A0A';
export const LIGHT = '#F5F3F3';
export const QR_URL_LABEL = 'site00.com/invite/aio-office-inv001';

export const FONT_LINK =
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;500;600&family=Barlow+Semi+Condensed:wght@500;600;700&family=Barlow:wght@400;500;700&family=Martian+Mono:wdth,wght@75..112.5,300..800&display=block" rel="stylesheet">';

const paperGrain = (opacity: number, tint = '0 0 0') => `
  <svg class="grain" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden="true">
    <filter id="g${Math.round(opacity * 1000)}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 ${tint.split(' ')[0]} 0 0 0 0 ${tint.split(' ')[1]} 0 0 0 0 ${tint.split(' ')[2]} 0 0 0 ${opacity} 0"/></filter>
    <rect width="100%" height="100%" filter="url(#g${Math.round(opacity * 1000)})"/>
  </svg>`;

const wordmark = (color: string, size: number, foil = false) => `
  <div class="wm" style="font-size:${size}px;color:${color}">
    <span class="${foil ? 'foil' : ''}">SITE 00</span><i class="dia" style="width:${size * 0.3}px;height:${size * 0.3}px"></i>
  </div>`;

const qrBox = (qrSvg: string, sizeMm: number, extraClass = '') =>
  `<div class="qr ${extraClass}" style="width:${mm(sizeMm)}px;height:${mm(sizeMm)}px">${qrSvg}</div>`;

export const BASE_CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{background:transparent}
  .face{position:relative;overflow:hidden;font-family:'Barlow',sans-serif;-webkit-font-smoothing:antialiased}
  .grain{position:absolute;inset:0;pointer-events:none;mix-blend-mode:multiply}
  .wm{display:flex;align-items:center;gap:.32em;font-family:'Martian Mono',monospace;font-weight:800;font-stretch:75%;font-variation-settings:'wdth' 75;letter-spacing:.02em;line-height:1}
  .dia{display:inline-block;background:${RED};transform:rotate(45deg);flex-shrink:0}
  .foil{background:linear-gradient(100deg,#8d9096 0%,#f4f5f7 28%,#a7aab0 46%,#ffffff 58%,#8a8d93 78%,#d9dbde 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
  .qr svg{width:100%;height:100%;display:block}
  .lbl{font-family:'Barlow Semi Condensed',sans-serif;font-weight:600;letter-spacing:.14em;text-transform:uppercase}
  .mono{font-family:'Martian Mono',monospace;font-stretch:87.5%;font-variation-settings:'wdth' 87.5}
  .osw{font-family:'Oswald',sans-serif;text-transform:uppercase}
`;

/* ───────────────────────── TERRITORY A — THE INVITATION ───────────────────────── */

const A_CSS = `
  .a{width:${mm(88.9)}px;height:${mm(50.8)}px;background:#FBFAF8;color:${INK}}
  .a .deboss{position:absolute;right:${mm(-7)}px;top:${mm(3)}px;font-family:'Oswald',sans-serif;font-weight:600;font-size:${mm(48)}px;line-height:.8;letter-spacing:-.02em;color:#FBFAF8;
    text-shadow:-2px -2px 1px rgba(255,255,255,.95),2px 2px 2px rgba(0,0,0,.075),4px 5px 8px rgba(0,0,0,.035)}
  .a .tl{position:absolute;left:${mm(6)}px;top:${mm(6)}px}
  .a .tr{position:absolute;right:${mm(6)}px;top:${mm(6.4)}px;text-align:right}
  .a .num{font-size:${mm(2.3)}px;font-weight:500;letter-spacing:.16em}
  .a .hl{position:absolute;left:${mm(6)}px;bottom:${mm(10.5)}px;font-weight:600;font-size:${mm(6.4)}px;line-height:.98;letter-spacing:.005em}
  .a .rule{position:absolute;left:${mm(6)}px;bottom:${mm(8.2)}px;width:${mm(9)}px;height:${mm(0.45)}px;background:${RED}}
  .a .sub{position:absolute;left:${mm(6)}px;bottom:${mm(5)}px;font-size:${mm(2.25)}px;color:#3a3a3a}
  .a .br{position:absolute;right:${mm(6)}px;bottom:${mm(5)}px;font-size:${mm(2.1)}px;color:#6b6b6b;text-align:right}
  .ab{width:${mm(88.9)}px;height:${mm(50.8)}px;background:#FBFAF8;color:${INK}}
  .ab .col{position:absolute;left:${mm(6)}px;top:${mm(6)}px;width:${mm(50)}px}
  .ab .k{font-size:${mm(2.2)}px;color:${RED}}
  .ab .h{margin-top:${mm(2)}px;font-weight:600;font-size:${mm(4.6)}px;line-height:1}
  .ab .b{margin-top:${mm(2.4)}px;font-size:${mm(2.3)}px;line-height:1.34;color:#2c2c2c}
  .ab .p{margin-top:${mm(1.6)}px;font-size:${mm(2.1)}px;color:#555}
  .ab .url{position:absolute;left:${mm(6)}px;bottom:${mm(9.4)}px;font-size:${mm(2.1)}px;font-weight:500;letter-spacing:.02em}
  .ab .hair{position:absolute;left:${mm(6)}px;right:${mm(6)}px;bottom:${mm(7.2)}px;height:1.4px;background:linear-gradient(90deg,#9a9da3,#e9eaec 40%,#9a9da3)}
  .ab .partner{position:absolute;left:${mm(6)}px;bottom:${mm(3.6)}px;font-size:${mm(2.1)}px;color:#7a7a7a}
  .ab .qr{position:absolute;right:${mm(6)}px;top:${mm(6)}px}
  .ab .qcap{position:absolute;right:${mm(6)}px;top:${mm(29.4)}px;width:${mm(22)}px;text-align:center;font-size:${mm(1.9)}px;color:#6b6b6b}
`;

const territoryA: Territory = {
  id: 'A',
  name: 'THE INVITATION',
  concept: 'Luminous architectural luxury. Quiet white stock, black editorial type, blind-debossed 00, silver hairline, red painted edge.',
  widthMm: 88.9,
  heightMm: 50.8,
  thicknessMm: 1.2,
  edgePlies: Array(12).fill(RED),
  backFill: '#FBFAF8',
  qrSizeMm: 22,
  front: () => `<style>${A_CSS}</style>
    <div class="face a">${paperGrain(0.05)}
      <div class="deboss" aria-hidden="true">00</div>
      <div class="tl">${wordmark(INK, mm(3.6))}</div>
      <div class="tr mono num">INVITATION <span class="foil" style="font-weight:700">001</span></div>
      <div class="hl osw">Your business<br/>has an address.</div>
      <div class="rule"></div>
      <div class="sub lbl">Now give it a presence.</div>
      <div class="br lbl">Office edition · N° 001</div>
    </div>`,
  back: (qr) => `<style>${A_CSS}</style>
    <div class="face ab">${paperGrain(0.05)}
      <div class="col">
        <div class="k lbl">Scan to activate</div>
        <div class="h osw">Your digital<br/>foundation.</div>
        <div class="b">Your own domain, professional email, and accounts in your name — set up and secured by SITE 00.</div>
        <div class="p lbl">Scope and price shown before checkout</div>
      </div>
      ${qrBox(qr, 22)}
      <div class="qcap lbl">Invitation 001</div>
      <div class="url mono">${QR_URL_LABEL}</div>
      <div class="hair"></div>
      <div class="partner lbl">Presented through All In One Enterprises Inc</div>
    </div>`,
  typeStudy: [
    { role: 'Wordmark', face: 'Martian Mono 800, width 75', size: '10.2 pt', use: 'SITE 00 + red diamond (current production mark)' },
    { role: 'Headline', face: 'Oswald 600', size: '18 pt', use: 'YOUR BUSINESS HAS AN ADDRESS.' },
    { role: 'Labels', face: 'Barlow Semi Condensed 600, +140 tracking', size: '6.0–6.4 pt', use: 'Sub-line, edition, partner line' },
    { role: 'Body', face: 'Barlow 400', size: '6.5 pt', use: 'Back explanation' },
    { role: 'Numbering / URL', face: 'Martian Mono 500', size: '6.0 pt', use: 'INVITATION 001, fallback URL' },
  ],
  finish: [
    '32 pt (≈ 1.2 mm) bright-white uncoated cotton or duplexed 2 × 16 pt',
    'Black: offset or HP Indigo, 100K only (no rich black on uncoated text)',
    'Blind deboss: “00” on front, one magnesium/brass die',
    'Silver foil: “001” on front, back hairline',
    'Edge paint: SITE 00 red (#E50107 matched Pantone 485 C or closer custom)',
  ],
};

/* ───────────────────────── TERRITORY B — THE ACCESS CARD ───────────────────────── */

const B_CSS = `
  .b{width:${mm(88.9)}px;height:${mm(50.8)}px;background:#0C0C0D;color:#e9eaec}
  .b .grid{position:absolute;inset:0;background-image:linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(0deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:${mm(4)}px ${mm(4)}px;background-position:${mm(2)}px ${mm(1.5)}px}
  .b .gloss{position:absolute;inset:-20%;background:linear-gradient(118deg,transparent 38%,rgba(255,255,255,.07) 47%,rgba(255,255,255,.015) 53%,transparent 60%);mix-blend-mode:screen}
  .b .tl{position:absolute;left:${mm(6)}px;top:${mm(6)}px}
  .b .big{position:absolute;right:${mm(4.5)}px;top:${mm(4)}px;font-family:'Oswald',sans-serif;font-weight:300;font-size:${mm(30)}px;line-height:.82;letter-spacing:.01em;color:transparent;-webkit-text-stroke:2.2px #b8bbc1}
  .b .hl{position:absolute;left:${mm(6)}px;bottom:${mm(9.5)}px;font-weight:500;font-size:${mm(4.4)}px;line-height:1.02;letter-spacing:.02em}
  .b .meta{position:absolute;left:${mm(6)}px;bottom:${mm(5)}px;font-size:${mm(2.1)}px;color:#8d9096}
  .b .redl{position:absolute;right:${mm(6)}px;bottom:${mm(6)}px;width:${mm(14)}px;height:${mm(0.5)}px;background:${RED}}
  .bb{width:${mm(88.9)}px;height:${mm(50.8)}px;background:#0C0C0D;color:#e9eaec}
  .bb .panel{position:absolute;left:${mm(5)}px;top:${mm(5)}px;width:${mm(25)}px;height:${mm(25)}px;background:#fff;display:flex;align-items:center;justify-content:center}
  .bb .qcap{position:absolute;left:${mm(5)}px;top:${mm(31.6)}px;width:${mm(25)}px;text-align:center;font-size:${mm(1.9)}px;color:#8d9096}
  .bb .col{position:absolute;left:${mm(35)}px;top:${mm(6)}px;right:${mm(6)}px}
  .bb .k{font-size:${mm(2.1)}px;color:${RED}}
  .bb .h{margin-top:${mm(1.8)}px;font-weight:500;font-size:${mm(4.2)}px;line-height:1.02}
  .bb .b2{margin-top:${mm(2.2)}px;font-size:${mm(2.3)}px;line-height:1.34;color:#c9cbcf}
  .bb .p{margin-top:${mm(1.6)}px;font-size:${mm(2.0)}px;color:#8d9096}
  .bb .url{position:absolute;left:${mm(35)}px;bottom:${mm(8.6)}px;font-size:${mm(2.0)}px;color:#e9eaec}
  .bb .partner{position:absolute;left:${mm(5)}px;bottom:${mm(3.8)}px;font-size:${mm(2.0)}px;color:#6f7277}
  .bb .dia2{position:absolute;right:${mm(6)}px;bottom:${mm(4.6)}px}
`;

const territoryB: Territory = {
  id: 'B',
  name: 'THE ACCESS CARD',
  concept: 'Private digital access object. Soft-touch black, silver foil, spot-gloss architectural grid, outlined 001 numbering, red edge.',
  widthMm: 88.9,
  heightMm: 50.8,
  thicknessMm: 1.0,
  edgePlies: Array(10).fill(RED),
  backFill: '#0C0C0D',
  qrSizeMm: 22,
  front: () => `<style>${B_CSS}</style>
    <div class="face b">${paperGrain(0.08, '1 1 1')}
      <div class="grid"></div><div class="gloss"></div>
      <div class="big foilstroke" aria-hidden="true">001</div>
      <div class="tl">${wordmark('#e9eaec', mm(3.6), true)}</div>
      <div class="hl osw"><span class="foil">Your next address<br/>begins here.</span></div>
      <div class="meta lbl">Invitation 001</div>
      <div class="redl"></div>
    </div>`,
  back: (qr) => `<style>${B_CSS}</style>
    <div class="face bb">${paperGrain(0.08, '1 1 1')}
      <div class="panel">${qrBox(qr, 22)}</div>
      <div class="qcap lbl">Scan to enter</div>
      <div class="col">
        <div class="k lbl">Activate</div>
        <div class="h osw"><span class="foil">Your digital<br/>foundation.</span></div>
        <div class="b2">A domain you own, professional email, and secured accounts — the base layer of your business, set up by SITE 00.</div>
        <div class="p lbl">Scope and price shown before checkout</div>
      </div>
      <div class="url mono">${QR_URL_LABEL}</div>
      <div class="partner lbl">Presented through All In One Enterprises Inc</div>
      <div class="dia2">${'<i class="dia" style="width:16px;height:16px;display:block"></i>'}</div>
    </div>`,
  typeStudy: [
    { role: 'Wordmark', face: 'Martian Mono 800, width 75 — silver foil', size: '10.2 pt', use: 'SITE 00 + printed red diamond' },
    { role: 'Numbering', face: 'Oswald 300, outlined 0.19 mm stroke — foil', size: '85 pt', use: '001 architectural numeral' },
    { role: 'Headline', face: 'Oswald 500 — silver foil', size: '12.5 pt', use: 'YOUR NEXT ADDRESS BEGINS HERE.' },
    { role: 'Body', face: 'Barlow 400, light grey', size: '6.5 pt', use: 'Back explanation (white ink / grey on black)' },
    { role: 'URL', face: 'Martian Mono 500', size: '5.7 pt', use: 'Fallback URL' },
  ],
  finish: [
    '2 × 16 pt black-through stock (e.g. Colorplan Ebony) or 32 pt black with soft-touch laminate',
    'Silver foil: wordmark, 001 outline, headlines',
    'Spot gloss UV: 4 mm architectural grid on front (reflects only in raking light)',
    'QR on a printed white panel — foil and gloss never touch the QR',
    'Edge paint: SITE 00 red; square corners, no chip, no grouped numerals (not a payment card)',
  ],
};

/* ───────────────────────── TERRITORY C — THE THRESHOLD ───────────────────────── */

const C_W = 55;
const C_H = 100;

const C_CSS = `
  .c{width:${mm(C_W)}px;height:${mm(C_H)}px;background:#FCFBFA;color:${INK}}
  .c .tl{position:absolute;left:${mm(6)}px;top:${mm(6)}px}
  .c .ap{position:absolute;left:${mm(25)}px;top:${mm(13)}px;width:${mm(24)}px;height:${mm(34)}px;background:${RED};
    box-shadow:inset ${mm(0.9)}px ${mm(1.1)}px ${mm(1.4)}px rgba(0,0,0,.38),inset -1px -1px 0 rgba(255,255,255,.35)}
  .c .ap::after{content:'';position:absolute;left:${mm(3)}px;right:${mm(3)}px;bottom:${mm(4)}px;height:${mm(0.35)}px;background:rgba(255,255,255,.55)}
  .c .col{position:absolute;left:${mm(48.1)}px;top:${mm(47)}px;width:${mm(0.9)}px;bottom:${mm(0)}px;background:${RED}}
  .c .thr{position:absolute;left:${mm(6)}px;right:${mm(6)}px;top:${mm(52)}px;height:${mm(0.35)}px;background:${INK}}
  .c .vert{position:absolute;left:${mm(6.3)}px;top:${mm(47)}px;transform:rotate(-90deg);transform-origin:left top;font-size:${mm(2.1)}px;letter-spacing:.24em;color:#6b6b6b;white-space:nowrap}
  .c .stack{position:absolute;left:${mm(6)}px;bottom:${mm(9)}px;font-weight:600;font-size:${mm(6.6)}px;line-height:.92}
  .c .stack em{font-style:normal;color:${RED}}
  .c .foot{position:absolute;left:${mm(6)}px;bottom:${mm(4.6)}px;font-size:${mm(2.0)}px;color:#6b6b6b}
  .cb{width:${mm(C_W)}px;height:${mm(C_H)}px;background:#FCFBFA;color:${INK}}
  .cb .frame{position:absolute;left:${mm(6)}px;top:${mm(13)}px;width:${mm(24)}px;height:${mm(34)}px;border:${mm(0.35)}px solid ${RED}}
  .cb .frame::before{content:'00';position:absolute;left:${mm(2.4)}px;bottom:${mm(1.6)}px;font-family:'Oswald',sans-serif;font-weight:600;font-size:${mm(9)}px;line-height:.8;color:${RED}}
  .cb .k{position:absolute;left:${mm(33)}px;top:${mm(13)}px;width:${mm(16)}px;font-size:${mm(2.0)}px;line-height:1.5;color:#555}
  .cb .h{position:absolute;left:${mm(6)}px;top:${mm(50.6)}px;right:${mm(6)}px;font-weight:600;font-size:${mm(4.4)}px;line-height:1}
  .cb .b{position:absolute;left:${mm(6)}px;top:${mm(60.4)}px;width:${mm(20)}px;font-size:${mm(2.15)}px;line-height:1.36;color:#2c2c2c}
  .cb .qr{position:absolute;right:${mm(6)}px;top:${mm(60)}px}
  .cb .p{position:absolute;left:${mm(6)}px;top:${mm(82.4)}px;font-size:${mm(1.95)}px;color:#555}
  .cb .url{position:absolute;left:${mm(6)}px;top:${mm(86.2)}px;font-size:${mm(1.95)}px}
  .cb .partner{position:absolute;left:${mm(6)}px;top:${mm(90.2)}px;font-size:${mm(1.85)}px;line-height:1.3;color:#7a7a7a}
`;

const territoryC: Territory = {
  id: 'C',
  name: 'THE THRESHOLD',
  concept: 'Experimental architectural object. Tall 55 × 100 mm triplex with a red core; a die-cut aperture opens into the red, a red column and threshold line carry the eye down.',
  widthMm: C_W,
  heightMm: C_H,
  thicknessMm: 1.4,
  edgePlies: [...Array(5).fill('#F4F2EF'), ...Array(4).fill(RED), ...Array(5).fill('#F4F2EF')],
  backFill: '#FCFBFA',
  qrSizeMm: 21,
  front: () => `<style>${C_CSS}</style>
    <div class="face c">${paperGrain(0.05)}
      <div class="tl">${wordmark(INK, mm(3.4))}</div>
      <div class="ap" aria-hidden="true"></div>
      <div class="col"></div>
      <div class="thr"></div>
      <div class="vert mono">INVITATION 001</div>
      <div class="stack osw">Your<br/>next<br/>address<br/>begins<br/><em>here.</em></div>
      <div class="foot lbl">Office edition · N° 001</div>
    </div>`,
  back: (qr) => `<style>${C_CSS}</style>
    <div class="face cb">${paperGrain(0.05)}
      <div class="frame" aria-hidden="true"></div>
      <div class="k lbl">The aperture on the front opens here.</div>
      <div class="h osw">Activate your<br/>digital foundation.</div>
      <div class="b">Your own domain, professional email, and accounts in your name — set up and secured by SITE 00.</div>
      ${qrBox(qr, 21)}
      <div class="p lbl">Scope and price shown before checkout</div>
      <div class="url mono">${QR_URL_LABEL}</div>
      <div class="partner lbl">Presented through<br/>All In One Enterprises Inc</div>
    </div>`,
  typeStudy: [
    { role: 'Wordmark', face: 'Martian Mono 800, width 75', size: '9.6 pt', use: 'SITE 00 + red diamond' },
    { role: 'Stacked headline', face: 'Oswald 600', size: '18.7 pt', use: 'YOUR / NEXT / ADDRESS / BEGINS / HERE.' },
    { role: 'Vertical label', face: 'Martian Mono 500, +240 tracking', size: '6.0 pt', use: 'INVITATION 001 along the column' },
    { role: 'Back headline', face: 'Oswald 600', size: '12.5 pt', use: 'ACTIVATE YOUR DIGITAL FOUNDATION.' },
    { role: 'Body / URL', face: 'Barlow 400 / Martian Mono 500', size: '5.5–6.1 pt', use: 'Explanation, fallback URL' },
  ],
  finish: [
    'Triplex: 2 × 14 pt white + red core sheet (≈ 1.4 mm). Red edge comes from the core — no edge paint',
    'Die-cut aperture 24 × 34 mm through the front ply only, cut before lamination',
    'Red column and threshold rule: PMS red litho; optional letterpress for the threshold line',
    'Tall 55 × 100 mm format needs a custom trim die; does not fit standard card holders',
    'Back “00” printed inside the registration frame that mirrors the aperture',
  ],
};

export const TERRITORIES: Territory[] = [territoryA, territoryB, territoryC];
