/**
 * JURNL editorial-collage overlays (founder authority: the eight-panel EDITORIAL OVERLAY COMPOSITION board, 2026-11-04).
 *
 * Behaviour is shared, composition is not. `EditorialOverlay` is only the behaviour host — portal, scrim, dialog
 * semantics, focus trap / Escape / focus return (V3 useStableFocus), the overlay id — and it imposes NO geometry: each
 * composition (`data-jed`) places its own ground silhouette, headline fragment, artifacts, live content and action
 * fragments in jurnl-editorial.css. Decorative layers are aria-hidden and never take pointer events; every label, value
 * and control is live React.
 *
 * Art (all approved, nothing generated): the parent's text-free SK01 (classical bust, arch, coast), the V9 DOT 01
 * motion PNGs (heading parchment, laurel seal, olive branch on oxblood, lemon branch, torn panels, dark torn strip,
 * engraved coast, temple coast, receipt stack with its binder clip), the OPUS3 06 account papers (bank village, lemon
 * branch, amphora, coin on oxblood) and the 22 temple seal.
 */
import { useId, useMemo, type CSSProperties, type ReactNode } from 'react';
import { OverlayLayer } from '../../components/primitives';
import { tornClip, useStableFocus } from '../v3/V3Surfaces';
import { cleanArt, type CleanArtId } from '../../global/overlays/clean/registry';
import { slot, useShellPlate, type ShellBox } from './Shell';
import { JurnlUtilityArtButton } from '../../components/JurnlUtilityArtButton';
import { JurnlMicroArt } from '../../components/JurnlMicroArt';
import type { OverlayArtStem } from '../../global/overlayArt/registry';
import sk01 from '../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_SIDEKICK.webp';
import heading from '../../../families/F05_MONEY/DOT01/F05_DOT01_01_HEADING_PARCHMENT.webp';
import laurelSeal from '../../../families/F05_MONEY/DOT01/F05_DOT01_02_LAUREL_WAX_SEAL.webp';
import oxbloodBranch from '../../../families/F05_MONEY/DOT01/F05_DOT01_03_OLIVE_BRANCH_RED_FABRIC.webp';
import lemonBranch from '../../../families/F05_MONEY/DOT01/F05_DOT01_04_LEMON_BRANCH_BLOSSOMS.webp';
import foliage from '../../../families/F05_MONEY/DOT01/F05_DOT01_10_SMALL_OLIVE_FOLIAGE.webp';
import coast from '../../../families/F05_MONEY/DOT01/F05_DOT01_11_ENGRAVED_COASTAL_FOREGROUND.webp';
import panel from '../../../families/F05_MONEY/DOT01/F05_DOT01_13_TORN_PARCHMENT_PANEL.webp';
import templeCoast from '../../../families/F05_MONEY/DOT01/F05_DOT01_15_TEMPLE_COASTAL_COMPOSITION.webp';
import darkStrip from '../../../families/F05_MONEY/DOT01/F05_DOT01_17_TORN_RECEIPT_STRIP.webp';
import paperStack from '../../../families/F05_MONEY/DOT01/F05_DOT01_22_RECEIPT_PAPER_STACK.webp';
import cardBank from '../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_CARD06_BANK.webp';
import cardPayout from '../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_CARD06_PAYOUT.webp';
import cardCash from '../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_CARD06_CASH.webp';
import cardCredit from '../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_CARD06_CREDIT.webp';
import templeSeal from '../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SEAL_22.webp';
import scene04 from '../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SCENE_04.webp';
import scene05 from '../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SCENE_05.webp';
import reorderGlyph from '../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_ICON06_REORDER.webp';
import './jurnl-editorial.css';

