/**
 * Production bottom-nav glyphs — keyed PNG masks (same art as the three-viewport review branch).
 * Notification marks stay outside the glyph.
 */
import hub from './bottom-nav/01_HUB.png';
import inbox from './bottom-nav/02_INBOX.png';
import design from './bottom-nav/03_DESIGN.png';
import experience from './bottom-nav/04_EXPERIENCE.png';
import expression from './bottom-nav/05_EXPRESSION.png';
import library from './bottom-nav/06_LIBRARY.png';
import activity from './bottom-nav/07_ACTIVITY.png';

export type ProductionNavGlyph =
  | 'hub'
  | 'inbox'
  | 'design'
  | 'experience'
  | 'expression'
  | 'library'
  | 'activity';

const SRC: Record<ProductionNavGlyph, string> = {
  hub,
  inbox,
  design,
  experience,
  expression,
  library,
  activity,
};

const CONCEPT: Record<ProductionNavGlyph, string> = {
  hub: 'pavilion',
  inbox: 'envelope-tray',
  design: 'composition-planes',
  experience: 'portal',
  expression: 'prism-stage',
  library: 'open-book',
  activity: 'timeline',
};

export function ProductionNavIcon({
  variant,
  active = false,
  className,
  ariaHidden = true,
}: {
  variant: ProductionNavGlyph;
  active?: boolean;
  className?: string;
  ariaHidden?: boolean;
}) {
  return (
    <span
      className={`ph-nav__glyph${className ? ` ${className}` : ''}`}
      style={{ ['--nav-icon' as string]: `url("${SRC[variant]}")` }}
      aria-hidden={ariaHidden}
      data-nav-glyph={variant}
      data-nav-concept={CONCEPT[variant]}
      data-nav-state={active ? 'active' : 'inactive'}
      data-nav-fidelity="keyed-png-mask"
    />
  );
}

export function BottomNavPackIcon({ id, active = false }: { id: ProductionNavGlyph; active?: boolean }) {
  return <ProductionNavIcon variant={id} active={active} />;
}
