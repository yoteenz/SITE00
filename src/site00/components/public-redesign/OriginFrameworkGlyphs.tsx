import type { BldrFrameworkIconId } from '../../config/bldr-framework-icons';
import type { IdntyFrameworkIconId } from '../../config/idnty-framework-icons';
import { FrameworkGlyph } from './ServiceMachines';

const RED = '#e8192c';
const INK = '#2b2b2b';

const BLDR_GLYPH_INDEX: Record<BldrFrameworkIconId, number> = {
  direction: 0,
  structure: 1,
  function: 2,
  experience: 3,
  scope: 4,
};

/** Live-code BLDR framework row on Origin expanded panel (matches path-panel FrameworkGlyph family). */
export function OriginBldrFrameworkIcon({ id, className }: { id: BldrFrameworkIconId; className?: string }) {
  return <FrameworkGlyph index={BLDR_GLYPH_INDEX[id]} className={className} />;
}

/** Live-code IDNTY framework row on Origin expanded panel. */
export function OriginIdntyFrameworkIcon({ id, className }: { id: IdntyFrameworkIconId; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" aria-hidden="true" focusable="false" data-idnty-framework-glyph={id}>
      <g fill="none" strokeWidth="0.85" stroke={INK}>
        {id === 'strategy' ? (
          <>
            <circle cx="40" cy="40" r="28" strokeOpacity="0.45" />
            <path d="M40 12v56M12 40h56" strokeOpacity="0.35" />
            <circle cx="40" cy="40" r="6" fill={RED} stroke="none" />
            <path d="m52 28 8-8M28 52l-8 8" stroke={RED} />
          </>
        ) : null}
        {id === 'visual' ? (
          <>
            <rect x="18" y="22" width="44" height="36" rx="4" strokeOpacity="0.55" />
            <circle cx="40" cy="38" r="10" stroke={RED} />
            <path d="M22 54l12-10 10 8 16-20" stroke={RED} strokeOpacity="0.85" />
          </>
        ) : null}
        {id === 'voice' ? (
          <>
            <path d="M28 32c0-8 24-8 24 0v12c0 8-24 8-24 0V32z" stroke={RED} />
            <path d="M40 44v10M34 54h12" strokeOpacity="0.55" />
            <path d="M22 26c-4 8-4 20 0 28M58 26c4 8 4 20 0 28" strokeOpacity="0.4" />
          </>
        ) : null}
        {id === 'values' ? (
          <>
            <path d="M40 14 54 28 40 42 26 28z" fill={RED} fillOpacity="0.2" stroke={RED} />
            <path d="M40 42v26M28 54h24" strokeOpacity="0.55" />
            <circle cx="40" cy="28" r="3" fill={RED} stroke="none" />
          </>
        ) : null}
        {id === 'experience' ? (
          <>
            <path d="M16 56V28l24-12 24 12v28" strokeOpacity="0.55" />
            <path d="M40 16v40M16 28l24 12 24-12" strokeOpacity="0.45" />
            <rect x="30" y="44" width="20" height="12" rx="2" fill={RED} fillOpacity="0.35" stroke={RED} />
          </>
        ) : null}
      </g>
    </svg>
  );
}
