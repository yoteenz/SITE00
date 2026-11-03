/** F05 DOT 01 — the contextual overlays opened from account pages (one switch; each overlay keeps the page's context). */
export type Dot01SheetState =
  | null
  | { kind: 'edit'; accountId: string }
  | { kind: 'add-cash'; accountId: string }
  | { kind: 'spend'; accountId: string }
  | { kind: 'card-payment'; accountId: string };

export function Dot01Sheets({ state }: { state: Dot01SheetState; onClose: () => void }) {
  if (!state) return null;
  return null;
}
