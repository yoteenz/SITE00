/** Board 02 — P04 RECOMMENDATION: included scope, dynamic add-ons, quote-bound investment and turnaround. */
import { useMemo, useState } from 'react';
import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import type { DigitalFoundationAddonId, DigitalFoundationCommercialConfig } from '../../../../shared/site00-digital-foundation/types.js';
import type { ClientCatalogEntry } from '../api';
import { DfIcon, type DfIconName } from '../icons';
import {
  buildAddonRows,
  featuredRows,
  quoteExpired,
  quoteFigures,
  quoteNeedsFounderReview,
  type AddonRow,
  type Selections,
} from '../model';
import { DfBottomSheet, DfCheckMark } from '../components';
import { DfAlert, DfCta, DfHeadline, DfLede, DfRail, DfTrust } from '../shell';
import type { QuoteSyncStatus } from '../useFoundationArtifact';

export const INCLUDED_SCOPE: { icon: DfIconName; label: string }[] = [
  { icon: 'globe', label: 'DOMAIN & OWNERSHIP' },
  { icon: 'envelope', label: 'PROFESSIONAL EMAIL' },
  { icon: 'layers', label: 'EMAIL ALIASES' },
  { icon: 'shield', label: 'SECURITY & AUTHENTICATION' },
  { icon: 'document', label: 'EMAIL SIGNATURE' },
  { icon: 'phone', label: 'DEVICE SETUP' },
];

export function IncludedList({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`df-included${compact ? ' df-included--compact' : ''}`} aria-label="INCLUDED IN YOUR FOUNDATION">
      {INCLUDED_SCOPE.map((s) => (
        <li key={s.label} className="df-included__row">
          <DfIcon name={s.icon} className="df-row__icon" />
          <span className="df-included__label">{s.label}</span>
          <span className="df-included__tag">INCLUDED</span>
          <span className="df-disc" aria-hidden="true">
            <DfIcon name="check" />
          </span>
        </li>
      ))}
    </ul>
  );
}

function errorCopy(code: string | null): string | null {
  if (!code) return null;
  if (code.startsWith('ADDON_REQUIRED:')) return `${code.slice('ADDON_REQUIRED:'.length).toUpperCase()} YOUR CHANGE WAS NOT SAVED.`;
  if (code === 'QUOTE_LOCKED') return 'YOUR SCOPE IS ALREADY ACCEPTED, SO ADD-ONS CAN NO LONGER CHANGE HERE.';
  if (code === 'NETWORK') return "WE COULDN'T REACH SITE 00 — YOUR CHANGE WAS NOT SAVED. TRY AGAIN.";
  return 'YOUR CHANGE WAS NOT SAVED. TRY AGAIN.';
}

function AddonLine({
  row,
  locked,
  onToggle,
  onQuantity,
}: {
  row: AddonRow;
  locked: boolean;
  onToggle: () => void;
  onQuantity: (n: number) => void;
}) {
  const blocked = Boolean(row.lockedReason);
  const stepper = row.selected && row.quantityUnit && !locked;
  const sub = row.selected && row.eachLabel ? row.eachLabel : row.sub;
  return (
    <li className={`df-addon${row.selected ? ' df-addon--on' : ''}`} data-addon={row.addon_id}>
      <button
        type="button"
        role="checkbox"
        aria-checked={row.selected}
        className="df-addon__main"
        disabled={locked || blocked}
        onClick={onToggle}
        aria-describedby={blocked ? `df-lock-${row.addon_id}` : undefined}
      >
        <DfIcon name={row.icon} className="df-row__icon" />
        <span className="df-row__text">
          <span className="df-row__title">{row.title}</span>
          <span className="df-row__sub">
            {sub}
            {row.recommended && <span className="df-addon__flag"> · RECOMMENDED</span>}
            {row.manualReview && <span className="df-addon__flag df-addon__flag--red"> · REVIEWED</span>}
          </span>
        </span>
      </button>
      <span className="df-addon__control">
        {stepper ? (
          <span className="df-stepper" role="group" aria-label={`QUANTITY — ${row.title}`}>
            <button type="button" aria-label={`FEWER — ${row.title}`} disabled={row.quantity <= 1} onClick={() => onQuantity(row.quantity - 1)}>
              <DfIcon name="minus" />
            </button>
            <output aria-live="polite">{row.quantity}</output>
            <button type="button" aria-label={`MORE — ${row.title}`} disabled={row.quantity >= 50} onClick={() => onQuantity(row.quantity + 1)}>
              <DfIcon name="plus" />
            </button>
          </span>
        ) : (
          <button type="button" tabIndex={-1} aria-hidden="true" className="df-addon__checkbtn" disabled={locked || blocked} onClick={onToggle}>
            <DfCheckMark checked={row.selected} />
          </button>
        )}
      </span>
      <span className={`df-addon__price${row.quotedAfterReview ? ' df-addon__price--review' : ''}`}>
        {row.lineTotalLabel ?? row.unitPriceLabel}
        {locked && row.selected && row.quantity > 1 && <span className="df-addon__qtynote">× {row.quantity}</span>}
      </span>
      {blocked && (
        <span className="df-addon__lock" id={`df-lock-${row.addon_id}`}>
          {row.lockedReason}
        </span>
      )}
    </li>
  );
}

