// YOUR FOUNDATION — access specimens: SAVE YOUR FOUNDATION (F), approved launch experience (F2), secure reentry (H),
// overlays (T). LOCK1 founder decision: the client access card is RETIRED — home screen + verified email are the only
// return methods. The two approved images are the founder masters in client-foundation-digital-access-authority-lock1/
// assets, used exactly (the icon via its documented crop derivative); nothing here redraws or regenerates them.
import { C, ic, hero, sec, st, cta, trust, alert, row, foot } from './cf-kit.js';

const LOCK = '../../../client-foundation-digital-access-authority-lock1/assets';
export const ASSETS = {
  iconMaster: `${LOCK}/master/SITE00_FOUNDATION_ICON_MASTER.png`,
  launch: `${LOCK}/master/SITE00_FOUNDATION_LAUNCH_MASTER.png`,
  icon512: `${LOCK}/derived/foundation-icon-512.png`,
  icon192: `${LOCK}/derived/foundation-icon-192.png`,
  apple180: `${LOCK}/derived/apple-touch-icon-foundation-180.png`,
  maskable512: `${LOCK}/derived/foundation-icon-maskable-512.png`,
};
export const LAUNCH_ALT = 'SITE 00 — DIGITAL FOUNDATION. YOUR DIGITAL SPACE AWAITS.';

/** Approved home-screen icon (deployable face-crop derivative). `mask` previews the platform corner mask. */
export const appIcon = ({ size = 58, mask = 'ios', src = ASSETS.icon192 } = {}) =>
  `<img class="appicon appicon--${mask}" src="${src}" width="${size}" height="${size}" alt="" style="width:${size}px;height:${size}px">`;

