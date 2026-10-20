/**
 * 06 REFERRALS primitives — React port of the OPUS3 rf-kit (ledger, signals, commission chips, timeline,
 * checklist, QR placeholder) plus the founder-selected referral card. Class names match rf.css one-to-one.
 */
import { useState, type ReactNode } from 'react';
import { approvedReferralCardAssets } from '../config/referralCardAssets';
import { CARD_STUDIO_COPY } from '../config/referralPolicy';
import { WsCheckGlyph, WsChip, WsIcon, WsPlate, WsTabs, type WsChipKind } from '../shell/wsKit';

export const RF_SECTIONS = ['OVERVIEW', 'PARTNERS', 'ATTRIBUTION', 'COMMISSIONS', 'PAYOUTS', 'CARD STUDIO', 'ACTIVITY'] as const;
export type RfSection = (typeof RF_SECTIONS)[number];
const SECTION_ICON = ['home', 'users', 'share', 'price', 'payment', 'qr', 'time'];

/** Commission / payout state chip (`cs`). */
export type CsKind = 'tracked' | 'noteligible' | 'eligible' | 'pending' | 'approved' | 'scheduled' | 'paid' | 'adjusted' | 'reversed' | 'disputed' | 'failed' | 'planned';
export const Cs = ({ k, children }: { k: CsKind; children: ReactNode }) => <span className={`cs cs--${k}`}>{children}</span>;

export const Amt = ({ minor }: { minor: number | null | undefined }) =>
  minor === null || minor === undefined ? (
    <span className="amt amt--muted">—</span>
  ) : (
    <span className={`amt ${minor < 0 ? 'amt--neg' : ''}`.trim()}>
      {minor < 0 ? '−' : ''}
      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(minor) / 100)}
    </span>
  );

export function RfHead({ title, sub, acts, img = 'pav', tag }: { title: string; sub: ReactNode; acts?: ReactNode; img?: 'pav' | 'door' | 'tall' | 'inv'; tag?: ReactNode }) {
  return (
    <div className="rf-head">
      <span className={`rf-img rf-img--${img} rf-head__img`} aria-hidden="true" />
      <header className="ws-phead">
        <div>
          <div className="ws-phead__rail">
            <b>06</b>
            <span />
          </div>
          <h1 className="ws-title">
            {title}
            <i aria-hidden="true" />
          </h1>
          <div className="ws-meta ws-phead__sub">{sub}</div>
          {tag ? <div style={{ marginTop: 10 }}>{tag}</div> : null}
        </div>
        {acts ? <div className="ws-phead__acts">{acts}</div> : null}
      </header>
    </div>
  );
}

export const RfTag = ({ children }: { children: ReactNode }) => <span className="rf-spec">{children}</span>;

/** Section navigation: tabs from 640 px; on phones a section button that expands the section list (RO-S grammar). */
export function RfSecNav({ value, onChange, counts = {} }: { value: RfSection; onChange: (s: RfSection) => void; counts?: Partial<Record<RfSection, number>> }) {
  const [menu, setMenu] = useState(false);
  return (
    <nav className="rf-secnav" aria-label="REFERRALS SECTIONS">
      <WsTabs label="REFERRALS SECTIONS" value={value} onChange={onChange} items={RF_SECTIONS.map((s) => ({ id: s, label: s, count: counts[s] || '' }))} />
      <button type="button" className="rf-secnav__m" aria-haspopup="true" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
        <span className="ws-label" style={{ color: 'var(--ws-ink)' }}>
          SECTION · {value}
        </span>
        <span style={{ display: 'inline-flex', transform: menu ? 'rotate(-90deg)' : 'rotate(90deg)' }}>
          <WsIcon name="next" />
        </span>
      </button>
      {menu ? (
        <div className="ifw-secnav-menu" role="menu">
          {RF_SECTIONS.map((s, i) => (
            <button
              key={s}
              type="button"
              role="menuitemradio"
              aria-checked={s === value}
              className={`ws-menu__i ${s === value ? 'ws-menu__i--act' : ''}`.trim()}
              onClick={() => {
                onChange(s);
                setMenu(false);
              }}
            >
              <WsIcon name={SECTION_ICON[i]} />
              <span>{s}</span>
              <span className="ws-meta">{s === value ? '●' : counts[s] || ''}</span>
            </button>
          ))}
        </div>
      ) : null}
    </nav>
  );
}

export type RfSignal = { label: string; value: ReactNode; def: string; icon: string; attn?: boolean };
export function RfSignals({ items, cls = 'rf-signals--5' }: { items: RfSignal[]; cls?: string }) {
  return (
    <section className={`rf-signals ${cls}`} aria-label="REFERRAL SIGNALS">
      {items.map((s) => (
        <div key={s.label} className={`rf-sig ${s.attn ? 'rf-sig--attn' : ''}`.trim()}>
          <WsIcon name={s.icon} />
          <span className="ws-label">{s.label}</span>
          <span className="ws-num">{s.value}</span>
          <span className="ws-meta">{s.def}</span>
        </div>
      ))}
    </section>
  );
}

