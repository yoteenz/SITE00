/** QA preview override via ?view=mobile|desktop — not a separate canonical route. */

export type Site00PresentationQueryOverride = 'mobile' | 'desktop';

export function readPresentationQueryOverride(search: string): Site00PresentationQueryOverride | null {
  try {
    const view = new URLSearchParams(search).get('view');
    if (view === 'mobile' || view === 'desktop') return view;
  } catch {
    /* ignore */
  }
  return null;
}