/** A source image and its pixel size: a crop is a region of it, drawn without stretching (uniform scale, cover). */
type Src = { src: string; w: number; h: number };
export const ART = {
  sk01: { src: sk01, w: 941, h: 1672 },
  heading: { src: heading, w: 1200, h: 517 },
  laurelSeal: { src: laurelSeal, w: 1041, h: 1030 },
  oxbloodBranch: { src: oxbloodBranch, w: 704, h: 1200 },
  lemonBranch: { src: lemonBranch, w: 867, h: 1200 },
  foliage: { src: foliage, w: 949, h: 1039 },
  coast: { src: coast, w: 1200, h: 326 },
  panel: { src: panel, w: 1200, h: 696 },
  templeCoast: { src: templeCoast, w: 1200, h: 412 },
  darkStrip: { src: darkStrip, w: 1200, h: 281 },
  paperStack: { src: paperStack, w: 777, h: 851 },
  cardBank: { src: cardBank, w: 439, h: 247 },
  cardPayout: { src: cardPayout, w: 440, h: 249 },
  cardCash: { src: cardCash, w: 437, h: 242 },
  cardCredit: { src: cardCredit, w: 441, h: 237 },
  templeSeal: { src: templeSeal, w: 140, h: 131 },
  scene04: { src: scene04, w: 941, h: 596 },
  scene05: { src: scene05, w: 941, h: 496 },
  reorderGlyph: { src: reorderGlyph, w: 78, h: 74 },
} satisfies Record<string, Src>;
/** The source regions used as illustrated vignettes [x, y, w, h] (source px). */
export const REGION = {
  bust: [70, 0, 520, 330],
  arch: [600, 40, 341, 560],
  coastStrip: [0, 1280, 941, 190],
  // the 06 papers' illustration, above their chevron tab (thumbnails)
  bankArt: [205, 4, 234, 160],
  payoutArt: [228, 4, 212, 160],
  cashArt: [212, 4, 225, 160],
  creditArt: [222, 4, 219, 160],
  // OPUS2's authority scene bands: the large amphora (04) and the coin on oxblood (05), no tabs
  amphora: [30, 40, 360, 500],
  coinOxblood: [540, 236, 390, 260],
  clip: [300, 0, 200, 150],
  templeColumns: [120, 40, 420, 360],
} as const;
export type Region = readonly [number, number, number, number];
export const KIND_ART: Record<'bank' | 'payout' | 'cash' | 'credit', { art: Src; region: Region }> = {
  bank: { art: ART.cardBank, region: REGION.bankArt },
  payout: { art: ART.cardPayout, region: REGION.payoutArt },
  cash: { art: ART.cardCash, region: REGION.cashArt },
  credit: { art: ART.cardCredit, region: REGION.creditArt },
};

/**
 * A decorative layer: a whole image or a region of one, in a box sized by its composition (CSS class). The region is
 * scaled uniformly to cover the box (never stretched) and may be torn (deterministic clip-path).
 */
export function EdArt({ art, region, className, torn, style }: { art: Src; region?: Region; className: string; torn?: number; style?: CSSProperties }) {
  const [x, y, w, h] = region ?? [0, 0, art.w, art.h];
  const clip = useMemo(() => (torn ? tornClip(torn, ['top', 'right', 'bottom', 'left'], 1.4, 26) : undefined), [torn]);
  // background-size in % of the box: the region's share of the image; position: where the region starts
  const bs = `${(art.w / w) * 100}% ${(art.h / h) * 100}%`;
  const bp = `${w >= art.w ? 0 : (x / (art.w - w)) * 100}% ${h >= art.h ? 0 : (y / (art.h - h)) * 100}%`;
  return <span className={`jed-art ${className}`} aria-hidden style={{ backgroundImage: `url("${art.src}")`, backgroundSize: bs, backgroundPosition: bp, clipPath: clip, ...style }} />;
}

/** The torn headline parchment: a live uppercase title and one sparse lowercase cursive annotation. */
export function EdHead({ id, title, script, children }: { id: string; title: string[]; script?: string; children?: ReactNode }) {
  return (
    <div className="jed-head">
      <span className="jed-head__paper" aria-hidden style={{ backgroundImage: `url("${ART.heading.src}")` }} />
      {children}
      <h2 className="jed-head__title" id={id}>
        {title.map((t, i) => (
          <span key={`${i}-${t}`}>{i ? ' ' : null}<span>{t}</span></span>
        ))}
      </h2>
      {script ? <p className="jed-script">{script.toLowerCase()}</p> : null}
    </div>
  );
}