// ─── F. SAVE YOUR FOUNDATION (home screen) ─────────────────────────────────────────────────────
const HS_SHEET = {
  ios: {
    t: 'SAVE YOUR FOUNDATION · IPHONE',
    steps: [
      ['TAP SHARE', `IN SAFARI’S TOOLBAR, TAP <span class="cf-sysicon">${ic('share')}</span> SHARE.`],
      ['CHOOSE “ADD TO HOME SCREEN”', 'SCROLL THE LIST IF YOU DON’T SEE IT.'],
      ['TAP ADD TO CONFIRM', 'THE NAME IS ALREADY SET TO “MY FOUNDATION”.'],
    ],
    note: 'SITE 00 CAN’T ADD IT FOR YOU — IPHONE ONLY ALLOWS THIS FROM SAFARI’S SHARE MENU.',
  },
  android: {
    t: 'SAVE YOUR FOUNDATION · ANDROID',
    steps: [['TAP “ADD TO HOME SCREEN” BELOW', 'YOUR BROWSER SHOWS ITS OWN CONFIRMATION.'], ['CONFIRM IN THE BROWSER PROMPT', 'MY FOUNDATION APPEARS ON YOUR HOME SCREEN.']],
    note: 'THIS BUTTON ONLY APPEARS WHEN YOUR BROWSER OFFERS INSTALLATION.',
    btn: true,
  },
  manual: {
    t: 'SAVE YOUR FOUNDATION · ANDROID',
    steps: [['OPEN YOUR BROWSER MENU', `TAP <span class="cf-sysicon">${ic('options')}</span> IN THE TOP OR BOTTOM BAR.`], ['CHOOSE “ADD TO HOME SCREEN”', 'SOME BROWSERS CALL IT “INSTALL APP”.'], ['CONFIRM', 'MY FOUNDATION APPEARS ON YOUR HOME SCREEN.']],
    note: 'YOUR BROWSER DIDN’T OFFER A DIRECT INSTALL, SO HERE ARE THE STEPS.',
  },
  desktop: {
    t: 'KEEP YOUR FOUNDATION ONE CLICK AWAY',
    steps: [['BOOKMARK THIS PAGE', 'PRESS ⌘ D ON MAC OR CTRL D ON WINDOWS.'], ['NAME IT “MY FOUNDATION”', 'SAVE IT TO YOUR BOOKMARKS BAR.'], ['ON YOUR PHONE?', 'OPEN ANY SITE 00 EMAIL ON YOUR PHONE, TAP VIEW MY FOUNDATION, THEN SAVE YOUR FOUNDATION FROM THERE.']],
    note: 'THE BOOKMARK SAVES SITE00.COM/FOUNDATION/RETURN — NOT A PRIVATE LINK. ON A NEW DEVICE YOU CONFIRM BY EMAIL.',
  },
};
export function homeSheet(os = 'ios') {
  const h = HS_SHEET[os];
  const preview = `<div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--rule)">${appIcon({ size: 58, mask: os === 'desktop' ? 'none' : os === 'ios' ? 'ios' : 'android' })}<div><div class="cf-row__t">MY FOUNDATION</div><div class="cf-row__s">SITE00.COM · OPENS YOUR FOUNDATION</div></div></div>`;
  return `<div class="cf-sheet" role="dialog" aria-modal="true" aria-label="${h.t}"><div class="cf-grab"></div><div class="cf-sheet__h"><span class="cf-sheet__t">${h.t}</span><button class="cf-sheet__x" type="button" aria-label="CLOSE">${ic('close')}</button></div>
    <div class="cf-sheet__b">${preview}${h.steps.map(([a, b], i) => `<div class="cf-step"><span class="cf-step__n">0${i + 1}</span><div><div class="cf-step__t">${a}</div><div class="cf-step__s">${b}</div></div></div>`).join('')}
    ${h.btn ? cta('ADD TO HOME SCREEN', { icon: 'download' }) : ''}<p class="cf-note">${h.note}</p></div></div>`;
}
export function homePage({ os = 'ios' }, t) {
  if (os === 'installed') {
    const body = `${hero({ i: '—', l: 'MY FOUNDATION', lines: ['ON YOUR', 'HOME SCREEN'], lede: 'YOU OPENED MY FOUNDATION FROM YOUR HOME SCREEN. THERE’S NOTHING ELSE TO SAVE ON THIS DEVICE.', obj: '', wide: true })}<div class="cf-sec">${alert('THIS DEVICE STAYS SIGNED IN FOR 30 DAYS', 'AFTER THAT, OR IF YOU SIGN OUT, YOU CONFIRM BY EMAIL. NOTHING PRIVATE IS STORED IN THE ICON OR SHORTCUT.', { kind: 'ink', icon: 'security' })}</div>${foot('HS')}`;
    return { area: 'overview', body };
  }
  const intro = `${hero({ i: '—', l: 'COME BACK ANYTIME', lines: t === 'm' ? ['SAVE YOUR', 'FOUNDATION'] : ['SAVE YOUR FOUNDATION'], lede: 'ONE TAP BACK TO YOUR FOUNDATION FROM YOUR HOME SCREEN. ON A NEW DEVICE YOU CONFIRM BY EMAIL ONCE. IT’S OPTIONAL — YOUR FOUNDATION IS ALWAYS ONE TAP AWAY IN YOUR EMAIL TOO.', obj: '', wide: true })}
    ${sec('TWO WAYS BACK', `<ul class="cf-rows">${row({ icon: 'download', t: '01  HOME SCREEN', s: 'RECOMMENDED · ONE TAP · MY FOUNDATION ICON.', v: st('open', 'BEST'), red: true })}${row({ icon: 'email', t: '02  EMAIL', s: 'EVERY SITE 00 EMAIL HAS VIEW MY FOUNDATION. ALWAYS WORKS.', arrow: true })}</ul>`)}`;
  return { area: 'overview', body: intro + foot('HS'), sheet: HS_SHEET[os] ? homeSheet(os) : '' };
}

/** Browser chrome strip used on boards to show where the platform control lives (board annotation, not product UI). */
export function osBar(os) {
  if (os === 'ios') return `<div class="os-bar"><span class="os-ic">${ic('back')}</span><span class="os-bar__u">site00.com/foundation/return</span><span class="os-ic os-ic--hl">${ic('share')}</span><span class="os-ic">${ic('grid')}</span></div>`;
  return `<div class="os-bar"><span class="os-ic">${ic('home')}</span><span class="os-bar__u">site00.com/foundation/return</span><span class="os-ic os-ic--hl">${ic('options')}</span></div>`;
}

