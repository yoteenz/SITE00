/**
 * JURNL monetization primitives — reusable system components for FUTURE families (not mounted in F01).
 *
 *   JURNL_ENTITLEMENT_GATE · JURNL_UPGRADE_PANEL · JURNL_FEATURE_PREVIEW · JURNL_USAGE_LIMIT_NOTICE
 *   JURNL_PLAN_BADGE · JURNL_ADD_ON_OFFER · JURNL_BILLING_STATUS · JURNL_TRIAL_NOTICE
 *
 * Rules: gate on CAPABILITIES (never plan names) · plan / add-on names come from the registry · copy is UPPERCASE,
 * FACT → VALUE → ACTION, no prices, no urgency · unknown entitlement state withholds premium content (fail closed)
 * · upgrade surfaces render only in families whose monetization metadata allows them (never in F01) · square-rounded
 * geometry only. Actions are callbacks: there is no checkout.
 */

import type { ReactNode } from 'react';
import { addOnById, planById, type SubscriptionState } from '../../../../../shared/site00-monetization/contract.js';
import { addOnsGranting, clientGate, lowestPlanGranting } from '../../../../../shared/site00-monetization/entitlements.js';
import { JURNL_MONETIZATION_CONTRACT as CONTRACT } from '../../data/monetization/contract';
import { JURNL_MONETIZATION_COPY as M } from '../../data/monetization/copy';
import { upgradeSurfaceAllowedIn } from '../../data/monetization/familyMonetization';
import { JurnlButton } from '../components/primitives';
import { useJurnlEntitlements, useUsageLimit } from './JurnlEntitlements';
import './jurnl-monetization.css';

type Action = { label?: string; onClick: () => void; trigger?: string };

/** Value line derived from the registry: which plan (or add-on) unlocks a capability. */
export function upgradeValueFor(capability: string): string | null {
  const plan = lowestPlanGranting(CONTRACT, capability);
  if (plan && plan.planId !== CONTRACT.defaultPlanId) return M.availableWith(plan.planName);
  const addOn = addOnsGranting(CONTRACT, capability)[0];
  return addOn ? M.availableAsAddOn(addOn.name) : null;
}

/* ── JURNL_UPGRADE_PANEL — FACT → VALUE → ACTION; renders nothing where the family disallows upgrade surfaces ── */
export function JurnlUpgradePanel({ familyId, capability, fact, value, action }: { familyId: string; capability: string; fact: string; value?: string; action: Action }) {
  if (!upgradeSurfaceAllowedIn(familyId)) return null;
  const valueLine = value ?? upgradeValueFor(capability);
  if (!valueLine) return null;
  return (
    <section className="jrn-mon jrn-mon--upgrade" data-jrn-monetization="upgrade-panel" data-capability={capability}>
      <p className="jrn-mon__fact">{fact}</p>
      <p className="jrn-mon__value">{valueLine}</p>
      <JurnlButton variant="secondary" trigger={action.trigger ?? `upgrade-${capability.toLowerCase()}`} onClick={action.onClick}>
        {action.label ?? M.viewOptions}
      </JurnlButton>
    </section>
  );
}

/* ── JURNL_FEATURE_PREVIEW — sample / limited content only; never premium data ── */
export function JurnlFeaturePreview({ label = M.preview, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="jrn-mon jrn-mon--preview" data-jrn-monetization="feature-preview">
      <span className="jrn-eyebrow">{label}</span>
      {children}
    </div>
  );
}

/* ── entitlement-state notice (failure states fall back safely) ── */
function JurnlEntitlementNotice({ failure }: { failure: string }) {
  const title = (M.unavailable as Record<string, string>)[failure] ?? M.unavailable.ENTITLEMENT_LOAD_FAILURE;
  return (
    <div className="jrn-mon jrn-mon--notice" role="status" data-jrn-monetization="entitlement-notice" data-failure={failure}>
      <b>{title}</b>
      <span>{M.unavailableBody}</span>
    </div>
  );
}

