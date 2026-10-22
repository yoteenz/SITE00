import { header, section, S, foot, mount, icon, mk, status, chip, btn, plate, seg, journey, tabs, segctl, kv, field, nrow, act } from './fw-kit.js';
import { DEMO, mRow, toast } from './fw-parts.js';

const spec = (inner, w, pad = 20) => `<div class="fw" style="width:${w}px;background:var(--fw-page);border:1px solid #0c0c0c;padding:${pad}px;display:flex;flex-direction:column;gap:12px">${inner}</div>`;
const cap = (t) => `<div class="bd-cap"><span class="bd-cap__t">${t}</span></div>`;
const block = (t, inner) => `<div style="display:flex;flex-direction:column;gap:6px">${cap(t)}${inner}</div>`;

// ─── Tokens ────────────────────────────────────────────────────────────────
const TOKENS = [
  ['PAGE', '#fbfaf8', '--fw-page'], ['SURFACE', '#ffffff', '--fw-surface'], ['CHAMBER', '#f3f2ef', '--fw-chamber'], ['HAIR', '#eeede9', '--fw-hair'],
  ['RULE', '#dcdad5', '--fw-rule'], ['RULE STRONG', '#c9c7c2', '--fw-rule-strong'], ['INK', '#0c0c0c', '--fw-ink'], ['MUTED', '#75736e', '--fw-muted'],
  ['FAINT', '#a3a19c', '--fw-faint'], ['RED', '#ce1017', '--fw-red'], ['RED INK', '#b30f17', '--fw-red-ink'], ['RED TINT', '#fff5f5', '--fw-red-tint'],
  ['OK', '#2e7a4b', '--fw-ok'], ['WARN', '#a65208', '--fw-warn'],
];
const tokens = `<div class="bd-row" style="gap:12px">${TOKENS.map(([k, v, n]) => `<div class="bd-swatch"><div class="bd-swatch__chip" style="background:${v}"></div><div class="bd-swatch__k">${k}</div><div class="bd-swatch__v">${v}<br><code>${n}</code></div></div>`).join('')}</div>
<div class="bd-note" style="max-width:1300px">Red is reserved for <b>attention and creation</b>: founder decisions, the create action, focus frames, destructive confirmation, the red period. It is never decoration on data. OK green appears only in system chips where a check passed. Radius 3 px everywhere; no shadows except the inset selection rule.</div>`;

// ─── Type ──────────────────────────────────────────────────────────────────
const TYPE = [
  ['H1 · DESKTOP', 'fw-h1 fw-h1--desk', 'FOUNDATIONS<i></i>', 'SITE 00 DISPLAY 900 · 68 / 0.84'],
  ['H1 · MOBILE', 'fw-h1', 'REVIEWS<i></i>', 'SITE 00 DISPLAY 900 · 50 / 0.84'],
  ['H2 · SHEET / FOCUS', 'fw-h2', 'APPROVE QUOTE V2<i class="fw-period"></i>', 'SITE 00 DISPLAY 900 · 26–34'],
  ['NUMERAL OF RECORD', 'fw-num', '<span style="font-size:44px">12</span>', 'SITE 00 DISPLAY 900'],
  ['H3 · SECTION', 'fw-h3', 'ACTIVE WORK', 'SAIRA SC 700 · 11 · +0.22EM'],
  ['ROW TITLE', '', '<b style="font-size:11.5px;letter-spacing:.14em">HORIZON FREIGHT</b>', 'SAIRA SC 700 · 11.5 · +0.14EM'],
  ['LABEL', 'fw-label', 'NEXT ACTION · FOUNDER', 'SAIRA SC 700 · 8 · +0.2EM · MUTED'],
  ['META', 'fw-meta', 'STEP 3 OF 8 · 1D AGO', 'SAIRA SC 500 · 8.5 · +0.16EM'],
  ['INDEX', 'fw-idx', '03', 'SAIRA SC 400 · 12.5 · RED'],
  ['DATA (CASE-SENSITIVE)', 'fw-data', '<span style="font-size:11px">ops@horizon-freight.invalid</span>', 'SAIRA SC · AS STORED · NEVER UPPERCASED'],
];
const type = `<div class="bd-panel" style="width:1180px"><table class="bd-table"><thead><tr><th>ROLE</th><th>SPECIMEN</th><th>SPEC</th></tr></thead><tbody>${TYPE.map(
  ([r, cls, s, d]) => `<tr><td>${r}</td><td><div class="fw" style="background:transparent"><div class="${cls}">${s}</div></div></td><td>${d}</td></tr>`,
).join('')}</tbody></table><div class="bd-note">Two families only. Martian Mono (admin shell) and Barlow Condensed (Correspondence Studio) are not used inside the workspace. Sizes match the shipped DF client scale (<code>site00-df-client.css</code>: 7.5–11 px tracked uppercase); implementation sizes in rem so browser zoom and text-size settings scale them (FD-W8 sets a phone minimum).</div></div>`;

