/** FNDATN-01 compositions. Seven emails, seven arrangements of the shared parts. */
import type { Data01, Data02, Data03, Data04, Data05, Data06, Data07, AddonLine, ScopeItem } from './contracts.js';
import { FONT_BODY, FONT_DISPLAY, T, button, caption, esc, icon, img, microLabel, mobileOnly, sectionTitle, v, type AssetResolver } from './html.js';
import { CARD_SPECS, MOBILE_ART_HEIGHT, cardLayer, mobileCardLayer, type CardRow } from './cards.js';
import {
  SPACE,
  deskAct,
  deskBand,
  desktopHero,
  foot,
  mast,
  mobileAct,
  mobileHero,
  mobileRows,
  panelHead,
  mobileStrip,
  bandText,
  type BandItem,
  type HeroCopy,
} from './layout.js';

export type Composition = { subject: string; subjectHtml: string; preheader: string; label: string; blocks: string[] };

const TAGLINE = ['SAME VISION.', 'MORE CLARITY.', 'A STRONGER TOMORROW.'];
/** The mobile authorities break the tagline into four lines. */
const TAGLINE_MOBILE = ['SAME VISION.', 'MORE CLARITY.', 'A STRONGER', 'TOMORROW.'];

function forName(name: string | null): string | null {
  return name ? `FOR ${v(name)}` : null;
}

const SCOPE_ICONS: Record<string, string> = { domain: 'globe', email: 'envelope', security: 'shield', device: 'device', records: 'records' };

function scopeItems(scope: readonly ScopeItem[]): BandItem[] {
  return scope.map((s, i) => ({ n: String(i + 1).padStart(2, '0'), icon: SCOPE_ICONS[s.key], iconAlt: s.label, title: s.label, text: s.detail }));
}

function addonsLine(addons: AddonLine[]): string {
  if (!addons.length) return '';
  const list = addons.map((a) => `${v(a.label)}${a.quantity > 1 ? ` × ${v(a.quantity)}` : ''}`).join(' &nbsp;·&nbsp; ');
  return `<table class="addons desk-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:${T.paper};border-bottom:1px solid ${T.line}">
<tr><td class="px" style="padding:12px 28px">${microLabel('OPTIONAL ENHANCEMENTS', T.mute, 8)}<br><span style="font-family:${FONT_BODY};font-size:11px;line-height:17px;letter-spacing:.1em;font-weight:500;color:${T.ink};text-transform:uppercase">${list}</span></td></tr>
</table>`;
}

/** Selected add-ons as one quiet line inside a mobile panel (the mobile authorities have no add-ons band). */
function addonsInline(addons: AddonLine[]): string {
  if (!addons.length) return '';
  const list = addons.map((a) => `${v(a.label)}${a.quantity > 1 ? ` × ${v(a.quantity)}` : ''}`).join(' &nbsp;·&nbsp; ');
  return `<p style="margin:0 0 12px;font-family:${FONT_BODY};font-size:8.5px;line-height:12px;letter-spacing:.14em;color:${T.mute};text-transform:uppercase;text-align:center">OPTIONAL ENHANCEMENTS &nbsp;${list}</p>`;
}