/* ── JURNL_ENTITLEMENT_GATE — SHOW (capability) · PREVIEW + upgrade (resolved, not included) · WITHHOLD (unknown) ── */
export function JurnlEntitlementGate({
  capability,
  familyId,
  children,
  preview,
  upgrade,
  fallback,
}: {
  capability: string;
  familyId: string;
  children: ReactNode;
  preview?: ReactNode;
  upgrade?: { fact: string; value?: string; action: Action };
  fallback?: ReactNode;
}) {
  const decision = clientGate(useJurnlEntitlements(), capability);
  if (decision.mode === 'SHOW') return <>{children}</>;
  if (decision.mode === 'WITHHOLD') return <>{fallback ?? <JurnlEntitlementNotice failure={decision.reason} />}</>;
  return (
    <div className="jrn-mon-gate" data-jrn-gate={capability} data-gate-mode="preview">
      {preview ? <JurnlFeaturePreview>{preview}</JurnlFeaturePreview> : null}
      {upgrade ? <JurnlUpgradePanel familyId={familyId} capability={capability} {...upgrade} /> : null}
    </div>
  );
}

/* ── JURNL_USAGE_LIMIT_NOTICE — never invents numbers (limits are TBD) ── */
export function JurnlUsageLimitNotice({ capability, reached, resetsLabel }: { capability: string; reached: boolean; resetsLabel?: string }) {
  const limit = useUsageLimit(capability);
  if (!reached || !limit || limit.period === 'UNLIMITED') return null;
  return (
    <div className="jrn-mon jrn-mon--usage" role="status" data-jrn-monetization="usage-limit" data-capability={capability} data-period={limit.period}>
      <b>{M.usageReached}</b>
      {resetsLabel ? <span>{M.usageResets(resetsLabel)}</span> : null}
    </div>
  );
}

/* ── JURNL_PLAN_BADGE — label from the registry ── */
export function JurnlPlanBadge({ planId }: { planId?: string }) {
  const e = useJurnlEntitlements();
  const plan = planById(CONTRACT, planId ?? e?.effectivePlanId ?? CONTRACT.defaultPlanId);
  if (!plan) return null;
  return (
    <span className="jrn-mon-badge" data-jrn-monetization="plan-badge" data-plan-class={plan.planClass}>
      {plan.tierLabel.replace(/_/g, ' ')}
    </span>
  );
}

/* ── JURNL_ADD_ON_OFFER ── */
export function JurnlAddOnOffer({ familyId, addOnId, fact, action }: { familyId: string; addOnId: string; fact: string; action: Action }) {
  const addOn = addOnById(CONTRACT, addOnId);
  if (!addOn || !upgradeSurfaceAllowedIn(familyId)) return null;
  return (
    <section className="jrn-mon jrn-mon--addon" data-jrn-monetization="add-on-offer" data-add-on={addOnId}>
      <span className="jrn-eyebrow">{M.addOnLead}</span>
      <p className="jrn-mon__fact">{fact}</p>
      <p className="jrn-mon__value">{M.availableAsAddOn(addOn.name)}</p>
      <JurnlButton variant="secondary" trigger={action.trigger ?? `add-on-${addOnId.toLowerCase()}`} onClick={action.onClick}>
        {action.label ?? M.viewOptions}
      </JurnlButton>
    </section>
  );
}

/* ── JURNL_BILLING_STATUS — internal / settings use only (never in F01) ── */
export function JurnlBillingStatus({ state }: { state?: SubscriptionState }) {
  const e = useJurnlEntitlements();
  const s = state ?? e?.subscriptionState ?? 'NONE';
  return (
    <span className="jrn-mon-badge" data-jrn-monetization="billing-status" data-state={s}>
      {M.billingState[s]}
    </span>
  );
}

/* ── JURNL_TRIAL_NOTICE — no trial length assumed; renders only while a trial is active ── */
export function JurnlTrialNotice({ endDateLabel }: { endDateLabel: string }) {
  const e = useJurnlEntitlements();
  if (!e?.trialActive) return null;
  return (
    <div className="jrn-mon jrn-mon--trial" role="status" data-jrn-monetization="trial-notice">
      <b>{M.trialEnds(endDateLabel)}</b>
    </div>
  );
}