export function homeScreen() {
  const apps = ['Mail', 'Maps', 'Photos', 'Camera', 'Notes', 'MF', 'Clock', 'Wallet', 'Music', 'Phone', 'Files', 'Settings'];
  return `<div class="hs">${apps.map((a) => `<div class="hs__a">${a === 'MF' ? appIcon({ size: 58, mask: 'ios' }) : '<div class="hs__i"></div>'}<span class="hs__l">${a === 'MF' ? 'My Foundation' : a}</span></div>`).join('')}</div>`;
}

/** Icon presentation specimens: the founder master as supplied, and the deployable derivatives under platform masks. */
export function iconSpecimen({ v = 'master' }) {
  if (v === 'master') return `<img src="${ASSETS.iconMaster}" alt="APPROVED ICON MASTER" style="position:fixed;inset:0;width:100%;height:100%;object-fit:contain;background:#fff">`;
  if (v === 'maskable') return `<div style="position:fixed;inset:0;display:grid;place-items:center;background:#e7e6e2"><img src="${ASSETS.maskable512}" alt="" style="width:86%;height:86%;border-radius:50%"></div>`;
  const mask = v === 'raw' ? 'none' : v;
  return `<div style="position:fixed;inset:0;display:grid;place-items:center;background:#e7e6e2">${appIcon({ size: Math.round(Math.min(innerWidth, innerHeight) * 0.86), mask, src: ASSETS.icon512 })}</div>`;
}

// ─── F2. APPROVED LAUNCH EXPERIENCE (SITE 00-controlled; the OS splash is separate) ─────────────
const LAUNCH_CHIP = {
  ready: '',
  slow: `<div class="ln__chip" role="status">${ic('pending')}<span>OPENING YOUR FOUNDATION…</span></div>`,
  stalled: `<div class="ln__chip" role="status">${ic('network')}<span>STILL OPENING</span><button type="button">TRY AGAIN</button></div>`,
  offline: `<div class="ln__chip" role="status">${ic('network')}<span>YOU’RE OFFLINE</span><button type="button">TRY AGAIN</button></div>`,
};
/** Safe zones of the approved launch master (fractions of 941 × 1672), measured in 03_APPROVED_LAUNCH_ASSET.md. */
export const LAUNCH_SAFE = {
  wordmark: [0.228, 0.093, 0.777, 0.152],
  symbol: [0.417, 0.693, 0.586, 0.785],
  headline: [0.236, 0.829, 0.775, 0.893],
};
export function launch({ st: s = 'ready', guides = '' }) {
  const g = guides ? `<div class="ln__guides" aria-hidden="true">${Object.keys(LAUNCH_SAFE).map((k) => `<i data-k="${k}"></i>`).join('')}</div>` : '';
  return `<div class="ln" data-st="${s}"><div class="ln__frame"><img class="ln__img" src="${ASSETS.launch}" alt="${LAUNCH_ALT}"></div>${g}${LAUNCH_CHIP[s] ?? ''}</div>`;
}

/** Where the master's pixels actually land (object-fit cover/contain + object-position), and whether every safe zone is fully visible. */
export function measureLaunch() {
  const img = document.querySelector('.ln__img');
  if (!img) return null;
  const r = img.getBoundingClientRect();
  const cs = getComputedStyle(img);
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const k = cs.objectFit === 'contain' ? Math.min(r.width / iw, r.height / ih) : Math.max(r.width / iw, r.height / ih);
  const [px, py] = cs.objectPosition.split(' ').map((v) => parseFloat(v) / 100);
  const dw = iw * k;
  const dh = ih * k;
  const x0 = r.left + (r.width - dw) * px;
  const y0 = r.top + (r.height - dh) * py;
  const clip = { l: Math.max(0, r.left), t: Math.max(0, r.top), r: Math.min(innerWidth, r.right), b: Math.min(innerHeight, r.bottom) };
  const zones = {};
  for (const [name, [a, b, c, d]] of Object.entries(LAUNCH_SAFE)) {
    const z = { l: x0 + a * dw, t: y0 + b * dh, r: x0 + c * dw, b: y0 + d * dh };
    zones[name] = { ...z, visible: z.l >= clip.l - 0.5 && z.t >= clip.t - 0.5 && z.r <= clip.r + 0.5 && z.b <= clip.b + 0.5 };
  }
  return { fit: cs.objectFit, scale: k, upscale: k * devicePixelRatio, zones, distorted: Math.abs(dw / dh - iw / ih) > 0.001 };
}

