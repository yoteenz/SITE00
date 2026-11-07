/**
 * JurnlUtilityArtButton (P0.JURNL.F05-MONEY.CANONICAL-UTILITY-ICON-FAMILY-INTEGRATION.OPUS1).
 *
 * One live button wearing one of the four founder-supplied utility artworks (CLOSE, MENU, SEARCH, ADD) from
 * `global/utilityArt/registry.ts`. The artwork is the whole visual: no CSS circle, border, background or second shadow is
 * drawn behind it. The image is decorative (alt="", aria-hidden, no pointer events); the enclosing <button> keeps the
 * accessible name, focus, keyboard and touch activation, disabled state and every handler. The button box itself stays a
 * square-rounded hit area (no circular tappable control); the disc size is `--uab-disc`, set by each host.
 */
import { useSyncExternalStore, type ButtonHTMLAttributes, type CSSProperties } from 'react';
import { UTILITY_ART, type UtilityArtKind } from '../global/utilityArt/registry';
import './jurnl-utility-art.css';

export type JurnlUtilityArtButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type' | 'aria-label'> & {
  kind: UtilityArtKind;
  /** the accessible name (CLOSE, OPEN MENU, SEARCH …) */
  label: string;
  /** data-jrn-trigger (kept from the control it replaces) */
  trigger?: string;
  style?: CSSProperties;
};

export function JurnlUtilityArtButton({ kind, label, trigger, className = '', ...rest }: JurnlUtilityArtButtonProps) {
  const art = UTILITY_ART[kind];
  return (
    <button type="button" {...rest} className={`jrn-uab ${className}`.trim()} data-utility-art={kind} data-jrn-trigger={trigger} aria-label={label}>
      <img className="jrn-uab__art" src={art.src} width={art.px} height={art.px} alt="" aria-hidden="true" draggable={false} data-asset-id={art.id} decoding="async" />
    </button>
  );
}

/*
 * The global hamburger (JurnlCornerChrome) is shared by every hub. Only a screen whose authority uses the illustrated family
 * (the MONEY parent) asks for the MENU artwork while it is mounted; everywhere else the existing control is unchanged.
 * One control is rendered either way (never the line glyph and the artwork together).
 */
let menuArtClaims = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
/** A screen claims the MENU artwork for the corner hamburger while mounted; returns the release. */
export function claimMenuArt(): () => void {
  menuArtClaims += 1;
  emit();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    menuArtClaims = Math.max(0, menuArtClaims - 1);
    emit();
  };
}
/** Whether any mounted screen currently claims the MENU artwork. */
export function isMenuArtClaimed(): boolean {
  return menuArtClaims > 0;
}
export function useMenuArt(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => void listeners.delete(l);
    },
    isMenuArtClaimed,
    () => false,
  );
}
