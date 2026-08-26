import type { CSSProperties } from 'react';
import { getPortraitCrop } from '../../../../../shared/site00-astral-world/referenceCropRegistry.js';
import {
  getIsolatedPortrait,
  isolatedPortraitStyle,
  type IsolatedPortraitSpec,
} from '../../../../../shared/site00-astral-world/portraitAssetRegistry.js';
import { resolveCanonicalAvatarAssets } from '../../../../../shared/site00-astral-world/readerAccount/avatarResolver.js';
import { useAstralAssets, useAstralPortraitBackground } from '../../hooks/useAstralAssets';

type AstralPortraitProps = {
  personId: string;
  name: string;
  initials?: string;
  /** P0.R.1 — canonical avatar library ID */
  avatarId?: string | null;
  size?: number;
  className?: string;
  showPresence?: boolean;
  variant?: 'reader' | 'friend' | 'auto';
};

function styleFromIsolated(spec: IsolatedPortraitSpec, size: number): CSSProperties {
  const base = isolatedPortraitStyle(spec);
  return { width: size, height: size, ...base };
}

export function AstralPortrait({
  personId,
  name,
  initials,
  avatarId = null,
  size = 40,
  className = '',
  showPresence = false,
  variant = 'auto',
}: AstralPortraitProps) {
  const { store } = useAstralAssets();
  const generated = useAstralPortraitBackground(personId, store);
  const canonical = resolveCanonicalAvatarAssets({ avatarId, personId, store });
  const isolated = getIsolatedPortrait(personId);
  const crop = getPortraitCrop(personId);
  const kind = variant === 'auto' ? (isolated?.kind === 'reader' ? 'reader' : 'friend') : variant;

  const style: CSSProperties = generated.style
    ? { width: size, height: size, ...generated.style }
    : canonical.circleStyle
      ? { width: size, height: size, ...canonical.circleStyle }
      : isolated
        ? styleFromIsolated(isolated, size)
        : crop
          ? {
              width: size,
              height: size,
              backgroundImage: `url(${crop.src})`,
              backgroundPosition: crop.position,
              backgroundSize: crop.size,
              backgroundRepeat: 'no-repeat',
            }
          : { width: size, height: size };

  const hasVisual = Boolean(generated.url || canonical.circleStyle || isolated || crop);

  return (
    <span
      className={`aw-portrait aw-portrait--${kind} ${className}`.trim()}
      style={style}
      role="img"
      aria-label={name}
      title={name}
      data-person-id={personId}
      data-avatar-id={canonical.avatarId}
      data-portrait-semantic={isolated?.semanticKey}
      data-avatar-source={canonical.source}
    >
      {!hasVisual && initials ? <span className="aw-portrait__fallback" aria-hidden>{initials}</span> : null}
      {showPresence ? <span className="aw-portrait__live" aria-hidden /> : null}
    </span>
  );
}

export function AstralPortraitRow({
  people,
  size = 36,
}: {
  people: { id: string; name: string; initials?: string; avatarId?: string | null }[];
  size?: number;
}) {
  return (
    <div className="aw-portrait-row">
      {people.map((p) => (
        <AstralPortrait
          key={p.id}
          personId={p.id}
          avatarId={p.avatarId}
          name={p.name}
          initials={p.initials}
          size={size}
          showPresence
        />
      ))}
    </div>
  );
}
