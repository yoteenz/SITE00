import {
  ASTRAL_REFERENCE_DESKTOP,
  ASTRAL_REFERENCE_MOBILE,
  type AstralCinematicVariant,
} from '../../../../shared/site00-astral-world/referenceAssets.js';

const CROP: Record<AstralCinematicVariant, { src: string; position: string; size: string }> = {
  'desktop-hero': {
    src: ASTRAL_REFERENCE_DESKTOP.publicPath,
    position: '42% 6%',
    size: '185% auto',
  },
  'desktop-astrea': {
    src: ASTRAL_REFERENCE_DESKTOP.publicPath,
    position: '50% 38%',
    size: '160% auto',
  },
  'desktop-suite': {
    src: ASTRAL_REFERENCE_DESKTOP.publicPath,
    position: '18% 72%',
    size: '220% auto',
  },
  'desktop-mall': {
    src: ASTRAL_REFERENCE_DESKTOP.publicPath,
    position: '50% 72%',
    size: '220% auto',
  },
  'desktop-coffee': {
    src: ASTRAL_REFERENCE_DESKTOP.publicPath,
    position: '82% 72%',
    size: '220% auto',
  },
  'mobile-hero': {
    src: ASTRAL_REFERENCE_MOBILE.publicPath,
    position: '68% 12%',
    size: '320% auto',
  },
  'mobile-coffee': {
    src: ASTRAL_REFERENCE_MOBILE.publicPath,
    position: '68% 38%',
    size: '300% auto',
  },
  'mobile-mall': {
    src: ASTRAL_REFERENCE_MOBILE.publicPath,
    position: '68% 58%',
    size: '300% auto',
  },
};

export function AstralCinematicBg({
  variant,
  className = 'aw-cinematic-bg',
}: {
  variant: AstralCinematicVariant;
  className?: string;
}) {
  const crop = CROP[variant];
  return (
    <div
      className={className}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(6, 8, 15, 0.15) 0%, rgba(6, 8, 15, 0.88) 75%), url(${crop.src})`,
        backgroundPosition: crop.position,
        backgroundSize: crop.size,
      }}
      aria-hidden
    />
  );
}
