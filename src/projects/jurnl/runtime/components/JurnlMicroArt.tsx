/**
 * JurnlMicroArt (P0.JURNL.GLOBAL-OVERLAYS.CANONICAL-MICRO-ASSETS-AND-UTILITY-BUTTONS.CLEAN-MOUNT-CONVERGENCE.OPUS5).
 *
 * One GROK2 overlay micro-asset (`global/overlayArt/registry.ts`) in place of a line glyph. The image is decorative
 * (alt="", aria-hidden, never a target); the control that holds it keeps its name, focus, keyboard and state. Each slot
 * wears exactly one asset (`data-micro-slot` names it for the evidence). Sizes come from the host's existing glyph box, so
 * the art never adds a container, border, circle or shadow.
 */
import type { CSSProperties } from 'react';
import { OVERLAY_ART, type OverlayArtStem } from '../global/overlayArt/registry';
import './jurnl-micro-art.css';

export function JurnlMicroArt({ stem, slot, className = '', style, ink }: { stem: OverlayArtStem; slot: string; className?: string; style?: CSSProperties; /** the ink of the cut (dark / light), for a host that must show it on the other ground */ ink?: 'dark' | 'light' }) {
  const a = OVERLAY_ART[stem];
  return <img className={`jma ${className}`.trim()} src={a.src} width={a.width} height={a.height} alt="" aria-hidden="true" draggable={false} decoding="async" data-asset-id={a.id} data-micro-slot={slot} data-ink={ink} style={style} />;
}

/**
 * The consent switch on its own hardware: the olive track (ON) or the charcoal track (OFF) and the separate cream thumb,
 * right when ON, left when OFF. React owns the value (`checked`); nothing is baked into an image. Same contract as
 * JurnlToggle: role="switch", aria-checked, aria-label, the trigger id, a 44 px touch target.
 */
export function JurnlArtToggle({ checked, onChange, label, trigger, slot }: { checked: boolean; onChange: (v: boolean) => void; label: string; trigger?: string; slot: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="jma-switch" data-on={checked ? 'true' : 'false'} onClick={() => onChange(!checked)} data-jrn-trigger={trigger}>
      <JurnlMicroArt stem={checked ? 'B01-TOGGLE-TRACK-OLIVE' : 'B01-TOGGLE-TRACK-CHARCOAL'} slot={`${slot}-track`} className="jma-switch__track" />
      <JurnlMicroArt stem="B01-TOGGLE-THUMB" slot={`${slot}-thumb`} className="jma-switch__thumb" />
    </button>
  );
}
