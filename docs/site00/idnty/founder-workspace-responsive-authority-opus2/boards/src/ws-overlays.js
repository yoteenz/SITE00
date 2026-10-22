// The 20 overlay families (OPUS1 OL-01…OL-20) with one container mode per tier:
// data-m (phone < 768) · data-t (tablet 768–1279) · data-d (desktop ≥ 1280). See INSPECTOR_AND_OVERLAY_RESPONSIVENESS.md.
import { DF, money, icon, CHECK, mk, st, chip, kbd, btn, iconbtn, plate, ident, field, banner, kv, act, SYNTH } from './ws-kit.js';
import { H, C, AV, FE, V } from './ws-pages.js';

const BASE = DF.config.base_price_minor;

export function ov({ id, m, t, d, w = 560, kind = 'panel', kick = '', title = '', body, foot = '', split = false, anchor = '', place = '', label }) {
  const head = title
    ? `<div class="ws-ov__h"><div>${kick ? `<div class="ws-ov__kick">${kick}</div>` : ''}<h2 class="ws-h2" id="${id}-t">${title}<i class="ws-period"></i></h2></div>${iconbtn('close', 'CLOSE')}</div>`
    : '';
  return `<div class="ws-ov" role="${kind === 'menu' ? 'menu' : 'dialog'}" aria-modal="${kind === 'menu' || kind === 'toast' ? 'false' : 'true'}" ${title ? `aria-labelledby="${id}-t"` : `aria-label="${label ?? id}"`} data-ol="${id}" data-kind="${kind}" data-m="${m}" data-t="${t}" data-d="${d}" ${anchor ? `data-anchor-to="${anchor}"` : ''} ${place ? `data-place="${place}"` : ''} style="--w:${w}px">${head}<div class="ws-ov__b">${body}</div>${foot ? `<div class="ws-ov__f ${split ? 'ws-ov__f--split' : ''}">${foot}</div>` : ''}</div>`;
}

const choice = (on, t, d, test) => `<div class="ws-choice ${on ? 'ws-choice--on' : ''}" role="radio" aria-checked="${on}"><span class="ws-choice__dot"></span><span><b>${t}${test ? chip('test', 'TEST') : ''}</b><span class="d">${d}</span></span></div>`;
const menuItem = (ic, l, k = '', meta = '') => `<div class="ws-menu__i ${k ? `ws-menu__i--${k}` : ''}" role="menuitem" ${k === 'off' ? 'aria-disabled="true"' : ''}>${icon(ic)}<span>${l}</span><span class="ws-meta">${meta}</span></div>`;
const sep = '<div class="ws-menu__sep" role="separator"></div>';
const grid2 = (a, b) => `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px">${a}${b}</div>`;

