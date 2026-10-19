// Specimen router: renders ONE workspace state at the iframe's true viewport.
// ?page=overview|foundations|record|reviews|operations|correspondence|lifecycle|system|testlab
// &st=<page state> &sel=<n> &sec=<record section> &detail=1 &insp=client|task|module|email|review &ol=OL-xx &os=<overlay state> &kb=<px>
import { app, DEMO, SYNTH } from './ws-kit.js';
import * as P from './ws-pages.js';
import { FAMILIES } from './ws-overlays.js';

const q = new URLSearchParams(location.search);
const vw = window.innerWidth;
const tier = vw < 768 ? 'm' : vw < 1280 ? 't' : 'd';
document.documentElement.dataset.tier = tier;

let spec = Object.fromEntries(q.entries());
let overlay = '';
let scrim = true;
if (spec.ol) {
  const fam = FAMILIES[spec.ol](spec.os);
  spec = { ...fam.base, ...spec };
  overlay = fam.html;
  if (fam.scrim === false) scrim = false;
  if (fam.kb && spec.kb === undefined && tier !== 'd') spec.kb = '';
  const mode = (overlay.match(new RegExp(`data-${tier}="([a-z-]+)"`)) || [])[1];
  if (mode === 'none') overlay = '';
}

const num = (v, d = -1) => (v === undefined || v === '' ? d : Number(v));
const NEW_ROW = [{ ...DEMO[6], name: 'Harbor & Pine', cat: 'NOT YET PROVIDED', state: 'INVITED', last: 'NOW', intake: ['NOT STARTED', 'LINK NOT YET OPENED'], email: 'jo@harborpine.invalid' }, ...DEMO.slice(0, 7)];

const PAGES = {
  overview: () => ({ active: 'overview', crumb: ['01', 'OVERVIEW'], density: 'relaxed', body: P.overview({ st: spec.st }) }),
  foundations: () => ({ active: 'foundations', crumb: ['02', 'FOUNDATIONS'], body: P.foundations({ sel: num(spec.sel), st: spec.st, rows: spec.rows === 'new' ? NEW_ROW : spec.st === 'test' ? [...DEMO] : DEMO }) }),
  record: () => {
    const c = spec.c ? DEMO.find((x) => x.name === spec.c) ?? P.H : spec.sec === '3' ? P.C : P.H;
    return { active: 'foundations', crumb: ['02', 'FOUNDATIONS', c.name.toUpperCase()], back: 'FOUNDATIONS', density: 'relaxed', body: P.record({ c, sec: num(spec.sec, 0), qstate: spec.st }) };
  },
  reviews: () => ({ active: 'reviews', crumb: ['03', 'REVIEWS', spec.detail ? P.REVIEWS[num(spec.sel, 0)].c.name.toUpperCase() : 'QUEUE'], back: spec.detail ? 'REVIEWS' : '', body: P.reviews({ sel: num(spec.sel, 0), detail: !!spec.detail, state: spec.state ?? spec.st }) }),
  operations: () => ({ active: 'operations', crumb: ['04', 'OPERATIONS', 'FIELD & EMBER'], body: P.operations({ sel: num(spec.sel, 2) }) }),
  correspondence: () => ({ active: 'correspondence', crumb: ['05', 'CORRESPONDENCE', spec.detail ? 'VELA BOUTIQUE' : 'MESSAGES'], back: spec.detail ? 'CORRESPONDENCE' : '', body: P.correspondence({ sel: num(spec.sel, 0), detail: !!spec.detail }) }),
  lifecycle: () => ({ active: 'correspondence', crumb: ['05', 'CORRESPONDENCE', 'LIFECYCLE EMAIL'], body: P.lifecycle() }),
  system: () => ({ active: 'system', crumb: ['06', 'SYSTEM', 'OVERVIEW'], density: 'compact', body: P.system({ sel: num(spec.sel, 3) }) }),
  testlab: () => ({ active: 'system', crumb: ['06', 'SYSTEM', 'TEST LAB'], density: 'compact', body: P.testlab() }),
  components: () => ({ active: 'overview', crumb: ['00', 'COMPONENT SYSTEM'], body: P.components({ set: spec.set }) }),
};
const INSP = { client: () => P.clientInspector(spec.c ? DEMO.find((x) => x.name === spec.c) : P.H), task: P.taskInspector, module: P.moduleInspector, email: P.emailInspector, review: () => P.reviewInspectorLite() };

const page = PAGES[spec.page ?? 'overview']();
const insp = spec.insp ? INSP[spec.insp]() : '';
const kb = spec.kb !== undefined && tier !== 'd' ? Number(spec.kb || (tier === 'm' ? 336 : 398)) : 0;
const after = `${overlay ? `${scrim ? '<div class="ws-scrim" aria-hidden="true"></div>' : ''}${overlay}` : ''}${kb ? `<div class="ws-kbsim" aria-hidden="true">SOFTWARE KEYBOARD · SIMULATED ${kb}PX</div>` : ''}`;
if (kb) document.documentElement.style.setProperty('--ws-kb', `${kb}px`);

document.body.className = 'ws';
document.body.innerHTML = app({ ...page, insp, search: spec.search ?? '', after });

// Anchor popovers to their trigger (inside the viewport, flipping above when needed).
function place() {
  for (const el of document.querySelectorAll('.ws-ov[data-anchor-to]')) {
    const mode = el.dataset[tier];
    if (mode !== 'popover') continue;
    const key = el.dataset.anchorTo;
    const a = [...document.querySelectorAll(`[data-anchor="${key}"]`)].find((n) => n.getBoundingClientRect().width > 0);
    if (!a) continue;
    const r = a.getBoundingClientRect();
    const w = el.getBoundingClientRect().width;
    const h = el.getBoundingClientRect().height;
    const end = (el.dataset.place || '').endsWith('end');
    const above = (el.dataset.place || '').startsWith('above') || r.bottom + 8 + h > window.innerHeight - 12;
    el.style.setProperty('--ax', `${end ? r.right - w : r.left}px`);
    el.style.setProperty('--ay', `${above ? Math.max(12, r.top - 8 - h) : r.bottom + 8}px`);
  }
}

function measure() {
  const fmt = (el) => { const c = getComputedStyle(el); const fs = parseFloat(c.fontSize); const ls = parseFloat(c.letterSpacing) || 0; return `${Math.round(fs * 10) / 10}PX · ${c.fontWeight} · ${(ls / fs).toFixed(2)}EM`; };
  document.querySelectorAll('[data-measure]').forEach((el) => (el.parentElement.querySelector('[data-out]').textContent = fmt(el)));
  document.querySelectorAll('[data-vw]').forEach((el) => (el.textContent = `VIEWPORT ${innerWidth} PX`));
  document.querySelectorAll('[data-row]').forEach((el) => { const t = el.closest('.ws-label').parentElement.querySelector('.task'); el.textContent = `ROW ${Math.round(t.getBoundingClientRect().height)} PX`; });
}
const params = new URLSearchParams(location.search);
document.fonts.ready.then(() => {
  place();
  measure();
  requestAnimationFrame(() => {
    if (params.get('scroll')) document.getElementById('stage').scrollTop = Number(params.get('scroll'));
    document.body.dataset.ready = '1';
  });
});

window.__WS_SPEC = { spec, tier, kb, hasOverlay: !!overlay, synth: SYNTH.name };