function mobileColumns(asset: AssetResolver, title: string, items: BandItem[], opts: { small?: boolean } = {}): string {
  const cols = items
    .map(
      (it, i) => `<td valign="top" width="33%" style="width:33%;padding:0 8px 0 ${i === 0 ? 0 : 10}px;${i === 0 ? '' : `border-left:1px solid ${T.line};`}">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" class="keep-red" style="padding-right:10px;font-family:${FONT_DISPLAY};font-weight:600;font-size:19px;line-height:20px;color:${T.red}">${esc(it.n)}</td>
<td valign="middle">${icon(asset(`assets/icons/${it.icon}.png`), it.iconAlt, 18)}</td>
</tr></table>
${SPACE(8)}
<p style="margin:0;font-family:${FONT_BODY};font-size:9.5px;line-height:13px;letter-spacing:.14em;font-weight:600;color:${T.ink};text-transform:uppercase">${esc(it.title)}</p>
<p style="margin:4px 0 0;font-family:${FONT_BODY};font-size:8.5px;line-height:12px;letter-spacing:.08em;color:${T.mute};text-transform:uppercase">${bandText(it)}</p>
</td>`,
    )
    .join('');
  const head = opts.small
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td class="keep-red" style="font-family:${FONT_BODY};font-size:10px;letter-spacing:.2em;color:${T.red};font-weight:500;padding-right:10px">${esc(title.toUpperCase())}</td><td><div style="width:28px;height:1px;background:${T.red};font-size:1px;line-height:1px">&nbsp;</div></td></tr></table>`
    : sectionTitle(title, 28);
  return mobileOnly(`<table class="walk mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%;background:#ffffff">
<tr><td style="padding:22px 20px 14px">${head}</td></tr>
<tr><td style="padding:0 20px 18px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cols}</tr></table></td></tr>
</table>`);
}

const STRIP_ALT = {
  glass: 'Red glass and limestone architecture with the words intention, structure, progress, a stronger tomorrow.',
  terrace: 'Olive tree on a limestone terrace above the sea.',
};

/** Optional CLIENT row: shown only when the record names the client. */
function clientRow(name: string | null): CardRow[] {
  return name ? [{ label: 'CLIENT', value: name }] : [];
}

/** Short scope tags printed on the quote cards (03 and 07), from the quote's scope. */
function scopeTags(scope: readonly ScopeItem[]): string[] {
  return scope.map((s) => s.label.split(' ')[0]);
}

// ---------------------------------------------------------------------------------------------

export function compose01(asset: AssetResolver, d: Data01): Composition {
  const slug = '01_invitation';
  const copy: HeroCopy = {
    kicker: forName(d.firstName),
    headline: ['BEGIN YOUR', 'FOUNDATION'],
    body: "EVERY GREAT BUSINESS DESERVES A STRONG BEGINNING. SITE 00 IS REACHING OUT PERSONALLY TO HELP YOU ESTABLISH THE ESSENTIALS—YOUR DOMAIN, PROFESSIONAL EMAIL, AND THE DETAILS THAT BRING YOUR PRESENCE TOGETHER. A SHORT INTAKE HELPS US UNDERSTAND YOUR BUSINESS BEFORE WE PREPARE YOUR QUOTE. NOTHING MOVES FORWARD UNTIL YOU REVIEW AND ACCEPT.",
    tagline: ['YOUR NEXT', 'CHAPTER', 'STARTS HERE.'],
    deskBodyWidth: 236,
  };
  const ask: BandItem[] = [
    { n: '01', icon: 'person', iconAlt: 'Person', title: 'YOUR BUSINESS', text: 'TELL US ABOUT YOUR BUSINESS AND WHAT YOU\'RE BUILDING.' },
    { n: '02', icon: 'target', iconAlt: 'Target', title: 'YOUR PRIORITIES', text: 'SHARE WHAT MATTERS MOST AND WHEN YOU\'D LIKE TO BEGIN.' },
    { n: '03', icon: 'layers', iconAlt: 'Layers', title: 'YOUR DIGITAL NEEDS', text: 'WE\'LL EXPLORE YOUR DOMAIN, PROFESSIONAL EMAIL, AND THE ESSENTIALS YOUR BUSINESS NEEDS.' },
  ];
  const how =
    mobileOnly(`<table class="walk mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%;background:#ffffff">
<tr><td style="padding:22px 20px 12px">${sectionTitle('HOW IT WORKS', 28)}</td></tr>
<tr><td style="padding:0 20px 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
${[
  ['01', 'TELL US ABOUT<br>YOUR BUSINESS'],
  ['02', 'WE PREPARE<br>YOUR NEXT STEP'],
  ['03', 'YOUR FOUNDATION<br>TAKES SHAPE'],
]
  .map(
    (
      [n, t],
      i,
    ) => `<td valign="middle" width="33%" style="width:33%;padding:6px 6px 6px ${i === 0 ? 0 : 10}px;${i === 0 ? '' : `border-left:1px solid ${T.red};`}"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" style="padding-right:8px;font-family:${FONT_DISPLAY};font-weight:500;font-size:22px;line-height:22px;color:${T.ink}">${n}</td>
<td valign="middle">${microLabel(t, T.body, 8)}</td></tr></table></td>`,
  )
  .join('')}
</tr></table></td></tr>
</table>`);
  const cta = { label: 'BEGIN YOUR FOUNDATION', url: d.intakeUrl, caption: 'YOUR SECURE LINK IS IN THE BUTTON ABOVE—JUST FOR YOU.' };
  const card: CardRow[] = [
    ...clientRow(d.clientName),
    { label: 'YOUR FOUNDATION', value: d.service, personalized: false },
    { label: 'NEXT STEP', value: d.status, tone: 'red', personalized: false },
    { label: 'YOUR LINK', value: d.access, tone: 'red', personalized: false },
  ];
  return {
    subject: 'YOUR INVITATION TO BEGIN',
    subjectHtml: 'YOUR INVITATION TO BEGIN',
    preheader: "LET'S ESTABLISH THE ESSENTIALS FOR WHAT'S NEXT.",
    label: 'Digital Foundation invitation',
    blocks: [
      mast({
        preheader: "LET'S ESTABLISH THE ESSENTIALS FOR WHAT'S NEXT.",
        line1: 'A PERSONAL',
        line2: 'INVITATION',
        rule: true,
      }),
      desktopHero(asset, slug, copy, {
        column: 285,
        alt: 'Foundation invitation card resting on a limestone terrace above the sea, red glass architecture behind.',
        card: cardLayer(CARD_SPECS[slug].desktop, card),
      }),
      mobileHero(asset, slug, copy, {
        height: 347,
        alt: 'Foundation invitation card on a limestone terrace, red glass architecture behind.',
        fit: { zone: 182, padTop: 18, head: 38, body: 9, textWidth: 250 },
        card: mobileCardLayer(slug, 347, card),
      }),
      deskBand(asset, "WHAT WE'LL ASK", ask, { side: 'A CLEARER<br>TOMORROW<br>TOGETHER.' }),
      mobileRows(asset, "WHAT WE'LL ASK", ask),
      mobileStrip(asset, slug, 'strip-mobile.jpg', STRIP_ALT.glass, 60),
      how,
      deskAct(asset, slug, cta, { left: 'left-desktop.jpg', right: 'right-desktop.jpg', leftAlt: STRIP_ALT.glass, rightAlt: STRIP_ALT.terrace }),
      mobileAct(cta),
      foot(),
    ],
  };
}

export function compose02(asset: AssetResolver, d: Data02): Composition {
  const slug = '02_intake_received';
  const copy: HeroCopy = {
    kicker: forName(d.firstName),
    headline: ["WE'VE RECEIVED", 'YOUR INTAKE'],
    mobileHeadline: ["WE'VE", 'RECEIVED', 'YOUR INTAKE'],
    body: "THANK YOU FOR TAKING THE TIME TO SHARE YOUR BUSINESS WITH US. YOUR INTAKE IS IN OUR HANDS NOW. WE'RE REVIEWING WHAT YOU SENT SO WE CAN PREPARE A THOUGHTFUL RECOMMENDATION AND QUOTE—NOTHING MOVES FORWARD UNTIL YOU'VE HAD A CHANCE TO REVIEW AND ACCEPT.",
    mobileBody: "THANK YOU FOR SHARING YOUR BUSINESS WITH US. WE'RE REVIEWING YOUR INTAKE AND WILL REACH OUT WITH YOUR RECOMMENDATION AND QUOTE WHEN IT'S READY.",
    tagline: TAGLINE,
    mobileTagline: TAGLINE_MOBILE,
    deskTagline: false,
    deskBodyWidth: 230,
  };
  const next: BandItem[] = [
    { n: '01', icon: 'magnifier', iconAlt: 'Review', title: 'REVIEW', text: "WE'LL REVIEW YOUR INFORMATION FOR ACCURACY AND ANY ADDITIONAL NEEDS." },
    { n: '02', icon: 'bubble', iconAlt: 'Clarify', title: 'CLARIFY', text: "IF WE NEED ANY ADDITIONAL DETAILS, WE'LL REACH OUT DIRECTLY." },
    { n: '03', icon: 'document', iconAlt: 'Prepare', title: 'PREPARE', text: "WHEN WE'RE READY, WE'LL SEND YOUR PERSONALIZED RECOMMENDATION AND QUOTE FOR REVIEW." },
  ];
  const cta = { label: 'VIEW YOUR INTAKE STATUS', url: d.foundationUrl, caption: 'VISIT YOUR FOUNDATION PAGE ANYTIME, OR REPLY TO THIS EMAIL WITH QUESTIONS.' };
  const card: CardRow[] = [
    ...clientRow(d.clientName),
    { label: 'YOUR FOUNDATION', value: d.service, personalized: false },
    { label: 'WHERE YOU ARE', value: d.status, tone: 'red', personalized: false },
    { label: 'RECEIVED', value: d.receivedAt },
    { label: 'FOR YOUR RECORDS', value: d.reference },
  ];
  const mobileClose =
    mobileOnly(`<table class="rest mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%;background:#ffffff">
<tr>
<td width="46%" style="width:46%">${img(asset(`assets/${slug}/strip-mobile.jpg`), STRIP_ALT.glass, 180, null, 'width:100%;height:auto;')}</td>
<td valign="middle" style="padding:0 10px 0 16px;border-left:1px solid ${T.line}">${microLabel('INTENTION<br>STRUCTURE<br>PROGRESS<br>A STRONGER<br>TOMORROW', T.ink, 7.5)}</td>
<td valign="middle" style="padding:0 16px 0 10px">${microLabel('YOUR<br>FOUNDATION<br>BRINGS<br>EVERYTHING<br>ELSE<br>INTO FOCUS.', T.ink, 7.5)}</td>
</tr>
</table>`);
  const mobileCta =
    mobileOnly(`<table class="act mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%;background:#ffffff">
<tr>
<td valign="middle" style="padding:14px 12px 14px 20px">${button('VIEW YOUR INTAKE', d.foundationUrl, { width: 230, color: T.ink })}</td>
<td width="110" valign="middle" style="width:110px">${img(asset(`assets/${slug}/cta_side-mobile.jpg`), 'Red glass beside a limestone wall.', 110, null, 'width:100%;height:auto;')}</td>
</tr>
</table>`);
  return {
    subject: "WE'VE RECEIVED YOUR INTAKE",
    subjectHtml: "WE'VE RECEIVED YOUR INTAKE",
    preheader: "WE'RE REVIEWING WHAT YOU SHARED AND WILL FOLLOW UP WITH YOUR RECOMMENDATION.",
    label: 'Digital Foundation intake received',
    blocks: [
      mast({ preheader: "WE'RE REVIEWING WHAT YOU SHARED AND WILL FOLLOW UP WITH YOUR RECOMMENDATION.", line1: 'YOUR DIGITAL FOUNDATION', line2: 'INTAKE RECEIVED', rule: true }),
      desktopHero(asset, slug, copy, {
        column: 300,
        alt: 'Intake confirmation card on a marble ledge before a city skyline, a crystal and a red maple nearby.',
        card: cardLayer(CARD_SPECS[slug].desktop, card),
      }),
      mobileHero(asset, slug, copy, {
        height: 440,
        alt: 'Intake confirmation card on a marble table beside red glass and a red maple.',
        fit: { zone: 214, padTop: 20, head: 34, body: 9, textWidth: 190 },
        card: mobileCardLayer(slug, 440, card),
      }),
      deskBand(asset, 'WHAT HAPPENS NEXT', next, { titleWidth: 170, sideLeft: 'YOUR<br>FOUNDATION<br>BRINGS<br>EVERYTHING ELSE<br>INTO FOCUS.' }),
      mobileColumns(asset, 'WHAT HAPPENS NEXT', next),
      mobileClose,
      deskAct(asset, slug, cta, { left: 'left-desktop.jpg', right: 'right-desktop.jpg', leftAlt: STRIP_ALT.glass, rightAlt: STRIP_ALT.terrace }),
      mobileCta,
      foot(),
    ],
  };
}

export function compose03(asset: AssetResolver, d: Data03): Composition {
  const slug = '03_recommendation_quote';
  const copy: HeroCopy = {
    kicker: forName(d.firstName),
    headline: ['YOUR', 'RECOMMENDATION', 'IS READY'],
    body: "THANK YOU AGAIN FOR YOUR INTAKE. BASED ON WHAT YOU SHARED, WE'VE PREPARED A DIGITAL FOUNDATION RECOMMENDATION AND A CLEAR QUOTE FOR YOUR REVIEW. THIS IS A PROPOSAL—NOT A COMMITMENT—UNTIL YOU ACCEPT THE SCOPE AND COMPLETE PAYMENT.",
    deskSize: 37,
    tagline: TAGLINE,
    mobileTagline: TAGLINE_MOBILE,
  };
  const items = scopeItems(d.scope);
  const cta = { label: 'REVIEW YOUR RECOMMENDATION & QUOTE', url: d.foundationUrl, caption: 'REVIEW SCOPE, PRICING, AND OPTIONAL ENHANCEMENTS ON YOUR FOUNDATION PAGE.' };
  const card = (pill: boolean): CardRow[] => [
    ...clientRow(d.clientName),
    { label: 'YOUR FOUNDATION', value: d.service, personalized: false },
    ...(d.recommendation ? [{ label: 'OUR RECOMMENDATION', value: d.recommendation }] : []),
    { label: 'QUOTE', value: d.quoteAmount },
    { label: 'VALID UNTIL', value: d.validUntil },
    { label: 'NEXT STEP', value: 'REVIEW PROPOSAL', tone: 'red', personalized: false, ...(pill ? { pill: { url: d.foundationUrl } } : {}) },
  ];
  const tags = scopeTags(d.scope);
  return {
    subject: 'YOUR FOUNDATION RECOMMENDATION IS READY',
    subjectHtml: 'YOUR FOUNDATION RECOMMENDATION IS READY',
    preheader: "WE'VE PREPARED A DIRECTION BASED ON YOUR BUSINESS NEEDS.",
    label: 'Digital Foundation recommendation and quote',
    blocks: [
      mast({
        preheader: "WE'VE PREPARED A DIRECTION BASED ON YOUR BUSINESS NEEDS.",
        line1: 'YOUR DIGITAL FOUNDATION',
        line2: 'YOUR PROPOSAL',
        mobileLines: ['YOUR DIGITAL FOUNDATION', 'RECOMMENDATION & QUOTE'],
      }),
      desktopHero(asset, slug, copy, {
        column: 285,
        alt: 'Recommendation and quote card on a marble ledge with a crystal and stacked books, the sea behind.',
        card: cardLayer(CARD_SPECS[slug].desktop, card(true), tags),
      }),
      mobileHero(asset, slug, copy, {
        height: 470,
        alt: 'Recommendation and quote card on a limestone ledge, a crystal on stacked books.',
        fit: { zone: 268, padTop: 20, head: 30, body: 9, textWidth: 214, tagline: { at: 'below' } },
        card: mobileCardLayer(slug, 470, card(false), tags),
      }),
      deskBand(asset, 'YOUR PLAN INCLUDES', items, { titleWidth: 150, mark: 'icon-num' }),
      mobileRows(asset, 'YOUR PLAN INCLUDES', items, { inline: true }),
      mobileOnly(`<table class="walk mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%;background:#ffffff"><tr><td style="padding:4px 20px 0">${addonsInline(d.addons)}</td></tr></table>`),
      addonsLine(d.addons),
      deskAct(asset, slug, cta, { left: 'left-desktop.jpg', right: 'right-desktop.jpg', leftAlt: STRIP_ALT.glass, rightAlt: STRIP_ALT.terrace }),
      mobileAct(cta),
      mobileStrip(asset, slug, 'strip-mobile.jpg', STRIP_ALT.glass, 62),
      foot(),
    ],
  };
}

export function compose04(asset: AssetResolver, d: Data04): Composition {
  const slug = '04_payment_received';
  const active = d.activation === 'active';
  const copy: HeroCopy = {
    kicker: forName(d.firstName),
    headline: ['PAYMENT', 'RECEIVED'],
    sub: active ? 'YOUR DIGITAL FOUNDATION IS UNDERWAY.' : 'YOUR PAYMENT IS CONFIRMED.',
    body: active
      ? "THANK YOU—YOUR PAYMENT IS CONFIRMED AND YOUR DIGITAL FOUNDATION IS OFFICIALLY UNDERWAY. OUR TEAM IS BEGINNING THE WORK WE OUTLINED IN YOUR ACCEPTED QUOTE."
      : "THANK YOU—YOUR PAYMENT IS CONFIRMED. WE'RE FINALIZING PROJECT ACTIVATION ON OUR SIDE AND WILL EMAIL YOU AS SOON AS YOUR FOUNDATION WORK BEGINS.",
  };
  const mobileCopy: HeroCopy = {
    kicker: forName(d.firstName) ?? 'PAYMENT CONFIRMED',
    headline: active ? ['YOUR', 'FOUNDATION', 'IS', 'UNDERWAY'] : ['PAYMENT', 'CONFIRMED'],
    body: active
      ? "YOUR PAYMENT IS CONFIRMED AND YOUR DIGITAL FOUNDATION IS UNDERWAY. WE'LL KEEP YOU INFORMED AS MILESTONES COMPLETE."
      : "YOUR PAYMENT IS CONFIRMED. ACTIVATION IS BEING FINALIZED—WE'LL EMAIL YOU WHEN YOUR FOUNDATION WORK BEGINS.",
  };
  const fields = [
    ...(d.clientName ? [{ label: 'CLIENT', value: d.clientName }] : []),
    { label: 'YOUR FOUNDATION', value: d.service },
    { label: 'AMOUNT', value: d.amount },
    { label: 'DATE', value: d.paidAt },
    ...(d.method ? [{ label: 'PAYMENT METHOD', value: d.method }] : []),
    { label: 'FOR YOUR RECORDS', value: d.reference },
    { label: 'PAYMENT', value: d.status, red: true },
  ];
  const next: BandItem[] = [
    {
      n: '01',
      icon: 'square',
      iconAlt: 'Project',
      title: active ? 'WE\'RE UNDERWAY' : 'CONFIRMATION',
      text: active ? "WE'VE RECORDED YOUR PAYMENT AND OPENED YOUR DIGITAL FOUNDATION PROJECT." : "WE'VE RECORDED YOUR PAYMENT. WE'LL EMAIL YOU AS SOON AS YOUR PROJECT IS ACTIVE.",
      tone: active ? undefined : 'muted',
    },
    {
      n: '02',
      icon: 'layers',
      iconAlt: 'Setup',
      title: 'FOUNDATION SETUP',
      text: active ? 'OUR TEAM IS PREPARING YOUR ACCOUNT AND THE ESSENTIALS WE DISCUSSED.' : 'BEGINS ONCE YOUR PROJECT IS ACTIVE.',
      tone: active ? undefined : 'muted',
    },
    { n: '03', icon: 'document', iconAlt: 'Records', title: 'RECORDS + DELIVERY', text: "YOU'LL RECEIVE ACCESS DETAILS AND NEXT STEPS SHORTLY VIA EMAIL." },
  ];
  const rowH = fields.length > 6 ? 15 : 17;
  const receiptRows = fields
    .map(
      (
        f,
      ) => `<tr><td width="112" style="width:112px;height:${rowH}px;font-family:${FONT_BODY};font-size:8px;line-height:${rowH}px;letter-spacing:.16em;color:${T.mute};text-transform:uppercase;white-space:nowrap">${esc(f.label)}</td>
<td style="height:${rowH}px;font-family:${FONT_BODY};font-size:9.5px;line-height:${rowH}px;letter-spacing:.1em;font-weight:${'red' in f ? 600 : 500};color:${'red' in f ? T.red : T.ink};text-transform:uppercase;white-space:nowrap;overflow:hidden">${v(f.value)}</td></tr>`,
    )
    .join('');
  const receipt =
    mobileOnly(`<table class="receipt mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%">
<tr><td background="${asset(`assets/${slug}/receipt-mobile.jpg`)}" bgcolor="#f1efeb" height="240" valign="top" style="background-color:#f1efeb;background-image:url('${asset(`assets/${slug}/receipt-mobile.jpg`)}');background-size:100% 100%;background-repeat:no-repeat;height:240px;padding:0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="height:64px;line-height:64px;font-size:1px">&nbsp;</td></tr>
<tr><td style="padding:0 0 0 38px;height:116px" valign="top"><table role="presentation" width="250" cellpadding="0" cellspacing="0" border="0" style="width:250px">${receiptRows}</table></td></tr>
<tr><td style="padding:6px 0 0 38px"><table role="presentation" width="310" cellpadding="0" cellspacing="0" border="0" style="width:310px"><tr>
<td valign="top" width="190" style="width:190px;font-size:7.5px;line-height:11px">${microLabel('NEXT STEP', T.ink, 7.5)}<br>${microLabel(active ? 'OUR TEAM IS PREPARING<br>YOUR PROJECT ENVIRONMENT.' : "WE'LL CONFIRM WHEN<br>YOUR PROJECT IS ACTIVE.", T.body, 7.5)}</td>
<td valign="top" style="padding-left:18px;font-size:7.5px;line-height:11px">${microLabel('WHERE YOU ARE', T.ink, 7.5)}<br>${microLabel(active ? 'FOUNDATION IN PROGRESS' : 'ACTIVATION SOON', active ? T.body : T.red, 7.5)}</td>
</tr></table></td></tr>
</table>
</td></tr>
<tr><td>${img(asset(`assets/${slug}/blueprint-mobile.jpg`), 'Architectural blueprint on limestone beside red glass, with the words ideas, systems, people, reality.', 390, null, 'width:100%;height:auto;')}</td></tr>
</table>`);
  const cta = { label: 'OPEN YOUR FOUNDATION', url: d.foundationUrl, caption: 'OR REPLY TO THIS EMAIL IF YOU HAVE ANY QUESTIONS.' };
  const pre = active ? "HERE'S WHAT HAPPENS NEXT ON YOUR FOUNDATION." : 'YOUR PAYMENT IS CONFIRMED. ACTIVATION FOLLOWS SHORTLY.';
  const subject = active ? 'YOUR DIGITAL FOUNDATION IS UNDERWAY' : 'YOUR PAYMENT IS CONFIRMED';
  return {
    subject,
    subjectHtml: subject,
    preheader: pre,
    label: 'Digital Foundation payment received',
    blocks: [
      mast({
        preheader: pre,
        line1: 'YOUR DIGITAL FOUNDATION',
        line2: 'PAYMENT CONFIRMED',
        mobileLines: ['YOUR DIGITAL FOUNDATION', 'PAYMENT CONFIRMED'],
      }),
      desktopHero(asset, slug, copy, {
        column: 250,
        alt: 'Payment receipt card with a red PAID seal on a limestone ledge above the sea.',
        card: cardLayer(
          CARD_SPECS[slug].desktop,
          fields.map((f) => ({ label: f.label, value: f.value, tone: 'red' in f ? 'red' : undefined, personalized: !('red' in f) })),
        ),
      }),
      mobileHero(asset, slug, mobileCopy, {
        height: active ? 262 : 196,
        alt: 'Limestone and red glass architecture above the coast.',
        fit: { zone: active ? 252 : 186, padTop: 22, head: 36, body: 9.5, textWidth: 250 },
      }),
      receipt,
      deskBand(asset, 'WHAT HAPPENS NEXT', next, { titleWidth: 170 }),
      mobileColumns(asset, 'WHAT HAPPENS NEXT', next, { small: true }),
      deskAct(asset, slug, cta, {
        left: 'left-desktop.jpg',
        right: 'right-desktop.jpg',
        leftAlt: STRIP_ALT.glass,
        rightAlt: 'Red glass architecture with the words people, ideas, systems, foundations, reality.',
      }),
      mobileAct({ label: 'OPEN YOUR PROJECT', url: d.foundationUrl, caption: '' }),
      foot(),
    ],
  };
}

export function compose05(asset: AssetResolver, d: Data05): Composition {
  const slug = '05_foundation_complete';
  const copy: HeroCopy = {
    kicker: forName(d.firstName),
    headline: ['YOUR', 'FOUNDATION', 'IS COMPLETE'],
    body: 'YOUR DIGITAL FOUNDATION IS COMPLETE—VERIFIED AND READY FOR YOU. DOMAIN, EMAIL, SECURITY, AND RECORDS ARE IN PLACE. YOUR CLIENT PORTAL HOLDS ACCESS DETAILS, OWNERSHIP INFORMATION, AND RENEWAL GUIDANCE GOING FORWARD.',
    mobileBody: 'YOUR FOUNDATION IS COMPLETE AND VERIFIED. VISIT YOUR PORTAL FOR ACCESS, RECORDS, AND WHAT COMES NEXT.',
    tagline: TAGLINE,
    mobileTagline: TAGLINE_MOBILE,
  };
  const icons = ['globe', 'envelope', 'shield', 'device', 'records'];
  const items: BandItem[] = d.items.map((it, i) => ({
    n: String(i + 1).padStart(2, '0'),
    icon: icons[i],
    iconAlt: it.label,
    title: it.label,
    text: it.verified ? it.detail : 'PENDING VERIFICATION.',
    value: it.verified && it.value && it.key !== 'device' && it.key !== 'records' ? it.value : undefined,
    tone: it.verified ? undefined : 'muted',
  }));
  const status = (_: BandItem, i: number) => {
    const ok = d.items[i].verified;
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td valign="middle" style="padding-right:8px">${icon(asset(`assets/icons/${ok ? 'check-red' : 'ring-pending'}.png`), ok ? 'Complete' : 'Pending', 18)}</td><td valign="middle">${microLabel(ok ? 'COMPLETE' : 'PENDING', ok ? T.ink : T.faint, 8)}</td></tr></table>`;
  };
  const panel = mobileRows(asset, "WHAT'S COMPLETE", items, {
    status,
    panel: {
      after: `${button('VIEW YOUR FOUNDATION', d.foundationUrl, { width: 320 })}${caption(esc('YOUR HANDOFF LIVES IN YOUR CLIENT PORTAL—RECORDS, ACCESS, AND NEXT STEPS.'))}`,
    },
  });
  const cta = { label: 'VIEW YOUR COMPLETED FOUNDATION', url: d.foundationUrl, caption: 'OPEN YOUR PORTAL FOR RECORDS, ACCESS, AND ONGOING GUIDANCE.' };
  return {
    subject: 'YOUR DIGITAL FOUNDATION IS COMPLETE',
    subjectHtml: 'YOUR DIGITAL FOUNDATION IS COMPLETE',
    preheader: 'YOUR ESSENTIALS ARE IN PLACE. HERE IS YOUR HANDOFF.',
    label: 'Digital Foundation complete',
    blocks: [
      mast({
        preheader: 'YOUR ESSENTIALS ARE IN PLACE. HERE IS YOUR HANDOFF.',
        line1: 'YOUR DIGITAL FOUNDATION',
        line2: 'DELIVERY COMPLETE',
        mobileLines: ['YOUR DIGITAL FOUNDATION', 'DELIVERY COMPLETE'],
      }),
      desktopHero(asset, slug, copy, { column: 270, alt: 'Marble gift box tied with a red ribbon and wax seal on a limestone terrace above the sea.' }),
      mobileHero(asset, slug, copy, {
        height: 390,
        alt: 'Marble gift box with a red ribbon and an All Set card on a limestone terrace.',
        fit: { zone: 300, padTop: 22, head: 38, body: 9, textWidth: 205 },
        artHeight: MOBILE_ART_HEIGHT[slug],
        lip: { height: 64, html: panelHead("WHAT'S COMPLETE", 'YOUR DIGITAL<br>FOUNDATION<br>INCLUDES:') },
      }),
      deskBand(asset, "WHAT'S INCLUDED", items, { titleWidth: 150, mark: 'icon-num' }),
      panel,
      deskAct(asset, slug, cta, { left: 'left-desktop.jpg', right: 'right-desktop.jpg', leftAlt: STRIP_ALT.glass, rightAlt: STRIP_ALT.terrace }),
      mobileStrip(asset, slug, 'strip-mobile.jpg', STRIP_ALT.glass, 77),
      foot(),
    ],
  };
}

