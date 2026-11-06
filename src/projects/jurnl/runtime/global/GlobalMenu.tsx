/**
 * JURNL global menu (the hamburger) and the MEMBERSHIP & ACCESS surfaces.
 *
 * The menu is SECONDARY navigation drawn on the curated OV08 sectioned-menu environment (OPUS3; uniform scale, never
 * stretched; the bust, lemons, arch, coast and oxblood are in the art, so nothing is layered on it twice). Its rows are
 * live code inside the olive field, which is the only thing that scrolls. The dock already owns HOME · MONEY · ADD ·
 * PLAN · CREDIT, so none of them appears here. Three sections (the founder's FD-01):
 *
 *   YOUR FINANCES      CONNECTED ACCOUNTS & SYNC → honest status + your pockets (no provider exists)
 *                      CURRENCY & EXCHANGE       → the currency selector with its rate disclosure
 *                      SAFE TO SPEND BUFFER      → the buffer, typed in the display currency, kept in USD
 *   YOUR INTELLIGENCE  ASK JURNL                 → the explanation sheet (no live AI provider)
 *                      CLASSIFICATION & RULES    → says honestly that nothing is learned yet
 *   YOUR ACCOUNT       ACCOUNT & PROFILE         → the approved F09 account drawer (its ACCOUNT title opens the page)
 *                      PREFERENCES               → general preferences and sign-in security
 *                      PRIVACY & CONSENTS        → consents, ASK JURNL CONTEXT, the privacy tools
 *                      MY MEMBERSHIP · EXPLORE ADD-ONS · HELP & SUPPORT · SIGN OUT (confirmed)
 *
 * Membership reads ONLY the resolved entitlements and the registries (plans, capabilities, add-ons). No price, no
 * checkout, no purchase state is shown or implied: billing is not configured, so nothing is AVAILABLE to buy. A
 * FOUNDER_FULL grant (server-resolved, #1708) is shown as FOUNDER ACCESS and suppresses every upgrade prompt; it never
 * changes what is authorized (the trusted backend decides). Unknown entitlement state withholds (fail closed).
 */
import type { CSSProperties } from 'react';
import { consentGranted } from '../../data/foundation/consent';
import { getRepository } from '../../data/repository/deviceRepository';
import { storedBufferUsd } from '../../data/f09/safetyBuffer';
import { formatMoney, useCurrency } from '../../data/home/money';
import { addOnById, capabilityById, planById, type AddOnDefinition } from '../../../../../shared/site00-monetization/contract.js';
import { JURNL_MONETIZATION_CONTRACT as CONTRACT } from '../../data/monetization/contract';
import { JURNL_MONETIZATION_COPY as M } from '../../data/monetization/copy';
import { useJurnlEntitlements } from '../monetization/JurnlEntitlements';
import { OverlayLayer } from '../components/primitives';
import { useOverlayHost } from '../components/OverlayAuthority';
import { V3Card, V3Chevron, V3Folio, V3Icon, V3NavSection, V3Notice, V3Pill, V3Row, V3RuleLabel, V3Seal, V3Status, useStableFocus, type V3AccessState } from '../surfaces/v3/V3Surfaces';
import { cleanArt } from './overlays/clean/registry';
import type { MenuDestination, MenuPanel } from './menuPanels';
import laurelSeal from '../../families/F05_MONEY/DOT01/F05_DOT01_02_LAUREL_WAX_SEAL.webp';
import artTravel from '../../families/F05_MONEY/DOT01/F05_DOT01_08_PARCHMENT_COASTAL_PANEL.webp';
import artPurchase from '../../families/F05_MONEY/DOT01/F05_DOT01_15_TEMPLE_COASTAL_COMPOSITION.webp';
import artBusiness from '../../families/F05_MONEY/DOT01/F05_DOT01_22_RECEIPT_PAPER_STACK.webp';
import artCredit from '../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_CARD_CREDIT.webp';
import './jurnl-global-menu.css';

export type GlobalMenuPanel = MenuPanel;
export type GlobalMenuDestination = MenuDestination;

