/**
 * P0.VR.MOF.R2 — Large visual status symbol for MORE child pages.
 */

import type { MoreVisualState } from './moreStatus';

type Props = {
  state: MoreVisualState;
  label?: string;
};

function glyphForState(state: MoreVisualState): string {
  switch (state) {
    case 'success':
      return '✓';
    case 'attention':
      return '!';
    case 'progress':
      return '◉';
    case 'offline':
      return '○';
    case 'unknown':
      return '—';
    default:
      return '●';
  }
}

export function MoreStatusHero({ state, label }: Props) {
  return (
    <div className="site00-dw-more-tool__hero" data-visual-state={state} aria-hidden={label ? undefined : true}>
      <div className="site00-dw-more-tool__hero-motif">
        <span className="site00-dw-more-tool__hero-ring site00-dw-more-tool__hero-ring--outer" />
        <span className="site00-dw-more-tool__hero-ring site00-dw-more-tool__hero-ring--mid" />
        <span className="site00-dw-more-tool__hero-ring site00-dw-more-tool__hero-ring--inner" />
        <span className="site00-dw-more-tool__hero-glyph">{glyphForState(state)}</span>
      </div>
      {label ? <p className="site00-dw-more-tool__hero-label">{label}</p> : null}
    </div>
  );
}