// ─── H. SECURE REENTRY ─────────────────────────────────────────────────────────────────────────
export const REENTRY = {
  session: { l: 'WELCOME BACK', lines: ['WELCOME', 'BACK'], b: `SIGNED IN ON THIS DEVICE AS ${C.short}. OPENING YOUR FOUNDATION.`, a: 'CONTINUE', icon: 'next', busy: true },
  expired: { l: 'SIGN IN AGAIN', lines: ['YOUR SESSION', 'ENDED'], b: 'FOR YOUR SECURITY, YOU’VE BEEN SIGNED OUT ON THIS DEVICE. WE’LL EMAIL YOU A ONE-TIME LINK.', a: 'EMAIL ME A LINK', icon: 'email', field: true },
  verify: { l: 'CONFIRM IT’S YOU', lines: ['CONFIRM', 'IT’S YOU'], b: `ENTER THE EMAIL YOU USED FOR YOUR FOUNDATION. WE’LL SEND A ONE-TIME LINK AND CODE.`, a: 'EMAIL ME A LINK', icon: 'email', field: true },
  sent: { l: 'CHECK YOUR EMAIL', lines: ['CHECK YOUR', 'EMAIL'], b: `IF THAT EMAIL MATCHES A FOUNDATION, A LINK AND A 6-DIGIT CODE ARE ON THEIR WAY. THE LINK WORKS ONCE AND EXPIRES IN 15 MINUTES.`, a: 'CONTINUE', icon: 'next', code: true, resend: true },
  linkexpired: { l: 'LINK EXPIRED', lines: ['THAT LINK', 'EXPIRED'], b: 'SIGN-IN LINKS WORK ONCE AND LAST 15 MINUTES. WE CAN SEND A NEW ONE.', a: 'SEND A NEW LINK', icon: 'email' },
  invalid: { l: 'LINK NOT RECOGNIZED', lines: ['WE DON’T', 'RECOGNIZE', 'THAT LINK'], b: 'IT MAY BE INCOMPLETE OR ALREADY USED. CONFIRM YOUR EMAIL AND WE’LL SEND A FRESH ONE.', a: 'CONFIRM MY EMAIL', icon: 'email' },
  notfound: { l: 'NOT FOUND', lines: ['NOTHING', 'FOUND'], b: 'WE COULDN’T FIND A FOUNDATION FOR THAT LINK. IF YOU HAVE A SITE 00 EMAIL, USE ITS VIEW MY FOUNDATION BUTTON.', a: 'CONFIRM MY EMAIL', icon: 'email' },
  revoked: { l: 'LINK REPLACED', lines: ['THIS LINK WAS', 'REPLACED'], b: 'FOR YOUR SECURITY, SITE 00 REPLACED THIS LINK. USE THE BUTTON IN YOUR LATEST SITE 00 EMAIL, OR CONFIRM YOUR EMAIL TO GET BACK IN.', a: 'CONFIRM MY EMAIL', icon: 'email' },
  wrongid: { l: 'DIFFERENT FOUNDATION', lines: ['ANOTHER', 'FOUNDATION', 'IS OPEN'], b: 'THIS DEVICE IS SIGNED IN TO A DIFFERENT FOUNDATION. SIGN OUT OF IT TO OPEN THIS ONE.', a: 'SIGN OUT AND CONTINUE', icon: 'next', second: 'KEEP THE CURRENT ONE' },
  unavailable: { l: 'TEMPORARILY UNAVAILABLE', lines: ['BACK', 'SHORTLY'], b: 'SIGN-IN IS TEMPORARILY UNAVAILABLE. YOUR FOUNDATION IS SAFE. TRY AGAIN IN A FEW MINUTES.', a: 'TRY AGAIN', icon: 'retry' },
  retry: { l: 'TOO MANY TRIES', lines: ['PLEASE', 'WAIT'], b: 'TOO MANY SIGN-IN ATTEMPTS FROM THIS DEVICE. YOU CAN TRY AGAIN IN 5 MINUTES.', a: 'TRY AGAIN', icon: 'retry', dis: true },
  success: { l: 'SIGNED IN', lines: ['YOU’RE', 'BACK IN'], b: `THIS DEVICE IS SIGNED IN FOR 30 DAYS. SIGN OUT ANY TIME FROM THE MENU.`, a: 'OPEN MY FOUNDATION', icon: 'home' },
};
export function reentry({ st: s = 'verify' }, t) {
  const r = REENTRY[s];
  const field = r.field ? `<div class="cf-field"><label class="cf-field__l">YOUR EMAIL</label><span class="cf-input">M.OKAFOR@…</span></div>` : '';
  const code = r.code ? `<div class="cf-field"><span class="cf-field__l">OR ENTER YOUR 6-DIGIT CODE</span><div class="cf-code"><span class="f">4</span><span class="f">8</span><span class="f">1</span><span></span><span></span><span></span></div><span class="cf-note" style="margin:4px 0 0">USE THE CODE IF YOU OPENED MY FOUNDATION FROM YOUR HOME SCREEN — EMAIL LINKS OPEN IN YOUR BROWSER.</span></div>` : '';
  const btn = r.busy ? `<button class="cf-cta cf-cta--busy" type="button" aria-busy="true"><span>OPENING…</span></button>` : cta(r.a, { icon: r.icon, dis: r.dis });
  const body = `<div class="cf-sys">${hero({ i: '—', l: r.l, lines: r.lines, lede: r.b, obj: t === 'm' ? '' : 'corner' })}
    ${field}${code}<div class="cf-acts${t === 'm' ? '' : ' cf-acts--row'}">${btn}${r.second ? cta(r.second, { kind: 'ghost', icon: '' }) : ''}</div>
    ${r.resend ? `<p class="cf-note">NOTHING YET? <b>RESEND IN 0:42</b> · CHECK SPAM · WRONG EMAIL? GO BACK.</p>` : ''}
    ${trust(s === 'success' || s === 'session' ? 'SECURE SESSION ON THIS DEVICE.' : 'WE NEVER ASK FOR A PASSWORD.')}${foot('IN')}</div>`;
  return { area: 'overview', body, nav: false, session: s === 'success' || s === 'session' };
}