/** Each family → { base: page spec, html: overlay markup, scrim } */
export const FAMILIES = {
  'OL-01': (s = 'form') => {
    const err = s === 'error';
    const busy = s === 'submitting';
    const fail = s === 'failed';
    const body = `${grid2(choice(true, 'CLIENT FOUNDATION', 'CREATES THE ARTIFACT + PERSONAL LINK'), choice(false, 'SYNTHETIC TEST CLIENT', 'STAGING · ALLOWLISTED EMAIL ONLY', true))}
      ${grid2(field({ label: 'BUSINESS NAME', value: 'Harbor & Pine', data: true, state: busy ? 'ro' : '' }), field({ label: 'CONTACT NAME', value: 'Jo Marlow', data: true, state: busy ? 'ro' : '' }))}
      ${field({ label: 'CONTACT EMAIL', value: err ? 'jo@harborpine' : 'jo@harborpine.invalid', data: true, state: busy ? 'ro' : 'focus', err: err ? 'CHECK THIS EMAIL ADDRESS' : '' })}
      ${s === 'duplicate' ? banner('A FOUNDATION ALREADY USES THIS EMAIL (AVERY STUDIO). CREATING ANOTHER IS ALLOWED — THE API DOES NOT BLOCK DUPLICATES (G-11).', { ic: 'warning' }) : ''}
      ${field({ label: 'REFERRAL SOURCE', value: 'DIRECT', state: busy ? 'ro' : '', opt: true })}
      ${fail ? banner('NOT CREATED — THE SERVER DID NOT CONFIRM A DURABLE WRITE. NOTHING WAS SAVED. RETRY; YOUR ENTRIES ARE KEPT.', { tone: 'red', ic: 'warning' }) : ''}`;
    const primary = busy ? `<button class="ws-btn ws-btn--busy" aria-busy="true" disabled><span>CREATING…</span></button>` : btn(fail ? 'RETRY' : 'CREATE FOUNDATION', { tone: 'red', arrow: !fail, ic: fail ? 'retry' : '' });
    return { base: { page: 'foundations' }, html: ov({ id: 'OL-01', m: 'full', t: 'dialog', d: 'dialog', w: 600, kick: '<b>+</b>NEW FOUNDATION', title: 'CREATE A FOUNDATION', body, foot: `<span class="ws-meta" style="margin-right:auto;align-self:center">NO EMAIL IS SENT</span>${btn('CANCEL', { tone: 'out' })}${primary}` }) };
  },
  'OL-02': () => ({
    base: { page: 'foundations', rows: 'new' },
    html: ov({ id: 'OL-02', m: 'full', t: 'dialog', d: 'dialog', w: 560, kick: `${mk('client')}CONFIRMED BY THE SERVER · 10:42`, title: 'HARBOR & PINE IS READY', body: `<div class="ws-label">PERSONAL LINK · NEVER EXPIRES</div><div class="ws-link"><code class="ws-data">https://site00.com/foundation/Qm9tZ…x2a</code>${btn('COPY', { size: 'sm', ic: 'link' })}</div>${kv([['STATE', 'INVITED · WAITING FOR THE CLIENT'], ['CONTACT', 'jo@harborpine.invalid', true]])}${banner('NO EMAIL WAS SENT. SHARE THE LINK, OR SEND THE INVITATION FROM CORRESPONDENCE.', { tone: 'policy', ic: 'lock' })}`, foot: `${btn('CLIENT VIEW', { tone: 'out', ic: 'external' })}${btn('OPEN FOUNDATION', { arrow: true })}` }),
  }),
  'OL-03': () => ({
    base: { page: 'overview' },
    html: ov({ id: 'OL-03', m: 'drawer', t: 'drawer', d: 'none', w: 320, kind: 'menu', title: 'MENU', body: `${menuItem('checklist', 'OPERATIONS', '', '04')}${menuItem('email', 'CORRESPONDENCE', '', '05')}${sep}${menuItem('checklist', 'READINESS DESK', '', '↗')}${menuItem('email', 'CORRESPONDENCE STUDIO', '', '↗')}${menuItem('external', 'OPEN CLIENT EXPERIENCE', '', '↗')}${sep}${menuItem('user', 'FOUNDER · ADMIN')}${menuItem('back', 'SIGN OUT', 'danger')}` }),
  }),
  'OL-04': (s = 'results') => ({
    base: { page: 'overview' },
    html: ov({
      id: 'OL-04', m: 'full', t: 'palette', d: 'palette', w: 680, label: 'SEARCH AND COMMANDS',
      body: `<span class="ws-search ws-search--focus" style="height:48px">${icon('search')}<span class="ws-data" style="color:var(--ws-ink);font-size:16px">${s === 'empty' ? 'zzq' : 'hor'}</span>${kbd('ESC')}</span>
        ${s === 'empty' ? `<div class="ws-empty" style="padding:18px"><span class="ws-label">NO RESULTS FOR “<span class="ws-data">zzq</span>”</span><span class="ws-meta">SEARCH COVERS CLIENT NAME, EMAIL AND DOMAIN, REVIEWS AND TASKS</span></div>` : `<div><div class="ws-label" style="padding:4px 0 6px">CLIENTS</div><div class="pal__i pal__i--act">${plate('Horizon Freight', { size: 'xs', attn: true })}<span class="ws-who"><b>HORIZON FREIGHT</b><span>INTAKE COMPLETE · <span class="ws-data">ops@horizon-freight.invalid</span></span></span>${kbd('↵')}</div><div class="ws-label" style="padding:12px 0 6px">REVIEWS</div><div class="pal__i">${icon('review')}<span class="ws-who"><b>INTAKE REVIEW · HORIZON FREIGHT</b><span>WAITING 1D</span></span><span></span></div><div class="ws-label" style="padding:12px 0 6px">COMMANDS</div><div class="pal__i">${icon('add')}<span class="ws-who"><b>NEW FOUNDATION</b><span>OPENS THE CREATE DIALOG</span></span>${kbd('N')}</div><div class="pal__i">${icon('server')}<span class="ws-who"><b>GO TO SYSTEM</b><span>06</span></span>${kbd('G')} ${kbd('6')}</div></div>`}`,
      foot: `<span class="ws-meta" style="margin-right:auto">${kbd('↑')} ${kbd('↓')} MOVE · ${kbd('↵')} OPEN · ${kbd('ESC')} CLOSE</span>`,
    }),
    kb: true,
  }),
  'OL-05': () => ({
    base: { page: 'overview' },
    html: ov({ id: 'OL-05', m: 'sheet', t: 'popover', d: 'popover', w: 400, anchor: 'bell', place: 'below-end', kick: 'DERIVED FROM REVIEWS + EVENTS · FD-W19', title: 'NOTIFICATIONS', body: `${act('1D', 'founder', 'HORIZON FREIGHT', 'INTAKE COMPLETED · REVIEW WAITING')}${act('3H', 'founder', 'CARTER & LANE', 'QUOTE V2 NOT YET APPROVED')}${act('2D', 'founder', 'SUMMIT WELLNESS', 'CHANGE REQUESTED')}${act('4D', 'blocked', 'VELA BOUTIQUE', 'TASK BLOCKED · REGISTRAR')}`, foot: `${btn('MARK SEEN', { tone: 'ghost', size: 'sm' })}${btn('OPEN REVIEWS', { size: 'sm', arrow: true })}`, split: true }),
  }),
  'OL-06': () => ({
    base: { page: 'foundations', sel: 0 },
    html: ov({ id: 'OL-06', m: 'action', t: 'popover', d: 'popover', w: 280, kind: 'menu', anchor: 'rowmenu', place: 'below-end', label: 'ROW ACTIONS · HORIZON FREIGHT', body: `${menuItem('external', 'OPEN FOUNDATION', 'act', '↵')}${menuItem('link', 'COPY PERSONAL LINK', '', 'C')}${menuItem('view', 'CLIENT VIEW')}${menuItem('message', 'MESSAGE CLIENT')}${sep}${menuItem('send', 'RESEND INVITATION', 'off', 'N/A · G-05')}${menuItem('lock', 'REVOKE LINK', 'off', 'N/A · G-06')}` }),
  }),
  'OL-07': () => ({
    base: { page: 'foundations' },
    html: ov({ id: 'OL-07', m: 'sheet', t: 'popover', d: 'popover', w: 360, anchor: 'filter', place: 'below-end', title: 'FILTER + SORT', body: `<div><div class="ws-label">WHOSE MOVE</div><div style="display:grid;gap:8px;margin-top:10px">${['FOUNDER', 'CLIENT', 'SITE 00'].map((t, i) => `<span class="ws-check"><span class="ws-check__b ${i === 0 ? 'ws-check__b--on' : ''}"></span><span class="ws-body">${t}</span></span>`).join('')}</div></div><div><div class="ws-label">SORT</div><div style="display:grid;gap:8px;margin-top:10px">${choice(true, 'NEXT ACTION · FOUNDER FIRST', 'DEFAULT')}${choice(false, 'LAST ACTIVITY', 'NEWEST FIRST')}${choice(false, 'CLIENT NAME', 'A → Z')}</div></div><span class="ws-check"><span class="ws-check__b"></span><span class="ws-body">SHOW SYNTHETIC TEST CLIENTS</span></span>`, foot: `${btn('RESET', { tone: 'ghost', size: 'sm' })}${btn('APPLY', { size: 'sm' })}`, split: true }),
  }),
  'OL-08': () => ({
    base: { page: 'record', sec: 3 },
    html: ov({ id: 'OL-08', m: 'sheet', t: 'dialog', d: 'dialog', w: 500, kick: 'QUOTE V2 · CARTER & LANE', title: 'APPROVE THIS QUOTE?', body: `${kv([['SUBTOTAL', money(BASE + 26000)], ['LINES', '4 · 1 MANUAL'], ['EXPIRES', `${DF.config.quote_expiry_days} DAYS AFTER SENDING`]])}<p class="ws-meta" style="margin:0;line-height:1.5">APPROVAL MARKS THE QUOTE COMMERCIALLY READY. AMOUNTS ARE NOT RECALCULATED. THE CLIENT SEES IT IN THEIR PORTAL; NO EMAIL IS SENT WHILE SENDING IS OFF.</p>`, foot: `${btn('CANCEL', { tone: 'out' })}${btn('APPROVE QUOTE', { arrow: true })}` }),
  }),
  'OL-09': () => ({
    base: { page: 'record', sec: 3 },
    html: ov({ id: 'OL-09', m: 'full', t: 'dialog', d: 'dialog', w: 720, kick: 'QUOTE V2 → V3', title: 'REVISE QUOTE', body: `<table class="qt"><thead><tr><th>ITEM</th><th class="n">QTY</th><th class="n">AMOUNT</th></tr></thead><tbody><tr><td>BASE DIGITAL FOUNDATION</td><td class="n">1</td><td class="n">${money(BASE)}</td></tr><tr><td>ADDITIONAL MAILBOX</td><td class="n">5</td><td class="n">${money(6000)}</td></tr><tr><td>DOMAIN TRANSFER · MANUAL</td><td class="n">1</td><td class="n">${money(10000)}</td></tr></tbody></table>${field({ label: 'MANUAL ADJUSTMENT', value: '-$50.00', data: true, state: 'focus', hint: 'RECORDED AS manual-adjustment ON V3 · THE ORIGINAL STAYS ON V2' })}${field({ label: 'REASON', value: 'Registrar transfer handled by client', data: true })}`, foot: `${btn('CANCEL', { tone: 'out' })}${btn('CREATE V3', { arrow: true })}` }),
  }),
  'OL-10': () => ({
    base: { page: 'operations' },
    html: ov({ id: 'OL-10', m: 'full', t: 'dialog', d: 'dialog', w: 560, kick: 'FIELD & EMBER · RECORDS', title: 'MARK FOUNDATION COMPLETE', body: `${banner('THE COMPLETION GATE IS OPEN · 3 REASONS. MARK COMPLETE STAYS DISABLED UNTIL EVERY REASON CLEARS.', { tone: 'red', ic: 'blocked' })}${grid2(field({ label: 'DOMAIN OWNER', ph: 'ENTER OWNER', req: true }), field({ label: 'REGISTRAR ACCOUNT', ph: 'ENTER ACCOUNT', req: true }))}${field({ label: 'EMAIL ADMIN', ph: 'ENTER ADMIN', req: true, hint: 'NO DEFAULTS — FD-W17 REPLACES R2’S HARD-CODED TBD VALUES' })}`, foot: `${btn('CANCEL', { tone: 'out' })}<button class="ws-btn ws-btn--off" disabled aria-disabled="true">${icon('lock')}<span>MARK COMPLETE</span></button>` }),
  }),
  'OL-11': () => ({
    base: { page: 'reviews', detail: true, state: 'revise' },
    html: ov({ id: 'OL-11', m: 'sheet', t: 'dialog', d: 'none', w: 520, kick: 'INTAKE · HORIZON FREIGHT', title: 'REQUEST REVISION', body: field({ label: 'NOTE TO CLIENT', value: 'Please confirm who manages the registrar account.', data: true, state: 'focus', area: true, req: true }), foot: `${btn('CANCEL', { tone: 'out' })}${btn('SEND REQUEST', { arrow: true })}` }),
    kb: true,
  }),
  'OL-12': () => ({ base: { page: 'operations', insp: 'task' }, html: '' }),
  'OL-13': () => ({
    base: { page: 'operations', insp: 'task' },
    html: ov({ id: 'OL-13', m: 'sheet', t: 'dialog', d: 'dialog', w: 500, kick: 'DKIM RECORD', title: 'SET BLOCKER', body: `<div style="display:grid;gap:8px">${choice(true, 'WAITING ON CLIENT', 'CLIENT ACTION IS REQUIRED')}${choice(false, 'WAITING ON PROVIDER', 'EXTERNAL DEPENDENCY')}${choice(false, 'INTERNAL', 'SITE 00 NEEDS TO ACT')}</div>${field({ label: 'NOTE', value: 'Provider key not yet issued', data: true, area: true })}`, foot: `${btn('CANCEL', { tone: 'out' })}${btn('SET BLOCKER', { tone: 'danger' })}` }),
  }),
  'OL-14': () => ({ base: { page: 'correspondence', detail: true }, html: '', kb: true }),
  'OL-15': () => ({
    base: { page: 'testlab' },
    html: ov({ id: 'OL-15', m: 'sheet', t: 'dialog', d: 'dialog', w: 540, kick: 'SYNTHETIC CLIENT ONLY', title: 'SEND TEST EMAIL', body: `${kv([['TEMPLATE', 'QUOTE READY'], ['TO', 'founder-test@site00.invalid', true], ['ALLOWLIST', 'MATCH · 1 ADDRESS']])}<label class="ws-check"><span class="ws-check__b"></span><span><span class="ws-body">I APPROVE THIS ONE SEND</span><span class="ws-hint" style="display:block;margin-top:4px">EACH SEND NEEDS ITS OWN APPROVAL (FD-W16). REAL CLIENTS CAN NEVER BE SELECTED HERE.</span></span></label>`, foot: `${btn('CANCEL', { tone: 'out' })}<button class="ws-btn ws-btn--off" disabled><span>SEND TEST</span></button>` }),
  }),
  'OL-16': () => ({ base: { page: 'system', insp: 'module' }, html: '' }),
  'OL-17': () => ({
    base: { page: 'testlab' },
    html: ov({ id: 'OL-17', m: 'sheet', t: 'dialog', d: 'dialog', w: 500, kick: 'TEST LAB', title: 'RESET TEST DATA?', body: `<p class="ws-meta" style="margin:0;line-height:1.5;color:var(--ws-ink-2)">DELETES SYNTHETIC CLIENTS AND THEIR EVENTS ON STAGING. REAL CLIENTS ARE NEVER TOUCHED. THIS CANNOT BE UNDONE.</p>${field({ label: 'TYPE RESET TO CONFIRM', value: 'RES', data: true, state: 'focus' })}`, foot: `${btn('CANCEL', { tone: 'out' })}<button class="ws-btn ws-btn--off" disabled><span>RESET TEST DATA</span></button>` }),
    kb: true,
  }),
  'OL-18': () => ({
    base: { page: 'overview' },
    html: ov({ id: 'OL-18', m: 'drawer', t: 'popover', d: 'popover', w: 280, kind: 'menu', anchor: 'account', place: 'above-start', label: 'ACCOUNT', body: `<div style="padding:10px 16px 12px;border-bottom:1px solid var(--ws-hair)" class="ws-who"><b>FOUNDER</b><span>ADMIN · SIGNED IN · STAGING</span></div>${menuItem('server', 'ENVIRONMENT · STAGING')}${menuItem('help', 'KEYBOARD SHORTCUTS', '', '?')}${sep}${menuItem('back', 'SIGN OUT', 'danger')}` }),
  }),
  'OL-19': () => ({ base: { page: 'foundations', sel: 0, insp: 'client' }, html: '' }),
  'OL-20': () => ({ base: { page: 'overview', st: 'error-detail' }, html: '' }),
  TOAST: (s = 'ok') => ({
    base: { page: 'foundations' },
    html: ov({ id: 'SC-14', m: 'toast', t: 'toast', d: 'toast', kind: 'toast', label: 'STATUS', body: s === 'ok' ? `<div class="ws-toast" role="status">${CHECK}<span>LINK COPIED · /foundation/ab12…9zQ</span></div>` : `<div class="ws-toast ws-toast--err" role="alert">${icon('warning')}<span>NOT SAVED — RETRY</span>${btn('RETRY', { tone: 'ghost', size: 'xs' })}</div>` }).replace('class="ws-ov"', 'class="ws-ov" style="--w:440px"'),
    scrim: false,
  }),
};

export const FAMILY_NAMES = {
  'OL-01': 'CREATE FOUNDATION', 'OL-02': 'LINK READY', 'OL-03': 'WORKSPACE MENU', 'OL-04': 'SEARCH / COMMAND', 'OL-05': 'NOTIFICATION CENTER', 'OL-06': 'ROW ACTION MENU', 'OL-07': 'FILTER / SORT', 'OL-08': 'APPROVE QUOTE', 'OL-09': 'REVISE QUOTE', 'OL-10': 'MARK COMPLETE',
  'OL-11': 'REQUEST REVISION', 'OL-12': 'TASK DETAIL', 'OL-13': 'SET BLOCKER', 'OL-14': 'COMPOSE MESSAGE', 'OL-15': 'GATED SEND', 'OL-16': 'MODULE DETAIL', 'OL-17': 'RESET TEST DATA', 'OL-18': 'ACCOUNT MENU', 'OL-19': 'CLIENT PREVIEW SHEET', 'OL-20': 'TECHNICAL ERROR DETAIL', TOAST: 'FEEDBACK TOAST',
};
export { H, C, AV, FE, V, SYNTH, st, ident };