// ─── Status grammar ────────────────────────────────────────────────────────
const MARKS = [
  ['founder', 'FOUNDER DECISION', 'Red solid — the only red status'],
  ['client', 'WAITING ON CLIENT', 'Hollow ink'],
  ['work', 'SITE 00 WORKING', 'Ink solid'],
  ['blocked', 'BLOCKED', 'Hollow red'],
  ['done', 'DONE', 'Grey'],
  ['idle', 'NOT STARTED', 'Hollow grey'],
  ['test', 'SYNTHETIC TEST', 'Hatched'],
];
const marks = spec(`${MARKS.map(([k, t, d]) => `<div class="fw-between" style="border-bottom:1px solid var(--fw-hair);padding:6px 0">${status(k, t)}<span class="fw-meta">${d.toUpperCase()}</span></div>`).join('')}`, 460);
const chips = spec(`<div class="fw-row-flex" style="flex-wrap:wrap">${chip('ok', 'READY')}${chip('req', 'NEEDS FOUNDER')}${chip('policy', 'OFF BY POLICY', 'lock')}${chip('unver', 'UNVERIFIED')}${chip('fail', 'FAILED')}${chip('test', 'TEST')}${chip('warn', 'EXPIRES IN 2D')}${chip('muted', 'NOT PASSED')}<span class="fw-chip fw-chip--count">3</span></div><div class="fw-meta">CHIPS = CONDITION OF A THING (SYSTEM, QUOTE, SEND). MARKS = WHOSE MOVE A CLIENT IS ON.</div>`, 460);
const progress = spec(`<div class="fw-label">PHASE SEGMENTS · 8</div>${seg(['d', 'd', 'c', '', '', '', '', ''])}${seg(['d', 'd', 'd', 'd', 'd', 'b', '', ''])}<div class="fw-label">JOURNEY · SQUARE NODES</div>${journey(2, { labels: ['INV', 'INT', 'REC', 'QTE', 'PAY', 'SET', 'VER', 'DONE'] })}${journey(5, { labels: ['INV', 'INT', 'REC', 'QTE', 'PAY', 'SET', 'VER', 'DONE'], blockedAt: 5 })}<div class="fw-meta">NO PERCENTAGES (G-02). DONE = INK + CHECK · CURRENT = RED (FOUNDER) / INK OUTLINE (CLIENT) · BLOCKED = RED !</div>`, 460);