/** The menu's rows, in order: [section, trigger, destination, label, icon]. One source for the menu and its tests. */
export const GLOBAL_MENU_SECTIONS = [
  {
    title: 'YOUR FINANCES',
    rows: [
      { trigger: 'menu-connections', to: 'connections', label: 'CONNECTED ACCOUNTS & SYNC', icon: 'bank' },
      { trigger: 'menu-currency', to: 'currency', label: 'CURRENCY & EXCHANGE', icon: 'coins' },
      { trigger: 'menu-buffer', to: 'buffer', label: 'SAFE TO SPEND BUFFER', icon: 'shield' },
    ],
  },
  {
    title: 'YOUR INTELLIGENCE',
    rows: [
      { trigger: 'menu-ask', to: 'ask', label: 'ASK JURNL', icon: 'sparkle' },
      { trigger: 'menu-rules', to: 'rules', label: 'CLASSIFICATION & LEARNING RULES', icon: 'tag' },
    ],
  },
  {
    title: 'YOUR ACCOUNT',
    rows: [
      { trigger: 'menu-account', to: 'account', label: 'ACCOUNT & PROFILE', icon: 'person' },
      { trigger: 'menu-preferences', to: 'preferences', label: 'PREFERENCES', icon: 'gear' },
      { trigger: 'menu-privacy', to: 'privacy', label: 'PRIVACY & CONSENTS', icon: 'lock' },
      { trigger: 'menu-membership', to: 'membership', label: 'MY MEMBERSHIP', icon: 'crown' },
      { trigger: 'menu-add-ons', to: 'add-ons', label: 'EXPLORE ADD-ONS', icon: 'grid' },
      { trigger: 'menu-help', to: 'help', label: 'HELP & SUPPORT', icon: 'help' },
      { trigger: 'menu-sign-out', to: 'sign-out', label: 'SIGN OUT', icon: 'signout' },
    ],
  },
] as const satisfies readonly { title: string; rows: readonly { trigger: string; to: MenuDestination; label: string; icon: string }[] }[];

/**
 * OV08-SECTIONED-MENU-ENVIRONMENT (the curated OPUS3 composition, 2016 × 3584) and its live regions, as fractions of the
 * art (measured on the installed PNG): the headline on the parchment, the olive field as the only scroll container.
 */
const OV08 = { w: 2016, h: 3584 } as const;
const OV08_REGION = {
  /** the blank tag paper: the live JURNL wordmark (as on the BUFFER / PRIVACY authorities, same environment) */
  tag: [0.352, 0.038, 0.575, 0.098],
  head: [0.29, 0.125, 0.79, 0.265],
  /** below the baked olive sprig (its lowest leaf reaches x 0.142 at y 0.305) and above the torn foot on the right */
  port: [0.075, 0.306, 0.745, 0.885],
} as const;
const region = ([x0, y0, x1, y1]: readonly number[]): CSSProperties => ({ left: `${x0! * 100}%`, top: `${y0! * 100}%`, width: `${(x1! - x0!) * 100}%`, height: `${(y1! - y0!) * 100}%` });

/** Founder access as the server resolved it (#1708 `internalGrants`); absent on a build without that work. */
type WithGrants = { internalGrants?: { active?: string[] } };
export function hasFounderAccess(e: unknown): boolean {
  return !!(e as WithGrants | null)?.internalGrants?.active?.includes('FOUNDER_FULL');
}

/** An add-on's access state: never AVAILABLE unless it can actually be obtained (billing configured, add-on live). */
export function addOnState(addOn: AddOnDefinition, e: ReturnType<typeof useJurnlEntitlements>): V3AccessState {
  if (!e || e.status !== 'RESOLVED') return 'UNAVAILABLE';
  if (hasFounderAccess(e)) return 'FOUNDER';
  if (e.addOns.granted.includes(addOn.addOnId)) return 'ACTIVE';
  const obtainable = addOn.status === 'ACTIVE' && addOn.billingType !== 'TBD';
  if (!obtainable) return 'COMING_SOON';
  return addOn.eligiblePlans.includes(e.effectivePlanId) ? 'AVAILABLE' : 'LOCKED';
}

