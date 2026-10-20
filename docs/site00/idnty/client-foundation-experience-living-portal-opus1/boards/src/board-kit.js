// Board chrome for the YOUR FOUNDATION client authority boards. Every product frame is a live specimen
// (specimen.html) laid out in an iframe at its TRUE viewport width; scaled frames are shrunk after layout.
// These are authority specimens — never screenshots of the live application.

const st = (k, t) => `<span class="st st--${k}">${t}</span>`;
export const S = {
  prop: (t = 'PROPOSED AUTHORITY') => st('refine', t),
  exists: (t = 'EXISTS IN SOURCE') => st('dir', t),
  unwired: (t = 'IN SOURCE · NOT WIRED') => st('unwired', t),
  backend: (t = 'BACKEND DEPENDENCY') => st('backend', t),
  open: (t = 'PRODUCT DECISION OPEN') => st('open', t),
  illus: (t = 'ILLUSTRATIVE DATA') => st('illus', t),
  locked: (t = 'FOUNDER-APPROVED DIRECTION') => st('locked', t),
  security: (t = 'SECURITY BOUNDARY') => st('security', t),
  example: (t = 'EXAMPLE PRICING · NOT A CHARGE') => st('illus', t),
};

export function header({ num, title, sub, tier, fam }) {
  return `<header class="bd-head"><div class="bd-num">${num}</div><div>
      <div class="bd-kicker">SITE 00 / IDNTY / YOUR FOUNDATION / CLIENT LIVING PORTAL${tier ? ` / ${tier}` : ''}${fam ? ` / ${fam}` : ''}</div>
      <h1 class="bd-title">${title}<i></i></h1></div>
    <div class="bd-meta">SPRINT P0.SITE00.IDNTY.CLIENT-FOUNDATION-EXPERIENCE.LIVING-PORTAL-AND-ACCESS-AUTHORITY.OPUS1<br>AMENDED BY …CLIENT-FOUNDATION.DIGITAL-ACCESS-AND-LAUNCH-AUTHORITY-LOCK1 · ACCESS CARD RETIRED<br>STATUS — AUTHORITY SPECIMEN · NOT A LIVE SCREENSHOT · FOUNDER REVIEW REQUIRED</div></header>
  <div class="bd-legend">${S.locked()} ${S.prop()} ${S.exists()} ${S.unwired()} ${S.backend()} ${S.open()} ${S.security()} ${S.illus()}</div>
  <p class="bd-sub">${sub ?? ''} <b>Every frame is a static authority specimen rendered at its true viewport width in Chromium — not a screenshot of the running application.</b> The business, people, dates, prices and references are fictional and illustrative.</p>`;
}

export const section = (n, title, inner, chips = '') =>
  `<section class="bd-section"><h2 class="bd-h2"><b>${n}</b>${title}<span class="bd-rule"></span>${chips}</h2>${inner}</section>`;
export const row = (...frames) => `<div class="bd-row">${frames.join('')}</div>`;
export const foot = (left, right) => `<div class="bd-foot"><span>${left}</span><span>${right}</span></div>`;
export const tier = (w) => (w < 768 ? 'M' : w < 1024 ? 'TP' : w < 1280 ? 'TL' : w < 1920 ? 'D' : 'UW');

/** A live viewport. q = specimen query. scale shrinks after layout. */
export function vp({ w, h, q, scale = 1, title, chips = '', note = '' }) {
  const W = Math.round(w * scale);
  const H = Math.round(h * scale);
  const small = W < 480;
  const bar = `${w} × ${h} · ${tier(w)}${scale !== 1 ? ` · ${Math.round(scale * 100)}%` : ''}`;
  return `<div class="bd-frame">${title ? `<div class="bd-cap" style="width:${W + 2}px"><span class="bd-cap__t">${title}</span><span>${chips}</span></div>` : ''}
    <div class="bd-device" style="width:${W + 2}px"><div class="bd-device__bar"><b>${bar}</b>${small ? '' : '<span>SPECIMEN · NOT LIVE APP</span>'}</div>
    <div class="bd-vp" style="width:${W}px;height:${H}px"><iframe title="${title ?? q}" src="./specimen.html?${q}" width="${w}" height="${h}" style="width:${w}px;height:${h}px;transform:scale(${scale})" loading="eager"></iframe></div></div>
    ${note ? `<div class="bd-note" style="width:${W + 2}px">${note}</div>` : ''}</div>`;
}

export const note = (html, w) => `<div class="bd-note" ${w ? `style="width:${w}px"` : ''}>${html}</div>`;
export const callout = (html, w) => `<div class="bd-callout" ${w ? `style="width:${w}px"` : ''}>${html}</div>`;
export const table = (head, rows, w) =>
  `<table class="bd-t" ${w ? `style="width:${w}px"` : ''}><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
export const col = (w, ...items) => `<div class="bd-colx" style="width:${w}px">${items.join('')}</div>`;

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
        if (ok || Date.now() - t0 > 60000) res(ok);
        else setTimeout(tick, 80);
      };
      tick();
    });
  Promise.all([document.fonts.ready, ...frames.map(ready)]).then((r) => {
    window.__BOARD_FRAMES = { total: frames.length, ready: r.slice(1).filter(Boolean).length };
    document.body.dataset.ready = '1';
  });
}
