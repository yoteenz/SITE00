import type { BldrStageArtworkVariant } from '../../../config/bldr-hub-stages';

type BldrStageArtworkProps = {
  variant: BldrStageArtworkVariant;
  className?: string;
};

const STROKE = {
  red: 'var(--site-red)',
  gray: 'rgba(0, 0, 0, 0.14)',
  faint: 'rgba(0, 0, 0, 0.08)',
  black: 'rgba(0, 0, 0, 0.35)',
} as const;

function InputArtwork() {
  return (
    <svg viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="60" cy="48" r="28" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <circle cx="60" cy="48" r="18" stroke={STROKE.gray} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <circle cx="60" cy="48" r="8" stroke={STROKE.red} strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <circle cx="60" cy="48" r="2.5" fill={STROKE.red} />
      <rect x="18" y="22" width="16" height="12" stroke={STROKE.gray} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="22" y1="26" x2="30" y2="26" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="22" y1="29" x2="28" y2="29" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <rect x="86" y="28" width="14" height="10" stroke={STROKE.gray} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="89" y1="32" x2="97" y2="32" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <rect x="82" y="58" width="18" height="14" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <path d="M86 62H96M86 66H94" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="60" y1="20" x2="60" y2="32" stroke={STROKE.red} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="60" y1="64" x2="60" y2="76" stroke={STROKE.red} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="32" y1="48" x2="44" y2="48" stroke={STROKE.red} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="76" y1="48" x2="88" y2="48" stroke={STROKE.red} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <circle cx="32" cy="48" r="1.5" fill={STROKE.black} />
      <circle cx="88" cy="48" r="1.5" fill={STROKE.black} />
    </svg>
  );
}

function AlignArtwork() {
  return (
    <svg viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <line x1="20" y1="20" x2="100" y2="20" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="20" y1="40" x2="100" y2="40" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="20" y1="60" x2="100" y2="60" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="20" y1="80" x2="100" y2="80" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="30" y1="14" x2="30" y2="86" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="60" y1="14" x2="60" y2="86" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="90" y1="14" x2="90" y2="86" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <path d="M34 44L46 52L58 36L70 48L82 32" stroke={STROKE.red} strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <rect x="38" y="52" width="10" height="10" stroke={STROKE.gray} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <rect x="54" y="52" width="10" height="10" stroke={STROKE.gray} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <rect x="70" y="52" width="10" height="10" stroke={STROKE.gray} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <circle cx="46" cy="52" r="2" fill={STROKE.red} />
      <circle cx="58" cy="36" r="2" fill={STROKE.red} />
      <circle cx="70" cy="48" r="2" fill={STROKE.red} />
      <circle cx="82" cy="32" r="2" fill={STROKE.red} />
      <circle cx="34" cy="44" r="1.5" fill={STROKE.black} />
      <circle cx="90" cy="60" r="1.5" fill={STROKE.black} />
    </svg>
  );
}

function ProductionArtwork() {
  return (
    <svg viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="28" y="18" width="64" height="48" stroke={STROKE.gray} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="28" y1="28" x2="92" y2="28" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <circle cx="34" cy="23" r="1.5" fill={STROKE.black} />
      <circle cx="40" cy="23" r="1.5" fill={STROKE.black} />
      <circle cx="46" cy="23" r="1.5" fill={STROKE.black} />
      <rect x="36" y="36" width="48" height="22" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="36" y1="72" x2="92" y2="72" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="36" y1="78" x2="80" y2="78" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="20" y1="86" x2="100" y2="86" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="20" y1="14" x2="100" y2="14" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="60" y1="36" x2="60" y2="58" stroke={STROKE.red} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="48" y1="47" x2="72" y2="47" stroke={STROKE.red} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <circle cx="60" cy="47" r="3" fill={STROKE.red} />
      <path d="M20 66H100M20 50H28M92 50H100" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function ReleaseArtwork() {
  return (
    <svg viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="60" cy="52" rx="24" ry="10" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <path d="M36 52V68C36 74 46 78 60 78C74 78 84 74 84 68V52" stroke={STROKE.gray} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <rect x="48" y="38" width="24" height="18" stroke={STROKE.gray} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <circle cx="60" cy="47" r="4" fill={STROKE.red} />
      <circle cx="60" cy="24" r="14" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <circle cx="60" cy="24" r="8" stroke={STROKE.gray} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <circle cx="88" cy="32" r="5" stroke={STROKE.gray} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <circle cx="32" cy="32" r="5" stroke={STROKE.gray} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <circle cx="96" cy="58" r="4" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <circle cx="24" cy="58" r="4" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="60" y1="47" x2="60" y2="24" stroke={STROKE.red} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="72" y1="42" x2="84" y2="34" stroke={STROKE.red} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="48" y1="42" x2="36" y2="34" stroke={STROKE.red} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="72" y1="52" x2="92" y2="56" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="48" y1="52" x2="28" y2="56" stroke={STROKE.faint} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <path d="M92 56L96 54V62L92 60" stroke={STROKE.gray} strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <circle cx="88" cy="32" r="1.5" fill={STROKE.black} />
      <circle cx="32" cy="32" r="1.5" fill={STROKE.black} />
    </svg>
  );
}

const ARTWORK: Record<BldrStageArtworkVariant, () => JSX.Element> = {
  input: InputArtwork,
  align: AlignArtwork,
  production: ProductionArtwork,
  release: ReleaseArtwork,
};

export function BldrStageArtwork({ variant, className = '' }: BldrStageArtworkProps) {
  const Art = ARTWORK[variant];
  return (
    <div className={`site00-bldr-mobile-stage__art ${className}`.trim()} aria-hidden="true">
      <Art />
    </div>
  );
}
