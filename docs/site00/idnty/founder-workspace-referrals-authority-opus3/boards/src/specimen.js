// REFERRALS specimen router: one state at the iframe's true viewport.
// ?page=overview|partners|partner|attribution|trace|commissions|payouts|cards|activity|public|portal|cardart
//  &st= &sel= &p=<partner id> &sec= &t=A|B|C &side= &insp=partner|commission|payout &ro=RO-xx &os= &kb= &view= &mode= &w=
import { app, P } from './rf-kit.js';
import * as R from './rf-pages.js';
import { RO } from './rf-overlays.js';

const q = new URLSearchParams(location.search);
const tier = innerWidth < 768 ? 'm' : innerWidth < 1280 ? 't' : 'd';
let spec = Object.fromEntries(q.entries());
let overlay = '';
let scrim = true;
if (spec.ro) {
  const fam = RO[spec.ro](spec.os);
  spec = { ...fam.base, ...spec };
  overlay = fam.html;
  const mode = (overlay.match(new RegExp(`data-${tier}="([a-z-]+)"`)) || [])[1];
  if (mode === 'none') overlay = '';
}
const num = (v, d) => (v === undefined || v === '' ? d : Number(v));
const part = P[spec.p] ?? P.mer;
const crumbs = { partners: 'PARTNERS', attribution: 'ATTRIBUTION', trace: 'ATTRIBUTION', commissions: 'COMMISSIONS', payouts: 'PAYOUTS', cards: 'CARD STUDIO', activity: 'ACTIVITY' };

const PAGES = {
  overview: () => ({ density: 'relaxed', body: R.overview({ st: spec.st }) }),
  partners: () => ({ body: R.partners({ sel: num(spec.sel, -1), st: spec.st }) }),
  partner: () => ({ density: 'relaxed', back: 'PARTNERS', crumb: ['06', 'REFERRALS', 'PARTNERS', part.name.toUpperCase()], body: R.partner({ p: part, sec: num(spec.sec, 0) }) }),
  attribution: () => ({ body: R.attribution({ sel: num(spec.sel, 1) }) }),
  trace: () => ({ back: 'ATTRIBUTION', body: R.trace() }),
  commissions: () => ({ body: R.commissions({ sel: num(spec.sel, 2) }) }),
  payouts: () => ({ body: R.payouts({ sel: num(spec.sel, 1) }) }),
  cards: () => ({ body: R.cards({ p: part, t: spec.t ?? 'A', side: spec.side ?? 'back' }) }),
  activity: () => ({ body: R.activity() }),
};
const INSP = { partner: () => R.partnerInspector(part), commission: () => R.commissionInspector(), payout: () => R.payoutInspector() };

const page = spec.page ?? 'overview';
const kb = spec.kb !== undefined && tier !== 'd' ? Number(spec.kb || (tier === 'm' ? 336 : 398)) : 0;
if (kb) document.documentElement.style.setProperty('--ws-kb', `${kb}px`);
document.body.className = 'ws';

if (page === 'public') document.body.innerHTML = R.publicEntry({ st: spec.st });
else if (page === 'portal') document.body.innerHTML = R.portal({ view: spec.view ?? 'home' });
else if (page === 'cardart') document.body.innerHTML = R.cardArt({ t: spec.t ?? 'A', mode: spec.mode ?? 'flat', w: num(spec.w, 560), test: spec.test === '1' });
else {
  const pg = PAGES[page]();
  const after = `${overlay ? `${scrim ? '<div class="ws-scrim" aria-hidden="true"></div>' : ''}${overlay}` : ''}${kb ? `<div class="ws-kbsim" aria-hidden="true">SOFTWARE KEYBOARD · SIMULATED ${kb}PX</div>` : ''}`;
  document.body.innerHTML = app({ active: 'referrals', crumb: pg.crumb ?? ['06', 'REFERRALS', crumbs[page] ?? 'OVERVIEW'], back: pg.back ?? '', body: pg.body, density: pg.density ?? 'standard', insp: spec.insp ? INSP[spec.insp]() : '', after });
}

function place() {
  for (const el of document.querySelectorAll('.ws-ov[data-anchor-to]')) {
    if (el.dataset[tier] !== 'popover') continue;
    const a = [...document.querySelectorAll(`[data-anchor="${el.dataset.anchorTo}"]`)].find((n) => n.getBoundingClientRect().width > 0);
    if (!a) continue;
    const r = a.getBoundingClientRect();
    const { width: w, height: h } = el.getBoundingClientRect();
    const end = (el.dataset.place || '').endsWith('end');
    const above = (el.dataset.place || '').startsWith('above') || r.bottom + 8 + h > innerHeight - 12;
    el.style.setProperty('--ax', `${end ? r.right - w : r.left}px`);
    el.style.setProperty('--ay', `${above ? Math.max(12, r.top - 8 - h) : r.bottom + 8}px`);
  }
}
document.fonts.ready.then(() => {
  place();
  requestAnimationFrame(() => {
    if (q.get('scroll')) document.getElementById('stage').scrollTop = Number(q.get('scroll'));
    document.body.dataset.ready = '1';
  });
});
