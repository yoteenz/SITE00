/** FNDATN-01 compositions. Seven emails, seven arrangements of the shared parts. */
import type { Data01, Data02, Data03, Data04, Data05, Data06, Data07, AddonLine, ScopeItem } from './contracts.js';
import { FONT_BODY, FONT_DISPLAY, T, button, caption, esc, icon, img, microLabel, mobileOnly, sectionTitle, v, type AssetResolver } from './html.js';
import { textWidth } from '../editorial/measure.js';
import { desktopHero, mobileHero, type HeroCopy } from './hero.js';
import { SPACE, deskAct, deskBand, foot, ledger, mast, mobileAct, mobileRows, mobileStrip, type BandItem } from './layout.js';

export type Composition = { subject: string; subjectHtml: string; preheader: string; label: string; blocks: string[]; styles?: string[] };

const TAGLINE = ['SAME VISION.', 'MORE CLARITY.', 'A STRONGER TOMORROW.'];

function forName(name: string | null): string | null {
  return name ? `FOR ${v(name)}` : null;
}

const SCOPE_ICONS: Record<string, string> = { domain: 'globe', email: 'envelope', security: 'shield', device: 'device', records: 'records' };

function scopeItems(scope: readonly ScopeItem[]): BandItem[] {
  return scope.map((s, i) => ({ n: String(i + 1).padStart(2, '0'), icon: SCOPE_ICONS[s.key], iconAlt: s.label, title: esc(s.label), text: esc(s.detail) }));
}