const ADD_ON_ART: Record<string, string> = {
  JURNL_ADD_ON_TRAVEL: artTravel,
  JURNL_ADD_ON_PREMIUM_CREDIT: artCredit,
  JURNL_ADD_ON_MAJOR_PURCHASE_PREP: artPurchase,
  JURNL_ADD_ON_BUSINESS_TAX: artBusiness,
};
const capabilityLabel = (id: string) => capabilityById(CONTRACT, id)?.label ?? id.replace(/_/g, ' ');
/** A plan's display name from the registry: JURNL + FREE → JURNL FREE; JURNL PLUS stays JURNL PLUS. */
export function planDisplayName(planId: string): string {
  const p = planById(CONTRACT, planId);
  if (!p) return planId.replace(/_/g, ' ');
  const tier = p.tierLabel.replace(/_/g, ' ');
  return p.planName.endsWith(tier) ? p.planName : `${p.planName} ${tier}`;
}

/** The small live state beside a row (never a fake status: only values JURNL actually holds). */
function useRowAsides(): Partial<Record<string, string>> {
  const currency = useCurrency();
  const buffer = storedBufferUsd();
  const ask = consentGranted(getRepository().getConsent(), 'ASK_JURNL_CONTEXT');
  return {
    'menu-connections': 'MANUAL POCKETS ONLY',
    'menu-currency': `${currency.code} · ${currency.name}`.toUpperCase(),
    'menu-buffer': buffer > 0 ? `${formatMoney(buffer)} KEPT ASIDE` : 'NONE SET',
    'menu-ask': `CONTEXT ${ask ? 'ON' : 'OFF'}`,
    'menu-rules': 'NOTHING LEARNED YET',
  };
}

/* ── the hamburger: the OV08 shell, sections and rows in its olive field ── */
export function GlobalMenu({ onClose, onOpen }: { onClose: () => void; onOpen: (d: MenuDestination) => void; onDestination?: (d: MenuDestination) => void }) {
  const { ref } = useStableFocus(onClose);
  const { host, ref: hostRef } = useOverlayHost();
  const shell = cleanArt('OV08_MENU_ENVIRONMENT');
  const k = Math.min(host.W / OV08.w, host.H / OV08.h);
  const asides = useRowAsides();
  return (
    <OverlayLayer>
      <div ref={hostRef} className="jgm-host" data-jrn-overlay="global-menu" data-jv3-family="A_NAVIGATION_DRAWER" data-overlay-asset="OV08">
        <div className="jgm-scrim" onClick={onClose} aria-hidden />
        <div ref={ref} role="dialog" aria-modal="true" aria-label="MENU" className="jgm-plate" style={{ width: Math.round(OV08.w * k), height: Math.round(OV08.h * k) }}>
          <img className="jgm-shell" src={shell.src} width={shell.width} height={shell.height} alt="" aria-hidden draggable={false} data-asset-id="OV08_MENU_ENVIRONMENT" />
          <span className="jgm-tag" aria-hidden style={region(OV08_REGION.tag)}>
            JURNL
          </span>
          <div className="jgm-head" style={region(OV08_REGION.head)}>
            <h2 className="jgm-title">MENU</h2>
            <p className="jv3-t-script">tools, settings & support</p>
          </div>
          <button type="button" className="jgm-close" aria-label="CLOSE MENU" data-jrn-trigger="global-menu-close" onClick={onClose}>
            <V3Icon name="close" />
          </button>
          <nav className="jgm-port" aria-label="MENU SECTIONS" data-jrn-menu-scrollport style={region(OV08_REGION.port)}>
            {GLOBAL_MENU_SECTIONS.map((sec) => (
              <V3NavSection key={sec.title} title={sec.title}>
                {sec.rows.map((r) => (
                  <button key={r.trigger} type="button" className="jv3-nav-item jv3-t-action jgm-row" data-jrn-trigger={r.trigger} data-variant={r.to === 'sign-out' ? 'quiet' : undefined} onClick={() => onOpen(r.to)}>
                    <V3Icon name={r.icon} />
                    <span className="jgm-row__text">
                      <span>{r.label}</span>
                      {asides[r.trigger] ? <small className="jgm-row__state" data-testid={`${r.trigger}-state`}>{asides[r.trigger]}</small> : null}
                    </span>
                    <V3Chevron />
                  </button>
                ))}
              </V3NavSection>
            ))}
          </nav>
        </div>
      </div>
    </OverlayLayer>
  );
}

