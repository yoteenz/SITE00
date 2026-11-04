/**
 * One paper of the TRANSFERS, COMMITMENTS or OUTLOOK collection: the founder's paper art (decoration only) with live
 * title, value and caption. The value is a canonical figure, an honest empty state, or nothing (a link paper).
 */

import type { CSSProperties } from 'react';
import type { CarouselPanel } from '../../../data/f05/moneyCarousel';
import type { Rect } from './f05MotionLayout';
import { F05_COMPOSITION as C } from './f05Composition';

import transfersInTransit from '../../../families/F05_MONEY/MOTION_PILOT/F05_PAPER_TRANSFERS_IN_TRANSIT.webp';
import transfersPending from '../../../families/F05_MONEY/MOTION_PILOT/F05_PAPER_TRANSFERS_PENDING.webp';
import transfersScheduled from '../../../families/F05_MONEY/MOTION_PILOT/F05_PAPER_TRANSFERS_SCHEDULED.webp';
import transfersRecent from '../../../families/F05_MONEY/MOTION_PILOT/F05_PAPER_TRANSFERS_RECENT.webp';
import commitmentsBills from '../../../families/F05_MONEY/MOTION_PILOT/F05_PAPER_COMMITMENTS_BILLS.webp';
import commitmentsSavings from '../../../families/F05_MONEY/MOTION_PILOT/F05_PAPER_COMMITMENTS_SAVINGS.webp';
import commitmentsUpcoming from '../../../families/F05_MONEY/MOTION_PILOT/F05_PAPER_COMMITMENTS_UPCOMING.webp';
import commitmentsReserved from '../../../families/F05_MONEY/MOTION_PILOT/F05_PAPER_COMMITMENTS_RESERVED.webp';
import outlookSts from '../../../families/F05_MONEY/MOTION_PILOT/F05_PAPER_OUTLOOK_SAFE_TO_SPEND.webp';
import outlookIncome from '../../../families/F05_MONEY/MOTION_PILOT/F05_PAPER_OUTLOOK_NEXT_INCOME.webp';
import outlookForecast from '../../../families/F05_MONEY/MOTION_PILOT/F05_PAPER_OUTLOOK_FORECAST.webp';
import outlookInsights from '../../../families/F05_MONEY/MOTION_PILOT/F05_PAPER_OUTLOOK_INSIGHTS.webp';

export const PANEL_ART: Record<string, string> = {
  transfers_in_transit: transfersInTransit,
  transfers_pending: transfersPending,
  transfers_scheduled: transfersScheduled,
  transfers_recent: transfersRecent,
  commitments_bills: commitmentsBills,
  commitments_savings: commitmentsSavings,
  commitments_upcoming: commitmentsUpcoming,
  commitments_reserved: commitmentsReserved,
  outlook_safe_to_spend: outlookSts,
  outlook_next_income: outlookIncome,
  outlook_forecast: outlookForecast,
  outlook_insights: outlookInsights,
};

/** Vertical rhythm of a paper (source px from its top), by the number of title lines. */
export function paperRhythm(lines: number, height: number) {
  const amountTop = C.card.nameTop + lines * C.card.namePitch + C.card.amountGap;
  return { amountTop, captionTop: amountTop + C.card.captionGap, linkCaptionTop: height - C.card.linkFromBottom };
}

/** Long amounts shrink to stay inside their paper; the value itself is never abbreviated. */
export function amountSize(text: string, base: number): number {
  const n = text.length;
  return n <= 7 ? base : n <= 9 ? base * 0.84 : n <= 11 ? base * 0.72 : base * 0.62;
}

/** Long names shrink a step so they stay clear of the paper's art. */
export function nameScale(lines: readonly string[]): number {
  const longest = Math.max(...lines.map((l) => l.length));
  return longest <= 11 ? 1 : longest <= 14 ? 0.78 : longest <= 18 ? 0.66 : 0.58;
}

/** Name size in board px, never below 11 screen px. */
export const nameFont = (lines: readonly string[]) => {
  const k = nameScale(lines);
  return `max(${(C.card.nameSize * k).toFixed(2)}px, calc(${(11 * k).toFixed(2)}px / var(--f05m-u, 1)))`;
};

export function CarouselPanelPaper({
  panel,
  slot,
  index,
  fmt,
  collection,
  onOpen,
}: {
  panel: CarouselPanel;
  slot: Rect;
  index: number;
  fmt: (n: number) => string;
  collection: string;
  onOpen: (panel: CarouselPanel) => void;
}) {
  const lines = panel.title.length;
  const r = paperRhythm(lines, slot.h);
  const v = panel.value;
  const amountText = v.kind === 'amount' ? fmt(v.amount) : v.kind === 'none' ? v.text : '';
  return (
    <button
      type="button"
      className="jrn-f05m__paper jrn-f05m__paper--panel"
      data-jrn-trigger={`f05m-panel-${panel.id}`}
      data-panel={panel.id}
      data-collection={collection}
      data-value-kind={v.kind}
      aria-label={`${panel.aria} OPEN.`}
      style={{ left: slot.x, top: slot.y, width: slot.w, height: slot.h, ['--i' as string]: index } as CSSProperties}
      onClick={() => onOpen(panel)}
    >
      <img className="jrn-f05m__paper-art" src={PANEL_ART[panel.art]} alt="" draggable={false} />
      <span className="jrn-f05m__paper-name" style={{ fontSize: nameFont(panel.title) }}>
        {panel.title.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </span>
      {v.kind !== 'link' ?
        <b
          className="jrn-f05m__paper-amount"
          data-empty={v.kind === 'none' ? 'true' : undefined}
          data-jrn-amount-cents={v.kind === 'amount' ? Math.round(v.amount * 100) : undefined}
          style={{ top: r.amountTop, fontSize: v.kind === 'amount' ? amountSize(amountText, C.card.amountSize) : undefined }}
        >
          {amountText}
        </b>
      : null}
      <i className="jrn-f05m__paper-caption" style={{ top: v.kind === 'link' ? r.linkCaptionTop : r.captionTop }}>
        {v.caption}
      </i>
      <svg className="jrn-f05m__chev" viewBox="0 0 14 24" aria-hidden>
        <path d="M2 2l10 10L2 22" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
