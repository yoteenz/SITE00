import { header, section, foot, mount, journey, mnav, railnav, sidebar, status, PHASES } from './fw-kit.js';
import { DEMO, mRow, dTable, segFor, clientInspector, sheet } from './fw-parts.js';
import { quickActions } from './fw-pages.js';

const box = (inner, w, h = 'auto', extra = '') => `<div class="fw" style="position:relative;width:${w}px;height:${typeof h === 'number' ? `${h}px` : h};background:var(--fw-page);border:1px solid #0c0c0c;overflow:hidden;${extra}">${inner}</div>`;
const cap = (t) => `<div class="bd-cap" style="margin-top:8px"><span class="bd-cap__t">${t}</span></div>`;
const col = (title, inner) => `<div style="display:flex;flex-direction:column;gap:6px">${cap(title)}${inner}</div>`;

// ─── 01 Breakpoints (schematic) ────────────────────────────────────────────
const sil = (w, h, label, parts) => `<div style="display:flex;flex-direction:column;gap:8px"><div class="fw" style="position:relative;width:${w}px;height:${h}px;border:1px solid #0c0c0c;background:#fff">${parts}</div><div class="bd-note" style="max-width:${Math.max(w, 220)}px">${label}</div></div>`;
const zone = (style, t, red = false) => `<div style="position:absolute;${style};border:1px ${red ? 'solid var(--fw-red)' : 'dashed var(--fw-rule-strong)'};background:${red ? 'var(--fw-red-tint)' : '#f6f5f2'};display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;letter-spacing:.16em;color:${red ? 'var(--fw-red)' : 'var(--fw-muted)'};text-align:center">${t}</div>`;
const bps = `<div class="bd-row" style="align-items:flex-end">
  ${sil(195, 422, '<b>PHONE · &lt; 768 PX.</b> Header (brand, search, bell, MENU) · one column · bottom nav with CREATE · inspector and dialogs become sheets.', zone('left:0;right:0;top:0;height:40px', 'HEADER') + zone('left:8px;right:8px;top:48px;bottom:52px', 'STAGE') + zone('left:0;right:0;bottom:0;height:44px', 'BOTTOM NAV'))}
  ${sil(417, 556, '<b>TABLET PORTRAIT · 768–1279 PX.</b> 72 px index rail · one column · inspector opens as a right sheet (width − rail &lt; 1100 px).', zone('left:0;top:0;bottom:0;width:36px', 'RAIL') + zone('left:44px;right:8px;top:0;height:32px', 'TOPBAR') + zone('left:44px;right:8px;top:40px;bottom:8px', 'STAGE') + zone('right:0;top:0;bottom:0;width:180px;background:#fff', 'SHEET · 360', true))}
  ${sil(597, 417, '<b>TABLET LANDSCAPE.</b> 1194 − 72 = 1122 ≥ 1100 → inspector docks at 360 px.', zone('left:0;top:0;bottom:0;width:36px', 'RAIL') + zone('left:44px;right:188px;top:0;height:32px', 'TOPBAR') + zone('left:44px;right:188px;top:40px;bottom:8px', 'STAGE') + zone('right:0;top:0;bottom:0;width:180px', 'INSPECTOR · 360', true))}
  ${sil(720, 450, '<b>DESKTOP · ≥ 1280 PX.</b> 232 px navigation · stage (max 1180) · 392 px inspector only while something is selected.', zone('left:0;top:0;bottom:0;width:116px', 'NAVIGATION · 232') + zone('left:124px;right:204px;top:0;height:32px', 'TOPBAR · ⌘K') + zone('left:124px;right:204px;top:40px;bottom:8px', 'STAGE') + zone('right:0;top:0;bottom:0;width:196px', 'INSPECTOR · 392', true))}
</div>`;

// ─── 02 Navigation variants ────────────────────────────────────────────────
const navs = `<div class="bd-row" style="align-items:flex-start">
  ${col('PHONE · BOTTOM NAV', box(mnav('foundations'), 390, 84))}
  ${col('TABLET · RAIL', box(railnav('foundations'), 72, 640))}
  ${col('DESKTOP · SIDEBAR', box(sidebar('foundations'), 232, 640))}
  <div class="bd-panel" style="width:520px"><table class="bd-table"><thead><tr><th>DESTINATION</th><th>PHONE</th><th>TABLET</th><th>DESKTOP</th></tr></thead><tbody>
  <tr><td>01 OVERVIEW</td><td>NAV · HOME</td><td>RAIL 01</td><td>SIDEBAR</td></tr>
  <tr><td>02 FOUNDATIONS</td><td>NAV</td><td>RAIL 02</td><td>SIDEBAR</td></tr>
  <tr><td>03 REVIEWS</td><td>NAV + COUNT</td><td>RAIL 03 + DOT</td><td>SIDEBAR + COUNT</td></tr>
  <tr><td>04 OPERATIONS</td><td>MENU (LABELLED)</td><td>RAIL 04</td><td>SIDEBAR</td></tr>
  <tr><td>05 CORRESPONDENCE</td><td>MENU (LABELLED)</td><td>RAIL 05</td><td>SIDEBAR</td></tr>
  <tr><td>06 SYSTEM</td><td>NAV</td><td>RAIL 06</td><td>SIDEBAR</td></tr>
  <tr><td>CREATE</td><td>CENTRE BLOCK → SHEET</td><td>RAIL + → SHEET</td><td>NEW FOUNDATION → DIALOG</td></tr>
  </tbody></table><div class="bd-note">FD-W1 decides whether OPERATIONS replaces SYSTEM in the bottom nav once operations are persisted (G-04).</div></div>
</div>`;

