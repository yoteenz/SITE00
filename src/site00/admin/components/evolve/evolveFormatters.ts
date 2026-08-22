/** Label formatting for EVOLVE operator surfaces */

export function formatEvolveLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return value.replace(/_/g, ' ');
}

export function evolveStatusPillClass(status: string): string {
  const s = status.toUpperCase();
  if (['LIVE', 'APPROVED', 'CONNECTED', 'COMPLETE', 'PUBLISHED', 'READY'].some((k) => s.includes(k))) {
    return 'site00-control-priority__pill--ready';
  }
  if (['BLOCKED', 'CANCELLED', 'NOT_CONNECTED', 'ERROR'].some((k) => s.includes(k))) {
    return 'site00-control-priority__pill--blocked';
  }
  if (['IN_PRODUCTION', 'IN_PROGRESS', 'PENDING', 'AWAITING', 'ATTENTION'].some((k) => s.includes(k))) {
    return 'site00-control-priority__pill--action';
  }
  if (['DEFERRED', 'DRAFT', 'IDEA', 'PLANNED', 'STRATEGY'].some((k) => s.includes(k))) {
    return 'site00-control-priority__pill--info';
  }
  return 'site00-control-priority__pill--milestone';
}
