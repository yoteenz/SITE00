/**
 * Color ownership — host wayfinding vs client accent.
 */

export function clientAccentCannotOverwriteHostCriticalStates(params: {
  clientAccentAppliedTo: string[];
}): boolean {
  const criticalHostStates = [
    'global_host_wayfinding_red',
    'accessibility_focus_ring',
    'error_state',
    'host_navigation_active',
  ];
  return !params.clientAccentAppliedTo.some((target) =>
    criticalHostStates.some((h) => target.toLowerCase().includes(h.replace(/_/g, ' ')) || target === h),
  );
}

export function hostRedNotClientBrandCanon(clientProhibitedTraits: string[]): boolean {
  return clientProhibitedTraits.every((t) => !t.toLowerCase().includes('host red as brand'));
}