export type LedgerCol<T> = { h: string; t: string | null; d: string; n?: boolean; r: (row: T) => ReactNode };

/** Ledger (`ldg`): columns pick their tier; phones get a two-cell composite. */
export function Ledger<T>({ label, cols, rows, mobile, rowKey, sel, onSelect, wide = false }: { label: string; cols: LedgerCol<T>[]; rows: T[]; mobile: (row: T) => [ReactNode, ReactNode]; rowKey: (row: T) => string; sel?: string | null; onSelect?: (row: T) => void; wide?: boolean }) {
  const t = cols.filter((c) => c.t).map((c) => c.t).join(' ');
  const d = cols.map((c) => c.d).join(' ');
  const cls = (c: LedgerCol<T>) => (c.t ? 'x-t' : 'x-d');
  return (
    <div className={`ldg ${wide ? 'ldg--wide' : ''}`.trim()} role="table" aria-label={label} style={{ ['--cols-m' as string]: 'minmax(0,1fr) auto', ['--cols-t' as string]: t, ['--cols-d' as string]: d }}>
      <div className="ldg__h" role="row">
        {cols.map((c) => (
          <span key={c.h} className={`${cls(c)} ${c.n ? 'n' : ''}`.trim()} role="columnheader">
            {c.h}
          </span>
        ))}
      </div>
      {rows.map((row) => {
        const k = rowKey(row);
        const [ml, mr] = mobile(row);
        const on = sel === k;
        return (
          <div
            key={k}
            className={`ldg__r ${on ? 'ldg__r--sel' : ''}`.trim()}
            role="row"
            aria-selected={onSelect ? on : undefined}
            tabIndex={onSelect ? 0 : undefined}
            onClick={onSelect ? () => onSelect(row) : undefined}
            onKeyDown={
              onSelect
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(row);
                    }
                  }
                : undefined
            }
          >
            <span className="x-m cell" role="cell">
              {ml}
            </span>
            <span className="x-m cell" role="cell" style={{ alignItems: 'flex-end' }}>
              {mr}
            </span>
            {cols.map((c) => (
              <span key={c.h} className={`${cls(c)} cell ${c.n ? 'n' : ''}`.trim()} role="cell">
                {c.r(row)}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export const TwoLine = ({ a, b }: { a: ReactNode; b: ReactNode }) => (
  <>
    <span className="ws-name">{a}</span>
    <span className="ws-meta ws-1l">{b}</span>
  </>
);

export type TimelineItem = { id: string; time: string; title: string; sub: ReactNode; actor?: string; tone?: 'done' | 'red' | 'gap' | 'x'; tag?: ReactNode };
export function Timeline({ items, onSelect, sel }: { items: TimelineItem[]; onSelect?: (id: string) => void; sel?: string | null }) {
  return (
    <ol className="tl ifw-activity-stream">
      {items.map((it) => (
        <li
          key={it.id}
          className={`tl__i tl__i--${it.tone ?? 'x'} ${onSelect ? 'ifw-rf-sel' : ''}`.trim()}
          style={sel === it.id ? { boxShadow: 'inset 2px 0 0 var(--ws-red)' } : undefined}
          tabIndex={onSelect ? 0 : undefined}
          onClick={onSelect ? () => onSelect(it.id) : undefined}
          onKeyDown={
            onSelect
              ? (e) => {
                  if (e.key === 'Enter') onSelect(it.id);
                }
              : undefined
          }
        >
          <time>{it.time}</time>
          <span className="dot">
            <i />
          </span>
          <span className="tl__b">
            <b>{it.title}</b>
            <span>{it.sub}</span>
            {it.actor || it.tag ? (
              <span className="ev">
                {it.actor ? <WsChip kind="muted">{it.actor}</WsChip> : null}
                {it.tag}
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ol>
  );
}

export type CheckState = 'ok' | 'wait' | 'no';
export function Checklist({ rows }: { rows: Array<{ label: ReactNode; sub?: ReactNode; state: CheckState; chip: [WsChipKind, string] }> }) {
  return (
    <div className="ck">
      {rows.map((r, i) => (
        <div key={i} className="ck__i">
          <span className={`ck__b ck__b--${r.state}`}>{r.state === 'ok' ? <WsCheckGlyph /> : null}</span>
          <span>
            <span className="ws-name" style={{ display: 'block' }}>
              {r.label}
            </span>
            {r.sub ? <span className="ws-meta">{r.sub}</span> : null}
          </span>
          <WsChip kind={r.chip[0]}>{r.chip[1]}</WsChip>
        </div>
      ))}
    </div>
  );
}

/** Partner thumbnail: environment tile + initials plate (decorative). */
export const PartnerThumb = ({ name, img = 'pav', size = '' }: { name: string; img?: 'pav' | 'door' | 'tall' | 'inv'; size?: '' | 'sm' }) => (
  <span className={`rf-img rf-img--${img} rf-thumb ${size ? `rf-thumb--${size}` : ''}`.trim()} aria-hidden="true">
    <WsPlate name={name} size="xs" />
  </span>
);

/**
 * Deterministic NON-SCANNABLE QR placeholder (finder squares + noise) — never a real code.
 * Production QR artwork is not generated until a verified partner URL exists (OPUS3 doc 21).
 */
export function qrPlaceholderSvg(seed: string, label = true): string {
  const n = 29;
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
  const finder = (x: number, y: number) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#0c0c0c"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#0c0c0c"/>`;
  let cells = '';
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const inF = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
      if (!inF && rnd() > 0.52) cells += `<rect x="${x}" y="${y}" width="1" height="1" fill="#0c0c0c"/>`;
    }
  const lab = label
    ? `<rect x="5" y="12.2" width="${n - 10}" height="4.6" fill="#fff" stroke="#ce1017" stroke-width=".5"/><text x="${n / 2}" y="15.6" font-size="2.4" font-family="Saira Semi Condensed" font-weight="700" fill="#ce1017" text-anchor="middle" letter-spacing=".2">NOT VALID FOR PRINT</text>`
    : '';
  return `<svg viewBox="-2 -2 ${n + 4} ${n + 4}" style="stroke:none" role="img" aria-label="QR PLACEHOLDER · NOT A SCANNABLE CODE" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/>${cells}${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}${lab}</svg>`;
}

export const QrPlaceholder = ({ seed, label = true }: { seed: string; label?: boolean }) => <span style={{ display: 'block' }} dangerouslySetInnerHTML={{ __html: qrPlaceholderSvg(seed, label) }} />;

/** The four concise service benefits printed on the back of the card. */
export const CARD_BENEFITS = ['DOMAIN', 'PROFESSIONAL EMAIL', 'EMAIL SECURITY', 'OWNERSHIP RECORDS'] as const;

/**
 * FOUNDER-SELECTED REFERRAL CARD — approved partners use founder-supplied raster artwork; others use the CSS
 * reconstruction placeholder until artwork is ingested.
 */
export function FounderCard({ side, partner, width = 420 }: { side: 'front' | 'back'; partner: string; width?: number }) {
  const style = { ['--cw' as string]: `${width}px` };
  const approved = approvedReferralCardAssets(partner);
  if (approved) {
    const src = side === 'front' ? approved.frontSrc : approved.backSrc;
    const alt = side === 'front' ? approved.altFront : approved.altBack;
    return (
      <figure className="rcard rcard--approved-art" style={style} data-side={side}>
        <img className="rcard__art" src={src} alt={alt} width={1536} height={1024} loading="lazy" decoding="async" />
      </figure>
    );
  }
  if (side === 'front') {
    return (
      <div className="rcard rcard--founder rcard--front" style={style} role="img" aria-label={`REFERRAL CARD FRONT · ${CARD_STUDIO_COPY.frontLine1} ${CARD_STUDIO_COPY.frontLine2}`}>
        <div className="rcard__body">
          <div className="rcard__brand">SITE 00</div>
          <div className="rcard__head">
            <span>{CARD_STUDIO_COPY.frontLine1}</span>
            <span className="rcard__foil">{CARD_STUDIO_COPY.frontLine2}</span>
          </div>
          <div className="rcard__foot">
            <span className="rcard__df2">DIGITAL FOUNDATION</span>
            <span className="rcard__foilbar" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="rcard rcard--founder rcard--back" style={style} role="img" aria-label={`REFERRAL CARD BACK · ${CARD_STUDIO_COPY.backLine} · INTRODUCED BY ${partner}`}>
      <div className="rcard__body">
        <div>
          <div className="rcard__head">
            <span>
              START HERE<span className="rcard__foil">.</span>
            </span>
          </div>
          <ul className="rcard__ben">
            {CARD_BENEFITS.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="rcard__url">
            site00.com/invite/<span style={{ letterSpacing: '.2em' }}>• • • • • •</span>
          </div>
          <div className="rcard__ref" style={{ marginTop: '2cqw' }}>
            INTRODUCED BY<b className="rcard__foil">{partner.toUpperCase()}</b>
          </div>
        </div>
      </div>
      <div className="rcard__qr">
        <QrPlaceholder seed={`founder-${partner}`} label={false} />
        <span className="rcard__void">NOT VALID FOR PRINT</span>
      </div>
      <span className="rcard__qrcap">PARTNER QR · PLACEHOLDER</span>
    </div>
  );
}
