/**
 * Digital Foundation icon registry.
 * Visual authority: founder icon sheet (16 families). Legacy names remain as aliases.
 * The approved hamburger PNG in the header is not this component.
 */
import type { SVGProps } from 'react';
import { DF_ICON_CATALOG, DF_ICON_LEGACY_EXTRAS, type DfIconTone } from './icons/meta';
import { DF_ICON_GLYPHS } from './icons/glyphs';

/** Asset-sheet monoline. 24×24 grid. Do not drop this back to the 0.15 hairline. */
export const DF_ICON_STROKE = 0.6;

const TONE_COLOR: Record<DfIconTone, string | undefined> = {
  default: undefined,
  muted: '#8A8A8A',
  danger: '#E50107',
  success: '#1B7F4E',
  warning: '#E08A1E',
};

const ALIAS_TO_ID: Record<string, string> = {};
for (const item of [...DF_ICON_CATALOG, ...DF_ICON_LEGACY_EXTRAS]) {
  ALIAS_TO_ID[item.id] = item.id;
  for (const alias of item.aliases ?? []) ALIAS_TO_ID[alias] = item.id;
}

const TONE_BY_ID: Record<string, DfIconTone | undefined> = {};
for (const item of DF_ICON_CATALOG) {
  if (item.tone) TONE_BY_ID[item.id] = item.tone;
}

export type DfIconName = keyof typeof ALIAS_TO_ID;

const STEP_DEFAULT: Record<string, string> = {
  stepCurrent: '1',
  stepUpcoming: '2',
  stepFuture: '3',
};

export function resolveDfIconId(name: string): string {
  return ALIAS_TO_ID[name] ?? name;
}

export function DfIcon({
  name,
  step,
  progress,
  tone,
  title,
  ...rest
}: {
  name: DfIconName;
  /** Dynamic step index for stepCurrent / stepUpcoming / stepFuture. */
  step?: number;
  /** 0–100 fill for the progress glyph. */
  progress?: number;
  tone?: DfIconTone;
  /** When set, the icon is exposed to assistive tech instead of aria-hidden. */
  title?: string;
} & SVGProps<SVGSVGElement>) {
  const id = resolveDfIconId(name);
  const raw = DF_ICON_GLYPHS[id];
  if (!raw) return null;
  const stepText = String(step ?? STEP_DEFAULT[id] ?? '');
  const width = Math.max(0, Math.min(16, ((progress ?? 55) / 100) * 16));
  const markup = raw.split('{{step}}').join(stepText).split('{{progress}}').join(width.toFixed(2));
  const toneColor = tone ? TONE_COLOR[tone] : TONE_COLOR[TONE_BY_ID[id] ?? 'default'];
  const labeled = Boolean(title);
  const { style, ...svgRest } = rest;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={DF_ICON_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={labeled ? undefined : true}
      role={labeled ? 'img' : undefined}
      aria-label={labeled ? title : undefined}
      focusable="false"
      {...svgRest}
      style={toneColor ? { ...style, color: toneColor } : style}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}

export { DF_ICON_CATALOG, DF_ICON_FAMILIES, DF_ICON_LEGACY_EXTRAS } from './icons/meta';