/* ── G · MY MEMBERSHIP: bronze laurel seal, oxblood textile, the live plan and what it includes ── */
export function MembershipFolio({ onClose, onOpen }: { onClose: () => void; onOpen: (panel: GlobalMenuPanel) => void }) {
  const e = useJurnlEntitlements();
  const founder = hasFounderAccess(e);
  const plan = e ? planById(CONTRACT, e.effectivePlanId) : null;
  const caps = e?.capabilities ?? [];
  const shown = caps.slice(0, 6);
  const granted = (e?.addOns.granted ?? []).map((id) => addOnById(CONTRACT, id)?.name ?? id);
  const billingLive = plan ? plan.billingStatus !== 'NOT_CONFIGURED' && plan.billingProvider !== 'NONE' : false;
  return (
    <V3Folio
      label="MY MEMBERSHIP"
      material="membership"
      testId="global-membership"
      seal={<V3Seal wax={laurelSeal} />}
      title="MEMBERSHIP"
      script="your journey, your plan"
      onClose={onClose}
      footer={<V3Pill tone="cream" trigger="membership-done" onClick={onClose}>CLOSE</V3Pill>}
    >
      {!e || e.status !== 'RESOLVED' ? (
        <V3Notice tone="attention" icon="warn" testId="membership-unavailable">
          {M.unavailable[(e?.failure as keyof typeof M.unavailable) ?? 'ENTITLEMENT_LOAD_FAILURE'] ?? M.unavailable.ENTITLEMENT_LOAD_FAILURE} {M.unavailableBody}
        </V3Notice>
      ) : (
        <>
          <V3RuleLabel>YOUR PLAN</V3RuleLabel>
          <V3Row
            icon="crown"
            label={founder ? 'FOUNDER ACCESS' : planDisplayName(e.effectivePlanId)}
            sub={founder ? 'EVERY JURNL CAPABILITY IS AVAILABLE TO YOU' : `${caps.length} CAPABILITIES INCLUDED`}
            aside={<V3Status state={founder ? 'FOUNDER' : 'ACTIVE'} />}
            testId="membership-plan"
          />
          <ul className="jv3-checklist" aria-label="INCLUDED">
            {shown.map((id) => (
              <li key={id} data-testid={`membership-cap-${id}`}>
                <V3Icon name="check" />
                <span>{capabilityLabel(id)}</span>
              </li>
            ))}
          </ul>
          <div>
            {caps.length > shown.length ? <p className="jv3-t-meta" style={{ padding: '2px 6px' }}>{`AND ${caps.length - shown.length} MORE INCLUDED`}</p> : null}
          </div>
          <V3RuleLabel>ACTIVE ADD-ONS</V3RuleLabel>
          {founder ? (
            <V3Row icon="grid" label="ALL ADD-ONS" sub="INCLUDED WITH FOUNDER ACCESS" aside={<V3Status state="FOUNDER" />} />
          ) : granted.length ? (
            granted.map((n) => <V3Row key={n} icon="grid" label={n} aside={<V3Status state="ACTIVE" />} />)
          ) : (
            <V3Row icon="grid" label="NO ADD-ONS YET" sub="SEE WHAT IS PLANNED" onClick={() => onOpen('add-ons')} trigger="membership-add-ons" />
          )}
          {billingLive || founder ? null : (
            <V3Notice icon="info" testId="membership-billing">
              BILLING IS NOT SET UP YET. NOTHING CAN BE BOUGHT IN JURNL TODAY, AND NOTHING IS CHARGED.
            </V3Notice>
          )}
          {/* MANAGE MEMBERSHIP is not a control until billing exists: a static row that says so (never a dead button). */}
          <V3Row icon="gear" label="MANAGE MEMBERSHIP" sub={billingLive ? 'MANAGED BY YOUR BILLING PROVIDER' : 'NOT AVAILABLE YET · NO BILLING IS SET UP'} testId="membership-manage" />
        </>
      )}
    </V3Folio>
  );
}

