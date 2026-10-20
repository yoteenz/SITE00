// Specimen router: renders ONE client state at the iframe's true viewport (authority boards only).
// ?p=<page> &st=<state> &os=<platform> &v=<variant> &k=<error kind> &ol=<overlay>
import { frame, tierOf } from './cf-kit.js';
import * as P from './cf-pages.js';
import * as A from './cf-access.js';

const q = Object.fromEntries(new URLSearchParams(location.search).entries());
const tier = tierOf(window.innerWidth);
document.documentElement.dataset.tier = tier;

const PAGES = {
  review: P.review, overview: P.overview, roadmap: P.roadmapPage, needs: P.needs, action: P.action, records: P.records, record: P.record,
  proposal: P.proposal, recs: P.recs, accept: P.accept, pay: P.pay, confirm: P.confirm, progress: P.progress, verify: P.verify,
  complete: P.complete, activity: P.activity, prefs: P.prefs, error: P.error, email: P.email,
  home: A.homePage, card: A.cardPage, reentry: A.reentry,
  cardx: (s) => ({ raw: A.cardExport(s) }),
  splash: (s) => ({ raw: A.splash(s.v === 'dark') }),
  hs: () => ({ raw: `<div style="padding:24px">${A.homeScreen()}</div>` }),
  icon: (s) => ({ raw: `<div style="position:fixed;inset:0">${A.appIcon(s.v === 'dark')}</div>` }),
};

await Promise.all([A.prepareQr(), document.fonts.load('900 40px "SITE 00 Display"'), document.fonts.load('600 12px "Saira Semi Condensed"'), document.fonts.load('400 12px "Saira Semi Condensed"')]);
const page = (PAGES[q.p] ?? P.overview)(q, tier);
let html;
if (page.raw) html = page.raw;
else {
  const ov = q.ol ? A.OVERLAYS[q.ol]() : {};
  html = frame({ ...page, tier, banner: ov.banner ?? '' });
  if (page.sheet) html += `<div class="cf-scrim"></div>${page.sheet}`;
  if (ov.html) html += `${ov.scrim ? '<div class="cf-scrim"></div>' : ''}${ov.html}`;
  if (q.os === 'ios' || q.os === 'android' || q.os === 'manual') { document.documentElement.classList.add('has-os'); html += `<div style="position:fixed;left:0;right:0;bottom:0;z-index:39">${A.osBar(q.os === 'ios' ? 'ios' : 'android')}</div>`; }
}
document.body.innerHTML = html;
if (q.scroll) document.scrollingElement.scrollTop = Number(q.scroll);
await document.fonts.ready;
document.body.dataset.ready = '1';
