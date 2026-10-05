/**
 * Production bottom-nav glyphs — founder master PNGs (transparent).
 * Notification dots stay outside the image.
 */
import hub from './bottom-nav/masters/01_HUB.png';
import inbox from './bottom-nav/masters/02_INBOX.png';
import design from './bottom-nav/masters/03_DESIGN.png';
import experience from './bottom-nav/masters/04_EXPERIENCE.png';
import expression from './bottom-nav/masters/05_EXPRESSION.png';
import library from './bottom-nav/masters/06_LIBRARY.png';
import activity from './bottom-nav/masters/07_ACTIVITY.png';

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

/** Runtime URL of a founder master glyph (LIBRARY / ICONS reads these; the files stay the single source). */
export const productionNavGlyphSrc = (g: ProductionNavGlyph): string => SRC[g];

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
  size = 28,
  className,
  ariaHidden = true,
}: {
  variant: ProductionNavGlyph;
  active?: boolean;
  size?: number;
  className?: string;
  ariaHidden?: boolean;
}) {
  return (
    <img
      src={SRC[variant]}
      alt=""
      width={size}
      height={size}
      draggable={false}
      className={`bnav-ico${className ? ` ${className}` : ''}`}
      aria-hidden={ariaHidden}
      data-nav-glyph={variant}
      data-nav-concept={CONCEPT[variant]}
      data-nav-state={active ? 'active' : 'inactive'}
      data-nav-fidelity="reference-masters"
    />
  );
}

export function BottomNavPackIcon({ id, active = false }: { id: ProductionNavGlyph; active?: boolean }) {
  return <ProductionNavIcon variant={id} active={active} />;
}
