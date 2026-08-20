/** Client-safe production phases — sanitized from Studio World internal state. */

export type MarketingClientPhase = {
  code: string;
  label: string;
  description: string;
};

export const MARKETING_CLIENT_PHASES: MarketingClientPhase[] = [
  { code: '01', label: 'DIRECTION', description: 'Creative direction is being established.' },
  { code: '02', label: 'PREPRODUCTION', description: 'Assets, references, and plan are aligning.' },
  { code: '03', label: 'PRODUCTION', description: 'Campaign production is active.' },
  { code: '04', label: 'INTERNAL REVIEW', description: 'SITE 00 is reviewing before your signal.' },
  { code: '05', label: 'YOUR REVIEW', description: 'Your review is ready or pending.' },
  { code: '06', label: 'FINALIZATION', description: 'Approved work is being finalized.' },
  { code: '07', label: 'DELIVERED', description: 'Deliverables are ready in your Vault.' },
];

export function marketingPhaseLabel(code: string): string {
  return MARKETING_CLIENT_PHASES.find((p) => p.code === code)?.label ?? 'IN PROGRESS';
}