export function P04Recommendation({
  payload,
  catalog,
  config,
  desired,
  syncStatus,
  syncError,
  onToggle,
  onQuantity,
  onContinue,
  onRefresh,
}: {
  payload: ClientDigitalFoundationPayload;
  catalog: ClientCatalogEntry[] | null;
  config: DigitalFoundationCommercialConfig | null;
  desired: Selections;
  syncStatus: QuoteSyncStatus;
  syncError: string | null;
  onToggle: (id: DigitalFoundationAddonId) => void;
  onQuantity: (id: DigitalFoundationAddonId, n: number) => void;
  onContinue: () => void;
  /** Re-issues the same selections as a new quote version (fresh expiry). */
  onRefresh: () => void;
}) {
  const [allOpen, setAllOpen] = useState(false);
  const [costsOpen, setCostsOpen] = useState(false);
  const { quote, recommendation } = payload;
  const locked = !quote || quote.status === 'ACCEPTED' || quote.status === 'PAID';
  const rows = useMemo(
    () =>
      catalog && config
        ? buildAddonRows({
            catalog,
            config,
            quote,
            recommended: (recommendation?.recommended_addons ?? []).map((l) => l.addon_id),
            desired,
          })
        : [],
    [catalog, config, quote, recommendation, desired],
  );
  const featured = featuredRows(rows);
  const rest = rows.filter((r) => !featured.includes(r));
  const updating = syncStatus === 'pending' || syncStatus === 'saving';
  const figures = quote && config ? quoteFigures(quote, config) : null;
  const review = quoteNeedsFounderReview(quote);
  const expired = !locked && quoteExpired(quote);

  if (!quote) {
    return (
      <>
        <DfRail index="04" label="RECOMMENDATION" />
        <DfHeadline lines={['YOUR', 'RECOMMENDED', 'FOUNDATION']} />
        <DfLede>SITE 00 IS ASSEMBLING YOUR RECOMMENDATION. THIS PAGE UPDATES WHEN IT&apos;S READY.</DfLede>
      </>
    );
  }

  return (
    <>
      <DfRail index="04" label="RECOMMENDATION" />
      <DfHeadline lines={['YOUR', 'RECOMMENDED', 'FOUNDATION']} />
      <DfLede>
        SITE 00 HAS ASSEMBLED YOUR RECOMMENDED DIGITAL FOUNDATION BASED ON YOUR BUSINESS INFORMATION AND SELECTED NEEDS.
      </DfLede>
      <IncludedList />
      <section className="df-section" aria-labelledby="df-addons-h">
        <h2 className="df-section__label" id="df-addons-h">
          ADDITIONAL FEATURES
        </h2>
        {!catalog && <DfAlert tone="muted">ADD-ON OPTIONS ARE UNAVAILABLE RIGHT NOW. YOUR QUOTE BELOW IS CURRENT.</DfAlert>}
        <ul className="df-addons">
          {featured.map((r) => (
            <AddonLine
              key={r.addon_id}
              row={r}
              locked={locked}
              onToggle={() => onToggle(r.addon_id)}
              onQuantity={(n) => onQuantity(r.addon_id, n)}
            />
          ))}
        </ul>
        {rest.length > 0 && (
          <button type="button" className="df-link df-link--row" onClick={() => setAllOpen(true)}>
            {locked ? 'VIEW ALL ADD-ONS' : `VIEW ALL ADD-ONS (${rest.length} MORE)`}
            <DfIcon name="chevron" />
          </button>
        )}
      </section>
      {syncError && <DfAlert role="alert">{errorCopy(syncError)}</DfAlert>}
      {review && (
        <DfAlert tone="ink" icon="clock" role="status">
          SOME ITEMS ARE CONFIRMED BY SITE 00 BEFORE CHECKOUT. YOU CAN REVIEW AND ACCEPT YOUR SCOPE NOW; CHECKOUT OPENS
          ONCE SITE 00 CONFIRMS PRICING.
        </DfAlert>
      )}
      {expired && (
        <DfAlert role="alert">
          THIS QUOTE HAS EXPIRED.{' '}
          <button type="button" className="df-link" onClick={onRefresh} disabled={updating}>
            REFRESH MY QUOTE
          </button>
        </DfAlert>
      )}
      {figures && (
        <div className={`df-split${updating ? ' df-split--updating' : ''}`} aria-live="polite" aria-busy={updating || undefined}>
          <div className="df-split__cell">
            <span className="df-split__label">PROJECTED INVESTMENT</span>
            <span className="df-split__value">{figures.total}</span>
            <span className="df-split__caption">{figures.caption}</span>
          </div>
          <div className="df-split__cell">
            <span className="df-split__label">PROJECTED TURNAROUND</span>
            <span className="df-split__value">{figures.turnaround}</span>
            <span className="df-split__unit">BUSINESS DAYS</span>
            <span className="df-split__caption">
              {figures.turnaroundCaption}
              {figures.reviewSuffix ? ` · ${figures.reviewSuffix}` : ''}
            </span>
          </div>
          {updating && <span className="df-split__updating">UPDATING…</span>}
        </div>
      )}
      <button type="button" className="df-link df-link--row" onClick={() => setCostsOpen(true)}>
        DOMAIN + EMAIL PROVIDER FEES ARE BILLED SEPARATELY
        <DfIcon name="chevron" />
      </button>
      <DfCta label="CONTINUE TO REVIEW" onClick={onContinue} disabled={updating} busy={updating} busyLabel="UPDATING YOUR QUOTE…" />
      <DfTrust text="SECURE. GUIDED. DONE FOR YOU." />

      <DfBottomSheet open={allOpen} title="ALL ADD-ONS" onClose={() => setAllOpen(false)}>
        {['DOMAIN', 'EMAIL', 'SETUP', 'PRIORITY', 'CUSTOM'].map((g) => {
          const list = rest.filter((r) => r.group === g);
          if (!list.length) return null;
          return (
            <section key={g} className="df-section">
              <h3 className="df-section__label">{g}</h3>
              <ul className="df-addons">
                {list.map((r) => (
                  <AddonLine
                    key={r.addon_id}
                    row={r}
                    locked={locked}
                    onToggle={() => onToggle(r.addon_id)}
                    onQuantity={(n) => onQuantity(r.addon_id, n)}
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </DfBottomSheet>
      <ThirdPartySheet open={costsOpen} onClose={() => setCostsOpen(false)} payload={payload} />
    </>
  );
}

export function ThirdPartySheet({
  open,
  onClose,
  payload,
}: {
  open: boolean;
  onClose: () => void;
  payload: ClientDigitalFoundationPayload;
}) {
  return (
    <DfBottomSheet open={open} title="THIRD-PARTY COSTS" onClose={onClose}>
      <ul className="df-bullets">
        {(payload.recommendation?.third_party_costs ?? []).map((c) => (
          <li key={c}>{c.toUpperCase()}</li>
        ))}
      </ul>
      {payload.quote && <p className="df-sheet__note">{payload.quote.third_party_cost_notice.toUpperCase()}</p>}
    </DfBottomSheet>
  );
}