/**
 * The behaviour host. `composition` selects the geometry in CSS; `decor` are the composition's decorative layers;
 * `children` the live content (it scrolls inside itself when it is taller than the screen); `footer` the action
 * fragments, which stay reachable.
 */
/**
 * Plate mode: the composition is drawn on one regenerated founder shell (clean/registry.ts) at one uniform contain scale —
 * the shell is the ground, the art and the paper. No CSS ground, no decor layers and no headline paper are drawn (they would
 * duplicate the shell); the live head, body (the only scroll) and footer sit in measured regions of the shell.
 */
export type EdPlate = { art: CleanArtId; head: ShellBox; body: ShellBox; foot?: ShellBox; footExtra?: ShellBox };

export function EditorialOverlay({ testId, composition, title, script, onClose, decor, head, children, footer, place = 'center', closeLabel = 'CLOSE', labelledBy, plate, headNote }: {
  testId: string;
  composition: 'action' | 'register' | 'transfer' | 'search' | 'account';
  title: string[];
  script?: string;
  onClose: () => void;
  decor?: ReactNode;
  head?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  place?: 'center' | 'bottom';
  closeLabel?: string;
  labelledBy?: string;
  /** draw the composition on a regenerated founder shell (plate mode) */
  plate?: EdPlate;
  /** plate mode: one short live line under the script (an honesty note that belongs with the headline) */
  headNote?: ReactNode;
}) {
  if (plate) return <PlateOverlay {...{ testId, composition, title, script, onClose, head, children, footer, closeLabel, labelledBy, plate, headNote }} />;
  return <FolioOverlay {...{ testId, composition, title, script, onClose, decor, head, children, footer, place, closeLabel, labelledBy }} />;
}

function PlateOverlay({ testId, composition, title, script, onClose, head, children, footer, closeLabel, labelledBy, plate, headNote }: {
  testId: string;
  composition: string;
  title: string[];
  script?: string;
  onClose: () => void;
  head?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  closeLabel: string;
  labelledBy?: string;
  plate: EdPlate;
  headNote?: ReactNode;
}) {
  const { ref } = useStableFocus(onClose);
  const id = useId();
  const art = cleanArt(plate.art);
  const { ref: hostRef, w, h } = useShellPlate(1, art.width, art.height);
  return (
    <OverlayLayer>
      <div ref={hostRef} className="jed-host" data-jrn-overlay={testId} data-jed={composition} data-plate="true" data-overlay-asset={plate.art}>
        <div className="jed-scrim" onClick={onClose} aria-hidden />
        <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={labelledBy ?? id} className="jed-folio jed-folio--plate" data-testid={`${testId}-folio`} style={{ width: w, height: h }}>
          <img className="jed-plate" src={art.src} width={art.width} height={art.height} alt="" aria-hidden draggable={false} data-asset-id={plate.art} />
          <div className="jed-head jed-head--plate" style={slot(plate.head)}>
            {head}
            <h2 className="jed-head__title" id={id}>
              {title.map((t, i) => (
                <span key={`${i}-${t}`}>{i ? ' ' : null}<span>{t}</span></span>
              ))}
            </h2>
            {script ? <p className="jed-script">{script.toLowerCase()}</p> : null}
            {headNote ? <p className="jed-note jed-head__note">{headNote}</p> : null}
          </div>
          <div className="jed-body" style={slot(plate.body)}>{children}</div>
          {footer ? <div className="jed-foot" style={slot(plate.foot ?? [plate.body[0], plate.body[3], plate.body[2], Math.min(0.98, plate.body[3] + 0.07)])}>{footer}</div> : null}
          <JurnlUtilityArtButton kind="close" className="jed-close" trigger={`${testId}-close`} label={closeLabel} onClick={onClose} />
        </div>
      </div>
    </OverlayLayer>
  );
}

