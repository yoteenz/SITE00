/** Browser + Node safe identifier helper. */
export function randomId(prefix = 'ecd'): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