/* ── H · EXPLORE ADD-ONS: the registry's add-ons, each with its real state ── */
export function AddOnCollection({ onClose, onOpen }: { onClose: () => void; onOpen: (panel: GlobalMenuPanel) => void }) {
  const e = useJurnlEntitlements();
  return (
    <V3Folio
      label="EXPLORE ADD-ONS"
      testId="global-add-ons"
      title="EXPLORE ADD-ONS"
      script="tailor jurnl to your journey"
      onClose={onClose}
      footer={<V3Pill tone="cream" trigger="add-ons-done" onClick={onClose}>CLOSE</V3Pill>}
    >
      {CONTRACT.addOns.map((a) => (
        <V3Card
          key={a.addOnId}
          art={ADD_ON_ART[a.addOnId] ?? artTravel}
          title={a.name.replace(/^JURNL /, '')}
          body={a.capabilityGrants.map(capabilityLabel).join(' · ')}
          state={addOnState(a, e)}
          trigger={`add-on-${a.addOnId.toLowerCase()}`}
          onClick={() => onOpen({ unlock: a.addOnId })}
        />
      ))}
      <p className="jv3-t-script" style={{ textAlign: 'center', padding: '4px 0 2px' }}>more tools for a more intentional life</p>
    </V3Folio>
  );
}

/* ── I · UNLOCK: what the add-on gives, what it requires, and an honest next step (no checkout exists) ── */
export function UnlockFolio({ addOnId, onClose }: { addOnId: string; onClose: () => void }) {
  const e = useJurnlEntitlements();
  const a = addOnById(CONTRACT, addOnId);
  if (!a) return null;
  const state = addOnState(a, e);
  const plans = a.eligiblePlans.filter((p) => planById(CONTRACT, p)).map(planDisplayName);
  return (
    <V3Folio
      label={a.name}
      material="unlock"
      testId="global-unlock"
      seal={<V3Seal icon="lock" />}
      title={state === 'FOUNDER' || state === 'ACTIVE' ? a.name : 'UNLOCK THIS FEATURE'}
      script={state === 'COMING_SOON' ? 'not available yet' : undefined}
      onClose={onClose}
      footer={<V3Pill tone="cream" trigger="unlock-not-now" onClick={onClose}>{state === 'FOUNDER' || state === 'ACTIVE' ? 'CLOSE' : 'NOT NOW'}</V3Pill>}
    >
      {/* No checkout exists, so the feature card is a description, not a button (it used to be a no-op button). */}
      <V3Card art={ADD_ON_ART[a.addOnId] ?? artTravel} title={a.name} body={a.capabilityGrants.map(capabilityLabel).join(' · ')} state={state} testId="unlock-feature" />
      <V3RuleLabel>{state === 'FOUNDER' ? 'YOUR ACCESS' : 'AVAILABLE WITH'}</V3RuleLabel>
      {state === 'FOUNDER' ? (
        <V3Row icon="crown" label="FOUNDER ACCESS" sub="INCLUDED FOR YOU" aside={<V3Status state="FOUNDER" />} />
      ) : (
        <V3Row icon="grid" label={`${a.name} (${M.addOnLead})`} sub={plans.length ? `FOR ${plans.join(' · ')}` : undefined} aside={<V3Status state={state} />} />
      )}
      {state === 'COMING_SOON' ? (
        <V3Notice icon="info" testId="unlock-coming-soon">
          THIS ADD-ON IS NOT AVAILABLE YET. THERE IS NO PRICE AND NOTHING CAN BE BOUGHT TODAY.
        </V3Notice>
      ) : null}
    </V3Folio>
  );
}