function FolioOverlay({ testId, composition, title, script, onClose, decor, head, children, footer, place, closeLabel, labelledBy }: {
  testId: string;
  composition: 'action' | 'register' | 'transfer' | 'search' | 'account';
  title: string[];
  script?: string;
  onClose: () => void;
  decor?: ReactNode;
  head?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  place: 'center' | 'bottom';
  closeLabel: string;
  labelledBy?: string;
}) {
  const { ref } = useStableFocus(onClose);
  const id = useId();
  const ground = useMemo(() => tornClip(composition.length * 7 + 3, ['top', 'right', 'bottom', 'left'], 1.1, 30), [composition]);
  return (
    <OverlayLayer>
      <div className="jed-host" data-jrn-overlay={testId} data-jed={composition} data-place={place}>
        <div className="jed-scrim" onClick={onClose} aria-hidden />
        <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={labelledBy ?? id} className="jed-folio" data-testid={`${testId}-folio`} style={{ ['--jed-ground' as string]: ground } as CSSProperties}>
          <span className="jed-ground" aria-hidden />
          <div className="jed-decor" aria-hidden>{decor}</div>
          <EdHead id={id} title={title} script={script}>{head}</EdHead>
          <div className="jed-body">{children}</div>
          {footer ? <div className="jed-foot">{footer}</div> : null}
          <JurnlUtilityArtButton kind="close" className="jed-close" trigger={`${testId}-close`} label={closeLabel} onClick={onClose} />
        </div>
      </div>
    </OverlayLayer>
  );
}