function addonsLine(addons: AddonLine[]): string {
  if (!addons.length) return '';
  const list = addons.map((a) => `${v(a.label)}${a.quantity > 1 ? ` × ${v(a.quantity)}` : ''}`).join(' &nbsp;·&nbsp; ');
  return `<table class="ledger" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:${T.paper};border-bottom:1px solid ${T.line}">
<tr><td class="px" style="padding:12px 28px">${microLabel('SELECTED ADD-ONS', T.mute, 8)}<br><span style="font-family:${FONT_BODY};font-size:11px;line-height:17px;letter-spacing:.1em;font-weight:500;color:${T.ink};text-transform:uppercase">${list}</span></td></tr>
</table>`;
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
<p style="margin:4px 0 0;font-family:${FONT_BODY};font-size:8.5px;line-height:12px;letter-spacing:.08em;color:${T.mute};text-transform:uppercase">${esc(it.text)}</p>
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

// ---------------------------------------------------------------------------------------------

export function compose01(asset: AssetResolver, d: Data01): Composition {
  const slug = '01_invitation';
  const copy: HeroCopy = {
    kicker: forName(d.firstName),
    headline: ['BEGIN YOUR', 'FOUNDATION'],
    body: "WE'VE PREPARED YOUR DIGITAL FOUNDATION INVITATION. BEFORE WE SET ANYTHING UP, WE'D LIKE TO UNDERSTAND YOUR WORK, PRIORITIES, AND WHAT COMES NEXT.",
    tagline: ['A STRONGER', 'TOMORROW', 'STARTS HERE.'],
  };
  const ask: BandItem[] = [
    { n: '01', icon: 'person', iconAlt: 'Person', title: 'YOUR BUSINESS', text: 'WHAT YOU DO, WHO YOU SERVE, AND WHAT NEEDS TO BE IN PLACE.' },
    { n: '02', icon: 'target', iconAlt: 'Target', title: 'YOUR PRIORITIES', text: 'TIMING, GOALS, AND THE DIRECTION THAT FITS YOUR NEXT STEP.' },
    { n: '03', icon: 'layers', iconAlt: 'Layers', title: 'BUILD DIRECTION', text: "PAGES, FEATURES, AND THE WAY YOU'D LIKE SITE 00 TO APPROACH IT." },
  ];
  const how =
    mobileOnly(`<table class="walk mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%;background:#ffffff">
<tr><td style="padding:22px 20px 12px">${sectionTitle('HOW IT WORKS', 28)}</td></tr>
<tr><td style="padding:0 20px 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
${[
  ['01', 'OPEN YOUR<br>INVITATION'],
  ['02', 'COMPLETE THE<br>FOUNDATION INTAKE'],
  ['03', 'WE REVIEW AND<br>PREPARE YOUR<br>NEXT STEP'],
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
  const linkCaption = `<a href="${esc(d.intakeUrl)}" style="color:${T.mute};text-decoration:none;letter-spacing:.06em;text-transform:none">${esc(d.intakeUrl.replace(/^https:\/\//, ''))}</a>`;
  const cta = { label: 'BEGIN YOUR FOUNDATION', url: d.intakeUrl, caption: linkCaption };
  const dh = desktopHero(asset, '01', copy, 'Foundation invitation card resting on a limestone terrace above the sea, red glass architecture behind.');
  const mh = mobileHero(asset, '01', copy, 'Foundation invitation card on a limestone terrace, red glass architecture behind.');
  return {
    styles: [dh.css, mh.css],
    subject: 'YOUR FOUNDATION INVITATION',
    subjectHtml: 'YOUR FOUNDATION INVITATION',
    preheader: "BEFORE WE BUILD, WE'D LIKE TO LEARN HOW YOU WORK.",
    label: 'Digital Foundation invitation',
    blocks: [
      mast({
        preheader: "BEFORE WE BUILD, WE'D LIKE TO LEARN HOW YOU WORK.",
        line1: 'TRANSACTIONAL · DIGITAL FOUNDATION',
        line2: "ARCHITECTURE FOR WHAT'S NEXT",
      }),
      dh.html,
      mh.html,
      ledger('FOUNDATION INVITATION', 'CLIENT INTAKE', [
        ...(d.clientName ? [{ label: 'CLIENT', value: d.clientName }] : []),
        { label: 'SERVICE', value: d.service, personalized: false },
        { label: 'STATUS', value: d.status, tone: 'red' as const, personalized: false },
        { label: 'ACCESS', value: d.access, tone: 'red' as const, personalized: false },
      ]),
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
    body: "THANK YOU FOR SHARING YOUR INFORMATION. WE'VE RECEIVED YOUR DIGITAL FOUNDATION INTAKE AND OUR TEAM IS NOW REVIEWING IT. YOU'LL HEAR FROM US SOON WITH NEXT STEPS.",
    tagline: TAGLINE,
  };
  const mobileCopy: HeroCopy = {
    ...copy,
    headline: ["WE'VE", 'RECEIVED', 'YOUR INTAKE'],
    body: "THANK YOU FOR SHARING YOUR INFORMATION. WE'VE RECEIVED YOUR DIGITAL FOUNDATION INTAKE AND ARE NOW REVIEWING IT.",
  };
  const dh = desktopHero(asset, '02', copy, 'Intake confirmation card on a marble ledge before a city skyline, a crystal and a red maple nearby.');
  const mh = mobileHero(asset, '02', mobileCopy, 'Intake confirmation card on a marble table beside red glass and a red maple.');
  const next: BandItem[] = [
    { n: '01', icon: 'magnifier', iconAlt: 'Review', title: 'REVIEW', text: "WE'LL REVIEW YOUR INFORMATION FOR ACCURACY AND ANY ADDITIONAL NEEDS." },
    { n: '02', icon: 'bubble', iconAlt: 'Clarify', title: 'CLARIFY', text: "IF WE NEED ANY ADDITIONAL DETAILS, WE'LL REACH OUT DIRECTLY." },
    { n: '03', icon: 'document', iconAlt: 'Prepare', title: 'PREPARE', text: "ONCE EVERYTHING IS CONFIRMED, WE'LL PREPARE YOUR CUSTOM PLAN AND QUOTE." },
  ];
  const cta = { label: 'VIEW YOUR INTAKE STATUS', url: d.foundationUrl, caption: 'OR REPLY TO THIS EMAIL IF YOU HAVE ANY QUESTIONS.' };
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
    styles: [dh.css, mh.css],
    subject: "WE'VE RECEIVED YOUR INTAKE",
    subjectHtml: "WE'VE RECEIVED YOUR INTAKE",
    preheader: "OUR TEAM IS NOW REVIEWING IT. YOU'LL HEAR FROM US SOON WITH NEXT STEPS.",
    label: 'Digital Foundation intake received',
    blocks: [
      mast({ preheader: "OUR TEAM IS NOW REVIEWING IT. YOU'LL HEAR FROM US SOON WITH NEXT STEPS.", line1: 'DIGITAL FOUNDATION', line2: 'CLIENT INTAKE' }),
      dh.html,
      mh.html,
      ledger('DIGITAL FOUNDATION', 'INTAKE CONFIRMATION', [
        ...(d.clientName ? [{ label: 'CLIENT', value: d.clientName }] : []),
        { label: 'STATUS', value: d.status, tone: 'red' as const, personalized: false },
        { label: 'RECEIVED', value: d.receivedAt },
        { label: 'REFERENCE', value: d.reference },
      ]),
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
    body: "BASED ON YOUR INTAKE, WE'VE PREPARED A TAILORED DIGITAL FOUNDATION PLAN AND QUOTE FOR YOUR REVIEW.",
    tagline: TAGLINE,
  };
  const items = scopeItems(d.scope);
  const cta = { label: 'REVIEW YOUR RECOMMENDATION & QUOTE', url: d.foundationUrl, caption: 'OR REPLY TO THIS EMAIL IF YOU HAVE ANY QUESTIONS.' };
  const dh = desktopHero(asset, '03', copy, 'Recommendation and quote card on a marble ledge with a crystal and stacked books, the sea behind.');
  const mh = mobileHero(asset, '03', copy, 'Recommendation and quote card on a limestone ledge, a crystal on stacked books.');
  return {
    styles: [dh.css, mh.css],
    subject: 'YOUR RECOMMENDATION IS READY',
    subjectHtml: 'YOUR RECOMMENDATION IS READY',
    preheader: `A TAILORED DIGITAL FOUNDATION PLAN AND QUOTE FOR YOUR REVIEW. VALID UNTIL ${d.validUntil}.`,
    label: 'Digital Foundation recommendation and quote',
    blocks: [
      mast({
        preheader: `A TAILORED DIGITAL FOUNDATION PLAN AND QUOTE FOR YOUR REVIEW. VALID UNTIL ${d.validUntil}.`,
        line1: 'TRANSACTIONAL · DIGITAL FOUNDATION',
        line2: 'RECOMMENDATION & QUOTE',
      }),
      dh.html,
      mh.html,
      ledger('DIGITAL FOUNDATION', 'RECOMMENDATION & QUOTE', [
        ...(d.clientName ? [{ label: 'CLIENT', value: d.clientName }] : []),
        { label: 'RECOMMENDATION', value: d.recommendation },
        { label: 'QUOTE', value: d.quoteAmount },
        { label: 'VALID UNTIL', value: d.validUntil, tone: 'red' as const },
      ]),
      deskBand(asset, 'YOUR PLAN INCLUDES', items, { titleWidth: 150 }),
      mobileRows(asset, 'YOUR PLAN INCLUDES', items),
      addonsLine(d.addons),
      deskAct(asset, slug, cta, { left: 'left-desktop.jpg', right: 'right-desktop.jpg', leftAlt: STRIP_ALT.glass, rightAlt: STRIP_ALT.terrace }),
      mobileAct(cta),
      mobileStrip(asset, slug, 'strip-mobile.jpg', STRIP_ALT.glass, 62),
      foot(),
    ],
  };
}

const RECEIPT_ROWS = 7;
const RECEIPT_LABEL = { family: 'body', weight: 400, size: 8, tracking: 0.16 } as const;
const RECEIPT_VALUE = { family: 'body', weight: 600, size: 9.5, tracking: 0.1 } as const;

/** The mobile receipt card holds seven one-line rows (112 px labels, 138 px values); anything longer moves to the standard ledger. */
function receiptFits(fields: { label: string; value: string }[]): boolean {
  return (
    fields.length <= RECEIPT_ROWS &&
    fields.every((f) => textWidth(f.label, RECEIPT_LABEL, 'fallback') <= 108 && textWidth(f.value, RECEIPT_VALUE, 'fallback') <= 134)
  );
}

export function compose04(asset: AssetResolver, d: Data04): Composition {
  const slug = '04_payment_received';
  const active = d.activation === 'active';
  const copy: HeroCopy = {
    kicker: forName(d.firstName),
    headline: ['PAYMENT', 'RECEIVED'],
    sub: active ? 'YOUR DIGITAL FOUNDATION IS NOW IN PROGRESS.' : 'PROJECT ACTIVATION IS PENDING.',
    body: active
      ? "THANK YOU FOR YOUR TRUST. WE'VE RECORDED YOUR PAYMENT AND STARTED YOUR PROJECT."
      : "THANK YOU FOR YOUR TRUST. WE'VE RECORDED YOUR PAYMENT. WE'LL CONFIRM AS SOON AS YOUR PROJECT IS ACTIVE.",
  };
  const mobileCopy: HeroCopy = {
    kicker: 'PAYMENT RECEIVED',
    headline: active ? ['YOUR', 'FOUNDATION', 'IS NOW', 'IN MOTION'] : ['PAYMENT', 'RECEIVED'],
    body: active
      ? "WE'VE RECORDED YOUR PAYMENT AND OPENED YOUR DIGITAL FOUNDATION PROJECT. YOUR WORK IS NOW FORMALLY IN MOTION."
      : "WE'VE RECORDED YOUR PAYMENT. WE'LL CONFIRM AS SOON AS YOUR PROJECT IS ACTIVE.",
  };
  const fields = [
    ...(d.clientName ? [{ label: 'CLIENT', value: d.clientName }] : []),
    { label: 'SERVICE', value: d.service },
    { label: 'AMOUNT', value: d.amount },
    { label: 'DATE', value: d.paidAt },
    ...(d.method ? [{ label: 'PAYMENT METHOD', value: d.method }] : []),
    { label: 'REFERENCE', value: d.reference },
    { label: 'STATUS', value: d.status, red: true },
  ];
  const next: BandItem[] = [
    {
      n: '01',
      icon: 'square',
      iconAlt: 'Project',
      title: active ? 'PROJECT OPENED' : 'PROJECT ACTIVATION',
      text: active ? "WE'VE RECORDED YOUR PAYMENT AND ACTIVATED YOUR DIGITAL FOUNDATION." : "WE'VE RECORDED YOUR PAYMENT. ACTIVATION IS CONFIRMED SEPARATELY.",
      tone: active ? undefined : 'muted',
    },
    {
      n: '02',
      icon: 'layers',
      iconAlt: 'Setup',
      title: 'FOUNDATION SETUP',
      text: active ? 'OUR TEAM IS PREPARING YOUR ACCOUNT AND INITIAL PROJECT ENVIRONMENT.' : 'BEGINS ONCE YOUR PROJECT IS ACTIVE.',
      tone: active ? undefined : 'muted',
    },
    { n: '03', icon: 'document', iconAlt: 'Records', title: 'RECORDS + DELIVERY', text: "YOU'LL RECEIVE ACCESS DETAILS AND NEXT STEPS SHORTLY VIA EMAIL." },
  ];
  const rowH = fields.length > 6 ? 15 : 17;
  const receiptRows = fields
    .map(
      (
        f,
      ) => `<tr><td width="112" style="width:112px;height:${rowH}px;font-family:${FONT_BODY};font-size:8px;line-height:${rowH}px;letter-spacing:.16em;color:${T.mute};text-transform:uppercase">${esc(f.label)}</td>
<td style="height:${rowH}px;font-family:${FONT_BODY};font-size:9.5px;line-height:${rowH}px;letter-spacing:.1em;font-weight:${'red' in f ? 600 : 500};color:${'red' in f ? T.red : T.ink};text-transform:uppercase;overflow-wrap:anywhere;word-break:break-word">${v(f.value)}</td></tr>`,
    )
    .join('');
  const blueprint = img(
    asset(`assets/${slug}/blueprint-mobile.jpg`),
    'Architectural blueprint on limestone beside red glass, with the words ideas, systems, people, reality.',
    390,
    null,
    'width:100%;height:auto;',
  );
  const ledgerFields = fields.map((f) => ({ label: f.label, value: f.value, tone: 'red' in f ? ('red' as const) : undefined }));
  const receipt = !receiptFits(fields)
    ? `${ledger('DIGITAL FOUNDATION', 'PAYMENT RECEIPT', ledgerFields, { desktop: false })}\n${mobileOnly(`<table class="rest mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%"><tr><td>${blueprint}</td></tr></table>`)}`
    : mobileOnly(`<table class="ledger mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%">
<tr><td background="${asset(`assets/${slug}/receipt-mobile.jpg`)}" bgcolor="#f1efeb" height="240" valign="top" style="background-color:#f1efeb;background-image:url('${asset(`assets/${slug}/receipt-mobile.jpg`)}');background-size:100% 100%;background-repeat:no-repeat;height:240px;padding:0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="height:64px;line-height:64px;font-size:1px">&nbsp;</td></tr>
<tr><td style="padding:0 0 0 38px;height:116px" valign="top"><table role="presentation" width="250" cellpadding="0" cellspacing="0" border="0" style="width:250px">${receiptRows}</table></td></tr>
<tr><td style="padding:6px 0 0 38px"><table role="presentation" width="330" cellpadding="0" cellspacing="0" border="0" style="width:330px"><tr>
<td valign="top" width="200" style="width:200px">${microLabel('NEXT STEP', T.ink, 7.5)}<br>${microLabel(active ? 'OUR TEAM IS PREPARING<br>YOUR PROJECT ENVIRONMENT.' : "WE'LL CONFIRM WHEN<br>YOUR PROJECT IS ACTIVE.", T.body, 7.5)}</td>
<td valign="top" style="padding-left:18px">${microLabel('PROJECT STATE', T.ink, 7.5)}<br>${microLabel(active ? 'FOUNDATION OPENED' : 'ACTIVATION PENDING', active ? T.body : T.red, 7.5)}</td>
</tr></table></td></tr>
</table>
</td></tr>
<tr><td>${blueprint}</td></tr>
</table>`);
  const cta = { label: 'OPEN YOUR FOUNDATION', url: d.foundationUrl, caption: 'OR REPLY TO THIS EMAIL IF YOU HAVE ANY QUESTIONS.' };
  const pre = active ? 'YOUR DIGITAL FOUNDATION IS NOW IN PROGRESS.' : "WE'VE RECORDED YOUR PAYMENT. PROJECT ACTIVATION IS PENDING.";
  const dh = desktopHero(asset, '04', copy, 'Payment receipt card with a red PAID seal on a limestone ledge above the sea.');
  const mh = mobileHero(asset, '04', mobileCopy, 'Limestone and red glass architecture above the coast.');
  return {
    styles: [dh.css, mh.css],
    subject: 'PAYMENT RECEIVED',
    subjectHtml: 'PAYMENT RECEIVED',
    preheader: pre,
    label: 'Digital Foundation payment received',
    blocks: [
      mast({ preheader: pre, line1: 'TRANSACTIONAL · DIGITAL FOUNDATION', line2: 'PAYMENT RECEIPT' }),
      dh.html,
      mh.html,
      ledger('DIGITAL FOUNDATION', 'PAYMENT RECEIPT', ledgerFields, { mobile: false }),
      receipt,
      deskBand(asset, 'WHAT HAPPENS NEXT', next, { titleWidth: 170 }),
      mobileColumns(asset, 'WHAT HAPPENS NEXT', next, { small: true }),
      deskAct(asset, slug, cta, {
        left: 'left-desktop.jpg',
        right: 'right-desktop.jpg',
        leftAlt: STRIP_ALT.glass,
        rightAlt: 'Red glass architecture with the words people, ideas, systems, foundations, reality.',
      }),
      mobileAct(cta),
      foot("ARCHITECTURE FOR WHAT'S NEXT", 'IDEAS · SYSTEMS · PEOPLE · REALITY'),
    ],
  };
}

export function compose05(asset: AssetResolver, d: Data05): Composition {
  const slug = '05_foundation_complete';
  const copy: HeroCopy = {
    kicker: forName(d.firstName),
    headline: ['YOUR', 'FOUNDATION', 'IS COMPLETE'],
    body: 'EVERYTHING YOU NEED IS SET UP AND READY. YOUR DIGITAL FOUNDATION HAS BEEN DELIVERED.',
    tagline: TAGLINE,
  };
  const mobileCopy: HeroCopy = { ...copy, body: 'EVERYTHING IS SET UP, VERIFIED, AND READY FOR YOU TO USE. WELCOME TO A CLEARER TOMORROW.' };
  const icons = ['globe', 'envelope', 'shield', 'device', 'records'];
  const items: BandItem[] = d.items.map((it, i) => ({
    n: String(i + 1).padStart(2, '0'),
    icon: icons[i],
    iconAlt: it.label,
    title: esc(it.label),
    text: it.verified
      ? `${esc(it.detail)}${it.value && it.key !== 'device' && it.key !== 'records' ? `<br><span style="color:${T.ink}">${v(it.value)}</span>` : ''}`
      : 'PENDING VERIFICATION.',
    tone: it.verified ? undefined : 'muted',
  }));
  const status = (_: BandItem, i: number) => {
    const ok = d.items[i].verified;
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td valign="middle" style="padding-right:8px">${icon(asset(`assets/icons/${ok ? 'check-red' : 'ring-pending'}.png`), ok ? 'Complete' : 'Pending', 18)}</td><td valign="middle">${microLabel(ok ? 'COMPLETE' : 'PENDING', ok ? T.ink : T.faint, 8)}</td></tr></table>`;
  };
  const panel = mobileRows(asset, "WHAT'S COMPLETE", items, { aside: 'YOUR DIGITAL<br>FOUNDATION<br>INCLUDES:', status });
  const cta = { label: 'VIEW YOUR COMPLETED FOUNDATION', url: d.foundationUrl, caption: 'EVERYTHING IS READY IN YOUR CLIENT PORTAL.' };
  const dh = desktopHero(asset, '05', copy, 'Marble gift box tied with a red ribbon and wax seal on a limestone terrace above the sea.');
  const mh = mobileHero(asset, '05', mobileCopy, 'Marble gift box with a red ribbon and an All Set card on a limestone terrace.');
  return {
    styles: [dh.css, mh.css],
    subject: 'YOUR FOUNDATION IS COMPLETE',
    subjectHtml: 'YOUR FOUNDATION IS COMPLETE',
    preheader: 'EVERYTHING YOU NEED IS SET UP AND READY.',
    label: 'Digital Foundation complete',
    blocks: [
      mast({ preheader: 'EVERYTHING YOU NEED IS SET UP AND READY.', line1: 'DIGITAL FOUNDATION', line2: 'ORDER COMPLETE & DELIVERED' }),
      dh.html,
      mh.html,
      ledger('DIGITAL FOUNDATION', 'ORDER COMPLETE', [
        ...(d.clientName ? [{ label: 'CLIENT', value: d.clientName }] : []),
        { label: 'SERVICE', value: d.service, personalized: false },
        { label: 'STATUS', value: 'COMPLETE', tone: 'red' as const, personalized: false },
        ...(d.deliveredAt ? [{ label: 'DELIVERED', value: d.deliveredAt }] : []),
      ]),
      deskBand(asset, "WHAT'S INCLUDED", items, { titleWidth: 150 }),
      panel,
      deskAct(asset, slug, cta, { left: 'left-desktop.jpg', right: 'right-desktop.jpg', leftAlt: STRIP_ALT.glass, rightAlt: STRIP_ALT.terrace }),
      mobileAct({
        label: 'VIEW YOUR FOUNDATION',
        url: d.foundationUrl,
        caption: esc('YOUR PROJECT IS COMPLETE. LOG IN TO ACCESS YOUR RECORDS, SETTINGS, AND NEXT STEPS.'),
      }),
      mobileStrip(asset, slug, 'strip-mobile.jpg', STRIP_ALT.glass, 77),
      foot(),
    ],
  };
}

export function compose06(asset: AssetResolver, d: Data06): Composition {
  const slug = '06_resume_intake';
  const copy: HeroCopy = {
    kicker: forName(d.firstName),
    headline: ['YOUR', 'FOUNDATION', 'IS ALMOST READY'],
    deskSize: 34,
    body: "IT LOOKS LIKE YOU STARTED YOUR DIGITAL FOUNDATION, BUT DIDN'T FINISH. PICK UP WHERE YOU LEFT OFF TO COMPLETE YOUR SETUP.",
    tagline: TAGLINE,
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
    title: esc(s.label),
    text: s.state === 'in_progress' ? `<span style="color:${T.red}">${esc(s.note)}</span>` : esc(s.note),
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
<p style="margin:4px 0 0;font-family:${FONT_BODY};font-size:9px;line-height:13px;letter-spacing:.12em;color:${T.mute}">CONTINUE YOUR INTAKE TO HELP US UNDERSTAND YOUR BUSINESS, PRIORITIES, AND SETUP NEEDS.</p>
<p style="margin:6px 0 0;font-family:${FONT_BODY};font-size:8.5px;line-height:12px;letter-spacing:.14em;color:${T.faint}">PROGRESS SAVED ${v(d.savedAt)}</p></td>
</tr></table></td>
<td valign="middle" align="right" style="padding:14px 24px 14px 0">${button('RESUME YOUR INTAKE', d.intakeUrl, { width: 230 })}</td>
</tr>
</table>`;
  const dh = desktopHero(asset, '06', copy, 'Laptop showing the Digital Foundation intake on a limestone terrace above the sea.');
  const mh = mobileHero(
    asset,
    '06',
    { ...copy, headline: ['YOUR', 'FOUNDATION', 'IS ALMOST', 'READY'] },
    'Laptop showing the Digital Foundation intake beside books and a crystal on a limestone terrace.',
  );
  return {
    styles: [dh.css, mh.css],
    subject: 'YOUR FOUNDATION IS ALMOST READY',
    subjectHtml: 'YOUR FOUNDATION IS ALMOST READY',
    preheader: 'PICK UP WHERE YOU LEFT OFF. YOUR PROGRESS IS SAVED.',
    label: 'Resume your Digital Foundation intake',
    blocks: [
      mast({
        preheader: 'PICK UP WHERE YOU LEFT OFF. YOUR PROGRESS IS SAVED.',
        line1: 'TRANSACTIONAL · DIGITAL FOUNDATION',
        line2: 'PICK UP WHERE YOU LEFT OFF',
      }),
      dh.html,
      mh.html,
      deskProgress,
      mobileRows(asset, 'YOUR PROGRESS', items, { aside: 'DIGITAL FOUNDATION<br>SETUP PROGRESS', status }),
      deskNext,
      mobileAct({ label: 'RESUME YOUR INTAKE', url: d.intakeUrl, caption: `YOUR INFORMATION HAS ALREADY BEEN SAVED.<br>LAST SAVED ${v(d.savedAt)}.` }),
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
    body: 'YOUR DIGITAL FOUNDATION PLAN IS READY, BUT YOUR QUOTE WILL EXPIRE SOON. SECURE IT NOW TO KEEP YOUR PRICING AND GET STARTED.',
    tagline: TAGLINE,
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
<td valign="middle" align="center" style="padding:14px 22px 14px 8px">${button('SECURE YOUR QUOTE', d.foundationUrl, { width: 220 })}${caption('LOCK IN YOUR PRICING AND COMPLETE<br>YOUR DIGITAL FOUNDATION.')}</td>
</tr>
</table>`;
  const mobileCountdown =
    mobileOnly(`<table class="act mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%;background:#ffffff">
<tr><td align="center" style="padding:16px 20px 0">${countdown.replace('margin:0 0 8px', 'margin:0 0 8px;text-align:center').replace('margin:8px 0 0', 'margin:8px 0 0;text-align:center')}</td></tr>
<tr><td align="center" style="padding:16px 20px 22px">${button('SECURE YOUR QUOTE', d.foundationUrl, { width: 350 })}${caption('LOCK IN YOUR PRICING AND COMPLETE YOUR DIGITAL FOUNDATION BEFORE THIS OFFER EXPIRES.')}</td></tr>
</table>`);
  const pre = `YOUR QUOTE IS VALID UNTIL ${d.validUntil}. SECURE IT TO KEEP YOUR PRICING.`;
  const dh = desktopHero(asset, '07', copy, 'Quote card stamped QUOTE beside an hourglass of red sand on a limestone ledge above the sea.');
  const mh = mobileHero(asset, '07', copy, 'Quote card beside an hourglass of red sand on a limestone ledge.');
  return {
    styles: [dh.css, mh.css],
    subject: 'YOUR QUOTE IS ABOUT TO EXPIRE',
    subjectHtml: 'YOUR QUOTE IS ABOUT TO EXPIRE',
    preheader: pre,
    label: 'Digital Foundation quote expiry reminder',
    blocks: [
      mast({ preheader: pre, line1: 'TRANSACTIONAL · DIGITAL FOUNDATION', line2: 'YOUR QUOTE IS ABOUT TO EXPIRE' }),
      dh.html,
      mh.html,
      ledger('DIGITAL FOUNDATION', 'RECOMMENDATION & QUOTE', [
        ...(d.clientName ? [{ label: 'CLIENT', value: d.clientName }] : []),
        { label: 'QUOTE', value: d.quoteAmount },
        { label: 'ISSUED', value: d.issuedAt },
        { label: 'VALID UNTIL', value: d.validUntil, tone: 'red' as const },
        { label: 'STATUS', value: d.status, tone: 'red' as const, personalized: false },
      ]),
      deskBand(asset, 'YOUR PLAN INCLUDES', items, { titleWidth: 150 }),
      mobileRows(asset, 'YOUR PLAN INCLUDES', items, { aside: 'EVERYTHING YOU NEED<br>TO LAUNCH YOUR<br>DIGITAL FOUNDATION.' }),
      addonsLine(d.addons),
      deskAct07,
      mobileCountdown,
      mobileStrip(asset, slug, 'strip-mobile.jpg', STRIP_ALT.glass, 70),
      foot(),
    ],
  };
}
