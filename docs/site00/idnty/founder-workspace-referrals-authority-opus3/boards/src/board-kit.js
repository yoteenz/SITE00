// Board chrome for the Opus 3 REFERRALS boards (adapted from the Opus 2 board kit). Every product frame is a live specimen (specimen.html) rendered
// in an iframe at its TRUE viewport width; scaled frames are shrunk with a transform after layout, never re-laid out.

const st = (k, t) => `<span class="st st--${k}">${t}</span>`;
export const S = {
  prop: (t = 'VISUAL AUTHORITY · PROPOSED') => st('refine', t),
  dir: (t = 'OPUS1/OPUS2 SHELL · APPROVED') => st('dir', t),
  open: (t = 'FOUNDER POLICY OPEN') => st('open', t),
  backend: (t = 'BACKEND GAP') => st('backend', t),
  illus: (t = 'ILLUSTRATIVE DATA') => st('illus', t),
  measured: (t = 'MEASURED') => st('measured', t),
  noprint: (t = 'NOT VALID FOR PRINT') => st('after', t),
  locked: (t = 'LOCKED') => st('locked', t),
};

export function header({ num, title, sub, tier, group }) {
  return `<header class="bd-head"><div class="bd-num">${num}</div><div>
      <div class="bd-kicker">SITE 00 / IDNTY / FOUNDER WORKSPACE / 06 REFERRALS${group ? ` / ${group}` : ''}${tier ? ` / ${tier}` : ''}</div>
      <h1 class="bd-title">${title}<i></i></h1></div>
    <div class="bd-meta">SPRINT P0.SITE00.IDNTY.FOUNDER-WORKSPACE.REFERRALS-AND-PARTNER-COMMERCE-AUTHORITY.OPUS3<br>EXTENDS OPUS1 b82ca64e4 · FD-1…FD-6 c5a773381 · OPUS2 RESPONSIVE 81407c694<br>STATUS — COMPLETE REFERRAL-SYSTEM VISUAL AUTHORITY · FOUNDER REVIEW REQUIRED</div></header>
  <div class="bd-legend">${S.prop()} ${S.dir()} ${S.open()} ${S.backend()} ${S.illus()} ${S.noprint()}</div>
  <p class="bd-sub">${sub ?? ''} <b>Every product frame is a live specimen laid out at its true viewport width in Chromium</b> (scaled frames are shrunk after layout). Partners other than AIO are fictional; all amounts are illustrative and follow EXAMPLE TERMS E-1 / E-2, which are not proposed rates. AIO is shown as PLANNED · NOT ACTIVE. QR codes are deterministic non-scannable placeholders.</p>`;
}

export const section = (n, title, inner, chips = '') =>
  `<section class="bd-section"><h2 class="bd-h2"><b>${n}</b>${title}<span class="bd-rule"></span>${chips}</h2>${inner}</section>`;
export const row = (...frames) => `<div class="bd-row">${frames.join('')}</div>`;
export const foot = (left, right) => `<div class="bd-foot"><span>${left}</span><span>${right}</span></div>`;

const DEVICE = {
  320: 'SMALL PHONE', 375: 'PHONE 375', 390: 'PHONE 390', 430: 'PHONE 430', 768: 'TABLET PORTRAIT', 820: 'TABLET PORTRAIT', 834: 'TABLET PORTRAIT',
  1024: 'TABLET LANDSCAPE', 1194: 'TABLET LANDSCAPE', 1280: 'DESKTOP', 1366: 'DESKTOP', 1440: 'DESKTOP', 1600: 'DESKTOP', 1920: 'DESKTOP · WIDE', 2560: 'ULTRA-WIDE', 3440: 'ULTRA-WIDE',
};
export const tier = (w) => (w < 768 ? 'M' : w < 1024 ? 'TP' : w < 1280 ? 'TL' : w < 1920 ? 'D' : 'UW');

/** A live viewport. q = specimen query. scale shrinks after layout. */
export function vp({ w, h, q, scale = 1, title, chips = '', note = '', label }) {
  const W = Math.round(w * scale);
  const H = Math.round(h * scale);
  const small = W < 560;
  const bar = label ?? (small ? `${w} × ${h} · ${tier(w)} · ${Math.round(scale * 100)}%` : `${DEVICE[w] ?? 'VIEWPORT'} · ${w} × ${h} · ${tier(w)}${scale !== 1 ? ` · SHOWN AT ${Math.round(scale * 100)}%` : ' · 1:1'}`);
  return `<div class="bd-frame">${title ? `<div class="bd-cap"><span class="bd-cap__t">${title}</span><span>${chips}</span></div>` : ''}
    <div class="bd-device" style="width:${W + 2}px"><div class="bd-device__bar"><b>${bar}</b>${small ? '' : '<span>CHROMIUM · DSF 2</span>'}</div>
    <div class="bd-vp" style="width:${W}px;height:${H}px"><iframe title="${title ?? q}" src="./specimen.html?${q}" width="${w}" height="${h}" style="width:${w}px;height:${h}px;transform:scale(${scale})" loading="eager"></iframe></div></div>
    ${note ? `<div class="bd-note" style="width:${W + 2}px">${note}</div>` : ''}</div>`;
}

/** A static image (OPUS1 "before" crops). */
export function img({ src, w, h, scale = 1, title, chips = '', note = '', label }) {
  const W = Math.round(w * scale);
  const H = Math.round(h * scale);
  return `<div class="bd-frame">${title ? `<div class="bd-cap"><span class="bd-cap__t">${title}</span><span>${chips}</span></div>` : ''}
    <div class="bd-device" style="width:${W + 2}px"><div class="bd-device__bar"><b>${label}</b><span>REFERENCE</span></div>
    <div class="bd-vp" style="width:${W}px;height:${H}px"><img src="${src}" style="width:${W}px;height:${H}px" alt="${title}"></div></div>
    ${note ? `<div class="bd-note" style="width:${W + 2}px">${note}</div>` : ''}</div>`;
}

export const note = (html, w) => `<div class="bd-note" ${w ? `style="width:${w}px"` : ''}>${html}</div>`;
export const callout = (html, w) => `<div class="bd-callout" ${w ? `style="width:${w}px"` : ''}>${html}</div>`;
export const table = (head, rows, w) =>
  `<table class="bd-t" ${w ? `style="width:${w}px"` : ''}><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

/** Zone diagram for one viewport: [label, px, cls] columns scaled to `width`. */
export function zones(vw, cols, width = 700) {
  const k = width / vw;
  return `<div class="bd-zone" style="width:${width}px;grid-template-columns:${cols.map((c) => `${Math.max(18, c[1] * k)}px`).join(' ')}">${cols
    .map(([l, px, cls = '']) => `<div class="${cls}"><span>${l}</span><b>${px}</b></div>`)
    .join('')}</div>`;
}

export function mount(html) {
  const el = document.getElementById('board');
  el.innerHTML = html;
  const frames = [...el.querySelectorAll('iframe')];
  const ready = (f) =>
    new Promise((res) => {
      const t0 = Date.now();
      const tick = () => {
        let ok = false;
        try {
          ok = f.contentDocument?.body?.dataset.ready === '1';
        } catch {}
        if (ok || Date.now() - t0 > 40000) res(ok);
        else setTimeout(tick, 80);
      };
      tick();
    });
  Promise.all([document.fonts.ready, ...frames.map(ready)]).then((r) => {
    window.__BOARD_FRAMES = { total: frames.length, ready: r.slice(1).filter(Boolean).length };
    document.body.dataset.ready = '1';
  });
}