/** An action fragment: a paper (or dark strip / terracotta) with a live label, an optional note and an illustration. */
export function EdAction({ trigger, material = 'paper', title, note, art, onClick, disabled, children, className = '', ariaLabel, paper, chevron }: {
  trigger: string;
  material?: 'paper' | 'olive' | 'terracotta' | 'cream';
  title: ReactNode;
  note?: string;
  art?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
  ariaLabel?: string;
  /** OPUS5: the authority's own text-free paper for this control (replaces the generic panel / strip backing; never both) */
  paper?: OverlayArtStem;
  /** OPUS5: the GROK2 chevron in place of the line chevron */
  chevron?: OverlayArtStem;
}) {
  return (
    <button type="button" className={`jed-action ${className}`} data-material={material} data-jrn-trigger={trigger} disabled={disabled} aria-label={ariaLabel} onClick={onClick}>
      {paper ? <JurnlMicroArt stem={paper} slot={`${trigger}-paper`} className="jed-action__paperart" /> : null}
      {!paper && (material === 'paper' || material === 'cream') ? <span className="jed-action__paper" aria-hidden style={{ backgroundImage: `url("${ART.panel.src}")` }} /> : null}
      {!paper && material === 'olive' ? <span className="jed-action__strip" aria-hidden style={{ backgroundImage: `url("${ART.darkStrip.src}")` }} /> : null}
      {art ? <span className="jed-action__art" aria-hidden>{art}</span> : null}
      <span className="jed-action__text">
        <span className="jed-action__heading">
          <span className="jed-action__title">{title}</span>
          {chevron ? <JurnlMicroArt stem={chevron} slot={`${trigger}-chevron`} className="jed-chev" /> : <svg className="jed-chev" viewBox="0 0 10 16" aria-hidden><path d="M2 2l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </span>
        {note ? <span className="jed-script jed-action__note">{note.toLowerCase()}</span> : null}
      </span>
      {children}
    </button>
  );
}

/** A compact choice grid (replaces stacked full-width buttons). Triggers follow `Chips`: `${trigger}-${slug(id)}`. */
export function EdChoices<T extends string>({ label, value, options, onChange, trigger, columns = 2, checkArt }: { label: string; value: T | null; options: { id: T; label: string; icon?: ReactNode | ((on: boolean) => ReactNode); wide?: boolean; note?: string }[]; onChange: (v: T) => void; trigger: string; columns?: number; /** OPUS5: the GROK2 check disc marks the selected choice */ checkArt?: boolean }) {
  return (
    <div className="jed-choices" role="group" aria-label={label} style={{ ['--jed-cols' as string]: columns } as CSSProperties}>
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button key={o.id} type="button" className="jed-choice" aria-pressed={on} data-active={on ? 'true' : 'false'} data-wide={o.wide ? 'true' : undefined} data-jrn-trigger={`${trigger}-${o.id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} onClick={() => onChange(o.id)}>
            {o.icon ? <span className="jed-choice__icon" aria-hidden>{typeof o.icon === 'function' ? o.icon(on) : o.icon}</span> : null}
            <span className="jed-choice__label">{o.label}</span>
            {on && checkArt ? <JurnlMicroArt stem="B03-CHECK-SELECTED" slot={`${trigger}-check`} className="jed-choice__check" /> : null}
            {on && !checkArt ? <svg className="jed-choice__check" viewBox="0 0 24 24" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
          </button>
        );
      })}
    </div>
  );
}

/** The bronze laurel seal with an engraved glyph over it (the transfer direction; the authority's own 06 arrows). */
export function EdSeal({ glyph, className = '' }: { glyph?: 'transfer'; className?: string }) {
  return (
    <span className={`jed-seal ${className}`} aria-hidden>
      <img src={ART.laurelSeal.src} alt="" draggable={false} />
      {glyph === 'transfer' ? <img className="jed-seal__glyph" src={ART.reorderGlyph.src} alt="" draggable={false} /> : null}
    </span>
  );
}

/** Small line glyphs (ink) for choices and rows. */
export function EdGlyph({ name }: { name: 'bank' | 'coins' | 'card' | 'credit' | 'cash' | 'search' | 'person' | 'currency' | 'shield' | 'signout' | 'calendar' | 'tag' | 'pocket' }) {
  const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const d: Record<string, ReactNode> = {
    bank: <><path {...P} d="M3.5 9.5 12 4l8.5 5.5" /><path {...P} d="M5 10v7.5M9.5 10v7.5M14.5 10v7.5M19 10v7.5M3.5 19.5h17" /></>,
    coins: <><ellipse {...P} cx="12" cy="6.5" rx="6.5" ry="2.6" /><path {...P} d="M5.5 6.5v5c0 1.4 2.9 2.6 6.5 2.6s6.5-1.2 6.5-2.6v-5M5.5 11.5v5c0 1.4 2.9 2.6 6.5 2.6s6.5-1.2 6.5-2.6v-5" /></>,
    card: <><rect {...P} x="3" y="6" width="18" height="12.5" rx="2" /><path {...P} d="M3 10h18M6.5 15h4" /></>,
    credit: <><rect {...P} x="3" y="6" width="18" height="12.5" rx="2" /><path {...P} d="M3 9.5h18M15 15h3" /></>,
    cash: <><rect {...P} x="2.5" y="6.5" width="19" height="11" rx="1.5" /><circle {...P} cx="12" cy="12" r="2.6" /><path {...P} d="M5.5 9.5v5M18.5 9.5v5" /></>,
    search: <><circle {...P} cx="10.5" cy="10.5" r="6" /><path {...P} d="M15 15l5.5 5.5" /></>,
    person: <><circle {...P} cx="12" cy="8" r="3.8" /><path {...P} d="M4.5 20c1.2-3.8 4-5.6 7.5-5.6s6.3 1.8 7.5 5.6" /></>,
    currency: <><ellipse {...P} cx="12" cy="7" rx="7" ry="2.8" /><path {...P} d="M5 7v10c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V7M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8" /></>,
    shield: <><path {...P} d="M12 3.5 19 6v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z" /><path {...P} d="M9 12l2.2 2.2L15.5 10" /></>,
    signout: <><path {...P} d="M14 4.5H6.5v15H14" /><path {...P} d="M11 12h9.5M17 8.5l3.5 3.5-3.5 3.5" /></>,
    calendar: <><rect {...P} x="3.5" y="5" width="17" height="15" rx="2" /><path {...P} d="M3.5 9.5h17M8 3v4M16 3v4" /></>,
    tag: <><path {...P} d="M3.5 12.5V4h8.5l8.5 8.5-8.5 8.5z" /><circle {...P} cx="8" cy="8.5" r="1.3" /></>,
    pocket: <><path {...P} d="M5 5h14v6.5a7 7 0 0 1-14 0z" /><path {...P} d="M9 9.5l3 3 3-3" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden className="jed-glyph">{d[name]}</svg>;
}
