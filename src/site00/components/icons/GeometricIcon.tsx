type GeometricIconProps = {
  variant:
    | 'cube-simple'
    | 'cube-medium'
    | 'cube-complex'
    | 'cube-solid'
    | 'idnty-header'
    | 'bldr-header'
    | 'site'
    | 'world'
    | 'enterprise'
    | 'discovery'
    | 'strategy'
    | 'visual'
    | 'voice'
    | 'values'
    | 'experience'
    | 'direction'
    | 'structure'
    | 'function'
    | 'scope'
    | 'pulse'
    | 'globe'
    | 'crosshair'
    | 'cube'
    | 'shield';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function GeometricIcon({ variant, size = 'md', className = '' }: GeometricIconProps) {
  const dim = size === 'sm' ? 32 : size === 'lg' ? 80 : 64;
  const cls = `site00-wireframe-icon ${size === 'sm' ? 'site00-wireframe-icon--sm' : ''} ${className}`.trim();

  return (
    <svg
      className={cls}
      width={dim}
      height={dim}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      {renderIconPaths(variant)}
    </svg>
  );
}

function renderIconPaths(variant: GeometricIconProps['variant']) {
  switch (variant) {
    case 'cube-simple':
      return (
        <>
          <rect x="20" y="20" width="24" height="24" stroke="currentColor" strokeWidth="1" />
          <circle cx="32" cy="32" r="2" fill="currentColor" />
        </>
      );
    case 'cube-medium':
      return (
        <>
          <path d="M16 28L32 16L48 28V44L32 56L16 44V28Z" stroke="currentColor" strokeWidth="1" />
          <path d="M32 16V32M48 28L32 32M16 28L32 32M32 32V56" stroke="currentColor" strokeWidth="0.75" opacity="0.6" />
        </>
      );
    case 'cube-complex':
      return (
        <>
          <path d="M12 32L32 14L52 32V50L32 68" stroke="currentColor" strokeWidth="1" transform="translate(0,-8)" />
          <path d="M20 32H44M32 20V44M24 26L40 38M40 26L24 38" stroke="currentColor" strokeWidth="0.75" />
          <circle cx="32" cy="32" r="3" fill="currentColor" />
        </>
      );
    case 'cube-solid':
      return (
        <>
          <path d="M14 30L32 12L50 30V48L32 66L14 48V30Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" transform="translate(0,-10)" />
          <path d="M22 30H42M32 20V40" stroke="currentColor" strokeWidth="1" />
        </>
      );
    case 'idnty-header':
    case 'bldr-header':
      return (
        <>
          <path d="M18 18H46V46H18V18Z" stroke="currentColor" strokeWidth="1" />
          <path d="M18 32H46M32 18V46" stroke="currentColor" strokeWidth="0.75" />
          <path d="M24 24L40 40M40 24L24 40" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
        </>
      );
    case 'site':
      return (
        <>
          <rect x="14" y="18" width="16" height="12" stroke="currentColor" strokeWidth="1" rx="1" />
          <rect x="34" y="18" width="16" height="12" stroke="currentColor" strokeWidth="1" rx="1" />
          <rect x="24" y="34" width="16" height="12" stroke="currentColor" strokeWidth="1" rx="1" />
        </>
      );
    case 'world':
      return (
        <>
          <circle cx="32" cy="32" r="16" stroke="currentColor" strokeWidth="1" />
          <rect x="22" y="22" width="8" height="6" stroke="currentColor" strokeWidth="0.75" />
          <rect x="34" y="22" width="8" height="6" stroke="currentColor" strokeWidth="0.75" />
          <rect x="28" y="34" width="8" height="6" stroke="currentColor" strokeWidth="0.75" />
        </>
      );
    case 'enterprise':
      return (
        <>
          <path d="M32 12L52 28V48L32 64L12 48V28L32 12Z" stroke="currentColor" strokeWidth="1" />
          <path d="M32 12V32M52 28L32 32M12 28L32 32" stroke="currentColor" strokeWidth="0.75" />
        </>
      );
    case 'discovery':
      return (
        <>
          <text x="32" y="40" textAnchor="middle" fill="currentColor" fontSize="28" fontFamily="serif">
            ?
          </text>
        </>
      );
    case 'pulse':
      return (
        <path d="M8 32H16L20 22L26 42L32 18L38 38L42 28H56" stroke="currentColor" strokeWidth="1.5" fill="none" />
      );
    case 'globe':
      return (
        <>
          <circle cx="32" cy="32" r="14" stroke="currentColor" strokeWidth="1" />
          <ellipse cx="32" cy="32" rx="6" ry="14" stroke="currentColor" strokeWidth="0.75" />
          <line x1="18" y1="32" x2="46" y2="32" stroke="currentColor" strokeWidth="0.75" />
        </>
      );
    case 'crosshair':
      return (
        <>
          <circle cx="32" cy="32" r="12" stroke="currentColor" strokeWidth="1" />
          <circle cx="32" cy="32" r="2" fill="currentColor" />
          <line x1="32" y1="16" x2="32" y2="24" stroke="currentColor" strokeWidth="1" />
          <line x1="32" y1="40" x2="32" y2="48" stroke="currentColor" strokeWidth="1" />
          <line x1="16" y1="32" x2="24" y2="32" stroke="currentColor" strokeWidth="1" />
          <line x1="40" y1="32" x2="48" y2="32" stroke="currentColor" strokeWidth="1" />
        </>
      );
    case 'cube':
      return (
        <path d="M20 24L32 16L44 24V40L32 48L20 40V24Z" stroke="currentColor" strokeWidth="1" fill="none" />
      );
    case 'shield':
      return (
        <>
          <path d="M32 14L48 22V34C48 44 32 52 32 52C32 52 16 44 16 34V22L32 14Z" stroke="currentColor" strokeWidth="1" />
          <line x1="26" y1="32" x2="30" y2="36" stroke="currentColor" strokeWidth="1.5" />
          <line x1="30" y1="36" x2="38" y2="28" stroke="currentColor" strokeWidth="1.5" />
        </>
      );
    default:
      return <rect x="16" y="16" width="32" height="32" stroke="currentColor" strokeWidth="1" />;
  }
}

/** Map identity state complexity to icon variant */
export function identityComplexityIcon(
  complexity: 0 | 1 | 2 | 3,
): 'cube-simple' | 'cube-medium' | 'cube-complex' | 'cube-solid' {
  const map: Record<number, 'cube-simple' | 'cube-medium' | 'cube-complex' | 'cube-solid'> = {
    0: 'cube-simple',
    1: 'cube-medium',
    2: 'cube-complex',
    3: 'cube-solid',
  };
  return map[complexity] ?? 'cube-simple';
}