export function compose06(asset: AssetResolver, d: Data06): Composition {
  const slug = '06_resume_intake';
  const copy: HeroCopy = {
    kicker: forName(d.firstName),
    headline: ['CONTINUE YOUR', 'FOUNDATION'],
    mobileHeadline: ['CONTINUE', 'YOUR', 'FOUNDATION'],
    deskSize: 34,
    body: "WHENEVER YOU'RE READY, YOU CAN CONTINUE YOUR DIGITAL FOUNDATION INTAKE. YOUR ANSWERS ARE SAVED—PICK UP WHERE YOU LEFT OFF AT YOUR OWN PACE.",
    tagline: TAGLINE,
    mobileTagline: TAGLINE_MOBILE,
  };
  const stateIcon = (s: Data06['steps'][number]['state']) => (s === 'complete' ? 'check-ink' : s === 'in_progress' ? 'ring-red' : 'ring-pending');
  const stepIcons: Record<string, string> = { invitation: 'envelope', intake: 'document', recommendation: 'cube', complete: 'gear' };
  const cols = d.steps
    .map(
      (s, i) => `<td valign="top" style="padding:22px 10px 20px 14px;border-left:1px solid ${T.line}">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" class="keep-red" style="padding-right:12px;font-family:${FONT_DISPLAY};font-weight:600;font-size:21px;line-height:22px;color:${s.state === 'pending' ? T.faint : T.red}">${String(i + 1).padStart(2, '0')}</td>
<td valign="middle">${icon(asset(`assets/icons/${stateIcon(s.state)}.png`), s.note, 18)}</td>
</tr></table>
${SPACE(9)}
<p style="margin:0;font-family:${FONT_BODY};font-size:10.5px;line-height:14px;letter-spacing:.16em;font-weight:600;color:${s.state === 'pending' ? T.faint : T.ink}">${esc(s.label)}</p>
<p style="margin:3px 0 0;font-family:${FONT_BODY};font-size:9px;line-height:13px;letter-spacing:.16em;color:${s.state === 'in_progress' ? T.red : T.faint}">${esc(s.note)}</p>
</td>`,
    )
    .join('');
  const deskProgress = `<table class="walk desk-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:${T.marble}">
<tr><td style="padding:0 0 0 24px" width="190" valign="middle">${sectionTitle('YOUR PROGRESS', 30)}</td>${cols}<td width="12" style="width:12px">&nbsp;</td></tr>
</table>`;
  const items: BandItem[] = d.steps.map((s, i) => ({
    n: String(i + 1).padStart(2, '0'),
    icon: stepIcons[s.key],
    iconAlt: s.label,
    title: s.label,
    text: s.note,
    textTone: s.state === 'in_progress' ? ('red' as const) : undefined,
    tone: s.state === 'pending' ? 'muted' : undefined,
  }));
  const status = (_: BandItem, i: number) => {
    const s = d.steps[i];
    const label = s.state === 'complete' ? 'COMPLETE' : s.state === 'in_progress' ? 'IN PROGRESS' : 'PENDING';
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td valign="middle" style="padding-right:8px">${icon(asset(`assets/icons/${stateIcon(s.state)}.png`), label, 18)}</td><td valign="middle">${microLabel(label, s.state === 'pending' ? T.faint : T.ink, 8)}</td></tr></table>`;
  };
  const deskNext = `<table class="act desk-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#ffffff">
<tr>
<td width="170" valign="middle" style="width:170px">${img(asset(`assets/${slug}/left-desktop.jpg`), STRIP_ALT.glass, 170, 100, 'object-fit:cover;')}</td>
<td valign="middle" style="padding:14px 10px 14px 22px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="top" style="padding-right:12px">${icon(asset('assets/icons/document.png'), 'Intake', 24)}</td>
<td valign="top"><p style="margin:0;font-family:${FONT_BODY};font-size:11px;line-height:15px;letter-spacing:.18em;font-weight:600;color:${T.ink}">NEXT STEP:</p>
<p style="margin:4px 0 0;font-family:${FONT_BODY};font-size:9px;line-height:13px;letter-spacing:.12em;color:${T.mute}">A FEW MORE DETAILS HELP US UNDERSTAND YOUR BUSINESS, PRIORITIES, AND SETUP NEEDS—NO PRESSURE, NO DEADLINE UNLESS YOU SET ONE.</p>
<p style="margin:6px 0 0;font-family:${FONT_BODY};font-size:8.5px;line-height:12px;letter-spacing:.14em;color:${T.faint}">PROGRESS SAVED ${v(d.savedAt)}</p></td>
</tr></table></td>
<td valign="middle" align="right" style="padding:14px 24px 14px 0">${button('RESUME YOUR INTAKE', d.intakeUrl, { width: 230 })}</td>
</tr>
</table>`;
  return {
    subject: 'CONTINUE YOUR FOUNDATION INTAKE',
    subjectHtml: 'CONTINUE YOUR FOUNDATION INTAKE',
    preheader: 'YOUR PROGRESS IS SAVED WHENEVER YOU ARE READY.',
    label: 'Resume your Digital Foundation intake',
    blocks: [
      mast({
        preheader: 'YOUR PROGRESS IS SAVED WHENEVER YOU ARE READY.',
        line1: 'YOUR DIGITAL FOUNDATION',
        line2: 'CONTINUE INTAKE',
      }),
      desktopHero(asset, slug, copy, { column: 250, alt: 'Laptop showing the Digital Foundation intake on a limestone terrace above the sea.' }),
      mobileHero(asset, slug, copy, {
        height: 425,
        alt: 'Laptop showing the Digital Foundation intake beside books and a crystal on a limestone terrace.',
        fit: { zone: 320, padTop: 18, head: 34, body: 9, textWidth: 175, tagline: { at: 'below' } },
        artHeight: MOBILE_ART_HEIGHT[slug],
        lip: { height: 64, html: panelHead('YOUR PROGRESS', 'YOUR FOUNDATION<br>INTAKE PROGRESS') },
      }),
      deskProgress,
      mobileRows(asset, 'YOUR PROGRESS', items, {
        status,
        panel: {
          after: `${button('RESUME YOUR INTAKE', d.intakeUrl, { width: 320 })}${caption(`YOUR INFORMATION HAS ALREADY BEEN SAVED.<br>LAST SAVED ${v(d.savedAt)}.`)}`,
        },
      }),
      deskNext,
      mobileStrip(asset, slug, 'strip-mobile.jpg', STRIP_ALT.glass, 80),
      foot(),
    ],
  };
}

export function compose07(asset: AssetResolver, d: Data07): Composition {
  const slug = '07_quote_expiry';
  const copy: HeroCopy = {
    kicker: forName(d.firstName),
    headline: ['YOUR QUOTE', 'IS ABOUT TO', 'EXPIRE SOON'],
    body: 'YOUR DIGITAL FOUNDATION PROPOSAL REMAINS AVAILABLE, AND YOUR QUOTED PRICING IS VALID UNTIL THE DATE BELOW. WHEN YOU ARE READY, REVIEW AND ACCEPT TO MOVE FORWARD—NO WEBSITE BUILD IS INCLUDED UNLESS YOU ADD IT SEPARATELY.',
    tagline: TAGLINE,
    mobileTagline: TAGLINE_MOBILE,
    deskTagline: false,
    deskBodyWidth: 205,
  };
  const items = scopeItems(d.scope);
  const unit = (
    n: number,
    label: string,
    first: boolean,
  ) => `<td align="center" valign="top" style="padding:0 12px;${first ? '' : `border-left:1px solid ${T.red};`}">
<div class="keep-red" style="font-family:${FONT_DISPLAY};font-weight:500;font-size:26px;line-height:28px;color:${T.red}">${v(String(n).padStart(2, '0'))}</div>
<div style="font-family:${FONT_BODY};font-size:8.5px;line-height:12px;letter-spacing:.2em;color:${T.mute}">${label}</div></td>`;
  const countdown = `<p style="margin:0 0 8px;font-family:${FONT_BODY};font-size:10.5px;line-height:14px;letter-spacing:.18em;font-weight:600;color:${T.ink}">QUOTE EXPIRES IN</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${unit(d.remaining.days, 'DAYS', true)}${unit(d.remaining.hours, 'HOURS', false)}${unit(d.remaining.minutes, 'MINUTES', false)}</tr></table>
<p style="margin:8px 0 0;font-family:${FONT_BODY};font-size:8px;line-height:12px;letter-spacing:.14em;color:${T.faint}">AS OF ${v(d.asOf)}<br>VALID UNTIL ${v(d.validUntil)}</p>`;
  const deskAct07 = `<table class="act desk-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#ffffff">
<tr>
<td width="150" valign="middle" style="width:150px">${img(asset(`assets/${slug}/left-desktop.jpg`), STRIP_ALT.glass, 150, 110, 'object-fit:cover;')}</td>
<td valign="middle" style="padding:14px 8px 14px 22px">${countdown}</td>
<td valign="middle" align="center" style="padding:14px 22px 14px 8px">${button('REVIEW YOUR QUOTE', d.foundationUrl, { width: 220 })}${caption('ACCEPT YOUR PROPOSAL BEFORE<br>THE QUOTE EXPIRES.')}</td>
</tr>
</table>`;
  const mobileClose = `${addonsInline(d.addons)}${countdown.replace('margin:0 0 8px', 'margin:0 0 8px;text-align:center').replace('margin:8px 0 0', 'margin:8px 0 0;text-align:center')}<div style="height:14px;line-height:14px;font-size:1px">&nbsp;</div>${button('REVIEW YOUR QUOTE', d.foundationUrl, { width: 320 })}${caption('YOUR QUOTED PRICING IS VALID UNTIL THE DATE SHOWN—REVIEW WHEN YOU ARE READY.')}`;
  const pre = `YOUR QUOTE IS VALID UNTIL ${d.validUntil}. REVIEW YOUR PROPOSAL WHEN YOU ARE READY.`;
  const card: CardRow[] = [
    ...clientRow(d.clientName),
    { label: 'YOUR FOUNDATION', value: d.service, personalized: false },
    { label: 'QUOTE', value: d.quoteAmount },
    { label: 'ISSUED', value: d.issuedAt },
    { label: 'VALID UNTIL', value: d.validUntilDate, tone: 'red' },
    { label: 'WHERE YOU ARE', value: d.status, tone: 'red', personalized: false },
  ];
  const tags = scopeTags(d.scope);
  return {
    subject: 'REMINDER: YOUR QUOTE EXPIRES SOON',
    subjectHtml: 'REMINDER: YOUR QUOTE EXPIRES SOON',
    preheader: pre,
    label: 'Digital Foundation quote expiry reminder',
    blocks: [
      mast({ preheader: pre, line1: 'YOUR DIGITAL FOUNDATION', line2: 'QUOTE REMINDER' }),
      desktopHero(asset, slug, copy, {
        column: 260,
        alt: 'Quote card stamped QUOTE beside an hourglass of red sand on a limestone ledge above the sea.',
        card: cardLayer(CARD_SPECS[slug].desktop, card, tags),
      }),
      mobileHero(asset, slug, copy, {
        height: 410,
        alt: 'Quote card beside an hourglass of red sand on a limestone ledge.',
        fit: { zone: 200, padTop: 20, head: 32, body: 9, textWidth: 210, tagline: { at: 'beside-card', top: 210 } },
        card: mobileCardLayer(slug, 410, card, tags),
        lip: { height: 48, html: panelHead('YOUR PLAN INCLUDES', 'EVERYTHING YOU NEED<br>TO LAUNCH YOUR<br>DIGITAL FOUNDATION.', 8) },
      }),
      deskBand(asset, 'YOUR PLAN INCLUDES', items, { titleWidth: 150, mark: 'icon' }),
      mobileRows(asset, 'YOUR PLAN INCLUDES', items, { mark: 'icon', panel: { after: mobileClose } }),
      addonsLine(d.addons),
      deskAct07,
      mobileStrip(asset, slug, 'strip-mobile.jpg', STRIP_ALT.glass, 70),
      foot(),
    ],
  };
}