// ─── T. GLOBAL OVERLAYS ────────────────────────────────────────────────────────────────────────
export function drawer() {
  const dest = [['home', 'OVERVIEW', ''], ['roadmap', 'ROADMAP', ''], ['attention', 'NEEDS YOU', '1'], ['folder', 'RECORDS', '']];
  return `<div class="cf-drawer" role="dialog" aria-modal="true" aria-label="MENU"><div style="display:flex;align-items:center;justify-content:space-between"><div class="cf-brand"><span class="cf-brand__mark">SITE 00</span><span class="cf-brand__prod">YOUR FOUNDATION</span></div><button class="cf-sheet__x" type="button" aria-label="CLOSE">${ic('close')}</button></div>
    <div class="cf-sec"><h2 class="cf-sec__h">${C.short}</h2><ul class="cf-rows">${dest.map(([i, l, b]) => `<li class="cf-row"${l === 'OVERVIEW' ? ' style="box-shadow:inset 3px 0 0 var(--red)"' : ''}>${ic(i, 'i cf-row__ic')}<div class="cf-row__tx"><div class="cf-row__t">${l}</div></div>${b ? `<span class="cf-badge">${b}</span>` : ''}${ic('next', 'i cf-row__ar')}</li>`).join('')}</ul></div>
    <div class="cf-sec"><h2 class="cf-sec__h">COME BACK ANYTIME</h2><ul class="cf-rows">${row({ icon: 'download', t: 'SAVE YOUR FOUNDATION', s: 'HOME SCREEN · ONE TAP', arrow: true })}${row({ icon: 'notification', t: 'UPDATES BY EMAIL', arrow: true })}</ul></div>
    <div class="cf-sec"><ul class="cf-rows">${row({ icon: 'help', t: 'HELP', s: 'REPLY TO ANY SITE 00 EMAIL', arrow: true })}${row({ icon: 'unlock', t: 'SIGN OUT ON THIS DEVICE', arrow: true })}</ul></div>
    <p class="cf-note">REF ${C.ref} · SECURE SESSION</p></div>`;
}