// ─── 03 Registry row ───────────────────────────────────────────────────────
const c = DEMO[0];
const tabletRow = `<div class="fw-row" style="grid-template-columns:auto minmax(0,1fr) 170px 150px auto">${mRow(c).match(/<span class="fw-plate[^>]*>[^<]*<\/span>/)[0]}<div class="fw-who"><b>${c.name}</b><span>${c.cat}</span></div><div>${segFor(c.phase, c.k)}<div class="fw-meta" style="margin-top:6px">STEP ${c.phase + 1} OF 8</div></div>${status(c.k, c.state)}<span class="fw-meta">${c.last}</span></div>`;
const rows = `<div class="bd-row" style="align-items:flex-start">
  ${col('PHONE · CARD ROW', box(`<div class="fw-list" style="padding:12px">${mRow(c)}</div>`, 390))}
  ${col('TABLET · DENSE ROW', box(`<div class="fw-list" style="padding:12px">${tabletRow}</div>`, 760))}
  ${col('DESKTOP · TABLE ROW', box(`<div style="padding:4px 12px">${dTable([c], 0)}</div>`, 1180))}
</div>`;

// ─── 04 Journey ────────────────────────────────────────────────────────────
const journeys = `<div class="bd-row" style="align-items:flex-start">
  ${col('PHONE · SEGMENTS + STEP', box(`<div style="padding:16px" class="fw-col fw-gap10">${segFor(4, 'work')}<div class="fw-between"><span class="fw-meta">STEP 5 OF 8 · ${PHASES[4]}</span>${status('work', 'SITE 00')}</div></div>`, 390))}
  ${col('TABLET + INSPECTOR · SHORT LABELS', box(`<div style="padding:16px">${journey(4, { labels: ['INV', 'INT', 'REC', 'QTE', 'PAY', 'SET', 'VER', 'DONE'] })}</div>`, 392))}
  ${col('DESKTOP RECORD · FULL + DATES', box(`<div style="padding:16px">${journey(4, { dates: ['OCT 02', 'OCT 03', 'OCT 05', 'OCT 06', 'OCT 08', '', '', ''] })}</div>`, 900))}
</div>`;

// ─── 05 Inspector ↔ sheet; quick actions ───────────────────────────────────
const insp = `<div class="bd-row" style="align-items:flex-start">
  ${col('DESKTOP · DOCKED INSPECTOR 392', box(`<aside class="fw-insp" style="position:static;height:100%">${clientInspector(c)}</aside>`, 392, 760))}
  ${col('PHONE · SAME CONTENT AS SHEET (TABLET: RIGHT SHEET)', box(sheet(c.name.toUpperCase(), `${segFor(c.phase, c.k)}<div class="fw-between">${status(c.k, c.state)}<span class="fw-meta">STEP 3 OF 8</span></div>${quickActions()}`, '', { top: '360px' }), 390, 760, 'background:#e9e8e4'))}
  <div class="bd-panel" style="width:560px"><table class="bd-table"><thead><tr><th>COMPONENT</th><th>PHONE</th><th>TABLET</th><th>DESKTOP</th></tr></thead><tbody>
  <tr><td>CLIENT PREVIEW</td><td>Push to record</td><td>Right sheet 360 / docked</td><td>Inspector 392</td></tr>
  <tr><td>REVIEW DETAIL</td><td>Push · fixed decision bar</td><td>Docked if ≥1100</td><td>Inspector + decision foot</td></tr>
  <tr><td>TASK DETAIL</td><td>Bottom sheet</td><td>Right sheet</td><td>Inspector</td></tr>
  <tr><td>MODULE (SYSTEM)</td><td>Bottom sheet</td><td>Right sheet</td><td>Inspector</td></tr>
  <tr><td>CREATE</td><td>Bottom sheet → full screen form</td><td>Dialog 560</td><td>Dialog 560</td></tr>
  <tr><td>CONFIRM</td><td>Bottom sheet</td><td>Dialog 440</td><td>Dialog 440</td></tr>
  <tr><td>SEARCH</td><td>Full screen</td><td>Palette 620</td><td>Palette 620</td></tr>
  <tr><td>RECORD SECTIONS</td><td>5 tabs (MORE)</td><td>8 tabs</td><td>8 tabs</td></tr>
  <tr><td>QUICK ACTIONS</td><td>5-up grid</td><td>Inline buttons</td><td>Header buttons</td></tr>
  <tr><td>SIGNALS</td><td>4-up compact</td><td>4-up</td><td>Rail beside title</td></tr>
  <tr><td>TABLES</td><td>Never · card rows</td><td>Dense rows</td><td>Table</td></tr>
  </tbody></table><div class="bd-note">Rule: the content of a docked inspector and of its sheet is the same component; only the container changes. Width — not device class — decides.</div></div>
</div>`;

mount(`${header({ num: '25', title: 'Responsive component authority', round: 'F', sub: 'How each structural component changes between phone, tablet and desktop. One component, three containers; nothing is a separate mobile product.' })}
${section('01', 'BREAKPOINTS + REGIONS', bps)}
${section('02', 'NAVIGATION', navs)}
${section('03', 'REGISTRY ROW', rows)}
${section('04', 'JOURNEY', journeys)}
${section('05', 'INSPECTOR ↔ SHEET · MATRIX', insp)}
${foot('BOARD 25 / 28 · RESPONSIVE COMPONENT AUTHORITY', 'BREAKPOINTS PROPOSED · 768 / 1280 · INSPECTOR DOCK THRESHOLD 1100')}`);
