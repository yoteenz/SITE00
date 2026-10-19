// Board kit: markup helpers that emit the live DF class names (existing states) and the ix- proposal classes.
// Data comes from window.__DF, loaded by render-boards.mjs from the source modules (no copied enums or copy).

export const DF = window.__DF;

export const BUSINESS_TYPES = DF.BUSINESS_TYPES;
export const PLACEHOLDER = 'SELECT A BUSINESS TYPE'; // EntryIntake.tsx P02 <option value="">

export function icon(name, cls = '', attrs = '') {
  const id = DF.aliases[name] ?? name;
  const raw = DF.glyphs[id];
  if (!raw) throw new Error(`unknown DF icon ${name}`);
  const markup = raw.split('{{step}}').join('').split('{{progress}}').join('8');
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${attrs}>${markup}</svg>`;
}

// DfSelect's own down chevron. `ix-chev` neutralises the client sheet's legacy `.df-select__chev` rule
// (absolute + rotate(90deg), written for the native-select icon) — see handoff, collision C-1.
const CHEV = '<svg class="df-select__chev ix-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
const ARROW = '<svg class="df-cta__arrow" viewBox="0 0 24 12" aria-hidden="true"><path d="M1 6h21m-5-5 5 5-5 5"/></svg>';
const BACK = '<svg viewBox="0 0 24 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 6H2m5-5L2 6l5 5"/></svg>';

export const st = (kind, text) => `<span class="st st--${kind}">${text}</span>`;
export const S = {
  locked: (t = 'LOCKED') => st('locked', t),
  impl: (t = 'IMPLEMENTED') => st('implemented', t),
  prop: (t = 'PROPOSED') => st('proposed', t),
  alt: (t = 'ALTERNATIVE') => st('alt', t),
  con: (t = 'TECHNICAL CONSTRAINT') => st('constraint', t),
  dec: (t = 'FOUNDER DECISION') => st('decision', t),
  unres: (t = 'UNRESOLVED') => st('unresolved', t),
  rec: (t = 'OPUS RECOMMENDS') => st('rec', t),
};

export function header({ num, title, kicker = 'SITE 00 / IDNTY / DIGITAL FOUNDATION / FORM-CONTROL VISUAL AUTHORITY', meta, sub }) {
  return `
  <header class="bd-head">
    <div class="bd-num">${num}</div>
    <div>
      <div class="bd-kicker">${kicker}</div>
      <h1 class="bd-title">${title}<i></i></h1>
    </div>
    <div class="bd-meta">${meta ?? 'SPRINT P0.SITE00.IDNTY.FORM-CONTROL-VISUAL-AUTHORITY.OPUS1<br>AUDIT SOURCE 5f4d26c3 · PR #1656<br>STATUS — FOUNDER REVIEW REQUIRED'}</div>
  </header>
  <div class="bd-legend">${S.locked('LOCKED — APPROVED')} ${S.impl()} ${S.prop()} ${S.alt()} ${S.con()} ${S.dec()} ${S.unres()}</div>
  ${sub ? `<p class="bd-sub">${sub}</p>` : ''}`;
}

export function section(n, title, inner, chips = '') {
  return `<section class="bd-section"><h2 class="bd-h2"><b>${n}</b>${title}<span class="bd-rule"></span>${chips}</h2>${inner}</section>`;
}

export function frame({ title, chips = '', body, note = '', width }) {
  return `<div class="bd-frame" style="${width ? `width:${width}px` : ''}">
    <div class="bd-cap"><span class="bd-cap__t">${title}</span><span>${chips}</span></div>
    ${body}
    ${note ? `<div class="bd-note">${note}</div>` : ''}
  </div>`;
}

/** A device stage at real CSS size. `w`/`h` are the viewport; content is clipped like a phone screen. */
export function device({ w = 390, h = 844, label, body, flush = false, touch = true, bottom = '', scroll = 0 }) {
  return `<div class="bd-device" style="width:${w + 2}px">
    <div class="bd-device__bar"><b>${label ?? `IPHONE SAFARI · ${w} × ${h}`}</b><span>SITE 00 / IDNTY</span></div>
    <div class="df-portal ix ${touch ? 'ix-touch' : ''}" style="position:relative;height:${h}px;overflow:hidden;background:var(--df-bg)">
      <div class="bd-device__body ${flush ? 'bd-device__body--flush' : ''}" style="margin-top:${-scroll}px">${body}</div>
      ${bottom}
    </div>
  </div>`;
}

/** A bare component stage (no device chrome), for state matrices. */
export function stage(body, { w = 340, pad = 18, bg = 'var(--df-bg)', touch = false } = {}) {
  return `<div class="df-portal ix ${touch ? 'ix-touch' : ''}" style="width:${w}px;padding:${pad}px;background:${bg};border:1px solid #dcdad5">${body}</div>`;
}

// ─── DF parts (live classes) ──────────────────────────────────────────────────

export const rail = (index, label) =>
  `<p class="df-rail"><span class="df-rail__index">${index}</span><span class="df-rail__rule"></span><span class="df-rail__label">${label}</span></p>`;

export const headline = (lines) =>
  `<h1 class="df-headline">${lines
    .map((l, i) => `<span class="df-headline__line">${l}${i === lines.length - 1 ? '<span class="df-headline__period">.</span>' : ''}</span>`)
    .join('')}</h1>`;

export const lede = (html) => `<p class="df-lede">${html}</p>`;

export const P02_LEDE = 'A FEW KEY <strong>DETAILS HELP US</strong> RECOMMEND THE RIGHT DIGITAL FOUNDATION FOR YOUR GOALS.';

export function p02Intro() {
  return `${rail('02', DF.VIEW_META.P02.label)}${headline(['TELL US', 'ABOUT YOUR', 'BUSINESS'])}${lede(P02_LEDE)}`;
}

/**
 * P02 field card. state: '', 'focus', 'invalid', 'invalid-focus', 'readonly', 'disabled', 'hover'.
 * opts.mark shows the red period before the label (proposed focus / attention marker).
 */
export function field({ label, value = '', placeholder = '', state = '', error = '', hint = '', optional = false, mark = false, control, headState = '' }) {
  const inputCls = ['df-input'];
  if (state.includes('focus')) inputCls.push('ix-focus');
  if (state.includes('invalid')) inputCls.push('ix-invalid');
  if (state === 'readonly') inputCls.push('ix-readonly');
  if (state === 'hover') inputCls.push('ix-hover');
  const ctl =
    control ??
    (state === 'readonly'
      ? `<span class="ix-value-wrap"><input class="${inputCls.join(' ')}" value="${value}" readonly>${icon('lock')}</span>`
      : `<input class="${inputCls.join(' ')}" value="${value}" placeholder="${placeholder}" ${state === 'disabled' ? 'disabled' : ''}>`);
  const head = `<span class="ix-head">${mark ? '<span class="ix-mark"></span>' : ''}<span class="df-field__label">${label}</span>${
    headState || (optional ? '<span class="ix-opt">OPTIONAL</span>' : '')
  }</span>`;
  return `<div class="df-field ${state.includes('invalid') ? 'df-field--error ix-field--invalid' : ''}">${head}${ctl}${
    error ? `<p class="ix-error"><span class="ix-mark"></span>${error}</p>` : ''
  }${hint ? `<p class="ix-hint">${hint}</p>` : ''}</div>`;
}

/** Live (current) P02 field exactly as EntryIntake renders it, for before/after. */
export function liveField({ label, value = '', placeholder = '' }) {
  return `<div class="df-field"><span class="df-field__head"><label class="df-field__label">${label}</label></span><input class="df-input" value="${value}" placeholder="${placeholder}"></div>`;
}

/** DfSelect trigger (U03). */
export function trigger({ value = '', open = false, invalid = false, focus = false, disabled = false, hover = false }) {
  const cls = ['df-select__trigger'];
  if (open) cls.push('ix-trigger-open');
  if (invalid) cls.push('ix-trigger-invalid');
  if (focus) cls.push('ix-focus');
  if (hover) cls.push('ix-hover');
  return `<div class="df-select ${value ? '' : 'df-select--empty'}"><button class="${cls.join(' ')}" ${disabled ? 'disabled' : ''}><span class="df-select__value">${
    value || PLACEHOLDER
  }</span>${CHEV}</button></div>`;
}

export function selectField({ value = '', open = false, invalid = false, focus = false, disabled = false, error = '', after = '', mark = false, hover = false }) {
  const head = `<span class="ix-head">${mark ? '<span class="ix-mark"></span>' : ''}<span class="df-field__label">BUSINESS TYPE</span><span class="ix-opt">OPTIONAL</span></span>`;
  return `<div class="df-field ${invalid ? 'ix-field--invalid' : ''}">${head}${trigger({ value, open, invalid, focus, disabled, hover })}${after}${
    error ? `<p class="ix-error"><span class="ix-mark"></span>${error}</p>` : ''
  }</div>`;
}

export const cta = (label, { tone = 'primary', busy = false, disabled = false, arrow = true } = {}) =>
  `<button class="df-cta df-cta--${tone === 'primary' ? 'red' : tone}" ${busy ? 'data-busy="1" aria-busy="true"' : ''} ${disabled ? 'disabled' : ''}>${
    busy ? spinner() : ''
  }<span class="df-cta__label">${label}</span>${arrow && tone !== 'text' ? ARROW : ''}</button>`;

export const spinner = () =>
  '<span class="df-spinner df-spinner--sm"><svg viewBox="0 0 24 24" aria-hidden="true"><circle class="df-spinner__track" cx="12" cy="12" r="10"/><circle class="df-spinner__arc" cx="12" cy="12" r="10"/></svg></span>';

export const trust = (aside = '', text = 'YOUR INFORMATION IS SECURE.') =>
  `<div class="df-trust">${icon('lock', 'df-trust__lock')}<span class="df-trust__text">${text}</span>${aside ? `<span class="df-trust__aside">${aside}</span>` : ''}</div>`;

export const footer = (code) =>
  `<footer class="df-footer"><span class="df-footer__mark">SITE 00</span><span class="df-footer__rule"></span><span class="df-footer__code">IDNTY <span class="df-footer__num">/ ${code}</span></span></footer>`;

export const backLink = (label = 'BACK') => `<span class="ix-textlink">${BACK}${label}</span>`;

export const status = (kind, text, { act } = {}) => {
  const mark = {
    dirty: '<span class="ix-mark ix-mark--hollow"></span>',
    saving: spinner(),
    saved: '<span class="ix-mark ix-mark--ink"></span>',
    restored: '<span class="ix-mark ix-mark--ink"></span>',
    error: '<span class="ix-mark"></span>',
    offline: '<span class="ix-mark ix-mark--hollow-red"></span>',
  }[kind];
  return `<span class="ix-status ix-status--${kind === 'saved' || kind === 'restored' ? 'saved' : kind === 'error' || kind === 'offline' ? 'error' : kind}">${mark}${
    act ? `${text} <u>${act}</u>` : text
  }</span>`;
};

// ─── Selector territories ─────────────────────────────────────────────────────

export function ddPanel({ value = '', active = -1, rows = BUSINESS_TYPES.length, above = false, scrollAt = 0, custom = '' }) {
  const opts = custom ? [custom, ...BUSINESS_TYPES] : BUSINESS_TYPES;
  const first = Math.floor(scrollAt);
  const offset = Math.round((scrollAt - first) * 40);
  const visible = opts.slice(first, first + Math.ceil(rows) + 1);
  const list = visible
    .map((t, i) => {
      const idx = i + first;
      const sel = t === value;
      const cls = ['ix-opt-row'];
      if (sel) cls.push('ix-opt-row--sel');
      if (idx === active) cls.push('ix-opt-row--active');
      if (custom && t === custom) cls.push('ix-opt-row--custom');
      return `<div class="${cls.join(' ')}"><span class="ix-mark ${sel ? '' : 'ix-mark--space'}"></span>${t}${
        custom && t === custom ? '<span class="ix-opt-row__tag">ON FILE</span>' : ''
      }</div>`;
    })
    .join('');
  const h = Math.round(rows * 40);
  const scrolls = rows < opts.length;
  const thumbH = (rows / opts.length) * 100;
  const thumbTop = (scrollAt / opts.length) * 100;
  return `<div class="ix-dd__panel ${above ? 'ix-dd__panel--above' : ''}"><div class="ix-dd__scroll" style="height:${h}px"><div style="margin-top:${-offset}px">${list}</div>${
    scrolls ? `<span class="ix-dd__track"><span class="ix-dd__thumb" style="top:${thumbTop.toFixed(1)}%;height:${thumbH.toFixed(1)}%"></span></span>` : ''
  }</div></div>`;
}

export function territoryA({ value = '', active = -1, rows = 6.5, above = false, scrollAt = 0, invalid = false, custom = '' }) {
  return `<div class="ix-dd">${selectField({ value: value || '', open: true, invalid, mark: true }).replace(
    '</button></div>',
    `</button>${ddPanel({ value, active, rows, above, scrollAt, custom })}</div>`,
  )}</div>`;
}

export function sheet({ value = '', pressed = -1, focus = -1, rows, maxH, custom = '', showClear = true, safe = true, list = BUSINESS_TYPES }) {
  const opts = custom ? [custom, ...list] : list;
  const items = opts
    .slice(0, rows ?? opts.length)
    .map((t, i) => {
      const sel = t === value;
      const isCustom = custom && t === custom;
      const cls = ['ix-srow'];
      if (sel) cls.push('ix-srow--sel');
      if (i === pressed) cls.push('ix-srow--pressed');
      if (i === focus) cls.push('ix-srow--focus');
      if (isCustom) cls.push('ix-srow--custom');
      const n = isCustom ? '—' : String(custom ? i : i + 1).padStart(2, '0');
      return `<div class="${cls.join(' ')}"><span class="ix-srow__n">${n}</span><span>${t}${
        isCustom ? '<span class="ix-srow__tag">ON FILE · NOT IN THE LIST</span>' : ''
      }</span>${sel ? '<span class="ix-mark"></span>' : '<span></span>'}</div>`;
    })
    .join('');
  return `<div class="ix-sheet" ${maxH ? `style="max-height:${maxH}px"` : ''}>
    <div class="ix-sheet__head">
      ${rail('02', 'BUSINESS TYPE')}
      <h2 class="ix-sheet__title">SELECT A<br>BUSINESS TYPE<i></i></h2>
      <span class="ix-sheet__meta">OPTIONAL · CHOOSE ONE</span>
      <span class="ix-sheet__close">${icon('close')}</span>
    </div>
    <div class="ix-sheet__list ${rows && rows < opts.length ? 'ix-fade' : ''}">${items}</div>
    <div class="ix-sheet__foot"><span>${opts.length} OPTIONS</span>${value && showClear ? '<span class="ix-textlink ix-textlink--red">CLEAR SELECTION</span>' : ''}</div>
    ${safe ? '<div class="ix-safe"></div>' : ''}
  </div>`;
}

export function territoryC({ value = '', focus = -1, invalid = false, rows }) {
  const opts = BUSINESS_TYPES.slice(0, rows ?? BUSINESS_TYPES.length);
  const tiles = opts
    .map((t, i) => {
      const cls = ['ix-tile'];
      if (t === value) cls.push('ix-tile--sel');
      if (i === focus) cls.push('ix-tile--focus');
      return `<div class="${cls.join(' ')}"><span>${t}</span>${t === value ? '<span class="ix-mark" style="margin-left:auto"></span>' : ''}</div>`;
    })
    .join('');
  return selectField({
    value,
    open: true,
    invalid,
    mark: true,
    after: `<div class="ix-inline">${tiles}</div><div class="ix-inline__more"><span>${BUSINESS_TYPES.length} OPTIONS · CHOOSE ONE</span><span class="ix-textlink ix-textlink--red">DONE</span></div>`,
  });
}

/** P02 page body (inside a device) with a replaceable business-type slot. */
export function p02Page({ typeSlot, name = 'JURNL', contact = 'Founder Test', email = 'founder@jurnl.example', phone = '', footerNote = true, tail = '' }) {
  return `${p02Intro()}<div class="df-form" style="display:flex;flex-direction:column">
    ${field({ label: 'BUSINESS NAME', value: name, placeholder: 'YOUR BUSINESS NAME' })}
    ${typeSlot}
    ${field({ label: 'PRIMARY CONTACT', value: contact, placeholder: 'FULL NAME' })}
    ${field({ label: 'EMAIL ADDRESS', value: email, placeholder: 'YOU@EXAMPLE.COM' })}
    ${field({ label: 'PHONE NUMBER', value: phone, placeholder: '901-236-2647', optional: true })}
    ${cta('CONTINUE')}
  </div>${footerNote ? trust(status('saved', 'SAVED 7:08 AM')) : ''}${tail}`;
}

export function ready() {
  document.fonts.ready.then(() => {
    document.body.dataset.ready = '1';
  });
}

export function mount(html) {
  document.getElementById('board').innerHTML = html;
  ready();
}
