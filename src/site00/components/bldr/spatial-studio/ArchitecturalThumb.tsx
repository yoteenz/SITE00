type Variant =
  | 'simple'
  | 'advanced'
  | 'custom'
  | 'world'
  | 'modern'
  | 'bold'
  | 'editorial'
  | 'immersive'
  | 'direction'
  | 'pages'
  | 'features'
  | 'priority';

/** Distinct architectural thumbnails — SVG, no baked UI text, shared marble/red/glass language. */
export function ArchitecturalThumb({ variant }: { variant: Variant }) {
  const slabs = variant === 'simple' ? 2 : variant === 'world' || variant === 'immersive' ? 5 : variant === 'custom' ? 4 : 3;
  const redWide = variant === 'bold' || variant === 'features' || variant === 'advanced';
  return (
    <svg className={`bldr-arch-thumb bldr-arch-thumb--${variant}`} viewBox="0 0 96 64" aria-hidden>
      <defs>
        <linearGradient id={`m-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7f5f2" />
          <stop offset="0.5" stopColor="#e4ddd4" />
          <stop offset="1" stopColor="#cfc6ba" />
        </linearGradient>
      </defs>
      <polygon points="18,52 48,62 78,52 48,42" fill={`url(#m-${variant})`} stroke="#b7aea4" strokeWidth="0.6" />
      {Array.from({ length: slabs }).map((_, i) => {
        const y = 18 + i * 6;
        const inset = variant === 'editorial' ? i * 2 : 0;
        return (
          <g key={i} opacity={0.92 - i * 0.08}>
            <polygon
              points={`${22 + inset},${y + 16} ${48},${y + 24} ${74 - inset},${y + 16} ${48},${y + 8}`}
              fill="rgba(255,255,255,0.35)"
              stroke="rgba(20,20,20,0.35)"
              strokeWidth="0.7"
            />
          </g>
        );
      })}
      <polygon
        points={redWide ? '40,14 48,18 56,14 48,38' : '44,16 48,18 52,16 48,36'}
        fill="#E50107"
        opacity={variant === 'modern' ? 0.72 : 0.88}
      />
      {variant === 'world' || variant === 'immersive' ? (
        <polygon points="30,28 48,36 66,28 48,20" fill="none" stroke="#111" strokeWidth="0.6" opacity="0.45" />
      ) : null}
    </svg>
  );
}
