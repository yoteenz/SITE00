/**
 * Segmented viewport control — MOBILE / TABLET / DESKTOP.
 */

type Viewport = 'MOBILE' | 'TABLET' | 'DESKTOP';

type Props = {
  value: Viewport;
  onChange: (v: Viewport) => void;
  compact?: boolean;
};

export function SkinViewportControl({ value, onChange, compact = false }: Props) {
  const options: Viewport[] = ['MOBILE', 'TABLET', 'DESKTOP'];
  return (
    <div
      className={`site00-dw-skins-vp${compact ? ' site00-dw-skins-vp--compact' : ''}`}
      role="group"
      aria-label="Authority viewport"
    >
      {options.map((v) => (
        <button
          key={v}
          type="button"
          className={value === v ? 'is-active' : ''}
          aria-pressed={value === v}
          onClick={() => onChange(v)}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
