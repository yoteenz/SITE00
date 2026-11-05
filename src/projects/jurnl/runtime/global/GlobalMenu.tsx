/**
 * JURNL global menu (the hamburger) and the MEMBERSHIP & ACCESS surfaces — V3 interactive system.
 *
 * The menu is SECONDARY navigation. The dock already owns HOME · MONEY · ADD · PLAN · CREDIT, so none of them appears
 * here. Every item routes to an existing management surface; nothing is invented:
 *
 *   YOUR ACCOUNT          ACCOUNT & PROFILE → the ACCOUNT page (profile, currency, connection, context, buffer, …)
 *                         PREFERENCES       → the approved F09 account folio (currency, connection, ask context, buffer)
 *                         PRIVACY & DATA    → the existing PRIVACY & CONSENTS sheet
 *   MEMBERSHIP & ACCESS   MY MEMBERSHIP     → membership folio, read from the entitlement contract
 *                         EXPLORE ADD-ONS   → the add-on collection, read from the add-on registry
 *   SUPPORT               HELP & SUPPORT    → not built yet: says so (as the ACCOUNT page does)
 *   SIGN OUT
 *
 * Membership reads ONLY the resolved entitlements and the registries (plans, capabilities, add-ons). No price, no
 * checkout, no purchase state is shown or implied: billing is not configured, so nothing is AVAILABLE to buy. A
 * FOUNDER_FULL grant (server-resolved, #1708) is shown as FOUNDER ACCESS and suppresses every upgrade prompt; it never
 * changes what is authorized (the trusted backend decides). Unknown entitlement state withholds (fail closed).
 */
import { ART, EdArt, REGION } from '../surfaces/editorial/Editorial';
import { useState } from 'react';
import { addOnById, capabilityById, planById, type AddOnDefinition } from '../../../../../shared/site00-monetization/contract.js';
import { JURNL_MONETIZATION_CONTRACT as CONTRACT } from '../../data/monetization/contract';
import { JURNL_MONETIZATION_COPY as M } from '../../data/monetization/copy';
import { useJurnlEntitlements } from '../monetization/JurnlEntitlements';
import { useJurnl } from '../state/store';
import { V3Card, V3Drawer, V3Folio, V3Icon, V3NavItem, V3NavSection, V3Notice, V3Pill, V3Row, V3RuleLabel, V3Seal, V3Status, type V3AccessState } from '../surfaces/v3/V3Surfaces';
import laurelSeal from '../../families/F05_MONEY/DOT01/F05_DOT01_02_LAUREL_WAX_SEAL.webp';
import artTravel from '../../families/F05_MONEY/DOT01/F05_DOT01_08_PARCHMENT_COASTAL_PANEL.webp';
import artPurchase from '../../families/F05_MONEY/DOT01/F05_DOT01_15_TEMPLE_COASTAL_COMPOSITION.webp';
import artBusiness from '../../families/F05_MONEY/DOT01/F05_DOT01_22_RECEIPT_PAPER_STACK.webp';
import artCredit from '../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_CARD_CREDIT.webp';

export type GlobalMenuPanel = 'menu' | 'membership' | 'add-ons' | { unlock: string };
export type GlobalMenuDestination = 'account' | 'preferences' | 'privacy';

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

/* ── the hamburger: deep-olive editorial folio ── */
export function GlobalMenu({ onClose, onOpen, onDestination }: { onClose: () => void; onOpen: (panel: GlobalMenuPanel) => void; onDestination: (d: GlobalMenuDestination) => void }) {
  const { signOut, showToast } = useJurnl();
  return (
    <V3Drawer label="MENU" material="olive" onClose={onClose} testId="global-menu">
      {/* founder board 08: the classical head of the menu — the SK01 bust, a lemon branch, the torn headline paper */}
      <div className="jed-menu-head">
        <EdArt art={ART.sk01} region={REGION.bust} className="jed-art--bust" torn={13} />
        <EdArt art={ART.lemonBranch} className="jed-art--lemon" />
        <div className="jed-menu-head__title">
          <span className="jed-head__paper" aria-hidden style={{ backgroundImage: `url("${ART.heading.src}")` }} />
          <h2 className="jed-head__title">MENU</h2>
          <p className="jv3-t-script">tools, membership and more</p>
        </div>
      </div>
      <V3NavSection title="YOUR ACCOUNT">
        <V3NavItem icon="person" label="ACCOUNT & PROFILE" trigger="menu-account" onClick={() => onDestination('account')} />
        <V3NavItem icon="gear" label="PREFERENCES" trigger="menu-preferences" onClick={() => onDestination('preferences')} />
        <V3NavItem icon="shield" label="PRIVACY & DATA" trigger="menu-privacy" onClick={() => onDestination('privacy')} />
      </V3NavSection>
      <V3NavSection title="MEMBERSHIP & ACCESS">
        <V3NavItem icon="crown" label="MY MEMBERSHIP" trigger="menu-membership" onClick={() => onOpen('membership')} />
        <V3NavItem icon="grid" label="EXPLORE ADD-ONS" trigger="menu-add-ons" onClick={() => onOpen('add-ons')} />
      </V3NavSection>
      <V3NavSection title="SUPPORT">
        <V3NavItem icon="help" label="HELP & SUPPORT" trigger="menu-help" onClick={() => showToast({ tone: 'error', title: 'HELP & SUPPORT', body: 'NOT IN THIS PREVIEW YET.', testId: 'toast-not-yet' })} />
      </V3NavSection>
      <V3NavItem icon="signout" label="SIGN OUT" trigger="menu-sign-out" variant="quiet" onClick={() => signOut()} />
    </V3Drawer>
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
          <V3Row icon="gear" label="MANAGE MEMBERSHIP" sub={billingLive ? undefined : 'NOT AVAILABLE YET'} testId="membership-manage" />
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
      <V3Card art={ADD_ON_ART[a.addOnId] ?? artTravel} title={a.name} body={a.capabilityGrants.map(capabilityLabel).join(' · ')} state={state} trigger="unlock-feature" onClick={() => undefined} />
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

/** The menu host: which V3 panel is open, and the destinations it hands back to the caller. */
export function useGlobalMenuState() {
  const [panel, setPanel] = useState<GlobalMenuPanel | null>(null);
  return { panel, setPanel };
}
