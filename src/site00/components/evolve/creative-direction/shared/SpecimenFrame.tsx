import type { ReactNode } from 'react';

export type SpecimenVisualOptions = {
  grayscale?: boolean;
  hideLabels?: boolean;
};

export function paletteFromGrayscale(on: boolean | undefined, colors: { primary: string; secondary: string; accent: string }) {
  if (!on) return colors;
  return { primary: '#1a1a1a', secondary: '#f0f0f0', accent: '#666666' };
}

export function SpecimenFrame({
  title,
  status,
  hideLabels,
  layout = 'default',
  children,
}: {
  title: string;
  status: string;
  hideLabels?: boolean;
  layout?: 'default' | 'wide' | 'tall' | 'full';
  children: ReactNode;
}) {
  const layoutClass =
    layout === 'wide'
      ? 'site00-cd-specimen--wide'
      : layout === 'tall'
        ? 'site00-cd-specimen--tall'
        : layout === 'full'
          ? 'site00-cd-specimen--full'
          : '';
  return (
    <figure className={`site00-cd-specimen ${layoutClass}`.trim()}>
      {children}
      {hideLabels ? null : (
        <figcaption>
          {title} · {status}
        </figcaption>
      )}
    </figure>
  );
}
