/** Anthony / launch readiness — fail-closed gates independent of product flags. */

export function isLaunchGateIntakeOnly(): boolean {
  const raw = process.env.SITE00_DIGITAL_FOUNDATION_LAUNCH_GATE_INTAKE_ONLY;
  return raw === '1' || raw?.toLowerCase() === 'true';
}

export function isLaunchGateCheckoutBlocked(): boolean {
  return isLaunchGateIntakeOnly();
}

export const LAUNCH_GATE_CHECKOUT_ERROR = 'LAUNCH_GATE_INTAKE_ONLY';