const dialog = (title, inner, foot = '') =>
  `<div class="cf-sheet" role="dialog" aria-modal="true" aria-label="${title}"><div class="cf-grab"></div><div class="cf-sheet__h"><span class="cf-sheet__t">${title}</span><button class="cf-sheet__x" type="button" aria-label="CLOSE">${ic('close')}</button></div><div class="cf-sheet__b">${inner}</div>${foot ? `<div class="cf-sheet__f">${foot}</div>` : ''}</div>`;

export const OVERLAYS = {
  menu: () => ({ html: drawer(), scrim: true }),
  signout: () => ({ html: dialog('SIGN OUT ON THIS DEVICE?', `<p class="cf-note">YOU’LL CONFIRM BY EMAIL NEXT TIME YOU OPEN MY FOUNDATION HERE. YOUR PROJECT ISN’T AFFECTED.</p>`, `${cta('SIGN OUT', { kind: 'ink', icon: 'unlock' })}${cta('STAY SIGNED IN', { kind: 'ghost', icon: '' })}`), scrim: true }),
  sensitive: () => ({ html: dialog('OPEN A SENSITIVE RECORD', `<p class="cf-note">THE DOMAIN OWNERSHIP RECORD SHOWS ACCOUNT DETAILS. WE’LL EMAIL A ONE-TIME LINK TO ${C.email} TO OPEN IT ON THIS DEVICE.</p>`, cta('EMAIL ME A LINK', { icon: 'email' })), scrim: true }),
  decline: () => ({ html: dialog('DECLINE DNS CLEANUP?', `${alert('THIS ITEM IS REQUIRED FOR RELIABLE EMAIL', 'DECLINING SENDS YOUR PROPOSAL BACK TO SITE 00 FOR REVIEW. YOU CAN’T PAY UNTIL A NEW VERSION IS READY. NOTHING CHANGES SILENTLY.')}`, `${cta('DECLINE AND SEND FOR REVIEW', { kind: 'ink', icon: 'send' })}${cta('KEEP DNS CLEANUP', { kind: 'out', icon: '' })}`), scrim: true }),
  installed: () => ({ html: `<div class="cf-toast" role="status">${ic('check')}<span>MY FOUNDATION IS ON YOUR HOME SCREEN</span></div>`, scrim: false }),
  offline: () => ({ banner: `<div class="cf-banner" role="status">${ic('network')}<span>YOU’RE OFFLINE · SHOWING STATUS AS OF 4:31 PM</span><button type="button">RETRY</button></div>` }),
  expiring: () => ({ banner: `<div class="cf-banner cf-banner--red" role="alert">${ic('time')}<span>YOUR SECURE VIEW CLOSES IN 2 MINUTES</span><button type="button">STAY SIGNED IN</button></div>` }),
  refreshfail: () => ({ html: `<div class="cf-toast cf-toast--err" role="alert">${ic('warning')}<span>COULDN’T REFRESH · SHOWING STATUS AS OF 4:31 PM</span></div>`, scrim: false }),
  help: () => ({ html: dialog('HELP', `<ul class="cf-rows">${row({ icon: 'email', t: 'REPLY TO ANY SITE 00 EMAIL', s: 'A PERSON AT SITE 00 READS EVERY REPLY.' })}${row({ icon: 'info', t: 'WHAT EACH STATUS MEANS', s: 'OPEN · IN PROGRESS · SUBMITTED · RESOLVED · BLOCKED', arrow: true })}${row({ icon: 'security', t: 'HOW SIGN-IN WORKS', s: 'EMAIL LINKS AND CODES. NEVER A PASSWORD.', arrow: true })}</ul>`), scrim: true }),
};