// ─── Controls ──────────────────────────────────────────────────────────────
const buttons = spec(`<div class="fw-row-flex" style="flex-wrap:wrap">${btn('APPROVE QUOTE')}${btn('NEW FOUNDATION', { tone: 'red', ic: 'add', arrow: false })}${btn('REVISE', { tone: 'out', arrow: false })}${btn('PREVIEW AS CLIENT', { tone: 'ghost', ic: 'view' })}</div><div class="fw-row-flex" style="flex-wrap:wrap">${btn('APPROVE', { focus: true })}<span class="fw-btn fw-btn--busy">WORKING…</span><span class="fw-btn fw-btn--off">${icon('lock', '', 'style="width:14px;height:14px"')}SEND DISABLED · POLICY</span>${btn('OPEN', { sm: true })}</div><div class="fw-meta">INK = DECIDE · RED = CREATE / DESTROY · OUTLINE = SECONDARY · GHOST = NAVIGATE · ONE PRIMARY PER VIEW.</div>`, 560);
const plates = spec(`<div class="fw-row-flex">${plate('Horizon Freight', { attn: true, size: 'lg' })}${plate('Atelier Bloom', { size: 'lg' })}${plate('SYNTH Founder', { test: true, size: 'lg' })}${plate('Carter & Lane')}${plate('Nova Creative', { size: 'sm' })}</div><div class="fw-meta">CLIENT PLATE: INITIALS + THRESHOLD SLIVER. RED SLIVER = FOUNDER DECISION · HATCHED = TEST. AN IMAGE SLOT IS RESERVED FOR FUTURE APPROVED CLIENT ASSETS (FD-W3).</div>`, 560);
const nav = spec(`${tabs(['OVERVIEW', ['INTAKE', ''], 'QUOTE', ['REQUESTS', '1']], 2)}${segctl(['ALL', 'FOUNDER', 'CLIENT', 'SITE 00'], 1)}`, 560);
const forms = spec(`<div class="fw-grid2">${field({ label: 'BUSINESS NAME', value: 'Harbor & Pine', data: true })}${field({ label: 'CLIENT EMAIL', value: 'owner@harborpine.invalid', data: true, state: 'focus' })}${field({ label: 'INDUSTRY', ph: 'SELECT', opt: true })}${field({ label: 'DOMAIN', value: 'harborpine', data: true, err: 'ADD A TOP-LEVEL DOMAIN, E.G. .COM' })}</div><div class="fw-meta">FIELD GRAMMAR FROM THE FORM-CONTROL AUTHORITY (PROPOSED, PR #1658).</div>`, 560);
const lists = spec(`<div class="fw-list">${mRow(DEMO[0])}${mRow(DEMO[4])}</div>${nrow('email', 'PERSONAL FOUNDATION INVITATION', 'DRY RUN · SEND FLAG OFF', chip('policy', 'OFF'))}${kv([['PERSONAL LINK', '/foundation/ab12…9zQ', true], ['QUOTE', 'V2 · CLIENT REVIEW']])}${act('2H', 'client', 'INTAKE SAVED', 'BUSINESS INFORMATION')}${toast('LINK COPIED')}`, 560);

mount(`${header({ num: '27', title: 'Component system overview', round: 'F', sub: 'The complete visual vocabulary of the workspace on one sheet: tokens, the two-family type scale, status grammar, controls and composites. Each item is listed with its states in COMPONENT_STATE_MATRIX.md and its source in COMPLETE_COMPONENT_INVENTORY.md.' })}
${section('01', 'TOKENS', tokens, S.prop('EXTENDS DF TOKENS'))}
${section('02', 'TYPE · TWO FAMILIES', `<div class="bd-row">${type}</div>`, S.locked('FONTS LOCKED BY FOUNDER RULE') + ' ' + S.dec('FD-W8'))}
${section('03', 'STATUS GRAMMAR', `<div class="bd-row">${block('MARKS · WHOSE MOVE', marks)}${block('CHIPS · CONDITION', chips)}${block('PROGRESS', progress)}</div>`, S.prop())}
${section('04', 'CONTROLS + COMPOSITES', `<div class="bd-row">${block('BUTTONS', buttons)}${block('IDENTITY PLATES', plates)}${block('TABS + SEGMENTS', nav)}</div><div class="bd-row" style="margin-top:18px">${block('FIELDS', forms)}${block('ROWS · LISTS · FEEDBACK', lists)}</div>`, S.prop())}
${foot('BOARD 27 / 28 · COMPONENT SYSTEM OVERVIEW', 'SITE 00 DISPLAY + SAIRA SEMI CONDENSED ONLY · UPPERCASE APPLICATION COPY · DATA AS STORED')}`);
